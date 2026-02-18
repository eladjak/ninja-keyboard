/** Pure utility functions for the profile page */

export type NinjaRank =
  | 'beginner'
  | 'apprentice'
  | 'warrior'
  | 'master'
  | 'grandmaster'

const RANK_THRESHOLDS: { min: number; max: number; rank: NinjaRank }[] = [
  { min: 1, max: 4, rank: 'beginner' },
  { min: 5, max: 9, rank: 'apprentice' },
  { min: 10, max: 14, rank: 'warrior' },
  { min: 15, max: 18, rank: 'master' },
  { min: 19, max: 20, rank: 'grandmaster' },
]

const RANK_DISPLAY_NAMES: Record<NinjaRank, string> = {
  beginner: 'מתחיל',
  apprentice: 'חניך',
  warrior: 'לוחם',
  master: 'מאסטר',
  grandmaster: 'גרנדמאסטר',
}

const RANK_EMOJIS: Record<NinjaRank, string> = {
  beginner: '🥋',
  apprentice: '🥷',
  warrior: '⚔️',
  master: '👑',
  grandmaster: '🏆',
}

/** XP milestones with Hebrew labels */
const XP_MILESTONES = [
  { target: 100, label: '100 נקודות ניסיון' },
  { target: 250, label: '250 נקודות ניסיון' },
  { target: 500, label: '500 נקודות ניסיון' },
  { target: 1000, label: '1,000 נקודות ניסיון' },
  { target: 2000, label: '2,000 נקודות ניסיון' },
  { target: 3000, label: '3,000 נקודות ניסיון' },
  { target: 5000, label: '5,000 נקודות ניסיון' },
  { target: 7500, label: '7,500 נקודות ניסיון' },
  { target: 10000, label: '10,000 נקודות ניסיון' },
]

/**
 * Get the ninja rank based on the user's level (1-20).
 * Levels 1-4: beginner, 5-9: apprentice, 10-14: warrior, 15-18: master, 19-20: grandmaster
 */
export function getNinjaRank(level: number): NinjaRank {
  const clamped = Math.max(1, Math.min(20, Math.round(level)))
  for (const { min, max, rank } of RANK_THRESHOLDS) {
    if (clamped >= min && clamped <= max) return rank
  }
  return 'beginner'
}

/** Get the Hebrew display name for a ninja rank */
export function getRankDisplayName(rank: NinjaRank): string {
  return RANK_DISPLAY_NAMES[rank]
}

/** Get the emoji for a ninja rank */
export function getRankEmoji(rank: NinjaRank): string {
  return RANK_EMOJIS[rank]
}

/**
 * Format an array of session durations (in minutes) into a Hebrew time string.
 * Returns "X שעות Y דקות" or just "Y דקות" if under 1 hour.
 */
export function calculateTotalTypingTime(sessions: number[]): string {
  const totalMinutes = sessions.reduce((sum, m) => sum + m, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours === 0) {
    return `${minutes} דקות`
  }

  if (minutes === 0) {
    return `${hours} שעות`
  }

  return `${hours} שעות ${minutes} דקות`
}

/**
 * Get the next XP milestone that the user hasn't reached yet.
 * If all milestones are passed, returns the last one with a "+1000" next target.
 */
export function getNextMilestone(xp: number): { target: number; label: string } {
  for (const milestone of XP_MILESTONES) {
    if (xp < milestone.target) return milestone
  }

  // Past all milestones - compute the next 1000 milestone
  const nextThousand = Math.ceil((xp + 1) / 1000) * 1000
  return {
    target: nextThousand,
    label: `${nextThousand.toLocaleString()} נקודות ניסיון`,
  }
}

/**
 * Calculate a completion percentage (0-100) from completed and total counts.
 * Returns 0 if total is 0.
 */
export function calculateCompletionPercentage(
  completed: number,
  total: number,
): number {
  if (total <= 0) return 0
  return Math.round(Math.min(100, (completed / total) * 100))
}
