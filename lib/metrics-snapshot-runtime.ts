import type { MetricsSnapshotFile } from "./metrics-snapshot"

let cached: MetricsSnapshotFile | null | undefined

function isValidMetricsSnapshot(value: unknown): value is MetricsSnapshotFile {
  const snapshot = value as MetricsSnapshotFile | null
  return Boolean(snapshot?.entities?.companies?.length && snapshot?.dashboards?.home)
}

/** Reads metrics-snapshot.json (written by ingest-job-data-pool) on the server when present. */
export function readMetricsSnapshot(): MetricsSnapshotFile | null {
  if (cached !== undefined) {
    return cached
  }

  if (typeof window === "undefined") {
    try {
      const fs = require("fs") as typeof import("fs")
      const path = require("path") as typeof import("path")
      const filePath = path.join(process.cwd(), "data", "metrics-snapshot.json")
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as MetricsSnapshotFile
        if (isValidMetricsSnapshot(parsed)) {
          cached = parsed
          return cached
        }
      }
    } catch {
      // ignore
    }
  }

  cached = null
  return null
}

function metricsSnapshotUrl() {
  const explicit = process.env.METRICS_SNAPSHOT_URL?.trim()
  if (explicit) return explicit

  const siteUrl =
    process.env.URL?.trim() ||
    process.env.DEPLOY_PRIME_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()

  return siteUrl ? `${siteUrl.replace(/\/$/, "")}/.netlify/functions/ingest-job-data-pool?view=snapshot` : ""
}

/** Fetches the latest stored Netlify Blob snapshot for request-time dashboards. */
export async function fetchMetricsSnapshot(): Promise<MetricsSnapshotFile | null> {
  const url = metricsSnapshotUrl()
  if (!url || typeof fetch === "undefined") {
    return null
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    const snapshot = payload?.data || payload
    return isValidMetricsSnapshot(snapshot) ? snapshot : null
  } catch {
    return null
  }
}
