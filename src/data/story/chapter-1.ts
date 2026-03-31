import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 1: הקריאה (The Calling)
// קי מגלה את הדוג'ו, פוגש את הדמויות הראשונות, ומתחיל את דרכו כנינג'ה.
// ---------------------------------------------------------------------------

/**
 * 1.1 — Ki discovers the Dojo
 * Ki finds a glowing keyboard in an ancient dojo. Sensei Zen's voice echoes.
 * Foreshadowing: empty chair engraved with "רז".
 */
export const CHAPTER_1_1_DISCOVER_DOJO: DialogStoryBeat = {
  id: 'ch1-1-discover-dojo',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-1' },
  lines: [
    {
      id: 'ch1-1-01',
      character: 'ki',
      text: 'רגע... מה? הדלת נפתחה לבד?! יש פה ריח של עץ ישן ו... אור כחול? מה הסיפור של המקום הזה?',
      type: 'thought',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-1-02',
      character: 'ki',
      text: 'רגע — מה זה על השולחן? מקלדת! היא... זוהרת?!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'excited',
    },
    {
      id: 'ch1-1-03',
      character: 'senseiZen',
      text: 'נו, סוף סוף. חיכיתי המון זמן שמישהו ימצא את הדרך לכאן. ברוך הבא, נינג\'ה צעיר.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-1-04',
      character: 'ki',
      text: 'מ-מי אתה? ומאיפה הקול הזה מגיע?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-1-05',
      character: 'senseiZen',
      text: 'קוראים לי סנסיי זן. והמקלדת הזו? היא לא זוהרת סתם — רק למי שמוכן באמת ללמוד. נו, גע בה. אל תפחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch1-1-06',
      character: 'ki',
      text: 'יש פה כיסא ריק עם שם חרוט... "רז". מי זה?',
      type: 'narration',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch1-1-07',
      character: 'senseiZen',
      text: '...מישהו שהיה כאן פעם. אבל זה סיפור לזמן אחר. עכשיו — יאללה, בוא נתחיל.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
  ],
}

/**
 * 1.2 — Ki meets Pixel at the stats room
 * Pixel scans Ki's performance and asks a curious question about happiness.
 */
export const CHAPTER_1_2_MEET_PIXEL: DialogStoryBeat = {
  id: 'ch1-2-meet-pixel',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-2' },
  lines: [
    {
      id: 'ch1-2-01',
      character: 'ki',
      text: 'אוף, האצבעות שלי כואבות. לפחות סיימתי את האימון הראשון.',
      type: 'thought',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch1-2-02',
      character: 'pixel',
      text: 'סורק... מילים-לדקה: 30. דיוק: 62 אחוז. מעניייין. שאלה: מה זה "שמחה"? יש לזה יחידת מידה? ג\'יגה-שמחה?',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'ch1-2-03',
      character: 'ki',
      text: 'אההה... מי אתה? ולמה אתה מדבר כמו מחשבון?',
      type: 'dialog',
      mood: 'funny',
      expression: 'surprised',
    },
    {
      id: 'ch1-2-04',
      character: 'pixel',
      text: 'אני פיקסל. אני מנתח נתונים, עוקב אחרי ביצועים, ומתעד הכ-ל. חיפשתי "שמחה" במאגר — אפס תוצאות. באג?',
      type: 'dialog',
      mood: 'funny',
      expression: 'idle',
    },
    {
      id: 'ch1-2-05',
      character: 'ki',
      text: 'שמחה זה כשאתה מרגיש... כזה בועות בבטן? כמו כשאוכלים שוקולד, או מנצחים משחק, או שאמא מכינה שניצלים!',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-2-06',
      character: 'pixel',
      text: 'מעדכן מאגר: שמחה = שוקולד + ניצחון. מסקנה: לא הגיוני. אבל... מתועד.',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
  ],
}

/**
 * 1.3 — First typing lesson with Sensei Zen
 * Sensei encourages Ki after a struggle with accuracy. Mika appears.
 */
export const CHAPTER_1_3_SENSEI_LESSON: DialogStoryBeat = {
  id: 'ch1-3-sensei-lesson',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-3' },
  lines: [
    {
      id: 'ch1-3-01',
      character: 'senseiZen',
      text: 'אממ, קי? המקלדת היא כמו חרב. אם תנופף בה כמו משוגע — תחתוך את עצמך. נשימה עמוקה... ואז מקש, אחרי מקש.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch1-3-02',
      character: 'ki',
      text: 'אבל סנסאי! אני רוצה להיות מהיייר! כל הנינג\'ות מהירים! אף אחד לא אומר "וואו, הנינג\'ה הזה ממש מדויק!"',
      type: 'dialog',
      mood: 'funny',
      expression: 'excited',
    },
    {
      id: 'ch1-3-03',
      character: 'senseiZen',
      text: 'נינג\'ה אמיתי לא רץ — הוא זורם. הא, ואגב? דווקא כן אומרים. "הנינג\'ה הזה מדויק ומפחיד." המהירות תבוא, סבלנות.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-3-04',
      character: 'mika',
      text: 'הא! עדיין על שורת הבית? קצת מביך, לא? אני כבר על סימנים מיוחדים. סתם אומרת.',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch1-3-05',
      character: 'ki',
      text: 'מי את? ולמה את ככה... מעצבנת?',
      type: 'thought',
      mood: 'funny',
      expression: 'concerned',
    },
    {
      id: 'ch1-3-06',
      character: 'mika',
      text: 'קוראים לי מיקה. ואני לא "מעצבנת" — אני פשוט טובה. מאוד. רוצה להוכיח שאני טועה? קדימה, נתחרה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
      choices: [
        {
          id: 'ch1-3-choice-compete',
          text: '!אתגר? קדימה, אני בפנים',
          relationshipEffect: { character: 'mika', delta: 5 },
        },
        {
          id: 'ch1-3-choice-humble',
          text: 'אני עדיין מתחיל, אבל לא מפחד',
          relationshipEffect: { character: 'senseiZen', delta: 3 },
        },
      ],
    },
  ],
}

/**
 * 1.4 — Blaze peeks from behind a screen (Easter Egg foreshadowing)
 * Rex shows up and accidentally reveals his game project.
 */
export const CHAPTER_1_4_BLAZE_EASTER_EGG: DialogStoryBeat = {
  id: 'ch1-4-blaze-easter-egg',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-4' },
  lines: [
    {
      id: 'ch1-4-01',
      character: 'ki',
      text: 'רגע... ראיתי משהו זזז מאחורי המסך הגדול. זנב? זנב של לטאה?!',
      type: 'thought',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-4-02',
      character: 'rex',
      text: 'יואו! מה קורה אחי! אני רקס. רוצה לראות משהו חולה? בניתי משחק הקלדה עם — אה, לא, שכח. זבל. טראש. מחק מהראש.',
      type: 'dialog',
      mood: 'funny',
      expression: 'excited',
    },
    {
      id: 'ch1-4-03',
      character: 'ki',
      text: 'למה מחקת את זה? זה נראה ממש מגניב!',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-4-04',
      character: 'rex',
      text: 'נה, זה בטא. אלפא. פרה-אלפא בעצם. אולי פעם יהיה משהו. כנראה שלא. GG.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch1-4-05',
      character: 'ki',
      text: 'שוב הזנב הזה! משהו קטן ואדום מציץ מאחורי המסך ומתחבא!',
      type: 'narration',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-4-06',
      character: 'rex',
      text: 'אה, זו להבה. לטאת אש קטנה. היא ביישנית. לא מתקרבת לאף אחד — עדיין.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
  ],
}

/**
 * 1.5 — Ki meets Luna at the practice area
 * Luna's shy introduction. ASCII art clue on the wall.
 */
export const CHAPTER_1_5_MEET_LUNA: DialogStoryBeat = {
  id: 'ch1-5-meet-luna',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-5' },
  lines: [
    {
      id: 'ch1-5-01',
      character: 'ki',
      text: 'מי ציירה את הציורים המטורפים האלה על הקיר? יש פה פרפר שעשוי כולו מאותיות!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch1-5-02',
      character: 'luna',
      text: 'ז-זה... זה לא... אני לא...',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch1-5-03',
      character: 'ki',
      text: 'את ציירת את זה? זה מדהים! איך עושים ציור מאותיות?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-5-04',
      character: 'luna',
      text: 'זה נקרא ASCII Art. כל אות היא כמו... כמו מכחול. נשימה עמוקה — ואז הדמות מתגלה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-5-05',
      character: 'ki',
      text: 'חתום "L." — את לונה?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch1-5-06',
      character: 'luna',
      text: 'בבקשה אל... אל תגיד לאף אחד. אני לא מוכנה שיראו את זה עדיין.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
      choices: [
        {
          id: 'ch1-5-choice-secret',
          text: 'סוד שלנו. לא אגיד למישהו',
          relationshipEffect: { character: 'luna', delta: 5 },
        },
        {
          id: 'ch1-5-choice-encourage',
          text: 'את צריכה להראות את זה! זה מדהים',
          relationshipEffect: { character: 'luna', delta: 2 },
        },
      ],
    },
  ],
}

/**
 * 1.6 — Mysterious note from Shadow (foreshadowing)
 * A black cat appears briefly. A cryptic note is found.
 * Noa helps Ki secretly at night.
 */
export const CHAPTER_1_6_SHADOW_NOTE: DialogStoryBeat = {
  id: 'ch1-6-shadow-note',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-6' },
  lines: [
    {
      id: 'ch1-6-01',
      character: 'ki',
      text: 'מה זה הפתק הזה על המקלדת? "הצללים רואים הכל. תתכונן." — מי כתב את זה?!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-6-02',
      character: 'ki',
      text: 'חתול שחור! ראיתי חתול שחור שברח דרך החלון! הוא... חייך?',
      type: 'narration',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch1-6-03',
      character: 'senseiZen',
      text: 'אה, צל. הוא תמיד מסתובב כאן. חתול חמקני, אבל... לב טוב. אל תדאג.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-6-04',
      character: 'ki',
      text: 'אני לא מצליח להתרכז. האותיות קופצות על המסך... תקלה? או שמישהו עושה את זה בכוונה?',
      type: 'thought',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch1-6-05',
      character: 'noa',
      text: 'פסססט. קי. אל תזוז. אני יכולה לעזור לך עם האותיות הקופצות. רק... אל תגיד שהייתי כאן.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch1-6-06',
      character: 'ki',
      text: 'מי — היא נעלמה. אבל האותיות חזרו למקום. מה קורה בדוג\'ו הזה?!',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
  ],
}

/**
 * 1.7 — End of first day, Sensei Zen's wisdom
 * Sensei reflects on Ki's progress. Warm, fatherly moment.
 */
export const CHAPTER_1_7_SENSEI_WISDOM: DialogStoryBeat = {
  id: 'ch1-7-sensei-wisdom',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-7' },
  lines: [
    {
      id: 'ch1-7-01',
      character: 'senseiZen',
      text: 'יום ראשון, ואתה כבר לא אותו ילד שנכנס מהדלת. המקלדת מרגישה את זה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch1-7-02',
      character: 'ki',
      text: 'אבל אני עדיין איטי. מיקה הרביצה לי בתחרות.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch1-7-03',
      character: 'senseiZen',
      text: 'הדרך של אלף מילים מתחילה במקש אחד. סבלנות, ילד. גם הנהר לא חצב את הסלע ביום אחד — אבל הוא גם לא ויתר, נכון?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch1-7-04',
      character: 'ki',
      text: 'סנסיי... מי היה "רז"? זה שהכיסא שלו ריק?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch1-7-05',
      character: 'senseiZen',
      text: '...תלמיד. הכי מוכשר שנכנס אי פעם מהדלת הזו. אבל כישרון בלי ענווה, קי — זה כמו עץ בלי שורשים. הרוח הראשונה מפילה אותו.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch1-7-06',
      character: 'ki',
      text: 'אני מרגיש שיש כאן סודות. הרבה סודות.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
  ],
}

/**
 * 1.8 — Ki's mom calls him home (humanizing moment)
 * Ki is just a kid. Real life pulls him back.
 */
export const CHAPTER_1_8_MOM_CALLS: DialogStoryBeat = {
  id: 'ch1-8-mom-calls',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch1-8-01',
      character: 'ki',
      text: 'אמא מתקשרת... "קי! ארוחת ערב! עכשיו!"',
      type: 'narration',
      mood: 'funny',
      expression: 'surprised',
    },
    {
      id: 'ch1-8-02',
      character: 'ki',
      text: 'עוד דקה אמא! אני באמצע — אממ — שיעורי בית!',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch1-8-03',
      character: 'senseiZen',
      text: 'לך, לך. גם נינג\'ה צריך לאכול. ואני אגלה לך סוד — אמא היא הבוס הכי חזק שקיים. אין קיצור מקלדת שעובד נגדה.',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch1-8-04',
      character: 'ki',
      text: 'אני אחזור מחר! יש לי הרגשה שהמקום הזה מסתיר עוד הרבה דברים.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'excited',
    },
    {
      id: 'ch1-8-05',
      character: 'ki',
      text: 'אז היום גיליתי דוג\'ו סודי, מקלדת שזוהרת, צב שמדבר בפתגמים, רובוט שלא מבין מה זה שמחה, האקרית שחושבת שהיא הכי, אמנית שמתביישת בציורים שלה, בחורה מסתורית שנעלמה באוויר, גיימר עצוב, חתול שכותב פתקים, ולטאת אש ביישנית. יום רגיל לגמרי.',
      type: 'thought',
      mood: 'funny',
      expression: 'happy',
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 1 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_1_BEATS: DialogStoryBeat[] = [
  CHAPTER_1_1_DISCOVER_DOJO,
  CHAPTER_1_2_MEET_PIXEL,
  CHAPTER_1_3_SENSEI_LESSON,
  CHAPTER_1_4_BLAZE_EASTER_EGG,
  CHAPTER_1_5_MEET_LUNA,
  CHAPTER_1_6_SHADOW_NOTE,
  CHAPTER_1_7_SENSEI_WISDOM,
  CHAPTER_1_8_MOM_CALLS,
]
