import { absoluteUrl, siteUrl } from "@/lib/seo"
import type { Dataset, Report } from "@/lib/types"

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FreeJobData",
        url: siteUrl,
        sameAs: ["https://jobdatapool.com"]
      }}
    />
  )
}

export function DatasetJsonLd({ dataset }: { dataset: Dataset }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: dataset.title,
        description: dataset.description,
        url: absoluteUrl(`/datasets/${dataset.slug}`),
        dateModified: dataset.updatedAt,
        license: dataset.license,
        creator: {
          "@type": "Organization",
          name: "FreeJobData"
        },
        distribution: dataset.sampleCsvUrl
          ? [
              {
                "@type": "DataDownload",
                encodingFormat: "text/csv",
                contentUrl: absoluteUrl(dataset.sampleCsvUrl)
              }
            ]
          : []
      }}
    />
  )
}

export function ArticleJsonLd({ report }: { report: Report }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: report.title,
        description: report.summary,
        datePublished: report.publishedAt,
        dateModified: report.updatedAt,
        url: absoluteUrl(`/reports/${report.slug}`),
        publisher: {
          "@type": "Organization",
          name: "FreeJobData"
        }
      }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path)
        }))
      }}
    />
  )
}
