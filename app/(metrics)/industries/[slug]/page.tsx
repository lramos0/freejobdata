import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { industryRecords } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return industryRecords.filter((record) => shouldIndexPage(record.metrics)).map((record) => ({ slug: record.slug }))
}

type SlugPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: SlugPageProps) {
  const { slug } = await params
  const record = industryRecords.find((item) => item.slug === slug)

  return buildMetadata({
    title: record ? `${record.name} Hiring Trends` : "Industry Hiring Trends",
    description: record?.description ?? "Industry hiring intelligence from FreeJobData.",
    path: `/industries/${slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default async function IndustryPage({ params }: SlugPageProps) {
  const { slug } = await params
  const context = getEntityPageContext("industry", slug, industryRecords)

  if (!context) {
    notFound()
  }

  const { record, primaryRows, secondaryRows, relatedLinks } = context

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: record.name, path: `/industries/${record.slug}` }
        ]}
      />
      <EntityIntelligencePage
        eyebrow="Industry hiring intelligence"
        record={record}
        primaryRows={primaryRows}
        secondaryRows={secondaryRows}
        relatedLinks={relatedLinks}
      />
    </>
  )
}
