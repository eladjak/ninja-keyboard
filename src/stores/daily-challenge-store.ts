import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DailyChallengeState {
  /** Map of date string -> completion status */
  completedChallenges: Record<string, { completedAt: number; xpEarned: number }>
  /** Mark a challenge as completed */
  completeChallenge: (date: string, xpEarned: number) => void
  /** Check if today's challenge is completed */
  isChallengeCompleted: (date: string) => boolean
  /** Get current streak of consecutive days */
  getChallengeStreak: () => number
  /** Get total challenges completed */
  getTotalCompleted: () => number
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      completedChallenges: {},

      completeChallenge: (date, xpEarned) =>
        set((s) => ({
          completedChallenges: {
            ...s.completedChallenges,
            [date]: { completedAt: Date.now(), xpEarned },
          },
        })),

      isChallengeCompleted: (date) => {
        return date in get().completedChallenges
      },

      getChallengeStreak: () => {
        const { completedChallenges } = get()
        let streak = 0
        const today = new Date()

        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

          if (dateStr in completedChallenges) {
            streak++
          } else if (i > 0) {
            // Allow today to be incomplete
            break
          }
        }

        return streak
      },

      getTotalCompleted: () => {
        return Object.keys(get().completedChallenges).length
      },
    }),
    { name: 'ninja-keyboard-daily-challenges' },
  ),
)
