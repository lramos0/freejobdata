const GOOGLE_LANGUAGE_ENDPOINT = "https://language.googleapis.com/v1/documents:analyzeSentiment"
const REDDIT_USER_AGENT = "freejobdata-community-insights/0.1"

const jobTerms = [
  "job",
  "jobs",
  "hiring",
  "career",
  "careers",
  "interview",
  "salary",
  "layoff",
  "layoffs",
  "resume",
  "recruiter",
  "offer",
  "remote",
  "onsite",
  "hybrid",
  "work",
  "employment",
  "role"
]

const localPhraseSentiment = [
  ["accepted offer", 2.7],
  ["got an offer", 2.5],
  ["landed an offer", 2.5],
  ["dream job", 2.4],
  ["great interview", 2.0],
  ["strong pipeline", 1.9],
  ["fast response", 1.6],
  ["quick response", 1.5],
  ["good culture", 1.5],
  ["fair salary", 1.4],
  ["salary increase", 1.8],
  ["pay increase", 1.7],
  ["remote friendly", 1.5],
  ["actively hiring", 2.1],
  ["hiring surge", 2.0],
  ["opening roles", 1.7],
  ["more openings", 1.6],
  ["recruiter reached out", 1.4],
  ["final round", 1.2],
  ["onsite interview", 0.8],
  ["career growth", 1.8],
  ["work life balance", 1.4],
  ["no layoffs", 1.5],
  ["not rejected", 1.0],
  ["not ghosted", 1.0],
  ["hiring freeze", -2.5],
  ["offer rescinded", -3.0],
  ["offers rescinded", -3.0],
  ["rescinded offer", -3.0],
  ["mass layoffs", -3.2],
  ["laid off", -2.8],
  ["got laid off", -3.0],
  ["rounds of layoffs", -2.7],
  ["ghosted by recruiter", -2.4],
  ["no response", -1.8],
  ["rejected after", -2.2],
  ["low salary", -1.7],
  ["salary is low", -1.8],
  ["pay is low", -1.8],
  ["pay cut", -2.3],
  ["process is chaotic", -1.5],
  ["toxic culture", -2.7],
  ["burned out", -2.4],
  ["burnt out", -2.4],
  ["bad manager", -2.0],
  ["terrible interview", -2.5],
  ["failed interview", -2.2],
  ["application rejected", -2.2],
  ["auto rejected", -2.1],
  ["black hole", -1.8],
  ["return to office", -0.9],
  ["rto mandate", -1.4],
  ["impossible requirements", -1.7],
  ["entry level requires experience", -1.8],
  ["fake job", -2.3],
  ["fake posting", -2.3],
  ["scam job", -2.5]
]

const localWordSentiment = {
  accepted: 1.7,
  accessible: 1.1,
  advance: 1.2,
  advanced: 1.1,
  amazing: 2.1,
  awesome: 2.0,
  balanced: 1.1,
  benefit: 1.0,
  benefits: 1.0,
  bonus: 1.1,
  booming: 1.9,
  clear: 0.9,
  comfortable: 1.0,
  competitive: 1.1,
  confident: 1.4,
  constructive: 1.0,
  excellent: 2.2,
  fair: 1.1,
  flexible: 1.2,
  friendly: 1.1,
  gain: 1.1,
  growth: 1.5,
  happy: 1.6,
  hired: 2.1,
  hiring: 0.25,
  hopeful: 1.1,
  improved: 1.3,
  improving: 1.2,
  increase: 1.2,
  interview: 0.15,
  interviews: 0.15,
  landed: 1.6,
  matched: 1.0,
  offer: 1.8,
  offers: 1.8,
  opening: 1.0,
  openings: 1.0,
  opportunity: 1.4,
  paid: 0.8,
  positive: 1.4,
  promoted: 1.8,
  promotion: 1.8,
  raise: 1.7,
  referral: 1.2,
  responsive: 1.2,
  stable: 1.1,
  strong: 1.2,
  success: 1.7,
  transparent: 1.1,
  win: 1.5,
  won: 1.5,
  abrupt: -1.1,
  anxious: -1.2,
  awful: -2.4,
  bad: -1.5,
  bait: -1.5,
  blocked: -1.2,
  burnout: -2.1,
  chaotic: -1.5,
  concerning: -1.2,
  confusing: -1.1,
  cut: -1.4,
  cuts: -1.6,
  decline: -1.5,
  declined: -1.6,
  desperate: -1.7,
  difficult: -1.0,
  exploitative: -2.4,
  failed: -1.8,
  fired: -2.6,
  freeze: -1.9,
  frustrating: -1.7,
  ghosted: -2.4,
  impossible: -1.8,
  layoffs: -2.6,
  layoff: -2.6,
  low: -0.7,
  lowball: -1.9,
  lowballed: -2.0,
  negative: -1.4,
  overworked: -1.8,
  rejected: -2.2,
  rejection: -2.0,
  rescinded: -2.7,
  scam: -2.5,
  stressful: -1.6,
  terrible: -2.5,
  toxic: -2.6,
  underpaid: -2.0,
  unstable: -1.9,
  vague: -1.0,
  worried: -1.3,
  worse: -1.7,
  worst: -2.8
}

