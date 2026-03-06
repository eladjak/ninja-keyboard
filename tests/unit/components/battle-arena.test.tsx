import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '../../utils'

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
    span: ({
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
      return <span {...domProps}>{children}</span>
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

// Mock the AI opponent store
const mockAIStoreState = {
  opponentState: {
    currentPosition: 0,
    currentWPM: 0,
    errors: 0,
    isTyping: false,
    progress: 0,
    accuracy: 100,
  },
  mood: 'neutral',
  activeRival: null,
  difficulty: 3,
  rubberBandEnabled: true,
  playerPosition: 0,
  isActive: false,
  matchResult: null,
  keystrokes: [],
  processKeystroke: vi.fn(),
  updatePlayerPosition: vi.fn(),
  updateMood: vi.fn(),
  startBattle: vi.fn(),
  stopBattle: vi.fn(),
  setMatchResult: vi.fn(),
  setDifficulty: vi.fn(),
  reset: vi.fn(),
}
vi.mock('@/stores/ai-opponent-store', () => ({
  useAIOpponentStore: (selector?: (s: typeof mockAIStoreState) => unknown) =>
    selector ? selector(mockAIStoreState) : mockAIStoreState,
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

// Mock the AI typing engine to prevent real timers
vi.mock('@/lib/battle/ai-typing-engine', () => ({
  RIVAL_CONFIGS: {
    shadow: { baseWPM: 37, pattern: 'steady' },
    storm: { baseWPM: 45, pattern: 'burst-pause' },
    blaze: { baseWPM: 55, pattern: 'burnout' },
    yuki: { baseWPM: 75, pattern: 'steady' },
    bug: { baseWPM: 48, pattern: 'chaotic' },
    virus: { baseWPM: 25, pattern: 'accelerate' },
  },
  RIVAL_DISPLAY: {
    shadow: { name: 'Shadow', nameHe: 'צל', emoji: '🐱', description: 'יציב ומדויק', image: '/images/characters/shadow.jpg', glowColor: 'rgba(99,110,114,0.4)', themeColor: '#74B9FF' },
    storm: { name: 'Storm', nameHe: 'סערה', emoji: '🦊', description: 'פרצים בלתי צפויים', image: '/images/characters/storm.jpg', glowColor: 'rgba(9,132,227,0.4)', themeColor: '#00CEC9' },
    blaze: { name: 'Blaze', nameHe: 'להבה', emoji: '🐉', description: 'מתחיל חם, נשרף', image: '/images/characters/blaze.jpg', glowColor: 'rgba(214,48,49,0.4)', themeColor: '#FF6B6B' },
    yuki: { name: 'Yuki', nameHe: 'יוקי', emoji: '❄️', description: 'שותפת אימונים', image: '/images/characters/yuki.jpg', glowColor: 'rgba(108,92,231,0.4)', themeColor: '#6C5CE7' },
    bug: { name: 'Bug', nameHe: 'באג', emoji: '🐛', description: 'כאוטי', image: '/images/characters/bug.jpg', glowColor: 'rgba(0,184,148,0.4)', themeColor: '#00B894' },
    virus: { name: 'Virus', nameHe: 'וירוס', emoji: '☣️', description: 'מאיץ', image: '/images/characters/virus.jpg', glowColor: 'rgba(255,107,107,0.35)', themeColor: '#FF6B6B' },
  },
  scaleToDifficulty: vi.fn((config: Record<string, unknown>) => config),
  createAITypingRunner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    updatePlayerPosition: vi.fn(),
  })),
}))

import { BattleArena } from '@/components/battle/battle-arena'

describe('BattleArena', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  // ── Rival Selector ──────────────────────────────────────────

  it('renders rival selection cards', () => {
    render(<BattleArena />)

    expect(screen.getByTestId('rival-bug')).toBeInTheDocument()
    expect(screen.getByTestId('rival-shadow')).toBeInTheDocument()
    expect(screen.getByTestId('rival-storm')).toBeInTheDocument()
    expect(screen.getByTestId('rival-blaze')).toBeInTheDocument()
    expect(screen.getByTestId('rival-virus')).toBeInTheDocument()
    expect(screen.getByTestId('rival-yuki')).toBeInTheDocument()
  })

  it('renders legacy difficulty buttons', () => {
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

  it('displays rival names in Hebrew', () => {
    render(<BattleArena />)

    expect(screen.getByText('באג')).toBeInTheDocument()
    expect(screen.getByText('צל')).toBeInTheDocument()
    expect(screen.getByText('סערה')).toBeInTheDocument()
    expect(screen.getByText('להבה')).toBeInTheDocument()
    expect(screen.getByText('וירוס')).toBeInTheDocument()
    expect(screen.getByText('יוקי')).toBeInTheDocument()
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

  it('shows countdown after selecting a rival', async () => {
    render(<BattleArena />)

    const rivalButton = screen.getByTestId('rival-shadow')
    await act(async () => {
      rivalButton.click()
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

  it('shows player WPM display during battle', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('player-wpm')).toBeInTheDocument()
  })

  it('shows AI opponent component during battle', async () => {
    render(<BattleArena />)

    const easyButton = screen.getByTestId('difficulty-easy')
    await act(async () => {
      easyButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.getByTestId('ai-opponent')).toBeInTheDocument()
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

  it('shows rival name during battle', async () => {
    render(<BattleArena />)

    // Select a specific rival
    const shadowButton = screen.getByTestId('rival-shadow')
    await act(async () => {
      shadowButton.click()
    })

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    // Rival name should appear in the battle UI (may appear multiple times)
    const rivalNames = screen.getAllByText('צל')
    expect(rivalNames.length).toBeGreaterThanOrEqual(1)
  })
})
