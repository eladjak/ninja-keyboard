import { describe, it, expect } from 'vitest'
import {
  DRILL_SUGGEST_THRESHOLD,
  buildDrillSuggestion,
  drillHref,
  findMissedKeys,
  parseDrillKeys,
  isLessonId,
  parseFromLesson,
  lessonHref,
} from './weak-key-suggestion'
import type { SessionStats } from './types'

function statsWith(
  accuracy: number,
  keyAccuracy: SessionStats['keyAccuracy'],
): Pick<SessionStats, 'accuracy' | 'keyAccuracy'> {
  return { accuracy, keyAccuracy }
}

describe('findMissedKeys', () => {
  it('returns keys with errors, worst (most errors) first', () => {
    const hits = findMissedKeys({
      keyAccuracy: {
        א: { correct: 8, total: 10 }, // 2 errors
        ב: { correct: 1, total: 6 }, // 5 errors
        ג: { correct: 4, total: 7 }, // 3 errors
      },
    })
    expect(hits.map((h) => h.char)).toEqual(['ב', 'ג', 'א'])
    expect(hits[0].errors).toBe(5)
  })

  it('excludes keys with no errors', () => {
    const hits = findMissedKeys({
      keyAccuracy: {
        א: { correct: 10, total: 10 },
        ב: { correct: 2, total: 4 },
      },
    })
    expect(hits.map((h) => h.char)).toEqual(['ב'])
  })

  it('excludes whitespace keys', () => {
    const hits = findMissedKeys({
      keyAccuracy: {
        ' ': { correct: 1, total: 5 },
        ב: { correct: 2, total: 4 },
      },
    })
    expect(hits.map((h) => h.char)).toEqual(['ב'])
  })

  it('respects the minimum attempts bar', () => {
    const hits = findMissedKeys({
      keyAccuracy: {
        א: { correct: 0, total: 1 }, // below MIN_ATTEMPTS
        ב: { correct: 1, total: 3 },
      },
    })
    expect(hits.map((h) => h.char)).toEqual(['ב'])
  })

  it('caps the number of returned keys', () => {
    const hits = findMissedKeys(
      {
        keyAccuracy: {
          א: { correct: 0, total: 5 },
          ב: { correct: 0, total: 5 },
          ג: { correct: 0, total: 5 },
          ד: { correct: 0, total: 5 },
          ה: { correct: 0, total: 5 },
        },
      },
      2,
    )
    expect(hits).toHaveLength(2)
  })

  it('breaks error-count ties by lower accuracy', () => {
    const hits = findMissedKeys({
      keyAccuracy: {
        א: { correct: 8, total: 10 }, // 2 errors, 80%
        ב: { correct: 2, total: 4 }, // 2 errors, 50%
      },
    })
    expect(hits[0].char).toBe('ב')
  })
})

describe('buildDrillSuggestion', () => {
  it('does not suggest when accuracy is at or above threshold', () => {
    const result = buildDrillSuggestion(
      statsWith(DRILL_SUGGEST_THRESHOLD, {
        א: { correct: 1, total: 4 },
      }),
    )
    expect(result.suggest).toBe(false)
    expect(result.keys).toEqual([])
  })

  it('does not suggest when there are no missed keys despite low accuracy', () => {
    // Low overall accuracy but no per-key data meeting the bar.
    const result = buildDrillSuggestion(
      statsWith(60, {
        א: { correct: 0, total: 1 },
      }),
    )
    expect(result.suggest).toBe(false)
  })

  it('suggests a drill below threshold and lists the keys', () => {
    const result = buildDrillSuggestion(
      statsWith(70, {
        א: { correct: 1, total: 6 },
        ב: { correct: 8, total: 10 },
      }),
    )
    expect(result.suggest).toBe(true)
    expect(result.keys).toContain('א')
    expect(result.messageHe).toContain('א')
    expect(result.titleHe.length).toBeGreaterThan(0)
  })

  it('uses singular copy for one key and plural for many', () => {
    const single = buildDrillSuggestion(
      statsWith(70, { א: { correct: 1, total: 6 } }),
    )
    expect(single.keys).toHaveLength(1)
    expect(single.messageHe).toContain('המקש')

    const many = buildDrillSuggestion(
      statsWith(70, {
        א: { correct: 1, total: 6 },
        ב: { correct: 1, total: 6 },
      }),
    )
    expect(many.keys.length).toBeGreaterThan(1)
    expect(many.messageHe).toContain('מקשים')
  })

  it('keeps copy encouraging, never punishing', () => {
    const result = buildDrillSuggestion(
      statsWith(50, { א: { correct: 1, total: 6 } }),
    )
    expect(result.messageHe).toContain('אלוף')
    expect(result.messageHe).not.toMatch(/נכשל|גרוע|רע/)
  })
})

