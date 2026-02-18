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
}
