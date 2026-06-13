import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_ACCENT_ID } from '@/lib/gamification/coins'

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
  /** The player's display name (used on certificates). Persisted. */
  playerName: string
  /** Set the player's display name */
  setPlayerName: (name: string) => void
  /** Coins spent so far (live balance = earned-from-stars − this). Persisted. */
  coinsSpent: number
  /** Cosmetic item ids the player has unlocked (free items are implicit). */
  unlockedCosmetics: string[]
  /** Currently equipped accent cosmetic id. */
  equippedAccent: string
  /** Record a purchase: spend coins and unlock the item. */
  purchaseCosmetic: (itemId: string, cost: number) => void
  /** Equip an (already unlocked) accent cosmetic. */
  equipAccent: (itemId: string) => void
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
  /** Whether to reduce motion/animations (accessibility) */
  reducedMotion: boolean
  /** Toggle reduced motion */
  toggleReducedMotion: () => void
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
      playerName: '',
      coinsSpent: 0,
      unlockedCosmetics: [],
      equippedAccent: DEFAULT_ACCENT_ID,

      setPlayerName: (name) => set({ playerName: name.slice(0, 30) }),

      purchaseCosmetic: (itemId, cost) =>
        set((s) =>
          s.unlockedCosmetics.includes(itemId)
            ? s
            : {
                coinsSpent: s.coinsSpent + Math.max(0, cost),
                unlockedCosmetics: [...s.unlockedCosmetics, itemId],
                // Auto-equip the freshly purchased accent.
                equippedAccent: itemId,
              },
        ),

      equipAccent: (itemId) => set({ equippedAccent: itemId }),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      setVolume: (volume) =>
        set({ soundVolume: Math.max(0, Math.min(1, volume)) }),

      toggleFingerGuide: () =>
        set((s) => ({ showFingerGuide: !s.showFingerGuide })),

      toggleKeyboardColors: () =>
        set((s) => ({ showKeyboardColors: !s.showKeyboardColors })),

      setKeyboardLayout: (layout) => set({ keyboardLayout: layout }),

      setThemePreference: (pref) => set({ themePreference: pref }),

      reducedMotion: false,
      toggleReducedMotion: () =>
        set((s) => ({ reducedMotion: !s.reducedMotion })),
    }),
    { name: 'ninja-keyboard-settings' },
  ),
)
