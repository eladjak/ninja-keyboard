/**
 * Speed Test - 1-minute typing speed test.
 * Generates random text snippets for speed testing.
 */

/** Short Hebrew sentences for speed tests */
const SPEED_TEST_SENTENCES = [
  'הילדים משחקים בגן ושמחים מאוד',
  'היום יום שמשי ויפה בחוץ',
  'אני אוהב לקרוא ספרים בערב',
  'המורה מלמדת אותנו דברים חדשים',
  'חתול קטן ישן על הכיסא',
  'אנחנו הולכים לטייל בשבת',
  'הכלב רץ מהר בפארק',
  'אמא מכינה עוגה טעימה',
  'הפרחים פורחים באביב',
  'אבא קורא לנו סיפור לפני השינה',
  'הציפורים שרות בבוקר',
  'ילדה קטנה מציירת תמונה יפה',
  'השמש זורחת מהשמים הכחולים',
  'הים כחול ושקט היום',
  'אנחנו לומדים להקליד מהר',
  'המחשב עוזר לנו ללמוד',
  'הספרייה מלאה בספרים מעניינים',
  'חבר טוב תמיד שם בשבילך',
  'המוזיקה נשמעת יפה באוזניים',
  'כוכבים נוצצים בשמים בלילה',
  'גלידה קרה טעימה בקיץ',
  'האוטובוס מגיע בזמן לתחנה',
  'הילדים בונים מגדל מקוביות',
  'דג זהב שוחה באקווריום',
  'הגשם יורד והרחובות רטובים',
]

/**
 * Generate a speed test text by combining random sentences.
 * Uses a seed for deterministic results when needed.
 */
export function generateSpeedTestText(seed?: number): string {
  const shuffled = [...SPEED_TEST_SENTENCES]

  // Simple seeded shuffle (Fisher-Yates)
  const rng = seed !== undefined
    ? (max: number) => {
        seed = (seed! * 1103515245 + 12345) & 0x7fffffff
        return seed % max
      }
    : (max: number) => Math.floor(Math.random() * max)

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng(i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // Join enough sentences for ~1 minute of typing (~200 characters)
  let text = ''
  for (const sentence of shuffled) {
    if (text.length > 300) break
    text += (text ? ' ' : '') + sentence
  }
  return text
}

/** Speed test result classification */
export type SpeedRank = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'ninja'

export function getSpeedRank(wpm: number): SpeedRank {
  if (wpm >= 50) return 'ninja'
  if (wpm >= 35) return 'expert'
  if (wpm >= 25) return 'advanced'
  if (wpm >= 15) return 'intermediate'
  return 'beginner'
}

export const SPEED_RANK_LABELS: Record<SpeedRank, { he: string; emoji: string; color: string }> = {
  beginner: { he: 'מתחיל', emoji: '🌱', color: 'text-green-600' },
  intermediate: { he: 'מתקדם', emoji: '🌿', color: 'text-teal-600' },
  advanced: { he: 'מיומן', emoji: '🌳', color: 'text-blue-600' },
  expert: { he: 'מומחה', emoji: '⚡', color: 'text-purple-600' },
  ninja: { he: 'נינג׳ה!', emoji: '🥷', color: 'text-amber-600' },
}
