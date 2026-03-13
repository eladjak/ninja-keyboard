/**
 * MusicManager -- Web Audio API-based background music system.
 *
 * Architecture (3 layers):
 *   Layer 1: Background Music -- one looping track per zone, crossfade between zones
 *   Layer 2: Stingers/Jingles -- one-shot sounds over background (ducks music volume)
 *   Layer 3: SFX              -- handled by sound-manager.ts (separate system)
 *
 * Audio graph:
 *   AudioContext
 *     +-- masterGain
 *          +-- musicGain (background tracks, crossfading)
 *          |     +-- sourceA (current track)
 *          |     +-- sourceB (crossfade target)
 *          +-- stingerGain (one-shot jingles)
 *                +-- stinger source
 *
 * Safe for Next.js SSR: all browser APIs gated behind typeof window checks.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** All game zones that can have music assigned. */
export type GameZone =
  | 'home'
  | 'lessons-easy'
  | 'lessons-medium'
  | 'lessons-hard'
  | 'battle-arena'
  | 'speed-test'
  | 'games-hub'
  | 'profile'
  | 'story-mode'
  | 'boss-battle'
  | 'boss-battle-final'
  | 'menu'
  | 'victory'
  | 'defeat'
  | 'loading'

/** Metadata for a single music track. */
export interface MusicTrack {
  /** Unique identifier, e.g. "PLAY-001" */
  id: string
  /** Display name in Hebrew */
  name: string
  /** Path relative to public/, e.g. "/audio/music/practice-easy.mp3" */
  src: string
  /** Whether the track should loop */
  loop: boolean
  /** Default volume multiplier for this track (0-1) */
  trackVolume: number
  /** Duration hint in seconds (for UI display, not playback) */
  durationHint: number
  /** Genre label for jukebox UI */
  genre: string
  /** Unlock condition description (Hebrew) */
  unlockHint: string
}

/** Holiday identifiers for music overrides. */
export type HebrewHoliday =
  | 'hanukkah'
  | 'purim'
  | 'pesach'
  | 'yom-haatzmaut'
  | 'rosh-hashana'
  | 'sukkot'
  | 'shavuot'
  | 'lag-baomer'
  | 'tu-bishvat'
  | 'yom-hazikaron'
  | 'yom-hashoah'
  | 'simchat-torah'

// ---------------------------------------------------------------------------
// Default zone-to-track mapping
// ---------------------------------------------------------------------------

export const DEFAULT_ZONE_TRACKS: Record<GameZone, string> = {
  'home': '/audio/music/main-theme.mp3',
  'lessons-easy': '/audio/music/gameplay/practice-easy.mp3',
  'lessons-medium': '/audio/music/gameplay/practice-medium.mp3',
  'lessons-hard': '/audio/music/gameplay/practice-hard.mp3',
  'battle-arena': '/audio/music/battle/tournament-arena.mp3',
  'speed-test': '/audio/music/gameplay/speed-test.mp3',
  'games-hub': '/audio/music/menu/games-hub.mp3',
  'profile': '/audio/music/menu/profile-progress.mp3',
  'story-mode': '/audio/music/story/emotional-moment.mp3',
  'boss-battle': '/audio/music/boss-battle.mp3',
  'boss-battle-final': '/audio/music/battle/bug-king-final.mp3',
  'menu': '/audio/music/main-theme.mp3',
  'victory': '/audio/music/events/victory-fanfare.mp3',
  'defeat': '/audio/music/events/defeat-try-again.mp3',
  'loading': '/audio/music/main-theme.mp3',
}

/** Holiday track paths. Override home/menu zones during holidays. */
export const HOLIDAY_TRACKS: Record<HebrewHoliday, string> = {
  'hanukkah': '/audio/music/holidays/hanukkah-theme.mp3',
  'purim': '/audio/music/holidays/purim-theme.mp3',
  'pesach': '/audio/music/holidays/pesach-theme.mp3',
  'yom-haatzmaut': '/audio/music/holidays/yom-haatzmaut-theme.mp3',
  'rosh-hashana': '/audio/music/holidays/rosh-hashana-theme.mp3',
  'sukkot': '/audio/music/holidays/sukkot-theme.mp3',
  'shavuot': '/audio/music/holidays/shavuot-theme.mp3',
  'lag-baomer': '/audio/music/holidays/lag-baomer-theme.mp3',
  'tu-bishvat': '/audio/music/holidays/tu-bishvat-theme.mp3',
  'yom-hazikaron': '/audio/music/holidays/yom-hazikaron-theme.mp3',
  'yom-hashoah': '/audio/music/holidays/yom-hashoah-theme.mp3',
  'simchat-torah': '/audio/music/holidays/simchat-torah-theme.mp3',
}

