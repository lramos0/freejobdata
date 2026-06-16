import Link from "next/link"
import { DataTable } from "@/components/DataTable"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { buildMetadata } from "@/lib/seo"
import { companyRecords, findMetricsDashboardContext, getMetricsDashboardContexts, roleRecords } from "@/lib/data"
import { loadLatestMetricsSnapshot, metricsSnapshotMeta } from "@/lib/load-metrics-snapshot"
import type { DashboardMetric, MetricsDashboardContext } from "@/lib/metrics-snapshot"

export const dynamic = "force-dynamic"

export const metadata = buildMetadata({
  title: "Job Market Metrics",
  description:
    "US job data pool metrics: active listings, hiring growth, remote share, and role demand dashboards powered by JobDataPool.",
  path: "/metrics"
})

type MetricsPageProps = {
  searchParams?: Promise<{
    context?: string | string[]
  }>
  contextOverride?: string
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function contextHref(context: MetricsDashboardContext) {
  return context.slug === "default" ? "/metrics" : `/metrics/${encodeURIComponent(context.slug)}`
}

function MarkdownAnnotation({ text }: { text?: string }) {
  if (!text) return null

  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return (
    <p className="markdown-annotation">
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part
      )}
    </p>
  )
}

function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className="metrics-widget metrics-widget-stat">
      <span className="metric-label">{metric.label}</span>
      <strong className="metric-value">{metric.value}</strong>
      <span className="muted">{metric.detail}</span>
      <MarkdownAnnotation text={metric.annotation} />
    </article>
  )
}

function DashboardTablePanel({
  title,
  rows,
  annotation
}: {
  title: string
  rows: Record<string, string | number>[]
  annotation: string
}) {
  return (
    <article className="metrics-widget metrics-table-panel">
      <h3>{title}</h3>
      <DataTable rows={rows} />
      <MarkdownAnnotation text={annotation} />
    </article>
  )
}

export default async function MetricsPage({ searchParams, contextOverride }: MetricsPageProps) {
  const params = await searchParams
  const snapshot = await loadLatestMetricsSnapshot()
  const snapshotMeta = metricsSnapshotMeta(snapshot)
  const requestedContext = contextOverride || firstParam(params?.context)
  const contexts = getMetricsDashboardContexts(snapshot)
  const dashboard = findMetricsDashboardContext(requestedContext, snapshot)
  const generatedDate = snapshotMeta?.generated_at ? new Date(snapshotMeta.generated_at) : null

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Metrics", path: "/metrics" }
        ]}
      />
      <div className="metrics-page">
        <section className="metrics-hero">
          <div className="metrics-hero-grid">
            <div>
              <p className="eyebrow">Metrics hub</p>
              <h1>Hiring metrics dashboards by labor-market context.</h1>
              <p className="lede">
                Explore active job counts, weekly growth, remote share, salary coverage, and role demand computed from
                the JobDataPool listings feed.
              </p>
            </div>
            <aside className="metrics-snapshot-card" aria-label="Latest metrics snapshot">
              <span>Latest snapshot</span>
              <strong>{snapshotMeta ? snapshotMeta.global.active_jobs.toLocaleString() : "Seed"}</strong>
              <small>
                {generatedDate
                  ? `${generatedDate.toLocaleDateString()} ${generatedDate.toLocaleTimeString()}`
                  : "Run npm run ingest:local"}
              </small>
            </aside>
          </div>

          <nav className="metrics-context-tabs" aria-label="Metric contexts">
            {contexts.map((context) => (
              <Link
                key={context.slug}
                className={context.slug === dashboard.slug ? "active" : ""}
                href={contextHref(context)}
                aria-current={context.slug === dashboard.slug ? "page" : undefined}
                aria-label={`${context.label}: ${context.active_jobs.toLocaleString()} active listings`}
              >
                <span className="metrics-tab-label">{context.label}</span>
                <small>{context.active_jobs.toLocaleString()}</small>
              </Link>
            ))}
          </nav>
        </section>

        <section className="section metrics-dashboard-shell" aria-labelledby="active-dashboard-title">
          <div className="metrics-dashboard-header">
            <div>
              <p className="eyebrow">{dashboard.eyebrow}</p>
              <h2 id="active-dashboard-title">{dashboard.summary}</h2>
              <p className="lede">{dashboard.description}</p>
            </div>
            <div className="metrics-run-meta">
              <span>Rows matched</span>
              <strong>{dashboard.row_count.toLocaleString()}</strong>
              <small>{generatedDate ? generatedDate.toLocaleDateString() : "Seed"}</small>
            </div>
          </div>

          <MarkdownAnnotation text={dashboard.annotations.overview} />

          <div className="metrics-widget-grid">
            {dashboard.hero_metrics.map((metric) => (
              <DashboardMetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <div className="metrics-panel-grid">
            <DashboardTablePanel
              title="Top companies"
              rows={dashboard.top_hiring_trends}
              annotation={dashboard.annotations.companies}
            />
            <DashboardTablePanel
              title="Fast-growing roles"
              rows={dashboard.fast_growing_roles}
              annotation={dashboard.annotations.roles}
            />
            <DashboardTablePanel
              title="Top locations"
              rows={dashboard.top_locations}
              annotation={dashboard.annotations.locations}
            />
            <DashboardTablePanel
              title="Top industries"
              rows={dashboard.top_industries}
              annotation={dashboard.annotations.industries}
            />
          </div>
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
      </div>
    </>
  )
}
