import { describe, it, expect } from 'vitest'
import { buildPositionCorrectnessMap } from './keystroke-map'

const ok = { isCorrect: true }
const miss = { isCorrect: false }

describe('buildPositionCorrectnessMap', () => {
  it('marks a flawless run all-clean', () => {
    const m = buildPositionCorrectnessMap([ok, ok, ok])
    expect([...m.entries()]).toEqual([
      [0, true],
      [1, true],
      [2, true],
    ])
  })

  // The observed defect: one miss at position 0, then four flawless characters,
  // rendered cells 0 AND 1 red. Position 1 was never mistyped.
  it('does not smear one mistake onto the next character', () => {
    const m = buildPositionCorrectnessMap([miss, ok, ok, ok])
    expect(m.get(0)).toBe(false) // the character actually missed
    expect(m.get(1)).toBe(true) // typed perfectly first try — must NOT be red
    expect(m.get(2)).toBe(true)
  })

  it('keeps a position red even after the child retries it correctly', () => {
    const m = buildPositionCorrectnessMap([miss, miss, ok, ok])
    expect(m.get(0)).toBe(false)
    expect(m.get(1)).toBe(true)
  })

  it('attributes a late mistake to the character it happened on', () => {
    // clean, clean, MISS at position 2, retry, clean
    const m = buildPositionCorrectnessMap([ok, ok, miss, ok, ok])
    expect(m.get(0)).toBe(true)
    expect(m.get(1)).toBe(true)
    expect(m.get(2)).toBe(false)
    expect(m.get(3)).toBe(true)
  })

  it('skips characters completed on earlier lines', () => {
    // Line 1 was 3 characters with one miss; line 2 starts fresh at position 0.
    const all = [ok, miss, ok, ok, miss, ok]
    const m = buildPositionCorrectnessMap(all, 3)
    expect(m.get(0)).toBe(false) // the miss on line 2
    expect(m.get(1)).toBeUndefined()
    expect(m.size).toBe(1)
  })

  it('handles an empty session', () => {
    expect(buildPositionCorrectnessMap([]).size).toBe(0)
  })
})
