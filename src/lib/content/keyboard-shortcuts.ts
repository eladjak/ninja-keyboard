/**
 * keyboard-shortcuts.ts
 *
 * Public API for the keyboard shortcut learning module.
 * Exports KEYBOARD_SHORTCUTS with nameHe/descriptionHe field names,
 * re-typed from the canonical shortcuts.ts source.
 *
 * Categories:
 *   בסיסי    (basic)    — copy, paste, undo, save, select-all
 *   עריכה    (text)     — bold, italic, underline, find, replace
 *   ניווט    (browser)  — new tab, close tab, address bar, refresh
 *   חלונות   (windows)  — desktop, explorer, task-manager, alt-tab
 *   מתקדם    (advanced) — restore tab, screenshot, incognito, task-manager+
 */

// ── Adapted Shortcut type ─────────────────────────────────────────────────

/**
 * Shortcut with nameHe / descriptionHe field names (task spec shape).
 * Mirrors ShortcutDefinition from shortcuts.ts with renamed fields.
 */
export interface Shortcut {
  id: string
  /** Key sequence to press, e.g. ['Ctrl', 'C'] */
  keys: string[]
  /** Hebrew name, e.g. 'העתקה' */
  nameHe: string
  /** Hebrew description for kids */
  descriptionHe: string
  /** Lesson category */
  category: 'basic' | 'text' | 'browser' | 'windows' | 'advanced'
  /** Difficulty 1 (easiest) – 3 (hardest) used for star display */
  difficulty: 1 | 2 | 3
}

export type ShortcutCategory = Shortcut['category']

// ── Shortcuts data ────────────────────────────────────────────────────────

/**
 * Canonical list of keyboard shortcuts for the learning module.
 * Difficulty is remapped to 1-3 scale (beginner / intermediate / advanced).
 */
