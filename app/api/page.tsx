import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "API Access",
  description: "Access FreeJobData signals and full historical job market data through the JobDataPool API.",
  path: "/api"
})

export default function ApiPage() {
  return (
    <section className="hero">
      <p className="eyebrow">API</p>
      <h1>Programmatic job market intelligence lives in JobDataPool.</h1>
      <p className="lede">
        FreeJobData publishes public samples and research pages. Full API access, historical datasets, and custom
        data products are available through JobDataPool.
      </p>
      <div className="pill-row">
        <a className="button" href="https://jobdatapool.com/#api">
          View API
        </a>
        <a className="button secondary" href="https://jobdatapool.com/docs/api">
          Read docs
        </a>
      </div>
    </section>
  )
}
