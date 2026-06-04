import { SEO_THRESHOLDS } from "../lib/thresholds"

type RawJob = {
  id: string
  company: string
  title: string
  location: string
  description?: string
  salary?: string
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function detectRemoteStatus(job: RawJob) {
  const haystack = `${job.title} ${job.location} ${job.description ?? ""}`.toLowerCase()

  if (haystack.includes("remote")) {
    return "remote"
  }

  if (haystack.includes("hybrid")) {
    return "hybrid"
  }

  return "onsite"
}

function detectSalaryRange(job: RawJob) {
  const salaryText = `${job.salary ?? ""} ${job.description ?? ""}`
  const matches = salaryText.match(/\$?\d{2,3}(?:,\d{3})?/g)

  return matches?.slice(0, 2).map((match) => Number(match.replace(/[$,]/g, ""))) ?? []
}

async function fetchJobs(): Promise<RawJob[]> {
  const apiUrl = process.env.JOBDATAPOOL_API_URL
  const apiKey = process.env.JOBDATAPOOL_INTERNAL_API_KEY

  if (!apiUrl) {
    console.warn("JOBDATAPOOL_API_URL is not set. Using an empty sync payload.")
    return []
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/jobs`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
  })

  if (!response.ok) {
    throw new Error(`JobDataPool sync failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<RawJob[]>
}

async function main() {
  const jobs = await fetchJobs()
  const normalized = jobs.map((job) => ({
    jobId: job.id,
    companySlug: normalizeSlug(job.company),
    roleSlug: normalizeSlug(job.title),
    locationSlug: normalizeSlug(job.location),
    remoteStatus: detectRemoteStatus(job),
    salaryRange: detectSalaryRange(job)
  }))

  console.log(
    JSON.stringify(
      {
        syncedJobs: normalized.length,
        thresholds: SEO_THRESHOLDS,
        nextSteps: [
          "Persist normalized companies, roles, locations, and industries.",
          "Deduplicate active postings.",
          "Create daily metric snapshots.",
          "Skip or noindex entities below SEO thresholds."
        ]
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
