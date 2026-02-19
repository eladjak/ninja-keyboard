import { describe, it, expect } from 'vitest'
import {
  aggregateKeyAccuracy,
  getHeatLevel,
  getWeakestKeys,
  getStrongestKeys,
  HEAT_COLORS,
  HEAT_LABELS,
} from '@/lib/statistics/keyboard-heatmap'

describe('aggregateKeyAccuracy', () => {
  it('aggregates from single session', () => {
    const result = aggregateKeyAccuracy([
      {
        keyAccuracy: {
          'א': { correct: 8, total: 10 },
          'ב': { correct: 5, total: 5 },
        },
      },
    ])

    expect(result).toHaveLength(2)
    const aleph = result.find((k) => k.char === 'א')
    expect(aleph?.accuracy).toBe(80)
    expect(aleph?.total).toBe(10)
  })

  it('aggregates across multiple sessions', () => {
    const result = aggregateKeyAccuracy([
      { keyAccuracy: { 'א': { correct: 8, total: 10 } } },
      { keyAccuracy: { 'א': { correct: 7, total: 10 } } },
    ])

    const aleph = result.find((k) => k.char === 'א')
    expect(aleph?.correct).toBe(15)
    expect(aleph?.total).toBe(20)
    expect(aleph?.accuracy).toBe(75)
  })

  it('handles empty sessions', () => {
    expect(aggregateKeyAccuracy([])).toHaveLength(0)
  })

  it('sorts by accuracy ascending', () => {
    const result = aggregateKeyAccuracy([
      {
        keyAccuracy: {
          'א': { correct: 10, total: 10 },
          'ב': { correct: 5, total: 10 },
          'ג': { correct: 8, total: 10 },
        },
      },
    ])

    expect(result[0].char).toBe('ב') // worst accuracy first
    expect(result[result.length - 1].char).toBe('א') // best accuracy last
  })
})

describe('getHeatLevel', () => {
  it('returns "none" for insufficient data', () => {
    expect(getHeatLevel(100, 0)).toBe('none')
    expect(getHeatLevel(100, 2)).toBe('none')
  })

  it('returns "excellent" for 95%+', () => {
    expect(getHeatLevel(95, 10)).toBe('excellent')
    expect(getHeatLevel(100, 5)).toBe('excellent')
  })

  it('returns "good" for 85-94%', () => {
    expect(getHeatLevel(85, 10)).toBe('good')
    expect(getHeatLevel(94, 10)).toBe('good')
  })

  it('returns "fair" for 75-84%', () => {
    expect(getHeatLevel(75, 10)).toBe('fair')
    expect(getHeatLevel(84, 10)).toBe('fair')
  })

  it('returns "weak" for 60-74%', () => {
    expect(getHeatLevel(60, 10)).toBe('weak')
    expect(getHeatLevel(74, 10)).toBe('weak')
  })

  it('returns "critical" for below 60%', () => {
    expect(getHeatLevel(59, 10)).toBe('critical')
    expect(getHeatLevel(0, 5)).toBe('critical')
  })
})

describe('getWeakestKeys', () => {
  it('returns keys sorted by lowest accuracy', () => {
    const data = [
      { char: 'א', accuracy: 90, total: 10, correct: 9 },
      { char: 'ב', accuracy: 50, total: 10, correct: 5 },
      { char: 'ג', accuracy: 70, total: 10, correct: 7 },
    ]

    const weakest = getWeakestKeys(data, 2)
    expect(weakest).toHaveLength(2)
    expect(weakest[0].char).toBe('ב')
    expect(weakest[1].char).toBe('ג')
  })

  it('filters out keys with insufficient data', () => {
    const data = [
      { char: 'א', accuracy: 50, total: 2, correct: 1 },
      { char: 'ב', accuracy: 60, total: 10, correct: 6 },
    ]

    const weakest = getWeakestKeys(data, 5)
    expect(weakest).toHaveLength(1)
    expect(weakest[0].char).toBe('ב')
  })
})

describe('getStrongestKeys', () => {
  it('returns keys sorted by highest accuracy', () => {
    const data = [
      { char: 'א', accuracy: 90, total: 10, correct: 9 },
      { char: 'ב', accuracy: 50, total: 10, correct: 5 },
      { char: 'ג', accuracy: 100, total: 10, correct: 10 },
    ]

    const strongest = getStrongestKeys(data, 2)
    expect(strongest).toHaveLength(2)
    expect(strongest[0].char).toBe('ג')
    expect(strongest[1].char).toBe('א')
  })
})

describe('HEAT_COLORS', () => {
  it('has all heat levels', () => {
    expect(HEAT_COLORS.excellent).toBeTruthy()
    expect(HEAT_COLORS.good).toBeTruthy()
    expect(HEAT_COLORS.fair).toBeTruthy()
    expect(HEAT_COLORS.weak).toBeTruthy()
    expect(HEAT_COLORS.critical).toBeTruthy()
    expect(HEAT_COLORS.none).toBeTruthy()
  })
})

describe('HEAT_LABELS', () => {
  it('has Hebrew labels for all levels', () => {
    expect(HEAT_LABELS.excellent).toBe('מצוין')
    expect(HEAT_LABELS.good).toBe('טוב')
    expect(HEAT_LABELS.fair).toBe('סביר')
    expect(HEAT_LABELS.weak).toBe('חלש')
    expect(HEAT_LABELS.critical).toBe('דורש תרגול')
    expect(HEAT_LABELS.none).toBe('אין מידע')
  })
})
