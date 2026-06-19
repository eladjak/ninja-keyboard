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
import {
  assignRanks,
  generateMockLeaderboard,
  sortLeaderboard,
} from './leaderboard-utils'
import type { LeaderboardEntry } from './leaderboard-utils'

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
  return AVATAR_EMOJI_MAP[avatarId] ?? FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length]
}

/** Raw row returned by the `get_leaderboard` RPC. */
interface LeaderboardRow {
  id: string
  name: string
  avatar_id: string
  xp: number
  level: number
  streak: number
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
  limit = 20,
): Promise<Result<{ entries: LeaderboardEntry[]; isReal: boolean }, LeaderboardError>> {
  if (!isSupabaseConfigured()) {
    return Result.ok({ entries: generateMockLeaderboard(limit), isReal: false })
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: limit })

    if (error) {
      // Log for debugging but do NOT crash — fall back to mock.
      console.warn('[leaderboard] RPC error, using mock:', error.message)
      return Result.ok({ entries: generateMockLeaderboard(limit), isReal: false })
    }

    const rows = (data ?? []) as LeaderboardRow[]

    if (rows.length === 0) {
      // DB reachable but no users yet — still fall through to mock so the UI
      // looks meaningful. When real users join, real data takes over.
      return Result.ok({ entries: generateMockLeaderboard(limit), isReal: false })
    }

    const entries: LeaderboardEntry[] = rows.map((row, i) => ({
      id: row.id,
      rank: 0, // assigned below
      name: row.name,
      avatarEmoji: resolveEmoji(row.avatar_id, i),
      wpm: 0, // WPM not tracked in get_leaderboard (no session aggregation yet)
      accuracy: 0, // same — per-session aggregation deferred
      level: row.level,
      xp: row.xp,
      streak: row.streak,
      trend: 'stable' as const,
    }))

    return Result.ok({
      entries: assignRanks(sortLeaderboard(entries, 'xp')),
      isReal: true,
    })
  } catch (e) {
    console.warn('[leaderboard] unexpected error, using mock:', e)
    return Result.ok({ entries: generateMockLeaderboard(limit), isReal: false })
  }
}
