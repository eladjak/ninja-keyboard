import { describe, it, expect } from 'vitest'
import { calculateStars } from './stars'

describe('calculateStars', () => {
  it('returns 3 stars at 130% of combined target', () => {
    // wpmRatio 1.4 + accRatio ~1.29 => avg ~1.35 >= 1.3
    expect(calculateStars(14, 110, 10, 85)).toBe(3)
  })

  it('returns 2 stars when exactly on target', () => {
    expect(calculateStars(10, 85, 10, 85)).toBe(2)
  })

  it('returns 1 star at 70% of target', () => {
    expect(calculateStars(7, 60, 10, 85)).toBe(1)
  })

  it('returns 0 stars far below target', () => {
    expect(calculateStars(2, 30, 10, 85)).toBe(0)
  })

  it('guards against zero targets', () => {
    expect(calculateStars(10, 90, 0, 0)).toBe(0)
  })

  it('strong accuracy can compensate for slightly low wpm (average model)', () => {
    // wpmRatio 0.9 + accRatio 1.1 => avg 1.0 => 2 stars
    expect(calculateStars(9, 93.5, 10, 85)).toBe(2)
  })
})
