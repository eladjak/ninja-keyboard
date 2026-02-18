/** Emotional state detection from typing patterns - pure functions, no side effects */

import type { Keystroke } from '@/lib/typing-engine/types'

export type EmotionalState =
  | 'frustrated'
  | 'confused'
  | 'perfectionist'
  | 'bored'
  | 'flow'
  | 'improving'
  | 'neutral'

export type Trend = 'rising' | 'falling' | 'stable'

export interface EmotionalIndicators {
  /** WPM trend comparing first half vs second half of session */
  wpmTrend: Trend
  /** Accuracy trend comparing first half vs second half of session */
  accuracyTrend: Trend
  /** Ratio of backspaces to total keystrokes */
  backspaceRatio: number
  /** Number of pauses longer than 10 seconds */
  pauseCount: number
  /** Average duration of long pauses in ms */
  avgPauseDuration: number
  /** Consecutive correct characters at the end of session */
  streakLength: number
  /** Total session duration in ms */
  sessionDuration: number
}

/** Pause threshold in ms - pauses longer than this are counted */
const PAUSE_THRESHOLD_MS = 10_000

/** Backspace key identifier */
const BACKSPACE_CODE = 'Backspace'

/** Trend delta threshold - differences below this are considered "stable" */
const TREND_THRESHOLD = 0.05

/**
 * Compute wpm for a slice of keystrokes.
 * Hebrew word = 5.5 chars
 */
function computeWpmForSlice(keystrokes: Keystroke[]): number {
  if (keystrokes.length < 2) return 0
  const first = keystrokes[0]
  const last = keystrokes[keystrokes.length - 1]
  const durationMin = (last.timestamp - first.timestamp) / 60_000
  if (durationMin <= 0) return 0
  return keystrokes.length / 5.5 / durationMin
}

/**
 * Compute accuracy (0-1) for a slice of keystrokes.
 * Excludes backspace keys from accuracy calculation.
 */
function computeAccuracyForSlice(keystrokes: Keystroke[]): number {
  const typed = keystrokes.filter((k) => k.code !== BACKSPACE_CODE)
  if (typed.length === 0) return 1
  const correct = typed.filter((k) => k.isCorrect).length
  return correct / typed.length
}

/**
 * Determine trend direction between two values.
 * Returns 'rising' if second is significantly higher, 'falling' if lower, 'stable' otherwise.
 */
function computeTrend(first: number, second: number): Trend {
  const delta = second - first
  const base = Math.max(first, 0.001)
  const relativeDelta = delta / base
  if (relativeDelta > TREND_THRESHOLD) return 'rising'
  if (relativeDelta < -TREND_THRESHOLD) return 'falling'
  return 'stable'
}

/**
 * Compute EmotionalIndicators from a raw keystroke list.
 * Pure function - no side effects.
 */
export function computeIndicators(
  keystrokes: Keystroke[],
  sessionDuration: number,
): EmotionalIndicators {
  if (keystrokes.length === 0) {
    return {
      wpmTrend: 'stable',
      accuracyTrend: 'stable',
      backspaceRatio: 0,
      pauseCount: 0,
      avgPauseDuration: 0,
      streakLength: 0,
      sessionDuration,
    }
  }

  // --- Backspace ratio ---
  const backspaceCount = keystrokes.filter((k) => k.code === BACKSPACE_CODE).length
  const backspaceRatio = backspaceCount / keystrokes.length

  // --- Pause detection ---
  const pauseDurations: number[] = []
  for (let i = 1; i < keystrokes.length; i++) {
    const gap = keystrokes[i].timestamp - keystrokes[i - 1].timestamp
    if (gap > PAUSE_THRESHOLD_MS) {
      pauseDurations.push(gap)
    }
  }
  const pauseCount = pauseDurations.length
  const avgPauseDuration =
    pauseCount > 0 ? pauseDurations.reduce((a, b) => a + b, 0) / pauseCount : 0

  // --- Streak length (trailing correct keystrokes) ---
  let streakLength = 0
  for (let i = keystrokes.length - 1; i >= 0; i--) {
    const k = keystrokes[i]
    if (k.code === BACKSPACE_CODE) break
    if (!k.isCorrect) break
    streakLength++
  }

  // --- WPM + accuracy trends (split session in half) ---
  const midpoint = Math.floor(keystrokes.length / 2)
  const firstHalf = keystrokes.slice(0, midpoint)
  const secondHalf = keystrokes.slice(midpoint)

  const wpmFirst = computeWpmForSlice(firstHalf)
  const wpmSecond = computeWpmForSlice(secondHalf)
  const wpmTrend = keystrokes.length < 4 ? 'stable' : computeTrend(wpmFirst, wpmSecond)

  const accFirst = computeAccuracyForSlice(firstHalf)
  const accSecond = computeAccuracyForSlice(secondHalf)
  const accuracyTrend = keystrokes.length < 4 ? 'stable' : computeTrend(accFirst, accSecond)

  return {
    wpmTrend,
    accuracyTrend,
    backspaceRatio,
    pauseCount,
    avgPauseDuration,
    streakLength,
    sessionDuration,
  }
}

/**
 * Detect the user's emotional state from their typing indicators.
 * Priority order: flow > frustrated > confused > perfectionist > bored > improving > neutral
 */
export function detectEmotionalState(indicators: EmotionalIndicators): EmotionalState {
  const {
    wpmTrend,
    accuracyTrend,
    backspaceRatio,
    pauseCount,
    avgPauseDuration,
    streakLength,
    sessionDuration,
  } = indicators

  // Flow: long streak (in the zone!)
  if (streakLength >= 20) {
    return 'flow'
  }

  // Frustrated: typing faster but making more mistakes
  if (wpmTrend === 'rising' && accuracyTrend === 'falling') {
    return 'frustrated'
  }

  // Confused: many long pauses (doesn't know what to press)
  if (pauseCount >= 3 && avgPauseDuration > 10_000) {
    return 'confused'
  }

  // Perfectionist: keeps deleting and retrying
  if (backspaceRatio > 0.3) {
    return 'perfectionist'
  }

  // Bored: slowing down but staying accurate in a long session
  const fiveMinutes = 5 * 60_000
  if (wpmTrend === 'falling' && accuracyTrend === 'stable' && sessionDuration > fiveMinutes) {
    return 'bored'
  }

  // Improving: getting faster without losing accuracy
  if (wpmTrend === 'rising' && (accuracyTrend === 'stable' || accuracyTrend === 'rising')) {
    return 'improving'
  }

  return 'neutral'
}
