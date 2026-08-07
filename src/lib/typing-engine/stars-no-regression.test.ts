/**
 * NO RETROACTIVE DOWNGRADE.
 *
 * Stars are DERIVED, never stored: the lessons map and the coin economy call
 * `calculateStars(bestWpm, bestAccuracy, ...)` on every render. So tightening
 * the formula could silently demote achievements a child already earned — a
 * worse bug than the one the accuracy gate fixed.
 *
 * This proves it cannot happen, rather than arguing it. It replays the OLD
 * formula against the NEW one across EVERY lesson in the shipped curriculum,
 * over the full space of results that can actually be stored.
 *
 * What can be stored: `xpStore.completeLesson` is called from exactly two
 * places (lesson-page-client, shortcut-lesson-page-client) and both are gated
 * on `isLessonComplete` — wpm >= targetWpm AND accuracy >= targetAccuracy.
 * `bestWpm`/`bestAccuracy` are then Math.max over such runs, so a stored record
 * is always at or above both targets. That is the region asserted below.
 */
import { describe, it, expect } from 'vitest'
import { calculateStars } from './stars'
import { isLessonComplete } from './engine'
import { LESSONS } from '@/lib/content/lessons'

/** The formula exactly as it shipped before the accuracy gate. */
function calculateStarsOld(
  wpm: number,
  accuracy: number,
  targetWpm: number,
  targetAccuracy: number,
): number {
  if (targetWpm <= 0 || targetAccuracy <= 0) return 0
  const avg = (wpm / targetWpm + accuracy / targetAccuracy) / 2
  if (avg >= 1.3) return 3
  if (avg >= 1.0) return 2
  if (avg >= 0.7) return 1
  return 0
}

describe('no retroactive downgrade of already-earned stars', () => {
  it('has a curriculum to test against (guards an empty-sweep false pass)', () => {
    expect(LESSONS.length).toBeGreaterThan(20)
  })

  it('gives every storable result the SAME stars as the old formula', () => {
    const mismatches: string[] = []
    let compared = 0

    for (const lesson of LESSONS) {
      const { targetWpm, targetAccuracy } = lesson
      // Sweep the whole storable region: at/above both targets, up to
      // wildly beyond them (a fast older kid on an early lesson).
      for (let wpm = targetWpm; wpm <= targetWpm * 20 + 5; wpm += 1) {
        for (let acc = targetAccuracy; acc <= 100; acc += 1) {
          if (!isLessonComplete(
            { wpm, accuracy: acc } as Parameters<typeof isLessonComplete>[0],
            targetWpm,
            targetAccuracy,
          )) continue
          compared++
          const before = calculateStarsOld(wpm, acc, targetWpm, targetAccuracy)
          const after = calculateStars(wpm, acc, targetWpm, targetAccuracy)
          if (after !== before) {
            mismatches.push(
              `${lesson.id}: ${wpm}wpm/${acc}% → was ${before}, now ${after}`,
            )
          }
        }
      }
    }

    expect(compared).toBeGreaterThan(10000) // the sweep really ran
    expect(mismatches.slice(0, 10)).toEqual([])
  })

  it('never returns FEWER stars than the old formula for a stored record', () => {
    for (const lesson of LESSONS) {
      const { targetWpm, targetAccuracy } = lesson
      for (const wpm of [targetWpm, targetWpm * 2, targetWpm * 10]) {
        for (const acc of [targetAccuracy, 90, 100]) {
          if (acc < targetAccuracy) continue
          expect(
            calculateStars(wpm, acc, targetWpm, targetAccuracy),
          ).toBeGreaterThanOrEqual(
            calculateStarsOld(wpm, acc, targetWpm, targetAccuracy),
          )
        }
      }
    }
  })

  // Counter-control: the sweep above must not be vacuously true. Below the
  // accuracy target — which is NOT storable — the two formulas must DIVERGE,
  // or this file would pass even if the gate had never been added.
  it('CONTROL: the formulas do differ below the accuracy target', () => {
    const before = calculateStarsOld(30, 50, 5, 80)
    const after = calculateStars(30, 50, 5, 80)
    expect(before).toBe(3)
    expect(after).toBe(0)
  })
})