const sentimentNegators = new Set([
  "aint",
  "aren't",
  "barely",
  "cannot",
  "can't",
  "couldn't",
  "didn't",
  "doesn't",
  "don't",
  "hardly",
  "isn't",
  "lack",
  "lacks",
  "never",
  "no",
  "none",
  "not",
  "nothing",
  "rarely",
  "wasn't",
  "weren't",
  "without",
  "won't"
])

const sentimentBoosters = {
  absolutely: 0.35,
  extremely: 0.4,
  highly: 0.3,
  incredibly: 0.4,
  massively: 0.45,
  really: 0.25,
  significantly: 0.35,
  so: 0.2,
  super: 0.3,
  very: 0.25
}

const sentimentDampeners = {
  almost: -0.15,
  barely: -0.35,
  kindof: -0.25,
  kind: -0.1,
  little: -0.2,
  mildly: -0.25,
  mostly: -0.1,
  partially: -0.2,
  pretty: -0.05,
  slightly: -0.3,
  somewhat: -0.25
}

const contrastTerms = new Set(["but", "however", "though", "although", "except", "yet"])
const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "was",
  "were",
  "you",
  "your",
  "about",
  "into",
  "across",
  "various",
  "term",
  "text"
])

const fallbackSubreddits = [
  {
    name: "jobs",
    title: "Jobs",
    subscribers: 0,
    publicDescription: "Broad job-search discussion, applications, interviews, and offer questions.",
    keywords: ["job", "jobs", "hiring", "offer", "applications", "employment"]
  },
  {
    name: "careerguidance",
    title: "Career Guidance",
    subscribers: 0,
    publicDescription: "Career path advice, workplace decisions, compensation, and next-step planning.",
    keywords: ["career", "careers", "salary", "promotion", "growth", "work"]
  },
  {
    name: "recruitinghell",
    title: "Recruiting Hell",
    subscribers: 0,
    publicDescription: "Recruiting process pain points, ghosting, interviews, and hiring-market frustration.",
    keywords: ["recruiter", "recruiting", "ghosted", "interview", "interviews", "rejected"]
  },
  {
    name: "resumes",
    title: "Resumes",
    subscribers: 0,
    publicDescription: "Resume reviews, cover letters, applicant tracking systems, and portfolio feedback.",
    keywords: ["resume", "resumes", "cv", "applications", "portfolio"]
  },
  {
    name: "remotework",
    title: "Remote Work",
    subscribers: 0,
    publicDescription: "Remote roles, hybrid policies, distributed teams, and work-from-home discussion.",
    keywords: ["remote", "hybrid", "onsite", "work-from-home", "wfh"]
  },
  {
    name: "cscareerquestions",
    title: "CS Career Questions",
    subscribers: 0,
    publicDescription: "Software engineering careers, technical interviews, internships, and tech hiring.",
    keywords: ["software", "engineer", "engineering", "developer", "tech", "coding"]
  },
  {
    name: "datascience",
    title: "Data Science",
    subscribers: 0,
    publicDescription: "Data science careers, analytics roles, ML interviews, and portfolio signals.",
    keywords: ["data", "analyst", "analytics", "science", "machine", "ml"]
  },
  {
    name: "nursing",
    title: "Nursing",
    subscribers: 0,
    publicDescription: "Nursing careers, hospital roles, shifts, credentials, and healthcare workplace discussion.",
    keywords: ["nurse", "nursing", "healthcare", "hospital", "medical"]
  }
]

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  }
}

function normalizeTerm(term) {
  return String(term || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 240)
}

