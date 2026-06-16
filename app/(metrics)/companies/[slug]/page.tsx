import { notFound, permanentRedirect } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companyRecords } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

const staleCompanyRedirects: Record<string, string> = {
  "loch-ridge-dental-care": "/companies"
}

export function generateStaticParams() {
  return companyRecords.filter((record) => shouldIndexPage(record.metrics)).map((record) => ({ slug: record.slug }))
}

type SlugPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: SlugPageProps) {
  const { slug } = await params
  const record = companyRecords.find((item) => item.slug === slug)

  return buildMetadata({
    title: record ? `${record.name} Hiring Trends` : "Company Hiring Trends",
    description: record?.description ?? "Company hiring intelligence from FreeJobData.",
    path: `/companies/${slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default async function CompanyPage({ params }: SlugPageProps) {
  const { slug } = await params
  const context = getEntityPageContext("company", slug, companyRecords)

  if (!context) {
    const staleRedirect = staleCompanyRedirects[slug]

    if (staleRedirect) {
      permanentRedirect(staleRedirect)
    }

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
