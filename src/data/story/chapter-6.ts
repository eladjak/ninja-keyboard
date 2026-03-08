import type { DialogStoryBeat } from '@/types/story'

// ---------------------------------------------------------------------------
// פרק 6: המלחמה הגדולה (The Great War)
// הפרק האחרון. שרידי הוירוס גדלו לשחיתות קוד עצומה.
// 6 צוותים יוצאים למשימות צד, אוספים שברים מסתוריים.
// רז/פאנטום מוביל את קי למאסטר ביט בעומק הקוד.
// גליץ' מורכבת מחדש — הרגע הכי רגשי בסדרה.
// כל הדמויות נלחמות יחד בקרב הסופי. שלום, דוג'ואים חדשים, ועתיד.
// ---------------------------------------------------------------------------

/**
 * 6.1 — The Corruption spreads
 * Weeks after the tournament. The Virus remnant from Ch5 has grown into
 * "Code Corruption" — a massive, spreading digital plague.
 * Ki calls ALL characters together for a war council.
 */
export const CHAPTER_6_1_CORRUPTION_SPREADS: DialogStoryBeat = {
  id: 'ch6-1-corruption-spreads',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-33' },
  lines: [
    {
      id: 'ch6-1-01',
      character: 'ki',
      text: 'שלושה שבועות מאז הטורניר. חשבנו שנגמר. טעינו.',
      type: 'narration',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch6-1-02',
      character: 'pixel',
      text: 'סורק... שחיתות קוד ב-47% מהעולם הדיגיטלי. לפני שבוע זה היה 12%. קצב התפשטות: אקספוננציאלי. מסקנה: יש לנו ימים, לא שבועות.',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch6-1-03',
      character: 'senseiZen',
      text: 'שריד הוירוס שנותר אחרי הפיצוץ... הוא לא מת. הוא השתרש. כמו עשב שוטה שהשורשים שלו עמוק מדי לעקירה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch6-1-04',
      character: 'mika',
      text: 'וגליץ\'... השברים שלה עדיין שם בחוץ. 0.3 אחוז מהבהב. כל יום שעובר — אני מפחדת שגם הם ייבלעו.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch6-1-05',
      character: 'ki',
      text: 'לכן קראתי לכולם. כל הדוג\'ואים. כל הלוחמים. סערה, ברק, בלייז, צל — כולם. אנחנו צריכים צבא.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-1-06',
      character: 'storm',
      text: 'דוג\'ו הברק כאן. הוא אכל שני דוג\'ואים בצפון. אנחנו הבאים אם לא נפעל.',
      type: 'dialog',
      mood: 'tense',
      expression: 'idle',
    },
    {
      id: 'ch6-1-07',
      character: 'blaze',
      text: 'הלהבה שלי מרגישה את זה. השחיתות מכבה אש. מכבה קוד. מכבה חיים. נלחמים או נכבים.',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch6-1-08',
      character: 'phantom',
      text: 'קי.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch6-1-09',
      character: 'ki',
      text: 'אבא...?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch6-1-10',
      character: 'phantom',
      text: 'יש מקום. עמוק. מתחת לכל הקוד. שם — מישהו מחכה. מישהו שהכיר את הסכנה הזו הרבה לפני כולנו.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch6-1-11',
      character: 'senseiZen',
      text: 'רז... אתה מדבר על — לא. הוא הפך לאגדה. אף אחד לא ראה אותו מאז—',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch6-1-12',
      character: 'phantom',
      text: 'אני ראיתי. הוא שם. מאסטר ביט.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      duration: 3000,
    },
  ],
}

/**
 * 6.2 — Six teams, six missions
 * Ki divides ALL characters into 6 teams. Each team has a side quest
 * in a different region of the digital world. They are told to collect
 * "code fragments" — they don't know these are Glitch's pieces.
 */