function extractKeywords(text) {
  const words = String(text || "")
    .toLowerCase()
    .match(/[a-z][a-z0-9+.#-]{2,}/g)
  const counts = new Map()

  for (const word of words || []) {
    if (stopWords.has(word)) continue
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  for (const term of jobTerms) {
    if (text.toLowerCase().includes(term)) {
      counts.set(term, (counts.get(term) || 0) + 2)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word]) => word)
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function tokenizeSentimentText(text) {
  return (
    String(text || "")
      .match(/[A-Za-z][A-Za-z'-]*|[!?]+/g)
      ?.map((raw) => ({
        raw,
        value: raw.toLowerCase().replace(/[’]/g, "'").replace(/^-+|-+$/g, "")
      }))
      .filter((token) => token.value) || []
  )
}

function hasMixedCase(tokens) {
  const words = tokens.filter((token) => /^[a-z]/i.test(token.raw))
  return words.some((token) => token.raw === token.raw.toUpperCase() && token.raw.length > 2) && words.some(
    (token) => token.raw !== token.raw.toUpperCase()
  )
}

function previousTokens(tokens, index, windowSize = 3) {
  return tokens.slice(Math.max(0, index - windowSize), index).map((token) => token.value)
}

function modifierFor(tokens, index) {
  const priorTokens = previousTokens(tokens, index)
  const hasNegation = priorTokens.some((token) => sentimentNegators.has(token))
  const boost = priorTokens.reduce((amount, token) => amount + (sentimentBoosters[token] || 0), 0)
  const dampen = priorTokens.reduce((amount, token) => amount + (sentimentDampeners[token] || 0), 0)

  return {
    hasNegation,
    multiplier: Math.max(0.35, 1 + boost + dampen)
  }
}

function scorePhrases(normalized) {
  const matches = []

  for (const [phrase, weight] of localPhraseSentiment) {
    const pattern = new RegExp(`(^|\\W)${escapeRegex(phrase)}(\\W|$)`, "g")
    const count = normalized.match(pattern)?.length || 0
    if (!count) continue

    matches.push({
      token: phrase,
      weight: weight * count,
      count,
      type: "phrase"
    })
  }

  return matches
}

function contrastIndex(tokens) {
  return tokens.findIndex((token) => contrastTerms.has(token.value))
}

function normalizeLocalScore(rawScore) {
  if (rawScore === 0) {
    return 0
  }

  const normalized = rawScore / Math.sqrt(rawScore * rawScore + 15)
  return Math.max(-1, Math.min(1, normalized))
}

function localSentiment(text) {
  const normalized = String(text || "").toLowerCase().replace(/[’]/g, "'")
  const tokens = tokenizeSentimentText(text)
  const mixedCase = hasMixedCase(tokens)
  const phraseMatches = scorePhrases(normalized)
  const contrastAt = contrastIndex(tokens)
  const evidence = [...phraseMatches]
  let rawScore = phraseMatches.reduce((score, match) => score + match.weight, 0)
  let absoluteScore = phraseMatches.reduce((score, match) => score + Math.abs(match.weight), 0)
  let scoredTerms = phraseMatches.reduce((count, match) => count + match.count, 0)

  tokens.forEach((token, index) => {
    const baseWeight = localWordSentiment[token.value]
    if (!baseWeight) return

    const modifier = modifierFor(tokens, index)
    let weightedScore = baseWeight * modifier.multiplier

    if (modifier.hasNegation) {
      weightedScore *= -0.75
    }

    if (mixedCase && token.raw === token.raw.toUpperCase() && token.raw.length > 2) {
      weightedScore *= 1.18
    }

    if (contrastAt >= 0) {
      weightedScore *= index > contrastAt ? 1.35 : 0.65
    }

    rawScore += weightedScore
    absoluteScore += Math.abs(weightedScore)
    scoredTerms += 1
    evidence.push({
      token: token.value,
      weight: weightedScore,
      type: modifier.hasNegation ? "negated-word" : "word"
    })
  })

  const exclamationCount = (String(text || "").match(/!/g) || []).length
  if (exclamationCount && rawScore !== 0) {
    const punctuationBoost = Math.min(0.45, exclamationCount * 0.12)
    rawScore += Math.sign(rawScore) * punctuationBoost
    absoluteScore += punctuationBoost
  }

  const questionClusters = (String(text || "").match(/\?{2,}/g) || []).length
  if (questionClusters && rawScore < 0.4) {
    rawScore -= Math.min(0.35, questionClusters * 0.15)
    absoluteScore += Math.min(0.35, questionClusters * 0.15)
  }

  const score = normalizeLocalScore(rawScore)
  const confidence = Math.max(0.15, Math.min(0.96, scoredTerms / Math.max(3, tokens.length / 4)))
  const magnitude = Math.min(4, absoluteScore / Math.max(1, Math.sqrt(Math.max(1, tokens.length / 2))))

  return {
    score: Number(score.toFixed(3)),
    magnitude: Number(magnitude.toFixed(3)),
    label: score > 0.12 ? "positive" : score < -0.12 ? "negative" : "neutral",
    source: "local-fallback",
    confidence: Number(confidence.toFixed(2)),
    evidence: evidence
      .sort((first, second) => Math.abs(second.weight) - Math.abs(first.weight))
      .slice(0, 8)
      .map((match) => ({
        token: match.token,
        weight: Number(match.weight.toFixed(2)),
        type: match.type
      }))
  }
}

async function googleSentiment(text) {
  const apiKey = process.env.GOOGLE_CLOUD_LANGUAGE_API_KEY || process.env.GOOGLE_NATURAL_LANGUAGE_API_KEY
  if (!apiKey) {
    return localSentiment(text)
  }

  try {
    const response = await fetch(`${GOOGLE_LANGUAGE_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: {
          type: "PLAIN_TEXT",
          content: text
        },
        encodingType: "UTF8"
      })
    })

    if (!response.ok) {
      return localSentiment(text)
    }

    const data = await response.json()
    const score = Number(data.documentSentiment?.score || 0)
    const magnitude = Number(data.documentSentiment?.magnitude || 0)
    return {
      score,
      magnitude,
      label: score > 0.15 ? "positive" : score < -0.15 ? "negative" : "neutral",
      source: "google-cloud-language"
    }
  } catch {
    return localSentiment(text)
  }
}

async function redditJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": REDDIT_USER_AGENT,
      Accept: "application/json"
    }
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

async function searchSubreddits(query) {
  const data = await redditJson(
    `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=8`
  )

  return (
    data?.data?.children?.map((child) => {
      const subreddit = child.data
      return {
        name: subreddit.display_name,
        title: subreddit.title || subreddit.display_name_prefixed,
        subscribers: Number(subreddit.subscribers || 0),
        url: `https://www.reddit.com${subreddit.url}`,
        publicDescription: String(subreddit.public_description || "").slice(0, 220)
      }
    }) || []
  )
}

async function searchPosts(query) {
  const data = await redditJson(
    `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10`
  )

  return (
    data?.data?.children?.map((child) => {
      const post = child.data
      return {
        subreddit: post.subreddit,
        title: post.title,
        score: Number(post.score || 0),
        comments: Number(post.num_comments || 0),
        url: `https://www.reddit.com${post.permalink}`
      }
    }) || []
  )
}

function scoreFallbackSubreddits(query, keywords, jobRelated) {
  const normalized = `${query} ${keywords.join(" ")}`.toLowerCase()

  return fallbackSubreddits
    .map((subreddit) => {
      const keywordScore = subreddit.keywords.reduce(
        (score, keyword) => score + (normalized.includes(keyword) ? 3 : 0),
        0
      )
      return {
        score: keywordScore + (jobRelated ? 1 : 0),
        subreddit
      }
    })
    .sort((a, b) => b.score - a.score || a.subreddit.name.localeCompare(b.subreddit.name))
    .slice(0, 8)
    .map(({ subreddit }) => ({
      name: subreddit.name,
      title: subreddit.title,
      subscribers: subreddit.subscribers,
      url: `https://www.reddit.com/r/${subreddit.name}/`,
      publicDescription: subreddit.publicDescription,
      fallback: true
    }))
}

function mergeSubreddits(primary, fallback) {
  const seen = new Set()
  const merged = []

  for (const subreddit of [...primary, ...fallback]) {
    const key = subreddit.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(subreddit)
    if (merged.length === 8) break
  }

  return merged
}

function fallbackPosts(query, subreddits) {
  return subreddits.slice(0, 4).map((subreddit) => ({
    subreddit: subreddit.name,
    title: `Search r/${subreddit.name} for "${query}"`,
    score: 0,
    comments: 0,
    url: `https://www.reddit.com/r/${subreddit.name}/search/?q=${encodeURIComponent(query)}&restrict_sr=1`,
    fallback: true
  }))
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {})
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Use POST." })
  }

  let payload
  try {
    payload = JSON.parse(event.body || "{}")
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." })
  }

  const query = normalizeTerm(payload.term || payload.text)
  if (!query) {
    return json(400, { ok: false, error: "Missing term." })
  }

  const keywords = extractKeywords(query)
  const jobRelated = jobTerms.some((term) => query.toLowerCase().includes(term))
  const mergedQuery = [...new Set([query, ...keywords.slice(0, 4), ...(jobRelated ? ["jobs", "hiring"] : [])])].join(" ")
  const sentiment = await googleSentiment(query)
  const [redditSubreddits, redditPosts] = await Promise.all([searchSubreddits(mergedQuery), searchPosts(mergedQuery)])
  const associatedSubreddits = mergeSubreddits(
    redditSubreddits,
    scoreFallbackSubreddits(mergedQuery, keywords, jobRelated)
  )
  const posts = redditPosts.length > 0 ? redditPosts : fallbackPosts(query, associatedSubreddits)

  return json(200, {
    ok: true,
    query,
    normalizedQuery: mergedQuery,
    jobRelated,
    sentiment,
    keywords,
    subreddits: associatedSubreddits,
    posts
  })
}
