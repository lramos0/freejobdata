"use client"

import { useMemo, useState } from "react"

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

const sampleTerms = [
  "software engineer layoffs",
  "remote RTO mandate",
  "salary negotiation",
  "nursing hiring",
  "new grad offers"
]

function signalLabel(insights: InsightResponse) {
  const query = `${insights.query} ${insights.keywords.join(" ")}`.toLowerCase()

  if (/\b(layoff|layoffs|freeze|rescinded|cut|cuts|recession)\b/.test(query)) return "Risk watch"
  if (/\b(remote|hybrid|onsite|rto|office)\b/.test(query)) return "Policy watch"
  if (/\b(salary|pay|comp|offer|negotiation|bonus)\b/.test(query)) return "Compensation watch"
  if (/\b(interview|recruiter|ghosted|resume|application)\b/.test(query)) return "Process watch"
  if (insights.sentiment.label === "negative") return "Friction watch"
  if (insights.sentiment.label === "positive") return "Demand watch"

  return "Market watch"
}

function analystRead(insights: InsightResponse) {
  const label = signalLabel(insights)
  const fallbackOnly = insights.posts.every((post) => post.fallback)
  const communityCount = insights.subreddits.length
  const discussionCount = insights.posts.length

  if (!insights.jobRelated) {
    return "This term is adjacent to the labor market, but the query is broad. Treat the subreddit list as discovery terrain and tighten the term around a role, employer, policy, or hiring event."
  }

  if (fallbackOnly) {
    return `${label}: Reddit did not return strong live discussion matches, so this is best used as a subreddit discovery pass across ${communityCount} communities before you make a market claim.`
  }

  if (insights.sentiment.label === "negative") {
    return `${label}: candidate-side chatter is skewing negative across ${discussionCount} discussions. Open the highest-comment threads first and look for repeated complaints, not one-off stories.`
  }

  if (insights.sentiment.label === "positive") {
    return `${label}: Reddit chatter is skewing positive. Use the threads to identify where candidates are seeing openings, offers, recruiter activity, or improving conditions.`
  }

  return `${label}: the signal is mixed. Use Reddit as a lead generator here: compare thread volume, subreddit fit, and recurring keywords before treating it as job-market evidence.`
}

function confidenceLabel(confidence?: number) {
  if (typeof confidence !== "number") return "Model only"
  if (confidence >= 0.7) return "High"
  if (confidence >= 0.4) return "Medium"
  return "Low"
}

function formatCompactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return value.toLocaleString()
}

