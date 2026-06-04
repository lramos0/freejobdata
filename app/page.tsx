import Link from "next/link"
import { DataTable } from "@/components/DataTable"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { SiteHubCards } from "@/components/SiteHubNav"
import { MetricCard } from "@/components/MetricCard"
import { buildMetadata, siteDescription, siteTitle } from "@/lib/seo"
import { datasets, getHomeDashboard, reports } from "@/lib/data"

export const metadata = buildMetadata({
  title: siteTitle,
  description: siteDescription,
  path: "/"
})

export default function HomePage() {
  const dashboard = getHomeDashboard()

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Free labor market intelligence</p>
        <h1>Open job market data for researchers, journalists, and builders.</h1>
        <p className="lede">
          FreeJobData turns JobDataPool hiring data into public reports, dataset samples, company trend pages,
          role demand pages, and location intelligence built for citation and discovery.
        </p>
      </section>

      <SiteHubCards />

      <section className="section grid">
        {dashboard.hero_metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </section>

      <section className="section">
        <h2>Top hiring trends</h2>
        <DataTable rows={dashboard.top_hiring_trends} />
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
        <DataTable rows={dashboard.fast_growing_roles} />
      </section>

      <section className="section">
        <JobDataPoolCTA />
      </section>
    </>
  )
}
