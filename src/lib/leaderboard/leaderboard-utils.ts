/** Leaderboard utility functions and type definitions */

import type { AgeGroup } from '@/types/database'

export type LeaderboardCategory =
  | 'xp'
  | 'wpm'
  | 'improvement'
  | 'accuracy'
  | 'streak'

export type TimeRange = 'daily' | 'weekly' | 'allTime'

export type TrendDirection = 'up' | 'down' | 'stable'

export interface LeaderboardFilters {
  ageGroup?: AgeGroup | null
  classId?: string | null
}

export interface LeaderboardClassOption {
  id: string
  name: string
}

export interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  avatarEmoji: string
  wpm: number
  accuracy: number
  wpmImprovement: number
  accuracyImprovement: number
  level: number
  xp: number
  streak: number
  trend: TrendDirection
  age: number | null
  ageGroup: AgeGroup | null
  classId: string | null
  className: string | null
}

const CATEGORY_SORT_KEYS: Record<
  Exclude<LeaderboardCategory, 'improvement'>,
  keyof LeaderboardEntry
> = {
  wpm: 'wpm',
  accuracy: 'accuracy',
  xp: 'xp',
  streak: 'streak',
}

/**
 * Sort leaderboard entries by the given category (descending).
 * Returns a new array; does NOT mutate the original.
 */
export function sortLeaderboard(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (category === 'improvement') {
      return (
        b.wpmImprovement - a.wpmImprovement ||
        b.accuracyImprovement - a.accuracyImprovement ||
        b.xp - a.xp
      )
    }

    const key = CATEGORY_SORT_KEYS[category]
    return (b[key] as number) - (a[key] as number) || b.xp - a.xp
  })
}

/**
 * Apply age/class filters to rows that already contain the RPC metadata.
 * Missing metadata never matches an active filter, which keeps legacy RPC rows
 * honest until migration 00006 is applied.
 */
export function filterLeaderboard(
  entries: LeaderboardEntry[],
  filters: LeaderboardFilters = {},
): LeaderboardEntry[] {
  return entries.filter((entry) => {
    if (filters.ageGroup && entry.ageGroup !== filters.ageGroup) return false
    if (filters.classId && entry.classId !== filters.classId) return false
    return true
  })
}

/** Filter, sort, limit, and rank a leaderboard without mutating its source. */
export function rankLeaderboard(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
  filters: LeaderboardFilters = {},
  limit = Number.POSITIVE_INFINITY,
): LeaderboardEntry[] {
  const filtered = filterLeaderboard(entries, filters)
  return assignRanks(sortLeaderboard(filtered, category).slice(0, limit))
}

/**
 * Assign sequential rank numbers (1-based) to entries based on current order.
 * Returns a new array; does NOT mutate the original.
 */
export function assignRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}

/** Return medal emoji for top 3, empty string for the rest */
export function getMedalEmoji(rank: number): string {
  if (rank === 1) return '\u{1F947}' // gold
  if (rank === 2) return '\u{1F948}' // silver
  if (rank === 3) return '\u{1F949}' // bronze
  return ''
}

const CATEGORY_TITLES: Record<LeaderboardCategory, string> = {
  wpm: '\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA', // מהירות
  improvement: 'אלופי השיפור',
  accuracy: '\u05D3\u05D9\u05D5\u05E7', // דיוק
  xp: '\u05E0\u05D9\u05E7\u05D5\u05D3', // ניקוד
  streak: '\u05E8\u05E6\u05E3', // רצף
}

/** Return the Hebrew title for a leaderboard category */
export function getLeaderboardTitle(category: LeaderboardCategory): string {
  return CATEGORY_TITLES[category]
}

const AVATAR_EMOJIS = [
  '\u{1F977}', // ninja
  '\u{1F409}', // dragon
  '\u{1F431}', // cat
  '\u{1F436}', // dog
  '\u{1F984}', // unicorn
  '\u{1F98A}', // fox
  '\u{1F43B}', // bear
  '\u{1F981}', // lion
  '\u{1F985}', // eagle
  '\u{1F419}', // octopus
  '\u{1F40A}', // crocodile
  '\u{1F422}', // turtle
  '\u{1F989}', // owl
  '\u{1F43C}', // panda
  '\u{1F98B}', // butterfly
]

