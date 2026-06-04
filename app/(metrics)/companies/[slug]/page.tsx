import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companies, companyRecords } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const record = companyRecords.find((item) => item.slug === params.slug)

  return buildMetadata({
    title: record ? `${record.name} Hiring Trends` : "Company Hiring Trends",
    description: record?.description ?? "Company hiring intelligence from FreeJobData.",
    path: `/companies/${params.slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const context = getEntityPageContext("company", params.slug, companyRecords)

  if (!context) {
    notFound()
  }

  const { record, primaryRows, secondaryRows, relatedLinks } = context

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Companies", path: "/companies" },
          { name: record.name, path: `/companies/${record.slug}` }
        ]}
      />
      <EntityIntelligencePage
        eyebrow="Company hiring intelligence"
        record={record}
        primaryRows={primaryRows}
        secondaryRows={secondaryRows}
        relatedLinks={relatedLinks}
      />
    </>
  )
}
