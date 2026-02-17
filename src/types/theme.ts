export type AgeName = 'shatil' | 'nevet' | 'geza' | 'anaf' | 'tzameret'

export type ColorScheme = 'default' | 'dark' | 'high-contrast' | 'dark-high-contrast'

export interface AgeTheme {
  name: AgeName
  label: string        // Hebrew display name
  emoji: string
  ageRange: [number, number]
  borderRadius: string
  fontScale: number
  buttonSize: 'sm' | 'default' | 'lg'
  buttonHeight: number  // in px
  spacing: 'compact' | 'default' | 'spacious'
  animations: 'playful' | 'standard' | 'subtle'
}

export interface ThemeConfig {
  age: AgeTheme
  colorScheme: ColorScheme
}