export const CHAPTER_6_2_SIX_TEAMS: DialogStoryBeat = {
  id: 'ch6-2-six-teams',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-34' },
  lines: [
    {
      id: 'ch6-2-01',
      character: 'ki',
      text: 'התוכנית: שישה צוותים, שש משימות. בכל אזור יש שברי קוד שהשחיתות עוד לא בלעה. אנחנו צריכים לאסוף כמה שיותר לפני שהכל ייעלם.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-2-02',
      character: 'yuki',
      text: 'צוות מהירות! אני וברק — ביער הנתונים! נרוץ יותר מהר מהשחיתות!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-2-03',
      character: 'barak',
      text: 'סוף סוף! אנחנו ביחד במשימה! מי מהיר יותר — גם שם נתחרה?',
      type: 'dialog',
      mood: 'happy',
      expression: 'mischievous',
    },
    {
      id: 'ch6-2-04',
      character: 'yuki',
      text: 'תמיד. אבל הפעם — ביחד, לא נגד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-2-05',
      character: 'kai',
      text: 'צוות מגן. אני ולונה — בארכיון הקוד. מגינים על מה שנשאר.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-2-06',
      character: 'luna',
      text: 'אני ארשום את כל מה שנמצא. ציורי ASCII כמפות. בלי לפחד. הפעם... בלי לפחד.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-2-07',
      character: 'noa',
      text: 'צוות ריפוי! אני ורקס — במעבדת הקוד השבור. אני מרפאה, הוא מבדר.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-2-08',
      character: 'rex',
      text: 'מישהו צריך לשמור על המורל! ואם השחיתות תקרב — אני אזרוק עליה בדיחות עד שתברח! מה? אפשר לנצח בהומור!',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch6-2-09',
      character: 'mika',
      text: 'צוות פריצה. אני וצל — בליבת השרת המושחת. אנחנו נפרוץ את ההגנות שלו מבפנים.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-2-10',
      character: 'shadow',
      text: 'מתגנבים. בשקט. הצללים הם הדרך.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'mischievous',
    },
    {
      id: 'ch6-2-11',
      character: 'storm',
      text: 'צוות הגנה חיצונית. אני ובלייז — שומרים על הגבולות. שהשחיתות לא תתפשט בזמן שאתם בפנים.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-2-12',
      character: 'pixel',
      text: 'צוות ניתוח. אני ופיקסל... אני. לבד. סורק, ממפה, מתאם בין כל הצוותים. יעילות: 100%. אבל... הלוואי שגליץ\' הייתה כאן.',
      type: 'dialog',
      mood: 'sad',
      expression: 'thinking',
    },
    {
      id: 'ch6-2-13',
      character: 'ki',
      text: 'ואני ואבא — צוות שישי. אנחנו יורדים. לעומק הקוד. למצוא את מאסטר ביט.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      choices: [
        {
          id: 'ch6-2-choice-together',
          text: '!שישה צוותים, לב אחד. יאללה',
          relationshipEffect: { character: 'phantom', delta: 5 },
        },
        {
          id: 'ch6-2-choice-careful',
          text: 'אספו כל שבר. כל אחד חשוב. אני מרגיש שזה יותר ממה שאנחנו חושבים',
          relationshipEffect: { character: 'mika', delta: 5 },
        },
      ],
    },
  ],
}

/**
 * 6.3 — The teams find the fragments (they don't know what they are)
 * Each team reports finding glowing code fragments in Glitch's colors.
 * Nobody connects the dots yet. Emotional vignettes from each team.
 */
