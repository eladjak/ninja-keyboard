/**
 * AI Opponent types for the Ninja Keyboard battle system.
 *
 * Defines rival characters, their typing patterns, configuration,
 * and runtime state for the AI typing engine.
 */

// ── Rival Identity ──────────────────────────────────────────────────

/** All available rival character names */
export type RivalName = 'shadow' | 'storm' | 'blaze' | 'yuki' | 'bug' | 'virus'

/** Typing pattern style that defines a rival's rhythm */
export type TypingPattern =
  | 'steady'      // Shadow: minimal variance, metronomic
  | 'burst-pause' // Storm: random speed bursts then pauses
  | 'burnout'     // Blaze: starts fast, decays over time
  | 'accelerate'  // Virus: starts slow, speeds up exponentially
  | 'chaotic'     // Bug: high variance, sometimes very fast or slow

/** Type of error the AI makes most often */
export type AIErrorType = 'adjacent' | 'random' | 'skip'

// ── Configuration ───────────────────────────────────────────────────

/** Full configuration for an AI rival's typing behavior */
export interface AITypingConfig {
  /** Target words per minute */
  baseWPM: number
  /** +/- % variance from base (e.g. 0.15 = +/-15%) */
  wpmVariance: number

  // Error behavior
  /** Probability of error per keystroke (0-1) */
  errorRate: number
  /** [min, max] ms delay before pressing backspace after error */
  correctionDelay: [number, number]
  /** Most common error type */
  errorType: AIErrorType

  // Rhythm
  /** Chance of speed burst on familiar words (0-1) */
  burstProbability: number
  /** Speed multiplier during burst (e.g. 1.5 = 50% faster) */
  burstSpeedMultiplier: number
  /** Chance of thinking pause between words (0-1) */
  pauseProbability: number
  /** [min, max] ms for thinking pauses */
  pauseDuration: [number, number]

  // Time effects
  /** % slowdown per minute (e.g. 0.02 = 2%/min). Negative = speedup. */
  fatigueRate: number
  /** Seconds of slower typing at start */
  warmupDuration: number
  /** Multiplier during warmup (e.g. 1.4 = 40% slower) */
  warmupMultiplier: number

  // Rubber-banding
  /** How aggressively AI adapts to player (0-1) */
  rubberBandStrength: number
  /** Max % change to WPM from rubber-banding (e.g. 0.15 = +/-15%) */
  maxSpeedAdjustment: number

  /** Character-specific typing behavior */
  pattern: TypingPattern
}

// ── Runtime State ───────────────────────────────────────────────────

/** Mutable internal state of the AI typing engine */
export interface AIEngineState {
  /** When the engine started (Date.now timestamp) */
  startTime: number
  /** Current character position in the target text */
  currentPosition: number
  /** Total errors made so far */
  totalErrors: number
  /** Total corrections completed */
  totalCorrections: number
  /** Whether currently processing a correction (backspace + retype) */
  pendingCorrection: {
    delay: number
    correctChar: string
  } | null
  /** Characters remaining with post-error slowdown */
  recentlyCorrected: number
  /** Whether in a speed burst (Storm pattern) */
  inBurst: boolean
  /** Characters remaining in current burst */
  burstRemaining: number
  /** Player's current position (for rubber-banding) */
  playerPosition: number
}

/** Public read-only state of the AI opponent (for UI) */
export interface AIOpponentState {
  /** Current character position in the text */
  currentPosition: number
  /** Current effective WPM */
  currentWPM: number
  /** Total errors made */
  errors: number
  /** Whether the AI is actively typing */
  isTyping: boolean
  /** Progress ratio 0-1 */
  progress: number
  /** Accuracy percentage 0-100 */
  accuracy: number
}

/** A single AI keystroke event emitted by the engine */
export interface AIKeystrokeEvent {
  /** Character that was typed */
  char: string
  /** Timestamp of the keystroke */
  time: number
  /** Whether this was an error */
  isError: boolean
  /** Current position after this keystroke */
  position: number
  /** Current WPM at this moment */
  wpm: number
}

/** Result of a completed AI match */
export interface AIMatchResult {
  /** Total time in ms */
  totalTime: number
  /** Final WPM */
  finalWPM: number
  /** Accuracy percentage 0-100 */
  accuracy: number
  /** Total errors made */
  totalErrors: number
  /** Total corrections performed */
  totalCorrections: number
}

/** AI opponent mood for portrait reactions */
export type AIOpponentMood =
  | 'neutral'
  | 'confident'
  | 'struggling'
  | 'surprised'
  | 'defeated'
  | 'victorious'

/** Difficulty level for scaling AI parameters (1-5) */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5
