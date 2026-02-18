import { describe, it, expect, beforeEach } from 'vitest'
import { useAccessibilityStore } from '@/stores/accessibility-store'

describe('useAccessibilityStore', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReaderAnnouncements: true,
      keyboardOnlyMode: false,
      dyslexiaFont: false,
    })
  })

  it('has correct default values', () => {
    const state = useAccessibilityStore.getState()
    expect(state.fontSize).toBe('medium')
    expect(state.highContrast).toBe(false)
    expect(state.reducedMotion).toBe(false)
    expect(state.screenReaderAnnouncements).toBe(true)
    expect(state.keyboardOnlyMode).toBe(false)
    expect(state.dyslexiaFont).toBe(false)
  })

  it('sets font size to each valid value', () => {
    useAccessibilityStore.getState().setFontSize('small')
    expect(useAccessibilityStore.getState().fontSize).toBe('small')

    useAccessibilityStore.getState().setFontSize('large')
    expect(useAccessibilityStore.getState().fontSize).toBe('large')

    useAccessibilityStore.getState().setFontSize('extra-large')
    expect(useAccessibilityStore.getState().fontSize).toBe('extra-large')

    useAccessibilityStore.getState().setFontSize('medium')
    expect(useAccessibilityStore.getState().fontSize).toBe('medium')
  })

  it('toggles high contrast on and off', () => {
    useAccessibilityStore.getState().toggleHighContrast()
    expect(useAccessibilityStore.getState().highContrast).toBe(true)

    useAccessibilityStore.getState().toggleHighContrast()
    expect(useAccessibilityStore.getState().highContrast).toBe(false)
  })

  it('toggles reduced motion on and off', () => {
    useAccessibilityStore.getState().toggleReducedMotion()
    expect(useAccessibilityStore.getState().reducedMotion).toBe(true)

    useAccessibilityStore.getState().toggleReducedMotion()
    expect(useAccessibilityStore.getState().reducedMotion).toBe(false)
  })

  it('toggles screen reader announcements on and off', () => {
    // Default is true
    expect(useAccessibilityStore.getState().screenReaderAnnouncements).toBe(true)

    useAccessibilityStore.getState().toggleScreenReaderAnnouncements()
    expect(useAccessibilityStore.getState().screenReaderAnnouncements).toBe(false)

    useAccessibilityStore.getState().toggleScreenReaderAnnouncements()
    expect(useAccessibilityStore.getState().screenReaderAnnouncements).toBe(true)
  })

  it('toggles keyboard-only mode on and off', () => {
    useAccessibilityStore.getState().toggleKeyboardOnlyMode()
    expect(useAccessibilityStore.getState().keyboardOnlyMode).toBe(true)

    useAccessibilityStore.getState().toggleKeyboardOnlyMode()
    expect(useAccessibilityStore.getState().keyboardOnlyMode).toBe(false)
  })

  it('toggles dyslexia font on and off', () => {
    useAccessibilityStore.getState().toggleDyslexiaFont()
    expect(useAccessibilityStore.getState().dyslexiaFont).toBe(true)

    useAccessibilityStore.getState().toggleDyslexiaFont()
    expect(useAccessibilityStore.getState().dyslexiaFont).toBe(false)
  })

  it('resets all settings to defaults', () => {
    // Modify all settings
    useAccessibilityStore.getState().setFontSize('extra-large')
    useAccessibilityStore.getState().toggleHighContrast()
    useAccessibilityStore.getState().toggleReducedMotion()
    useAccessibilityStore.getState().toggleScreenReaderAnnouncements()
    useAccessibilityStore.getState().toggleKeyboardOnlyMode()
    useAccessibilityStore.getState().toggleDyslexiaFont()

    // Verify they changed
    const modified = useAccessibilityStore.getState()
    expect(modified.fontSize).toBe('extra-large')
    expect(modified.highContrast).toBe(true)
    expect(modified.reducedMotion).toBe(true)
    expect(modified.screenReaderAnnouncements).toBe(false)
    expect(modified.keyboardOnlyMode).toBe(true)
    expect(modified.dyslexiaFont).toBe(true)

    // Reset
    useAccessibilityStore.getState().resetAll()

    // Verify defaults
    const reset = useAccessibilityStore.getState()
    expect(reset.fontSize).toBe('medium')
    expect(reset.highContrast).toBe(false)
    expect(reset.reducedMotion).toBe(false)
    expect(reset.screenReaderAnnouncements).toBe(true)
    expect(reset.keyboardOnlyMode).toBe(false)
    expect(reset.dyslexiaFont).toBe(false)
  })

  it('preserves other settings when changing one', () => {
    useAccessibilityStore.getState().setFontSize('large')
    useAccessibilityStore.getState().toggleHighContrast()

    const state = useAccessibilityStore.getState()
    expect(state.fontSize).toBe('large')
    expect(state.highContrast).toBe(true)
    expect(state.reducedMotion).toBe(false)
    expect(state.screenReaderAnnouncements).toBe(true)
    expect(state.keyboardOnlyMode).toBe(false)
    expect(state.dyslexiaFont).toBe(false)
  })

  it('uses correct persistence key', () => {
    // The persist middleware stores under this key
    const storageKey = 'ninja-keyboard-accessibility'
    // Access the persist API to verify the key
    const persistApi = useAccessibilityStore.persist
    expect(persistApi.getOptions().name).toBe(storageKey)
  })
})
