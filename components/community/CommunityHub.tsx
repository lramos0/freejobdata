"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { User } from "firebase/auth"
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import {
  communityArticleBreakdown,
  communityArticles,
  type CommunityArticle,
  type CommunityArticleType
} from "@/lib/community-data"
import { getFirebaseAuth, hasFirebaseConfig, roleFromClaims, type CommunityRole } from "@/lib/firebase"
import { CommunityMap } from "./CommunityMap"
import { RedditInsights } from "./RedditInsights"
import { Sp500JobsForum } from "./Sp500JobsForum"

type Filter = "all" | CommunityArticleType | "external"
type CommunityMode = "news" | "maps" | "sp500" | "reddit" | "settings"
type CommunityFeedArticle = CommunityArticle & {
  externalUrl?: string
  sourceName?: string
  sourceUrl?: string
}
type JobMarketNewsResponse = {
  ok: boolean
  articles?: CommunityFeedArticle[]
  error?: string
  cache?: string
  diagnostics?: {
    fetchedItems?: number
    rankedItems?: number
    selectedItems?: number
    droppedByScoreOrWindow?: number
    sourceDiagnostics?: { source: string; fetched: number; failed: boolean; error?: string }[]
  }
}

function sourceLabel(type: CommunityArticleType) {
  return type === "team" ? "FreeJobData Team" : "Community Intel"
}

function roleCopy(role: CommunityRole) {
  return role === "team" ? "FreeJobData Team publisher" : "Community contributor"
}

function feedArticleBreakdown(articles: CommunityFeedArticle[]) {
  const team = articles.filter((article) => article.type === "team").length
  const external = articles.filter((article) => article.externalUrl).length
  const community = articles.length - team - external
  const highSignal = articles.filter((article) => article.factuality === "High Signal").length

  return {
    total: articles.length,
    team,
    community,
    external,
    highSignal,
    averageConfidence: Math.round(
      articles.reduce((sum, article) => sum + article.confidence, 0) / Math.max(articles.length, 1)
    )
  }
}

const positiveTerms = [
  "added",
  "beat",
  "booming",
  "drop in unemployment",
  "gains",
  "growth",
  "hiring",
  "increase",
  "jobs growth",
  "resilient",
  "rose",
  "strong",
  "wage gains"
]

const negativeTerms = [
  "cuts",
  "decline",
  "downturn",
  "fell",
  "freeze",
  "jobless claims",
  "layoff",
  "layoffs",
  "recession",
  "sinks",
  "slows",
  "slump",
  "unemployment",
  "weak"
]

function sentimentForArticle(article: CommunityFeedArticle) {
  const text = `${article.title} ${article.summary} ${article.tags.join(" ")}`.toLowerCase()
  const positive = positiveTerms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0)
  const negative = negativeTerms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0)

  if (positive > negative) return "positive"
  if (negative > positive) return "negative"
  return "neutral"
}

function sentimentBreakdown(articles: CommunityFeedArticle[]) {
  const counts = articles.reduce(
    (result, article) => {
      result[sentimentForArticle(article)] += 1
      return result
    },
    { positive: 0, negative: 0, neutral: 0 }
  )
  const directionalTotal = counts.positive + counts.negative

  return {
    ...counts,
    positiveShare: directionalTotal ? Math.round((counts.positive / directionalTotal) * 100) : 50,
    negativeShare: directionalTotal ? Math.round((counts.negative / directionalTotal) * 100) : 50
  }
}

