/**
 * Free practice texts for the Practice Mode.
 * 5 Hebrew paragraphs, age-appropriate, progressively longer.
 */

export interface PracticeText {
  /** Unique identifier */
  id: string
  /** Hebrew title */
  titleHe: string
  /** English title */
  titleEn: string
  /** The full practice paragraph */
  text: string
  /** Difficulty: easy / medium / hard */
  difficulty: 'easy' | 'medium' | 'hard'
}

export const PRACTICE_TEXTS: PracticeText[] = [
  {
    id: 'practice-01',
    titleHe: 'בוקר טוב',
    titleEn: 'Good Morning',
    text: 'בבוקר אני קם מוקדם ושותה כוס מים. אחר כך אני מתלבש ואוכל ארוחת בוקר. אני אוהב לאכול לחם עם גבינה ועגבנייה.',
    difficulty: 'easy',
  },
  {
    id: 'practice-02',
    titleHe: 'החברים שלי',
    titleEn: 'My Friends',
    text: 'יש לי הרבה חברים טובים בבית הספר. אנחנו אוהבים לשחק יחד בהפסקות. לפעמים אנחנו משחקים כדורגל ולפעמים אנחנו מדברים על דברים מעניינים.',
    difficulty: 'easy',
  },
  {
    id: 'practice-03',
    titleHe: 'טיול בטבע',
    titleEn: 'Nature Trip',
    text: 'אתמול הלכנו לטיול בהרים. ראינו ציפורים יפות ופרחים צבעוניים. המורה סיפרה לנו על בעלי החיים שחיים באזור. בסוף הטיול ישבנו ליד הנחל ואכלנו סנדוויצים.',
    difficulty: 'medium',
  },
  {
    id: 'practice-04',
    titleHe: 'טכנולוגיה ומחשבים',
    titleEn: 'Technology and Computers',
    text: 'המחשב הוא כלי חשוב מאוד בחיים שלנו. אנחנו משתמשים בו ללימודים לעבודה ולבידור. כשאנחנו יודעים להקליד מהר אנחנו יכולים לעשות הרבה יותר דברים בזמן קצר. לכן חשוב לתרגל הקלדה כל יום.',
    difficulty: 'medium',
  },
  {
    id: 'practice-05',
    titleHe: 'חלומות גדולים',
    titleEn: 'Big Dreams',
    text: 'כל אחד מאיתנו יכול להגשים חלומות גדולים. הדרך מתחילה בצעד קטן אחד ובכל יום אנחנו מתקדמים קצת יותר. אם נמשיך להתאמן ולהאמין בעצמנו נגלה שאנחנו מסוגלים להשיג הרבה יותר ממה שחשבנו. המפתח להצלחה הוא סבלנות ונחישות.',
    difficulty: 'hard',
  },
]

/** Get a practice text by ID */
export function getPracticeText(id: string): PracticeText | undefined {
  return PRACTICE_TEXTS.find((t) => t.id === id)
}

/** Get all practice texts */
export function getAllPracticeTexts(): PracticeText[] {
  return PRACTICE_TEXTS
}
