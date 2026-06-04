import { notFound } from "next/navigation"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { EntityIntelligencePage } from "@/components/EntityIntelligencePage"
import { buildMetadata } from "@/lib/seo"
import { companies, industries, industryRecords, locations, roles } from "@/lib/data"
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
  const record = industryRecords.find((item) => item.slug === params.slug)

  if (!record) {
    notFound()
  }

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
        primaryRows={companies.slice(0, 6).map((company, index) => ({
          company: company.name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 4)),
          growth: `${(record.metrics.growthWoW + index / 6).toFixed(1)}%`
        }))}
        secondaryRows={roles.slice(0, 6).map((role, index) => ({
          role: role.title,
          location: locations[index % locations.length].name,
          "active jobs": Math.round(record.metrics.activeJobs / (index + 3))
        }))}
        relatedLinks={[
          { label: "AI jobs dataset", href: "/datasets/ai-jobs" },
          { label: "Top hiring companies", href: "/reports/top-hiring-companies" },
          { label: "Weekly hiring trends", href: "/datasets/weekly-hiring-trends" },
          { label: "Software engineer job market", href: "/reports/software-engineer-job-market" },
          { label: "JobDataPool industry API", href: "https://jobdatapool.com/api" }
        ]}
      />
    </>
  )
}
