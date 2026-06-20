const { parseCsvTextSelected } = require("./_shared/csv")
const { LISTINGS_CSV_URL } = require("./_shared/fetch-listings")

let getStore = null
let connectLambda = null

try {
  ;({ getStore, connectLambda } = require("@netlify/blobs"))
} catch (_) {
  getStore = null
  connectLambda = null
}

const STORE_NAME = "freejobdata-downloads"
const SOURCE_VERSION = "listings-june-2026"
const MAX_LISTING_ROWS = 5000
const DOWNLOAD_COLUMNS = [
  "id",
  "company_name",
  "job_title",
  "job_location",
  "job_industries",
  "industries",
  "ingest_utc_date",
  "ingestion_date",
  "job_posted_date",
  "validated_on",
  "listing_closed",
  "url",
  "apply_link",
]

const DATASETS = {
  "free-job-postings-sample": {
    title: "Free Job Postings Sample",
    kind: "listing-subset",
    filter: () => true,
  },
  "remote-jobs": {
    title: "Remote Jobs",
    kind: "listing-subset",
    filter: isRemote,
  },
  "software-engineering-jobs": {
    title: "Software Engineering Jobs",
    kind: "listing-subset",
    filter: (row) => /software|engineer|developer/i.test(`${row.job_title || ""} ${row.job_industries || ""} ${row.industries || ""}`),
  },
  "ai-jobs": {
    title: "AI Jobs",
    kind: "listing-subset",
    filter: (row) =>
      /\bai\b|artificial intelligence|machine learning|ml engineer|data scientist/i.test(
        `${row.job_title || ""} ${row.job_industries || ""} ${row.industries || ""}`
      ),
  },
  internships: {
    title: "Internships",
    kind: "listing-subset",
    filter: (row) =>
      /\b(intern|internship|co-?op|student trainee|apprentice|early career|new grad|graduate)\b/i.test(
        `${row.job_title || ""} ${row.job_industries || ""} ${row.industries || ""}`
      ),
  },
  "top-hiring-companies": {
    title: "Top Hiring Companies",
    kind: "company-rollup",
  },
  "weekly-hiring-trends": {
    title: "Weekly Hiring Trends",
    kind: "weekly-rollup",
  },
  "location-demand": {
    title: "Location Demand",
    kind: "location-rollup",
  },
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type",
}

function parseDatasetSlug(event) {
  const qs = event?.queryStringParameters || {}
  const direct = qs.dataset || qs.slug
  if (direct) return String(direct).replace(/\.csv$/i, "").trim()

  const path = String(event?.path || "")
  const match = path.match(/\/downloads\/([^/?#]+)\.csv$/i)
  if (match) return decodeURIComponent(match[1])

  return ""
}

function jsonResponse(payload, statusCode = 200) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload, null, 2),
  }
}

function isClosed(row) {
  const value = String(row.listing_closed || "").trim().toLowerCase()
  return value === "true" || value === "1" || value === "yes"
}

function isRemote(row) {
  const haystack = `${row.job_title || ""} ${row.job_location || ""}`.toLowerCase()
  return haystack.includes("remote") || haystack.includes("hybrid")
}

function parseDate(row) {
  const text = String(row.ingest_utc_date || row.ingestion_date || row.job_posted_date || row.validated_on || "")
    .trim()
    .slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : ""
}

