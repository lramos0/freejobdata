import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Press",
  description: "Press resources, citation guidance, and contact details for FreeJobData labor market datasets and reports.",
  path: "/press"
})

export default function PressPage() {
  return (
    <section className="hero">
      <p className="eyebrow">Press</p>
      <h1>Hiring data for journalists and researchers.</h1>
      <p className="lede">
        Cite FreeJobData reports with attribution to FreeJobData and JobDataPool. For full historical exports,
        custom slices, or embargoed analysis, use the JobDataPool API.
      </p>
      <a className="button" href="https://jobdatapool.com">
        Contact via JobDataPool
      </a>
    </section>
  )
}
