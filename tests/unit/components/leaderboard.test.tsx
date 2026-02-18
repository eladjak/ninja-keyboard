import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium'
import {
  generateMockLeaderboard,
  assignRanks,
} from '@/lib/leaderboard/leaderboard-utils'
import type { LeaderboardEntry } from '@/lib/leaderboard/leaderboard-utils'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      // Filter out framer-motion-specific props before passing to DOM
      const {
        initial: _initial,
        animate: _animate,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        exit: _exit,
        variants: _variants,
        ...domProps
      } = props as Record<string, unknown>
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    id: 'p1',
    rank: 1,
    name: '\u05D3\u05E0\u05D9\u05D0\u05DC', // דניאל
    avatarEmoji: '\u{1F977}',
    wpm: 30,
    accuracy: 90,
    level: 5,
    xp: 500,
    streak: 3,
    trend: 'stable',
    ...overrides,
  }
}

const mockEntries = assignRanks([
  makeEntry({ id: 'p1', name: '\u05D3\u05E0\u05D9\u05D0\u05DC', wpm: 50, accuracy: 95, level: 10 }),
  makeEntry({ id: 'p2', name: '\u05E0\u05D5\u05E2\u05D4', wpm: 40, accuracy: 92, level: 8 }),
  makeEntry({ id: 'p3', name: '\u05D0\u05D9\u05EA\u05D9', wpm: 30, accuracy: 88, level: 6 }),
  makeEntry({ id: 'p4', name: '\u05DE\u05D9\u05D4', wpm: 25, accuracy: 85, level: 4 }),
  makeEntry({ id: 'p5', name: '\u05D9\u05D5\u05D1\u05DC', wpm: 20, accuracy: 80, level: 3 }),
])

// ─── LeaderboardTable ───────────────────────────────────────────

describe('LeaderboardTable', () => {
  it('renders all table columns', () => {
    render(<LeaderboardTable entries={mockEntries} />)
    expect(screen.getByText('\u05D3\u05D9\u05E8\u05D5\u05D2')).toBeInTheDocument() // דירוג
    expect(screen.getByText('\u05E9\u05DD')).toBeInTheDocument() // שם
    expect(screen.getByText('\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA', { selector: 'th' })).toBeInTheDocument() // מהירות
    expect(screen.getByText('\u05D3\u05D9\u05D5\u05E7', { selector: 'th' })).toBeInTheDocument() // דיוק
    expect(screen.getByText('\u05E8\u05DE\u05D4')).toBeInTheDocument() // רמה
  })

  it('renders all entries', () => {
    render(<LeaderboardTable entries={mockEntries} />)
    expect(screen.getByTestId('row-p1')).toBeInTheDocument()
    expect(screen.getByTestId('row-p2')).toBeInTheDocument()
    expect(screen.getByTestId('row-p3')).toBeInTheDocument()
    expect(screen.getByTestId('row-p4')).toBeInTheDocument()
    expect(screen.getByTestId('row-p5')).toBeInTheDocument()
  })

  it('shows medals for top 3', () => {
    render(<LeaderboardTable entries={mockEntries} />)
    const medals = screen.getAllByTestId('medal')
    expect(medals).toHaveLength(3)
    expect(medals[0].textContent).toContain('\u{1F947}') // gold
    expect(medals[1].textContent).toContain('\u{1F948}') // silver
    expect(medals[2].textContent).toContain('\u{1F949}') // bronze
  })

  it('renders all category tabs', () => {
    render(<LeaderboardTable entries={mockEntries} />)
    expect(screen.getByTestId('category-wpm')).toBeInTheDocument()
    expect(screen.getByTestId('category-accuracy')).toBeInTheDocument()
    expect(screen.getByTestId('category-xp')).toBeInTheDocument()
    expect(screen.getByTestId('category-streak')).toBeInTheDocument()
  })

  it('switches category when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<LeaderboardTable entries={mockEntries} />)

    // Initially shows WPM title
    expect(screen.getByTestId('leaderboard-title')).toHaveTextContent('\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA')

    // Click accuracy tab
    await user.click(screen.getByTestId('category-accuracy'))
    expect(screen.getByTestId('leaderboard-title')).toHaveTextContent('\u05D3\u05D9\u05D5\u05E7')
  })

  it('renders time range buttons', () => {
    render(<LeaderboardTable entries={mockEntries} />)
    expect(screen.getByTestId('time-daily')).toBeInTheDocument()
    expect(screen.getByTestId('time-weekly')).toBeInTheDocument()
    expect(screen.getByTestId('time-allTime')).toBeInTheDocument()
  })

  it('highlights current player row', () => {
    render(<LeaderboardTable entries={mockEntries} currentPlayerId="p3" />)
    const row = screen.getByTestId('row-p3')
    expect(row.className).toContain('ring-primary')
  })

  it('shows current player badge', () => {
    render(<LeaderboardTable entries={mockEntries} currentPlayerId="p3" />)
    expect(screen.getByTestId('current-player-badge')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(<LeaderboardTable entries={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('time range buttons are clickable', async () => {
    const user = userEvent.setup()
    render(<LeaderboardTable entries={mockEntries} />)

    const daily = screen.getByTestId('time-daily')
    await user.click(daily)
    expect(daily.className).toContain('bg-primary')
  })
})

// ─── LeaderboardPodium ──────────────────────────────────────────

describe('LeaderboardPodium', () => {
  it('renders 3 podium entries', () => {
    render(<LeaderboardPodium entries={mockEntries} />)
    expect(screen.getByTestId('podium-name-1')).toBeInTheDocument()
    expect(screen.getByTestId('podium-name-2')).toBeInTheDocument()
    expect(screen.getByTestId('podium-name-3')).toBeInTheDocument()
  })

  it('shows WPM for each podium entry', () => {
    render(<LeaderboardPodium entries={mockEntries} />)
    expect(screen.getByTestId('podium-wpm-1')).toBeInTheDocument()
    expect(screen.getByTestId('podium-wpm-2')).toBeInTheDocument()
    expect(screen.getByTestId('podium-wpm-3')).toBeInTheDocument()
  })

  it('returns null when fewer than 3 entries', () => {
    const { container } = render(
      <LeaderboardPodium entries={mockEntries.slice(0, 2)} />,
    )
    expect(container.innerHTML).toBe('')
  })
})
