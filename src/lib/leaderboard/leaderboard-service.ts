/**
 * Leaderboard data service — real Supabase or mock fallback.
 *
 * Calls the `get_leaderboard(p_limit)` SECURITY DEFINER RPC (migration 00005).
 * That function bypasses RLS and is callable with the anon key, so no
 * SERVICE_ROLE_KEY is needed.
 *
 * When Supabase env is absent (guest mode, local dev without env) or the RPC
 * fails (e.g. paused project), it falls back to the deterministic mock so the
 * leaderboard page always renders.
 *
 * Error handling: better-result for the service surface; raw Supabase calls
 * wrapped in try/catch at the 3rd-party boundary (project convention).
 */

import { Result, TaggedError } from 'better-result'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/sync/sync-user'
import { generateMockLeaderboard, rankLeaderboard } from './leaderboard-utils'
import type {
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardFilters,
} from './leaderboard-utils'
import type { AgeGroup } from '@/types/database'

export class LeaderboardError extends TaggedError('LeaderboardError')<{
  message: string
  cause?: unknown
}>() {}

// Avatar emoji mapped from avatar_id string (matches the character IDs used in
// CHARACTER_CONFIGS). Falls back to a deterministic emoji bucket for unknown ids.
const AVATAR_EMOJI_MAP: Record<string, string> = {
  fox: '\u{1F98A}',
  cat: '\u{1F431}',
  dog: '\u{1F436}',
  dragon: '\u{1F409}',
  unicorn: '\u{1F984}',
  bear: '\u{1F43B}',
  lion: '\u{1F981}',
  eagle: '\u{1F985}',
  octopus: '\u{1F419}',
  turtle: '\u{1F422}',
  owl: '\u{1F989}',
  panda: '\u{1F43C}',
  ninja: '\u{1F977}',
}

const FALLBACK_EMOJIS = Object.values(AVATAR_EMOJI_MAP)

function resolveEmoji(avatarId: string, index: number): string {
  return (
    AVATAR_EMOJI_MAP[avatarId] ??
    FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length]
  )
}

/** Raw row returned by the legacy or migration-00006 `get_leaderboard` RPC. */
interface LeaderboardRow {
  id: string
  name: string
  avatar_id: string
  xp: number
  level: number
  streak: number
  best_wpm?: number | null
  best_accuracy?: number | null
  wpm_improvement?: number | null
  accuracy_improvement?: number | null
  age?: number | null
  age_group?: string | null
  class_id?: string | null
  class_name?: string | null
}

export interface LeaderboardReadOptions {
  limit?: number
  ranking?: LeaderboardCategory
  filters?: LeaderboardFilters
}

interface RpcError {
  code?: string
  message: string
}

const AGE_GROUPS: AgeGroup[] = ['shatil', 'nevet', 'geza', 'anaf', 'tzameret']

function isAgeGroup(value: string | null | undefined): value is AgeGroup {
  return AGE_GROUPS.includes(value as AgeGroup)
}

function numberOrZero(value: number | null | undefined): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeLimit(value: number | undefined): number {
  if (value === undefined) return 20
  if (!Number.isFinite(value)) return 20
  return Math.min(100, Math.max(0, Math.floor(value)))
}

function normalizeOptions(
  input: number | LeaderboardReadOptions,
): Required<Pick<LeaderboardReadOptions, 'limit' | 'ranking'>> &
  Pick<LeaderboardReadOptions, 'filters'> {
  if (typeof input === 'number') {
    return { limit: normalizeLimit(input), ranking: 'xp', filters: {} }
  }

  return {
    limit: normalizeLimit(input.limit),
    ranking: input.ranking ?? 'xp',
    filters: input.filters ?? {},
  }
}

function mockResult(
  options: ReturnType<typeof normalizeOptions>,
): LeaderboardEntry[] {
  if (options.limit === 0) return []

  // A wider deterministic pool keeps demo filters useful without changing the
  // requested result limit. Real reads remain bounded by the RPC.
  const poolSize = Math.max(20, options.limit * 20)
  return rankLeaderboard(
    generateMockLeaderboard(poolSize, options.ranking),
    options.ranking,
    options.filters,
    options.limit,
  )
}

function isExtendedSignatureMissing(error: RpcError): boolean {
  return (
    error.code === 'PGRST202' ||
    (error.message.includes('get_leaderboard') &&
      error.message.includes('p_ranking'))
  )
}

