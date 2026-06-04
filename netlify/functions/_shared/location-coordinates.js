/** Approximate coordinates for map layers (lng, lat). */
const COORDINATES_BY_SLUG = {
  "san-francisco": [-122.4194, 37.7749],
  "san-francisco-ca": [-122.4194, 37.7749],
  "san-francisco-bay-area": [-122.4194, 37.7749],
  "new-york": [-74.006, 40.7128],
  "new-york-ny": [-74.006, 40.7128],
  "new-york-city": [-74.006, 40.7128],
  "seattle": [-122.3321, 47.6062],
  "seattle-wa": [-122.3321, 47.6062],
  "austin": [-97.7431, 30.2672],
  "austin-tx": [-97.7431, 30.2672],
  "san-diego": [-117.1611, 32.7157],
  "san-diego-ca": [-117.1611, 32.7157],
  "boston": [-71.0589, 42.3601],
  "boston-ma": [-71.0589, 42.3601],
  "chicago": [-87.6298, 41.8781],
  "chicago-il": [-87.6298, 41.8781],
  "denver": [-104.9903, 39.7392],
  "denver-co": [-104.9903, 39.7392],
  "washington": [-77.0369, 38.9072],
  "washington-dc": [-77.0369, 38.9072],
  "los-angeles": [-118.2437, 34.0522],
  "los-angeles-ca": [-118.2437, 34.0522],
  "atlanta": [-84.388, 33.749],
  "atlanta-ga": [-84.388, 33.749],
  "dallas": [-96.797, 32.7767],
  "dallas-tx": [-96.797, 32.7767],
  "houston": [-95.3698, 29.7604],
  "houston-tx": [-95.3698, 29.7604],
  "phoenix": [-112.074, 33.4484],
  "phoenix-az": [-112.074, 33.4484],
  "philadelphia": [-75.1652, 39.9526],
  "philadelphia-pa": [-75.1652, 39.9526],
  "california": [-119.4179, 36.7783],
  "united-states": [-98.5795, 39.8283],
  "remote": [-98.5795, 39.8283],
  "united-states-remote": [-98.5795, 39.8283],
}

function resolveCoordinates(slug, name) {
  const key = String(slug || "").trim().toLowerCase()
  if (COORDINATES_BY_SLUG[key]) {
    return COORDINATES_BY_SLUG[key]
  }

  const nameKey = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  if (COORDINATES_BY_SLUG[nameKey]) {
    return COORDINATES_BY_SLUG[nameKey]
  }

  for (const [candidate, coords] of Object.entries(COORDINATES_BY_SLUG)) {
    if (key.includes(candidate) || nameKey.includes(candidate)) {
      return coords
    }
  }

  return null
}

module.exports = {
  COORDINATES_BY_SLUG,
  resolveCoordinates,
}
