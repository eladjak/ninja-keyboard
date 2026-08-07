import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeName, ColorScheme } from '@/types/theme'
import type { PlacementResult } from '@/lib/placement/placement-engine'
import { persistVersioning } from './persist-version'

interface ThemeState {
  ageName: AgeName
  colorScheme: ColorScheme
  /** The guest has finished the intro/name/age onboarding wizard. */
  onboardingCompleted: boolean
  /** The guest has received and saved a placement result. */
  placementCompleted: boolean
  /** Full result, including recommended skill level and first lesson. */
  placementResult: PlacementResult | null
  setAgeName: (name: AgeName) => void
  setColorScheme: (scheme: ColorScheme) => void
  completeOnboarding: () => void
  completePlacement: (result: PlacementResult) => void
  toggleDarkMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ageName: 'geza',
      colorScheme: 'default',
      onboardingCompleted: false,
      placementCompleted: false,
      placementResult: null,
      setAgeName: (ageName) => set({ ageName }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      completePlacement: (placementResult) =>
        set({ placementCompleted: true, placementResult }),
      toggleDarkMode: () =>
        set((state) => ({
          colorScheme:
            state.colorScheme === 'default'
              ? 'dark'
              : state.colorScheme === 'dark'
                ? 'default'
                : state.colorScheme === 'high-contrast'
                  ? 'dark-high-contrast'
                  : 'high-contrast',
        })),
    }),
    { name: 'ninja-keyboard-theme', ...persistVersioning() },
  ),
)
