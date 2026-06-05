/** Canonical JobDataPool listings feed (R2 API JSON). */
const LISTINGS_API_JSON_URL =
  "https://pub-e2c96b2fef074ee0809919335319632f.r2.dev/listings-june-2026-api.json"
const LISTINGS_CSV_URL =
  "https://pub-e2c96b2fef074ee0809919335319632f.r2.dev/listings-june-2026.csv"

async function fetchJobListings() {
  const startedAt = Date.now()
  const dataUrl = LISTINGS_API_JSON_URL

  const resp = await fetch(dataUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  })

  if (!resp.ok) {
    throw new Error(`Listings API JSON fetch failed (HTTP ${resp.status}) for ${dataUrl}`)
  }

  const payload = await resp.json()
  if (!Array.isArray(payload)) {
    throw new Error("Listings API JSON must be a top-level array of job rows.")
  }
  if (!payload.length) {
    throw new Error("Listings API JSON returned 0 rows.")
  }

  return {
    items: payload,
    dataUrl,
    source: "jobdatapool-r2-api-json",
    startedAt,
  }
}

module.exports = {
  LISTINGS_API_JSON_URL,
  LISTINGS_CSV_URL,
  fetchJobListings,
}
