'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  musicManager,
  type GameZone,
} from '@/lib/audio/music-manager'
import { useMusicStore } from '@/stores/music-store'

// ---------------------------------------------------------------------------
// Route -> Zone mapping
// ---------------------------------------------------------------------------

/**
 * Maps Next.js route pathname segments to game zones.
 * The first matching prefix wins.
 */
const ROUTE_ZONE_MAP: Array<{ prefix: string; zone: GameZone }> = [
  { prefix: '/home', zone: 'home' },
  { prefix: '/lessons', zone: 'lessons-easy' },
  { prefix: '/practice', zone: 'lessons-easy' },
  { prefix: '/battle', zone: 'battle-arena' },
  { prefix: '/speed-test', zone: 'speed-test' },
  { prefix: '/speed', zone: 'speed-test' },
  { prefix: '/games', zone: 'games-hub' },
  { prefix: '/profile', zone: 'profile' },
  { prefix: '/progress', zone: 'profile' },
  { prefix: '/story', zone: 'story-mode' },
  { prefix: '/settings', zone: 'menu' },
  { prefix: '/jukebox', zone: 'menu' },
]

/** Resolve the current route to a GameZone. Defaults to 'home'. */
function routeToZone(pathname: string): GameZone {
  for (const { prefix, zone } of ROUTE_ZONE_MAP) {
    if (pathname.startsWith(prefix)) return zone
  }
  return 'home'
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface MusicContextValue {
  /** Play zone music. */
  playZone: (zone: GameZone) => void
  /** Stop all music. */
  stopAll: () => void
  /** Play a stinger/jingle by ID. */
  playStinger: (stingerId: string) => void
  /** Play a specific track for preview. */
  playTrack: (src: string, loop?: boolean) => void
  /** Set music volume. */
  setVolume: (volume: number) => void
  /** Toggle mute. */
  toggleMute: () => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const initedRef = useRef(false)

  // Zustand selectors
  const musicEnabled = useMusicStore((s) => s.musicEnabled)
  const musicVolume = useMusicStore((s) => s.musicVolume)
  const musicMuted = useMusicStore((s) => s.musicMuted)
  const zoneOverrides = useMusicStore((s) => s.zoneOverrides)
  const activeHoliday = useMusicStore((s) => s.activeHoliday)
  const setZone = useMusicStore((s) => s.setZone)
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack)
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying)

  // Zustand actions used in context value
  const setMusicVolume = useMusicStore((s) => s.setMusicVolume)
  const toggleMusicMute = useMusicStore((s) => s.toggleMusicMute)

  // ---- Sync volume to MusicManager ----
  useEffect(() => {
    musicManager.setVolume(musicVolume)
  }, [musicVolume])

  useEffect(() => {
    musicManager.setMuted(musicMuted)
  }, [musicMuted])

  // ---- Sync zone overrides to MusicManager ----
  useEffect(() => {
    // Clear old overrides in the manager, then set new ones
    musicManager.clearAllOverrides()
    for (const [zone, src] of Object.entries(zoneOverrides)) {
      if (src) {
        musicManager.setZoneOverride(zone as GameZone, src)
      }
    }
  }, [zoneOverrides])

  // ---- Holiday override ----
  useEffect(() => {
    musicManager.setHolidayOverride(activeHoliday)
  }, [activeHoliday])

  // ---- Route-based zone auto-play ----
  useEffect(() => {
    if (!musicEnabled) {
      musicManager.stopAll()
      setIsPlaying(false)
      return
    }

    const zone = routeToZone(pathname)
    setZone(zone)
    musicManager.playZone(zone)
    setIsPlaying(true)

    // Preload adjacent zones for instant transitions
    const adjacentZones = getAdjacentZones(zone)
    for (const adj of adjacentZones) {
      musicManager.preloadZone(adj)
    }

    initedRef.current = true
  }, [pathname, musicEnabled, setZone, setIsPlaying])

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      musicManager.dispose()
    }
  }, [])

  // ---- Context value ----
  const playZone = useCallback(
    (zone: GameZone) => {
      if (!musicEnabled) return
      setZone(zone)
      musicManager.playZone(zone)
      setIsPlaying(true)
    },
    [musicEnabled, setZone, setIsPlaying],
  )

  const stopAll = useCallback(() => {
    musicManager.stopAll()
    setZone(null)
    setCurrentTrack(null)
    setIsPlaying(false)
  }, [setZone, setCurrentTrack, setIsPlaying])

  const playStinger = useCallback(
    (stingerId: string) => {
      if (!musicEnabled) return
      void musicManager.playStinger(stingerId)
    },
    [musicEnabled],
  )

  const playTrack = useCallback(
    (src: string, loop: boolean = false) => {
      void musicManager.playTrack(src, loop)
      setIsPlaying(true)
    },
    [setIsPlaying],
  )

  const setVolume = useCallback(
    (volume: number) => {
      setMusicVolume(volume)
      musicManager.setVolume(volume)
    },
    [setMusicVolume],
  )

  const toggleMute = useCallback(() => {
    toggleMusicMute()
  }, [toggleMusicMute])

  const contextValue: MusicContextValue = {
    playZone,
    stopAll,
    playStinger,
    playTrack,
    setVolume,
    toggleMute,
  }

  return (
    <MusicContext.Provider value={contextValue}>{children}</MusicContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** Access music playback controls. Must be used within <MusicProvider>. */
export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext)
  if (!ctx) {
    throw new Error('useMusic must be used within a <MusicProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get zones that are likely to be navigated to next, for preloading. */
function getAdjacentZones(current: GameZone): GameZone[] {
  const adjacencyMap: Partial<Record<GameZone, GameZone[]>> = {
    home: ['lessons-easy', 'battle-arena', 'games-hub', 'profile'],
    'lessons-easy': ['home', 'lessons-medium'],
    'lessons-medium': ['lessons-easy', 'lessons-hard'],
    'lessons-hard': ['lessons-medium', 'home'],
    'battle-arena': ['home', 'boss-battle'],
    'speed-test': ['home'],
    'games-hub': ['home'],
    profile: ['home', 'menu'],
    'story-mode': ['home', 'boss-battle'],
    'boss-battle': ['battle-arena', 'victory', 'defeat'],
    'boss-battle-final': ['victory', 'defeat'],
    menu: ['home'],
    victory: ['home'],
    defeat: ['home', 'battle-arena'],
    loading: ['home'],
  }
  return adjacencyMap[current] ?? ['home']
}
