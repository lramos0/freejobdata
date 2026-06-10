const DEFAULT_LIMIT = 8
const MAX_LIMIT = 24
const DEFAULT_DAYS = 14
const MAX_DAYS = 45
const REQUEST_TIMEOUT_MS = 7000

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=900, stale-while-revalidate=1800",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type",
}

const SOURCE_QUERIES = [
  {
    id: "reuters",
    name: "Reuters",
    homepage: "https://www.reuters.com",
    query: 'site:reuters.com ("labor market" OR "jobs report" OR hiring OR layoffs OR unemployment OR wages)',
  },
  {
    id: "marketwatch",
    name: "MarketWatch",
    homepage: "https://www.marketwatch.com",
    query: 'site:marketwatch.com ("labor market" OR "jobs report" OR hiring OR layoffs OR unemployment OR wages)',
  },
]

const JOB_MARKET_TERMS = [
  ["labor market", 8],
  ["jobs report", 8],
  ["nonfarm payroll", 8],
  ["payrolls", 7],
  ["unemployment", 7],
  ["job openings", 7],
  ["jolts", 7],
  ["hiring", 6],
  ["layoff", 6],
  ["layoffs", 6],
  ["wage", 5],
  ["wages", 5],
  ["salary", 5],
  ["worker", 4],
  ["workers", 4],
  ["employment", 4],
  ["jobless claims", 7],
  ["return to office", 4],
  ["remote work", 4],
  ["recruiting", 4],
  ["workforce", 4],
]

const TAG_TERMS = [
  ["jobs report", "jobs report"],
  ["labor market", "labor market"],
  ["unemployment", "unemployment"],
  ["jobless claims", "jobless claims"],
  ["hiring", "hiring"],
  ["layoff", "layoffs"],
  ["layoffs", "layoffs"],
  ["wage", "wages"],
  ["wages", "wages"],
  ["salary", "salary"],
  ["remote work", "remote work"],
  ["return to office", "return to office"],
  ["workforce", "workforce"],
]

let memoryCache = {
  key: "",
  expiresAt: 0,
  payload: null,
}

function jsonResponse(payload, statusCode = 200) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload, null, 2),
  }
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value || ""), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, parsed))
}

function normalizeQuery(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120)
}

function googleNewsFeedUrl(query) {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim()
}

function stripTags(value) {
  return decodeEntities(String(value || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
}

function xmlTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i"))
  return match ? decodeEntities(match[1]) : ""
}

function xmlTagAttr(block, tagName, attrName) {
  const match = block.match(new RegExp(`<${tagName}\\s[^>]*${attrName}=["']([^"']+)["'][^>]*>`, "i"))
  return match ? decodeEntities(match[1]) : ""
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96)
}

