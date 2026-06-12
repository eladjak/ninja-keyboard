import { describe, it, expect } from 'vitest'
import {
  RIVAL_TAUNTS,
  COACH_LINES,
  pickRivalTaunt,
  pickCoachLine,
  type TauntCategory,
  type CoachCategory,
} from './battle-taunts'
import type { RivalName } from '@/types/ai-opponent'

const RIVALS: RivalName[] = ['bug', 'shadow', 'storm', 'blaze', 'virus', 'yuki']
const TAUNT_CATEGORIES: TauntCategory[] = [
  'battleStart',
  'playerLeading',
  'playerBehind',
  'comboBroken',
]
const COACH_CATEGORIES: CoachCategory[] = ['comboMilestone', 'comeback']

describe('RIVAL_TAUNTS', () => {
  it.each(RIVALS)('%s has non-empty Hebrew lines in every category', (rival) => {
    for (const category of TAUNT_CATEGORIES) {
      const lines = RIVAL_TAUNTS[rival][category]
      expect(lines.length).toBeGreaterThanOrEqual(2)
      for (const line of lines) {
        expect(line.trim().length).toBeGreaterThan(0)
        // Every line must contain Hebrew characters
        expect(line).toMatch(/[֐-׿]/)
      }
    }
  })

  it('rivals have distinct voices (no identical lines across rivals)', () => {
    const all = RIVALS.flatMap((r) =>
      TAUNT_CATEGORIES.flatMap((c) => [...RIVAL_TAUNTS[r][c]]),
    )
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('COACH_LINES', () => {
  it.each(COACH_CATEGORIES)('%s has Hebrew Mika lines', (category) => {
    const lines = COACH_LINES[category]
    expect(lines.length).toBeGreaterThanOrEqual(2)
    for (const line of lines) {
      expect(line).toMatch(/[֐-׿]/)
      expect(line).toContain('מיקה')
    }
  })
})

describe('pickRivalTaunt', () => {
  it('is deterministic for the same seed', () => {
    expect(pickRivalTaunt('bug', 'battleStart', 7)).toBe(
      pickRivalTaunt('bug', 'battleStart', 7),
    )
  })

  it('wraps seeds beyond array length', () => {
    const lines = RIVAL_TAUNTS.shadow.playerBehind
    expect(pickRivalTaunt('shadow', 'playerBehind', lines.length)).toBe(lines[0])
  })

  it('handles negative seeds', () => {
    expect(RIVAL_TAUNTS.yuki.comboBroken).toContain(
      pickRivalTaunt('yuki', 'comboBroken', -3),
    )
  })

  it('cycles through all lines as seed increments', () => {
    const lines = RIVAL_TAUNTS.bug.playerBehind
    const seen = new Set(
      Array.from({ length: lines.length }, (_, i) =>
        pickRivalTaunt('bug', 'playerBehind', i),
      ),
    )
    expect(seen.size).toBe(lines.length)
  })
})

describe('pickCoachLine', () => {
  it('is deterministic and in range', () => {
    const line = pickCoachLine('comboMilestone', 1)
    expect(COACH_LINES.comboMilestone).toContain(line)
    expect(pickCoachLine('comboMilestone', 1)).toBe(line)
  })
})
