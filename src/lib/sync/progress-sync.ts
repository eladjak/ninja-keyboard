/**
 * Supabase write-through / hydrate service for v1 single-player progress.
 *
 * Design (blueprint §B): the STORE is the sync boundary. These functions are
 * the only place that touches Supabase for progress. Every push is a no-op when
 * there is no user (guest) or no Supabase env — guests stay 100% on localStorage
 * and the app never needs a live DB to run.
 *
 * Error handling (project rule): better-result for the service surface; raw
 * supabase `.from(...)` calls are the 3rd-party boundary, wrapped in try/catch
 * and converted to a Result. Pushes are fire-and-forget at call sites, so a
 * failed Result is logged, not thrown.
 */

import { Result, TaggedError } from 'better-result'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getSyncUserId, isSupabaseConfigured } from './sync-user'
import {
  type DailyChallengesSnapshot,
  type EarnedBadgeSnapshot,
  type ProgressSnapshot,
  type StorySnapshot,
  emptyProgressSnapshot,
} from './snapshot'
import type { Database } from '@/types/database'

export class SyncError extends TaggedError('SyncError')<{
  message: string
  cause?: unknown
}>() {}

type Db = SupabaseClient<Database>

/** Lazily create a typed browser client, or null when env is absent. */
function getClient(): Db | null {
  if (!isSupabaseConfigured()) return null
  return createClient()
}

/** Wrap a raw supabase promise (the 3rd-party boundary) into a Result. */
async function guard<T>(
  label: string,
  fn: () => Promise<{ data: T; error: { message: string } | null }>,
): Promise<Result<T, SyncError>> {
  try {
    const { data, error } = await fn()
    if (error) {
      return Result.err(new SyncError({ message: `${label}: ${error.message}` }))
    }
    return Result.ok(data)
  } catch (e) {
    return Result.err(
      new SyncError({ message: `${label}: unexpected error`, cause: e }),
    )
  }
}

// ── Push (write-through) ────────────────────────────────────────────────────

export interface ProgressRowInput {
  bestWpm: number
  bestAccuracy: number
  stars?: number
  attempts?: number
}

/** Upsert a per-lesson progress row. No-op when guest / no env. */
export async function pushProgress(
  lessonId: string,
  input: ProgressRowInput,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  return guard('pushProgress', async () => {
    const { error } = await supabase.from('progress').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        best_wpm: Math.round(input.bestWpm),
        best_accuracy: input.bestAccuracy,
        stars: input.stars ?? 0,
        attempts: input.attempts ?? 1,
        last_attempt_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    )
    return { data: null, error }
  })
}

export interface GamificationInput {
  xp: number
  level: number
  streak: number
  badges?: Record<string, EarnedBadgeSnapshot>
}

/** Upsert the gamification totals (xp/level/streak + badges blob). */
export async function pushGamification(
  input: GamificationInput,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  const row: Database['public']['Tables']['gamification']['Insert'] = {
    user_id: userId,
    xp: Math.round(input.xp),
    level: input.level,
    streak_days: input.streak,
    last_active: new Date().toISOString().split('T')[0],
  }
  if (input.badges !== undefined) {
    // Snapshot shapes are JSON-serializable; cast at the column boundary.
    row.badges = input.badges as unknown as Database['public']['Tables']['gamification']['Insert']['badges']
  }

  return guard('pushGamification', async () => {
    const { error } = await supabase
      .from('gamification')
      .upsert(row, { onConflict: 'user_id' })
    return { data: null, error }
  })
}

export interface SessionInput {
  lessonId: string
  wpm: number
  accuracy: number
  durationSeconds: number
  keyStats?: Record<string, { correct: number; total: number }>
}

/** Insert a practice/typing session (append-only). */
export async function pushSession(
  input: SessionInput,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  return guard('pushSession', async () => {
    const { error } = await supabase.from('sessions').insert({
      user_id: userId,
      lesson_id: input.lessonId,
      wpm: Math.round(input.wpm),
      accuracy: input.accuracy,
      duration_seconds: Math.round(input.durationSeconds),
      key_stats: input.keyStats ?? {},
    })
    return { data: null, error }
  })
}

export interface PlayerStateInput {
  story?: StorySnapshot | null
  daily?: DailyChallengesSnapshot
  migratedAt?: string | null
}

/** Upsert the one-row-per-user story/daily blob. */
export async function pushPlayerState(
  input: PlayerStateInput,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  const row: Database['public']['Tables']['player_state']['Insert'] = {
    user_id: userId,
  }
  if (input.story !== undefined)
    row.story = (input.story ?? {}) as unknown as Database['public']['Tables']['player_state']['Insert']['story']
  if (input.daily !== undefined)
    row.daily = input.daily as unknown as Database['public']['Tables']['player_state']['Insert']['daily']
  if (input.migratedAt !== undefined) row.migrated_at = input.migratedAt

  return guard('pushPlayerState', async () => {
    const { error } = await supabase
      .from('player_state')
      .upsert(row, { onConflict: 'user_id' })
    return { data: null, error }
  })
}

/** Persist onboarding/track/placement fields onto the user record. */
export interface UserTrackInput {
  ageGroup?: string | null
  onboardingCompleted?: boolean
  placementResult?: Record<string, unknown> | null
}

