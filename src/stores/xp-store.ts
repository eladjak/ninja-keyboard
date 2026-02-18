import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** XP thresholds for each level (cumulative) */
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  50,    // Level 2
  120,   // Level 3
  210,   // Level 4
  320,   // Level 5
  450,   // Level 6
  600,   // Level 7
  780,   // Level 8
  1000,  // Level 9
  1250,  // Level 10
  1550,  // Level 11
  1900,  // Level 12
  2300,  // Level 13
  2750,  // Level 14
  3250,  // Level 15
  3800,  // Level 16
  4400,  // Level 17
  5100,  // Level 18
  5900,  // Level 19
  6800,  // Level 20 (Max)
] as const

interface CompletedLesson {
  lessonId: string
  bestWpm: number
  bestAccuracy: number
  completedAt: number
  attempts: number
}

interface XpState {
  /** Total XP earned */
  totalXp: number
  /** Current level (1-20) */
  level: number
  /** Current daily streak */
  streak: number
  /** Date of last practice (YYYY-MM-DD) */
  lastPracticeDate: string | null
  /** Completed lessons map */
  completedLessons: Record<string, CompletedLesson>
  /** Add XP and recalculate level */
  addXp: (amount: number) => void
  /** Record a completed lesson */
  completeLesson: (lessonId: string, wpm: number, accuracy: number) => void
  /** Update streak (call on session start) */
  updateStreak: () => void
  /** Get XP needed for next level */
  xpToNextLevel: () => number
  /** Get progress percentage to next level */
  levelProgress: () => number
  /** Check if a lesson has been completed */
  isLessonCompleted: (lessonId: string) => boolean
}

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export const useXpStore = create<XpState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,
      completedLessons: {},

      addXp: (amount) =>
        set((s) => {
          const totalXp = s.totalXp + amount
          return { totalXp, level: calculateLevel(totalXp) }
        }),

      completeLesson: (lessonId, wpm, accuracy) =>
        set((s) => {
          const existing = s.completedLessons[lessonId]
          const completedLesson: CompletedLesson = {
            lessonId,
            bestWpm: existing ? Math.max(existing.bestWpm, wpm) : wpm,
            bestAccuracy: existing
              ? Math.max(existing.bestAccuracy, accuracy)
              : accuracy,
            completedAt: Date.now(),
            attempts: existing ? existing.attempts + 1 : 1,
          }
          return {
            completedLessons: {
              ...s.completedLessons,
              [lessonId]: completedLesson,
            },
          }
        }),

      updateStreak: () =>
        set((s) => {
          const today = getTodayString()
          if (s.lastPracticeDate === today) return s

          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          const streak =
            s.lastPracticeDate === yesterdayStr ? s.streak + 1 : 1

          return { streak, lastPracticeDate: today }
        }),

      xpToNextLevel: () => {
        const { totalXp, level } = get()
        if (level >= LEVEL_THRESHOLDS.length) return 0
        return LEVEL_THRESHOLDS[level] - totalXp
      },

      levelProgress: () => {
        const { totalXp, level } = get()
        if (level >= LEVEL_THRESHOLDS.length) return 100
        const currentThreshold = LEVEL_THRESHOLDS[level - 1]
        const nextThreshold = LEVEL_THRESHOLDS[level]
        const range = nextThreshold - currentThreshold
        const progress = totalXp - currentThreshold
        return Math.round((progress / range) * 100)
      },

      isLessonCompleted: (lessonId) => {
        return lessonId in get().completedLessons
      },
    }),
    { name: 'ninja-keyboard-xp' },
  ),
)