function mapRows(rows: LeaderboardRow[]): LeaderboardEntry[] {
  return rows.map((row, index) => {
    const wpmImprovement = numberOrZero(row.wpm_improvement)
    const accuracyImprovement = numberOrZero(row.accuracy_improvement)

    return {
      id: row.id,
      rank: 0,
      name: row.name,
      avatarEmoji: resolveEmoji(row.avatar_id, index),
      wpm: numberOrZero(row.best_wpm),
      accuracy: numberOrZero(row.best_accuracy),
      wpmImprovement,
      accuracyImprovement,
      level: numberOrZero(row.level),
      xp: numberOrZero(row.xp),
      streak: numberOrZero(row.streak),
      trend: wpmImprovement > 0 ? 'up' : wpmImprovement < 0 ? 'down' : 'stable',
      age: row.age ?? null,
      ageGroup: isAgeGroup(row.age_group) ? row.age_group : null,
      classId: row.class_id ?? null,
      className: row.class_name ?? null,
    }
  })
}

function rowsSupportRequest(
  rows: LeaderboardRow[],
  options: ReturnType<typeof normalizeOptions>,
): boolean {
  const sample = rows[0]
  if (!sample) return false

  if (options.ranking === 'wpm' && !Object.hasOwn(sample, 'best_wpm')) {
    return false
  }
  if (
    options.ranking === 'accuracy' &&
    !Object.hasOwn(sample, 'best_accuracy')
  ) {
    return false
  }
  if (
    options.ranking === 'improvement' &&
    (!Object.hasOwn(sample, 'wpm_improvement') ||
      !Object.hasOwn(sample, 'accuracy_improvement'))
  ) {
    return false
  }
  if (options.filters?.ageGroup && !Object.hasOwn(sample, 'age_group')) {
    return false
  }
  if (options.filters?.classId && !Object.hasOwn(sample, 'class_id')) {
    return false
  }

  return true
}

/**
 * Fetch the top-N leaderboard entries.
 * - If Supabase is configured: calls `get_leaderboard` RPC.
 * - On any failure (env absent, project paused, network error): returns mock.
 *
 * The caller receives a `Result<LeaderboardEntry[], LeaderboardError>` so it
 * can distinguish "real data" from "fallback" if needed.
 */
export async function fetchLeaderboard(
  input: number | LeaderboardReadOptions = 20,
): Promise<
  Result<{ entries: LeaderboardEntry[]; isReal: boolean }, LeaderboardError>
> {
  const options = normalizeOptions(input)

  if (!isSupabaseConfigured()) {
    return Result.ok({ entries: mockResult(options), isReal: false })
  }

  try {
    const supabase = createClient()
    let { data, error } = await supabase.rpc('get_leaderboard', {
      p_limit: options.limit,
      p_ranking: options.ranking,
      p_age_group: options.filters?.ageGroup ?? null,
      p_class_id: options.filters?.classId ?? null,
    })

    // Migration 00005 is already live. Until pending migration 00006 is
    // manually applied, retry its one-argument signature so the existing XP
    // leaderboard keeps working instead of needlessly dropping to mock.
    if (error && isExtendedSignatureMissing(error)) {
      const legacyLimit = Math.min(
        200,
        Math.max(options.limit * 5, options.limit),
      )
      const legacy = await supabase.rpc('get_leaderboard', {
        p_limit: legacyLimit,
      })
      data = legacy.data
      error = legacy.error
    }

    if (error) {
      // Log for debugging but do NOT crash — fall back to mock.
      console.warn('[leaderboard] RPC error, using mock:', error.message)
      return Result.ok({ entries: mockResult(options), isReal: false })
    }

    const rows = (data ?? []) as LeaderboardRow[]

    if (rows.length === 0) {
      // DB reachable but no users yet — still fall through to mock so the UI
      // looks meaningful. When real users join, real data takes over.
      return Result.ok({ entries: mockResult(options), isReal: false })
    }

    if (!rowsSupportRequest(rows, options)) {
      // Migration 00005 rows can still power the real XP/streak board, but
      // must not masquerade as real WPM/improvement/filter results. Keep the
      // honest demo fallback until 00006 adds those columns.
      return Result.ok({ entries: mockResult(options), isReal: false })
    }

    return Result.ok({
      entries: rankLeaderboard(
        mapRows(rows),
        options.ranking,
        options.filters,
        options.limit,
      ),
      isReal: true,
    })
  } catch (e) {
    console.warn('[leaderboard] unexpected error, using mock:', e)
    return Result.ok({ entries: mockResult(options), isReal: false })
  }
}
