"use client"

import { useMemo, useState } from "react"
import DeckGL from "@deck.gl/react"
import type { PickingInfo } from "@deck.gl/core"
import { Map } from "react-map-gl/maplibre"
import { getJobPostingLocationSignals, type JobPostingLocationSignalSnapshot } from "@/lib/metrics-hydration"
import { JobIntelPulseLayer } from "./JobIntelPulseLayer"

const initialViewState = {
  longitude: -96.8,
  latitude: 39.5,
  zoom: 3.35,
  pitch: 42,
  bearing: -12
}

export function CommunityMap() {
  const jobPostingLocationSignals = getJobPostingLocationSignals()
  const [selectedLocationId, setSelectedLocationId] = useState(jobPostingLocationSignals[0]?.id)
  const selectedLocation = jobPostingLocationSignals.find((location) => location.id === selectedLocationId)

  const layers = useMemo(
    () => [
      new JobIntelPulseLayer({
        id: "freejobdata-job-intel-pulse-layer",
        data: jobPostingLocationSignals,
        selectedLocationId
      })
    ],
    [jobPostingLocationSignals, selectedLocationId]
  )

  return (
    <section className="community-map-shell">
      <div className="community-map-toolbar">
        <div>
          <p className="eyebrow">GIS mode</p>
          <h2>Job posting location signal map</h2>
        </div>
        <div className="map-tools" aria-label="Map tools">
          <button type="button">Pan</button>
          <button type="button">Select</button>
          <button type="button">Measure</button>
          <button type="button">Export</button>
        </div>
      </div>
      <div className="community-map-grid">
        <div className="community-map-canvas">
          <DeckGL
            initialViewState={initialViewState}
            controller
            layers={layers}
            getTooltip={({ object }: PickingInfo<JobPostingLocationSignalSnapshot>) =>
              object
                ? {
                    html: `<strong>${object.name}</strong><br/>${object.activeJobs.toLocaleString()} active jobs<br/>${object.newJobs7d} new jobs, 7d<br/>Dominant role: ${object.dominantRole}`
                  }
                : null
            }
            onClick={({ object }: PickingInfo<JobPostingLocationSignalSnapshot>) => {
              if (object) {
                setSelectedLocationId(object.id)
              }
            }}
          >
            <Map
              reuseMaps
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              attributionControl={false}
            />
          </DeckGL>
          <div className="map-crosshair" aria-hidden="true" />
        </div>
        <aside className="map-side-panel">
          <h3>Layer stack</h3>
          <label>
            <input type="checkbox" checked readOnly /> Job posting locations
          </label>
          <label>
            <input type="checkbox" checked readOnly /> Hiring-signal arcs
          </label>
          <label>
            <input type="checkbox" checked readOnly /> Location labels
          </label>
          <div className="map-inspector">
            <span className="pill">Target column: job posting location</span>
            <h3>{selectedLocation?.name ?? "Select a location"}</h3>
            {selectedLocation ? (
              <>
                <dl>
                  <dt>Active jobs</dt>
                  <dd>{selectedLocation.activeJobs.toLocaleString()}</dd>
                  <dt>New jobs, 7d</dt>
                  <dd>{selectedLocation.newJobs7d}</dd>
                  <dt>Remote share</dt>
                  <dd>{selectedLocation.remoteShare}%</dd>
                  <dt>Signal score</dt>
                  <dd>{selectedLocation.signalScore}/100</dd>
                </dl>
                <p className="muted">
                  Dominant role: {selectedLocation.dominantRole}. Industry: {selectedLocation.industry}.
                </p>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}
