import type { Metadata } from "next"

/** Primary document title for Google and social previews (homepage + site default). */
export const siteTitle =
  "Open source job datasets, metrics, and social hub around the US job data pool"

export const siteDescription =
  "Open source job datasets, metrics, and social hub around the US job data pool. Explore free reports, hiring trends, and dataset samples powered by JobDataPool."

type MetadataInput = {
  title: string
  description: string
  path: string
  image?: string
  index?: boolean
}

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return configured
  }

  // Netlify sets URL (and DEPLOY_PRIME_URL) at build time for production and previews.
  const netlifyUrl = process.env.URL?.trim() || process.env.DEPLOY_PRIME_URL?.trim()
  if (netlifyUrl) {
    return netlifyUrl
  }

  return "https://freejobdata.com"
}

export const siteUrl = resolveSiteUrl().replace(/\/$/, "")

export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function buildMetadata({ title, description, path, image, index = true }: MetadataInput): Metadata {
  const url = absoluteUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    robots: index ? "index, follow" : "noindex, follow",
    openGraph: {
      title,
      description,
      url,
      siteName: "FreeJobData",
      type: "website",
      images: image ? [{ url: image }] : []
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : []
    }
  }
}