export function RedditInsights() {
  const [term, setTerm] = useState("software engineer jobs")
  const [insights, setInsights] = useState<InsightResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const derived = useMemo(() => {
    if (!insights) return null

    const liveSubreddits = insights.subreddits.filter((subreddit) => !subreddit.fallback && subreddit.subscribers > 0)
    const totalSubscribers = liveSubreddits.reduce((sum, subreddit) => sum + subreddit.subscribers, 0)
    const totalComments = insights.posts.reduce((sum, post) => sum + post.comments, 0)
    const totalScore = insights.posts.reduce((sum, post) => sum + post.score, 0)
    const livePostCount = insights.posts.filter((post) => !post.fallback).length
    const sentimentPercent = Math.round(((insights.sentiment.score + 1) / 2) * 100)

    return {
      analystRead: analystRead(insights),
      confidence: confidenceLabel(insights.sentiment.confidence),
      livePostCount,
      signalLabel: signalLabel(insights),
      sentimentPercent: Math.max(0, Math.min(100, sentimentPercent)),
      totalComments,
      totalScore,
      totalSubscribers
    }
  }, [insights])

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
          <p className="eyebrow">Reddit OSINT</p>
          <h2>Find job-market weak signals in Reddit chatter.</h2>
          <p className="lede">
            Search a role, employer, policy, or salary phrase. FreeJobData turns the result into a watchlist: signal
            type, useful communities, discussion leads, and keywords to compare against JobDataPool postings.
          </p>
        </div>
        <div className="reddit-insights-search">
          <label htmlFor="redditInsightTerm">OSINT query</label>
          <div className="reddit-search-row">
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
              {loading ? "Analyzing..." : "Analyze"}
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

      {insights && derived ? (
        <div className="reddit-osint-results">
          <section className="reddit-osint-strip" aria-label="Reddit OSINT summary">
            <article>
              <span>Signal</span>
              <strong>{derived.signalLabel}</strong>
            </article>
            <article>
              <span>Live threads</span>
              <strong>
                {derived.livePostCount}/{insights.posts.length}
              </strong>
            </article>
            <article>
              <span>Thread comments</span>
              <strong>{formatCompactNumber(derived.totalComments)}</strong>
            </article>
            <article>
              <span>Community reach</span>
              <strong>{derived.totalSubscribers ? formatCompactNumber(derived.totalSubscribers) : "Curated"}</strong>
            </article>
          </section>

          <div className="reddit-insights-grid">
            <article className="community-side-card reddit-analysis-card reddit-span">
              <div className="reddit-card-heading">
                <span className="pill">{insights.jobRelated ? "Job-market query" : "Needs narrowing"}</span>
                <span className={`reddit-sentiment-tag sentiment-${insights.sentiment.label.toLowerCase()}`}>
                  {insights.sentiment.label}
                </span>
              </div>
              <h3>Analyst read</h3>
              <p>{derived.analystRead}</p>
              <div className="reddit-sentiment-meter" aria-label="Reddit sentiment score">
                <span style={{ width: `${derived.sentimentPercent}%` }} />
              </div>
              <dl>
                <dt>Score</dt>
                <dd>{insights.sentiment.score.toFixed(2)}</dd>
                <dt>Magnitude</dt>
                <dd>{insights.sentiment.magnitude.toFixed(2)}</dd>
                <dt>Confidence</dt>
                <dd>{derived.confidence}</dd>
                <dt>Source</dt>
                <dd>{insights.sentiment.source}</dd>
              </dl>
            </article>

            <article className="community-side-card">
              <h3>OSINT angles</h3>
              <div className="reddit-angle-list">
                <span>Compare the loudest threads against active postings.</span>
                <span>Look for repeated employer names, locations, salary bands, or role families.</span>
                <span>Prefer high-comment discussions over isolated high-score posts.</span>
              </div>
            </article>

            <article className="community-side-card">
              <h3>Extracted keywords</h3>
              <div className="pill-row">
                {insights.keywords.map((keyword) => (
                  <span className="pill" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
              {insights.sentiment.evidence?.length ? (
                <div className="sentiment-evidence">
                  {insights.sentiment.evidence.slice(0, 6).map((item) => (
                    <span className="pill" key={`${item.token}-${item.type}`}>
                      {item.token} {item.weight > 0 ? "+" : ""}
                      {item.weight.toFixed(1)}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>

            <article className="community-side-card reddit-span">
              <div className="reddit-card-heading">
                <h3>Subreddit watchlist</h3>
                <span className="muted">{insights.subreddits.length} communities</span>
              </div>
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
              <div className="reddit-card-heading">
                <h3>Discussion leads</h3>
                <span className="muted">
                  {formatCompactNumber(derived.totalScore)} score / {formatCompactNumber(derived.totalComments)} comments
                </span>
              </div>
              <div className="reddit-post-links">
                {insights.posts.map((post) => (
                  <a href={post.url} key={`${post.subreddit}-${post.title}`} target="_blank" rel="noopener noreferrer">
                    <span className="pill">r/{post.subreddit}</span>
                    <strong>{post.title}</strong>
                    <small>
                      {post.fallback
                        ? "live subreddit search"
                        : `${post.score.toLocaleString()} score / ${post.comments.toLocaleString()} comments`}
                    </small>
                  </a>
                ))}
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="reddit-insights-empty">
          <strong>Use Reddit as a weak-signal radar for job-market OSINT.</strong>
          <span>
            Start with a role, employer, policy, salary phrase, or hiring event, then compare Reddit leads against
            JobDataPool posting data.
          </span>
          <div className="reddit-angle-list">
            <span>Layoffs and freezes: watch for repeated employer names and rescinded-offer stories.</span>
            <span>Compensation: look for salary bands, offer negotiation patterns, and underpayment complaints.</span>
            <span>Remote policy: track RTO mandates, relocation pressure, and hybrid exceptions.</span>
          </div>
        </div>
      )}
    </section>
  )
}
