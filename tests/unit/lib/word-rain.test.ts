import { describe, it, expect, beforeEach } from 'vitest'
import {
  createWordRainState,
  spawnWord,
  tick,
  processInput,
  calculateFinalScore,
  getXpReward,
  getRandomWord,
  resetIdCounter,
  DIFFICULTY_CONFIG,
} from '@/lib/games/word-rain'
import type { WordRainState, Difficulty } from '@/lib/games/word-rain'

describe('createWordRainState', () => {
  it('creates initial state for easy difficulty', () => {
    const state = createWordRainState('easy')

    expect(state.score).toBe(0)
    expect(state.combo).toBe(0)
    expect(state.lives).toBe(5)
    expect(state.maxLives).toBe(5)
    expect(state.words).toHaveLength(0)
    expect(state.input).toBe('')
    expect(state.phase).toBe('ready')
    expect(state.difficulty).toBe('easy')
  })

  it('creates state with correct lives per difficulty', () => {
    expect(createWordRainState('easy').lives).toBe(5)
    expect(createWordRainState('medium').lives).toBe(4)
    expect(createWordRainState('hard').lives).toBe(3)
  })
})

describe('getRandomWord', () => {
  it('returns a string', () => {
    const word = getRandomWord('easy')
    expect(typeof word).toBe('string')
    expect(word.length).toBeGreaterThan(0)
  })

  it('returns different words over multiple calls', () => {
    const words = new Set(Array.from({ length: 20 }, () => getRandomWord('easy')))
    expect(words.size).toBeGreaterThan(1)
  })
})

describe('spawnWord', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('adds a new falling word', () => {
    const state: WordRainState = { ...createWordRainState('easy'), phase: 'playing' }
    const newState = spawnWord(state)

    expect(newState.words).toHaveLength(1)
    expect(newState.words[0].y).toBe(0)
    expect(newState.words[0].word.length).toBeGreaterThan(0)
  })

  it('does not spawn when at max words', () => {
    const words = Array.from({ length: DIFFICULTY_CONFIG.easy.maxWords }, (_, i) => ({
      id: `w-${i}`,
      word: 'test',
      x: 50,
      y: 50,
      speed: 0.3,
      active: false,
    }))
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words,
    }

    const newState = spawnWord(state)
    expect(newState.words).toHaveLength(DIFFICULTY_CONFIG.easy.maxWords)
  })

  it('does not spawn when not playing', () => {
    const state = createWordRainState('easy') // phase = 'ready'
    const newState = spawnWord(state)
    expect(newState.words).toHaveLength(0)
  })

  it('assigns x between 10 and 90', () => {
    const state: WordRainState = { ...createWordRainState('easy'), phase: 'playing' }
    const newState = spawnWord(state)

    expect(newState.words[0].x).toBeGreaterThanOrEqual(10)
    expect(newState.words[0].x).toBeLessThanOrEqual(90)
  })
})

describe('tick', () => {
  it('moves words down', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words: [{ id: 'w-0', word: 'test', x: 50, y: 10, speed: 5, active: false }],
    }

    const newState = tick(state)
    expect(newState.words[0].y).toBe(15)
  })

  it('removes words that reach bottom and decrements lives', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words: [{ id: 'w-0', word: 'test', x: 50, y: 98, speed: 5, active: false }],
    }

    const newState = tick(state)
    expect(newState.words).toHaveLength(0)
    expect(newState.lives).toBe(4)
  })

  it('sets gameover when lives reach 0', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      lives: 1,
      words: [{ id: 'w-0', word: 'test', x: 50, y: 98, speed: 5, active: false }],
    }

    const newState = tick(state)
    expect(newState.phase).toBe('gameover')
    expect(newState.lives).toBe(0)
  })

  it('resets combo when word is missed', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      combo: 5,
      words: [{ id: 'w-0', word: 'test', x: 50, y: 98, speed: 5, active: false }],
    }

    const newState = tick(state)
    expect(newState.combo).toBe(0)
  })

  it('does nothing when not playing', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      words: [{ id: 'w-0', word: 'test', x: 50, y: 10, speed: 5, active: false }],
    }

    const newState = tick(state)
    expect(newState.words[0].y).toBe(10) // Unchanged
  })
})

