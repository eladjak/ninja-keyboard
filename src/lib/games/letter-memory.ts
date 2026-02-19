/**
 * Letter Memory game logic.
 * Hebrew letter pairs are hidden on a grid.
 * Type a letter to reveal it, find its match.
 * Pure functions for game state management.
 */

export type MemoryDifficulty = 'easy' | 'medium' | 'hard'

export interface MemoryCard {
  /** Unique ID for this card */
  id: string
  /** Hebrew letter on the card */
  letter: string
  /** Grid position (0-based) */
  position: number
  /** Currently face-up */
  revealed: boolean
  /** Successfully matched */
  matched: boolean
}

export interface LetterMemoryState {
  cards: MemoryCard[]
  /** Position of first revealed card (null if none) */
  firstPick: number | null
  /** Position of second revealed card (null if none) */
  secondPick: number | null
  /** Total attempts (each pair check = 1 move) */
  moves: number
  /** Successful matches found */
  matches: number
  /** Total pairs to match */
  totalPairs: number
  /** Game phase */
  phase: 'ready' | 'playing' | 'checking' | 'complete'
  /** Current score */
  score: number
  /** Consecutive correct matches */
  combo: number
  /** Best combo achieved */
  bestCombo: number
  /** Selected difficulty */
  difficulty: MemoryDifficulty
  /** Elapsed time in seconds */
  elapsedSeconds: number
  /** Current typing input */
  input: string
}

/** Difficulty configuration */
export const MEMORY_DIFFICULTY_CONFIG: Record<MemoryDifficulty, {
  label: string
  pairs: number
  gridCols: number
  gridRows: number
  letters: string[]
  description: string
}> = {
  easy: {
    label: 'קל',
    pairs: 4,
    gridCols: 4,
    gridRows: 2,
    letters: ['א', 'ב', 'ג', 'ד'],
    description: '4 זוגות, אותיות קלות',
  },
  medium: {
    label: 'בינוני',
    pairs: 6,
    gridCols: 4,
    gridRows: 3,
    letters: ['א', 'ב', 'ג', 'ד', 'ה', 'ו'],
    description: '6 זוגות, יותר אותיות',
  },
  hard: {
    label: 'קשה',
    pairs: 8,
    gridCols: 4,
    gridRows: 4,
    letters: ['ב', 'כ', 'ח', 'ה', 'ד', 'ר', 'ו', 'ז'],
    description: '8 זוגות, אותיות דומות',
  },
}

/**
 * Fisher-Yates shuffle.
 * Accepts an optional seed array for deterministic testing.
 */
