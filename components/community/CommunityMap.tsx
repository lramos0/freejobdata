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
  const jobPostingLocationSignals = useMemo(() => getJobPostingLocationSignals(), [])
  const sortedSignals = useMemo(
    () => [...jobPostingLocationSignals].sort((a, b) => b.activeJobs - a.activeJobs),
    [jobPostingLocationSignals]
  )
  const maxActiveJobs = sortedSignals[0]?.activeJobs ?? 0
  const [selectedLocationId, setSelectedLocationId] = useState(sortedSignals[0]?.id)
  const [viewState, setViewState] = useState(initialViewState)
  const [showArcs, setShowArcs] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [minActiveJobs, setMinActiveJobs] = useState(0)

  const visibleSignals = useMemo(
    () => sortedSignals.filter((location) => location.activeJobs >= minActiveJobs),
    [minActiveJobs, sortedSignals]
  )
  const selectedLocation = visibleSignals.find((location) => location.id === selectedLocationId) ?? visibleSignals[0]
  const totalActiveJobs = visibleSignals.reduce((sum, location) => sum + location.activeJobs, 0)
  const totalNewJobs = visibleSignals.reduce((sum, location) => sum + location.newJobs7d, 0)
  const strongestSignal = visibleSignals.reduce<JobPostingLocationSignalSnapshot | undefined>(
    (best, location) => (!best || location.signalScore > best.signalScore ? location : best),
    undefined
  )

  function focusLocation(location: JobPostingLocationSignalSnapshot | undefined) {
    if (!location) return
    setSelectedLocationId(location.id)
    setViewState((current) => ({
      ...current,
      longitude: location.coordinates[0],
      latitude: location.coordinates[1],
      zoom: Math.max(current.zoom, 5.15),
      pitch: 48,
      bearing: 0
    }))
  }

  function resetMap() {
    setMinActiveJobs(0)
    setSelectedLocationId(sortedSignals[0]?.id)
    setViewState(initialViewState)
  }

  function updateViewState(nextViewState: Partial<typeof initialViewState>) {
    setViewState((current) => ({
      longitude: nextViewState.longitude ?? current.longitude,
      latitude: nextViewState.latitude ?? current.latitude,
      zoom: nextViewState.zoom ?? current.zoom,
      pitch: nextViewState.pitch ?? current.pitch,
      bearing: nextViewState.bearing ?? current.bearing
    }))
  }

  const layers = useMemo(
    () => [
      new JobIntelPulseLayer({
        id: "freejobdata-job-intel-pulse-layer",
        data: visibleSignals,
        selectedLocationId: selectedLocation?.id,
        showArcs,
        showLabels
      })
    ],
    [selectedLocation?.id, showArcs, showLabels, visibleSignals]
  )

  return (
    <section className="community-map-shell">
      <div className="community-map-toolbar">
        <div>
          <p className="eyebrow">GIS mode</p>
          <h2>Job posting location signal map</h2>
          <p className="muted">
            Showing up to {sortedSignals.length} hiring hubs. Unmapped markets use deterministic estimated coordinates.
          </p>
        </div>
        <div className="map-tools" aria-label="Map tools">
          <button type="button" onClick={resetMap}>
            Reset
          </button>
          <button type="button" onClick={() => focusLocation(sortedSignals[0])}>
            Busiest
          </button>
          <button type="button" onClick={() => focusLocation(strongestSignal)}>
            Strongest
          </button>
        </div>
      </div>
      <div className="map-stat-grid" aria-label="Visible map totals">
        <span>
          <strong>{visibleSignals.length}</strong>
          markets
        </span>
        <span>
          <strong>{totalActiveJobs.toLocaleString()}</strong>
          active jobs
        </span>
        <span>
          <strong>{totalNewJobs.toLocaleString()}</strong>
          new jobs, 7d
        </span>
      </div>
      <div className="community-map-grid">
        <div className="community-map-canvas">
          <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState: nextViewState }) =>
              updateViewState(nextViewState as Partial<typeof initialViewState>)
            }
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
                focusLocation(object)
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
            <input type="checkbox" checked={showArcs} onChange={(event) => setShowArcs(event.target.checked)} />{" "}
            Hiring-signal arcs
          </label>
          <label>
            <input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />{" "}
            Location labels
          </label>
          <label className="map-range-control">
            <span>Minimum active jobs</span>
            <input
              type="range"
              min={0}
              max={maxActiveJobs}
              step={Math.max(1, Math.round(maxActiveJobs / 100))}
              value={minActiveJobs}
              onChange={(event) => setMinActiveJobs(Number(event.target.value))}
            />
            <strong>{minActiveJobs.toLocaleString()}</strong>
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
          <div className="map-location-list">
            <h3>Top markets ({visibleSignals.length})</h3>
            {visibleSignals.slice(0, 20).map((location) => (
              <button
                className={location.id === selectedLocation?.id ? "active" : ""}
                key={location.id}
                type="button"
                onClick={() => focusLocation(location)}
              >
                <span>{location.name}</span>
                <strong>{location.activeJobs.toLocaleString()}</strong>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
