import fs from "fs"
import path from "path"
import type { MetricsSnapshotFile } from "./metrics-snapshot"

let cached: MetricsSnapshotFile | null | undefined

export function loadMetricsSnapshot(): MetricsSnapshotFile | null {
  if (cached !== undefined) {
    return cached
  }

  const filePath = path.join(process.cwd(), "data", "metrics-snapshot.json")
  if (!fs.existsSync(filePath)) {
    cached = null
    return null
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as MetricsSnapshotFile
    if (!parsed?.catalog || !parsed?.entities) {
      cached = null
      return null
    }
    cached = parsed
    return parsed
  } catch {
    cached = null
    return null
  }
}

export function metricsSnapshotMeta() {
  const snapshot = loadMetricsSnapshot()
  if (!snapshot) return null
  return {
    generated_at: snapshot.generated_at,
    source: snapshot.source,
    global: snapshot.global
  }
}
