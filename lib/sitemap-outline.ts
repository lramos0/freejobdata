import type { MetadataRoute } from "next"
import {
  companyRecords,
  datasets,
  getMetricsDashboardContexts,
  industryRecords,
  locationRecords,
  metricsSnapshotMeta,
  reports,
  readMetricsSnapshot,
  roleRecords
} from "@/lib/data"
import { communityArticles } from "@/lib/community-data"
import { absoluteUrl } from "@/lib/seo"
import { SITE_SITELINKS } from "@/lib/site-hubs"
import { shouldIndexPage } from "@/lib/thresholds"

type SitemapEntry = MetadataRoute.Sitemap[number]

function entry(
  path: string,
  options: {
    lastModified?: Date | string
    changeFrequency?: SitemapEntry["changeFrequency"]
    priority?: number
  } = {}
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified: options.lastModified ? new Date(options.lastModified) : new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority
  }
}

/** Tier 0: homepage + sitelink hubs (highest priority for crawlers). */
export function buildCoreSitemap(): MetadataRoute.Sitemap {
  const hubEntries = SITE_SITELINKS.map((hub) =>
    entry(hub.path, { changeFrequency: "daily", priority: 1 })
  )

  const supportingStatic = [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/reports", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/methodology", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/press", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/news", { changeFrequency: "weekly", priority: 0.7 }),
    entry("/maps", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/api", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/companies", { changeFrequency: "daily", priority: 0.85 }),
    entry("/jobs", { changeFrequency: "daily", priority: 0.85 }),
    entry("/locations", { changeFrequency: "daily", priority: 0.85 }),
    entry("/industries", { changeFrequency: "daily", priority: 0.85 })
  ]

  return [...supportingStatic.slice(0, 1), ...hubEntries, ...supportingStatic.slice(1)]
}

/** Tier 1: entity intelligence pages that pass SEO thresholds. */
export function buildEntitySitemap(): MetadataRoute.Sitemap {
  const entityPaths = [
    ...companyRecords.map((record) => ({ path: `/companies/${record.slug}`, metrics: record.metrics })),
    ...roleRecords.map((record) => ({ path: `/jobs/${record.slug}`, metrics: record.metrics })),
    ...locationRecords.map((record) => ({ path: `/locations/${record.slug}`, metrics: record.metrics })),
    ...industryRecords.map((record) => ({ path: `/industries/${record.slug}`, metrics: record.metrics }))
  ]
    .filter((item) => shouldIndexPage(item.metrics))
    .map((item) =>
      entry(item.path, {
        lastModified: item.metrics.date,
        changeFrequency: "weekly",
        priority: 0.6
      })
    )

  return entityPaths
}

export function buildMetricsContextSitemap(): MetadataRoute.Sitemap {
  const snapshot = readMetricsSnapshot()
  const snapshotMeta = metricsSnapshotMeta(snapshot)

  return getMetricsDashboardContexts(snapshot)
    .filter((context) => context.slug !== "default" && context.active_jobs > 0)
    .map((context) =>
      entry(`/metrics/${encodeURIComponent(context.slug)}`, {
        lastModified: snapshotMeta?.generated_at,
        changeFrequency: "daily",
        priority: 0.82
      })
    )
}

/** Tier 2: dataset and report detail pages. */
export function buildContentSitemap(): MetadataRoute.Sitemap {
  const datasetEntries = datasets.map((dataset) =>
    entry(`/datasets/${dataset.slug}`, {
      lastModified: dataset.updatedAt,
      changeFrequency: "weekly",
      priority: 0.75
    })
  )

  const reportEntries = reports.map((report) =>
    entry(`/reports/${report.slug}`, {
      lastModified: report.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7
    })
  )

  const teamNewsEntries = communityArticles
    .filter((article) => article.type === "team" && article.body?.length)
    .map((article) =>
      entry(`/news/${article.id}`, {
        lastModified: article.publishedAt,
        changeFrequency: "weekly",
        priority: 0.65
      })
    )

  return [...datasetEntries, ...reportEntries, ...teamNewsEntries]
}

export const SITEMAP_SECTIONS = [
  { id: 0, name: "core", description: "Homepage, sitelink hubs (datasets, metrics, community), and primary indexes" },
  { id: 1, name: "entities", description: "Company, role, location, and industry intelligence pages" },
  { id: 2, name: "content", description: "Dataset and report detail pages" }
] as const
