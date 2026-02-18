import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EarnedBadgeRecord {
  earnedAt: string
  lessonId?: string
}

interface BadgeState {
  /** Map of badgeId -> earned record */
  earnedBadges: Record<string, EarnedBadgeRecord>

  /** Record a newly earned badge */
  earnBadge: (badgeId: string, lessonId?: string) => void

  /** Check if a badge has been earned */
  hasBadge: (badgeId: string) => boolean

  /** Total number of earned badges */
  getBadgeCount: () => number

  /** Get the N most recently earned badge IDs */
  getRecentBadges: (count: number) => string[]
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      earnedBadges: {},

      earnBadge: (badgeId, lessonId) =>
        set((s) => {
          // Do not overwrite if already earned
          if (badgeId in s.earnedBadges) return s
          return {
            earnedBadges: {
              ...s.earnedBadges,
              [badgeId]: {
                earnedAt: new Date().toISOString(),
                ...(lessonId !== undefined ? { lessonId } : {}),
              },
            },
          }
        }),

      hasBadge: (badgeId) => badgeId in get().earnedBadges,

      getBadgeCount: () => Object.keys(get().earnedBadges).length,

      getRecentBadges: (count) => {
        const entries = Object.entries(get().earnedBadges)
        return entries
          .sort(
            (a, b) =>
              new Date(b[1].earnedAt).getTime() -
              new Date(a[1].earnedAt).getTime(),
          )
          .slice(0, count)
          .map(([id]) => id)
      },
    }),
    { name: 'ninja-keyboard-badges' },
  ),
)
