import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** A single practice session result */
export interface PracticeResult {
  /** Unique session ID */
  id: string
  /** Practice text ID or 'free' for custom text */
  textId: string
  /** Words per minute achieved */
  wpm: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Duration in milliseconds */
  durationMs: number
  /** Total keystrokes */
  totalKeystrokes: number
  /** Correct keystrokes */
  correctKeystrokes: number
  /** Per-key accuracy: char -> { correct, total } */
  keyAccuracy: Record<string, { correct: number; total: number }>
  /** Unix timestamp when the session was completed */
  completedAt: number
  /** Timer duration selected (in seconds), 0 = no timer */
  timerDuration: number
}

interface PracticeHistoryState {
  /** All practice results, newest first */
  results: PracticeResult[]
  /** Add a new practice result */
  addResult: (result: Omit<PracticeResult, 'id'>) => void
  /** Get results from the last N days */
  getRecentResults: (days: number) => PracticeResult[]
  /** Get best WPM ever */
  getBestWpm: () => number
  /** Get best accuracy ever */
  getBestAccuracy: () => number
  /** Get total practice time in ms */
  getTotalPracticeTime: () => number
  /** Get problematic keys sorted by error rate */
  getProblematicKeys: () => Array<{ char: string; accuracy: number; total: number }>
  /** Get WPM trend data for charting (last 20 sessions) */
  getWpmTrend: () => Array<{ sessionIndex: number; wpm: number; accuracy: number; date: string }>
  /** Clear all history */
  clearHistory: () => void
}

function generateId(): string {
  return `practice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const usePracticeHistoryStore = create<PracticeHistoryState>()(
  persist(
    (set, get) => ({
      results: [],

      addResult: (result) =>
        set((s) => ({
          results: [{ ...result, id: generateId() }, ...s.results],
        })),

      getRecentResults: (days) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        return get().results.filter((r) => r.completedAt >= cutoff)
      },

      getBestWpm: () => {
        const { results } = get()
        if (results.length === 0) return 0
        return Math.max(...results.map((r) => r.wpm))
      },

      getBestAccuracy: () => {
        const { results } = get()
        if (results.length === 0) return 0
        return Math.max(...results.map((r) => r.accuracy))
      },

      getTotalPracticeTime: () => {
        return get().results.reduce((sum, r) => sum + r.durationMs, 0)
      },

      getProblematicKeys: () => {
        const { results } = get()
        const aggregated: Record<string, { correct: number; total: number }> = {}

        for (const result of results) {
          for (const [char, data] of Object.entries(result.keyAccuracy)) {
            const existing = aggregated[char] ?? { correct: 0, total: 0 }
            existing.correct += data.correct
            existing.total += data.total
            aggregated[char] = existing
          }
        }

        return Object.entries(aggregated)
          .filter(([, data]) => data.total >= 5)
          .map(([char, data]) => ({
            char,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 100,
            total: data.total,
          }))
          .sort((a, b) => a.accuracy - b.accuracy)
      },

      getWpmTrend: () => {
        const { results } = get()
        // Return last 20 sessions in chronological order (oldest first)
        const recent = results.slice(0, 20).reverse()
        return recent.map((r, i) => ({
          sessionIndex: i + 1,
          wpm: r.wpm,
          accuracy: r.accuracy,
          date: new Date(r.completedAt).toLocaleDateString('he-IL'),
        }))
      },

      clearHistory: () => set({ results: [] }),
    }),
    { name: 'ninja-keyboard-practice-history' },
  ),
)
