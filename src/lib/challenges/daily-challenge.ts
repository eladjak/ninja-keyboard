/**
 * Daily Challenge system.
 * Deterministic challenge based on date - same challenge for all users on the same day.
 */

export type ChallengeType = 'speed' | 'accuracy' | 'endurance'

export interface DailyChallenge {
  /** Unique ID based on date: daily-YYYY-MM-DD */
  id: string
  /** Challenge type */
  type: ChallengeType
  /** Hebrew title */
  titleHe: string
  /** Hebrew description */
  descriptionHe: string
  /** Target WPM to beat (for speed challenges) */
  targetWpm: number
  /** Target accuracy % to beat (for accuracy challenges) */
  targetAccuracy: number
  /** Minimum keystrokes required (for endurance challenges) */
  targetKeystrokes: number
  /** XP reward for completing the challenge */
  xpReward: number
  /** The text to type */
  text: string
  /** Date string YYYY-MM-DD */
  date: string
}

/** Challenge templates */
const CHALLENGE_TEXTS = [
  'הנינג׳ה המהיר מקליד בלי לטעות. הוא זז כמו הרוח ואצבעותיו רוקדות על המקלדת.',
  'התרגול עושה מושלם. כל יום אנחנו מתקדמים צעד אחד קדימה לקראת שליטה מלאה בהקלדה.',
  'מקלדת היא כמו כלי נגינה. ככל שמתרגלים יותר כך המנגינה נשמעת יפה יותר.',
  'הסוד להקלדה מהירה הוא לא למהר אלא להיות מדויק. המהירות תגיע עם הזמן.',
  'ילדים שלומדים להקליד מהר יכולים לכתוב סיפורים ולחלום חלומות גדולים על המסך.',
  'בבוקר בהיר יצאנו לטיול בשדות. ראינו פרחים צבעוניים ופרפרים שעפו מפרח לפרח.',
  'המחשב הוא חלון לעולם שלם של ידע. דרכו אפשר ללמוד לגלות וליצור דברים מדהימים.',
  'כשהאצבעות יודעות את הדרך הראש חופשי לחשוב על מה לכתוב ולא על איך לכתוב.',
  'נינג׳ה אמיתי לא מוותר אחרי טעות. הוא לומד ממנה וממשיך הלאה חזק יותר.',
  'הקלדה עיוורת היא כוח על. היא מאפשרת לנו ליצור להתבטא ולתקשר בצורה מהירה.',
  'בכיתה שלנו כולם אוהבים את שיעור המחשבים. אנחנו לומדים דברים חדשים ומתרגלים הקלדה.',
  'החלום שלי הוא לכתוב תוכנה שתעזור לאנשים. הצעד הראשון הוא ללמוד להקליד מהר.',
  'כל מסע מתחיל בצעד קטן. המסע שלנו להקלדה מושלמת מתחיל כאן ועכשיו.',
  'האצבעות שלנו הן הגשר בין המחשבות שלנו לבין המסך. ככל שהגשר חזק יותר התוצאה טובה יותר.',
]

const CHALLENGE_CONFIGS: Array<{
  type: ChallengeType
  titleHe: string
  descriptionHe: string
  targetWpm: number
  targetAccuracy: number
  targetKeystrokes: number
  xpReward: number
}> = [
  {
    type: 'speed',
    titleHe: 'נינג׳ה מהיר',
    descriptionHe: 'הגיע לשיא מהירות של {target} מ/ד',
    targetWpm: 20,
    targetAccuracy: 70,
    targetKeystrokes: 0,
    xpReward: 30,
  },
  {
    type: 'accuracy',
    titleHe: 'דיוק מושלם',
    descriptionHe: 'השג דיוק של {target}% לפחות',
    targetWpm: 0,
    targetAccuracy: 90,
    targetKeystrokes: 0,
    xpReward: 25,
  },
  {
    type: 'endurance',
    titleHe: 'סיבולת נינג׳ה',
    descriptionHe: 'הקלד {target} הקשות בלי הפסקה',
    targetWpm: 0,
    targetAccuracy: 70,
    targetKeystrokes: 150,
    xpReward: 35,
  },
  {
    type: 'speed',
    titleHe: 'רוח סערה',
    descriptionHe: 'הגיע ל-{target} מ/ד',
    targetWpm: 25,
    targetAccuracy: 70,
    targetKeystrokes: 0,
    xpReward: 35,
  },
  {
    type: 'accuracy',
    titleHe: 'חץ במטרה',
    descriptionHe: 'דיוק של {target}% בלי פשרות',
    targetWpm: 0,
    targetAccuracy: 95,
    targetKeystrokes: 0,
    xpReward: 40,
  },
  {
    type: 'endurance',
    titleHe: 'מרתון מקשים',
    descriptionHe: 'הקלד {target} הקשות',
    targetWpm: 0,
    targetAccuracy: 65,
    targetKeystrokes: 200,
    xpReward: 40,
  },
  {
    type: 'speed',
    titleHe: 'ברק במקלדת',
    descriptionHe: 'הגע ל-{target} מ/ד',
    targetWpm: 30,
    targetAccuracy: 75,
    targetKeystrokes: 0,
    xpReward: 45,
  },
]

/**
 * Get a deterministic hash for a date string.
 * Simple but consistent across all users.
 */
function dateSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Get today's date as YYYY-MM-DD */
export function getTodayDateStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Generate the daily challenge for a given date */
export function getDailyChallenge(dateStr?: string): DailyChallenge {
  const date = dateStr ?? getTodayDateStr()
  const seed = dateSeed(date)

  const configIndex = seed % CHALLENGE_CONFIGS.length
  const textIndex = seed % CHALLENGE_TEXTS.length
  const config = CHALLENGE_CONFIGS[configIndex]
  const text = CHALLENGE_TEXTS[textIndex]

  // Format description with target value
  const target =
    config.type === 'speed'
      ? config.targetWpm
      : config.type === 'accuracy'
        ? config.targetAccuracy
        : config.targetKeystrokes

  const descriptionHe = config.descriptionHe.replace('{target}', String(target))

  return {
    id: `daily-${date}`,
    type: config.type,
    titleHe: config.titleHe,
    descriptionHe,
    targetWpm: config.targetWpm,
    targetAccuracy: config.targetAccuracy,
    targetKeystrokes: config.targetKeystrokes,
    xpReward: config.xpReward,
    text,
    date,
  }
}

/** Check if a result meets the daily challenge goals */
export function isDailyChallengeCompleted(
  challenge: DailyChallenge,
  result: { wpm: number; accuracy: number; totalKeystrokes: number },
): boolean {
  switch (challenge.type) {
    case 'speed':
      return result.wpm >= challenge.targetWpm && result.accuracy >= challenge.targetAccuracy
    case 'accuracy':
      return result.accuracy >= challenge.targetAccuracy
    case 'endurance':
      return (
        result.totalKeystrokes >= challenge.targetKeystrokes &&
        result.accuracy >= challenge.targetAccuracy
      )
  }
}
