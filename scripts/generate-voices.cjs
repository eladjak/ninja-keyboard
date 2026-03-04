const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_3eb9c9aa286373eca54903fc91d399f28848240fb17d4d91';
const BASE_DIR = path.join(__dirname, '..', 'public', 'audio', 'voices');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generate(voiceId, text, outputPath, speed, stability) {
  const fullPath = path.join(BASE_DIR, outputPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`\nGenerating: ${outputPath}`);
  console.log(`  Voice: ${voiceId} | Speed: ${speed} | Stability: ${stability}`);
  console.log(`  Text: ${text}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_v3',
        voice_settings: {
          stability: stability,
          similarity_boost: 0.75,
          style: 0,
          speed: speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error(`  FAILED (${response.status}): ${errText}`);
    return false;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`  SUCCESS: ${fullPath} (${sizeKB} KB)`);
  return true;
}

// Voice line definitions
// Format: [voiceId, text, outputPath, speed, stability]
const VOICE_LINES = [
  // ── Ki (Liam - TX3LPaxmHKxFdv7VOQHJ) ──
  ['TX3LPaxmHKxFdv7VOQHJ', 'וואו! המקלדת הזו זוהרת!', 'ki/ki-discovery.mp3', 1.1, 0.5],
  ['TX3LPaxmHKxFdv7VOQHJ', 'ניצחנו! אבל הוא ברח...', 'ki/ki-victory.mp3', 1.1, 0.5],
  ['TX3LPaxmHKxFdv7VOQHJ', 'ביחד אנחנו חזקים יותר!', 'ki/ki-team.mp3', 1.1, 0.5],
  ['TX3LPaxmHKxFdv7VOQHJ', 'עכשיו אנחנו מוכנים!', 'ki/ki-final.mp3', 1.1, 0.5],

  // ── Mika (Jessica - cgSgspJ2msm6clMCkdW9) ──
  ['cgSgspJ2msm6clMCkdW9', 'בוא ננסה ביחד, קי!', 'mika/mika-intro.mp3', 1.05, 0.5],
  ['cgSgspJ2msm6clMCkdW9', 'לא ניתן לבאג לנצח!', 'mika/mika-fight.mp3', 1.05, 0.5],
  ['cgSgspJ2msm6clMCkdW9', 'בואי נפרוץ את המערכת!', 'mika/mika-hack.mp3', 1.05, 0.5],

  // ── Sensei Zen (Bill - pqHfZKP75CvOlQylNhV4) ──
  ['pqHfZKP75CvOlQylNhV4', 'סבלנות היא הנשק החזק ביותר!', 'sensei-zen/sensei-patience.mp3', 0.8, 0.7],
  ['pqHfZKP75CvOlQylNhV4', 'כל מסע מתחיל בלחיצה אחת!', 'sensei-zen/sensei-journey.mp3', 0.8, 0.7],
  ['pqHfZKP75CvOlQylNhV4', 'נינג\'ה אמיתי...', 'sensei-zen/sensei-final.mp3', 0.8, 0.7],

  // ── Bug (Callum - N2lVS1w4EtoT3dr4eOWO) ──
  ['N2lVS1w4EtoT3dr4eOWO', 'הא הא! בלבלתי לכם את האותיות!', 'bug/bug-scramble.mp3', 1.2, 0.4],
  ['N2lVS1w4EtoT3dr4eOWO', 'עכשיו אני מבלבל עשר מילים שלמות!', 'bug/bug-boss.mp3', 1.2, 0.4],
  ['N2lVS1w4EtoT3dr4eOWO', 'אני מלך הבאגים! לעולם לא תנצחו אותי!', 'bug/bug-king.mp3', 1.2, 0.4],
  ['N2lVS1w4EtoT3dr4eOWO', 'אוי! אחזוווור!', 'bug/bug-defeat.mp3', 1.2, 0.4],

  // ── Glitch (Will - bIHbv24MWmeRgasZH58o) ──
  ['bIHbv24MWmeRgasZH58o', 'גגג-גליץ\' פ-פ-פה!', 'glitch/glitch-intro.mp3', 1.0, 0.2],
  ['bIHbv24MWmeRgasZH58o', 'א-א-אני לא רוצה להיות ר-ר-רע!', 'glitch/glitch-redemption.mp3', 1.0, 0.25],
  ['bIHbv24MWmeRgasZH58o', 'ת-תודה...', 'glitch/glitch-thanks.mp3', 1.0, 0.4],

  // ── Yuki (Laura - FGY2WhTYpPnrIDTdsKH5) ──
  ['FGY2WhTYpPnrIDTdsKH5', 'אני הכי מהירה בדוג\'ו!', 'yuki/yuki-challenge.mp3', 1.2, 0.5],

  // ── Luna (Lily - pFZP5JQG7iQjIQuC4Bku) ──
  ['pFZP5JQG7iQjIQuC4Bku', 'נשימה עמוקה, ואז מתחילים...', 'luna/luna-breathe.mp3', 0.9, 0.6],

  // ── Kai (Charlie - IKne3meq5aSn9XLyUdCD) ──
  ['IKne3meq5aSn9XLyUdCD', 'בוא נלחם!', 'kai/kai-fight.mp3', 1.1, 0.5],

  // ── Noa (Sarah - EXAVITQu4vr4xnSDxMaL) ──
  ['EXAVITQu4vr4xnSDxMaL', 'אני כאן, לא נורא לטעות!', 'noa/noa-heal.mp3', 0.95, 0.6],

  // ── Rex (Roger - CwhRBWXzGAHq8TQ4Fs17) ──
  ['CwhRBWXzGAHq8TQ4Fs17', 'גם עם ידיים קטנות - אני פה!', 'rex/rex-play.mp3', 1.0, 0.5],
];

async function main() {
  console.log('=== Ninja Keyboard Voice Generation ===');
  console.log(`Total lines to generate: ${VOICE_LINES.length}`);
  console.log(`Output directory: ${BASE_DIR}\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < VOICE_LINES.length; i++) {
    const [voiceId, text, outputPath, speed, stability] = VOICE_LINES[i];
    console.log(`\n[${i + 1}/${VOICE_LINES.length}]`);

    const ok = await generate(voiceId, text, outputPath, speed, stability);
    if (ok) {
      success++;
    } else {
      failed++;
    }

    // Wait 2 seconds between calls to avoid rate limits
    if (i < VOICE_LINES.length - 1) {
      console.log('  Waiting 2s before next call...');
      await sleep(2000);
    }
  }

  console.log('\n\n=== Generation Complete ===');
  console.log(`Success: ${success}/${VOICE_LINES.length}`);
  console.log(`Failed: ${failed}/${VOICE_LINES.length}`);

  // List all generated files
  console.log('\n=== Generated Files ===');
  const characters = fs.readdirSync(BASE_DIR);
  for (const char of characters) {
    const charDir = path.join(BASE_DIR, char);
    if (!fs.statSync(charDir).isDirectory()) continue;
    const files = fs.readdirSync(charDir).filter(f => f.endsWith('.mp3'));
    for (const file of files) {
      const filePath = path.join(charDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  ${char}/${file} - ${sizeKB} KB`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
