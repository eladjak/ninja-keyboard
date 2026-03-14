/**
 * UI Sound Synthesis — generates Phase 1 UI sounds programmatically via Web Audio API.
 * Zero external file dependencies: all sounds are synthesized in real time.
 *
 * Each sound function accepts an AudioContext and an optional volume (0-1).
 * Gain envelopes (attack/decay/sustain/release) are used for professional quality.
 */

/** All supported UI sound keys. */
const UI_SOUND_KEYS = [
  'click',
  'hover',
  'navigate',
  'success',
  'error',
  'notification',
  'achievement',
  'levelup',
  'countdown',
  'battle-start',
  'battle-win',
  'battle-lose',
] as const

export type UISoundKey = (typeof UI_SOUND_KEYS)[number]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create and connect an oscillator + gain node pair, returning both. */
function createOscGain(
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = 0
  osc.connect(gain)
  gain.connect(ctx.destination)
  return { osc, gain }
}

/** Apply a simple ADSR envelope to a gain node. All durations in seconds. */
function applyEnvelope(
  gain: GainNode,
  startTime: number,
  peakGain: number,
  attack: number,
  decay: number,
  sustainLevel: number,
  sustainDur: number,
  release: number,
): void {
  const g = gain.gain
  g.setValueAtTime(0, startTime)
  g.linearRampToValueAtTime(peakGain, startTime + attack)
  g.linearRampToValueAtTime(peakGain * sustainLevel, startTime + attack + decay)
  g.setValueAtTime(peakGain * sustainLevel, startTime + attack + decay + sustainDur)
  g.linearRampToValueAtTime(0, startTime + attack + decay + sustainDur + release)
}

/** Schedule a tone with simple fade-in/fade-out. */
function scheduleTone(
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number,
): void {
  const { osc, gain } = createOscGain(ctx, type, frequency)
  const attack = Math.min(0.005, duration * 0.1)
  const release = Math.min(0.02, duration * 0.3)
  const sustain = duration - attack - release

  applyEnvelope(gain, startTime, volume, attack, 0, 1, sustain, release)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

/** Schedule a frequency sweep. */
function scheduleSweep(
  ctx: AudioContext,
  type: OscillatorType,
  freqStart: number,
  freqEnd: number,
  startTime: number,
  duration: number,
  volume: number,
): void {
  const { osc, gain } = createOscGain(ctx, type, freqStart)
  osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration)

  const attack = Math.min(0.005, duration * 0.1)
  const release = Math.min(0.03, duration * 0.3)
  const sustain = duration - attack - release

  applyEnvelope(gain, startTime, volume, attack, 0, 1, sustain, release)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
}

// ---------------------------------------------------------------------------
// Sound Definitions
// ---------------------------------------------------------------------------

/** Short 440Hz sine click, 50ms with fast decay. */
function playClick(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const { osc, gain } = createOscGain(ctx, 'sine', 440)
  applyEnvelope(gain, now, vol * 0.3, 0.002, 0.015, 0.2, 0.01, 0.023)
  osc.start(now)
  osc.stop(now + 0.06)
}

/** Very soft 880Hz sine, 20ms. */
function playHover(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const { osc, gain } = createOscGain(ctx, 'sine', 880)
  applyEnvelope(gain, now, vol * 0.1, 0.002, 0.005, 0.3, 0.005, 0.008)
  osc.start(now)
  osc.stop(now + 0.03)
}

/** Two-tone sweep 440 -> 660Hz, 100ms. */
function playNavigate(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  scheduleSweep(ctx, 'sine', 440, 660, now, 0.1, vol * 0.25)
}

/** Ascending three-tone 440 -> 550 -> 660Hz, 200ms total. */
function playSuccess(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.3
  scheduleTone(ctx, 'sine', 440, now, 0.06, v)
  scheduleTone(ctx, 'sine', 550, now + 0.07, 0.06, v)
  scheduleTone(ctx, 'sine', 660, now + 0.14, 0.06, v)
}

/** Descending buzz 330 -> 220Hz, 150ms. */
function playError(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  scheduleSweep(ctx, 'sawtooth', 330, 220, now, 0.15, vol * 0.2)
}

/** Gentle bell 880Hz with harmonics, 300ms. */
function playNotification(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.2

  // Fundamental
  const { osc: o1, gain: g1 } = createOscGain(ctx, 'sine', 880)
  applyEnvelope(g1, now, v, 0.003, 0.03, 0.4, 0.1, 0.17)
  o1.start(now)
  o1.stop(now + 0.35)

  // 2nd harmonic
  const { osc: o2, gain: g2 } = createOscGain(ctx, 'sine', 1760)
  applyEnvelope(g2, now, v * 0.3, 0.003, 0.02, 0.2, 0.08, 0.2)
  o2.start(now)
  o2.stop(now + 0.35)

  // 3rd harmonic
  const { osc: o3, gain: g3 } = createOscGain(ctx, 'sine', 2640)
  applyEnvelope(g3, now, v * 0.15, 0.003, 0.015, 0.1, 0.05, 0.23)
  o3.start(now)
  o3.stop(now + 0.35)
}

