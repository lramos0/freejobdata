import Link from "next/link"
import { buildMetadata } from "@/lib/seo"
import { locationRecords } from "@/lib/data"

export const metadata = buildMetadata({
  title: "Location Hiring Trends",
  description: "Browse city, state, metro, and country hiring trend pages with active jobs, role mix, and remote share.",
  path: "/locations"
})

export default function LocationsPage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Locations</p>
        <h1>Location hiring trend pages.</h1>
        <p className="lede">Compare hiring demand across cities, states, metros, and countries.</p>
      </section>
      <section className="section grid">
        {locationRecords.map((record) => (
          <Link className="card" href={`/locations/${record.slug}`} key={record.slug}>
            <span className="pill">{record.metrics.activeJobs} active jobs</span>
            <h3>{record.name}</h3>
            <p className="muted">{record.description}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
