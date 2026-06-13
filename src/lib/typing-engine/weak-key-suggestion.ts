/**
 * Weak-key drill auto-suggestion.
 *
 * After a lesson finishes below the accuracy threshold, we surface a gentle,
 * encouraging nudge to drill the keys the kid missed the most. Pure functions —
 * no side effects, no state.
 */

import type { SessionStats } from './types'

/** Accuracy below this (percent) triggers a weak-key drill suggestion. */
export const DRILL_SUGGEST_THRESHOLD = 85

/** Default maximum number of keys to suggest drilling at once. */
const DEFAULT_MAX_KEYS = 4

/** Minimum attempts on a key before it can be considered "weak". */
const MIN_ATTEMPTS = 2

export interface WeakKeyHit {
  /** The Hebrew character. */
  char: string
  /** Per-key accuracy (0-100). */
  accuracy: number
  /** Total attempts on this key in the session. */
  total: number
  /** Number of errors on this key in the session. */
  errors: number
}

/**
 * Find the keys the kid missed most in a single session, sorted worst-first.
 *
 * A key is a candidate when it has at least one error and meets the minimum
 * attempts bar. Ranking favors keys with more errors, breaking ties by lower
 * accuracy (so a 1/10 key ranks above a 9/10 key with the same error count).
 */
export function findMissedKeys(
  stats: Pick<SessionStats, 'keyAccuracy'>,
  maxKeys: number = DEFAULT_MAX_KEYS,
): WeakKeyHit[] {
  const hits: WeakKeyHit[] = []

  for (const [char, data] of Object.entries(stats.keyAccuracy)) {
    // Ignore whitespace — drilling "space" is not meaningful for kids.
    if (char.trim() === '') continue
    const errors = data.total - data.correct
    if (errors <= 0) continue
    if (data.total < MIN_ATTEMPTS) continue
    hits.push({
      char,
      total: data.total,
      errors,
      accuracy: Math.round((data.correct / data.total) * 100),
    })
  }

  hits.sort((a, b) => {
    if (b.errors !== a.errors) return b.errors - a.errors
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy
    return a.char.localeCompare(b.char, 'he')
  })

  return hits.slice(0, Math.max(0, maxKeys))
}

export interface DrillSuggestion {
  /** Whether a drill should be suggested at all. */
  suggest: boolean
  /** The keys to drill, worst-first. */
  keys: string[]
  /** Encouraging Hebrew headline. */
  titleHe: string
  /** Encouraging Hebrew body copy mentioning the specific keys. */
  messageHe: string
}

/**
 * Build a complete, kid-friendly drill suggestion from a finished session.
 *
 * The copy is always encouraging and never punishing: it frames the missed keys
 * as "the keys we'll make friends with", in line with the game's voice.
 */
export function buildDrillSuggestion(
  stats: Pick<SessionStats, 'accuracy' | 'keyAccuracy'>,
  maxKeys: number = DEFAULT_MAX_KEYS,
): DrillSuggestion {
  const empty: DrillSuggestion = {
    suggest: false,
    keys: [],
    titleHe: '',
    messageHe: '',
  }

  if (stats.accuracy >= DRILL_SUGGEST_THRESHOLD) return empty

  const missed = findMissedKeys(stats, maxKeys)
  if (missed.length === 0) return empty

  const keys = missed.map((m) => m.char)
  const keyList = keys.join(' ')

  // Singular / plural Hebrew copy.
  const messageHe =
    keys.length === 1
      ? `שמנו לב שהמקש ${keyList} קצת מאתגר. בוא נתרגל אותו יחד — דקה ותהיה אלוף!`
      : `שמנו לב שכמה מקשים מאתגרים אותך: ${keyList}. בוא נתרגל אותם יחד — דקה ותהיה אלוף!`

  return {
    suggest: true,
    keys,
    titleHe: 'בוא נחזק את המקשים החלשים 💪',
    messageHe,
  }
}

/**
 * Build the `/drill` deep-link URL for a set of weak keys.
 * Keys are URL-encoded and comma-separated.
 */
export function drillHref(keys: string[]): string {
  if (keys.length === 0) return '/drill'
  const param = encodeURIComponent(keys.join(','))
  return `/drill?keys=${param}`
}

/**
 * Parse a `keys` query-param value back into a clean array of single chars.
 * Tolerates extra whitespace and empty entries.
 */
export function parseDrillKeys(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
}
