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
import { getDatasetPreviewRows } from "@/lib/metrics-hydration"

export function generateStaticParams() {
  return datasets.map((dataset) => ({ slug: dataset.slug }))
}

type SlugPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: SlugPageProps) {
  const { slug } = await params
  const dataset = datasets.find((item) => item.slug === slug)

  return buildMetadata({
    title: dataset ? dataset.title : "Free Job Market Dataset",
    description: dataset?.description ?? "Free job market dataset sample from FreeJobData.",
    path: `/datasets/${slug}`
  })
}

export default async function DatasetPage({ params }: SlugPageProps) {
  const { slug } = await params
  const dataset = datasets.find((item) => item.slug === slug)

  if (!dataset) {
    notFound()
  }

  const sampleRows = getDatasetPreviewRows(dataset.slug)

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
