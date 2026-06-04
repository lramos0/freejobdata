const { buildSnapshotFromListings } = require("./_shared/aggregate-job-listings")
const { fetchJobListings } = require("./_shared/fetch-listings")
const {
  readMetricsManifest,
  readMetricsSnapshot,
  persistMetricsArtifacts,
} = require("./_shared/metrics-snapshot-store")

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Content-Type",
}

function jsonResponse(payload, statusCode = 200) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload, null, 2),
  }
}

function parseView(event) {
  const qs = event?.queryStringParameters || {}
  return String(qs.view || qs.format || "manifest").trim().toLowerCase()
}

async function runIngest(event) {
  const { items, dataUrl, source, startedAt } = await fetchJobListings()
  const { snapshot, manifest } = buildSnapshotFromListings({ items, dataUrl, source, startedAt })
  const stored = await persistMetricsArtifacts(event, { snapshot, manifest })

  return {
    ok: true,
    action: "ingest",
    stored,
    manifest,
    row_count: items.length,
    active_jobs: snapshot.global.active_jobs,
    generated_at: snapshot.generated_at,
    ingest_duration_ms: snapshot.ingest_duration_ms,
  }
}

function pickViewPayload(view, snapshot, manifest) {
  if (!snapshot) return null

  switch (view) {
    case "snapshot":
      return snapshot
    case "dashboard":
    case "dashboards":
      return {
        generated_at: snapshot.generated_at,
        global: snapshot.global,
        dashboards: snapshot.dashboards,
      }
    case "rollups":
      return {
        generated_at: snapshot.generated_at,
        rollups: snapshot.dashboards?.rollups || {},
      }
    case "quality":
      return {
        generated_at: snapshot.generated_at,
        quality: snapshot.analyst?.quality || {},
        source: snapshot.source,
      }
    case "manifest":
    default:
      return manifest || {
        generated_at: snapshot.generated_at,
        global: snapshot.global,
        source: snapshot.source,
      }
  }
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" }
  }

  const method = event?.httpMethod ? String(event.httpMethod).toUpperCase() : null
  const isScheduled = method === null
  const view = parseView(event)

  try {
    if (isScheduled || method === "POST") {
      const result = await runIngest(event)
      return jsonResponse(result)
    }

    const snapshot = await readMetricsSnapshot(event)
    const manifest = await readMetricsManifest(event)

    if (!snapshot) {
      return jsonResponse(
        {
          ok: false,
          error: "No metrics snapshot stored yet. Trigger a POST ingest or wait for the scheduled cron.",
          views: ["manifest", "snapshot", "dashboard", "rollups", "quality"],
        },
        404
      )
    }

    const payload = pickViewPayload(view, snapshot, manifest)
    return jsonResponse({
      ok: true,
      view,
      data: payload,
    })
  } catch (error) {
    console.error("ingest-job-data-pool failed:", error?.message || error)
    return jsonResponse(
      {
        ok: false,
        error: error?.message || "Ingest failed.",
      },
      500
    )
  }
}
