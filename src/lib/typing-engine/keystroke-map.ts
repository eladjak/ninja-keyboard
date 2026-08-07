/**
 * Map TEXT POSITIONS to "was this character typed correctly?".
 *
 * The session store appends EVERY keystroke, but `currentIndex` only advances
 * on a correct one — so `keystrokes[i]` is the i-th *keystroke*, not the
 * character at position i. Reading it as a position (which the lesson view and
 * the typing area both used to do) drifts by the number of mistakes made:
 * after one error at position 0, the character at position 1 — typed perfectly
 * on the first try — was rendered red. Children were shown mistakes they never
 * made.
 *
 * This walks the keystrokes the way the engine does, so a position is red only
 * when the child actually missed THAT character.
 */

export interface KeystrokeLike {
  readonly isCorrect: boolean
}

/**
 * @param keystrokes every keystroke of the session, in order
 * @param skipCorrect how many CORRECT keystrokes belong to earlier lines and
 *   should be consumed before mapping begins. Lessons keep one keystroke list
 *   for the whole session while resetting `currentIndex` per line, so a
 *   multi-line lesson must skip the characters already completed.
 * @returns position → true (clean) / false (missed at least once)
 */
export function buildPositionCorrectnessMap(
  keystrokes: readonly KeystrokeLike[],
  skipCorrect = 0,
): Map<number, boolean> {
  const map = new Map<number, boolean>()
  let skipped = 0
  let position = 0

  for (const ks of keystrokes) {
    if (skipped < skipCorrect) {
      // Still inside earlier lines: only correct keystrokes advance the text.
      if (ks.isCorrect) skipped++
      continue
    }
    if (ks.isCorrect) {
      // A retry after a miss must NOT overwrite the miss — the child did err here.
      if (!map.has(position)) map.set(position, true)
      position++
    } else {
      map.set(position, false)
    }
  }

  return map
}