export const CHAPTER_6_3_FRAGMENTS_FOUND: DialogStoryBeat = {
  id: 'ch6-3-fragments-found',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-35' },
  lines: [
    {
      id: 'ch6-3-01',
      character: 'yuki',
      text: 'קי, דיווח מיער הנתונים! מצאנו שבר קוד מהבהב. ורוד וירוק. הוא... חם למגע. וברק אומר שהוא שמע אותו שר.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch6-3-02',
      character: 'barak',
      text: 'לא שר! רוטט! בתדר של... לא יודע. זה מרגיש חי.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch6-3-03',
      character: 'kai',
      text: 'גם בארכיון — מצאנו שבר דומה. לונה ציירה אותו. הוא... יפה. עצוב ויפה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch6-3-04',
      character: 'luna',
      text: 'הצבעים שלו... מוכרים. ציירתי אותם פעם. בציור שלא הראיתי לאף אחד.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch6-3-05',
      character: 'noa',
      text: 'רקס ואני מצאנו שבר במעבדה! כשנגעתי בו — הרגשתי... הרגשתי מישהי. כמו נשמה קטנה שמחפשת את הדרך הביתה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch6-3-06',
      character: 'rex',
      text: 'גם אני הרגשתי! ורציתי לספר בדיחה, אבל... השבר הזה שיתק אותי. בפעם השנייה בחיים שאין לי מילים.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch6-3-07',
      character: 'mika',
      text: 'צל ואני מצאנו שניים. בליבת השרת. הם... זוהרים בצבעים שלה. קי — השברים האלה. הם... שלה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch6-3-08',
      character: 'shadow',
      text: 'גליץ\'.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch6-3-09',
      character: 'pixel',
      text: 'סורק את כל השברים... חתימת קוד זהה. כולם: גליץ\'. 6 שברים. 6 צוותים. אם נחבר אותם — 23% מהקוד המקורי שלה. זה בדיוק מה שנשאר כשהתפוצצה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-3-10',
      character: 'mika',
      text: 'היא שלחה את עצמה... אלינו? כל שבר הגיע לצוות אחר. כאילו היא ידעה. כאילו היא בחרה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
      duration: 3000,
    },
  ],
}

/**
 * 6.4 — Ki and Phantom descend to the Deep Code
 * Father and son journey through ancient digital layers.
 * Raz finally opens up. Emotional reunion unfolds.
 */
export const CHAPTER_6_4_DEEP_CODE: DialogStoryBeat = {
  id: 'ch6-4-deep-code',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-36' },
  lines: [
    {
      id: 'ch6-4-01',
      character: 'ki',
      text: 'המקום הזה... אין פה ממשק. אין מסכים. רק... קוד גולמי. שורות אינסופיות של אותיות שזורמות כמו נהר.',
      type: 'narration',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch6-4-02',
      character: 'phantom',
      text: 'זה עומק הקוד. המקום שממנו הכל מתחיל. כל מקש שנלחץ אי פעם — מגיע לכאן.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch6-4-03',
      character: 'ki',
      text: 'אבא... למה עזבת? למה השארת את אמא ואותי? למה רק כיסא ריק עם שם חרוט?',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch6-4-04',
      character: 'phantom',
      text: 'כי ראיתי מה מתקרב. השחיתות. ראיתי אותה עוד לפני שנולדת. ירדתי לכאן לחפש תשובות... ונתקעתי. שנים. לבד.',
      type: 'dialog',
      mood: 'sad',
      expression: 'concerned',
    },
    {
      id: 'ch6-4-05',
      character: 'ki',
      text: 'שנים? אבא... אתה חי פה למטה? כל הזמן?',
      type: 'dialog',
      mood: 'sad',
      expression: 'surprised',
    },
    {
      id: 'ch6-4-06',
      character: 'phantom',
      text: 'הזמן עובד אחרת כאן. יום למעלה — שבוע למטה. אבל כל רגע — חשבתי עליך. על שיר. עלייך.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch6-4-07',
      character: 'ki',
      text: 'אמא... שיר. היא תמיד אמרה "אבא שלך גיבור." לא הבנתי. עכשיו... עכשיו אני מבין.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch6-4-08',
      character: 'phantom',
      text: 'קי. אני רואה אותך. את המנהיג שהפכת. את הצוות שבנית. את הלב שלך. לא הייתי שם בשבילך — אבל אתה גדלת לבד למשהו שאני אף פעם לא הייתי.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-4-09',
      character: 'ki',
      text: 'לא לבד. היה לי סנסאי. חברים. אמא. אבל... חסרת לי, אבא.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch6-4-10',
      character: 'phantom',
      text: 'אני כאן עכשיו. ולא הולך לשום מקום. בוא — הוא מחכה לנו.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      duration: 3000,
    },
  ],
}

/**
 * 6.5 — Meeting Master Beat
 * A transcendent being, partly digital, partly physical.
 * He speaks in ancient riddles and reveals the origin of the typing arts.
 */
