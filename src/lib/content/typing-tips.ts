/**
 * Typing tips and improvement suggestions.
 * Context-aware tips based on user's current performance.
 */

export interface TypingTip {
  id: string
  titleHe: string
  contentHe: string
  category: 'posture' | 'technique' | 'practice' | 'mindset'
  /** Minimum level to show this tip */
  minLevel: number
}

export const TYPING_TIPS: TypingTip[] = [
  // Posture tips
  {
    id: 'tip-posture-01',
    titleHe: 'ישיבה נכונה',
    contentHe: 'שב ישר, כפות הרגליים על הרצפה, והמסך בגובה העיניים. גב ישר = הקלדה טובה!',
    category: 'posture',
    minLevel: 1,
  },
  {
    id: 'tip-posture-02',
    titleHe: 'מיקום הידיים',
    contentHe: 'האצבעות צריכות לנוח על שורת הבית (ש ד ג כ ח ל ך ף). חזור למיקום הזה אחרי כל הקשה.',
    category: 'posture',
    minLevel: 1,
  },
  {
    id: 'tip-posture-03',
    titleHe: 'הפסקות',
    contentHe: 'עשה הפסקה קצרה כל 20 דקות. תסתכל למרחק, מתח את האצבעות, ונשום עמוק.',
    category: 'posture',
    minLevel: 1,
  },

  // Technique tips
  {
    id: 'tip-technique-01',
    titleHe: 'אל תסתכל על המקלדת',
    contentHe: 'הסתכל על המסך בלבד. בהתחלה זה קשה, אבל ככה לומדים הקלדה עיוורת.',
    category: 'technique',
    minLevel: 1,
  },
  {
    id: 'tip-technique-02',
    titleHe: 'אצבע נכונה למקש נכון',
    contentHe: 'כל אצבע אחראית על מקשים ספציפיים. השתמש באצבע הנכונה גם אם זה יותר איטי בהתחלה.',
    category: 'technique',
    minLevel: 2,
  },
  {
    id: 'tip-technique-03',
    titleHe: 'רווח עם האגודל',
    contentHe: 'לחץ על מקש הרווח עם האגודל. זה מאפשר לשאר האצבעות להישאר במקום.',
    category: 'technique',
    minLevel: 2,
  },
  {
    id: 'tip-technique-04',
    titleHe: 'הקלדה קלה',
    contentHe: 'אין צורך לדפוק על המקשים. לחיצה קלה ומדויקת היא הדרך הנכונה.',
    category: 'technique',
    minLevel: 3,
  },
  {
    id: 'tip-technique-05',
    titleHe: 'קצב אחיד',
    contentHe: 'נסה לשמור על קצב הקלדה אחיד. עדיף לאט ואחיד מאשר מהר ולא אחיד.',
    category: 'technique',
    minLevel: 5,
  },

  // Practice tips
  {
    id: 'tip-practice-01',
    titleHe: 'תרגול יומי',
    contentHe: '10 דקות כל יום עדיף על שעה פעם בשבוע. עקביות היא המפתח!',
    category: 'practice',
    minLevel: 1,
  },
  {
    id: 'tip-practice-02',
    titleHe: 'דיוק לפני מהירות',
    contentHe: 'התמקד קודם בדיוק. כשתגיע ל-90% דיוק, המהירות תגיע מאליה.',
    category: 'practice',
    minLevel: 2,
  },
  {
    id: 'tip-practice-03',
    titleHe: 'תרגל את המקשים הקשים',
    contentHe: 'בדוק בסטטיסטיקות אילו מקשים בעייתיים ותרגל אותם בנפרד.',
    category: 'practice',
    minLevel: 4,
  },
  {
    id: 'tip-practice-04',
    titleHe: 'אתגר יומי',
    contentHe: 'השלם את האתגר היומי כל יום כדי לשמור על רצף ולהרוויח XP נוסף.',
    category: 'practice',
    minLevel: 1,
  },

  // Mindset tips
  {
    id: 'tip-mindset-01',
    titleHe: 'טעויות זה בסדר',
    contentHe: 'כל אחד עושה טעויות בהתחלה. טעויות הן חלק מהלמידה, לא כישלון.',
    category: 'mindset',
    minLevel: 1,
  },
  {
    id: 'tip-mindset-02',
    titleHe: 'התקדמות לאט לאט',
    contentHe: 'שיפור של מילה אחת בדקה בשבוע זה מצוין! אל תשווה את עצמך לאחרים.',
    category: 'mindset',
    minLevel: 1,
  },
  {
    id: 'tip-mindset-03',
    titleHe: 'תחגוג הצלחות קטנות',
    contentHe: 'שברת שיא אישי? הגעת לדיוק גבוה? תחגוג! כל צעד קדימה חשוב.',
    category: 'mindset',
    minLevel: 3,
  },
]

/** Get tips appropriate for a given level */
export function getTipsForLevel(level: number): TypingTip[] {
  return TYPING_TIPS.filter((tip) => tip.minLevel <= level)
}

/** Get a random tip appropriate for the level */
export function getRandomTip(level: number, seed?: number): TypingTip {
  const available = getTipsForLevel(level)
  const index = seed !== undefined ? Math.abs(seed) % available.length : Math.floor(Math.random() * available.length)
  return available[index]
}

/** Get tips by category */
export function getTipsByCategory(category: TypingTip['category']): TypingTip[] {
  return TYPING_TIPS.filter((tip) => tip.category === category)
}

/** Category labels in Hebrew */
export const CATEGORY_LABELS: Record<TypingTip['category'], string> = {
  posture: 'יציבה',
  technique: 'טכניקה',
  practice: 'תרגול',
  mindset: 'גישה',
}
