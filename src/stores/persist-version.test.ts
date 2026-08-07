import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistVersioning, PERSIST_VERSION } from './persist-version'

const STORES_DIR = join(process.cwd(), 'src', 'stores')

function storeFiles(): string[] {
  return readdirSync(STORES_DIR).filter(
    (f) => f.endsWith('-store.ts') && !f.includes('.test.'),
  )
}

describe('every persisted store has a migration hook', () => {
  it('found stores to check (guards a vacuous pass)', () => {
    expect(storeFiles().length).toBeGreaterThan(8)
  })

  it('every persist() config opts into versioning', () => {
    const missing: string[] = []
    let persisted = 0
    for (const f of storeFiles()) {
      const src = readFileSync(join(STORES_DIR, f), 'utf8')
      if (!/name:\s*'ninja/.test(src)) continue
      persisted++
      if (!src.includes('persistVersioning()')) missing.push(f)
    }
    expect(persisted).toBeGreaterThan(8)
    expect(missing).toEqual([])
  })
})

describe('a version bump does not wipe a returning child', () => {
  beforeEach(() => window.localStorage.clear())

  interface Xpish {
    totalXp: number
    bump: () => void
  }

  const makeStore = (version: number, withHook: boolean) =>
    create<Xpish>()(
      persist(
        (set) => ({
          totalXp: 0,
          bump: () => set((s) => ({ totalXp: s.totalXp + 1 })),
        }),
        withHook
          ? { name: 'test-versioned', ...persistVersioning<Xpish>(), version }
          : { name: 'test-versioned', version },
      ),
    )

  it('keeps the stored XP when the version moves ahead', async () => {
    // A returning child whose progress was written by the shipped version.
    window.localStorage.setItem(
      'test-versioned',
      JSON.stringify({ state: { totalXp: 680 }, version: PERSIST_VERSION }),
    )

    const store = makeStore(PERSIST_VERSION + 1, true)
    await new Promise((r) => setTimeout(r, 0))

    expect(store.getState().totalXp).toBe(680)
  })

  // Counter-control: this is the behaviour being prevented. If zustand did not
  // actually drop state on a version mismatch, the test above would prove
  // nothing at all.
  it('CONTROL: without the hook, the same bump zeroes the child', async () => {
    window.localStorage.setItem(
      'test-versioned',
      JSON.stringify({ state: { totalXp: 680 }, version: PERSIST_VERSION }),
    )

    const store = makeStore(PERSIST_VERSION + 1, false)
    await new Promise((r) => setTimeout(r, 0))

    expect(store.getState().totalXp).toBe(0)
  })

  it('the shipped version is what zustand already writes, so adopting it is a no-op', () => {
    // Real stored values carry version 0 even though the configs omitted the
    // field (verified in a browser). Adopting an explicit 0 therefore cannot
    // itself trigger the very wipe this guards against.
    expect(PERSIST_VERSION).toBe(0)
  })
})
