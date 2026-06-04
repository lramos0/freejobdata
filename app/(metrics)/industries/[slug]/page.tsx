import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { industries, industryRecords } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const record = industryRecords.find((item) => item.slug === params.slug)

  return buildMetadata({
    title: record ? `${record.name} Hiring Trends` : "Industry Hiring Trends",
    description: record?.description ?? "Industry hiring intelligence from FreeJobData.",
    path: `/industries/${params.slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const context = getEntityPageContext("industry", params.slug, industryRecords)

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
