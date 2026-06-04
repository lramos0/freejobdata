import type { EntityType, MetricSnapshot } from "./types"

export const SEO_THRESHOLDS = {
  companyMinActiveJobs: 10,
  roleMinActiveJobs: 50,
  locationMinActiveJobs: 100,
  industryMinActiveJobs: 100
}

export function thresholdFor(entityType: EntityType) {
  switch (entityType) {
    case "company":
      return SEO_THRESHOLDS.companyMinActiveJobs
    case "role":
      return SEO_THRESHOLDS.roleMinActiveJobs
    case "location":
      return SEO_THRESHOLDS.locationMinActiveJobs
    case "industry":
      return SEO_THRESHOLDS.industryMinActiveJobs
    default:
      return 0
  }
}

export function shouldIndexPage(metrics?: Pick<MetricSnapshot, "entityType" | "activeJobs">) {
  if (!metrics) {
    return false
  }

  return metrics.activeJobs >= thresholdFor(metrics.entityType)
}
