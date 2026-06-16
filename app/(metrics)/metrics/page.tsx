import Link from "next/link"
import { DataTable } from "@/components/DataTable"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MetricCard } from "@/components/MetricCard"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { buildMetadata } from "@/lib/seo"
import { companyRecords, getHomeDashboard, roleRecords } from "@/lib/data"
import { loadLatestMetricsSnapshot, metricsSnapshotMeta } from "@/lib/load-metrics-snapshot"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Job Market Metrics",
  description:
    "US job data pool metrics: active listings, hiring growth, remote share, and role demand dashboards powered by JobDataPool.",
  path: "/metrics"
})

export default async function MetricsPage() {
  const snapshot = await loadLatestMetricsSnapshot()
  const dashboard = getHomeDashboard(snapshot)
  const snapshotMeta = metricsSnapshotMeta(snapshot)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Metrics", path: "/metrics" }
        ]}
      />
      <section className="hero">
        <p className="eyebrow">Metrics hub</p>
        <h1>US job data pool metrics and hiring dashboards.</h1>
        <p className="lede">
          Explore active job counts, weekly growth, remote share, and role demand computed from the JobDataPool listings
          feed. Updated when the ingest cron runs.
        </p>
        {snapshotMeta ? (
          <p className="muted">
            Snapshot generated {new Date(snapshotMeta.generated_at).toLocaleString()} ·{" "}
            {snapshotMeta.global.active_jobs.toLocaleString()} active listings (ingest-job-data-pool)
          </p>
        ) : (
          <p className="muted">Run npm run ingest:local to hydrate metrics from JobDataPool.</p>
        )}
      </section>

      <section className="section grid">
        {dashboard.hero_metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </section>

      <section className="section">
        <h2>Companies hiring the most</h2>
        <DataTable rows={dashboard.top_hiring_trends} />
      </section>

      <section className="section">
        <h2>Fast-growing job titles</h2>
        <DataTable rows={dashboard.fast_growing_roles} />
      </section>

      <section className="section grid">
        <Link className="card" href="/companies">
          <span className="pill">Companies</span>
          <h3>Company hiring intelligence</h3>
          <p className="muted">Browse {companyRecords.length} company trend pages.</p>
        </Link>
        <Link className="card" href="/jobs">
          <span className="pill">Roles</span>
          <h3>Role demand pages</h3>
          <p className="muted">Browse {roleRecords.length} normalized job title pages.</p>
        </Link>
        <Link className="card" href="/reports">
          <span className="pill">Reports</span>
          <h3>Market reports</h3>
          <p className="muted">Weekly and thematic hiring narratives for citation.</p>
        </Link>
      </section>

      <section className="section">
        <JobDataPoolCTA title="Pull full history via JobDataPool" />
      </section>
    </>
  )
}
