/**
 * Sound configurations for Web Audio API synthesis.
 * Each entry describes how to synthesize a sound using the browser's AudioContext.
 */

export interface ToneStep {
  /** Frequency in Hz */
  frequency: number
  /** Duration of this tone step in milliseconds */
  duration: number
  /** Oscillator wave type */
  type: OscillatorType
}

export interface SoundConfig {
  /** Name for debugging */
  name: string
  /** Sequence of tone steps that make up the sound */
  steps: ToneStep[]
  /** Overall gain/volume 0-1 */
  gain: number
}

export const SOUNDS: Record<string, SoundConfig> = {
  keyClick: {
    name: 'keyClick',
    gain: 0.15,
    steps: [
      { frequency: 800, duration: 30, type: 'square' },
    ],
  },

  correct: {
    name: 'correct',
    gain: 0.3,
    steps: [
      { frequency: 523, duration: 50, type: 'sine' },
      { frequency: 698, duration: 60, type: 'sine' },
    ],
  },

  error: {
    name: 'error',
    gain: 0.25,
    steps: [
      { frequency: 440, duration: 40, type: 'sawtooth' },
      { frequency: 330, duration: 50, type: 'sawtooth' },
    ],
  },

  levelComplete: {
    name: 'levelComplete',
    gain: 0.35,
    steps: [
      { frequency: 523, duration: 100, type: 'sine' },
      { frequency: 659, duration: 100, type: 'sine' },
      { frequency: 784, duration: 120, type: 'sine' },
    ],
  },

  xpGain: {
    name: 'xpGain',
    gain: 0.2,
    steps: [
      { frequency: 1047, duration: 50, type: 'sine' },
    ],
  },

  buttonClick: {
    name: 'buttonClick',
    gain: 0.12,
    steps: [
      { frequency: 1200, duration: 15, type: 'square' },
    ],
  },

  navigate: {
    name: 'navigate',
    gain: 0.15,
    steps: [
      { frequency: 800, duration: 40, type: 'sine' },
      { frequency: 400, duration: 40, type: 'sine' },
    ],
  },

  countdownBeep: {
    name: 'countdownBeep',
    gain: 0.3,
    steps: [
      { frequency: 880, duration: 80, type: 'sine' },
    ],
  },

  countdownGo: {
    name: 'countdownGo',
    gain: 0.35,
    steps: [
      { frequency: 523, duration: 60, type: 'sine' },
      { frequency: 659, duration: 60, type: 'sine' },
      { frequency: 784, duration: 80, type: 'sine' },
    ],
  },

  comboHit: {
    name: 'comboHit',
    gain: 0.25,
    steps: [
      { frequency: 600, duration: 30, type: 'sine' },
      { frequency: 800, duration: 30, type: 'sine' },
      { frequency: 1000, duration: 30, type: 'sine' },
      { frequency: 1200, duration: 40, type: 'sine' },
    ],
  },

  achievementFanfare: {
    name: 'achievementFanfare',
    gain: 0.3,
    steps: [
      { frequency: 523, duration: 80, type: 'sine' },
      { frequency: 659, duration: 80, type: 'sine' },
      { frequency: 784, duration: 100, type: 'sine' },
      { frequency: 1047, duration: 150, type: 'sine' },
    ],
  },

  badgeUnlock: {
    name: 'badgeUnlock',
    gain: 0.25,
    steps: [
      { frequency: 1200, duration: 40, type: 'sine' },
      { frequency: 1400, duration: 30, type: 'sine' },
      { frequency: 1600, duration: 30, type: 'sine' },
      { frequency: 2000, duration: 60, type: 'sine' },
    ],
  },

  starEarned: {
    name: 'starEarned',
    gain: 0.2,
    steps: [
      { frequency: 1047, duration: 60, type: 'sine' },
      { frequency: 1319, duration: 80, type: 'sine' },
    ],
  },

  timerTick: {
    name: 'timerTick',
    gain: 0.1,
    steps: [
      { frequency: 600, duration: 20, type: 'square' },
    ],
  },

  battleStart: {
    name: 'battleStart',
    gain: 0.35,
    steps: [
      { frequency: 220, duration: 80, type: 'sawtooth' },
      { frequency: 330, duration: 80, type: 'sawtooth' },
      { frequency: 440, duration: 100, type: 'sawtooth' },
      { frequency: 660, duration: 120, type: 'sine' },
    ],
  },
}
