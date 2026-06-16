import type { MetricsSnapshotFile } from "./metrics-snapshot"
import { fetchMetricsSnapshot, readMetricsSnapshot } from "./metrics-snapshot-runtime"

export function loadMetricsSnapshot(): MetricsSnapshotFile | null {
  return readMetricsSnapshot()
}

export async function loadLatestMetricsSnapshot(): Promise<MetricsSnapshotFile | null> {
  return (await fetchMetricsSnapshot()) ?? readMetricsSnapshot()
}

export function metricsSnapshotMeta(snapshot = loadMetricsSnapshot()) {
  if (!snapshot) return null
  return {
    generated_at: snapshot.generated_at,
    source: snapshot.source,
    global: snapshot.global
  }
}
