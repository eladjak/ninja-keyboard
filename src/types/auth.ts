export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'
export type AuthMethod = 'email' | 'google' | 'class_code' | 'pin'

export interface UserProfile {
  id: string
  role: UserRole
  displayName: string
  avatarId: string
  age: number | null
  authMethod: AuthMethod
  parentId: string | null
  settings: Record<string, unknown>
}

export const AVATARS = [
  { id: 'fox', emoji: '\u{1F98A}', label: '\u05E9\u05D5\u05E2\u05DC' },
  { id: 'owl', emoji: '\u{1F989}', label: '\u05D9\u05E0\u05E9\u05D5\u05E3' },
  { id: 'cat', emoji: '\u{1F431}', label: '\u05D7\u05EA\u05D5\u05DC' },
  { id: 'dog', emoji: '\u{1F436}', label: '\u05DB\u05DC\u05D1' },
  { id: 'rabbit', emoji: '\u{1F430}', label: '\u05D0\u05E8\u05E0\u05D1' },
  { id: 'turtle', emoji: '\u{1F422}', label: '\u05E6\u05D1' },
  { id: 'dolphin', emoji: '\u{1F42C}', label: '\u05D3\u05D5\u05DC\u05E4\u05D9\u05DF' },
  { id: 'butterfly', emoji: '\u{1F98B}', label: '\u05E4\u05E8\u05E4\u05E8' },
] as const

export type AvatarId = typeof AVATARS[number]['id']
