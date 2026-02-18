/**
 * SoundManager — synthesizes all sounds via Web Audio API.
 * No external audio files required.
 * Safe for Next.js SSR: AudioContext is only created in the browser.
 */
import { SOUNDS, type SoundConfig } from './sounds'

class SoundManager {
  private context: AudioContext | null = null
  private enabled = true
  private volume = 0.7

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

  /** Play a sound defined in SOUNDS. */
  private play(config: SoundConfig): void {
    if (!this.enabled) return
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

  /** Sync enabled state from settings store. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /** Sync volume from settings store (0-1). */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

/** Singleton instance shared across the app. */
export const soundManager = new SoundManager()
