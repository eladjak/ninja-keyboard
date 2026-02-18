import { describe, it, expect } from 'vitest'
import {
  getNinjaRank,
  getRankDisplayName,
  getRankEmoji,
  calculateTotalTypingTime,
  getNextMilestone,
  calculateCompletionPercentage,
} from '@/lib/profile/profile-utils'

describe('getNinjaRank', () => {
  it('returns beginner for level 1', () => {
    expect(getNinjaRank(1)).toBe('beginner')
  })

  it('returns beginner for level 4', () => {
    expect(getNinjaRank(4)).toBe('beginner')
  })

  it('returns apprentice for level 5', () => {
    expect(getNinjaRank(5)).toBe('apprentice')
  })

  it('returns apprentice for level 9', () => {
    expect(getNinjaRank(9)).toBe('apprentice')
  })

  it('returns warrior for level 10', () => {
    expect(getNinjaRank(10)).toBe('warrior')
  })

  it('returns warrior for level 14', () => {
    expect(getNinjaRank(14)).toBe('warrior')
  })

  it('returns master for level 15', () => {
    expect(getNinjaRank(15)).toBe('master')
  })

  it('returns master for level 18', () => {
    expect(getNinjaRank(18)).toBe('master')
  })

  it('returns grandmaster for level 19', () => {
    expect(getNinjaRank(19)).toBe('grandmaster')
  })

  it('returns grandmaster for level 20', () => {
    expect(getNinjaRank(20)).toBe('grandmaster')
  })

  it('clamps level below 1 to beginner', () => {
    expect(getNinjaRank(0)).toBe('beginner')
    expect(getNinjaRank(-5)).toBe('beginner')
  })

  it('clamps level above 20 to grandmaster', () => {
    expect(getNinjaRank(25)).toBe('grandmaster')
  })
})

describe('getRankDisplayName', () => {
  it('returns Hebrew name for beginner', () => {
    expect(getRankDisplayName('beginner')).toBe('מתחיל')
  })

  it('returns Hebrew name for apprentice', () => {
    expect(getRankDisplayName('apprentice')).toBe('חניך')
  })

  it('returns Hebrew name for warrior', () => {
    expect(getRankDisplayName('warrior')).toBe('לוחם')
  })

  it('returns Hebrew name for master', () => {
    expect(getRankDisplayName('master')).toBe('מאסטר')
  })

  it('returns Hebrew name for grandmaster', () => {
    expect(getRankDisplayName('grandmaster')).toBe('גרנדמאסטר')
  })
})

describe('getRankEmoji', () => {
  it('returns correct emoji for each rank', () => {
    expect(getRankEmoji('beginner')).toBe('🥋')
    expect(getRankEmoji('apprentice')).toBe('🥷')
    expect(getRankEmoji('warrior')).toBe('⚔️')
    expect(getRankEmoji('master')).toBe('👑')
    expect(getRankEmoji('grandmaster')).toBe('🏆')
  })
})

describe('calculateTotalTypingTime', () => {
  it('returns minutes only when under 1 hour', () => {
    expect(calculateTotalTypingTime([10, 20, 15])).toBe('45 דקות')
  })

  it('returns hours and minutes', () => {
    expect(calculateTotalTypingTime([60, 30])).toBe('1 שעות 30 דקות')
  })

  it('returns hours only when minutes are 0', () => {
    expect(calculateTotalTypingTime([60, 60])).toBe('2 שעות')
  })

  it('returns 0 minutes for empty array', () => {
    expect(calculateTotalTypingTime([])).toBe('0 דקות')
  })

  it('handles large values', () => {
    expect(calculateTotalTypingTime([180, 60, 30])).toBe('4 שעות 30 דקות')
  })
})

describe('getNextMilestone', () => {
  it('returns 100 milestone for xp=0', () => {
    expect(getNextMilestone(0)).toEqual({
      target: 100,
      label: '100 נקודות ניסיון',
    })
  })

  it('returns 250 milestone for xp=150', () => {
    expect(getNextMilestone(150)).toEqual({
      target: 250,
      label: '250 נקודות ניסיון',
    })
  })

  it('returns next 1000-interval for xp past all milestones', () => {
    const result = getNextMilestone(10500)
    expect(result.target).toBe(11000)
  })

  it('returns 1000 milestone for xp=999', () => {
    expect(getNextMilestone(999)).toEqual({
      target: 1000,
      label: '1,000 נקודות ניסיון',
    })
  })
})

describe('calculateCompletionPercentage', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateCompletionPercentage(0, 0)).toBe(0)
  })

  it('returns 50 for half complete', () => {
    expect(calculateCompletionPercentage(5, 10)).toBe(50)
  })

  it('returns 100 for fully complete', () => {
    expect(calculateCompletionPercentage(10, 10)).toBe(100)
  })

  it('caps at 100 even if completed exceeds total', () => {
    expect(calculateCompletionPercentage(15, 10)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateCompletionPercentage(1, 3)).toBe(33)
  })
})
