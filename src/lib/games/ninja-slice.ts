/**
 * Ninja Slice game logic.
 * Hebrew letters/words fly across the screen. Type them to "slice" before they escape.
 * Pure functions for game state management.
 */

/** Single Hebrew letters (27 including final forms) */
const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
  'ך', 'ם', 'ן', 'ף', 'ץ',
]

/** Short two/three-letter combos for medium difficulty */
const HEBREW_COMBOS = [
  'בא', 'גד', 'הו', 'זח', 'טי', 'כל', 'מנ', 'סע', 'פצ', 'קר', 'שת',
  'לא', 'מה', 'כי', 'אם', 'אל', 'על', 'את', 'הם', 'הן',
]

/** Full words for hard difficulty */
const HARD_WORDS = [
  'שלום', 'בית', 'ילד', 'כלב', 'חתול', 'אבא', 'אמא', 'ספר', 'מים', 'שמש',
  'ירח', 'דג', 'פרח', 'עץ', 'גשם', 'רוח', 'אור', 'חלב', 'לחם', 'גבר',
  'מחשב', 'טלפון', 'מקלדת', 'חלון', 'דלת', 'שולחן', 'כיסא', 'מנורה',
  'תיק', 'עיפרון', 'מחברת', 'לימון', 'תפוח', 'בננה', 'שוקולד', 'ארנב',
]

export type SliceDifficulty = 'easy' | 'medium' | 'hard'
export type Direction = 'right' | 'left' | 'top' | 'bottom'

export interface FlyingTarget {
  /** Unique ID */
  id: string
  /** Hebrew letter or word to type */
  text: string
  /** Horizontal position (0-100%) */
  x: number
  /** Vertical position (0-100%) */
  y: number
  /** Which direction it flies from (and towards the opposite side) */
  direction: Direction
  /** Movement speed in % per tick */
  speed: number
  /** Whether it was typed correctly */
  sliced: boolean
  /** Whether it left the screen without being typed */
  missed: boolean
}

export interface NinjaSliceState {
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
  /** Targets currently flying */
  targets: FlyingTarget[]
  /** Current typing input */
  input: string
  /** Game phase */
  phase: 'ready' | 'playing' | 'gameover'
  /** Total targets sliced */
  targetsSliced: number
  /** Total targets missed */
  targetsMissed: number
  /** Difficulty */
  difficulty: SliceDifficulty
  /** Elapsed time in seconds */
  elapsedSeconds: number
}

/** Game configuration per difficulty */
export const SLICE_DIFFICULTY_CONFIG: Record<SliceDifficulty, {
  label: string
  spawnIntervalMs: number
  baseSpeed: number
  maxTargets: number
  lives: number
}> = {
  easy:   { label: 'קל',    spawnIntervalMs: 2500, baseSpeed: 0.35, maxTargets: 3, lives: 5 },
  medium: { label: 'בינוני', spawnIntervalMs: 1800, baseSpeed: 0.55, maxTargets: 5, lives: 4 },
  hard:   { label: 'קשה',   spawnIntervalMs: 1200, baseSpeed: 0.80, maxTargets: 7, lives: 3 },
}

/** Create initial game state */
export function createNinjaSliceState(difficulty: SliceDifficulty): NinjaSliceState {
  const config = SLICE_DIFFICULTY_CONFIG[difficulty]
  return {
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: config.lives,
    maxLives: config.lives,
    targets: [],
    input: '',
    phase: 'ready',
    targetsSliced: 0,
    targetsMissed: 0,
    difficulty,
    elapsedSeconds: 0,
  }
}

/** Get random Hebrew content based on difficulty */
export function getRandomTarget(difficulty: SliceDifficulty): string {
  if (difficulty === 'easy') {
    return HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)]
  }
  if (difficulty === 'medium') {
    return HEBREW_COMBOS[Math.floor(Math.random() * HEBREW_COMBOS.length)]
  }
  return HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)]
}

let nextId = 0

