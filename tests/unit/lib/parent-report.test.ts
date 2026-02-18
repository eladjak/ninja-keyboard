import { describe, it, expect } from 'vitest'
import { generateParentReport, TREND_LABELS } from '@/lib/reports/parent-report'

function makeResults(count: number, baseWpm = 20, baseAccuracy = 85) {
  return Array.from({ length: count }, (_, i) => ({
    wpm: baseWpm + i,
    accuracy: Math.min(100, baseAccuracy + Math.floor(i / 2)),
    durationMs: 60_000,
    completedAt: Date.now() - (count - i) * 86_400_000,
  }))
}

describe('generateParentReport', () => {
  it('generates a report with all required fields', () => {
    const report = generateParentReport({
      totalXp: 500,
      level: 5,
      streak: 3,
      lessonsCompleted: 8,
      totalLessons: 20,
      results: makeResults(10),
    })

    expect(report.generatedAt).toBeGreaterThan(0)
    expect(report.summary).toBeDefined()
    expect(report.performance).toBeDefined()
    expect(report.strengths).toBeDefined()
    expect(report.areasToImprove).toBeDefined()
    expect(report.recommendationHe).toBeTruthy()
  })

  it('calculates summary correctly', () => {
    const report = generateParentReport({
      totalXp: 1000,
      level: 8,
      streak: 5,
      lessonsCompleted: 12,
      totalLessons: 20,
      results: makeResults(15),
    })

    expect(report.summary.totalSessions).toBe(15)
    expect(report.summary.totalPracticeMinutes).toBe(15) // 15 * 60,000ms = 15 min
    expect(report.summary.currentLevel).toBe(8)
    expect(report.summary.totalXp).toBe(1000)
    expect(report.summary.streak).toBe(5)
    expect(report.summary.lessonsCompleted).toBe(12)
    expect(report.summary.totalLessons).toBe(20)
  })

  it('calculates performance metrics', () => {
    const report = generateParentReport({
      totalXp: 300,
      level: 3,
      streak: 2,
      lessonsCompleted: 5,
      totalLessons: 20,
      results: makeResults(5, 15, 80),
    })

    expect(report.performance.bestWpm).toBeGreaterThanOrEqual(15)
    expect(report.performance.averageWpm).toBeGreaterThanOrEqual(15)
    expect(report.performance.bestAccuracy).toBeGreaterThanOrEqual(80)
    expect(report.performance.averageAccuracy).toBeGreaterThanOrEqual(80)
  })

  it('handles empty results', () => {
    const report = generateParentReport({
      totalXp: 0,
      level: 1,
      streak: 0,
      lessonsCompleted: 0,
      totalLessons: 20,
      results: [],
    })

    expect(report.summary.totalSessions).toBe(0)
    expect(report.performance.bestWpm).toBe(0)
    expect(report.performance.averageWpm).toBe(0)
    expect(report.performance.wpmTrend).toBe('stable')
    expect(report.recommendationHe).toContain('עדיין לא התחיל')
  })

  it('identifies high accuracy as a strength', () => {
    const report = generateParentReport({
      totalXp: 200,
      level: 3,
      streak: 2,
      lessonsCompleted: 3,
      totalLessons: 20,
      results: makeResults(5, 10, 92),
    })

    expect(report.strengths.some((s) => s.includes('דיוק'))).toBe(true)
  })

  it('identifies low accuracy as area to improve', () => {
    const report = generateParentReport({
      totalXp: 200,
      level: 3,
      streak: 2,
      lessonsCompleted: 3,
      totalLessons: 20,
      results: makeResults(10, 10, 60),
    })

    expect(report.areasToImprove.some((a) => a.includes('דיוק'))).toBe(true)
  })

  it('detects improving WPM trend', () => {
    // Create results where recent ones are faster
    const results = Array.from({ length: 12 }, (_, i) => ({
      wpm: 10 + i * 3, // Clearly increasing
      accuracy: 85,
      durationMs: 60_000,
      completedAt: Date.now() - (12 - i) * 86_400_000,
    }))

    const report = generateParentReport({
      totalXp: 500,
      level: 5,
      streak: 3,
      lessonsCompleted: 8,
      totalLessons: 20,
      results,
    })

    expect(report.performance.wpmTrend).toBe('improving')
  })

  it('generates recommendation for new users', () => {
    const report = generateParentReport({
      totalXp: 50,
      level: 1,
      streak: 1,
      lessonsCompleted: 1,
      totalLessons: 20,
      results: makeResults(2),
    })

    expect(report.recommendationHe).toContain('התחלה מצוינת')
  })

  it('generates recommendation for consistent users', () => {
    const report = generateParentReport({
      totalXp: 1000,
      level: 8,
      streak: 10,
      lessonsCompleted: 10,
      totalLessons: 20,
      results: makeResults(20, 20, 85),
    })

    expect(report.recommendationHe).toContain('עקביות')
  })
})

describe('TREND_LABELS', () => {
  it('has Hebrew labels for all trends', () => {
    expect(TREND_LABELS.improving).toBeTruthy()
    expect(TREND_LABELS.stable).toBeTruthy()
    expect(TREND_LABELS.declining).toBeTruthy()
  })
})
