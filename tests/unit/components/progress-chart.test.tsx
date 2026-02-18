import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressChart } from '@/components/statistics/progress-chart'

const sampleData = [
  { sessionIndex: 1, wpm: 20, accuracy: 85, date: '01/01/2026' },
  { sessionIndex: 2, wpm: 25, accuracy: 88, date: '02/01/2026' },
  { sessionIndex: 3, wpm: 30, accuracy: 90, date: '03/01/2026' },
  { sessionIndex: 4, wpm: 28, accuracy: 92, date: '04/01/2026' },
  { sessionIndex: 5, wpm: 35, accuracy: 95, date: '05/01/2026' },
]

describe('ProgressChart', () => {
  it('renders the title', () => {
    render(
      <ProgressChart data={sampleData} title="מהירות הקלדה" metric="wpm" />,
    )
    expect(screen.getByText('מהירות הקלדה')).toBeInTheDocument()
  })

  it('shows message when less than 2 data points', () => {
    render(
      <ProgressChart
        data={[{ sessionIndex: 1, wpm: 20, accuracy: 85, date: '01/01' }]}
        title="מהירות"
        metric="wpm"
      />,
    )
    expect(
      screen.getByText('צריך לפחות 2 תרגולים כדי להציג גרף'),
    ).toBeInTheDocument()
  })

  it('shows message when data is empty', () => {
    render(<ProgressChart data={[]} title="מהירות" metric="wpm" />)
    expect(
      screen.getByText('צריך לפחות 2 תרגולים כדי להציג גרף'),
    ).toBeInTheDocument()
  })

  it('renders SVG chart with enough data', () => {
    render(
      <ProgressChart data={sampleData} title="מהירות" metric="wpm" />,
    )
    const svg = screen.getByRole('img', { name: 'גרף מהירות' })
    expect(svg).toBeInTheDocument()
    expect(svg.tagName).toBe('svg')
  })

  it('renders data point circles', () => {
    const { container } = render(
      <ProgressChart data={sampleData} title="מהירות" metric="wpm" />,
    )
    const circles = container.querySelectorAll('circle')
    // Each data point has one circle, plus background ring circles = data points count
    expect(circles.length).toBeGreaterThanOrEqual(sampleData.length)
  })

  it('renders polyline for the data', () => {
    const { container } = render(
      <ProgressChart data={sampleData} title="מהירות" metric="wpm" />,
    )
    const polyline = container.querySelector('polyline')
    expect(polyline).toBeInTheDocument()
    expect(polyline?.getAttribute('points')).toBeTruthy()
  })

  it('renders area fill path', () => {
    const { container } = render(
      <ProgressChart data={sampleData} title="מהירות" metric="wpm" />,
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(1) // at least the area fill
  })

  it('renders correctly with accuracy metric', () => {
    render(
      <ProgressChart data={sampleData} title="דיוק לאורך זמן" metric="accuracy" />,
    )
    expect(screen.getByText('דיוק לאורך זמן')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'גרף דיוק לאורך זמן' })).toBeInTheDocument()
  })

  it('handles 2 data points (minimum for chart)', () => {
    const twoPoints = sampleData.slice(0, 2)
    const { container } = render(
      <ProgressChart data={twoPoints} title="מהירות" metric="wpm" />,
    )
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).toBeInTheDocument()
  })
})
