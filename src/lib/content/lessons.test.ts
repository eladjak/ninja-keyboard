import { describe, it, expect } from 'vitest'
import { LESSONS, getLessonById, getLessonByLevel } from './lessons'
import { SHORTCUT_LESSONS } from './shortcuts'

describe('LESSONS', () => {
  it('contains 25 lessons with sequential levels', () => {
    expect(LESSONS).toHaveLength(25)
    LESSONS.forEach((lesson, i) => {
      expect(lesson.level).toBe(i + 1)
    })
  })

  it('keeps the original typing IDs and appends the existing shortcut lessons', () => {
    expect(LESSONS.slice(0, 20).map((lesson) => lesson.id)).toEqual(
      Array.from(
        { length: 20 },
        (_, index) => `lesson-${String(index + 1).padStart(2, '0')}`,
      ),
    )
    expect(LESSONS.slice(20).map((lesson) => lesson.id)).toEqual(
      SHORTCUT_LESSONS.map((lesson) => lesson.id),
    )
  })

  it('every lesson has a Hebrew story intro and outro (Ki journey arc)', () => {
    for (const lesson of LESSONS) {
      expect(lesson.storyIntroHe, `${lesson.id} missing storyIntroHe`).toBeTruthy()
      expect(lesson.storyOutroHe, `${lesson.id} missing storyOutroHe`).toBeTruthy()
      // Must contain Hebrew characters
      expect(lesson.storyIntroHe).toMatch(/[֐-׿]/)
      expect(lesson.storyOutroHe).toMatch(/[֐-׿]/)
      // Short beats: 1-2 lines, not essays
      expect(lesson.storyIntroHe!.length).toBeLessThanOrEqual(160)
      expect(lesson.storyOutroHe!.length).toBeLessThanOrEqual(160)
    }
  })

  it('story beats are unique across lessons', () => {
    const intros = LESSONS.map((l) => l.storyIntroHe)
    const outros = LESSONS.map((l) => l.storyOutroHe)
    expect(new Set(intros).size).toBe(LESSONS.length)
    expect(new Set(outros).size).toBe(LESSONS.length)
  })

  it('act arc anchors are present (awakening, training, final boss)', () => {
    // Act 1 opener: the glowing keyboard discovery
    expect(getLessonByLevel(1)?.storyIntroHe).toContain('מקלדת זוהרת')
    // Act 2 opener: Sensei Zen arrives physically
    expect(getLessonByLevel(8)?.storyIntroHe).toContain('סנסאי זן')
    // Glitch redemption beat
    expect(getLessonByLevel(18)?.storyIntroHe).toContain("גליץ'")
    // Final boss: Bug King
    expect(getLessonByLevel(20)?.storyIntroHe).toContain('מלך הבאגים')
  })

  it('getLessonById returns the right lesson', () => {
    expect(getLessonById('lesson-05')?.level).toBe(5)
    expect(getLessonById('shortcut-lesson-basic')?.level).toBe(21)
    expect(getLessonById('nope')).toBeUndefined()
  })
})
