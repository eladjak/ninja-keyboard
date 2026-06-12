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
    storyIntroHe:
      'קי מוצא מקלדת זוהרת בדוג\'ו הישן. קול עמוק לוחש מהחושך: "אהה... תלמיד חדש".',
    storyOutroHe:
      'המקלדת מהבהבת בשמחה. הקול לוחש: "התחלה טובה, קי. וזו רק ההתחלה".',
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
    storyIntroHe:
      'מיקה יוצאת מהצללים ומחייכת: "גם היד השנייה? בוא ננסה ביחד, קי!"',
    storyOutroHe:
      'מיקה נותנת כיף: "ידעתי שתצליח! מעכשיו אנחנו צוות".',
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
    storyIntroHe:
      '"שתי ידיים זה כמו שני נינג\'ות", אומרת מיקה. "כשהן עובדות יחד, אין מי שיעצור אותן".',
    storyOutroHe:
      'קי מרגיש את האצבעות זזות לבד. מיקה צוחקת: "רואה? המקלדת כבר מקשיבה לך".',
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
    storyIntroHe:
      'מיקה מצביעה על הזרת: "האצבעות הקטנות הן הנשק הסודי של כל נינג\'ה".',
    storyOutroHe:
      '"אפילו הזרת שלך נינג\'ה עכשיו!" מיקה מוחאת כפיים.',
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
    storyIntroHe:
      'צחקוק מוזר בוקע מהמסך... באג מציץ החוצה: "מילים שלמות? הא! בחיים לא תצליחו!"',
    storyOutroHe:
      'באג נעלם בענן ירוק וזועף: "סתם היה לכם מזל...". מיקה: "הוא יחזור. נהיה מוכנים".',
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
    storyIntroHe:
      'מיקה מציירת באוויר: "א\' ו-ו\' מסתתרות כמעט בכל מילה. מי ששולט בהן שולט בשפה".',
    storyOutroHe:
      '"שורה חדשה נפתחה!" קי מרגיש את הכוח גדל באצבעות.',
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
    storyIntroHe:
      'באג חוזר ומערבב את האותיות על המסך! "ר... ט... ק... עכשיו תתבלבלו!"',
    storyOutroHe:
      'האותיות חוזרות למקומן. באג בורח: "זה עוד לא נגמר!". מיקה: "ניצחון ראשון אמיתי, קי".',
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
    storyIntroHe:
      'דמות שקטה מופיעה בדוג\'ו. סנסאי זן קד קידה: "סבלנות היא הנשק החזק ביותר. נתחיל".',
    storyOutroHe:
      'סנסאי זן מהנהן לאט: "היום ראיתי נינג\'ה צעיר הופך לתלמיד אמיתי".',
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
    storyIntroHe:
      'סנסאי זן עוצם עיניים: "המקלדת מדברת אל מי שמקשיב. השורה התחתונה מחכה לך".',
    storyOutroHe:
      '"שמעת אותה?" מחייך סנסאי זן. "גם היא שמעה אותך".',
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
    storyIntroHe:
      'יוקי מסתחררת באוויר ונוחתת מולך: "אני הכי מהירה בדוג\'ו! נראה אותך, קי!"',
    storyOutroHe:
      'יוקי פוערת עיניים: "וואו. אולי יום אחד תהיה כמעט מהיר כמוני". אצלה זו מחמאה ענקית.',
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
    storyIntroHe:
      'לונה מחכה בגן הירח, רגועה לגמרי: "נשימה עמוקה... האותיות האחרונות מחכות לך".',
    storyOutroHe:
      '"עכשיו כל המקלדת שלך", לוחשת לונה. "כל אות. כל מילה. הכול".',
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
    storyIntroHe:
      'המסך מהבהב מוזר... גליץ\' מופיע ונעלם: "א-א-אני רק ב-ב-בודק אתכם!"',
    storyOutroHe:
      'גליץ\' מהבהב ונעלם. משהו בעיניים שלו לא נראה רע באמת. מוזר.',
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
    storyIntroHe:
      'קאי מדליק להבה: "בוא נילחם!". נועה מחייכת ברוגע: "ואני אתקן מה שיישבר". הצוות שלם.',
    storyOutroHe:
      'כל הצוות מריע! קאי: "האותיות הסופיות? סגורות אצלך ביד!"',
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
    storyIntroHe:
      'סנסאי זן: "נינג\'ה אמיתי לא חושב על אותיות. הוא חושב על מילים שלמות".',
    storyOutroHe:
      'המילים זורמות מהאצבעות. מיקה: "אתה כבר לא מקליד, קי. אתה מדבר עם המקלדת".',
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
    storyIntroHe:
      'אזעקה בדוג\'ו! באג וגליץ\' תוקפים יחד. "הפעם הבאתי חבר!" צוחק באג.',
    storyOutroHe:
      'באג וגליץ\' נסוגים. סנסאי זן: "עמדת מול שניים ולא נשברת. המערכה השנייה הושלמה".',
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
    storyIntroHe:
      'באג מופיע על מסך ענק: "ברוכים הבאים לעולם שלי!" - מבוך של פתגמים עתיקים.',
    storyOutroHe:
      'כל פתגם שהקלדת מאיר עוד פינה במבוך. הדרך החוצה מתבהרת.',
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
    storyIntroHe:
      'מיקה תופסת פיקוד: "אחריי! כל משפט חזק שאנחנו מקלידים שובר עוד חומה של באג".',
    storyOutroHe:
      'החומה נופלת! מיקה מסתובבת אליך: "הכוח הזה? הוא היה שלך כל הזמן".',
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
    storyIntroHe:
      'גליץ\' חוסם את הדרך... ואז לוחש: "א-אני לא רוצה להיות ר-רע. ת-תעזרו לי?". הקלדה מדויקת תרגיע אותו.',
    storyOutroHe:
      'גליץ\' מפסיק להבהב לרגע ומחייך: "ת-תודה...". הוא פותח לכם שביל סודי.',
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
    storyIntroHe:
      'יוקי מופיעה לצד קי: "המאורה של מלך הבאגים מעבר לפינה. עכשיו - טסים!"',
    storyOutroHe:
      'יוקי מתנשפת: "טוב... זה היה באמת מהיר". סנסאי זן: "מוכנים לקרב האחרון".',
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
    storyIntroHe:
      'מלך הבאגים יושב על כס זהב: "אני מלך הבאגים!". כל החברים מאחוריך. זה הרגע, קי.',
    storyOutroHe:
      'הכתר נופל. האור חוזר לדוג\'ו. סנסאי זן קד קידה: "קום, קי. נינג\'ה מקלדת אמיתי".',
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
