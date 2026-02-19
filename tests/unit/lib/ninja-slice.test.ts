import { describe, it, expect, beforeEach } from 'vitest'
import {
  createNinjaSliceState,
  spawnTarget,
  tick,
  processInput,
  calculateFinalScore,
  getXpReward,
  getRandomTarget,
  resetIdCounter,
  SLICE_DIFFICULTY_CONFIG,
} from '@/lib/games/ninja-slice'
import type { NinjaSliceState, SliceDifficulty } from '@/lib/games/ninja-slice'

describe('createNinjaSliceState', () => {
  it('creates initial state with correct defaults for easy difficulty', () => {
    const state = createNinjaSliceState('easy')

    expect(state.score).toBe(0)
    expect(state.combo).toBe(0)
    expect(state.bestCombo).toBe(0)
    expect(state.lives).toBe(5)
    expect(state.maxLives).toBe(5)
    expect(state.targets).toHaveLength(0)
    expect(state.input).toBe('')
    expect(state.phase).toBe('ready')
    expect(state.targetsSliced).toBe(0)
    expect(state.targetsMissed).toBe(0)
    expect(state.difficulty).toBe('easy')
    expect(state.elapsedSeconds).toBe(0)
  })

  it('creates initial state with correct defaults for medium difficulty', () => {
    const state = createNinjaSliceState('medium')

    expect(state.score).toBe(0)
    expect(state.lives).toBe(4)
    expect(state.maxLives).toBe(4)
    expect(state.difficulty).toBe('medium')
    expect(state.phase).toBe('ready')
  })

  it('creates initial state with correct defaults for hard difficulty', () => {
    const state = createNinjaSliceState('hard')

    expect(state.score).toBe(0)
    expect(state.lives).toBe(3)
    expect(state.maxLives).toBe(3)
    expect(state.difficulty).toBe('hard')
    expect(state.phase).toBe('ready')
  })

  it('starts in ready phase', () => {
    expect(createNinjaSliceState('easy').phase).toBe('ready')
    expect(createNinjaSliceState('medium').phase).toBe('ready')
    expect(createNinjaSliceState('hard').phase).toBe('ready')
  })

  it('has correct lives per difficulty', () => {
    expect(createNinjaSliceState('easy').lives).toBe(5)
    expect(createNinjaSliceState('medium').lives).toBe(4)
    expect(createNinjaSliceState('hard').lives).toBe(3)
  })
})

