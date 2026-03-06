/**
 * Yuki V8 Voice Generation - Pure Israeli Sabra Speedster
 *
 * Goals vs V7:
 * - Eliminate any Russian/Eastern European tonality
 * - Increase speech speed + energy
 * - Add expressive nuances (NOT monotone)
 * - Generate 3-4 voice design variations for A/B comparison
 * - Apply ffmpeg atempo post-processing for extra speed boost
 *
 * What worked in V7: the "speed" clip was good.
 * What failed: challenge & win clips had Russian tones, too slow, monotone.
 */
import { writeFileSync, existsSync, mkdirSync, cpSync, readdirSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_KEY = process.env.ELEVENLABS_API_KEY
  || (() => {
    // Try loading from .env in scripts dir
    try {
      const env = readFileSync(new URL('./.env', import.meta.url), 'utf8');
      const match = env.match(/ELEVENLABS_API_KEY\s*=\s*(.+)/);
      if (match) return match[1].trim();
    } catch { /* ignore */ }
    // Fallback: hardcoded key from previous scripts (existing pattern)
    return 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
  })();

const BASE_URL = 'https://api.elevenlabs.io/v1';
const YUKI_DIR = 'public/audio/voices/yuki';
const V8_DIR = `${YUKI_DIR}/v8-previews`;
const V7_BACKUP = `${YUKI_DIR}/v7`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Voice Design Variations - each targets a different angle on "Israeli Sabra"
// ---------------------------------------------------------------------------
const VARIATIONS = [
  {
    id: 'A',
    label: 'Sabra Speed Runner',
    description:
      'An energetic Israeli woman speaking extremely fast Hebrew with pure Sabra accent. ' +
      'Youthful, high-pitched voice. Competitive, like a speed runner commentating. No Russian or Eastern European accent whatsoever. ' +
      'Natural Israeli Hebrew intonation. Her Rs are guttural, her vowels warm and Mediterranean. ' +
      'She sounds like she grew up in Tel Aviv and speaks a mile a minute. Bright, peppy, breathless excitement.',
    previewText:
      'בואו נראה מי הכי מהיר כאן! שברתי את השיא! אף אחד לא יעקוף אותי! מהר יותר! מהר יותר! אני יכולה לנצח! אתה חושב שאתה מהיר? תראה את זה!',
    ttsSettings: { stability: 0.40, similarity_boost: 0.95, style: 0.95, use_speaker_boost: true },
  },
  {
    id: 'B',
    label: 'Tel Aviv Sports Announcer',
    description:
      'A youthful Israeli woman with rapid-fire Hebrew speech like an excited sports announcer. ' +
      'Pure Tel Aviv accent. High-pitched, bubbly, breathless energy. Speaking so fast it is almost hard to keep up. ' +
      'NO Russian or Eastern European tonality - 100 percent Israeli born and raised. ' +
      'Staccato delivery, infectious competitive spirit. Think anime dub voice actress doing Hebrew.',
    previewText:
      'מי יכול להקליד מהר ממני? בואו תתחרו בי! יאללה! עוד סיבוב! שברתי עוד שיא! מהר מהר מהר! תשברו את השיא שלכם! ניצחתי אתכם!',
    ttsSettings: { stability: 0.35, similarity_boost: 0.95, style: 1.0, use_speaker_boost: true },
  },
  {
    id: 'C',
    label: 'Ninja Lightning Voice',
    description:
      'A Hebrew-speaking ninja character with lightning-fast speech and a youthful, high-pitched female voice. ' +
      'Pure Israeli Sabra accent. Excited, competitive energy. Each sentence bursts out rapidly. ' +
      'Sharp intonation changes - never monotone. Voice rises and falls dramatically. ' +
      'Warm Mediterranean vowels, guttural R, absolutely ZERO Eastern European influence. Fierce and fun.',
    previewText:
      'אני הכי מהירה פה! מהר מהר מהר! עוד יותר מהר! תשברו את השיא שלכם! ניצחתי אתכם! אף אחד לא מהיר כמוני! יאללה עוד סיבוב! בואו תתחרו בי!',
    ttsSettings: { stability: 0.45, similarity_boost: 0.95, style: 0.90, use_speaker_boost: true },
  },
  {
    id: 'D',
    label: 'Hyper Sabra Gamer',
    description:
      'A hyperactive Israeli woman gamer who speaks Hebrew at breakneck speed. Youthful, high-pitched voice. ' +
      'Born and raised in Israel - pure Sabra through and through. Accent is warm, Mediterranean, ' +
      'with natural guttural Hebrew sounds. Sounds like live-streaming a speed run and cannot contain ' +
      'the excitement. Dramatic intonation swings - whisper-to-shout energy shifts within a single sentence. ' +
      'Absolutely NO Eastern European, Russian, or Slavic undertones. Peppy, fierce, unstoppable.',
    previewText:
      'שברתי את השיא! אף אחד לא יעקוף אותי! מהר יותר! מהר יותר! אני יכולה לנצח! בואו נראה מי הכי מהיר כאן! אתה חושב שאתה מהיר? תראה את זה!',
    ttsSettings: { stability: 0.38, similarity_boost: 0.92, style: 1.0, use_speaker_boost: true },
  },
];

// ---------------------------------------------------------------------------
// Test lines to generate for winning variations
// ---------------------------------------------------------------------------
const TEST_LINES = [
  { id: 'yuki-challenge', text: 'בואו נראה מי הכי מהיר כאן!' },
  { id: 'yuki-win',       text: 'שברתי את השיא! אף אחד לא יעקוף אותי!' },
  { id: 'yuki-encourage', text: 'מהר יותר! מהר יותר! אני יכולה לנצח!' },
  { id: 'yuki-taunt',     text: 'אתה חושב שאתה מהיר? תראה את זה!' },
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function createPreviews(variation) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Creating voice preview: Variation ${variation.id} - ${variation.label}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Description: ${variation.description.slice(0, 120)}...`);

  const res = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_description: variation.description,
      text: variation.previewText,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log(`  FAILED (${res.status}): ${errText.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  if (!data.previews?.length) {
    console.log('  No previews returned');
    return null;
  }

  console.log(`  Got ${data.previews.length} previews:`);

  // Save all previews for listening comparison
  const results = [];
  for (let i = 0; i < data.previews.length; i++) {
    const p = data.previews[i];
    const buf = Buffer.from(p.audio_base_64, 'base64');
    const filename = `var-${variation.id}-preview-${i}-${p.duration_secs?.toFixed(1) || 'unknown'}s.mp3`;
    writeFileSync(`${V8_DIR}/${filename}`, buf);
    console.log(`  [${i}] ${filename} (${(buf.length / 1024).toFixed(1)}KB, ${p.duration_secs?.toFixed(1)}s) voice_id=${p.generated_voice_id}`);
    results.push({
      index: i,
      filename,
      voiceId: p.generated_voice_id,
      duration: p.duration_secs,
      size: buf.length,
    });
  }

  return results;
}

async function saveToAccount(generatedVoiceId, name, desc) {
  console.log(`\nSaving "${name}" to account...`);
  const res = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_name: name,
      voice_description: desc,
      generated_voice_id: generatedVoiceId,
      labels: { language: 'Hebrew', project: 'ninja-keyboard', version: 'v8' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log(`  Save FAILED (${res.status}): ${errText.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  console.log(`  Saved! Account voice ID: ${data.voice_id}`);
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
      voice_settings: settings,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log(`  TTS FAILED for ${outputPath}: ${errText.slice(0, 200)}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`  OK: ${outputPath.split('/').pop()} (${(buffer.length / 1024).toFixed(1)}KB)`);
  return true;
}

function applyAtempo(inputPath, outputPath, tempo) {
  const label = `${Math.round((tempo - 1) * 100)}%`;
  try {
    // Node child_process uses cmd.exe on Windows -- no MSYS_NO_PATHCONV needed
    execSync(`ffmpeg -y -i "${inputPath}" -af "atempo=${tempo}" "${outputPath}"`, { stdio: 'pipe' });
    console.log(`  Speed +${label}: ${outputPath.split('/').pop()}`);
    return true;
  } catch (e) {
    console.log(`  ffmpeg FAILED (+${label}) for ${inputPath}: ${e.message?.slice(0, 100)}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60));
  console.log('  YUKI V8 -- Pure Israeli Sabra Voice Iteration');
  console.log('  Goal: eliminate Russian tones, boost speed + expressiveness');
  console.log('='.repeat(60));

  // ----- Step 0: Setup directories -----
  if (!existsSync(V8_DIR)) mkdirSync(V8_DIR, { recursive: true });
  if (!existsSync(V7_BACKUP)) mkdirSync(V7_BACKUP, { recursive: true });

  // ----- Step 1: Back up current V7 files to v7/ -----
  console.log('\n--- Step 1: Backup current files to v7/ ---');
  const currentFiles = readdirSync(YUKI_DIR).filter(f => f.endsWith('.mp3'));
  for (const f of currentFiles) {
    const src = `${YUKI_DIR}/${f}`;
    const dst = `${V7_BACKUP}/${f}`;
    if (!existsSync(dst)) {
      cpSync(src, dst);
      console.log(`  Backed up: ${f} -> v7/`);
    } else {
      console.log(`  Already backed up: ${f}`);
    }
  }

  // ----- Step 2: Generate voice design previews for all variations -----
  console.log('\n--- Step 2: Voice Design Previews (4 variations) ---');
  const allPreviews = {};

  for (const variation of VARIATIONS) {
    const previews = await createPreviews(variation);
    if (previews) {
      allPreviews[variation.id] = {
        label: variation.label,
        description: variation.description,
        ttsSettings: variation.ttsSettings,
        previews,
      };
    }
    await sleep(4000); // Rate limit safety
  }

  // Save preview metadata
  writeFileSync(
    `${V8_DIR}/previews-metadata.json`,
    JSON.stringify(allPreviews, null, 2)
  );
  console.log(`\nSaved preview metadata to ${V8_DIR}/previews-metadata.json`);

  // ----- Step 3: Pick fastest preview from each variation -----
  console.log('\n--- Step 3: Selecting fastest preview per variation ---');
  const winners = [];

  for (const [varId, data] of Object.entries(allPreviews)) {
    const sorted = [...data.previews].sort((a, b) => (a.duration || 999) - (b.duration || 999));
    const fastest = sorted[0];
    console.log(`  Var ${varId} (${data.label}): fastest = preview ${fastest.index} (${fastest.duration?.toFixed(1)}s)`);
    winners.push({
      variationId: varId,
      label: data.label,
      generatedVoiceId: fastest.voiceId,
      duration: fastest.duration,
      ttsSettings: data.ttsSettings,
    });
  }

  // ----- Step 4: Save winning voices to account & generate test lines -----
  console.log('\n--- Step 4: Save to account + generate test lines ---');

  for (const winner of winners) {
    const accountName = `NK-Yuki-Speed-V8-${winner.variationId}`;
    const accountDesc = `Yuki V8 Var ${winner.variationId}: ${winner.label}`;

    const voiceId = await saveToAccount(winner.generatedVoiceId, accountName, accountDesc);
    if (!voiceId) {
      console.log(`  Skipping Var ${winner.variationId} -- save failed`);
      await sleep(2000);
      continue;
    }

    winner.accountVoiceId = voiceId;

    // Generate test lines with this voice
    const varDir = `${V8_DIR}/var-${winner.variationId}`;
    if (!existsSync(varDir)) mkdirSync(varDir, { recursive: true });

    console.log(`\n  Generating ${TEST_LINES.length} test lines for Var ${winner.variationId}...`);
    for (const line of TEST_LINES) {
      const rawPath = `${varDir}/${line.id}-raw.mp3`;
      const ok = await generateLine(voiceId, line.text, rawPath, winner.ttsSettings);
      if (!ok) continue;
      await sleep(1500);

      // Apply ffmpeg speed-up: 10% and 15%
      const fast10 = `${varDir}/${line.id}-tempo110.mp3`;
      const fast15 = `${varDir}/${line.id}-tempo115.mp3`;
      applyAtempo(rawPath, fast10, 1.10);
      applyAtempo(rawPath, fast15, 1.15);

      // Also create a combined version: atempo + slight pitch tweak for more energy
      const energized = `${varDir}/${line.id}-energized.mp3`;
      try {
        execSync(
          `ffmpeg -y -i "${rawPath}" -af "atempo=1.12,equalizer=f=3000:width_type=o:width=2:g=3" "${energized}"`,
          { stdio: 'pipe' }
        );
        console.log(`  Energized: ${energized.split('/').pop()}`);
      } catch (e) {
        console.log(`  Energized ffmpeg failed: ${e.message?.slice(0, 80)}`);
      }
    }

    await sleep(3000);
  }

  // ----- Step 5: Save results summary -----
  console.log('\n--- Step 5: Results Summary ---');
  const summary = {
    version: 'v8',
    date: new Date().toISOString(),
    goal: 'Pure Israeli Sabra accent, ultra-fast, expressive (no Russian tones)',
    v7feedback: 'Only speed clip was good. Challenge + win had Russian tones, too slow, monotone.',
    variations: winners.map(w => ({
      id: w.variationId,
      label: w.label,
      previewDuration: w.duration,
      accountVoiceId: w.accountVoiceId || 'FAILED',
      ttsSettings: w.ttsSettings,
    })),
    testLines: TEST_LINES,
    postProcessing: [
      { suffix: '-raw.mp3', description: 'Original TTS output' },
      { suffix: '-tempo110.mp3', description: 'ffmpeg atempo=1.10 (+10% speed)' },
      { suffix: '-tempo115.mp3', description: 'ffmpeg atempo=1.15 (+15% speed)' },
      { suffix: '-energized.mp3', description: 'ffmpeg atempo=1.12 + EQ boost at 3kHz for brightness' },
    ],
    nextSteps: [
      '1. Listen to ALL v8-previews/var-*/yuki-*-tempo110.mp3 files',
      '2. Compare across variations A/B/C/D',
      '3. Pick the best variation + tempo combo',
      '4. Copy winning files to yuki/ main folder',
      '5. Update account-voices-v4.json with winning voice ID',
    ],
  };

  writeFileSync(`${V8_DIR}/v8-results.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('  DONE! Yuki V8 generation complete.');
  console.log(`  Previews: ${V8_DIR}/`);
  console.log(`  Test lines: ${V8_DIR}/var-{A,B,C,D}/`);
  console.log('  Each line has 4 versions: raw, tempo110, tempo115, energized');
  console.log('='.repeat(60));
  console.log('\nNEXT: Listen to all variations and pick the winner!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
