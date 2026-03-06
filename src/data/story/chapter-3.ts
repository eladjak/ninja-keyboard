import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 3: הסערה מתקרבת (Rising Storm)
// באגים מתרבים, דמויות חדשות מופיעות, והצוות מתגבש לקראת האתגר הגדול.
// ---------------------------------------------------------------------------

/**
 * 3.1 — More bugs appearing, something is wrong
 * Strange glitches multiply. The dojo feels unstable.
 */
export const CHAPTER_3_1_MORE_BUGS: DialogStoryBeat = {
  id: 'ch3-1-more-bugs',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-16' },
  lines: [
    {
      id: 'ch3-1-01',
      character: 'ki',
      text: 'שוב! אותיות קופצות על המסך! ו"ש" הפכה ל-"ם" באמצע משפט!',
      type: 'dialog',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch3-1-02',
      character: 'pixel',
      text: 'סורק אנומליות... 47 תקלות קוד בשעה האחרונה. ביום שעבר היו 3. מגמה: מדאיגה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-1-03',
      character: 'yuki',
      text: 'גם לי! באמצע אימון מהירות — כל המקשים התחלפו! הפסדתי שיא אישי בגלל זה!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-1-04',
      character: 'senseiZen',
      text: 'זה לא סתם באג. מישהו... או משהו... שולח אותם. כמו חיילים לפני מלחמה.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch3-1-05',
      character: 'ki',
      text: 'סנסאי, אתה נראה מודאג. מה אתה לא מספר לנו?',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch3-1-06',
      character: 'senseiZen',
      text: '...עדיין מוקדם. התאמנו. כשתהיו מוכנים — תדעו.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
  ],
}

/**
 * 3.2 — Mika detects unusual network activity
 * Mika's hacker skills uncover something deeper.
 */
export const CHAPTER_3_2_MIKA_DETECTS: DialogStoryBeat = {
  id: 'ch3-2-mika-detects',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-17' },
  lines: [
    {
      id: 'ch3-2-01',
      character: 'mika',
      text: 'חברה, יש בעיה. ניתחתי את התעבורה ברשת הדוג\'ו — מישהו שולח נתונים מבחוץ. תבנית מוצפנת.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-2-02',
      character: 'ki',
      text: 'מה זה אומר בעברית רגילה?',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'ch3-2-03',
      character: 'mika',
      text: 'זה אומר שמישהו מרגל עלינו. וזה לא הבאג הטיפש. זה... מתוחכם יותר.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch3-2-04',
      character: 'pixel',
      text: 'מיקה, ההצפנה הזו... היא דומה לסגנון שכבר ראיתי. ב-40.7% מתאים ל-foreshadow pattern שהתגלה ב-1.6.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch3-2-05',
      character: 'mika',
      text: 'אני... אני מכירה את הסגנון הזה. מישהי שהכרתי פעם כתבה קוד ככה.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'sad',
    },
  ],
}

/**
 * 3.3 — Ki meets Shadow for the first time (cool entrance)
 * Shadow the cat makes a dramatic appearance.
 */
export const CHAPTER_3_3_MEET_SHADOW: DialogStoryBeat = {
  id: 'ch3-3-meet-shadow',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-18' },
  lines: [
    {
      id: 'ch3-3-01',
      character: 'ki',
      text: 'מה — מי כיבה את האור?!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch3-3-02',
      character: 'shadow',
      text: 'שקט.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch3-3-03',
      character: 'ki',
      text: 'החתול השחור! צל! ראיתי אותך כמה פעמים — אתה זה שהשאיר את הפתקים!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'excited',
    },
    {
      id: 'ch3-3-04',
      character: 'shadow',
      text: 'הייתי צופה. מחכה. עכשיו — הגיע הזמן.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-3-05',
      character: 'mika',
      text: 'רגע, חתול שמקליד? ברצינות?',
      type: 'dialog',
      mood: 'funny',
      expression: 'surprised',
    },
    {
      id: 'ch3-3-06',
      character: 'shadow',
      text: 'לא מקליד. חומק. עכבר... מחשב. הבנתם? עכבר.',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch3-3-07',
      character: 'ki',
      text: 'הוא... עשה בדיחת מחשב?',
      type: 'thought',
      mood: 'funny',
      expression: 'happy',
    },
  ],
}

/**
 * 3.4 — Shadow challenges Ki to a stealth-typing duel
 * Shadow tests Ki with silent, precise typing.
 */
export const CHAPTER_3_4_SHADOW_DUEL: DialogStoryBeat = {
  id: 'ch3-4-shadow-duel',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-19' },
  lines: [
    {
      id: 'ch3-4-01',
      character: 'shadow',
      text: 'אתגר. הקלדה שקטה. בלי רעש. בלי טעויות. כמו צל.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-4-02',
      character: 'ki',
      text: 'הקלדה שקטה? מה זה בכלל?',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch3-4-03',
      character: 'shadow',
      text: 'נינג\'ה אמיתי לא נשמע. גם באצבעות. מקש רך. נגיעה קלה. אפס רעש.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch3-4-04',
      character: 'ki',
      text: 'בסדר... אם חתול יכול, גם אני יכול. נראה מי יותר שקט!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
      choices: [
        {
          id: 'ch3-4-choice-accept',
          text: '!אני מקבל. בוא ננג\'ה',
          relationshipEffect: { character: 'shadow', delta: 5 },
        },
        {
          id: 'ch3-4-choice-nervous',
          text: 'למה אתה בוחר דווקא אותי?',
          relationshipEffect: { character: 'shadow', delta: 3 },
          nextDialogId: 'ch3-4-05',
        },
      ],
    },
    {
      id: 'ch3-4-05',
      character: 'shadow',
      text: 'כי אתה הקולני ביותר. והקולנים — הם אלה שצריכים ללמוד שקט.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'mischievous',
    },
  ],
}

/**
 * 3.5 — Storm and Barak appear at the dojo gates
 * The fox siblings arrive. Tension and intrigue.
 */
export const CHAPTER_3_5_STORM_ARRIVES: DialogStoryBeat = {
  id: 'ch3-5-storm-arrives',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-20' },
  lines: [
    {
      id: 'ch3-5-01',
      character: 'ki',
      text: 'מי עומד בשער הדוג\'ו? שועלים?! שני שועלים!',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch3-5-02',
      character: 'storm',
      text: 'דוג\'ו של סנסאי זן. שמענו עליך, צב זקן. באנו לראות אם התלמידים שלך שווים משהו.',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch3-5-03',
      character: 'senseiZen',
      text: 'סערה. ברק. דוג\'ו הברק שולח את שני הכוכבים שלו? מחמיא.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch3-5-04',
      character: 'ki',
      text: 'רגע — היא השועלה שיוקי ראתה! וזה... אחיה?',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch3-5-05',
      character: 'storm',
      text: 'שמעתי שיש לכם מישהי שחושבת שהיא מהירה. אני רוצה לבדוק.',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
  ],
}

/**
 * 3.6 — Yuki recognizes Barak as a speed rival
 * Yuki and Barak's rivalry ignites immediately.
 */
export const CHAPTER_3_6_YUKI_VS_BARAK: DialogStoryBeat = {
  id: 'ch3-6-yuki-vs-barak',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch3-6-01',
      character: 'yuki',
      text: 'רגע. רגע רגע רגע. אתה ברק? ברק מדוג\'ו הברק? שמעתי עליך — 60 מילים לדקה!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch3-6-02',
      character: 'storm',
      text: 'אחי ברק מקליד 70 מילים לדקה. ודיוק? מי צריך דיוק? ספיד הוא ספיד, מותק.',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch3-6-03',
      character: 'yuki',
      text: 'מותק?! אני אראה לך "מותק"! מירוץ! עכשיו!',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
    {
      id: 'ch3-6-04',
      character: 'senseiZen',
      text: 'לא עכשיו, יוקי. יש זמן ומקום לכל קרב. וזה — לא הזמן.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'concerned',
    },
    {
      id: 'ch3-6-05',
      character: 'ki',
      text: 'יוקי ממש נדלקה. מעולם לא ראיתי אותה ככה. ברק הוא בדיוק מה שהיא לא צריכה... או בדיוק מה שהיא כן צריכה?',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
  ],
}

/**
 * 3.7 — Glitch's first appearance (mysterious, friendly)
 * Strange girl-like entity shows up. Mika recognizes something.
 */
export const CHAPTER_3_7_GLITCH_APPEARS: DialogStoryBeat = {
  id: 'ch3-7-glitch-appears',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-21' },
  lines: [
    {
      id: 'ch3-7-01',
      character: 'ki',
      text: 'שוב אותיות קופצות! אבל הפעם... הן מסתדרות לצורה. כמו... פנים?',
      type: 'narration',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch3-7-02',
      character: 'glitch',
      text: 'ג-ג-גליץ\' פ-פ-פה. ש-שלום. לא... לא באתי לשבור. באתי ל-ל-להגיד... תיזהרו.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch3-7-03',
      character: 'ki',
      text: 'את... מי? את נראית כמו תקלה אבל... מדברת? ויש לך עיניים עצובות.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'thinking',
    },
    {
      id: 'ch3-7-04',
      character: 'glitch',
      text: 'א-אני לא רוצה לפגוע. הוא... הוא שולח אותי. אבל אני לא... אני לא רוצה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch3-7-05',
      character: 'mika',
      text: 'רגע. הקול הזה. אני... אני מכירה את הקול הזה. את... לא. זה בלתי אפשרי.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch3-7-06',
      character: 'glitch',
      text: 'מ-מיקה... סלחי...',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
      duration: 2000,
    },
  ],
}

/**
 * 3.8 — Team formation: Ki learns teamwork through typing relay
 * The group types together for the first time. Each brings their strength.
 */
export const CHAPTER_3_8_TEAM_FORMATION: DialogStoryBeat = {
  id: 'ch3-8-team-formation',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-22' },
  lines: [
    {
      id: 'ch3-8-01',
      character: 'senseiZen',
      text: 'היום נלמד את השיעור החשוב ביותר: אף נינג\'ה לא נלחם לבד. היום — אימון צוותי.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
    },
    {
      id: 'ch3-8-02',
      character: 'mika',
      text: 'אני על הקיצורים. Ctrl+Z אם מישהו טועה, Ctrl+S כל 30 שניות.',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch3-8-03',
      character: 'yuki',
      text: 'אני על המהירות! מילים קצרות — שלי!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch3-8-04',
      character: 'kai',
      text: 'אני... אני אגן על הטקסט. אם באג מופיע — אני חוסם אותו.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch3-8-05',
      character: 'noa',
      text: 'ואם מישהו נתקע — אני מרפאה את הטקסט המושחת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch3-8-06',
      character: 'ki',
      text: 'ואני? מה התפקיד שלי?',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch3-8-07',
      character: 'senseiZen',
      text: 'אתה הלב, קי. אתה מחבר את כולם. בלעדיך — אין צוות.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
  ],
}

/**
 * 3.9 — Chapter end: ominous signs, Sensei Zen worried
 * The chapter closes with tension. Something big is coming.
 */
export const CHAPTER_3_9_OMINOUS_END: DialogStoryBeat = {
  id: 'ch3-9-ominous-end',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch3-9-01',
      character: 'ki',
      text: 'סנסאי... את מי ראיתי היום? הבחורה הזו — גליץ\'. היא לא נראתה רעה.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch3-9-02',
      character: 'senseiZen',
      text: 'לא כל מי שנראה אויב — הוא אויב. ולא כל מי שנראה חבר... יישאר חבר.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch3-9-03',
      character: 'ki',
      text: 'אני שמתי לב שהאצבעות של סנסאי רועדות. הוא מפחד ממשהו. מה הצב הזקן מסתיר?',
      type: 'thought',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-9-04',
      character: 'senseiZen',
      text: 'היום למדתם שצוות חזק מכל יחיד. תזכרו את זה. בקרוב... תצטרכו את זה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-9-05',
      character: 'mika',
      text: 'גליץ\' היא... היא חברה שלי. מפעם. אני צריכה לגלות מה קרה לה.',
      type: 'thought',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch3-9-06',
      character: 'ki',
      text: 'השועלים, הגליץ\', הבאגים, הסודות של סנסאי... הסערה מתקרבת. אני מרגיש את זה.',
      type: 'narration',
      mood: 'epic',
      expression: 'concerned',
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 3 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_3_BEATS: DialogStoryBeat[] = [
  CHAPTER_3_1_MORE_BUGS,
  CHAPTER_3_2_MIKA_DETECTS,
  CHAPTER_3_3_MEET_SHADOW,
  CHAPTER_3_4_SHADOW_DUEL,
  CHAPTER_3_5_STORM_ARRIVES,
  CHAPTER_3_6_YUKI_VS_BARAK,
  CHAPTER_3_7_GLITCH_APPEARS,
  CHAPTER_3_8_TEAM_FORMATION,
  CHAPTER_3_9_OMINOUS_END,
]
