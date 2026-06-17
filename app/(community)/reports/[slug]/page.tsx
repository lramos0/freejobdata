import Link from "next/link"
import { notFound } from "next/navigation"
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MethodologyNote } from "@/components/MethodologyNote"
import { buildMetadata } from "@/lib/seo"
import { reports } from "@/lib/data"

export function generateStaticParams() {
  return reports.map((report) => ({ slug: report.slug }))
}

type SlugPageProps = { params: Promise<{ slug: string }> }

function reportMetadataTitle(report: (typeof reports)[number] | undefined) {
  if (!report) return "Job Market Report"
  if (report.slug === "top-hiring-companies") return "Top Hiring Companies Report"
  return report.title
}

export async function generateMetadata({ params }: SlugPageProps) {
  const { slug } = await params
  const report = reports.find((item) => item.slug === slug)

  return buildMetadata({
    title: reportMetadataTitle(report),
    description: report?.summary ?? "Job market report from FreeJobData.",
    path: `/reports/${slug}`
  })
}

export default async function ReportPage({ params }: SlugPageProps) {
  const { slug } = await params
  const report = reports.find((item) => item.slug === slug)

  if (!report) {
    notFound()
  }

  const paragraphs = report.bodyMarkdown.split("\n\n")

  return (
    <>
      <ArticleJsonLd report={report} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Reports", path: "/reports" },
          { name: report.title, path: `/reports/${report.slug}` }
        ]}
      />
      <section className="hero">
        <p className="eyebrow">{report.reportType} report</p>
        <h1>{report.title}</h1>
        <p className="lede">{report.summary}</p>
        <span className="pill">Updated {report.updatedAt}</span>
      </section>
      <article className="section card">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      <section className="section grid">
        {(report.relatedEntities.datasets ?? []).map((slug) => (
          <Link className="card" href={`/datasets/${slug}`} key={slug}>
            <h3>{slug.replaceAll("-", " ")}</h3>
            <p className="muted">Related dataset</p>
          </Link>
        ))}
      </section>
      <section className="section">
        <MethodologyNote />
        <JobDataPoolCTA title="Use JobDataPool for the underlying report data" />
      </section>
    </>
  )
}
