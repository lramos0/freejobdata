import type { Company, Dataset, EntityRecord, Industry, Location, Report, Role } from "./types"
import {
  seedCompanies,
  seedCompanyRecords,
  seedDatasets,
  seedIndustries,
  seedIndustryRecords,
  seedLocationRecords,
  seedLocations,
  seedReports,
  seedRoleRecords,
  seedRoles
} from "./data-seed"
import { metricsSnapshotMeta } from "./load-metrics-snapshot"
import { readMetricsSnapshot } from "./metrics-snapshot-runtime"
import { mergeDatasetCounts, stripEntityRecord, type HomeDashboard } from "./metrics-snapshot"
import { withSafeCompanyDomains } from "./domain-fallbacks"

const snapshot = readMetricsSnapshot()

export const companies: Company[] = withSafeCompanyDomains(
  snapshot?.catalog.companies?.length ? snapshot.catalog.companies : seedCompanies
)

export const roles: Role[] = snapshot?.catalog.roles?.length ? snapshot.catalog.roles : seedRoles

export const locations: Location[] = snapshot?.catalog.locations?.length
  ? snapshot.catalog.locations
  : seedLocations

export const industries: Industry[] = snapshot?.catalog.industries?.length
  ? snapshot.catalog.industries
  : seedIndustries

export const datasets: Dataset[] = mergeDatasetCounts(seedDatasets, snapshot?.datasets)

export const reports: Report[] = seedReports

export const companyRecords: EntityRecord[] = snapshot?.entities.companies?.length
  ? snapshot.entities.companies.map(stripEntityRecord)
  : seedCompanyRecords

export const roleRecords: EntityRecord[] = snapshot?.entities.roles?.length
  ? snapshot.entities.roles.map(stripEntityRecord)
  : seedRoleRecords

export const locationRecords: EntityRecord[] = snapshot?.entities.locations?.length
  ? snapshot.entities.locations.map(stripEntityRecord)
  : seedLocationRecords

export const industryRecords: EntityRecord[] = snapshot?.entities.industries?.length
  ? snapshot.entities.industries.map(stripEntityRecord)
  : seedIndustryRecords

export function getHomeDashboard(): HomeDashboard {
  if (snapshot?.dashboards?.home) {
    return snapshot.dashboards.home
  }

  const totalActiveJobs = companyRecords.reduce((sum, record) => sum + record.metrics.activeJobs, 0)
  const totalNewJobs7d = companyRecords.reduce((sum, record) => sum + record.metrics.newJobs7d, 0)
  const remoteShare =
    companyRecords.reduce((sum, record) => sum + record.metrics.remoteShare, 0) /
    Math.max(companyRecords.length, 1)

  return {
    hero_metrics: [
      {
        label: "Active job signals",
        value: totalActiveJobs.toLocaleString(),
        detail: "Seed snapshot until JobDataPool ingest is available"
      },
      {
        label: "New jobs, 7d",
        value: totalNewJobs7d.toLocaleString(),
        detail: "Measured across tracked companies"
      },
      {
        label: "Remote share",
        value: `${remoteShare.toFixed(1)}%`,
        detail: "Average across public seed records"
      }
    ],
    top_hiring_trends: companyRecords
      .slice()
      .sort((a, b) => b.metrics.activeJobs - a.metrics.activeJobs)
      .slice(0, 8)
      .map((record) => ({
        Company: record.name,
        "Active jobs": record.metrics.activeJobs,
        "New jobs, 7d": record.metrics.newJobs7d,
        "Remote share": `${record.metrics.remoteShare}%`
      })),
    fast_growing_roles: roleRecords
      .slice()
      .sort((a, b) => b.metrics.growthWoW - a.metrics.growthWoW)
      .slice(0, 8)
      .map((record) => ({
        Role: record.name,
        "Active jobs": record.metrics.activeJobs,
        "WoW growth": `${record.metrics.growthWoW}%`,
        "Salary coverage": `${record.metrics.salaryCoverage ?? 0}%`
      }))
  }
}

export function findBySlug<T extends { slug: string }>(records: T[], slug: string) {
  return records.find((record) => record.slug === slug)
}

export { metricsSnapshotMeta, readMetricsSnapshot }
