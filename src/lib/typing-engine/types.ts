/** Typing engine types for Ninja Keyboard */

export type Finger = 'pinky' | 'ring' | 'middle' | 'index'
export type Hand = 'left' | 'right'
export type KeyboardRow = 'top' | 'home' | 'bottom' | 'space'

export interface KeyDefinition {
  /** Hebrew character displayed on the key */
  char: string
  /** Physical key code (e.g. 'KeyA', 'KeyS') */
  code: string
  /** Which row on the keyboard */
  row: KeyboardRow
  /** Which finger should press this key */
  finger: Finger
  /** Which hand */
  hand: Hand
  /** Display label for English reference (e.g. 'A', 'S') */
  enLabel: string
  /** Width multiplier (1 = normal, 1.5 = wide, etc.) */
  width?: number
}

export interface Keystroke {
  /** Character that was expected */
  expected: string
  /** Character that was actually typed */
  actual: string
  /** Timestamp in ms (performance.now) */
  timestamp: number
  /** Whether the keystroke was correct */
  isCorrect: boolean
  /** Physical key code that was pressed */
  code: string
}

export interface SessionStats {
  /** Words per minute */
  wpm: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total keystrokes in session */
  totalKeystrokes: number
  /** Correct keystrokes */
  correctKeystrokes: number
  /** Error keystrokes */
  errorKeystrokes: number
  /** Duration in milliseconds */
  durationMs: number
  /** Per-key accuracy map: char -> { correct, total } */
  keyAccuracy: Record<string, { correct: number; total: number }>
}

export interface LessonDefinition {
  /** Unique lesson identifier */
  id: string
  /** Lesson number (1-20) */
  level: number
  /** Hebrew title */
  titleHe: string
  /** English title */
  titleEn: string
  /** Hebrew description */
  descriptionHe: string
  /** Keys targeted in this lesson */
  targetKeys: string[]
  /** New keys introduced in this lesson */
  newKeys: string[]
  /** Target WPM for completion */
  targetWpm: number
  /** Target accuracy for completion (0-100) */
  targetAccuracy: number
  /** Category tag */
  category: LessonCategory
}

export type LessonCategory =
  | 'home-row'
  | 'top-row'
  | 'bottom-row'
  | 'full-keyboard'
  | 'words'
  | 'sentences'
  | 'speed'
  | 'master'

export interface LessonContent {
  /** Lesson ID */
  lessonId: string
  /** Practice lines for this lesson */
  lines: string[]
}

export interface XpReward {
  /** Base XP for completing a lesson */
  base: number
  /** Bonus XP for accuracy above target */
  accuracyBonus: number
  /** Bonus XP for WPM above target */
  speedBonus: number
  /** Streak multiplier */
  streakMultiplier: number
  /** Total XP earned */
  total: number
}

export interface TypingSession {
  /** Current text to type */
  text: string
  /** Current character index in the text */
  currentIndex: number
  /** All keystrokes recorded */
  keystrokes: Keystroke[]
  /** When the session started (performance.now) */
  startedAt: number | null
  /** Whether the session is active */
  isActive: boolean
  /** Whether paused */
  isPaused: boolean
  /** Lesson being practiced */
  lessonId: string | null
  /** Current line index within the lesson */
  currentLine: number
}
