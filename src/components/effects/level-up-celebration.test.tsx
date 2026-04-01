/**
 * Tests for LevelUpCelebration component.
 *
 * Verifies:
 * - Renders when visible=true with correct Hebrew text
 * - Does not render when visible=false
 * - Shows the correct level number
 * - Calls onDismiss when the dismiss button is clicked
 * - Renders character image when characterImage prop is provided
 * - Has correct accessibility attributes (role=dialog, aria-modal, aria-live)
 * - Renders dismiss button with correct aria-label
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LevelUpCelebration } from './level-up-celebration'

// ---------------------------------------------------------------------------
// Mock framer-motion so AnimatePresence renders children immediately
// ---------------------------------------------------------------------------
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
    },
  }
})

// Mock useReducedMotion so we don't need the Zustand store in tests
vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: () => false,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCelebration(props?: Partial<React.ComponentProps<typeof LevelUpCelebration>>) {
  const onDismiss = vi.fn()
  const result = render(
    <LevelUpCelebration
      level={5}
      onDismiss={onDismiss}
      visible={true}
      autoDismissMs={0}
      {...props}
    />,
  )
  return { ...result, onDismiss }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LevelUpCelebration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders when visible=true', () => {
    renderCelebration({ visible: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when visible=false', () => {
    renderCelebration({ visible: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the correct level number in the accessible text', () => {
    renderCelebration({ level: 7 })
    // The sr-only span has the full text
    expect(screen.getByText('כל הכבוד! הגעת לרמה 7')).toBeInTheDocument()
  })

  it('shows "כל הכבוד!" as a visible heading', () => {
    renderCelebration({ level: 3 })
    expect(screen.getByText('כל הכבוד!')).toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', () => {
    const { onDismiss } = renderCelebration()
    fireEvent.click(screen.getByRole('button', { name: 'סגור חגיגת עלייה ברמה' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when the overlay backdrop is clicked', () => {
    const { onDismiss } = renderCelebration()
    fireEvent.click(screen.getByRole('dialog'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('auto-dismisses after autoDismissMs', () => {
    const { onDismiss } = renderCelebration({ autoDismissMs: 3000, visible: true })
    expect(onDismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not auto-dismiss when autoDismissMs=0', () => {
    const { onDismiss } = renderCelebration({ autoDismissMs: 0, visible: true })
    vi.advanceTimersByTime(10000)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('renders character image when characterImage is provided', () => {
    renderCelebration({ characterImage: '/images/characters/ki.png', characterName: 'קי' })
    const img = screen.getByAltText('קי חוגג/ת')
    expect(img).toBeInTheDocument()
  })

  it('uses generic alt text when characterName is not provided', () => {
    renderCelebration({ characterImage: '/images/characters/ki.png' })
    expect(screen.getByAltText('דמות חוגגת')).toBeInTheDocument()
  })

  it('does not render character image when characterImage is not provided', () => {
    renderCelebration({ characterImage: undefined })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    renderCelebration({ level: 5 })
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-live', 'assertive')
    expect(dialog).toHaveAttribute('aria-label', 'עלית לרמה 5')
  })

  it('renders a dismiss button with Hebrew label', () => {
    renderCelebration()
    expect(screen.getByRole('button', { name: 'סגור חגיגת עלייה ברמה' })).toBeInTheDocument()
  })

  it('dismiss button text reads "המשך"', () => {
    renderCelebration()
    expect(screen.getByRole('button', { name: 'סגור חגיגת עלייה ברמה' })).toHaveTextContent('המשך')
  })
})
