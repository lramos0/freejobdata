import type { Company, Dataset, EntityRecord, Industry, Location, MetricSnapshot, Report, Role } from "./types"

const today = "2026-06-04"

const companyNames = [
  ["openai", "OpenAI", "Artificial intelligence"],
  ["stripe", "Stripe", "Financial technology"],
  ["airbnb", "Airbnb", "Travel"],
  ["databricks", "Databricks", "Data infrastructure"],
  ["anthropic", "Anthropic", "Artificial intelligence"],
  ["figma", "Figma", "Design software"],
  ["snowflake", "Snowflake", "Data infrastructure"],
  ["cloudflare", "Cloudflare", "Cloud infrastructure"],
  ["doordash", "DoorDash", "Local commerce"],
  ["shopify", "Shopify", "Commerce"]
] as const

const roleNames = [
  ["software-engineer", "Software Engineer", "Engineering"],
  ["data-scientist", "Data Scientist", "Data"],
  ["product-manager", "Product Manager", "Product"],
  ["machine-learning-engineer", "Machine Learning Engineer", "AI"],
  ["sales-development-representative", "Sales Development Representative", "Sales"],
  ["customer-success-manager", "Customer Success Manager", "Customer Success"],
  ["security-engineer", "Security Engineer", "Security"],
  ["data-engineer", "Data Engineer", "Data"],
  ["frontend-engineer", "Frontend Engineer", "Engineering"],
  ["ai-research-scientist", "AI Research Scientist", "AI"]
] as const

const locationNames = [
  ["san-francisco-ca", "San Francisco, CA", "city", "California"],
  ["new-york-ny", "New York, NY", "city", "New York"],
  ["seattle-wa", "Seattle, WA", "city", "Washington"],
  ["austin-tx", "Austin, TX", "city", "Texas"],
  ["san-diego-ca", "San Diego, CA", "city", "California"],
  ["boston-ma", "Boston, MA", "city", "Massachusetts"],
  ["chicago-il", "Chicago, IL", "city", "Illinois"],
  ["denver-co", "Denver, CO", "city", "Colorado"],
  ["california", "California", "state", "California"],
  ["united-states", "United States", "country", undefined]
] as const

const industryNames = [
  ["artificial-intelligence", "Artificial Intelligence"],
  ["financial-technology", "Financial Technology"],
  ["healthcare", "Healthcare"],
  ["software", "Software"],
  ["ecommerce", "Ecommerce"],
  ["cybersecurity", "Cybersecurity"],
  ["data-infrastructure", "Data Infrastructure"],
  ["climate-tech", "Climate Tech"]
] as const

function metric(entityType: MetricSnapshot["entityType"], entityId: string, activeJobs: number): MetricSnapshot {
  return {
    id: `${entityType}-${entityId}-${today}`,
    entityType,
    entityId,
    date: today,
    activeJobs,
    newJobs7d: Math.max(4, Math.round(activeJobs * 0.12)),
    closedJobs7d: Math.max(2, Math.round(activeJobs * 0.08)),
    growthWoW: Number((activeJobs % 17 / 10 + 1.2).toFixed(1)),
    growthMoM: Number((activeJobs % 23 / 5 + 3.4).toFixed(1)),
    remoteShare: Number((22 + (activeJobs % 39)).toFixed(1)),
    medianSalary: 98000 + activeJobs * 120,
    salaryCoverage: 38 + (activeJobs % 32)
  }
}

function trend(activeJobs: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, index) => ({
    label,
    value: Math.round(activeJobs * (0.78 + index * 0.048))
  }))
}

function expandSeed(
  seed: readonly (readonly [string, string, string?])[],
  total: number,
  prefix: string
) {
  const base = seed.map(([slug, name, category]) => ({ slug, name, category }))
  const generated = Array.from({ length: Math.max(0, total - base.length) }, (_, index) => {
    const number = index + 1
    return {
      slug: `${prefix}-${number}`,
      name: `${prefix
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ")} ${number}`,
      category: seed[index % seed.length]?.[2]
    }
  })

  return [...base, ...generated]
}

export const seedCompanies: Company[] = expandSeed(companyNames, 50, "growth-company").map(
  ({ slug, name, category }, index) => ({
    id: `company-${index + 1}`,
    slug,
    name,
    industry: category,
    domain: slug.includes("growth-company") ? "freejobdata.com" : `${slug}.com`,
    description: `${name} hiring activity, role demand, remote share, and location concentration.`
  })
)

export const seedRoles: Role[] = expandSeed(roleNames, 50, "job-role").map(({ slug, name, category }, index) => ({
  id: `role-${index + 1}`,
  slug,
  title: name,
  normalizedTitle: name,
  category
}))

export const seedLocations: Location[] = locationNames.map(([slug, name, type, state], index) => ({
  id: `location-${index + 1}`,
  slug,
  name,
  type: type as Location["type"],
  state,
  country: "United States"
}))

export const seedIndustries: Industry[] = industryNames.map(([slug, name], index) => ({
  id: `industry-${index + 1}`,
  slug,
  name
}))

