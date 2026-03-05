/**
 * Ninja Keyboard Voice Generation V3
 *
 * Key improvements over V2:
 * 1. Uses language_code: 'he' to force Hebrew phonetics on ElevenLabs v3
 * 2. Higher stability + similarity_boost per Gemini analysis (preserves Hebrew gutturals)
 * 3. Added 'style' parameter for emotional expressiveness per character
 * 4. Optimized per-character settings based on Gemini Vision analysis of model sheets
 * 5. Speaker boost enabled for clearer articulation
 *
 * NOTE: Community voices require paid plan. Using premade voices with optimized settings.
 * Sensei Zen is EXCLUDED (already approved).
 */

import { writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const OUTPUT_DIR = 'C:/Users/eladj/projects/ninja-keyboard/public/audio/voices';

// ============================================================
// VOICE IDS (Premade voices - only ones available on free tier)
// ============================================================
const VOICES = {
  // Boys
  WILL: 'bIHbv24MWmeRgasZH58o',      // Will - Relaxed Optimist (young male)
  HARRY: 'SOYHLrjzK2X1ezoPC6cr',     // Harry - Fierce Warrior (young male)
  LIAM: 'TX3LPaxmHKxFdv7VOQHJ',      // Liam - Energetic (young male)
  CHARLIE: 'IKne3meq5aSn9XLyUdCD',    // Charlie - Deep, Confident (young male, Australian)

  // Girls
  LAURA: 'FGY2WhTYpPnrIDTdsKH5',     // Laura - Enthusiast, Quirky (young female)
  JESSICA: 'cgSgspJ2msm6clMCkdW9',   // Jessica - Playful, Bright (young female)
  SARAH: 'EXAVITQu4vr4xnSDxMaL',     // Sarah - Mature, Reassuring (young female)
  LILY: 'pFZP5JQG7iQjIQuC4Bku',      // Lily - Velvety Actress (middle-aged female, British)
  ALICE: 'Xb7hH8MSUJpSbSDYk0k2',     // Alice - Clear, Engaging Educator (female, British)

  // Villains / Special
  CALLUM: 'N2lVS1w4EtoT3dr4eOWO',    // Callum - Husky Trickster (male)
  BRIAN: 'nPczCjzI2devNBz1zQrb',      // Brian - Deep, Resonant (male)
  GEORGE: 'JBFqnCBsd6RMkjVDRZzb',    // George - Warm, Captivating (middle-aged male)
};

// ============================================================
// CHARACTER DEFINITIONS
// Settings optimized based on Gemini Vision analysis
// ============================================================
const CHARACTERS = {
  ki: {
    voiceId: VOICES.WILL,
    model: 'eleven_v3',
    stability: 0.78,         // Gemini: 0.75-0.85 for consistent Hebrew cadence
    similarity: 0.92,        // Gemini: 0.90-0.98 to preserve guttural sounds
    speed: 1.15,             // Gemini: 1.1-1.3 for energetic boy
    style: 0.65,             // Gemini: 0.6-0.7 for curiosity/bravery expressiveness
    description: 'Ki - 10yo boy, curious and brave hero',
    lines: [
      { file: 'ki-discovery', text: 'וואו! המקלדת הזו זוהרת!' },
      { file: 'ki-team', text: 'ביחד אנחנו חזקים יותר!' },
      { file: 'ki-victory', text: 'ניצחנו! אבל הוא ברח...' },
      { file: 'ki-final', text: 'עכשיו אנחנו מוכנים!' },
    ],
    postProcess: null,
  },
  mika: {
    voiceId: VOICES.LAURA,
    model: 'eleven_v3',
    stability: 0.80,         // Gemini: 0.75-0.85 for confident, consistent delivery
    similarity: 0.95,        // Gemini: 0.95-1.0 to preserve Hebrew nuances
    speed: 1.10,             // Gemini: 1.05-1.15 for quick-witted tech girl
    style: 0.65,             // Gemini: 0.6-0.7 for enthusiasm + confidence
    description: 'Mika - 10-11yo girl, confident tech-savvy hacker',
    lines: [
      { file: 'mika-intro', text: 'בוא ננסה ביחד, קי!' },
      { file: 'mika-fight', text: 'לא ניתן לבאג לנצח!' },
      { file: 'mika-hack', text: 'בואי נפרוץ את המערכת!' },
    ],
    postProcess: null,
  },
  yuki: {
    voiceId: VOICES.JESSICA,
    model: 'eleven_v3',
    stability: 0.68,         // Gemini: 0.65-0.75 for expressive speed ninja
    similarity: 0.90,        // Gemini: 0.85-0.95 for consistent character
    speed: 1.25,             // Gemini: 1.1-1.3 for speed ninja
    style: 0.80,             // Gemini: 0.7-0.9 for high energy enthusiasm
    description: 'Yuki - Young girl, fast and competitive speed ninja',
    lines: [
      { file: 'yuki-challenge', text: 'אני הכי מהירה בדוג\'ו!' },
    ],
    postProcess: null,
  },
  luna: {
    voiceId: VOICES.SARAH,
    model: 'eleven_v3',
    stability: 0.85,         // Gemini: 0.8-0.9 for consistent calm presence
    similarity: 0.90,        // Gemini: 0.85-0.95 to preserve gentle timbre
    speed: 0.92,             // Gemini: 0.9-1.0 for deliberate, mindful pace
    style: 0.30,             // Gemini: 0.2-0.4 for understated, serene delivery
    description: 'Luna - Young girl, calm serene mindful ninja',
    lines: [
      { file: 'luna-breathe', text: 'נשימה עמוקה... ואז מתחילים.' },
    ],
    postProcess: null,
  },
  kai: {
    voiceId: VOICES.HARRY,
    model: 'eleven_v3',
    stability: 0.70,         // Gemini: 0.65-0.85 for passionate expressiveness
    similarity: 0.88,        // Gemini: 0.75-0.95 for maintaining Hebrew sounds
    speed: 1.25,             // Gemini: 1.1-1.4 for fiery hot-headed warrior
    style: 0.80,             // Gemini: 0.6-0.9 for dramatic warrior energy
    description: 'Kai - Young boy, fiery warrior',
    lines: [
      { file: 'kai-fight', text: 'בוא נלחם!' },
    ],
    postProcess: null,
  },
  noa: {
    voiceId: VOICES.ALICE,    // Changed from Jessica - Alice is clearer/gentler
    model: 'eleven_v3',
    stability: 0.72,         // Gemini: 0.65-0.75 for warmth + natural nuance
    similarity: 0.90,        // Gemini: 0.85-0.95 for consistent gentle voice
    speed: 0.98,             // Gemini: 0.9-1.1 slightly slower for gentle healer
    style: 0.50,             // Gemini: 0.4-0.6 for gentle supportive expression
    description: 'Noa - Young girl, gentle healer, caring and supportive',
    lines: [
      { file: 'noa-heal', text: 'אני כאן, לא נורא לטעות!' },
    ],
    postProcess: null,
  },
  bug: {
    voiceId: VOICES.LIAM,     // Changed from Callum - Liam is more energetic/young
    model: 'eleven_v3',
    stability: 0.50,         // Gemini: 0.45-0.65 for chaotic variation
    similarity: 0.82,        // Gemini: 0.75-0.90 for character consistency
    speed: 1.30,             // Gemini: 1.2-1.6 for manic bug energy
    style: 0.90,             // Gemini: 0.7-1.0 for theatrical villain
    description: 'Bug - Mischievous digital beetle villain',
    lines: [
      { file: 'bug-scramble', text: 'הא הא! בלבלתי לכם את האותיות!' },
      { file: 'bug-boss', text: 'עכשיו אני מבלבל עשר מילים שלמות!' },
      { file: 'bug-defeat', text: 'אוי! אחזוווור!' },
    ],
    postProcess: 'bug',
  },
  'bug-king': {
    voiceId: VOICES.CALLUM,   // Keep Callum for Bug King - deeper/huskier for boss
    model: 'eleven_v3',
    stability: 0.55,         // Slightly more stable for imposing authority
    similarity: 0.85,
    speed: 0.88,             // Slower for imposing gravitas
    style: 0.85,             // High for dramatic boss entrance
    description: 'Bug King - Imposing boss version of Bug',
    lines: [
      { file: 'bug-king', text: 'אני מלך הבאגים! לעולם לא תנצחו אותי!' },
    ],
    postProcess: 'bug-king',
  },
  glitch: {
    voiceId: VOICES.LIAM,
    model: 'eleven_v3',
    stability: 0.25,         // Gemini: 0.2-0.4 LOW for maximum glitchiness
    similarity: 0.85,        // Gemini: 0.8-0.9 to keep core voice recognizable
    speed: 1.0,              // Gemini: 0.8-1.2 moderate base, stability adds chaos
    style: 0.60,             // Gemini: 0.5-0.7 for emotional shifts
    description: 'Glitch - Unstable pixel entity, stutters and glitches',
    lines: [
      { file: 'glitch-intro', text: 'גגג-גליץ\' פ-פ-פה!' },
      { file: 'glitch-redemption', text: 'א-א-אני לא רוצה להיות ר-ר-רע!' },
      { file: 'glitch-thanks', text: 'ת-תודה...' },
    ],
    postProcess: 'glitch',
  },
  rex: {
    voiceId: VOICES.BRIAN,
    model: 'eleven_v3',
    stability: 0.70,         // Gemini: 0.65-0.75 for natural warmth with variation
    similarity: 0.90,        // Gemini: 0.85-0.95 for consistent dino character
    speed: 0.95,             // Gemini: 1.0-1.2 but we pitch-down later so slightly slower
    style: 0.80,             // Gemini: 0.7-0.9 for cool/funny/encouraging
    description: 'Rex - Cool dinosaur, funny and encouraging',
    lines: [
      { file: 'rex-play', text: 'גם עם ידיים קטנות - אני פה!' },
    ],
    postProcess: 'rex',
  },
};

// ============================================================
// POST-PROCESSING EFFECTS (ffmpeg)
// ============================================================
const POST_PROCESS = {
  bug: (input, output) => {
    // Pitch up 12% + digital echo for mischievous insect feel
    return `ffmpeg -y -i "${input}" -af "asetrate=48000*1.12,aresample=48000,aecho=0.8:0.88:50:0.35" "${output}"`;
  },
  'bug-king': (input, output) => {
    // Pitch down 8% + heavy reverb for imposing boss
    return `ffmpeg -y -i "${input}" -af "asetrate=48000*0.92,aresample=48000,aecho=0.8:0.7:80:0.5" "${output}"`;
  },
  glitch: (input, output) => {
    // Tremolo for digital stutter + light distortion + echo
    return `ffmpeg -y -i "${input}" -af "tremolo=f=8:d=0.6,aecho=0.8:0.5:25:0.3" "${output}"`;
  },
  rex: (input, output) => {
    // Pitch down 10% for dinosaur depth (less than V2's 12% for more natural feel)
    return `ffmpeg -y -i "${input}" -af "asetrate=48000*0.90,aresample=48000" "${output}"`;
  },
};

// ============================================================
// BACKUP CURRENT V2 FILES TO v2/ SUBDIRECTORIES
// ============================================================
function backupV2Files() {
  console.log('\n=== Backing up current V2 files to v2/ subdirectories ===\n');

  const charDirs = ['ki', 'mika', 'yuki', 'luna', 'kai', 'noa', 'bug', 'glitch', 'rex'];

  for (const charDir of charDirs) {
    const charPath = `${OUTPUT_DIR}/${charDir}`;
    const v2Path = `${charPath}/v2`;

    if (!existsSync(charPath)) {
      console.log(`  Skip ${charDir}: directory doesn't exist`);
      continue;
    }

    // Create v2 backup directory
    mkdirSync(v2Path, { recursive: true });

    // Find mp3 files in the character directory (not in subdirectories)
    try {
      const files = readdirSync(charPath);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));

      for (const file of mp3Files) {
        const src = `${charPath}/${file}`;
        const dst = `${v2Path}/${file}`;
        try {
          cpSync(src, dst);
          console.log(`  Backed up: ${charDir}/${file} -> ${charDir}/v2/${file}`);
        } catch (e) {
          console.log(`  Warning: Could not backup ${file}: ${e.message}`);
        }
      }
    } catch (e) {
      console.log(`  Warning: Could not read ${charDir}: ${e.message}`);
    }
  }

  console.log('\n  V2 backup complete.\n');
}