export const CHAPTER_6_5_MASTER_BEAT: DialogStoryBeat = {
  id: 'ch6-5-master-beat',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-37' },
  lines: [
    {
      id: 'ch6-5-01',
      character: 'ki',
      text: 'מה... מה אני רואה? ישות. לא אדם, לא קוד. משהו ביניהם. הוא זוהר — אותיות זורמות דרכו כמו דם.',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
    },
    {
      id: 'ch6-5-02',
      character: 'senseiZen',
      text: 'מאסטר ביט... המורה שלי. המורה של כולנו. חשבתי שהלכת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'surprised',
    },
    {
      id: 'ch6-5-03',
      character: 'ki',
      text: 'סנסאי?! גם אתה פה? איך—',
      type: 'dialog',
      mood: 'happy',
      expression: 'surprised',
    },
    {
      id: 'ch6-5-04',
      character: 'senseiZen',
      text: 'הרגשתי שהגיע הזמן. ירדתי אחריכם. צב זקן עדיין יודע ללכת, גם אם לאט.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-5-05',
      character: 'ki',
      text: 'מאסטר ביט פותח את פיו. הקול שלו — לא קול. הוא רטט. קוד שהופך למילים. המילים מהדהדות בתוך הראש.',
      type: 'narration',
      mood: 'epic',
      expression: 'thinking',
      duration: 2000,
    },
    {
      id: 'ch6-5-06',
      character: 'senseiZen',
      text: 'הוא אומר: "בהתחלה היה המקש. ובסוף יהיה המקש. בין לבין — הכל."',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-5-07',
      character: 'phantom',
      text: 'הוא מדבר דרך הקוד. סנסאי הוא היחיד שמבין ישירות.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'idle',
    },
    {
      id: 'ch6-5-08',
      character: 'senseiZen',
      text: 'הוא מלמד: אומנות ההקלדה — היא לא רק אצבעות על מקשים. היא החיבור בין ידיים אנושיות לקוד דיגיטלי. הגשר בין שני עולמות. כשהגשר הזה שלם — אף שחיתות לא יכולה לעבור.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
      duration: 4000,
    },
    {
      id: 'ch6-5-09',
      character: 'ki',
      text: 'אז... אם כולנו מקלידים יחד? אם כל אחד מביא את הכישרון שלו? מהירות, דיוק, קיצורים, יצירתיות, ריפוי—',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-5-10',
      character: 'senseiZen',
      text: 'מאסטר ביט מחייך. פעם ראשונה. הוא אומר: "הגשר בנוי מאבנים שונות. רק כשכולן במקום — הוא עומד."',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-5-11',
      character: 'ki',
      text: 'אבנים שונות... כמו שברים שונים... סנסאי! השברים! שברי גליץ\'! הם לא סתם קוד — הם חלק מהגשר!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
      choices: [
        {
          id: 'ch6-5-choice-rush',
          text: '!חייבים לחזור! לאסוף את כל השברים ולחבר אותה',
          relationshipEffect: { character: 'glitch', delta: 10 },
        },
        {
          id: 'ch6-5-choice-learn',
          text: 'מאסטר ביט, תלמד אותנו איך. כמה זמן יש לנו?',
          relationshipEffect: { character: 'senseiZen', delta: 5 },
        },
      ],
    },
  ],
}

/**
 * 6.6 — The Reassembly: Glitch comes back
 * ALL characters bring their fragments together.
 * 6 versions merge. Mika leads the reassembly with her voice.
 * THE MOST EMOTIONAL MOMENT of the entire series.
 */