export function shuffleCards(cards: MemoryCard[], randoms?: number[]): MemoryCard[] {
  const arr = [...cards]
  let ri = 0
  for (let i = arr.length - 1; i > 0; i--) {
    const rand = randoms !== undefined ? randoms[ri++] ?? Math.random() : Math.random()
    const j = Math.floor(rand * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

/** Create initial game state */
export function createLetterMemoryState(difficulty: MemoryDifficulty): LetterMemoryState {
  const config = MEMORY_DIFFICULTY_CONFIG[difficulty]
  const letters = config.letters.slice(0, config.pairs)

  // Create two cards per letter
  const unshuffled: MemoryCard[] = []
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    unshuffled.push({
      id: `card-${i * 2}`,
      letter,
      position: i * 2,
      revealed: false,
      matched: false,
    })
    unshuffled.push({
      id: `card-${i * 2 + 1}`,
      letter,
      position: i * 2 + 1,
      revealed: false,
      matched: false,
    })
  }

  // Shuffle and reassign positions based on new order
  const shuffled = shuffleCards(unshuffled)
  const cards: MemoryCard[] = shuffled.map((card, index) => ({
    ...card,
    position: index,
  }))

  return {
    cards,
    firstPick: null,
    secondPick: null,
    moves: 0,
    matches: 0,
    totalPairs: config.pairs,
    phase: 'ready',
    score: 0,
    combo: 0,
    bestCombo: 0,
    difficulty,
    elapsedSeconds: 0,
    input: '',
  }
}

/**
 * Reveal a card at the given position.
 * - If phase is 'checking', ignore the action.
 * - If no card is revealed yet: set firstPick.
 * - If one card is already revealed: set secondPick and move to 'checking'.
 * - Already matched or already the firstPick card: ignore.
 */
export function revealCard(state: LetterMemoryState, position: number): LetterMemoryState {
  if (state.phase === 'checking' || state.phase === 'complete' || state.phase === 'ready') {
    return state
  }

  const card = state.cards.find((c) => c.position === position)
  if (!card || card.matched || card.revealed) return state

  // Same card as firstPick: ignore
  if (state.firstPick === position) return state

  if (state.firstPick === null) {
    // First pick
    const cards = state.cards.map((c) =>
      c.position === position ? { ...c, revealed: true } : c,
    )
    return { ...state, cards, firstPick: position }
  }

  // Second pick
  const cards = state.cards.map((c) =>
    c.position === position ? { ...c, revealed: true } : c,
  )
  return { ...state, cards, secondPick: position, phase: 'checking' }
}

/**
 * Check whether the two revealed cards match.
 * Must be called after phase transitions to 'checking'.
 * - Match: mark matched, update score/combo, clear picks, resume or complete.
 * - No match: hide both cards, reset combo, clear picks, resume playing.
 * Increments moves in both cases.
 */
export function checkMatch(state: LetterMemoryState): LetterMemoryState {
  if (state.phase !== 'checking') return state
  if (state.firstPick === null || state.secondPick === null) return state

  const first = state.cards.find((c) => c.position === state.firstPick)
  const second = state.cards.find((c) => c.position === state.secondPick)

  if (!first || !second) return state

  const moves = state.moves + 1
  const isMatch = first.letter === second.letter

  if (isMatch) {
    const newCombo = state.combo + 1
    const comboMultiplier = Math.min(newCombo, 4)
    const pointsEarned = 100 * comboMultiplier
    const newMatches = state.matches + 1
    const newBestCombo = Math.max(state.bestCombo, newCombo)

    const cards = state.cards.map((c) =>
      c.position === state.firstPick || c.position === state.secondPick
        ? { ...c, matched: true, revealed: true }
        : c,
    )

    const allMatched = newMatches >= state.totalPairs

    return {
      ...state,
      cards,
      firstPick: null,
      secondPick: null,
      moves,
      matches: newMatches,
      score: state.score + pointsEarned,
      combo: newCombo,
      bestCombo: newBestCombo,
      phase: allMatched ? 'complete' : 'playing',
    }
  }

  // No match: hide both cards
  const cards = state.cards.map((c) =>
    c.position === state.firstPick || c.position === state.secondPick
      ? { ...c, revealed: false }
      : c,
  )

  return {
    ...state,
    cards,
    firstPick: null,
    secondPick: null,
    moves,
    combo: 0,
    phase: 'playing',
  }
}

/**
 * Process typed input.
 * Finds the first unrevealed, unmatched card whose letter equals the input
 * and reveals it via revealCard logic.
 * Clears input after processing regardless of match.
 */
export function processInput(state: LetterMemoryState, input: string): LetterMemoryState {
  if (state.phase !== 'playing' && state.phase !== 'checking') {
    return { ...state, input }
  }

  const trimmed = input.trim()
  if (!trimmed) return { ...state, input }

  // Find first unrevealed, unmatched card with this letter
  const target = state.cards.find(
    (c) => c.letter === trimmed && !c.revealed && !c.matched,
  )

  if (!target) {
    // No matching unrevealed card – clear input
    return { ...state, input: '' }
  }

  const revealed = revealCard(state, target.position)
  return { ...revealed, input: '' }
}

/** Calculate final score with bonuses */
export function calculateFinalScore(state: LetterMemoryState): {
  efficiencyScore: number
  comboBonus: number
  timeBonus: number
  totalScore: number
} {
  const safeMoves = Math.max(state.moves, 1)
  const efficiencyScore = Math.round((state.totalPairs / safeMoves) * 1000)
  const comboBonus = state.bestCombo * 50
  const timeBonus = Math.max(0, 300 - state.elapsedSeconds) * 2

  return {
    efficiencyScore,
    comboBonus,
    timeBonus,
    totalScore: efficiencyScore + comboBonus + timeBonus,
  }
}

/** Get XP reward based on total score */
export function getXpReward(totalScore: number): number {
  if (totalScore >= 1000) return 50
  if (totalScore >= 700) return 35
  if (totalScore >= 400) return 25
  if (totalScore >= 200) return 15
  return 10
}
