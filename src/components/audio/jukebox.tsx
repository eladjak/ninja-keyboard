'use client'

import { useState, useCallback, useMemo } from 'react'
import { Play, Pause, Lock, Unlock, Music, Volume2 } from 'lucide-react'
import { TRACK_MANIFEST, type GameZone } from '@/lib/audio/music-manager'
import {
  useMusicStore,
  TRACK_UNLOCK_CONDITIONS,
} from '@/stores/music-store'
import { useMusic } from './music-provider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JukeboxCategory =
  | 'all'
  | 'gameplay'
  | 'battle'
  | 'characters'
  | 'events'

interface CategoryTab {
  id: JukeboxCategory
  label: string
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'הכל' },
  { id: 'gameplay', label: 'משחק' },
  { id: 'battle', label: 'קרבות' },
  { id: 'characters', label: 'דמויות' },
  { id: 'events', label: 'אירועים' },
]

/** Map track IDs to categories based on their prefix. */
function trackCategory(trackId: string): JukeboxCategory {
  if (trackId.startsWith('PLAY-') || trackId.startsWith('MENU-') || trackId.startsWith('WORLD-')) return 'gameplay'
  if (trackId.startsWith('BATTLE-') || trackId.startsWith('BOSS-')) return 'battle'
  if (trackId.startsWith('CHAR-')) return 'characters'
  if (trackId.startsWith('EVENT-')) return 'events'
  return 'gameplay'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CollectionProgress({
  unlocked,
  total,
}: {
  unlocked: number
  total: number
}) {
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0

  return (
    <div className="game-card mb-6 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-[var(--game-accent-purple)]" />
          <span className="text-sm font-bold">אוסף המוזיקה שלי</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {unlocked}/{total} רצועות נאספו
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--game-bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[var(--game-accent-purple)] to-[var(--game-accent-green)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function TrackCard({
  track,
  isUnlocked,
  isCurrentlyPlaying,
  onPlay,
  onStop,
  onSetOverride,
}: {
  track: (typeof TRACK_MANIFEST)[number]
  isUnlocked: boolean
  isCurrentlyPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onSetOverride: () => void
}) {
  const condition = TRACK_UNLOCK_CONDITIONS[track.id]

  return (
    <div
      className={`game-card p-4 transition-all duration-200 ${
        isUnlocked
          ? 'hover:border-[var(--game-accent-purple)] cursor-pointer'
          : 'opacity-60'
      } ${isCurrentlyPlaying ? 'border-[var(--game-accent-green)] shadow-[0_0_12px_var(--game-glow-green)]' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <Unlock className="h-3.5 w-3.5 text-[var(--game-accent-green)] flex-shrink-0" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <h3 className="text-sm font-bold truncate">
              {isUnlocked ? track.name : '???'}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {track.genre}
          </p>
        </div>

        {/* Play/Pause button */}
        {isUnlocked && (
          <button
            type="button"
            onClick={isCurrentlyPlaying ? onStop : onPlay}
            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
              isCurrentlyPlaying
                ? 'bg-[var(--game-accent-green)] text-black'
                : 'bg-[var(--game-bg-elevated)] hover:bg-[var(--game-accent-purple)] text-foreground hover:text-white'
            }`}
            aria-label={isCurrentlyPlaying ? 'עצור' : 'נגן'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ms-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Track info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{track.id}</span>
        <span>
          {track.loop ? 'לולאה' : `${track.durationHint} שניות`}
        </span>
      </div>

      {/* Unlock hint or set-as-zone button */}
      {isUnlocked ? (
        <button
          type="button"
          onClick={onSetOverride}
          className="mt-2 text-xs text-[var(--game-accent-purple)] hover:text-[var(--game-accent-green)] transition-colors"
        >
          הגדר כמוזיקת זירה
        </button>
      ) : (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>{condition?.label ?? 'לא זמין'}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Jukebox Component
// ---------------------------------------------------------------------------

export function Jukebox() {
  const [activeCategory, setActiveCategory] = useState<JukeboxCategory>('all')
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<GameZone | null>(null)

  const unlockedTracks = useMusicStore((s) => s.unlockedTracks)
  const setZoneOverride = useMusicStore((s) => s.setZoneOverride)
  const clearZoneOverrides = useMusicStore((s) => s.clearZoneOverrides)

  const { playTrack, stopAll } = useMusic()

  const totalTracks = Object.keys(TRACK_UNLOCK_CONDITIONS).length
  const unlockedCount = unlockedTracks.length

  // Filter tracks by category
  const filteredTracks = useMemo(() => {
    if (activeCategory === 'all') return TRACK_MANIFEST
    return TRACK_MANIFEST.filter((t) => trackCategory(t.id) === activeCategory)
  }, [activeCategory])

  const handlePlay = useCallback(
    (track: (typeof TRACK_MANIFEST)[number]) => {
      playTrack(track.src, track.loop)
      setPlayingTrackId(track.id)
    },
    [playTrack],
  )

  const handleStop = useCallback(() => {
    stopAll()
    setPlayingTrackId(null)
  }, [stopAll])

  const handleSetOverride = useCallback(
    (track: (typeof TRACK_MANIFEST)[number]) => {
      if (!selectedZone) return
      setZoneOverride(selectedZone, track.src)
    },
    [selectedZone, setZoneOverride],
  )

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-3">
          <Volume2 className="h-7 w-7 text-[var(--game-accent-purple)]" />
          ג&apos;וקבוקס
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          שמע, בחר והחלף מוזיקה בכל זירה במשחק
        </p>
      </div>

      {/* Collection progress */}
      <CollectionProgress unlocked={unlockedCount} total={totalTracks} />

      {/* Zone selector for overrides */}
      <div className="game-card p-4 mb-4">
        <label
          htmlFor="zone-select"
          className="text-xs font-bold text-muted-foreground block mb-2"
        >
          בחר זירה להחלפת מוזיקה:
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['home', 'בית'],
              ['lessons-easy', 'שיעור קל'],
              ['lessons-medium', 'שיעור בינוני'],
              ['lessons-hard', 'שיעור קשה'],
              ['battle-arena', 'זירת קרב'],
              ['speed-test', 'מבחן מהירות'],
              ['games-hub', 'משחקים'],
              ['story-mode', 'סיפור'],
            ] as const
          ).map(([zone, label]) => (
            <button
              type="button"
              key={zone}
              onClick={() => setSelectedZone(zone as GameZone)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedZone === zone
                  ? 'bg-[var(--game-accent-purple)] text-white border-transparent'
                  : 'bg-transparent border-[var(--game-border)] text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {selectedZone && (
          <button
            type="button"
            onClick={() => {
              clearZoneOverrides()
              setSelectedZone(null)
            }}
            className="mt-2 text-xs text-destructive hover:underline"
          >
            איפוס כל ההחלפות
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`text-xs px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-[var(--game-accent-purple)] text-white shadow-[var(--game-tab-glow)]'
                : 'bg-[var(--game-bg-elevated)] text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Track grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTracks.map((track) => {
          const isUnlocked = unlockedTracks.includes(track.id)
          return (
            <TrackCard
              key={track.id}
              track={track}
              isUnlocked={isUnlocked}
              isCurrentlyPlaying={playingTrackId === track.id}
              onPlay={() => handlePlay(track)}
              onStop={handleStop}
              onSetOverride={() => handleSetOverride(track)}
            />
          )
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          אין רצועות בקטגוריה זו
        </div>
      )}
    </div>
  )
}
