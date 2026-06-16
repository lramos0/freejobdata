/**
 * Ensures data/metrics-snapshot.json exists before next build.
 * 1) Reuse existing file if present
 * 2) Try Netlify function URL when URL / METRICS_SNAPSHOT_URL is set
 * 3) Run local ingest (same logic as ingest-job-data-pool)
 */
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const OUTPUT = path.join(process.cwd(), "data", "metrics-snapshot.json")
const MAX_REMOTE_AGE_HOURS = Number(process.env.METRICS_MAX_REMOTE_AGE_HOURS || 36)

function hasSnapshot() {
  if (!fs.existsSync(OUTPUT)) return false
  try {
    const parsed = JSON.parse(fs.readFileSync(OUTPUT, "utf8"))
    return Boolean(parsed?.entities?.companies?.length && isCsvSnapshot(parsed))
  } catch {
    return false
  }
}

function isCsvSnapshot(snapshot) {
  return (
    snapshot?.source?.source_format === "csv" ||
    String(snapshot?.source?.data_url || "").toLowerCase().endsWith(".csv")
  )
}

function isFreshEnough(snapshot) {
  const timestamp = Date.parse(snapshot?.generated_at || "")
  if (!Number.isFinite(timestamp)) return false
  const ageHours = (Date.now() - timestamp) / (60 * 60 * 1000)
  return ageHours >= 0 && ageHours <= MAX_REMOTE_AGE_HOURS
}

async function tryFetch() {
  const explicit = process.env.METRICS_SNAPSHOT_URL
  const siteUrl = String(process.env.URL || process.env.DEPLOY_PRIME_URL || "").replace(/\/$/, "")
  const url = explicit || (siteUrl ? `${siteUrl}/.netlify/functions/ingest-job-data-pool?view=snapshot` : "")

  if (!url) return false

  console.log(`ensure-metrics-snapshot: fetching ${url}`)
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) {
    console.warn(`ensure-metrics-snapshot: fetch failed ${response.status}`)
    return false
  }

  const payload = await response.json()
  const snapshot = payload?.data || payload
  if (!snapshot?.entities?.companies?.length) {
    console.warn("ensure-metrics-snapshot: fetched payload missing entities")
    return false
  }
  if (!isCsvSnapshot(snapshot)) {
    console.warn("ensure-metrics-snapshot: fetched payload is not sourced from listings CSV")
    return false
  }
  if (!isFreshEnough(snapshot)) {
    console.warn(
      `ensure-metrics-snapshot: fetched payload is stale (generated ${snapshot.generated_at}); running local ingest.`
    )
    return false
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2))
  return true
}

async function main() {
  if (await tryFetch()) {
    console.log("ensure-metrics-snapshot: hydrated from Netlify function")
    return
  }

  if (hasSnapshot()) {
    console.log("ensure-metrics-snapshot: using existing data/metrics-snapshot.json")
    return
  }

  console.log("ensure-metrics-snapshot: running local ingest (ingest-job-data-pool)")
  execSync("node scripts/run-ingest-local.js", { stdio: "inherit" })

  if (!hasSnapshot()) {
    throw new Error("metrics snapshot missing after ingest — cannot hydrate site metrics.")
  }
}

main().catch((error) => {
  console.error(error?.message || error)
  process.exit(1)
})
