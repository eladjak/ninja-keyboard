import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { PracticeTimer, TIMER_DURATIONS, TIMER_LABELS } from '@/components/practice/practice-timer'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, ...rest } = props
      return <span {...rest}>{children}</span>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

const defaultProps = {
  duration: 60 as const,
  onDurationChange: vi.fn(),
  isRunning: false,
  onStart: vi.fn(),
  onPause: vi.fn(),
  onFinish: vi.fn(),
  onReset: vi.fn(),
}

describe('PracticeTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders duration selector buttons', () => {
    render(<PracticeTimer {...defaultProps} />)

    for (const d of TIMER_DURATIONS) {
      expect(screen.getByRole('radio', { name: TIMER_LABELS[d] })).toBeInTheDocument()
    }
  })

  it('shows the selected duration as checked', () => {
    render(<PracticeTimer {...defaultProps} duration={120} />)

    const btn120 = screen.getByRole('radio', { name: TIMER_LABELS[120] })
    expect(btn120).toHaveAttribute('aria-checked', 'true')

    const btn60 = screen.getByRole('radio', { name: TIMER_LABELS[60] })
    expect(btn60).toHaveAttribute('aria-checked', 'false')
  })

  it('displays initial time as 1:00 for 60 seconds', () => {
    render(<PracticeTimer {...defaultProps} duration={60} />)
    expect(screen.getByText('1:00')).toBeInTheDocument()
  })

  it('displays initial time as 2:00 for 120 seconds', () => {
    render(<PracticeTimer {...defaultProps} duration={120} />)
    expect(screen.getByText('2:00')).toBeInTheDocument()
  })

  it('displays initial time as 5:00 for 300 seconds', () => {
    render(<PracticeTimer {...defaultProps} duration={300} />)
    expect(screen.getByText('5:00')).toBeInTheDocument()
  })

  it('calls onStart when play button is clicked', () => {
    const onStart = vi.fn()
    render(<PracticeTimer {...defaultProps} onStart={onStart} />)

    fireEvent.click(screen.getByLabelText('התחל'))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('calls onPause when pause button is clicked while running', () => {
    const onPause = vi.fn()
    render(<PracticeTimer {...defaultProps} isRunning={true} onPause={onPause} />)

    fireEvent.click(screen.getByLabelText('השהה'))
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(<PracticeTimer {...defaultProps} onReset={onReset} />)

    fireEvent.click(screen.getByLabelText('איפוס טיימר'))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('counts down when running', () => {
    render(<PracticeTimer {...defaultProps} isRunning={true} duration={60} />)

    act(() => {
      vi.advanceTimersByTime(3000) // 3 seconds
    })

    expect(screen.getByText('0:57')).toBeInTheDocument()
  })

  it('calls onFinish when timer reaches 0', () => {
    const onFinish = vi.fn()
    render(
      <PracticeTimer {...defaultProps} isRunning={true} duration={60} onFinish={onFinish} />,
    )

    act(() => {
      vi.advanceTimersByTime(60_000) // full duration
    })

    // onFinish is deferred with setTimeout
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onFinish).toHaveBeenCalledOnce()
  })

  it('disables duration buttons while running', () => {
    render(<PracticeTimer {...defaultProps} isRunning={true} />)

    for (const d of TIMER_DURATIONS) {
      expect(screen.getByRole('radio', { name: TIMER_LABELS[d] })).toBeDisabled()
    }
  })

  it('resets remaining time when duration changes', () => {
    const { rerender } = render(<PracticeTimer {...defaultProps} duration={60} />)
    expect(screen.getByText('1:00')).toBeInTheDocument()

    rerender(<PracticeTimer {...defaultProps} duration={120} />)
    expect(screen.getByText('2:00')).toBeInTheDocument()
  })

  it('has accessible radio group for duration selection', () => {
    render(<PracticeTimer {...defaultProps} />)
    const group = screen.getByRole('radiogroup', { name: 'בחירת זמן תרגול' })
    expect(group).toBeInTheDocument()
  })
})
