import { DataTable } from "@/components/DataTable"
import { EntityHeader } from "@/components/EntityHeader"
import { JobDataPoolCTA } from "@/components/JobDataPoolCTA"
import { MethodologyNote } from "@/components/MethodologyNote"
import { MetricCard } from "@/components/MetricCard"
import { RelatedLinks } from "@/components/RelatedLinks"
import { TrendChart } from "@/components/TrendChart"
import type { EntityRecord } from "@/lib/types"

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
