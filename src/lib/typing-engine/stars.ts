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
  const avg = (wpmRatio + accRatio) / 2
  if (avg >= 1.3) return 3
  if (avg >= 1.0) return 2
  if (avg >= 0.7) return 1
  return 0
}
