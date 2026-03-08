import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 4: מעבר לדוג'ו (Beyond the Dojo)
// הצוות יוצא לאקדמיית הסייבר, פוגש את וירוס ה"ידידותי",
// גליץ' מנסה להזהיר — ובסוף בוחרת ללכת עם וירוס מרצונה.
// ---------------------------------------------------------------------------

/**
 * 4.1 — Encrypted invitation to the Cyber Academy
 * Mika deciphers a mysterious message. The team ventures beyond the dojo.
 */
export const CHAPTER_4_1_CYBER_INVITATION: DialogStoryBeat = {
  id: 'ch4-1-cyber-invitation',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-23' },
  lines: [
    {
      id: 'ch4-1-01',
      character: 'mika',
      text: 'חברה, תשבו. קיבלתי הודעה מוצפנת. מישהו שולח לנו הזמנה — לאקדמיית הסייבר.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'excited',
    },
    {
      id: 'ch4-1-02',
      character: 'ki',
      text: 'אקדמיית הסייבר? זה מעבר לדוג\'ו! סנסאי, את מכיר את המקום הזה?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch4-1-03',
      character: 'senseiZen',
      text: 'האקדמייה... כן, אני מכיר. פעם זה היה מקום של למידה ואור. אבל מי ששלח את ההזמנה — זה מה שמדאיג אותי.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch4-1-04',
      character: 'mika',
      text: 'ההצפנה הזו מתקדמת. שלוש שכבות. מי שכתב את זה — מבין בקוד ברמה שאני בקושי ראיתי.',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch4-1-05',
      character: 'yuki',
      text: 'אז מה אנחנו מחכים?! בואו נלך! הרפתקה!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch4-1-06',
      character: 'senseiZen',
      text: 'הנהר שעוזב את מקורו לא חוזר אותו נהר. אם תצאו מהדוג\'ו — תחזרו שונים. מוכנים?',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch4-1-07',
      character: 'ki',
      text: 'מוכנים. ביחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
      choices: [
        {
          id: 'ch4-1-choice-brave',
          text: '!אנחנו צוות. יוצאים עכשיו',
          relationshipEffect: { character: 'yuki', delta: 3 },
        },
        {
          id: 'ch4-1-choice-cautious',
          text: 'בואו ניקח רגע להתכונן לפני',
          relationshipEffect: { character: 'senseiZen', delta: 3 },
        },
      ],
    },
  ],
}

/**
 * 4.2 — Meeting Virus (FRIENDLY form!)
 * Virus appears as a cute, helpful digital companion. Everyone trusts him.
 * The biggest foreshadowing of the story.
 */
export const CHAPTER_4_2_MEET_VIRUS: DialogStoryBeat = {
  id: 'ch4-2-meet-virus',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-24' },
  lines: [
    {
      id: 'ch4-2-01',
      character: 'ki',
      text: 'וואו... המקום הזה ענקי! עיר הדפדפן, ענני הענן — מי בנה את כל זה?',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch4-2-02',
      character: 'virus',
      text: 'שלום שלום! ברוכים הבאים לאקדמיית הסייבר! אני וירוס — המדריך הדיגיטלי שלכם! אני כאן לעזור!',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch4-2-03',
      character: 'ki',
      text: 'וירוס? שם מוזר למדריך...',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'ch4-2-04',
      character: 'virus',
      text: 'הא, כולם אומרים את זה! ויי-רוס, כמו VR — Virtual Reality. זה סתם שם. אני הכי לא מסוכן שיש!',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch4-2-05',
      character: 'pixel',
      text: 'סורק... אין חתימות זדוניות. רמת אמון: 87%. מסקנה זמנית: ידידותי.',
      type: 'dialog',
      mood: 'happy',
      expression: 'thinking',
    },
    {
      id: 'ch4-2-06',
      character: 'virus',
      text: 'בואו, אני אראה לכם את מבצר האבטחה! יש שם שיעורים מדהימים על סיסמאות וקיצורים מתקדמים!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch4-2-07',
      character: 'mika',
      text: 'הוא יודע המון על אבטחה. מרשים. אולי סוף סוף מישהו שמבין אותי.',
      type: 'thought',
      mood: 'happy',
      expression: 'happy',
    },
  ],
}