export const CHAPTER_6_6_GLITCH_REASSEMBLY: DialogStoryBeat = {
  id: 'ch6-6-glitch-reassembly',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch6-6-01',
      character: 'ki',
      text: 'שישה שברים. שישה צוותים. כולנו חוזרים למרכז. השחיתות סוגרת עלינו מכל כיוון. אם זה לא יעבוד—',
      type: 'narration',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch6-6-02',
      character: 'pixel',
      text: 'חישוב... 6 שברים. חתימות קוד: מבולבלת, מתגבשת, ניטרלית, מושחתת, שבורה, שלמה. שש גרסאות של אותה נשמה. סיכוי הצלחת חיבור: 11.4%.',
      type: 'dialog',
      mood: 'tense',
      expression: 'thinking',
    },
    {
      id: 'ch6-6-03',
      character: 'mika',
      text: '11 אחוז? לא אכפת לי אם זה אחוז אחד. אחוז אפס. אני מחברת אותה בחזרה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-6-04',
      character: 'pixel',
      text: 'מיקה... "לא אכפת לי מהמספרים" — זה המשפט הכי לא הגיוני שהרובוט הזה שמע. וגם... הכי אמיץ.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-6-05',
      character: 'ki',
      text: 'כל צוות — שימו את השבר שלכם במרכז. יוקי וברק, קאי ולונה, נועה ורקס, מיקה וצל, סערה ובלייז, פיקסל. כולם.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-6-06',
      character: 'ki',
      text: 'ששת השברים צפים באוויר. מסתובבים לאט. מתקרבים. אור ורוד וירוק מתחיל למלא את החלל. האוויר רוטט.',
      type: 'narration',
      mood: 'epic',
      expression: 'surprised',
      duration: 3000,
    },
    {
      id: 'ch6-6-07',
      character: 'mika',
      text: 'גליץ\'... אני פה. אנחנו כולנו פה. את זוכרת מה כתבת? "יום אחד נבנה ביחד משהו שישנה את העולם." היום זה היום. חזרי.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
      duration: 4000,
    },
    {
      id: 'ch6-6-08',
      character: 'noa',
      text: 'אני מרגישה אותה! הריפוי... הוא עובד! השברים מתחילים להתחבר!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-6-09',
      character: 'rex',
      text: 'חברה... אני בוכה? למה אני בוכה? דינוזאורים לא בוכים!',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'sad',
    },
    {
      id: 'ch6-6-10',
      character: 'ki',
      text: 'האור מתגבר. הרעש — לא רעש. מוזיקה. כל שבר שמתחבר — צליל. שישה צלילים שהופכים לאקורד. והצורה — הצורה שלה. היא חוזרת.',
      type: 'narration',
      mood: 'epic',
      expression: 'excited',
      duration: 5000,
    },
    {
      id: 'ch6-6-11',
      character: 'glitch',
      text: 'אני... כאן.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
      duration: 4000,
    },
    {
      id: 'ch6-6-12',
      character: 'mika',
      text: 'גליץ\'... את... את לא מגמגמת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'surprised',
    },
    {
      id: 'ch6-6-13',
      character: 'glitch',
      text: 'אני שלמה. לראשונה בחיים — כל החלקים שלי במקום. המבולבלת, המתגבשת, הניטרלית, המושחתת, השבורה... וגם — השלמה. כולן אני. כולן תמיד היו אני.',
      type: 'dialog',
      mood: 'epic',
      expression: 'happy',
      duration: 5000,
    },
    {
      id: 'ch6-6-14',
      character: 'mika',
      text: 'מיקה רצה. מיקה חובקת את גליץ\'. לא מילים. רק דמעות. שתיהן בוכות. הצוות מסביב. שקט. השקט הכי יפה בעולם.',
      type: 'narration',
      mood: 'heartwarming',
      expression: 'happy',
      duration: 5000,
    },
    {
      id: 'ch6-6-15',
      character: 'glitch',
      text: 'מיקה... תודה. על שלא ויתרת. כשכל העולם ויתר — את האמנת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-6-16',
      character: 'pixel',
      text: 'מעדכן מאגר נתונים... "שמחה" = הרגע הזה. סוף סוף... מבין מה זה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
      duration: 3000,
    },
  ],
}

/**
 * 6.7 — The Corruption's final assault
 * The Corruption senses Glitch's return and launches a massive attack.
 * All seems lost. Every system failing.
 */
