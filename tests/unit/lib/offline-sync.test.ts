import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { LessonDefinition, SessionStats } from '@/lib/typing-engine/types'
import {
  cacheLesson,
  getCachedLesson,
  getAllCachedLessons,
  savePendingResult,
  getPendingResults,
  getPendingResultCount,
  syncPendingResults,
  clearCache,
  clearLessonCache,
  clearPendingResults,
  isOnline,
  getState,
  createCacheEntry,
  createPendingResult,
} from '@/lib/offline/sync-manager'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLesson(overrides: Partial<LessonDefinition> = {}): LessonDefinition {
  return {
    id: 'lesson-01',
    level: 1,
    titleHe: 'שורת הבית',
    titleEn: 'Home Row',
    descriptionHe: 'תיאור',
    targetKeys: ['י', 'ח', 'ל'],
    newKeys: ['י', 'ח', 'ל'],
    targetWpm: 5,
    targetAccuracy: 80,
    category: 'home-row',
    ...overrides,
  }
}

function makeStats(overrides: Partial<SessionStats> = {}): SessionStats {
  return {
    wpm: 15,
    accuracy: 92,
    totalKeystrokes: 100,
    correctKeystrokes: 92,
    errorKeystrokes: 8,
    durationMs: 60_000,
    keyAccuracy: {},
    ...overrides,
  }
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
})

// ── cacheLesson + getCachedLesson ────────────────────────────────────────────

describe('cacheLesson + getCachedLesson', () => {
  it('caches a lesson and retrieves it by ID', () => {
    const lesson = makeLesson({ id: 'lesson-05' })
    cacheLesson(lesson)
    const cached = getCachedLesson('lesson-05')
    expect(cached).toEqual(lesson)
  })

  it('returns undefined for a cache miss', () => {
    expect(getCachedLesson('nonexistent')).toBeUndefined()
  })

  it('overwrites an existing entry for the same lesson ID', () => {
    const v1 = makeLesson({ id: 'lesson-01', titleHe: 'גרסה 1' })
    const v2 = makeLesson({ id: 'lesson-01', titleHe: 'גרסה 2' })
    cacheLesson(v1)
    cacheLesson(v2)
    const cached = getCachedLesson('lesson-01')
    expect(cached?.titleHe).toBe('גרסה 2')
  })

  it('caches multiple different lessons independently', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    cacheLesson(makeLesson({ id: 'lesson-02', level: 2 }))
    cacheLesson(makeLesson({ id: 'lesson-03', level: 3 }))
    expect(getCachedLesson('lesson-01')).toBeDefined()
    expect(getCachedLesson('lesson-02')).toBeDefined()
    expect(getCachedLesson('lesson-03')).toBeDefined()
  })

  it('persists across reads (localStorage backed)', () => {
    cacheLesson(makeLesson({ id: 'lesson-10' }))
    // Simulate a "new read" by reading from storage directly
    const cached = getCachedLesson('lesson-10')
    expect(cached?.id).toBe('lesson-10')
  })
})

// ── getAllCachedLessons ──────────────────────────────────────────────────────

describe('getAllCachedLessons', () => {
  it('returns an empty object when nothing is cached', () => {
    expect(getAllCachedLessons()).toEqual({})
  })

  it('returns all cached entries with cachedAt timestamps', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    cacheLesson(makeLesson({ id: 'lesson-02', level: 2 }))
    const all = getAllCachedLessons()
    expect(Object.keys(all)).toHaveLength(2)
    expect(all['lesson-01']?.cachedAt).toBeDefined()
    expect(all['lesson-02']?.cachedAt).toBeDefined()
  })
})

// ── savePendingResult + getPendingResults ────────────────────────────────────

describe('savePendingResult + getPendingResults', () => {
  it('saves a pending result and retrieves it', () => {
    savePendingResult('lesson-01', makeStats())
    const results = getPendingResults()
    expect(results).toHaveLength(1)
    expect(results[0].lessonId).toBe('lesson-01')
  })

  it('saves multiple pending results in order', () => {
    savePendingResult('lesson-01', makeStats({ wpm: 10 }))
    savePendingResult('lesson-02', makeStats({ wpm: 20 }))
    savePendingResult('lesson-03', makeStats({ wpm: 30 }))
    const results = getPendingResults()
    expect(results).toHaveLength(3)
    expect(results[0].lessonId).toBe('lesson-01')
    expect(results[1].lessonId).toBe('lesson-02')
    expect(results[2].lessonId).toBe('lesson-03')
  })

  it('assigns unique IDs to each pending result', () => {
    savePendingResult('lesson-01', makeStats())
    savePendingResult('lesson-01', makeStats())
    const results = getPendingResults()
    expect(results[0].id).not.toBe(results[1].id)
  })

  it('returns the created result with completedAt timestamp', () => {
    const before = Date.now()
    const result = savePendingResult('lesson-05', makeStats())
    const after = Date.now()
    const completedMs = new Date(result.completedAt).getTime()
    expect(completedMs).toBeGreaterThanOrEqual(before)
    expect(completedMs).toBeLessThanOrEqual(after)
  })
})

// ── getPendingResultCount ───────────────────────────────────────────────────

