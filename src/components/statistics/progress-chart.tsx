'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataPoint {
  sessionIndex: number
  wpm: number
  accuracy: number
  date: string
}

interface ProgressChartProps {
  /** Data points to render */
  data: DataPoint[]
  /** Chart title in Hebrew */
  title: string
  /** Which metric to display: 'wpm' or 'accuracy' */
  metric: 'wpm' | 'accuracy'
  /** Additional CSS classes */
  className?: string
}

/** Chart dimensions */
const CHART_WIDTH = 400
const CHART_HEIGHT = 200
const PADDING = { top: 20, right: 20, bottom: 30, left: 45 }

const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

/**
 * Simple SVG line chart for WPM or accuracy progress over time.
 * No external dependencies - pure SVG rendering.
 */
export function ProgressChart({ data, title, metric, className }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const values = data.map((d) => (metric === 'wpm' ? d.wpm : d.accuracy))
    const minVal = Math.max(0, Math.min(...values) - 5)
    const maxVal = metric === 'accuracy' ? 100 : Math.max(...values) + 10

    const range = maxVal - minVal || 1

    const points = data.map((d, i) => {
      const x = PADDING.left + (i / Math.max(data.length - 1, 1)) * INNER_WIDTH
      const val = metric === 'wpm' ? d.wpm : d.accuracy
      const y = PADDING.top + INNER_HEIGHT - ((val - minVal) / range) * INNER_HEIGHT
      return { x, y, value: val, date: d.date, index: d.sessionIndex }
    })

    // SVG polyline path
    const linePath = points.map((p) => `${p.x},${p.y}`).join(' ')

    // Gradient fill path (area under the line)
    const areaPath =
      `M ${points[0].x},${PADDING.top + INNER_HEIGHT} ` +
      points.map((p) => `L ${p.x},${p.y}`).join(' ') +
      ` L ${points[points.length - 1].x},${PADDING.top + INNER_HEIGHT} Z`

    // Y-axis grid lines (5 steps)
    const gridLines = Array.from({ length: 5 }, (_, i) => {
      const val = minVal + (range * i) / 4
      const y = PADDING.top + INNER_HEIGHT - (i / 4) * INNER_HEIGHT
      return { y, label: Math.round(val).toString() }
    })

    return { points, linePath, areaPath, gridLines, minVal, maxVal }
  }, [data, metric])

  const lineColor = metric === 'wpm' ? '#6C5CE7' : '#00B894'
  const fillColor = metric === 'wpm' ? '#6C5CE720' : '#00B89420'

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {!chartData || data.length < 2 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            צריך לפחות 2 תרגולים כדי להציג גרף
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`גרף ${title}`}
          >
            {/* Grid lines */}
            {chartData.gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  y1={line.y}
                  x2={CHART_WIDTH - PADDING.right}
                  y2={line.y}
                  stroke="currentColor"
                  className="text-muted/20"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={PADDING.left - 8}
                  y={line.y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {line.label}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <path d={chartData.areaPath} fill={fillColor} />

            {/* Line */}
            <polyline
              points={chartData.linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="white"
                  stroke={lineColor}
                  strokeWidth="2"
                />
                {/* Value label on every other point or if few points */}
                {(data.length <= 8 || i % 2 === 0) && (
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    className="fill-foreground text-[9px] font-medium"
                  >
                    {point.value}{metric === 'accuracy' ? '%' : ''}
                  </text>
                )}
              </g>
            ))}

            {/* X-axis labels (session numbers) */}
            {chartData.points.map((point, i) => (
              (data.length <= 10 || i % Math.ceil(data.length / 10) === 0) && (
                <text
                  key={`x-${i}`}
                  x={point.x}
                  y={CHART_HEIGHT - 5}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {point.index}
                </text>
              )
            ))}
          </svg>
        )}
      </CardContent>
    </Card>
  )
}
