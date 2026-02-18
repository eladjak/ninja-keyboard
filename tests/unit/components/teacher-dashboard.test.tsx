import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClassOverview, type ClassData } from '@/components/teacher/class-overview'
import { StudentCard } from '@/components/teacher/student-card'
import type { StudentProgress } from '@/lib/teacher/dashboard-utils'

// Mock radix-ui Progress (it uses DOM APIs not available in jsdom)
vi.mock('radix-ui', () => ({
  Progress: {
    Root: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div role="progressbar" className={className} {...props}>{children}</div>
    ),
    Indicator: ({ className, style, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} style={style} {...props} />
    ),
  },
  Slot: {
    Root: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
}))

// ── Test Helpers ─────────────────────────────────────────────────

function makeStudent(overrides: Partial<StudentProgress> = {}): StudentProgress {
  return {
    id: 'test-1',
    displayName: 'יעל כהן',
    age: 10,
    avatarId: 'fox',
    level: 'geza',
    currentLesson: 8,
    totalLessons: 20,
    wpm: 28,
    accuracy: 92,
    lastActive: new Date().toISOString(),
    history: [
      { date: '2026-02-10', wpm: 20, accuracy: 85 },
      { date: '2026-02-14', wpm: 25, accuracy: 90 },
      { date: '2026-02-16', wpm: 28, accuracy: 92 },
    ],
    ...overrides,
  }
}

function makeClassData(overrides: Partial<ClassData> = {}): ClassData {
  return {
    id: 'class-1',
    name: 'כיתה ד׳1',
    joinCode: 'ABCXYZ',
    students: [makeStudent()],
    ...overrides,
  }
}

// ── ClassOverview Tests ──────────────────────────────────────────

describe('ClassOverview', () => {
  it('renders class name', () => {
    render(<ClassOverview classData={makeClassData()} />)
    expect(screen.getByText('כיתה ד׳1')).toBeInTheDocument()
  })

  it('renders join code', () => {
    render(<ClassOverview classData={makeClassData()} />)
    expect(screen.getByText('ABCXYZ')).toBeInTheDocument()
  })

  it('renders student count badge', () => {
    render(<ClassOverview classData={makeClassData()} />)
    expect(screen.getByText('1 תלמידים')).toBeInTheDocument()
  })

  it('renders empty state when no students', () => {
    render(<ClassOverview classData={makeClassData({ students: [] })} />)
    expect(screen.getByText(/אין תלמידים בכיתה עדיין/)).toBeInTheDocument()
  })

  it('renders progress bar for class completion', () => {
    render(<ClassOverview classData={makeClassData()} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders aggregate stats values', () => {
    const students = [
      makeStudent({ id: '1', wpm: 20, accuracy: 80 }),
      makeStudent({ id: '2', wpm: 40, accuracy: 90 }),
    ]
    render(<ClassOverview classData={makeClassData({ students })} />)
    // Average WPM: (20+40)/2 = 30
    expect(screen.getByText('30 מ/ד')).toBeInTheDocument()
    // Average accuracy: (80+90)/2 = 85
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renders student cards for each student', () => {
    const students = [
      makeStudent({ id: '1', displayName: 'יעל' }),
      makeStudent({ id: '2', displayName: 'אורי' }),
    ]
    render(<ClassOverview classData={makeClassData({ students })} />)
    expect(screen.getByText('יעל')).toBeInTheDocument()
    expect(screen.getByText('אורי')).toBeInTheDocument()
  })
})

// ── StudentCard Tests ────────────────────────────────────────────

describe('StudentCard', () => {
  it('renders student name', () => {
    render(<StudentCard student={makeStudent()} />)
    expect(screen.getByText('יעל כהן')).toBeInTheDocument()
  })

  it('renders WPM value', () => {
    render(<StudentCard student={makeStudent({ wpm: 28 })} />)
    expect(screen.getByText('28')).toBeInTheDocument()
  })

  it('renders accuracy with percent', () => {
    render(<StudentCard student={makeStudent({ accuracy: 92 })} />)
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('renders level in Hebrew', () => {
    render(<StudentCard student={makeStudent({ level: 'geza' })} />)
    expect(screen.getByText('גזע')).toBeInTheDocument()
  })

  it('renders lessons completed / total', () => {
    render(<StudentCard student={makeStudent({ currentLesson: 8, totalLessons: 20 })} />)
    expect(screen.getByText('שיעורים: 8/20')).toBeInTheDocument()
  })

  it('renders trend arrow', () => {
    // History goes from 20 → 28, so improving
    render(<StudentCard student={makeStudent()} />)
    const arrow = screen.getByTestId('trend-arrow')
    // Improving trend arrow (up arrow)
    expect(arrow.textContent).toContain('\u2191')
  })

  it('renders on-track badge for high accuracy student', () => {
    render(<StudentCard student={makeStudent({ accuracy: 92, currentLesson: 8, totalLessons: 20 })} />)
    expect(screen.getByText('במסלול')).toBeInTheDocument()
  })

  it('renders falling-behind badge for low accuracy student', () => {
    render(
      <StudentCard
        student={makeStudent({ accuracy: 40, currentLesson: 1, totalLessons: 20 })}
      />,
    )
    expect(screen.getByText('מפגר אחרי')).toBeInTheDocument()
  })

  it('expands on click to show details', async () => {
    const user = userEvent.setup()
    render(<StudentCard student={makeStudent()} />)

    // Details not visible initially
    expect(screen.queryByTestId('expanded-details')).not.toBeInTheDocument()

    // Click to expand
    const card = screen.getByRole('button', { name: /כרטיס תלמיד/ })
    await user.click(card)

    // Details visible after click
    expect(screen.getByTestId('expanded-details')).toBeInTheDocument()
  })

  it('shows age in expanded details', async () => {
    const user = userEvent.setup()
    render(<StudentCard student={makeStudent({ age: 10 })} />)

    const card = screen.getByRole('button', { name: /כרטיס תלמיד/ })
    await user.click(card)

    const details = screen.getByTestId('expanded-details')
    expect(within(details).getByText('10')).toBeInTheDocument()
  })

  it('shows trend text in Hebrew when expanded', async () => {
    const user = userEvent.setup()
    render(<StudentCard student={makeStudent()} />)

    const card = screen.getByRole('button', { name: /כרטיס תלמיד/ })
    await user.click(card)

    const details = screen.getByTestId('expanded-details')
    expect(within(details).getByText('משתפר')).toBeInTheDocument()
  })

  it('collapses details on second click', async () => {
    const user = userEvent.setup()
    render(<StudentCard student={makeStudent()} />)

    const card = screen.getByRole('button', { name: /כרטיס תלמיד/ })
    await user.click(card) // expand
    expect(screen.getByTestId('expanded-details')).toBeInTheDocument()

    await user.click(card) // collapse
    expect(screen.queryByTestId('expanded-details')).not.toBeInTheDocument()
  })
})
