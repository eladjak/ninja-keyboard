/**
 * Ninja Keyboard Voice Generation V4
 *
 * Uses ElevenLabs Creator Tier features:
 * 1. Voice Design v3 - Create custom voices from text descriptions
 * 2. Voice Library - Search Hebrew community voices
 * 3. Audio Tags - [excited], [whispers], [laughs] for emotion
 * 4. Sound Effects API - Generate game sound effects
 *
 * Prerequisites: ElevenLabs Creator tier ($22/mo)
 */

import { writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const OUTPUT_DIR = 'C:/Users/eladj/projects/ninja-keyboard/public/audio/voices';

// ============================================================
// PHASE 1: Voice Design v3 - Create custom voices per character
// ============================================================

const CHARACTER_VOICE_DESIGNS = {
  ki: {
    name: 'Ki - Ninja Boy Hero',
    description: 'A 10-year-old Israeli boy with bright, energetic voice. Speaking Hebrew with authentic Israeli accent. Curious, brave, and adventurous. Medium-high pitch, fast-paced speech, with youthful enthusiasm. Voice has natural Israeli Hebrew rhythm and guttural R sounds.',
    labels: { age: 'young', accent: 'israeli', gender: 'male', use_case: 'characters' }
  },
  mika: {
    name: 'Mika - Tech Ninja Girl',
    description: 'An 11-year-old Israeli girl, confident tech-savvy personality. Speaking Hebrew with authentic Israeli accent. Quick, smart, slightly sarcastic. Medium-high pitch with clarity and sharpness. Natural Israeli Hebrew cadence, assertive but youthful.',
    labels: { age: 'young', accent: 'israeli', gender: 'female', use_case: 'characters' }
  },
  yuki: {
    name: 'Yuki - Speed Ninja Girl',
    description: 'A 10-year-old Israeli girl, extremely fast and competitive. Speaking Hebrew with authentic Israeli accent. High energy, rapid speech, breathless excitement. Higher pitch, staccato delivery, enthusiastic and competitive.',
    labels: { age: 'young', accent: 'israeli', gender: 'female', use_case: 'characters' }
  },
  luna: {
    name: 'Luna - Dreamy Creative Girl',
    description: 'A 9-year-old Israeli girl, gentle and dreamy creative soul. Speaking Hebrew with soft Israeli accent. Slow, melodic speech with pauses. Warm, slightly breathy, imaginative. Lower energy, contemplative, poetic cadence.',
    labels: { age: 'young', accent: 'israeli', gender: 'female', use_case: 'characters' }
  },
  noa: {
    name: 'Noa - Healer Medic Girl',
    description: 'A 9-year-old Israeli girl, gentle caring healer personality. Speaking Hebrew with soft authentic Israeli accent. Calm, warm, reassuring voice. Medium pitch, slower pace, comforting and empathetic. Sounds like a nurturing friend.',
    labels: { age: 'young', accent: 'israeli', gender: 'female', use_case: 'characters' }
  },
  kai: {
    name: 'Kai - Warrior Fighter Boy',
    description: 'An 11-year-old Israeli boy, hot-headed brave warrior. Speaking Hebrew with strong Israeli accent. Energetic, passionate, slightly aggressive. Medium pitch with edge, fast and intense, fiery determination. Bold and confident.',
    labels: { age: 'young', accent: 'israeli', gender: 'male', use_case: 'characters' }
  },
  rex: {
    name: 'Rex - Playful Dinosaur',
    description: 'A young, playful dinosaur character speaking Hebrew with cute, slightly deep voice. Enthusiastic, silly, loves games. Deeper pitch for a kid but still youthful and fun. Speaks with excitement about playing.',
    labels: { age: 'young', accent: 'israeli', gender: 'male', use_case: 'characters' }
  },
  pixel: {
    name: 'Pixel - Helper Robot',
    description: 'A friendly robot assistant speaking Hebrew. Slightly mechanical but warm and helpful. Clear enunciation, medium pitch, supportive. Has a subtle digital quality but still natural enough to be friendly.',
    labels: { age: 'middle_aged', accent: 'israeli', gender: 'neutral', use_case: 'characters' }
  },
  bug: {
    name: 'Bug - Cute Villain Beetle',
    description: 'A mischievous cartoon beetle villain speaking Hebrew. High-pitched, squeaky, playful evil. Rapid speech, lots of energy, annoying but lovable. Think cartoon villain with a sense of humor.',
    labels: { age: 'young', accent: 'israeli', gender: 'male', use_case: 'characters' }
  },
  glitch: {
    name: 'Glitch - Digital Shapeshifter',
    description: 'A chaotic digital entity speaking Hebrew. Voice constantly shifts and warps. Unstable, unpredictable, glitchy audio quality. Sometimes whispers, sometimes shouts. Digital distortion, fragmented speech patterns.',
    labels: { age: 'young', accent: 'israeli', gender: 'neutral', use_case: 'characters' }
  }
};

// ============================================================
// PHASE 2: Voice lines with Audio Tags for emotion
// ============================================================

const VOICE_LINES = {
  ki: [
    { id: 'ki-discovery', text: '[excited] וואו! גיליתי מקש חדש! בואו נראה מה הוא עושה!' },
    { id: 'ki-team', text: '[cheerful] ביחד אנחנו צוות בלתי מנוצח! קדימה חברים!' },
    { id: 'ki-victory', text: '[excited] ניצחנו! זה היה מדהים! הכוח של ההקלדה המהירה!' },
    { id: 'ki-final', text: '[emotional] הדרך הייתה ארוכה, אבל למדנו כל כך הרבה ביחד. תודה שהיית איתי.' },
    { id: 'ki-encourage', text: '[warm] אל תוותר! אני מאמין בך! נסה שוב!' },
    { id: 'ki-battle-start', text: '[determined] בואו נראה מה יש לך! אני מוכן לכל אתגר!' },
    { id: 'ki-level-up', text: '[excited] רמה חדשה! אני מרגיש חזק יותר!' },
    { id: 'ki-greeting', text: '[cheerful] היי! מה קורה? מוכנים ללמוד היום?' },
  ],
  mika: [
    { id: 'mika-intro', text: '[confident] שלום! אני מיקה. אם זה דיגיטלי - אני יודעת לפרוץ אותו.' },
    { id: 'mika-fight', text: '[determined] קיצורי מקלדת הם כוח-על אמיתי! Ctrl+Z מציל חיים!' },
    { id: 'mika-hack', text: '[excited] פרצתי את הקוד! [laughs] קל מדי!' },
    { id: 'mika-encourage', text: '[warm] טעית? לא נורא! גם מתכנתים עושים באגים.' },
    { id: 'mika-shortcut', text: '[confident] תזכור את קיצור המקלדת הזה - הוא ישנה לך את החיים!' },
  ],
  yuki: [
    { id: 'yuki-challenge', text: '[excited] מי יכול להקליד מהר ממני? אתגר אותי! [laughs]' },
    { id: 'yuki-speed', text: '[excited] מהר יותר! עוד יותר מהר! שבור את השיא!' },
    { id: 'yuki-win', text: '[excited] ניצחתי! [laughs] אף אחד לא מהיר ממני!' },
  ],
  luna: [
    { id: 'luna-breathe', text: '[whispers] נשמי עמוק... [calm] כל אות שמקלידים היא כמו ציור קטן על המסך.' },
    { id: 'luna-create', text: '[dreamy] דמיינו שכל מילה שמקלידים הופכת לכוכב בשמיים...' },
    { id: 'luna-encourage', text: '[soft] לאט, בנחת. אין צורך למהר. כל תו בזמנו.' },
  ],
  noa: [
    { id: 'noa-heal', text: '[warm] הכל בסדר! כולם טועים. בוא ננסה ביחד, לאט לאט.' },
    { id: 'noa-support', text: '[caring] אני כאן בשבילך. נתרגל עוד פעם עד שתרגיש בטוח.' },
    { id: 'noa-celebrate', text: '[happy] כל כך גאה בך! ראית כמה התקדמת?' },
  ],
  kai: [
    { id: 'kai-fight', text: '[aggressive] יאללה! בואו נילחם! האצבעות שלי מוכנות!' },
    { id: 'kai-challenge', text: '[determined] אני לא מפחד משום אתגר! תנו לי את הבוס הכי חזק!' },
    { id: 'kai-victory', text: '[excited] ניצחון! [laughs] ידעתי שאני הלוחם הכי חזק!' },
  ],
  rex: [
    { id: 'rex-play', text: '[excited] יש! בואו נשחק! אני אוהב משחקים!' },
    { id: 'rex-fun', text: '[happy] ההה! זה כל כך כיף! עוד פעם! עוד פעם!' },
  ],
  bug: [
    { id: 'bug-scramble', text: '[mischievous] אני אערבב לכם את כל המקשים! [laughs] נראה אתכם מקלידים עכשיו!' },
    { id: 'bug-boss', text: '[dramatic] אני הבאג הגדול! אף אחד לא יכול לתקן אותי!' },
    { id: 'bug-king', text: '[deep, dramatic] אני המלך של כל הבאגים! [laughs] השגיאות שלי הן אומנות!' },
    { id: 'bug-defeat', text: '[whiny] לא הוגן! אתם יותר מדי מהירים! אני אחזור!' },
    { id: 'bug-taunt', text: '[playful evil] טעות! [laughs] ועוד טעות! אתם מזינים אותי!' },
  ],
  glitch: [
    { id: 'glitch-intro', text: '[glitchy] אני... לא... יציב... אני גליץ׳... והעולם שלכם... מתפורר...' },
    { id: 'glitch-redemption', text: '[uncertain] אולי... אולי אני לא חייב להיות הנבל. [whispers] אולי אני יכול לעזור?' },
    { id: 'glitch-thanks', text: '[emotional] תודה... שלא ויתרתם עליי. אולי... אולי אני יכול להשתנות.' },
    { id: 'glitch-chaos', text: '[chaotic] הכל מתהפך! למעלה למטה! שמאל ימין! [laughs] כיף!' },
  ]
};

// ============================================================
// API Functions
// ============================================================

async function searchVoiceLibrary(query, language = 'he') {
  console.log(`\n🔍 Searching Voice Library: "${query}" (${language})...`);
  const url = `${BASE_URL}/shared-voices?page_size=20&search=${encodeURIComponent(query)}&language=${language}&sort=trending`;

  const res = await fetch(url, {
    headers: { 'xi-api-key': API_KEY }
  });

  if (!res.ok) {
    console.error(`❌ Voice Library search failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const voices = data.voices || [];
  console.log(`✅ Found ${voices.length} voices`);

  return voices.map(v => ({
    voice_id: v.voice_id,
    name: v.name,
    description: v.description,
    labels: v.labels,
    preview_url: v.preview_url,
    category: v.category,
    use_count: v.cloned_by_count
  }));
}

async function createVoiceDesign(character, config) {
  console.log(`\n🎨 Creating Voice Design for ${character}...`);
  const url = `${BASE_URL}/voice-generation/generate-voice`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      voice_description: config.description,
      text: 'שלום! אני מוכן להרפתקה חדשה! בואו נלמד להקליד ביחד!',
    })
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ Voice Design failed for ${character}: ${res.status} - ${error}`);
    return null;
  }

  const data = await res.json();
  console.log(`✅ Voice Design created for ${character}: ${data.voice_id || 'check response'}`);
  return data;
}

async function generateSpeech(voiceId, text, outputPath, settings = {}) {
  const url = `${BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  const body = {
    text: text,
    model_id: 'eleven_v3',
    language_code: 'he',
    voice_settings: {
      stability: settings.stability || 0.75,
      similarity_boost: settings.similarity || 0.90,
      style: settings.style || 0.60,
      use_speaker_boost: true
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ TTS failed: ${res.status} - ${error}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB)`);
  return true;
}

