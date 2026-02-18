import type { KeyDefinition, Finger, Hand } from './types'

/**
 * Standard Israeli Hebrew keyboard layout.
 * Maps physical QWERTY key positions to Hebrew characters.
 *
 * Physical layout (left to right on keyboard):
 * Top row:    / ' ק ר א ט ו ן ם פ
 * Home row:   ש ד ג כ ע י ח ל ך ף
 * Bottom row: ז ס ב ה נ מ צ ת ץ .
 */

function key(
  char: string,
  code: string,
  row: KeyDefinition['row'],
  finger: Finger,
  hand: Hand,
  enLabel: string,
  width?: number,
): KeyDefinition {
  return { char, code, row, finger, hand, enLabel, width }
}

// ── Top Row ──────────────────────────────────────────────────────
export const TOP_ROW: KeyDefinition[] = [
  key('/', 'KeyQ', 'top', 'pinky', 'left', 'Q'),
  key("'", 'KeyW', 'top', 'ring', 'left', 'W'),
  key('ק', 'KeyE', 'top', 'middle', 'left', 'E'),
  key('ר', 'KeyR', 'top', 'index', 'left', 'R'),
  key('א', 'KeyT', 'top', 'index', 'left', 'T'),
  key('ט', 'KeyY', 'top', 'index', 'right', 'Y'),
  key('ו', 'KeyU', 'top', 'index', 'right', 'U'),
  key('ן', 'KeyI', 'top', 'middle', 'right', 'I'),
  key('ם', 'KeyO', 'top', 'ring', 'right', 'O'),
  key('פ', 'KeyP', 'top', 'pinky', 'right', 'P'),
]

// ── Home Row ─────────────────────────────────────────────────────
export const HOME_ROW: KeyDefinition[] = [
  key('ש', 'KeyA', 'home', 'pinky', 'left', 'A'),
  key('ד', 'KeyS', 'home', 'ring', 'left', 'S'),
  key('ג', 'KeyD', 'home', 'middle', 'left', 'D'),
  key('כ', 'KeyF', 'home', 'index', 'left', 'F'),
  key('ע', 'KeyG', 'home', 'index', 'left', 'G'),
  key('י', 'KeyH', 'home', 'index', 'right', 'H'),
  key('ח', 'KeyJ', 'home', 'index', 'right', 'J'),
  key('ל', 'KeyK', 'home', 'middle', 'right', 'K'),
  key('ך', 'KeyL', 'home', 'ring', 'right', 'L'),
  key('ף', 'Semicolon', 'home', 'pinky', 'right', ';'),
]

// ── Bottom Row ───────────────────────────────────────────────────
export const BOTTOM_ROW: KeyDefinition[] = [
  key('ז', 'KeyZ', 'bottom', 'pinky', 'left', 'Z'),
  key('ס', 'KeyX', 'bottom', 'ring', 'left', 'X'),
  key('ב', 'KeyC', 'bottom', 'middle', 'left', 'C'),
  key('ה', 'KeyV', 'bottom', 'index', 'left', 'V'),
  key('נ', 'KeyB', 'bottom', 'index', 'left', 'B'),
  key('מ', 'KeyN', 'bottom', 'index', 'right', 'N'),
  key('צ', 'KeyM', 'bottom', 'index', 'right', 'M'),
  key('ת', 'Comma', 'bottom', 'middle', 'right', ','),
  key('ץ', 'Period', 'bottom', 'ring', 'right', '.'),
  key('.', 'Slash', 'bottom', 'pinky', 'right', '/'),
]

// ── Space Bar ────────────────────────────────────────────────────
export const SPACE_KEY: KeyDefinition = key(
  ' ',
  'Space',
  'space',
  'index',
  'right',
  'Space',
  6,
)

/** All keyboard rows in order */
export const KEYBOARD_ROWS = [TOP_ROW, HOME_ROW, BOTTOM_ROW] as const

/** Flat list of all key definitions */
export const ALL_KEYS: KeyDefinition[] = [
  ...TOP_ROW,
  ...HOME_ROW,
  ...BOTTOM_ROW,
  SPACE_KEY,
]

/** Map from Hebrew character to its KeyDefinition */
export const CHAR_TO_KEY: ReadonlyMap<string, KeyDefinition> = new Map(
  ALL_KEYS.map((k) => [k.char, k]),
)

/** Map from physical key code to its KeyDefinition */
export const CODE_TO_KEY: ReadonlyMap<string, KeyDefinition> = new Map(
  ALL_KEYS.map((k) => [k.code, k]),
)

/** Get the finger assignment for a Hebrew character */
export function getFingerForChar(char: string): KeyDefinition | undefined {
  return CHAR_TO_KEY.get(char)
}

/** Get all keys that should be pressed by a specific finger+hand combo */
export function getKeysForFinger(
  finger: Finger,
  hand: Hand,
): KeyDefinition[] {
  return ALL_KEYS.filter((k) => k.finger === finger && k.hand === hand)
}

/** Home position keys (where fingers rest) */
export const HOME_POSITION: Record<string, KeyDefinition> = {
  leftPinky: HOME_ROW[0],   // ש
  leftRing: HOME_ROW[1],    // ד
  leftMiddle: HOME_ROW[2],  // ג
  leftIndex: HOME_ROW[3],   // כ
  rightIndex: HOME_ROW[5],  // י
  rightMiddle: HOME_ROW[7], // ל
  rightRing: HOME_ROW[8],   // ך
  rightPinky: HOME_ROW[9],  // ף
}

/** Color assignments for each finger (for visual keyboard) */
export const FINGER_COLORS: Record<`${Hand}-${Finger}`, string> = {
  'left-pinky': 'var(--finger-left-pinky, #ef4444)',
  'left-ring': 'var(--finger-left-ring, #f97316)',
  'left-middle': 'var(--finger-left-middle, #eab308)',
  'left-index': 'var(--finger-left-index, #22c55e)',
  'right-index': 'var(--finger-right-index, #14b8a6)',
  'right-middle': 'var(--finger-right-middle, #3b82f6)',
  'right-ring': 'var(--finger-right-ring, #8b5cf6)',
  'right-pinky': 'var(--finger-right-pinky, #ec4899)',
}
