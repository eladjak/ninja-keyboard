import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SOUNDS } from '@/lib/audio/sounds'

// ── Sound configuration tests (no mocking needed) ──────────────────

describe('SOUNDS configuration', () => {
  it('has all five required sound types', () => {
    expect(SOUNDS.keyClick).toBeDefined()
    expect(SOUNDS.correct).toBeDefined()
    expect(SOUNDS.error).toBeDefined()
    expect(SOUNDS.levelComplete).toBeDefined()
    expect(SOUNDS.xpGain).toBeDefined()
  })

  it('keyClick is a short click sound (single step, high freq)', () => {
    const kc = SOUNDS.keyClick
    expect(kc.steps).toHaveLength(1)
    expect(kc.steps[0].frequency).toBe(800)
    expect(kc.steps[0].duration).toBe(30)
    expect(kc.gain).toBeLessThan(0.3)
  })

  it('correct sound ascends in frequency', () => {
    const c = SOUNDS.correct
    expect(c.steps.length).toBeGreaterThanOrEqual(2)
    expect(c.steps[1].frequency).toBeGreaterThan(c.steps[0].frequency)
  })

  it('error sound descends in frequency', () => {
    const e = SOUNDS.error
    expect(e.steps.length).toBeGreaterThanOrEqual(2)
    expect(e.steps[1].frequency).toBeLessThan(e.steps[0].frequency)
  })

  it('levelComplete has three ascending steps', () => {
    const lc = SOUNDS.levelComplete
    expect(lc.steps).toHaveLength(3)
    expect(lc.steps[0].frequency).toBeLessThan(lc.steps[1].frequency)
    expect(lc.steps[1].frequency).toBeLessThan(lc.steps[2].frequency)
  })

  it('all sounds have gain values between 0 and 1', () => {
    for (const [, sound] of Object.entries(SOUNDS)) {
      expect(sound.gain).toBeGreaterThan(0)
      expect(sound.gain).toBeLessThanOrEqual(1)
    }
  })

  it('all sounds have positive durations and frequencies', () => {
    for (const [, sound] of Object.entries(SOUNDS)) {
      for (const step of sound.steps) {
        expect(step.frequency).toBeGreaterThan(0)
        expect(step.duration).toBeGreaterThan(0)
      }
    }
  })

  it('each sound has a descriptive name matching its key', () => {
    for (const [key, sound] of Object.entries(SOUNDS)) {
      expect(sound.name).toBe(key)
    }
  })

  it('sound total durations are under 500ms for responsive feedback', () => {
    for (const [, sound] of Object.entries(SOUNDS)) {
      const totalMs = sound.steps.reduce((sum, s) => sum + s.duration, 0)
      expect(totalMs).toBeLessThan(500)
    }
  })
})

// ── SoundManager tests with Web Audio API mocking ──────────────────

