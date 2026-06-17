import type { EntityRecord, EntityType } from "./types"
import { resolveLocationCoordinates } from "./location-coordinates"
import { readMetricsSnapshot } from "./metrics-snapshot-runtime"
import type { MetricsSnapshotFile } from "./metrics-snapshot"

export type EntityBreakdown = {
  primaryRows: Record<string, string | number>[]
  secondaryRows: Record<string, string | number>[]
  relatedLinks: { label: string; href: string }[]
}

export type CommunityArticleSnapshot = {
  id: string
  title: string
  summary: string
  body?: string[]
  figures?: {
    title: string
    image: string
    alt: string
    caption: string
  }[]
  sources?: { label: string; href: string }[]
  author: string
  type: "team" | "community"
  publishedAt: string
  location: string
  role: string
  industry: string
  factuality: "High Signal" | "Mixed Signal" | "Developing"
  confidence: number
  sourceCount: number
  coordinates: [number, number]
  tags: string[]
}

export type JobPostingLocationSignalSnapshot = {
  id: string
  name: string
  coordinates: [number, number]
  activeJobs: number
  newJobs7d: number
  remoteShare: number
  signalScore: number
  dominantRole: string
  industry: string
}

const fallbackLocationSignals: JobPostingLocationSignalSnapshot[] = [
  {
    id: "san-francisco-ca",
    name: "San Francisco, CA",
    coordinates: [-122.4194, 37.7749],
    activeJobs: 1425,
    newJobs7d: 186,
    remoteShare: 41.8,
    signalScore: 94,
    dominantRole: "Machine Learning Engineer",
    industry: "Artificial Intelligence"
  },
  {
    id: "new-york-ny",
    name: "New York, NY",
    coordinates: [-74.006, 40.7128],
    activeJobs: 1210,
    newJobs7d: 141,
    remoteShare: 36.2,
    signalScore: 88,
    dominantRole: "Product Manager",
    industry: "Financial Technology"
  },
  {
    id: "seattle-wa",
    name: "Seattle, WA",
    coordinates: [-122.3321, 47.6062],
    activeJobs: 940,
    newJobs7d: 116,
    remoteShare: 38.5,
    signalScore: 82,
    dominantRole: "Software Engineer",
    industry: "Cloud Infrastructure"
  },
  {
    id: "austin-tx",
    name: "Austin, TX",
    coordinates: [-97.7431, 30.2672],
    activeJobs: 725,
    newJobs7d: 92,
    remoteShare: 44.1,
    signalScore: 76,
    dominantRole: "Data Engineer",
    industry: "Software"
  },
  {
    id: "san-diego-ca",
    name: "San Diego, CA",
    coordinates: [-117.1611, 32.7157],
    activeJobs: 510,
    newJobs7d: 66,
    remoteShare: 29.7,
    signalScore: 69,
    dominantRole: "Security Engineer",
    industry: "Healthcare"
  },
  {
    id: "los-angeles-ca",
    name: "Los Angeles, CA",
    coordinates: [-118.2437, 34.0522],
    activeJobs: 480,
    newJobs7d: 61,
    remoteShare: 33.4,
    signalScore: 67,
    dominantRole: "Product Designer",
    industry: "Media"
  },
  {
    id: "chicago-il",
    name: "Chicago, IL",
    coordinates: [-87.6298, 41.8781],
    activeJobs: 455,
    newJobs7d: 58,
    remoteShare: 31.2,
    signalScore: 65,
    dominantRole: "Operations Manager",
    industry: "Financial Services"
  },
  {
    id: "denver-co",
    name: "Denver, CO",
    coordinates: [-104.9903, 39.7392],
    activeJobs: 420,
    newJobs7d: 54,
    remoteShare: 39.8,
    signalScore: 63,
    dominantRole: "Account Executive",
    industry: "Software"
  },
  {
    id: "boston-ma",
    name: "Boston, MA",
    coordinates: [-71.0589, 42.3601],
    activeJobs: 395,
    newJobs7d: 49,
    remoteShare: 34.6,
    signalScore: 61,
    dominantRole: "Clinical Research Associate",
    industry: "Healthcare"
  },
  {
    id: "atlanta-ga",
    name: "Atlanta, GA",
    coordinates: [-84.388, 33.749],
    activeJobs: 370,
    newJobs7d: 47,
    remoteShare: 37.1,
    signalScore: 59,
    dominantRole: "Customer Success Manager",
    industry: "Logistics"
  },
  {
    id: "dallas-tx",
    name: "Dallas, TX",
    coordinates: [-96.797, 32.7767],
    activeJobs: 350,
    newJobs7d: 44,
    remoteShare: 35.5,
    signalScore: 57,
    dominantRole: "Business Analyst",
    industry: "Retail"
  },
  {
    id: "washington-dc",
    name: "Washington, DC",
    coordinates: [-77.0369, 38.9072],
    activeJobs: 330,
    newJobs7d: 41,
    remoteShare: 28.9,
    signalScore: 55,
    dominantRole: "Policy Analyst",
    industry: "Government"
  },
  {
    id: "miami-fl",
    name: "Miami, FL",
    coordinates: [-80.1918, 25.7617],
    activeJobs: 310,
    newJobs7d: 39,
    remoteShare: 32.7,
    signalScore: 53,
    dominantRole: "Hospitality Manager",
    industry: "Hospitality"
  },
  {
    id: "phoenix-az",
    name: "Phoenix, AZ",
    coordinates: [-112.074, 33.4484],
    activeJobs: 295,
    newJobs7d: 36,
    remoteShare: 30.4,
    signalScore: 51,
    dominantRole: "Registered Nurse",
    industry: "Healthcare"
  }
]

