import { describe, it, expect } from 'vitest'
import {
  createLetterMemoryState,
  shuffleCards,
  revealCard,
  checkMatch,
  processInput,
  calculateFinalScore,
  getXpReward,
  MEMORY_DIFFICULTY_CONFIG,
} from '@/lib/games/letter-memory'
import type { LetterMemoryState, MemoryCard } from '@/lib/games/letter-memory'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlaying(difficulty: Parameters<typeof createLetterMemoryState>[0] = 'easy'): LetterMemoryState {
  return { ...createLetterMemoryState(difficulty), phase: 'playing' }
}

/** Build a minimal card for testing */
function makeCard(overrides: Partial<MemoryCard> & { position: number; letter: string }): MemoryCard {
  return {
    id: `test-${overrides.position}`,
    revealed: false,
    matched: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// createLetterMemoryState
// ---------------------------------------------------------------------------

describe('createLetterMemoryState', () => {
  it('creates correct number of cards for easy (4 pairs = 8 cards)', () => {
    const state = createLetterMemoryState('easy')
    expect(state.cards).toHaveLength(8)
  })

  it('creates correct number of cards for medium (6 pairs = 12 cards)', () => {
    const state = createLetterMemoryState('medium')
    expect(state.cards).toHaveLength(12)
  })

  it('creates correct number of cards for hard (8 pairs = 16 cards)', () => {
    const state = createLetterMemoryState('hard')
    expect(state.cards).toHaveLength(16)
  })

  it('all cards start hidden and unmatched', () => {
    const state = createLetterMemoryState('easy')
    for (const card of state.cards) {
      expect(card.revealed).toBe(false)
      expect(card.matched).toBe(false)
    }
  })

  it('cards contain pairs – each letter appears exactly twice', () => {
    const state = createLetterMemoryState('easy')
    const counts: Record<string, number> = {}
    for (const card of state.cards) {
      counts[card.letter] = (counts[card.letter] ?? 0) + 1
    }
    for (const count of Object.values(counts)) {
      expect(count).toBe(2)
    }
  })

  it('starts in ready phase with 0 moves and 0 matches', () => {
    const state = createLetterMemoryState('easy')
    expect(state.phase).toBe('ready')
    expect(state.moves).toBe(0)
    expect(state.matches).toBe(0)
    expect(state.score).toBe(0)
    expect(state.combo).toBe(0)
    expect(state.firstPick).toBeNull()
    expect(state.secondPick).toBeNull()
  })

  it('sets totalPairs to the correct number for the difficulty', () => {
    expect(createLetterMemoryState('easy').totalPairs).toBe(4)
    expect(createLetterMemoryState('medium').totalPairs).toBe(6)
    expect(createLetterMemoryState('hard').totalPairs).toBe(8)
  })

  it('positions are 0-based sequential indices', () => {
    const state = createLetterMemoryState('easy')
    const positions = state.cards.map((c) => c.position).sort((a, b) => a - b)
    expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})

// ---------------------------------------------------------------------------
// shuffleCards
// ---------------------------------------------------------------------------

describe('shuffleCards', () => {
  const original: MemoryCard[] = [
    makeCard({ position: 0, letter: 'א' }),
    makeCard({ position: 1, letter: 'ב' }),
    makeCard({ position: 2, letter: 'ג' }),
    makeCard({ position: 3, letter: 'ד' }),
  ]

  it('returns same number of cards', () => {
    expect(shuffleCards(original)).toHaveLength(original.length)
  })

  it('contains all original cards', () => {
    const shuffled = shuffleCards(original)
    for (const card of original) {
      expect(shuffled.some((c) => c.id === card.id)).toBe(true)
    }
  })

  it('does not mutate the original array', () => {
    const copy = [...original]
    shuffleCards(original)
    expect(original).toEqual(copy)
  })

  it('changes order over many shuffles (probabilistic)', () => {
    // Very unlikely all 100 shuffles preserve the original order
    const allSame = Array.from({ length: 100 }).every(() => {
      const shuffled = shuffleCards(original)
      return shuffled.every((c, i) => c.id === original[i].id)
    })
    expect(allSame).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// revealCard
// ---------------------------------------------------------------------------

describe('revealCard', () => {
  it('reveals the first card and sets firstPick', () => {
    const state = makePlaying()
    const pos = state.cards[0].position
    const next = revealCard(state, pos)
    expect(next.firstPick).toBe(pos)
    expect(next.cards.find((c) => c.position === pos)?.revealed).toBe(true)
  })

  it('sets secondPick and transitions to checking on second reveal', () => {
    const state = makePlaying()
    const [pos0, pos1] = [state.cards[0].position, state.cards[1].position]
    const after1 = revealCard(state, pos0)
    const after2 = revealCard(after1, pos1)
    expect(after2.secondPick).toBe(pos1)
    expect(after2.phase).toBe('checking')
  })

  it('does not reveal an already matched card', () => {
    const base = makePlaying()
    const matched = base.cards.map((c, i) =>
      i === 0 ? { ...c, matched: true } : c,
    )
    const state: LetterMemoryState = { ...base, cards: matched }
    const pos = matched[0].position
    const next = revealCard(state, pos)
    expect(next.firstPick).toBeNull()
  })

  it('does not reveal the same card as firstPick again', () => {
    const state = makePlaying()
    const pos = state.cards[0].position
    const after1 = revealCard(state, pos)
    const after2 = revealCard(after1, pos)
    expect(after2.secondPick).toBeNull()
    expect(after2.phase).toBe('playing')
  })

  it('ignores reveal during checking phase', () => {
    const base = makePlaying()
    const [pos0, pos1, pos2] = [
      base.cards[0].position,
      base.cards[1].position,
      base.cards[2].position,
    ]
    const checking = revealCard(revealCard(base, pos0), pos1)
    expect(checking.phase).toBe('checking')
    const next = revealCard(checking, pos2)
    expect(next.secondPick).toBe(pos1) // unchanged
  })

  it('ignores reveal in ready phase', () => {
    const state = createLetterMemoryState('easy')
    const pos = state.cards[0].position
    const next = revealCard(state, pos)
    expect(next).toBe(state) // reference equality
  })
})

// ---------------------------------------------------------------------------
// checkMatch
// ---------------------------------------------------------------------------

describe('checkMatch', () => {
  /** Find two cards with the same letter */
  function getPair(state: LetterMemoryState): [number, number] {
    const seen: Record<string, number> = {}
    for (const card of state.cards) {
      if (seen[card.letter] !== undefined) {
        return [seen[card.letter], card.position]
      }
      seen[card.letter] = card.position
    }
    throw new Error('No pair found')
  }

  /** Find two cards with different letters */
  function getMismatch(state: LetterMemoryState): [number, number] {
    const [p0, p1] = getPair(state)
    // Find a card that is not part of this pair
    const firstLetter = state.cards.find((c) => c.position === p0)!.letter
    const other = state.cards.find((c) => c.letter !== firstLetter)!
    return [p0, other.position]
  }

  it('marks matching cards as matched', () => {
    const base = makePlaying()
    const [p0, p1] = getPair(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    const next = checkMatch(checking)
    expect(next.cards.find((c) => c.position === p0)?.matched).toBe(true)
    expect(next.cards.find((c) => c.position === p1)?.matched).toBe(true)
  })

  it('increments matches count on match', () => {
    const base = makePlaying()
    const [p0, p1] = getPair(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    expect(checkMatch(checking).matches).toBe(1)
  })

  it('increments combo on match', () => {
    const base = makePlaying()
    const [p0, p1] = getPair(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    expect(checkMatch(checking).combo).toBe(1)
  })

  it('resets combo on mismatch', () => {
    const base: LetterMemoryState = { ...makePlaying(), combo: 3 }
    const [p0, p1] = getMismatch(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    expect(checkMatch(checking).combo).toBe(0)
  })

  it('hides non-matching cards after mismatch', () => {
    const base = makePlaying()
    const [p0, p1] = getMismatch(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    const next = checkMatch(checking)
    expect(next.cards.find((c) => c.position === p0)?.revealed).toBe(false)
    expect(next.cards.find((c) => c.position === p1)?.revealed).toBe(false)
  })

  it('transitions to complete when all pairs are matched', () => {
    // Build a state with only one pair remaining
    const base = makePlaying('easy')
    const [p0, p1] = getPair(base)
    const prematched = base.cards.map((c) =>
      c.position === p0 || c.position === p1 ? c : { ...c, matched: true },
    )
    const checking: LetterMemoryState = {
      ...base,
      cards: prematched.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      matches: base.totalPairs - 1, // one short of total
    }
    expect(checkMatch(checking).phase).toBe('complete')
  })

  it('increments moves count on each checkMatch call', () => {
    const base = makePlaying()
    const [p0, p1] = getPair(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    expect(checkMatch(checking).moves).toBe(1)
  })

  it('clears firstPick and secondPick after check', () => {
    const base = makePlaying()
    const [p0, p1] = getPair(base)
    const checking: LetterMemoryState = {
      ...base,
      phase: 'checking',
      firstPick: p0,
      secondPick: p1,
      cards: base.cards.map((c) =>
        c.position === p0 || c.position === p1 ? { ...c, revealed: true } : c,
      ),
    }
    const next = checkMatch(checking)
    expect(next.firstPick).toBeNull()
    expect(next.secondPick).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// processInput
// ---------------------------------------------------------------------------

describe('processInput', () => {
  it('reveals first unrevealed card matching the typed letter', () => {
    const state = makePlaying('easy')
    const targetLetter = state.cards[0].letter
    const next = processInput(state, targetLetter)
    // At least one card with that letter is now revealed
    const revealedWithLetter = next.cards.filter(
      (c) => c.letter === targetLetter && c.revealed,
    )
    expect(revealedWithLetter.length).toBeGreaterThanOrEqual(1)
  })

  it('does not reveal already matched cards', () => {
    const base = makePlaying('easy')
    const targetLetter = base.cards[0].letter
    // Mark all cards with targetLetter as matched
    const cards = base.cards.map((c) =>
      c.letter === targetLetter ? { ...c, matched: true } : c,
    )
    const state: LetterMemoryState = { ...base, cards }
    const next = processInput(state, targetLetter)
    // No new reveals
    const newlyRevealed = next.cards.filter(
      (c) => c.letter === targetLetter && c.revealed && !c.matched,
    )
    expect(newlyRevealed.length).toBe(0)
  })

  it('clears input after processing', () => {
    const state = makePlaying('easy')
    const letter = state.cards[0].letter
    const next = processInput(state, letter)
    expect(next.input).toBe('')
  })

  it('clears input even when no matching unrevealed card exists', () => {
    const base = makePlaying('easy')
    const letter = base.cards[0].letter
    const cards = base.cards.map((c) =>
      c.letter === letter ? { ...c, matched: true } : c,
    )
    const state: LetterMemoryState = { ...base, cards }
    const next = processInput(state, letter)
    expect(next.input).toBe('')
  })

  it('ignores input during ready phase', () => {
    const state = createLetterMemoryState('easy')
    const letter = state.cards[0].letter
    const next = processInput(state, letter)
    // No card revealed
    expect(next.cards.every((c) => !c.revealed)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// calculateFinalScore
// ---------------------------------------------------------------------------

describe('calculateFinalScore', () => {
  it('gives higher efficiency score for fewer moves', () => {
    const base: LetterMemoryState = { ...makePlaying(), totalPairs: 4, elapsedSeconds: 0, bestCombo: 0 }
    const fewMoves = calculateFinalScore({ ...base, moves: 4 })
    const manyMoves = calculateFinalScore({ ...base, moves: 20 })
    expect(fewMoves.efficiencyScore).toBeGreaterThan(manyMoves.efficiencyScore)
  })

  it('includes combo bonus', () => {
    const base: LetterMemoryState = { ...makePlaying(), totalPairs: 4, elapsedSeconds: 0, moves: 4 }
    const noCombo = calculateFinalScore({ ...base, bestCombo: 0 })
    const withCombo = calculateFinalScore({ ...base, bestCombo: 5 })
    expect(withCombo.comboBonus).toBeGreaterThan(noCombo.comboBonus)
    expect(withCombo.totalScore).toBeGreaterThan(noCombo.totalScore)
  })

  it('includes time bonus that decreases with elapsed time', () => {
    const base: LetterMemoryState = { ...makePlaying(), totalPairs: 4, moves: 4, bestCombo: 0 }
    const fast = calculateFinalScore({ ...base, elapsedSeconds: 10 })
    const slow = calculateFinalScore({ ...base, elapsedSeconds: 200 })
    expect(fast.timeBonus).toBeGreaterThan(slow.timeBonus)
  })

  it('time bonus is 0 when elapsed >= 300', () => {
    const base: LetterMemoryState = { ...makePlaying(), totalPairs: 4, moves: 4, bestCombo: 0 }
    const result = calculateFinalScore({ ...base, elapsedSeconds: 300 })
    expect(result.timeBonus).toBe(0)
  })

  it('totalScore is sum of all components', () => {
    const base: LetterMemoryState = { ...makePlaying(), totalPairs: 4, moves: 4, bestCombo: 2, elapsedSeconds: 50 }
    const result = calculateFinalScore(base)
    expect(result.totalScore).toBe(result.efficiencyScore + result.comboBonus + result.timeBonus)
  })
})

// ---------------------------------------------------------------------------
// getXpReward
// ---------------------------------------------------------------------------

describe('getXpReward', () => {
  it('returns 50 for scores >= 1000', () => {
    expect(getXpReward(1000)).toBe(50)
    expect(getXpReward(2000)).toBe(50)
  })

  it('returns 35 for scores >= 700', () => {
    expect(getXpReward(700)).toBe(35)
    expect(getXpReward(999)).toBe(35)
  })

  it('returns 25 for scores >= 400', () => {
    expect(getXpReward(400)).toBe(25)
    expect(getXpReward(699)).toBe(25)
  })

  it('returns 15 for scores >= 200', () => {
    expect(getXpReward(200)).toBe(15)
    expect(getXpReward(399)).toBe(15)
  })

  it('returns 10 for low scores', () => {
    expect(getXpReward(0)).toBe(10)
    expect(getXpReward(199)).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// MEMORY_DIFFICULTY_CONFIG
// ---------------------------------------------------------------------------

describe('MEMORY_DIFFICULTY_CONFIG', () => {
  it('has all three difficulties', () => {
    expect(MEMORY_DIFFICULTY_CONFIG.easy).toBeDefined()
    expect(MEMORY_DIFFICULTY_CONFIG.medium).toBeDefined()
    expect(MEMORY_DIFFICULTY_CONFIG.hard).toBeDefined()
  })

  it('has Hebrew labels', () => {
    expect(MEMORY_DIFFICULTY_CONFIG.easy.label).toBe('קל')
    expect(MEMORY_DIFFICULTY_CONFIG.medium.label).toBe('בינוני')
    expect(MEMORY_DIFFICULTY_CONFIG.hard.label).toBe('קשה')
  })

  it('each difficulty has correct pair count', () => {
    expect(MEMORY_DIFFICULTY_CONFIG.easy.pairs).toBe(4)
    expect(MEMORY_DIFFICULTY_CONFIG.medium.pairs).toBe(6)
    expect(MEMORY_DIFFICULTY_CONFIG.hard.pairs).toBe(8)
  })

  it('each difficulty supplies enough letters for its pairs', () => {
    for (const [, config] of Object.entries(MEMORY_DIFFICULTY_CONFIG)) {
      expect(config.letters.length).toBeGreaterThanOrEqual(config.pairs)
    }
  })
})