export const CHAPTER_6_7_FINAL_ASSAULT: DialogStoryBeat = {
  id: 'ch6-7-final-assault',
  trigger: { type: 'lesson-complete', lessonId: 'lesson-38' },
  lines: [
    {
      id: 'ch6-7-01',
      character: 'ki',
      text: 'לא — המסכים! הכל אדום! השחיתות מרגישה שגליץ\' חזרה — והיא משתוללת!',
      type: 'narration',
      mood: 'tense',
      expression: 'surprised',
    },
    {
      id: 'ch6-7-02',
      character: 'pixel',
      text: 'שחיתות ב-89%! הדוג\'ו — נפגע! ביער הנתונים — נפל! הארכיון — מושחת! אנחנו מפסידים!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch6-7-03',
      character: 'storm',
      text: 'הגבולות לא מחזיקים! בלייז, אנחנו צריכים לסגת!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch6-7-04',
      character: 'blaze',
      text: 'הלהבה שלי — היא נכבית. בפעם הראשונה... קר.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch6-7-05',
      character: 'kai',
      text: 'אני לא יכול להגן! יותר מדי! מכל כיוון!',
      type: 'dialog',
      mood: 'tense',
      expression: 'concerned',
    },
    {
      id: 'ch6-7-06',
      character: 'senseiZen',
      text: 'ילדים... אני... לא בטוח שיש מספיק זמן. החוכמה שלי — לא מספיקה.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch6-7-07',
      character: 'yuki',
      text: 'גם המהירות שלי לא עוזרת. אני מהירה — אבל השחיתות מהירה יותר.',
      type: 'dialog',
      mood: 'sad',
      expression: 'sad',
    },
    {
      id: 'ch6-7-08',
      character: 'mika',
      text: 'לא. לא ככה זה נגמר. אחרי הכל? אחרי שהחזרנו אותה? לא!',
      type: 'dialog',
      mood: 'epic',
      expression: 'concerned',
    },
    {
      id: 'ch6-7-09',
      character: 'ki',
      text: 'מה מאסטר ביט אמר? "הגשר בנוי מאבנים שונות." אנחנו לא צריכים להיות מהירים יותר, חזקים יותר, או חכמים יותר. אנחנו צריכים להיות... ביחד.',
      type: 'dialog',
      mood: 'epic',
      expression: 'thinking',
    },
    {
      id: 'ch6-7-10',
      character: 'rex',
      text: 'נשמע כמו הרגע שבו אומרים "כל אחד עושה את הדבר שלו." אני בפנים. גם אם הדבר שלי זה בדיחות.',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
  ],
}

/**
 * 6.8 — The Final Battle: Every character, every skill
 * Ki leads the charge. Each character uses their UNIQUE typing skill.
 * The Bridge between human and digital is built — keystroke by keystroke.
 */
export const CHAPTER_6_8_FINAL_BATTLE: DialogStoryBeat = {
  id: 'ch6-8-final-battle',
  trigger: { type: 'battle-result', result: 'win' },
  lines: [
    {
      id: 'ch6-8-01',
      character: 'ki',
      text: 'עכשיו! כולם — כל אחד את הכוח שלו! יוקי — מהירות! קאי — דיוק! מיקה — קיצורים! לונה — יצירתיות! נועה — ריפוי! רקס — אומץ! פיקסל — ניתוח! צל — התגנבות! סערה וברק — ברקים! בלייז — אש!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-8-02',
      character: 'yuki',
      text: '90 מילים לדקה! שיא חדש! ברק, תדביק!',
      type: 'dialog',
      mood: 'epic',
      expression: 'cheering',
    },
    {
      id: 'ch6-8-03',
      character: 'barak',
      text: '92! לא מפסיק! ביחד — אנחנו ברק אמיתי!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-8-04',
      character: 'mika',
      text: 'Ctrl+Alt+Shift+Delete — פורצת את ליבת השחיתות! גליץ\', יחד?!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-8-05',
      character: 'glitch',
      text: 'יחד. אני יודעת את הקוד שלו מבפנים — כי הייתי חלק ממנו. ועכשיו אני יודעת איפה הלב שלו.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'ch6-8-06',
      character: 'noa',
      text: 'מרפאה! כל אות מדויקת שאנחנו מקלידים — שורת קוד נקייה חוזרת! המילים מחזירות את העולם!',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-8-07',
      character: 'shadow',
      text: 'עוקף מאחור. נכנס דרך הצללים. פוגע בשורש. הצל תמיד מגיע ראשון.',
      type: 'dialog',
      mood: 'epic',
      expression: 'mischievous',
    },
    {
      id: 'ch6-8-08',
      character: 'luna',
      text: 'ואני — ציור! כל ציור ASCII שלי נהיה מגן! הציורים שפחדתי להראות — הם המגן הכי חזק!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-8-09',
      character: 'rex',
      text: '"מה ההבדל בין וירוס לבדיחה? מהבדיחה צוחקים! Delete!" — קבל, שחיתות!',
      type: 'dialog',
      mood: 'funny',
      expression: 'happy',
    },
    {
      id: 'ch6-8-10',
      character: 'phantom',
      text: 'גאה בך, בני.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-8-11',
      character: 'ki',
      text: 'הגשר! אני רואה אותו! כל מקש שאנחנו לוחצים — אבן חדשה! הגשר בין העולם האנושי לדיגיטלי — הוא נבנה! מקש אחרי מקש!',
      type: 'narration',
      mood: 'epic',
      expression: 'excited',
      duration: 4000,
    },
    {
      id: 'ch6-8-12',
      character: 'senseiZen',
      text: 'מאסטר ביט הפך לאור. האור נכנס לגשר. לגשר נכנסת ההקלדה של כולם. נינג\'ות — הקלידו! המילה האחרונה — ביחד!',
      type: 'dialog',
      mood: 'epic',
      expression: 'excited',
    },
    {
      id: 'ch6-8-13',
      character: 'ki',
      text: 'אור לבן. חזק. כל השחיתות — נעלמת. כמו חלום רע שנמוג עם השמש. וכולנו עומדים. ביחד. שלמים.',
      type: 'narration',
      mood: 'epic',
      expression: 'happy',
      duration: 5000,
    },
  ],
}

/**
 * 6.9 — Peace: New dojos, growth, and belonging
 * The aftermath. Characters reflect on who they've become.
 * Each has found their place.
 */
export const CHAPTER_6_9_PEACE: DialogStoryBeat = {
  id: 'ch6-9-peace',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch6-9-01',
      character: 'ki',
      text: 'שלושה חודשים אחרי המלחמה. העולם הדיגיטלי שוקם. דוג\'ואים חדשים נפתחים בכל מקום.',
      type: 'narration',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-02',
      character: 'senseiZen',
      text: 'הדוג\'ו מלא תלמידים חדשים. ורז... רז חזר הביתה. לקי. לשיר. גם צבים זקנים מחייכים לפעמים.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-03',
      character: 'mika',
      text: 'גליץ\' ואני פתחנו מעבדת סייבר משותפת. הפרויקט הראשון? מערכת הגנה לכל הדוג\'ואים. הקוד הראשון שכתבנו יחד — היה ב-Ctrl+S.',
      type: 'dialog',
      mood: 'happy',
      expression: 'happy',
    },
    {
      id: 'ch6-9-04',
      character: 'glitch',
      text: 'אני עדיין גליץ\'. עדיין קצת תקלה. אבל עכשיו — תקלה שבוחרת את עצמה. ויש לי חברים שלא ויתרו עליי, גם כשוויתרתי על עצמי.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-05',
      character: 'yuki',
      text: 'ברק ואני פתחנו אקדמיית מהירות. הוא מלמד ספיד, אני מלמדת זרימה. ואנחנו עדיין מתחרים — כל יום.',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch6-9-06',
      character: 'luna',
      text: 'פתחתי גלריה. אומנות ASCII לכולם. בלי לפחד. הציורים שלי הצילו חיים — למה שאסתיר אותם?',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-07',
      character: 'kai',
      text: 'אני מלמד ילדים חדשים. ילדים ביישנים. כמוני. ואומר להם את מה שקי אמר לי: "אתה לא לבד."',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-08',
      character: 'noa',
      text: 'בית מרפא דיגיטלי. כל קוד שנשבר — אני שם. הידיים שלי יודעות לרפא. זה מה שאני.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-09',
      character: 'rex',
      text: 'והמשחק שלי? נגמר! משחק הקלדה מצחיק שעזר לעשרות ילדים להתחיל. מסתבר שידיים קטנות בונות דברים גדולים!',
      type: 'dialog',
      mood: 'happy',
      expression: 'excited',
    },
    {
      id: 'ch6-9-10',
      character: 'pixel',
      text: 'מעדכן לוג סופי: "שמחה" = שוקולד + ניצחון + חברים + גליץ\' שחוזרת + רקס שבוכה + סנסאי שמחייך. מסקנה: הנתונים לא באמת חשובים. האנשים — כן.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-11',
      character: 'shadow',
      text: 'הצל מוצא את מקומו. ליד האור.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-9-12',
      character: 'blaze',
      text: 'הלהבה חזרה. גדולה יותר. חמה יותר. עכשיו היא לא שורפת — היא מחממת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
  ],
}

