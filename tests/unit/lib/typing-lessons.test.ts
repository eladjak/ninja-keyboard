import { describe, it, expect } from 'vitest'
import {
  LESSONS,
  getLessonById,
  getLessonByLevel,
  getLessonsByCategory,
} from '@/lib/content/lessons'
import { getLessonContent, getRandomLine, getLessonLines } from '@/lib/content/sentences'

describe('LESSONS', () => {
  it('has exactly 20 lessons', () => {
    expect(LESSONS).toHaveLength(20)
  })

  it('lessons are in order by level', () => {
    for (let i = 1; i < LESSONS.length; i++) {
      expect(LESSONS[i].level).toBeGreaterThan(LESSONS[i - 1].level)
    }
  })

  it('every lesson has a unique ID', () => {
    const ids = new Set(LESSONS.map((l) => l.id))
    expect(ids.size).toBe(LESSONS.length)
  })

  it('every lesson has Hebrew title and description', () => {
    for (const lesson of LESSONS) {
      expect(lesson.titleHe.length).toBeGreaterThan(0)
      expect(lesson.descriptionHe.length).toBeGreaterThan(0)
    }
  })

  it('lesson levels go from 1 to 20', () => {
    expect(LESSONS[0].level).toBe(1)
    expect(LESSONS[LESSONS.length - 1].level).toBe(20)
  })
})

describe('getLessonById', () => {
  it('finds lesson-01', () => {
    const lesson = getLessonById('lesson-01')
    expect(lesson).toBeDefined()
    expect(lesson!.level).toBe(1)
  })

  it('returns undefined for unknown ID', () => {
    expect(getLessonById('nonexistent')).toBeUndefined()
  })
})

describe('getLessonByLevel', () => {
  it('finds lesson by level number', () => {
    const lesson = getLessonByLevel(5)
    expect(lesson).toBeDefined()
    expect(lesson!.id).toBe('lesson-05')
  })

  it('returns undefined for level 0', () => {
    expect(getLessonByLevel(0)).toBeUndefined()
  })
})

describe('getLessonsByCategory', () => {
  it('finds home-row lessons', () => {
    const homeRow = getLessonsByCategory('home-row')
    expect(homeRow.length).toBeGreaterThanOrEqual(3)
    for (const l of homeRow) {
      expect(l.category).toBe('home-row')
    }
  })
})

describe('getLessonContent', () => {
  it('returns content for every lesson', () => {
    for (const lesson of LESSONS) {
      const content = getLessonContent(lesson.id)
      expect(content).toBeDefined()
      expect(content!.lines.length).toBeGreaterThan(0)
    }
  })

  it('returns undefined for unknown lesson', () => {
    expect(getLessonContent('nonexistent')).toBeUndefined()
  })
})

describe('getRandomLine', () => {
  it('returns a string for valid lesson', () => {
    const line = getRandomLine('lesson-01')
    expect(typeof line).toBe('string')
    expect(line!.length).toBeGreaterThan(0)
  })

  it('returns undefined for unknown lesson', () => {
    expect(getRandomLine('nonexistent')).toBeUndefined()
  })
})

describe('getLessonLines', () => {
  it('returns all lines for a lesson', () => {
    const lines = getLessonLines('lesson-01')
    expect(lines.length).toBeGreaterThan(0)
  })

  it('returns shuffled lines when shuffle=true', () => {
    const original = getLessonLines('lesson-12')
    const shuffled = getLessonLines('lesson-12', true)
    expect(shuffled.length).toBe(original.length)
    // Content should be the same set
    expect(shuffled.sort()).toEqual(original.sort())
  })

  it('returns empty array for unknown lesson', () => {
    expect(getLessonLines('nonexistent')).toEqual([])
  })
})
