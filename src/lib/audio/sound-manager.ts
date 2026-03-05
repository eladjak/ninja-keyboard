/**
 * SoundManager — plays AI-generated SFX (MP3) with Web Audio synthesis fallback.
 * MP3 files are preloaded from /audio/sfx/ and cached as HTMLAudioElement.
 * If an MP3 isn't available or fails, the original Web Audio oscillator plays.
 * Safe for Next.js SSR: Audio elements and AudioContext are only created in the browser.
 */
import { SOUNDS, type SoundConfig } from './sounds'

/** Maps sound keys to their MP3 file paths in /audio/sfx/. */
const SFX_FILES: Record<string, string> = {
  keyClick: '/audio/sfx/keyboard-click.mp3',
  correct: '/audio/sfx/correct-answer.mp3',
  error: '/audio/sfx/wrong-answer.mp3',
  levelComplete: '/audio/sfx/level-up.mp3',
  xpGain: '/audio/sfx/xp-gain.mp3',
  countdownBeep: '/audio/sfx/countdown-beep.mp3',
  countdownGo: '/audio/sfx/countdown-go.mp3',
  comboHit: '/audio/sfx/keyboard-combo.mp3',
  achievementFanfare: '/audio/sfx/achievement-unlock.mp3',
  badgeUnlock: '/audio/sfx/character-unlock.mp3',
  starEarned: '/audio/sfx/star-earn.mp3',
  streakFire: '/audio/sfx/streak-fire.mp3',
  victoryCheers: '/audio/sfx/victory-cheers.mp3',
  ninjaSlash: '/audio/sfx/ninja-slash.mp3',
  bugAppear: '/audio/sfx/bug-appear.mp3',
  glitchWarp: '/audio/sfx/glitch-warp.mp3',
}

class SoundManager {
  private context: AudioContext | null = null
  private enabled = true
  private volume = 0.7
  private audioCache = new Map<string, HTMLAudioElement>()
  private preloaded = false

  /** Preload all MP3 SFX files into cache (browser only). */
  preload(): void {
    if (typeof window === 'undefined' || this.preloaded) return
    this.preloaded = true
    for (const [key, path] of Object.entries(SFX_FILES)) {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audio.volume = this.volume
      this.audioCache.set(key, audio)
    }
  }

  /** Lazily create the AudioContext on first use (browser only). */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.context) {
      try {
        this.context = new AudioContext()
      } catch {
        return null
      }
    }
    // Resume suspended context (needed after user interaction policy)
    if (this.context.state === 'suspended') {
      void this.context.resume()
    }
    return this.context
  }

  /** Try playing MP3, return true if successful. */
  private playMp3(key: string): boolean {
    if (typeof window === 'undefined') return false
    if (!this.preloaded) this.preload()

    const cached = this.audioCache.get(key)
    if (!cached) return false

    try {
      // Clone for overlapping plays
      const clone = cached.cloneNode() as HTMLAudioElement
      clone.volume = this.volume
      void clone.play().catch(() => {})
      return true
    } catch {
      return false
    }
  }

  /** Play a sound: try MP3 first, fall back to Web Audio synthesis. */
  private play(config: SoundConfig): void {
    if (!this.enabled) return

    // Try MP3 first
    if (this.playMp3(config.name)) return

    // Fallback: Web Audio synthesis
    const ctx = this.getContext()
    if (!ctx) return

    let offset = 0
    const now = ctx.currentTime

    for (const step of config.steps) {
      const stepDuration = step.duration / 1000

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = step.type
      oscillator.frequency.setValueAtTime(step.frequency, now + offset)

      const stepGain = config.gain * this.volume
      gainNode.gain.setValueAtTime(stepGain, now + offset)
      // Fade out over last 20% of step to avoid clicks
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        now + offset + stepDuration,
      )

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(now + offset)
      oscillator.stop(now + offset + stepDuration)

      offset += stepDuration
    }
  }

  /** Play an MP3-only sound (no Web Audio fallback). */
  private playMp3Only(key: string): void {
    if (!this.enabled) return
    this.playMp3(key)
  }

  /** Short tick on every keystroke. */
  playKeyClick(): void {
    this.play(SOUNDS.keyClick)
  }

  /** Ascending beep for a correct keystroke. */
  playCorrect(): void {
    this.play(SOUNDS.correct)
  }

  /** Descending buzz for an incorrect keystroke. */
  playError(): void {
    this.play(SOUNDS.error)
  }

  /** Happy ascending melody when a lesson is completed. */
  playLevelComplete(): void {
    this.play(SOUNDS.levelComplete)
  }

  /** Coin-style ping when XP is awarded. */
  playXpGain(): void {
    this.play(SOUNDS.xpGain)
  }

  /** Short click for button interactions. */
  playButtonClick(): void {
    this.play(SOUNDS.buttonClick)
  }

  /** Whoosh sound for navigation transitions. */
  playNavigate(): void {
    this.play(SOUNDS.navigate)
  }

  /** Countdown beep (3, 2, 1). */
  playCountdownBeep(): void {
    this.play(SOUNDS.countdownBeep)
  }

  /** "Go!" sound at countdown end. */
  playCountdownGo(): void {
    this.play(SOUNDS.countdownGo)
  }

  /** Ascending rapid notes for combo streaks. */
  playComboHit(): void {
    this.play(SOUNDS.comboHit)
  }

  /** Fanfare for achievements. */
  playAchievementFanfare(): void {
    this.play(SOUNDS.achievementFanfare)
  }

  /** Sparkle for badge unlock. */
  playBadgeUnlock(): void {
    this.play(SOUNDS.badgeUnlock)
  }

  /** Chime for star earned in lesson results. */
  playStarEarned(): void {
    this.play(SOUNDS.starEarned)
  }

  /** Tick for timer countdown. */
  playTimerTick(): void {
    this.play(SOUNDS.timerTick)
  }

  /** Dramatic sound for battle start. */
  playBattleStart(): void {
    this.play(SOUNDS.battleStart)
  }

  /** Fire streak combo sound. */
  playStreakFire(): void {
    this.playMp3Only('streakFire')
  }

  /** Victory celebration sound. */
  playVictoryCheers(): void {
    this.playMp3Only('victoryCheers')
  }

  /** Ninja slash attack sound. */
  playNinjaSlash(): void {
    this.playMp3Only('ninjaSlash')
  }

  /** Bug enemy appearance sound. */
  playBugAppear(): void {
    this.playMp3Only('bugAppear')
  }

  /** Glitch warp/teleport sound. */
  playGlitchWarp(): void {
    this.playMp3Only('glitchWarp')
  }

  /** Sync enabled state from settings store. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /** Sync volume from settings store (0-1). */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    // Update cached audio elements
    for (const audio of this.audioCache.values()) {
      audio.volume = this.volume
    }
  }
}

/** Singleton instance shared across the app. */
export const soundManager = new SoundManager()