async function generateSoundEffect(description, outputPath, durationSeconds = 2) {
  console.log(`\n🔊 Generating SFX: "${description}"...`);
  const url = `${BASE_URL}/sound-generation`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: description,
      duration_seconds: durationSeconds,
      prompt_influence: 0.5
    })
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ SFX failed: ${res.status} - ${error}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`✅ SFX generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB)`);
  return true;
}

// ============================================================
// Main Execution
// ============================================================

async function main() {
  const mode = process.argv[2] || 'search';

  console.log('🎮 Ninja Keyboard Voice V4 - Creator Tier Features');
  console.log('==================================================');

  if (mode === 'search') {
    // Search Hebrew community voices
    console.log('\n📚 Phase 1: Searching Hebrew Community Voices...\n');

    const searches = ['ילד', 'ילדה', 'child', 'kid', 'Hebrew'];
    for (const query of searches) {
      const voices = await searchVoiceLibrary(query);
      if (voices.length > 0) {
        console.log(`\nTop results for "${query}":`);
        voices.slice(0, 5).forEach(v => {
          console.log(`  - ${v.name} (${v.voice_id}) - ${v.description?.slice(0, 80) || 'no desc'}`);
          console.log(`    Labels: ${JSON.stringify(v.labels)}, Uses: ${v.use_count}`);
          if (v.preview_url) console.log(`    Preview: ${v.preview_url}`);
        });
      }
    }
  }

  else if (mode === 'design') {
    // Create custom voices with Voice Design v3
    console.log('\n🎨 Phase 2: Creating Custom Voices with Voice Design v3...\n');

    const results = {};
    for (const [char, config] of Object.entries(CHARACTER_VOICE_DESIGNS)) {
      const result = await createVoiceDesign(char, config);
      if (result) {
        results[char] = result;
      }
      // Rate limit
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n📋 Voice Design Results:');
    console.log(JSON.stringify(results, null, 2));
    writeFileSync(`${OUTPUT_DIR}/voice-design-results.json`, JSON.stringify(results, null, 2));
  }

  else if (mode === 'generate') {
    // Generate all voice lines with a specific voice map
    const voiceMap = JSON.parse(process.argv[3] || '{}');

    console.log('\n🎤 Phase 3: Generating All Voice Lines...\n');

    for (const [char, lines] of Object.entries(VOICE_LINES)) {
      const voiceId = voiceMap[char];
      if (!voiceId) {
        console.log(`⏩ Skipping ${char} - no voice ID provided`);
        continue;
      }

      const charDir = `${OUTPUT_DIR}/${char}`;

      // Backup current to v3/
      const v3Dir = `${charDir}/v3`;
      if (!existsSync(v3Dir)) mkdirSync(v3Dir, { recursive: true });

      // Backup existing files
      if (existsSync(charDir)) {
        for (const f of readdirSync(charDir)) {
          if (f.endsWith('.mp3') && f !== '.mp3') {
            const src = `${charDir}/${f}`;
            const dst = `${v3Dir}/${f}`;
            if (!existsSync(dst)) {
              cpSync(src, dst);
              console.log(`📦 Backed up: ${f} → v3/`);
            }
          }
        }
      }

      // Generate new voice lines
      const settings = CHARACTER_VOICE_DESIGNS[char]?.settings || {};
      for (const line of lines) {
        const outputPath = `${charDir}/${line.id}.mp3`;
        await generateSpeech(voiceId, line.text, outputPath, settings);
        await new Promise(r => setTimeout(r, 1500)); // Rate limit
      }
    }
  }

  else if (mode === 'sfx') {
    // Generate game sound effects
    console.log('\n🔊 Phase 4: Generating Game Sound Effects...\n');

    const sfxDir = `${OUTPUT_DIR}/../sfx`;
    if (!existsSync(sfxDir)) mkdirSync(sfxDir, { recursive: true });

    const effects = [
      { name: 'keyboard-click', desc: 'Single mechanical keyboard key press click, crisp and satisfying', duration: 0.3 },
      { name: 'keyboard-combo', desc: 'Rapid succession of keyboard typing sounds, energetic combo streak', duration: 1.5 },
      { name: 'level-up', desc: 'Bright magical level up chime, ascending notes, triumphant and exciting', duration: 2 },
      { name: 'achievement-unlock', desc: 'Epic achievement unlock fanfare, sparkle sounds, rewarding and special', duration: 3 },
      { name: 'character-unlock', desc: 'Magical reveal sound, mystery box opening, exciting character appearance', duration: 3 },
      { name: 'ninja-slash', desc: 'Fast ninja sword slash through air, whoosh, sharp and quick', duration: 0.5 },
      { name: 'bug-appear', desc: 'Cartoon villain entrance, mischievous sneaky approach, funny evil', duration: 1.5 },
      { name: 'glitch-warp', desc: 'Digital glitch distortion, electronic warping, reality breaking apart', duration: 1 },
      { name: 'correct-answer', desc: 'Bright positive confirmation ding, small success, encouraging', duration: 0.5 },
      { name: 'wrong-answer', desc: 'Gentle wrong answer buzz, not harsh, soft error notification', duration: 0.5 },
      { name: 'streak-fire', desc: 'Fire igniting and burning, streak on fire, blazing hot', duration: 1.5 },
      { name: 'victory-cheers', desc: 'Crowd cheering and applause, celebration, exciting victory moment', duration: 3 },
      { name: 'countdown-beep', desc: 'Single digital countdown beep, timer notification', duration: 0.3 },
      { name: 'countdown-go', desc: 'Exciting GO signal, race start horn, energetic launch', duration: 1 },
      { name: 'star-earn', desc: 'Sparkling star earned, magical twinkling, rewarding chime', duration: 1 },
      { name: 'xp-gain', desc: 'Experience points gained, coins dropping, satisfying collection', duration: 1 },
    ];

    for (const fx of effects) {
      const outputPath = `${sfxDir}/${fx.name}.mp3`;
      await generateSoundEffect(fx.desc, outputPath, fx.duration);
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
