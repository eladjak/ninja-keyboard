/**
 * Keyboard Shortcuts Lessons Content
 *
 * 40+ Windows shortcuts organized by 5 categories,
 * with Hebrew names and descriptions for kids ages 6-16.
 */

// ── Types ─────────────────────────────────────────────────────────

export type ShortcutCategory =
  | 'basic'
  | 'text'
  | 'browser'
  | 'windows'
  | 'advanced'

export type ShortcutDifficulty = 1 | 2 | 3 | 4 | 5

export interface ShortcutDefinition {
  id: string
  keys: string[]
  hebrewName: string
  description: string
  category: ShortcutCategory
  difficulty: ShortcutDifficulty
}

export interface ShortcutLesson {
  id: string
  title: string
  description: string
  category: ShortcutCategory
  shortcuts: ShortcutDefinition[]
}

// ── Shortcuts Data ────────────────────────────────────────────────

export const SHORTCUTS: ShortcutDefinition[] = [
  // ── Basic (8) ─────────────────────────────────────────────────
  {
    id: 'shortcut-basic-01',
    keys: ['Ctrl', 'C'],
    hebrewName: 'העתקה',
    description: 'מעתיק את הטקסט או הקובץ שבחרתם',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-02',
    keys: ['Ctrl', 'V'],
    hebrewName: 'הדבקה',
    description: 'מדביק את מה שהעתקתם',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-03',
    keys: ['Ctrl', 'X'],
    hebrewName: 'גזירה',
    description: 'גוזר את הטקסט או הקובץ - מעביר אותו למקום אחר',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-04',
    keys: ['Ctrl', 'Z'],
    hebrewName: 'ביטול פעולה',
    description: 'מבטל את הפעולה האחרונה - כמו כפתור חזרה בזמן!',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-05',
    keys: ['Ctrl', 'A'],
    hebrewName: 'בחירת הכל',
    description: 'בוחר את כל הטקסט או הקבצים',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-06',
    keys: ['Ctrl', 'S'],
    hebrewName: 'שמירה',
    description: 'שומר את הקובץ - תמיד תשמרו!',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-07',
    keys: ['Ctrl', 'P'],
    hebrewName: 'הדפסה',
    description: 'פותח את חלון ההדפסה',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'shortcut-basic-08',
    keys: ['Ctrl', 'F'],
    hebrewName: 'חיפוש',
    description: 'פותח חיפוש - מוצא מילים בטקסט או בדף',
    category: 'basic',
    difficulty: 1,
  },

  // ── Text Editing (8) ──────────────────────────────────────────
  {
    id: 'shortcut-text-01',
    keys: ['Ctrl', 'B'],
    hebrewName: 'הדגשה (בולד)',
    description: 'הופך את הטקסט לבולט ומודגש',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-02',
    keys: ['Ctrl', 'I'],
    hebrewName: 'הטיה (איטלי)',
    description: 'הופך את הטקסט לנטוי',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-03',
    keys: ['Ctrl', 'U'],
    hebrewName: 'קו תחתון',
    description: 'מוסיף קו תחתון לטקסט',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-04',
    keys: ['Home'],
    hebrewName: 'תחילת שורה',
    description: 'קופץ לתחילת השורה',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-05',
    keys: ['End'],
    hebrewName: 'סוף שורה',
    description: 'קופץ לסוף השורה',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-06',
    keys: ['Ctrl', 'Home'],
    hebrewName: 'תחילת מסמך',
    description: 'קופץ לתחילת המסמך',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-07',
    keys: ['Ctrl', 'End'],
    hebrewName: 'סוף מסמך',
    description: 'קופץ לסוף המסמך',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'shortcut-text-08',
    keys: ['Ctrl', 'Shift', 'Arrow'],
    hebrewName: 'בחירת מילה',
    description: 'בוחר מילה שלמה בכיוון החץ',
    category: 'text',
    difficulty: 2,
  },

  // ── Browser (8) ───────────────────────────────────────────────
  {
    id: 'shortcut-browser-01',
    keys: ['Ctrl', 'T'],
    hebrewName: 'כרטיסייה חדשה',
    description: 'פותח כרטיסייה חדשה בדפדפן',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-02',
    keys: ['Ctrl', 'W'],
    hebrewName: 'סגירת כרטיסייה',
    description: 'סוגר את הכרטיסייה הנוכחית',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-03',
    keys: ['Ctrl', 'Tab'],
    hebrewName: 'כרטיסייה הבאה',
    description: 'עובר לכרטיסייה הבאה',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-04',
    keys: ['Ctrl', 'Shift', 'Tab'],
    hebrewName: 'כרטיסייה קודמת',
    description: 'חוזר לכרטיסייה הקודמת',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-05',
    keys: ['Ctrl', 'L'],
    hebrewName: 'שורת כתובת',
    description: 'קופץ לשורת הכתובת של הדפדפן',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-06',
    keys: ['Ctrl', 'R'],
    hebrewName: 'רענון דף',
    description: 'רענון הדף - טוען מחדש',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-07',
    keys: ['Ctrl', 'D'],
    hebrewName: 'הוספת סימנייה',
    description: 'שומר את הדף כסימנייה (מועדפים)',
    category: 'browser',
    difficulty: 3,
  },
  {
    id: 'shortcut-browser-08',
    keys: ['F5'],
    hebrewName: 'רענון',
    description: 'רענון הדף - דרך נוספת לטעון מחדש',
    category: 'browser',
    difficulty: 3,
  },

  // ── Windows (8) ───────────────────────────────────────────────
  {
    id: 'shortcut-windows-01',
    keys: ['Win', 'D'],
    hebrewName: 'שולחן עבודה',
    description: 'מציג את שולחן העבודה - מסתיר את כל החלונות',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-02',
    keys: ['Win', 'E'],
    hebrewName: 'סייר הקבצים',
    description: 'פותח את סייר הקבצים (Explorer)',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-03',
    keys: ['Win', 'L'],
    hebrewName: 'נעילת מחשב',
    description: 'נועל את המחשב - חשוב לפרטיות!',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-04',
    keys: ['Alt', 'Tab'],
    hebrewName: 'מעבר בין חלונות',
    description: 'עובר בין חלונות פתוחים',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-05',
    keys: ['Alt', 'F4'],
    hebrewName: 'סגירת תוכנה',
    description: 'סוגר את התוכנה הפעילה',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-06',
    keys: ['Win', 'Tab'],
    hebrewName: 'תצוגת משימות',
    description: 'מציג את כל החלונות הפתוחים בתצוגה נוחה',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-07',
    keys: ['Ctrl', 'Shift', 'Esc'],
    hebrewName: 'מנהל המשימות',
    description: 'פותח את מנהל המשימות - לסגור תוכנות תקועות',
    category: 'windows',
    difficulty: 4,
  },
  {
    id: 'shortcut-windows-08',
    keys: ['PrtSc'],
    hebrewName: 'צילום מסך',
    description: 'מצלם את כל המסך ללוח ההעתקה',
    category: 'windows',
    difficulty: 4,
  },

  // ── Advanced (8) ──────────────────────────────────────────────
  {
    id: 'shortcut-advanced-01',
    keys: ['Ctrl', 'Shift', 'T'],
    hebrewName: 'שחזור כרטיסייה',
    description: 'פותח מחדש כרטיסייה שנסגרה בטעות',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-02',
    keys: ['Ctrl', 'H'],
    hebrewName: 'חיפוש והחלפה',
    description: 'מחפש טקסט ומחליף אותו בטקסט אחר',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-03',
    keys: ['Ctrl', 'G'],
    hebrewName: 'מעבר לשורה',
    description: 'קופץ ישירות לשורה מסוימת במסמך',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-04',
    keys: ['F2'],
    hebrewName: 'שינוי שם',
    description: 'משנה שם של קובץ או תיקייה',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-05',
    keys: ['F11'],
    hebrewName: 'מסך מלא',
    description: 'עובר למצב מסך מלא בדפדפן',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-06',
    keys: ['Ctrl', 'Shift', 'N'],
    hebrewName: 'גלישה פרטית',
    description: 'פותח חלון גלישה פרטית (אינקוגניטו)',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-07',
    keys: ['Win', 'Shift', 'S'],
    hebrewName: 'צילום מסך חכם',
    description: 'בוחרים איזה חלק מהמסך לצלם',
    category: 'advanced',
    difficulty: 5,
  },
  {
    id: 'shortcut-advanced-08',
    keys: ['Ctrl', 'Shift', 'V'],
    hebrewName: 'הדבקה נקייה',
    description: 'מדביק טקסט בלי עיצוב - רק טקסט נקי',
    category: 'advanced',
    difficulty: 5,
  },
]

