const STORE_NAME = "freejobdata-metrics"
const SNAPSHOT_KEY = "metrics-snapshot-v1"
const MANIFEST_KEY = "metrics-manifest-v1"

let getStore = null
let connectLambda = null

try {
  ;({ getStore, connectLambda } = require("@netlify/blobs"))
} catch (_) {
  getStore = null
  connectLambda = null
}

function connectBlobsLambda(event) {
  if (!connectLambda) return
  try {
    connectLambda(event)
  } catch (error) {
    console.warn("metrics-snapshot-store: connectLambda failed:", error?.message || error)
  }
}

async function readJson(key) {
  if (!getStore) return null
  try {
    const store = getStore(STORE_NAME)
    const raw = await store.get(key, { type: "text" })
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`metrics-snapshot-store: read ${key} failed:`, error?.message || error)
    return null
  }
}

async function writeJson(key, payload) {
  if (!getStore) {
    throw new Error("Netlify Blobs is unavailable in this environment.")
  }
  const store = getStore(STORE_NAME)
  await store.set(key, JSON.stringify(payload), {
    metadata: {
      contentType: "application/json",
      updatedAt: new Date().toISOString(),
    },
  })
}

async function readMetricsSnapshot(event) {
  connectBlobsLambda(event)
  return readJson(SNAPSHOT_KEY)
}

async function readMetricsManifest(event) {
  connectBlobsLambda(event)
  return readJson(MANIFEST_KEY)
}

async function persistMetricsArtifacts(event, { snapshot, manifest }) {
  connectBlobsLambda(event)
  await writeJson(SNAPSHOT_KEY, snapshot)
  await writeJson(MANIFEST_KEY, manifest)
  return { snapshotKey: SNAPSHOT_KEY, manifestKey: MANIFEST_KEY }
}

module.exports = {
  STORE_NAME,
  SNAPSHOT_KEY,
  MANIFEST_KEY,
  connectBlobsLambda,
  readMetricsSnapshot,
  readMetricsManifest,
  persistMetricsArtifacts,
}
