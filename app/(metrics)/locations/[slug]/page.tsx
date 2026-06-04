import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { locationRecords, locations } from "@/lib/data"
import { getEntityPageContext } from "@/lib/metrics-hydration"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const record = locationRecords.find((item) => item.slug === params.slug)

  return buildMetadata({
    title: record ? `${record.name} Hiring Trends` : "Location Hiring Trends",
    description: record?.description ?? "Location hiring intelligence from FreeJobData.",
    path: `/locations/${params.slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const context = getEntityPageContext("location", params.slug, locationRecords)

  if (!context) {
    notFound()
  }

  const { record, primaryRows, secondaryRows, relatedLinks } = context

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: record.name, path: `/locations/${record.slug}` }
        ]}
      />
      <EntityIntelligencePage
        eyebrow="Location hiring intelligence"
        record={record}
        primaryRows={primaryRows}
        secondaryRows={secondaryRows}
        relatedLinks={relatedLinks}
      />
    </>
  )
}
