import { describe, it, expect } from 'vitest'
import {
  calculateClassStats,
  getWeakStudents,
  getTopPerformers,
  calculateProgressTrend,
  generateClassReport,
  getStudentStatus,
  getTrendArrow,
  formatLastActive,
  type StudentProgress,
  type ProgressEntry,
} from '@/lib/teacher/dashboard-utils'

// ── Test Helpers ─────────────────────────────────────────────────

function makeStudent(overrides: Partial<StudentProgress> = {}): StudentProgress {
  return {
    id: 'test-1',
    displayName: 'תלמיד טסט',
    age: 10,
    avatarId: 'fox',
    level: 'geza',
    currentLesson: 5,
    totalLessons: 20,
    wpm: 25,
    accuracy: 85,
    lastActive: '2026-02-18T10:00:00Z',
    history: [],
    ...overrides,
  }
}

// ── calculateClassStats ──────────────────────────────────────────

describe('calculateClassStats', () => {
  it('returns zeroed stats for empty array', () => {
    const stats = calculateClassStats([])
    expect(stats).toEqual({
      studentCount: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      completionRate: 0,
      onTrackRate: 0,
    })
  })

  it('calculates correct stats for a single student', () => {
    const students = [makeStudent({ wpm: 30, accuracy: 90, currentLesson: 10, totalLessons: 20 })]
    const stats = calculateClassStats(students)
    expect(stats.studentCount).toBe(1)
    expect(stats.averageWpm).toBe(30)
    expect(stats.averageAccuracy).toBe(90)
    expect(stats.completionRate).toBe(50) // 10/20 = 50%
    expect(stats.onTrackRate).toBe(100) // 90% >= 80%
  })

  it('calculates averages for multiple students', () => {
    const students = [
      makeStudent({ id: '1', wpm: 20, accuracy: 80 }),
      makeStudent({ id: '2', wpm: 40, accuracy: 90 }),
    ]
    const stats = calculateClassStats(students)
    expect(stats.averageWpm).toBe(30)
    expect(stats.averageAccuracy).toBe(85)
    expect(stats.studentCount).toBe(2)
  })

  it('calculates on-track rate correctly', () => {
    const students = [
      makeStudent({ id: '1', accuracy: 90 }),   // on track
      makeStudent({ id: '2', accuracy: 80 }),   // on track (exactly 80)
      makeStudent({ id: '3', accuracy: 70 }),   // NOT on track
      makeStudent({ id: '4', accuracy: 50 }),   // NOT on track
    ]
    const stats = calculateClassStats(students)
    expect(stats.onTrackRate).toBe(50) // 2/4
  })

  it('handles students with 0 total lessons', () => {
    const students = [makeStudent({ currentLesson: 0, totalLessons: 0 })]
    const stats = calculateClassStats(students)
    expect(stats.completionRate).toBe(0)
  })

  it('rounds values to nearest integer', () => {
    const students = [
      makeStudent({ id: '1', wpm: 33, accuracy: 77, currentLesson: 7, totalLessons: 20 }),
      makeStudent({ id: '2', wpm: 28, accuracy: 83, currentLesson: 4, totalLessons: 20 }),
    ]
    const stats = calculateClassStats(students)
    // (33+28)/2 = 30.5 → 31
    expect(stats.averageWpm).toBe(31)
    // (77+83)/2 = 80
    expect(stats.averageAccuracy).toBe(80)
  })
})

// ── getWeakStudents ──────────────────────────────────────────────

describe('getWeakStudents', () => {
  it('returns empty array when no students below threshold', () => {
    const students = [makeStudent({ wpm: 30 }), makeStudent({ id: '2', wpm: 25 })]
    const result = getWeakStudents(students, 20)
    expect(result).toHaveLength(0)
  })

  it('returns students below threshold sorted by WPM ascending', () => {
    const students = [
      makeStudent({ id: '1', displayName: 'אלי', wpm: 15 }),
      makeStudent({ id: '2', displayName: 'דנה', wpm: 25 }),
      makeStudent({ id: '3', displayName: 'גיל', wpm: 10 }),
    ]
    const result = getWeakStudents(students, 20)
    expect(result).toHaveLength(2)
    expect(result[0].displayName).toBe('גיל')  // 10 WPM
    expect(result[1].displayName).toBe('אלי')  // 15 WPM
  })

  it('returns empty array for empty input', () => {
    expect(getWeakStudents([], 20)).toHaveLength(0)
  })

  it('excludes students exactly at the threshold', () => {
    const students = [makeStudent({ wpm: 20 })]
    const result = getWeakStudents(students, 20)
    expect(result).toHaveLength(0)
  })
})

// ── getTopPerformers ─────────────────────────────────────────────

describe('getTopPerformers', () => {
  it('returns top N students sorted by WPM descending', () => {
    const students = [
      makeStudent({ id: '1', displayName: 'א', wpm: 30 }),
      makeStudent({ id: '2', displayName: 'ב', wpm: 50 }),
      makeStudent({ id: '3', displayName: 'ג', wpm: 40 }),
    ]
    const top = getTopPerformers(students, 2)
    expect(top).toHaveLength(2)
    expect(top[0].displayName).toBe('ב')  // 50 WPM
    expect(top[1].displayName).toBe('ג')  // 40 WPM
  })

  it('returns all students if count exceeds length', () => {
    const students = [makeStudent({ id: '1' }), makeStudent({ id: '2' })]
    const top = getTopPerformers(students, 10)
    expect(top).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(getTopPerformers([], 5)).toHaveLength(0)
  })

  it('uses accuracy as tiebreaker when WPM is equal', () => {
    const students = [
      makeStudent({ id: '1', displayName: 'א', wpm: 30, accuracy: 80 }),
      makeStudent({ id: '2', displayName: 'ב', wpm: 30, accuracy: 95 }),
    ]
    const top = getTopPerformers(students, 2)
    expect(top[0].displayName).toBe('ב')  // higher accuracy
    expect(top[1].displayName).toBe('א')
  })
})

