import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, userEvent } from '../../utils'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode
      [key: string]: unknown
    }) => {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        ...domProps
      } = props
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock the XP store
const mockAddXp = vi.fn()
vi.mock('@/stores/xp-store', () => ({
  useXpStore: (selector: (s: { addXp: typeof mockAddXp }) => unknown) =>
    selector({ addXp: mockAddXp }),
}))

// Mock battle engine with controllable text
vi.mock('@/lib/battle/battle-engine', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/battle/battle-engine')>()
  return {
    ...actual,
    getBattleText: () => 'שלום עולם',
    createBattle: (config: { difficulty: string; textLength: number }) => ({
      playerProgress: 0,
      aiProgress: 0,
      status: 'idle',
      winner: null,
      timeElapsed: 0,
      text: 'שלום עולם',
      config,
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }),
  }
})

import { BattleArena } from '@/components/battle/battle-arena'

describe('BattleArena', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  // ── Difficulty Selector ──────────────────────────────────────

  it('renders 3 difficulty options', () => {
    render(<BattleArena />)

    expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-medium')).toBeInTheDocument()
    expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument()
  })

  it('displays difficulty labels in Hebrew', () => {
    render(<BattleArena />)

    expect(screen.getByText('קל')).toBeInTheDocument()
    expect(screen.getByText('בינוני')).toBeInTheDocument()
    expect(screen.getByText('קשה')).toBeInTheDocument()
  })

  it('displays battle title', () => {
    render(<BattleArena />)

    expect(screen.getByText('זירת קרב')).toBeInTheDocument()
  })

  it('displays WPM for each difficulty', () => {
    render(<BattleArena />)

    expect(screen.getByText('15 מ/ד')).toBeInTheDocument()
    expect(screen.getByText('30 מ/ד')).toBeInTheDocument()
    expect(screen.getByText('50 מ/ד')).toBeInTheDocument()
  })

  // ── Countdown ────────────────────────────────────────────────

  it('shows countdown after selecting difficulty', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    expect(screen.getByTestId('countdown-display')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('advances countdown from 3 to 2', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    expect(screen.getByText('3')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows קדימה! at end of countdown', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    // Advance through 3, 2, 1
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText('קדימה!')).toBeInTheDocument()
  })

  // ── Battle Phase ─────────────────────────────────────────────

  it('enters battle phase after countdown completes', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    // Complete countdown (4 steps * 1000ms each)
    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    // Battle phase should show text area and progress
    expect(screen.getByTestId('battle-text-area')).toBeInTheDocument()
  })

  it('shows player and AI WPM displays during battle', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('player-wpm')).toBeInTheDocument()
    expect(screen.getByTestId('ai-wpm')).toBeInTheDocument()
  })

  it('shows progress bars during battle', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('player-progress')).toBeInTheDocument()
    expect(screen.getByTestId('ai-progress')).toBeInTheDocument()
  })

  it('shows the battle text', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    // The text "שלום עולם" should be visible
    expect(screen.getByText('ש')).toBeInTheDocument()
  })

  it('shows hidden input for typing', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('battle-input')).toBeInTheDocument()
  })

  it('shows AI opponent name during battle', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByText("נינג'ה בוט")).toBeInTheDocument()
  })
})
