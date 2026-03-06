import { create } from 'zustand'
import type {
  RivalName,
  DifficultyLevel,
  AIOpponentState,
  AIKeystrokeEvent,
  AIMatchResult,
  AIOpponentMood,
} from '@/types/ai-opponent'

// ── Store Interface ─────────────────────────────────────────────────

interface AIOpponentStoreState {
  /** Currently active rival (null if no battle) */
  activeRival: RivalName | null
  /** Current difficulty level (1-5) */
  difficulty: DifficultyLevel
  /** Whether rubber-banding is enabled */
  rubberBandEnabled: boolean
  /** AI opponent's public state */
  opponentState: AIOpponentState
  /** Player's current typing position (for rubber-banding) */
  playerPosition: number
  /** Current AI mood for avatar reactions */
  mood: AIOpponentMood
  /** Whether a battle is currently in progress */
  isActive: boolean
  /** Final match result (set when battle ends) */
  matchResult: AIMatchResult | null
  /** All keystroke events from the current battle */
  keystrokes: AIKeystrokeEvent[]

  // ── Actions ─────────────────────────────────────────────────────

  /** Start a new battle with a specific rival */
  startBattle: (rival: RivalName, difficulty: DifficultyLevel, rubberBand?: boolean) => void
  /** Stop the current battle */
  stopBattle: () => void
  /** Process an AI keystroke event */
  processKeystroke: (event: AIKeystrokeEvent) => void
  /** Update the player's current position (for rubber-banding) */
  updatePlayerPosition: (position: number) => void
  /** Set the difficulty level */
  setDifficulty: (difficulty: DifficultyLevel) => void
  /** Set the match result when battle completes */
  setMatchResult: (result: AIMatchResult) => void
  /** Update the AI's mood based on battle state */
  updateMood: (textLength: number) => void
  /** Reset all state */
  reset: () => void
}

// ── Initial State ───────────────────────────────────────────────────

const INITIAL_OPPONENT_STATE: AIOpponentState = {
  currentPosition: 0,
  currentWPM: 0,
  errors: 0,
  isTyping: false,
  progress: 0,
  accuracy: 100,
}

// ── Mood Calculation ────────────────────────────────────────────────

function calculateMood(
  aiPosition: number,
  playerPosition: number,
  progress: number,
  errors: number,
): AIOpponentMood {
  const gap = aiPosition - playerPosition

  // End of battle
  if (progress >= 1) {
    return gap >= 0 ? 'victorious' : 'defeated'
  }

  // AI is struggling (many errors or falling behind significantly)
  if (errors > 5 && gap < -10) {
    return 'struggling'
  }

  // Player just overtook AI
  if (gap < -5 && gap > -15) {
    return 'surprised'
  }

  // AI is leading comfortably
  if (gap > 10) {
    return 'confident'
  }

  return 'neutral'
}

// ── Store ───────────────────────────────────────────────────────────

export const useAIOpponentStore = create<AIOpponentStoreState>()((set, get) => ({
  activeRival: null,
  difficulty: 3 as DifficultyLevel,
  rubberBandEnabled: true,
  opponentState: { ...INITIAL_OPPONENT_STATE },
  playerPosition: 0,
  mood: 'neutral' as AIOpponentMood,
  isActive: false,
  matchResult: null,
  keystrokes: [],

  startBattle: (rival, difficulty, rubberBand = true) =>
    set({
      activeRival: rival,
      difficulty,
      rubberBandEnabled: rubberBand,
      opponentState: { ...INITIAL_OPPONENT_STATE, isTyping: true },
      playerPosition: 0,
      mood: 'neutral',
      isActive: true,
      matchResult: null,
      keystrokes: [],
    }),

  stopBattle: () =>
    set((s) => ({
      isActive: false,
      opponentState: { ...s.opponentState, isTyping: false },
    })),

  processKeystroke: (event) =>
    set((s) => {
      const totalKeystrokes = s.keystrokes.length + 1
      const errorCount = s.keystrokes.filter((k) => k.isError).length + (event.isError ? 1 : 0)
      const accuracy = totalKeystrokes > 0
        ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)
        : 100

      return {
        keystrokes: [...s.keystrokes, event],
        opponentState: {
          currentPosition: event.position,
          currentWPM: event.wpm,
          errors: errorCount,
          isTyping: true,
          progress: s.activeRival ? event.position : 0, // Will be normalized with textLength
          accuracy,
        },
      }
    }),

  updatePlayerPosition: (position) =>
    set({ playerPosition: position }),

  setDifficulty: (difficulty) =>
    set({ difficulty }),

  setMatchResult: (result) =>
    set((s) => ({
      matchResult: result,
      isActive: false,
      opponentState: { ...s.opponentState, isTyping: false },
    })),

  updateMood: (textLength) => {
    const s = get()
    const progress = textLength > 0 ? s.opponentState.currentPosition / textLength : 0
    const mood = calculateMood(
      s.opponentState.currentPosition,
      s.playerPosition,
      progress,
      s.opponentState.errors,
    )
    set({
      mood,
      opponentState: { ...s.opponentState, progress },
    })
  },

  reset: () =>
    set({
      activeRival: null,
      difficulty: 3 as DifficultyLevel,
      rubberBandEnabled: true,
      opponentState: { ...INITIAL_OPPONENT_STATE },
      playerPosition: 0,
      mood: 'neutral',
      isActive: false,
      matchResult: null,
      keystrokes: [],
    }),
}))
