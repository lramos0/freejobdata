"use client"

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { sp500Companies, type Sp500Company } from "@/lib/sp500-forum-data"

type ForumPost = {
  id: string
  title: string
  body: string
  author: string
  score: number
  comments: number
  createdAt: string
}

function hashNum(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return Math.abs(hash >>> 0)
}

function initials(name: string) {
  return name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function logoHtml(company: Sp500Company, size = 40) {
  const hue = hashNum(company.slug) % 360
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.domain)}&sz=${Math.max(
    128,
    size * 4
  )}`

  return (
    <span
      className="forum-logo-chip"
      data-initials={initials(company.name)}
      style={{ width: size, height: size, "--logo-h": String(hue) } as CSSProperties}
    >
      <img className="forum-logo-fallback" src={favicon} alt="" loading="lazy" decoding="async" />
    </span>
  )
}

function demoOutcomes(company: Sp500Company) {
  const roles = ["Software Engineer", "Product Manager", "Data Analyst", "Business Analyst", "Operations", "Sales", "Finance", "UX Designer"]
  const locs = ["New York, NY", "San Francisco, CA", "Austin, TX", "Chicago, IL", "Seattle, WA", "Remote", "Boston, MA", "Atlanta, GA"]
  const skills = ["SQL / Excel / Tableau", "Python / APIs / Cloud", "React / TypeScript", "Stakeholder management", "Java / Spring / AWS", "Power BI", "Kubernetes", "Figma / Research"]
  const seed = hashNum(company.slug)

  return Array.from({ length: 8 }, (_, index) => ({
    sourceIndustry: company.industry,
    role: roles[(seed + index) % roles.length],
    location: locs[(seed + index * 3) % locs.length],
    skills: skills[(seed + index * 5) % skills.length],
    yoe: 1 + ((seed + index) % 10),
    outcome: index % 4 === 0 ? "Offer" : index % 3 === 0 ? "Final round" : "Interview",
    timing: `${7 + ((seed + index * 11) % 35)} days`
  }))
}

function demoPosts(company: Sp500Company): ForumPost[] {
  const seed = hashNum(company.slug)
  return [
    {
      id: `${company.slug}-interview`,
      title: `What helped you get interviews at ${company.name}?`,
      body: "Share the role track, recruiter path, portfolio signals, referrals, and timeline details that helped.",
      author: "Community Member",
      score: 24 + (seed % 80),
      comments: 6 + (seed % 18),
      createdAt: "2 hr ago"
    },
    {
      id: `${company.slug}-salary`,
      title: `${company.name} hiring metadata: locations, comp bands, and team signals`,
      body: "Use this thread for job posting links, interview loops, hiring manager notes, and regional demand changes.",
      author: "FreeJobData Team",
      score: 18 + (seed % 60),
      comments: 4 + (seed % 12),
      createdAt: "1 day ago"
    }
  ]
}

function OutcomePanel({ company }: { company: Sp500Company }) {
  return (
    <section className="reddit-outcomes">
      <div className="reddit-outcomes-head">
        <div>
          <h3>Hiring outcomes & metadata</h3>
          <p>
            GradCafe-style rows for this company. These can move into the same Firestore model as the forum when
            outcome sharing is ready.
          </p>
        </div>
        <button type="button" className="reddit-btn-primary">
          Share outcome
        </button>
      </div>
      <div className="reddit-outcome-table-wrap">
        <table className="reddit-outcome-table">
          <thead>
            <tr>
              <th>Hired from</th>
              <th>Role track</th>
              <th>Location</th>
              <th>Skills</th>
              <th>YOE</th>
              <th>Outcome</th>
              <th>Timing</th>
            </tr>
          </thead>
          <tbody>
            {demoOutcomes(company).map((row) => (
              <tr key={`${row.role}-${row.location}-${row.timing}`}>
                <td>{row.sourceIndustry}</td>
                <td>{row.role}</td>
                <td>{row.location}</td>
                <td>{row.skills}</td>
                <td>{row.yoe}</td>
                <td>
                  <span className="reddit-outcome-pill">{row.outcome}</span>
                </td>
                <td>{row.timing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CompanyForum({ company, onBack }: { company: Sp500Company; onBack: () => void }) {
  return (
    <>
      <div className="reddit-top">
        <button className="reddit-back" type="button" onClick={onBack}>
          ← All forums
        </button>
        <a href="https://jobdatapool.com/#api" className="reddit-back">
          JobDataPool API
        </a>
      </div>
      <div className="reddit-sub-header">
        <div className="reddit-sub-banner" />
        <div className="reddit-sub-bar">
          <div className="forum-icon-slot reddit-sub-avatar">{logoHtml(company, 64)}</div>
          <div className="reddit-sub-info">
            <h2>
              <button type="button" onClick={() => undefined}>
                s/{company.slug}
              </button>
            </h2>
            <p className="reddit-sub-meta">
              <strong>{company.name}</strong> · Fortune #{company.rank} · {company.industry} · community hiring data
            </p>
          </div>
        </div>
      </div>
      <div className="reddit-layout">
        <div>
          <OutcomePanel company={company} />
          <div className="reddit-create reddit-login-gate">
            <h3>Join to start a thread</h3>
            <p>Reading is open. Posting, commenting, and votes need a profile so your history follows you.</p>
            <button type="button" className="reddit-btn-primary">
              Join or sign in
            </button>
          </div>
          <div className="reddit-sort">
            <button type="button" className="is-active">
              Hot
            </button>
            <button type="button">New</button>
            <button type="button">Top</button>
          </div>
          <div className="reddit-feed">
            {demoPosts(company).map((post) => (
              <article className="reddit-post" key={post.id}>
                <div className="reddit-votes">
                  <button type="button" className="reddit-vote up" aria-label="Upvote">
                    ▲
                  </button>
                  <span className="reddit-score">{post.score}</span>
                  <button type="button" className="reddit-vote down" aria-label="Downvote">
                    ▼
                  </button>
                </div>
                <div className="reddit-post-main">
                  <div className="reddit-post-meta">
                    Posted by u/{post.author} · {post.createdAt}
                  </div>
                  <h3 className="reddit-post-title">{post.title}</h3>
                  <div className="reddit-post-body">{post.body}</div>
                  <div className="reddit-post-actions">
                    <span className="reddit-comment-count">{post.comments} comments</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="reddit-sidebar">
          <h4>About this forum</h4>
          <p>Local development mode: posts, comments, and votes are staged in this UI until Firestore writes are enabled.</p>
          <p>
            Job Data Pool on Reddit:{" "}
            <a href="https://www.reddit.com/r/jobdatapool/" target="_blank" rel="noopener noreferrer">
              r/jobdatapool
            </a>
          </p>
          <p>
            <strong>Company metadata</strong>
            <br />
            Industry: {company.industry}
            <br />
            Revenue: ${company.revenueMillions.toLocaleString()}M
            <br />
            Profit: ${company.profitMillions.toLocaleString()}M
          </p>
          <ul>
            <li>Be useful</li>
            <li>No doxxing</li>
            <li>Share signal, not spam</li>
          </ul>
        </aside>
      </div>
    </>
  )
}

export function Sp500JobsForum() {
  const [query, setQuery] = useState("")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const selectedCompany = selectedSlug ? sp500Companies.find((company) => company.slug === selectedSlug) : null
  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return sp500Companies
    }

    return sp500Companies.filter(
      (company) =>
        company.name.toLowerCase().includes(normalizedQuery) ||
        company.slug.includes(normalizedQuery) ||
        company.industry.toLowerCase().includes(normalizedQuery)
    )
  }, [query])

  return (
    <div className="forum-view sp500-forum-view">
      <div id="forumRoot">
        {selectedCompany ? (
          <CompanyForum company={selectedCompany} onBack={() => setSelectedSlug(null)} />
        ) : (
          <>
            <div className="reddit-top">
              <a href="https://jobdatapool.com/#api" className="reddit-back">
                JobDataPool API
              </a>
              <div className="reddit-hub-title">
                <h1>Company forums</h1>
                <p>
                  Choose a company, start threads, comment, and vote. Firebase turns this into shared public forum data;
                  local mode remains available for development.
                </p>
                <p>
                  Job Data Pool community:{" "}
                  <a href="https://www.reddit.com/r/jobdatapool/" target="_blank" rel="noopener noreferrer">
                    r/jobdatapool
                  </a>
                </p>
              </div>
              <div className="forum-co-search-wrap">
                <span className="forum-co-search-icon">s/</span>
                <input
                  type="search"
                  className="forum-co-search"
                  placeholder="Search companies..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                />
                <ul className="forum-co-results">
                  {query
                    ? filteredCompanies.slice(0, 12).map((company) => (
                        <li key={company.slug}>
                          <button type="button" onClick={() => setSelectedSlug(company.slug)}>
                            <span className="forum-icon-slot">{logoHtml(company, 32)}</span>
                            <span>{company.name}</span>
                            <span className="fc-rank">#{company.rank}</span>
                          </button>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
            <div className="reddit-hub-grid">
              {filteredCompanies.slice(0, query ? 80 : 500).map((company) => (
                <button className="reddit-hub-card" type="button" key={company.slug} onClick={() => setSelectedSlug(company.slug)}>
                  <span className="forum-icon-slot fc-mini">{logoHtml(company, 36)}</span>
                  <span>
                    <strong>{company.name}</strong>
                    <small>{company.industry || "S&P 500"}</small>
                  </span>
                  <span className="fc-rank">#{company.rank}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
