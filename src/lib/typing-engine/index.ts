export type {
  KeyDefinition,
  Keystroke,
  SessionStats,
  LessonDefinition,
  LessonContent,
  LessonCategory,
  XpReward,
  TypingSession,
  Finger,
  Hand,
  KeyboardRow,
} from './types'

export {
  calculateWpm,
  calculateAccuracy,
  processKeystroke,
  computeSessionStats,
  findWeakKeys,
  calculateRealtimeWpm,
  isLessonComplete,
  calculateXpReward,
} from './engine'

export {
  TOP_ROW,
  HOME_ROW,
  BOTTOM_ROW,
  SPACE_KEY,
  KEYBOARD_ROWS,
  ALL_KEYS,
  CHAR_TO_KEY,
  CODE_TO_KEY,
  getFingerForChar,
  getKeysForFinger,
  HOME_POSITION,
  FINGER_COLORS,
} from './keyboard-layout'
