import {
  getCommunityArticles,
  getJobPostingLocationSignals,
  type CommunityArticleSnapshot,
  type JobPostingLocationSignalSnapshot
} from "./metrics-hydration"

export type CommunityArticle = CommunityArticleSnapshot
export type CommunityArticleType = CommunityArticle["type"]
export type JobPostingLocationSignal = JobPostingLocationSignalSnapshot

export const communityArticles = getCommunityArticles()
export const jobPostingLocationSignals = getJobPostingLocationSignals()

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
