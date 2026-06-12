/**
 * Battle taunts & coach encouragements (V2 narrative thread).
 *
 * Every rival has a distinct voice (per the character bible):
 *   bug    -- chaotic prankster, giggles, overconfident
 *   shadow -- calm, terse, precise
 *   storm  -- loud, explosive bursts
 *   blaze  -- hot-headed sprinter who burns out
 *   virus  -- slow, menacing, accelerating
 *   yuki   -- tough training partner, competitive but warm underneath
 *
 * Coach lines are spoken by Mika (the player's partner) on positive moments.
 * Selection is deterministic given a seed, so it is fully unit-testable.
 */
import type { RivalName } from '@/types/ai-opponent'

/** Moments where the RIVAL speaks (taunts). */
export type TauntCategory =
  | 'battleStart'
  | 'playerLeading'
  | 'playerBehind'
  | 'comboBroken'
  /** Spoken by the rival at the RESULTS screen when the PLAYER won. */
  | 'playerWon'
  /** Spoken by the rival at the RESULTS screen when the player LOST. */
  | 'playerLost'

/** Moments where the COACH (Mika) speaks (encouragement). */
export type CoachCategory =
  | 'comboMilestone'
  | 'comeback'
  /** Mika at the RESULTS screen after a win. */
  | 'victory'
  /** Mika at the RESULTS screen after a loss (supportive, never punishing). */
  | 'defeat'

export const RIVAL_TAUNTS: Record<
  RivalName,
  Record<TauntCategory, readonly string[]>
> = {
  bug: {
    battleStart: [
      'הא הא! מקלדת זה הבית שלי!',
      'מוכנים להפסיד? כי אני מוכן לנצח!',
    ],
    playerLeading: ['רגע רגע רגע! זה לא הוגן!', 'אני רק נותן לך יתרון... כן, בטח!'],
    playerBehind: ['יותר מדי איטי! הא הא!', 'אולי תנסה מחר? או בשנה הבאה?'],
    comboBroken: ['אופס! ראיתם את זה? הא הא!', 'טעות! מוזיקה לאוזניים שלי!'],
    playerWon: ['מה?! ניצחת אותי?! אין מצב!', 'טוב טוב... ניצחת. הפעם. הא!'],
    playerLost: ['הא הא הא! אמרתי לך!', 'באג תמיד מנצח! נסה שוב, אולי!'],
  },
  shadow: {
    battleStart: ['בוא נראה ממה אתה עשוי.', 'דיוק. רק זה קובע.'],
    playerLeading: ['מרשים. אבל עוד לא נגמר.', 'אל תתרגל לזה.'],
    playerBehind: ['צפוי.', 'ריכוז. זה מה שחסר לך.'],
    comboBroken: ['שגיאה אחת מספיקה.', 'חולשה.'],
    playerWon: ['ניצחת. בכבוד.', 'התקדמת. אני רואה.'],
    playerLost: ['עוד לא. תתאמן.', 'הדיוק שלך עזב אותך.'],
  },
  storm: {
    battleStart: ['סערה מתקרבת!!! תחזיקו חזק!', 'בום! מתחילים!'],
    playerLeading: ['רוח קלה! זה הכול?! אני רק מתחמם!', 'עוד רגע מגיע הברק!'],
    playerBehind: ['נסחפת ברוח!! הא!', 'הסערה בולעת אותך!'],
    comboBroken: ['קראש!!! איזה רעם!', 'הברק פגע! בדיוק בקומבו שלך!'],
    playerWon: ['ניצחת את הסערה?! מטורף!', 'וואו! יש בך ברק אמיתי!'],
    playerLost: ['הסערה ניצחה! בום!', 'נסחפת! אבל תחזור חזק יותר!'],
  },
  blaze: {
    battleStart: ['אני אש! תנסו לעמוד בקצב!', 'שלוש... שתיים... שריפה!'],
    playerLeading: ['זה... זה רק כי התחלתי לאט!', 'חכה חכה, אני עוד בוער!'],
    playerBehind: ['אתה נמס מאחור! חם פה, אה?', 'להבה לא מחכה לאף אחד!'],
    comboBroken: ['נשרף לך הקומבו! חבל!', 'פוף! עשן במקום קומבו!'],
    playerWon: ['כיביתה אותי?! לא ייאמן!', 'אש! ניצחת ביושר. כל הכבוד!'],
    playerLost: ['נשרפת! אמרתי לך שאני אש!', 'יותר מדי חם בשבילך? נסה שוב!'],
  },
  virus: {
    battleStart: ['אני... מתפשט... לאט לאט...', 'בסוף... כולם נדבקים...'],
    playerLeading: ['תהנה מהיתרון... הוא זמני...', 'אני רק... מתחיל...'],
    playerBehind: ['ההדבקה... מתקדמת...', 'אין... חיסון... למהירות שלי...'],
    comboBroken: ['השגיאה שלך... מזינה אותי...', 'עוד באג... בקוד שלך...'],
    playerWon: ['ניקית... אותי...? בלתי אפשרי...', 'החיסון שלך... חזק... מדי...'],
    playerLost: ['נדבקת... כצפוי...', 'אני... מתפשט... עוד ועוד...'],
  },
  yuki: {
    battleStart: ['בלי הנחות הפעם, קי!', 'נראה אותך עומד בקצב שלי!'],
    playerLeading: ['יפה! ככה מתחרים! אבל אני לא מוותרת!', 'וואו, התאמנת! עכשיו תורי!'],
    playerBehind: ['קדימה, אתה יכול יותר מזה!', 'זה הקצב שלך? אני יודעת שיש לך עוד!'],
    comboBroken: ['אופס! נשימה עמוקה וממשיכים!', 'קומבו נשבר? בונים חדש. עכשיו!'],
    playerWon: ['ניצחת אותי ביושר! גאה בך, קי!', 'כן! ידעתי שיש בך את זה!'],
    playerLost: ['קרוב! עוד קצת ואתה שם. בא נתאמן יחד!', 'הפסד היום, ניצחון מחר. אני מאמינה בך!'],
  },
}

