import type { Company, Dataset, EntityRecord, Industry, Location, MetricSnapshot, Role, TrendPoint } from "./types"

export type SnapshotEntityRecord = EntityRecord & {
  indexable?: boolean
}

export type HomeDashboard = {
  hero_metrics: { label: string; value: string; detail: string }[]
  top_hiring_trends: Record<string, string | number>[]
  fast_growing_roles: Record<string, string | number>[]
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
