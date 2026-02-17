import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeName, ColorScheme } from '@/types/theme'

interface ThemeState {
  ageName: AgeName
  colorScheme: ColorScheme
  setAgeName: (name: AgeName) => void
  setColorScheme: (scheme: ColorScheme) => void
  toggleDarkMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ageName: 'geza',
      colorScheme: 'default',
      setAgeName: (ageName) => set({ ageName }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
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
    { name: 'ninja-keyboard-theme' },
  ),
)
