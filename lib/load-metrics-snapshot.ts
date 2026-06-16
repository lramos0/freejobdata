import type { MetricsSnapshotFile } from "./metrics-snapshot"
import { fetchMetricsSnapshot, readMetricsSnapshot } from "./metrics-snapshot-runtime"

function snapshotTime(snapshot: MetricsSnapshotFile | null) {
  const timestamp = snapshot?.generated_at ? Date.parse(snapshot.generated_at) : NaN
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function loadMetricsSnapshot(): MetricsSnapshotFile | null {
  return readMetricsSnapshot()
}

export async function loadLatestMetricsSnapshot(): Promise<MetricsSnapshotFile | null> {
  const [remote, local] = [await fetchMetricsSnapshot(), readMetricsSnapshot()]
  return snapshotTime(remote) >= snapshotTime(local) ? remote : local
}

export function metricsSnapshotMeta(snapshot = loadMetricsSnapshot()) {
  if (!snapshot) return null
  return {
    generated_at: snapshot.generated_at,
    source: snapshot.source,
    global: snapshot.global
  }
}