/** Mika's encouragement lines (the player's partner since lesson 2). */
export const COACH_LINES: Record<CoachCategory, readonly string[]> = {
  comboMilestone: [
    'מיקה: איזה קומבו! תמשיך ככה!',
    'מיקה: האצבעות שלך עפות! מדהים!',
    'מיקה: זה בדיוק האימון שלנו! יופי!',
  ],
  comeback: [
    'מיקה: לאט ובטוח... עכשיו תאיץ!',
    'מיקה: אל תוותר! נינג\'ה אמיתי חוזר חזק!',
    'מיקה: תנשום. תתמקד. אתה משיג אותו!',
  ],
  victory: [
    'מיקה: ניצחנו! האימון השתלם!',
    'מיקה: וואו, איזה קרב! אתה אלוף!',
    'מיקה: ידעתי שתצליח! גאה בך!',
  ],
  defeat: [
    'מיקה: היה קרוב! בקרב הבא ננצח!',
    'מיקה: כל הפסד מלמד אותנו משהו. ננסה שוב?',
    'מיקה: התקדמת מאוד! עוד אימון קטן ואתה שם!',
  ],
}

/** Deterministically pick a rival taunt by seed. */
export function pickRivalTaunt(
  rival: RivalName,
  category: TauntCategory,
  seed: number,
): string {
  const lines = RIVAL_TAUNTS[rival][category]
  return lines[Math.abs(seed) % lines.length]
}

/** Deterministically pick a coach (Mika) line by seed. */
export function pickCoachLine(category: CoachCategory, seed: number): string {
  const lines = COACH_LINES[category]
  return lines[Math.abs(seed) % lines.length]
}
