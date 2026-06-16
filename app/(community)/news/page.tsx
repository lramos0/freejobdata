import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { NewsIndexGate } from "@/components/community/NewsGate"
import { editorialCommunityArticles } from "@/lib/community-data"
import { absoluteUrl, buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Job Market News",
  description:
    "FreeJobData Team articles, public job-market analysis, and signed-in community notes powered by JobDataPool.",
  path: "/news"
})

function articleIsoDate(date: string) {
  return date.includes("T") ? date : `${date}T09:00:00-07:00`
}

function NewsCollectionJsonLd() {
  const publicTeamArticles = editorialCommunityArticles.filter((article) => article.type === "team" && article.body?.length)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Job Market News",
          description:
            "FreeJobData Team articles, public job-market analysis, and signed-in community notes powered by JobDataPool.",
          url: absoluteUrl("/news"),
          inLanguage: "en-US",
          isAccessibleForFree: true,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: publicTeamArticles.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/news/${article.id}`),
              item: {
                "@type": "NewsArticle",
                headline: article.title,
                description: article.summary,
                datePublished: articleIsoDate(article.publishedAt),
                url: absoluteUrl(`/news/${article.id}`),
                author: {
                  "@type": "Organization",
                  name: article.author
                },
                publisher: {
                  "@type": "Organization",
                  name: "FreeJobData"
                }
              }
            }))
          }
        })
      }}
    />
  )
}

export default function NewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" }
        ]}
      />
      <NewsCollectionJsonLd />
      <NewsIndexGate />
    </>
  )
}
