import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Result } from 'better-result'
import type { SessionStats } from '@/lib/typing-engine/types'
import { SyncError } from '@/lib/sync/progress-sync'
import { flushPendingSessionResults, pushSessionOrQueue } from '@/lib/offline/session-sync'
import { getPendingResults, savePendingResult } from '@/lib/offline/sync-manager'

const mocks = vi.hoisted(() => ({
  getSyncUserId: vi.fn<() => string | null>(),
  pushSession: vi.fn(),
}))

vi.mock('@/lib/sync/sync-user', () => ({
  getSyncUserId: mocks.getSyncUserId,
}))

vi.mock('@/lib/sync/progress-sync', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/sync/progress-sync')>()
  return { ...actual, pushSession: mocks.pushSession }
})

const STATS: SessionStats = {
  wpm: 18,
  accuracy: 94,
  totalKeystrokes: 100,
  correctKeystrokes: 94,
  errorKeystrokes: 6,
  durationMs: 60_000,
  keyAccuracy: { א: { correct: 10, total: 11 } },
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  mocks.getSyncUserId.mockReturnValue(null)
  mocks.pushSession.mockResolvedValue(Result.ok(null))
})

describe('pushSessionOrQueue', () => {
  it('keeps guest sessions local-only without creating a server queue', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    const result = await pushSessionOrQueue('lesson-01', STATS)

    expect(result.isOk()).toBe(true)
    if (result.isErr()) throw result.error
    expect(result.value).toBe('local-only')
    expect(mocks.pushSession).not.toHaveBeenCalled()
    expect(getPendingResults()).toEqual([])
  })

  it('queues an authenticated session immediately while offline', async () => {
    mocks.getSyncUserId.mockReturnValue('user-1')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    const result = await pushSessionOrQueue('lesson-02', STATS)

    if (result.isErr()) throw result.error
    expect(result.value).toBe('queued')
    expect(mocks.pushSession).not.toHaveBeenCalled()
    expect(getPendingResults()).toHaveLength(1)
  })

  it('queues a session when an online write fails', async () => {
    mocks.getSyncUserId.mockReturnValue('user-1')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    mocks.pushSession.mockResolvedValue(Result.err(new SyncError({ message: 'network failed' })))

    const result = await pushSessionOrQueue('lesson-03', STATS)

    if (result.isErr()) throw result.error
    expect(result.value).toBe('queued')
    expect(getPendingResults()[0]?.lessonId).toBe('lesson-03')
  })
})

describe('flushPendingSessionResults', () => {
  it('flushes queued sessions after reconnect and removes successful entries', async () => {
    mocks.getSyncUserId.mockReturnValue('user-1')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    savePendingResult('lesson-04', STATS)

    const count = await flushPendingSessionResults()

    expect(count).toBe(1)
    expect(mocks.pushSession).toHaveBeenCalledWith({
      lessonId: 'lesson-04',
      wpm: 18,
      accuracy: 94,
      durationSeconds: 60,
      keyStats: STATS.keyAccuracy,
    })
    expect(getPendingResults()).toEqual([])
  })

  it('retains a queued session when reconnect syncing fails', async () => {
    mocks.getSyncUserId.mockReturnValue('user-1')
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    mocks.pushSession.mockResolvedValue(Result.err(new SyncError({ message: 'still offline' })))
    savePendingResult('lesson-05', STATS)

    expect(await flushPendingSessionResults()).toBe(0)
    expect(getPendingResults()[0]?.lessonId).toBe('lesson-05')
  })
})
