/**
 * Mastery star calculation (1-3 stars), shared by the lesson results modal
 * and the lessons map. Mirrors TypingClub-style replay motivation:
 * 1 star = close, 2 stars = target met, 3 stars = mastered (30% above target).
 */

export type StarCount = 0 | 1 | 2 | 3

export function calculateStars(
  wpm: number,
  accuracy: number,
  targetWpm: number,
  targetAccuracy: number,
): StarCount {
  if (targetWpm <= 0 || targetAccuracy <= 0) return 0
  const wpmRatio = wpm / targetWpm
  const accRatio = accuracy / targetAccuracy

  // Accuracy is a GATE, not a tradeable dimension. The plain average let speed
  // buy away inaccuracy: on lesson-01 (target 5 wpm / 80%) a child typing 12 wpm
  // at 25% accuracy scored avg >= 1.3 and was shown THREE GOLD STARS on the same
  // card that said "נסיון טוב! נסו שוב" and awarded no XP. For a 6-16 audience the
  // stars ARE the reward signal, so the card contradicted itself.
  //
  // Wildly inaccurate typing earns nothing, however fast it was...
  if (accRatio < 0.7) return 0

  const stars = avgStars(wpmRatio, accRatio)

  // ...and below EITHER target, one star ("close") is the ceiling — 2 and 3
  // stars mean "target met" / "mastered", and the results card reserves those
  // words for `isLessonComplete`, which requires BOTH targets.
  //
  // The accuracy half of this gate was added first, but the speed half was left
  // open, and it is the half a small child actually lands on. On lesson-01
  // (target 5 wpm / 80%) a careful six-year-old typing 4 wpm at 96% scored
  // avg 1.0 => TWO GOLD STARS on the same card that read "נסיון טוב! נסו שוב"
  // and paid no XP. A sweep of the shipped curriculum found 167 such
  // (wpm, accuracy) points across all 25 lessons — see stars.test.ts.
  //
  // The two halves stay asymmetric on purpose: wildly inaccurate typing earns
  // ZERO however fast it was, while accurate-but-slow still earns its one star.
  // Speed is a goal; accuracy is a gate.
  return (accRatio < 1 || wpmRatio < 1) && stars > 1 ? 1 : stars
}

/** The original average model, retained as the speed/accuracy blend. */
function avgStars(wpmRatio: number, accRatio: number): StarCount {
  const avg = (wpmRatio + accRatio) / 2
  if (avg >= 1.3) return 3
  if (avg >= 1.0) return 2
  if (avg >= 0.7) return 1
  return 0
}

/** Per-lesson best result needed to score its stars. */
export interface LessonStarInputs {
  bestWpm: number
  bestAccuracy: number
  targetWpm: number
  targetAccuracy: number
}

/**
 * Sum the mastery stars across a set of completed lessons. Used to derive the
 * spendable coin economy deterministically from progress.
 */
export function totalStarsEarned(lessons: readonly LessonStarInputs[]): number {
  return lessons.reduce(
    (sum, l) =>
      sum +
      calculateStars(l.bestWpm, l.bestAccuracy, l.targetWpm, l.targetAccuracy),
    0,
  )
}
