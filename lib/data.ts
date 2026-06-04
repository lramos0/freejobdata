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

  return {
    hero_metrics: [],
    top_hiring_trends: [],
    fast_growing_roles: []
  }
}

export function findBySlug<T extends { slug: string }>(records: T[], slug: string) {
  return records.find((record) => record.slug === slug)
}

export { metricsSnapshotMeta, readMetricsSnapshot }
