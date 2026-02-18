import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileHover, whileTap, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Default XP store state
const defaultXpState = {
  totalXp: 350,
  level: 5,
  streak: 3,
  lastPracticeDate: '2026-02-18',
  completedLessons: {
    'lesson-1': {
      lessonId: 'lesson-1',
      bestWpm: 25,
      bestAccuracy: 92,
      completedAt: Date.now() - 86400000 * 2,
      attempts: 3,
    },
    'lesson-2': {
      lessonId: 'lesson-2',
      bestWpm: 30,
      bestAccuracy: 88,
      completedAt: Date.now() - 86400000,
      attempts: 2,
    },
    'lesson-3': {
      lessonId: 'lesson-3',
      bestWpm: 28,
      bestAccuracy: 95,
      completedAt: Date.now(),
      attempts: 1,
    },
  },
  addXp: vi.fn(),
  completeLesson: vi.fn(),
  updateStreak: vi.fn(),
  xpToNextLevel: vi.fn(() => 100),
  levelProgress: vi.fn(() => 65),
  isLessonCompleted: vi.fn(() => true),
}

// Default badge store state
const defaultBadgeState = {
  earnedBadges: {
    'first-lesson': { earnedAt: '2026-01-15T10:00:00Z' },
    'accurate': { earnedAt: '2026-02-01T14:30:00Z' },
  },
  earnBadge: vi.fn(),
  hasBadge: vi.fn((id: string) => id in { 'first-lesson': true, 'accurate': true }),
  getBadgeCount: vi.fn(() => 2),
  getRecentBadges: vi.fn(() => ['accurate', 'first-lesson']),
}

// Mock stores
vi.mock('@/stores/xp-store', () => ({
  useXpStore: vi.fn(() => defaultXpState),
}))

vi.mock('@/stores/badge-store', () => ({
  useBadgeStore: vi.fn(() => defaultBadgeState),
}))

// Import after mocks
import { ProfileCard } from '@/components/profile/profile-card'
import { BadgeShowcase } from '@/components/profile/badge-showcase'
import { StatsChart } from '@/components/profile/stats-chart'
import { ProfileClient } from '@/app/(app)/profile/profile-client'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'

describe('ProfileCard', () => {
  beforeEach(() => {
    vi.mocked(useXpStore).mockReturnValue(defaultXpState)
  })

  it('renders the ninja rank for level 5 (apprentice)', () => {
    render(<ProfileCard />)
    expect(screen.getByText(/חניך/)).toBeInTheDocument()
  })

  it('renders the XP progress bar', () => {
    render(<ProfileCard />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(/רמה 5/)).toBeInTheDocument()
  })

  it('renders 4 stats in the stats grid', () => {
    render(<ProfileCard />)
    const statsList = screen.getByRole('list', { name: 'סטטיסטיקות' })
    const items = within(statsList).getAllByRole('listitem')
    expect(items).toHaveLength(4)
  })

  it('displays the best WPM from completed lessons', () => {
    render(<ProfileCard />)
    // Best WPM is 30 from lesson-2
    expect(screen.getByText('30 מ/ד')).toBeInTheDocument()
  })

  it('displays the streak with fire emoji', () => {
    render(<ProfileCard />)
    expect(screen.getByText(/3 ימים/)).toBeInTheDocument()
  })

  it('shows editable display name', async () => {
    const user = userEvent.setup()
    render(<ProfileCard />)
    const nameButton = screen.getByRole('button', { name: 'ערוך שם תצוגה' })
    expect(nameButton).toBeInTheDocument()
    await user.click(nameButton)
    expect(screen.getByRole('textbox', { name: 'שם תצוגה' })).toBeInTheDocument()
  })
})

describe('BadgeShowcase', () => {
  beforeEach(() => {
    vi.mocked(useBadgeStore).mockReturnValue(defaultBadgeState)
  })

  it('renders badge count', () => {
    render(<BadgeShowcase />)
    // 2 earned out of 11 total badge definitions
    expect(screen.getByText(/2\/11 תגים/)).toBeInTheDocument()
  })

  it('renders all badge items in the grid', () => {
    render(<BadgeShowcase />)
    const badgeList = screen.getByRole('list', { name: 'רשימת תגים' })
    const items = within(badgeList).getAllByRole('listitem')
    // 11 total badge definitions
    expect(items).toHaveLength(11)
  })

  it('shows badge details when clicked', async () => {
    const user = userEvent.setup()
    render(<BadgeShowcase />)
    const firstBadge = screen.getByRole('listitem', { name: /צעד ראשון/ })
    await user.click(firstBadge)
    expect(screen.getByRole('dialog', { name: /פרטי תג/ })).toBeInTheDocument()
    expect(screen.getByText('השלמת את השיעור הראשון שלך!')).toBeInTheDocument()
  })
})

describe('StatsChart', () => {
  beforeEach(() => {
    vi.mocked(useXpStore).mockReturnValue(defaultXpState)
  })

  it('renders bars for completed lessons', () => {
    render(<StatsChart />)
    // 3 lessons = 3 bars
    expect(screen.getByTestId('bar-0')).toBeInTheDocument()
    expect(screen.getByTestId('bar-1')).toBeInTheDocument()
    expect(screen.getByTestId('bar-2')).toBeInTheDocument()
  })

  it('displays min/max/avg labels in Hebrew', () => {
    render(<StatsChart />)
    expect(screen.getByText('מינימום')).toBeInTheDocument()
    expect(screen.getByText('ממוצע')).toBeInTheDocument()
    expect(screen.getByText('מקסימום')).toBeInTheDocument()
  })

  it('shows empty state for new user with no sessions', () => {
    vi.mocked(useXpStore).mockReturnValue({
      ...defaultXpState,
      completedLessons: {},
    })
    render(<StatsChart />)
    expect(screen.getByText(/אין נתונים עדיין/)).toBeInTheDocument()
  })
})

describe('ProfileClient (full page)', () => {
  beforeEach(() => {
    vi.mocked(useXpStore).mockReturnValue(defaultXpState)
    vi.mocked(useBadgeStore).mockReturnValue(defaultBadgeState)
  })

  it('renders the page heading', () => {
    render(<ProfileClient />)
    expect(screen.getByRole('heading', { name: 'הפרופיל שלי' })).toBeInTheDocument()
  })

  it('renders all three sections (card, chart, badges)', () => {
    render(<ProfileClient />)
    // Profile card
    expect(screen.getByText(/חניך/)).toBeInTheDocument()
    // Stats chart
    expect(screen.getByText('היסטוריית מהירות')).toBeInTheDocument()
    // Badge showcase
    expect(screen.getByText('תגים והישגים')).toBeInTheDocument()
  })
})
