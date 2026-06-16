import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { companyRecords } from "@/lib/data"
import { shouldIndexPage } from "@/lib/thresholds"

export const metadata = buildMetadata({
  title: "Company Hiring Intelligence",
  description: "Browse company hiring trend pages with active jobs, remote share, growth, top roles, and top locations.",
  path: "/companies"
})

export default function CompaniesPage() {
  const indexableCompanyRecords = companyRecords.filter((record) => shouldIndexPage(record.metrics))

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Companies</p>
        <h1>Company hiring intelligence pages.</h1>
        <p className="lede">Track active jobs, weekly growth, remote share, role mix, and location demand by company.</p>
      </section>
      <section className="section grid">
        {indexableCompanyRecords.map((record) => (
          <Link className="card" href={`/companies/${record.slug}`} key={record.slug}>
            <span className="pill">{record.metrics.activeJobs} active jobs</span>
            <h3>{record.name}</h3>
            <p className="muted">{record.description}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
