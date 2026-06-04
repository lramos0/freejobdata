import type { EntityRecord, EntityType } from "./types"
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

  return {
    record,
    primaryRows: breakdown?.primaryRows ?? [],
    secondaryRows: breakdown?.secondaryRows ?? [],
    relatedLinks: breakdown?.relatedLinks ?? []
  }
}

export function getJobPostingLocationSignals(): JobPostingLocationSignalSnapshot[] {
  return (snapshot()?.community?.location_signals as JobPostingLocationSignalSnapshot[] | undefined) ?? []
}

export function getCommunityArticles(): CommunityArticleSnapshot[] {
  return (snapshot()?.community?.articles as CommunityArticleSnapshot[] | undefined) ?? []
}

export function getDatasetPreviewRows(slug: string): Record<string, string | number>[] {
  const previews = snapshot()?.listing_previews as Record<string, Record<string, string | number>[]> | undefined
  if (!previews) return []
  return previews[slug] ?? previews.default ?? []
}

export function getCompanyMetricsBySlug(slug: string) {
  const record = snapshot()?.entities?.companies?.find((item) => item.slug === slug)
  return record?.metrics ?? null
}
