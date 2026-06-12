/** Client-side coordinate resolver (mirrors netlify/functions/_shared/location-coordinates.js). */

const COORDINATES_BY_SLUG: Record<string, [number, number]> = {
  "san-francisco": [-122.4194, 37.7749],
  "san-francisco-ca": [-122.4194, 37.7749],
  "new-york": [-74.006, 40.7128],
  "new-york-ny": [-74.006, 40.7128],
  seattle: [-122.3321, 47.6062],
  "seattle-wa": [-122.3321, 47.6062],
  austin: [-97.7431, 30.2672],
  "austin-tx": [-97.7431, 30.2672],
  "san-diego": [-117.1611, 32.7157],
  "san-diego-ca": [-117.1611, 32.7157],
  boston: [-71.0589, 42.3601],
  "boston-ma": [-71.0589, 42.3601],
  chicago: [-87.6298, 41.8781],
  "chicago-il": [-87.6298, 41.8781],
  denver: [-104.9903, 39.7392],
  "denver-co": [-104.9903, 39.7392],
  washington: [-77.0369, 38.9072],
  "washington-dc": [-77.0369, 38.9072],
  "los-angeles": [-118.2437, 34.0522],
  "los-angeles-ca": [-118.2437, 34.0522],
  atlanta: [-84.388, 33.749],
  "atlanta-ga": [-84.388, 33.749],
  dallas: [-96.797, 32.7767],
  "dallas-tx": [-96.797, 32.7767],
  houston: [-95.3698, 29.7604],
  "houston-tx": [-95.3698, 29.7604],
  phoenix: [-112.074, 33.4484],
  "phoenix-az": [-112.074, 33.4484],
  philadelphia: [-75.1652, 39.9526],
  "philadelphia-pa": [-75.1652, 39.9526],
  plano: [-96.6989, 33.0198],
  "plano-tx": [-96.6989, 33.0198],
  miami: [-80.1918, 25.7617],
  "miami-fl": [-80.1918, 25.7617],
  charlotte: [-80.8431, 35.2271],
  "charlotte-nc": [-80.8431, 35.2271],
  nashville: [-86.7816, 36.1627],
  "nashville-tn": [-86.7816, 36.1627],
  portland: [-122.6765, 45.5152],
  "portland-or": [-122.6765, 45.5152],
  minneapolis: [-93.265, 44.9778],
  "minneapolis-mn": [-93.265, 44.9778],
  detroit: [-83.0458, 42.3314],
  "detroit-mi": [-83.0458, 42.3314],
  "san-jose": [-121.8863, 37.3382],
  "san-jose-ca": [-121.8863, 37.3382],
  tampa: [-82.4572, 27.9506],
  "tampa-fl": [-82.4572, 27.9506],
  orlando: [-81.3792, 28.5383],
  "orlando-fl": [-81.3792, 28.5383],
  "las-vegas": [-115.1398, 36.1699],
  "las-vegas-nv": [-115.1398, 36.1699],
  "salt-lake-city": [-111.891, 40.7608],
  "salt-lake-city-ut": [-111.891, 40.7608],
  "kansas-city": [-94.5786, 39.0997],
  "kansas-city-mo": [-94.5786, 39.0997],
  "st-louis": [-90.1994, 38.627],
  "st-louis-mo": [-90.1994, 38.627],
  pittsburgh: [-79.9959, 40.4406],
  "pittsburgh-pa": [-79.9959, 40.4406],
  baltimore: [-76.6122, 39.2904],
  "baltimore-md": [-76.6122, 39.2904],
  raleigh: [-78.6382, 35.7796],
  "raleigh-nc": [-78.6382, 35.7796],
  columbus: [-82.9988, 39.9612],
  "columbus-oh": [-82.9988, 39.9612],
  indianapolis: [-86.1581, 39.7684],
  "indianapolis-in": [-86.1581, 39.7684],
  sacramento: [-121.4944, 38.5816],
  "sacramento-ca": [-121.4944, 38.5816],
}

const BLOCKED_MAP_SLUGS = new Set([
  "unknown-location",
  "unknown",
  "remote",
  "united-states-remote",
  "united-states",
  "n-a",
  "na",
  "null",
])

function slugifyName(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function hashUint(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function hashLocationCoordinates(slug: string, name: string): [number, number] {
  const seed = `${slug}:${name}`.toLowerCase()
  const hash = hashUint(seed)
  const lng = -125 + ((hash % 10000) / 10000) * 59
  const lat = 24 + (((Math.floor(hash / 10000) % 10000) / 10000) * 25)
  return [Number(lng.toFixed(4)), Number(lat.toFixed(4))]
}

function locationLookupKeys(slug: string, name: string) {
  const keys: string[] = []
  const seen = new Set<string>()

  function add(value: string) {
    const key = slugifyName(value)
    if (!key || seen.has(key)) return
    seen.add(key)
    keys.push(key)
  }

  add(slug)
  add(name)

  const parts = String(name || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts[0]) {
    add(parts[0])
    const region = parts[1] ? parts[1].replace(/united states.*$/i, "").trim() : ""
    if (region) {
      add(`${parts[0]} ${region}`)
      add(`${parts[0]}-${region}`)
    }
  }

  return keys
}

function lookupKnownCoordinates(slug: string, name: string) {
  for (const key of locationLookupKeys(slug, name)) {
    if (COORDINATES_BY_SLUG[key]) {
      return COORDINATES_BY_SLUG[key]
    }
  }

  const partialMatchBlocklist = new Set(["united-states", "remote", "california", "texas", "florida"])

  for (const key of locationLookupKeys(slug, name)) {
    for (const [candidate, coords] of Object.entries(COORDINATES_BY_SLUG)) {
      if (partialMatchBlocklist.has(candidate)) continue
      if (key.includes(candidate) || candidate.includes(key)) {
        return coords
      }
    }
  }

  return null
}

export function isUsableMapLocation(slug: string, name: string) {
  const key = slugifyName(slug)
  if (!key || BLOCKED_MAP_SLUGS.has(key)) {
    return false
  }

  const normalizedName = String(name || "").trim().toLowerCase()
  if (!normalizedName || ["unknown", "remote", "n/a", "na", "null", "united states"].includes(normalizedName)) {
    return false
  }

  if (/403-forbidden|cloudflare|sign-in|just-a-moment|access-denied/.test(key)) {
    return false
  }

  return true
}

export function resolveLocationCoordinates(
  slug: string,
  name: string,
  options: { allowHashed?: boolean } = {}
): [number, number] | null {
  const allowHashed = options.allowHashed !== false
  const known = lookupKnownCoordinates(slug, name)
  if (known) {
    return known
  }

  if (!allowHashed || !isUsableMapLocation(slug, name)) {
    return null
  }

  return hashLocationCoordinates(slug, name)
}
