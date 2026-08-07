import { describe, it, expect } from 'vitest'
import { resolveProgressMaxes } from './progress-sync'

/**
 * `pushProgress` was a plain upsert of this device's local best, so a stale or
 * second device could overwrite a higher score already on the server. These
 * cover the rule itself; the database round-trip around it is NOT covered here
 * (no live Supabase in the unit suite) and is called out in the report.
 */
describe('resolveProgressMaxes', () => {
  it('never lowers a stored personal best', () => {
    // The concrete case: a child hit 55 wpm on the tablet, then does the same
    // lesson on the classroom PC at 20 wpm.
    const r = resolveProgressMaxes(
      { bestWpm: 55, bestAccuracy: 96, stars: 3, attempts: 4 },
      { bestWpm: 20, bestAccuracy: 71, stars: 1, attempts: 1 },
    )
    expect(r.bestWpm).toBe(55)
    expect(r.bestAccuracy).toBe(96)
    expect(r.stars).toBe(3)
    expect(r.attempts).toBe(4)
  })

  it('takes the incoming value when it IS better', () => {
    const r = resolveProgressMaxes(
      { bestWpm: 20, bestAccuracy: 71, stars: 1, attempts: 4 },
      { bestWpm: 55, bestAccuracy: 96, stars: 3, attempts: 1 },
    )
    expect(r.bestWpm).toBe(55)
    expect(r.bestAccuracy).toBe(96)
    expect(r.stars).toBe(3)
  })

  it('resolves each field independently', () => {
    // Faster but sloppier than the stored row: speed rises, accuracy holds.
    const r = resolveProgressMaxes(
      { bestWpm: 30, bestAccuracy: 99, stars: 2, attempts: 2 },
      { bestWpm: 44, bestAccuracy: 60, stars: 1, attempts: 1 },
    )
    expect(r.bestWpm).toBe(44)
    expect(r.bestAccuracy).toBe(99)
  })

  it('writes the incoming values when there is no stored row', () => {
    const r = resolveProgressMaxes(null, { bestWpm: 12, bestAccuracy: 88 })
    expect(r).toEqual({ bestWpm: 12, bestAccuracy: 88, stars: 0, attempts: 1 })
  })

  // Counter-control: `return existing` for every field would satisfy the first
  // test. This proves the resolver is not simply ignoring the new result.
  it('CONTROL: a genuine improvement is not swallowed', () => {
    const r = resolveProgressMaxes(
      { bestWpm: 10, bestAccuracy: 80, stars: 1, attempts: 1 },
      { bestWpm: 11, bestAccuracy: 81, stars: 2, attempts: 2 },
    )
    expect(r).toEqual({ bestWpm: 11, bestAccuracy: 81, stars: 2, attempts: 2 })
  })

  it('attempts never goes backwards', () => {
    const r = resolveProgressMaxes(
      { bestWpm: 10, bestAccuracy: 80, stars: 1, attempts: 9 },
      { bestWpm: 10, bestAccuracy: 80, stars: 1, attempts: 1 },
    )
    expect(r.attempts).toBe(9)
  })
})
