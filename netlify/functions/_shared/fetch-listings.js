const { parseCsvTextSelected } = require("./csv")

/** Canonical JobDataPool listings feed (R2 CSV with masked jobrd URLs). */
const LISTINGS_CSV_URL =
  "https://pub-e2c96b2fef074ee0809919335319632f.r2.dev/listings-june-2026.csv"

const JOBRD_ORIGIN = "https://jobdatapool.com"
const METRICS_COLUMNS = [
  "id",
  "ingestion_date",
  "job_title",
  "company_name",
  "job_location",
  "job_industries",
  "industries",
  "job_base_pay_range",
  "job_posted_date",
  "country_code",
  "ingest_utc_date",
  "validated_on",
  "listing_closed",
]

function isJobrdUrl(value) {
  return /^https:\/\/jobdatapool\.com\/jobrd\?id=[A-Za-z0-9_-]+$/i.test(String(value || "").trim())
}

function jobrdUrlForRow(row) {
  const existing = String(row.url || row.apply_link || row.posting_url || "").trim()
  if (isJobrdUrl(existing)) return existing

  const id = String(row.id || "").trim()
  if (!id) return existing

  return `${JOBRD_ORIGIN}/jobrd?id=${encodeURIComponent(id)}`
}

function ensureMaskedUrls(row) {
  const jobrdUrl = jobrdUrlForRow(row)
  if (!jobrdUrl) return row

  return {
    ...row,
    url: jobrdUrl,
    apply_link: jobrdUrl,
    posting_url: jobrdUrl,
  }
}

async function fetchJobListings() {
  const startedAt = Date.now()
  const dataUrl = LISTINGS_CSV_URL

  const resp = await fetch(dataUrl, {
    method: "GET",
    headers: { Accept: "text/csv,text/plain,*/*" },
  })

  if (!resp.ok) {
    throw new Error(`Listings CSV fetch failed (HTTP ${resp.status}) for ${dataUrl}`)
  }

  const items = parseCsvTextSelected(await resp.text(), METRICS_COLUMNS)
  if (!items.length) {
    throw new Error("Listings CSV parsed successfully but returned 0 rows.")
  }

  return {
    items,
    dataUrl,
    source: "jobdatapool-r2-csv",
    startedAt,
  }
}

module.exports = {
  LISTINGS_CSV_URL,
  METRICS_COLUMNS,
  fetchJobListings,
  ensureMaskedUrls,
  isJobrdUrl,
}