/** Stinger (jingle) track paths. */
export const STINGER_TRACKS: Record<string, string> = {
  'victory-fanfare': '/audio/music/events/victory-fanfare.mp3',
  'level-up': '/audio/music/events/level-up-jingle.mp3',
  'character-unlock': '/audio/music/events/character-unlock.mp3',
  'achievement': '/audio/music/events/achievement-unlock.mp3',
  'streak-fire': '/audio/music/events/streak-milestone.mp3',
  'season-complete': '/audio/music/events/season-event-theme.mp3',
  'personal-best': '/audio/music/events/personal-best.mp3',
  'defeat-jingle': '/audio/music/events/defeat-try-again.mp3',
}

// ---------------------------------------------------------------------------
// Track manifest — full metadata for the jukebox
// ---------------------------------------------------------------------------

export const TRACK_MANIFEST: MusicTrack[] = [
  // P0 -- Core gameplay
  {
    id: 'PLAY-001',
    name: 'תרגול רגוע',
    src: '/audio/music/gameplay/practice-easy.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 180,
    genre: 'Lo-fi Hip Hop',
    unlockHint: 'זמין מההתחלה',
  },
  {
    id: 'EVENT-001',
    name: 'פנפרת ניצחון',
    src: '/audio/music/events/victory-fanfare.mp3',
    loop: false,
    trackVolume: 1.0,
    durationHint: 8,
    genre: 'Brass / Chiptune',
    unlockHint: 'זמין מההתחלה',
  },
  {
    id: 'EVENT-002',
    name: 'עליית רמה',
    src: '/audio/music/events/level-up-jingle.mp3',
    loop: false,
    trackVolume: 1.0,
    durationHint: 5,
    genre: 'Chiptune',
    unlockHint: 'זמין מההתחלה',
  },
  {
    id: 'EVENT-003',
    name: 'פתיחת דמות',
    src: '/audio/music/events/character-unlock.mp3',
    loop: false,
    trackVolume: 1.0,
    durationHint: 6,
    genre: 'Magical',
    unlockHint: 'זמין מההתחלה',
  },
  // P1 -- Battles & competition
  {
    id: 'BATTLE-002',
    name: 'קרב שאדו קאט',
    src: '/audio/music/battle/shadow-cat-battle.mp3',
    loop: true,
    trackVolume: 0.8,
    durationHint: 150,
    genre: 'Chiptune Battle',
    unlockHint: 'נצח את שאדו קאט',
  },
  {
    id: 'BATTLE-003',
    name: 'קרב סטורם פוקס',
    src: '/audio/music/battle/storm-fox-battle.mp3',
    loop: true,
    trackVolume: 0.8,
    durationHint: 150,
    genre: 'Electro Rock',
    unlockHint: 'נצח את סטורם פוקס',
  },
  {
    id: 'PLAY-004',
    name: 'מבחן מהירות',
    src: '/audio/music/gameplay/speed-test.mp3',
    loop: true,
    trackVolume: 0.8,
    durationHint: 180,
    genre: 'EDM / Dubstep',
    unlockHint: 'השג 40 WPM',
  },
  {
    id: 'EVENT-004',
    name: 'הישג חדש',
    src: '/audio/music/events/achievement-unlock.mp3',
    loop: false,
    trackVolume: 1.0,
    durationHint: 5,
    genre: 'Power Chord',
    unlockHint: 'זמין מההתחלה',
  },
  // P2 -- Characters & world
  {
    id: 'PLAY-002',
    name: 'תרגול בינוני',
    src: '/audio/music/gameplay/practice-medium.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 180,
    genre: 'Indie Electronic',
    unlockHint: 'השלם 10 שיעורים',
  },
  {
    id: 'BATTLE-001',
    name: 'לפני הקרב',
    src: '/audio/music/battle/pre-battle-anticipation.mp3',
    loop: true,
    trackVolume: 0.6,
    durationHint: 90,
    genre: 'Orchestral Tension',
    unlockHint: 'הגע לזירת הקרב',
  },
  {
    id: 'CHAR-001',
    name: 'תמת קי',
    src: '/audio/music/characters/kis-theme.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 20,
    genre: 'Adventure Chiptune',
    unlockHint: 'זמין מההתחלה',
  },
  {
    id: 'CHAR-003',
    name: 'תמת סנסיי זן',
    src: '/audio/music/characters/sensei-zens-theme.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 20,
    genre: 'Japanese Traditional',
    unlockHint: 'השלם שיעור ראשון',
  },
  {
    id: 'CHAR-004',
    name: 'תמת באג',
    src: '/audio/music/characters/bugs-theme.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 20,
    genre: 'Glitch',
    unlockHint: 'פגוש את באג',
  },
  {
    id: 'WORLD-003',
    name: 'זירת גזע',
    src: '/audio/music/worlds/geza-ninja-arena.mp3',
    loop: true,
    trackVolume: 0.7,
    durationHint: 180,
    genre: 'Dark Synthwave',
    unlockHint: 'הגע לרמת גזע',
  },
  // Main theme & menu
  {
    id: 'MENU-001',
    name: 'תמה ראשית',
    src: '/audio/music/main-theme.mp3',
    loop: true,
    trackVolume: 0.8,
    durationHint: 180,
    genre: 'Chiptune',
    unlockHint: 'זמין מההתחלה',
  },
  // Boss battles
  {
    id: 'BOSS-001',
    name: 'קרב בוס',
    src: '/audio/music/boss-battle.mp3',
    loop: true,
    trackVolume: 0.9,
    durationHint: 180,
    genre: 'Orchestral Epic',
    unlockHint: 'הגע לקרב בוס ראשון',
  },
  {
    id: 'BOSS-002',
    name: 'קרב בוס סופי',
    src: '/audio/music/battle/bug-king-final.mp3',
    loop: true,
    trackVolume: 0.9,
    durationHint: 240,
    genre: 'Orchestral + Glitch',
    unlockHint: 'הגע לקרב הבוס הסופי',
  },
]