function snapshot(): MetricsSnapshotFile | null {
  return readMetricsSnapshot()
}

export function hasMetricsSnapshot() {
  return Boolean(snapshot()?.entities?.companies?.length)
}

export function getEntityBreakdown(entityType: EntityType, slug: string): EntityBreakdown | null {
  const data = snapshot()?.entity_breakdowns?.[`${entityType}:${slug}`]
  if (!data) return null
  return data as EntityBreakdown
}

export function getEntityPageContext(entityType: EntityType, slug: string, records: EntityRecord[]) {
  const record = records.find((item) => item.slug === slug)
  if (!record) {
    return null
  }

  const breakdown = getEntityBreakdown(entityType, slug)
  const relatedLinks = mergeRelatedLinks(
    breakdown?.relatedLinks ?? buildFallbackRelatedLinks(entityType, record),
    buildAdjacentEntityLinks(entityType, slug, records)
  )

  return {
    record,
    primaryRows: breakdown?.primaryRows ?? buildFallbackPrimaryRows(record),
    secondaryRows: breakdown?.secondaryRows ?? buildFallbackSecondaryRows(record),
    relatedLinks
  }
}

function hydrateLocationSignal(location: JobPostingLocationSignalSnapshot): JobPostingLocationSignalSnapshot | null {
  const coordinates =
    Array.isArray(location.coordinates) && location.coordinates.length === 2
      ? (location.coordinates as [number, number])
      : resolveLocationCoordinates(location.id, location.name)

  if (!coordinates) {
    return null
  }

  return {
    ...location,
    coordinates,
  }
}

export function getJobPostingLocationSignals(): JobPostingLocationSignalSnapshot[] {
  const snapshotSignals = snapshot()?.community?.location_signals as JobPostingLocationSignalSnapshot[] | undefined
  if (snapshotSignals?.length) {
    return snapshotSignals
      .map(hydrateLocationSignal)
      .filter((location): location is JobPostingLocationSignalSnapshot => Boolean(location))
  }

  return fallbackLocationSignals
}

export function getCommunityArticles(): CommunityArticleSnapshot[] {
  return (snapshot()?.community?.articles as CommunityArticleSnapshot[] | undefined) ?? []
}

export function getDatasetPreviewRows(slug: string): Record<string, string | number>[] {
  const previews = snapshot()?.listing_previews as Record<string, Record<string, string | number>[]> | undefined
  const snapshotRows = previews?.[slug] ?? previews?.default
  if (snapshotRows?.length) return snapshotRows

  if (typeof window !== "undefined") {
    return []
  }

  try {
    const fs = require("fs") as typeof import("fs")
    const path = require("path") as typeof import("path")
    const csvPath = path.join(process.cwd(), "public", "samples", `${slug}.csv`)
    if (!fs.existsSync(csvPath)) {
      return []
    }

    return parseCsvPreview(fs.readFileSync(csvPath, "utf8")).slice(0, 8)
  } catch {
    return []
  }
}

export function getCompanyMetricsBySlug(slug: string) {
  const record = snapshot()?.entities?.companies?.find((item) => item.slug === slug)
  return record?.metrics ?? null
}