describe('drillHref / parseDrillKeys', () => {
  it('builds a deep-link with encoded keys', () => {
    const href = drillHref(['א', 'ב'])
    expect(href.startsWith('/drill?keys=')).toBe(true)
    const raw = decodeURIComponent(href.split('=')[1])
    expect(raw).toBe('א,ב')
  })

  it('falls back to bare /drill when no keys', () => {
    expect(drillHref([])).toBe('/drill')
  })

  it('round-trips through parseDrillKeys', () => {
    const keys = ['א', 'ב', 'ג']
    const href = drillHref(keys)
    const raw = decodeURIComponent(href.split('=')[1])
    expect(parseDrillKeys(raw)).toEqual(keys)
  })

  it('parseDrillKeys tolerates whitespace and empties', () => {
    expect(parseDrillKeys(' א , ב ,, ')).toEqual(['א', 'ב'])
    expect(parseDrillKeys(null)).toEqual([])
    expect(parseDrillKeys('')).toEqual([])
  })
})

describe('drill→lesson loop closure helpers', () => {
  it('drillHref carries a valid lesson id as ?from', () => {
    const href = drillHref(['א'], 'lesson-07')
    const url = new URL(href, 'https://x.test')
    expect(url.pathname).toBe('/drill')
    expect(parseDrillKeys(url.searchParams.get('keys'))).toEqual(['א'])
    expect(url.searchParams.get('from')).toBe('lesson-07')
  })

  it('drillHref omits an invalid from (no path-traversal leakage)', () => {
    expect(drillHref(['א'], '../../etc/passwd')).toBe(
      drillHref(['א']),
    )
    expect(drillHref(['א'], 'home')).toBe(drillHref(['א']))
    expect(drillHref(['א'], null)).toBe(drillHref(['א']))
  })

  it('drillHref can carry from with no keys', () => {
    const url = new URL(drillHref([], 'lesson-03'), 'https://x.test')
    expect(url.searchParams.get('keys')).toBeNull()
    expect(url.searchParams.get('from')).toBe('lesson-03')
  })

  it('isLessonId accepts canonical ids only', () => {
    expect(isLessonId('lesson-01')).toBe(true)
    expect(isLessonId('lesson-20')).toBe(true)
    expect(isLessonId('lesson-1')).toBe(false)
    expect(isLessonId('lesson-')).toBe(false)
    expect(isLessonId('/lessons/lesson-01')).toBe(false)
    expect(isLessonId(null)).toBe(false)
    expect(isLessonId(undefined)).toBe(false)
  })

  it('parseFromLesson returns the id or null', () => {
    expect(parseFromLesson('lesson-12')).toBe('lesson-12')
    expect(parseFromLesson('lesson-bad')).toBeNull()
    expect(parseFromLesson(null)).toBeNull()
  })

  it('lessonHref builds the lesson route', () => {
    expect(lessonHref('lesson-09')).toBe('/lessons/lesson-09')
  })
})
