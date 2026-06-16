import { buildMetadata } from "@/lib/seo"
import MetricsPage from "../page"

export const dynamic = "force-dynamic"

type MetricsContextPageProps = {
  params: Promise<{
    context: string
  }>
}

export async function generateMetadata({ params }: MetricsContextPageProps) {
  const { context } = await params

  return buildMetadata({
    title: "Job Market Metrics",
    description:
      "US job data pool metrics: active listings, hiring growth, remote share, and role demand dashboards powered by JobDataPool.",
    path: `/metrics/${encodeURIComponent(context)}`
  })
}

export default async function MetricsContextPage({ params }: MetricsContextPageProps) {
  const { context } = await params
  return <MetricsPage contextOverride={context} />
}
