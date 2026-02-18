import { describe, it, expect } from 'vitest'
import {
  createBattle,
  updatePlayerProgress,
  updateAiProgress,
  checkWinner,
  calculateBattleXp,
  getBattleText,
  getAiWpm,
  getAiErrorRate,
  calculatePlayerWpm,
  calculatePlayerAccuracy,
  calculateAiEffectiveWpm,
  type BattleConfig,
  type BattleState,
} from '@/lib/battle/battle-engine'

// ── getBattleText ─────────────────────────────────────────────────

describe('getBattleText', () => {
  it('returns a non-empty string', () => {
    const text = getBattleText(50)
    expect(text.length).toBeGreaterThan(0)
  })

  it('returns text approximately the requested length', () => {
    const text = getBattleText(80)
    // Allow some flexibility since we don't cut mid-word
    expect(text.length).toBeGreaterThan(40)
    expect(text.length).toBeLessThan(200)
  })

  it('returns Hebrew characters', () => {
    const text = getBattleText(50)
    // Hebrew Unicode range
    expect(text).toMatch(/[\u0590-\u05FF]/)
  })

  it('returns different text on multiple calls (randomized)', () => {
    const results = new Set<string>()
    for (let i = 0; i < 10; i++) {
      results.add(getBattleText(80))
    }
    // With randomization, we should get at least 2 different results
    expect(results.size).toBeGreaterThanOrEqual(2)
  })
})

// ── createBattle ──────────────────────────────────────────────────

describe('createBattle', () => {
  it('creates a battle with easy difficulty', () => {
    const config: BattleConfig = { difficulty: 'easy', textLength: 50 }
    const state = createBattle(config)

    expect(state.playerProgress).toBe(0)
    expect(state.aiProgress).toBe(0)
    expect(state.status).toBe('idle')
    expect(state.winner).toBeNull()
    expect(state.timeElapsed).toBe(0)
    expect(state.config.difficulty).toBe('easy')
    expect(state.text.length).toBeGreaterThan(0)
  })

  it('creates a battle with medium difficulty', () => {
    const config: BattleConfig = { difficulty: 'medium', textLength: 80 }
    const state = createBattle(config)

    expect(state.config.difficulty).toBe('medium')
    expect(state.playerTotalKeystrokes).toBe(0)
    expect(state.playerCorrectKeystrokes).toBe(0)
  })

  it('creates a battle with hard difficulty', () => {
    const config: BattleConfig = { difficulty: 'hard', textLength: 100 }
    const state = createBattle(config)

    expect(state.config.difficulty).toBe('hard')
    expect(state.config.textLength).toBe(100)
  })

  it('initializes all counters at zero', () => {
    const state = createBattle({ difficulty: 'easy', textLength: 50 })

    expect(state.playerTotalKeystrokes).toBe(0)
    expect(state.playerCorrectKeystrokes).toBe(0)
    expect(state.aiCorrectChars).toBe(0)
    expect(state.aiFractionalProgress).toBe(0)
  })
})

// ── AI Speed Configuration ────────────────────────────────────────

describe('AI speed configuration', () => {
  it('easy AI types at 15 WPM', () => {
    expect(getAiWpm('easy')).toBe(15)
  })

  it('medium AI types at 30 WPM', () => {
    expect(getAiWpm('medium')).toBe(30)
  })

  it('hard AI types at 50 WPM', () => {
    expect(getAiWpm('hard')).toBe(50)
  })
})

// ── AI Error Rates ────────────────────────────────────────────────

describe('AI error rates', () => {
  it('easy AI has 10% error rate', () => {
    expect(getAiErrorRate('easy')).toBe(0.1)
  })

  it('medium AI has 5% error rate', () => {
    expect(getAiErrorRate('medium')).toBe(0.05)
  })

  it('hard AI has 2% error rate', () => {
    expect(getAiErrorRate('hard')).toBe(0.02)
  })
})

// ── updatePlayerProgress ──────────────────────────────────────────

