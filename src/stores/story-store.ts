import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CharacterName, DialogChoice, StoryFlags } from '@/types/story'

interface BossResult {
  defeated: boolean
  attempts: number
  bestAccuracy: number
}

interface SeenBeats {
  pre: boolean
  post: boolean
}

/** A recorded choice the player made during a dialog beat */
interface RecordedChoice {
  lineId: string
  choiceId: string
  characterEffect?: { character: CharacterName; delta: number }
}

interface StoryState {
  /** Current story act (1-3) */
  currentAct: 1 | 2 | 3
  /** Characters the player has unlocked through story progression */
  unlockedCharacters: CharacterName[]
  /** Flags tracking major story milestones */
  storyFlags: StoryFlags
  /** Which story beats the player has already seen, keyed by lesson number */
  seenStoryBeats: Record<number, SeenBeats>
  /** Which dialog beats have been seen, keyed by beat id (e.g., 'ch1-1-discover-dojo') */
  seenDialogBeats: Record<string, boolean>
  /** Player choices made during dialog beats, keyed by beat id */
  dialogChoices: Record<string, RecordedChoice[]>
  /** Boss encounter results, keyed by lesson number */
  bossResults: Record<number, BossResult>
  /** Whether story mode is enabled (user can toggle off) */
  storyEnabled: boolean

  /** Mark a story beat as seen for a given lesson and phase */
  markBeatSeen: (lessonNumber: number, phase: 'pre' | 'post') => void
  /** Mark a dialog beat as seen by its id */
  markDialogBeatSeen: (beatId: string) => void
  /** Check if a dialog beat has been seen */
  isDialogBeatSeen: (beatId: string) => boolean
  /** Record a choice made during a dialog beat */
  recordDialogChoice: (beatId: string, lineId: string, choice: DialogChoice) => void
  /** Add a character to the unlocked list */
  unlockCharacter: (character: CharacterName) => void
  /** Set a specific story flag to true */
  setStoryFlag: (flag: keyof StoryFlags) => void
  /** Record the result of a boss encounter */
  recordBossResult: (
    lessonNumber: number,
    defeated: boolean,
    accuracy: number,
  ) => void
  /** Toggle story mode on/off */
  toggleStory: () => void
  /** Derive the current act from highest completed lesson number */
  getCurrentAct: (highestCompletedLesson: number) => 1 | 2 | 3
}

const DEFAULT_FLAGS: StoryFlags = {
  bugFirstAppearance: false,
  mikaJoined: false,
  senseiIntroduced: false,
  noaJoined: false,
  lunaJoined: false,
  glitchRevealed: false,
  finalBossDefeated: false,
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      currentAct: 1,
      unlockedCharacters: ['ki'] as CharacterName[],
      storyFlags: { ...DEFAULT_FLAGS },
      seenStoryBeats: {},
      seenDialogBeats: {},
      dialogChoices: {},
      bossResults: {},
      storyEnabled: true,

      markBeatSeen: (lessonNumber, phase) =>
        set((s) => {
          const existing = s.seenStoryBeats[lessonNumber] ?? {
            pre: false,
            post: false,
          }
          return {
            seenStoryBeats: {
              ...s.seenStoryBeats,
              [lessonNumber]: {
                ...existing,
                [phase]: true,
              },
            },
          }
        }),

      markDialogBeatSeen: (beatId) =>
        set((s) => ({
          seenDialogBeats: {
            ...s.seenDialogBeats,
            [beatId]: true,
          },
        })),

      isDialogBeatSeen: (beatId) => {
        return get().seenDialogBeats[beatId] === true
      },

      recordDialogChoice: (beatId, lineId, choice) =>
        set((s) => {
          const existing = s.dialogChoices[beatId] ?? []
          const recorded: RecordedChoice = {
            lineId,
            choiceId: choice.id,
            characterEffect: choice.relationshipEffect,
          }
          return {
            dialogChoices: {
              ...s.dialogChoices,
              [beatId]: [...existing, recorded],
            },
          }
        }),

      unlockCharacter: (character) =>
        set((s) => {
          if (s.unlockedCharacters.includes(character)) return s
          return {
            unlockedCharacters: [...s.unlockedCharacters, character],
          }
        }),

      setStoryFlag: (flag) =>
        set((s) => ({
          storyFlags: {
            ...s.storyFlags,
            [flag]: true,
          },
        })),

      recordBossResult: (lessonNumber, defeated, accuracy) =>
        set((s) => {
          const existing = s.bossResults[lessonNumber]
          const attempts = existing ? existing.attempts + 1 : 1
          const bestAccuracy = existing
            ? Math.max(existing.bestAccuracy, accuracy)
            : accuracy

          return {
            bossResults: {
              ...s.bossResults,
              [lessonNumber]: {
                defeated: existing?.defeated || defeated,
                attempts,
                bestAccuracy,
              },
            },
          }
        }),

      toggleStory: () =>
        set((s) => ({
          storyEnabled: !s.storyEnabled,
        })),

      getCurrentAct: (highestCompletedLesson) => {
        if (highestCompletedLesson >= 15) {
          set({ currentAct: 3 })
          return 3
        }
        if (highestCompletedLesson >= 8) {
          set({ currentAct: 2 })
          return 2
        }
        set({ currentAct: 1 })
        return 1
      },
    }),
    { name: 'ninja-keyboard-story' },
  ),
)
