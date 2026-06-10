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

type Filter = "all" | CommunityArticleType
type CommunityMode = "news" | "maps" | "sp500" | "reddit" | "settings"

function sourceLabel(type: CommunityArticleType) {
  return type === "team" ? "FreeJobData Team" : "Community Intel"
}

function roleCopy(role: CommunityRole) {
  return role === "team" ? "FreeJobData Team publisher" : "Community contributor"
}

export function CommunityHub() {
  const [mode, setMode] = useState<CommunityMode>("news")
  const [filter, setFilter] = useState<Filter>("all")
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<CommunityRole>("community")
  const firebaseConfigured = hasFirebaseConfig()
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const auth = useMemo(() => getFirebaseAuth(), [])

  useEffect(() => {
    if (!auth) {
      return
    }

    return onAuthStateChanged(auth, async (nextUser) => {
      try {
        setUser(nextUser)
        if (nextUser) {
          const token = await nextUser.getIdTokenResult()
          setRole(roleFromClaims(token.claims))
        } else {
          setRole("community")
        }
        setAuthError(null)
      } catch {
        setRole("community")
        setAuthError("Signed in, but we could not read your community role yet.")
      }
    })
  }, [auth])

  const articles = useMemo(
    () => communityArticles.filter((article) => filter === "all" || article.type === filter),
    [filter]
  )
  const breakdown = communityArticleBreakdown(communityArticles)

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
              <h2>{breakdown.total} Articles</h2>
              <div className="community-tabs">
                {[
                  ["all", "All", breakdown.total],
                  ["team", "Team", breakdown.team],
                  ["community", "Community", breakdown.community]
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
              {articles.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          </div>
          <aside className="community-detail-panel">
            <CoverageDetails breakdown={breakdown} />
            <SignalDistribution articles={communityArticles} />
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

function ArticleCard({ article }: { article: CommunityArticle }) {
  return (
    <article className="community-article-card">
      <div className="article-source-row">
        <span className={`article-avatar ${article.type}`}>{article.type === "team" ? "FJ" : "OS"}</span>
        <strong>{article.author}</strong>
        <span className="muted">· {article.location}</span>
      </div>
      <div className="article-badge-row">
        <span className={`intel-badge ${article.type}`}>{sourceLabel(article.type)}</span>
        <span className="intel-badge dark">{article.factuality}</span>
        <span className="intel-badge light">{article.confidence}% confidence</span>
      </div>
      <h3>
        {article.body?.length ? <Link href={`/news/${article.id}`}>{article.title}</Link> : article.title}
      </h3>
      <p>{article.summary}</p>
      <div className="article-meta-row">
        <span>{article.publishedAt}</span>
        <span>{article.role}</span>
        <span>{article.sources?.length ? `${article.sourceCount} cited sources` : `${article.sourceCount} corroborating postings`}</span>
        {article.body?.length ? (
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

function CoverageDetails({ breakdown }: { breakdown: ReturnType<typeof communityArticleBreakdown> }) {
  return (
    <section className="community-side-card">
      <h3>Coverage Details</h3>
      <dl>
        <dt>Total Intelligence Briefs</dt>
        <dd>{breakdown.total}</dd>
        <dt>FreeJobData Team</dt>
        <dd>{breakdown.team}</dd>
        <dt>Community</dt>
        <dd>{breakdown.community}</dd>
        <dt>High-Signal Briefs</dt>
        <dd>{breakdown.highSignal}</dd>
        <dt>Avg. Confidence</dt>
        <dd>{breakdown.averageConfidence}%</dd>
      </dl>
    </section>
  )
}

function SignalDistribution({ articles }: { articles: CommunityArticle[] }) {
  const teamWidth = Math.round((articles.filter((article) => article.type === "team").length / articles.length) * 100)
  const communityWidth = 100 - teamWidth

  return (
    <section className="community-side-card">
      <h3>Source Distribution ↗</h3>
      <p>Signals blend automated JobDataPool analysis with human OSINT review.</p>
      <div className="distribution-bar" aria-label="Article source distribution">
        <span style={{ width: `${teamWidth}%` }}>Team {teamWidth}%</span>
        <span style={{ width: `${communityWidth}%` }}>Community {communityWidth}%</span>
      </div>
      <div className="source-columns">
        {articles.slice(0, 5).map((article) => (
          <span className={`source-token ${article.type}`} key={article.id}>
            {article.type === "team" ? "FJD" : article.author.slice(0, 2).toUpperCase()}
          </span>
        ))}
      </div>
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
