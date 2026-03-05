/**
 * Voice Design V4 - Create previews using ElevenLabs text-to-voice API
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const PREVIEW_DIR = 'public/audio/voices/voice-design-previews';

if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });

async function createVoicePreviews(name, voiceDescription, text) {
  console.log(`\n🎨 Creating voice previews for: ${name}`);

  const res = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ voice_description: voiceDescription, text })
  });

  console.log(`Status: ${res.status}`);

  if (!res.ok) {
    console.log(`Error: ${(await res.text()).slice(0, 300)}`);
    return null;
  }

  const data = await res.json();
  console.log(`Previews: ${data.previews?.length || 0}`);

  if (data.previews) {
    const results = [];
    for (let i = 0; i < data.previews.length; i++) {
      const p = data.previews[i];
      const filename = `${PREVIEW_DIR}/${name}-preview-${i}.mp3`;
      const audioBuffer = Buffer.from(p.audio_base_64, 'base64');
      writeFileSync(filename, audioBuffer);
      console.log(`  ✅ Saved: ${filename} (${(audioBuffer.length / 1024).toFixed(1)}KB) voice_id=${p.generated_voice_id}`);
      results.push({ generated_voice_id: p.generated_voice_id, index: i });
    }
    return results;
  }
  return null;
}

const characters = [
  {
    name: 'ki',
    desc: 'A 10-year-old Israeli boy with bright, energetic voice. Speaking Hebrew with authentic Israeli accent. Curious, brave, adventurous. Medium-high pitch, fast-paced speech, youthful enthusiasm. Natural Israeli Hebrew rhythm and guttural R sounds.',
    text: 'וואו! גיליתי מקש חדש! בואו נראה מה הוא עושה! אני כל כך מתרגש! ביחד אנחנו צוות בלתי מנוצח! קדימה חברים, בואו נלמד להקליד כמו נינג׳ות אמיתיות!'
  },
  {
    name: 'mika',
    desc: 'An 11-year-old Israeli girl, confident tech-savvy personality. Speaking Hebrew with authentic Israeli accent. Quick, smart, slightly sarcastic. Medium-high pitch with clarity and sharpness. Natural Israeli Hebrew cadence, assertive but youthful.',
    text: 'שלום! אני מיקה. אם זה דיגיטלי, אני יודעת לפרוץ אותו. קיצורי מקלדת הם כוח-על אמיתי! בואי נפרוץ את המערכת ונראה מה בפנים. קונטרול זד מציל חיים!'
  },
  {
    name: 'bug',
    desc: 'A mischievous cartoon beetle villain speaking Hebrew. High-pitched, squeaky, playful evil. Rapid speech, lots of energy, annoying but lovable. Think cartoon villain child with evil giggles and dramatic flair.',
    text: 'הא הא הא! אני הבאג הגדול! אני אערבב לכם את כל המקשים! נראה אתכם מקלידים עכשיו! טעות! ועוד טעות! אתם מזינים אותי! אני מלך הבאגים ולעולם לא תנצחו אותי!'
  },
  {
    name: 'kai',
    desc: 'An 11-year-old Israeli boy, hot-headed brave warrior. Speaking Hebrew with strong Israeli accent. Energetic, passionate, slightly aggressive. Medium pitch with edge, fast and intense, fiery determination. Bold and confident.',
    text: 'יאללה! בואו נילחם! האצבעות שלי מוכנות לכל אתגר! אני לא מפחד משום דבר! תנו לי את הבוס הכי חזק שיש! ניצחון! ידעתי שאני הלוחם הכי חזק בכל הדוג׳ו!'
  },
  {
    name: 'yuki',
    desc: 'A 10-year-old Israeli girl, extremely fast and competitive. Speaking Hebrew with authentic Israeli accent. High energy, rapid speech, breathless excitement. Higher pitch, staccato delivery, enthusiastic and competitive.',
    text: 'מי יכול להקליד מהר ממני? אתגר אותי! אני הכי מהירה בדוג׳ו! מהר יותר! עוד יותר מהר! שבור את השיא! ניצחתי! אף אחד לא מהיר ממני!'
  },
  {
    name: 'luna',
    desc: 'A 9-year-old Israeli girl, gentle and dreamy creative soul. Speaking Hebrew with soft Israeli accent. Slow, melodic speech with pauses. Warm, slightly breathy, imaginative. Lower energy, contemplative, poetic cadence.',
    text: 'נשמי עמוק... כל אות שמקלידים היא כמו ציור קטן על המסך. דמיינו שכל מילה שמקלידים הופכת לכוכב בשמיים... לאט, בנחת. אין צורך למהר. כל תו בזמנו.'
  },
  {
    name: 'noa',
    desc: 'A 9-year-old Israeli girl, gentle caring healer personality. Speaking Hebrew with soft authentic Israeli accent. Calm, warm, reassuring voice. Medium pitch, slower pace, comforting and empathetic. Sounds like a nurturing friend.',
    text: 'הכל בסדר! כולם טועים. בוא ננסה ביחד, לאט לאט. אני כאן בשבילך. נתרגל עוד פעם עד שתרגיש בטוח. כל כך גאה בך! ראית כמה התקדמת?'
  },
  {
    name: 'glitch',
    desc: 'A chaotic digital entity speaking Hebrew. Voice constantly shifts and warps. Unstable, unpredictable. Sometimes whispers, sometimes shouts. Digital distortion feel, fragmented speech patterns. Young, eerie, unsettling.',
    text: 'אני... לא... יציב... אני גליץ׳... והעולם שלכם... מתפורר... הכל מתהפך! למעלה למטה! שמאל ימין! אולי... אולי אני לא חייב להיות הנבל.'
  },
  {
    name: 'rex',
    desc: 'A young, playful dinosaur character speaking Hebrew with cute, slightly deep voice. Enthusiastic, silly, loves games. Deeper pitch for a kid but still youthful and fun. Speaks with excitement about playing and helping.',
    text: 'יש! בואו נשחק! אני אוהב משחקים! גם עם ידיים קטנות, אני פה בשבילכם! זה כל כך כיף! עוד פעם! עוד פעם! אני רקס ואני הכי אוהב לעזור!'
  }
];

async function main() {
  const allResults = {};

  for (const char of characters) {
    const result = await createVoicePreviews(char.name, char.desc, char.text);
    if (result) {
      allResults[char.name] = result;
    }
    // Rate limit - wait 5 seconds between calls
    console.log('⏳ Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('\n\n📋 All Results:');
  console.log(JSON.stringify(allResults, null, 2));
  writeFileSync(`${PREVIEW_DIR}/results.json`, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ Saved results to ${PREVIEW_DIR}/results.json`);
}

main().catch(console.error);
