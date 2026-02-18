import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ShortcutPractice } from '@/components/shortcuts/shortcut-practice'
import type { ShortcutDefinition } from '@/lib/content/shortcuts'

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode
  }) => <>{children}</>,
}))

const mockShortcuts: ShortcutDefinition[] = [
  {
    id: 'test-1',
    keys: ['Ctrl', 'C'],
    hebrewName: 'העתקה',
    description: 'מעתיק את הטקסט',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'test-2',
    keys: ['Ctrl', 'V'],
    hebrewName: 'הדבקה',
    description: 'מדביק את הטקסט',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'test-3',
    keys: ['Ctrl', 'Z'],
    hebrewName: 'ביטול פעולה',
    description: 'מבטל את הפעולה האחרונה',
    category: 'basic',
    difficulty: 1,
  },
]

describe('ShortcutPractice', () => {
  let onComplete: (score: number, total: number) => void
  let onBack: () => void

  beforeEach(() => {
    vi.useFakeTimers()
    onComplete = vi.fn<(score: number, total: number) => void>()
    onBack = vi.fn<() => void>()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the first shortcut target', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )
    expect(screen.getByText('העתקה')).toBeInTheDocument()
    expect(screen.getByText('מעתיק את הטקסט')).toBeInTheDocument()
  })

  it('shows key caps visually for the target shortcut', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )
    // Key caps are rendered in an LTR dir="ltr" container
    expect(screen.getByText('Ctrl')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows progress counter (1 of N)', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )
    expect(screen.getByText(/קיצור 1 מתוך 3/)).toBeInTheDocument()
  })

  it('shows score counter', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )
    const scoreEl = screen.getByTestId('practice-score')
    expect(scoreEl.textContent).toContain('0/3')
  })

  it('detects correct key combination and shows success feedback', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Simulate Ctrl+C
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })

    // Should show correct feedback
    expect(screen.getByText('!נכון')).toBeInTheDocument()
  })

  it('detects wrong key combination and shows retry feedback', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Simulate wrong key (just 'a' without ctrl)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          ctrlKey: false,
          bubbles: true,
        }),
      )
    })

    expect(screen.getByText('נסו שוב')).toBeInTheDocument()
  })

  it('advances to the next shortcut after correct answer', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Press Ctrl+C (correct for first shortcut)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })

    // Wait for the timeout to advance
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Should now show the second shortcut
    expect(screen.getByText('הדבקה')).toBeInTheDocument()
    expect(screen.getByText(/קיצור 2 מתוך 3/)).toBeInTheDocument()
  })

  it('increments score on correct answer', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Correct: Ctrl+C
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })

    const scoreEl = screen.getByTestId('practice-score')
    expect(scoreEl.textContent).toContain('1/3')
  })

  it('shows completion state after all shortcuts', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Answer all 3 shortcuts correctly
    // 1. Ctrl+C
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // 2. Ctrl+V
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'v',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // 3. Ctrl+Z
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Should show completion
    expect(screen.getByText('סיימתם!')).toBeInTheDocument()
    expect(screen.getByTestId('final-score').textContent).toBe('3/3')
  })

  it('shows XP reward on completion', async () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Answer 1 correct, skip rest via incorrect
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'c',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Wrong for second
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Correct for second (Ctrl+V)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'v',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Correct for third (Ctrl+Z)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // XP shown: 3 correct * 10 = 30
    expect(screen.getByText('+30 XP')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    const backButton = screen.getByText('חזרה לרשימה')
    act(() => {
      backButton.click()
    })

    expect(onBack).toHaveBeenCalledOnce()
  })

  it('does not count modifier-only keypresses as incorrect', () => {
    render(
      <ShortcutPractice
        shortcuts={mockShortcuts}
        onComplete={onComplete}
        onBack={onBack}
      />,
    )

    // Press only Ctrl (modifier key)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Control',
          ctrlKey: true,
          bubbles: true,
        }),
      )
    })

    // Should NOT show "try again" feedback
    expect(screen.queryByText('נסו שוב')).toBeNull()
  })
})
