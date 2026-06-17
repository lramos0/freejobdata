import { CommunityHub } from "@/components/community/CommunityHub"
import { BreadcrumbJsonLd } from "@/components/JsonLd"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "News & Community Intelligence",
  description:
    "Explore FreeJobData job-market news, Reddit OSINT, S&P 500 company boards, and a map of job posting locations.",
  path: "/community"
})

export default function CommunityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "News & Community", path: "/community" }
        ]}
      />
      <section className="community-page-intro">
        <p className="eyebrow">News & Community</p>
        <h1>Job market news and community signals.</h1>
        <p>
          FreeJobData articles, source checks, maps, Reddit OSINT, and company boards built around JobDataPool hiring
          data.
        </p>
      </section>
      <CommunityHub />
    </>
  )
}
