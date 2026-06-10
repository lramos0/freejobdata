import { communityArticles } from "@/lib/community-data"
import { absoluteUrl } from "@/lib/seo"

export const dynamic = "force-dynamic"

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function articleDate(value: string) {
  return new Date(value.includes("T") ? value : `${value}T09:00:00-07:00`)
}

function isRecentNewsArticle(publishedAt: string) {
  const published = articleDate(publishedAt).getTime()
  const age = Date.now() - published

  return Number.isFinite(published) && age >= 0 && age <= TWO_DAYS_MS
}

export function GET() {
  const urls = communityArticles
    .filter((article) => article.type === "team" && article.body?.length && isRecentNewsArticle(article.publishedAt))
    .map((article) => {
      const loc = absoluteUrl(`/news/${article.id}`)
      const publicationDate = articleDate(article.publishedAt).toISOString()

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>FreeJobData</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    })
    .join("\n")

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8"
      }
    }
  )
}
