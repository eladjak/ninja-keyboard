/**
 * Voice Design V4 - Hebrew Fix
 *
 * Workflow:
 * 1. create-previews → generates voice character (may sound Arabic)
 * 2. create-voice-from-preview → saves voice to account
 * 3. TTS with saved voice + language_code='he' + eleven_v3 → REAL Hebrew
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const OUTPUT_DIR = 'public/audio/voices/voice-design-previews';

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// Step 1: Save a voice design preview to account
async function saveVoiceToAccount(generatedVoiceId, voiceName, voiceDescription) {
  console.log(`\n💾 Saving voice "${voiceName}" to account...`);

  const res = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      voice_name: voiceName,
      voice_description: voiceDescription,
      generated_voice_id: generatedVoiceId,
      labels: { language: 'Hebrew', use_case: 'characters', project: 'ninja-keyboard' }
    })
  });

  console.log(`Status: ${res.status}`);

  if (!res.ok) {
    const error = await res.text();
    console.log(`Error: ${error.slice(0, 300)}`);
    return null;
  }

  const data = await res.json();
  console.log(`✅ Saved! Voice ID: ${data.voice_id}`);
  return data.voice_id;
}

// Step 2: Generate speech with saved voice + Hebrew language
async function generateHebrew(voiceId, text, outputPath) {
  console.log(`\n🎤 Generating Hebrew speech: "${text.slice(0, 40)}..."`)

  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_v3',
      language_code: 'he',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.90,
        style: 0.60,
        use_speaker_boost: true
      }
    })
  });

  if (!res.ok) {
    const error = await res.text();
    console.log(`Error: ${error.slice(0, 300)}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)}KB)`);
  return true;
}

async function main() {
  // Load results from previous run
  const results = JSON.parse(readFileSync(`${OUTPUT_DIR}/results.json`, 'utf-8'));

  console.log('🎮 Voice Design V4 - Hebrew Fix Test');
  console.log('=====================================');
  console.log('Testing: Save voice to account → Generate with language_code=he\n');

  // Test with Ki (first preview) - the main hero
  const kiPreview = results.ki[0]; // Use first preview
  console.log(`Ki preview voice ID: ${kiPreview.generated_voice_id}`);

  // Step 1: Save to account
  const kiVoiceId = await saveVoiceToAccount(
    kiPreview.generated_voice_id,
    'NK-Ki-Hero-V4',
    'Young Israeli boy, curious and brave hero for Ninja Keyboard game'
  );

  if (!kiVoiceId) {
    console.log('❌ Failed to save voice to account. Aborting.');
    return;
  }

  // Step 2: Generate Hebrew speech
  await generateHebrew(
    kiVoiceId,
    'וואו! גיליתי מקש חדש! בואו נראה מה הוא עושה!',
    `${OUTPUT_DIR}/ki-hebrew-test.mp3`
  );

  // Also test with a longer line
  await new Promise(r => setTimeout(r, 2000));
  await generateHebrew(
    kiVoiceId,
    'ביחד אנחנו צוות בלתי מנוצח! קדימה חברים, בואו נלמד להקליד כמו נינג׳ות אמיתיות!',
    `${OUTPUT_DIR}/ki-hebrew-test-2.mp3`
  );

  // Test Bug too (villain)
  await new Promise(r => setTimeout(r, 2000));
  const bugPreview = results.bug[0];
  console.log(`\nBug preview voice ID: ${bugPreview.generated_voice_id}`);

  const bugVoiceId = await saveVoiceToAccount(
    bugPreview.generated_voice_id,
    'NK-Bug-Villain-V4',
    'Mischievous cartoon beetle villain for Ninja Keyboard game'
  );

  if (bugVoiceId) {
    await new Promise(r => setTimeout(r, 2000));
    await generateHebrew(
      bugVoiceId,
      'הא הא הא! אני הבאג הגדול! אני אערבב לכם את כל המקשים!',
      `${OUTPUT_DIR}/bug-hebrew-test.mp3`
    );
  }

  // Save account voice IDs
  const accountVoices = {
    ki: kiVoiceId,
    bug: bugVoiceId,
    note: 'These are SAVED to ElevenLabs account. Use with language_code=he + eleven_v3'
  };
  writeFileSync(`${OUTPUT_DIR}/account-voices.json`, JSON.stringify(accountVoices, null, 2));
  console.log('\n📋 Account voices saved to account-voices.json');
  console.log('Now listen to ki-hebrew-test.mp3 and bug-hebrew-test.mp3!');
}

main().catch(console.error);