describe('getRandomTarget', () => {
  it('returns a single Hebrew letter for easy difficulty', () => {
    const target = getRandomTarget('easy')
    expect(typeof target).toBe('string')
    // Single letter (Hebrew characters are 1 char in JS)
    expect(target.length).toBe(1)
  })

  it('returns a combo (2-3 characters) for medium difficulty', () => {
    const target = getRandomTarget('medium')
    expect(typeof target).toBe('string')
    expect(target.length).toBeGreaterThanOrEqual(2)
    expect(target.length).toBeLessThanOrEqual(3)
  })

  it('returns a word for hard difficulty', () => {
    const target = getRandomTarget('hard')
    expect(typeof target).toBe('string')
    expect(target.length).toBeGreaterThanOrEqual(2)
  })

  it('returns different values over multiple calls (easy)', () => {
    const results = new Set(Array.from({ length: 30 }, () => getRandomTarget('easy')))
    expect(results.size).toBeGreaterThan(1)
  })

  it('returns different values over multiple calls (hard)', () => {
    const results = new Set(Array.from({ length: 30 }, () => getRandomTarget('hard')))
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('spawnTarget', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('adds a target when below max capacity', () => {
    const state: NinjaSliceState = { ...createNinjaSliceState('easy'), phase: 'playing' }
    const newState = spawnTarget(state)

    expect(newState.targets).toHaveLength(1)
    expect(newState.targets[0].text.length).toBeGreaterThan(0)
    expect(newState.targets[0].id).toBe('t-0')
  })

  it('does not add a target when at max capacity', () => {
    const maxTargets = SLICE_DIFFICULTY_CONFIG.easy.maxTargets
    const targets = Array.from({ length: maxTargets }, (_, i) => ({
      id: `t-${i}`,
      text: 'א',
      x: 50,
      y: 50,
      direction: 'right' as const,
      speed: 0.35,
      sliced: false,
      missed: false,
    }))
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets,
    }

    const newState = spawnTarget(state)
    expect(newState.targets).toHaveLength(maxTargets)
  })

  it('does not add a target when phase is not playing (ready)', () => {
    const state = createNinjaSliceState('easy') // phase = 'ready'
    const newState = spawnTarget(state)
    expect(newState.targets).toHaveLength(0)
  })

  it('does not add a target when phase is gameover', () => {
    const state: NinjaSliceState = { ...createNinjaSliceState('easy'), phase: 'gameover' }
    const newState = spawnTarget(state)
    expect(newState.targets).toHaveLength(0)
  })

  it('assigns a random direction to the new target', () => {
    const directions = new Set<string>()
    for (let i = 0; i < 40; i++) {
      resetIdCounter()
      const state: NinjaSliceState = { ...createNinjaSliceState('easy'), phase: 'playing' }
      const newState = spawnTarget(state)
      directions.add(newState.targets[0].direction)
    }
    // Should see more than one direction across 40 spawns
    expect(directions.size).toBeGreaterThan(1)
  })

  it('does not mutate the original state', () => {
    const state: NinjaSliceState = { ...createNinjaSliceState('easy'), phase: 'playing' }
    const newState = spawnTarget(state)
    expect(state.targets).toHaveLength(0)
    expect(newState.targets).toHaveLength(1)
  })
})

describe('tick', () => {
  it('moves targets moving right (x increases)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 10, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets[0].x).toBe(15)
    expect(newState.targets[0].y).toBe(50) // y unchanged
  })

  it('moves targets moving left (x decreases)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'ב', x: 90, y: 50,
        direction: 'left', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets[0].x).toBe(85)
  })

  it('moves targets moving top (y increases)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'ג', x: 50, y: 10,
        direction: 'top', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets[0].y).toBe(15)
  })

  it('moves targets moving bottom (y decreases)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'ד', x: 50, y: 90,
        direction: 'bottom', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets[0].y).toBe(85)
  })

  it('removes targets that exit screen (direction right)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 108, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets).toHaveLength(0)
  })

  it('removes targets that exit screen (direction left)', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: -7, y: 50,
        direction: 'left', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.targets).toHaveLength(0)
  })

  it('decrements lives when a target exits screen', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 108, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.lives).toBe(4)
    expect(newState.targetsMissed).toBe(1)
  })

  it('resets combo when a target is missed', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      combo: 5,
      targets: [{
        id: 't-0', text: 'א', x: 108, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.combo).toBe(0)
  })

  it('transitions to gameover when lives reach 0', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      lives: 1,
      targets: [{
        id: 't-0', text: 'א', x: 108, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState.phase).toBe('gameover')
    expect(newState.lives).toBe(0)
  })

  it('does nothing when phase is not playing', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      // phase = 'ready'
      targets: [{
        id: 't-0', text: 'א', x: 10, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    const newState = tick(state)
    expect(newState).toBe(state) // Same reference - unchanged
  })

  it('does not mutate the original state', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 10, y: 50,
        direction: 'right', speed: 5, sliced: false, missed: false,
      }],
    }

    tick(state)
    expect(state.targets[0].x).toBe(10) // Unchanged
  })
})

describe('processInput', () => {
  it('slices matching target', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'א')
    expect(newState.targets).toHaveLength(0)
    expect(newState.input).toBe('')
    expect(newState.targetsSliced).toBe(1)
  })

  it('increments combo on successful slice', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      combo: 2,
      targets: [{
        id: 't-0', text: 'ב', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'ב')
    expect(newState.combo).toBe(3)
  })

  it('awards correct points with combo multiplier', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      combo: 4, // next combo = 5, capped at 5, so points = 10 * 5 = 50
      targets: [{
        id: 't-0', text: 'ג', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'ג')
    expect(newState.score).toBe(50)
  })

  it('caps combo multiplier at 5x', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      combo: 10, // Would be 11, but capped at 5 for points
      targets: [{
        id: 't-0', text: 'ד', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'ד')
    // combo becomes 11, comboBonus = min(11, 5) = 5, points = 10 * 5 = 50
    expect(newState.score).toBe(50)
  })

  it('clears input after successful slice', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      input: 'א',
      targets: [{
        id: 't-0', text: 'א', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'א')
    expect(newState.input).toBe('')
  })

  it('does not slice when no match', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [{
        id: 't-0', text: 'א', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'ב')
    expect(newState.targets).toHaveLength(1)
    expect(newState.score).toBe(0)
    expect(newState.input).toBe('ב')
  })

  it('handles multiple targets and slices first match', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      targets: [
        { id: 't-0', text: 'א', x: 20, y: 20, direction: 'right', speed: 0.35, sliced: false, missed: false },
        { id: 't-1', text: 'ב', x: 60, y: 60, direction: 'left',  speed: 0.35, sliced: false, missed: false },
        { id: 't-2', text: 'א', x: 80, y: 30, direction: 'top',   speed: 0.35, sliced: false, missed: false },
      ],
    }

    const newState = processInput(state, 'א')
    // First matching target (index 0) should be removed
    expect(newState.targets).toHaveLength(2)
    expect(newState.targets.find((t) => t.id === 't-0')).toBeUndefined()
    expect(newState.targetsSliced).toBe(1)
  })

  it('does not slice when phase is not playing', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      // phase = 'ready'
      targets: [{
        id: 't-0', text: 'א', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'א')
    expect(newState).toBe(state)
  })

  it('updates bestCombo when combo exceeds previous best', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      phase: 'playing',
      combo: 3,
      bestCombo: 3,
      targets: [{
        id: 't-0', text: 'ה', x: 50, y: 50,
        direction: 'right', speed: 0.35, sliced: false, missed: false,
      }],
    }

    const newState = processInput(state, 'ה')
    expect(newState.combo).toBe(4)
    expect(newState.bestCombo).toBe(4)
  })
})

