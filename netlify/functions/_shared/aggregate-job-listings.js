const { SEO_THRESHOLDS } = require("./seo-thresholds")
const { bump, buildRows, createCrossTabs, topCounts } = require("./cross-tabs")
const { isUsableMapLocation, resolveCoordinates } = require("./location-coordinates")

const ENTITY_LIMITS = {
  company: 50,
  role: 50,
  location: 50,
  industry: 50,
}

const TREND_MONTH_LABELS = 6

const FIELD_GLOSSARY = {
  company_name: "Employer label from JobDataPool listings CSV; rolled up by slugified company_name.",
  job_title: "Posting title; rolled up by slugified job_title.",
  job_location: "Location string; rolled up by slugified job_location.",
  job_industries: "Industry tags (comma-separated in source rows); each tag gets its own industry bucket.",
  industries: "Fallback industry column when job_industries is empty.",
  ingestion_date: "First-ingest UTC date (YYYY-MM-DD); used for 7d/30d windows and monthly trends.",
  job_posted_date: "Fallback date when ingestion_date is missing.",
  listing_closed: "When true/1/yes, row is excluded from active_jobs.",
  job_base_pay_range: "Parsed for median salary and salary_coverage.",
  job_location_remote: "Derived: remote/hybrid detected in job_title or job_location text.",
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const ROLE_TITLE_TERMS =
  /\b(associate|representative|engineer|manager|technician|driver|consultant|banker|therapist|psychologist|nurse|rn|assistant|operator|specialist|coordinator|director|clerk|analyst|developer|supervisor|cashier|server|member|crew|sales|service|delivery|maintenance|leasing|financial|licensed|account|customer|mechanic|attorney|teacher|aide|intern|lead|architect|administrator|designer|planner|writer|counselor)\b/i

function isUsableCompanyName(name) {
  const normalized = String(name || "").trim().toLowerCase()
  return Boolean(normalized && !["unknown", "unknown-company", "n/a", "na", "null"].includes(normalized))
}

function isUsableRoleTitle(name) {
  const normalized = String(name || "").trim().toLowerCase()
  if (!normalized || ["unknown-role", "403 forbidden", "sign in", "just a moment", "workday"].includes(normalized)) {
    return false
  }

  if (
    /\b(forbidden|captcha|access denied|cloudflare|sign in|login|just a moment|inactive career page|job listings|job search)\b/i.test(
      name
    ) ||
    /[<>?*]/.test(name)
  ) {
    return false
  }

  return ROLE_TITLE_TERMS.test(name)
}

function parseIsoDate(raw) {
  const text = String(raw || "").trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null
  const ts = Date.parse(`${text}T00:00:00Z`)
  return Number.isFinite(ts) ? { text, ts } : null
}

function rowDate(row) {
  return parseIsoDate(row.ingestion_date) || parseIsoDate(row.job_posted_date) || parseIsoDate(row.validated_on)
}

function isClosed(row) {
  const value = String(row.listing_closed || "").trim().toLowerCase()
  return value === "true" || value === "1" || value === "yes"
}

function isRemote(row) {
  const haystack = `${row.job_title || ""} ${row.job_location || ""}`.toLowerCase()
  return haystack.includes("remote") || haystack.includes("hybrid")
}

function parseSalaryMidpoint(row) {
  const text = String(row.job_base_pay_range || "").trim()
  if (!text) return null
  const matches = text.match(/\d[\d,]*/g)
  if (!matches || !matches.length) return null
  const values = matches
    .map((part) => Number(part.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!values.length) return null
  if (values.length === 1) return values[0]
  return Math.round((values[0] + values[values.length - 1]) / 2)
}

function rowSearchText(row) {
  return [
    row.job_title,
    row.company_name,
    row.job_location,
    row.job_industries,
    row.industries,
    row.country_code,
  ]
    .map((value) => String(value || ""))
    .join(" ")
}

function isGovernmentContext(row) {
  return /\b(government|federal|public sector|municipal|department of|dept of|county|state of|city of|defense|dod|army|navy|air force|marine corps|veterans|homeland security|tsa|irs|usajobs|police|sheriff|firefighter|public health)\b/i.test(
    rowSearchText(row)
  )
}

function isInternshipContext(row) {
  return /\b(intern|internship|co-op|co op|student trainee|apprentice|early career)\b/i.test(rowSearchText(row))
}

function isHealthcareContext(row) {
  return /\b(health|healthcare|hospital|medical|clinic|nurse|rn|physician|pharmacy|therapist|patient|behavioral|dental|caregiver)\b/i.test(
    rowSearchText(row)
  )
}

function isTechnologyContext(row) {
  return /\b(software|developer|engineer|data|cloud|cyber|security|ai|machine learning|ml engineer|platform|devops|sre|product manager|systems analyst|technical)\b/i.test(
    rowSearchText(row)
  )
}

function isHighSalaryContext(row) {
  const midpoint = parseSalaryMidpoint(row)
  return midpoint != null && midpoint >= 120000
}

const METRICS_CONTEXT_DEFINITIONS = [
  {
    slug: "default",
    label: "Default",
    eyebrow: "All tracked listings",
    summary: "Full JobDataPool hiring surface",
    description: "Every active listing in the latest JobDataPool metrics snapshot.",
    annotation: "Baseline view across the complete normalized listings feed.",
    match: () => true,
  },
  {
    slug: "remote-jobs",
    label: "Remote jobs",
    eyebrow: "Remote and hybrid",
    summary: "Distributed work demand",
    description: "Listings where title or location language indicates remote or hybrid work.",
    annotation: "Remote context is derived from title and location text, so it favors explicit remote or hybrid postings.",
    match: isRemote,
  },
  {
    slug: "government-jobs",
    label: "Government jobs",
    eyebrow: "Public sector",
    summary: "Government and public contractor hiring",
    description: "Listings with public-sector, defense, agency, municipal, veteran, or government terms.",
    annotation: "Government context blends direct public-sector roles with adjacent contractor and agency language.",
    match: isGovernmentContext,
  },
  {
    slug: "internships",
    label: "Internships",
    eyebrow: "Early career",
    summary: "Internship and trainee market",
    description: "Intern, apprenticeship, co-op, student trainee, and early-career postings.",
    annotation: "Internship context is title-driven and is best read as directional early-career demand.",
    match: isInternshipContext,
  },
  {
    slug: "healthcare",
    label: "Healthcare",
    eyebrow: "Care delivery",
    summary: "Clinical and healthcare hiring",
    description: "Health, hospital, clinic, nursing, physician, pharmacy, therapy, and patient-care postings.",
    annotation: "Healthcare context captures both clinical roles and care-adjacent operational jobs.",
    match: isHealthcareContext,
  },
  {
    slug: "technology",
    label: "Technology",
    eyebrow: "Software and data",
    summary: "Technology labor demand",
    description: "Software, data, cloud, security, AI, platform, DevOps, and technical roles.",
    annotation: "Technology context is role-keyword based and includes technical jobs at non-tech employers.",
    match: isTechnologyContext,
  },
  {
    slug: "high-salary",
    label: "High salary",
    eyebrow: "Pay signal",
    summary: "Listings with salary midpoint at or above $120,000",
    description: "Listings with parseable salary ranges whose midpoint is at least $120,000.",
    annotation: "High-salary context only includes rows with parseable salary ranges, so coverage matters.",
    match: isHighSalaryContext,
  },
]

function splitIndustries(row) {
  const raw = String(row.job_industries || row.industries || "").trim()
  if (!raw) return ["uncategorized"]
  return raw
    .split(/[;,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function monthKeyFromDate(dateText) {
  return dateText ? dateText.slice(0, 7) : "unknown"
}

function createBucket(name) {
  return {
    name,
    totalRows: 0,
    activeRows: 0,
    closedRows: 0,
    remoteRows: 0,
    activeRemoteRows: 0,
    salaryValues: [],
    activeSalaryValues: [],
    ingestedLast7d: 0,
    ingestedPrev7d: 0,
    ingestedLast30d: 0,
    ingestedPrev30d: 0,
    trendByMonth: new Map(),
  }
}

function touchBucket(bucket, row, { nowTs, weekMs, monthMs }) {
  bucket.totalRows += 1
  const closed = isClosed(row)
  if (closed) {
    bucket.closedRows += 1
  } else {
    bucket.activeRows += 1
  }

  const remote = isRemote(row)
  if (remote) bucket.remoteRows += 1
  if (!closed && remote) bucket.activeRemoteRows += 1

  const salary = parseSalaryMidpoint(row)
  if (salary != null) bucket.salaryValues.push(salary)
  if (!closed && salary != null) bucket.activeSalaryValues.push(salary)

  const date = rowDate(row)
  if (date) {
    const ageMs = nowTs - date.ts
    if (ageMs >= 0 && ageMs <= weekMs) bucket.ingestedLast7d += 1
    else if (ageMs > weekMs && ageMs <= weekMs * 2) bucket.ingestedPrev7d += 1
    if (ageMs >= 0 && ageMs <= monthMs) bucket.ingestedLast30d += 1
    else if (ageMs > monthMs && ageMs <= monthMs * 2) bucket.ingestedPrev30d += 1

    const monthKey = monthKeyFromDate(date.text)
    bucket.trendByMonth.set(monthKey, (bucket.trendByMonth.get(monthKey) || 0) + 1)
  }
}

function growthPercent(current, previous) {
  const base = Math.max(previous, 1)
  return Number((((current - previous) / base) * 100).toFixed(1))
}

function median(values) {
  if (!values.length) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

function bucketToMetrics(entityType, entityId, bucket, snapshotDate) {
  const activeJobs = bucket.activeRows
  const remoteShare = activeJobs
    ? Number(((bucket.activeRemoteRows / Math.max(bucket.activeRows, 1)) * 100).toFixed(1))
    : 0
  const salaryCoverage = activeJobs
    ? Number(((bucket.activeSalaryValues.length / Math.max(bucket.activeRows, 1)) * 100).toFixed(1))
    : 0

  return {
    id: `${entityType}-${entityId}-${snapshotDate}`,
    entityType,
    entityId,
    date: snapshotDate,
    activeJobs,
    newJobs7d: bucket.ingestedLast7d,
    closedJobs7d: Math.max(0, bucket.closedRows),
    growthWoW: growthPercent(bucket.ingestedLast7d, bucket.ingestedPrev7d),
    growthMoM: growthPercent(bucket.ingestedLast30d, bucket.ingestedPrev30d),
    remoteShare,
    medianSalary: median(bucket.activeSalaryValues),
    salaryCoverage,
  }
}

function bucketToTrend(bucket) {
  const sortedMonths = [...bucket.trendByMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const recent = sortedMonths.slice(-TREND_MONTH_LABELS)
  return recent.map(([monthKey, value]) => ({
    label: monthKey,
    value,
  }))
}

function shouldIndex(entityType, metrics) {
  switch (entityType) {
    case "company":
      return metrics.activeJobs >= SEO_THRESHOLDS.companyMinActiveJobs
    case "role":
      return metrics.activeJobs >= SEO_THRESHOLDS.roleMinActiveJobs
    case "location":
      return metrics.activeJobs >= SEO_THRESHOLDS.locationMinActiveJobs
    case "industry":
      return metrics.activeJobs >= SEO_THRESHOLDS.industryMinActiveJobs
    default:
      return true
  }
}

function rollupTable(buckets, limit = 25) {
  return [...buckets.values()]
    .sort((a, b) => b.activeRows - a.activeRows)
    .slice(0, limit)
    .map((bucket, index) => ({
      rank: index + 1,
      slug: bucket.slug,
      name: bucket.name,
      active_jobs: bucket.activeRows,
      new_jobs_7d: bucket.ingestedLast7d,
      remote_share_pct: bucket.activeRows
        ? Number(((bucket.activeRemoteRows / Math.max(bucket.activeRows, 1)) * 100).toFixed(1))
        : 0,
      median_salary: median(bucket.activeSalaryValues),
      wow_growth_pct: growthPercent(bucket.ingestedLast7d, bucket.ingestedPrev7d),
    }))
}

function formatMoney(value) {
  return value ? `$${value.toLocaleString()}` : "n/a"
}

function topCompanyRows(maps, limit = 10) {
  return rollupTable(maps.company, 50)
    .filter((row) => isUsableCompanyName(row.name))
    .slice(0, limit)
    .map((row) => ({
      company: row.name,
      "active jobs": row.active_jobs,
      "new 7d": row.new_jobs_7d,
      "remote share": `${row.remote_share_pct}%`,
    }))
}

function fastGrowingRoleRows(maps, limit = 10) {
  return rollupTable(maps.role, 50)
    .filter((row) => isUsableRoleTitle(row.name))
    .sort((a, b) => b.wow_growth_pct - a.wow_growth_pct || b.active_jobs - a.active_jobs)
    .slice(0, limit)
    .map((row) => ({
      role: row.name,
      "active jobs": row.active_jobs,
      "WoW growth": `${row.wow_growth_pct}%`,
      "median salary": formatMoney(row.median_salary),
    }))
}

function topLocationRows(maps, limit = 10) {
  return rollupTable(maps.location, 50)
    .slice(0, limit)
    .map((row) => ({
      location: row.name,
      "active jobs": row.active_jobs,
      "new 7d": row.new_jobs_7d,
      "remote share": `${row.remote_share_pct}%`,
    }))
}

function topIndustryRows(maps, limit = 10) {
  return rollupTable(maps.industry, 50)
    .slice(0, limit)
    .map((row) => ({
      industry: row.name,
      "active jobs": row.active_jobs,
      "new 7d": row.new_jobs_7d,
      "WoW growth": `${row.wow_growth_pct}%`,
    }))
}

function nameLookupFromMaps(maps, entityType) {
  const lookup = new Map()
  for (const bucket of maps[entityType].values()) {
    lookup.set(bucket.slug, bucket.name)
  }
  return lookup
}

function buildRelatedLinks(entityType, slug, tab, nameLookups) {
  const links = []

  const topRole = topCounts(tab.roles, 1)[0]
  if (topRole) {
    links.push({
      label: `${nameLookups.role.get(topRole[0]) || topRole[0]} jobs`,
      href: `/jobs/${topRole[0]}`,
    })
  }

  const topLocation = topCounts(tab.locations, 1)[0]
  if (topLocation) {
    links.push({
      label: `${nameLookups.location.get(topLocation[0]) || topLocation[0]} hiring`,
      href: `/locations/${topLocation[0]}`,
    })
  }

  const topCompany = topCounts(tab.companies, 1)[0]
  if (topCompany) {
    links.push({
      label: `${nameLookups.company.get(topCompany[0]) || topCompany[0]} hiring`,
      href: `/companies/${topCompany[0]}`,
    })
  }

  const topIndustry = topCounts(tab.industries, 1)[0]
  if (topIndustry) {
    links.push({
      label: `${nameLookups.industry.get(topIndustry[0]) || topIndustry[0]} industry`,
      href: `/industries/${topIndustry[0]}`,
    })
  }

  links.push({ label: "JobDataPool API", href: "https://jobdatapool.com/#api" })
  return links.slice(0, 5)
}

function buildEntityBreakdowns(crossTabs, nameLookups, entities) {
  const breakdowns = {}

  for (const record of entities.company.records) {
    const tab = crossTabs.company.get(record.slug)
    if (!tab) continue
    breakdowns[`company:${record.slug}`] = {
      primaryRows: buildRows(topCounts(tab.roles), nameLookups.role, "role"),
      secondaryRows: buildRows(topCounts(tab.locations), nameLookups.location, "location", () => ({
        "remote share": `${record.metrics.remoteShare}%`,
      })),
      relatedLinks: buildRelatedLinks("company", record.slug, tab, nameLookups),
    }
  }

  for (const record of entities.role.records) {
    const tab = crossTabs.role.get(record.slug)
    if (!tab) continue
    breakdowns[`role:${record.slug}`] = {
      primaryRows: buildRows(topCounts(tab.companies), nameLookups.company, "company"),
      secondaryRows: buildRows(topCounts(tab.locations), nameLookups.location, "location", () => ({
        "median salary": record.metrics.medianSalary
          ? `$${record.metrics.medianSalary.toLocaleString()}`
          : "n/a",
      })),
      relatedLinks: buildRelatedLinks("role", record.slug, tab, nameLookups),
    }
  }

  for (const record of entities.location.records) {
    const tab = crossTabs.location.get(record.slug)
    if (!tab) continue
    breakdowns[`location:${record.slug}`] = {
      primaryRows: buildRows(topCounts(tab.roles), nameLookups.role, "role"),
      secondaryRows: buildRows(topCounts(tab.companies), nameLookups.company, "company"),
      relatedLinks: buildRelatedLinks("location", record.slug, tab, nameLookups),
    }
  }

  for (const record of entities.industry.records) {
    const tab = crossTabs.industry.get(record.slug)
    if (!tab) continue
    breakdowns[`industry:${record.slug}`] = {
      primaryRows: buildRows(topCounts(tab.companies), nameLookups.company, "company"),
      secondaryRows: buildRows(topCounts(tab.roles), nameLookups.role, "role"),
      relatedLinks: buildRelatedLinks("industry", record.slug, tab, nameLookups),
    }
  }

  return breakdowns
}

function dominantRoleLabel(tab, nameLookups) {
  if (!tab) return "Mixed roles"

  for (const [roleSlug] of topCounts(tab.roles, 6)) {
    const label = nameLookups.role.get(roleSlug) || roleSlug
    if (isUsableRoleTitle(label)) {
      return label
    }
  }

  return "Mixed roles"
}

function buildCommunityLayer(entities, crossTabs, nameLookups, snapshotDate) {
  const mapRecords = entities.location.records
    .filter((record) => isUsableMapLocation(record.slug, record.name))
    .map((record) => {
      const coordinates = resolveCoordinates(record.slug, record.name)
      if (!coordinates) return null
      return { record, coordinates }
    })
    .filter(Boolean)
    .sort((a, b) => b.record.metrics.activeJobs - a.record.metrics.activeJobs)
    .slice(0, ENTITY_LIMITS.location)

  const locationSignals = mapRecords.map(({ record, coordinates }) => {
    const tab = crossTabs.location.get(record.slug)
    return {
      id: record.slug,
      name: record.name,
      coordinates,
      activeJobs: record.metrics.activeJobs,
      newJobs7d: record.metrics.newJobs7d,
      remoteShare: record.metrics.remoteShare,
      signalScore: Math.min(99, Math.round(record.metrics.growthWoW + record.metrics.remoteShare / 2)),
      dominantRole: dominantRoleLabel(tab, nameLookups),
      industry: topCounts(tab?.industries || new Map(), 1)[0]
        ? nameLookups.industry.get(topCounts(tab.industries, 1)[0][0]) || "General"
        : "General",
    }
  })

  const articles = mapRecords.slice(0, 6).map(({ record, coordinates }, index) => {
    const tab = crossTabs.location.get(record.slug)
    const roleName = dominantRoleLabel(tab, nameLookups)

    return {
      id: `briefing-${record.slug}`,
      title: `${record.name}: ${record.metrics.newJobs7d} new jobs (7d) led by ${roleName}`,
      summary: `FreeJobData counted ${record.metrics.activeJobs.toLocaleString()} active listings in ${record.name} with ${record.metrics.remoteShare}% remote share.`,
      author: index % 2 === 0 ? "FreeJobData Team" : "Community Intel",
      type: index % 2 === 0 ? "team" : "community",
      publishedAt: snapshotDate,
      location: record.name,
      role: roleName,
      industry: "Labor market",
      factuality: record.metrics.newJobs7d >= 50 ? "High Signal" : "Developing",
      confidence: Math.max(45, Math.min(95, 55 + Math.round(record.metrics.growthWoW))),
      sourceCount: Math.max(8, Math.round(record.metrics.activeJobs / 40)),
      coordinates,
      tags: [record.name, roleName].filter(Boolean),
    }
  })

  return { location_signals: locationSignals, articles }
}

function buildListingPreviews(items) {
  const active = items.filter((row) => !isClosed(row))

  function previewRow(row) {
    return {
      company: String(row.company_name || "").trim() || "Unknown",
      role: String(row.job_title || "").trim() || "Unknown",
      location: String(row.job_location || "").trim() || "Unknown",
      remote_status: isRemote(row) ? (String(row.job_location || "").toLowerCase().includes("hybrid") ? "hybrid" : "remote") : "onsite",
      active_jobs: 1,
    }
  }

  const general = active.slice(0, 8).map(previewRow)
  const remote = active.filter(isRemote).slice(0, 8).map(previewRow)
  const software = active
    .filter((row) => /software|engineer|developer/i.test(`${row.job_title} ${row.job_summary || ""}`))
    .slice(0, 8)
    .map(previewRow)
  const ai = active
    .filter((row) => /\bai\b|machine learning|ml engineer|data scientist/i.test(`${row.job_title} ${row.job_summary || ""}`))
    .slice(0, 8)
    .map(previewRow)

  return {
    default: general,
    "free-job-postings-sample": general,
    "weekly-hiring-trends": general,
    "top-hiring-companies": general,
    "remote-jobs": remote.length ? remote : general,
    "software-engineering-jobs": software.length ? software : general,
    "ai-jobs": ai.length ? ai : general,
    "location-demand": general,
  }
}

function buildEntityMaps(items, snapshotDate) {
  const maps = {
    company: new Map(),
    role: new Map(),
    location: new Map(),
    industry: new Map(),
  }
  const crossTabs = createCrossTabs()

  const nowTs = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const monthMs = 30 * 24 * 60 * 60 * 1000
  const quality = {
    rows_missing_company: 0,
    rows_missing_title: 0,
    rows_missing_location: 0,
    rows_missing_date: 0,
    rows_closed: 0,
    rows_active: 0,
  }

  for (const row of items) {
    const companyName = String(row.company_name || "").trim()
    const jobTitle = String(row.job_title || "").trim()
    const jobLocation = String(row.job_location || "").trim()

    if (!companyName) quality.rows_missing_company += 1
    if (!jobTitle) quality.rows_missing_title += 1
    if (!jobLocation) quality.rows_missing_location += 1
    if (!rowDate(row)) quality.rows_missing_date += 1
    if (isClosed(row)) quality.rows_closed += 1
    else quality.rows_active += 1

    const companySlug = slugify(companyName || "unknown-company")
    const roleSlug = slugify(jobTitle || "unknown-role")
    const locationSlug = slugify(jobLocation || "unknown-location")

    if (!isClosed(row)) {
      bump(crossTabs, "company", companySlug, "roles", roleSlug)
      bump(crossTabs, "company", companySlug, "locations", locationSlug)
      bump(crossTabs, "role", roleSlug, "companies", companySlug)
      bump(crossTabs, "role", roleSlug, "locations", locationSlug)
      bump(crossTabs, "location", locationSlug, "roles", roleSlug)
      bump(crossTabs, "location", locationSlug, "companies", companySlug)

      for (const industryName of splitIndustries(row)) {
        const industrySlug = slugify(industryName) || "uncategorized"
        bump(crossTabs, "industry", industrySlug, "companies", companySlug)
        bump(crossTabs, "industry", industrySlug, "roles", roleSlug)
        bump(crossTabs, "company", companySlug, "industries", industrySlug)
        bump(crossTabs, "location", locationSlug, "industries", industrySlug)
      }
    }

    const dimensions = [
      ["company", companyName, companyName || "unknown-company"],
      ["role", jobTitle, jobTitle || "unknown-role"],
      ["location", jobLocation, jobLocation || "unknown-location"],
    ]

    for (const [entityType, label, fallbackName] of dimensions) {
      const slug = slugify(label || fallbackName)
      if (!slug) continue
      const map = maps[entityType]
      if (!map.has(slug)) {
        map.set(slug, { slug, name: label || fallbackName, ...createBucket(label || fallbackName) })
      }
      const bucket = map.get(slug)
      touchBucket(bucket, row, { nowTs, weekMs, monthMs })
    }

    for (const industryName of splitIndustries(row)) {
      const slug = slugify(industryName) || "uncategorized"
      const map = maps.industry
      if (!map.has(slug)) {
        map.set(slug, { slug, name: industryName, ...createBucket(industryName) })
      }
      touchBucket(map.get(slug), row, { nowTs, weekMs, monthMs })
    }
  }

  function toCatalogAndRecords(entityType, limit) {
    const entries = [...maps[entityType].values()].sort((a, b) => b.activeRows - a.activeRows).slice(0, limit)
    const catalog = []
    const records = []

    entries.forEach((entry, index) => {
      const id = `${entityType}-${index + 1}`
      catalog.push({
        id,
        slug: entry.slug,
        name: entry.name,
        ...(entityType === "company"
          ? {
              domain: `${entry.slug}.com`,
              description: `${entry.name} hiring activity, role demand, remote share, and location concentration.`,
            }
          : {}),
        ...(entityType === "role"
          ? {
              title: entry.name,
              normalizedTitle: entry.name,
              category: "General",
            }
          : {}),
        ...(entityType === "location"
          ? {
              type: "city",
              country: String(rowCountryHint(entry.name)),
            }
          : {}),
      })

      const metrics = bucketToMetrics(entityType, id, entry, snapshotDate)
      records.push({
        slug: entry.slug,
        name: entry.name,
        description:
          entityType === "company"
            ? `${entry.name} hiring activity from JobDataPool extended listings.`
            : entityType === "role"
              ? `${entry.name} demand by company, location, remote share, and salary coverage.`
              : entityType === "location"
                ? `${entry.name} hiring trends by role, company, industry, and remote/on-site mix.`
                : `${entry.name} labor market demand across roles, companies, and locations.`,
        metrics,
        trend: bucketToTrend(entry),
        indexable: shouldIndex(entityType, metrics),
      })
    })

    return { catalog, records }
  }

  const entities = {
    company: toCatalogAndRecords("company", ENTITY_LIMITS.company),
    role: toCatalogAndRecords("role", ENTITY_LIMITS.role),
    location: toCatalogAndRecords("location", ENTITY_LIMITS.location),
    industry: toCatalogAndRecords("industry", ENTITY_LIMITS.industry),
  }

  const nameLookups = {
    company: nameLookupFromMaps(maps, "company"),
    role: nameLookupFromMaps(maps, "role"),
    location: nameLookupFromMaps(maps, "location"),
    industry: nameLookupFromMaps(maps, "industry"),
  }

  return {
    maps,
    quality,
    entities,
    crossTabs,
    nameLookups,
  }
}

function rowCountryHint(locationName) {
  if (/united states|usa|\bus\b/i.test(locationName)) return "United States"
  if (/canada/i.test(locationName)) return "Canada"
  return "United States"
}

function buildGlobalMetrics(items, maps, quality, entities) {
  const activeRows = items.filter((row) => !isClosed(row))
  const activeJobs = quality.rows_active
  const salaryRows = activeRows
    .map(parseSalaryMidpoint)
    .filter((value) => typeof value === "number")

  return {
    active_jobs: activeJobs,
    new_jobs_7d: [...maps.company.values()].reduce((sum, bucket) => sum + bucket.ingestedLast7d, 0),
    closed_jobs_7d: quality.rows_closed,
    remote_share: activeJobs
      ? Number(((activeRows.filter(isRemote).length / Math.max(activeJobs, 1)) * 100).toFixed(1))
      : 0,
    median_salary: median(salaryRows),
    salary_coverage: activeJobs
      ? Number(((salaryRows.length / Math.max(activeJobs, 1)) * 100).toFixed(1))
      : 0,
    indexed_pages: {
      company: entities.company.records.filter((record) => record.indexable).length,
      role: entities.role.records.filter((record) => record.indexable).length,
      location: entities.location.records.filter((record) => record.indexable).length,
      industry: entities.industry.records.filter((record) => record.indexable).length,
    },
  }
}

function totalIndexedPages(metrics) {
  return Object.values(metrics.indexed_pages || {}).reduce((sum, value) => sum + Number(value || 0), 0)
}

function buildDashboardContext(definition, rows, maps, entities, metrics, snapshotDate) {
  const salaryCoverage = metrics.salary_coverage || 0
  const activeJobs = metrics.active_jobs || 0

  return {
    slug: definition.slug,
    label: definition.label,
    eyebrow: definition.eyebrow,
    summary: definition.summary,
    description: definition.description,
    row_count: rows.length,
    active_jobs: activeJobs,
    hero_metrics: [
      {
        label: "Active listings",
        value: activeJobs.toLocaleString(),
        detail: `${definition.label} open rows`,
        annotation: `**Signal:** ${activeJobs.toLocaleString()} active postings match the ${definition.label.toLowerCase()} context.`,
      },
      {
        label: "New jobs, 7d",
        value: metrics.new_jobs_7d.toLocaleString(),
        detail: "First seen in the last 7 days",
        annotation: `**Freshness:** ${metrics.new_jobs_7d.toLocaleString()} matched rows entered the pool in the last week.`,
      },
      {
        label: "Remote share",
        value: `${metrics.remote_share}%`,
        detail: "Remote or hybrid active postings",
        annotation: "**Mode mix:** Remote share is computed from active postings with explicit remote or hybrid language.",
      },
      {
        label: "Median salary",
        value: formatMoney(metrics.median_salary),
        detail: `${salaryCoverage}% salary coverage`,
        annotation: "**Pay read:** Salary uses the midpoint of parseable ranges; ignore the median when coverage is thin.",
      },
      {
        label: "Indexed entities",
        value: String(totalIndexedPages(metrics)),
        detail: "Company, role, location, and industry pages",
        annotation: "**SEO surface:** Entity pages are counted only after they clear the active-job indexing thresholds.",
      },
      {
        label: "Snapshot date",
        value: snapshotDate,
        detail: "UTC date stamped on this context",
        annotation: "**Version:** Context dashboards are rebuilt during the same ingest that writes the main snapshot.",
      },
    ],
    top_hiring_trends: topCompanyRows(maps, 10),
    fast_growing_roles: fastGrowingRoleRows(maps, 10),
    top_locations: topLocationRows(maps, 10),
    top_industries: topIndustryRows(maps, 10),
    annotations: {
      overview: `**Context:** ${definition.annotation}`,
      companies: `**Ranking:** Employers are sorted by active postings inside the ${definition.label.toLowerCase()} context.`,
      roles: "**Momentum:** Roles are sorted by week-over-week growth, then active postings, within this context.",
      locations: "**Geography:** Locations show where matched active rows concentrate, including remote-heavy labels when present.",
      industries: "**Taxonomy:** Industry tags come from JobDataPool listing metadata and may include multiple tags per row.",
    },
  }
}

function buildMetricsContexts(items, snapshotDate, base) {
  return METRICS_CONTEXT_DEFINITIONS.map((definition) => {
    if (definition.slug === "default") {
      return buildDashboardContext(definition, items, base.maps, base.entities, base.global, snapshotDate)
    }

    const rows = items.filter(definition.match)
    const { maps, quality, entities } = buildEntityMaps(rows, snapshotDate)
    const global = buildGlobalMetrics(rows, maps, quality, entities)
    return buildDashboardContext(definition, rows, maps, entities, global, snapshotDate)
  }).filter((context) => context.slug === "default" || context.row_count > 0)
}

function buildDashboards(maps, entityBundles, snapshotDate, items, global) {
  const topCompanies = topCompanyRows(maps, 10)
  const fastGrowingRoles = fastGrowingRoleRows(maps, 10)
  const contexts = buildMetricsContexts(items, snapshotDate, {
    maps,
    entities: entityBundles,
    global,
  })

  const globalActive = global.active_jobs

  const heroMetrics = [
    {
      label: "Active listings",
      value: globalActive.toLocaleString(),
      detail: "Open rows in listings CSV (listing_closed false)",
    },
    {
      label: "New jobs, 7d",
      value: global.new_jobs_7d.toLocaleString(),
      detail: "First seen in the last 7 days",
    },
    {
      label: "Remote share",
      value: `${global.remote_share}%`,
      detail: "Remote or hybrid active postings",
    },
    {
      label: "Snapshot date",
      value: snapshotDate,
      detail: "UTC date stamped on metric snapshots",
    },
  ]

  return {
    home: {
      hero_metrics: heroMetrics,
      top_hiring_trends: topCompanies,
      fast_growing_roles: fastGrowingRoles,
    },
    contexts,
    rollups: {
      companies_top_50: rollupTable(maps.company, 50),
      roles_top_50: rollupTable(maps.role, 50),
      locations_top_50: rollupTable(maps.location, 50),
      industries_top_50: rollupTable(maps.industry, 50),
    },
  }
}

function latestSourceDateMs(items) {
  const timestamps = items
    .map(rowDate)
    .filter(Boolean)
    .map((date) => date.ts)
    .filter(Number.isFinite)
  return timestamps.length ? Math.max(...timestamps) : NaN
}

function weekStartFromDate(dateText) {
  if (!dateText) return "unknown"
  const date = new Date(`${dateText}T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) return "unknown"
  const day = date.getUTCDay()
  const offset = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

function cappedDistinctCount(items, field, limit = 500) {
  const values = new Set()
  for (const row of items) {
    values.add(slugify(row[field]) || "unknown")
    if (values.size >= limit) break
  }
  return values.size
}

function matchingActiveCount(items, predicate, limit = 5000) {
  let count = 0
  for (const row of items) {
    if (!isClosed(row) && predicate(row)) count += 1
    if (count >= limit) break
  }
  return count
}

function buildDatasetsMeta(items, snapshotDate) {
  const sourceMaxDateMs = latestSourceDateMs(items)
  const activeRows = items.filter((row) => !isClosed(row))
  const datasetCounts = {
    "free-job-postings-sample": Math.min(activeRows.length, 5000),
    "weekly-hiring-trends": new Set(items.map((row) => weekStartFromDate(rowDate(row)?.text))).size,
    "top-hiring-companies": cappedDistinctCount(items, "company_name"),
    "remote-jobs": matchingActiveCount(items, isRemote),
    "software-engineering-jobs": matchingActiveCount(items, (row) =>
      /software|engineer|developer/i.test(`${row.job_title || ""} ${row.job_industries || ""} ${row.industries || ""}`)
    ),
    "ai-jobs": matchingActiveCount(items, (row) =>
      /\bai\b|artificial intelligence|machine learning|ml engineer|data scientist/i.test(
        `${row.job_title || ""} ${row.job_industries || ""} ${row.industries || ""}`
      )
    ),
    "location-demand": cappedDistinctCount(items, "job_location"),
  }
  const templates = [
    ["free-job-postings-sample", "Free Job Postings Sample"],
    ["weekly-hiring-trends", "Weekly Hiring Trends"],
    ["top-hiring-companies", "Top Hiring Companies"],
    ["remote-jobs", "Remote Jobs"],
    ["software-engineering-jobs", "Software Engineering Jobs"],
    ["ai-jobs", "AI Jobs"],
    ["location-demand", "Location Demand"],
  ]

  return templates.map(([slug, title]) => ({
    slug,
    title,
    recordCount: datasetCounts[slug] || 0,
    updatedAt: Number.isFinite(sourceMaxDateMs) ? new Date(sourceMaxDateMs).toISOString().slice(0, 10) : snapshotDate,
  }))
}

function buildSnapshotFromListings({ items, dataUrl, source, startedAt }) {
  const snapshotDate = new Date().toISOString().slice(0, 10)
  const { maps, quality, entities, crossTabs, nameLookups } = buildEntityMaps(items, snapshotDate)
  const entity_breakdowns = buildEntityBreakdowns(crossTabs, nameLookups, entities)
  const community = buildCommunityLayer(entities, crossTabs, nameLookups, snapshotDate)
  const listing_previews = buildListingPreviews(items)

  const global = buildGlobalMetrics(items, maps, quality, entities)
  const globalActive = global.active_jobs

  const dashboards = buildDashboards(maps, entities, snapshotDate, items, global)
  const datasetCounts = buildDatasetsMeta(items, snapshotDate)

  const snapshot = {
    schema_version: "1",
    generated_at: new Date().toISOString(),
    ingest_duration_ms: Date.now() - startedAt,
    source: {
      data_url: dataUrl,
      source_kind: source,
      row_count: items.length,
      active_row_count: globalActive,
      columns_used: Object.keys(FIELD_GLOSSARY),
      source_format: "csv",
      masked_urls: true,
    },
    global,
    dashboards,
    catalog: {
      companies: entities.company.catalog,
      roles: entities.role.catalog,
      locations: entities.location.catalog,
      industries: entities.industry.catalog,
    },
    entities: {
      companies: entities.company.records,
      roles: entities.role.records,
      locations: entities.location.records,
      industries: entities.industry.records,
    },
    datasets: datasetCounts,
    entity_breakdowns,
    community,
    listing_previews,
    analyst: {
      field_glossary: FIELD_GLOSSARY,
      seo_thresholds: SEO_THRESHOLDS,
      quality,
      notes: [
        "All rollups are computed from JobDataPool listings-june-2026.csv on R2.",
        "Use GET ?view=manifest for run metadata only, or ?view=quality for data-quality counters.",
        "Use GET ?view=dashboard&context=remote-jobs for a context-specific dashboard payload.",
        "Use GET ?view=rollups for CSV-friendly top-50 tables without loading the full site snapshot.",
      ],
    },
  }

  const manifest = {
    schema_version: "1",
    generated_at: snapshot.generated_at,
    ingest_duration_ms: snapshot.ingest_duration_ms,
    source: snapshot.source,
    global: snapshot.global,
    indexed_pages: snapshot.global.indexed_pages,
    entity_counts: {
      companies: snapshot.catalog.companies.length,
      roles: snapshot.catalog.roles.length,
      locations: snapshot.catalog.locations.length,
      industries: snapshot.catalog.industries.length,
    },
    dashboards_available: Object.keys(snapshot.dashboards),
    dashboard_contexts: snapshot.dashboards.contexts.map((context) => ({
      slug: context.slug,
      label: context.label,
      active_jobs: context.active_jobs,
      row_count: context.row_count,
    })),
    quality: snapshot.analyst.quality,
  }

  return { snapshot, manifest }
}

module.exports = {
  FIELD_GLOSSARY,
  buildSnapshotFromListings,
  slugify,
}
