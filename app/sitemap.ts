import type { MetadataRoute } from "next"
import {
  buildContentSitemap,
  buildCoreSitemap,
  buildEntitySitemap,
  buildMetricsContextSitemap,
  SITEMAP_SECTIONS
} from "@/lib/sitemap-outline"

export default function sitemap(): MetadataRoute.Sitemap {
  return [...buildCoreSitemap(), ...buildMetricsContextSitemap(), ...buildEntitySitemap(), ...buildContentSitemap()]
}

export { SITEMAP_SECTIONS }
