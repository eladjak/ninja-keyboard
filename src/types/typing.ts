/** Physical key code from keyboard events (e.g., 'KeyQ', 'KeyW') */
export type KeyCode = string

/** A single key on the Hebrew keyboard layout */
export interface KeyDefinition {
  /** Physical key code (KeyboardEvent.code) */
  code: KeyCode
  /** Hebrew character produced */
  hebrew: string
  /** English label (for reference) */
  english: string
  /** Row index: 0=number, 1=top, 2=home, 3=bottom */
  row: 0 | 1 | 2 | 3
  /** Column position within the row */
  col: number
  /** Width multiplier (1 = standard key) */
  width?: number
  /** Whether this is a finger home position */
  isHome?: boolean
  /** Which finger types this key (0=pinky ... 4=thumb, mirrored for each hand) */
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'left-thumb'
    | 'right-thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky'
}

/** State of a key during typing practice */
export type KeyState = 'idle' | 'active' | 'correct' | 'incorrect' | 'hint'

/** A single keystroke event during practice */
export interface KeystrokeEvent {
  /** Expected character */
  expected: string
  /** Actually typed character */
  actual: string
  /** Whether it was correct */
  correct: boolean
  /** Timestamp in ms */
  timestamp: number
}

/** Real-time metrics during a typing session */
export interface TypingMetrics {
  /** Words per minute */
  wpm: number
  /** Accuracy percentage (0-100) */
  accuracy: number
  /** Total characters typed */
  totalChars: number
  /** Correct characters typed */
  correctChars: number
  /** Elapsed time in milliseconds */
  elapsedMs: number
  /** Current streak of correct characters */
  currentStreak: number
  /** Best streak of correct characters in this session */
  bestStreak: number
}

/** A typing lesson definition */
export interface Lesson {
  /** Unique lesson identifier */
  id: string
  /** Lesson number (display order) */
  number: number
  /** Hebrew title */
  title: string
  /** Hebrew description */
  description: string
  /** Characters this lesson focuses on */
  focusKeys: string[]
  /** The text content to type (array of exercises) */
  exercises: LessonExercise[]
  /** Minimum WPM to pass */
  passWpm: number
  /** Minimum accuracy to pass (0-100) */
  passAccuracy: number
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/** A single exercise within a lesson */
export interface LessonExercise {
  /** Exercise ID */
  id: string
  /** Hebrew label */
  label: string
  /** The text to type */
  text: string
}

/** Result of a completed typing session */
export interface PracticeResult {
  /** Lesson ID */
  lessonId: string
  /** Exercise ID */
  exerciseId: string
  /** Final WPM */
  wpm: number
  /** Final accuracy (0-100) */
  accuracy: number
  /** Total time in milliseconds */
  totalTimeMs: number
  /** Total characters */
  totalChars: number
  /** Correct characters */
  correctChars: number
  /** Best streak */
  bestStreak: number
  /** Whether the student passed */
  passed: boolean
  /** Timestamp of completion */
  completedAt: number
  /** All keystroke events for analysis */
  keystrokes: KeystrokeEvent[]
}

/** Current state of the typing practice session */
export type PracticeStatus = 'idle' | 'ready' | 'typing' | 'paused' | 'completed'
