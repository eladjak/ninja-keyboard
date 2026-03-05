import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Creating Yuki V6 voice design...');
  const previewRes = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_description: 'The FASTEST voice ever. A young Israeli girl who talks like a lightning bolt - rapid-fire delivery, breathlessly quick, words tumbling out in pure excitement. HIGHER pitch, YOUNGER sounding, super energetic. Every sentence should feel like a sprint - fast, precise, staccato rhythm. She sounds genuinely FAST like she is racing against time itself. Precise nuances on every syllable despite the incredible speed. Think anime speedster character with infectious enthusiasm. Natural Israeli Hebrew but extremely RAPID cadence. Bubbly, fierce, unstoppable.',
      text: 'מי יכול להקליד מהר ממני? אתגר אותי! אני הכי מהירה בדוג׳ו! מהר יותר! עוד יותר מהר! שבור את השיא! ניצחתי! אף אחד לא מהיר ממני! בואו נראה מי הכי מהיר!'
    })
  });
  const data = await previewRes.json();
  if (data.detail || !data.previews) {
    console.error('Error:', JSON.stringify(data, null, 2));
    return;
  }
  console.log(`Got ${data.previews.length} previews`);
  const preview = data.previews[0];
  console.log('Preview keys:', Object.keys(preview).join(', '));

  // Save to account
  console.log('Saving Yuki V6 to account...');
  const saveRes = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_name: 'NK-Yuki-Speed-V6',
      voice_description: 'Lightning-fast Israeli girl - rapid-fire, highest pitch, youngest, Flash-like',
      generated_voice_id: preview.generated_voice_id
    })
  });
  const saveData = await saveRes.json();
  console.log('Voice ID:', saveData.voice_id);

  // Generate 3 voice lines
  const lines = [
    { id: 'yuki-challenge', text: 'מי יכול להקליד מהר ממני? אתגר אותי!' },
    { id: 'yuki-speed', text: 'מהר יותר! עוד יותר מהר! שבור את השיא!' },
    { id: 'yuki-win', text: 'ניצחתי! אף אחד לא מהיר ממני!' },
  ];
  const ttsSettings = { stability: 0.60, similarity_boost: 0.92, style: 0.90, use_speaker_boost: true };
  const charDir = 'public/audio/voices/yuki';

  if (!existsSync(`${charDir}/v4`)) mkdirSync(`${charDir}/v4`, { recursive: true });

  for (const line of lines) {
    const existing = `${charDir}/${line.id}.mp3`;
    const backup = `${charDir}/v4/${line.id}.mp3`;
    if (existsSync(existing) && !existsSync(backup)) {
      cpSync(existing, backup);
      console.log(`  Backed up ${line.id} to v4/`);
    }

    console.log(`TTS: ${line.id}...`);
    await sleep(1500);
    const ttsRes = await fetch(`${BASE_URL}/text-to-speech/${saveData.voice_id}`, {
      method: 'POST',
      headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: line.text,
        model_id: 'eleven_v3',
        language_code: 'he',
        voice_settings: ttsSettings
      })
    });
    const buf = Buffer.from(await ttsRes.arrayBuffer());
    writeFileSync(`${charDir}/${line.id}.mp3`, buf);
    console.log(`  OK (${buf.length} bytes)`);
  }

  // Update account-voices JSON
  const voicesPath = 'public/audio/voices/voice-design-previews/account-voices-v4.json';
  const voices = JSON.parse(readFileSync(voicesPath, 'utf8'));
  voices.yuki = saveData.voice_id;
  writeFileSync(voicesPath, JSON.stringify(voices, null, 2));
  console.log('Updated voice ID in JSON');
  console.log('DONE! Yuki V6 complete.');
}

main().catch(e => console.error(e));
