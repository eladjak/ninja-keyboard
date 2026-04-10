/**
 * Drill text generator for weak-key practice.
 * Pure functions — no side effects, no state.
 */

export type DrillDifficulty = 'easy' | 'medium' | 'hard'

/**
 * Map of Hebrew keys to common short words containing them.
 * Covers the standard Hebrew keyboard layout (Qwerty-He).
 */
export const HEBREW_DRILL_WORDS: Readonly<Record<string, string[]>> = {
  א: ['אבא', 'אמא', 'אחד', 'אנחנו', 'אפשר', 'אחת', 'אור', 'אז'],
  ב: ['בית', 'בסדר', 'בוא', 'ביחד', 'בגד', 'בן', 'בת', 'בלב'],
  ג: ['גדול', 'גם', 'גבוה', 'גשם', 'גן', 'גיבור', 'גוף', 'גל'],
  ד: ['דף', 'דבש', 'דרך', 'דלת', 'דג', 'דם', 'דעת', 'דור'],
  ה: ['הוא', 'היא', 'הם', 'הן', 'הכל', 'היה', 'הרבה', 'הלך'],
  ו: ['וגם', 'ויש', 'ואז', 'ורד', 'ויכול', 'ובית', 'ולא', 'וכן'],
  ז: ['זה', 'זאת', 'זמן', 'זכר', 'זרוע', 'זהב', 'זיכרון', 'זית'],
  ח: ['חבר', 'חלב', 'חם', 'חופש', 'חיה', 'חדש', 'חשוב', 'חלום'],
  ט: ['טוב', 'טבע', 'טעם', 'טיול', 'טלפון', 'טירה', 'טעות', 'טהור'],
  י: ['יש', 'יכול', 'ילד', 'יפה', 'ים', 'ידע', 'יום', 'יד'],
  כ: ['כן', 'כבר', 'כל', 'כך', 'כוח', 'כיף', 'כלב', 'כדור'],
  ל: ['לא', 'לב', 'לילה', 'למה', 'לפני', 'לשחק', 'לרוץ', 'לדעת'],
  מ: ['מה', 'מים', 'מחר', 'מאוד', 'מגן', 'מלך', 'מבצע', 'מרוץ'],
  נ: ['נו', 'נחמד', 'נהדר', 'ניצחון', 'נשמה', 'נסיעה', 'נכון', 'נפש'],
  ס: ['סבבה', 'סיפור', 'ספר', 'סיום', 'סוף', 'סתיו', 'סלק', 'סוד'],
  ע: ['עם', 'על', 'עכשיו', 'עצמה', 'עולם', 'עץ', 'עבודה', 'עז'],
  פ: ['פה', 'פעם', 'פשוט', 'פרי', 'פחד', 'פגישה', 'פרח', 'פסח'],
  צ: ['צחוק', 'צבע', 'ציור', 'צהוב', 'צפון', 'צרות', 'צעד', 'צוות'],
  ק: ['קל', 'קצר', 'קשה', 'קפה', 'קבוצה', 'קיץ', 'קסם', 'קול'],
  ר: ['רגע', 'רב', 'רחוק', 'ריצה', 'רעיון', 'רוח', 'רעש', 'רגל'],
  ש: ['שם', 'שלום', 'שחקן', 'שעה', 'שמש', 'שינה', 'שיר', 'שיעור'],
  ת: ['תודה', 'תמיד', 'תוצאה', 'תכנית', 'תקווה', 'תפוח', 'תרגיל', 'תחרות'],
  // Common punctuation / space handled separately
  ' ': ['מה שלום', 'כן טוב', 'לא כן', 'הלאה קדימה'],
}

/**
 * Hard-mode sentence templates per key.
 * Each sentence is rich with the target key.
 */