export const KEYBOARD_SHORTCUTS: Shortcut[] = [
  // ── בסיסי (Basic) ────────────────────────────────────────────────
  {
    id: 'ks-basic-copy',
    keys: ['Ctrl', 'C'],
    nameHe: 'העתקה',
    descriptionHe: 'מעתיק את הטקסט או הקובץ שבחרתם',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'ks-basic-paste',
    keys: ['Ctrl', 'V'],
    nameHe: 'הדבקה',
    descriptionHe: 'מדביק את מה שהעתקתם',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'ks-basic-cut',
    keys: ['Ctrl', 'X'],
    nameHe: 'גזירה',
    descriptionHe: 'גוזר את הטקסט ומעביר אותו למקום אחר',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'ks-basic-undo',
    keys: ['Ctrl', 'Z'],
    nameHe: 'ביטול פעולה',
    descriptionHe: 'מבטל את הפעולה האחרונה — כמו כפתור חזרה בזמן!',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'ks-basic-select-all',
    keys: ['Ctrl', 'A'],
    nameHe: 'בחירת הכל',
    descriptionHe: 'בוחר את כל הטקסט או הקבצים בבת אחת',
    category: 'basic',
    difficulty: 1,
  },
  {
    id: 'ks-basic-save',
    keys: ['Ctrl', 'S'],
    nameHe: 'שמירה',
    descriptionHe: 'שומר את הקובץ — תמיד תשמרו!',
    category: 'basic',
    difficulty: 1,
  },

  // ── עריכה (Editing / text) ────────────────────────────────────────
  {
    id: 'ks-text-bold',
    keys: ['Ctrl', 'B'],
    nameHe: 'הדגשה (בולד)',
    descriptionHe: 'הופך את הטקסט לבולט ומודגש',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'ks-text-italic',
    keys: ['Ctrl', 'I'],
    nameHe: 'הטיה (איטלי)',
    descriptionHe: 'הופך את הטקסט לנטוי',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'ks-text-underline',
    keys: ['Ctrl', 'U'],
    nameHe: 'קו תחתון',
    descriptionHe: 'מוסיף קו תחתון לטקסט',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'ks-text-find',
    keys: ['Ctrl', 'F'],
    nameHe: 'חיפוש',
    descriptionHe: 'פותח חיפוש — מוצא מילים בטקסט או בדף',
    category: 'text',
    difficulty: 2,
  },
  {
    id: 'ks-text-replace',
    keys: ['Ctrl', 'H'],
    nameHe: 'חיפוש והחלפה',
    descriptionHe: 'מחפש טקסט ומחליף אותו בטקסט אחר',
    category: 'text',
    difficulty: 2,
  },

  // ── ניווט (Navigation / browser) ─────────────────────────────────
  {
    id: 'ks-browser-alt-tab',
    keys: ['Alt', 'Tab'],
    nameHe: 'מעבר בין חלונות',
    descriptionHe: 'עובר בין חלונות ותוכנות פתוחות במהירות',
    category: 'browser',
    difficulty: 2,
  },
  {
    id: 'ks-browser-new-tab',
    keys: ['Ctrl', 'T'],
    nameHe: 'כרטיסייה חדשה',
    descriptionHe: 'פותח כרטיסייה חדשה בדפדפן',
    category: 'browser',
    difficulty: 2,
  },
  {
    id: 'ks-browser-close-tab',
    keys: ['Ctrl', 'W'],
    nameHe: 'סגירת כרטיסייה',
    descriptionHe: 'סוגר את הכרטיסייה הנוכחית',
    category: 'browser',
    difficulty: 2,
  },
  {
    id: 'ks-browser-refresh',
    keys: ['Ctrl', 'R'],
    nameHe: 'רענון דף',
    descriptionHe: 'טוען מחדש את הדף הנוכחי',
    category: 'browser',
    difficulty: 1,
  },
  {
    id: 'ks-browser-address',
    keys: ['Ctrl', 'L'],
    nameHe: 'שורת כתובת',
    descriptionHe: 'קופץ לשורת הכתובת של הדפדפן',
    category: 'browser',
    difficulty: 2,
  },

  // ── חלונות (Windows navigation) ───────────────────────────────────
  {
    id: 'ks-windows-desktop',
    keys: ['Win', 'D'],
    nameHe: 'שולחן עבודה',
    descriptionHe: 'מציג את שולחן העבודה ומסתיר את כל החלונות',
    category: 'windows',
    difficulty: 2,
  },
  {
    id: 'ks-windows-explorer',
    keys: ['Win', 'E'],
    nameHe: 'סייר הקבצים',
    descriptionHe: 'פותח את סייר הקבצים — מוצאים כל קובץ!',
    category: 'windows',
    difficulty: 2,
  },
  {
    id: 'ks-windows-lock',
    keys: ['Win', 'L'],
    nameHe: 'נעילת מחשב',
    descriptionHe: 'נועל את המחשב — חשוב לפרטיות!',
    category: 'windows',
    difficulty: 2,
  },
  {
    id: 'ks-windows-task-manager',
    keys: ['Ctrl', 'Shift', 'Esc'],
    nameHe: 'מנהל המשימות',
    descriptionHe: 'פותח מנהל משימות לסגירת תוכנות תקועות',
    category: 'windows',
    difficulty: 3,
  },

  // ── מתקדם (Advanced) ──────────────────────────────────────────────
  {
    id: 'ks-advanced-restore-tab',
    keys: ['Ctrl', 'Shift', 'T'],
    nameHe: 'שחזור כרטיסייה',
    descriptionHe: 'פותח מחדש כרטיסייה שנסגרה בטעות',
    category: 'advanced',
    difficulty: 3,
  },
  {
    id: 'ks-advanced-screenshot',
    keys: ['Win', 'Shift', 'S'],
    nameHe: 'צילום מסך חכם',
    descriptionHe: 'בוחרים איזה חלק מהמסך לצלם',
    category: 'advanced',
    difficulty: 3,
  },
  {
    id: 'ks-advanced-task-manager-ctrl',
    keys: ['Ctrl', 'Shift', 'Esc'],
    nameHe: 'מנהל המשימות',
    descriptionHe: 'פותח מנהל משימות ישירות — מהיר יותר מכל שיטה אחרת!',
    category: 'advanced',
    difficulty: 3,
  },
  {
    id: 'ks-advanced-close-app',
    keys: ['Alt', 'F4'],
    nameHe: 'סגירת תוכנה',
    descriptionHe: 'סוגר את התוכנה הפעילה לחלוטין',
    category: 'advanced',
    difficulty: 3,
  },
]

// ── Query helpers ─────────────────────────────────────────────────────────

/** Returns all shortcuts belonging to the given category. */
export function getKeyboardShortcutsByCategory(
  category: ShortcutCategory,
): Shortcut[] {
  return KEYBOARD_SHORTCUTS.filter((s) => s.category === category)
}

/** Returns all shortcuts at a given difficulty level (1-3). */
export function getKeyboardShortcutsByDifficulty(
  difficulty: 1 | 2 | 3,
): Shortcut[] {
  return KEYBOARD_SHORTCUTS.filter((s) => s.difficulty === difficulty)
}

/** Returns a shortcut by its id, or undefined if not found. */
export function getKeyboardShortcutById(id: string): Shortcut | undefined {
  return KEYBOARD_SHORTCUTS.find((s) => s.id === id)
}

// ── Category metadata ─────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  basic: 'בסיסי',
  text: 'עריכה',
  browser: 'ניווט',
  windows: 'חלונות',
  advanced: 'מתקדם',
}

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'קל',
  2: 'בינוני',
  3: 'קשה',
}
