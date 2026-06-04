import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { datasets } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Free Job Market Datasets",
  description: "Download sample CSVs and inspect schema for free job posting, hiring trend, company, remote, AI, and location datasets.",
  path: "/datasets"
})

export default function DatasetsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Dataset portal</p>
        <h1>Free job market dataset samples.</h1>
        <p className="lede">Each dataset landing page includes a description, schema, sample CSV, updated date, license, and full JobDataPool CTA.</p>
      </section>
      <section className="section grid">
        {datasets.map((dataset) => (
          <Link className="card" href={`/datasets/${dataset.slug}`} key={dataset.slug}>
            <span className="pill">{dataset.recordCount.toLocaleString()} records</span>
            <h3>{dataset.title}</h3>
            <p className="muted">{dataset.description}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
