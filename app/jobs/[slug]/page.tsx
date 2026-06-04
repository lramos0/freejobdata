import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companies, locations, roleRecords, roles } from "@/lib/data"
import { shouldIndexPage } from "@/lib/thresholds"

export function generateStaticParams() {
  return roles.map((role) => ({ slug: role.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const record = roleRecords.find((item) => item.slug === params.slug)

  return buildMetadata({
    title: record ? `${record.name} Job Market` : "Job Role Demand",
    description: record?.description ?? "Role demand intelligence from FreeJobData.",
    path: `/jobs/${params.slug}`,
    index: shouldIndexPage(record?.metrics)
  })
}

export default function JobPage({ params }: { params: { slug: string } }) {
  const record = roleRecords.find((item) => item.slug === params.slug)

  if (!record) {
    notFound()
  }

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
        primaryRows={companies.slice(0, 6).map((company, index) => ({
          company: company.name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 3)),
          growth: `${(record.metrics.growthWoW + index / 4).toFixed(1)}%`
        }))}
        secondaryRows={locations.slice(0, 6).map((location, index) => ({
          location: location.name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 2)),
          "median salary": `$${(record.metrics.medianSalary ?? 0 + index * 1500).toLocaleString()}`
        }))}
        relatedLinks={[
          { label: "Top companies hiring", href: "/companies" },
          { label: "Remote jobs dataset", href: "/datasets/remote-jobs" },
          { label: "California software jobs", href: "/locations/california" },
          { label: "Software engineering dataset", href: "/datasets/software-engineering-jobs" },
          { label: "JobDataPool role API", href: "https://jobdatapool.com/api" }
        ]}
      />
    </>
  )
}