/**
 * 4.3 — Glitch tries to warn the team
 * Nobody listens. Glitch is rejected again, even by Mika.
 */
export const CHAPTER_4_3_GLITCH_WARNING: DialogStoryBeat = {
  id: 'ch4-3-glitch-warning',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-25' },
  lines: [
    {
      id: 'ch4-3-01',
      character: 'glitch',
      text: 'ח-ח-חברים! תקשיבו! ה-הוא לא... מ-מה שהוא נראה! וירוס — הוא לא—',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch4-3-02',
      character: 'mika',
      text: 'גליץ\', למה שנסמוך עלייך? כל פעם שאת מופיעה, דברים מתקלקלים.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch4-3-03',
      character: 'glitch',
      text: 'מ-מיקה... א-את לא מבינה. ה-הוא שולט ב-ב-כל הבאגים. הוא ש-שלח אותם אלייכם!',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-3-04',
      character: 'virus',
      text: 'אוי, גליץ\'! עוד פעם? חברים, היא מבולבלת, מסכנה. תקלה ישנה שלא מצליחה להירגע. אל תדאגו.',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch4-3-05',
      character: 'ki',
      text: 'אבל... העיניים שלה. היא נראית מפוחדת. לא משקרת.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch4-3-06',
      character: 'glitch',
      text: 'ת-תיזהרו... בבקשה... ה-הוא ח-חזק מכולכם.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
      duration: 2000,
    },
    {
      id: 'ch4-3-07',
      character: 'rex',
      text: 'מסכנה. מישהי צריכה לעזור לה. היא נראית ממש לבד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
  ],
}

/**
 * 4.4 — Virus reveals his true nature!
 * The mask falls. Virus transforms from friendly to terrifying.
 * He tempts Glitch with identity and power.
 */
export const CHAPTER_4_4_VIRUS_REVEALS: DialogStoryBeat = {
  id: 'ch4-4-virus-reveals',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-26' },
  lines: [
    {
      id: 'ch4-4-01',
      character: 'virus',
      text: 'אתם יודעים מה? נמאס לי לשחק. המסכה? נגמרה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch4-4-02',
      character: 'ki',
      text: 'מה — מה קורה לו?! הוא... משתנה! העיניים שלו... אדומות!',
      type: 'narration',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch4-4-03',
      character: 'virus',
      text: 'הנה אני. הוירוס האמיתי. חשבתם שאני ידידותי? כל הזמן הזה — למדתי את החולשות שלכם. כל מקש, כל שגיאה, כל פחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch4-4-04',
      character: 'mika',
      text: 'לא... סמכנו עליו. אני סמכתי עליו! איך... איך לא ראיתי את זה?!',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch4-4-05',
      character: 'senseiZen',
      text: 'ילדים, מאחוריי! הוירוס הזה — הוא לא באג רגיל. הוא מה שפחדתי ממנו.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch4-4-06',
      character: 'virus',
      text: 'אה, הצב הזקן מפחד! טוב. אבל אני לא רוצה אתכם. אני רוצה... אותה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch4-4-07',
      character: 'glitch',
      text: 'א-אותי...?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch4-4-08',
      character: 'virus',
      text: 'גליץ\'. איתי — תדעי מי את. זהות ברורה. כוח אמיתי. לא עוד גמגום. לא עוד "תקלה". הם? הם אף פעם לא סמכו עלייך.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch4-4-09',
      character: 'ki',
      text: 'גליץ\', אל תשמעי לו! הוא משקר!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
      choices: [
        {
          id: 'ch4-4-choice-reach',
          text: '!גליץ\', את חלק מהצוות שלנו',
          relationshipEffect: { character: 'glitch', delta: 5 },
        },
        {
          id: 'ch4-4-choice-fight',
          text: 'וירוס, אתה לא תיקח אף אחד מאיתנו!',
          relationshipEffect: { character: 'mika', delta: 3 },
        },
      ],
    },
  ],
}

/**
 * 4.5 — Glitch chooses to leave with Virus
 * She leaves WILLINGLY. Not captured — she CHOOSES. This is the deepest wound.
 * Mika breaks.
 */
export const CHAPTER_4_5_GLITCH_LEAVES: DialogStoryBeat = {
  id: 'ch4-5-glitch-leaves',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-27' },
  lines: [
    {
      id: 'ch4-5-01',
      character: 'glitch',
      text: 'מ-מיקה...',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-5-02',
      character: 'mika',
      text: 'גליץ\', אל. אל תלכי איתו. אני... אני מצטערת שלא הקשבתי. בבקשה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-5-03',
      character: 'glitch',
      text: 'כ-כל החיים שלי אני ת-תקלה. לא שלמה. אף אחד לא מבין מה זה. ה-הוא מבטיח שאהיה... שלמה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch4-5-04',
      character: 'noa',
      text: 'גליץ\', את לא תקלה. את ייחודית. אל תתני לו להגדיר מי את.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'concerned',
    },
    {
      id: 'ch4-5-05',
      character: 'glitch',
      text: 'מ-מיקה... סלחי לי. אני צ-צריכה לדעת מי אני.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-5-06',
      character: 'ki',
      text: 'היא... הולכת. גליץ\' מתחילה לזהור בצבעי וירוס. נבלעת באנרגיה כהה. ונעלמת.',
      type: 'narration',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch4-5-07',
      character: 'mika',
      text: 'היא... בחרה ללכת?! גליץ\'!!! חזרי!!!',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-5-08',
      character: 'senseiZen',
      text: 'לפעמים... הכאב הכי גדול הוא לא כשלוקחים ממך מישהו. אלא כשמישהו בוחר לעזוב.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-5-09',
      character: 'mika',
      text: 'היא הייתה החברה הכי טובה שלי. והיא... בחרה אותו. לא אותנו.',
      type: 'thought',
      mood: 'sad',
      expression: 'sad',
      duration: 3000,
    },
    {
      id: 'ch4-5-10',
      character: 'ki',
      text: 'מיקה בוכה בשקט. אף אחד לא זז. החדר ריק מגליץ\'. הקרב האמיתי — רק מתחיל.',
      type: 'narration',
      mood: 'sad',
      expression: 'sad',
    },
  ],
}

/**
 * 4.6 — Aftermath: The team regroups
 * Raw emotions. Mika is broken. Ki steps up as a leader for the first time.
 */
export const CHAPTER_4_6_AFTERMATH: DialogStoryBeat = {
  id: 'ch4-6-aftermath',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch4-6-01',
      character: 'yuki',
      text: 'מה עכשיו? היא... באמת הלכה? אי אפשר להחזיר אותה?',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch4-6-02',
      character: 'kai',
      text: 'אני... אני יודע מה זה להרגיש לבד. אולי היא חשבה שאין לה ברירה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-6-03',
      character: 'mika',
      text: 'תפסיקו. כולכם. אני לא רוצה לשמוע "הכל יהיה בסדר." כי זה לא יהיה.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch4-6-04',
      character: 'ki',
      text: 'מיקה, את צודקת. זה לא יהיה בסדר — אלא אם כן נילחם. גליץ\' נתנה את עצמה. אנחנו חייבים להחזיר אותה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch4-6-05',
      character: 'senseiZen',
      text: 'עכשיו, קי, אתה מדבר כמו מנהיג. אבא שלך... היה מדבר בדיוק ככה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch4-6-06',
      character: 'ki',
      text: 'סנסאי הזכיר את אבא. בפעם הראשונה הוא אמר את זה ישירות. מה אבא ידע?',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch4-6-07',
      character: 'shadow',
      text: 'הטורניר מתקרב. וירוס ישלח את גליץ\' — נגדנו. צריך להתכונן.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch4-6-08',
      character: 'ki',
      text: 'אז בואו נתאמן. חזק יותר. מהר יותר. מדויק יותר. נהיה מוכנים — בשביל גליץ\'.',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
  ],
}

