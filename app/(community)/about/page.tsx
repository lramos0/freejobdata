import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "About",
  description: "About FreeJobData, a free job market publication and dataset portal powered by JobDataPool.",
  path: "/about"
})

export default function AboutPage() {
  return (
    <section className="hero">
      <p className="eyebrow">About</p>
      <h1>FreeJobData is the public research layer for JobDataPool.</h1>
      <p className="lede">
        We publish open hiring signals, free dataset samples, and readable labor market reports that help people
        understand where companies are hiring and which roles are growing.
      </p>
    </section>
  )
}
