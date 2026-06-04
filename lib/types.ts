export type EntityType = "company" | "role" | "location" | "industry" | "global"

export type Company = {
  id: string
  slug: string
  name: string
  domain?: string
  industry?: string
  description?: string
  logoUrl?: string
}

export type Role = {
  id: string
  slug: string
  title: string
  normalizedTitle: string
  category?: string
}

export type Location = {
  id: string
  slug: string
  name: string
  type: "city" | "state" | "metro" | "country"
  state?: string
  country: string
}

export type Industry = {
  id: string
  slug: string
  name: string
}

export type Dataset = {
  id: string
  slug: string
  title: string
  description: string
  schemaJson: Record<string, string>
  sampleCsvUrl?: string
  fullDatasetCtaUrl: string
  updatedAt: string
  recordCount: number
  license: string
}

export type MetricSnapshot = {
  id: string
  entityType: EntityType
  entityId: string
  date: string
  activeJobs: number
  newJobs7d: number
  closedJobs7d: number
  growthWoW: number
  growthMoM: number
  remoteShare: number
  medianSalary?: number
  salaryCoverage?: number
}

export type Report = {
  id: string
  slug: string
  title: string
  summary: string
  bodyMarkdown: string
  reportType: "weekly" | "monthly" | "industry" | "company" | "location"
  publishedAt: string
  updatedAt: string
  relatedEntities: {
    companies?: string[]
    roles?: string[]
    locations?: string[]
    industries?: string[]
    datasets?: string[]
  }
}

export type TrendPoint = {
  label: string
  value: number
}

export type EntityRecord = {
  slug: string
  name: string
  description?: string
  metrics: MetricSnapshot
  trend: TrendPoint[]
}