function buildFallbackPrimaryRows(record: EntityRecord): Record<string, string | number>[] {
  return [
    { Metric: "Active jobs", Value: record.metrics.activeJobs.toLocaleString(), Signal: "Current open-posting volume" },
    { Metric: "New jobs, 7d", Value: record.metrics.newJobs7d.toLocaleString(), Signal: "Fresh hiring demand" },
    { Metric: "Closed jobs, 7d", Value: record.metrics.closedJobs7d.toLocaleString(), Signal: "Posting churn" },
    {
      Metric: "Median salary",
      Value: record.metrics.medianSalary ? `$${record.metrics.medianSalary.toLocaleString()}` : "Not enough coverage",
      Signal: "Salary-bearing postings"
    }
  ]
}

function buildFallbackSecondaryRows(record: EntityRecord): Record<string, string | number>[] {
  return [
    { Segment: "Remote share", Value: `${record.metrics.remoteShare}%`, Detail: "Remote or hybrid postings" },
    { Segment: "Weekly growth", Value: `${record.metrics.growthWoW}%`, Detail: "Week-over-week change" },
    { Segment: "Monthly growth", Value: `${record.metrics.growthMoM}%`, Detail: "Month-over-month change" },
    {
      Segment: "Salary coverage",
      Value: `${record.metrics.salaryCoverage ?? 0}%`,
      Detail: "Rows with usable compensation data"
    }
  ]
}

function buildFallbackRelatedLinks(entityType: EntityType, record: EntityRecord): { label: string; href: string }[] {
  const linksByType: Record<EntityType, { label: string; href: string }[]> = {
    company: [
      { label: "Browse role demand", href: "/jobs" },
      { label: "Browse location trends", href: "/locations" },
      { label: "Download company dataset sample", href: "/datasets/top-hiring-companies" }
    ],
    role: [
      { label: "Browse company hiring", href: "/companies" },
      { label: "Browse location trends", href: "/locations" },
      { label: "Download role dataset sample", href: "/datasets/software-engineering-jobs" }
    ],
    location: [
      { label: "Open hiring map", href: "/maps" },
      { label: "Browse company hiring", href: "/companies" },
      { label: "Download location dataset sample", href: "/datasets/location-demand" }
    ],
    industry: [
      { label: "Browse role demand", href: "/jobs" },
      { label: "Browse company hiring", href: "/companies" },
      { label: "Download weekly trends sample", href: "/datasets/weekly-hiring-trends" }
    ],
    global: [
      { label: "Metrics hub", href: "/metrics" },
      { label: "Dataset portal", href: "/datasets" },
      { label: "Methodology", href: "/methodology" }
    ]
  }

  return [{ label: `${record.name} methodology`, href: "/methodology" }, ...linksByType[entityType]]
}

function entityBasePath(entityType: EntityType) {
  const paths: Record<EntityType, string> = {
    company: "/companies",
    role: "/jobs",
    location: "/locations",
    industry: "/industries",
    global: "/metrics"
  }

  return paths[entityType]
}

function buildAdjacentEntityLinks(entityType: EntityType, slug: string, records: EntityRecord[]) {
  if (entityType === "global" || records.length < 2) return []

  const index = records.findIndex((record) => record.slug === slug)
  if (index < 0) return []

  const basePath = entityBasePath(entityType)
  const candidates = [records[index - 1], records[index + 1]].filter(
    (record): record is EntityRecord => Boolean(record)
  )

  return candidates.map((record) => ({
    label: `${record.name} hiring signal`,
    href: `${basePath}/${record.slug}`
  }))
}

function mergeRelatedLinks(
  primaryLinks: { label: string; href: string }[],
  secondaryLinks: { label: string; href: string }[]
) {
  const seen = new Set<string>()
  return [...primaryLinks, ...secondaryLinks].filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
}

function parseCsvPreview(csv: string): Record<string, string | number>[] {
  const rows = parseCsvRows(csv.trim())
  const [headers, ...records] = rows
  if (!headers?.length) return []

  return records.map((record) =>
    Object.fromEntries(
      headers.map((header, index) => {
        const value = record[index] ?? ""
        const numeric = Number(value)
        return [header, value.trim() !== "" && Number.isFinite(numeric) ? numeric : value]
      })
    )
  )
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    const next = csv[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      row.push(cell)
      cell = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1
      }
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }

    cell += char
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ""))
}
