/**
 * Tests for the guest -> account merge resolver (blueprint Step C / F3).
 *
 * Covers the highest-risk cases:
 *  - numeric bests/totals take the max
 *  - per-lesson records merge (max wpm/accuracy, summed attempts)
 *  - badges / unlocked characters / story flags union
 *  - daily challenges union (max xp, earliest timestamp)
 *  - server-wins-on-tie semantics, no clobber of either side
 *  - merged result carries a migratedAt stamp (double-merge guard)
 */

import { describe, it, expect } from 'vitest'
import { mergeSnapshots } from './merge'
import {
  emptyProgressSnapshot,
  type ProgressSnapshot,
  type StorySnapshot,
} from './snapshot'
import type { StoryFlags } from '@/types/story'

const FLAGS_OFF: StoryFlags = {
  bugFirstAppearance: false,
  mikaJoined: false,
  senseiIntroduced: false,
  noaJoined: false,
  lunaJoined: false,
  glitchRevealed: false,
  finalBossDefeated: false,
}

function story(partial: Partial<StorySnapshot>): StorySnapshot {
  return {
    currentAct: 1,
    unlockedCharacters: ['ki'],
    storyFlags: { ...FLAGS_OFF },
    seenStoryBeats: {},
    seenDialogBeats: {},
    dialogChoices: {},
    bossResults: {},
    storyEnabled: true,
    ...partial,
  }
}

describe('mergeSnapshots', () => {
  it('takes max on numeric totals', () => {
    const local: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      totalXp: 100,
      level: 3,
      streak: 5,
    }
    const server: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      totalXp: 250,
      level: 5,
      streak: 2,
    }
    const merged = mergeSnapshots(local, server)
    expect(merged.totalXp).toBe(250)
    expect(merged.level).toBe(5)
    expect(merged.streak).toBe(5)
  })

  it('merges per-lesson records: max wpm/accuracy, summed attempts', () => {
    const local: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      completedLessons: {
        'lesson-1': {
          lessonId: 'lesson-1',
          bestWpm: 30,
          bestAccuracy: 90,
          completedAt: 1000,
          attempts: 2,
        },
      },
    }
    const server: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      completedLessons: {
        'lesson-1': {
          lessonId: 'lesson-1',
          bestWpm: 45,
          bestAccuracy: 85,
          completedAt: 2000,
          attempts: 3,
        },
        'lesson-2': {
          lessonId: 'lesson-2',
          bestWpm: 20,
          bestAccuracy: 95,
          completedAt: 1500,
          attempts: 1,
        },
      },
    }
    const merged = mergeSnapshots(local, server)
    expect(merged.completedLessons['lesson-1'].bestWpm).toBe(45)
    expect(merged.completedLessons['lesson-1'].bestAccuracy).toBe(90)
    expect(merged.completedLessons['lesson-1'].completedAt).toBe(2000)
    expect(merged.completedLessons['lesson-1'].attempts).toBe(5)
    // lesson-2 only on server -> preserved
    expect(merged.completedLessons['lesson-2'].bestWpm).toBe(20)
  })

  it('unions badges without clobbering either side', () => {
    const local: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      earnedBadges: { 'first-lesson': { earnedAt: '2026-01-01' } },
    }
    const server: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      earnedBadges: { 'speed-demon': { earnedAt: '2026-02-01' } },
    }
    const merged = mergeSnapshots(local, server)
    expect(Object.keys(merged.earnedBadges).sort()).toEqual([
      'first-lesson',
      'speed-demon',
    ])
  })

  it('unions daily challenges: max xp, earliest timestamp', () => {
    const local: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      dailyChallenges: {
        '2026-06-01': { completedAt: 5000, xpEarned: 10 },
        '2026-06-02': { completedAt: 6000, xpEarned: 15 },
      },
    }
    const server: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      dailyChallenges: {
        '2026-06-01': { completedAt: 4000, xpEarned: 20 },
      },
    }
    const merged = mergeSnapshots(local, server)
    expect(merged.dailyChallenges['2026-06-01']).toEqual({
      completedAt: 4000,
      xpEarned: 20,
    })
    expect(merged.dailyChallenges['2026-06-02'].xpEarned).toBe(15)
  })

  it('unions unlocked characters and ORs story flags', () => {
    const local: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      story: story({
        unlockedCharacters: ['ki', 'mika'],
        storyFlags: { ...FLAGS_OFF, mikaJoined: true },
        currentAct: 2,
      }),
    }
    const server: ProgressSnapshot = {
      ...emptyProgressSnapshot(),
      story: story({
        unlockedCharacters: ['ki', 'noa'],
        storyFlags: { ...FLAGS_OFF, noaJoined: true },
        currentAct: 1,
      }),
    }
    const merged = mergeSnapshots(local, server)
    expect(merged.story?.unlockedCharacters.sort()).toEqual(['ki', 'mika', 'noa'])
    expect(merged.story?.storyFlags.mikaJoined).toBe(true)
    expect(merged.story?.storyFlags.noaJoined).toBe(true)
    expect(merged.story?.currentAct).toBe(2)
  })

  it('keeps the server story when local has none, and vice versa', () => {
    const onlyServer = mergeSnapshots(
      { ...emptyProgressSnapshot(), story: null },
      { ...emptyProgressSnapshot(), story: story({ currentAct: 3 }) },
    )
    expect(onlyServer.story?.currentAct).toBe(3)

    const onlyLocal = mergeSnapshots(
      { ...emptyProgressSnapshot(), story: story({ currentAct: 2 }) },
      { ...emptyProgressSnapshot(), story: null },
    )
    expect(onlyLocal.story?.currentAct).toBe(2)
  })

  it('stamps migratedAt on the merged result', () => {
    const merged = mergeSnapshots(
      emptyProgressSnapshot(),
      emptyProgressSnapshot(),
    )
    expect(typeof merged.migratedAt).toBe('string')
    expect(merged.migratedAt).not.toBeNull()
  })

  it('takes the later lastPracticeDate', () => {
    const merged = mergeSnapshots(
      { ...emptyProgressSnapshot(), lastPracticeDate: '2026-06-01' },
      { ...emptyProgressSnapshot(), lastPracticeDate: '2026-06-05' },
    )
    expect(merged.lastPracticeDate).toBe('2026-06-05')
  })
})
