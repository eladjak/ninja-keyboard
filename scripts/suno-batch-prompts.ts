/**
 * Suno Batch Prompts Generator
 *
 * Generates Suno API-compatible prompts for the first 10 priority tracks
 * of the Ninja Keyboard soundtrack. Based on the soundtrack master plan
 * at docs/soundtrack-master-plan.html.
 *
 * Style: Hybrid pixel/chiptune + cinematic (established project style)
 *
 * Usage:
 *   npx tsx scripts/suno-batch-prompts.ts
 *   # Outputs: scripts/suno-prompts.json
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

interface SunoTrackPrompt {
  id: string
  name: string
  nameHe: string
  sunoPrompt: string
  style: string
  duration: string
  category: 'character' | 'gameplay' | 'story' | 'ambient'
}

const tracks: SunoTrackPrompt[] = [
  {
    id: 'CHAR-001',
    name: "Ki's Theme",
    nameHe: 'ערכת קי — גיבור',
    sunoPrompt:
      'Adventurous chiptune hero theme with cinematic orchestral swell, energetic young ninja melody, ' +
      'Japanese shakuhachi flute meets 8-bit synth, Hebrew/Middle Eastern scale undertone, ' +
      'brave ascending motif, plucky and determined, bright warm chords, ' +
      'loopable, 120 BPM, kids game main character anthem, no vocals',
    style:
      'chiptune, orchestral, Japanese game music, adventure, heroic, 8-bit meets cinematic',
    duration: '60-90s',
    category: 'character',
  },
  {
    id: 'CHAR-002',
    name: "Mika's Theme",
    nameHe: 'ערכת מיקה — טק הקרית',
    sunoPrompt:
      'Cyberpunk electronic pop with chiptune glitch accents, edgy hacker girl theme, ' +
      'sharp digital circuit board sounds, neon synth arpeggios, confident and smart, ' +
      'bitcrushed hi-hats with clean melodic lead, dark purple aesthetic, ' +
      'keyboard typing rhythms woven into beat, 130 BPM, loopable, no vocals',
    style:
      'cyberpunk, electronic pop, glitch, chiptune hybrid, neon, hacker aesthetic',
    duration: '60-90s',
    category: 'character',
  },
  {
    id: 'CHAR-005',
    name: "Yuki's Theme",
    nameHe: 'ערכת יוקי — מהירות',
    sunoPrompt:
      'Ultra-fast J-pop electronic with chiptune racing pulse, wind rushing SFX, ' +
      'bright energetic female character speed theme, rapid arpeggios building intensity, ' +
      'competitive spirit, lightning-fast 160 BPM bursts alternating with 140 BPM groove, ' +
      'pixel art meets anime energy, triumphant speed demon melody, loopable, no vocals',
    style:
      'J-pop, electronic, fast chiptune, racing, speed, competitive, anime energy',
    duration: '60-90s',
    category: 'character',
  },
  {
    id: 'CHAR-008',
    name: "Glitch's Theme",
    nameHe: 'ערכת Glitch — כאוס טהור',
    sunoPrompt:
      'Corrupted vaporwave meets emotional chiptune, digital noise and bitcrushed fragments, ' +
      'reality-breaking glitch sounds with hidden beautiful melody underneath, ' +
      'time-stretched reversed notes, stuttering rhythm that resolves into warm piano phrase, ' +
      'unstable yet fascinating, sad and mysterious, 100 BPM wobbling, ' +
      'secret boss theme with emotional depth, feminine energy, loopable, no vocals',
    style:
      'glitch, vaporwave, bitcrushed, emotional electronic, corrupted beauty, noise art',
    duration: '60-90s',
    category: 'character',
  },
  {
    id: 'CHAR-003',
    name: "Sensei Zen's Theme",
    nameHe: 'ערכת סנסיי זן — חכם',
    sunoPrompt:
      'Peaceful traditional Japanese shakuhachi flute and koto strings with subtle chiptune warmth, ' +
      'ancient turtle master wisdom, meditation temple bells, gentle water flowing ambient, ' +
      'Hebrew/Middle Eastern pentatonic scale blended with Japanese harmony, ' +
      'slow dignified 70 BPM, serene and wise, deep calm guidance energy, ' +
      'zen garden atmosphere, loopable, no vocals',
    style:
      'traditional Japanese, ambient, zen, shakuhachi, koto, meditation, chiptune undertone',
    duration: '60-90s',
    category: 'character',
  },
  {
    id: 'PLAY-001',
    name: 'Practice Room',
    nameHe: 'תרגול — קל',
    sunoPrompt:
      'Calm lo-fi study music with soft chiptune textures, gentle piano over warm analog pads, ' +
      'mellow hip-hop beat with typing rhythm undertone, soft jazzy chords, ' +
      'Japanese aesthetic ambient, 80 BPM, peaceful concentration music, ' +
      'minimal melodic movement to avoid distraction, warm bass, ' +
      'focus zone for keyboard practice, kid-friendly calm, loopable, no vocals',
    style:
      'lo-fi, study music, ambient, chiptune-warm, jazzy, calm focus, typing rhythm',
    duration: '120-180s',
    category: 'gameplay',
  },
  {
    id: 'PLAY-004',
    name: 'Speed Test',
    nameHe: 'אדרנלין — מבחן מהירות',
    sunoPrompt:
      'Adrenaline rush EDM with chiptune countdown elements, building from 120 to 140 BPM, ' +
      'epic synthwave drop, racing heartbeat bass, competitive speed challenge anthem, ' +
      'ticking clock tension with 8-bit urgency, electronic builds and releases, ' +
      'intense but not scary for kids, pixel art meets stadium energy, ' +
      'typing speed test power music, loopable, no vocals',
    style:
      'EDM, synthwave, chiptune, adrenaline, competitive, building tempo, countdown',
    duration: '120-180s',
    category: 'gameplay',
  },
  {
    id: 'BATTLE-010',
    name: 'Tournament Arena',
    nameHe: 'זירת טורנירים',
    sunoPrompt:
      'Epic tournament arena theme with full orchestral power and chiptune accents, ' +
      'competitive crowd energy, brass fanfare meets electronic bass drops, ' +
      'stadium anthem with 8-bit gaming nostalgia, building intensity, ' +
      '135 BPM, majestic and competitive, esports meets retro gaming glory, ' +
      'Middle Eastern percussion undertone, champion energy, loopable, no vocals',
    style:
      'orchestral, epic, esports, chiptune hybrid, tournament, competitive, stadium',
    duration: '120-180s',
    category: 'gameplay',
  },
  {
    id: 'STORY-001',
    name: 'Story - Emotional Moment',
    nameHe: 'סיפור — רגע רגשי',
    sunoPrompt:
      'Emotional cinematic piano with gentle strings, tearful beautiful melody, ' +
      'chiptune music box undertone adding nostalgic innocence, ' +
      'heartfelt moment in a kids game story, soft violin solo over warm pads, ' +
      'Hebrew/Middle Eastern minor scale emotional progression, ' +
      'slow 65 BPM, bittersweet and touching, friendship and sacrifice theme, ' +
      'building to gentle emotional climax then resolving softly, no vocals',
    style:
      'cinematic, piano, strings, emotional, bittersweet, music box, Hebrew feel',
    duration: '90-120s',
    category: 'story',
  },
  {
    id: 'STORY-002',
    name: 'Story - Victory/Celebration',
    nameHe: 'סיפור — ניצחון וחגיגה',
    sunoPrompt:
      'Triumphant celebration theme combining full orchestra with chiptune joy, ' +
      'all instruments united in victorious melody, brass fanfare with 8-bit sparkle, ' +
      'Middle Eastern percussion celebration (darbuka, frame drum), ' +
      'ascending major key progression building to massive climax, ' +
      '130 BPM, pure joy and accomplishment, kids game final victory anthem, ' +
      'heroes united moment, confetti energy, sunshine after storm, no vocals',
    style:
      'orchestral, triumphant, chiptune, celebration, Middle Eastern percussion, joyful',
    duration: '90-120s',
    category: 'story',
  },
]

function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url))
  const outputPath = resolve(scriptDir, 'suno-prompts.json')

  writeFileSync(outputPath, JSON.stringify(tracks, null, 2), 'utf-8')

  console.log(`Generated ${tracks.length} Suno prompts`)
  console.log(`Output: ${outputPath}`)
  console.log('')
  console.log('Tracks:')
  for (const track of tracks) {
    console.log(`  ${track.id} - ${track.name} (${track.nameHe})`)
    console.log(`    Style: ${track.style}`)
    console.log(`    Duration: ${track.duration}`)
    console.log(`    Category: ${track.category}`)
    console.log('')
  }
}

main()
