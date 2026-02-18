/**
 * Parent Progress Report generator.
 * Generates a summary of the child's typing progress for parents.
 */

export interface ParentReport {
  /** Report generation date */
  generatedAt: number
  /** Overall summary */
  summary: {
    totalSessions: number
    totalPracticeMinutes: number
    currentLevel: number
    totalXp: number
    streak: number
    lessonsCompleted: number
    totalLessons: number
  }
  /** Performance metrics */
  performance: {
    bestWpm: number
    averageWpm: number
    bestAccuracy: number
    averageAccuracy: number
    wpmTrend: 'improving' | 'stable' | 'declining'
  }
  /** Strengths identified */
  strengths: string[]
  /** Areas for improvement */
  areasToImprove: string[]
  /** Recommendation in Hebrew */
  recommendationHe: string
}

interface ReportInput {
  totalXp: number
  level: number
  streak: number
  lessonsCompleted: number
  totalLessons: number
  results: Array<{
    wpm: number
    accuracy: number
    durationMs: number
    completedAt: number
  }>
}

/** Generate a parent-friendly progress report */
export function generateParentReport(input: ReportInput): ParentReport {
  const { totalXp, level, streak, lessonsCompleted, totalLessons, results } = input

  const totalSessions = results.length
  const totalPracticeMs = results.reduce((sum, r) => sum + r.durationMs, 0)
  const totalPracticeMinutes = Math.round(totalPracticeMs / 60_000)

  // Performance calculations
  const bestWpm = results.length > 0 ? Math.max(...results.map((r) => r.wpm)) : 0
  const averageWpm =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length)
      : 0
  const bestAccuracy = results.length > 0 ? Math.max(...results.map((r) => r.accuracy)) : 0
  const averageAccuracy =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)
      : 0

  // WPM trend (compare last 5 vs previous 5)
  const wpmTrend = calculateWpmTrend(results)

  // Identify strengths
  const strengths = identifyStrengths({ averageWpm, averageAccuracy, streak, lessonsCompleted, totalSessions })

  // Areas to improve
  const areasToImprove = identifyAreasToImprove({ averageWpm, averageAccuracy, streak, totalSessions })

  // Recommendation
  const recommendationHe = generateRecommendation({
    averageWpm,
    averageAccuracy,
    streak,
    totalSessions,
    lessonsCompleted,
  })

  return {
    generatedAt: Date.now(),
    summary: {
      totalSessions,
      totalPracticeMinutes,
      currentLevel: level,
      totalXp,
      streak,
      lessonsCompleted,
      totalLessons,
    },
    performance: {
      bestWpm,
      averageWpm,
      bestAccuracy,
      averageAccuracy,
      wpmTrend,
    },
    strengths,
    areasToImprove,
    recommendationHe,
  }
}

function calculateWpmTrend(
  results: Array<{ wpm: number; completedAt: number }>,
): 'improving' | 'stable' | 'declining' {
  if (results.length < 6) return 'stable'

  // Sort by completion time (newest first)
  const sorted = [...results].sort((a, b) => b.completedAt - a.completedAt)
  const recent5 = sorted.slice(0, 5)
  const prev5 = sorted.slice(5, 10)

  if (prev5.length < 5) return 'stable'

  const recentAvg = recent5.reduce((s, r) => s + r.wpm, 0) / 5
  const prevAvg = prev5.reduce((s, r) => s + r.wpm, 0) / 5

  const diff = recentAvg - prevAvg
  if (diff > 2) return 'improving'
  if (diff < -2) return 'declining'
  return 'stable'
}

function identifyStrengths(stats: {
  averageWpm: number
  averageAccuracy: number
  streak: number
  lessonsCompleted: number
  totalSessions: number
}): string[] {
  const strengths: string[] = []

  if (stats.averageAccuracy >= 90) strengths.push('דיוק מצוין - מעל 90%')
  if (stats.averageWpm >= 25) strengths.push('מהירות הקלדה גבוהה')
  if (stats.streak >= 7) strengths.push('עקביות מצוינת - רצף של שבוע ומעלה')
  if (stats.lessonsCompleted >= 10) strengths.push('מתקדם בשיעורים - סיים 10+')
  if (stats.totalSessions >= 20) strengths.push('מתרגל באופן קבוע')
  if (stats.averageAccuracy >= 80 && stats.averageWpm >= 15) strengths.push('איזון טוב בין מהירות לדיוק')

  if (strengths.length === 0) strengths.push('מתחיל מבטיח - ממשיך להתקדם')

  return strengths
}

function identifyAreasToImprove(stats: {
  averageWpm: number
  averageAccuracy: number
  streak: number
  totalSessions: number
}): string[] {
  const areas: string[] = []

  if (stats.averageAccuracy < 75) areas.push('דיוק - להתמקד בהקלדה נכונה לפני מהירות')
  if (stats.averageWpm < 15 && stats.totalSessions > 5) areas.push('מהירות - לתרגל יותר עם טקסטים קצרים')
  if (stats.streak < 3 && stats.totalSessions > 3) areas.push('עקביות - לתרגל כל יום, אפילו 5 דקות')
  if (stats.totalSessions < 5) areas.push('ניסיון - להמשיך לתרגל ולצבור ניסיון')

  return areas
}

function generateRecommendation(stats: {
  averageWpm: number
  averageAccuracy: number
  streak: number
  totalSessions: number
  lessonsCompleted: number
}): string {
  if (stats.totalSessions === 0) {
    return 'הילד/ה עדיין לא התחיל/ה לתרגל. עודדו אותם לנסות את השיעור הראשון!'
  }

  if (stats.totalSessions < 5) {
    return 'התחלה מצוינת! עודדו את הילד/ה להמשיך לתרגל כמה דקות כל יום.'
  }

  if (stats.averageAccuracy < 70) {
    return 'מומלץ להתמקד בדיוק לפני מהירות. שיעורים עם טקסטים קצרים יעזרו לשפר את הדיוק.'
  }

  if (stats.averageWpm < 15) {
    return 'הדיוק משתפר! עכשיו אפשר להתחיל להגביר קצת את המהירות דרך התרגול החופשי.'
  }

  if (stats.streak >= 7) {
    return 'עקביות מרשימה! הילד/ה מפגין/ה מחויבות אמיתית. המשיכו לעודד!'
  }

  if (stats.lessonsCompleted >= 15) {
    return 'התקדמות מצוינת בשיעורים! קרוב מאוד לסיום כל התוכנית. המשיכו כך!'
  }

  return 'התקדמות טובה! תרגול יומי של 10-15 דקות ימשיך לשפר את הביצועים.'
}

/** Hebrew labels for WPM trend */
export const TREND_LABELS: Record<ParentReport['performance']['wpmTrend'], string> = {
  improving: 'משתפר',
  stable: 'יציב',
  declining: 'ירד מעט',
}
