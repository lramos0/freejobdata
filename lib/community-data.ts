import {
  getCommunityArticles,
  getJobPostingLocationSignals,
  type CommunityArticleSnapshot,
  type JobPostingLocationSignalSnapshot
} from "./metrics-hydration"

export type CommunityArticle = CommunityArticleSnapshot
export type CommunityArticleType = CommunityArticle["type"]
export type JobPostingLocationSignal = JobPostingLocationSignalSnapshot

export const editorialCommunityArticles: CommunityArticle[] = [
  {
    id: "remote-work-all-or-nothing-retention-signal",
    title: "Remote work is becoming an all-or-nothing retention test",
    summary:
      "Some employers are no longer treating office policy as a perk debate. They are turning location into a compliance signal, and the burden is landing on individual workers.",
    body: [
      "The new divide in remote work is less about whether employees prefer home or office and more about whether a company treats location as a choice, a privilege, or a retention screen. In the holdout camp, employers are moving toward all-or-nothing rules: show up on the company schedule, accept a slower career path, relocate or rearrange your life, or leave.",
      "Amazon made that split explicit when CEO Andy Jassy framed the company policy as a return to office norms from before the onset of COVID-19 and set an expectation that employees be in the office five days a week. The memo also acknowledged that employees had organized personal routines around more flexible arrangements, which is the practical fault line in this debate: the policy may be corporate, but the disruption is household-level.",
      "The enforcement layer matters. HR Grapevine reported that Dell planned to classify employees using badge-swipe and VPN data, with color-coded attendance ratings and career implications for workers who did not meet the office benchmark. SFGATE reported that Meta managers were given badge data to monitor whether employees met the company's three-day office requirement, with repeated violations carrying consequences up to termination.",
      "Badge data itself is not new. Kastle's Back to Work Barometer has tracked building-access data from thousands of properties since the COVID crisis to show how often offices are being used. The sharper labor-market question is what happens when access signals move from facilities planning into workforce management, performance review, promotion eligibility, or layoff risk.",
      "That connection is starting to appear in macro labor commentary too. The Federal Reserve's September 2025 Beige Book said contacts in multiple districts reported reducing headcount through attrition, sometimes encouraged by return-to-office policies and automation. In plain English: RTO can function as a quiet reduction mechanism because some employees will opt out before the company has to formally cut them.",
      "This leaves the burden on the individual employee. A worker who was hired remote or built a life around remote flexibility may now have to decide whether to move, rebuild childcare, absorb a long commute, accept a constrained internal path, or quit. That choice is especially uneven for caregivers, disabled workers, military spouses, dual-career households, and employees priced out of headquarters markets.",
      "The broader narrative is also shifting. A January 2025 White House order directed federal agencies to end remote work arrangements and require full-time in-person work, subject to exemptions. Reporting on Randstad's leadership later framed the remote-work fight as effectively over for many roles, with full remote work becoming a privilege for scarce or top-performing talent rather than a broad labor standard.",
      "FreeJobData's read is that remote labels now need more skepticism. A company can advertise remote-friendly roles while also enforcing strict office compliance elsewhere. The useful signal is not just whether a posting says remote, hybrid, or on-site; it is whether the employer's actual workforce policy is flexible, tiered, or binary."
    ],
    sources: [
      {
        label: "Amazon CEO Andy Jassy memo on five-day office expectations",
        href: "https://www.aboutamazon.com/news/company-news/ceo-andy-jassy-latest-update-on-amazon-return-to-office-manager-team-ratio"
      },
      {
        label: "HR Grapevine on Dell badge-swipe and VPN attendance tracking",
        href: "https://www.hrgrapevine.com/us/content/article/2024-05-13-dell-to-color-code-employees-based-on-office-attendance-through-badge-swipes-vpn-monitoring"
      },
      {
        label: "SFGATE on Meta badge-data enforcement",
        href: "https://www.sfgate.com/tech/article/meta-threatens-return-to-office-layoffs-18303435.php"
      },
      {
        label: "Kastle Back to Work Barometer methodology and office access data",
        href: "https://www.kastle.com/safety-wellness/getting-america-back-to-work/"
      },
      {
        label: "Federal Reserve Beige Book, September 2025",
        href: "https://www.federalreserve.gov/monetarypolicy/files/BeigeBook_20250903.pdf"
      },
      {
        label: "White House return-to-in-person-work order, January 2025",
        href: "https://www.whitehouse.gov/presidential-actions/2025/01/return-to-in-person-work/"
      },
      {
        label: "Allwork.Space coverage of Randstad CEO remote-work comments",
        href: "https://allwork.space/2025/12/remote-work-is-now-a-privilege-reserved-for-only-top-talent-claims-ceo-of-worlds-largest-recruiting-firm/"
      }
    ],
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-09",
    location: "United States",
    role: "Remote and hybrid roles",
    industry: "Workplace policy",
    factuality: "High Signal",
    confidence: 88,
    sourceCount: 7,
    coordinates: [-98.5795, 39.8283],
    tags: ["remote work", "return to office", "badge data", "retention", "covid-era work"]
  }
]

export const communityArticles = [...editorialCommunityArticles, ...getCommunityArticles()]
export const jobPostingLocationSignals = getJobPostingLocationSignals()

export function findCommunityArticle(slug: string) {
  return communityArticles.find((article) => article.id === slug)
}

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
