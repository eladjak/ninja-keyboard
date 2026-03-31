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
      text: 'מה זה אומר בעברית של בן אדם רגיל, בבקשה?',
      type: 'dialog',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'ch3-2-03',
      character: 'mika',
      text: 'בקיצור? מישהו מרגל עלינו. וזה לא הבאג המשוגע מפרק 2. זה משהו רציני. מתוחכם. מפחיד.',
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
      text: 'לא מקליד. חומק. רודף עכברים... עכבר. מחשב. הבנתם? ...עכבר.',
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
 * 3.4b — Virus (friendly form) visits the dojo, gains trust
 * The small, cheerful digital entity that Ki saw in Ch2 shows up again.
 * Virus helps the group, learns their weaknesses, laughs and plays.
 * Nobody suspects a thing.
 */
export const CHAPTER_3_4B_VIRUS_BEFRIENDS: DialogStoryBeat = {
  id: 'ch3-4b-virus-befriends',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-19b' },
  lines: [
    {
      id: 'ch3-4b-01',
      character: 'virus',
      text: 'אהאאאא! שוב כאן! גיליתי שאני יכול להתחבר לדוג\'ו! מותר לשבת? יש לי הרבה מה ללמוד!',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch3-4b-02',
      character: 'yuki',
      text: 'ואאאו! הישות הזוהרת! מי אתה?! אתה נראה ממש מגניב!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch3-4b-03',
      character: 'virus',
      text: 'שמי וירוס! ממש לא מסוכן, מבטיח! שם מוזר, אני יודע. תקשיבו — אני יכול ללמד אתכם כמה טריקים של אבטחת מידע שמאיצים הקלדה!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch3-4b-04',
      character: 'mika',
      text: 'אבטחת מידע? דבר איתי. מה אתה יודע על הצפנה?',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch3-4b-05',
      character: 'virus',
      text: 'מיקה, נכון? אני קראתי את הפרופיל שלך. האקרית מדהימה! מה שאת יכולה לעשות — עם קצת עזרה ממני — תשנה את הכל!',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch3-4b-06',
      character: 'ki',
      text: 'הוא קרא את הפרופיל שלה? איך הוא יודע את שמה? משהו לא ממש מסתדר — אבל... הוא נראה כל כך ידידותי.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch3-4b-07',
      character: 'virus',
      text: 'קי! תן לי לראות את הסטטיסטיקות שלך. אני אראה לך בדיוק איפה אתה איטי ואיך לתקן. חבר ביחד — עוזרים!',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch3-4b-08',
      character: 'senseiZen',
      text: 'וירוס... שם מוזר לאורח. מאיפה אתה, בדיוק?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch3-4b-09',
      character: 'virus',
      text: 'אה, סנסאי! מכבד אותך כל כך! אני... מאקדמיית הסייבר! פרויקט עזרה לדוג\'ואים! אנחנו שולחים מדריכים לכל מקום! טוב לב טהור!',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch3-4b-10',
      character: 'senseiZen',
      text: 'אקדמיית הסייבר... כבר הרבה זמן לא שמעתי מהם.',
      type: 'thought',
      mood: 'mysterious',
      expression: 'concerned',
    },
  ],
}

/**
 * 3.4c — Zara (Bug Queen) and Keres (Bug King) debut
 * The bugs have a new leader. Not the chaotic Bug from Ch2 — but an organized, dangerous enemy.
 * Zara appears menacing. Keres is referenced but not yet seen — only his voice echoes.
 */
