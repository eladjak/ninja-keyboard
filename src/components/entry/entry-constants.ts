/**
 * Shared constants for the entry choreography. Kept in their own module so the
 * server component (CSS + gate script) and the client overlay agree on every
 * name and number without one importing the other.
 */

/** localStorage key gating the once-EVER entrance. Bump the suffix to re-premiere. */
export const ENTRY_SEEN_KEY = 'ninja-entry-seen-v1'

/** The class the gate script puts on `<html>` while the entrance plays. */
export const ENTRY_PLAY_CLASS = 'nk-play'

/** The Hebrew home row, in the product's own lesson order (lessons.ts). */
export const HOME_ROW = ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'] as const

/**
 * Stagger delay per key, in "steps", by the finger that presses it — index
 * fingers first (כ ע), then middle (ג י), ring (ד ח), pinky (ש ל), and finally
 * the two outer keys (ך ף). This is the order the hand learns, not left-to-right.
 */
export const FINGER_STEP: Record<string, number> = {
  כ: 0,
  ע: 0,
  ג: 1,
  י: 1,
  ד: 2,
  ח: 2,
  ש: 3,
  ל: 3,
  ך: 4,
  ף: 4,
}

export const KEY_W = 40
export const KEY_GAP = 4
export const KEY_X0 = 12
