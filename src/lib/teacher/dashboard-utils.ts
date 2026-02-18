/**
 * Teacher dashboard utility functions — pure, no side effects.
 * All functions take data in and return data out.
 */

import type { AgeName } from '@/types/theme'

// ── Types ────────────────────────────────────────────────────────

export interface ProgressEntry {
  /** ISO date string */
  date: string
  wpm: number
  accuracy: number
}

export interface StudentProgress {
  id: string
  displayName: string
  age: number | null
  avatarId: string
  level: AgeName
  currentLesson: number
  totalLessons: number
  wpm: number
  accuracy: number
  lastActive: string
  history: ProgressEntry[]
}

export interface ClassStats {
  studentCount: number
  averageWpm: number
  averageAccuracy: number
  completionRate: number
  /** Percentage of students on track (accuracy >= 80%) */
  onTrackRate: number
}

export type ProgressTrend = 'improving' | 'declining' | 'stable'

export type StudentStatus = 'on-track' | 'needs-attention' | 'falling-behind'

// ── Utility Functions ────────────────────────────────────────────

/**
 * Calculate aggregate class statistics from student progress data.
 * Returns zeroed stats for empty arrays.
 */
export function calculateClassStats(students: StudentProgress[]): ClassStats {
  if (students.length === 0) {
    return {
      studentCount: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      completionRate: 0,
      onTrackRate: 0,
    }
  }

  const totalWpm = students.reduce((sum, s) => sum + s.wpm, 0)
  const totalAccuracy = students.reduce((sum, s) => sum + s.accuracy, 0)
  const totalCompletion = students.reduce(
    (sum, s) => sum + (s.totalLessons > 0 ? s.currentLesson / s.totalLessons : 0),
    0
  )
  const onTrackCount = students.filter((s) => s.accuracy >= 80).length

  return {
    studentCount: students.length,
    averageWpm: Math.round(totalWpm / students.length),
    averageAccuracy: Math.round(totalAccuracy / students.length),
    completionRate: Math.round((totalCompletion / students.length) * 100),
    onTrackRate: Math.round((onTrackCount / students.length) * 100),
  }
}

/**
 * Filter students performing below the given WPM threshold.
 * Sorted ascending by WPM (weakest first).
 */
export function getWeakStudents(
  students: StudentProgress[],
  threshold: number
): StudentProgress[] {
  return students
    .filter((s) => s.wpm < threshold)
    .toSorted((a, b) => a.wpm - b.wpm)
}

/**
 * Return the top N students sorted by WPM descending, then accuracy descending.
 */
export function getTopPerformers(
  students: StudentProgress[],
  count: number
): StudentProgress[] {
  return students
    .toSorted((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)
    .slice(0, count)
}

/**
 * Determine progress trend from a history of entries.
 * Compares average of first half vs second half.
 * Needs at least 2 entries for a meaningful comparison.
 */
export function calculateProgressTrend(history: ProgressEntry[]): ProgressTrend {
  if (history.length < 2) {
    return 'stable'
  }

  const mid = Math.floor(history.length / 2)
  const firstHalf = history.slice(0, mid)
  const secondHalf = history.slice(mid)

  const avgFirst = firstHalf.reduce((sum, e) => sum + e.wpm, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((sum, e) => sum + e.wpm, 0) / secondHalf.length

  const diff = avgSecond - avgFirst
  const threshold = 2 // WPM difference threshold

  if (diff > threshold) return 'improving'
  if (diff < -threshold) return 'declining'
  return 'stable'
}

/**
 * Generate a Hebrew summary report string from class statistics.
 */
export function generateClassReport(stats: ClassStats): string {
  if (stats.studentCount === 0) {
    return 'אין תלמידים בכיתה.'
  }

  const lines: string[] = [
    `סה"כ תלמידים: ${stats.studentCount}`,
    `מהירות הקלדה ממוצעת: ${stats.averageWpm} מילים לדקה`,
    `דיוק ממוצע: ${stats.averageAccuracy}%`,
    `התקדמות כללית: ${stats.completionRate}%`,
    `תלמידים במסלול: ${stats.onTrackRate}%`,
  ]

  if (stats.onTrackRate < 50) {
    lines.push('שימו לב: מעל מחצית התלמידים מתקשים. מומלץ לתת תרגול נוסף.')
  }

  return lines.join('\n')
}

/**
 * Determine a student's status based on accuracy and completion.
 */
export function getStudentStatus(student: StudentProgress): StudentStatus {
  const completionRate =
    student.totalLessons > 0 ? student.currentLesson / student.totalLessons : 0

  if (student.accuracy >= 80 && completionRate >= 0.3) {
    return 'on-track'
  }
  if (student.accuracy >= 60 || completionRate >= 0.15) {
    return 'needs-attention'
  }
  return 'falling-behind'
}

/**
 * Get the trend arrow character for a given trend.
 */
export function getTrendArrow(trend: ProgressTrend): string {
  const arrows: Record<ProgressTrend, string> = {
    improving: '\u2191',
    declining: '\u2193',
    stable: '\u2192',
  }
  return arrows[trend]
}

/**
 * Format a date string to a Hebrew-friendly short format.
 * Returns relative text for recent dates.
 */
export function formatLastActive(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'היום'
  if (diffDays === 1) return 'אתמול'
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`
  return `לפני ${Math.floor(diffDays / 30)} חודשים`
}
