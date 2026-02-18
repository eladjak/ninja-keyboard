import { LESSON_CONTENT } from '@/lib/content/sentences'
import { calculateWpm } from '@/lib/typing-engine/engine'

// ── Types ──────────────────────────────────────────────────────────

export type BattleDifficulty = 'easy' | 'medium' | 'hard'

export interface BattleConfig {
  difficulty: BattleDifficulty
  textLength: number
}

export type BattleStatus = 'idle' | 'countdown' | 'playing' | 'finished'
export type BattleWinner = 'player' | 'ai' | null

export interface BattleState {
  /** Player typing progress (char index) */
  playerProgress: number
  /** AI typing progress (char index, can be fractional internally) */
  aiProgress: number
  /** Current battle status */
  status: BattleStatus
  /** Winner once battle is finished */
  winner: BattleWinner
  /** Elapsed time in ms since battle started */
  timeElapsed: number
  /** The text both contestants are typing */
  text: string
  /** Battle configuration */
  config: BattleConfig
  /** Player keystrokes (total) */
  playerTotalKeystrokes: number
  /** Player correct keystrokes */
  playerCorrectKeystrokes: number
  /** AI correct characters (for WPM) */
  aiCorrectChars: number
  /** Accumulated fractional AI chars (sub-character progress) */
  aiFractionalProgress: number
}

// ── Constants ──────────────────────────────────────────────────────

/** AI words per minute by difficulty */
const AI_WPM: Record<BattleDifficulty, number> = {
  easy: 15,
  medium: 30,
  hard: 50,
}

/** AI error rate by difficulty (0-1) */
const AI_ERROR_RATE: Record<BattleDifficulty, number> = {
  easy: 0.1,
  medium: 0.05,
  hard: 0.02,
}

/** Average Hebrew word length in characters (including spaces) */
const AVG_WORD_LENGTH = 5.5

// ── Pure Functions ─────────────────────────────────────────────────

/**
 * Get a random battle text of approximately the given length
 * by combining random lines from the lesson content library.
 */
export function getBattleText(textLength: number): string {
  const allLines: string[] = []
  for (const content of Object.values(LESSON_CONTENT)) {
    for (const line of content.lines) {
      allLines.push(line)
    }
  }

  if (allLines.length === 0) {
    return 'שלום עולם'
  }

  const parts: string[] = []
  let currentLength = 0

  // Keep adding random lines until we reach or exceed target length
  while (currentLength < textLength) {
    const index = Math.floor(Math.random() * allLines.length)
    const line = allLines[index]
    parts.push(line)
    currentLength += line.length + 1 // +1 for space separator
  }

  const joined = parts.join(' ')
  // Trim to approximate target length, but don't cut mid-word
  if (joined.length > textLength) {
    const trimmed = joined.slice(0, textLength)
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace > textLength * 0.7) {
      return trimmed.slice(0, lastSpace)
    }
    return trimmed
  }

  return joined
}

/**
 * Create a new battle state from config.
 */
export function createBattle(config: BattleConfig): BattleState {
  const text = getBattleText(config.textLength)

  return {
    playerProgress: 0,
    aiProgress: 0,
    status: 'idle',
    winner: null,
    timeElapsed: 0,
    text,
    config,
    playerTotalKeystrokes: 0,
    playerCorrectKeystrokes: 0,
    aiCorrectChars: 0,
    aiFractionalProgress: 0,
  }
}

/**
 * Update player progress when they type a character correctly.
 * Returns a new state with updated progress and keystroke counts.
 */
export function updatePlayerProgress(
  state: BattleState,
  charIndex: number,
  isCorrect: boolean,
): BattleState {
  if (state.status !== 'playing') return state

  return {
    ...state,
    playerProgress: isCorrect ? charIndex + 1 : state.playerProgress,
    playerTotalKeystrokes: state.playerTotalKeystrokes + 1,
    playerCorrectKeystrokes: isCorrect
      ? state.playerCorrectKeystrokes + 1
      : state.playerCorrectKeystrokes,
  }
}

/**
 * Advance AI progress based on elapsed time delta.
 * AI types at its configured WPM with simulated errors.
 * Uses a deterministic seeded approach: for each character interval,
 * the AI has a chance to "miss" (error rate), which adds delay.
 */
export function updateAiProgress(
  state: BattleState,
  deltaMs: number,
): BattleState {
  if (state.status !== 'playing') return state

  const { config, text } = state
  const wpm = AI_WPM[config.difficulty]
  const errorRate = AI_ERROR_RATE[config.difficulty]

  // Characters per millisecond = (wpm * avgWordLength) / 60000
  const charsPerMs = (wpm * AVG_WORD_LENGTH) / 60_000

  // Effective chars typed this frame (reduced by error rate overhead)
  // When AI makes an error, it wastes ~2 chars of time (type wrong + backspace)
  const effectiveRate = charsPerMs * (1 - errorRate * 2)
  const rawAdvance = deltaMs * effectiveRate

  const newFractional = state.aiFractionalProgress + rawAdvance
  const newProgress = Math.min(Math.floor(newFractional), text.length)
  const aiCorrectChars = newProgress

  return {
    ...state,
    aiProgress: newProgress,
    aiFractionalProgress: newFractional,
    aiCorrectChars,
    timeElapsed: state.timeElapsed + deltaMs,
  }
}

/**
 * Check if there's a winner.
 * Returns 'player' or 'ai' if someone reached the end, null otherwise.
 */
export function checkWinner(
  state: BattleState,
  textLength: number,
): BattleWinner {
  if (state.playerProgress >= textLength && state.aiProgress >= textLength) {
    // Both finished - whoever has more progress wins (player gets priority on tie)
    return state.playerProgress >= state.aiProgress ? 'player' : 'ai'
  }
  if (state.playerProgress >= textLength) return 'player'
  if (state.aiProgress >= textLength) return 'ai'
  return null
}

/**
 * Calculate XP earned from a battle.
 * Winners get bonus XP. Higher difficulty = more XP.
 */
export function calculateBattleXp(
  won: boolean,
  difficulty: BattleDifficulty,
  wpm: number,
): number {
  const difficultyMultiplier: Record<BattleDifficulty, number> = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  }

  const baseXp = 15
  const winBonus = won ? 25 : 0
  const speedBonus = Math.floor(wpm / 5)
  const multiplier = difficultyMultiplier[difficulty]

  return Math.round((baseXp + winBonus + speedBonus) * multiplier)
}

/**
 * Get AI WPM for a given difficulty.
 */
export function getAiWpm(difficulty: BattleDifficulty): number {
  return AI_WPM[difficulty]
}

/**
 * Get AI error rate for a given difficulty.
 */
export function getAiErrorRate(difficulty: BattleDifficulty): number {
  return AI_ERROR_RATE[difficulty]
}

/**
 * Calculate player WPM from battle state.
 */
export function calculatePlayerWpm(state: BattleState): number {
  return calculateWpm(state.playerCorrectKeystrokes, state.timeElapsed)
}

/**
 * Calculate player accuracy from battle state.
 */
export function calculatePlayerAccuracy(state: BattleState): number {
  if (state.playerTotalKeystrokes === 0) return 100
  return Math.round(
    (state.playerCorrectKeystrokes / state.playerTotalKeystrokes) * 100,
  )
}

/**
 * Calculate AI effective WPM from battle state.
 */
export function calculateAiEffectiveWpm(state: BattleState): number {
  return calculateWpm(state.aiCorrectChars, state.timeElapsed)
}
