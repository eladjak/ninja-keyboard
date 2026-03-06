import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameZone, HebrewHoliday } from '@/lib/audio/music-manager'

// ---------------------------------------------------------------------------
// Track unlock conditions
// ---------------------------------------------------------------------------

/** Condition types for unlocking tracks in the jukebox. */
export interface TrackUnlockCondition {
  /** The type of condition */
  type: 'free' | 'badge' | 'wpm' | 'accuracy' | 'lessons' | 'battle-win' | 'level'
  /** The required value (badge ID, WPM threshold, etc.) */
  value: string | number
  /** Hebrew description for the UI */
  label: string
}

/** Maps track IDs to their unlock conditions. */
export const TRACK_UNLOCK_CONDITIONS: Record<string, TrackUnlockCondition> = {
  // P0 -- Free from start
  'PLAY-001': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'EVENT-001': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'EVENT-002': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'EVENT-003': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'EVENT-004': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'MENU-001': { type: 'free', value: 0, label: 'זמין מההתחלה' },
  'CHAR-001': { type: 'free', value: 0, label: 'זמין מההתחלה' },

  // P1 -- Easy achievements
  'PLAY-004': { type: 'wpm', value: 40, label: 'השג 40 WPM' },
  'BATTLE-002': { type: 'battle-win', value: 'shadow-cat', label: 'נצח את שאדו קאט' },
  'BATTLE-003': { type: 'battle-win', value: 'storm-fox', label: 'נצח את סטורם פוקס' },

  // P2 -- Medium achievements
  'PLAY-002': { type: 'lessons', value: 10, label: 'השלם 10 שיעורים' },
  'BATTLE-001': { type: 'level', value: 5, label: 'הגע לרמה 5' },
  'CHAR-003': { type: 'lessons', value: 1, label: 'השלם שיעור ראשון' },
  'CHAR-004': { type: 'badge', value: 'met-bug', label: 'פגוש את באג' },
  'WORLD-003': { type: 'level', value: 3, label: 'הגע לרמת גזע' },

  // Boss tracks
  'BOSS-001': { type: 'level', value: 10, label: 'הגע לקרב בוס ראשון' },
  'BOSS-002': { type: 'badge', value: 'final-boss-reached', label: 'הגע לקרב הבוס הסופי' },
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface MusicState {
  /** Currently active game zone (or null if no music). */
  currentZone: GameZone | null

  /** Current track source path. */
  currentTrack: string | null

  /** Music volume (0-1), separate from SFX. */
  musicVolume: number

  /** Whether music is muted. */
  musicMuted: boolean

  /** Whether music is enabled globally. */
  musicEnabled: boolean

  /** Whether music is currently playing. */
  isPlaying: boolean

  /** Set of unlocked track IDs. */
  unlockedTracks: string[]

  /** Zone-to-track overrides from the jukebox. */
  zoneOverrides: Partial<Record<GameZone, string>>

  /** Currently active holiday override (or null). */
  activeHoliday: HebrewHoliday | null

  // --- Actions ---

  /** Set the current zone (triggers MusicManager playback via the provider). */
  setZone: (zone: GameZone | null) => void

  /** Update the current track (called by the provider after MusicManager starts playing). */
  setCurrentTrack: (track: string | null) => void

  /** Set the music volume. */
  setMusicVolume: (volume: number) => void

  /** Toggle music mute state. */
  toggleMusicMute: () => void

  /** Toggle music enabled state. */
  toggleMusicEnabled: () => void

  /** Set playing state. */
  setIsPlaying: (playing: boolean) => void

  /** Unlock a track by ID. */
  unlockTrack: (trackId: string) => void

  /** Check if a track is unlocked. */
  isTrackUnlocked: (trackId: string) => boolean

  /** Set a zone override for the jukebox. */
  setZoneOverride: (zone: GameZone, trackSrc: string | null) => void

  /** Clear all zone overrides. */
  clearZoneOverrides: () => void

  /** Set the active holiday override. */
  setActiveHoliday: (holiday: HebrewHoliday | null) => void

  /** Get the total number of tracks. */
  getTotalTracks: () => number

  /** Get the number of unlocked tracks. */
  getUnlockedCount: () => number
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

/** Initial set of tracks that are free from the start. */
const FREE_TRACKS = Object.entries(TRACK_UNLOCK_CONDITIONS)
  .filter(([, condition]) => condition.type === 'free')
  .map(([id]) => id)

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      currentZone: null,
      currentTrack: null,
      musicVolume: 0.5,
      musicMuted: false,
      musicEnabled: true,
      isPlaying: false,
      unlockedTracks: [...FREE_TRACKS],
      zoneOverrides: {},
      activeHoliday: null,

      setZone: (zone) => set({ currentZone: zone }),

      setCurrentTrack: (track) => set({ currentTrack: track }),

      setMusicVolume: (volume) =>
        set({ musicVolume: Math.max(0, Math.min(1, volume)) }),

      toggleMusicMute: () => set((s) => ({ musicMuted: !s.musicMuted })),

      toggleMusicEnabled: () =>
        set((s) => ({ musicEnabled: !s.musicEnabled })),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      unlockTrack: (trackId) =>
        set((s) => {
          if (s.unlockedTracks.includes(trackId)) return s
          return { unlockedTracks: [...s.unlockedTracks, trackId] }
        }),

      isTrackUnlocked: (trackId) => {
        const state = get()
        return state.unlockedTracks.includes(trackId)
      },

      setZoneOverride: (zone, trackSrc) =>
        set((s) => {
          const overrides = { ...s.zoneOverrides }
          if (trackSrc === null) {
            delete overrides[zone]
          } else {
            overrides[zone] = trackSrc
          }
          return { zoneOverrides: overrides }
        }),

      clearZoneOverrides: () => set({ zoneOverrides: {} }),

      setActiveHoliday: (holiday) => set({ activeHoliday: holiday }),

      getTotalTracks: () => Object.keys(TRACK_UNLOCK_CONDITIONS).length,

      getUnlockedCount: () => get().unlockedTracks.length,
    }),
    {
      name: 'ninja-keyboard-music',
      partialize: (state) => ({
        musicVolume: state.musicVolume,
        musicMuted: state.musicMuted,
        musicEnabled: state.musicEnabled,
        unlockedTracks: state.unlockedTracks,
        zoneOverrides: state.zoneOverrides,
      }),
    },
  ),
)
