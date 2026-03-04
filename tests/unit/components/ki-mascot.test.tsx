import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '../../utils'

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = props as Record<string, unknown>
      return <div {...(domProps as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { KiMascot } from '@/components/mascot/ki-mascot'

describe('KiMascot', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the mascot element', () => {
    render(<KiMascot />)
    expect(screen.getByTestId('ki-mascot')).toBeInTheDocument()
  })

  it('renders ninja SVG', () => {
    render(<KiMascot />)
    expect(screen.getByTestId('ninja-svg')).toBeInTheDocument()
  })

  it('defaults to idle mood', () => {
    render(<KiMascot />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-mood', 'idle')
  })

  it('shows speech bubble with message', () => {
    render(<KiMascot mood="happy" message="יופי!" messageDuration={2000} />)
    expect(screen.getByTestId('speech-bubble')).toBeInTheDocument()
    expect(screen.getByTestId('speech-bubble')).toHaveTextContent('יופי!')
  })

  it('does not show speech bubble without message', () => {
    render(<KiMascot mood="idle" />)
    expect(screen.queryByTestId('speech-bubble')).not.toBeInTheDocument()
  })

  it('applies correct mood data attribute for happy', () => {
    render(<KiMascot mood="happy" message="test" />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-mood', 'happy')
  })

  it('applies correct mood data attribute for excited', () => {
    render(<KiMascot mood="excited" message="test" />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-mood', 'excited')
  })

  it('applies correct mood data attribute for sleeping', () => {
    render(<KiMascot mood="sleeping" message="zzz..." />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-mood', 'sleeping')
  })

  it('defaults to small size', () => {
    render(<KiMascot />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-size', 'small')
  })

  it('supports large size variant', () => {
    render(<KiMascot size="large" />)
    expect(screen.getByTestId('ki-mascot')).toHaveAttribute('data-size', 'large')
  })

  it('auto-dismisses speech bubble after duration', () => {
    render(<KiMascot mood="happy" message="יופי!" messageDuration={2000} />)
    expect(screen.getByTestId('speech-bubble')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2100)
    })

    expect(screen.queryByTestId('speech-bubble')).not.toBeInTheDocument()
  })

  it('has RTL direction on speech bubble', () => {
    render(<KiMascot mood="happy" message="יופי!" messageDuration={2000} />)
    expect(screen.getByTestId('speech-bubble')).toHaveAttribute('dir', 'rtl')
  })

  it('has accessible alt text on character image', () => {
    render(<KiMascot />)
    const img = screen.getByTestId('ninja-svg')
    expect(img).toHaveAttribute('alt', 'Ki הנינג\'ה')
  })

  it('renders character image', () => {
    render(<KiMascot mood="idle" />)
    const img = screen.getByTestId('ninja-svg')
    expect(img.tagName.toLowerCase()).toBe('img')
  })
})