// ── calculateProgressTrend ───────────────────────────────────────

describe('calculateProgressTrend', () => {
  it('returns stable for empty history', () => {
    expect(calculateProgressTrend([])).toBe('stable')
  })

  it('returns stable for single entry', () => {
    const history: ProgressEntry[] = [{ date: '2026-02-10', wpm: 20, accuracy: 80 }]
    expect(calculateProgressTrend(history)).toBe('stable')
  })

  it('detects improving trend', () => {
    const history: ProgressEntry[] = [
      { date: '2026-02-01', wpm: 10, accuracy: 70 },
      { date: '2026-02-05', wpm: 12, accuracy: 75 },
      { date: '2026-02-10', wpm: 20, accuracy: 80 },
      { date: '2026-02-15', wpm: 25, accuracy: 85 },
    ]
    expect(calculateProgressTrend(history)).toBe('improving')
  })

  it('detects declining trend', () => {
    const history: ProgressEntry[] = [
      { date: '2026-02-01', wpm: 30, accuracy: 90 },
      { date: '2026-02-05', wpm: 28, accuracy: 88 },
      { date: '2026-02-10', wpm: 18, accuracy: 75 },
      { date: '2026-02-15', wpm: 15, accuracy: 70 },
    ]
    expect(calculateProgressTrend(history)).toBe('declining')
  })

  it('returns stable for minimal change', () => {
    const history: ProgressEntry[] = [
      { date: '2026-02-01', wpm: 20, accuracy: 80 },
      { date: '2026-02-10', wpm: 21, accuracy: 81 },
    ]
    expect(calculateProgressTrend(history)).toBe('stable')
  })
})

// ── generateClassReport ──────────────────────────────────────────

describe('generateClassReport', () => {
  it('returns empty class message for 0 students', () => {
    const stats = calculateClassStats([])
    const report = generateClassReport(stats)
    expect(report).toBe('אין תלמידים בכיתה.')
  })

  it('includes student count in Hebrew', () => {
    const stats = calculateClassStats([makeStudent()])
    const report = generateClassReport(stats)
    expect(report).toContain('סה"כ תלמידים: 1')
  })

  it('includes average WPM in Hebrew', () => {
    const stats = calculateClassStats([makeStudent({ wpm: 30 })])
    const report = generateClassReport(stats)
    expect(report).toContain('מהירות הקלדה ממוצעת: 30 מילים לדקה')
  })

  it('includes average accuracy percentage', () => {
    const stats = calculateClassStats([makeStudent({ accuracy: 88 })])
    const report = generateClassReport(stats)
    expect(report).toContain('דיוק ממוצע: 88%')
  })

  it('includes warning when on-track rate is below 50%', () => {
    const students = [
      makeStudent({ id: '1', accuracy: 50 }),
      makeStudent({ id: '2', accuracy: 40 }),
      makeStudent({ id: '3', accuracy: 60 }),
    ]
    const stats = calculateClassStats(students)
    const report = generateClassReport(stats)
    expect(report).toContain('מומלץ לתת תרגול נוסף')
  })

  it('does not include warning when on-track rate is above 50%', () => {
    const students = [
      makeStudent({ id: '1', accuracy: 90 }),
      makeStudent({ id: '2', accuracy: 85 }),
      makeStudent({ id: '3', accuracy: 95 }),
    ]
    const stats = calculateClassStats(students)
    const report = generateClassReport(stats)
    expect(report).not.toContain('מומלץ לתת תרגול נוסף')
  })
})

// ── getStudentStatus ─────────────────────────────────────────────

describe('getStudentStatus', () => {
  it('returns on-track for high accuracy and good completion', () => {
    const student = makeStudent({ accuracy: 90, currentLesson: 8, totalLessons: 20 })
    expect(getStudentStatus(student)).toBe('on-track')
  })

  it('returns needs-attention for moderate accuracy', () => {
    const student = makeStudent({ accuracy: 65, currentLesson: 1, totalLessons: 20 })
    expect(getStudentStatus(student)).toBe('needs-attention')
  })

  it('returns falling-behind for low accuracy and low completion', () => {
    const student = makeStudent({ accuracy: 40, currentLesson: 1, totalLessons: 20 })
    expect(getStudentStatus(student)).toBe('falling-behind')
  })
})

// ── getTrendArrow ────────────────────────────────────────────────

describe('getTrendArrow', () => {
  it('returns up arrow for improving', () => {
    expect(getTrendArrow('improving')).toBe('\u2191')
  })

  it('returns down arrow for declining', () => {
    expect(getTrendArrow('declining')).toBe('\u2193')
  })

  it('returns right arrow for stable', () => {
    expect(getTrendArrow('stable')).toBe('\u2192')
  })
})
