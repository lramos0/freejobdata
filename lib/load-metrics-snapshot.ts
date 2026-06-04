import type { MetricsSnapshotFile } from "./metrics-snapshot"
import { readMetricsSnapshot } from "./metrics-snapshot-runtime"

export function loadMetricsSnapshot(): MetricsSnapshotFile | null {
  return readMetricsSnapshot()
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
