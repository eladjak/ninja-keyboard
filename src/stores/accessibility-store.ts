import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Font size preference for accessibility */
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large'

/** Font size pixel mappings */
export const FONT_SIZE_VALUES: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 20,
  'extra-large': 24,
}

interface AccessibilityState {
  /** Current font size preference */
  fontSize: FontSize
  /** Whether high contrast mode is enabled */
  highContrast: boolean
  /** Whether reduced motion is enabled (respects prefers-reduced-motion) */
  reducedMotion: boolean
  /** Whether screen reader announcements are enabled */
  screenReaderAnnouncements: boolean
  /** Whether keyboard-only mode is enabled (shows all focus indicators) */
  keyboardOnlyMode: boolean
  /** Whether dyslexia-friendly font is enabled */
  dyslexiaFont: boolean

  /** Set font size preference */
  setFontSize: (size: FontSize) => void
  /** Toggle high contrast mode */
  toggleHighContrast: () => void
  /** Toggle reduced motion */
  toggleReducedMotion: () => void
  /** Toggle screen reader announcements */
  toggleScreenReaderAnnouncements: () => void
  /** Toggle keyboard-only mode */
  toggleKeyboardOnlyMode: () => void
  /** Toggle dyslexia-friendly font */
  toggleDyslexiaFont: () => void
  /** Reset all accessibility settings to defaults */
  resetAll: () => void
}

const DEFAULT_STATE = {
  fontSize: 'medium' as FontSize,
  highContrast: false,
  reducedMotion: false,
  screenReaderAnnouncements: true,
  keyboardOnlyMode: false,
  dyslexiaFont: false,
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setFontSize: (fontSize) => set({ fontSize }),

      toggleHighContrast: () =>
        set((s) => ({ highContrast: !s.highContrast })),

      toggleReducedMotion: () =>
        set((s) => ({ reducedMotion: !s.reducedMotion })),

      toggleScreenReaderAnnouncements: () =>
        set((s) => ({
          screenReaderAnnouncements: !s.screenReaderAnnouncements,
        })),

      toggleKeyboardOnlyMode: () =>
        set((s) => ({ keyboardOnlyMode: !s.keyboardOnlyMode })),

      toggleDyslexiaFont: () =>
        set((s) => ({ dyslexiaFont: !s.dyslexiaFont })),

      resetAll: () => set(DEFAULT_STATE),
    }),
    { name: 'ninja-keyboard-accessibility' },
  ),
)
