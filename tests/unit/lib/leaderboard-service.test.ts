/**
 * Tests for leaderboard-service.ts
 *
 * Strategies:
 * - Mock isSupabaseConfigured + createClient to control the Supabase path.
 * - Verify fallback-to-mock on: env absent, RPC error, empty result.
 * - Verify real-data path on a successful RPC response.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLeaderboard } from '@/lib/leaderboard/leaderboard-service'

// ── mocks ───────────────────────────────────────────────────────────────────

vi.mock('@/lib/sync/sync-user', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}))

const mockRpc = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ rpc: mockRpc }),
}))

import { isSupabaseConfigured } from '@/lib/sync/sync-user'
const mockedConfigured = vi.mocked(isSupabaseConfigured)

// ── helpers ──────────────────────────────────────────────────────────────────

function makeRow(
  overrides: Partial<{
    id: string
    name: string
    avatar_id: string
    xp: number
    level: number
    streak: number
    best_wpm: number | null
    best_accuracy: number | null
    wpm_improvement: number | null
    accuracy_improvement: number | null
    age: number | null
    age_group: string | null
    class_id: string | null
    class_name: string | null
  }> = {},
) {
  return {
    id: 'uuid-1',
    name: 'דניאל',
    avatar_id: 'fox',
    xp: 1000,
    level: 5,
    streak: 7,
    best_wpm: 30,
    best_accuracy: 92,
    wpm_improvement: 6,
    accuracy_improvement: 3,
    age: 10,
    age_group: 'geza',
    class_id: 'class-a',
    class_name: 'כיתה א׳',
    ...overrides,
  }
}

function makeLegacyRow() {
  return {
    id: 'legacy-uuid',
    name: 'דניאל',
    avatar_id: 'fox',
    xp: 1000,
    level: 5,
    streak: 7,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedConfigured.mockReturnValue(false)
})

// ── no env / guest mode ──────────────────────────────────────────────────────

describe('fetchLeaderboard — no Supabase env', () => {
  it('returns mock data (isReal=false) without calling Supabase', async () => {
    mockedConfigured.mockReturnValue(false)
    const result = await fetchLeaderboard(10)
    expect(result.isOk()).toBe(true)
    const { entries, isReal } = result.unwrap()
    expect(isReal).toBe(false)
    expect(entries).toHaveLength(10)
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('mock entries have required fields', async () => {
    mockedConfigured.mockReturnValue(false)
    const result = await fetchLeaderboard(5)
    const { entries } = result.unwrap()
    for (const e of entries) {
      expect(e).toHaveProperty('id')
      expect(e).toHaveProperty('name')
      expect(e).toHaveProperty('avatarEmoji')
      expect(e).toHaveProperty('xp')
      expect(e).toHaveProperty('wpmImprovement')
      expect(e).toHaveProperty('ageGroup')
      expect(e).toHaveProperty('classId')
      expect(e).toHaveProperty('rank')
      expect(e.rank).toBeGreaterThan(0)
    }
  })
})

// ── RPC error fallback ───────────────────────────────────────────────────────

describe('fetchLeaderboard — RPC error', () => {
  beforeEach(() => mockedConfigured.mockReturnValue(true))

  it('falls back to mock when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation does not exist' },
    })
    const result = await fetchLeaderboard(20)
    expect(result.isOk()).toBe(true)
    const { entries, isReal } = result.unwrap()
    expect(isReal).toBe(false)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('falls back to mock when RPC throws', async () => {
    mockRpc.mockRejectedValueOnce(new Error('network timeout'))
    const result = await fetchLeaderboard(20)
    expect(result.isOk()).toBe(true)
    const { isReal } = result.unwrap()
    expect(isReal).toBe(false)
  })
})

// ── empty result fallback ────────────────────────────────────────────────────

describe('fetchLeaderboard — empty DB', () => {
  beforeEach(() => mockedConfigured.mockReturnValue(true))

  it('falls back to mock when RPC returns zero rows', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null })
    const result = await fetchLeaderboard(20)
    expect(result.isOk()).toBe(true)
    const { entries, isReal } = result.unwrap()
    expect(isReal).toBe(false)
    expect(entries.length).toBeGreaterThan(0)
  })
})

// ── real data path ───────────────────────────────────────────────────────────

describe('fetchLeaderboard — real data', () => {
  beforeEach(() => mockedConfigured.mockReturnValue(true))

  it('returns real entries (isReal=true) when RPC succeeds', async () => {
    const rows = [
      makeRow({ id: 'a', xp: 3000, level: 10 }),
      makeRow({ id: 'b', xp: 2000, level: 7 }),
      makeRow({ id: 'c', xp: 1000, level: 4 }),
    ]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })

    const result = await fetchLeaderboard(20)
    expect(result.isOk()).toBe(true)
    const { entries, isReal } = result.unwrap()
    expect(isReal).toBe(true)
    expect(entries).toHaveLength(3)
  })

  it('assigns ranks starting at 1', async () => {
    const rows = [makeRow({ id: 'x', xp: 500 }), makeRow({ id: 'y', xp: 100 })]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })
    const result = await fetchLeaderboard(20)
    const { entries } = result.unwrap()
    expect(entries[0].rank).toBe(1)
    expect(entries[1].rank).toBe(2)
  })

  it('ranks by best WPM when the WPM variant is requested', async () => {
    const rows = [
      makeRow({ id: 'fast-xp', xp: 5000, best_wpm: 20 }),
      makeRow({ id: 'fast-typing', xp: 500, best_wpm: 55 }),
    ]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })

    const result = await fetchLeaderboard({ limit: 20, ranking: 'wpm' })
    expect(result.unwrap().entries.map((entry) => entry.id)).toEqual([
      'fast-typing',
      'fast-xp',
    ])
  })

  it('ranks improvement independently of raw WPM', async () => {
    const rows = [
      makeRow({ id: 'already-fast', best_wpm: 60, wpm_improvement: 2 }),
      makeRow({ id: 'most-improved', best_wpm: 22, wpm_improvement: 14 }),
    ]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })

    const result = await fetchLeaderboard({
      limit: 20,
      ranking: 'improvement',
    })
    expect(result.unwrap().entries[0].id).toBe('most-improved')
  })

  it('applies age and class filters to returned rows', async () => {
    const rows = [
      makeRow({ id: 'match', age_group: 'geza', class_id: 'class-a' }),
      makeRow({ id: 'other-age', age_group: 'anaf', class_id: 'class-a' }),
      makeRow({ id: 'other-class', age_group: 'geza', class_id: 'class-b' }),
    ]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })

    const result = await fetchLeaderboard({
      limit: 20,
      filters: { ageGroup: 'geza', classId: 'class-a' },
    })
    expect(result.unwrap().entries.map((entry) => entry.id)).toEqual(['match'])
  })

  it('maps known avatar_id to emoji', async () => {
    const rows = [makeRow({ avatar_id: 'fox' })]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })
    const result = await fetchLeaderboard(20)
    const { entries } = result.unwrap()
    expect(entries[0].avatarEmoji).toBe('\u{1F98A}') // fox
  })

  it('falls back to a bucket emoji for unknown avatar_id', async () => {
    const rows = [makeRow({ avatar_id: 'unknown_character' })]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })
    const result = await fetchLeaderboard(20)
    const { entries } = result.unwrap()
    expect(entries[0].avatarEmoji).toBeTruthy()
    expect(typeof entries[0].avatarEmoji).toBe('string')
  })

  it('calls the extended RPC with ranking and filter parameters', async () => {
    mockRpc.mockResolvedValueOnce({ data: [makeRow()], error: null })
    await fetchLeaderboard({
      limit: 5,
      ranking: 'improvement',
      filters: { ageGroup: 'geza', classId: 'class-a' },
    })
    expect(mockRpc).toHaveBeenCalledWith('get_leaderboard', {
      p_limit: 5,
      p_ranking: 'improvement',
      p_age_group: 'geza',
      p_class_id: 'class-a',
    })
  })

  it('retries migration 00005 when the extended signature is not applied yet', async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST202',
          message: 'get_leaderboard with p_ranking was not found',
        },
      })
      .mockResolvedValueOnce({ data: [makeLegacyRow()], error: null })

    const result = await fetchLeaderboard(5)
    expect(result.unwrap().isReal).toBe(true)
    expect(mockRpc).toHaveBeenNthCalledWith(2, 'get_leaderboard', {
      p_limit: 25,
    })
  })

  it('keeps the demo fallback for variants unsupported by migration 00005', async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST202',
          message: 'get_leaderboard with p_ranking was not found',
        },
      })
      .mockResolvedValueOnce({ data: [makeLegacyRow()], error: null })

    const result = await fetchLeaderboard({ limit: 5, ranking: 'wpm' })
    expect(result.unwrap()).toMatchObject({ isReal: false })
    expect(result.unwrap().entries).toHaveLength(5)
  })
})
