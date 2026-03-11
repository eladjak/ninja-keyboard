/**
 * Character-to-skill mapping for teachers.
 * Maps each game character to the typing skills they teach,
 * so teachers can plan lessons without needing to understand the narrative.
 */

export interface CharacterSkillMap {
  id: string
  nameHe: string
  emoji: string
  accentColor: string
  skillCategory: string
  skillCategoryHe: string
  skills: string[]
  /** What teachers should focus on when this character is active */
  teacherNote: string
  /** Age range this character is most relevant for */
  ageRange: string
}

export const CHARACTER_SKILL_MAPS: CharacterSkillMap[] = [
  {
    id: 'ki',
    nameHe: 'קי',
    emoji: '🥷',
    accentColor: '#6C5CE7',
    skillCategory: 'fundamentals',
    skillCategoryHe: 'יסודות',
    skills: [
      'טיפוס שורת הבית (ASDF JKL:)',
      'יציבה נכונה בישיבה',
      'מיקום אצבעות על המקלדת',
      'הקלדה עיוורת בסיסית',
      'קצב ואחידות הקלדה',
    ],
    teacherNote: 'קי מלמד את הבסיס — ודאו שהתלמידים יושבים נכון ומכירים את שורת הבית לפני שממשיכים',
    ageRange: '6–10',
  },
  {
    id: 'mika',
    nameHe: 'מיקה',
    emoji: '⚡',
    accentColor: '#FDCB6E',
    skillCategory: 'shortcuts',
    skillCategoryHe: 'קיצורי דרך',
    skills: [
      'קיצורי מקלדת של Windows',
      'Ctrl+C / Ctrl+V / Ctrl+Z',
      'Alt+Tab — מעבר בין חלונות',
      'Windows+D / Windows+L',
      'קיצורים בדפדפן (Ctrl+T / Ctrl+W)',
      'ניהול שולחן עבודה יעיל',
    ],
    teacherNote: 'מיקה מלמד פרודוקטיביות — נהדר לתלמידים שכבר הקלידו בסיסי ורוצים לעבוד מהר יותר',
    ageRange: '10–16',
  },
  {
    id: 'yuki',
    nameHe: 'יוקי',
    emoji: '🦊',
    accentColor: '#00B894',
    skillCategory: 'speed',
    skillCategoryHe: 'מהירות',
    skills: [
      'אימוני מהירות מדודים',
      'אתגרי מ/ד (מילים לדקה)',
      'שמירה על קצב קבוע',
      'הקלדת משפטים ארוכים',
      'תחרות על שיאים אישיים',
    ],
    teacherNote: 'יוקי מאתגר במהירות — מתאים לתלמידים שכבר מקלידים בדיוק גבוה ורוצים לשפר קצב',
    ageRange: '10–16',
  },
  {
    id: 'luna',
    nameHe: 'לונה',
    emoji: '🌙',
    accentColor: '#A29BFE',
    skillCategory: 'creative',
    skillCategoryHe: 'יצירתיות',
    skills: [
      'הקלדת טקסט חופשי וביטוי עצמי',
      'כתיבה יצירתית ופיוטית',
      'שימוש בסימני פיסוק',
      'אותיות גדולות ומיוחדות',
      'עריכת טקסט ועיצובו',
    ],
    teacherNote: 'לונה עוזרת לתלמידים להביע את עצמם — מצוינת למשימות כתיבה יצירתית עם מקלדת',
    ageRange: '8–14',
  },
  {
    id: 'noa',
    nameHe: 'נועה',
    emoji: '🎯',
    accentColor: '#55EFC4',
    skillCategory: 'accuracy',
    skillCategoryHe: 'דיוק',
    skills: [
      'הקלדה מדויקת ללא שגיאות',
      'תיקון שגיאות יעיל',
      'שימוש נכון ב-Backspace',
      'קריאת טקסט בזמן הקלדה',
      'מיקוד ואחריות לאיכות',
    ],
    teacherNote: 'נועה מתמקדת בדיוק — מתאימה לתלמידים שממהרים יותר מדי ועושים הרבה טעויות',
    ageRange: '8–14',
  },
  {
    id: 'kai',
    nameHe: 'קאי',
    emoji: '💻',
    accentColor: '#74B9FF',
    skillCategory: 'advanced',
    skillCategoryHe: 'מתקדם',
    skills: [
      'מקשי תכנות ותווים מיוחדים',
      'סוגריים, נקודותיים, גרשיים',
      'הקלדת מספרים מהירה',
      'מקשי Function (F1–F12)',
      'Home / End / Page Up / Down',
      'יסודות הקלדת קוד',
    ],
    teacherNote: 'קאי מלמד טכניקות מתקדמות — עבור תלמידים שסיימו את הבסיס ורוצים מקלדת מלאה',
    ageRange: '12–16',
  },
  {
    id: 'rex',
    nameHe: 'רקס',
    emoji: '🎮',
    accentColor: '#FF7675',
    skillCategory: 'games',
    skillCategoryHe: 'משחקים',
    skills: [
      'משחקי הקלדה מהנים',
      'אתגרי זמן ולחץ',
      'שימוש בחיצים ורווח',
      'תגובה מהירה למקשים',
      'שיפור מוטיבציה ומעורבות',
    ],
    teacherNote: 'רקס מניע עם משחקים — מצוין לתלמידים שמאבדים מוטיבציה או צריכים גיוון',
    ageRange: '6–12',
  },
  {
    id: 'pixel',
    nameHe: 'פיקסל',
    emoji: '📊',
    accentColor: '#FD79A8',
    skillCategory: 'analytics',
    skillCategoryHe: 'אנליטיקה',
    skills: [
      'מעקב אחר נתוני הקלדה אישיים',
      'ניתוח שגיאות חוזרות',
      'גרפי התקדמות לאורך זמן',
      'השוואה עם עצמי (לא עם אחרים)',
      'הצבת יעדים מדיד',
    ],
    teacherNote: 'פיקסל עוזר לתלמידים להכיר את עצמם — כלי מצוין לשיחות הורים-מורה על התקדמות',
    ageRange: '10–16',
  },
]

export type SkillCategory =
  | 'fundamentals'
  | 'shortcuts'
  | 'speed'
  | 'creative'
  | 'accuracy'
  | 'advanced'
  | 'games'
  | 'analytics'

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  fundamentals: 'יסודות',
  shortcuts: 'קיצורי דרך',
  speed: 'מהירות',
  creative: 'יצירתיות',
  accuracy: 'דיוק',
  advanced: 'מתקדם',
  games: 'משחקים',
  analytics: 'אנליטיקה',
}