/**
 * 6.10 — The Final Whisper: Master Beat's secret
 * Ki stands at the rebuilt dojo. Everything is peaceful.
 * Master Beat's voice echoes one last time — a cliffhanger for the future.
 */
export const CHAPTER_6_10_FINAL_WHISPER: DialogStoryBeat = {
  id: 'ch6-10-final-whisper',
  trigger: { type: 'manual' },
  lines: [
    {
      id: 'ch6-10-01',
      character: 'ki',
      text: 'הדוג\'ו שוקט. ערב. אור כתום על המקלדת. אותה מקלדת שזהרה ביום הראשון.',
      type: 'narration',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-10-02',
      character: 'phantom',
      text: 'קי. בוא שב לידי רגע.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'idle',
    },
    {
      id: 'ch6-10-03',
      character: 'ki',
      text: 'אבא.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-10-04',
      character: 'phantom',
      text: 'אני גאה בך. לא כי ניצחת. אלא כי לא ויתרת על אף אחד. ובזה — אתה הרבה יותר ממני.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-10-05',
      character: 'senseiZen',
      text: 'הנינג\'ה הצעיר שנכנס מהדלת — הפך למנהיג. הנהר הגיע לים. אבל הים... הוא רק ההתחלה.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'ch6-10-06',
      character: 'ki',
      text: 'סנסאי... מה מאסטר ביט לחש לך? לפני שנעלם? ראיתי שהוא אמר לך משהו.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
    },
    {
      id: 'ch6-10-07',
      character: 'senseiZen',
      text: '...הוא אמר שעומק הקוד — הוא רק השכבה הראשונה. שמתחת לשכבה הראשונה יש... עולם. עולם שלם. קוד עתיק שקדם לכל מה שאנחנו מכירים.',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'thinking',
      duration: 3000,
    },
    {
      id: 'ch6-10-08',
      character: 'ki',
      text: 'עולם שלם...? מתחת לעומק הקוד?',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'ch6-10-09',
      character: 'senseiZen',
      text: 'והוא אמר עוד דבר. "הגשר שבניתם — פתח דלת. דלת שלא נפתחה אלף שנים. ומה שמאחוריה... מחכה."',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'concerned',
      duration: 4000,
    },
    {
      id: 'ch6-10-10',
      character: 'ki',
      text: 'המקלדת מתחילה לזהור שוב. אותו אור כחול מהיום הראשון. אבל הפעם — צבע חדש מעורבב בתוכו. זהב. עתיק. עמוק. ואני מחייך. כי אני יודע — ההרפתקה הבאה כבר מתחילה.',
      type: 'narration',
      mood: 'epic',
      expression: 'excited',
      duration: 5000,
    },
  ],
}

// ---------------------------------------------------------------------------
// Chapter 6 — All beats in order
// ---------------------------------------------------------------------------
export const CHAPTER_6_BEATS: DialogStoryBeat[] = [
  CHAPTER_6_1_CORRUPTION_SPREADS,
  CHAPTER_6_2_SIX_TEAMS,
  CHAPTER_6_3_FRAGMENTS_FOUND,
  CHAPTER_6_4_DEEP_CODE,
  CHAPTER_6_5_MASTER_BEAT,
  CHAPTER_6_6_GLITCH_REASSEMBLY,
  CHAPTER_6_7_FINAL_ASSAULT,
  CHAPTER_6_8_FINAL_BATTLE,
  CHAPTER_6_9_PEACE,
  CHAPTER_6_10_FINAL_WHISPER,
]