function parseFeedItems(xml, sourceConfig) {
  const itemBlocks = String(xml || "").match(/<item[\s\S]*?<\/item>/gi) || []
  const atomBlocks = itemBlocks.length ? [] : String(xml || "").match(/<entry[\s\S]*?<\/entry>/gi) || []
  const blocks = itemBlocks.length ? itemBlocks : atomBlocks

  return blocks.map((block) => {
    const sourceName = stripTags(xmlTag(block, "source")) || sourceConfig.name
    const sourceUrl = xmlTagAttr(block, "source", "url") || sourceConfig.homepage
    const rawTitle = stripTags(xmlTag(block, "title"))
    const title = rawTitle.replace(new RegExp(`\\s+-\\s+${sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "")
    const description = stripTags(xmlTag(block, "description") || xmlTag(block, "summary") || xmlTag(block, "content"))
    const link = decodeEntities(xmlTag(block, "link")) || xmlTagAttr(block, "link", "href")
    const publishedAt = xmlTag(block, "pubDate") || xmlTag(block, "published") || xmlTag(block, "updated")

    return {
      title,
      description,
      url: link,
      publishedAt,
      sourceId: sourceConfig.id,
      sourceName,
      sourceUrl,
    }
  })
}

function scoreItem(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase()
  return JOB_MARKET_TERMS.reduce((score, [term, weight]) => score + (haystack.includes(term) ? weight : 0), 0)
}

function itemTags(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase()
  const tags = TAG_TERMS.filter(([term]) => haystack.includes(term)).map(([, tag]) => tag)
  return [...new Set(tags)].slice(0, 5)
}

function itemDate(value) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function publishedDate(value) {
  const timestamp = itemDate(value)
  return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
}

function sourceAllowed(item, requestedSource) {
  if (requestedSource === "all") return true
  return item.sourceId === requestedSource || item.sourceName.toLowerCase() === requestedSource
}

function withinWindow(item, days) {
  const timestamp = itemDate(item.publishedAt)
  if (!timestamp) return true
  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000
}

function toCommunityArticle(item, index) {
  const tags = itemTags(item)
  const score = scoreItem(item)
  const summary =
    item.description ||
    `A job-market related headline from ${item.sourceName}, surfaced for signed-in FreeJobData community readers.`

  return {
    id: `external-${item.sourceId}-${slugify(item.title) || index}`,
    title: item.title,
    summary: summary.slice(0, 280),
    author: item.sourceName,
    type: "community",
    publishedAt: publishedDate(item.publishedAt),
    location: "United States",
    role: "Job market news",
    industry: "Labor market",
    factuality: score >= 12 ? "High Signal" : "Developing",
    confidence: Math.max(62, Math.min(92, 58 + score * 3)),
    sourceCount: 1,
    coordinates: [-98.5795, 39.8283],
    tags: tags.length ? tags : ["job market"],
    sources: [
      {
        label: item.sourceName,
        href: item.sourceUrl,
      },
    ],
    externalUrl: item.url,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
  }
}

function balancedSourceMix(rankedItems, limit) {
  const buckets = new Map()
  const selected = []

  for (const rankedItem of rankedItems) {
    const key = rankedItem.item.sourceId
    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key).push(rankedItem)
  }

  while (selected.length < limit && [...buckets.values()].some((bucket) => bucket.length)) {
    for (const bucket of buckets.values()) {
      const nextItem = bucket.shift()
      if (nextItem) {
        selected.push(nextItem)
      }
      if (selected.length >= limit) break
    }
  }

  return selected
}

async function fetchText(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "freejobdata-job-market-news/0.1",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeout)
  }
}

function pickSources(source) {
  if (source === "all") return SOURCE_QUERIES
  return SOURCE_QUERIES.filter((item) => item.id === source)
}

async function fetchSourceItems(sourceConfig, extraQuery) {
  const query = extraQuery ? `${sourceConfig.query} ${extraQuery}` : sourceConfig.query
  const xml = await fetchText(googleNewsFeedUrl(query))
  return parseFeedItems(xml, sourceConfig)
}

async function buildPayload({ source, limit, days, extraQuery }) {
  const sourceConfigs = pickSources(source)
  const failures = []
  const settled = await Promise.allSettled(sourceConfigs.map((sourceConfig) => fetchSourceItems(sourceConfig, extraQuery)))
  const items = []

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      items.push(...result.value)
    } else {
      failures.push({
        source: sourceConfigs[index].id,
        error: result.reason?.message || "Feed fetch failed.",
      })
    }
  })

  const seen = new Set()
  const rankedItems = items
    .filter((item) => item.title && item.url)
    .filter((item) => sourceAllowed(item, source))
    .filter((item) => withinWindow(item, days))
    .map((item) => ({ item, score: scoreItem(item), timestamp: itemDate(item.publishedAt) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
    .filter(({ item }) => {
      const key = `${item.sourceName}:${item.title}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  const selectedItems = source === "all" ? balancedSourceMix(rankedItems, limit) : rankedItems.slice(0, limit)
  const articles = selectedItems
    .map(({ item }, index) => toCommunityArticle(item, index))

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    note: "External links are intended for signed-in community readers and should not be rendered into the anonymous HTML page.",
    filters: {
      source,
      limit,
      days,
      q: extraQuery,
    },
    sources: sourceConfigs.map(({ id, name, homepage }) => ({ id, name, homepage })),
    articles,
    failures,
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

  const qs = event?.queryStringParameters || {}
  const requestedSource = normalizeQuery(qs.source || "all").toLowerCase()
  const source = requestedSource === "marketwatch" || requestedSource === "reuters" ? requestedSource : "all"
  const limit = clampInteger(qs.limit, DEFAULT_LIMIT, 1, MAX_LIMIT)
  const days = clampInteger(qs.days, DEFAULT_DAYS, 1, MAX_DAYS)
  const extraQuery = normalizeQuery(qs.q)
  const refresh = String(qs.refresh || "") === "1"
  const cacheKey = JSON.stringify({ source, limit, days, extraQuery })

  if (!refresh && memoryCache.payload && memoryCache.key === cacheKey && memoryCache.expiresAt > Date.now()) {
    return jsonResponse({
      ...memoryCache.payload,
      cache: "memory-hit",
    })
  }

  try {
    const payload = await buildPayload({ source, limit, days, extraQuery })
    memoryCache = {
      key: cacheKey,
      expiresAt: Date.now() + 15 * 60 * 1000,
      payload,
    }
    return jsonResponse({
      ...payload,
      cache: "miss",
    })
  } catch (error) {
    console.error("job-market-news failed:", error?.message || error)
    return jsonResponse(
      {
        ok: false,
        error: error?.message || "Job market news fetch failed.",
      },
      500
    )
  }
}
