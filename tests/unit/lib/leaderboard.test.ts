import { describe, it, expect } from 'vitest'
import {
  sortLeaderboard,
  assignRanks,
  getMedalEmoji,
  getLeaderboardTitle,
  generateMockLeaderboard,
  findPlayerRank,
} from '@/lib/leaderboard/leaderboard-utils'
import type { LeaderboardEntry, LeaderboardCategory } from '@/lib/leaderboard/leaderboard-utils'

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    id: 'p1',
    rank: 0,
    name: 'Test',
    avatarEmoji: '\u{1F977}',
    wpm: 30,
    accuracy: 90,
    level: 5,
    xp: 500,
    streak: 3,
    trend: 'stable',
    ...overrides,
  }
}

// ─── sortLeaderboard ────────────────────────────────────────────

describe('sortLeaderboard', () => {
  const entries = [
    makeEntry({ id: 'a', wpm: 20, accuracy: 95, xp: 100, streak: 1 }),
    makeEntry({ id: 'b', wpm: 40, accuracy: 80, xp: 300, streak: 10 }),
    makeEntry({ id: 'c', wpm: 30, accuracy: 99, xp: 200, streak: 5 }),
  ]

  it('sorts by WPM descending', () => {
    const sorted = sortLeaderboard(entries, 'wpm')
    expect(sorted.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by accuracy descending', () => {
    const sorted = sortLeaderboard(entries, 'accuracy')
    expect(sorted.map((e) => e.id)).toEqual(['c', 'a', 'b'])
  })

  it('sorts by XP descending', () => {
    const sorted = sortLeaderboard(entries, 'xp')
    expect(sorted.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by streak descending', () => {
    const sorted = sortLeaderboard(entries, 'streak')
    expect(sorted.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate original array', () => {
    const original = [...entries]
    sortLeaderboard(entries, 'wpm')
    expect(entries).toEqual(original)
  })
})

// ─── assignRanks ────────────────────────────────────────────────

describe('assignRanks', () => {
  it('assigns sequential 1-based ranks', () => {
    const entries = [
      makeEntry({ id: 'a', rank: 0 }),
      makeEntry({ id: 'b', rank: 0 }),
      makeEntry({ id: 'c', rank: 0 }),
    ]
    const ranked = assignRanks(entries)
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3])
  })

  it('does not mutate original entries', () => {
    const entries = [makeEntry({ rank: 0 })]
    assignRanks(entries)
    expect(entries[0].rank).toBe(0)
  })

  it('handles empty array', () => {
    expect(assignRanks([])).toEqual([])
  })
})

// ─── getMedalEmoji ──────────────────────────────────────────────

describe('getMedalEmoji', () => {
  it('returns gold for rank 1', () => {
    expect(getMedalEmoji(1)).toBe('\u{1F947}')
  })

  it('returns silver for rank 2', () => {
    expect(getMedalEmoji(2)).toBe('\u{1F948}')
  })

  it('returns bronze for rank 3', () => {
    expect(getMedalEmoji(3)).toBe('\u{1F949}')
  })

  it('returns empty for rank 4', () => {
    expect(getMedalEmoji(4)).toBe('')
  })

  it('returns empty for rank 5', () => {
    expect(getMedalEmoji(5)).toBe('')
  })
})

// ─── getLeaderboardTitle ────────────────────────────────────────

describe('getLeaderboardTitle', () => {
  const cases: [LeaderboardCategory, string][] = [
    ['wpm', '\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA'],
    ['accuracy', '\u05D3\u05D9\u05D5\u05E7'],
    ['xp', '\u05E0\u05D9\u05E7\u05D5\u05D3'],
    ['streak', '\u05E8\u05E6\u05E3'],
  ]

  it.each(cases)('returns Hebrew title for %s', (category, expected) => {
    expect(getLeaderboardTitle(category)).toBe(expected)
  })
})

// ─── generateMockLeaderboard ────────────────────────────────────

describe('generateMockLeaderboard', () => {
  it('generates the requested number of entries', () => {
    expect(generateMockLeaderboard(10)).toHaveLength(10)
  })

  it('generates entries with required fields', () => {
    const entries = generateMockLeaderboard(1)
    const entry = entries[0]
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('rank')
    expect(entry).toHaveProperty('name')
    expect(entry).toHaveProperty('avatarEmoji')
    expect(entry).toHaveProperty('wpm')
    expect(entry).toHaveProperty('accuracy')
    expect(entry).toHaveProperty('level')
    expect(entry).toHaveProperty('xp')
    expect(entry).toHaveProperty('streak')
    expect(entry).toHaveProperty('trend')
  })

  it('assigns ranks starting at 1', () => {
    const entries = generateMockLeaderboard(5)
    expect(entries[0].rank).toBe(1)
    expect(entries[4].rank).toBe(5)
  })

  it('returns entries sorted by WPM descending', () => {
    const entries = generateMockLeaderboard(10)
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].wpm).toBeGreaterThanOrEqual(entries[i + 1].wpm)
    }
  })

  it('is deterministic (same count yields same results)', () => {
    const a = generateMockLeaderboard(5)
    const b = generateMockLeaderboard(5)
    expect(a).toEqual(b)
  })

  it('handles count of 0', () => {
    expect(generateMockLeaderboard(0)).toEqual([])
  })
})

// ─── findPlayerRank ─────────────────────────────────────────────

describe('findPlayerRank', () => {
  const entries = assignRanks([
    makeEntry({ id: 'player-1' }),
    makeEntry({ id: 'player-2' }),
    makeEntry({ id: 'player-3' }),
  ])

  it('returns correct rank when player exists', () => {
    expect(findPlayerRank(entries, 'player-1')).toBe(1)
    expect(findPlayerRank(entries, 'player-3')).toBe(3)
  })

  it('returns -1 when player is not found', () => {
    expect(findPlayerRank(entries, 'nonexistent')).toBe(-1)
  })
})
