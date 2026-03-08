import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 5: הטורניר (The Tournament)
// הטורניר הגדול. גליץ' נלחמת נגד חבריה. פאנטום/רז חוזר.
// מגה-וירוס. גליץ' מתפוצצת — רגע הדמעות. שברי קוד נותרים.
// ---------------------------------------------------------------------------

/**
 * 5.1 — The Grand Tournament begins
 * All dojos gather. Tension, excitement, and a dark shadow looming.
 */
export const CHAPTER_5_1_TOURNAMENT_BEGINS: DialogStoryBeat = {
  id: 'ch5-1-tournament-begins',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-29' },
  lines: [
    {
      id: 'ch5-1-01',
      character: 'ki',
      text: 'זה הרגע. הטורניר הגדול. כל הדוג\'ואים. כל בתי הספר. כולם כאן.',
      type: 'narration',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-1-02',
      character: 'yuki',
      text: 'אני רואה את ברק מהצד השני של הזירה. הוא מחייך אליי. זה חיוך מלחמה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
    {
      id: 'ch5-1-03',
      character: 'senseiZen',
      text: 'תלמידים. הטורניר הוא לא רק מבחן מהירות. הוא מבחן אופי. זיכרו — מקלדת בלי לב היא רק פלסטיק.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch5-1-04',
      character: 'mika',
      text: 'אני לא פה בשביל גביע. אני פה בשביל גליץ\'. אם היא תופיע — אני אהיה מוכנה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch5-1-05',
      character: 'rex',
      text: 'יש פה כל כך הרבה אנשים! חברה, לא לשכוח — גם אם נפסיד, לפחות נפסיד בסטייל!',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch5-1-06',
      character: 'blaze',
      text: 'אש אש אש! אני שופט כבוד! מי שרוצה לזכות — שיראה לי אש באצבעות!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-1-07',
      character: 'ki',
      text: 'להבה? הלטאה שהתחבאה מאחורי המסך? הוא שופט?!',
      type: 'dialog',
      mood: 'funny',
      expression: 'surprised',
    },
  ],
}

/**
 * 5.2 — Tournament rounds: Speed, Accuracy, Shortcuts
 * Yuki vs Barak in speed. Kai proves himself in accuracy. Mika dominates shortcuts.
 */
export const CHAPTER_5_2_TOURNAMENT_ROUNDS: DialogStoryBeat = {
  id: 'ch5-2-tournament-rounds',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-30' },
  lines: [
    {
      id: 'ch5-2-01',
      character: 'yuki',
      text: 'סבב מהירות! ברק, אתה ואני. נראה סוף סוף מי באמת הכי מהיר!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-2-02',
      character: 'barak',
      text: '75 מילים לדקה! קחי את זה, מותקית!',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
    {
      id: 'ch5-2-03',
      character: 'yuki',
      text: '78 מילים! עם 96 אחוז דיוק! ספיד בלי דיוק זה... רוח בלי כיוון!',
      type: 'dialog',
      mood: 'happy',
      expression: 'cheering',
    },
    {
      id: 'ch5-2-04',
      character: 'kai',
      text: 'סבב דיוק. 100 אחוז. אפס שגיאות. אני... אני לא לבד יותר.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch5-2-05',
      character: 'ki',
      text: 'קאי, הוא זוהר! מעולם לא ראיתי אותו ככה! הוא תמיד התאמן לבד — ועכשיו כולם רואים.',
      type: 'thought',
      mood: 'heartwarming',
      expression: 'excited',
    },
    {
      id: 'ch5-2-06',
      character: 'mika',
      text: 'סבב קיצורים. Alt+Tab, Ctrl+Shift+T, Win+D. 12 קיצורים ב-8 שניות. מישהו רוצה לנסות?',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch5-2-07',
      character: 'luna',
      text: 'ואני — מציירת את תוכנית הקרב. כולם יודעים את התפקיד שלהם. בלי לפחד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
  ],
}

/**
 * 5.3 — Glitch attacks the tournament as Virus's warrior
 * She fights against her former friends. Tears on her face.
 */
export const CHAPTER_5_3_GLITCH_ATTACKS: DialogStoryBeat = {
  id: 'ch5-3-glitch-attacks',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-31' },
  lines: [
    {
      id: 'ch5-3-01',
      character: 'ki',
      text: 'מה — המסכים מתקלקלים! קוד שבור בכל מקום! הטורניר תחת התקפה!',
      type: 'narration',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch5-3-02',
      character: 'glitch',
      text: 'אני גליץ\'. לוחמת הוירוס. ה-הטורניר הזה — נגמר.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch5-3-03',
      character: 'mika',
      text: 'גליץ\'... לא. היא... היא לא גליץ\' שלנו יותר. העיניים — אדומות. כמו שלו.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-3-04',
      character: 'glitch',
      text: 'מ-מיקה...',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch5-3-05',
      character: 'ki',
      text: 'רגע — היא גמגמה! היא עדיין שם בפנים! גליץ\' האמיתית עוד נלחמת!',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
    {
      id: 'ch5-3-06',
      character: 'pixel',
      text: 'סורק... 23% מהקוד שלה עדיין מקורי. השאר — קוד וירוס. היא... עדיין שם. חלקית.',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch5-3-07',
      character: 'noa',
      text: 'יש דמעות על הפנים שלה. היא נלחמת נגדנו... ובוכה. בו-זמנית.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-3-08',
      character: 'mika',
      text: 'אני לא אילחם בה. אני אילחם בשבילה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      choices: [
        {
          id: 'ch5-3-choice-save',
          text: 'נלחמים בוירוס, לא בגליץ\'!',
          relationshipEffect: { character: 'glitch', delta: 5 },
        },
        {
          id: 'ch5-3-choice-defend',
          text: 'קודם מגינים על הטורניר, אחר כך מצילים!',
          relationshipEffect: { character: 'kai', delta: 3 },
        },
      ],
    },
  ],
}

/**
 * 5.4 — The Finals: Mega-Virus appears. Phantom returns.
 * Virus merges with Glitch to form Mega-Virus. Phantom/Raz emerges from the shadows.
 * Sensei Zen's former student returns.
 */
export const CHAPTER_5_4_MEGA_VIRUS: DialogStoryBeat = {
  id: 'ch5-4-mega-virus',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-32' },
  lines: [
    {
      id: 'ch5-4-01',
      character: 'virus',
      text: 'מספיק משחקים! גליץ\' — הגיע הזמן. ביחד — נהיה בלתי ניתנים לעצירה!',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch5-4-02',
      character: 'ki',
      text: 'הוא... מתמזג איתה! גליץ\' ווירוס — הם נהיים יצור אחד! ענק! ונורא!',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch5-4-03',
      character: 'senseiZen',
      text: 'מגה-וירוס. זה מה שפחדתי ממנו. ילדים — עכשיו זה אמיתי.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch5-4-04',
      character: 'storm',
      text: 'הוא השתלט על דוג\'ו שלם! אנחנו צריכים לעבוד ביחד — כל הדוג\'ואים!',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch5-4-05',
      character: 'phantom',
      text: '...ביחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch5-4-06',
      character: 'ki',
      text: 'מי — מי זה?! צללית בחושך! נינג\'ה שמופיע מהצל!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch5-4-07',
      character: 'senseiZen',
      text: 'רז... בנִי. חזרת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch5-4-08',
      character: 'phantom',
      text: 'הכיסא שלי... ממתין מספיק זמן. סנסאי.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch5-4-09',
      character: 'ki',
      text: 'רז! זה השם שהיה חרוט על הכיסא! הוא... הוא תלמיד לשעבר של סנסאי!',
      type: 'thought',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-4-10',
      character: 'senseiZen',
      text: 'כולם — לחימה! כל מקש נכון מחליש את המגה-וירוס. כל מילה מדויקת — פגיעה ישירה! הראו לו מה צוות אמיתי יכול!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
  ],
}

/**
 * 5.5 — The Battle: All characters fight together
 * Every character uses their unique skill. Ki becomes the leader his father was.
 */
export const CHAPTER_5_5_TEAM_BATTLE: DialogStoryBeat = {
  id: 'ch5-5-team-battle',
  trigger: { type: 'battle-result', result: 'win' },
  lines: [
    {
      id: 'ch5-5-01',
      character: 'ki',
      text: 'ביחד! כולם! כל אחד — התפקיד שלו! יוקי — מהירות! קאי — דיוק! מיקה — קיצורים! עכשיו!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-5-02',
      character: 'yuki',
      text: '80 מילים לדקה! השיא שלי! סנסאי סקורה, את רואה?! זרימה, לא מירוץ!',
      type: 'dialog',
      mood: 'epic',
      expression: 'cheering',
    },
    {
      id: 'ch5-5-03',
      character: 'kai',
      text: 'חוסם! כל באג שמתקרב — אני מחסל אותו! מגן על הצוות!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-5-04',
      character: 'noa',
      text: 'מרפאה את הקוד המושחת! המילים חוזרות למקומן!',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch5-5-05',
      character: 'pixel',
      text: 'מנתח נקודות תורפה... חושב שאני מרגיש... כעס? כן. כעס! רגש ראשון! ומשתמש בו!',
      type: 'dialog',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch5-5-06',
      character: 'shadow',
      text: 'שקט. מתגנב מאחור. פוגע בשורש הקוד. הצל מגיע ראשון.',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch5-5-07',
      character: 'mika',
      text: 'פורצת את המסכת! Ctrl+Alt+Delete! זה בשביל גליץ\'!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch5-5-08',
      character: 'rex',
      text: 'גם אני! גם עם ידיים קטנות! הנה — משחק מילים מצחיק שמבלבל את הוירוס! "Ctrl+Z את עצמך!"',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
  ],
}

/**
 * 5.6 — Mika reaches Glitch inside the Mega-Virus
 * Mika's voice penetrates through the corruption.
 * The most emotional moment of the series.
 */
export const CHAPTER_5_6_MIKA_REACHES_GLITCH: DialogStoryBeat = {
  id: 'ch5-6-mika-reaches-glitch',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch5-6-01',
      character: 'mika',
      text: 'גליץ\'! אני יודעת שאת שומעת אותי! את שם בפנים!',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch5-6-02',
      character: 'virus',
      text: 'שקט! היא שלי! היא בחרה! אין דרך חזרה!',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch5-6-03',
      character: 'mika',
      text: 'גליץ\'... את לא צריכה כוח כדי לדעת מי את. את גליץ\'. החברה שלי. זוכרת? הקוד הראשון שכתבנו ביחד?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch5-6-04',
      character: 'glitch',
      text: 'מ... מיקה...?',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch5-6-05',
      character: 'mika',
      text: 'כתבת בהערות: "יום אחד נבנה ביחד משהו שישנה את העולם." את זוכרת? אני זוכרת כל שורה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch5-6-06',
      character: 'glitch',
      text: 'מ-מיקה... אני... אני כאן. אני נלחמת. מ-מבפנים.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-6-07',
      character: 'virus',
      text: 'לא! תפסיקי! את שלי! את חלק ממני עכשיו!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch5-6-08',
      character: 'ki',
      text: 'מיקה מגיעה אליה! גליץ\' נלחמת מבפנים! אנחנו צריכים לעזור — עכשיו!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
      choices: [
        {
          id: 'ch5-6-choice-all',
          text: '!כולם ביחד — הקלידו ומלאו את הכוח שלה',
          relationshipEffect: { character: 'glitch', delta: 10 },
        },
        {
          id: 'ch5-6-choice-mika',
          text: 'מיקה, את היחידה שיכולה להגיע אליה. אנחנו מגינים',
          relationshipEffect: { character: 'mika', delta: 10 },
        },
      ],
    },
  ],
}

/**
 * 5.7 — Glitch's sacrifice: THE TEARJERKER MOMENT
 * Glitch fights from within. Speaks clearly for the FIRST TIME (no stuttering).
 * Shatters together with Virus. Everyone mourning.
 */
export const CHAPTER_5_7_GLITCH_SACRIFICE: DialogStoryBeat = {
  id: 'ch5-7-glitch-sacrifice',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch5-7-01',
      character: 'glitch',
      text: 'אני מרגישה אותם. כולם. את האנרגיה של כולם. מיקה, יוקי, קי, קאי, נועה, רקס, לונה, פיקסל, צל...',
      type: 'narration',
      mood: 'epic',
      expression: 'thinking',
    },
    {
      id: 'ch5-7-02',
      character: 'virus',
      text: 'מה את עושה?! תפסיקי! את הורסת אותנו! את הורסת את שנינו!',
      type: 'dialog',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch5-7-03',
      character: 'glitch',
      text: 'אני יודעת.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch5-7-04',
      character: 'mika',
      text: 'גליץ\'?! מה את — לא! אל תעשי את זה! יש דרך אחרת!',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch5-7-05',
      character: 'glitch',
      text: 'מיקה... עכשיו אני יודעת מי אני.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch5-7-06',
      character: 'ki',
      text: 'היא... היא לא מגמגמת. בפעם הראשונה — גליץ\' מדברת ברור.',
      type: 'thought',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch5-7-07',
      character: 'glitch',
      text: 'אני גליץ\'. לא תקלה. לא כלי. חברה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
      duration: 3000,
    },
    {
      id: 'ch5-7-08',
      character: 'ki',
      text: 'אור. אור עצום. גליץ\' ווירוס מתפוצצים יחד. שברי קוד דיגיטליים בצבעי גליץ\' מתפזרים לכל עבר. חלקיקים זעירים... שנעלמים באוויר.',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
      duration: 5000,
    },
    {
      id: 'ch5-7-09',
      character: 'mika',
      text: 'גליץ\'... את ידעת כל הזמן.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
      duration: 4000,
    },
  ],
}

/**
 * 5.8 — Silence and mourning
 * The aftermath. Everyone processes the loss. Pixel's first real emotion.
 * A tiny code fragment still blinks — foreshadowing Chapter 6.
 */
export const CHAPTER_5_8_MOURNING: DialogStoryBeat = {
  id: 'ch5-8-mourning',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch5-8-01',
      character: 'ki',
      text: 'שקט. רק שקט. הזירה ריקה מקרב. ריקה מגליץ\'.',
      type: 'narration',
      mood: 'sad',
      expression: 'sad',
      duration: 3000,
    },
    {
      id: 'ch5-8-02',
      character: 'yuki',
      text: 'היא... היא באמת נעלמה?',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-8-03',
      character: 'noa',
      text: 'אני... אני לא יכולה לרפא את זה. אין מה לרפא. היא... נעלמה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-8-04',
      character: 'pixel',
      text: 'שגיאה בניתוח... לא מצליח לעבד. תחושה לא מוכרת. חושב ש... זה מה שנקרא... אובדן.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-8-05',
      character: 'kai',
      text: 'היא הייתה לבד כל כך הרבה זמן. ובסוף... היא נלחמה בשביל כולנו.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch5-8-06',
      character: 'rex',
      text: 'אין לי בדיחה לרגע הזה. בפעם הראשונה — אין לי כלום.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch5-8-07',
      character: 'mika',
      text: 'מיקה לא מדברת. היא יושבת ליד המסך הכבוי ונוגעת בו. שם, לרגע, הייתה גליץ\'.',
      type: 'narration',
      mood: 'sad',
      expression: 'sad',
      duration: 4000,
    },
    {
      id: 'ch5-8-08',
      character: 'senseiZen',
      text: 'גיבורה. היא הייתה גיבורה אמיתית. ותמיד תהיה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
  ],
}

