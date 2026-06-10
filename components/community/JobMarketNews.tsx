"use client"

import { useEffect, useState } from "react"
import type { CommunityArticle } from "@/lib/community-data"

type ExternalJobMarketArticle = CommunityArticle & {
  externalUrl: string
  sourceName: string
  sourceUrl: string
}

type NewsResponse = {
  ok: boolean
  generatedAt: string
  articles: ExternalJobMarketArticle[]
  failures?: {
    source: string
    error: string
  }[]
  error?: string
}

type SourceFilter = "all" | "reuters" | "marketwatch"

const sourceFilters: { label: string; value: SourceFilter }[] = [
  { label: "All", value: "all" },
  { label: "Reuters", value: "reuters" },
  { label: "MarketWatch", value: "marketwatch" },
]

export function JobMarketNews({ signedIn }: { signedIn: boolean }) {
  const [source, setSource] = useState<SourceFilter>("all")
  const [articles, setArticles] = useState<ExternalJobMarketArticle[]>([])
  const [generatedAt, setGeneratedAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!signedIn) {
      return
    }

    const controller = new AbortController()

    async function loadNews() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          source,
          limit: "6",
          days: "21",
        })
        const response = await fetch(`/.netlify/functions/job-market-news?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = (await response.json()) as NewsResponse

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Job market news failed.")
        }

        setArticles(data.articles || [])
        setGeneratedAt(data.generatedAt)
      } catch (nextError) {
        if (controller.signal.aborted) return
        setError(nextError instanceof Error ? nextError.message : "Job market news failed.")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => controller.abort()
  }, [signedIn, source])

  if (!signedIn) {
    return null
  }

  return (
    <section className="job-market-news-panel" aria-labelledby="job-market-news-title">
      <div className="job-market-news-header">
        <div>
          <p className="eyebrow">Signed-in brief</p>
          <h3 id="job-market-news-title">External job market news</h3>
        </div>
        <div className="job-market-source-switch" aria-label="Filter job market news source">
          {sourceFilters.map((filter) => (
            <button
              aria-pressed={source === filter.value}
              className={source === filter.value ? "active" : ""}
              key={filter.value}
              onClick={() => setSource(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <small className="auth-warning">{error}</small> : null}
      {loading ? <small className="muted">Loading trusted labor-market headlines...</small> : null}

      <div className="job-market-news-list">
        {articles.map((article) => (
          <article className="job-market-news-card" key={`${article.sourceName}-${article.title}`}>
            <div className="article-badge-row">
              <span className="intel-badge community">{article.sourceName}</span>
              <span className="intel-badge dark">{article.factuality}</span>
              <span className="intel-badge light">{article.confidence}% match</span>
            </div>
            <h4>
              <a href={article.externalUrl} target="_blank" rel="nofollow noopener noreferrer">
                {article.title}
              </a>
            </h4>
            <p>{article.summary}</p>
            <div className="article-meta-row">
              <span>{article.publishedAt}</span>
              <span>{article.industry}</span>
              <a href={article.sourceUrl} target="_blank" rel="nofollow noopener noreferrer">
                Source
              </a>
            </div>
            <div className="pill-row">
              {article.tags.slice(0, 4).map((tag) => (
                <span className="pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {!loading && !articles.length && !error ? (
        <small className="muted">No matching labor-market headlines found in the current window.</small>
      ) : null}
      {generatedAt ? <small className="muted">Updated {new Date(generatedAt).toLocaleString()}</small> : null}
    </section>
  )
}
