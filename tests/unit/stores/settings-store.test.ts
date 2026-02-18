import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/stores/settings-store'

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      soundEnabled: true,
      soundVolume: 0.7,
      showFingerGuide: true,
      showKeyboardColors: true,
      keyboardLayout: 'standard',
      themePreference: 'system',
    })
  })

  it('has correct default values', () => {
    const state = useSettingsStore.getState()
    expect(state.soundEnabled).toBe(true)
    expect(state.soundVolume).toBe(0.7)
    expect(state.showFingerGuide).toBe(true)
    expect(state.showKeyboardColors).toBe(true)
    expect(state.keyboardLayout).toBe('standard')
    expect(state.themePreference).toBe('system')
  })

  it('toggles sound on and off', () => {
    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(false)

    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
  })

  it('sets volume within valid range', () => {
    useSettingsStore.getState().setVolume(0.5)
    expect(useSettingsStore.getState().soundVolume).toBe(0.5)

    useSettingsStore.getState().setVolume(1)
    expect(useSettingsStore.getState().soundVolume).toBe(1)

    useSettingsStore.getState().setVolume(0)
    expect(useSettingsStore.getState().soundVolume).toBe(0)
  })

  it('clamps volume to 0-1 range', () => {
    useSettingsStore.getState().setVolume(1.5)
    expect(useSettingsStore.getState().soundVolume).toBe(1)

    useSettingsStore.getState().setVolume(-0.3)
    expect(useSettingsStore.getState().soundVolume).toBe(0)
  })

  it('toggles finger guide', () => {
    useSettingsStore.getState().toggleFingerGuide()
    expect(useSettingsStore.getState().showFingerGuide).toBe(false)

    useSettingsStore.getState().toggleFingerGuide()
    expect(useSettingsStore.getState().showFingerGuide).toBe(true)
  })

  it('toggles keyboard colors', () => {
    useSettingsStore.getState().toggleKeyboardColors()
    expect(useSettingsStore.getState().showKeyboardColors).toBe(false)

    useSettingsStore.getState().toggleKeyboardColors()
    expect(useSettingsStore.getState().showKeyboardColors).toBe(true)
  })

  it('sets keyboard layout', () => {
    useSettingsStore.getState().setKeyboardLayout('dvorak')
    expect(useSettingsStore.getState().keyboardLayout).toBe('dvorak')

    useSettingsStore.getState().setKeyboardLayout('standard')
    expect(useSettingsStore.getState().keyboardLayout).toBe('standard')
  })

  it('sets theme preference', () => {
    useSettingsStore.getState().setThemePreference('dark')
    expect(useSettingsStore.getState().themePreference).toBe('dark')

    useSettingsStore.getState().setThemePreference('light')
    expect(useSettingsStore.getState().themePreference).toBe('light')

    useSettingsStore.getState().setThemePreference('system')
    expect(useSettingsStore.getState().themePreference).toBe('system')
  })

  it('preserves other settings when changing one', () => {
    useSettingsStore.getState().setVolume(0.3)
    useSettingsStore.getState().setKeyboardLayout('dvorak')

    const state = useSettingsStore.getState()
    expect(state.soundVolume).toBe(0.3)
    expect(state.keyboardLayout).toBe('dvorak')
    expect(state.soundEnabled).toBe(true)
    expect(state.showFingerGuide).toBe(true)
    expect(state.themePreference).toBe('system')
  })
})
