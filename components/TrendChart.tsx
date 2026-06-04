import type { TrendPoint } from "@/lib/types"

export function TrendChart({ points, title = "Hiring trend" }: { points: TrendPoint[]; title?: string }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  const width = 620
  const height = 220
  const step = width / Math.max(points.length - 1, 1)
  const coordinates = points
    .map((point, index) => {
      const x = Math.round(index * step)
      const y = Math.round(height - (point.value / max) * 160 - 30)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="chart">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <polyline fill="none" stroke="#1c6ee8" strokeWidth="5" strokeLinecap="round" points={coordinates} />
        {points.map((point, index) => {
          const x = Math.round(index * step)
          const y = Math.round(height - (point.value / max) * 160 - 30)
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="6" fill="#06b6d4" />
              <text x={x} y={height - 4} textAnchor="middle" fontSize="18" fill="#64748b">
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
