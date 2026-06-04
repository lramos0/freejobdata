"use client"

import { useState } from "react"

type InsightResponse = {
  ok: boolean
  query: string
  normalizedQuery: string
  jobRelated: boolean
  sentiment: {
    score: number
    magnitude: number
    label: string
    source: string
    confidence?: number
    evidence?: {
      token: string
      weight: number
      type: string
    }[]
  }
  keywords: string[]
  subreddits: {
    name: string
    title: string
    subscribers: number
    url: string
    publicDescription: string
    fallback?: boolean
  }[]
  posts: {
    subreddit: string
    title: string
    score: number
    comments: number
    url: string
    fallback?: boolean
  }[]
  error?: string
}

const sampleTerms = ["software engineer layoffs", "remote jobs", "data analyst interview", "nursing jobs"]

export function RedditInsights() {
  const [term, setTerm] = useState("software engineer jobs")
  const [insights, setInsights] = useState<InsightResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyze(nextTerm = term) {
    const cleanTerm = nextTerm.trim()
    if (!cleanTerm) {
      setError("Enter a term to analyze.")
      return
    }

    setTerm(cleanTerm)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/.netlify/functions/reddit-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: cleanTerm })
      })
      const data = (await response.json()) as InsightResponse
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Reddit insights failed.")
      }
      setInsights(data)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Reddit insights failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="reddit-insights-panel">
      <div className="reddit-insights-hero">
        <div>
          <p className="eyebrow">Reddit insights</p>
          <h2>Sentiment across job-adjacent subreddits.</h2>
          <p className="lede">
            Pass in a term. The backend extracts sentiment and keywords, checks whether the term is job-related, then
            searches Reddit for associated communities and discussions.
          </p>
        </div>
        <div className="reddit-insights-search">
          <label htmlFor="redditInsightTerm">Term</label>
          <div>
            <input
              id="redditInsightTerm"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  analyze()
                }
              }}
            />
            <button className="button" type="button" onClick={() => analyze()} disabled={loading}>
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
          <div className="pill-row">
            {sampleTerms.map((sampleTerm) => (
              <button className="insight-chip" type="button" key={sampleTerm} onClick={() => analyze(sampleTerm)}>
                {sampleTerm}
              </button>
            ))}
          </div>
          {error ? <small className="auth-warning">{error}</small> : null}
        </div>
      </div>

      {insights ? (
        <div className="reddit-insights-grid">
          <article className="community-side-card">
            <h3>Sentiment</h3>
            <span className={`sentiment-orb sentiment-${insights.sentiment.label.toLowerCase()}`}>
              {insights.sentiment.label}
            </span>
            <dl>
              <dt>Score</dt>
              <dd>{insights.sentiment.score.toFixed(2)}</dd>
              <dt>Magnitude</dt>
              <dd>{insights.sentiment.magnitude.toFixed(2)}</dd>
              {typeof insights.sentiment.confidence === "number" ? (
                <>
                  <dt>Confidence</dt>
                  <dd>{Math.round(insights.sentiment.confidence * 100)}%</dd>
                </>
              ) : null}
              <dt>Source</dt>
              <dd>{insights.sentiment.source}</dd>
              <dt>Job related</dt>
              <dd>{insights.jobRelated ? "Yes" : "Maybe"}</dd>
            </dl>
            {insights.sentiment.evidence?.length ? (
              <div className="sentiment-evidence">
                {insights.sentiment.evidence.slice(0, 5).map((item) => (
                  <span className="pill" key={`${item.token}-${item.type}`}>
                    {item.token} {item.weight > 0 ? "+" : ""}
                    {item.weight.toFixed(1)}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
          <article className="community-side-card">
            <h3>Keywords</h3>
            <div className="pill-row">
              {insights.keywords.map((keyword) => (
                <span className="pill" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>
          </article>
          <article className="community-side-card reddit-span">
            <h3>Associated subreddits</h3>
            <div className="subreddit-list">
              {insights.subreddits.map((subreddit) => (
                <a href={subreddit.url} key={subreddit.name} target="_blank" rel="noopener noreferrer">
                  <strong>r/{subreddit.name}</strong>
                  <span>
                    {subreddit.fallback || subreddit.subscribers === 0
                      ? "curated community"
                      : `${subreddit.subscribers.toLocaleString()} subscribers`}
                  </span>
                  <small>{subreddit.publicDescription || subreddit.title}</small>
                </a>
              ))}
            </div>
          </article>
          <article className="community-side-card reddit-span">
            <h3>Top discussions</h3>
            <div className="reddit-post-links">
              {insights.posts.map((post) => (
                <a href={post.url} key={`${post.subreddit}-${post.title}`} target="_blank" rel="noopener noreferrer">
                  <span className="pill">r/{post.subreddit}</span>
                  <strong>{post.title}</strong>
                  <small>
                    {post.fallback
                      ? "live subreddit search"
                      : `${post.score.toLocaleString()} score · ${post.comments.toLocaleString()} comments`}
                  </small>
                </a>
              ))}
            </div>
          </article>
        </div>
      ) : (
        <div className="reddit-insights-empty">
          <strong>Try a term to light up the Reddit graph.</strong>
          <span>Examples: “remote jobs”, “nursing jobs”, “software engineer layoffs”.</span>
        </div>
      )}
    </section>
  )
}
