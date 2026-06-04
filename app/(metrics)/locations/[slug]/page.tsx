import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companies, locationRecords, locations, roles } from "@/lib/data"
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
  const record = locationRecords.find((item) => item.slug === params.slug)

  if (!record) {
    notFound()
  }

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
        primaryRows={roles.slice(0, 6).map((role, index) => ({
          role: role.title,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 2.4)),
          growth: `${(record.metrics.growthWoW + index / 5).toFixed(1)}%`
        }))}
        secondaryRows={companies.slice(0, 6).map((company, index) => ({
          company: company.name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 5)),
          industry: company.industry ?? "Software"
        }))}
        relatedLinks={[
          { label: "Fastest-growing roles", href: "/jobs" },
          { label: "Top hiring companies", href: "/reports/top-hiring-companies" },
          { label: "Location demand dataset", href: "/datasets/location-demand" },
          { label: "Remote jobs report", href: "/reports/remote-jobs-report" },
          { label: "JobDataPool location API", href: "https://jobdatapool.com/api" }
        ]}
      />
    </>
  )
}
