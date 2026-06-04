import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Methodology",
  description: "How FreeJobData normalizes raw job postings into hiring metrics, entity pages, reports, and datasets.",
  path: "/methodology"
})

export default function MethodologyPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Methodology</p>
        <h1>How FreeJobData turns job postings into market intelligence.</h1>
        <p className="lede">
          Raw jobs are normalized into companies, roles, locations, industries, and daily metric snapshots. Thin
          pages are excluded or noindexed until they meet minimum data thresholds.
        </p>
      </section>
      <section className="section grid">
        {[
          ["Normalize", "Standardize company names, titles, locations, industries, remote status, and salary ranges."],
          ["Deduplicate", "Collapse duplicate postings and preserve posting lifecycle changes over time."],
          ["Snapshot", "Create daily entity metrics for active jobs, new jobs, closed jobs, growth, and remote share."],
          ["Publish", "Generate index-worthy pages, datasets, reports, sitemaps, metadata, and structured data."]
        ].map(([title, body]) => (
          <article className="card" key={title}>
            <h3>{title}</h3>
            <p className="muted">{body}</p>
          </article>
        ))}
      </section>
      <section className="section">
        <JobDataPoolCTA />
      </section>
    </>
  )
}
