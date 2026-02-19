/**
 * Word Rain game logic.
 * Hebrew words fall from the top. Type them before they reach the bottom.
 * Pure functions for game state management.
 */

/** Hebrew words organized by difficulty */
const EASY_WORDS = [
  'שלום', 'בית', 'ילד', 'כלב', 'חתול', 'אבא', 'אמא', 'ספר', 'מים', 'שמש',
  'ירח', 'דג', 'פרח', 'עץ', 'גשם', 'רוח', 'אור', 'חלב', 'לחם', 'גבר',
]

const MEDIUM_WORDS = [
  'מחשב', 'טלפון', 'מקלדת', 'חלון', 'דלת', 'שולחן', 'כיסא', 'מנורה',
  'תיק', 'עיפרון', 'מחברת', 'לימון', 'תפוח', 'בננה', 'שוקולד', 'ארנב',
  'פרפר', 'נמלה', 'ציפור', 'דולפין',
]

const HARD_WORDS = [
  'מקלדת', 'תוכנית', 'מחשבון', 'אינטרנט', 'הקלדה', 'מהירות', 'אפליקציה',
  'תרגול', 'מקצועי', 'אלקטרוני', 'טכנולוגיה', 'תקשורת', 'פרוגרמה',
  'מערכת', 'הפעלה', 'נינג\'ה', 'מקלדת', 'התמודדות', 'אסטרטגיה', 'פלטפורמה',
]

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface FallingWord {
  /** Unique ID */
  id: string
  /** The Hebrew word to type */
  word: string
  /** Horizontal position (0-100%) */
  x: number
  /** Vertical position (0 = top, 100 = bottom) */
  y: number
  /** Fall speed in % per tick */
  speed: number
  /** Whether currently being typed (matches input prefix) */
  active: boolean
}

export interface WordRainState {
  /** Current score */
  score: number
  /** Current combo streak */
  combo: number
  /** Best combo achieved */
  bestCombo: number
  /** Lives remaining */
  lives: number
  /** Max lives */
  maxLives: number
  /** Words currently falling */
  words: FallingWord[]
  /** Current typing input */
  input: string
  /** Game phase */
  phase: 'ready' | 'playing' | 'gameover'
  /** Total words typed correctly */
  wordsTyped: number
  /** Difficulty */
  difficulty: Difficulty
  /** Elapsed time in seconds */
  elapsedSeconds: number
}

/** Game configuration per difficulty */
export const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string
  spawnIntervalMs: number
  baseSpeed: number
  maxWords: number
  lives: number
}> = {
  easy: { label: 'קל', spawnIntervalMs: 2500, baseSpeed: 0.3, maxWords: 4, lives: 5 },
  medium: { label: 'בינוני', spawnIntervalMs: 1800, baseSpeed: 0.5, maxWords: 6, lives: 4 },
  hard: { label: 'קשה', spawnIntervalMs: 1200, baseSpeed: 0.7, maxWords: 8, lives: 3 },
}

/** Create initial game state */
export function createWordRainState(difficulty: Difficulty): WordRainState {
  const config = DIFFICULTY_CONFIG[difficulty]
  return {
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: config.lives,
    maxLives: config.lives,
    words: [],
    input: '',
    phase: 'ready',
    wordsTyped: 0,
    difficulty,
    elapsedSeconds: 0,
  }
}

/** Get a random word for the given difficulty */
export function getRandomWord(difficulty: Difficulty): string {
  const pool =
    difficulty === 'easy' ? EASY_WORDS :
    difficulty === 'medium' ? [...EASY_WORDS, ...MEDIUM_WORDS] :
    [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS]

  return pool[Math.floor(Math.random() * pool.length)]
}

let nextId = 0

/** Spawn a new falling word */
export function spawnWord(state: WordRainState): WordRainState {
  const config = DIFFICULTY_CONFIG[state.difficulty]
  if (state.words.length >= config.maxWords) return state
  if (state.phase !== 'playing') return state

  // Speed increases over time
  const speedMultiplier = 1 + state.elapsedSeconds * 0.005
  const word = getRandomWord(state.difficulty)

  // Avoid spawning on top of existing words (x position)
  const existingXs = state.words.filter(w => w.y < 20).map(w => w.x)
  let x = 10 + Math.random() * 80
  for (let tries = 0; tries < 5; tries++) {
    const tooClose = existingXs.some(ex => Math.abs(ex - x) < 15)
    if (!tooClose) break
    x = 10 + Math.random() * 80
  }

  const newWord: FallingWord = {
    id: `w-${nextId++}`,
    word,
    x,
    y: 0,
    speed: config.baseSpeed * speedMultiplier,
    active: false,
  }

  return {
    ...state,
    words: [...state.words, newWord],
  }
}

/** Reset the ID counter (for testing) */
export function resetIdCounter(): void {
  nextId = 0
}

/** Advance the game by one tick (called every ~50ms) */
export function tick(state: WordRainState): WordRainState {
  if (state.phase !== 'playing') return state

  const surviving: FallingWord[] = []
  let lostLives = 0

  for (const w of state.words) {
    const newY = w.y + w.speed
    if (newY >= 100) {
      lostLives++
    } else {
      surviving.push({ ...w, y: newY })
    }
  }

  const newLives = state.lives - lostLives
  const newCombo = lostLives > 0 ? 0 : state.combo

  if (newLives <= 0) {
    return {
      ...state,
      words: surviving,
      lives: 0,
      combo: 0,
      phase: 'gameover',
    }
  }

  return {
    ...state,
    words: surviving,
    lives: newLives,
    combo: newCombo,
    bestCombo: Math.max(state.bestCombo, newCombo),
  }
}

/** Process typing input and check for completed words */
export function processInput(state: WordRainState, input: string): WordRainState {
  if (state.phase !== 'playing') return state

  // Find matching word
  const matchIndex = state.words.findIndex((w) => w.word === input)

  if (matchIndex >= 0) {
    // Word completed!
    const newCombo = state.combo + 1
    const comboBonus = Math.min(newCombo, 5)
    const points = 10 * comboBonus

    return {
      ...state,
      words: state.words.filter((_, i) => i !== matchIndex),
      input: '',
      score: state.score + points,
      combo: newCombo,
      bestCombo: Math.max(state.bestCombo, newCombo),
      wordsTyped: state.wordsTyped + 1,
    }
  }

  // Mark words that start with the current input as active
  const updatedWords = state.words.map((w) => ({
    ...w,
    active: input.length > 0 && w.word.startsWith(input),
  }))

  return {
    ...state,
    words: updatedWords,
    input,
  }
}

/** Calculate final score with bonuses */
export function calculateFinalScore(state: WordRainState): {
  baseScore: number
  comboBonus: number
  livesBonus: number
  totalScore: number
} {
  const baseScore = state.score
  const comboBonus = state.bestCombo * 5
  const livesBonus = state.lives * 20
  return {
    baseScore,
    comboBonus,
    livesBonus,
    totalScore: baseScore + comboBonus + livesBonus,
  }
}

/** Get XP reward based on score */
export function getXpReward(totalScore: number): number {
  if (totalScore >= 500) return 50
  if (totalScore >= 300) return 35
  if (totalScore >= 150) return 25
  if (totalScore >= 50) return 15
  return 10
}