describe('calculateFinalScore', () => {
  it('calculates base + combo + lives bonus correctly', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      score: 100,
      bestCombo: 6,
      lives: 3,
    }

    const result = calculateFinalScore(state)
    expect(result.baseScore).toBe(100)
    expect(result.comboBonus).toBe(30)   // 6 * 5
    expect(result.livesBonus).toBe(60)   // 3 * 20
    expect(result.totalScore).toBe(190)  // 100 + 30 + 60
  })

  it('handles zero values', () => {
    const state = createNinjaSliceState('easy')
    const result = calculateFinalScore(state)

    expect(result.baseScore).toBe(0)
    expect(result.comboBonus).toBe(0)
    // lives bonus = 5 * 20 = 100 (initial lives are 5)
    expect(result.livesBonus).toBe(100)
    expect(result.totalScore).toBe(100)
  })

  it('calculates correctly with no remaining lives', () => {
    const state: NinjaSliceState = {
      ...createNinjaSliceState('easy'),
      score: 200,
      bestCombo: 4,
      lives: 0,
    }

    const result = calculateFinalScore(state)
    expect(result.baseScore).toBe(200)
    expect(result.comboBonus).toBe(20)  // 4 * 5
    expect(result.livesBonus).toBe(0)   // 0 * 20
    expect(result.totalScore).toBe(220)
  })
})

describe('getXpReward', () => {
  it('returns 50 for scores >= 500', () => {
    expect(getXpReward(500)).toBe(50)
    expect(getXpReward(1000)).toBe(50)
  })

  it('returns 35 for scores >= 300 and < 500', () => {
    expect(getXpReward(300)).toBe(35)
    expect(getXpReward(499)).toBe(35)
  })

  it('returns 25 for scores >= 150 and < 300', () => {
    expect(getXpReward(150)).toBe(25)
    expect(getXpReward(299)).toBe(25)
  })

  it('returns 15 for scores >= 50 and < 150', () => {
    expect(getXpReward(50)).toBe(15)
    expect(getXpReward(149)).toBe(15)
  })

  it('returns 10 for scores below 50', () => {
    expect(getXpReward(0)).toBe(10)
    expect(getXpReward(49)).toBe(10)
  })
})

describe('SLICE_DIFFICULTY_CONFIG', () => {
  it('has all three difficulties defined', () => {
    expect(SLICE_DIFFICULTY_CONFIG.easy).toBeDefined()
    expect(SLICE_DIFFICULTY_CONFIG.medium).toBeDefined()
    expect(SLICE_DIFFICULTY_CONFIG.hard).toBeDefined()
  })

  it('has Hebrew labels', () => {
    expect(SLICE_DIFFICULTY_CONFIG.easy.label).toBe('קל')
    expect(SLICE_DIFFICULTY_CONFIG.medium.label).toBe('בינוני')
    expect(SLICE_DIFFICULTY_CONFIG.hard.label).toBe('קשה')
  })

  it('increases speed progressively', () => {
    expect(SLICE_DIFFICULTY_CONFIG.easy.baseSpeed).toBeLessThan(SLICE_DIFFICULTY_CONFIG.medium.baseSpeed)
    expect(SLICE_DIFFICULTY_CONFIG.medium.baseSpeed).toBeLessThan(SLICE_DIFFICULTY_CONFIG.hard.baseSpeed)
  })

  it('decreases spawn interval progressively (faster spawning)', () => {
    expect(SLICE_DIFFICULTY_CONFIG.easy.spawnIntervalMs).toBeGreaterThan(SLICE_DIFFICULTY_CONFIG.medium.spawnIntervalMs)
    expect(SLICE_DIFFICULTY_CONFIG.medium.spawnIntervalMs).toBeGreaterThan(SLICE_DIFFICULTY_CONFIG.hard.spawnIntervalMs)
  })

  it('increases max targets progressively', () => {
    expect(SLICE_DIFFICULTY_CONFIG.easy.maxTargets).toBeLessThan(SLICE_DIFFICULTY_CONFIG.medium.maxTargets)
    expect(SLICE_DIFFICULTY_CONFIG.medium.maxTargets).toBeLessThan(SLICE_DIFFICULTY_CONFIG.hard.maxTargets)
  })
})
