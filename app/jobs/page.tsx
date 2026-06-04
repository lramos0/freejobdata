import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { roleRecords } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Job Role Demand Intelligence",
  description: "Browse normalized job role demand pages with active jobs, hiring growth, top companies, and salary coverage.",
  path: "/jobs"
})

export default function JobsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Roles</p>
        <h1>Role demand intelligence pages.</h1>
        <p className="lede">Explore hiring demand by normalized job title, company concentration, salary coverage, and location mix.</p>
      </section>
      <section className="section grid">
        {roleRecords.map((record) => (
          <Link className="card" href={`/jobs/${record.slug}`} key={record.slug}>
            <span className="pill">{record.metrics.activeJobs} active jobs</span>
            <h3>{record.name}</h3>
            <p className="muted">{record.description}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
