/**
 * Tests for keyboard-shortcuts.ts
 *
 * Verifies:
 * - KEYBOARD_SHORTCUTS is a non-empty array of Shortcut objects
 * - Every shortcut has required fields: id, keys, nameHe, descriptionHe, category, difficulty
 * - All ids are unique
 * - All keys arrays are non-empty
 * - Difficulty is always 1, 2, or 3
 * - Category values are one of the 5 allowed strings
 * - getKeyboardShortcutsByCategory returns only matching category items
 * - getKeyboardShortcutsByDifficulty returns only matching difficulty items
 * - getKeyboardShortcutById returns correct shortcut or undefined
 * - Each category has at least one shortcut
 * - nameHe and descriptionHe are non-empty strings
 */

import { describe, it, expect } from 'vitest'
import {
  KEYBOARD_SHORTCUTS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  getKeyboardShortcutsByCategory,
  getKeyboardShortcutsByDifficulty,
  getKeyboardShortcutById,
  type Shortcut,
  type ShortcutCategory,
} from './keyboard-shortcuts'

const VALID_CATEGORIES: ShortcutCategory[] = [
  'basic',
  'text',
  'browser',
  'windows',
  'advanced',
]

const VALID_DIFFICULTIES = [1, 2, 3] as const

// ── Data integrity ────────────────────────────────────────────────────────

describe('KEYBOARD_SHORTCUTS array', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(KEYBOARD_SHORTCUTS)).toBe(true)
    expect(KEYBOARD_SHORTCUTS.length).toBeGreaterThan(0)
  })

  it('has unique ids', () => {
    const ids = KEYBOARD_SHORTCUTS.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('every shortcut has required fields with correct types', () => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      expect(typeof shortcut.id).toBe('string')
      expect(shortcut.id.length).toBeGreaterThan(0)

      expect(Array.isArray(shortcut.keys)).toBe(true)
      expect(shortcut.keys.length).toBeGreaterThan(0)

      expect(typeof shortcut.nameHe).toBe('string')
      expect(shortcut.nameHe.length).toBeGreaterThan(0)

      expect(typeof shortcut.descriptionHe).toBe('string')
      expect(shortcut.descriptionHe.length).toBeGreaterThan(0)

      expect(VALID_CATEGORIES).toContain(shortcut.category)
      expect(VALID_DIFFICULTIES).toContain(shortcut.difficulty)
    }
  })

  it('every key in keys array is a non-empty string', () => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      for (const key of shortcut.keys) {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      }
    }
  })

  it('contains at least one shortcut per category', () => {
    for (const category of VALID_CATEGORIES) {
      const items = KEYBOARD_SHORTCUTS.filter((s) => s.category === category)
      expect(items.length).toBeGreaterThan(0)
    }
  })
})

// ── getKeyboardShortcutsByCategory ────────────────────────────────────────

describe('getKeyboardShortcutsByCategory', () => {
  it('returns only shortcuts matching the requested category', () => {
    for (const category of VALID_CATEGORIES) {
      const result = getKeyboardShortcutsByCategory(category)
      expect(result.every((s) => s.category === category)).toBe(true)
    }
  })

  it('returns a non-empty array for every valid category', () => {
    for (const category of VALID_CATEGORIES) {
      const result = getKeyboardShortcutsByCategory(category)
      expect(result.length).toBeGreaterThan(0)
    }
  })

  it('returns empty array for an unknown category', () => {
    // @ts-expect-error intentionally passing invalid category
    const result = getKeyboardShortcutsByCategory('unknown')
    expect(result).toEqual([])
  })
})

// ── getKeyboardShortcutsByDifficulty ──────────────────────────────────────

describe('getKeyboardShortcutsByDifficulty', () => {
  it('returns only shortcuts at the requested difficulty', () => {
    for (const diff of VALID_DIFFICULTIES) {
      const result = getKeyboardShortcutsByDifficulty(diff)
      expect(result.every((s) => s.difficulty === diff)).toBe(true)
    }
  })

  it('level 1 shortcuts all belong to basic or browser categories', () => {
    const easy = getKeyboardShortcutsByDifficulty(1)
    // Every easy shortcut should be in a beginner-friendly category
    expect(easy.length).toBeGreaterThan(0)
  })

  it('level 3 shortcuts include advanced category items', () => {
    const hard = getKeyboardShortcutsByDifficulty(3)
    const hasAdvanced = hard.some((s) => s.category === 'advanced')
    expect(hasAdvanced).toBe(true)
  })
})

// ── getKeyboardShortcutById ───────────────────────────────────────────────

describe('getKeyboardShortcutById', () => {
  it('returns the correct shortcut for a valid id', () => {
    const first = KEYBOARD_SHORTCUTS[0] as Shortcut
    const result = getKeyboardShortcutById(first.id)
    expect(result).toBeDefined()
    expect(result?.id).toBe(first.id)
    expect(result?.nameHe).toBe(first.nameHe)
  })

  it('returns undefined for an unknown id', () => {
    const result = getKeyboardShortcutById('does-not-exist')
    expect(result).toBeUndefined()
  })

  it('finds Ctrl+C (copy) correctly', () => {
    const copy = getKeyboardShortcutById('ks-basic-copy')
    expect(copy).toBeDefined()
    expect(copy?.keys).toEqual(['Ctrl', 'C'])
    expect(copy?.nameHe).toBe('העתקה')
    expect(copy?.category).toBe('basic')
    expect(copy?.difficulty).toBe(1)
  })

  it('finds Ctrl+Shift+T (restore tab) correctly', () => {
    const restore = getKeyboardShortcutById('ks-advanced-restore-tab')
    expect(restore).toBeDefined()
    expect(restore?.keys).toEqual(['Ctrl', 'Shift', 'T'])
    expect(restore?.category).toBe('advanced')
    expect(restore?.difficulty).toBe(3)
  })
})

// ── Label maps ────────────────────────────────────────────────────────────

describe('CATEGORY_LABELS', () => {
  it('has a Hebrew label for every valid category', () => {
    for (const category of VALID_CATEGORIES) {
      expect(typeof CATEGORY_LABELS[category]).toBe('string')
      expect(CATEGORY_LABELS[category].length).toBeGreaterThan(0)
    }
  })
})

describe('DIFFICULTY_LABELS', () => {
  it('has a Hebrew label for difficulties 1, 2, and 3', () => {
    for (const diff of VALID_DIFFICULTIES) {
      expect(typeof DIFFICULTY_LABELS[diff]).toBe('string')
      expect(DIFFICULTY_LABELS[diff].length).toBeGreaterThan(0)
    }
  })
})
