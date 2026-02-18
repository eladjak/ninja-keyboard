/**
 * Placement engine — pure functions for the 2-minute placement test.
 * No side effects, no state. All functions take data in and return data out.
 */
import { calculateWpm, calculateAccuracy } from '@/lib/typing-engine/engine'
import { CHAR_TO_KEY } from '@/lib/typing-engine/keyboard-layout'
import type { Keystroke } from '@/lib/typing-engine/types'

// ── Types ────────────────────────────────────────────────────────

export type SkillLevel = 'shatil' | 'nevet' | 'geza' | 'anaf' | 'tzameret'
export type FingerTechnique = 'none' | 'partial' | 'full'

export interface PlacementResult {
  /** Determined skill level */
  level: SkillLevel
  /** Words per minute from stage 1 */
  wpm: number
  /** Accuracy percentage from stage 1 */
  accuracy: number
  /** Hebrew characters identified correctly in stage 2 */
  knownKeys: string[]
  /** Keyboard shortcuts known from stage 3 */
  knownShortcuts: string[]
  /** Recommended lesson number (1-20) */
  recommendedLesson: number
  /** Finger technique assessment from keystroke analysis */
  fingerTechnique: FingerTechnique
}

export interface Stage1Data {
  /** All keystrokes recorded during free typing */
  keystrokes: Keystroke[]
  /** Duration of the stage in milliseconds */
  durationMs: number
}

export interface Stage2Data {
  /** Characters the student identified correctly */
  knownKeys: string[]
}

export interface Stage3Data {
  /** Shortcuts the student performed correctly */
  knownShortcuts: string[]
}

// ── WPM thresholds ───────────────────────────────────────────────

const LEVEL_THRESHOLDS: Record<SkillLevel, [min: number, max: number]> = {
  shatil:   [0,   5],    // < 5 WPM
  nevet:    [5,   15],   // 5-14 WPM
  geza:     [15,  30],   // 15-29 WPM
  anaf:     [30,  50],   // 30-49 WPM
  tzameret: [50, Infinity], // 50+ WPM
}

// ── determineLevel ───────────────────────────────────────────────

/**
 * Determine the student's skill level based on WPM.
 * Thresholds: < 5 → shatil, 5-14 → nevet, 15-29 → geza, 30-49 → anaf, 50+ → tzameret
 */
export function determineLevel(wpm: number): SkillLevel {
  if (wpm < 5) return 'shatil'
  if (wpm < 15) return 'nevet'
  if (wpm < 30) return 'geza'
  if (wpm < 50) return 'anaf'
  return 'tzameret'
}

// ── calculateFingerTechnique ─────────────────────────────────────

/**
 * Assess finger technique by checking whether keystrokes used the expected
 * physical key code for each Hebrew character.
 *
 * "full"    → ≥ 80% of keystrokes used correct finger position
 * "partial" → 40-79% used correct position
 * "none"    → < 40% used correct position (or no keystrokes)
 */
export function calculateFingerTechnique(keystrokes: Keystroke[]): FingerTechnique {
  if (keystrokes.length === 0) return 'none'

  const hebrewKeystrokes = keystrokes.filter((ks) => CHAR_TO_KEY.has(ks.expected))
  if (hebrewKeystrokes.length === 0) return 'none'

  const correctFingerCount = hebrewKeystrokes.filter((ks) => {
    const keyDef = CHAR_TO_KEY.get(ks.expected)
    return keyDef?.code === ks.code
  }).length

  const ratio = correctFingerCount / hebrewKeystrokes.length

  if (ratio >= 0.8) return 'full'
  if (ratio >= 0.4) return 'partial'
  return 'none'
}

// ── computePlacementResult ───────────────────────────────────────

/**
 * Compute the full placement result from all three stage data objects.
 */
export function computePlacementResult(
  stage1: Stage1Data,
  stage2: Stage2Data,
  stage3: Stage3Data,
): PlacementResult {
  const correctCount = stage1.keystrokes.filter((ks) => ks.isCorrect).length
  const totalCount = stage1.keystrokes.length

  const wpm = calculateWpm(correctCount, stage1.durationMs)
  const accuracy = calculateAccuracy(correctCount, totalCount)
  const fingerTechnique = calculateFingerTechnique(stage1.keystrokes)
  const level = determineLevel(wpm)

  const partial: Omit<PlacementResult, 'recommendedLesson'> = {
    level,
    wpm,
    accuracy,
    knownKeys: stage2.knownKeys,
    knownShortcuts: stage3.knownShortcuts,
    fingerTechnique,
  }

  const recommendedLesson = getRecommendedLesson({ ...partial, recommendedLesson: 1 })

  return { ...partial, recommendedLesson }
}

// ── getRecommendedLesson ─────────────────────────────────────────

/** Minimum starting lesson for each level */
const LEVEL_BASE_LESSON: Record<SkillLevel, number> = {
  shatil:   1,
  nevet:    3,
  geza:     6,
  anaf:     11,
  tzameret: 16,
}

/**
 * Map a PlacementResult to the recommended starting lesson (1-20).
 * Adjusts upward based on WPM within the level band, capped at 20.
 */
export function getRecommendedLesson(result: PlacementResult): number {
  const base = LEVEL_BASE_LESSON[result.level]

  // Fine-tune within the band based on WPM
  const [minWpm, maxWpm] = LEVEL_THRESHOLDS[result.level]
  const bandSize = Number.isFinite(maxWpm) ? maxWpm - minWpm : 20
  const offset = Math.min(
    Math.floor(((result.wpm - minWpm) / bandSize) * 2),
    2,
  )

  return Math.min(base + offset, 20)
}
