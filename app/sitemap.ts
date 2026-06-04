import type { MetadataRoute } from "next"
import {
  companyRecords,
  datasets,
  industryRecords,
  locationRecords,
  reports,
  roleRecords
} from "@/lib/data"
import { absoluteUrl } from "@/lib/seo"
import { shouldIndexPage } from "@/lib/thresholds"

const staticPages = ["/", "/news", "/reports", "/datasets", "/companies", "/jobs", "/locations", "/industries", "/methodology", "/about", "/press", "/api"]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticPages.map((path) => ({ url: absoluteUrl(path), lastModified: new Date() }))
  const entityEntries = [
    ...companyRecords.map((record) => ({ path: `/companies/${record.slug}`, metrics: record.metrics })),
    ...roleRecords.map((record) => ({ path: `/jobs/${record.slug}`, metrics: record.metrics })),
    ...locationRecords.map((record) => ({ path: `/locations/${record.slug}`, metrics: record.metrics })),
    ...industryRecords.map((record) => ({ path: `/industries/${record.slug}`, metrics: record.metrics }))
  ]
    .filter((entry) => shouldIndexPage(entry.metrics))
    .map((entry) => ({ url: absoluteUrl(entry.path), lastModified: new Date(entry.metrics.date) }))

  const contentEntries = [...reports.map((item) => `/reports/${item.slug}`), ...datasets.map((item) => `/datasets/${item.slug}`)].map(
    (path) => ({ url: absoluteUrl(path), lastModified: new Date() })
  )

  return [...staticEntries, ...entityEntries, ...contentEntries]
}
