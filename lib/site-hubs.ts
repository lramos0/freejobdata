/**
 * Primary site hubs — aligned with desired Google sitelinks (Datasets, Metrics, Community).
 * Keep labels and paths stable; use these in nav, footer, sitemap core tier, and JSON-LD.
 */
export type SiteHub = {
  label: string
  path: string
  description: string
}

export const SITE_SITELINKS: SiteHub[] = [
  {
    label: "Datasets",
    path: "/datasets",
    description: "Free job market dataset samples, schemas, and CSV downloads from the US job data pool."
  },
  {
    label: "Metrics",
    path: "/metrics",
    description: "Hiring metrics, active job counts, growth snapshots, and labor market dashboards."
  },
  {
    label: "News & Community",
    path: "/community",
    description:
      "Job-market news, Reddit OSINT, S&P 500 company boards, and a job posting location map."
  }
]

export function hubByPath(path: string) {
  return SITE_SITELINKS.find((hub) => hub.path === path)
}