/**
 * 5.9 — Ki becomes the leader. The foreshadowing fragment.
 * Ki steps up. A tiny code fragment still blinks in Glitch's colors.
 * Whispered cliffhanger from Virus remnants — leading to Chapter 6.
 */
export const CHAPTER_5_9_LEADER_RISING: DialogStoryBeat = {
  id: 'ch5-9-leader-rising',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch5-9-01',
      character: 'ki',
      text: 'חברים. אני יודע שכואב. כואב לי גם. אבל גליץ\' — היא הקריבה את עצמה כדי שנוכל להמשיך.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch5-9-02',
      character: 'ki',
      text: 'אבא שלי נלחם נגד דברים כאלה. סנסאי סיפר לי. ועכשיו — תורי.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch5-9-03',
      character: 'senseiZen',
      text: 'אני מכיר את המבט הזה. ראיתי אותו פעם — בעיניים של אביך. קי, אתה מוכן.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch5-9-04',
      character: 'phantom',
      text: '...ראוי. אני נשאר.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch5-9-05',
      character: 'storm',
      text: 'דוג\'ו הברק — עם דוג\'ו של סנסאי זן. מהיום — ביחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
    },
    {
      id: 'ch5-9-06',
      character: 'barak',
      text: 'גם אני. בלי בדיחות הפעם. ספיד... בלי צוות? לא שווה כלום.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch5-9-07',
      character: 'ki',
      text: 'רגע — מה זה? חלקיק קוד קטנטן. מהבהב. בצבעים של... גליץ\'.',
      type: 'narration',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch5-9-08',
      character: 'pixel',
      text: 'סורק... חלקיק אחד. קטן. חי. חתימת קוד: גליץ\'. 0.3 אחוז. אבל... חי.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch5-9-09',
      character: 'mika',
      text: 'חי...?',
      type: 'thought',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch5-9-10',
      character: 'ki',
      text: 'ואז — לחישה מהחורבות. קול עמוק, מעוות, שבור: "המלחמה עוד לא נגמרה. אביך יודע."',
      type: 'narration',
      mood: 'mysterious',
      expression: 'concerned',
      duration: 4000,
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 5 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_5_BEATS: DialogStoryBeat[] = [
  CHAPTER_5_1_TOURNAMENT_BEGINS,
  CHAPTER_5_2_TOURNAMENT_ROUNDS,
  CHAPTER_5_3_GLITCH_ATTACKS,
  CHAPTER_5_4_MEGA_VIRUS,
  CHAPTER_5_5_TEAM_BATTLE,
  CHAPTER_5_6_MIKA_REACHES_GLITCH,
  CHAPTER_5_7_GLITCH_SACRIFICE,
  CHAPTER_5_8_MOURNING,
  CHAPTER_5_9_LEADER_RISING,
]