export const seedDatasets: Dataset[] = [
  ["free-job-postings-sample", "Free Job Postings Sample", "A sample of normalized job postings with company, role, location, remote status, and salary fields."],
  ["weekly-hiring-trends", "Weekly Hiring Trends", "Weekly active jobs, new postings, closed postings, and hiring growth by market segment."],
  ["top-hiring-companies", "Top Hiring Companies", "Ranked companies by active job volume, weekly growth, and role concentration."],
  ["remote-jobs", "Remote Jobs", "Remote and hybrid job postings by role, industry, company, and geography."],
  ["software-engineering-jobs", "Software Engineering Jobs", "Software engineering demand by company, role family, location, and salary availability."],
  ["ai-jobs", "AI Jobs", "AI, machine learning, and data science hiring trends across companies and markets."],
  ["location-demand", "Location Demand", "Location-level labor demand snapshots for cities, states, metros, and countries."]
].map(([slug, title, description], index) => ({
  id: `dataset-${index + 1}`,
  slug,
  title,
  description,
  schemaJson: {
    job_id: "Unique posting identifier",
    company: "Normalized company name",
    role: "Normalized job title",
    location: "Normalized location",
    remote_status: "remote, hybrid, or onsite",
    active_jobs: "Active job count for snapshot rows",
    snapshot_date: "ISO snapshot date"
  },
  sampleCsvUrl: `/samples/${slug}.csv`,
  fullDatasetCtaUrl: "https://jobdatapool.com/datasets",
  updatedAt: today,
  recordCount: 5000 + index * 1850,
  license: "Free sample data may be used with attribution to FreeJobData and JobDataPool."
}))

export const seedReports: Report[] = [
  ["weekly-job-market-report", "Weekly Job Market Report", "A weekly snapshot of US hiring momentum, remote share, and high-growth role families.", "weekly"],
  ["ai-hiring-trends", "AI Hiring Trends", "AI hiring remains concentrated among infrastructure, model, and applied product teams.", "industry"],
  ["remote-jobs-report", "Remote Jobs Report", "Remote-friendly postings remain strongest in software, data, and customer-facing technical roles.", "monthly"],
  ["software-engineer-job-market", "Software Engineer Job Market", "Software engineering demand is broadening across infrastructure, AI, and security teams.", "weekly"],
  ["top-hiring-companies", "Top Hiring Companies", "The fastest-growing hiring organizations show concentrated growth in product and engineering roles.", "company"],
  ["san-diego-hiring-trends", "San Diego Hiring Trends", "San Diego demand is strongest in software, life sciences, defense, and climate technology.", "location"]
].map(([slug, title, summary, reportType], index) => ({
  id: `report-${index + 1}`,
  slug,
  title,
  summary,
  bodyMarkdown:
    "Headline finding: hiring demand is uneven but measurable across company, role, and location segments.\n\nKey bullets:\n- Active postings increased in several high-intent segments.\n- Remote share varies sharply by role family.\n- Salary coverage remains highest for technical roles.\n- Company concentration creates useful market signals.\n\nMethodology: FreeJobData normalizes raw job postings into companies, roles, locations, industries, and daily metric snapshots.",
  reportType: reportType as Report["reportType"],
  publishedAt: today,
  updatedAt: today,
  relatedEntities: {
    companies: ["openai", "stripe"],
    roles: ["software-engineer", "machine-learning-engineer"],
    locations: ["san-francisco-ca", "san-diego-ca"],
    industries: ["artificial-intelligence"],
    datasets: ["weekly-hiring-trends", "free-job-postings-sample"]
  }
}))

export function seedCompanyRecord(company: Company, index: number): EntityRecord {
  const activeJobs = 12 + index * 3
  return {
    slug: company.slug,
    name: company.name,
    description: company.description,
    metrics: metric("company", company.id, activeJobs),
    trend: trend(activeJobs)
  }
}

export function seedRoleRecord(role: Role, index: number): EntityRecord {
  const activeJobs = 60 + index * 8
  return {
    slug: role.slug,
    name: role.title,
    description: `${role.title} demand by company, location, remote share, and salary coverage.`,
    metrics: metric("role", role.id, activeJobs),
    trend: trend(activeJobs)
  }
}

export function seedLocationRecord(location: Location, index: number): EntityRecord {
  const activeJobs = 120 + index * 145
  return {
    slug: location.slug,
    name: location.name,
    description: `${location.name} hiring trends by role, company, industry, and remote/on-site mix.`,
    metrics: metric("location", location.id, activeJobs),
    trend: trend(activeJobs)
  }
}

export function seedIndustryRecord(industry: Industry, index: number): EntityRecord {
  const activeJobs = 180 + index * 115
  return {
    slug: industry.slug,
    name: industry.name,
    description: `${industry.name} labor market demand across roles, companies, and locations.`,
    metrics: metric("industry", industry.id, activeJobs),
    trend: trend(activeJobs)
  }
}

export const seedCompanyRecords = seedCompanies.map(seedCompanyRecord)
export const seedRoleRecords = seedRoles.map(seedRoleRecord)
export const seedLocationRecords = seedLocations.map(seedLocationRecord)
export const seedIndustryRecords = seedIndustries.map(seedIndustryRecord)
