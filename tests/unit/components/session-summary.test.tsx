import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionSummary } from '@/components/feedback/session-summary'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.ComponentProps<'p'>) => (
      <p {...props}>{children}</p>
    ),
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const baseStats = {
  wpm: 25,
  accuracy: 90,
  totalKeystrokes: 150,
  duration: 60_000,
  correctStreak: 15,
}

const baseProps = {
  stats: baseStats,
  xpEarned: 50,
  badgesEarned: [],
  lessonTitle: 'שורת הבסיס',
  onContinue: vi.fn(),
  onRetry: vi.fn(),
}

describe('SessionSummary', () => {
  it('renders the lesson title', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByText('שורת הבסיס')).toBeInTheDocument()
  })

  it('renders WPM stat', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('renders accuracy stat', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('renders XP earned', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByText(/50/)).toBeInTheDocument()
  })

  it('renders "שיעור הבא" button', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByRole('button', { name: /שיעור הבא/ })).toBeInTheDocument()
  })

  it('renders "נסה שוב" button', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByRole('button', { name: /נסה שוב/ })).toBeInTheDocument()
  })

  it('calls onContinue when "שיעור הבא" is clicked', async () => {
    const onContinue = vi.fn()
    const user = userEvent.setup()
    render(<SessionSummary {...baseProps} onContinue={onContinue} />)
    await user.click(screen.getByRole('button', { name: /שיעור הבא/ }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('calls onRetry when "נסה שוב" is clicked', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(<SessionSummary {...baseProps} onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: /נסה שוב/ }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows improvement message when accuracy improved', () => {
    render(
      <SessionSummary
        {...baseProps}
        previousStats={{ wpm: 20, accuracy: 80 }}
      />,
    )
    // Should show improvement message (שיפור)
    expect(screen.getByText(/שיפור/)).toBeInTheDocument()
  })

  it('shows encouragement message when accuracy dropped', () => {
    render(
      <SessionSummary
        {...baseProps}
        stats={{ ...baseStats, accuracy: 70 }}
        previousStats={{ wpm: 30, accuracy: 90 }}
      />,
    )
    expect(screen.getByText(/לפעמים/)).toBeInTheDocument()
  })

  it('renders badges when earned', () => {
    render(
      <SessionSummary
        {...baseProps}
        badgesEarned={['מהיר כרוח', 'דייקן']}
      />,
    )
    expect(screen.getByText('מהיר כרוח')).toBeInTheDocument()
    expect(screen.getByText('דייקן')).toBeInTheDocument()
  })

  it('renders correct streak stat', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('shows up arrow when WPM improved vs previous', () => {
    render(
      <SessionSummary
        {...baseProps}
        previousStats={{ wpm: 20, accuracy: 88 }}
      />,
    )
    // At least one ↑ arrow should appear (WPM improved)
    const arrows = screen.getAllByText(/↑/)
    expect(arrows.length).toBeGreaterThanOrEqual(1)
  })

  it('shows down arrow when WPM dropped vs previous', () => {
    render(
      <SessionSummary
        {...baseProps}
        stats={{ ...baseStats, wpm: 15 }}
        previousStats={{ wpm: 25, accuracy: 90 }}
      />,
    )
    const arrows = screen.getAllByText(/↓/)
    expect(arrows.length).toBeGreaterThanOrEqual(1)
  })

  it('shows neutral arrow when WPM unchanged vs previous', () => {
    render(
      <SessionSummary
        {...baseProps}
        stats={{ ...baseStats, wpm: 25 }}
        previousStats={{ wpm: 25, accuracy: 90 }}
      />,
    )
    const arrows = screen.getAllByText(/→/)
    expect(arrows.length).toBeGreaterThanOrEqual(1)
  })

  it('does not show comparison arrows without previousStats', () => {
    render(<SessionSummary {...baseProps} />)
    expect(screen.queryAllByText(/↑/).length).toBe(0)
    expect(screen.queryAllByText(/↓/).length).toBe(0)
  })
})
