import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Keyboard layout variants: standard Hebrew or Dvorak Hebrew */
export type KeyboardLayout = 'standard' | 'dvorak'

/** Theme preference: system, light, or dark */
export type ThemePreference = 'system' | 'light' | 'dark'

interface SettingsState {
  /** Whether sound effects are enabled */
  soundEnabled: boolean
  /** Sound volume, 0-1 */
  soundVolume: number
  /** Show the finger guide diagram during lessons */
  showFingerGuide: boolean
  /** Show color zones on the visual keyboard */
  showKeyboardColors: boolean
  /** Keyboard layout preference */
  keyboardLayout: KeyboardLayout
  /** Theme preference (system/light/dark) */
  themePreference: ThemePreference
  /** Toggle sound on/off */
  toggleSound: () => void
  /** Set volume */
  setVolume: (volume: number) => void
  /** Toggle finger guide */
  toggleFingerGuide: () => void
  /** Toggle keyboard color zones */
  toggleKeyboardColors: () => void
  /** Set keyboard layout */
  setKeyboardLayout: (layout: KeyboardLayout) => void
  /** Set theme preference */
  setThemePreference: (pref: ThemePreference) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      soundVolume: 0.7,
      showFingerGuide: true,
      showKeyboardColors: true,
      keyboardLayout: 'standard' as KeyboardLayout,
      themePreference: 'system' as ThemePreference,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      setVolume: (volume) =>
        set({ soundVolume: Math.max(0, Math.min(1, volume)) }),

      toggleFingerGuide: () =>
        set((s) => ({ showFingerGuide: !s.showFingerGuide })),

      toggleKeyboardColors: () =>
        set((s) => ({ showKeyboardColors: !s.showKeyboardColors })),

      setKeyboardLayout: (layout) => set({ keyboardLayout: layout }),

      setThemePreference: (pref) => set({ themePreference: pref }),
    }),
    { name: 'ninja-keyboard-settings' },
  ),
)