// ---------------------------------------------------------------------------
// MusicManager class
// ---------------------------------------------------------------------------

/** Default crossfade duration in seconds. */
const CROSSFADE_DURATION = 1.5

/** Volume to duck background music to when a stinger plays. */
const DUCK_VOLUME = 0.3

/** Duration (seconds) to fade the duck in/out. */
const DUCK_FADE = 0.4

class MusicManager {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private stingerGain: GainNode | null = null

  // Current background playback state
  private currentSource: AudioBufferSourceNode | null = null
  private currentSourceGain: GainNode | null = null
  private currentZone: GameZone | null = null
  private currentTrackSrc: string | null = null

  // Buffer cache to avoid re-fetching
  private bufferCache = new Map<string, AudioBuffer>()
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>()

  // Volume & mute state
  private _volume = 0.5
  private _muted = false
  private _playing = false

  // Zone overrides (from jukebox / holidays)
  private zoneOverrides = new Map<GameZone, string>()

  // Stinger ducking state
  private duckTimeout: ReturnType<typeof setTimeout> | null = null

  // Autoplay unlock listener handle
  private autoplayUnlockBound: (() => void) | null = null
  private pendingZone: GameZone | null = null

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------

  /** Lazily initialize AudioContext and gain nodes. Returns false on SSR. */
  private init(): boolean {
    if (typeof window === 'undefined') return false
    if (this.context) return true

    try {
      this.context = new AudioContext()

      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)

      this.musicGain = this.context.createGain()
      this.musicGain.connect(this.masterGain)

      this.stingerGain = this.context.createGain()
      this.stingerGain.connect(this.masterGain)

      this.applyVolume()
      return true
    } catch {
      return false
    }
  }

  /**
   * Ensure the AudioContext is running. Browsers require a user gesture before
   * playback. If the context is suspended we register a one-time listener.
   */
  private ensureResumed(): boolean {
    if (!this.context) return false
    if (this.context.state === 'running') return true

    if (this.context.state === 'suspended') {
      void this.context.resume()

      // Register a global interaction listener to resume later if still suspended.
      if (!this.autoplayUnlockBound) {
        this.autoplayUnlockBound = () => {
          if (this.context?.state === 'suspended') {
            void this.context.resume().then(() => {
              // Replay the pending zone if we were waiting
              if (this.pendingZone) {
                const zone = this.pendingZone
                this.pendingZone = null
                this.playZone(zone)
              }
            })
          }
          this.removeAutoplayListener()
        }
        for (const evt of ['click', 'keydown', 'touchstart'] as const) {
          document.addEventListener(evt, this.autoplayUnlockBound, { once: true })
        }
      }

      return false
    }
    return false
  }

  private removeAutoplayListener(): void {
    if (!this.autoplayUnlockBound) return
    for (const evt of ['click', 'keydown', 'touchstart'] as const) {
      document.removeEventListener(evt, this.autoplayUnlockBound)
    }
    this.autoplayUnlockBound = null
  }

  // ---------------------------------------------------------------------------
  // Volume
  // ---------------------------------------------------------------------------

  private applyVolume(): void {
    if (!this.masterGain) return
    const effective = this._muted ? 0 : this._volume
    this.masterGain.gain.setValueAtTime(effective, this.context?.currentTime ?? 0)
  }

  /** Set music volume (0-1). Separate from SFX volume. */
  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume))
    this.applyVolume()
  }

  getVolume(): number {
    return this._volume
  }

  /** Mute / unmute music. */
  setMuted(muted: boolean): void {
    this._muted = muted
    this.applyVolume()
  }

  isMuted(): boolean {
    return this._muted
  }

  isPlaying(): boolean {
    return this._playing
  }

  getCurrentZone(): GameZone | null {
    return this.currentZone
  }

  // ---------------------------------------------------------------------------
  // Buffer loading
  // ---------------------------------------------------------------------------

  /**
   * Load an audio file into an AudioBuffer. Returns null if the file does not
   * exist or cannot be decoded. Results are cached.
   */
  private async loadBuffer(src: string): Promise<AudioBuffer | null> {
    if (!this.context) return null

    // Return from cache
    const cached = this.bufferCache.get(src)
    if (cached) return cached

    // Deduplicate in-flight requests
    const existing = this.loadingPromises.get(src)
    if (existing) return existing

    const promise = (async (): Promise<AudioBuffer | null> => {
      try {
        const response = await fetch(src)
        if (!response.ok) return null
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.context!.decodeAudioData(arrayBuffer)
        this.bufferCache.set(src, audioBuffer)
        return audioBuffer
      } catch {
        // File doesn't exist or can't be decoded -- silent fallback
        return null
      } finally {
        this.loadingPromises.delete(src)
      }
    })()

    this.loadingPromises.set(src, promise)
    return promise
  }

  /**
   * Preload a track into the buffer cache. Fire-and-forget.
   * Useful for preloading the next zone's track ahead of time.
   */
  preload(src: string): void {
    if (!this.init()) return
    void this.loadBuffer(src)
  }

  /** Preload the track for a specific zone. */
  preloadZone(zone: GameZone): void {
    const src = this.resolveTrackSrc(zone)
    this.preload(src)
  }

  // ---------------------------------------------------------------------------
  // Track resolution
  // ---------------------------------------------------------------------------

  /** Resolve which track src to use for a zone, considering overrides. */
  private resolveTrackSrc(zone: GameZone): string {
    const override = this.zoneOverrides.get(zone)
    if (override) return override
    return DEFAULT_ZONE_TRACKS[zone]
  }

  // ---------------------------------------------------------------------------
  // Zone playback
  // ---------------------------------------------------------------------------

  /**
   * Start playing the track for the given zone.
   * If already playing the same zone, this is a no-op.
   * If a different zone is playing, crossfade to the new track.
   */
  playZone(zone: GameZone, crossfadeDuration: number = CROSSFADE_DURATION): void {
    if (!this.init()) return

    const src = this.resolveTrackSrc(zone)

    // Same track already playing -- skip
    if (this.currentZone === zone && this.currentTrackSrc === src && this._playing) {
      return
    }

    // If context suspended, store the intent and wait for user gesture
    if (!this.ensureResumed()) {
      this.pendingZone = zone
      this.currentZone = zone
      this.currentTrackSrc = src
      return
    }

    this.currentZone = zone

    // Load and play
    void this.transitionToTrack(src, zone, crossfadeDuration)
  }

  private async transitionToTrack(
    src: string,
    zone: GameZone,
    crossfadeDuration: number,
  ): Promise<void> {
    if (!this.context || !this.musicGain) return

    const buffer = await this.loadBuffer(src)
    if (!buffer) {
      // File not available -- silently stop current music
      this.stopCurrentSource(crossfadeDuration)
      this.currentTrackSrc = src
      this._playing = false
      return
    }

    // If zone changed while loading, abort
    if (this.currentZone !== zone) return

    const ctx = this.context
    const now = ctx.currentTime

    // Create new source
    const newSource = ctx.createBufferSource()
    newSource.buffer = buffer
    newSource.loop = true // Background music always loops

    const newGain = ctx.createGain()
    newGain.connect(this.musicGain)

    // Equal-power crossfade: new track fades in
    newGain.gain.setValueAtTime(0, now)
    newGain.gain.linearRampToValueAtTime(1, now + crossfadeDuration)

    newSource.connect(newGain)
    newSource.start(0)

    // Crossfade out old source
    this.stopCurrentSource(crossfadeDuration)

    // Update state
    this.currentSource = newSource
    this.currentSourceGain = newGain
    this.currentTrackSrc = src
    this._playing = true

    // Clean up when source ends (for non-looping tracks, if loop is ever false)
    newSource.addEventListener('ended', () => {
      if (this.currentSource === newSource) {
        this._playing = false
      }
    })
  }

  private stopCurrentSource(fadeDuration: number): void {
    if (!this.currentSource || !this.currentSourceGain || !this.context) return

    const ctx = this.context
    const now = ctx.currentTime
    const oldSource = this.currentSource
    const oldGain = this.currentSourceGain

    // Fade out
    oldGain.gain.setValueAtTime(oldGain.gain.value, now)
    oldGain.gain.linearRampToValueAtTime(0, now + fadeDuration)

    // Stop and disconnect after fade
    try {
      oldSource.stop(now + fadeDuration + 0.1)
    } catch {
      // Already stopped
    }
    setTimeout(() => {
      try {
        oldSource.disconnect()
        oldGain.disconnect()
      } catch {
        // Already disconnected
      }
    }, (fadeDuration + 0.2) * 1000)

    this.currentSource = null
    this.currentSourceGain = null
  }

  // ---------------------------------------------------------------------------
  // Stop / Pause / Resume
  // ---------------------------------------------------------------------------

  /** Stop all music playback with an optional fade. */
  stopAll(fadeDuration: number = CROSSFADE_DURATION): void {
    this.stopCurrentSource(fadeDuration)
    this.currentZone = null
    this.currentTrackSrc = null
    this._playing = false
    this.pendingZone = null
  }

  /** Pause music (suspend AudioContext). */
  pause(): void {
    if (this.context?.state === 'running') {
      void this.context.suspend()
      this._playing = false
    }
  }

  /** Resume music (resume AudioContext). */
  resume(): void {
    if (this.context?.state === 'suspended') {
      void this.context.resume()
      if (this.currentSource) {
        this._playing = true
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Stingers (one-shot jingles over background)
  // ---------------------------------------------------------------------------

  /**
   * Play a stinger/jingle. Ducks the background music volume while playing.
   * The stinger does not loop.
   */
  async playStinger(stingerId: string): Promise<void> {
    if (!this.init() || !this.context || !this.stingerGain) return
    this.ensureResumed()

    const src = STINGER_TRACKS[stingerId]
    if (!src) return

    const buffer = await this.loadBuffer(src)
    if (!buffer) return

    const ctx = this.context
    const now = ctx.currentTime

    // Duck background music
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now)
      this.musicGain.gain.linearRampToValueAtTime(DUCK_VOLUME, now + DUCK_FADE)
    }

    // Play stinger
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = false
    source.connect(this.stingerGain)
    source.start(0)

    // Restore background volume when stinger ends
    if (this.duckTimeout) clearTimeout(this.duckTimeout)
    const stingerDuration = buffer.duration
    this.duckTimeout = setTimeout(() => {
      if (this.musicGain && this.context) {
        const t = this.context.currentTime
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t)
        this.musicGain.gain.linearRampToValueAtTime(1, t + DUCK_FADE)
      }
      this.duckTimeout = null
    }, stingerDuration * 1000)

    source.addEventListener('ended', () => {
      try { source.disconnect() } catch { /* already disconnected */ }
    })
  }

  // ---------------------------------------------------------------------------
  // Zone overrides (Jukebox & holidays)
  // ---------------------------------------------------------------------------

  /** Set a zone override. Pass null to clear. */
  setZoneOverride(zone: GameZone, trackSrc: string | null): void {
    if (trackSrc === null) {
      this.zoneOverrides.delete(zone)
    } else {
      this.zoneOverrides.set(zone, trackSrc)
    }

    // If currently in this zone, transition to the new track
    if (this.currentZone === zone) {
      const newSrc = this.resolveTrackSrc(zone)
      if (newSrc !== this.currentTrackSrc) {
        void this.transitionToTrack(newSrc, zone, CROSSFADE_DURATION)
      }
    }
  }

  /** Get the current override for a zone, or null. */
  getZoneOverride(zone: GameZone): string | null {
    return this.zoneOverrides.get(zone) ?? null
  }

  /** Apply holiday overrides to home and menu zones. */
  setHolidayOverride(holiday: HebrewHoliday | null): void {
    if (holiday === null) {
      this.zoneOverrides.delete('home')
      this.zoneOverrides.delete('menu')
    } else {
      const src = HOLIDAY_TRACKS[holiday]
      this.zoneOverrides.set('home', src)
      this.zoneOverrides.set('menu', src)
    }

    // If currently in home or menu, transition
    if (this.currentZone === 'home' || this.currentZone === 'menu') {
      const newSrc = this.resolveTrackSrc(this.currentZone)
      if (newSrc !== this.currentTrackSrc) {
        void this.transitionToTrack(newSrc, this.currentZone, CROSSFADE_DURATION)
      }
    }
  }

  /** Clear all zone overrides. */
  clearAllOverrides(): void {
    this.zoneOverrides.clear()
  }

  // ---------------------------------------------------------------------------
  // Play a specific track (for jukebox preview)
  // ---------------------------------------------------------------------------

  /**
   * Play a specific track by src, without affecting zone state.
   * Used for jukebox preview. Returns after the track starts.
   */
  async playTrack(src: string, loop: boolean = false): Promise<void> {
    if (!this.init() || !this.context || !this.musicGain) return
    this.ensureResumed()

    const buffer = await this.loadBuffer(src)
    if (!buffer) return

    // Stop current
    this.stopCurrentSource(0.3)

    const ctx = this.context
    const newSource = ctx.createBufferSource()
    newSource.buffer = buffer
    newSource.loop = loop

    const newGain = ctx.createGain()
    newGain.gain.setValueAtTime(1, ctx.currentTime)
    newGain.connect(this.musicGain)
    newSource.connect(newGain)
    newSource.start(0)

    this.currentSource = newSource
    this.currentSourceGain = newGain
    this.currentTrackSrc = src
    this.currentZone = null
    this._playing = true

    newSource.addEventListener('ended', () => {
      if (this.currentSource === newSource) {
        this._playing = false
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  /** Dispose all resources. Call when the app unmounts. */
  dispose(): void {
    this.stopAll(0)
    this.removeAutoplayListener()
    if (this.duckTimeout) clearTimeout(this.duckTimeout)
    this.bufferCache.clear()
    this.loadingPromises.clear()
    if (this.context) {
      void this.context.close()
      this.context = null
    }
    this.masterGain = null
    this.musicGain = null
    this.stingerGain = null
  }
}

/** Singleton instance shared across the app. */
export const musicManager = new MusicManager()