const HEBREW_DRILL_SENTENCES: Readonly<Record<string, string[]>> = {
  א: [
    'אמא אמרה שאפשר לאכול אבטיח אחרי ארוחת אחר הצהריים',
    'אנחנו אוהבים ללכת אחד אחד אל האוהל האדום',
  ],
  ב: [
    'בבית הגדול גרים בני משפחה ובחרנו לבשל ביחד ארוחת בוקר',
    'בחור בגדים בצבע בהיר בבוקר וביום יום בחר בצבע כהה',
  ],
  ג: [
    'גיבור גדול גר בגן ירוק וגידל גזר וגם גמד קטן',
    'גשם גדול ירד בגינה וגרם לגידולים לגדול גבוה יותר',
  ],
  ד: [
    'דוד דחף את הדלת הדחוסה ודיבר על דרכי הדרך לדרום',
    'דג קטן שחה בדרך הדולה ודלג מדוגמה לדוגמה',
  ],
  ה: [
    'הוא הלך הביתה והחליט שהיום הוא יהיה הגיבור של ההרפתקה',
    'היא הכינה ארוחה הכי טעימה שהיתה בהיסטוריה של הבית הזה',
  ],
  ו: [
    'ויש לנו זמן ויכולנו לשחק ולרוץ ולצחוק ביחד כל הלילה',
    'ורד ויולת ושושנה ותמר ולילה ישבו ודיברו ושרו בגן',
  ],
  ז: [
    'זה זמן טוב לזכור שזהב אמיתי זוהר בכל זווית ובכל זמן',
    'זיכרון זה דבר מיוחד שזוכרים אותו זמן רב אחרי שקרה',
  ],
  ח: [
    'חברים טובים חולקים חלום ומחפשים חיים מלאים חוויה וחופש',
    'חם בחוץ ואנחנו חייבים לשתות חמישה כוסות חלב ביום',
  ],
  ט: [
    'טיולים בטבע מטעינים את הנשמה ומיטיבים עם הגוף הטירד',
    'טלפון חכם הוא כלי טוב אם משתמשים בו בטעם ובמידה טובה',
  ],
  י: [
    'ילדים יכולים ללמוד יותר כאשר יש להם ידע ויצירתיות יחד',
    'יום יפה מתחיל בבוקר כאשר יש יחד יכולת ורצון ללמוד',
  ],
  כ: [
    'כולם כבר יודעים שכישרון כן דורש כוח רצון וכישרון אמיתי',
    'כל כלב כשהוא קטן כזה הוא כנראה הכי חמוד כאלה',
  ],
  ל: [
    'לפעמים לוקח לנו הרבה לנסות ללמוד דברים חדשים לגמרי',
    'לרוץ לשחק ולצחוק ולחיות חיים טובים זה כל מה שלב מבקש',
  ],
  מ: [
    'מחר בבוקר נצא למסע מרגש למרחקים ונמצא מה שמחפשים',
    'מים הם מקור חיים ומאפשרים מחיה לכל מה שחי על מדף האדמה',
  ],
  נ: [
    'ניצחון נראה רחוק אבל נחישות ונאמנות נותנים כוח להמשיך',
    'נשמה נדיבה נותנת נחמה לכולם ונוצרת נפלא כשעוזרים לאחרים',
  ],
  ס: [
    'סיפור טוב סוחף סקרנות ומסייע לנו לסגל ידע חדש ומרתק',
    'סתיו סגול עם עלים סגולים וסומק אדום על הסלים המלאים',
  ],
  ע: [
    'עכשיו עם עמידה עצמאית נוכל לעשות עבודה עם ערך אמיתי',
    'עצמה עמוקה עוזרת לעבור עתות קשות ולעלות על כל עם קושי',
  ],
  פ: [
    'פעמים רבות פרי פשוט כמו פלפל ופתח הפה לפתח פתרונות',
    'פסח מביא פגישות פמיליה עם פירות פרחים ופסלים לצד השולחן',
  ],
  צ: [
    'ציורים צבעוניים צרפתיים צומחים בצד הצפוני של הצהוב הצרוב',
    'צחוק מצחיק יוצר צ\'יבוב שמצחיק את כל הצוות הצעיר',
  ],
  ק: [
    'קשה לקבל קלות ראש בקרב קבלת החלטות קריטיות ובעייתיות',
    'קיץ קסום מביא קרניים של קרינה ושמש קלה על כל קיר',
  ],
  ר: [
    'רגע אחד של ריכוז ורצון חזק יכול לשנות רעיון רדום לרחב',
    'ריצה בבוקר מרעננת רוח ורגש ומרפאת רבים מצרות יומיות',
  ],
  ש: [
    'שחקנים שרים שירים שמחים שמאפשרים שהרגשה שמחה תשרה עלינו',
    'שמש שוקעת שופכת שלג של אור שמסיים שעות של שחייה',
  ],
  ת: [
    'תמיד תוכלו לתרגל ולתקן ולהתחיל מחדש עם תקווה ותוצאות טובות',
    'תרגיל תכנות מלמד תכנון תוכנה ותפיסת תהליכים מורכבים',
  ],
}