describe('updatePlayerProgress', () => {
  function makePlayingState(overrides?: Partial<BattleState>): BattleState {
    return {
      playerProgress: 0,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 1000,
      text: 'שלום עולם',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
      ...overrides,
    }
  }

  it('advances player progress on correct keystroke', () => {
    const state = makePlayingState()
    const updated = updatePlayerProgress(state, 0, true)

    expect(updated.playerProgress).toBe(1)
    expect(updated.playerTotalKeystrokes).toBe(1)
    expect(updated.playerCorrectKeystrokes).toBe(1)
  })

  it('does not advance progress on incorrect keystroke', () => {
    const state = makePlayingState()
    const updated = updatePlayerProgress(state, 0, false)

    expect(updated.playerProgress).toBe(0)
    expect(updated.playerTotalKeystrokes).toBe(1)
    expect(updated.playerCorrectKeystrokes).toBe(0)
  })

  it('does not update when battle is not playing', () => {
    const state = makePlayingState({ status: 'idle' })
    const updated = updatePlayerProgress(state, 0, true)

    expect(updated.playerProgress).toBe(0)
    expect(updated.playerTotalKeystrokes).toBe(0)
  })

  it('tracks cumulative keystrokes', () => {
    let state = makePlayingState()
    state = updatePlayerProgress(state, 0, true)
    state = updatePlayerProgress(state, 1, false)
    state = updatePlayerProgress(state, 1, true)

    expect(state.playerTotalKeystrokes).toBe(3)
    expect(state.playerCorrectKeystrokes).toBe(2)
    expect(state.playerProgress).toBe(2)
  })
})

// ── updateAiProgress ──────────────────────────────────────────────

describe('updateAiProgress', () => {
  function makeAiState(
    difficulty: 'easy' | 'medium' | 'hard' = 'easy',
  ): BattleState {
    return {
      playerProgress: 0,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 0,
      text: 'שלום עולם ברוך הבא לזירת הקרב של נינגה מקלדת',
      config: { difficulty, textLength: 80 },
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }
  }

  it('advances AI progress over time for easy difficulty', () => {
    const state = makeAiState('easy')
    // Simulate 10 seconds of typing
    const updated = updateAiProgress(state, 10_000)

    expect(updated.aiProgress).toBeGreaterThan(0)
    expect(updated.timeElapsed).toBe(10_000)
  })

  it('hard AI progresses faster than easy AI', () => {
    const easyState = makeAiState('easy')
    const hardState = makeAiState('hard')
    const delta = 5_000

    const updatedEasy = updateAiProgress(easyState, delta)
    const updatedHard = updateAiProgress(hardState, delta)

    expect(updatedHard.aiProgress).toBeGreaterThan(updatedEasy.aiProgress)
  })

  it('does not advance when not playing', () => {
    const state: BattleState = {
      ...makeAiState(),
      status: 'finished',
    }
    const updated = updateAiProgress(state, 5000)

    expect(updated.aiProgress).toBe(0)
  })

  it('accumulates time elapsed', () => {
    let state = makeAiState()
    state = updateAiProgress(state, 1000)
    state = updateAiProgress(state, 1000)
    state = updateAiProgress(state, 1000)

    expect(state.timeElapsed).toBe(3000)
  })

  it('AI progress does not exceed text length', () => {
    const state = makeAiState('hard')
    // Simulate a very long time - should cap at text length
    const updated = updateAiProgress(state, 600_000) // 10 minutes

    expect(updated.aiProgress).toBeLessThanOrEqual(state.text.length)
  })
})

// ── checkWinner ───────────────────────────────────────────────────

describe('checkWinner', () => {
  it('returns null when neither has finished', () => {
    const state: BattleState = {
      playerProgress: 5,
      aiProgress: 3,
      status: 'playing',
      winner: null,
      timeElapsed: 1000,
      text: 'שלום עולם',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 5,
      playerCorrectKeystrokes: 5,
      aiCorrectChars: 3,
      aiFractionalProgress: 3,
    }

    expect(checkWinner(state, 9)).toBeNull()
  })

  it('returns player when player finishes first', () => {
    const state: BattleState = {
      playerProgress: 9,
      aiProgress: 5,
      status: 'playing',
      winner: null,
      timeElapsed: 5000,
      text: 'שלום עולם',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 10,
      playerCorrectKeystrokes: 9,
      aiCorrectChars: 5,
      aiFractionalProgress: 5,
    }

    expect(checkWinner(state, 9)).toBe('player')
  })

  it('returns ai when AI finishes first', () => {
    const state: BattleState = {
      playerProgress: 3,
      aiProgress: 9,
      status: 'playing',
      winner: null,
      timeElapsed: 5000,
      text: 'שלום עולם',
      config: { difficulty: 'hard', textLength: 50 },
      playerTotalKeystrokes: 4,
      playerCorrectKeystrokes: 3,
      aiCorrectChars: 9,
      aiFractionalProgress: 9,
    }

    expect(checkWinner(state, 9)).toBe('ai')
  })

  it('returns player on a tie', () => {
    const state: BattleState = {
      playerProgress: 9,
      aiProgress: 9,
      status: 'playing',
      winner: null,
      timeElapsed: 5000,
      text: 'שלום עולם',
      config: { difficulty: 'medium', textLength: 50 },
      playerTotalKeystrokes: 10,
      playerCorrectKeystrokes: 9,
      aiCorrectChars: 9,
      aiFractionalProgress: 9,
    }

    expect(checkWinner(state, 9)).toBe('player')
  })
})

