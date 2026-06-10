import type { MetadataRoute } from "next"
import { absoluteUrl, siteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/search", "/debug", "/internal", "/.netlify/functions/job-market-news"]
      }
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
    host: siteUrl
  }
}
