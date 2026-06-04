import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { reports } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Job Market News",
  description: "Latest FreeJobData notes and job market analysis powered by JobDataPool.",
  path: "/news"
})

export default function NewsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">News</p>
        <h1>Latest job market notes.</h1>
        <p className="lede">Short research updates, dataset announcements, and labor market signal notes from FreeJobData.</p>
      </section>
      <section className="section grid">
        {reports.slice(0, 4).map((report) => (
          <Link className="card" href={`/reports/${report.slug}`} key={report.slug}>
            <span className="pill">{report.updatedAt}</span>
            <h3>{report.title}</h3>
            <p className="muted">{report.summary}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
