import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '@/stores/theme-store'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({
      ageName: 'geza',
      colorScheme: 'default',
    })
  })

  it('has correct default values', () => {
    const state = useThemeStore.getState()
    expect(state.ageName).toBe('geza')
    expect(state.colorScheme).toBe('default')
  })

  it('can set age theme', () => {
    useThemeStore.getState().setAgeName('shatil')
    expect(useThemeStore.getState().ageName).toBe('shatil')
  })

  it('can set color scheme', () => {
    useThemeStore.getState().setColorScheme('dark')
    expect(useThemeStore.getState().colorScheme).toBe('dark')
  })

  it('toggles dark mode from default to dark', () => {
    useThemeStore.getState().toggleDarkMode()
    expect(useThemeStore.getState().colorScheme).toBe('dark')
  })

  it('toggles dark mode from dark to default', () => {
    useThemeStore.setState({ colorScheme: 'dark' })
    useThemeStore.getState().toggleDarkMode()
    expect(useThemeStore.getState().colorScheme).toBe('default')
  })

  it('toggles dark mode from high-contrast to dark-high-contrast', () => {
    useThemeStore.setState({ colorScheme: 'high-contrast' })
    useThemeStore.getState().toggleDarkMode()
    expect(useThemeStore.getState().colorScheme).toBe('dark-high-contrast')
  })

  it('supports all age themes', () => {
    const themes = ['shatil', 'nevet', 'geza', 'anaf', 'tzameret'] as const
    for (const theme of themes) {
      useThemeStore.getState().setAgeName(theme)
      expect(useThemeStore.getState().ageName).toBe(theme)
    }
  })
})
