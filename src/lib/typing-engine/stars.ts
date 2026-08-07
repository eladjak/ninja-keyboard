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

  // ...and below the accuracy target, one star ("close") is the ceiling —
  // 2 and 3 stars mean "target met" / "mastered", which speed alone cannot earn.
  return accRatio < 1 && stars > 1 ? 1 : stars
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
