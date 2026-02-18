import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../tests/utils'
import { HomeDashboard } from '@/app/(app)/home/home-client'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock the xp store
const mockXpStore = {
  totalXp: 0,
  level: 1,
  streak: 0,
  completedLessons: {} as Record<
    string,
    {
      lessonId: string
      bestWpm: number
      bestAccuracy: number
      completedAt: number
      attempts: number
    }
  >,
  levelProgress: () => 0,
  lastPracticeDate: null,
  addXp: vi.fn(),
  completeLesson: vi.fn(),
  updateStreak: vi.fn(),
  xpToNextLevel: () => 50,
  isLessonCompleted: () => false,
}

vi.mock('@/stores/xp-store', () => ({
  useXpStore: () => mockXpStore,
}))

// Mock the badge store
const mockBadgeStore = {
  earnedBadges: {} as Record<string, { earnedAt: string; lessonId?: string }>,
  getRecentBadges: (_count: number) => [] as string[],
  hasBadge: () => false,
  earnBadge: vi.fn(),
  getBadgeCount: () => 0,
}

vi.mock('@/stores/badge-store', () => ({
  useBadgeStore: () => mockBadgeStore,
}))

// Mock radix-ui Progress to avoid native element issues in jsdom
vi.mock('radix-ui', () => ({
  Slot: {
    Root: ({
      children,
      ...props
    }: {
      children?: React.ReactNode
      [key: string]: unknown
    }) => <span {...props}>{children}</span>,
  },
  Progress: {
    Root: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode
      className?: string
      value?: number
      [key: string]: unknown
    }) => (
      <div role="progressbar" className={className} {...props}>
        {children}
      </div>
    ),
    Indicator: ({
      className,
      style,
    }: {
      className?: string
      style?: React.CSSProperties
    }) => <div className={className} style={style} />,
  },
}))

