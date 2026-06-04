import type { MetadataRoute } from "next"
import { buildContentSitemap, buildCoreSitemap, buildEntitySitemap, SITEMAP_SECTIONS } from "@/lib/sitemap-outline"

export async function generateSitemaps() {
  return SITEMAP_SECTIONS.map((section) => ({ id: section.id }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    case 0:
      return buildCoreSitemap()
    case 1:
      return buildEntitySitemap()
    case 2:
      return buildContentSitemap()
    default:
      return []
  }
}
