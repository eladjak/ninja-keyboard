import type { AgeName, AgeTheme } from '@/types/theme'
import { shatil } from './shatil'
import { nevet } from './nevet'
import { geza } from './geza'
import { anaf } from './anaf'
import { tzameret } from './tzameret'

export { shatil, nevet, geza, anaf, tzameret }

export const themes: AgeTheme[] = [shatil, nevet, geza, anaf, tzameret]

const themeMap: Record<AgeName, AgeTheme> = {
  shatil,
  nevet,
  geza,
  anaf,
  tzameret,
}

export function getThemeByName(name: AgeName): AgeTheme {
  return themeMap[name]
}

export function getThemeForAge(age: number): AgeTheme {
  const match = themes.find(
    (t) => age >= t.ageRange[0] && age < t.ageRange[1],
  )
  return match ?? geza
}
