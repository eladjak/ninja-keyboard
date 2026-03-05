/**
 * Voice V4 - Full Hebrew Generation Pipeline
 *
 * For each character:
 * 1. Create Voice Design preview (defines voice character)
 * 2. Save best to ElevenLabs account
 * 3. Generate all voice lines with language_code='he' + eleven_v3
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, cpSync, readdirSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const VOICES_DIR = 'public/audio/voices';
const PREVIEW_DIR = `${VOICES_DIR}/voice-design-previews`;

if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// CHARACTER DEFINITIONS - Improved descriptions (no age refs)
// ============================================================

const CHARACTERS = {
  ki: {
    designDesc: 'A young Israeli boy voice with bright energy and genuine emotion. Not too childish - sounds brave, curious, and adventurous. Medium pitch, clear articulation, natural warmth. Think animated movie hero - expressive, enthusiastic, but not babyish. Strong personality.',
    accountName: 'NK-Ki-Hero-V4',
    accountDesc: 'Young Israeli boy hero - brave, curious, emotional',
    previewText: 'וואו! גיליתי מקש חדש! בואו נראה מה הוא עושה! אני כל כך מתרגש! ביחד אנחנו צוות בלתי מנוצח! קדימה חברים, נלמד להקליד כמו נינג׳ות!',
    ttsSettings: { stability: 0.75, similarity_boost: 0.92, style: 0.65, use_speaker_boost: true },
    lines: [
      { id: 'ki-discovery', text: 'וואו! גיליתי מקש חדש! בואו נראה מה הוא עושה!' },
      { id: 'ki-team', text: 'ביחד אנחנו צוות בלתי מנוצח! קדימה חברים!' },
      { id: 'ki-victory', text: 'ניצחנו! זה היה מדהים! הכוח של ההקלדה המהירה!' },
      { id: 'ki-final', text: 'הדרך הייתה ארוכה, אבל למדנו כל כך הרבה ביחד. תודה שהיית איתי.' },
      { id: 'ki-encourage', text: 'אל תוותר! אני מאמין בך! נסה שוב!' },
      { id: 'ki-battle-start', text: 'בואו נראה מה יש לך! אני מוכן לכל אתגר!' },
      { id: 'ki-level-up', text: 'רמה חדשה! אני מרגיש חזק יותר!' },
      { id: 'ki-greeting', text: 'היי! מה קורה? מוכנים ללמוד היום?' },
    ]
  },
  mika: {
    designDesc: 'A young Israeli girl voice, confident and sharp. Tech-savvy personality with quick wit and slight sarcasm. Clear, assertive speech with natural Israeli Hebrew rhythm. Medium-high pitch, smart and cool. Not sweet or girly - more like a hacker with attitude.',
    accountName: 'NK-Mika-Tech-V4',
    accountDesc: 'Young Israeli tech girl - confident, smart, sarcastic',
    previewText: 'שלום! אני מיקה. אם זה דיגיטלי, אני יודעת לפרוץ אותו. קיצורי מקלדת הם כוח-על אמיתי! בואי נפרוץ את המערכת ונראה מה בפנים!',
    ttsSettings: { stability: 0.80, similarity_boost: 0.95, style: 0.65, use_speaker_boost: true },
    lines: [
      { id: 'mika-intro', text: 'שלום! אני מיקה. אם זה דיגיטלי - אני יודעת לפרוץ אותו.' },
      { id: 'mika-fight', text: 'קיצורי מקלדת הם כוח-על אמיתי! קונטרול זד מציל חיים!' },
      { id: 'mika-hack', text: 'פרצתי את הקוד! קל מדי!' },
      { id: 'mika-encourage', text: 'טעית? לא נורא! גם מתכנתים עושים באגים.' },
      { id: 'mika-shortcut', text: 'תזכור את קיצור המקלדת הזה - הוא ישנה לך את החיים!' },
    ]
  },
  yuki: {
    designDesc: 'A young Israeli girl voice, extremely energetic and competitive. Fast talker, breathless excitement. Higher pitch with staccato delivery. Sports announcer energy - always pumped, always ready to race. Speaks like every word is a sprint.',
    accountName: 'NK-Yuki-Speed-V4',
    accountDesc: 'Young Israeli speed girl - fast, competitive, energetic',
    previewText: 'מי יכול להקליד מהר ממני? אתגר אותי! אני הכי מהירה בדוג׳ו! מהר יותר! עוד יותר מהר! שבור את השיא! ניצחתי! אף אחד לא מהיר ממני!',
    ttsSettings: { stability: 0.68, similarity_boost: 0.90, style: 0.80, use_speaker_boost: true },
    lines: [
      { id: 'yuki-challenge', text: 'מי יכול להקליד מהר ממני? אתגר אותי!' },
      { id: 'yuki-speed', text: 'מהר יותר! עוד יותר מהר! שבור את השיא!' },
      { id: 'yuki-win', text: 'ניצחתי! אף אחד לא מהיר ממני!' },
    ]
  },
  luna: {
    designDesc: 'A young Israeli girl voice, gentle dreamy creative soul. Slow melodic speech with thoughtful pauses. Warm, slightly breathy, imaginative. Speaks like she is painting with words. Calm, serene, poetic. Soft but not weak - has inner depth.',
    accountName: 'NK-Luna-Dream-V4',
    accountDesc: 'Young Israeli dreamy girl - gentle, creative, poetic',
    previewText: 'נשמי עמוק... כל אות שמקלידים היא כמו ציור קטן על המסך. דמיינו שכל מילה שמקלידים הופכת לכוכב בשמיים... לאט, בנחת. אין צורך למהר. כל תו בזמנו.',
    ttsSettings: { stability: 0.85, similarity_boost: 0.90, style: 0.30, use_speaker_boost: true },
    lines: [
      { id: 'luna-breathe', text: 'נשמי עמוק... כל אות שמקלידים היא כמו ציור קטן על המסך.' },
      { id: 'luna-create', text: 'דמיינו שכל מילה שמקלידים הופכת לכוכב בשמיים...' },
      { id: 'luna-encourage', text: 'לאט, בנחת. אין צורך למהר. כל תו בזמנו.' },
    ]
  },
  noa: {
    designDesc: 'A young Israeli girl voice, gentle caring healer. Calm, warm, reassuring like a nurturing friend. Medium pitch, slower pace, comforting and empathetic. Speaks with genuine care and support. Not patronizing - genuinely kind and encouraging.',
    accountName: 'NK-Noa-Healer-V4',
    accountDesc: 'Young Israeli healer girl - warm, caring, supportive',
    previewText: 'הכל בסדר! כולם טועים. בוא ננסה ביחד, לאט לאט. אני כאן בשבילך. נתרגל עוד פעם עד שתרגיש בטוח. כל כך גאה בך! ראית כמה התקדמת?',
    ttsSettings: { stability: 0.72, similarity_boost: 0.90, style: 0.50, use_speaker_boost: true },
    lines: [
      { id: 'noa-heal', text: 'הכל בסדר! כולם טועים. בוא ננסה ביחד, לאט לאט.' },
      { id: 'noa-support', text: 'אני כאן בשבילך. נתרגל עוד פעם עד שתרגיש בטוח.' },
      { id: 'noa-celebrate', text: 'כל כך גאה בך! ראית כמה התקדמת?' },
    ]
  },
  kai: {
    designDesc: 'A young Israeli boy voice, hot-headed brave warrior. Energetic, passionate, intense. Medium pitch with an aggressive edge. Speaks fast with fiery determination. Bold, confident, competitive. Like a young action hero ready for battle.',
    accountName: 'NK-Kai-Warrior-V4',
    accountDesc: 'Young Israeli warrior boy - fierce, passionate, bold',
    previewText: 'יאללה! בואו נילחם! האצבעות שלי מוכנות לכל אתגר! אני לא מפחד משום דבר! תנו לי את הבוס הכי חזק שיש! ניצחון! ידעתי שאני הלוחם הכי חזק!',
    ttsSettings: { stability: 0.70, similarity_boost: 0.88, style: 0.80, use_speaker_boost: true },
    lines: [
      { id: 'kai-fight', text: 'יאללה! בואו נילחם! האצבעות שלי מוכנות!' },
      { id: 'kai-challenge', text: 'אני לא מפחד משום אתגר! תנו לי את הבוס הכי חזק!' },
      { id: 'kai-victory', text: 'ניצחון! ידעתי שאני הלוחם הכי חזק!' },
    ]
  },
  rex: {
    designDesc: 'A friendly dinosaur character voice. Slightly deep but playful and goofy. Enthusiastic, silly, loves games. Has a warm rumbling quality but still fun and approachable. Think cartoon dinosaur sidekick - lovable and funny.',
    accountName: 'NK-Rex-Dino-V4',
    accountDesc: 'Playful dinosaur friend - goofy, warm, enthusiastic',
    previewText: 'יש! בואו נשחק! אני אוהב משחקים! גם עם ידיים קטנות, אני פה בשבילכם! זה כל כך כיף! עוד פעם! עוד פעם! אני רקס ואני הכי אוהב לעזור!',
    ttsSettings: { stability: 0.70, similarity_boost: 0.90, style: 0.80, use_speaker_boost: true },
    lines: [
      { id: 'rex-play', text: 'יש! בואו נשחק! אני אוהב משחקים!' },
      { id: 'rex-fun', text: 'זה כל כך כיף! עוד פעם! עוד פעם!' },
    ],
    postFx: 'asetrate=48000*0.90,aresample=48000' // Pitch down 10%
  },
  bug: {
    designDesc: 'A deep imposing villain voice with dramatic flair. Booming, theatrical, over-the-top evil. Low pitch, powerful presence. Think classic cartoon supervillain - big, menacing but also funny. Must sound LARGE and intimidating, not like a child or woman.',
    accountName: 'NK-Bug-Boss-V4',
    accountDesc: 'Imposing bug villain - deep, dramatic, theatrical evil',
    previewText: 'הא הא הא! אני הבאג הגדול! אני אערבב לכם את כל המקשים! נראה אתכם מקלידים עכשיו! טעות! ועוד טעות! אתם מזינים אותי! אני מלך הבאגים!',
    ttsSettings: { stability: 0.50, similarity_boost: 0.85, style: 0.90, use_speaker_boost: true },
    lines: [
      { id: 'bug-scramble', text: 'הא הא הא! אני אערבב לכם את כל המקשים! נראה אתכם מקלידים עכשיו!' },
      { id: 'bug-boss', text: 'אני הבאג הגדול! אף אחד לא יכול לתקן אותי!' },
      { id: 'bug-king', text: 'אני מלך הבאגים! השגיאות שלי הן אומנות!' },
      { id: 'bug-defeat', text: 'לא הוגן! אתם יותר מדי מהירים! אני אחזור!' },
      { id: 'bug-taunt', text: 'טעות! ועוד טעות! אתם מזינים אותי!' },
    ],
    postFx: 'asetrate=48000*0.92,aresample=48000,aecho=0.8:0.7:80:0.5' // Pitch down + echo
  },
  glitch: {
    designDesc: 'A chaotic unstable digital entity voice. Shifts between whispers and shouts unpredictably. Eerie, unsettling, fragmented. Has a haunting digital quality. Not human-sounding - more like corrupted data trying to speak. Young but otherworldly.',
    accountName: 'NK-Glitch-Chaos-V4',
    accountDesc: 'Chaotic digital entity - unstable, eerie, fragmented',
    previewText: 'אני... לא... יציב... אני גליץ׳... והעולם שלכם... מתפורר... הכל מתהפך! למעלה למטה! שמאל ימין! אולי... אולי אני לא חייב להיות הנבל.',
    ttsSettings: { stability: 0.25, similarity_boost: 0.85, style: 0.60, use_speaker_boost: true },
    lines: [
      { id: 'glitch-intro', text: 'אני... לא... יציב... אני גליץ׳... והעולם שלכם... מתפורר...' },
      { id: 'glitch-redemption', text: 'אולי... אולי אני לא חייב להיות הנבל. אולי אני יכול לעזור?' },
      { id: 'glitch-thanks', text: 'תודה... שלא ויתרתם עליי. אולי... אולי אני יכול להשתנות.' },
      { id: 'glitch-chaos', text: 'הכל מתהפך! למעלה למטה! שמאל ימין! כיף!' },
    ],
    postFx: 'tremolo=f=8:d=0.6,aecho=0.8:0.5:25:0.3' // Tremolo + echo
  }
};

// ============================================================
// API Functions
// ============================================================

async function createPreview(name, desc, text) {
  console.log(`\n🎨 Creating voice preview for ${name}...`);
  const res = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_description: desc, text })
  });
  if (!res.ok) {
    console.log(`❌ Preview failed: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  if (data.previews?.length > 0) {
    // Save first preview and return its ID
    const p = data.previews[0];
    const buf = Buffer.from(p.audio_base_64, 'base64');
    writeFileSync(`${PREVIEW_DIR}/${name}-v4-preview.mp3`, buf);
    console.log(`✅ Preview saved (${(buf.length/1024).toFixed(1)}KB) voice_id=${p.generated_voice_id}`);
    return p.generated_voice_id;
  }
  return null;
}

async function saveToAccount(generatedVoiceId, name, desc) {
  console.log(`💾 Saving "${name}" to account...`);
  const res = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_name: name,
      voice_description: desc,
      generated_voice_id: generatedVoiceId,
      labels: { language: 'Hebrew', project: 'ninja-keyboard' }
    })
  });
  if (!res.ok) {
    console.log(`❌ Save failed: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const data = await res.json();
  console.log(`✅ Saved! Account voice ID: ${data.voice_id}`);
  return data.voice_id;
}

async function generateLine(voiceId, text, outputPath, settings) {
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      language_code: 'he',
      voice_settings: settings
    })
  });
  if (!res.ok) {
    console.log(`❌ TTS failed for ${outputPath}: ${(await res.text()).slice(0, 200)}`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`  ✅ ${outputPath.split('/').pop()} (${(buffer.length/1024).toFixed(1)}KB)`);
  return true;
}

// ============================================================
// Main Pipeline
// ============================================================

async function main() {
  console.log('🎮 Ninja Keyboard - Voice V4 Full Hebrew Pipeline');
  console.log('='.repeat(55));

  const accountVoices = {};
  const charNames = Object.keys(CHARACTERS);

  // Check for existing account voices
  const accountFile = `${PREVIEW_DIR}/account-voices-v4.json`;
  let existing = {};
  if (existsSync(accountFile)) {
    existing = JSON.parse(readFileSync(accountFile, 'utf-8'));
    console.log(`📂 Found existing account voices: ${Object.keys(existing).join(', ')}`);
  }

  // Phase 1: Create voice designs and save to account
  console.log('\n' + '='.repeat(55));
  console.log('PHASE 1: Voice Design → Save to Account');
  console.log('='.repeat(55));

  for (const charName of charNames) {
    const char = CHARACTERS[charName];

    // Skip if already saved
    if (existing[charName]) {
      console.log(`\n⏩ ${charName}: already saved (${existing[charName]})`);
      accountVoices[charName] = existing[charName];
      continue;
    }

    // Create preview
    const previewId = await createPreview(charName, char.designDesc, char.previewText);
    if (!previewId) {
      console.log(`⚠️ Skipping ${charName} - preview failed`);
      continue;
    }
    await sleep(3000);

    // Save to account
    const voiceId = await saveToAccount(previewId, char.accountName, char.accountDesc);
    if (voiceId) {
      accountVoices[charName] = voiceId;
    }
    await sleep(3000);

    // Save progress incrementally
    writeFileSync(accountFile, JSON.stringify({ ...existing, ...accountVoices }, null, 2));
  }

  console.log('\n📋 Account Voices:');
  console.log(JSON.stringify(accountVoices, null, 2));
  writeFileSync(accountFile, JSON.stringify(accountVoices, null, 2));

  // Phase 2: Generate all voice lines in Hebrew
  console.log('\n' + '='.repeat(55));
  console.log('PHASE 2: Generate Hebrew Voice Lines');
  console.log('='.repeat(55));

  let totalGenerated = 0;

  for (const charName of charNames) {
    const char = CHARACTERS[charName];
    const voiceId = accountVoices[charName];

    if (!voiceId) {
      console.log(`\n⏩ Skipping ${charName} - no voice ID`);
      continue;
    }

    console.log(`\n🎤 Generating ${char.lines.length} lines for ${charName}...`);

    const charDir = `${VOICES_DIR}/${charName}`;
    if (!existsSync(charDir)) mkdirSync(charDir, { recursive: true });

    // Backup current V3 files to v3/ subfolder
    const v3Dir = `${charDir}/v3`;
    if (!existsSync(v3Dir)) mkdirSync(v3Dir, { recursive: true });
    if (existsSync(charDir)) {
      for (const f of readdirSync(charDir)) {
        if (f.endsWith('.mp3')) {
          const src = `${charDir}/${f}`;
          const dst = `${v3Dir}/${f}`;
          if (!existsSync(dst)) {
            cpSync(src, dst);
            console.log(`  📦 Backed up: ${f} → v3/`);
          }
        }
      }
    }

    // Generate each line
    for (const line of char.lines) {
      const rawPath = char.postFx ? `${charDir}/${line.id}-raw.mp3` : `${charDir}/${line.id}.mp3`;
      const success = await generateLine(voiceId, line.text, rawPath, char.ttsSettings);
      if (success) totalGenerated++;
      await sleep(1500);
    }
  }

  console.log(`\n✅ Generated ${totalGenerated} Hebrew voice lines!`);

  // Phase 3: Apply post-processing for villain/special characters
  console.log('\n' + '='.repeat(55));
  console.log('PHASE 3: Post-Processing (ffmpeg)');
  console.log('='.repeat(55));

  for (const charName of charNames) {
    const char = CHARACTERS[charName];
    if (!char.postFx) continue;

    console.log(`\n🔧 Processing ${charName} with: ${char.postFx}`);
    const charDir = `${VOICES_DIR}/${charName}`;

    for (const line of char.lines) {
      const rawPath = `${charDir}/${line.id}-raw.mp3`;
      const finalPath = `${charDir}/${line.id}.mp3`;

      if (!existsSync(rawPath)) {
        console.log(`  ⏩ ${line.id}-raw.mp3 not found, skipping`);
        continue;
      }

      console.log(`  🎚️ ${line.id}...`);
      // We'll run ffmpeg separately - just log what needs to happen
      console.log(`  ffmpeg -y -i "${rawPath}" -af "${char.postFx}" "${finalPath}"`);
    }
  }

  console.log('\n⚠️ Run the ffmpeg commands above to apply post-processing!');
  console.log('Or use: node scripts/voice-postprocess.mjs');

  console.log('\n' + '='.repeat(55));
  console.log('🎉 DONE! Voice V4 Hebrew pipeline complete.');
  console.log(`Total voices saved to account: ${Object.keys(accountVoices).length}`);
  console.log(`Total lines generated: ${totalGenerated}`);
  console.log('='.repeat(55));
}

main().catch(console.error);
