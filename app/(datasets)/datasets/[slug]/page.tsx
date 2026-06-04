import { notFound } from "next/navigation"
import { BreadcrumbJsonLd, DatasetJsonLd } from "@/components/JsonLd"
import { DatasetSchemaTable } from "@/components/DatasetSchemaTable"
import { DownloadButton } from "@/components/DownloadButton"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MethodologyNote } from "@/components/MethodologyNote"
import { MetricCard } from "@/components/MetricCard"
import { DataTable } from "@/components/DataTable"
import { buildMetadata } from "@/lib/seo"
import { datasets } from "@/lib/data"

export function generateStaticParams() {
  return datasets.map((dataset) => ({ slug: dataset.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const dataset = datasets.find((item) => item.slug === params.slug)

  return buildMetadata({
    title: dataset ? dataset.title : "Free Job Market Dataset",
    description: dataset?.description ?? "Free job market dataset sample from FreeJobData.",
    path: `/datasets/${params.slug}`
  })
}

export default function DatasetPage({ params }: { params: { slug: string } }) {
  const dataset = datasets.find((item) => item.slug === params.slug)

  if (!dataset) {
    notFound()
  }

  const sampleRows = [
    {
      company: "OpenAI",
      role: "Machine Learning Engineer",
      location: "San Francisco, CA",
      remote_status: "hybrid",
      active_jobs: 42
    },
    {
      company: "Stripe",
      role: "Software Engineer",
      location: "New York, NY",
      remote_status: "remote",
      active_jobs: 38
    }
  ]

  return (
    <>
      <DatasetJsonLd dataset={dataset} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Datasets", path: "/datasets" },
          { name: dataset.title, path: `/datasets/${dataset.slug}` }
        ]}
      />
      <section className="hero">
        <p className="eyebrow">Dataset</p>
        <h1>{dataset.title}</h1>
        <p className="lede">{dataset.description}</p>
        {dataset.sampleCsvUrl ? <DownloadButton href={dataset.sampleCsvUrl} /> : null}
      </section>
      <section className="section grid">
        <MetricCard label="Sample records" value={dataset.recordCount.toLocaleString()} />
        <MetricCard label="Updated" value={dataset.updatedAt} />
        <MetricCard label="Format" value="CSV" />
        <MetricCard label="License" value="Attribution" />
      </section>
      <section className="section">
        <h2>Schema</h2>
        <DatasetSchemaTable schema={dataset.schemaJson} />
      </section>
      <section className="section">
        <h2>Sample rows</h2>
        <DataTable rows={sampleRows} />
      </section>
      <section className="section">
        <MethodologyNote />
        <JobDataPoolCTA title="Download the full dataset from JobDataPool" />
      </section>
    </>
  )
}