describe('processInput', () => {
  it('removes word when input matches', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words: [{ id: 'w-0', word: 'שלום', x: 50, y: 50, speed: 0.3, active: false }],
    }

    const newState = processInput(state, 'שלום')
    expect(newState.words).toHaveLength(0)
    expect(newState.input).toBe('')
    expect(newState.wordsTyped).toBe(1)
  })

  it('increases score and combo on match', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      combo: 2,
      words: [{ id: 'w-0', word: 'בית', x: 50, y: 50, speed: 0.3, active: false }],
    }

    const newState = processInput(state, 'בית')
    expect(newState.combo).toBe(3)
    expect(newState.score).toBeGreaterThan(0)
  })

  it('applies combo bonus to score', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      combo: 4, // Next will be 5 -> 5x bonus
      words: [{ id: 'w-0', word: 'בית', x: 50, y: 50, speed: 0.3, active: false }],
    }

    const newState = processInput(state, 'בית')
    // combo becomes 5, capped at 5, so points = 10 * 5 = 50
    expect(newState.score).toBe(50)
  })

  it('marks words as active when input is a prefix', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words: [
        { id: 'w-0', word: 'שלום', x: 50, y: 50, speed: 0.3, active: false },
        { id: 'w-1', word: 'בית', x: 20, y: 30, speed: 0.3, active: false },
      ],
    }

    const newState = processInput(state, 'של')
    expect(newState.words[0].active).toBe(true)
    expect(newState.words[1].active).toBe(false)
  })

  it('updates input when no match', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      phase: 'playing',
      words: [{ id: 'w-0', word: 'שלום', x: 50, y: 50, speed: 0.3, active: false }],
    }

    const newState = processInput(state, 'של')
    expect(newState.input).toBe('של')
  })

  it('does nothing when not playing', () => {
    const state = createWordRainState('easy')
    const newState = processInput(state, 'שלום')
    expect(newState).toBe(state)
  })
})

describe('calculateFinalScore', () => {
  it('calculates score with bonuses', () => {
    const state: WordRainState = {
      ...createWordRainState('easy'),
      score: 100,
      bestCombo: 6,
      lives: 3,
    }

    const result = calculateFinalScore(state)
    expect(result.baseScore).toBe(100)
    expect(result.comboBonus).toBe(30)
    expect(result.livesBonus).toBe(60)
    expect(result.totalScore).toBe(190)
  })

  it('handles zero values', () => {
    const state = createWordRainState('easy')
    const result = calculateFinalScore(state)

    expect(result.baseScore).toBe(0)
    expect(result.comboBonus).toBe(0)
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
  })
})

describe('getXpReward', () => {
  it('returns 50 for scores >= 500', () => {
    expect(getXpReward(500)).toBe(50)
    expect(getXpReward(1000)).toBe(50)
  })

  it('returns 35 for scores >= 300', () => {
    expect(getXpReward(300)).toBe(35)
    expect(getXpReward(499)).toBe(35)
  })

  it('returns 25 for scores >= 150', () => {
    expect(getXpReward(150)).toBe(25)
    expect(getXpReward(299)).toBe(25)
  })

  it('returns 15 for scores >= 50', () => {
    expect(getXpReward(50)).toBe(15)
    expect(getXpReward(149)).toBe(15)
  })

  it('returns 10 for low scores', () => {
    expect(getXpReward(0)).toBe(10)
    expect(getXpReward(49)).toBe(10)
  })
})

describe('DIFFICULTY_CONFIG', () => {
  it('has all three difficulties', () => {
    expect(DIFFICULTY_CONFIG.easy).toBeDefined()
    expect(DIFFICULTY_CONFIG.medium).toBeDefined()
    expect(DIFFICULTY_CONFIG.hard).toBeDefined()
  })

  it('has Hebrew labels', () => {
    expect(DIFFICULTY_CONFIG.easy.label).toBe('קל')
    expect(DIFFICULTY_CONFIG.medium.label).toBe('בינוני')
    expect(DIFFICULTY_CONFIG.hard.label).toBe('קשה')
  })

  it('increases difficulty progressively', () => {
    expect(DIFFICULTY_CONFIG.easy.baseSpeed).toBeLessThan(DIFFICULTY_CONFIG.medium.baseSpeed)
    expect(DIFFICULTY_CONFIG.medium.baseSpeed).toBeLessThan(DIFFICULTY_CONFIG.hard.baseSpeed)
    expect(DIFFICULTY_CONFIG.easy.spawnIntervalMs).toBeGreaterThan(DIFFICULTY_CONFIG.medium.spawnIntervalMs)
    expect(DIFFICULTY_CONFIG.medium.spawnIntervalMs).toBeGreaterThan(DIFFICULTY_CONFIG.hard.spawnIntervalMs)
  })
})
