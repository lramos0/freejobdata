import type { MetadataRoute } from "next"
import { buildContentSitemap, buildCoreSitemap, buildEntitySitemap, SITEMAP_SECTIONS } from "@/lib/sitemap-outline"

export default function sitemap(): MetadataRoute.Sitemap {
  return [...buildCoreSitemap(), ...buildEntitySitemap(), ...buildContentSitemap()]
}

export { SITEMAP_SECTIONS }
