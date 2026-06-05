import type { MetricsSnapshotFile } from "./metrics-snapshot"

let cached: MetricsSnapshotFile | null | undefined

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
        if (parsed?.entities?.companies?.length) {
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