// ── calculateBattleXp ─────────────────────────────────────────────

describe('calculateBattleXp', () => {
  it('gives more XP for winning than losing', () => {
    const winXp = calculateBattleXp(true, 'easy', 20)
    const loseXp = calculateBattleXp(false, 'easy', 20)

    expect(winXp).toBeGreaterThan(loseXp)
  })

  it('gives more XP for harder difficulty', () => {
    const easyXp = calculateBattleXp(true, 'easy', 20)
    const mediumXp = calculateBattleXp(true, 'medium', 20)
    const hardXp = calculateBattleXp(true, 'hard', 20)

    expect(mediumXp).toBeGreaterThan(easyXp)
    expect(hardXp).toBeGreaterThan(mediumXp)
  })

  it('gives more XP for higher WPM', () => {
    const slowXp = calculateBattleXp(true, 'easy', 10)
    const fastXp = calculateBattleXp(true, 'easy', 50)

    expect(fastXp).toBeGreaterThan(slowXp)
  })

  it('always returns a positive number', () => {
    expect(calculateBattleXp(false, 'easy', 0)).toBeGreaterThan(0)
    expect(calculateBattleXp(false, 'easy', 5)).toBeGreaterThan(0)
  })

  it('win + hard + fast WPM gives maximum XP', () => {
    const maxXp = calculateBattleXp(true, 'hard', 100)
    const minXp = calculateBattleXp(false, 'easy', 5)

    expect(maxXp).toBeGreaterThan(minXp * 2)
  })
})

// ── calculatePlayerWpm ────────────────────────────────────────────

describe('calculatePlayerWpm', () => {
  it('returns 0 when no time elapsed', () => {
    const state: BattleState = {
      playerProgress: 5,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 0,
      text: 'שלום',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 5,
      playerCorrectKeystrokes: 5,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }

    expect(calculatePlayerWpm(state)).toBe(0)
  })

  it('returns positive WPM with progress and time', () => {
    const state: BattleState = {
      playerProgress: 20,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 30_000, // 30 seconds
      text: 'שלום עולם ברוך הבא',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 22,
      playerCorrectKeystrokes: 20,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }

    const wpm = calculatePlayerWpm(state)
    expect(wpm).toBeGreaterThan(0)
  })
})

// ── calculatePlayerAccuracy ───────────────────────────────────────

describe('calculatePlayerAccuracy', () => {
  it('returns 100 when no keystrokes', () => {
    const state: BattleState = {
      playerProgress: 0,
      aiProgress: 0,
      status: 'idle',
      winner: null,
      timeElapsed: 0,
      text: 'שלום',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }

    expect(calculatePlayerAccuracy(state)).toBe(100)
  })

  it('calculates accuracy correctly', () => {
    const state: BattleState = {
      playerProgress: 8,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 5000,
      text: 'שלום עולם',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 10,
      playerCorrectKeystrokes: 8,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }

    expect(calculatePlayerAccuracy(state)).toBe(80)
  })
})

// ── calculateAiEffectiveWpm ───────────────────────────────────────

describe('calculateAiEffectiveWpm', () => {
  it('returns 0 when no time elapsed', () => {
    const state: BattleState = {
      playerProgress: 0,
      aiProgress: 0,
      status: 'playing',
      winner: null,
      timeElapsed: 0,
      text: 'שלום',
      config: { difficulty: 'easy', textLength: 50 },
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 0,
      aiFractionalProgress: 0,
    }

    expect(calculateAiEffectiveWpm(state)).toBe(0)
  })

  it('returns positive WPM when AI has progressed', () => {
    const state: BattleState = {
      playerProgress: 0,
      aiProgress: 20,
      status: 'playing',
      winner: null,
      timeElapsed: 30_000,
      text: 'שלום עולם ברוך הבא',
      config: { difficulty: 'medium', textLength: 50 },
      playerTotalKeystrokes: 0,
      playerCorrectKeystrokes: 0,
      aiCorrectChars: 20,
      aiFractionalProgress: 20,
    }

    expect(calculateAiEffectiveWpm(state)).toBeGreaterThan(0)
  })
})
