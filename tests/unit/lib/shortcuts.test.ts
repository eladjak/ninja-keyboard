import { describe, it, expect } from 'vitest'
import {
  SHORTCUTS,
  SHORTCUT_LESSONS,
  getShortcutsByCategory,
  getShortcutsByDifficulty,
  getShortcutById,
  getShortcutLessonById,
  getShortcutLessonByCategory,
} from '@/lib/content/shortcuts'
import type { ShortcutCategory, ShortcutDifficulty } from '@/lib/content/shortcuts'

describe('SHORTCUTS data', () => {
  it('has at least 40 shortcuts defined', () => {
    expect(SHORTCUTS.length).toBeGreaterThanOrEqual(40)
  })

  it('has exactly 40 shortcuts', () => {
    expect(SHORTCUTS).toHaveLength(40)
  })

  it('each shortcut has a unique id', () => {
    const ids = SHORTCUTS.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('each shortcut has a non-empty hebrewName', () => {
    for (const s of SHORTCUTS) {
      expect(s.hebrewName.trim().length).toBeGreaterThan(0)
    }
  })

  it('each shortcut has a non-empty description', () => {
    for (const s of SHORTCUTS) {
      expect(s.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('each shortcut has at least one key', () => {
    for (const s of SHORTCUTS) {
      expect(s.keys.length).toBeGreaterThan(0)
    }
  })

  it('each shortcut has a valid category', () => {
    const validCategories: ShortcutCategory[] = [
      'basic',
      'text',
      'browser',
      'windows',
      'advanced',
    ]
    for (const s of SHORTCUTS) {
      expect(validCategories).toContain(s.category)
    }
  })

  it('each shortcut has a valid difficulty (1-5)', () => {
    for (const s of SHORTCUTS) {
      expect(s.difficulty).toBeGreaterThanOrEqual(1)
      expect(s.difficulty).toBeLessThanOrEqual(5)
    }
  })
})

describe('getShortcutsByCategory', () => {
  it('returns 8 shortcuts for basic category', () => {
    const basic = getShortcutsByCategory('basic')
    expect(basic).toHaveLength(8)
  })

  it('returns 8 shortcuts for text category', () => {
    const text = getShortcutsByCategory('text')
    expect(text).toHaveLength(8)
  })

  it('returns 8 shortcuts for browser category', () => {
    const browser = getShortcutsByCategory('browser')
    expect(browser).toHaveLength(8)
  })

  it('returns 8 shortcuts for windows category', () => {
    const windows = getShortcutsByCategory('windows')
    expect(windows).toHaveLength(8)
  })

  it('returns 8 shortcuts for advanced category', () => {
    const advanced = getShortcutsByCategory('advanced')
    expect(advanced).toHaveLength(8)
  })

  it('all returned shortcuts belong to the requested category', () => {
    const categories: ShortcutCategory[] = [
      'basic',
      'text',
      'browser',
      'windows',
      'advanced',
    ]
    for (const cat of categories) {
      const shortcuts = getShortcutsByCategory(cat)
      for (const s of shortcuts) {
        expect(s.category).toBe(cat)
      }
    }
  })
})

describe('getShortcutsByDifficulty', () => {
  it('returns 8 shortcuts for difficulty 1', () => {
    const result = getShortcutsByDifficulty(1)
    expect(result).toHaveLength(8)
  })

  it('returns shortcuts matching the exact difficulty level', () => {
    const levels: ShortcutDifficulty[] = [1, 2, 3, 4, 5]
    for (const level of levels) {
      const result = getShortcutsByDifficulty(level)
      for (const s of result) {
        expect(s.difficulty).toBe(level)
      }
    }
  })

  it('returns 8 shortcuts for each difficulty level', () => {
    const levels: ShortcutDifficulty[] = [1, 2, 3, 4, 5]
    for (const level of levels) {
      const result = getShortcutsByDifficulty(level)
      expect(result).toHaveLength(8)
    }
  })
})

describe('getShortcutById', () => {
  it('returns the correct shortcut for a valid id', () => {
    const shortcut = getShortcutById('shortcut-basic-01')
    expect(shortcut).toBeDefined()
    expect(shortcut!.keys).toEqual(['Ctrl', 'C'])
    expect(shortcut!.hebrewName).toBe('העתקה')
  })

  it('returns undefined for an invalid id', () => {
    expect(getShortcutById('nonexistent')).toBeUndefined()
  })
})

describe('SHORTCUT_LESSONS', () => {
  it('has exactly 5 lessons', () => {
    expect(SHORTCUT_LESSONS).toHaveLength(5)
  })

  it('each lesson has a non-empty title in Hebrew', () => {
    for (const lesson of SHORTCUT_LESSONS) {
      expect(lesson.title.trim().length).toBeGreaterThan(0)
    }
  })

  it('each lesson has a non-empty description in Hebrew', () => {
    for (const lesson of SHORTCUT_LESSONS) {
      expect(lesson.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('each lesson contains 8 shortcuts', () => {
    for (const lesson of SHORTCUT_LESSONS) {
      expect(lesson.shortcuts).toHaveLength(8)
    }
  })

  it('covers all 5 categories', () => {
    const categories = SHORTCUT_LESSONS.map((l) => l.category)
    expect(categories).toContain('basic')
    expect(categories).toContain('text')
    expect(categories).toContain('browser')
    expect(categories).toContain('windows')
    expect(categories).toContain('advanced')
  })

  it('lesson shortcuts match the lesson category', () => {
    for (const lesson of SHORTCUT_LESSONS) {
      for (const shortcut of lesson.shortcuts) {
        expect(shortcut.category).toBe(lesson.category)
      }
    }
  })
})

describe('getShortcutLessonById', () => {
  it('returns the basic lesson', () => {
    const lesson = getShortcutLessonById('shortcut-lesson-basic')
    expect(lesson).toBeDefined()
    expect(lesson!.category).toBe('basic')
  })

  it('returns undefined for invalid id', () => {
    expect(getShortcutLessonById('nonexistent')).toBeUndefined()
  })
})

describe('getShortcutLessonByCategory', () => {
  it('returns the correct lesson for each category', () => {
    const categories: ShortcutCategory[] = [
      'basic',
      'text',
      'browser',
      'windows',
      'advanced',
    ]
    for (const cat of categories) {
      const lesson = getShortcutLessonByCategory(cat)
      expect(lesson).toBeDefined()
      expect(lesson!.category).toBe(cat)
    }
  })
})
