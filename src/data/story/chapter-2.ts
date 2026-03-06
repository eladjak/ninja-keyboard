import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 2: צעדים ראשונים (First Steps)
// קי חוזר לדוג'ו, פוגש עוד דמויות, ומתמודד עם האתגר הראשון — באג!
// ---------------------------------------------------------------------------

/**
 * 2.1 — Ki returns, meets Rex in the games room
 * Rex is building something creative but hides it.
 */
export const CHAPTER_2_1_MEET_REX: DialogStoryBeat = {
  id: 'ch2-1-meet-rex',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-8' },
  lines: [
    {
      id: 'ch2-1-01',
      character: 'ki',
      text: 'חזרתי! הדוג\'ו עדיין כאן. חששתי שזה היה חלום.',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch2-1-02',
      character: 'rex',
      text: 'יו קי! בוא תראה את חדר המשחקים! יש פה מקלדות שזוהרות בצבעים שונים לפי המהירות שלך!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch2-1-03',
      character: 'ki',
      text: 'מטורף! ומה זה הדבר שאתה מסתיר מאחורי הגב?',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch2-1-04',
      character: 'rex',
      text: 'כלום! ממש כלום! זה סתם... שטויות. פרוטוטייפ של משחק הקלדה. לא שווה כלום.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch2-1-05',
      character: 'ki',
      text: 'אם זה לא שווה כלום, למה אתה מסמיק?',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch2-1-06',
      character: 'rex',
      text: 'כי... אני... שתוק! בוא פשוט נשחק! מי שמפסיד קונה שוקולד.',
      type: 'dialog',
      mood: 'funny',
      expression: 'excited',
    },
  ],
}

/**
 * 2.2 — Mika teaches Ki about keyboard shortcuts
 * Mika's tech expertise shines. Foreshadowing: she deletes a file quickly.
 */
