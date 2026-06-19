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

function makeRow(overrides: Partial<{
  id: string
  name: string
  avatar_id: string
  xp: number
  level: number
  streak: number
}> = {}) {
  return {
    id: 'uuid-1',
    name: 'דניאל',
    avatar_id: 'fox',
    xp: 1000,
    level: 5,
    streak: 7,
    ...overrides,
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
      expect(e).toHaveProperty('rank')
      expect(e.rank).toBeGreaterThan(0)
    }
  })
})

// ── RPC error fallback ───────────────────────────────────────────────────────

describe('fetchLeaderboard — RPC error', () => {
  beforeEach(() => mockedConfigured.mockReturnValue(true))

  it('falls back to mock when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'relation does not exist' } })
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
    const rows = [
      makeRow({ id: 'x', xp: 500 }),
      makeRow({ id: 'y', xp: 100 }),
    ]
    mockRpc.mockResolvedValueOnce({ data: rows, error: null })
    const result = await fetchLeaderboard(20)
    const { entries } = result.unwrap()
    expect(entries[0].rank).toBe(1)
    expect(entries[1].rank).toBe(2)
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

  it('calls RPC with p_limit parameter', async () => {
    mockRpc.mockResolvedValueOnce({ data: [makeRow()], error: null })
    await fetchLeaderboard(5)
    expect(mockRpc).toHaveBeenCalledWith('get_leaderboard', { p_limit: 5 })
  })
})
