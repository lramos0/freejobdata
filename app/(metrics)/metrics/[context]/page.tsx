import { permanentRedirect } from "next/navigation"
import { findMetricsDashboardContext, getMetricsDashboardContexts } from "@/lib/data"
import { loadLatestMetricsSnapshot } from "@/lib/load-metrics-snapshot"
import { buildMetadata } from "@/lib/seo"
import MetricsPage from "../page"

export const dynamic = "force-dynamic"

type MetricsContextPageProps = {
  params: Promise<{
    context: string
  }>
}

function dashboardTitle(label: string) {
  const normalized = label.toLowerCase()
  if (normalized === "remote jobs") return "Remote Job Metrics"
  if (normalized === "government jobs") return "Government Job Metrics"
  if (normalized === "internships") return "Internship Job Metrics"
  if (normalized === "high salary") return "High-Salary Job Metrics"
  return `${label} Job Metrics`
}

export async function generateMetadata({ params }: MetricsContextPageProps) {
  const { context } = await params
  const snapshot = await loadLatestMetricsSnapshot()
  const dashboard = findMetricsDashboardContext(context, snapshot)
  const isKnownContext = getMetricsDashboardContexts(snapshot).some((item) => item.slug === dashboard.slug)
  const isDefaultContext = dashboard.slug === "default"
  const title = isDefaultContext ? "Job Market Metrics" : dashboardTitle(dashboard.label)
  const description = isDefaultContext
    ? "US job data pool metrics: active listings, hiring growth, remote share, and role demand dashboards powered by JobDataPool."
    : `${dashboard.summary}: ${dashboard.description} Track active listings, weekly growth, remote share, and salary coverage from JobDataPool.`

  return buildMetadata({
    title,
    description,
    path: `/metrics/${encodeURIComponent(context)}`,
    index: isKnownContext && !isDefaultContext
  })
}

export default async function MetricsContextPage({ params }: MetricsContextPageProps) {
  const { context } = await params
  if (context === "default") {
    permanentRedirect("/metrics")
  }

  return <MetricsPage contextOverride={context} />
}
