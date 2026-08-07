import { describe, it, expect } from 'vitest'
import { calculateStars, totalStarsEarned } from './stars'
import { isLessonComplete } from './engine'
import { LESSONS } from '@/lib/content/lessons'

describe('calculateStars', () => {
  it('returns 3 stars at 130% of combined target', () => {
    // wpmRatio 1.4 + accRatio ~1.29 => avg ~1.35 >= 1.3
    expect(calculateStars(14, 110, 10, 85)).toBe(3)
  })

  it('returns 2 stars when exactly on target', () => {
    expect(calculateStars(10, 85, 10, 85)).toBe(2)
  })

  it('returns 1 star at 70% of target', () => {
    expect(calculateStars(7, 60, 10, 85)).toBe(1)
  })

  it('returns 0 stars far below target', () => {
    expect(calculateStars(2, 30, 10, 85)).toBe(0)
  })

  it('guards against zero targets', () => {
    expect(calculateStars(10, 90, 0, 0)).toBe(0)
  })

  it('caps strong-accuracy-but-slow at 1 star (speed target not met)', () => {
    // wpmRatio 0.9 + accRatio 1.1 => avg 1.0, which the average model scored 2.
    // But 9 wpm fails the 10 wpm target, so the lesson did NOT pass, and 2 stars
    // would claim "target met" on a card that says "try again".
    expect(calculateStars(9, 93.5, 10, 85)).toBe(1)
  })

  // --- Accuracy is a gate: speed must never buy away inaccuracy. ---
  // Regression guard for the "3 gold stars on a failed lesson" defect, observed
  // in a real browser run of lesson-01 (target 5 wpm / 80% accuracy).

  it('awards NO stars for fast but wildly inaccurate typing', () => {
    // The exact observed run: 30 wpm at 50% accuracy on lesson-01.
    // Old average model: (6.0 + 0.625) / 2 = 3.3 => 3 stars. Now: 0.
    expect(calculateStars(30, 50, 5, 80)).toBe(0)
    // The cheapest reachable case: an ordinary beginner speed at 25% accuracy.
    expect(calculateStars(12, 25, 5, 80)).toBe(0)
    // Absurd speed cannot rescue it either.
    expect(calculateStars(200, 25, 5, 80)).toBe(0)
  })

  it('caps at 1 star below the accuracy target, however fast', () => {
    // accRatio 0.94 (just under target) with huge speed: "close", never mastery.
    expect(calculateStars(60, 75, 5, 80)).toBe(1)
  })

  // --- Speed is a gate for MASTERY too: the stars must never claim more than
  // the results card does. Regression guard for the "2 gold stars on a lesson
  // that said try again" defect — the mirror image of the one above, and the
  // one a careful, slow six-year-old actually lands on.

  it('never shows 2+ stars on a lesson that did not pass, across the whole curriculum', () => {
    const contradictions: string[] = []
    let checked = 0
    for (const lesson of LESSONS) {
      const { targetWpm, targetAccuracy } = lesson
      for (let wpm = 0; wpm <= 40; wpm++) {
        for (let acc = 0; acc <= 100; acc++) {
          checked++
          const passed = isLessonComplete(
            { wpm, accuracy: acc } as Parameters<typeof isLessonComplete>[0],
            targetWpm,
            targetAccuracy,
          )
          if (calculateStars(wpm, acc, targetWpm, targetAccuracy) >= 2 && !passed) {
            contradictions.push(`${lesson.id}: ${wpm}wpm/${acc}%`)
          }
        }
      }
    }
    // The sweep really ran (an empty sweep would pass vacuously).
    expect(LESSONS.length).toBeGreaterThan(20)
    expect(checked).toBeGreaterThan(50_000)
    expect(contradictions.slice(0, 10)).toEqual([])
  })

  it('the exact observed case: 4 wpm at 96% on lesson-01 is 1 star, not 2', () => {
    // Old formula: (4/5 + 96/80) / 2 = 1.0 => 2 stars, while the card said
    // "נסיון טוב! נסו שוב" and paid 0 XP.
    expect(calculateStars(4, 96, 5, 80)).toBe(1)
    expect(
      isLessonComplete(
        { wpm: 4, accuracy: 96 } as Parameters<typeof isLessonComplete>[0],
        5,
        80,
      ),
    ).toBe(false)
  })

  it('CONTROL: accurate-but-slow still earns its one star, not zero', () => {
    // The speed gate must CAP mastery, never punish a careful child down to 0 —
    // otherwise the tests above would also pass with `if (wpmRatio < 1) return
    // 0`, which is a different and worse product. Both cases below scored 2
    // under the old average model, so a zeroing gate would show 0 here.
    expect(calculateStars(4, 96, 5, 80)).toBe(1)
    expect(calculateStars(9, 93.5, 10, 85)).toBe(1)
  })

  it('still awards full stars when the accuracy target IS met', () => {
    // The real passing run: 154 wpm at 100% accuracy on lesson-01.
    expect(calculateStars(154, 100, 5, 80)).toBe(3)
    // Exactly on target stays 2 stars.
    expect(calculateStars(5, 80, 5, 80)).toBe(2)
  })
})

describe('totalStarsEarned', () => {
  it('sums stars across lessons', () => {
    const total = totalStarsEarned([
      { bestWpm: 13, bestAccuracy: 111, targetWpm: 10, targetAccuracy: 85 }, // 3
      { bestWpm: 10, bestAccuracy: 85, targetWpm: 10, targetAccuracy: 85 }, // 2
      { bestWpm: 7, bestAccuracy: 60, targetWpm: 10, targetAccuracy: 85 }, // 1
    ])
    expect(total).toBe(6)
  })

  it('returns 0 for no lessons', () => {
    expect(totalStarsEarned([])).toBe(0)
  })
})