export const CHAPTER_2_2_MIKA_SHORTCUTS: DialogStoryBeat = {
  id: 'ch2-2-mika-shortcuts',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-9' },
  lines: [
    {
      id: 'ch2-2-01',
      character: 'mika',
      text: 'בוא, אני אראה לך משהו שסנסאי לא ילמד אותך. קיצורי מקלדת — הנשק הסודי של ההאקר.',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch2-2-02',
      character: 'ki',
      text: 'קיצורי מקלדת? כמו Ctrl+C?',
      type: 'dialog',
      mood: 'happy',
      expression: 'thinking',
    },
    {
      id: 'ch2-2-03',
      character: 'mika',
      text: 'Ctrl+C זה לתינוקות. אני מדברת על Alt+Tab, Ctrl+Shift+T, Win+L. עם הקיצורים האלה, אתה שולט במחשב בלי לגעת בעכבר. בכלל.',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch2-2-04',
      character: 'ki',
      text: 'בלי עכבר? זה כמו קסם!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch2-2-05',
      character: 'mika',
      text: 'זה לא קסם. זה ידע. ורק מי שמתאמן קשה — שולט בו.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch2-2-06',
      character: 'ki',
      text: 'רגע — מה מיקה מוחקת מהלפטופ שלה? היא נראית מודאגת... וכועסת.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
  ],
}

/**
 * 2.3 — Fox seen running near dojo (Storm foreshadowing)
 * Yuki spots a fox — first hint of Storm and Barak.
 */
export const CHAPTER_2_3_FOX_FORESHADOW: DialogStoryBeat = {
  id: 'ch2-3-fox-foreshadow',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-10' },
  lines: [
    {
      id: 'ch2-3-01',
      character: 'yuki',
      text: 'היי! ראיתם את זה?! שועלה! שועלה כתומה רצה ליד הדוג\'ו!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'excited',
    },
    {
      id: 'ch2-3-02',
      character: 'ki',
      text: 'שועלה? פה? בתוך מחשב?',
      type: 'dialog',
      mood: 'funny',
      expression: 'surprised',
    },
    {
      id: 'ch2-3-03',
      character: 'yuki',
      text: 'היא הייתה מהירה בטירוף! יותר מהירה ממני! מי זאת?!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch2-3-04',
      character: 'senseiZen',
      text: 'שועלים... כבר הרבה זמן לא היו כאן שועלים. אם הם חזרו, יש סיבה.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch2-3-05',
      character: 'yuki',
      text: 'שמעתי על "דוג\'ו הברק" — של האחים השועלים. אולי זו אחת מהם!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
  ],
}

/**
 * 2.4 — First speed challenge with Yuki
 * Yuki challenges Ki. She wins on WPM but loses on accuracy.
 */
export const CHAPTER_2_4_YUKI_CHALLENGE: DialogStoryBeat = {
  id: 'ch2-4-yuki-challenge',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-11' },
  lines: [
    {
      id: 'ch2-4-01',
      character: 'yuki',
      text: 'קי! מירוץ הקלדה! עכשיו! אתה ואני! מי שמגיע ראשון ל-50 מילים — מנצח!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch2-4-02',
      character: 'ki',
      text: 'אין לי סיכוי נגדך! את מהירה כמו ברק!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch2-4-03',
      character: 'yuki',
      text: 'הא! סיימתי! 55 מילים לדקה! ניצ — רגע. 3 שגיאות?! שלוש?!',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch2-4-04',
      character: 'ki',
      text: 'ואני... 35 מילים לדקה, אבל אפס שגיאות! זה אומר שאני ניצחתי?',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch2-4-05',
      character: 'yuki',
      text: 'גרררר! דיוק שמיוק! מהירות זה הדבר היחיד שחשוב!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch2-4-06',
      character: 'senseiZen',
      text: 'חרב מהירה שלא פוגעת במטרה — היא רק רוח. יוקי, את צריכה ללמוד לנשום בין המקשים.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
  ],
}

/**
 * 2.5 — Ki struggles, Sensei Zen teaches patience
 * Ki is frustrated. Sensei helps him understand that progress isn't linear.
 */
export const CHAPTER_2_5_PATIENCE_LESSON: DialogStoryBeat = {
  id: 'ch2-5-patience-lesson',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-12' },
  lines: [
    {
      id: 'ch2-5-01',
      character: 'ki',
      text: 'אני לא משתפר! אתמול הייתי ב-35 מילים לדקה ועכשיו ירדתי ל-30! מה לא בסדר איתי?!',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch2-5-02',
      character: 'senseiZen',
      text: 'אתה לומד דפוסים חדשים. המוח שלך מסדר מדפים — לפעמים צריך לפרק כדי לבנות חזק יותר.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch2-5-03',
      character: 'ki',
      text: 'אבל כולם יותר טובים ממני! מיקה, יוקי...',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch2-5-04',
      character: 'senseiZen',
      text: 'הבמבוק גדל שלוש שנים מתחת לאדמה לפני שהוא פורץ החוצה. אבל כשהוא פורץ — אף עץ לא עוצר אותו.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch2-5-05',
      character: 'ki',
      text: 'אז אני... במבוק תת-קרקעי?',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'ch2-5-06',
      character: 'senseiZen',
      text: 'בדיוק. ועוד מעט — תפרוץ.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
  ],
}

/**
 * 2.6 — Noa introduces nature-typing exercises
 * Noa's healing personality. She teaches Ki to type with calm rhythm.
 */
export const CHAPTER_2_6_MEET_NOA: DialogStoryBeat = {
  id: 'ch2-6-meet-noa',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-13' },
  lines: [
    {
      id: 'ch2-6-01',
      character: 'noa',
      text: 'קי, בוא. יש לי תרגיל שאני חושבת שיעזור לך. אנחנו נקליד כמו גשם — טיפה אחרי טיפה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch2-6-02',
      character: 'ki',
      text: 'כמו גשם? מה זה אומר?',
      type: 'dialog',
      mood: 'happy',
      expression: 'thinking',
    },
    {
      id: 'ch2-6-03',
      character: 'noa',
      text: 'עצום עיניים. תקשיב לצליל של כל מקש. תן לאצבעות למצוא את הדרך לבד, בלי לחץ.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch2-6-04',
      character: 'ki',
      text: 'וואו... זה באמת עוזר! ההקלדה זורמת כשאני לא לוחץ על עצמי.',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch2-6-05',
      character: 'noa',
      text: 'בטבע אין ממהר. העץ לא מזרז את הפרי. הוא פשוט... נותן.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch2-6-06',
      character: 'ki',
      text: 'נועה עוזרת לכולם. אבל מתי מישהו עוזר לה?',
      type: 'thought',
      mood: 'heartwarming',
      expression: 'thinking',
    },
  ],
}

/**
 * 2.7 — Ki and Kai bond over being nervous
 * Kai watches from afar. Ki approaches. First connection.
 */
export const CHAPTER_2_7_KAI_BOND: DialogStoryBeat = {
  id: 'ch2-7-kai-bond',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-14' },
  lines: [
    {
      id: 'ch2-7-01',
      character: 'ki',
      text: 'היי! אתה תמיד מתאמן לבד בפינה. למה לא בא לשבת איתנו?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch2-7-02',
      character: 'kai',
      text: '...אני בסדר פה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch2-7-03',
      character: 'ki',
      text: 'אני רואה אותך מתאמן. אתה ממש טוב! למה אתה מסתתר?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'thinking',
    },
    {
      id: 'ch2-7-04',
      character: 'kai',
      text: 'אני לא... אני לא רגיל לאנשים. פעם ניסיתי להצטרף לקבוצה ו... שכח. לא חשוב.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch2-7-05',
      character: 'ki',
      text: 'תשמע, גם אני מפחד. אני הכי חדש כאן. אבל ביחד — פחות מפחיד, לא?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
      choices: [
        {
          id: 'ch2-7-choice-together',
          text: 'בוא נתאמן ביחד! אני צריך אותך',
          relationshipEffect: { character: 'kai', delta: 5 },
        },
        {
          id: 'ch2-7-choice-patient',
          text: 'אין לחץ. תבוא כשתרגיש מוכן',
          relationshipEffect: { character: 'kai', delta: 3 },
        },
      ],
    },
  ],
}

/**
 * 2.8 — Bug appears! First encounter with a glitch
 * Bug disrupts the dojo. Letters scramble. Panic and humor.
 */
export const CHAPTER_2_8_BUG_APPEARS: DialogStoryBeat = {
  id: 'ch2-8-bug-appears',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-15' },
  lines: [
    {
      id: 'ch2-8-01',
      character: 'bug',
      text: 'היי היי היי! בלגאאאאן! מי פה? מי פה? הכל הפוך! הכל שבור! כיף כיף כיף!',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch2-8-02',
      character: 'ki',
      text: 'מה קורה?! האותיות על המסך — הן קופצות! "שלום" הפך ל-"םולש"!',
      type: 'dialog',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch2-8-03',
      character: 'mika',
      text: 'באג. זה באג — יצור שמשבש קוד. אל תיבהלו. אני מכירה את הסוג הזה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch2-8-04',
      character: 'bug',
      text: 'אוי אוי, ההאקרית מפחידה! בלה בלה בלה! נתפוס אותי קודם! חחחחח!',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch2-8-05',
      character: 'senseiZen',
      text: 'קי — הדרך היחידה לנצח באג היא הקלדה מדויקת. כל מילה נכונה מחלישה אותו. התרכז!',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
  ],
}

/**
 * 2.9 — Ki defeats the bug with typing skills
 * First mini-boss victory. Bug retreats, promising to return.
 */
export const CHAPTER_2_9_BUG_DEFEATED: DialogStoryBeat = {
  id: 'ch2-9-bug-defeated',
  trigger: { type: 'battle-result', result: 'win' },
  lines: [
    {
      id: 'ch2-9-01',
      character: 'ki',
      text: 'עוד מילה... עוד מילה... "הקלדה!" — "מדויקת!" — "תמיד!" — "מנצחת!"',
      type: 'narration',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch2-9-02',
      character: 'bug',
      text: 'לאאא! לא לא לא! אני מתכווץ! אני נהיה קטן! אחזוווווור! אני תמיד חוזר!',
      type: 'dialog',
      mood: 'funny',
      expression: 'surprised',
    },
    {
      id: 'ch2-9-03',
      character: 'yuki',
      text: 'הוא ברח! קי, היית אדיר!',
      type: 'dialog',
      mood: 'happy',
      expression: 'cheering',
    },
    {
      id: 'ch2-9-04',
      character: 'mika',
      text: 'לא רע, חדשן. לא רע בכלל. אולי יש בך משהו.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch2-9-05',
      character: 'senseiZen',
      text: 'ניצחת את הקרב הראשון שלך. אבל זה רק ההתחלה, קי. יש עוד אויבים — חזקים יותר, חכמים יותר.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch2-9-06',
      character: 'ki',
      text: 'עם הצוות הזה — אני מוכן לכל דבר.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 2 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_2_BEATS: DialogStoryBeat[] = [
  CHAPTER_2_1_MEET_REX,
  CHAPTER_2_2_MIKA_SHORTCUTS,
  CHAPTER_2_3_FOX_FORESHADOW,
  CHAPTER_2_4_YUKI_CHALLENGE,
  CHAPTER_2_5_PATIENCE_LESSON,
  CHAPTER_2_6_MEET_NOA,
  CHAPTER_2_7_KAI_BOND,
  CHAPTER_2_8_BUG_APPEARS,
  CHAPTER_2_9_BUG_DEFEATED,
]