describe('getPendingResultCount', () => {
  it('returns 0 when no pending results', () => {
    expect(getPendingResultCount()).toBe(0)
  })

  it('returns the correct count after saving results', () => {
    savePendingResult('lesson-01', makeStats())
    savePendingResult('lesson-02', makeStats())
    expect(getPendingResultCount()).toBe(2)
  })
})

// ── syncPendingResults ──────────────────────────────────────────────────────

describe('syncPendingResults', () => {
  it('syncs all pending results and clears them', async () => {
    // Mock navigator.onLine to true
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    savePendingResult('lesson-01', makeStats())
    savePendingResult('lesson-02', makeStats())

    const synced: string[] = []
    const count = await syncPendingResults(async (result) => {
      synced.push(result.lessonId)
    })

    expect(count).toBe(2)
    expect(synced).toEqual(['lesson-01', 'lesson-02'])
    expect(getPendingResults()).toHaveLength(0)

    vi.restoreAllMocks()
  })

  it('returns 0 when offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

    savePendingResult('lesson-01', makeStats())
    const count = await syncPendingResults(async () => {})
    expect(count).toBe(0)
    // Results should still be pending
    expect(getPendingResults()).toHaveLength(1)

    vi.restoreAllMocks()
  })

  it('returns 0 when nothing to sync', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const count = await syncPendingResults(async () => {})
    expect(count).toBe(0)
    vi.restoreAllMocks()
  })

  it('keeps failed results for retry', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

    savePendingResult('lesson-01', makeStats())
    savePendingResult('lesson-02', makeStats())
    savePendingResult('lesson-03', makeStats())

    let callIndex = 0
    const count = await syncPendingResults(async () => {
      callIndex++
      if (callIndex === 2) throw new Error('Network error')
    })

    expect(count).toBe(2)
    const remaining = getPendingResults()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].lessonId).toBe('lesson-02')

    vi.restoreAllMocks()
  })
})

// ── clearCache ──────────────────────────────────────────────────────────────

describe('clearCache', () => {
  it('clears both lesson cache and pending results', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    savePendingResult('lesson-01', makeStats())

    clearCache()

    expect(getCachedLesson('lesson-01')).toBeUndefined()
    expect(getPendingResults()).toHaveLength(0)
  })

  it('clearLessonCache only clears lessons, keeps pending results', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    savePendingResult('lesson-01', makeStats())

    clearLessonCache()

    expect(getCachedLesson('lesson-01')).toBeUndefined()
    expect(getPendingResults()).toHaveLength(1)
  })

  it('clearPendingResults only clears results, keeps lesson cache', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    savePendingResult('lesson-01', makeStats())

    clearPendingResults()

    expect(getCachedLesson('lesson-01')).toBeDefined()
    expect(getPendingResults()).toHaveLength(0)
  })
})

// ── isOnline ────────────────────────────────────────────────────────────────

describe('isOnline', () => {
  it('returns true when navigator.onLine is true', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    expect(isOnline()).toBe(true)
    vi.restoreAllMocks()
  })

  it('returns false when navigator.onLine is false', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    expect(isOnline()).toBe(false)
    vi.restoreAllMocks()
  })
})

// ── getState ────────────────────────────────────────────────────────────────

describe('getState', () => {
  it('returns empty state when nothing is stored', () => {
    const state = getState()
    expect(state.lessonCache).toEqual({})
    expect(state.pendingResults).toEqual([])
  })

  it('returns the full state snapshot', () => {
    cacheLesson(makeLesson({ id: 'lesson-01' }))
    savePendingResult('lesson-02', makeStats())
    const state = getState()
    expect(state.lessonCache['lesson-01']).toBeDefined()
    expect(state.pendingResults).toHaveLength(1)
    expect(state.pendingResults[0].lessonId).toBe('lesson-02')
  })
})

// ── Pure helper functions ───────────────────────────────────────────────────

describe('createCacheEntry (pure)', () => {
  it('creates an entry with the lesson and a cachedAt timestamp', () => {
    const lesson = makeLesson()
    const entry = createCacheEntry(lesson)
    expect(entry.lesson).toEqual(lesson)
    expect(entry.cachedAt).toBeDefined()
    expect(() => new Date(entry.cachedAt)).not.toThrow()
  })
})

describe('createPendingResult (pure)', () => {
  it('creates a result with id, lessonId, stats, and completedAt', () => {
    const stats = makeStats()
    const result = createPendingResult('lesson-05', stats)
    expect(result.id).toMatch(/^result-/)
    expect(result.lessonId).toBe('lesson-05')
    expect(result.stats).toEqual(stats)
    expect(result.completedAt).toBeDefined()
  })
})

// ── Corrupt storage resilience ──────────────────────────────────────────────

describe('corrupt storage resilience', () => {
  it('returns empty cache when localStorage has invalid JSON for lessons', () => {
    localStorage.setItem('ninja:offline:lessons', '{{{invalid}}}')
    expect(getCachedLesson('any')).toBeUndefined()
    expect(getAllCachedLessons()).toEqual({})
  })

  it('returns empty array when localStorage has invalid JSON for pending results', () => {
    localStorage.setItem('ninja:offline:pending-results', 'not-json')
    expect(getPendingResults()).toEqual([])
    expect(getPendingResultCount()).toBe(0)
  })
})
