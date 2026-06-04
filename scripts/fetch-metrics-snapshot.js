/**
 * Pulls the latest metrics snapshot from ingest-job-data-pool before `next build`.
 * Skips quietly when no endpoint is configured (local dev without Netlify).
 */
const fs = require("fs")
const path = require("path")

const OUTPUT = path.join(process.cwd(), "data", "metrics-snapshot.json")

function resolveSnapshotUrl() {
  if (process.env.METRICS_SNAPSHOT_URL) {
    return process.env.METRICS_SNAPSHOT_URL
  }

  const siteUrl = String(process.env.URL || process.env.DEPLOY_PRIME_URL || "").replace(/\/$/, "")
  if (!siteUrl) return ""

  return `${siteUrl}/.netlify/functions/ingest-job-data-pool?view=snapshot`
}

async function main() {
  const url = resolveSnapshotUrl()
  if (!url) {
    console.log("fetch-metrics-snapshot: no METRICS_SNAPSHOT_URL or Netlify URL; using seed data.")
    return
  }

  console.log(`fetch-metrics-snapshot: GET ${url}`)
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) {
    console.warn(
      `fetch-metrics-snapshot: ${response.status} ${response.statusText}; site will use seed data until ingest runs.`
    )
    return
  }

  const payload = await response.json()
  const snapshot = payload?.data || payload
  if (!snapshot?.catalog || !snapshot?.entities) {
    console.warn("fetch-metrics-snapshot: response missing catalog/entities; keeping existing file.")
    return
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2))
  console.log(
    `fetch-metrics-snapshot: wrote ${OUTPUT} (${snapshot.global?.active_jobs ?? "?"} active jobs, generated ${snapshot.generated_at}).`
  )
}

main().catch((error) => {
  console.error("fetch-metrics-snapshot failed:", error?.message || error)
  process.exitCode = 0
})