describe('HomeDashboard', () => {
  beforeEach(() => {
    // Reset to default new-user state
    mockXpStore.totalXp = 0
    mockXpStore.level = 1
    mockXpStore.streak = 0
    mockXpStore.completedLessons = {}
    mockXpStore.levelProgress = () => 0
    mockBadgeStore.getRecentBadges = () => []
    mockBadgeStore.hasBadge = () => false
  })

  it('renders the welcome message with ninja emoji', () => {
    render(<HomeDashboard />)
    expect(screen.getByText(/שלום, נינג'ה!/)).toBeInTheDocument()
    expect(screen.getByLabelText('נינג\'ה')).toBeInTheDocument()
  })

  it('shows XP value', () => {
    mockXpStore.totalXp = 250
    render(<HomeDashboard />)
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('XP')).toBeInTheDocument()
  })

  it('shows current level', () => {
    mockXpStore.level = 5
    render(<HomeDashboard />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('רמה')).toBeInTheDocument()
  })

  it('shows streak days', () => {
    mockXpStore.streak = 7
    render(<HomeDashboard />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('ימי רצף')).toBeInTheDocument()
  })

  it('shows lessons completed count', () => {
    mockXpStore.completedLessons = {
      'lesson-01': {
        lessonId: 'lesson-01',
        bestWpm: 15,
        bestAccuracy: 90,
        completedAt: Date.now(),
        attempts: 1,
      },
      'lesson-02': {
        lessonId: 'lesson-02',
        bestWpm: 12,
        bestAccuracy: 85,
        completedAt: Date.now(),
        attempts: 1,
      },
    }
    render(<HomeDashboard />)
    const statsRow = screen.getByTestId('stats-row')
    expect(statsRow).toHaveTextContent('2')
    expect(statsRow).toHaveTextContent('שיעורים')
  })

  it('shows continue lesson button', () => {
    render(<HomeDashboard />)
    const btn = screen.getByTestId('continue-lesson-btn')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('המשך שיעור')
  })

  it('continue lesson links to the next uncompleted lesson', () => {
    mockXpStore.completedLessons = {
      'lesson-01': {
        lessonId: 'lesson-01',
        bestWpm: 15,
        bestAccuracy: 90,
        completedAt: Date.now(),
        attempts: 1,
      },
    }
    render(<HomeDashboard />)
    const link = screen.getByTestId('continue-lesson-btn').closest('a')
    expect(link).toHaveAttribute('href', '/lessons/lesson-02')
  })

  it('renders 4 quick links', () => {
    render(<HomeDashboard />)
    const quickLinks = screen.getByTestId('quick-links')
    expect(quickLinks).toBeInTheDocument()
    // "שיעורים" appears both in stats row and quick links, so check within quickLinks
    expect(quickLinks).toHaveTextContent('שיעורים')
    expect(quickLinks).toHaveTextContent('זירת קרב')
    expect(quickLinks).toHaveTextContent('התקדמות')
    expect(quickLinks).toHaveTextContent('הגדרות')
    // Verify there are 4 link cards
    const links = quickLinks.querySelectorAll('a')
    expect(links).toHaveLength(4)
  })

  it('renders daily challenge card', () => {
    render(<HomeDashboard />)
    const challenge = screen.getByTestId('daily-challenge')
    expect(challenge).toBeInTheDocument()
    expect(screen.getByText('אתגר יומי')).toBeInTheDocument()
    expect(screen.getByText(/הקלד \d+ מ"ש היום/)).toBeInTheDocument()
  })

  it('renders empty state for new user (0 XP, level 1, no streak)', () => {
    render(<HomeDashboard />)
    // Stats should show zeros/defaults
    const statsRow = screen.getByTestId('stats-row')
    expect(statsRow).toBeInTheDocument()
    // Multiple stats show "0" (XP, streak, lessons), so use getAllByText
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
    // Level = 1
    expect(statsRow).toHaveTextContent('1')
    expect(statsRow).toHaveTextContent('רמה')
  })

  it('shows placement test link for new users', () => {
    render(<HomeDashboard />)
    const placementLink = screen.getByTestId('placement-test-link')
    expect(placementLink).toBeInTheDocument()
    expect(placementLink).toHaveAttribute('href', '/placement')
    expect(screen.getByText('מבחן מיקום')).toBeInTheDocument()
  })

  it('hides placement test link when lessons are completed', () => {
    mockXpStore.completedLessons = {
      'lesson-01': {
        lessonId: 'lesson-01',
        bestWpm: 15,
        bestAccuracy: 90,
        completedAt: Date.now(),
        attempts: 1,
      },
    }
    render(<HomeDashboard />)
    expect(screen.queryByTestId('placement-test-link')).toBeNull()
  })

  it('renders recent activity when lessons are completed', () => {
    mockXpStore.completedLessons = {
      'lesson-01': {
        lessonId: 'lesson-01',
        bestWpm: 15,
        bestAccuracy: 92,
        completedAt: Date.now() - 10000,
        attempts: 2,
      },
      'lesson-02': {
        lessonId: 'lesson-02',
        bestWpm: 18,
        bestAccuracy: 88,
        completedAt: Date.now(),
        attempts: 1,
      },
    }
    render(<HomeDashboard />)
    const activity = screen.getByTestId('recent-activity')
    expect(activity).toBeInTheDocument()
    expect(screen.getByText('15 מ/ד')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('does not render recent activity for new user', () => {
    render(<HomeDashboard />)
    expect(screen.queryByTestId('recent-activity')).toBeNull()
  })

  it('renders achievement preview when badges are earned', () => {
    mockBadgeStore.getRecentBadges = () => ['first-lesson']
    render(<HomeDashboard />)
    const preview = screen.getByTestId('achievement-preview')
    expect(preview).toBeInTheDocument()
    expect(screen.getByText('צעד ראשון')).toBeInTheDocument()
  })

  it('does not render achievement preview when no badges', () => {
    render(<HomeDashboard />)
    expect(screen.queryByTestId('achievement-preview')).toBeNull()
  })

  it('shows level progress bar', () => {
    mockXpStore.levelProgress = () => 45
    render(<HomeDashboard />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByLabelText('התקדמות לרמה הבאה')).toBeInTheDocument()
  })
})
