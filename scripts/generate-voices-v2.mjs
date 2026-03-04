/**
 * Ninja Keyboard Voice Generation V2
 *
 * Strategy:
 * - Kids (Ki, Mika, Yuki, Luna, Noa, Kai): Young voices, speed 1.1-1.2, high stability
 * - Bug: Callum (husky trickster), low stability, post-process with pitch up + reverb
 * - Bug King: Same voice but slower/deeper
 * - Glitch: Low stability (0.15-0.2) for glitchy effect, post-process with tremolo
 * - Rex: Deep voice (Brian), speed 0.85, post-process pitch down slightly
 * - Sensei Zen: SKIP (already perfect)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const OUTPUT_DIR = 'C:/Users/eladj/projects/ninja-keyboard/public/audio/voices';

// Voice IDs mapped to characters
const VOICES = {
  // Boys - Ki (curious/brave), Kai (fiery/enthusiastic)
  KI_BOY: 'bIHbv24MWmeRgasZH58o',      // Will - Relaxed Optimist (young male) -> curious Ki
  KAI_BOY: 'SOYHLrjzK2X1ezoPC6cr',     // Harry - Fierce Warrior (young male) -> fiery Kai

  // Girls - Mika (confident), Yuki (fast/competitive), Luna (calm), Noa (gentle)
  MIKA_GIRL: 'FGY2WhTYpPnrIDTdsKH5',   // Laura - Enthusiast, Quirky (young female) -> confident Mika
  YUKI_GIRL: 'cgSgspJ2msm6clMCkdW9',   // Jessica - Playful, Bright (young female) -> competitive Yuki
  LUNA_GIRL: 'EXAVITQu4vr4xnSDxMaL',   // Sarah - Mature, Reassuring (young female) -> calm Luna
  NOA_GIRL: 'cgSgspJ2msm6clMCkdW9',    // Jessica - Playful, Bright -> gentle Noa

  // Villains
  BUG: 'N2lVS1w4EtoT3dr4eOWO',         // Callum - Husky Trickster -> mischievous Bug
  GLITCH: 'TX3LPaxmHKxFdv7VOQHJ',      // Liam - Energetic -> unstable Glitch (we'll use low stability)

  // Rex
  REX: 'nPczCjzI2devNBz1zQrb',          // Brian - Deep, Resonant -> cool dinosaur Rex
};

// Character definitions with voice settings
const CHARACTERS = {
  ki: {
    voiceId: VOICES.KI_BOY,
    model: 'eleven_v3',
    stability: 0.55,
    similarity: 0.80,
    speed: 1.15,
    description: 'Ki - Young boy, 10yo, curious and brave',
    lines: [
      { file: 'ki-discovery', text: 'וואו! המקלדת הזו זוהרת!' },
      { file: 'ki-team', text: 'ביחד אנחנו חזקים יותר!' },
      { file: 'ki-victory', text: 'ניצחנו! אבל הוא ברח...' },
      { file: 'ki-final', text: 'עכשיו אנחנו מוכנים!' },
    ],
    postProcess: null,
  },
  mika: {
    voiceId: VOICES.MIKA_GIRL,
    model: 'eleven_v3',
    stability: 0.50,
    similarity: 0.80,
    speed: 1.15,
    description: 'Mika - Young girl, 10-11yo, confident tech-savvy',
    lines: [
      { file: 'mika-intro', text: 'בוא ננסה ביחד, קי!' },
      { file: 'mika-fight', text: 'לא ניתן לבאג לנצח!' },
      { file: 'mika-hack', text: 'בואי נפרוץ את המערכת!' },
    ],
    postProcess: null,
  },
  yuki: {
    voiceId: VOICES.YUKI_GIRL,
    model: 'eleven_v3',
    stability: 0.45,
    similarity: 0.80,
    speed: 1.20,
    description: 'Yuki - Young girl, fast and competitive',
    lines: [
      { file: 'yuki-challenge', text: 'אני הכי מהירה בדוג\'ו!' },
    ],
    postProcess: null,
  },
  luna: {
    voiceId: VOICES.LUNA_GIRL,
    model: 'eleven_v3',
    stability: 0.70,
    similarity: 0.85,
    speed: 0.95,
    description: 'Luna - Young girl, calm and serene',
    lines: [
      { file: 'luna-breathe', text: 'נשימה עמוקה... ואז מתחילים.' },
    ],
    postProcess: null,
  },
  kai: {
    voiceId: VOICES.KAI_BOY,
    model: 'eleven_v3',
    stability: 0.45,
    similarity: 0.80,
    speed: 1.20,
    description: 'Kai - Young boy, fiery and enthusiastic',
    lines: [
      { file: 'kai-fight', text: 'בוא נלחם!' },
    ],
    postProcess: null,
  },
  noa: {
    voiceId: VOICES.NOA_GIRL,
    model: 'eleven_v3',
    stability: 0.65,
    similarity: 0.85,
    speed: 1.05,
    description: 'Noa - Young girl, gentle and healing',
    lines: [
      { file: 'noa-heal', text: 'אני כאן, לא נורא לטעות!' },
    ],
    postProcess: null,
  },
  bug: {
    voiceId: VOICES.BUG,
    model: 'eleven_v3',
    stability: 0.30,
    similarity: 0.70,
    speed: 1.10,
    description: 'Bug - Mischievous digital beetle, squeaky + effects',
    lines: [
      { file: 'bug-scramble', text: 'הא הא! בלבלתי לכם את האותיות!' },
      { file: 'bug-boss', text: 'עכשיו אני מבלבל עשר מילים שלמות!' },
      { file: 'bug-defeat', text: 'אוי! אחזוווור!' },
    ],
    postProcess: 'bug',
  },
  'bug-king': {
    voiceId: VOICES.BUG,
    model: 'eleven_v3',
    stability: 0.35,
    similarity: 0.70,
    speed: 0.90,
    description: 'Bug King - Same as Bug but deeper and more imposing',
    lines: [
      { file: 'bug-king', text: 'אני מלך הבאגים! לעולם לא תנצחו אותי!' },
    ],
    postProcess: 'bug-king',
  },
  glitch: {
    voiceId: VOICES.GLITCH,
    model: 'eleven_v3',
    stability: 0.18,
    similarity: 0.65,
    speed: 1.05,
    description: 'Glitch - Glitchy pixel entity, unstable voice + effects',
    lines: [
      { file: 'glitch-intro', text: 'גגג-גליץ\' פ-פ-פה!' },
      { file: 'glitch-redemption', text: 'א-א-אני לא רוצה להיות ר-ר-רע!' },
      { file: 'glitch-thanks', text: 'ת-תודה...' },
    ],
    postProcess: 'glitch',
  },
  rex: {
    voiceId: VOICES.REX,
    model: 'eleven_v3',
    stability: 0.50,
    similarity: 0.80,
    speed: 0.90,
    description: 'Rex - Cool dinosaur, deep but fun',
    lines: [
      { file: 'rex-play', text: 'גם עם ידיים קטנות - אני פה!' },
    ],
    postProcess: 'rex',
  },
};

// Post-processing effects with ffmpeg
const POST_PROCESS = {
  bug: (input, output) => {
    // Pitch up 15% + echo for mischievous digital feel
    const cmd = `ffmpeg -y -i "${input}" -af "asetrate=48000*1.15,aresample=48000,aecho=0.8:0.88:60:0.4" "${output}"`;
    return cmd;
  },
  'bug-king': (input, output) => {
    // Slight pitch down 5% + heavier echo for imposing king feel
    const cmd = `ffmpeg -y -i "${input}" -af "asetrate=48000*0.95,aresample=48000,aecho=0.8:0.7:80:0.5" "${output}"`;
    return cmd;
  },
  glitch: (input, output) => {
    // Tremolo for glitchy stutter + echo for digital distortion
    const cmd = `ffmpeg -y -i "${input}" -af "tremolo=f=10:d=0.5,aecho=0.8:0.5:20:0.3" "${output}"`;
    return cmd;
  },
  rex: (input, output) => {
    // Pitch down 12% for deep dino voice, keep it fun
    const cmd = `ffmpeg -y -i "${input}" -af "asetrate=48000*0.88,aresample=48000" "${output}"`;
    return cmd;
  },
};

async function generateVoice(voiceId, text, settings) {
  const url = `${BASE_URL}/${voiceId}`;

  const body = {
    text,
    model_id: settings.model || 'eleven_v3',
    voice_settings: {
      stability: settings.stability ?? 0.5,
      similarity_boost: settings.similarity ?? 0.75,
      speed: settings.speed ?? 1.0,
    },
  };

  console.log(`  API call: voice=${voiceId}, stability=${body.voice_settings.stability}, speed=${body.voice_settings.speed}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

async function processCharacter(charKey, charConfig) {
  // Determine output directory - bug-king lines go to bug folder
  const outputCharDir = charKey === 'bug-king' ? 'bug' : charKey;
  const charDir = `${OUTPUT_DIR}/${outputCharDir}`;
  mkdirSync(charDir, { recursive: true });

  console.log(`\n=== ${charConfig.description} ===`);

  for (const line of charConfig.lines) {
    const rawFile = `${charDir}/${line.file}-raw.mp3`;
    const finalFile = `${charDir}/${line.file}.mp3`;

    console.log(`\n  Generating: ${line.file} - "${line.text}"`);

    try {
      const audio = await generateVoice(charConfig.voiceId, line.text, charConfig);

      if (charConfig.postProcess) {
        // Save raw version first
        writeFileSync(rawFile, audio);
        console.log(`  Saved raw: ${rawFile} (${audio.length} bytes)`);

        // Apply post-processing
        const ffmpegCmd = POST_PROCESS[charConfig.postProcess](rawFile, finalFile);
        console.log(`  Post-processing: ${ffmpegCmd}`);
        execSync(ffmpegCmd, { stdio: 'pipe' });
        console.log(`  Post-processed: ${finalFile}`);

        // Clean up raw file
        execSync(`rm "${rawFile}"`, { stdio: 'pipe' });
      } else {
        // No post-processing needed
        writeFileSync(finalFile, audio);
        console.log(`  Saved: ${finalFile} (${audio.length} bytes)`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      console.error(`  ERROR generating ${line.file}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('===========================================');
  console.log('  Ninja Keyboard Voice Generation V2');
  console.log('  Regenerating all voices except Sensei Zen');
  console.log('===========================================\n');

  const results = [];

  for (const [charKey, charConfig] of Object.entries(CHARACTERS)) {
    await processCharacter(charKey, charConfig);
    results.push({
      character: charKey,
      voiceId: charConfig.voiceId,
      stability: charConfig.stability,
      speed: charConfig.speed,
      postProcess: charConfig.postProcess || 'none',
      linesCount: charConfig.lines.length,
    });
  }

  console.log('\n\n===========================================');
  console.log('  GENERATION SUMMARY');
  console.log('===========================================\n');

  results.forEach(r => {
    console.log(`${r.character}: voiceId=${r.voiceId}, stability=${r.stability}, speed=${r.speed}, fx=${r.postProcess}, lines=${r.linesCount}`);
  });

  console.log('\nDone! All voices regenerated.');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
