import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { industryRecords } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Industry Hiring Trends",
  description: "Browse industry hiring trend pages with top roles, top companies, location concentration, and weekly growth.",
  path: "/industries"
})

export default function IndustriesPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Industries</p>
        <h1>Industry hiring trend pages.</h1>
        <p className="lede">Understand demand by sector, role family, geography, and company concentration.</p>
      </section>
      <section className="section grid">
        {industryRecords.map((record) => (
          <Link className="card" href={`/industries/${record.slug}`} key={record.slug}>
            <span className="pill">{record.metrics.activeJobs} active jobs</span>
            <h3>{record.name}</h3>
            <p className="muted">{record.description}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
