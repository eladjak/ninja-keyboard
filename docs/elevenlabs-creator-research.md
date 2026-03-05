# מחקר ElevenLabs Creator Tier - קולות עברית לנינג'ה מקלדת

**תאריך המחקר:** מרץ 2026
**מטרה:** מיצוי יכולות Creator tier לאיכות מרבית של קולות עברית

---

## תוכן עניינים

1. [Creator Tier - סיכום כל היכולות](#1-creator-tier---סיכום-כל-היכולות)
2. [המודלים - מה הכי טוב לעברית](#2-המודלים---מה-הכי-טוב-לעברית)
3. [Voice Cloning - שיבוט קול לעברית](#3-voice-cloning---שיבוט-קול-לעברית)
4. [Voice Design - יצירת קול מתיאור טקסט](#4-voice-design---יצירת-קול-מתיאור-טקסט)
5. [Voice Library - ספריית קולות קהילה](#5-voice-library---ספריית-קולות-קהילה)
6. [Sound Effects Generation - יצירת אפקטי סאונד](#6-sound-effects-generation---יצירת-אפקטי-סאונד)
7. [Studio (Projects) - פרויקטים ארוכי-טווח](#7-studio-projects---פרויקטים-ארוכי-טווח)
8. [API - גבולות ופרמטרים](#8-api---גבולות-ופרמטרים)
9. [תוכנית מעשית - איך להשיג קולות עברית מושלמים](#9-תוכנית-מעשית---איך-להשיג-קולות-עברית-מושלמים)
10. [המלצות קוד - API calls לנינג'ה מקלדת](#10-המלצות-קוד---api-calls-לנינג'ה-מקלדת)

---

## 1. Creator Tier - סיכום כל היכולות

### מחיר ותנאים
- **מחיר:** $22/חודש (החודש הראשון $11)
- **קרדיטים:** 100,000 characters/חודש
- **Rollover:** קרדיטים לא-משומשים נשמרים עד 2 חודשים (כל עוד המנוי פעיל)
- **License:** Commercial license מלא

### יכולות עיקריות

| יכולת | Creator Tier | הערה |
|-------|-------------|------|
| **Custom Voices (Slots)** | 30 קולות | ניתן להגדיל בתשלום |
| **Instant Voice Cloning (IVC)** | כלול | מ-1 דקה אודיו |
| **Professional Voice Cloning (PVC)** | 1 PVC slot | עברית נתמכת |
| **Voice Design** | כלול | 3 תצוגות מקדימות לכל prompt |
| **Voice Library** | גישה מלאה | 10,000+ קולות קהילה |
| **Sound Effects API** | כלול | עד 30 שניות לאפקט |
| **Studio (Projects)** | כלול | לאודיו ארוך-טווח |
| **API Access** | כלול | עם rate limits |
| **Concurrent Requests** | 5 בו-זמנית | |
| **Max per request** | 5,000 תווים | |
| **Overage** | $0.30 לאלף תווים | |

---

## 2. המודלים - מה הכי טוב לעברית

### השוואת מודלים - **eleven_v3 הוא הבחירה לעברית**

| Model ID | שפות | עברית | שימוש מומלץ | זמן תגובה |
|----------|------|-------|------------|-----------|
| `eleven_v3` | 70+ שפות | **כן, מלא** | הכי טוב לקולות דמויות, אקספרסיביות | ~1-2 שניות |
| `eleven_multilingual_v2` | 29 שפות | **לא רשמי** | אודיוספרים, וויסאובר ארוך | 1-2 שניות |
| `eleven_turbo_v2_5` | 32 שפות | **לא** | שיחות real-time | ~250-300ms |
| `eleven_flash_v2_5` | 32 שפות | **לא** | real-time בלבד | ~75ms |

### מסקנה קריטית לנינג'ה מקלדת
- **`eleven_v3` = הבחירה היחידה לעברית** - זה המודל היחיד שעברית נתמכת בו רשמית
- eleven_multilingual_v2 תומך ב-29 שפות אך עברית לא ברשימה הרשמית
- Turbo + Flash מהירים מאוד אבל **לא** תומכים בעברית

### Audio Tags ב-eleven_v3
יכולת ייחודית שאין במודלים אחרים - שליטה בהבעה רגשית:

```text
[excited] בואו נתחיל!
[whispers] זה סוד...
[sighs] אה...
[laughs] הה-הה!
[curious] מה זה אומר?
[nervous] אני... לא בטוח...
```

**חשוב:** Audio tags עובדים עם עברית ב-`eleven_v3`! אפשר לכתוב:
```text
[excited] כל הכבוד! הכית את השיא שלך!
[encourages] אל תוותר, אתה יכול!
[whispers] תשמע... יש לי סוד...
```

---

## 3. Voice Cloning - שיבוט קול לעברית

### שני סוגי Voice Cloning

#### A. Instant Voice Cloning (IVC) - המהיר והפשוט
- **זמינות:** Creator tier כלול
- **אודיו נדרש:** מינימום 10 שניות, מומלץ 1-2 דקות נקיות
- **יותר מ-2-3 דקות** - לא מוסיף ואף יכול לפגוע ביציבות
- **שפה:** מומלץ להקליט בעברית אם הקלון ישמש לעברית
- **איכות:** טובה, מהירה לייצור

**מתי להשתמש ב-IVC לנינג'ה מקלדת:**
- ליצירת קול של סנסאי זן בעברית ילדים
- ליצירת קול Ki המסקרן
- כשרוצים מהירות ולא שלמות

#### B. Professional Voice Cloning (PVC) - האיכותי ביותר
- **זמינות:** Creator tier = 1 PVC slot
- **אודיו נדרש:** מינימום 30 דקות, **מומלץ 2-3 שעות**
- **שפה:** עברית נתמכת מלאה (Flash v2.5 + Turbo v2.5 models)
- **תהליך:** verification + fine-tuning + שמירה כקול פרטי
- **איכות:** "כמעט לא ניתן להבחין מהקול המקורי"

**הגבלה חשובה:**
PVC לא עובד טוב עם `eleven_v3` כרגע! האיכות נמוכה יותר עם v3.
כדי להשתמש ב-PVC + עברית, צריך IVC לצורך v3, או להשתמש ב-PVC עם multilingual_v2.

---

## 4. Voice Design - יצירת קול מתיאור טקסט

### איך זה עובד
1. כותבים תיאור בין 20-1000 תווים
2. כותבים דוגמת טקסט להשמעה (100-1000 תווים)
3. המערכת מייצרת **3 גרסאות שונות** של הקול
4. בוחרים אחת - תופסת slot אחד
5. שתי הגרסאות הדחויות נמחקות ללא עלות

### Voice Design v3 - יכולות מתקדמות
- מקבל תיאורים מורכבים: גיל, מגדר, אקצנט, קצב, רגש, סגנון
- AI מרחיב את הפרומפט אוטומטית (auto_enhance)
- שליטה ב-"creativity" - כמה חופשי ה-AI לפרש

### דוגמאות פרומפט לנינג'ה מקלדת

**Ki - גיבור ראשי (ילד ישראלי, 10 שנים):**
```
Young Israeli boy, 10 years old, energetic and brave.
Israeli Hebrew accent, fast-paced speech, enthusiastic.
Heroic tone, like a young anime hero. Perfect audio quality.
Natural child voice, not too high-pitched.
```

**סנסאי זן (מורה מבוגר, חכם):**
```
Older Israeli male, wise and calm teacher. Deep, gentle voice.
Slow paced, thoughtful. Israeli Hebrew accent.
Like a patient grandfather teaching with warmth.
Perfect audio quality, warm timbre.
```

**Yuki (ילדה, מהירה כרוח):**
```
Young Israeli girl, 9 years old, quick and playful.
High-pitched, excited, giggly. Israeli Hebrew accent.
Fast speaker, full of energy. Like a playful wind spirit.
Perfect audio quality.
```

**Luna (ילדה, מסתורית ונבונה):**
```
Israeli girl, 11 years old, mysterious and wise.
Calm, measured speech. Israeli Hebrew accent.
Low for her age, slightly breathy. Like a young wizard.
Perfect audio quality.
```

**Mika (מניפולטיבית, מתגנדרת):**
```
Israeli girl, 10 years old, sassy and confident.
Slightly condescending, smooth talker. Israeli Hebrew accent.
Medium pace, emphasis on sarcastic words.
Perfect audio quality, clear articulation.
```

### API endpoint לVoice Design
```
POST /v1/text-to-voice/create-previews
```
```json
{
  "voice_description": "Young Israeli boy, 10 years old...",
  "text": "שלום! אני קי, הלוחם הנינג'ה שילמד אותך לכתוב מהר!",
  "auto_generate_text": false
}
```

---

## 5. Voice Library - ספריית קולות קהילה

### מה זה Voice Library
- 10,000+ קולות משותפים על ידי משתמשי ElevenLabs
- ניתן לסנן לפי שפה, מין, גיל, קטגוריה
- קולות "native Hebrew" - הוקלטו עם דוברי עברית מקוריים

### איך לחפש קולות עברית
1. נכנסים ל: elevenlabs.io/voice-library
2. סינון Language → Hebrew
3. סינון Age → Young Adult / Child (לדמויות ילדים)
4. סינון Gender לפי הצורך
5. מוסיפים ל-My Voices (תופס slot)

### קולות מומלצים לחפש
- חפשו tags: `hebrew`, `israeli`, `child`, `youthful`
- בדקו גם: school-boy, school-girl Israeli
- קולות "native" תמיד עדיפים על קולות שהמודל "מתרגם"

### URL לחיפוש
```
https://elevenlabs.io/voice-library?language=hebrew
https://elevenlabs.io/voice-library/school-boy  (ילד בגיל בית ספר)
https://elevenlabs.io/voice-library/youthful    (קולות צעירים)
```

---

## 6. Sound Effects Generation - יצירת אפקטי סאונד

### יכולות ה-SFX API

| פרמטר | ערך |
|-------|-----|
| **משך מקסימלי** | 30 שניות |
| **פורמטים** | MP3, WAV |
| **איכות** | 48kHz |
| **Loops** | תמיכה בלולאות חלקות (v2) |
| **רוייאלטי** | ללא - כל הצלילים חופשיים לשימוש מסחרי |

### API Endpoint
```
POST /v1/sound-generation
```
```json
{
  "text": "Sword slash whoosh fast action",
  "duration_seconds": 1.5,
  "prompt_influence": 0.3,
  "output_format": "mp3_44100_128"
}
```

### רשימת אפקטים לנינג'ה מקלדת

**פעולות הקלדה:**
```
"satisfying keyboard click mechanical clicky"
"soft keyboard tap quiet typing"
"error buzzer short negative"
"success chime positive ding"
```

**גיימינג:**
```
"level up fanfare triumphant 8-bit style"
"coin collect mario style arcade"
"power up energetic whoosh"
"ninja sword slash whoosh"
"battle victory fanfare orchestral short"
"typing speed burst flurry of keys"
```

**ממשק:**
```
"button click UI soft"
"menu open slide whoosh"
"notification pop gentle"
"achievement unlock sparkle"
```

**קולות Ki:**
```
"young boy fighting grunt effort"
"anime character attack shout"
```

**ניצחון/הפסד:**
```
"crowd cheer short applause"
"game over sad trombone wah"
"perfect score triumphant fanfare"
```

### עלות SFX
כלול בקרדיטים של Creator tier (100k chars/month). SFX צורכים קרדיטים לפי משך הצליל.

---

## 7. Studio (Projects) - פרויקטים ארוכי-טווח

### מה זה Studio (לשעבר Projects)
- זמין לכל המשתמשים (כולל Free) מינואר 2025
- ממשק עריכה של אודיו ארוך-טווח
- הגדרת מספר דוברים לפרויקט
- ייצוא וכותרות

### שימוש לנינג'ה מקלדת
- יצירת אנימציות קוליות ארוכות לקמפיינים
- הכנת סיפורים-רקע לדמויות
- תסריטי onboarding ארוכים
- תוכן הדרכה ארוך

---

## 8. API - גבולות ופרמטרים

### Creator Tier API Limits

| פרמטר | ערך |
|-------|-----|
| Characters/month | 100,000 |
| Max per request | 5,000 תווים |
| Concurrent requests | 5 |
| Overage | $0.30 / 1,000 chars |

### Text-to-Speech API Call לעברית

```typescript
// API call מומלץ לנינג'ה מקלדת - עברית עם eleven_v3
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: "[excited] כל הכבוד! השגת שיא אישי חדש!",
      model_id: "eleven_v3",  // חובה לעברית
      voice_settings: {
        stability: 0.5,          // מאוזן - לא יותר מדי קבוע
        similarity_boost: 0.75,  // גבוה - שמירה על הקול המקורי
        style: 0.0,              // 0 = יציב יותר
        use_speaker_boost: true  // משפר בהירות
      },
      output_format: "mp3_44100_128"
    })
  }
)
```

### הגדרות Voice Settings מומלצות לעברית

| פרמטר | ערך | הסבר |
|-------|-----|------|
| `stability` | 0.4-0.6 | נמוך מדי = קפריזי, גבוה מדי = רובוטי |
| `similarity_boost` | 0.7-0.8 | שמירה על אופי הקול |
| `style` | 0.0 | 0 ליציבות, העלה רק לאקספרסיביות מיוחדת |
| `use_speaker_boost` | true | תמיד true לבהירות |

---

## 9. תוכנית מעשית - איך להשיג קולות עברית מושלמים

### שלב 1: Voice Design - יצירת קולות חדשים (שבוע ראשון)

**הפעולה:** צור קולות לכל 6 הדמויות הראשיות עם Voice Design v3

```
Ki      → Young Israeli boy, brave, 10 years old
Sensei  → Older Israeli male, wise, patient teacher
Yuki    → Young Israeli girl, fast, playful, 9 years old
Luna    → Israeli girl, mysterious, calm, 11 years old
Mika    → Israeli girl, sassy, confident, 10 years old
Rex     → Israeli boy, loud, sporty, competitive, 11 years old
```

**כמה לנסות:** לכל דמות - נסה 3-5 פעמים ובחר הכי טוב. כל ניסיון = 3 גרסאות.

**עלות:** מינימלית מהקרדיטים החודשיים

### שלב 2: Voice Library - חיפוש קולות קהילה (שבוע ראשון)

1. היכנסו ל-elevenlabs.io/voice-library
2. סינון: Language = Hebrew
3. חפשו: ילדים, נוער ישראלי, שדרנים עברית
4. הוסיפו 5-10 קולות מבטיחים ל-My Voices
5. בדקו אותם עם משפטים עבריים של הדמויות

### שלב 3: Instant Voice Cloning (IVC) - אם הצליל שלך מתאים

**מה צריך:**
- 1-2 דקות הקלטת אודיו נקייה (ללא רעשי רקע!)
- יש לדבר בעברית - אותה שפה שהקלון ישמש
- שמור על קול עקבי לאורך כל ההקלטה

**לנינג'ה מקלדת - הצע לאלעד:**
אם אתה (או ידוע בישראל) מוכן להקליט 1-2 דקות של קול ילד, אפשר ליצור IVC מיידי.

**הפורמט לפי ElevenLabs:**
- MP3, 192kbps ומעלה
- רמת שיא: -6dB עד -3dB
- ממוצע loudness: -18dB LUFS
- חדר שקט, ללא אקו

### שלב 4: Professional Voice Cloning (PVC) - לאיכות מקסימלית

**כדאי רק אם:**
- יש שחקן קול ישראלי (ילד או מבוגר) עם 30+ דקות הקלטה
- הדמות חשובה מאוד (Ki, Sensei)
- רוצים קול "קנוני" ב-100% לפרויקט

**מה צריך:**
- 30 דקות מינימום (3 שעות לאיכות מלאה)
- **הכל בעברית** - זה הקלון ישמש לעברית
- הקלטה מקצועית (לא חובה סטודיו, אבל חדר מדוד)
- Verification process של ElevenLabs

**הגבלה חשובה:** PVC לא עובד עם eleven_v3 כרגע. לשימוש ב-PVC + עברית:
- השתמש עם `eleven_multilingual_v2` (עברית עם PVC)
- או IVC לשימוש עם `eleven_v3`

### שלב 5: Audio Tags לאקספרסיביות מלאה

אחרי שיש קולות טובים, הוסף audio tags לתגובות שונות:

```typescript
// תגובת ניצחון
"[excited] וואו! כל הכבוד! שברת את השיא!"

// עידוד אחרי כישלון
"[gently, encourages] אל דאגה, בפעם הבאה תצליח!"

// הסבר שיעור
"[thoughtful] היום נלמד על מקשי החצים..."

// אתגר
"[challenges] האם תעז להיכנס לקרב נינג'ה?"

// סוד
"[whispers] שמעת? יש בסיס סמוי בשכבה 7..."
```

---

## 10. המלצות קוד - API calls לנינג'ה מקלדת

### מבנה Service מומלץ

```typescript
// src/lib/voice/elevenlabs-service.ts

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const BASE_URL = 'https://api.elevenlabs.io/v1'

// מודל לעברית - חובה eleven_v3
const HEBREW_MODEL = 'eleven_v3'

// הגדרות קול מומלצות לעברית
const HEBREW_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
}

export async function generateHebrewSpeech(
  text: string,
  voiceId: string,
  emotion?: string
): Promise<ArrayBuffer> {
  // הוסף audio tag אם יש emotion
  const processedText = emotion ? `[${emotion}] ${text}` : text

  const response = await fetch(
    `${BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: processedText,
        model_id: HEBREW_MODEL,
        voice_settings: HEBREW_VOICE_SETTINGS,
        output_format: 'mp3_44100_128',
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`)
  }

  return response.arrayBuffer()
}

// יצירת SFX
export async function generateSoundEffect(
  description: string,
  durationSeconds: number = 2.0
): Promise<ArrayBuffer> {
  const response = await fetch(`${BASE_URL}/sound-generation`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: description,
      duration_seconds: durationSeconds,
      prompt_influence: 0.3,
      output_format: 'mp3_44100_128',
    }),
  })

  return response.arrayBuffer()
}
```

### Voice IDs לדמויות (למלא אחרי Voice Design)

```typescript
// src/lib/voice/character-voices.ts

export const CHARACTER_VOICES = {
  ki: {
    voiceId: 'VOICE_ID_KI',           // למלא אחרי Voice Design
    description: 'Young Israeli boy, brave, 10 years old',
    defaultEmotion: 'excited',
  },
  sensei_zen: {
    voiceId: 'VOICE_ID_SENSEI',
    description: 'Wise older Israeli male, patient teacher',
    defaultEmotion: 'calm',
  },
  yuki: {
    voiceId: 'VOICE_ID_YUKI',
    description: 'Young Israeli girl, fast and playful',
    defaultEmotion: 'playful',
  },
  luna: {
    voiceId: 'VOICE_ID_LUNA',
    description: 'Israeli girl, mysterious and wise',
    defaultEmotion: 'thoughtful',
  },
  mika: {
    voiceId: 'VOICE_ID_MIKA',
    description: 'Israeli girl, sassy and confident',
    defaultEmotion: 'confident',
  },
} as const
```

---

## סיכום - המלצות עדיפות

### אסטרטגיה מומלצת לנינג'ה מקלדת

**מיידי (שבוע 1):**
1. צור קולות לכל 6 דמויות עם **Voice Design v3** - זה בחינם מהקרדיטים
2. נסה כל דמות 3-5 פעמים עם פרומפטים שונים
3. חפש קולות עברית ב-**Voice Library** כ-backup

**קצר טווח (חודש 1):**
4. בחר את ה-IVC הכי טוב ועשה **Instant Voice Clone** לקי + סנסאי
5. השתמש ב-**Audio Tags** לכל תגובות הדמויות
6. ייצר SFX game sounds עם **Sound Effects API**

**ארוך טווח (לפי צורך):**
7. אם יש שחקן קול ישראלי - **Professional Voice Clone** לקי הראשי
8. כוכב: קי = IVC/PVC של ילד ישראלי אמיתי + eleven_v3 = **קול עברית אותנטי מושלם**

### המודל הנכון: eleven_v3 (תמיד)
```
Hebrew content → model_id: "eleven_v3"  (חובה!)
Real-time → eleven_turbo_v2_5          (לא עברית, לדיאלוג מהיר עתידי)
PVC voices → eleven_multilingual_v2    (אם PVC, לא v3 עדיין)
```

---

## מקורות

- [ElevenLabs Pricing](https://elevenlabs.io/pricing)
- [ElevenLabs Models Documentation](https://elevenlabs.io/docs/overview/models)
- [Eleven v3 Blog Post](https://elevenlabs.io/blog/eleven-v3)
- [Instant Voice Cloning Documentation](https://elevenlabs.io/docs/creative-platform/voices/voice-cloning/instant-voice-cloning)
- [Professional Voice Cloning Documentation](https://elevenlabs.io/docs/creative-platform/voices/voice-cloning/professional-voice-cloning)
- [Voice Design Documentation](https://elevenlabs.io/docs/creative-platform/voices/voice-design)
- [Voice Design v3 Blog](https://elevenlabs.io/blog/voice-design-v3)
- [Sound Effects Documentation](https://elevenlabs.io/docs/overview/capabilities/sound-effects)
- [Hebrew Language Support](https://help.elevenlabs.io/hc/en-us/articles/13313366263441-What-languages-do-you-support)
- [PVC Language Support](https://help.elevenlabs.io/hc/en-us/articles/19569659818129-What-languages-are-supported-with-Professional-Voice-Cloning-PVC)
- [Voice Cloning Tips](https://elevenlabs.io/blog/7-tips-for-creating-a-professional-grade-voice-clone-in-elevenlabs)
- [Voice Library](https://elevenlabs.io/docs/creative-platform/voices/voice-library)
- [Audio Tags Documentation](https://help.elevenlabs.io/hc/en-us/articles/35869142561297-How-do-audio-tags-work-with-Eleven-v3)
- [Complete ElevenLabs Pricing Guide 2026](https://flexprice.io/blog/elevenlabs-pricing-breakdown)
- [ElevenLabs Creator Plan Details](https://voice.ai/hub/tts/elevenlabs-pricing/)
