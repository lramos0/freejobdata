import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { reports } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Job Market Reports",
  description: "Read weekly, monthly, industry, company, and location job market reports powered by JobDataPool.",
  path: "/reports"
})

export default function ReportsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Reports</p>
        <h1>Research-ready job market reports.</h1>
        <p className="lede">Narrative reports built from normalized job posting snapshots, designed for journalists, analysts, and founders.</p>
      </section>
      <section className="section grid">
        {reports.map((report) => (
          <Link className="card" href={`/reports/${report.slug}`} key={report.slug}>
            <span className="pill">{report.reportType}</span>
            <h3>{report.title}</h3>
            <p className="muted">{report.summary}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