// ── Query Functions ───────────────────────────────────────────────

/** Get all shortcuts for a specific category */
export function getShortcutsByCategory(
  category: ShortcutCategory,
): ShortcutDefinition[] {
  return SHORTCUTS.filter((s) => s.category === category)
}

/** Get all shortcuts at or below a difficulty level */
export function getShortcutsByDifficulty(
  level: ShortcutDifficulty,
): ShortcutDefinition[] {
  return SHORTCUTS.filter((s) => s.difficulty === level)
}

/** Get a shortcut by ID */
export function getShortcutById(
  id: string,
): ShortcutDefinition | undefined {
  return SHORTCUTS.find((s) => s.id === id)
}

// ── Lessons ───────────────────────────────────────────────────────

const CATEGORY_META: Record<
  ShortcutCategory,
  { title: string; description: string }
> = {
  basic: {
    title: 'קיצורים בסיסיים',
    description: 'הקיצורים החשובים ביותר שכל משתמש מחשב חייב לדעת',
  },
  text: {
    title: 'עריכת טקסט',
    description: 'קיצורים לעריכה מהירה של טקסט במסמכים',
  },
  browser: {
    title: 'דפדפן אינטרנט',
    description: 'שליטה מהירה בדפדפן עם קיצורי מקלדת',
  },
  windows: {
    title: 'חלונות (Windows)',
    description: 'קיצורים לשליטה במערכת ההפעלה ובחלונות',
  },
  advanced: {
    title: 'קיצורים מתקדמים',
    description: 'קיצורים למשתמשים מנוסים - הפכו למומחים!',
  },
}

const CATEGORIES: ShortcutCategory[] = [
  'basic',
  'text',
  'browser',
  'windows',
  'advanced',
]

export const SHORTCUT_LESSONS: ShortcutLesson[] = CATEGORIES.map(
  (category) => ({
    id: `shortcut-lesson-${category}`,
    title: CATEGORY_META[category].title,
    description: CATEGORY_META[category].description,
    category,
    shortcuts: getShortcutsByCategory(category),
  }),
)

/** Get a lesson by its ID */
export function getShortcutLessonById(
  id: string,
): ShortcutLesson | undefined {
  return SHORTCUT_LESSONS.find((l) => l.id === id)
}

/** Get a lesson by category */
export function getShortcutLessonByCategory(
  category: ShortcutCategory,
): ShortcutLesson | undefined {
  return SHORTCUT_LESSONS.find((l) => l.category === category)
}
