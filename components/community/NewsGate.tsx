"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { User } from "firebase/auth"
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth"
import { editorialCommunityArticles } from "@/lib/community-data"
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase"

function articleIsoDate(date: string) {
  return date.includes("T") ? date : `${date}T09:00:00-07:00`
}

function useSignedInNews() {
  const firebaseConfigured = hasFirebaseConfig()
  const auth = useMemo(() => getFirebaseAuth(), [])
  const [authReady, setAuthReady] = useState(!firebaseConfigured)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!auth) return

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
      setAuthError(null)
    })
  }, [auth])

  async function handleSignIn() {
    if (!auth) {
      setAuthError("Add Firebase public env vars to enable Google sign-in.")
      return
    }

    setAuthBusy(true)
    setAuthError(null)

    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch {
      setAuthError("Google sign-in did not complete. Try again from this authorized domain.")
    } finally {
      setAuthBusy(false)
    }
  }

  return {
    authBusy,
    authError,
    authReady,
    handleSignIn,
    user
  }
}

function LockedNews({
  authBusy,
  authError,
  handleSignIn
}: {
  authBusy: boolean
  authError: string | null
  handleSignIn: () => Promise<void>
}) {
  return (
    <section className="section">
      <div className="community-feed-status">
        Sign in to view community articles and current job-market headlines.{" "}
        <button className="button secondary" type="button" onClick={handleSignIn} disabled={authBusy}>
          {authBusy ? "Opening Google..." : "Sign in with Google"}
        </button>
      </div>
      {authError ? <small className="auth-warning">{authError}</small> : null}
    </section>
  )
}

export function NewsIndexGate() {
  const { authBusy, authError, authReady, handleSignIn, user } = useSignedInNews()
  const teamArticles = useMemo(() => editorialCommunityArticles.filter((article) => article.type === "team"), [])
  const articles = user ? editorialCommunityArticles : teamArticles

  return (
    <>
      <section className="hero">
        <p className="eyebrow">News</p>
        <h1>Latest job market notes.</h1>
        <p className="lede">Short research updates, dataset announcements, and labor market signal notes from FreeJobData.</p>
      </section>
      {!authReady ? (
        <section className="section">
          <div className="community-feed-status">Checking your community session...</div>
        </section>
      ) : null}
      {authReady && !user ? <LockedNews authBusy={authBusy} authError={authError} handleSignIn={handleSignIn} /> : null}
      <section className="section grid">
        {articles.map((article) => (
          <Link className="card" href={`/news/${article.id}`} key={article.id}>
            <span className="pill">{article.author} - {article.publishedAt}</span>
            <h3>{article.title}</h3>
            <p className="muted">{article.summary}</p>
            <span className="muted">
              {article.sources?.length ? `${article.sourceCount} cited sources` : `${article.sourceCount} corroborating postings`}
            </span>
          </Link>
        ))}
      </section>
    </>
  )
}

export function NewsArticleGate({ slug }: { slug: string }) {
  const { authBusy, authError, authReady, handleSignIn, user } = useSignedInNews()
  const foundArticle = editorialCommunityArticles.find((article) => article.id === slug)
  const article = user ? foundArticle : foundArticle?.type === "team" ? foundArticle : null

  if (!authReady) {
    return (
      <section className="section">
        <div className="community-feed-status">Checking your community session...</div>
      </section>
    )
  }

  if (!article && !user) {
    return <LockedNews authBusy={authBusy} authError={authError} handleSignIn={handleSignIn} />
  }

  if (!article) {
    return (
      <section className="section">
        <h1>Article not found.</h1>
        <Link className="button secondary" href="/news">
          Back to news
        </Link>
      </section>
    )
  }

  const paragraphs = article.body?.length ? article.body : [article.summary]
  const publishedIso = articleIsoDate(article.publishedAt)

  return (
    <>
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
        {article.figures?.length ? (
          <section className="news-figure-list" aria-labelledby="news-figures">
            <h2 id="news-figures">Figures</h2>
            {article.figures.map((figure, index) => (
              <figure className="news-figure" key={figure.image}>
                <Image src={figure.image} alt={figure.alt} width={1200} height={720} />
                <figcaption>
                  <strong>Figure {index + 1}. {figure.title}</strong>
                  <span>{figure.caption}</span>
                </figcaption>
              </figure>
            ))}
          </section>
        ) : null}
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
