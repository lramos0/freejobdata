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
import {
  mergeDatasetCounts,
  stripEntityRecord,
  type HomeDashboard,
  type MetricsDashboardContext,
  type MetricsSnapshotFile
} from "./metrics-snapshot"
import { withSafeCompanyDomains } from "./domain-fallbacks"

const roleTitleTerms =
  /\b(associate|representative|engineer|manager|technician|driver|consultant|banker|therapist|psychologist|nurse|rn|assistant|operator|specialist|coordinator|director|clerk|analyst|developer|supervisor|cashier|server|member|crew|sales|service|delivery|maintenance|leasing|financial|licensed|account|customer|mechanic|attorney|teacher|aide|intern|lead|architect|administrator|designer|planner|writer|counselor)\b/i

function isUsableCompanyName(name: string) {
  const normalized = name.trim().toLowerCase()
  return Boolean(normalized && !["unknown", "unknown-company", "n/a", "na", "null"].includes(normalized))
}

function isUsableRoleTitle(name: string) {
  const normalized = name.trim().toLowerCase()
  if (!normalized || ["unknown-role", "403 forbidden", "sign in", "just a moment", "workday"].includes(normalized)) {
    return false
  }

  if (
    /\b(forbidden|captcha|access denied|cloudflare|sign in|login|just a moment|inactive career page|job listings|job search)\b/i.test(
      name
    ) ||
    /[<>?*]/.test(name)
  ) {
    return false
  }

  return roleTitleTerms.test(name)
}

const snapshot = readMetricsSnapshot()

export const companies: Company[] = withSafeCompanyDomains(
  snapshot?.catalog.companies?.length
    ? snapshot.catalog.companies.filter((company) => isUsableCompanyName(company.name))
    : seedCompanies
)

export const roles: Role[] = snapshot?.catalog.roles?.length
  ? snapshot.catalog.roles.filter((role) => isUsableRoleTitle(role.title))
  : seedRoles

export const locations: Location[] = snapshot?.catalog.locations?.length
  ? snapshot.catalog.locations
  : seedLocations

export const industries: Industry[] = snapshot?.catalog.industries?.length
  ? snapshot.catalog.industries
  : seedIndustries

export const datasets: Dataset[] = mergeDatasetCounts(seedDatasets, snapshot?.datasets)

export const reports: Report[] = seedReports

export const companyRecords: EntityRecord[] = snapshot?.entities.companies?.length
  ? snapshot.entities.companies.map(stripEntityRecord).filter((record) => isUsableCompanyName(record.name))
  : seedCompanyRecords

export const roleRecords: EntityRecord[] = snapshot?.entities.roles?.length
  ? snapshot.entities.roles.map(stripEntityRecord).filter((record) => isUsableRoleTitle(record.name))
  : seedRoleRecords

export const locationRecords: EntityRecord[] = snapshot?.entities.locations?.length
  ? snapshot.entities.locations.map(stripEntityRecord)
  : seedLocationRecords

export const industryRecords: EntityRecord[] = snapshot?.entities.industries?.length
  ? snapshot.entities.industries.map(stripEntityRecord)
  : seedIndustryRecords

function snapshotCompanyRecords(nextSnapshot?: MetricsSnapshotFile | null): EntityRecord[] {
  return nextSnapshot?.entities.companies?.length
    ? nextSnapshot.entities.companies.map(stripEntityRecord).filter((record) => isUsableCompanyName(record.name))
    : companyRecords
}

function snapshotRoleRecords(nextSnapshot?: MetricsSnapshotFile | null): EntityRecord[] {
  return nextSnapshot?.entities.roles?.length
    ? nextSnapshot.entities.roles.map(stripEntityRecord).filter((record) => isUsableRoleTitle(record.name))
    : roleRecords
}

function companyRows(limit = 10, nextSnapshot?: MetricsSnapshotFile | null) {
  return snapshotCompanyRecords(nextSnapshot)
    .filter((record) => isUsableCompanyName(record.name))
    .slice()
    .sort((a, b) => b.metrics.activeJobs - a.metrics.activeJobs)
    .slice(0, limit)
    .map((record) => ({
      company: record.name,
      "active jobs": record.metrics.activeJobs,
      "new 7d": record.metrics.newJobs7d,
      "remote share": `${record.metrics.remoteShare}%`
    }))
}