export function CommunityHub() {
  const [mode, setMode] = useState<CommunityMode>("news")
  const [filter, setFilter] = useState<Filter>("all")
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<CommunityRole>("community")
  const firebaseConfigured = hasFirebaseConfig()
  const [authReady, setAuthReady] = useState(!firebaseConfigured)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [externalArticles, setExternalArticles] = useState<CommunityFeedArticle[]>([])
  const [externalArticlesLoading, setExternalArticlesLoading] = useState(false)
  const [externalArticlesError, setExternalArticlesError] = useState<string | null>(null)
  const [externalArticlesDiagnostics, setExternalArticlesDiagnostics] = useState<JobMarketNewsResponse["diagnostics"] | null>(null)
  const [externalArticlesRefreshKey, setExternalArticlesRefreshKey] = useState(0)
  const auth = useMemo(() => getFirebaseAuth(), [])
  const teamArticles = useMemo<CommunityFeedArticle[]>(
    () => communityArticles.filter((article) => article.type === "team"),
    []
  )

  useEffect(() => {
    if (!auth) {
      return
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      try {
        setUser(nextUser)
        if (nextUser) {
          setFilter("all")
          const token = await nextUser.getIdTokenResult()
          setRole(roleFromClaims(token.claims))
        } else {
          setRole("community")
          setExternalArticles([])
          setExternalArticlesError(null)
          setExternalArticlesDiagnostics(null)
          setExternalArticlesLoading(false)
        }
        setAuthError(null)
      } catch {
        setRole("community")
        setAuthError("Signed in, but we could not read your community role yet.")
      } finally {
        setAuthReady(true)
      }
    })
  }, [auth])

  useEffect(() => {
    const currentUser = user
    if (!currentUser) {
      return
    }

    const controller = new AbortController()

    async function loadExternalArticles(activeUser: User) {
      setExternalArticlesLoading(true)
      setExternalArticlesError(null)

      try {
        const params = new URLSearchParams({
          source: "all",
          limit: "6",
          days: "21"
        })
        if (externalArticlesRefreshKey > 0) {
          params.set("refresh", "1")
        }
        const token = await activeUser.getIdToken(true)
        const response = await fetch(`/.netlify/functions/job-market-news?${params.toString()}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: "omit",
          signal: controller.signal
        })
        const contentType = response.headers.get("content-type") || ""
        const data = contentType.includes("application/json")
          ? ((await response.json()) as JobMarketNewsResponse)
          : ({ ok: false, error: await response.text() } as JobMarketNewsResponse)

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Job market news failed.")
        }

        setExternalArticles(data.articles || [])
        setExternalArticlesDiagnostics(data.diagnostics || null)
        if (!data.articles?.length) {
          const fetched = data.diagnostics?.fetchedItems ?? 0
          const ranked = data.diagnostics?.rankedItems ?? 0
          setExternalArticlesError(
            fetched
              ? `No matching external headlines passed the job-market filters (${ranked} ranked from ${fetched} fetched).`
              : "No external headlines were returned by the configured sources."
          )
        }
      } catch (nextError) {
        if (controller.signal.aborted) return
        setExternalArticlesDiagnostics(null)
        setExternalArticlesError(nextError instanceof Error ? nextError.message : "Job market news failed.")
      } finally {
        if (!controller.signal.aborted) {
          setExternalArticlesLoading(false)
        }
      }
    }

    loadExternalArticles(currentUser)

    return () => controller.abort()
  }, [externalArticlesRefreshKey, user])

  const signedInArticles = useMemo<CommunityFeedArticle[]>(
    () =>
      user
        ? [...externalArticles, ...communityArticles].sort((first, second) =>
            second.publishedAt.localeCompare(first.publishedAt)
          )
        : teamArticles,
    [externalArticles, teamArticles, user]
  )
  const articles = useMemo(
    () => {
      if (filter === "all") return signedInArticles
      if (filter === "external") return signedInArticles.filter((article) => Boolean(article.externalUrl))
      return signedInArticles.filter((article) => article.type === filter && !article.externalUrl)
    },
    [filter, signedInArticles]
  )
  const breakdown = feedArticleBreakdown(signedInArticles)
  const totalArticleCount = signedInArticles.length
  const visibleBreakdown = feedArticleBreakdown(articles)
  const visibleSentiment = sentimentBreakdown(articles)

  async function handleSignIn() {
    if (!auth) {
      setAuthError("Add Firebase public env vars to enable Google sign-in.")
      return
    }

    setAuthError(null)
    setAuthBusy(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdTokenResult(true)
      setRole(roleFromClaims(token.claims))
    } catch {
      setAuthError("Google sign-in did not complete. Try again from this authorized domain.")
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleSignOut() {
    if (!auth) {
      return
    }

    setAuthError(null)
    setAuthBusy(true)

    try {
      await signOut(auth)
    } catch {
      setAuthError("Sign-out failed. Please refresh and try again.")
    } finally {
      setAuthBusy(false)
    }
  }

  return (
    <div className="community-page">
      <div className="community-view-switch community-mode-switch" role="tablist" aria-label="Community sections">
        {[
          ["news", "news", "FreeJobData and community articles"],
          ["maps", "maps", "Deck.gl job posting location layer"],
          ["sp500", "S&P 500 Jobs (s/)", "Company forum tiles"],
          ["reddit", "reddit insights (r/)", "Subreddit sentiment analysis"],
          ["settings", "user settings (u/)", "Profile, auth, and community preferences"]
        ].map(([nextMode, label, description]) => (
          <button
            aria-selected={mode === nextMode}
            className={mode === nextMode ? "active" : ""}
            key={nextMode}
            onClick={() => setMode(nextMode as CommunityMode)}
            role="tab"
            title={description}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "news" ? (
        <section className="community-intel-layout">
          <div className="community-feed-panel">
            <div className="community-feed-header">
              <h2>{totalArticleCount} Articles</h2>
              <div className="community-tabs">
                {[
                  ["all", "All", totalArticleCount],
                  ["team", "Team", breakdown.team],
                  ["community", "Community", breakdown.community],
                  ["external", "External", breakdown.external]
                ].map(([nextFilter, label, count]) => (
                  <button
                    className={filter === nextFilter ? "active" : ""}
                    key={nextFilter}
                    onClick={() => setFilter(nextFilter as Filter)}
                    type="button"
                  >
                    {label} <span>{count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="community-filter-bar">
              <button type="button">Most Recent ▾</button>
              <button type="button">All Signals ▾</button>
              <button type="button">Job Posting Locations ▾</button>
              <label>
                <input type="checkbox" /> Hide low-confidence signals
              </label>
            </div>
            <div className="community-article-list">
              {!authReady ? (
                <div className="community-feed-status">Checking your community session...</div>
              ) : null}
              {authReady && !user ? (
                <div className="community-feed-status">
                  Sign in to view community articles and current job-market headlines.{" "}
                  <button className="button secondary" type="button" onClick={handleSignIn} disabled={authBusy}>
                    {authBusy ? "Opening Google..." : "Sign in with Google"}
                  </button>
                </div>
              ) : null}
              {user && (filter === "all" || filter === "external") && externalArticlesLoading ? (
                <div className="community-feed-status">Loading current job-market headlines...</div>
              ) : null}
              {user && (filter === "all" || filter === "external") && externalArticlesError ? (
                <div className="community-feed-status warning">
                  {externalArticlesError}{" "}
                  <button
                    className="button secondary"
                    disabled={externalArticlesLoading}
                    onClick={() => setExternalArticlesRefreshKey((key) => key + 1)}
                    type="button"
                  >
                    Retry headlines
                  </button>
                </div>
              ) : null}
              {user && (filter === "all" || filter === "external") && externalArticlesDiagnostics ? (
                <div className="community-feed-status">
                  External headline check: {externalArticlesDiagnostics.selectedItems ?? externalArticles.length} selected from{" "}
                  {externalArticlesDiagnostics.fetchedItems ?? 0} fetched.
                </div>
              ) : null}
              {articles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          </div>
          <aside className="community-detail-panel">
            <CoverageDetails breakdown={visibleBreakdown} />
            <SignalDistribution articles={articles} />
            <SentimentGauge sentiment={visibleSentiment} />
            <ContributorComposer role={role} signedIn={Boolean(user)} />
          </aside>
        </section>
      ) : null}

      {mode === "sp500" ? <Sp500JobsForum /> : null}

      {mode === "reddit" ? <RedditInsights /> : null}

      {mode === "maps" ? (
        <section className="community-map-mode">
          <CommunityMap />
        </section>
      ) : null}

      {mode === "settings" ? (
        <UserSettingsPanel
          authBusy={authBusy}
          authError={authError}
          firebaseConfigured={firebaseConfigured}
          handleSignIn={handleSignIn}
          handleSignOut={handleSignOut}
          role={role}
          user={user}
        />
      ) : null}
    </div>
  )
}

function ArticleCard({ article }: { article: CommunityFeedArticle }) {
  const isExternalArticle = Boolean(article.externalUrl)
  const sourceName = article.sourceName || article.author

  return (
    <article className="community-article-card">
      <div className="article-source-row">
        <span className={`article-avatar ${article.type}`}>{article.type === "team" ? "FJ" : "OS"}</span>
        <strong>{article.author}</strong>
        <span className="muted">· {article.location}</span>
      </div>
      <div className="article-badge-row">
        <span className={`intel-badge ${article.type}`}>{isExternalArticle ? sourceName : sourceLabel(article.type)}</span>
        <span className="intel-badge dark">{article.factuality}</span>
        <span className="intel-badge light">{article.confidence}% {isExternalArticle ? "match" : "confidence"}</span>
      </div>
      <h3>
        {isExternalArticle ? (
          <a href={article.externalUrl} target="_blank" rel="nofollow noopener noreferrer">
            {article.title}
          </a>
        ) : article.body?.length ? (
          <Link href={`/news/${article.id}`}>{article.title}</Link>
        ) : (
          article.title
        )}
      </h3>
      <p>{article.summary}</p>
      <div className="article-meta-row">
        <span>{article.publishedAt}</span>
        <span>{article.role}</span>
        <span>{article.sources?.length ? `${article.sourceCount} cited sources` : `${article.sourceCount} corroborating postings`}</span>
        {isExternalArticle ? (
          <a href={article.externalUrl} target="_blank" rel="nofollow noopener noreferrer">
            Read source
          </a>
        ) : article.body?.length ? (
          <Link href={`/news/${article.id}`}>Read article</Link>
        ) : (
          <a href="https://jobdatapool.com/#api">Open source data</a>
        )}
      </div>
      <div className="pill-row">
        {article.tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

function CoverageDetails({ breakdown }: { breakdown: ReturnType<typeof feedArticleBreakdown> }) {
  return (
    <section className="community-side-card">
      <h3>Coverage Details</h3>
      <dl>
        <dt>Visible Briefs</dt>
        <dd>{breakdown.total}</dd>
        <dt>FreeJobData Team</dt>
        <dd>{breakdown.team}</dd>
        <dt>Community</dt>
        <dd>{breakdown.community}</dd>
        <dt>External Sources</dt>
        <dd>{breakdown.external}</dd>
        <dt>High-Signal Briefs</dt>
        <dd>{breakdown.highSignal}</dd>
        <dt>Avg. Confidence</dt>
        <dd>{breakdown.averageConfidence}%</dd>
      </dl>
    </section>
  )
}

function SignalDistribution({ articles }: { articles: CommunityFeedArticle[] }) {
  const total = Math.max(articles.length, 1)
  const teamWidth = Math.round((articles.filter((article) => article.type === "team").length / total) * 100)
  const externalWidth = Math.round((articles.filter((article) => article.externalUrl).length / total) * 100)
  const communityWidth = Math.max(0, 100 - teamWidth - externalWidth)

  return (
    <section className="community-side-card">
      <h3>Source Distribution ↗</h3>
      <p>Signals blend FreeJobData analysis, reviewed community intel, and signed-in source headlines.</p>
      <div className="distribution-bar" aria-label="Article source distribution">
        {teamWidth ? <span className="team" style={{ width: `${teamWidth}%` }}>Team {teamWidth}%</span> : null}
        {communityWidth ? (
          <span className="community" style={{ width: `${communityWidth}%` }}>Community {communityWidth}%</span>
        ) : null}
        {externalWidth ? (
          <span className="external" style={{ width: `${externalWidth}%` }}>External {externalWidth}%</span>
        ) : null}
      </div>
      <div className="source-columns">
        {articles.slice(0, 5).map((article) => (
          <span className={`source-token ${article.type}`} key={article.id}>
            {article.externalUrl ? article.author.slice(0, 2).toUpperCase() : article.type === "team" ? "FJD" : article.author.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
    </section>
  )
}

function SentimentGauge({ sentiment }: { sentiment: ReturnType<typeof sentimentBreakdown> }) {
  return (
    <section className="community-side-card">
      <h3>Sentiment Gauge</h3>
      <p>Directional read from visible titles, summaries, and tags.</p>
      <div className="sentiment-gauge" aria-label="Positive versus negative job market sentiment">
        <span className="positive" style={{ width: `${sentiment.positiveShare}%` }}>
          Positive {sentiment.positiveShare}%
        </span>
        <span className="negative" style={{ width: `${sentiment.negativeShare}%` }}>
          Negative {sentiment.negativeShare}%
        </span>
      </div>
      <dl>
        <dt>Positive</dt>
        <dd>{sentiment.positive}</dd>
        <dt>Negative</dt>
        <dd>{sentiment.negative}</dd>
        <dt>Neutral</dt>
        <dd>{sentiment.neutral}</dd>
      </dl>
    </section>
  )
}

function ContributorComposer({ role, signedIn }: { role: CommunityRole; signedIn: boolean }) {
  return (
    <section className="community-side-card composer-card">
      <h3>{role === "team" ? "Publish Team Brief" : "Submit Community Intel"}</h3>
      <p>
        {role === "team"
          ? "Team accounts can publish automated or editorial FreeJobData Team articles."
          : "Community accounts can submit observations for review before publication."}
      </p>
      <input disabled={!signedIn} placeholder="Signal headline" />
      <textarea disabled={!signedIn} placeholder="What changed in the job posting data?" rows={4} />
      <button className="button" disabled={!signedIn} type="button">
        {signedIn ? "Submit draft" : "Sign in to submit"}
      </button>
    </section>
  )
}

function UserSettingsPanel({
  authBusy,
  authError,
  firebaseConfigured,
  handleSignIn,
  handleSignOut,
  role,
  user
}: {
  authBusy: boolean
  authError: string | null
  firebaseConfigured: boolean
  handleSignIn: () => Promise<void>
  handleSignOut: () => Promise<void>
  role: CommunityRole
  user: User | null
}) {
  const initials =
    user?.displayName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "U/"

  return (
    <section className="user-settings-panel">
      <div className="community-mode-hero settings-mode-hero">
        <div>
          <p className="eyebrow">u/ settings</p>
          <h2>Your FreeJobData community identity.</h2>
          <p className="lede">
            Control how your account participates across articles, company forums, Reddit insights, and map-based
            hiring intelligence.
          </p>
        </div>
        <span className="settings-avatar">{initials}</span>
      </div>

      <div className="settings-grid">
        <article className="community-side-card settings-profile-card">
          <span className="pill">{roleCopy(role)}</span>
          <h3>{user ? user.displayName ?? user.email : "Guest intelligence reader"}</h3>
          <p className="muted">
            {user
              ? "Your Firebase account is connected. Custom claims decide whether you publish as FreeJobData Team or as a community contributor."
              : "Sign in to unlock drafts, saved map filters, and forum participation."}
          </p>
          <dl>
            <dt>Status</dt>
            <dd>{user ? "Signed in" : "Preview"}</dd>
            <dt>Email</dt>
            <dd>{user?.email ?? "Not connected"}</dd>
            <dt>UID</dt>
            <dd>{user?.uid ? `${user.uid.slice(0, 8)}…` : "Local session"}</dd>
          </dl>
          <div className="pill-row">
            {user ? (
              <button className="button secondary" type="button" onClick={handleSignOut} disabled={authBusy}>
                {authBusy ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <button className="button" type="button" onClick={handleSignIn} disabled={authBusy}>
                {authBusy ? "Opening Google…" : "Sign in with Google"}
              </button>
            )}
          </div>
          {!firebaseConfigured ? (
            <small className="auth-warning">Firebase env vars are missing; settings are running in preview mode.</small>
          ) : null}
          {authError ? <small className="auth-warning">{authError}</small> : null}
        </article>

        <article className="community-side-card">
          <h3>Community defaults</h3>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked />
            <span>Prefer FreeJobData Team briefs first</span>
          </label>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked />
            <span>Show community-produced articles after review</span>
          </label>
          <label className="settings-toggle">
            <input type="checkbox" defaultChecked />
            <span>Remember map layer selections</span>
          </label>
          <label className="settings-toggle">
            <input type="checkbox" />
            <span>Compact S&P 500 forum cards</span>
          </label>
        </article>

        <article className="community-side-card">
          <h3>Signal subscriptions</h3>
          <div className="settings-chip-grid">
            {["remote spikes", "layoff risk", "salary bands", "new grad roles", "S&P 500 jobs", "map anomalies"].map(
              (item) => (
                <label className="settings-chip" key={item}>
                  <input type="checkbox" defaultChecked={item !== "layoff risk"} />
                  <span>{item}</span>
                </label>
              )
            )}
          </div>
        </article>

        <article className="community-side-card">
          <h3>Role permissions</h3>
          <ul className="settings-permission-list">
            <li>
              <strong>Read</strong>
              <span>Articles, maps, company forums, and Reddit insight outputs.</span>
            </li>
            <li>
              <strong>Submit</strong>
              <span>Community intel drafts and forum replies after sign-in.</span>
            </li>
            <li>
              <strong>Publish</strong>
              <span>{role === "team" ? "Enabled for team briefs." : "Requires FreeJobData Team custom claim."}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}