/**
 * 4.7 — Storm and Barak visit: pre-tournament tension
 * Storm brings news of the tournament. Barak provokes Yuki.
 */
export const CHAPTER_4_7_TOURNAMENT_ANNOUNCED: DialogStoryBeat = {
  id: 'ch4-7-tournament-announced',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-28' },
  lines: [
    {
      id: 'ch4-7-01',
      character: 'storm',
      text: 'דוג\'ו של סנסאי זן! הבשורה הגיעה? הטורניר הגדול — כל הדוג\'ואים, כל בתי הספר. בעוד שבוע.',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch4-7-02',
      character: 'barak',
      text: 'הא, השועלה שלי! אני שומע שיש לכם לוחמת מהירות? מה שמה... יוקי? 55 מילים לדקה? חמוד.',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch4-7-03',
      character: 'yuki',
      text: '55?! אני על 65 עכשיו! ואני עולה כל יום! בוא נתחרה ונראה מי חמוד!',
      type: 'dialog',
      mood: 'tense',
      expression: 'excited',
    },
    {
      id: 'ch4-7-04',
      character: 'barak',
      text: '65? אני על 75. בלי להתאמץ. ספיד הוא ספיד, מותקית.',
      type: 'dialog',
      mood: 'funny',
      expression: 'mischievous',
    },
    {
      id: 'ch4-7-05',
      character: 'storm',
      text: 'ברק, הפסק. באנו להזהיר, לא להתגרות. שמענו על הוירוס. זה... גדול מכולנו.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch4-7-06',
      character: 'ki',
      text: 'סערה, את יודעת על וירוס? מה שמעתם?',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch4-7-07',
      character: 'storm',
      text: 'שמענו שהוא השתלט על דוג\'ו שלם בצפון. ושיש לו... לוחמת חדשה. חזקה.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
    },
    {
      id: 'ch4-7-08',
      character: 'mika',
      text: 'גליץ\'...',
      type: 'thought',
      mood: 'sad',
      expression: 'sad',
    },
  ],
}