/**
 * Repeat a single character with spaces between repetitions.
 * Used for easy drills.
 */
function repeatChar(char: string, times: number): string {
  return Array.from({ length: times }, () => char).join(' ')
}

/**
 * Pick a random element from an array.
 */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Build easy drill text: the target characters repeated with spaces.
 * Example output: "ש ש ש ש ש ל ל ל ש ש"
 */
function buildEasyDrill(weakKeys: string[]): string {
  const segments: string[] = []

  for (const key of weakKeys) {
    // 6 repetitions per key
    segments.push(repeatChar(key, 6))
  }

  // Interleave all keys a few more times for variety
  for (let i = 0; i < 3; i++) {
    const key = pickRandom(weakKeys)
    segments.push(repeatChar(key, 4))
  }

  return segments.join('  ')
}

/**
 * Build medium drill text: short Hebrew words containing the target keys,
 * shuffled and combined into a readable sequence.
 */
function buildMediumDrill(weakKeys: string[]): string {
  const words: string[] = []

  for (const key of weakKeys) {
    const pool = HEBREW_DRILL_WORDS[key] ?? []
    if (pool.length === 0) {
      // Fallback: repeat the character as a word
      words.push(key, key, key)
    } else {
      // Pick 4 words for this key
      for (let i = 0; i < 4; i++) {
        words.push(pickRandom(pool))
      }
    }
  }

  // Shuffle the word list for a natural feel
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = words[i]
    words[i] = words[j]
    words[j] = temp
  }

  return words.join(' ')
}

/**
 * Build hard drill text: full Hebrew sentences rich with the target keys.
 */
function buildHardDrill(weakKeys: string[]): string {
  const sentences: string[] = []

  for (const key of weakKeys) {
    const pool = HEBREW_DRILL_SENTENCES[key]
    if (pool && pool.length > 0) {
      sentences.push(pickRandom(pool))
    } else {
      // Fallback to medium words in a sentence-like block
      const wordPool = HEBREW_DRILL_WORDS[key] ?? []
      if (wordPool.length > 0) {
        const sample = Array.from({ length: 5 }, () => pickRandom(wordPool))
        sentences.push(sample.join(' '))
      } else {
        sentences.push(repeatChar(key, 8))
      }
    }
  }

  return sentences.join(' ') + ' '
}

/**
 * Generate drill text focused on the given weak keys.
 *
 * @param weakKeys - Hebrew characters to drill (typically the worst 3-5)
 * @param difficulty - Controls the type of text generated
 * @returns A string ready to pass to the typing session
 */
export function generateDrillText(
  weakKeys: string[],
  difficulty: DrillDifficulty,
): string {
  if (weakKeys.length === 0) {
    return 'שלום עולם'
  }

  // Keep at most 5 keys for focused practice
  const keys = weakKeys.slice(0, 5)

  switch (difficulty) {
    case 'easy':
      return buildEasyDrill(keys)
    case 'medium':
      return buildMediumDrill(keys)
    case 'hard':
      return buildHardDrill(keys)
  }
}
