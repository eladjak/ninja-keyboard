import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  clearAllLocalData,
  isCompleteErasure,
  localDataKeys,
  PERSISTED_STORE_KEYS,
} from './local-data'

describe('the key list matches the code that creates the keys', () => {
  // A hardcoded list rots silently: someone adds a store, the deletion dialog
  // keeps reporting success, and that child's data quietly survives deletion.
  // So derive the truth from the source rather than trusting the constant.
  it('covers every persist() store name in src/stores', () => {
    const dir = join(process.cwd(), 'src', 'stores')
    const names = new Set<string>()
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.ts') || f.includes('.test.')) continue
      const src = readFileSync(join(dir, f), 'utf8')
      for (const m of src.matchAll(/name:\s*'(ninja[^']+)'/g)) names.add(m[1])
    }
    // Guards a vacuous pass: if the scan found nothing, the assertion below
    // would trivially hold.
    expect(names.size).toBeGreaterThan(8)
    expect([...names].sort()).toEqual([...PERSISTED_STORE_KEYS].sort())
  })

  it('covers every offline storage key constant', () => {
    const src = readFileSync(
      join(process.cwd(), 'src', 'lib', 'offline', 'sync-manager.ts'),
      'utf8',
    )
    // Match only constants NAMED as storage keys. A looser `ninja:` match also
    // picks up PENDING_RESULTS_CHANGED_EVENT, which is a CustomEvent name and
    // never touches localStorage — it would fail this test for no real reason.
    const keys = [...src.matchAll(/\bSTORAGE_KEY\w*\s*=\s*'([^']+)'/g)].map(
      (m) => m[1],
    )
    expect(keys.length).toBeGreaterThan(0)
    for (const k of keys) expect(localDataKeys()).toContain(k)
    // And nothing is read/written through a bare string literal instead.
    const inlineWrites = [
      ...src.matchAll(/localStorage\.\w+\(\s*'([^']+)'/g),
    ].map((m) => m[1])
    expect(inlineWrites).toEqual([])
  })
})

describe('clearAllLocalData', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('removes every key the app writes for a child', () => {
    for (const k of localDataKeys()) window.localStorage.setItem(k, '{"state":{}}')
    window.localStorage.setItem('unrelated-third-party', 'keep me')

    const r = clearAllLocalData()

    expect(r.removed.sort()).toEqual([...localDataKeys()].sort())
    expect(r.failed).toEqual([])
    expect(r.unknownRemaining).toEqual([])
    expect(isCompleteErasure(r)).toBe(true)
    for (const k of localDataKeys()) {
      expect(window.localStorage.getItem(k)).toBeNull()
    }
    // Only ours. Wiping the whole origin would be its own defect.
    expect(window.localStorage.getItem('unrelated-third-party')).toBe('keep me')
  })

  it('reports INCOMPLETE when something of ours survives', () => {
    // The property that matters: the dialog must never claim a complete
    // erasure while data remains. Plant a key under our namespace that the
    // list does not know about — exactly what a future store would look like.
    window.localStorage.setItem('ninja-keyboard-future-store', '{"state":{}}')

    const r = clearAllLocalData()

    expect(r.unknownRemaining).toContain('ninja-keyboard-future-store')
    expect(isCompleteErasure(r)).toBe(false)
  })

  // Counter-control: without this, `isCompleteErasure` returning false
  // unconditionally would pass the test above.
  it('CONTROL: a clean store really does report complete', () => {
    window.localStorage.setItem('ninja-keyboard-xp', '{"state":{"totalXp":900}}')
    const r = clearAllLocalData()
    expect(isCompleteErasure(r)).toBe(true)
    expect(r.removed).toEqual(['ninja-keyboard-xp'])
  })
})
