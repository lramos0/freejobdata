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

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parseContext(event) {
  const qs = event?.queryStringParameters || {}
  return normalizeSlug(qs.context || qs.dashboard_context || "")
}

function dashboardContextIndex(snapshot) {
  return (snapshot.dashboards?.contexts || []).map((context) => ({
    slug: context.slug,
    label: context.label,
    active_jobs: context.active_jobs,
    row_count: context.row_count,
  }))
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

function pickViewPayload(view, snapshot, manifest, contextSlug) {
  if (!snapshot) return null

  switch (view) {
    case "snapshot":
      return snapshot
    case "dashboard":
    case "dashboards":
      if (contextSlug) {
        const contexts = snapshot.dashboards?.contexts || []
        const context = contexts.find((item) => item.slug === contextSlug) || contexts[0] || null
        return {
          generated_at: snapshot.generated_at,
          global: snapshot.global,
          context,
          requested_context: contextSlug,
          resolved_context: context?.slug || null,
          context_found: context?.slug === contextSlug,
          contexts: dashboardContextIndex(snapshot),
        }
      }

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
  const context = parseContext(event)

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
          views: ["manifest", "snapshot", "dashboard", "dashboard&context=remote-jobs", "rollups", "quality"],
        },
        404
      )
    }

    const payload = pickViewPayload(view, snapshot, manifest, context)
    return jsonResponse({
      ok: true,
      view,
      context: context || undefined,
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