export async function pushUserTrack(
  input: UserTrackInput,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  const update: Database['public']['Tables']['users']['Update'] = {}
  if (input.ageGroup !== undefined)
    update.age_group =
      input.ageGroup as Database['public']['Tables']['users']['Update']['age_group']
  if (input.onboardingCompleted !== undefined)
    update.onboarding_completed = input.onboardingCompleted
  if (input.placementResult !== undefined)
    update.placement_result = input.placementResult as unknown as Database['public']['Tables']['users']['Update']['placement_result']

  if (Object.keys(update).length === 0) return Result.ok(null)

  return guard('pushUserTrack', async () => {
    const { error } = await supabase
      .from('users')
      .update(update)
      .eq('id', userId)
    return { data: null, error }
  })
}

// ── Hydrate (read) ──────────────────────────────────────────────────────────

export interface HydrateResult {
  snapshot: ProgressSnapshot
  ageGroup: string | null
  onboardingCompleted: boolean
  placementResult: Record<string, unknown> | null
  /** Whether the server already had a player_state row (i.e. not a new account). */
  serverHadState: boolean
}

/**
 * Read everything for `userId` and assemble a ProgressSnapshot. Reconstructs
 * `completedLessons` from the per-lesson `progress` rows. No-op-safe: when env
 * is absent it returns an empty snapshot.
 */
export async function hydrateFromSupabase(
  userId: string,
): Promise<Result<HydrateResult, SyncError>> {
  const supabase = getClient()
  if (!supabase) {
    return Result.ok({
      snapshot: emptyProgressSnapshot(),
      ageGroup: null,
      onboardingCompleted: false,
      placementResult: null,
      serverHadState: false,
    })
  }

  const snapshot = emptyProgressSnapshot()
  let ageGroup: string | null = null
  let onboardingCompleted = false
  let placementResult: Record<string, unknown> | null = null
  let serverHadState = false

  // gamification (totals + badges)
  const gam = await guard('hydrate.gamification', async () => {
    const { data, error } = await supabase
      .from('gamification')
      .select('xp, level, streak_days, badges')
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  })
  if (gam.isErr()) return Result.err(gam.error)
  if (gam.value) {
    serverHadState = true
    snapshot.totalXp = gam.value.xp ?? 0
    snapshot.level = gam.value.level ?? 1
    snapshot.streak = gam.value.streak_days ?? 0
    snapshot.earnedBadges =
      (gam.value.badges as Record<string, EarnedBadgeSnapshot> | null) ?? {}
  }

  // progress rows -> completedLessons map
  const prog = await guard('hydrate.progress', async () => {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id, best_wpm, best_accuracy, attempts, last_attempt_at')
      .eq('user_id', userId)
    return { data: data ?? [], error }
  })
  if (prog.isErr()) return Result.err(prog.error)
  for (const row of prog.value) {
    serverHadState = true
    snapshot.completedLessons[row.lesson_id] = {
      lessonId: row.lesson_id,
      bestWpm: row.best_wpm ?? 0,
      bestAccuracy: row.best_accuracy ?? 0,
      attempts: row.attempts ?? 0,
      completedAt: row.last_attempt_at
        ? new Date(row.last_attempt_at).getTime()
        : Date.now(),
    }
  }

  // player_state blob (story + daily)
  const ps = await guard('hydrate.player_state', async () => {
    const { data, error } = await supabase
      .from('player_state')
      .select('story, daily, migrated_at')
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  })
  if (ps.isErr()) return Result.err(ps.error)
  if (ps.value) {
    serverHadState = true
    const story = ps.value.story as StorySnapshot | null
    snapshot.story =
      story && Object.keys(story).length > 0 ? story : null
    snapshot.dailyChallenges =
      (ps.value.daily as DailyChallengesSnapshot | null) ?? {}
    snapshot.migratedAt = ps.value.migrated_at ?? null
  }

  // user track fields
  const usr = await guard('hydrate.user', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('age_group, onboarding_completed, placement_result')
      .eq('id', userId)
      .maybeSingle()
    return { data, error }
  })
  if (usr.isErr()) return Result.err(usr.error)
  if (usr.value) {
    ageGroup = usr.value.age_group ?? null
    onboardingCompleted = usr.value.onboarding_completed ?? false
    placementResult =
      (usr.value.placement_result as Record<string, unknown> | null) ?? null
  }

  return Result.ok({
    snapshot,
    ageGroup,
    onboardingCompleted,
    placementResult,
    serverHadState,
  })
}

/**
 * Push a whole snapshot up (used for guest->account merge-up to a new account,
 * Step C2, and after a merge, Step C3). Writes gamification, all progress rows,
 * and the player_state blob. Best-effort: returns the first error encountered.
 */
export async function pushSnapshot(
  snapshot: ProgressSnapshot,
): Promise<Result<null, SyncError>> {
  const userId = getSyncUserId()
  const supabase = getClient()
  if (!userId || !supabase) return Result.ok(null)

  const gam = await pushGamification({
    xp: snapshot.totalXp,
    level: snapshot.level,
    streak: snapshot.streak,
    badges: snapshot.earnedBadges,
  })
  if (gam.isErr()) return gam

  for (const lesson of Object.values(snapshot.completedLessons)) {
    const r = await pushProgress(lesson.lessonId, {
      bestWpm: lesson.bestWpm,
      bestAccuracy: lesson.bestAccuracy,
      attempts: lesson.attempts,
    })
    if (r.isErr()) return r
  }

  return pushPlayerState({
    story: snapshot.story,
    daily: snapshot.dailyChallenges,
    migratedAt: snapshot.migratedAt ?? new Date().toISOString(),
  })
}
