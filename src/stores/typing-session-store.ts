import { create } from 'zustand'
import type { Keystroke, TypingSession } from '@/lib/typing-engine/types'
import {
  processKeystroke,
  computeSessionStats,
  calculateRealtimeWpm,
} from '@/lib/typing-engine/engine'

interface TypingSessionState extends TypingSession {
  /** Start a new typing session */
  startSession: (text: string, lessonId: string | null) => void
  /** Record a keystroke */
  typeKey: (actual: string, code: string) => void
  /** Pause the session */
  pause: () => void
  /** Resume the session */
  resume: () => void
  /** Advance to the next line in the lesson */
  nextLine: (text: string) => void
  /** End and reset the session */
  endSession: () => void
  /** Get computed stats for current session */
  getStats: () => ReturnType<typeof computeSessionStats> | null
  /** Get real-time WPM */
  getRealtimeWpm: () => number
}

export const useTypingSessionStore = create<TypingSessionState>()(
  (set, get) => ({
    text: '',
    currentIndex: 0,
    keystrokes: [],
    startedAt: null,
    isActive: false,
    isPaused: false,
    lessonId: null,
    currentLine: 0,

    startSession: (text, lessonId) =>
      set({
        text,
        currentIndex: 0,
        keystrokes: [],
        startedAt: performance.now(),
        isActive: true,
        isPaused: false,
        lessonId,
        currentLine: 0,
      }),

    typeKey: (actual, code) => {
      const state = get()
      if (!state.isActive || state.isPaused) return
      if (state.currentIndex >= state.text.length) return

      const expected = state.text[state.currentIndex]
      const timestamp = performance.now()
      const keystroke = processKeystroke(expected, actual, code, timestamp)

      set((s) => ({
        keystrokes: [...s.keystrokes, keystroke],
        currentIndex: keystroke.isCorrect ? s.currentIndex + 1 : s.currentIndex,
      }))
    },

    pause: () =>
      set({ isPaused: true }),

    resume: () =>
      set({ isPaused: false }),

    nextLine: (text) =>
      set((s) => ({
        text,
        currentIndex: 0,
        currentLine: s.currentLine + 1,
      })),

    endSession: () =>
      set({
        isActive: false,
        isPaused: false,
      }),

    getStats: () => {
      const state = get()
      if (!state.startedAt || state.keystrokes.length === 0) return null
      return computeSessionStats(
        state.keystrokes,
        state.startedAt,
        performance.now(),
      )
    },

    getRealtimeWpm: () => {
      const state = get()
      return calculateRealtimeWpm(state.keystrokes)
    },
  }),
)
