// Usage: node scripts/review-character-art.mjs image1.jpg image2.jpg [character-name]
//
// Example: node scripts/review-character-art.mjs \
//   public/images/characters/model-sheets/sensei-zen-v2.jpg \
//   public/images/characters/expressions/zen-expressions-v2.jpg \
//   "sensei-zen"
//
// If character-name is provided, also loads Visual DNA from character-visual-bible.json
// and checks if the images match the canonical reference.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from nano-banana-poster
const envPath = path.join(process.env.HOME || process.env.USERPROFILE, '.claude/skills/nano-banana-poster/scripts/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim();

if (!apiKey) {
  console.error('GEMINI_API_KEY not found');
  process.exit(1);
}

const [,, img1Path, img2Path, characterName] = process.argv;

if (!img1Path || !img2Path) {
  console.error('Usage: node review-character-art.mjs <image1> <image2> [character-name]');
  process.exit(1);
}

// Read images as base64
const img1 = fs.readFileSync(path.resolve(img1Path));
const img2 = fs.readFileSync(path.resolve(img2Path));
const img1Base64 = img1.toString('base64');
const img2Base64 = img2.toString('base64');

// Detect mime type from extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

const img1Mime = getMimeType(img1Path);
const img2Mime = getMimeType(img2Path);

// Load character visual DNA if name provided
let visualDNA = '';
if (characterName) {
  try {
    const biblePath = path.join(__dirname, '../src/data/characters/character-visual-bible.json');
    const bible = JSON.parse(fs.readFileSync(biblePath, 'utf-8'));
    const char = bible.characters[characterName];
    if (char) {
      visualDNA = `\n\nCanonical Visual DNA for "${char.name}":\n` +
        `- Species: ${char.visualDNA?.species || 'N/A'}\n` +
        `- Must Keep: ${char.mustKeep?.join(', ') || 'N/A'}\n` +
        `- Color Palette: ${char.visualDNA?.colorPalette?.join(', ') || 'N/A'}\n` +
        `- Key Features: ${JSON.stringify(char.visualDNA, null, 2)}`;
    } else {
      console.warn(`Character "${characterName}" not found in visual bible. Available: ${Object.keys(bible.characters).join(', ')}`);
    }
  } catch (e) {
    console.warn('Could not load visual bible:', e.message);
  }
}

const prompt = `You are an expert character design consistency reviewer for a children's typing game.

Compare these TWO images of what should be the SAME character. Analyze for visual consistency.

Check each of these criteria and score 0-10 for each:
1. FACE SHAPE - Same face structure, proportions, features
2. COLOR PALETTE - Same colors used for skin/fur, hair, outfit, accents
3. OUTFIT/CLOTHING - Same base outfit design, patterns, accessories
4. BODY PROPORTIONS - Same body type, height ratio, limb proportions
5. EYE STYLE - Same eye shape, color, size, expression range
6. HAIR/FEATURES - Same hairstyle, color, length, texture
7. SPECIES - Same species (human/animal/robot) consistency
8. ART STYLE - Same chibi style, outline weight, rendering
9. ACCESSORIES - Same key accessories present
10. OVERALL - Could a player immediately recognize this as the same character?
${visualDNA}

For EACH criterion output:
- Score (0-10)
- Brief note on any discrepancy

Then output:
- TOTAL SCORE (0-100, sum of all criteria)
- PASS/FAIL (70+ = PASS)
- List of CRITICAL issues (scores below 5)
- Specific recommendations to fix any issues

Format your response as structured text with clear headers.`;

console.log('Sending images to Gemini for consistency analysis...');
console.log(`Image 1: ${img1Path} (${(img1.length / 1024).toFixed(1)} KB)`);
console.log(`Image 2: ${img2Path} (${(img2.length / 1024).toFixed(1)} KB)`);
if (characterName) console.log(`Character: ${characterName}`);
console.log('');

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: img1Mime, data: img1Base64 } },
          { inlineData: { mimeType: img2Mime, data: img2Base64 } },
          { text: prompt }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192
      }
    })
  }
);

if (!response.ok) {
  const errorText = await response.text();
  console.error(`Gemini API error (${response.status}):`, errorText);
  process.exit(1);
}

const result = await response.json();
const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

if (text) {
  console.log('='.repeat(60));
  console.log('CHARACTER CONSISTENCY REVIEW');
  console.log('='.repeat(60));
  console.log(`Image 1: ${img1Path}`);
  console.log(`Image 2: ${img2Path}`);
  if (characterName) console.log(`Character: ${characterName}`);
  console.log('='.repeat(60));
  console.log(text);
  console.log('='.repeat(60));

  // Extract and highlight the total score if present
  const scoreMatch = text.match(/TOTAL\s*SCORE[:\s]*(\d+)/i);
  const passMatch = text.match(/(PASS|FAIL)/i);
  if (scoreMatch) {
    console.log(`\nFINAL SCORE: ${scoreMatch[1]}/100 ${passMatch ? `(${passMatch[1]})` : ''}`);
  }
} else {
  console.error('No response from Gemini:', JSON.stringify(result, null, 2));
  process.exit(1);
}
