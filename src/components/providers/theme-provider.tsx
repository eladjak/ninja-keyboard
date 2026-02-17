'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { getThemeByName } from '@/styles/themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { ageName, colorScheme } = useThemeStore()

  useEffect(() => {
    const theme = getThemeByName(ageName)
    const root = document.documentElement

    root.setAttribute('data-theme', ageName)
    root.setAttribute('data-scheme', colorScheme)

    root.style.setProperty('--theme-radius', theme.borderRadius)
    root.style.setProperty('--theme-font-scale', String(theme.fontScale))
    root.style.setProperty('--theme-button-height', `${theme.buttonHeight}px`)

    if (colorScheme === 'dark' || colorScheme === 'dark-high-contrast') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [ageName, colorScheme])

  return <>{children}</>
}
