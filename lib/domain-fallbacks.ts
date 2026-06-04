import type { Company } from "./types"

const homeDomain = "freejobdata.com"

const knownCompanyDomains: Record<string, string> = {
  openai: "openai.com",
  stripe: "stripe.com",
  airbnb: "airbnb.com",
  databricks: "databricks.com",
  anthropic: "anthropic.com",
  figma: "figma.com",
  snowflake: "snowflake.com",
  cloudflare: "cloudflare.com",
  doordash: "doordash.com",
  shopify: "shopify.com"
}

export function safeCompanyDomain(company: Pick<Company, "slug" | "domain">) {
  return knownCompanyDomains[company.slug] ?? homeDomain
}

export function withSafeCompanyDomains(companies: Company[]) {
  return companies.map((company) => ({
    ...company,
    domain: safeCompanyDomain(company)
  }))
}