// ============================================================
// VOICE GENERATION
// ============================================================
async function generateVoice(voiceId, text, settings) {
  const url = `${BASE_URL}/${voiceId}`;

  const body = {
    text,
    model_id: settings.model || 'eleven_v3',
    language_code: 'he',  // NEW in V3: Force Hebrew language processing
    voice_settings: {
      stability: settings.stability ?? 0.5,
      similarity_boost: settings.similarity ?? 0.75,
      speed: settings.speed ?? 1.0,
      style: settings.style ?? 0.5,
      use_speaker_boost: true,  // NEW in V3: Clearer articulation
    },
  };

  console.log(`  API: voice=${voiceId}, stability=${body.voice_settings.stability}, similarity=${body.voice_settings.similarity_boost}, speed=${body.voice_settings.speed}, style=${body.voice_settings.style}, lang=he`);

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
        writeFileSync(rawFile, audio);
        console.log(`  Saved raw: ${rawFile} (${audio.length} bytes)`);

        const ffmpegCmd = POST_PROCESS[charConfig.postProcess](rawFile, finalFile);
        console.log(`  Post-processing: ${ffmpegCmd}`);
        execSync(ffmpegCmd, { stdio: 'pipe' });
        console.log(`  Post-processed: ${finalFile}`);

        // Clean up raw file
        try {
          execSync(`rm "${rawFile}"`, { stdio: 'pipe' });
        } catch (e) {
          // Ignore cleanup errors on Windows
        }
      } else {
        writeFileSync(finalFile, audio);
        console.log(`  Saved: ${finalFile} (${audio.length} bytes)`);
      }

      // Rate limit delay
      await new Promise(r => setTimeout(r, 700));

    } catch (error) {
      console.error(`  ERROR generating ${line.file}: ${error.message}`);
    }
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('===========================================');
  console.log('  Ninja Keyboard Voice Generation V3');
  console.log('  Optimized for authentic Hebrew accent');
  console.log('  Using language_code=he + Gemini-tuned settings');
  console.log('===========================================');

  // Step 1: Backup V2 files
  backupV2Files();

  // Step 2: Generate all voices
  const results = [];

  for (const [charKey, charConfig] of Object.entries(CHARACTERS)) {
    await processCharacter(charKey, charConfig);
    results.push({
      character: charKey,
      voiceId: charConfig.voiceId,
      stability: charConfig.stability,
      similarity: charConfig.similarity,
      speed: charConfig.speed,
      style: charConfig.style,
      postProcess: charConfig.postProcess || 'none',
      linesCount: charConfig.lines.length,
    });
  }

  // Step 3: Print summary
  console.log('\n\n===========================================');
  console.log('  GENERATION SUMMARY');
  console.log('===========================================\n');

  console.log('V3 Key Changes from V2:');
  console.log('  - Added language_code: "he" for Hebrew phonetic processing');
  console.log('  - Higher stability (0.68-0.85) to preserve Hebrew cadence');
  console.log('  - Higher similarity_boost (0.82-0.95) to preserve gutturals');
  console.log('  - Added style parameter per Gemini analysis');
  console.log('  - Speaker boost enabled for clearer articulation');
  console.log('  - Noa: Changed from Jessica to Alice (clearer/gentler)');
  console.log('  - Bug: Changed from Callum to Liam (more energetic/young)');
  console.log('  - Bug King: Kept Callum (deeper/huskier for boss)');
  console.log('  - Rex: Reduced pitch-down from 12% to 10% for natural feel');
  console.log('');

  results.forEach(r => {
    console.log(`${r.character}: voice=${r.voiceId}, stab=${r.stability}, sim=${r.similarity}, spd=${r.speed}, sty=${r.style}, fx=${r.postProcess}, lines=${r.linesCount}`);
  });

  console.log('\nDone! V2 files backed up to v2/ subdirectories.');
  console.log('V3 files are now in the main character directories.');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