const HEBREW_NAMES = [
  '\u05D3\u05E0\u05D9\u05D0\u05DC', // דניאל
  '\u05E0\u05D5\u05E2\u05D4', // נועה
  '\u05D0\u05D9\u05EA\u05D9', // איתי
  '\u05DE\u05D9\u05D4', // מיה
  '\u05D9\u05D5\u05D1\u05DC', // יובל
  '\u05E9\u05D9\u05E8\u05D4', // שירה
  '\u05D0\u05D5\u05E8\u05D9', // אורי
  '\u05EA\u05DE\u05E8', // תמר
  '\u05E2\u05D9\u05D3\u05D5', // עידו
  '\u05DC\u05D9\u05D0\u05D5\u05E8', // ליאור
  '\u05E8\u05D5\u05E0\u05D9', // רוני
  '\u05D0\u05D3\u05E8', // אדר
  '\u05D0\u05D9\u05DC\u05D4', // אילה
  '\u05D2\u05D9\u05D0', // גיא
  '\u05E2\u05DE\u05D9\u05EA', // עמית
  '\u05D4\u05D3\u05E1', // הדס
  '\u05D0\u05DC\u05D5\u05DF', // אלון
  '\u05E0\u05D5\u05D2\u05D4', // נוגה
  '\u05E8\u05D5\u05DD', // רום
  '\u05D9\u05E2\u05DC', // יעל
]

const TRENDS: TrendDirection[] = ['up', 'down', 'stable']

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  shatil: 'שתיל (6–7)',
  nevet: 'נבט (8–9)',
  geza: 'גזע (10–11)',
  anaf: 'ענף (12–13)',
  tzameret: 'צמרת (14–16)',
}

const MOCK_CLASSES: LeaderboardClassOption[] = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'כיתה ב׳ — הרצל' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'כיתה ד׳ — אלון' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'כיתה ו׳ — נרקיסים' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'כיתה ח׳ — רבין' },
]

const MOCK_AGES = [7, 8, 10, 12, 14, 9, 11, 13, 15, 16]

function ageToGroup(age: number): AgeGroup {
  if (age < 8) return 'shatil'
  if (age < 10) return 'nevet'
  if (age < 12) return 'geza'
  if (age < 14) return 'anaf'
  return 'tzameret'
}

/** Simple seeded random for deterministic mock generation */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296
    return state / 4_294_967_296
  }
}

/**
 * Generate a mock leaderboard with `count` entries for demo / offline use.
 * Uses a fixed seed so results are deterministic per count.
 */
export function generateMockLeaderboard(
  count: number,
  category: LeaderboardCategory = 'wpm',
): LeaderboardEntry[] {
  const rand = seededRandom(42)

  const entries: LeaderboardEntry[] = Array.from({ length: count }, (_, i) => {
    const age = MOCK_AGES[i % MOCK_AGES.length]
    const classOption = MOCK_CLASSES[i % MOCK_CLASSES.length]
    const wpmImprovement = Math.round(-2 + rand() * 20)
    const accuracyImprovement = Math.round(-3 + rand() * 15)

    return {
      id: `player-${i + 1}`,
      rank: 0,
      name: HEBREW_NAMES[i % HEBREW_NAMES.length],
      avatarEmoji: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
      wpm: Math.round(10 + rand() * 50),
      accuracy: Math.round(60 + rand() * 40),
      wpmImprovement,
      accuracyImprovement,
      level: Math.round(1 + rand() * 19),
      xp: Math.round(100 + rand() * 9900),
      streak: Math.round(rand() * 30),
      trend:
        wpmImprovement > 0
          ? 'up'
          : wpmImprovement < 0
            ? 'down'
            : TRENDS[Math.floor(rand() * TRENDS.length)],
      age,
      ageGroup: ageToGroup(age),
      classId: classOption.id,
      className: classOption.name,
    }
  })

  return assignRanks(sortLeaderboard(entries, category))
}

/**
 * Find a player's rank in a sorted leaderboard.
 * Returns the 1-based rank, or -1 if not found.
 */
export function findPlayerRank(
  entries: LeaderboardEntry[],
  playerId: string,
): number {
  const entry = entries.find((e) => e.id === playerId)
  return entry ? entry.rank : -1
}
