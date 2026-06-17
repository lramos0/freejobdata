import { DataTable } from "@/components/DataTable"
import { EntityHeader } from "@/components/EntityHeader"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MethodologyNote } from "@/components/MethodologyNote"
import { MetricCard } from "@/components/MetricCard"
import { RelatedLinks } from "@/components/RelatedLinks"
import { TrendChart } from "@/components/TrendChart"
import type { EntityRecord } from "@/lib/types"

function entityLabel(eyebrow: string) {
  const lower = eyebrow.toLowerCase()
  if (lower.includes("company")) return "company"
  if (lower.includes("role")) return "role"
  if (lower.includes("location")) return "location"
  if (lower.includes("industry")) return "industry"
  return "market segment"
}

function EntityInsight({ eyebrow, record }: { eyebrow: string; record: EntityRecord }) {
  const label = entityLabel(eyebrow)
  const growthDirection = record.metrics.growthWoW >= 0 ? "increased" : "decreased"
  const growthValue = Math.abs(record.metrics.growthWoW)
  const salaryText = record.metrics.medianSalary
    ? `The current median salary signal is $${record.metrics.medianSalary.toLocaleString()}, with ${
        record.metrics.salaryCoverage ?? 0
      }% of rows carrying usable compensation data.`
    : `Salary coverage is ${record.metrics.salaryCoverage ?? 0}%, so compensation signals should be read as directional until more postings include pay data.`

  return (
    <section className="section card">
      <h2>{record.name} hiring signal</h2>
      <p>
        This {label} page tracks {record.name} through normalized JobDataPool postings, including active job volume,
        new listings, closing activity, remote or hybrid share, and short-term growth. The current snapshot shows{" "}
        {record.metrics.activeJobs.toLocaleString()} active postings and{" "}
        {record.metrics.newJobs7d.toLocaleString()} new postings over the latest seven-day window.
      </p>
      <p>
        Week-over-week demand {growthDirection} by {growthValue}%, while remote or hybrid postings account for{" "}
        {record.metrics.remoteShare}% of the visible market. {salaryText} Use the segment tables below to compare the
        surrounding company, role, location, and industry mix before treating any single metric as the whole market.
      </p>
    </section>
  )
}

export function EntityIntelligencePage({
  eyebrow,
  record,
  primaryRows,
  secondaryRows,
  relatedLinks
}: {
  eyebrow: string
  record: EntityRecord
  primaryRows: Record<string, string | number>[]
  secondaryRows: Record<string, string | number>[]
  relatedLinks: { label: string; href: string }[]
}) {
  return (
    <>
      <EntityHeader
        eyebrow={eyebrow}
        title={`${record.name} hiring intelligence`}
        description={record.description}
        tags={["Active job postings", "Remote share", "Growth snapshots"]}
      />
      <section className="section grid">
        <MetricCard label="Active jobs" value={record.metrics.activeJobs.toLocaleString()} />
        <MetricCard label="New jobs, 7d" value={record.metrics.newJobs7d.toLocaleString()} />
        <MetricCard label="WoW growth" value={`${record.metrics.growthWoW}%`} />
        <MetricCard label="Remote share" value={`${record.metrics.remoteShare}%`} />
      </section>
      <EntityInsight eyebrow={eyebrow} record={record} />
      <section className="section two-column">
        <TrendChart points={record.trend} />
        <RelatedLinks links={relatedLinks} />
      </section>
      <section className="section">
        <h2>Top segments</h2>
        <DataTable rows={primaryRows} />
      </section>
      <section className="section">
        <h2>Market mix</h2>
        <DataTable rows={secondaryRows} />
      </section>
      <section className="section">
        <MethodologyNote />
        <JobDataPoolCTA title={`Get ${record.name} data via JobDataPool`} />
      </section>
    </>
  )
}
