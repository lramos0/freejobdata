import Link from "next/link"
import { DataTable } from "@/components/DataTable"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MetricCard } from "@/components/MetricCard"
import { buildMetadata } from "@/lib/seo"
import { companyRecords, datasets, reports, roleRecords } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Free Job Market Data, Reports, and Hiring Trends",
  description:
    "FreeJobData publishes free job market datasets, hiring reports, company hiring trends, and role demand intelligence powered by JobDataPool.",
  path: "/"
})

export default function HomePage() {
  const topCompanies = companyRecords.slice(0, 5).map((record) => ({
    company: record.name,
    "active jobs": record.metrics.activeJobs,
    "new 7d": record.metrics.newJobs7d,
    "remote share": `${record.metrics.remoteShare}%`
  }))

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Free labor market intelligence</p>
        <h1>Open job market data for researchers, journalists, and builders.</h1>
        <p className="lede">
          FreeJobData turns JobDataPool hiring data into public reports, dataset samples, company trend pages,
          role demand pages, and location intelligence built for citation and discovery.
        </p>
        <div className="pill-row">
          <Link className="button" href="/datasets">
            Explore datasets
          </Link>
          <Link className="button secondary" href="/reports">
            Read latest reports
          </Link>
        </div>
      </section>

      <section className="section grid">
        <MetricCard label="Company pages" value="50+" detail="SEO-eligible hiring profiles" />
        <MetricCard label="Role pages" value="50+" detail="Normalized job demand pages" />
        <MetricCard label="Dataset pages" value={datasets.length} detail="CSV samples and schema" />
        <MetricCard label="Reports" value={reports.length} detail="Market narratives and citations" />
      </section>

      <section className="section">
        <h2>Top hiring trends</h2>
        <DataTable rows={topCompanies} />
      </section>

      <section className="section grid">
        {reports.slice(0, 3).map((report) => (
          <Link className="card" href={`/reports/${report.slug}`} key={report.slug}>
            <span className="pill">{report.reportType}</span>
            <h3>{report.title}</h3>
            <p className="muted">{report.summary}</p>
          </Link>
        ))}
      </section>

      <section className="section grid">
        {datasets.slice(0, 3).map((dataset) => (
          <Link className="card" href={`/datasets/${dataset.slug}`} key={dataset.slug}>
            <span className="pill">{dataset.recordCount.toLocaleString()} sample records</span>
            <h3>{dataset.title}</h3>
            <p className="muted">{dataset.description}</p>
          </Link>
        ))}
      </section>

      <section className="section">
        <h2>Fast-growing roles</h2>
        <DataTable
          rows={roleRecords.slice(0, 6).map((record) => ({
            role: record.name,
            "active jobs": record.metrics.activeJobs,
            "WoW growth": `${record.metrics.growthWoW}%`,
            "median salary": `$${record.metrics.medianSalary?.toLocaleString()}`
          }))}
        />
      </section>

      <section className="section">
        <JobDataPoolCTA />
      </section>
    </>
  )
}
