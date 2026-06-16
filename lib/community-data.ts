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
    title: "After the Iran ceasefire, military hiring enters a quieter but harder phase",
    summary:
      "The ceasefire does not prove a recruiting drawdown is underway. It does make the manpower question sharper: whether the next force is built by adding more people, or by moving more hiring power into cyber, logistics, autonomous systems, maintenance, and precision-strike support.",
    body: [
      "The first thing to say about a post-Iran-ceasefire hiring drawdown is that it has not yet been proved. There is no public evidence that the ceasefire itself caused a formal U.S. recruiting freeze, a service-wide cut to accession targets, or a sudden retreat from end-strength planning. The more careful read is also the more interesting one: once the immediate pressure of a regional crisis eases, the manpower debate moves out of emergency mode and into design mode.",
      "That debate begins from a stronger recruiting baseline than many people remember. The Department of Defense reported that the services met or exceeded fiscal 2025 recruiting goals, with the Army, Navy, Air Force, Space Force, and Marine Corps all reaching their targets. This is not a hollow-force story. It is a story about a military that rebuilt recruiting momentum and now has to decide where the next marginal hire actually belongs.",
      "During an active crisis, the instinct is to preserve optionality. Keep recruiters moving. Protect end strength. Refill delayed-entry pools. Avoid sending a signal that the force is shrinking while the conflict is still hot. After a ceasefire, the question gets quieter but harder: should the next billet be a conventional accession, a cyber operator, a maintainer, a drone technician, a logistics planner, a space operations specialist, or a civilian engineer working inside the defense ecosystem?",
      "That is why the cleanest drawdown signal will probably not be a single headline number. A modern military can reduce hiring pressure in some occupations while increasing it in others. Precision weapons, autonomous systems, artificial intelligence, ISR networks, cyber operations, shipyard capacity, and software-enabled logistics do not make people irrelevant. They change where people are most valuable. From the outside, that can look like a slowdown. From inside the force, it may be a reallocation.",
      "The European experience helps frame the danger and the appeal. After the Cold War, many NATO countries reduced active-duty personnel and leaned harder into professionalization, technology, and alliance assumptions. Figure 1 shows the broad shape of that post-1991 contraction. The savings case is real, and Figure 2 shows why finance ministries notice it. But the reversals after Russia's 2014 seizure of Crimea and especially after the 2022 full-scale invasion of Ukraine are the warning label: a smaller force only works if reserves, industry, logistics, munitions, and alliances can carry the missing mass.",
      "The ceasefire with Iran also revives the argument that some modern conflicts pass through decisive phases quickly. The Gulf War, Kosovo, Libya, the 2025 India-Pakistan clashes, and the Israel-Iran exchanges are often cited by people who believe precision strike, airpower, intelligence, and diplomatic pressure can compress the calendar. Figure 4 captures that short-war temptation. But Iraq, Afghanistan, and Russia-Ukraine sit on the same timeline for a reason. Long wars have not disappeared; they have become easier to underestimate.",
      "For labor-market watchers, the practical test is job mix. A genuine cooling pattern would show up in fewer broad enlistment pushes, softer recruiter demand, less surge contracting, or fewer postings tied to expeditionary operations. A transformation pattern would look different: steady or rising demand for maintainers, analysts, software specialists, electronic warfare operators, logistics planners, shipyard labor, AI talent, and space or cyber personnel even if some conventional accession pressure eases.",
      "The fiscal argument is unavoidable. Military personnel costs include pay, housing, healthcare, retirement, training, and veterans' obligations. The Congressional Budget Office has put total military compensation in the hundreds of billions of dollars when Defense Department and veterans' benefits are viewed together. Figure 5 sketches why even modest personnel changes attract attention. But the chart should not be read as a promise of easy savings. Separations, retraining, readiness risk, contractor substitution, and benefit obligations can swallow a lot of the near-term upside.",
      "The broader defense workforce also complicates the word 'drawdown.' Figure 6 shows the active-duty force as only one layer of a larger stack that includes reserve components, the National Guard, DoD civilians, and contractors. Work can move across that stack without disappearing. A smaller uniformed hiring class can still coincide with more civilian technical hiring, more depot work, more contractor logistics, or more reserve reliance.",
      "FreeJobData's read is cautious: the ceasefire creates space for a drawdown debate, not proof that a drawdown is happening. The key labor-market question is shifting from 'How many people should the military recruit?' to 'Which jobs should the military stop filling by habit, which should it protect, and which technical pipelines should it grow before the next crisis arrives?' The next signal will come from accession targets, recruiter staffing, defense civilian hiring, contractor solicitations, and occupational-level demand across cyber, ISR, logistics, maintenance, autonomous systems, and precision-strike support."
    ],
    figures: [
      {
        title: "European active-duty personnel index, 1955-2025",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-1-europe-active-duty.svg",
        alt: "Line chart showing indexed active-duty personnel trends for the UK, France, Germany, Netherlands, Denmark, and Sweden from 1955 to 2025, with 1991, 2014, and 2022 annotated.",
        caption:
          "Indexed view, 1991 = 100. The pattern shows how selected European forces moved lower after the Cold War, then faced renewed pressure after Crimea in 2014 and Russia's full-scale invasion of Ukraine in 2022."
      },
      {
        title: "Estimated cumulative personnel savings from post-Cold War reductions",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-2-personnel-savings.svg",
        alt: "Stacked area chart estimating cumulative inflation-adjusted personnel savings from post-Cold War personnel reductions.",
        caption:
          "Avoided personnel costs can accumulate over time, but the path is uneven. Transition costs, readiness risk, retraining, and contractor substitution can reduce near-term savings."
      },
      {
        title: "NATO active-duty personnel versus defense spending",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-3-nato-personnel-spending.svg",
        alt: "Scatter plot comparing NATO active-duty personnel and defense spending, with the United States highlighted as an outlier.",
        caption:
          "The United States remains an outlier in both spending and active-duty scale, which is why a U.S. hiring drawdown debate has different fiscal and strategic stakes than a small-country force review."
      },
      {
        title: "Operational duration comparison",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-4-conflict-duration.svg",
        alt: "Timeline comparing approximate operational durations of Gulf War, Kosovo, Libya, India-Pakistan 2025, Israel-Iran exchanges, Iraq, Afghanistan, and Russia-Ukraine.",
        caption:
          "Short, high-intensity campaigns support the precision-force argument, while Iraq, Afghanistan, and Russia-Ukraine remain warnings against assuming every war ends quickly."
      },
      {
        title: "U.S. active-duty reduction scenarios and payroll savings",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-5-us-reduction-scenarios.svg",
        alt: "Bar chart showing estimated annual payroll savings from 5 percent, 10 percent, 15 percent, and 20 percent U.S. active-duty personnel reductions.",
        caption:
          "Estimated annual payroll effect using a 1.3 million active-duty baseline and an $89,000 direct pay and allowance assumption per billet. The estimate excludes separation costs, readiness costs, contractor replacement, and long-tail benefits."
      },
      {
        title: "U.S. defense workforce stack",
        image: "/news/iran-ceasefire-us-military-hiring-drawdown/figure-6-force-workforce-stack.svg",
        alt: "Stacked bar showing active duty, reserve, National Guard, DoD civilians, and contractors as parts of the broader defense workforce.",
        caption:
          "A hiring drawdown in one segment can move work into civilians, contractors, reserve capacity, or technical specialty pipelines rather than reducing total labor demand."
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
  },
  {
    id: "high-salary-jobs-are-not-overwhelmingly-stem",
    title: "High-salary jobs are no longer speaking only in STEM",
    summary:
      "FreeJobData's high-salary context found 1,028 active listings with salary midpoints at or above $120,000.",
    body: [
      "The old map of high salary work was easy to draw in a career guide: follow the bright line through software, engineering, data, medicine, and finance. Learn the technical language. Move toward the lab, the terminal, the trading floor, the operating room. Somewhere near the end of that path, the six-figure job would appear like a lit building at the edge of town.",
      "The current JobDataPool signal is less tidy. In FreeJobData's high-salary metrics view, the filter is mechanical: active listings with parseable salary ranges whose midpoint is at least $120,000. That screen produced 1,028 active postings in the June 16 snapshot, with a median salary midpoint of $192,381 and 100% salary coverage inside the context. If this were simply a STEM story, the role table should look like a parade of software architects, machine learning engineers, and data platform leads. It does not.",
      "The first thing the table does is walk into a hospital. Veterans Health Administration alone accounts for 528 high-salary active postings, more than half of the context. Military Treatment Facilities under DHA adds 34. Defense Health Agency adds 11. The top roles include Clinical Psychologist, Physician Assistant (Primary Care), Staff Psychologist (BHIP), and Staff Psychologist - Primary Care-Mental Health Integration. The money is not only chasing code; it is chasing licensed judgment, clinical scarcity, and public systems that cannot function without credentialed care.",
      "Then the table walks into a courthouse. The Executive Office for U.S. Attorneys and the Office of the U.S. Attorneys has 21 high-salary active listings. Assistant United States Attorney (Criminal), Assistant United States Attorney (Civil), and Attorney Advisor all appear among the fast-growing role rows, each with three active postings in the high-salary context. These are not STEM jobs in the common sense. They are institutional trust jobs: roles where the wage is attached to discretion, risk, interpretation, and consequence.",
      "There is still engineering in the room. GENERAL ENGINEER and General Engineer, AST, Technical Management (Direct Hire) appear in the role list, with median salary points of $133,505 and $153,020. Technology also appears as an industry bucket with 111 high-salary active jobs. But the point is proportion. Engineering is present; it is not alone at the head table. The high-wage labor market looks less like a single technical ladder and more like a crowded control room where healthcare, law, government, defense, finance, marketing, and technical operations are all trying to hire adults who can carry liability.",
      "Even the oddities in the taxonomy are useful. The high-salary industry table includes 0602 - Medical Officer with 418 active jobs, 0610 - Nurse with 62, 0905 - Attorney with 55, and 0180 - Psychology with 46. It also includes rough listing metadata such as 2000 Supply and 7405 - Bartending, which should be read cautiously rather than poetically. The lesson is not that bartending suddenly became the road to $192,000. The lesson is that job-market data arrives with classification noise, and the best reading comes from triangulating the employer, role, salary, and industry together.",
      "The geography reinforces the same idea. Washington, DC shows 65 high-salary active listings. San Antonio has 20. Fargo has 16. Amarillo and Augusta each show 14. Houston has 13. Woodlawn, Maryland has 12. Columbia, Missouri has 11. This is not only the Bay Area or Seattle story. Some of the expensive work is attached to federal gravity, hospital networks, military medicine, regional care systems, and agencies that hire where the mission is, not where venture capital gathers.",
      "Remote work barely shows up. The high-salary context has a 0.6% remote share, meaning the money in this slice is mostly tied to place. That is another break from the popular tech-era picture, where high pay and laptop mobility became culturally fused. The JobDataPool snapshot suggests a different high-wage world: exam rooms, federal offices, command structures, courtrooms, clinics, and specialized sites where presence is part of the job design.",
      "This does not mean STEM stopped mattering. It means STEM became too small a word for the top of the labor market. Some high-salary jobs are technical because the work is mathematically or computationally difficult. Others are expensive because the labor supply is credentialed, the stakes are high, the employer is public, the role is hard to fill, or the cost of failure is enormous. A clinical psychologist, an assistant U.S. attorney, a physician assistant, a director of marketing, and a general engineer do not share one academic department. They share a labor-market condition: the employer needs someone specific, and not enough specific people are available.",
      "The better phrase may be scarce judgment. High salary roles increasingly pay for judgment under constraint: diagnose, prosecute, manage, certify, lead, interpret, design, defend, comply, coordinate. Some of that judgment is STEM-shaped. Some of it is legal. Some of it is clinical. Some of it is organizational. The common feature is that the worker is not interchangeable, and the institution cannot automate its way around the vacancy quickly enough.",
      "FreeJobData's read is that career advice has to catch up. The high-salary market is not a clean STEM monopoly, and it is not a clean anti-STEM reversal either. It is a mixed market for credentialed authority, public-sector durability, healthcare scarcity, specialized operations, and technical competence. The old advice said to chase the future by learning to code. The new data says the future also needs people who can sign the chart, argue the case, run the clinic, lead the campaign, certify the system, and take responsibility when the spreadsheet becomes a person."
    ],
    sources: [
      {
        label: "JobDataPool API and listings data",
        href: "https://jobdatapool.com/#api"
      },
      {
        label: "Bureau of Labor Statistics Occupational Employment and Wage Statistics",
        href: "https://www.bls.gov/oes/"
      }
    ],
    author: "FreeJobData Team",
    type: "team",
    publishedAt: "2026-06-16",
    location: "United States",
    role: "High-salary roles",
    industry: "Labor market analytics",
    factuality: "High Signal",
    confidence: 84,
    sourceCount: 2,
    coordinates: [-98.5795, 39.8283],
    tags: ["high salary jobs", "STEM", "healthcare hiring", "legal jobs", "JobDataPool"]
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
