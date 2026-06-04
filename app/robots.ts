import type { MetadataRoute } from "next"
import { absoluteUrl, siteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/search", "/debug", "/internal"]
      }
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/sitemap/0.xml"), absoluteUrl("/sitemap/1.xml"), absoluteUrl("/sitemap/2.xml")],
    host: siteUrl
  }
}