describe('SoundManager', () => {
  const mockStart = vi.fn()
  const mockStop = vi.fn()
  const mockFreqSetValue = vi.fn()
  const mockGainSetValue = vi.fn()
  const mockGainRamp = vi.fn()
  const mockOscConnect = vi.fn()
  const mockGainConnect = vi.fn()
  const mockResume = vi.fn().mockResolvedValue(undefined)

  let mockState: AudioContextState

  beforeEach(() => {
    mockStart.mockClear()
    mockStop.mockClear()
    mockFreqSetValue.mockClear()
    mockGainSetValue.mockClear()
    mockGainRamp.mockClear()
    mockOscConnect.mockClear()
    mockGainConnect.mockClear()
    mockResume.mockClear()
    mockState = 'running'

    const MockAudioContext = vi.fn(function (this: Record<string, unknown>) {
      this.currentTime = 0
      this.destination = {}
      this.resume = mockResume

      Object.defineProperty(this, 'state', {
        get: () => mockState,
      })

      this.createOscillator = vi.fn(() => ({
        type: 'sine',
        frequency: { setValueAtTime: mockFreqSetValue },
        connect: mockOscConnect,
        start: mockStart,
        stop: mockStop,
      }))

      this.createGain = vi.fn(() => ({
        gain: {
          setValueAtTime: mockGainSetValue,
          exponentialRampToValueAtTime: mockGainRamp,
        },
        connect: mockGainConnect,
      }))
    })

    vi.stubGlobal('AudioContext', MockAudioContext)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  async function freshSoundManager() {
    const mod = await import('@/lib/audio/sound-manager')
    return mod.soundManager
  }

  it('creates oscillators and gain nodes when playing keyClick', async () => {
    const sm = await freshSoundManager()
    sm.playKeyClick()

    // keyClick has 1 step
    expect(mockStart).toHaveBeenCalledTimes(1)
    expect(mockStop).toHaveBeenCalledTimes(1)
    expect(mockOscConnect).toHaveBeenCalledTimes(1)
    expect(mockGainConnect).toHaveBeenCalledTimes(1)
  })

  it('creates two oscillator steps for correct sound', async () => {
    const sm = await freshSoundManager()
    sm.playCorrect()

    expect(mockStart).toHaveBeenCalledTimes(2)
    expect(mockStop).toHaveBeenCalledTimes(2)
  })

  it('does not play when disabled', async () => {
    const sm = await freshSoundManager()
    sm.setEnabled(false)
    sm.playKeyClick()

    expect(mockStart).not.toHaveBeenCalled()
  })

  it('re-enables sound after being disabled', async () => {
    const sm = await freshSoundManager()
    sm.setEnabled(false)
    sm.playError()
    expect(mockStart).not.toHaveBeenCalled()

    sm.setEnabled(true)
    sm.playError()
    // error has 2 steps
    expect(mockStart).toHaveBeenCalledTimes(2)
  })

  it('applies volume multiplier to gain', async () => {
    const sm = await freshSoundManager()
    sm.setVolume(0.5)
    sm.playKeyClick()

    const expectedGain = SOUNDS.keyClick.gain * 0.5
    expect(mockGainSetValue).toHaveBeenCalledWith(
      expectedGain,
      expect.any(Number),
    )
  })

  it('clamps volume to valid range', async () => {
    const sm = await freshSoundManager()

    sm.setVolume(2.0)
    sm.playKeyClick()
    // volume clamped to 1.0 → gain = 0.15 * 1.0
    expect(mockGainSetValue).toHaveBeenCalledWith(
      SOUNDS.keyClick.gain * 1.0,
      expect.any(Number),
    )
  })

  it('creates three steps for levelComplete', async () => {
    const sm = await freshSoundManager()
    sm.playLevelComplete()

    expect(mockStart).toHaveBeenCalledTimes(3)
    expect(mockStop).toHaveBeenCalledTimes(3)
  })

  it('creates one step for xpGain', async () => {
    const sm = await freshSoundManager()
    sm.playXpGain()

    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  it('resumes suspended AudioContext on play', async () => {
    mockState = 'suspended'
    const sm = await freshSoundManager()
    sm.playKeyClick()

    expect(mockResume).toHaveBeenCalled()
  })

  it('sets frequency for each oscillator step', async () => {
    const sm = await freshSoundManager()
    sm.playCorrect()

    // correct sound: 523Hz then 698Hz
    expect(mockFreqSetValue).toHaveBeenCalledTimes(2)
    expect(mockFreqSetValue).toHaveBeenCalledWith(523, expect.any(Number))
    expect(mockFreqSetValue).toHaveBeenCalledWith(698, expect.any(Number))
  })

  it('applies exponential ramp for fade-out on each step', async () => {
    const sm = await freshSoundManager()
    sm.playKeyClick()

    expect(mockGainRamp).toHaveBeenCalledTimes(1)
    // Ramps to near-zero (0.0001)
    expect(mockGainRamp).toHaveBeenCalledWith(0.0001, expect.any(Number))
  })
})
