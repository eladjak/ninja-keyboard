import { Result } from 'better-result'
import { isOnline, savePendingResult, syncPendingResults } from './sync-manager'
import { pushSession, SyncError, type SessionInput } from '@/lib/sync/progress-sync'
import { getSyncUserId } from '@/lib/sync/sync-user'
import type { SessionStats } from '@/lib/typing-engine/types'

export type SessionDelivery = 'local-only' | 'queued' | 'synced'

let flushInFlight: Promise<number> | null = null

function toSessionInput(lessonId: string, stats: SessionStats): SessionInput {
  return {
    lessonId,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    durationSeconds: Math.round(stats.durationMs / 1000),
    keyStats: stats.keyAccuracy,
  }
}

function queueResult(lessonId: string, stats: SessionStats): Result<SessionDelivery, SyncError> {
  try {
    savePendingResult(lessonId, stats)
    return Result.ok('queued' as const)
  } catch (cause) {
    return Result.err(new SyncError({ message: 'queueSession: localStorage failed', cause }))
  }
}

/**
 * Keeps guest play local-only. For an authenticated player, a session is sent
 * immediately when possible and queued in localStorage when offline or when
 * the network write fails.
 */
export async function pushSessionOrQueue(
  lessonId: string,
  stats: SessionStats,
): Promise<Result<SessionDelivery, SyncError>> {
  if (!getSyncUserId()) return Result.ok('local-only')
  if (!isOnline()) return queueResult(lessonId, stats)

  const pushed = await pushSession(toSessionInput(lessonId, stats))

  if (pushed.isErr()) return queueResult(lessonId, stats)
  return Result.ok('synced')
}

/** Flush queued authenticated sessions after the browser reconnects. */
export async function flushPendingSessionResults(): Promise<number> {
  if (!getSyncUserId() || !isOnline()) return 0
  if (flushInFlight) return flushInFlight

  flushInFlight = syncPendingResults(async (result) => {
    const pushed = await pushSession(toSessionInput(result.lessonId, result.stats))
    if (pushed.isErr()) throw pushed.error
  })

  try {
    return await flushInFlight
  } finally {
    flushInFlight = null
  }
}
