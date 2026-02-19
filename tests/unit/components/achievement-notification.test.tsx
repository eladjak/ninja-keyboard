import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AchievementNotification } from '@/components/gamification/achievement-notification'
import type { BadgeDefinition } from '@/lib/gamification/badge-definitions'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, ...htmlProps } = props
      return <div {...htmlProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

const mockBadge: BadgeDefinition = {
  id: 'test-badge',
  nameHe: 'בדיקה',
  nameEn: 'Test',
  description: 'הישג בדיקה',
  emoji: '🏆',
  category: 'special',
  condition: { type: 'first_lesson' },
}

describe('AchievementNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when badge is null', () => {
    const { container } = render(
      <AchievementNotification badge={null} />,
    )
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('renders badge info when badge is provided', () => {
    render(<AchievementNotification badge={mockBadge} />)

    expect(screen.getByText('הישג חדש!')).toBeInTheDocument()
    expect(screen.getByText('בדיקה')).toBeInTheDocument()
    expect(screen.getByText('הישג בדיקה')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('has role=alert for accessibility', () => {
    render(<AchievementNotification badge={mockBadge} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-live=polite', () => {
    render(<AchievementNotification badge={mockBadge} />)

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })

  it('auto-dismisses after default delay', () => {
    const onDismiss = vi.fn()
    render(
      <AchievementNotification badge={mockBadge} onDismiss={onDismiss} />,
    )

    expect(screen.getByText('בדיקה')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('respects custom dismissDelay', () => {
    const onDismiss = vi.fn()
    render(
      <AchievementNotification
        badge={mockBadge}
        onDismiss={onDismiss}
        dismissDelay={2000}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('is RTL-directed', () => {
    render(<AchievementNotification badge={mockBadge} />)

    expect(screen.getByRole('alert')).toHaveAttribute('dir', 'rtl')
  })

  it('shows emoji with appropriate aria-label', () => {
    render(<AchievementNotification badge={mockBadge} />)

    const emoji = screen.getByLabelText('בדיקה')
    expect(emoji).toHaveTextContent('🏆')
  })
})
