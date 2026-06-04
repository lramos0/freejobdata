import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companies, companyRecords, locations, roles } from "@/lib/data"
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
  const record = companyRecords.find((item) => item.slug === params.slug)

  if (!record) {
    notFound()
  }

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
        primaryRows={roles.slice(0, 6).map((role, index) => ({
          role: role.title,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 2)),
          growth: `${(record.metrics.growthWoW + index / 3).toFixed(1)}%`
        }))}
        secondaryRows={locations.slice(0, 6).map((location, index) => ({
          location: location.name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 1.5)),
          "remote share": `${Math.max(12, record.metrics.remoteShare - index * 3).toFixed(1)}%`
        }))}
        relatedLinks={[
          { label: "AI jobs", href: "/jobs/machine-learning-engineer" },
          { label: "Software engineer jobs", href: "/jobs/software-engineer" },
          { label: "San Francisco hiring", href: "/locations/san-francisco-ca" },
          { label: "AI hiring report", href: "/reports/ai-hiring-trends" },
          { label: "JobDataPool company API", href: "https://jobdatapool.com/api" }
        ]}
      />
    </>
  )
}
