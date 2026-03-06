import { writeFileSync, existsSync, mkdirSync, cpSync, readFileSync } from 'fs';

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_URL = 'https://api.elevenlabs.io/v1';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Creating Yuki V7 voice design...');
  const previewRes = await fetch(`${BASE_URL}/text-to-voice/create-previews`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_description: 'A native Israeli Sabra woman with a warm Mediterranean Hebrew accent. NOT Eastern European and NOT Russian accent at all. Pure Israeli pronunciation with natural guttural R and warm vowels. Her speech is extremely rapid — the fastest talker in any room — words tumbling out breathlessly with barely a pause. Higher pitch, youthful energy, bright and cheerful. Every sentence is a sprint. Staccato rhythm, infectious enthusiasm, competitive fire. She sounds like an anime speedster character who speaks Hebrew natively. Bubbly, fierce, unstoppable rapid delivery.',
      text: 'מי יכול להקליד מהר ממני? בואו תתחרו בי! אני הכי מהירה פה! מהר מהר מהר! עוד יותר מהר! תשברו את השיא שלכם! ניצחתי אתכם! אף אחד לא מהיר כמוני! יאללה עוד סיבוב!'
    })
  });
  const data = await previewRes.json();
  if (data.detail || !data.previews) {
    console.error('Error:', JSON.stringify(data, null, 2));
    return;
  }
  console.log(`Got ${data.previews.length} previews`);

  // Listen to all previews and pick best
  for (let i = 0; i < data.previews.length; i++) {
    const p = data.previews[i];
    console.log(`Preview ${i}: generated_voice_id=${p.generated_voice_id}, duration=${p.duration_secs}s`);
  }

  // Pick the shortest duration preview (fastest speaker)
  const sorted = [...data.previews].sort((a, b) => a.duration_secs - b.duration_secs);
  const preview = sorted[0];
  console.log(`Selected fastest preview: duration=${preview.duration_secs}s`);

  // Save all previews for comparison
  const previewDir = 'public/audio/voices/yuki/v7-previews';
  if (!existsSync(previewDir)) mkdirSync(previewDir, { recursive: true });
  for (let i = 0; i < data.previews.length; i++) {
    const p = data.previews[i];
    if (p.audio_base_64) {
      const buf = Buffer.from(p.audio_base_64, 'base64');
      writeFileSync(`${previewDir}/preview-${i}-${p.duration_secs}s.mp3`, buf);
      console.log(`  Saved preview ${i} (${p.duration_secs}s, ${buf.length} bytes)`);
    }
  }

  // Save to account
  console.log('Saving Yuki V7 to account...');
  const saveRes = await fetch(`${BASE_URL}/text-to-voice/create-voice-from-preview`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_name: 'NK-Yuki-Speed-V7',
      voice_description: 'Fastest Israeli sabra girl - pure Hebrew accent, ultra-rapid, high pitch, no Russian tone',
      generated_voice_id: preview.generated_voice_id
    })
  });
  const saveData = await saveRes.json();
  console.log('Voice ID:', saveData.voice_id);

  // Generate 3 voice lines
  const lines = [
    { id: 'yuki-challenge', text: 'מי יכול להקליד מהר ממני? בואו תתחרו בי!' },
    { id: 'yuki-speed', text: 'מהר יותר! עוד יותר מהר! תשברו את השיא!' },
    { id: 'yuki-win', text: 'ניצחתי אתכם! אף אחד לא מהיר כמוני!' },
  ];
  // Lower stability = more expressive/varied, higher style = more character
  const ttsSettings = { stability: 0.50, similarity_boost: 0.95, style: 0.95, use_speaker_boost: true };
  const charDir = 'public/audio/voices/yuki';

  if (!existsSync(`${charDir}/v6`)) mkdirSync(`${charDir}/v6`, { recursive: true });

  for (const line of lines) {
    const existing = `${charDir}/${line.id}.mp3`;
    const backup = `${charDir}/v6/${line.id}.mp3`;
    if (existsSync(existing) && !existsSync(backup)) {
      cpSync(existing, backup);
      console.log(`  Backed up ${line.id} to v6/`);
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

  // Also generate with ffmpeg speed-up for extra comparison
  console.log('\\nGenerating speed-boosted versions with ffmpeg...');
  const { execSync } = await import('child_process');
  for (const line of lines) {
    const src = `${charDir}/${line.id}.mp3`;
    const fast = `${charDir}/v7-previews/${line.id}-speed-110.mp3`;
    try {
      execSync(`MSYS_NO_PATHCONV=1 ffmpeg -y -i "${src}" -af "atempo=1.10" "${fast}"`, { stdio: 'pipe' });
      console.log(`  Speed-boosted ${line.id} (+10%)`);
    } catch (e) {
      console.log(`  ffmpeg speedup failed for ${line.id}: ${e.message}`);
    }
  }

  // Update account-voices JSON
  const voicesPath = 'public/audio/voices/voice-design-previews/account-voices-v4.json';
  const voices = JSON.parse(readFileSync(voicesPath, 'utf8'));
  voices.yuki = saveData.voice_id;
  writeFileSync(voicesPath, JSON.stringify(voices, null, 2));
  console.log('Updated voice ID in JSON');
  console.log('\\nDONE! Yuki V7 complete.');
  console.log('Listen to previews in: public/audio/voices/yuki/v7-previews/');
  console.log('Speed-boosted versions also available for comparison.');
}

main().catch(e => console.error(e));
