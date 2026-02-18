export type MascotMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'sad'
  | 'cheering'
  | 'sleeping'
  | 'surprised'

export interface MascotMessage {
  mood: MascotMood
  text: string
  duration: number
}

const REACTION_MAP: Record<string, MascotMessage> = {
  'lesson-start': { mood: 'thinking', text: 'בוא נתחיל! 🥷', duration: 3000 },
  'correct-key': { mood: 'happy', text: 'יופי!', duration: 1500 },
  'error-key': { mood: 'thinking', text: 'נסה שוב, אתה יכול!', duration: 2000 },
  'streak-3': { mood: 'excited', text: 'שלושה ברצף! 🔥', duration: 2500 },
  'streak-5': { mood: 'cheering', text: 'חמישה! אתה נינג\'ה אמיתי!', duration: 3000 },
  'lesson-complete': { mood: 'cheering', text: 'כל הכבוד! סיימת את השיעור! 🎉', duration: 4000 },
  'lesson-fail': { mood: 'sad', text: 'לא נורא, ננסה שוב! 💪', duration: 3000 },
  'level-up': { mood: 'excited', text: 'עלית רמה! 🌟', duration: 3000 },
  'badge-earned': { mood: 'cheering', text: 'תג חדש! 🏅', duration: 3000 },
  'idle-long': { mood: 'sleeping', text: 'zzz...', duration: 5000 },
  'comeback': { mood: 'surprised', text: 'חזרת! בוא נתאמן!', duration: 2500 },
  'speed-record': { mood: 'excited', text: 'שיא חדש! ⚡', duration: 3000 },
}

const IDLE_REACTION: MascotMessage = {
  mood: 'idle',
  text: '',
  duration: 0,
}

const TYPING_TIPS: readonly string[] = [
  'שמור את האצבעות על שורת הבית - א ש ד ג',
  'אל תסתכל על המקלדת! תן לאצבעות לזכור',
  'תרגול קצר כל יום עדיף על שעה פעם בשבוע',
  'נסה להקליד במהירות אחידה, בלי למהר',
  'שים לב ליציבה - גב ישר, רגליים על הרצפה',
  'השתמש באגודל לרווח - זה המקש הכי קל!',
  'כל אצבע אחראית על עמודה מסוימת במקלדת',
  'תתחיל לאט ותעלה מהירות בהדרגה',
  'טעויות זה בסדר! ככה לומדים',
  'נסה לא לחזור אחורה - פשוט המשך הלאה',
  'מנוחות קצרות עוזרות לריכוז טוב יותר',
  'דמיין את המקלדת בראש - זה עוזר!',
]

export function getMascotReaction(event: string): MascotMessage {
  return REACTION_MAP[event] ?? IDLE_REACTION
}

export function getMascotTip(): string {
  const index = Math.floor(Math.random() * TYPING_TIPS.length)
  return TYPING_TIPS[index]
}
