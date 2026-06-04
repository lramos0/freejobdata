function createCrossTabs() {
  return {
    company: new Map(),
    role: new Map(),
    location: new Map(),
    industry: new Map(),
  }
}

function ensureTab(store, parentSlug) {
  if (!store.has(parentSlug)) {
    store.set(parentSlug, {
      roles: new Map(),
      locations: new Map(),
      companies: new Map(),
      industries: new Map(),
    })
  }
  return store.get(parentSlug)
}

function bump(store, entityType, parentSlug, childKey, childSlug) {
  if (!parentSlug || !childSlug) return
  const tab = ensureTab(store[entityType], parentSlug)
  const bucket = tab[childKey]
  bucket.set(childSlug, (bucket.get(childSlug) || 0) + 1)
}

function topCounts(map, limit = 6) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function buildRows(counts, nameLookup, labelKey, extra = () => ({})) {
  return counts.map(([slug, count]) => ({
    [labelKey]: nameLookup.get(slug) || slug.replace(/-/g, " "),
    "active jobs": count,
    ...extra(slug, count),
  }))
}

module.exports = {
  createCrossTabs,
  bump,
  topCounts,
  buildRows,
}