/**
 * 4.8 — End of Chapter 4: Mika's private moment
 * Mika alone, looking at old code she and Glitch wrote together.
 * Determination mixed with grief.
 */
export const CHAPTER_4_8_MIKA_RESOLVE: DialogStoryBeat = {
  id: 'ch4-8-mika-resolve',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch4-8-01',
      character: 'mika',
      text: 'המחשב ישן של גליץ\' ושלי. עוד מהזמן שהיינו בנות 10. כתבנו ביחד את הקוד הראשון שלנו פה.',
      type: 'narration',
      mood: 'sad',
      expression: 'thinking',
    },
    {
      id: 'ch4-8-02',
      character: 'mika',
      text: 'היא כתבה בהערות: "מיקה, יום אחד נבנה ביחד משהו שישנה את העולם." יום אחד...',
      type: 'thought',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch4-8-03',
      character: 'ki',
      text: 'מיקה? הכל... בסדר? מה את עושה פה לבד?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'concerned',
    },
    {
      id: 'ch4-8-04',
      character: 'mika',
      text: 'קי... אני לא מוכנה לוותר עליה. לא אכפת לי כמה חזק הוירוס. אני אמצא דרך.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch4-8-05',
      character: 'ki',
      text: 'לא לבד. לא תמצאי דרך לבד. כולנו — ביחד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch4-8-06',
      character: 'mika',
      text: 'תודה, חדשן. בפעם הראשונה — אני שמחה שאתה פה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch4-8-07',
      character: 'ki',
      text: 'הפרק הזה סיפר לי שתי מילים חדשות: בגידה ונחישות. עכשיו אני יודע מה הן מרגישות.',
      type: 'thought',
      mood: 'epic',
      expression: 'thinking',
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 4 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_4_BEATS: DialogStoryBeat[] = [
  CHAPTER_4_1_CYBER_INVITATION,
  CHAPTER_4_2_MEET_VIRUS,
  CHAPTER_4_3_GLITCH_WARNING,
  CHAPTER_4_4_VIRUS_REVEALS,
  CHAPTER_4_5_GLITCH_LEAVES,
  CHAPTER_4_6_AFTERMATH,
  CHAPTER_4_7_TOURNAMENT_ANNOUNCED,
  CHAPTER_4_8_MIKA_RESOLVE,
]
