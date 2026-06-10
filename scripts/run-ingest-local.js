/**
 * Local analyst helper: run the same aggregation as ingest-job-data-pool and write data/metrics-snapshot.json.
 *
 *   node scripts/run-ingest-local.js
 */
const fs = require("fs")
const path = require("path")
const { buildSnapshotFromListings } = require("../netlify/functions/_shared/aggregate-job-listings")
const { fetchJobListings, LISTINGS_CSV_URL } = require("../netlify/functions/_shared/fetch-listings")

const OUTPUT = path.join(process.cwd(), "data", "metrics-snapshot.json")
const MANIFEST_OUTPUT = path.join(process.cwd(), "data", "metrics-manifest.json")

async function main() {
  console.log(`run-ingest-local: fetching ${LISTINGS_CSV_URL}`)
  const { items, dataUrl, source, startedAt } = await fetchJobListings()
  console.log(`run-ingest-local: loaded ${items.length} rows`)

  const { snapshot, manifest } = buildSnapshotFromListings({
    items,
    dataUrl,
    source,
    startedAt,
  })

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2))
  fs.writeFileSync(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2))

  console.log(
    JSON.stringify(
      {
        ok: true,
        output: OUTPUT,
        active_jobs: snapshot.global.active_jobs,
        generated_at: snapshot.generated_at,
        ingest_duration_ms: snapshot.ingest_duration_ms,
        indexed_pages: snapshot.global.indexed_pages,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error("run-ingest-local failed:", error?.message || error)
  process.exit(1)
})
