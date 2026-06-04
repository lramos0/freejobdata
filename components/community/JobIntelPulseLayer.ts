import { CompositeLayer } from "@deck.gl/core"
import type { DefaultProps } from "@deck.gl/core"
import { ArcLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers"
import type { JobPostingLocationSignal } from "@/lib/community-data"

type JobIntelPulseLayerProps = {
  data: JobPostingLocationSignal[]
  selectedLocationId?: string
}

const headquarters: [number, number] = [-98.5795, 39.8283]

export class JobIntelPulseLayer extends CompositeLayer<JobIntelPulseLayerProps> {
  static layerName = "JobIntelPulseLayer"
  static defaultProps: DefaultProps<JobIntelPulseLayerProps> = {
    data: []
  }

  renderLayers() {
    const { data, selectedLocationId } = this.props
    const selected = selectedLocationId ? data.find((location) => location.id === selectedLocationId) : undefined
    const arcData = selected ? [selected] : data.filter((location) => location.signalScore >= 82)

    return [
      new ArcLayer<JobPostingLocationSignal>(
        this.getSubLayerProps({
          id: "job-signal-flows",
          data: arcData,
          getSourcePosition: () => headquarters,
          getTargetPosition: (location: JobPostingLocationSignal) => location.coordinates,
          getSourceColor: [28, 110, 232, 120],
          getTargetColor: [6, 182, 212, 220],
          getWidth: (location: JobPostingLocationSignal) => Math.max(2, location.newJobs7d / 38),
          greatCircle: true,
          pickable: false
        })
      ),
      new ScatterplotLayer<JobPostingLocationSignal>(
        this.getSubLayerProps({
          id: "job-location-pulses",
          data,
          pickable: true,
          stroked: true,
          filled: true,
          radiusUnits: "meters",
          radiusScale: 22,
          lineWidthUnits: "pixels",
          getPosition: (location: JobPostingLocationSignal) => location.coordinates,
          getRadius: (location: JobPostingLocationSignal) => Math.sqrt(location.activeJobs) * 90,
          getLineWidth: (location: JobPostingLocationSignal) => (location.id === selectedLocationId ? 6 : 2),
          getLineColor: (location: JobPostingLocationSignal) =>
            location.id === selectedLocationId ? [255, 255, 255, 255] : [15, 23, 42, 170],
          getFillColor: (location: JobPostingLocationSignal) => [
            28,
            110,
            232,
            Math.min(230, 80 + location.signalScore * 1.6)
          ]
        })
      ),
      new TextLayer<JobPostingLocationSignal>(
        this.getSubLayerProps({
          id: "job-location-labels",
          data,
          getPosition: (location: JobPostingLocationSignal) => location.coordinates,
          getText: (location: JobPostingLocationSignal) => `${location.name}\n${location.activeJobs.toLocaleString()} jobs`,
          getSize: 13,
          getColor: [248, 250, 252, 245],
          getTextAnchor: "middle",
          getAlignmentBaseline: "bottom",
          getPixelOffset: [0, -18],
          background: true,
          getBackgroundColor: [15, 23, 42, 205],
          backgroundPadding: [8, 5],
          pickable: false
        })
      )
    ]
  }
}
