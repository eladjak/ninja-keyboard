import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EncouragementBanner } from '@/components/feedback/encouragement-banner'

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('EncouragementBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when visible is false', () => {
    render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="encourage"
        visible={false}
      />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders the message when visible is true', () => {
    render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="encourage"
        visible={true}
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('כל הכבוד!')).toBeInTheDocument()
  })

  it('renders emoji when provided', () => {
    render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="celebrate"
        emoji="🎉"
        visible={true}
      />,
    )
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('has aria-live="polite"', () => {
    render(
      <EncouragementBanner
        message="רגע"
        type="calm"
        visible={true}
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })

  it('renders dismiss button', () => {
    render(
      <EncouragementBanner
        message="רגע"
        type="hint"
        visible={true}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    vi.useRealTimers()
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(
      <EncouragementBanner
        message="רגע"
        type="hint"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after 3s for encourage type', () => {
    const onDismiss = vi.fn()
    render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="encourage"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after 3s for celebrate type', () => {
    const onDismiss = vi.fn()
    render(
      <EncouragementBanner
        message="מדהים!"
        type="celebrate"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does NOT auto-dismiss for hint type', () => {
    const onDismiss = vi.fn()
    render(
      <EncouragementBanner
        message="טיפ: השתמש באצבע ה-F"
        type="hint"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does NOT auto-dismiss for summary type', () => {
    const onDismiss = vi.fn()
    render(
      <EncouragementBanner
        message="סיכום"
        type="summary"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does NOT auto-dismiss for calm type', () => {
    const onDismiss = vi.fn()
    render(
      <EncouragementBanner
        message="נשמו עמוק"
        type="calm"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('has dir="rtl" for RTL text', () => {
    render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="encourage"
        visible={true}
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('dir', 'rtl')
  })

  it('clears auto-dismiss timer when unmounted', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(
      <EncouragementBanner
        message="כל הכבוד!"
        type="encourage"
        visible={true}
        onDismiss={onDismiss}
      />,
    )
    unmount()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
