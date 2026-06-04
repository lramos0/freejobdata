"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import type { User } from "firebase/auth"
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import {
  communityArticleBreakdown,
  communityArticles,
  type CommunityArticle,
  type CommunityArticleType,
  type IntelligenceView
} from "@/lib/community-data"
import { getFirebaseAuth, hasFirebaseConfig, roleFromClaims, type CommunityRole } from "@/lib/firebase"

const CommunityMap = dynamic(() => import("./CommunityMap").then((module) => module.CommunityMap), {
  ssr: false,
  loading: () => <div className="community-map-loading">Loading Deck.gl intelligence map…</div>
})

type Filter = "all" | CommunityArticleType

function sourceLabel(type: CommunityArticleType) {
  return type === "team" ? "FreeJobData Team" : "Community Intel"
}

function roleCopy(role: CommunityRole) {
  return role === "team" ? "FreeJobData Team publisher" : "Community contributor"
}

export function CommunityHub() {
  const [view, setView] = useState<IntelligenceView>("default")
  const [filter, setFilter] = useState<Filter>("all")
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<CommunityRole>("community")
  const firebaseConfigured = hasFirebaseConfig()
  const [authReady, setAuthReady] = useState(!firebaseConfigured)
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
      } finally {
        setAuthReady(true)
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
      <section className="community-hero">
        <div>
          <p className="eyebrow">Open source job intelligence</p>
          <h1>Community-powered signals from the JobDataPool graph.</h1>
          <p className="lede">
            Read automated FreeJobData Team briefings, submit community observations, and inspect the geography of
            job posting locations as an OSINT-style hiring map.
          </p>
        </div>
        <div className="community-auth-card">
          <span className="pill">{authReady ? roleCopy(role) : "Checking auth…"}</span>
          <h3>{user ? user.displayName ?? user.email : "Join the intelligence desk"}</h3>
          <p className="muted">
            Firebase Auth separates FreeJobData Team publishers from community contributors through ID-token custom
            claims.
          </p>
          <div className="pill-row">
            {user ? (
              <button className="button secondary" type="button" onClick={handleSignOut} disabled={authBusy}>
                {authBusy ? "Signing outâ€¦" : "Sign out"}
              </button>
            ) : (
              <button className="button" type="button" onClick={handleSignIn} disabled={authBusy}>
                {authBusy ? "Opening Googleâ€¦" : "Sign in with Google"}
              </button>
            )}
          </div>
          {!firebaseConfigured ? (
            <small className="auth-warning">Firebase env vars are not configured yet; community mode is preview-only.</small>
          ) : null}
          {authError ? <small className="auth-warning">{authError}</small> : null}
        </div>
      </section>

      <div className="community-view-switch" role="tablist" aria-label="Community views">
        {(["default", "map"] as IntelligenceView[]).map((nextView) => (
          <button
            aria-selected={view === nextView}
            className={view === nextView ? "active" : ""}
            key={nextView}
            onClick={() => setView(nextView)}
            role="tab"
            type="button"
          >
            {nextView}
          </button>
        ))}
      </div>

      {view === "map" ? (
        <CommunityMap />
      ) : (
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
      )}
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
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <div className="article-meta-row">
        <span>{article.publishedAt}</span>
        <span>{article.role}</span>
        <span>{article.sourceCount} corroborating postings</span>
        <a href="https://jobdatapool.com/api">Open source data</a>
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