function roleRows(limit = 10, nextSnapshot?: MetricsSnapshotFile | null) {
  return snapshotRoleRecords(nextSnapshot)
    .filter((record) => isUsableRoleTitle(record.name))
    .slice()
    .sort((a, b) => b.metrics.growthWoW - a.metrics.growthWoW || b.metrics.activeJobs - a.metrics.activeJobs)
    .slice(0, limit)
    .map((record) => ({
      role: record.name,
      "active jobs": record.metrics.activeJobs,
      "WoW growth": `${record.metrics.growthWoW}%`,
      "median salary": record.metrics.medianSalary ? `$${record.metrics.medianSalary.toLocaleString()}` : "n/a"
    }))
}

function cleanHomeDashboard(dashboard: HomeDashboard, nextSnapshot?: MetricsSnapshotFile | null): HomeDashboard {
  const cleanedCompanyRows = companyRows(dashboard.top_hiring_trends.length || 10, nextSnapshot)
  const cleanedRoleRows = roleRows(dashboard.fast_growing_roles.length || 10, nextSnapshot)

  return {
    ...dashboard,
    top_hiring_trends: cleanedCompanyRows.length ? cleanedCompanyRows : dashboard.top_hiring_trends,
    fast_growing_roles: cleanedRoleRows.length ? cleanedRoleRows : dashboard.fast_growing_roles
  }
}

export function getHomeDashboard(nextSnapshot = snapshot): HomeDashboard {
  if (nextSnapshot?.dashboards?.home) {
    return cleanHomeDashboard(nextSnapshot.dashboards.home, nextSnapshot)
  }

  const fallbackCompanyRecords = snapshotCompanyRecords(nextSnapshot)
  const totalActiveJobs = fallbackCompanyRecords.reduce((sum, record) => sum + record.metrics.activeJobs, 0)
  const totalNewJobs7d = fallbackCompanyRecords.reduce((sum, record) => sum + record.metrics.newJobs7d, 0)
  const remoteShare =
    fallbackCompanyRecords.reduce((sum, record) => sum + record.metrics.remoteShare, 0) /
    Math.max(fallbackCompanyRecords.length, 1)

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
    top_hiring_trends: companyRows(8, nextSnapshot),
    fast_growing_roles: roleRows(8, nextSnapshot)
  }
}

function fallbackDashboardContext(nextSnapshot?: MetricsSnapshotFile | null): MetricsDashboardContext {
  const dashboard = getHomeDashboard(nextSnapshot)
  const activeJobs = nextSnapshot?.global?.active_jobs ?? 0

  return {
    slug: "default",
    label: "Default",
    eyebrow: "All tracked listings",
    summary: "Full JobDataPool hiring surface",
    description:
      "The default context includes every active listing in the latest JobDataPool metrics snapshot.",
    row_count: nextSnapshot?.source?.row_count ?? activeJobs,
    active_jobs: activeJobs,
    hero_metrics: dashboard.hero_metrics,
    top_hiring_trends: dashboard.top_hiring_trends,
    fast_growing_roles: dashboard.fast_growing_roles,
    top_locations: [],
    top_industries: [],
    annotations: {
      overview: "**Scope:** All active rows in the current metrics snapshot.",
      companies: "**Ranking:** Employers are sorted by open listing volume.",
      roles: "**Momentum:** Roles are sorted by week-over-week growth, then active listings.",
      locations: "**Coverage:** Location rollups appear after the next context-aware ingest.",
      industries: "**Coverage:** Industry rollups appear after the next context-aware ingest."
    }
  }
}

export function getMetricsDashboardContexts(nextSnapshot = snapshot): MetricsDashboardContext[] {
  const contexts = nextSnapshot?.dashboards?.contexts
  if (contexts?.length) {
    return contexts
  }

  return [fallbackDashboardContext(nextSnapshot)]
}

export function findMetricsDashboardContext(
  requestedSlug: string | undefined,
  nextSnapshot = snapshot
): MetricsDashboardContext {
  const contexts = getMetricsDashboardContexts(nextSnapshot)
  const normalized = requestedSlug
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return contexts.find((context) => context.slug === normalized) ?? contexts[0] ?? fallbackDashboardContext(nextSnapshot)
}

export function findBySlug<T extends { slug: string }>(records: T[], slug: string) {
  return records.find((record) => record.slug === slug)
}

export { metricsSnapshotMeta, readMetricsSnapshot }
