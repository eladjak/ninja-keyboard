import type { LessonDefinition, LessonContent } from '@/lib/typing-engine/types'

/**
 * 20 progressive Hebrew typing lessons.
 * Ordered by frequency of Hebrew letters and keyboard rows.
 *
 * Progression:
 * 1-5:   Home row (most common Hebrew letters)
 * 6-8:   Top row (vowels + common consonants)
 * 9-11:  Bottom row (remaining letters)
 * 12-13: Final forms + full keyboard
 * 14-20: Words, sentences, speed, mastery
 */
export const LESSONS: LessonDefinition[] = [
  // ── Home Row ─────────────────────────────────────────────────
  {
    id: 'lesson-01',
    level: 1,
    titleHe: 'שורת הבית - יד ימין',
    titleEn: 'Home Row - Right Hand',
    descriptionHe: 'למדו להניח את אצבעות יד ימין על המקשים י ח ל',
    targetKeys: ['י', 'ח', 'ל'],
    newKeys: ['י', 'ח', 'ל'],
    targetWpm: 5,
    targetAccuracy: 80,
    category: 'home-row',
  },
  {
    id: 'lesson-02',
    level: 2,
    titleHe: 'שורת הבית - יד שמאל',
    titleEn: 'Home Row - Left Hand',
    descriptionHe: 'למדו להניח את אצבעות יד שמאל על המקשים ש ד ג כ',
    targetKeys: ['ש', 'ד', 'ג', 'כ'],
    newKeys: ['ש', 'ד', 'ג', 'כ'],
    targetWpm: 5,
    targetAccuracy: 80,
    category: 'home-row',
  },
  {
    id: 'lesson-03',
    level: 3,
    titleHe: 'שורת הבית - שתי הידיים',
    titleEn: 'Home Row - Both Hands',
    descriptionHe: 'תרגול שורת הבית עם שתי הידיים יחד',
    targetKeys: ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל'],
    newKeys: ['ע'],
    targetWpm: 8,
    targetAccuracy: 85,
    category: 'home-row',
  },
  {
    id: 'lesson-04',
    level: 4,
    titleHe: 'שורת הבית - זרת וקמיצה',
    titleEn: 'Home Row - Pinky & Ring',
    descriptionHe: 'תרגול מקשי הזרת: ך ף',
    targetKeys: ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
    newKeys: ['ך', 'ף'],
    targetWpm: 8,
    targetAccuracy: 85,
    category: 'home-row',
  },
  {
    id: 'lesson-05',
    level: 5,
    titleHe: 'שורת הבית - מילים ראשונות',
    titleEn: 'Home Row - First Words',
    descriptionHe: 'מילים שלמות עם אותיות שורת הבית בלבד!',
    targetKeys: ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ' '],
    newKeys: [' '],
    targetWpm: 10,
    targetAccuracy: 85,
    category: 'home-row',
  },

  // ── Top Row ──────────────────────────────────────────────────
  {
    id: 'lesson-06',
    level: 6,
    titleHe: 'שורה עליונה - א ו',
    titleEn: 'Top Row - Alef & Vav',
    descriptionHe: 'שתי האותיות הכי נפוצות! א ו הן חלק מכמעט כל מילה',
    targetKeys: ['א', 'ו'],
    newKeys: ['א', 'ו'],
    targetWpm: 10,
    targetAccuracy: 85,
    category: 'top-row',
  },
  {
    id: 'lesson-07',
    level: 7,
    titleHe: 'שורה עליונה - ר ט ק',
    titleEn: 'Top Row - Resh, Tet, Qof',
    descriptionHe: 'עוד אותיות חשובות מהשורה העליונה',
    targetKeys: ['ר', 'ט', 'ק'],
    newKeys: ['ר', 'ט', 'ק'],
    targetWpm: 10,
    targetAccuracy: 85,
    category: 'top-row',
  },
  {
    id: 'lesson-08',
    level: 8,
    titleHe: 'שורה עליונה - ן ם פ',
    titleEn: 'Top Row - Final Nun, Final Mem, Pe',
    descriptionHe: 'אותיות סופיות ופא - משלימים את השורה העליונה',
    targetKeys: ['ן', 'ם', 'פ'],
    newKeys: ['ן', 'ם', 'פ'],
    targetWpm: 10,
    targetAccuracy: 85,
    category: 'top-row',
  },

  // ── Bottom Row ───────────────────────────────────────────────
  {
    id: 'lesson-09',
    level: 9,
    titleHe: 'שורה תחתונה - ה נ מ',
    titleEn: 'Bottom Row - He, Nun, Mem',
    descriptionHe: 'שלוש אותיות נפוצות מאוד מהשורה התחתונה',
    targetKeys: ['ה', 'נ', 'מ'],
    newKeys: ['ה', 'נ', 'מ'],
    targetWpm: 10,
    targetAccuracy: 85,
    category: 'bottom-row',
  },
  {
    id: 'lesson-10',
    level: 10,
    titleHe: 'שורה תחתונה - ב ת',
    titleEn: 'Bottom Row - Bet, Tav',
    descriptionHe: 'ב ות - אותיות חיוניות להרבה מילים',
    targetKeys: ['ב', 'ת'],
    newKeys: ['ב', 'ת'],
    targetWpm: 12,
    targetAccuracy: 85,
    category: 'bottom-row',
  },
  {
    id: 'lesson-11',
    level: 11,
    titleHe: 'שורה תחתונה - ז ס צ ץ',
    titleEn: 'Bottom Row - Zayin, Samekh, Tsadi',
    descriptionHe: 'האותיות האחרונות! עכשיו יש לכם את כל המקלדת',
    targetKeys: ['ז', 'ס', 'צ', 'ץ'],
    newKeys: ['ז', 'ס', 'צ', 'ץ'],
    targetWpm: 12,
    targetAccuracy: 85,
    category: 'bottom-row',
  },

  // ── Full Keyboard ────────────────────────────────────────────
  {
    id: 'lesson-12',
    level: 12,
    titleHe: 'כל האותיות - חזרה',
    titleEn: 'All Letters - Review',
    descriptionHe: 'חזרה על כל האותיות במקלדת העברית',
    targetKeys: [],
    newKeys: [],
    targetWpm: 12,
    targetAccuracy: 85,
    category: 'full-keyboard',
  },
  {
    id: 'lesson-13',
    level: 13,
    titleHe: 'אותיות סופיות',
    titleEn: 'Final Letters',
    descriptionHe: 'תרגול מיוחד: ך ם ן ף ץ - האותיות הסופיות',
    targetKeys: ['ך', 'ם', 'ן', 'ף', 'ץ'],
    newKeys: [],
    targetWpm: 12,
    targetAccuracy: 90,
    category: 'full-keyboard',
  },

  // ── Words & Sentences ────────────────────────────────────────
  {
    id: 'lesson-14',
    level: 14,
    titleHe: 'מילים נפוצות',
    titleEn: 'Common Words',
    descriptionHe: 'תרגול המילים הנפוצות ביותר בעברית',
    targetKeys: [],
    newKeys: [],
    targetWpm: 15,
    targetAccuracy: 90,
    category: 'words',
  },
  {
    id: 'lesson-15',
    level: 15,
    titleHe: 'משפטים קצרים',
    titleEn: 'Short Sentences',
    descriptionHe: 'משפטים קצרים ופשוטים בעברית',
    targetKeys: [],
    newKeys: [],
    targetWpm: 15,
    targetAccuracy: 90,
    category: 'sentences',
  },
  {
    id: 'lesson-16',
    level: 16,
    titleHe: 'פתגמים עבריים',
    titleEn: 'Hebrew Proverbs',
    descriptionHe: 'פתגמים וביטויים מפורסמים בעברית',
    targetKeys: [],
    newKeys: [],
    targetWpm: 18,
    targetAccuracy: 90,
    category: 'sentences',
  },
  {
    id: 'lesson-17',
    level: 17,
    titleHe: 'משפטי כוח',
    titleEn: 'Power Sentences',
    descriptionHe: 'משפטים מעצימים ומעוררי השראה',
    targetKeys: [],
    newKeys: [],
    targetWpm: 18,
    targetAccuracy: 90,
    category: 'sentences',
  },
  {
    id: 'lesson-18',
    level: 18,
    titleHe: 'משפטים ארוכים',
    titleEn: 'Long Sentences',
    descriptionHe: 'משפטים ארוכים יותר לאתגר הסיבולת שלכם',
    targetKeys: [],
    newKeys: [],
    targetWpm: 20,
    targetAccuracy: 90,
    category: 'sentences',
  },

  // ── Speed & Mastery ──────────────────────────────────────────
  {
    id: 'lesson-19',
    level: 19,
    titleHe: 'אתגר מהירות',
    titleEn: 'Speed Challenge',
    descriptionHe: 'כמה מהר אתם יכולים להקליד? אתגר מהירות!',
    targetKeys: [],
    newKeys: [],
    targetWpm: 25,
    targetAccuracy: 90,
    category: 'speed',
  },
  {
    id: 'lesson-20',
    level: 20,
    titleHe: 'מאסטר מקלדת',
    titleEn: 'Keyboard Master',
    descriptionHe: 'הרמה הגבוהה ביותר - הוכיחו שאתם נינג\'ה מקלדת!',
    targetKeys: [],
    newKeys: [],
    targetWpm: 30,
    targetAccuracy: 95,
    category: 'master',
  },
]

/** Get a lesson by ID */
export function getLessonById(id: string): LessonDefinition | undefined {
  return LESSONS.find((l) => l.id === id)
}

/** Get a lesson by level number */
export function getLessonByLevel(level: number): LessonDefinition | undefined {
  return LESSONS.find((l) => l.level === level)
}

/** Get all lessons for a category */
export function getLessonsByCategory(
  category: LessonDefinition['category'],
): LessonDefinition[] {
  return LESSONS.filter((l) => l.category === category)
}
