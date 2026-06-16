import type { Company, Dataset, EntityRecord, Industry, Location, MetricSnapshot, Role, TrendPoint } from "./types"

export type SnapshotEntityRecord = EntityRecord & {
  indexable?: boolean
}

export type DashboardMetric = {
  label: string
  value: string
  detail: string
  annotation?: string
}

export type HomeDashboard = {
  hero_metrics: DashboardMetric[]
  top_hiring_trends: Record<string, string | number>[]
  fast_growing_roles: Record<string, string | number>[]
}

export type MetricsDashboardContext = HomeDashboard & {
  slug: string
  label: string
  eyebrow: string
  summary: string
  description: string
  row_count: number
  active_jobs: number
  annotations: {
    overview: string
    companies: string
    roles: string
    locations: string
    industries: string
  }
  top_locations: Record<string, string | number>[]
  top_industries: Record<string, string | number>[]
}

export type MetricsSnapshotFile = {
  schema_version: string
  generated_at: string
  ingest_duration_ms?: number
  source: {
    data_url: string
    row_count: number
    active_row_count: number
  }
  global: {
    active_jobs: number
    new_jobs_7d: number
    remote_share: number
    median_salary?: number
    indexed_pages: Record<string, number>
  }
  dashboards: {
    home: HomeDashboard
    contexts?: MetricsDashboardContext[]
    rollups?: Record<string, unknown>
  }
  catalog: {
    companies: Company[]
    roles: Role[]
    locations: Location[]
    industries: Industry[]
  }
  entities: {
    companies: SnapshotEntityRecord[]
    roles: SnapshotEntityRecord[]
    locations: SnapshotEntityRecord[]
    industries: SnapshotEntityRecord[]
  }
  datasets?: { slug: string; recordCount: number; updatedAt: string }[]
  entity_breakdowns?: Record<
    string,
    {
      primaryRows: Record<string, string | number>[]
      secondaryRows: Record<string, string | number>[]
      relatedLinks: { label: string; href: string }[]
    }
  >
  community?: {
    location_signals: Array<{
      id: string
      name: string
      coordinates: [number, number]
      activeJobs: number
      newJobs7d: number
      remoteShare: number
      signalScore: number
      dominantRole: string
      industry: string
    }>
    articles: Array<Record<string, unknown>>
  }
  listing_previews?: Record<string, Record<string, string | number>[]>
}

export function stripEntityRecord(record: SnapshotEntityRecord): EntityRecord {
  const copy = { ...record }
  delete copy.indexable
  return copy
}

export function mergeDatasetCounts(seed: Dataset[], counts: MetricsSnapshotFile["datasets"]): Dataset[] {
  if (!counts?.length) return seed
  const bySlug = new Map(counts.map((entry) => [entry.slug, entry]))
  return seed.map((dataset) => {
    const fresh = bySlug.get(dataset.slug)
    if (!fresh) return dataset
    return {
      ...dataset,
      recordCount: fresh.recordCount,
      updatedAt: fresh.updatedAt
    }
  })
}

export type { MetricSnapshot, TrendPoint }