export const CHAPTER_3_4C_ZARA_AND_KERES_DEBUT: DialogStoryBeat = {
  id: 'ch3-4c-zara-and-keres-debut',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-19c' },
  lines: [
    {
      id: 'ch3-4c-01',
      character: 'ki',
      text: 'האורות בדוג\'ו הבהבו. ואז — קוד שחור זחל על כל המסכים. לא כמו הבאג המשוגע. זה היה... מסודר. מפחיד.',
      type: 'narration',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch3-4c-02',
      character: 'zara',
      text: 'דוג\'ו של סנסאי זן. שמעתי עליכם. כולכם חושבים שניצחתם את הבאגים. חמוד מאוד.',
      type: 'dialog',
      mood: 'tense',
      expression: 'mischievous',
    },
    {
      id: 'ch3-4c-03',
      character: 'ki',
      text: 'מי — מי את?! ילדה עם כתר של קוד שבור! עיניים ירוקות כמו זרם חשמל!',
      type: 'dialog',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch3-4c-04',
      character: 'zara',
      text: 'שמי זרה. מלכת הבאגים. ומי שאני עובדת בשבילו — הוא הרבה יותר מסוכן ממני. אבל נדבר על זה בהמשך.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-4c-05',
      character: 'noa',
      text: 'היא לא נראית כמו הבאג מפרק 2. זה שונה. מאורגן. אינטליגנטי. מסוכן.',
      type: 'thought',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-4c-06',
      character: 'zara',
      text: 'אני לא פה לקרב. אני פה לבקר. כדי שכשנחזור — תדעו מה מחכה לכם.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-4c-07',
      character: 'keres',
      text: 'זרה — מספיק. חזרי. יש לנו עוד עבודה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch3-4c-08',
      character: 'ki',
      text: 'קול! קול עמוק ממסך שחור! מי דיבר?! מי נתן לה פקודה?!',
      type: 'dialog',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch3-4c-09',
      character: 'zara',
      text: 'תפגשו בו בזמן הנכון. אם תשרדו כל כך הרבה. שלום, נינג\'ות.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch3-4c-10',
      character: 'senseiZen',
      text: 'כרס... הוא חזר. זה הדבר שחששתי ממנו. ילדים — מהיום, אנחנו מתאמנים כפליים.',
      type: 'thought',
      mood: 'tense',
      expression: 'concerned',
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
      text: 'אה, אז פה זה? הדוג\'ו המפורסם של סנסאי זן. שמענו עליך, צב זקן. באנו לראות אם התלמידים שלך שווים את ההייפ.',
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
      text: 'מותק?! היא קראה לי מותק?! בואי אני אראה לך מותק! מירוץ! כאן! עכשיו! בום!',
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
 * 3.6b — Sakura appears, mentors Yuki
 * A mysterious crane figure descends. Yuki's true mentor reveals herself.
 */
export const CHAPTER_3_6B_SAKURA_MENTORS_YUKI: DialogStoryBeat = {
  id: 'ch3-6b-sakura-mentors-yuki',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch3-6b-01',
      character: 'yuki',
      text: 'אני כל כך עצבנית! ברק מקליד מהר יותר ממני! איך זה אפשרי?!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch3-6b-02',
      character: 'sakura',
      text: 'כי את רצה. ורץ — נופל. הקלדה היא לא מירוץ, ילדה. היא ריקוד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch3-6b-03',
      character: 'yuki',
      text: 'מי... מי את?! עגורה?! עגורה שמדברת?!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch3-6b-04',
      character: 'sakura',
      text: 'שמי סאקורה. הייתי חברה של סנסאי זן, לפני הרבה מאוד זמן. הוא ביקש שאשמור עליך.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch3-6b-05',
      character: 'senseiZen',
      text: 'סאקורה... כבר שנים. שמחתי שבאת. יוקי צריכה מישהי שתלמד אותה מה שאני לא יכול.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch3-6b-06',
      character: 'sakura',
      text: 'תקשיבי, יוקי. מהירות בלי שליטה היא רעש. שליטה בלי מהירות היא שקט. ריקוד — זה שניהם ביחד. בוא נתרגל.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      duration: 3000,
    },
    {
      id: 'ch3-6b-07',
      character: 'yuki',
      text: 'ריקוד... של אצבעות? אוקיי, סאקורה. תראי לי.',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
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
  CHAPTER_3_4B_VIRUS_BEFRIENDS,
  CHAPTER_3_4C_ZARA_AND_KERES_DEBUT,
  CHAPTER_3_5_STORM_ARRIVES,
  CHAPTER_3_6_YUKI_VS_BARAK,
  CHAPTER_3_6B_SAKURA_MENTORS_YUKI,
  CHAPTER_3_7_GLITCH_APPEARS,
  CHAPTER_3_8_TEAM_FORMATION,
  CHAPTER_3_9_OMINOUS_END,
]