/** Reset the ID counter (for testing) */
export function resetIdCounter(): void {
  nextId = 0
}

/** Get starting position for a given direction */
function getStartPosition(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case 'right':  return { x: 0,   y: 10 + Math.random() * 80 }
    case 'left':   return { x: 100, y: 10 + Math.random() * 80 }
    case 'top':    return { x: 10 + Math.random() * 80, y: 0   }
    case 'bottom': return { x: 10 + Math.random() * 80, y: 100 }
  }
}

const DIRECTIONS: Direction[] = ['right', 'left', 'top', 'bottom']

/** Spawn a new flying target from a random direction */
export function spawnTarget(state: NinjaSliceState): NinjaSliceState {
  const config = SLICE_DIFFICULTY_CONFIG[state.difficulty]
  if (state.targets.length >= config.maxTargets) return state
  if (state.phase !== 'playing') return state

  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
  const { x, y } = getStartPosition(direction)

  // Speed increases slightly over time
  const speedMultiplier = 1 + state.elapsedSeconds * 0.005
  const text = getRandomTarget(state.difficulty)

  const newTarget: FlyingTarget = {
    id: `t-${nextId++}`,
    text,
    x,
    y,
    direction,
    speed: config.baseSpeed * speedMultiplier,
    sliced: false,
    missed: false,
  }

  return {
    ...state,
    targets: [...state.targets, newTarget],
  }
}

/** Check if a target has left the screen based on its direction */
function hasExitedScreen(target: FlyingTarget): boolean {
  switch (target.direction) {
    case 'right':  return target.x > 110
    case 'left':   return target.x < -10
    case 'top':    return target.y > 110
    case 'bottom': return target.y < -10
  }
}

/** Move a target by one tick */
function moveTarget(target: FlyingTarget): FlyingTarget {
  switch (target.direction) {
    case 'right':  return { ...target, x: target.x + target.speed }
    case 'left':   return { ...target, x: target.x - target.speed }
    case 'top':    return { ...target, y: target.y + target.speed }
    case 'bottom': return { ...target, y: target.y - target.speed }
  }
}

/** Advance the game by one tick (called every ~50ms) */
export function tick(state: NinjaSliceState): NinjaSliceState {
  if (state.phase !== 'playing') return state

  const surviving: FlyingTarget[] = []
  let lostLives = 0

  for (const target of state.targets) {
    const moved = moveTarget(target)
    if (hasExitedScreen(moved)) {
      lostLives++
    } else {
      surviving.push(moved)
    }
  }

  const newLives = state.lives - lostLives
  const newCombo = lostLives > 0 ? 0 : state.combo

  if (newLives <= 0) {
    return {
      ...state,
      targets: surviving,
      lives: 0,
      combo: 0,
      targetsMissed: state.targetsMissed + lostLives,
      phase: 'gameover',
    }
  }

  return {
    ...state,
    targets: surviving,
    lives: newLives,
    combo: newCombo,
    bestCombo: Math.max(state.bestCombo, newCombo),
    targetsMissed: state.targetsMissed + lostLives,
  }
}

/** Process typing input and check for a sliced target */
export function processInput(state: NinjaSliceState, input: string): NinjaSliceState {
  if (state.phase !== 'playing') return state

  // Find first matching target
  const matchIndex = state.targets.findIndex((t) => t.text === input)

  if (matchIndex >= 0) {
    const newCombo = state.combo + 1
    const comboBonus = Math.min(newCombo, 5)
    const points = 10 * comboBonus

    return {
      ...state,
      targets: state.targets.filter((_, i) => i !== matchIndex),
      input: '',
      score: state.score + points,
      combo: newCombo,
      bestCombo: Math.max(state.bestCombo, newCombo),
      targetsSliced: state.targetsSliced + 1,
    }
  }

  return {
    ...state,
    input,
  }
}

/** Calculate final score with bonuses */
export function calculateFinalScore(state: NinjaSliceState): {
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