function weekStart(dateText) {
  if (!dateText) return "unknown"
  const date = new Date(`${dateText}T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) return "unknown"
  const day = date.getUTCDay()
  const offset = day === 0 ? -6 : 1 - day
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function normalizedListingRow(row) {
  const date = parseDate(row)
  return {
    job_id: row.id || row.job_id || "",
    company: String(row.company_name || "").trim() || "Unknown",
    role: String(row.job_title || "").trim() || "Unknown",
    location: String(row.job_location || "").trim() || "Unknown",
    remote_status: isRemote(row)
      ? String(row.job_location || "").toLowerCase().includes("hybrid")
        ? "hybrid"
        : "remote"
      : "onsite",
    industry: String(row.job_industries || row.industries || "").trim() || "uncategorized",
    active_jobs: isClosed(row) ? 0 : 1,
    snapshot_date: date,
    source_url: row.url || row.apply_link || "",
  }
}

function initRollup(name) {
  return {
    name,
    active: 0,
    total: 0,
    remote: 0,
    new7d: 0,
  }
}

function bumpRollup(map, key, displayName, row, maxDateMs) {
  if (!key) return
  if (!map.has(key)) map.set(key, initRollup(displayName))
  const bucket = map.get(key)
  bucket.total += 1
  if (!isClosed(row)) {
    bucket.active += 1
    if (isRemote(row)) bucket.remote += 1
  }
  const date = parseDate(row)
  const ts = date ? Date.parse(`${date}T00:00:00Z`) : NaN
  if (Number.isFinite(ts) && Number.isFinite(maxDateMs) && maxDateMs - ts <= 7 * 24 * 60 * 60 * 1000) {
    bucket.new7d += 1
  }
}

function maxSourceDateMs(rows) {
  const timestamps = rows
    .map(parseDate)
    .filter(Boolean)
    .map((date) => Date.parse(`${date}T00:00:00Z`))
    .filter(Number.isFinite)
  return timestamps.length ? Math.max(...timestamps) : NaN
}

function rollupRows(rows, field, outputName) {
  const maxDate = maxSourceDateMs(rows)
  const map = new Map()
  for (const row of rows) {
    const name = String(row[field] || "").trim()
    bumpRollup(map, slugify(name), name || "Unknown", row, maxDate)
  }
  return [...map.values()]
    .sort((a, b) => b.active - a.active)
    .slice(0, 500)
    .map((bucket) => ({
      [outputName]: bucket.name,
      active_jobs: bucket.active,
      new_jobs_7d: bucket.new7d,
      remote_share: bucket.active ? Number(((bucket.remote / bucket.active) * 100).toFixed(1)) : 0,
      source_rows: bucket.total,
      source_dataset: SOURCE_VERSION,
    }))
}

function weeklyRows(rows) {
  const map = new Map()
  for (const row of rows) {
    const key = weekStart(parseDate(row))
    if (!map.has(key)) map.set(key, initRollup(key))
    const bucket = map.get(key)
    bucket.total += 1
    if (!isClosed(row)) {
      bucket.active += 1
      if (isRemote(row)) bucket.remote += 1
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, bucket]) => ({
      week_start: week,
      active_jobs: bucket.active,
      remote_share: bucket.active ? Number(((bucket.remote / bucket.active) * 100).toFixed(1)) : 0,
      source_rows: bucket.total,
      source_dataset: SOURCE_VERSION,
    }))
}

function buildDatasetRows(slug, rows) {
  const config = DATASETS[slug]
  if (!config) return null
  const activeRows = rows.filter((row) => !isClosed(row))

  switch (config.kind) {
    case "company-rollup":
      return rollupRows(rows, "company_name", "company")
    case "location-rollup":
      return rollupRows(rows, "job_location", "location")
    case "weekly-rollup":
      return weeklyRows(rows)
    case "listing-subset":
    default:
      return activeRows.filter(config.filter).slice(0, MAX_LISTING_ROWS).map(normalizedListingRow)
  }
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function rowsToCsv(rows) {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ].join("\n")
}

async function fetchSourceRows() {
  const resp = await fetch(LISTINGS_CSV_URL, {
    headers: { Accept: "text/csv, text/plain, */*" },
  })
  if (!resp.ok) {
    throw new Error(`R2 listings CSV fetch failed (HTTP ${resp.status}) for ${LISTINGS_CSV_URL}`)
  }
  return parseCsvTextSelected(await resp.text(), DOWNLOAD_COLUMNS)
}

function connectBlobs(event) {
  if (!connectLambda) return
  try {
    connectLambda(event)
  } catch (error) {
    console.warn("download-dataset: connectLambda failed:", error?.message || error)
  }
}

async function readCachedCsv(event, key) {
  if (!getStore) return null
  try {
    connectBlobs(event)
    const store = getStore(STORE_NAME)
    return await store.get(key, { type: "text" })
  } catch (error) {
    console.warn(`download-dataset: cache read failed for ${key}:`, error?.message || error)
    return null
  }
}

async function writeCachedCsv(event, key, csv, metadata) {
  if (!getStore) return
  try {
    connectBlobs(event)
    const store = getStore(STORE_NAME)
    await store.set(key, csv, {
      metadata: {
        contentType: "text/csv",
        generatedAt: new Date().toISOString(),
        ...metadata,
      },
    })
  } catch (error) {
    console.warn(`download-dataset: cache write failed for ${key}:`, error?.message || error)
  }
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" }
  }

  const method = String(event?.httpMethod || "GET").toUpperCase()
  if (method !== "GET") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405)
  }

  const slug = parseDatasetSlug(event)
  const config = DATASETS[slug]
  if (!config) {
    return jsonResponse(
      {
        ok: false,
        error: "Unknown dataset.",
        available_datasets: Object.keys(DATASETS),
      },
      404
    )
  }

  const refresh = String(event?.queryStringParameters?.refresh || "").trim() === "1"
  const cacheKey = `${SOURCE_VERSION}/${slug}.csv`

  try {
    let csv = refresh ? null : await readCachedCsv(event, cacheKey)
    let cacheStatus = csv ? "hit" : "miss"

    if (!csv) {
      const rows = await fetchSourceRows()
      const datasetRows = buildDatasetRows(slug, rows)
      csv = rowsToCsv(datasetRows || [])
      await writeCachedCsv(event, cacheKey, csv, {
        dataset: slug,
        datasetTitle: config.title,
        sourceUrl: LISTINGS_CSV_URL,
        rowCount: String(datasetRows?.length || 0),
      })
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "content-disposition": `attachment; filename="${slug}.csv"`,
        "access-control-allow-origin": "*",
        "x-freejobdata-cache": cacheStatus,
        "x-freejobdata-source": LISTINGS_CSV_URL,
      },
      body: csv,
    }
  } catch (error) {
    console.error("download-dataset failed:", error?.message || error)
    return jsonResponse(
      {
        ok: false,
        error: error?.message || "Dataset download failed.",
        dataset: slug,
        source: LISTINGS_CSV_URL,
      },
      500
    )
  }
}
