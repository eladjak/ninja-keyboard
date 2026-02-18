import type { Keystroke, SessionStats } from './types'

/**
 * Pure typing engine - no side effects, no state.
 * All functions take data in and return data out.
 */

/** Average Hebrew word length in characters (including spaces) */
const AVG_WORD_LENGTH = 5.5

/**
 * Calculate words per minute from character count and elapsed time.
 * Uses standard WPM formula: (characters / avgWordLength) / (minutes)
 */
export function calculateWpm(
  charCount: number,
  elapsedMs: number,
): number {
  if (elapsedMs <= 0 || charCount <= 0) return 0
  const minutes = elapsedMs / 60_000
  const words = charCount / AVG_WORD_LENGTH
  return Math.round(words / minutes)
}

/**
 * Calculate accuracy percentage from correct and total keystrokes.
 */
export function calculateAccuracy(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 100
  return Math.round((correctCount / totalCount) * 100)
}

/**
 * Process a single keystroke event.
 * Returns a Keystroke record for the session.
 */
export function processKeystroke(
  expected: string,
  actual: string,
  code: string,
  timestamp: number,
): Keystroke {
  return {
    expected,
    actual,
    timestamp,
    isCorrect: expected === actual,
    code,
  }
}

/**
 * Compute full session statistics from a list of keystrokes.
 */
export function computeSessionStats(
  keystrokes: readonly Keystroke[],
  startedAt: number,
  endedAt: number,
): SessionStats {
  const totalKeystrokes = keystrokes.length
  const correctKeystrokes = keystrokes.filter((k) => k.isCorrect).length
  const errorKeystrokes = totalKeystrokes - correctKeystrokes
  const durationMs = endedAt - startedAt

  const keyAccuracy: Record<string, { correct: number; total: number }> = {}
  for (const ks of keystrokes) {
    const entry = keyAccuracy[ks.expected] ?? { correct: 0, total: 0 }
    entry.total += 1
    if (ks.isCorrect) entry.correct += 1
    keyAccuracy[ks.expected] = entry
  }

  return {
    wpm: calculateWpm(correctKeystrokes, durationMs),
    accuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes),
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    durationMs,
    keyAccuracy,
  }
}

/**
 * Find the weakest keys based on session stats.
 * Returns keys sorted by error rate (highest first).
 */
export function findWeakKeys(
  stats: SessionStats,
  minAttempts: number = 3,
): Array<{ char: string; accuracy: number; total: number }> {
  return Object.entries(stats.keyAccuracy)
    .filter(([, data]) => data.total >= minAttempts)
    .map(([char, data]) => ({
      char,
      accuracy: Math.round((data.correct / data.total) * 100),
      total: data.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
}

/**
 * Calculate real-time WPM from the last N seconds of keystrokes.
 * Provides a smoother, more current reading than total WPM.
 */
export function calculateRealtimeWpm(
  keystrokes: readonly Keystroke[],
  windowMs: number = 5_000,
): number {
  if (keystrokes.length < 2) return 0

  const now = keystrokes[keystrokes.length - 1].timestamp
  const windowStart = now - windowMs
  const recentKeystrokes = keystrokes.filter(
    (k) => k.timestamp >= windowStart && k.isCorrect,
  )

  if (recentKeystrokes.length < 2) return 0

  const firstTimestamp = recentKeystrokes[0].timestamp
  const elapsed = now - firstTimestamp
  return calculateWpm(recentKeystrokes.length, elapsed)
}

/**
 * Determine if a lesson is completed based on stats and targets.
 */
export function isLessonComplete(
  stats: SessionStats,
  targetWpm: number,
  targetAccuracy: number,
): boolean {
  return stats.wpm >= targetWpm && stats.accuracy >= targetAccuracy
}

/**
 * Calculate XP reward for a completed session.
 */
export function calculateXpReward(
  stats: SessionStats,
  targetWpm: number,
  targetAccuracy: number,
  streak: number,
): {
  base: number
  accuracyBonus: number
  speedBonus: number
  streakMultiplier: number
  total: number
} {
  const base = 10

  // Bonus for exceeding accuracy target (1 XP per % above target)
  const accuracyBonus = Math.max(0, stats.accuracy - targetAccuracy)

  // Bonus for exceeding WPM target (2 XP per WPM above target)
  const speedBonus = Math.max(0, (stats.wpm - targetWpm) * 2)

  // Streak multiplier: 1.0, 1.1, 1.2, ..., up to 2.0
  const streakMultiplier = Math.min(2.0, 1 + streak * 0.1)

  const total = Math.round((base + accuracyBonus + speedBonus) * streakMultiplier)

  return { base, accuracyBonus, speedBonus, streakMultiplier, total }
}
