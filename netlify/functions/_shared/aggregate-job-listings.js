const { SEO_THRESHOLDS } = require("./seo-thresholds")
const { bump, buildRows, createCrossTabs, topCounts } = require("./cross-tabs")
const { resolveCoordinates } = require("./location-coordinates")

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
    salaryValues: [],
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

  if (isRemote(row)) bucket.remoteRows += 1

  const salary = parseSalaryMidpoint(row)
  if (salary != null) bucket.salaryValues.push(salary)

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
    ? Number(((bucket.remoteRows / Math.max(bucket.totalRows, 1)) * 100).toFixed(1))
    : 0
  const salaryCoverage = activeJobs
    ? Number(((bucket.salaryValues.length / Math.max(bucket.activeRows, 1)) * 100).toFixed(1))
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
    medianSalary: median(bucket.salaryValues),
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
        ? Number(((bucket.remoteRows / Math.max(bucket.totalRows, 1)) * 100).toFixed(1))
        : 0,
      median_salary: median(bucket.salaryValues),
      wow_growth_pct: growthPercent(bucket.ingestedLast7d, bucket.ingestedPrev7d),
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

function buildCommunityLayer(entities, crossTabs, nameLookups, snapshotDate) {
  const locationSignals = entities.location.records
    .map((record) => {
      const coordinates = resolveCoordinates(record.slug, record.name)
      if (!coordinates) return null
      const tab = crossTabs.location.get(record.slug)
      const dominantRoleSlug = tab ? topCounts(tab.roles, 1)[0]?.[0] : null
      return {
        id: record.slug,
        name: record.name,
        coordinates,
        activeJobs: record.metrics.activeJobs,
        newJobs7d: record.metrics.newJobs7d,
        remoteShare: record.metrics.remoteShare,
        signalScore: Math.min(99, Math.round(record.metrics.growthWoW + record.metrics.remoteShare / 2)),
        dominantRole: dominantRoleSlug
          ? nameLookups.role.get(dominantRoleSlug) || dominantRoleSlug
          : "Mixed roles",
        industry: topCounts(tab?.industries || new Map(), 1)[0]
          ? nameLookups.industry.get(topCounts(tab.industries, 1)[0][0]) || "General"
          : "General",
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.activeJobs - a.activeJobs)
    .slice(0, 20)

  const articles = entities.location.records.slice(0, 6).map((record, index) => {
    const coordinates = resolveCoordinates(record.slug, record.name) || [-98.5795, 39.8283]
    const tab = crossTabs.location.get(record.slug)
    const topRoleSlug = tab ? topCounts(tab.roles, 1)[0]?.[0] : null
    const roleName = topRoleSlug ? nameLookups.role.get(topRoleSlug) : "multiple roles"

    return {
      id: `briefing-${record.slug}`,
      title: `${record.name}: ${record.metrics.newJobs7d} new jobs (7d) led by ${roleName}`,
      summary: `FreeJobData counted ${record.metrics.activeJobs.toLocaleString()} active listings in ${record.name} with ${record.metrics.remoteShare}% remote share.`,
      author: index % 2 === 0 ? "FreeJobData Team" : "Community Intel",
      type: index % 2 === 0 ? "team" : "community",
      publishedAt: snapshotDate,
      location: record.name,
      role: roleName || "Mixed roles",
      industry: "Labor market",
      factuality: record.metrics.newJobs7d >= 50 ? "High Signal" : "Developing",
      confidence: Math.min(95, 55 + Math.round(record.metrics.growthWoW)),
      sourceCount: Math.max(8, Math.round(record.metrics.activeJobs / 40)),
      coordinates,
      tags: [record.name, roleName || "hiring"].filter(Boolean),
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

function buildDashboards(maps, entityBundles, snapshotDate) {
  const topCompanies = rollupTable(maps.company, 50)
    .filter((row) => isUsableCompanyName(row.name))
    .slice(0, 10)
    .map((row) => ({
      company: row.name,
      "active jobs": row.active_jobs,
      "new 7d": row.new_jobs_7d,
      "remote share": `${row.remote_share_pct}%`,
    }))

  const fastGrowingRoles = rollupTable(maps.role, 50)
    .filter((row) => isUsableRoleTitle(row.name))
    .sort((a, b) => b.wow_growth_pct - a.wow_growth_pct || b.active_jobs - a.active_jobs)
    .slice(0, 10)
    .map((row) => ({
      role: row.name,
      "active jobs": row.active_jobs,
      "WoW growth": `${row.wow_growth_pct}%`,
      "median salary": row.median_salary ? `$${row.median_salary.toLocaleString()}` : "n/a",
    }))

  const globalActive = entityBundles.globalActive

  const heroMetrics = [
    {
      label: "Active listings",
      value: globalActive.toLocaleString(),
      detail: "Open rows in listings CSV (listing_closed false)",
    },
    {
      label: "Company pages",
      value: String(entityBundles.company.records.filter((r) => r.indexable).length),
      detail: `Indexed when active jobs ≥ ${SEO_THRESHOLDS.companyMinActiveJobs}`,
    },
    {
      label: "Role pages",
      value: String(entityBundles.role.records.filter((r) => r.indexable).length),
      detail: `Indexed when active jobs ≥ ${SEO_THRESHOLDS.roleMinActiveJobs}`,
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
    rollups: {
      companies_top_50: rollupTable(maps.company, 50),
      roles_top_50: rollupTable(maps.role, 50),
      locations_top_50: rollupTable(maps.location, 50),
      industries_top_50: rollupTable(maps.industry, 50),
    },
  }
}

function buildDatasetsMeta(activeJobs, snapshotDate) {
  const templates = [
    ["free-job-postings-sample", "Free Job Postings Sample"],
    ["weekly-hiring-trends", "Weekly Hiring Trends"],
    ["top-hiring-companies", "Top Hiring Companies"],
    ["remote-jobs", "Remote Jobs"],
    ["software-engineering-jobs", "Software Engineering Jobs"],
    ["ai-jobs", "AI Jobs"],
    ["location-demand", "Location Demand"],
  ]

  return templates.map(([slug, title], index) => ({
    slug,
    title,
    recordCount: Math.max(500, Math.round(activeJobs / (index + 2))),
    updatedAt: snapshotDate,
  }))
}

function buildSnapshotFromListings({ items, dataUrl, source, startedAt }) {
  const snapshotDate = new Date().toISOString().slice(0, 10)
  const { maps, quality, entities, crossTabs, nameLookups } = buildEntityMaps(items, snapshotDate)
  const entity_breakdowns = buildEntityBreakdowns(crossTabs, nameLookups, entities)
  const community = buildCommunityLayer(entities, crossTabs, nameLookups, snapshotDate)
  const listing_previews = buildListingPreviews(items)

  const globalActive = quality.rows_active
  const global = {
    active_jobs: globalActive,
    new_jobs_7d: [...maps.company.values()].reduce((sum, b) => sum + b.ingestedLast7d, 0),
    closed_jobs_7d: quality.rows_closed,
    remote_share: items.length
      ? Number(
          (
            (items.filter((row) => !isClosed(row) && isRemote(row)).length / Math.max(globalActive, 1)) *
            100
          ).toFixed(1)
        )
      : 0,
    median_salary: median(
      items.map(parseSalaryMidpoint).filter((value) => typeof value === "number")
    ),
    salary_coverage: globalActive
      ? Number(
          (
            (items.filter((row) => !isClosed(row) && parseSalaryMidpoint(row) != null).length /
              globalActive) *
            100
          ).toFixed(1)
        )
      : 0,
    indexed_pages: {
      company: entities.company.records.filter((r) => r.indexable).length,
      role: entities.role.records.filter((r) => r.indexable).length,
      location: entities.location.records.filter((r) => r.indexable).length,
      industry: entities.industry.records.filter((r) => r.indexable).length,
    },
  }

  const dashboards = buildDashboards(maps, { globalActive, ...entities }, snapshotDate)
  const datasetCounts = buildDatasetsMeta(globalActive, snapshotDate)

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
    quality: snapshot.analyst.quality,
  }

  return { snapshot, manifest }
}

module.exports = {
  FIELD_GLOSSARY,
  buildSnapshotFromListings,
  slugify,
}
