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
    id: "google-reddit-ai-generated-content-response",
    title: "Google, Reddit, and the provenance fight over AI-generated content",
    summary:
      "AI did not just flood the web with cheap pages. It made search engines and platforms care more about who controls a domain, where content came from, and whether promotion is authentic.",
    body: [
      "The public story about AI-generated content is usually told as a quality problem: too many pages, too little originality, too much synthetic text. The more important shift is a provenance problem. Search engines and platforms are trying to answer a harder question: who is responsible for this content, who benefits from it ranking, and whether the user can trust the context around it.",
      "Google has not publicly announced a simple rule that says a site must register its domain in Search Console to rank. The open web still works through crawling, indexing, canonical signals, links, sitemaps, structured data, and content quality. But the direction of travel is clear: if a publisher wants diagnostics, manual-action notices, reconsideration paths, sitemap visibility, ownership controls, and stronger proof that it is the legitimate operator of a domain, Google pushes that work through verified site ownership.",
      "That matters because AI content makes ownership and responsibility harder to infer. Search Console verification is not new, but in an AI-heavy web it becomes part of the trust stack. Google says verified owners get the highest level of permissions because Search Console exposes sensitive data and lets owners take actions that affect a site's presence in Search. In practice, the burden of proving who controls a domain sits with the publisher.",
      "Google's AI-content guidance is also more nuanced than 'AI bad, human good.' Google says its ranking systems focus on content quality rather than the method of production, and that high-quality content should demonstrate expertise, experience, authoritativeness, and trustworthiness. The target is not AI as a writing tool. The target is scaled, unoriginal, manipulative content built to capture rankings instead of helping people.",
      "The March 2024 spam policy changes made that line sharper. Google called out expired domain abuse, scaled content abuse, and site reputation abuse. Those categories map directly onto the AI-spam economy: buy or borrow trust, generate pages at scale, and use someone else's domain authority to make low-value content look more credible than it is.",
      "This is where Reddit becomes unusually important. Reddit is one of the few large platforms where public conversations still look like messy human judgment: product complaints, troubleshooting threads, niche advice, local experience, and unpolished disagreement. Google and Reddit both describe their 2024 partnership as giving Google structured access to Reddit's public content through Reddit's Data API, including fresher signals that help Google understand, display, train on, and otherwise use Reddit content.",
      "That does not mean Reddit is literally Google's single source of truth. It does mean Reddit has become a privileged human-signal layer in an internet increasingly filled with synthetic pages. Users already append 'reddit' to searches when they want an answer that feels less like SEO copy. Google has an incentive to surface those conversations; Reddit has an incentive to license and control access to them.",
      "Reddit's response has been to treat public content as valuable infrastructure. Its public content policy says Reddit may share public content with researchers, developers, moderators, and data licensees, while drawing a line around private user data. Reporting from The Verge also showed Reddit blocking some search engines and AI crawlers from recent content unless they had acceptable agreements, leaving Google in a stronger position because of its deal.",
      "The anti-spam side follows naturally. If Reddit threads become high-value inputs for Google Search and AI answers, then Reddit becomes a more attractive target for marketers trying to manufacture consensus. Reddit's platform rules already tell users to participate authentically and avoid spam or content manipulation. Subreddit moderators can also remove posts under local rules, which is why link drops, coordinated upvotes, sockpuppet accounts, and thin self-promotion often disappear even when the poster thinks the submission is harmless.",
      "There is also a useful difference between an outage signal and a suppression signal. DownDetector can show whether Reddit is broadly having access or posting problems at the platform level. When DownDetector is quiet but public posts on X describe accounts, domains, or promotional posts as being shadowbanned, that points to a different kind of complaint: not that Reddit is down for everyone, but that specific users believe anti-spam or moderation systems are reducing their visibility.",
      "FreeJobData treats those X posts as anecdotal, not definitive platform data. But the pattern is still worth watching because marketers now talk openly on X about Reddit visibility, Reddit SEO, new-account restrictions, and posts disappearing after promotional behavior. That chatter is a weak signal, but it lines up with the incentive shift: if Reddit discussions influence Google and AI discovery, then attempts to manufacture Reddit consensus become more valuable, and the platform has more reason to suppress obvious manipulation.",
      "It is tempting to describe this as Reddit forcing promoters into paid accounts, but that is not the cleanest reading of the available evidence. Reddit Premium does not appear to be a public exemption from anti-spam systems. The paid layer that clearly matters is not an individual user's premium subscription; it is licensed, enforceable data access for companies that want to crawl, train on, or commercially use Reddit's public corpus.",
      "The result is a new bargain for publishers and builders. On Google, ownership verification, structured data, sitemaps, and clear authorship are becoming the cost of being legible. On Reddit, authentic participation is becoming the cost of being allowed to contribute without looking like SEO manipulation. AI-generated content can still be useful, but content without provenance, originality, or community legitimacy is getting easier for platforms to classify as noise.",
      "FreeJobData's read is that the next SEO fight will be less about whether text was generated by AI and more about whether the surrounding signals look accountable. Who owns the domain? Who wrote or edited the page? What evidence is cited? Is the content original, or just a scaled summary of what already ranks? And when the conversation moves to Reddit, is the user participating like a person or trying to convert a community into a backlink machine?"
    ],
    sources: [
      {
        label: "Google Search guidance on AI-generated content",
        href: "https://developers.google.com/search/blog/2023/02/google-search-and-ai-content"
      },
      {
        label: "Google guidance on helpful, reliable, people-first content",
        href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
      },
      {
        label: "Google Search spam policies",
        href: "https://developers.google.com/search/docs/essentials/spam-policies"
      },
      {
        label: "Google March 2024 core update and spam policies",
        href: "https://developers.google.com/search/blog/2024/03/core-update-spam-policies"
      },
      {
        label: "Google Search Console ownership verification help",
        href: "https://support.google.com/webmasters/answer/9008080"
      },
      {
        label: "Google announcement of expanded Reddit partnership",
        href: "https://blog.google/company-news/inside-google/company-announcements/expanded-reddit-partnership/"
      },
      {
        label: "Reddit announcement of expanded Google partnership",
        href: "https://redditinc.com/news/reddit-and-google-expand-partnership"
      },
      {
        label: "Reddit public content policy",
        href: "https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy"
      },
      {
        label: "Reddit Rules on authentic participation and content manipulation",
        href: "https://redditinc.com/policies/reddit-rules"
      },
      {
        label: "The Verge on Reddit blocking some crawlers and search engines",
        href: "https://www.theverge.com/2024/7/24/24205244/reddit-blocking-search-engine-crawlers-ai-bot-google"
      },
      {
        label: "DownDetector Reddit status reports",
        href: "https://downdetector.com/status/reddit/"
      },
      {
        label: "X search: Reddit shadowbanned SEO posts",
        href: "https://x.com/search?q=reddit%20shadowbanned%20SEO&src=typed_query&f=live"
      }
    ],
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-09",
    location: "United States",
    role: "Publishers and search-visible builders",
    industry: "Search and AI",
    factuality: "High Signal",
    confidence: 86,
    sourceCount: 12,
    coordinates: [-98.5795, 39.8283],
    tags: ["AI content", "Google Search", "Reddit", "SEO", "provenance"]
  },
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
  },
  {
    id: "iran-ceasefire-us-military-hiring-drawdown",
    title: "After the Iran ceasefire, the U.S. military hiring question shifts from volume to mix",
    summary:
      "The ceasefire does not prove a recruiting drawdown is underway. It does make the manpower question sharper: how much hiring should support mass force structure, and how much should move toward technical, cyber, autonomous, logistics, and precision-strike roles?",
    body: [
      "The post-Iran-ceasefire debate is easy to overstate. There is not yet public evidence that the ceasefire itself caused a formal U.S. military recruiting drawdown, a hiring freeze, or a service-wide reduction in accession targets. The safer reading is narrower and more useful: a ceasefire lowers the immediate pressure for emergency expansion, and that gives defense planners more room to ask whether the next hiring cycle should emphasize headcount, specialized skills, or a different balance between the two.",
      "That distinction matters because U.S. recruiting was not weak going into this moment. The Department of Defense reported that the services met or exceeded fiscal 2025 recruiting goals, with the Army, Navy, Air Force, Space Force, and Marine Corps all reaching their targets. In other words, the baseline is not a hollow force looking for any warm body. The baseline is a force that recently rebuilt recruiting momentum after several difficult years.",
      "A ceasefire can still change the hiring conversation without changing the official target overnight. During an active regional crisis, the political and operational instinct is to preserve optionality: keep recruiters busy, protect end strength, refill delayed-entry pools, and avoid signaling weakness. After a ceasefire, the question becomes less about immediate mobilization and more about the composition of the next force. Should the marginal recruit fill a traditional billet, a cyber role, a maintenance pipeline, a drone unit, a logistics cell, a space operations team, or a civilian technical support function?",
      "That is the real drawdown signal to watch. A modern military can reduce hiring pressure in some occupations while increasing it in others. Precision weapons, autonomous systems, artificial intelligence, ISR networks, cyber operations, and software-enabled logistics do not eliminate manpower, but they change where manpower has the highest value. A smaller hiring class in one field paired with a larger class in another can look like a drawdown from the outside while functioning as a reallocation inside the force.",
      "The Iran ceasefire also revived the argument that some modern conflicts move through decisive phases faster than Cold War planners expected. The Gulf War, Kosovo, Libya, the 2025 India-Pakistan clashes, and the Israel-Iran exchanges are often cited as cases where precision strike, airpower, intelligence, and diplomatic pressure compressed timelines. That does not mean long wars are obsolete. Russia's invasion of Ukraine is the obvious counterexample: industrial capacity, ammunition stocks, mobilization depth, air defense, drones, trenches, and attrition still matter when a conflict does not end quickly.",
      "For U.S. labor-market watchers, this means the drawdown thesis should be tested through job mix rather than headlines alone. A true post-ceasefire cooling pattern would show up in fewer broad enlistment pushes, softer recruiter demand, reduced contracting for surge support, or fewer postings tied to expeditionary operations. A transformation pattern would look different: continued demand for maintainers, analysts, software specialists, electronic warfare operators, logistics planners, shipyard labor, AI talent, and space or cyber personnel even if some conventional accession pressure eases.",
      "Fiscal pressure is part of the story. Military personnel costs include pay, housing, healthcare, retirement, training, and veterans' obligations. The Congressional Budget Office has put total military compensation in the hundreds of billions of dollars when Defense Department and veterans' benefits are viewed together. Any serious drawdown argument therefore has a budget logic behind it, but savings are not automatic. Separations, retraining, recruiting pipeline changes, contractor substitution, and readiness risk can absorb some of the near-term fiscal benefit.",
      "Europe's post-Cold War experience is a useful warning label. Many NATO countries reduced active-duty personnel after 1991 while investing in professionalization and technology. After Russia's 2014 seizure of Crimea and especially after the 2022 full-scale invasion of Ukraine, several had to revisit those assumptions. The lesson is not that drawdowns are always wrong. The lesson is that personnel reductions are only durable when they are matched by industrial capacity, reserves, alliances, logistics depth, and realistic assumptions about the wars a country might actually have to fight.",
      "FreeJobData's read is that the ceasefire with Iran should not be treated as proof that the U.S. military is done hiring. It should be treated as a stress test for the old manpower model. The key labor-market question is shifting from 'How many people should the military recruit?' to 'Which jobs should the military stop filling by default, which should it protect, and which technical pipelines should it grow before the next crisis arrives?'",
      "For now, the most defensible conclusion is cautious: the ceasefire creates political space for a hiring drawdown debate, not proof of a drawdown. The next signal will come from accession targets, recruiter staffing, defense civilian hiring, contractor solicitations, and occupational-level demand across cyber, ISR, logistics, maintenance, autonomous systems, and precision-strike support."
    ],
    figures: [
      {
        title: "European active-duty personnel index, 1955-2025",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-1-europe-active-duty.svg",
        alt: "Line chart showing indexed active-duty personnel trends for the UK, France, Germany, Netherlands, Denmark, and Sweden from 1955 to 2025, with 1991, 2014, and 2022 annotated.",
        caption:
          "Indexed analytical view, 1991 = 100. The figure summarizes the post-Cold War personnel contraction pattern using public NATO, SIPRI, IISS, and national defense ministry reference ranges; it should be treated as a production visual summary, not a replacement for a full historical personnel table."
      },
      {
        title: "Estimated cumulative personnel savings from post-Cold War reductions",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-2-personnel-savings.svg",
        alt: "Stacked area chart estimating cumulative inflation-adjusted personnel savings from post-Cold War personnel reductions.",
        caption:
          "Scenario estimate showing how avoided personnel costs can accumulate over time. Transition costs, readiness risk, retraining, and contractor substitution can reduce near-term savings."
      },
      {
        title: "NATO active-duty personnel versus defense spending",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-3-nato-personnel-spending.svg",
        alt: "Scatter plot comparing NATO active-duty personnel and defense spending, with the United States highlighted as an outlier.",
        caption:
          "Comparative NATO labor-market frame. The United States remains an outlier in both spending and active-duty scale, which is why a U.S. hiring drawdown debate has different fiscal and strategic stakes than a small-country force review."
      },
      {
        title: "Operational duration comparison",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-4-conflict-duration.svg",
        alt: "Timeline comparing approximate operational durations of Gulf War, Kosovo, Libya, India-Pakistan 2025, Israel-Iran exchanges, Iraq, Afghanistan, and Russia-Ukraine.",
        caption:
          "Approximate duration timeline. Short, high-intensity campaigns support the precision-force argument, while Iraq, Afghanistan, and Russia-Ukraine remain warnings against assuming every war ends quickly."
      },
      {
        title: "U.S. active-duty reduction scenarios and payroll savings",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-5-us-reduction-scenarios.svg",
        alt: "Bar chart showing estimated annual payroll savings from 5 percent, 10 percent, 15 percent, and 20 percent U.S. active-duty personnel reductions.",
        caption:
          "Scenario model using a 1.3 million active-duty baseline and an $89,000 direct pay and allowance proxy per billet. The chart excludes separation costs, readiness costs, contractor replacement, and long-tail benefits."
      },
      {
        title: "U.S. defense workforce stack",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-6-force-workforce-stack.svg",
        alt: "Stacked bar showing active duty, reserve, National Guard, DoD civilians, and contractors as parts of the broader defense workforce.",
        caption:
          "Conceptual workforce diagram. A hiring drawdown in one segment can move work into civilians, contractors, reserve capacity, or technical specialty pipelines rather than reducing total labor demand."
      }
    ],
    sources: [
      {
        label: "AP on the U.S.-Iran ceasefire framework and pending formal signing",
        href: "https://apnews.com/article/77406473da38c6c126818610a219dc20"
      },
      {
        label: "Department of Defense report on fiscal 2025 recruiting results",
        href: "https://www.defense.gov/News/News-Stories/Article/Article/4365687/fy25-sees-best-recruiting-numbers-in-15-years/"
      },
      {
        label: "Department of Defense recruiting task force update on the 2025 enlistment surge",
        href: "https://www.defense.gov/News/News-Stories/Article/Article/4228479/recruitment-task-force-seeks-to-capitalize-on-2025-enlistment-surge/"
      },
      {
        label: "Congressional Budget Office military personnel topic page",
        href: "https://www.cbo.gov/topics/defense-and-national-security/military-personnel"
      },
      {
        label: "Congressional Budget Office Atlas of Military Compensation, 2024",
        href: "https://www.cbo.gov/publication/60886"
      },
      {
        label: "NATO defence expenditure reports and personnel data",
        href: "https://www.nato.int/en/what-we-do/introduction-to-nato/defence-expenditures-and-natos-5-commitment"
      },
      {
        label: "NATO Defence Expenditure of NATO Countries, 2014-2025",
        href: "https://www.nato.int/en/news-and-events/articles/news/2025/08/28/defence-expenditure-of-nato-countries-2014-2025"
      },
      {
        label: "SIPRI Military Expenditure Database",
        href: "https://milex.sipri.org/sipri"
      }
    ],
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-15",
    location: "United States",
    role: "Military recruiting and defense labor markets",
    industry: "Defense and national security",
    factuality: "Developing",
    confidence: 78,
    sourceCount: 8,
    coordinates: [-98.5795, 39.8283],
    tags: ["military hiring", "Iran ceasefire", "defense workforce", "recruiting", "force structure"]
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
