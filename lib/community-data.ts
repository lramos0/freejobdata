export type CommunityArticleType = "team" | "community"
export type IntelligenceView = "default" | "map"

export type CommunityArticle = {
  id: string
  title: string
  summary: string
  author: string
  type: CommunityArticleType
  publishedAt: string
  location: string
  role: string
  industry: string
  factuality: "High Signal" | "Mixed Signal" | "Developing"
  confidence: number
  sourceCount: number
  coordinates: [number, number]
  tags: string[]
}

export type JobPostingLocationSignal = {
  id: string
  name: string
  coordinates: [number, number]
  activeJobs: number
  newJobs7d: number
  remoteShare: number
  signalScore: number
  dominantRole: string
  industry: string
}

export const communityArticles: CommunityArticle[] = [
  {
    id: "team-ai-sf",
    title: "AI infrastructure teams are clustering new headcount around San Francisco again",
    summary:
      "FreeJobData detected a sharp rise in ML platform, inference, and applied AI roles attached to Bay Area job posting locations.",
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-04",
    location: "San Francisco, CA",
    role: "Machine Learning Engineer",
    industry: "Artificial Intelligence",
    factuality: "High Signal",
    confidence: 91,
    sourceCount: 42,
    coordinates: [-122.4194, 37.7749],
    tags: ["AI", "infrastructure", "Bay Area"]
  },
  {
    id: "community-san-diego",
    title: "San Diego climate-tech hiring looks undercounted in national job boards",
    summary:
      "Community contributors flagged clean energy and hardware-adjacent postings that appear in niche boards before broader aggregators.",
    author: "Maya Chen",
    type: "community",
    publishedAt: "2026-06-03",
    location: "San Diego, CA",
    role: "Electrical Engineer",
    industry: "Climate Tech",
    factuality: "Developing",
    confidence: 73,
    sourceCount: 18,
    coordinates: [-117.1611, 32.7157],
    tags: ["climate", "hardware", "regional"]
  },
  {
    id: "team-ny-fintech",
    title: "Fintech product hiring is widening across New York engineering offices",
    summary:
      "Role normalization shows product managers and backend engineers moving together across fintech postings with New York locations.",
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-02",
    location: "New York, NY",
    role: "Product Manager",
    industry: "Financial Technology",
    factuality: "High Signal",
    confidence: 88,
    sourceCount: 35,
    coordinates: [-74.006, 40.7128],
    tags: ["fintech", "product", "New York"]
  },
  {
    id: "community-austin-security",
    title: "Austin security roles are showing a remote-first spillover pattern",
    summary:
      "Community observations line up with rising hybrid and remote cybersecurity postings using Austin as the official job location.",
    author: "Devon Ruiz",
    type: "community",
    publishedAt: "2026-06-01",
    location: "Austin, TX",
    role: "Security Engineer",
    industry: "Cybersecurity",
    factuality: "Mixed Signal",
    confidence: 79,
    sourceCount: 24,
    coordinates: [-97.7431, 30.2672],
    tags: ["cybersecurity", "remote", "Texas"]
  },
  {
    id: "team-seattle-data",
    title: "Seattle data infrastructure postings are rebounding faster than general software roles",
    summary:
      "New jobs and active postings suggest stronger demand for data engineers, analytics engineers, and platform teams.",
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-05-31",
    location: "Seattle, WA",
    role: "Data Engineer",
    industry: "Data Infrastructure",
    factuality: "High Signal",
    confidence: 86,
    sourceCount: 31,
    coordinates: [-122.3321, 47.6062],
    tags: ["data", "platform", "Seattle"]
  },
  {
    id: "community-boston-health",
    title: "Boston health-tech postings are blending research and product titles",
    summary:
      "Community reviewers found ambiguous titles where research scientists are being hired into production data product teams.",
    author: "Priya Shah",
    type: "community",
    publishedAt: "2026-05-30",
    location: "Boston, MA",
    role: "Data Scientist",
    industry: "Healthcare",
    factuality: "Developing",
    confidence: 68,
    sourceCount: 16,
    coordinates: [-71.0589, 42.3601],
    tags: ["healthcare", "data science", "Boston"]
  }
]

export const jobPostingLocationSignals: JobPostingLocationSignal[] = [
  {
    id: "san-francisco-ca",
    name: "San Francisco, CA",
    coordinates: [-122.4194, 37.7749],
    activeJobs: 1840,
    newJobs7d: 216,
    remoteShare: 38,
    signalScore: 94,
    dominantRole: "Machine Learning Engineer",
    industry: "Artificial Intelligence"
  },
  {
    id: "new-york-ny",
    name: "New York, NY",
    coordinates: [-74.006, 40.7128],
    activeJobs: 2130,
    newJobs7d: 249,
    remoteShare: 31,
    signalScore: 89,
    dominantRole: "Product Manager",
    industry: "Financial Technology"
  },
  {
    id: "seattle-wa",
    name: "Seattle, WA",
    coordinates: [-122.3321, 47.6062],
    activeJobs: 1210,
    newJobs7d: 142,
    remoteShare: 42,
    signalScore: 84,
    dominantRole: "Data Engineer",
    industry: "Data Infrastructure"
  },
  {
    id: "austin-tx",
    name: "Austin, TX",
    coordinates: [-97.7431, 30.2672],
    activeJobs: 980,
    newJobs7d: 118,
    remoteShare: 47,
    signalScore: 81,
    dominantRole: "Security Engineer",
    industry: "Cybersecurity"
  },
  {
    id: "san-diego-ca",
    name: "San Diego, CA",
    coordinates: [-117.1611, 32.7157],
    activeJobs: 720,
    newJobs7d: 84,
    remoteShare: 29,
    signalScore: 76,
    dominantRole: "Electrical Engineer",
    industry: "Climate Tech"
  },
  {
    id: "boston-ma",
    name: "Boston, MA",
    coordinates: [-71.0589, 42.3601],
    activeJobs: 890,
    newJobs7d: 96,
    remoteShare: 34,
    signalScore: 78,
    dominantRole: "Data Scientist",
    industry: "Healthcare"
  }
]

export function communityArticleBreakdown(articles = communityArticles) {
  const team = articles.filter((article) => article.type === "team").length
  const community = articles.length - team
  const highSignal = articles.filter((article) => article.factuality === "High Signal").length

  return {
    total: articles.length,
    team,
    community,
    highSignal,
    averageConfidence: Math.round(
      articles.reduce((sum, article) => sum + article.confidence, 0) / Math.max(articles.length, 1)
    )
  }
}
