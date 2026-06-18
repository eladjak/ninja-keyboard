'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useSettingsStore } from '@/stores/settings-store'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Pure helper: pick the best Hebrew voice from a voice list.
 *
 * Preference order:
 *   1. A voice whose lang starts with `he` (he-IL, he, etc.) — exact Hebrew.
 *   2. `null` — caller should fall back to the platform default voice OR stay
 *      silent, per `speakHebrew`'s graceful-fallback rule.
 *
 * Exported so it can be unit-tested without a real SpeechSynthesis engine.
 */
export function pickHebrewVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  for (const v of voices) {
    if (v.lang?.toLowerCase().startsWith('he')) return v
  }
  return null
}

/**
 * Pure helper: decide whether spoken voice should be allowed RIGHT NOW.
 *
 * Voice is gated by (logical AND):
 *  - the in-app `voiceEnabled` setting,
 *  - the shared `soundEnabled` setting (voice is a sound — muting sound mutes voice),
 *  - NOT reduced-motion (reduced-motion users opt out of celebratory flourishes),
 *  - the platform actually exposes `speechSynthesis`.
 *
 * Exported for unit testing.
 */
export function shouldSpeak(opts: {
  voiceEnabled: boolean
  soundEnabled: boolean
  reducedMotion: boolean
  hasSpeechSynthesis: boolean
}): boolean {
  return (
    opts.voiceEnabled &&
    opts.soundEnabled &&
    !opts.reducedMotion &&
    opts.hasSpeechSynthesis
  )
}

export interface UseSpeechResult {
  /**
   * Speak a Hebrew phrase. No-ops silently (never throws / never crashes) when
   * voice is disabled, sound is off, reduced-motion is on, the browser has no
   * SpeechSynthesis, or no usable voice/utterance can be constructed.
   *
   * If no Hebrew (`he-*`) voice exists in the environment we DO NOT force an
   * English voice — we stay silent (graceful fallback) so the app never reads
   * Hebrew text with an English accent or garbled phonemes.
   */
  speak: (text: string) => void
  /** Immediately stop any in-progress speech. Safe to call anywhere. */
  cancel: () => void
  /** Whether a usable Hebrew voice is available in this environment. */
  hebrewVoiceAvailable: boolean
  /** Whether voice will actually play given current settings + environment. */
  canSpeak: boolean
}

/**
 * React hook wrapping the free, in-browser Web Speech API
 * (`window.speechSynthesis`) for celebratory Hebrew voice lines.
 *
 * FREE — no ElevenLabs/Suno/paid dependency. Works fully offline in any browser
 * that ships a Hebrew TTS voice; degrades to SILENT (never broken) elsewhere.
 *
 * Respects: the `voiceEnabled` setting, the global `soundEnabled` mute, and
 * `prefers-reduced-motion` / the in-app reduced-motion toggle.
 *
 * SSR-safe: every browser-only API is guarded; `speak`/`cancel` are no-ops on
 * the server.
 */
export function useSpeech(): UseSpeechResult {
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const soundVolume = useSettingsStore((s) => s.soundVolume)
  const reducedMotion = useReducedMotion()

  const [hebrewVoice, setHebrewVoice] = useState<SpeechSynthesisVoice | null>(
    null,
  )
  // Track whether the platform exposes speechSynthesis (resolved on client).
  const [hasSynth, setHasSynth] = useState(false)

  // Keep latest volume in a ref so the stable `speak` callback always uses the
  // current value without being re-created on every volume tick.
  const volumeRef = useRef(soundVolume)
  volumeRef.current = soundVolume

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }
    setHasSynth(true)

    const synth = window.speechSynthesis

    const loadVoices = () => {
      // getVoices can be empty on first call (async population) — the
      // voiceschanged event fires when the list is ready.
      const voices = synth.getVoices()
      if (voices.length > 0) {
        setHebrewVoice(pickHebrewVoice(voices))
      }
    }

    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const canSpeak = shouldSpeak({
    voiceEnabled,
    soundEnabled,
    reducedMotion,
    hasSpeechSynthesis: hasSynth,
  })

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Some engines throw if nothing is queued — ignore.
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      if (!text.trim()) return

      // Re-read settings at call time so the decision is always live.
      const settings = useSettingsStore.getState()
      const allowed = shouldSpeak({
        voiceEnabled: settings.voiceEnabled,
        soundEnabled: settings.soundEnabled,
        reducedMotion,
        hasSpeechSynthesis: true,
      })
      if (!allowed) return

      // Graceful fallback: no Hebrew voice → stay silent rather than mangle
      // Hebrew through an English voice.
      if (!hebrewVoice) return

      try {
        const synth = window.speechSynthesis
        // Cancel any in-flight line so celebrations don't pile up.
        synth.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = hebrewVoice
        utterance.lang = hebrewVoice.lang || 'he-IL'
        utterance.volume = Math.max(0, Math.min(1, volumeRef.current))
        utterance.rate = 0.95 // a touch slower — clearer for kids
        utterance.pitch = 1.05 // slightly bright/friendly
        synth.speak(utterance)
      } catch {
        // Never let a TTS failure bubble into the UI.
      }
    },
    [hebrewVoice, reducedMotion],
  )

  // Stop any speech if the component using the hook unmounts.
  useEffect(() => cancel, [cancel])

  return {
    speak,
    cancel,
    hebrewVoiceAvailable: hebrewVoice !== null,
    canSpeak,
  }
}
