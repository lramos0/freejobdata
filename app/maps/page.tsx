import { CommunityMap } from "@/components/community/CommunityMap"
import { buildMetadata } from "@/lib/seo"

export const metadata = buildMetadata({
  title: "Job Posting Location Maps",
  description:
    "Explore FreeJobData's Deck.gl GIS map for job posting locations, hiring-signal arcs, active jobs, and regional labor market intelligence.",
  path: "/maps"
})

export default function MapsPage() {
  return (
    <div className="maps-page">
      <section className="maps-hero">
        <div>
          <p className="eyebrow">Maps</p>
          <h1>Hiring geography, rendered like an intelligence layer.</h1>
          <p className="lede">
            The map targets the JobDataPool job posting location column and turns active listings, new jobs, remote
            share, and dominant roles into a GIS-style analysis surface.
          </p>
        </div>
        <div className="maps-legend-card">
          <span className="pill">Deck.gl custom layer</span>
          <h3>JobIntelPulseLayer</h3>
          <p className="muted">
            Pulses show active-job density. Arcs highlight strongest hiring-signal flows. Select any location to
            inspect the local market.
          </p>
        </div>
      </section>
      <CommunityMap />
    </div>
  )
}