/** Triumphant ascending 440 -> 550 -> 660 -> 880Hz with shimmer, 500ms. */
function playAchievement(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.3

  scheduleTone(ctx, 'sine', 440, now, 0.1, v)
  scheduleTone(ctx, 'sine', 550, now + 0.1, 0.1, v)
  scheduleTone(ctx, 'sine', 660, now + 0.2, 0.1, v)
  scheduleTone(ctx, 'sine', 880, now + 0.3, 0.2, v)

  // Shimmer/reverb-like high harmonic
  const { osc: shimmer, gain: sg } = createOscGain(ctx, 'sine', 1760)
  applyEnvelope(sg, now + 0.3, v * 0.15, 0.01, 0.05, 0.3, 0.1, 0.15)
  shimmer.start(now + 0.3)
  shimmer.stop(now + 0.55)
}

/** Level-up: ascending tones with added sparkle (high harmonics), 500ms. */
function playLevelUp(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.3

  // Main ascending tones
  scheduleTone(ctx, 'sine', 440, now, 0.08, v)
  scheduleTone(ctx, 'sine', 550, now + 0.08, 0.08, v)
  scheduleTone(ctx, 'sine', 660, now + 0.16, 0.08, v)
  scheduleTone(ctx, 'sine', 880, now + 0.24, 0.15, v)

  // Sparkle layer (high frequency quick bursts)
  scheduleTone(ctx, 'sine', 2200, now + 0.28, 0.03, v * 0.2)
  scheduleTone(ctx, 'sine', 2800, now + 0.32, 0.03, v * 0.15)
  scheduleTone(ctx, 'sine', 3300, now + 0.36, 0.03, v * 0.1)
  scheduleTone(ctx, 'sine', 4000, now + 0.4, 0.05, v * 0.08)
}

/** Sharp tick 1000Hz, 30ms. */
function playCountdown(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const { osc, gain } = createOscGain(ctx, 'square', 1000)
  applyEnvelope(gain, now, vol * 0.25, 0.001, 0.008, 0.3, 0.005, 0.016)
  osc.start(now)
  osc.stop(now + 0.04)
}

/** Dramatic horn sweep 220 -> 440Hz, 400ms. */
function playBattleStart(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.35

  // Main horn sweep
  scheduleSweep(ctx, 'sawtooth', 220, 440, now, 0.3, v)

  // Final sustain note
  scheduleTone(ctx, 'sine', 440, now + 0.3, 0.1, v * 0.6)

  // Sub-bass rumble
  scheduleSweep(ctx, 'sine', 80, 110, now, 0.35, v * 0.3)
}

/** Victory fanfare: ascending with sustain, 800ms. */
function playBattleWin(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.3

  // Ascending fanfare
  scheduleTone(ctx, 'sine', 440, now, 0.12, v)
  scheduleTone(ctx, 'sine', 550, now + 0.12, 0.12, v)
  scheduleTone(ctx, 'sine', 660, now + 0.24, 0.12, v)

  // Sustained triumph note
  const { osc: hold, gain: hg } = createOscGain(ctx, 'sine', 880)
  applyEnvelope(hg, now + 0.36, v, 0.01, 0.05, 0.7, 0.2, 0.2)
  hold.start(now + 0.36)
  hold.stop(now + 0.85)

  // Harmonic overlay
  const { osc: harm, gain: harmG } = createOscGain(ctx, 'sine', 1320)
  applyEnvelope(harmG, now + 0.36, v * 0.2, 0.02, 0.05, 0.5, 0.15, 0.25)
  harm.start(now + 0.36)
  harm.stop(now + 0.85)
}

/** Gentle descending 440 -> 330 -> 220Hz, soft, 400ms. */
function playBattleLose(ctx: AudioContext, vol: number): void {
  const now = ctx.currentTime
  const v = vol * 0.2

  scheduleTone(ctx, 'sine', 440, now, 0.1, v)
  scheduleTone(ctx, 'sine', 330, now + 0.12, 0.1, v)
  scheduleSweep(ctx, 'sine', 280, 220, now + 0.24, 0.16, v)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Map of sound keys to their play functions. */
const UI_SOUND_PLAYERS: Record<UISoundKey, (ctx: AudioContext, vol: number) => void> = {
  'click': playClick,
  'hover': playHover,
  'navigate': playNavigate,
  'success': playSuccess,
  'error': playError,
  'notification': playNotification,
  'achievement': playAchievement,
  'levelup': playLevelUp,
  'countdown': playCountdown,
  'battle-start': playBattleStart,
  'battle-win': playBattleWin,
  'battle-lose': playBattleLose,
}

/** Lazily-created shared AudioContext for UI sounds. */
let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedContext) {
    try {
      sharedContext = new AudioContext()
    } catch {
      return null
    }
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume()
  }
  return sharedContext
}

/**
 * Play a UI sound by key.
 * @param key — which sound to play
 * @param volume — master volume 0-1 (usually from settings store)
 */
export function playUISound(key: UISoundKey, volume: number): void {
  const ctx = getContext()
  if (!ctx) return

  const player = UI_SOUND_PLAYERS[key]
  player(ctx, volume)
}
