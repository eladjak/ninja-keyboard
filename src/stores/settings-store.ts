import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  /** Whether sound effects are enabled */
  soundEnabled: boolean
  /** Sound volume, 0-1 */
  soundVolume: number
  /** Show the finger guide diagram during lessons */
  showFingerGuide: boolean
  /** Show color zones on the visual keyboard */
  showKeyboardColors: boolean
  /** Toggle sound on/off */
  toggleSound: () => void
  /** Set volume */
  setVolume: (volume: number) => void
  /** Toggle finger guide */
  toggleFingerGuide: () => void
  /** Toggle keyboard color zones */
  toggleKeyboardColors: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      soundVolume: 0.7,
      showFingerGuide: true,
      showKeyboardColors: true,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      setVolume: (volume) =>
        set({ soundVolume: Math.max(0, Math.min(1, volume)) }),

      toggleFingerGuide: () =>
        set((s) => ({ showFingerGuide: !s.showFingerGuide })),

      toggleKeyboardColors: () =>
        set((s) => ({ showKeyboardColors: !s.showKeyboardColors })),
    }),
    { name: 'ninja-keyboard-settings' },
  ),
)
