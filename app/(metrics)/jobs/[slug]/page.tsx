import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { roleRecords, roles } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return roles.map((role) => ({ slug: role.slug }))
}

type SlugPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: SlugPageProps) {
  const { slug } = await params
  const record = roleRecords.find((item) => item.slug === slug)

  return buildMetadata({
    title: record ? `${record.name} Job Market` : "Job Role Demand",
    description: record?.description ?? "Role demand intelligence from FreeJobData.",
    path: `/jobs/${slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default async function JobPage({ params }: SlugPageProps) {
  const { slug } = await params
  const context = getEntityPageContext("role", slug, roleRecords)

  if (!context) {
    notFound()
  }

  const { record, primaryRows, secondaryRows, relatedLinks } = context

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Jobs", path: "/jobs" },
          { name: record.name, path: `/jobs/${record.slug}` }
        ]}
      />
      <EntityIntelligencePage
        eyebrow="Role demand intelligence"
        record={record}
        primaryRows={primaryRows}
        secondaryRows={secondaryRows}
        relatedLinks={relatedLinks}
      />
    </>
  )
}
