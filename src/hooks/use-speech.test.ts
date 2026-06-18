/**
 * Tests for useSpeech — the free Web Speech API wrapper used for celebratory
 * Hebrew voice lines. Covers the pure decision helpers plus the hook's gating,
 * graceful-fallback, and SSR-safe behavior against a faked SpeechSynthesis.
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useSpeech,
  pickHebrewVoice,
  shouldSpeak,
} from './use-speech'
import { useSettingsStore } from '@/stores/settings-store'
import { useAccessibilityStore } from '@/stores/accessibility-store'

function voice(lang: string, name = lang): SpeechSynthesisVoice {
  return {
    lang,
    name,
    default: false,
    localService: true,
    voiceURI: name,
  } as SpeechSynthesisVoice
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('pickHebrewVoice', () => {
  it('returns the he-IL voice when present', () => {
    const voices = [voice('en-US'), voice('he-IL'), voice('fr-FR')]
    expect(pickHebrewVoice(voices)?.lang).toBe('he-IL')
  })

  it('matches any he-* lang case-insensitively', () => {
    expect(pickHebrewVoice([voice('HE')])?.lang).toBe('HE')
    expect(pickHebrewVoice([voice('he')])?.lang).toBe('he')
  })

  it('returns null when no Hebrew voice exists', () => {
    expect(pickHebrewVoice([voice('en-US'), voice('ar-SA')])).toBeNull()
  })

  it('returns null for an empty list', () => {
    expect(pickHebrewVoice([])).toBeNull()
  })
})

describe('shouldSpeak', () => {
  const base = {
    voiceEnabled: true,
    soundEnabled: true,
    reducedMotion: false,
    hasSpeechSynthesis: true,
  }

  it('allows speech when everything is enabled', () => {
    expect(shouldSpeak(base)).toBe(true)
  })

  it('blocks when voice is disabled', () => {
    expect(shouldSpeak({ ...base, voiceEnabled: false })).toBe(false)
  })

  it('blocks when global sound is muted', () => {
    expect(shouldSpeak({ ...base, soundEnabled: false })).toBe(false)
  })

  it('blocks when reduced motion is on', () => {
    expect(shouldSpeak({ ...base, reducedMotion: true })).toBe(false)
  })

  it('blocks when the platform has no SpeechSynthesis', () => {
    expect(shouldSpeak({ ...base, hasSpeechSynthesis: false })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Hook behavior against a faked SpeechSynthesis
// ---------------------------------------------------------------------------

interface FakeSynth {
  speak: ReturnType<typeof vi.fn>
  cancel: ReturnType<typeof vi.fn>
  getVoices: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
}

function installSynth(voices: SpeechSynthesisVoice[]): FakeSynth {
  const synth: FakeSynth = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', synth)
  // jsdom lacks SpeechSynthesisUtterance — provide a minimal constructor.
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string
      voice: SpeechSynthesisVoice | null = null
      lang = ''
      volume = 1
      rate = 1
      pitch = 1
      constructor(t: string) {
        this.text = t
      }
    },
  )
  return synth
}

function resetStores() {
  useSettingsStore.setState({
    voiceEnabled: true,
    soundEnabled: true,
    soundVolume: 0.7,
  })
  useAccessibilityStore.setState({ reducedMotion: false })
}

describe('useSpeech (hook)', () => {
  beforeEach(resetStores)

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('speaks a Hebrew utterance when a Hebrew voice is available', () => {
    const synth = installSynth([voice('en-US'), voice('he-IL')])
    const { result } = renderHook(() => useSpeech())

    expect(result.current.hebrewVoiceAvailable).toBe(true)
    expect(result.current.canSpeak).toBe(true)

    act(() => result.current.speak('כל הכבוד!'))

    expect(synth.speak).toHaveBeenCalledTimes(1)
    const utterance = synth.speak.mock.calls[0][0]
    expect(utterance.text).toBe('כל הכבוד!')
    expect(utterance.voice.lang).toBe('he-IL')
    expect(utterance.volume).toBeCloseTo(0.7)
  })

  it('stays SILENT (no crash) when no Hebrew voice exists — graceful fallback', () => {
    const synth = installSynth([voice('en-US'), voice('ar-SA')])
    const { result } = renderHook(() => useSpeech())

    expect(result.current.hebrewVoiceAvailable).toBe(false)
    act(() => result.current.speak('כל הכבוד!'))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('does not speak when voice is disabled in settings', () => {
    const synth = installSynth([voice('he-IL')])
    useSettingsStore.setState({ voiceEnabled: false })
    const { result } = renderHook(() => useSpeech())

    expect(result.current.canSpeak).toBe(false)
    act(() => result.current.speak('שלום'))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('does not speak when global sound is muted', () => {
    const synth = installSynth([voice('he-IL')])
    useSettingsStore.setState({ soundEnabled: false })
    const { result } = renderHook(() => useSpeech())

    expect(result.current.canSpeak).toBe(false)
    act(() => result.current.speak('שלום'))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('does not speak when reduced motion is on', () => {
    const synth = installSynth([voice('he-IL')])
    useAccessibilityStore.setState({ reducedMotion: true })
    const { result } = renderHook(() => useSpeech())

    expect(result.current.canSpeak).toBe(false)
    act(() => result.current.speak('שלום'))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('ignores empty/whitespace text', () => {
    const synth = installSynth([voice('he-IL')])
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('   '))
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('cancel() stops in-progress speech', () => {
    const synth = installSynth([voice('he-IL')])
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.cancel())
    expect(synth.cancel).toHaveBeenCalled()
  })

  it('reports no Hebrew voice and cannot speak when SpeechSynthesis is absent', () => {
    // No installSynth → window has no speechSynthesis.
    const { result } = renderHook(() => useSpeech())
    expect(result.current.hebrewVoiceAvailable).toBe(false)
    expect(result.current.canSpeak).toBe(false)
    // Must not throw.
    act(() => result.current.speak('שלום'))
    act(() => result.current.cancel())
  })
})
