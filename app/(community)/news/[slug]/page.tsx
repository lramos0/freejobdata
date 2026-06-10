import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { communityArticles, findCommunityArticle } from "@/lib/community-data"
import { absoluteUrl, siteUrl } from "@/lib/seo"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return communityArticles.map((article) => ({ slug: article.id }))
}

function articleIsoDate(date: string) {
  return date.includes("T") ? date : `${date}T09:00:00-07:00`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = findCommunityArticle(slug)
  const title = article ? article.title : "Job Market News"
  const description = article?.summary ?? "FreeJobData job market news and workplace analysis."
  const path = `/news/${slug}`
  const url = absoluteUrl(path)
  const image = absoluteUrl(`${path}/image`)
  const publishedTime = article ? articleIsoDate(article.publishedAt) : undefined

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    robots: "index, follow, max-image-preview:large",
    keywords: article?.tags,
    openGraph: {
      title,
      description,
      url,
      siteName: "FreeJobData",
      type: "article",
      publishedTime,
      modifiedTime: publishedTime,
      authors: article ? [article.author] : undefined,
      section: article?.industry,
      tags: article?.tags,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = findCommunityArticle(slug)

  if (!article) {
    notFound()
  }

  const paragraphs = article.body?.length ? article.body : [article.summary]
  const publishedIso = articleIsoDate(article.publishedAt)
  const articleUrl = absoluteUrl(`/news/${article.id}`)
  const imageUrl = absoluteUrl(`/news/${article.id}/image`)
  const articleText = paragraphs.join(" ")
  const wordCount = articleText.split(/\s+/).filter(Boolean).length

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "@id": `${articleUrl}#article`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": articleUrl
            },
            headline: article.title,
            description: article.summary,
            image: [imageUrl],
            datePublished: publishedIso,
            dateModified: publishedIso,
            url: articleUrl,
            articleSection: article.industry,
            articleBody: articleText,
            keywords: article.tags,
            inLanguage: "en-US",
            wordCount,
            isAccessibleForFree: true,
            author: {
              "@type": "Organization",
              name: article.author,
              url: absoluteUrl("/about")
            },
            publisher: {
              "@type": "Organization",
              name: "FreeJobData",
              url: siteUrl
            },
            citation: article.sources?.map((source) => ({
              "@type": "CreativeWork",
              name: source.label,
              url: source.href
            }))
          })
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: article.title, path: `/news/${article.id}` }
        ]}
      />
      <section className="hero">
        <p className="eyebrow">News / {article.author}</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.summary}</p>
        <div className="pill-row">
          <time className="pill" dateTime={publishedIso}>
            Published {article.publishedAt}
          </time>
          <span className="pill">{article.factuality}</span>
          <span className="pill">{article.confidence}% confidence</span>
        </div>
      </section>
      <article className="section card news-article-body">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {article.sources?.length ? (
          <section className="news-source-list" aria-labelledby="news-sources">
            <h2 id="news-sources">Sources</h2>
            <ol>
              {article.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href}>{source.label}</a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </article>
      <section className="section">
        <Link className="button secondary" href="/news">
          Back to news
        </Link>
      </section>
    </>
  )
}
