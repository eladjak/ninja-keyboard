#!/usr/bin/env node

/**
 * Suno Music Pipeline - Ninja Keyboard
 *
 * Manages the entire music production lifecycle:
 *   - status   : Dashboard of track completion by category
 *   - list     : List all tracks with their current state
 *   - copy ID  : Copy Suno prompt for a track to clipboard
 *   - import ID PATH : Import a downloaded Suno track into the project
 *   - validate : Check all manifest tracks have matching files
 *   - next     : Show the next priority track to generate
 *
 * Usage:
 *   node scripts/suno-music-pipeline.mjs status
 *   node scripts/suno-music-pipeline.mjs list
 *   node scripts/suno-music-pipeline.mjs copy CHAR-001
 *   node scripts/suno-music-pipeline.mjs import CHAR-001 ~/Downloads/suno-track.mp3
 *   node scripts/suno-music-pipeline.mjs validate
 *   node scripts/suno-music-pipeline.mjs next
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync, readdirSync } from 'node:fs'
import { resolve, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

// ─── Paths ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const PROMPTS_PATH = resolve(__dirname, 'suno-prompts.json')
const MANIFEST_PATH = resolve(PROJECT_ROOT, 'public/audio/music/music-manifest.json')
const MUSIC_DIR = resolve(PROJECT_ROOT, 'public/audio/music')

// ─── ANSI Colors ─────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
}

// ─── Full Track Catalog (from soundtrack-master-plan.html) ───────────────────

const FULL_CATALOG = [
  // === MENU ===
  {
    id: 'MENU-001', name: 'Home Screen Theme', nameHe: 'ערכת המסך הראשי',
    category: 'menu', priority: 1, existingFile: 'main-theme.mp3',
    sunoPrompt: 'Happy energetic chiptune ninja game theme for kids, Japanese 8-bit adventure music, upbeat melody, loopable',
    style: 'Chiptune 8-bit', duration: '60-90s',
  },
  {
    id: 'MENU-002', name: 'Lessons Menu', nameHe: 'תפריט השיעורים',
    category: 'menu', priority: 2,
    sunoPrompt: 'Calm focused lo-fi study music, soft piano, gentle synth pads, loopable ambient, 80 BPM, peaceful concentration music, Japanese inspired',
    style: 'Lo-fi / Ambient', duration: '60-90s',
  },
  {
    id: 'MENU-003', name: 'Battle Menu', nameHe: 'תפריט קרבות',
    category: 'menu', priority: 2,
    sunoPrompt: 'Intense synthwave battle lobby music, pulsing bass, building tension, electronic 130 BPM, dark neon aesthetic, gaming pre-battle theme, loopable',
    style: 'Synthwave', duration: '60-90s',
  },
  {
    id: 'MENU-004', name: 'Games Hub', nameHe: 'מרכז המשחקים',
    category: 'menu', priority: 3,
    sunoPrompt: 'Playful chiptune pop game hub music, bouncy melody, fun 8-bit sounds with modern electronic twist, 125 BPM, arcade energy, kids friendly, loopable',
    style: 'Chiptune Pop', duration: '60-90s',
  },
  {
    id: 'MENU-005', name: 'Profile / Progress', nameHe: 'פרופיל והתקדמות',
    category: 'menu', priority: 3,
    sunoPrompt: 'Reflective proud ambient orchestral music, soft strings with piano, gentle achievement melody, emotional warmth, 70 BPM, inspiring journey music, loopable',
    style: 'Ambient Orchestral', duration: '60-90s',
  },
  {
    id: 'MENU-006', name: 'Settings', nameHe: 'הגדרות',
    category: 'menu', priority: 4,
    sunoPrompt: 'Minimal neutral ambient background music, soft electronic pads, no melody, pure atmosphere, 60 BPM, very calm and unobtrusive, settings screen mood, loopable',
    style: 'Minimal Ambient', duration: '60-90s',
  },

  // === GAMEPLAY ===
  {
    id: 'PLAY-001', name: 'Practice Easy', nameHe: 'תרגול — קל',
    category: 'gameplay', priority: 1,
    sunoPrompt: 'Calm lo-fi study music with soft chiptune textures, gentle piano over warm analog pads, mellow hip-hop beat with typing rhythm undertone, soft jazzy chords, Japanese aesthetic ambient, 80 BPM, peaceful concentration music, minimal melodic movement to avoid distraction, warm bass, focus zone for keyboard practice, kid-friendly calm, loopable, no vocals',
    style: 'Lo-fi Hip Hop', duration: '120-180s',
  },
  {
    id: 'PLAY-002', name: 'Practice Medium', nameHe: 'תרגול — בינוני',
    category: 'gameplay', priority: 2,
    sunoPrompt: 'Upbeat focus music, indie electronic, melodic synths, steady 110 BPM, energetic but not stressful, productivity flow state, no lyrics, loopable',
    style: 'Indie Electronic', duration: '120-180s',
  },
  {
    id: 'PLAY-003', name: 'Practice Hard', nameHe: 'תרגול — קשה',
    category: 'gameplay', priority: 3,
    sunoPrompt: 'High intensity drum and bass music, fast 160 BPM, electronic synths, driving beat, focus zone music, no vocals, intense typing session energy, loopable',
    style: 'Drum and Bass', duration: '120-180s',
  },
  {
    id: 'PLAY-004', name: 'Speed Test', nameHe: 'אדרנלין — מבחן מהירות',
    category: 'gameplay', priority: 1,
    sunoPrompt: 'Adrenaline rush EDM with chiptune countdown elements, building from 120 to 140 BPM, epic synthwave drop, racing heartbeat bass, competitive speed challenge anthem, ticking clock tension with 8-bit urgency, electronic builds and releases, intense but not scary for kids, pixel art meets stadium energy, typing speed test power music, loopable, no vocals',
    style: 'EDM / Synthwave', duration: '120-180s',
  },
  {
    id: 'PLAY-005', name: 'Accuracy Challenge', nameHe: 'אתגר דיוק',
    category: 'gameplay', priority: 3,
    sunoPrompt: 'Minimal techno precision music, clean 120 BPM, mathematical beats, surgical focus, no melodic distractions, pure rhythm typing music, loopable, accuracy and focus',
    style: 'Minimal Techno', duration: '120-180s',
  },

  // === BATTLE ===
  {
    id: 'BATTLE-001', name: 'Pre-Battle Anticipation', nameHe: 'אנטיסיפציה לפני קרב',
    category: 'battle', priority: 2,
    sunoPrompt: 'Pre-battle anticipation music, orchestral tension building, 30 seconds, dramatic strings, nervous energy, video game battle intro, not full combat yet, suspenseful',
    style: 'Orchestral Tension', duration: '30-60s',
  },
  {
    id: 'BATTLE-002', name: 'Shadow Cat Battle', nameHe: 'Shadow Cat — קרב קל',
    category: 'battle', priority: 1,
    sunoPrompt: 'Shadow ninja cat battle music, chiptune 8-bit, sneaky mysterious melody, 120 BPM, competitive but friendly, kids game battle theme, Japanese shadow aesthetic, loopable',
    style: 'Chiptune Battle', duration: '120-180s',
  },
  {
    id: 'BATTLE-003', name: 'Storm Fox Battle', nameHe: 'Storm Fox — קרב בינוני',
    category: 'battle', priority: 1,
    sunoPrompt: 'Storm fox battle music, electro rock with electric guitar riffs, powerful synths, 135 BPM, wind and thunder sounds woven in, intense competitive, loopable game battle',
    style: 'Electro Rock', duration: '120-180s',
  },
  {
    id: 'BATTLE-004', name: 'Blaze Dragon Battle', nameHe: 'Blaze Dragon — קרב קשה',
    category: 'battle', priority: 2,
    sunoPrompt: 'Blaze dragon epic metal battle, heavy guitars, orchestral brass, fire and fury, 145 BPM, epic boss battle intensity, no holds barred, loopable high energy gaming anthem',
    style: 'Metal / Epic', duration: '120-180s',
  },
  {
    id: 'BATTLE-005', name: 'Bug Boss Act 1', nameHe: 'Bug — מעשה ראשון',
    category: 'battle', priority: 1,
    existingFile: 'boss-battle.mp3',
    sunoPrompt: 'Bug monster boss act 1, glitchy electronic music, playful chaos, digital glitch sounds, mischievous 125 BPM, not too scary, whimsical evil, video game boss theme, loopable',
    style: 'Glitchy Electronic', duration: '120-180s',
  },
  {
    id: 'BATTLE-006', name: 'Bug Boss Act 2', nameHe: 'Bug — מעשה שני',
    category: 'battle', priority: 2,
    sunoPrompt: 'Bug boss act 2, darker electronic battle, corrupted glitch synths, 140 BPM, increasing threat, digital corruption sounds, tense and dangerous, loopable boss fight escalation',
    style: 'Dark Electronic', duration: '120-180s',
  },
  {
    id: 'BATTLE-007', name: 'Bug King Final', nameHe: 'Bug King — מעשה שלישי',
    category: 'battle', priority: 2,
    sunoPrompt: 'Bug King final boss epic orchestral with glitch corruption, massive choir, heavy bass drops, 150 BPM, apocalyptic video game finale, strings and glitch combined, ultimate showdown loopable',
    style: 'Epic Orchestral + Glitch', duration: '120-180s',
  },
  {
    id: 'BATTLE-008', name: 'Glitch Secret Boss', nameHe: 'Glitch — בוס סודי',
    category: 'battle', priority: 3,
    sunoPrompt: 'Secret glitch boss corrupted vaporwave, reality breaking sounds, reversed melodies, time-stretched vocals, unsettling 100 BPM, reality corruption, mysterious and eerie, loopable hidden boss theme',
    style: 'Vaporwave Corrupted', duration: '120-180s',
  },
  {
    id: 'BATTLE-009', name: 'Boss Defeated Fanfare', nameHe: 'בוס הובס!',
    category: 'battle', priority: 2,
    sunoPrompt: 'Boss defeated victory stinger, 8 seconds, triumphant brass fanfare, climactic resolution, epic orchestral sting, video game victory moment, short and powerful, celebration burst',
    style: 'Orchestral Stinger', duration: '5-10s',
  },
  {
    id: 'BATTLE-010', name: 'Tournament Arena', nameHe: 'זירת טורנירים',
    category: 'battle', priority: 2,
    sunoPrompt: 'Epic tournament arena theme with full orchestral power and chiptune accents, competitive crowd energy, brass fanfare meets electronic bass drops, stadium anthem with 8-bit gaming nostalgia, building intensity, 135 BPM, majestic and competitive, esports meets retro gaming glory, Middle Eastern percussion undertone, champion energy, loopable, no vocals',
    style: 'Orchestral / Esports', duration: '120-180s',
  },

  // === EVENTS / STINGERS ===
  {
    id: 'EVENT-001', name: 'Victory Fanfare', nameHe: 'ניצחון!',
    category: 'events', priority: 1,
    sunoPrompt: 'Short triumphant victory fanfare, 10 seconds, bright brass section, ascending melody, proud achievement celebration, video game level complete, chiptune brass hybrid, uplifting finale',
    style: 'Brass Fanfare', duration: '5-10s',
  },
  {
    id: 'EVENT-002', name: 'Level Up Jingle', nameHe: 'עלית רמה!',
    category: 'events', priority: 1,
    sunoPrompt: 'Level up RPG jingle, 5 seconds, ascending chiptune melody, classic video game level up sound, happy and energetic, 8-bit celebration, short burst of joy',
    style: 'Chiptune Jingle', duration: '5s',
  },
  {
    id: 'EVENT-003', name: 'Character Unlock', nameHe: 'דמות חדשה נפתחה!',
    category: 'events', priority: 1,
    sunoPrompt: 'Character unlock magical discovery jingle, 8 seconds, sparkle sounds, wonder and delight, arpeggio ascending, whimsical bells and synth, new friend revealed music, magical surprise',
    style: 'Magical Jingle', duration: '8s',
  },
  {
    id: 'EVENT-004', name: 'Achievement Unlock', nameHe: 'אצ\'יבמנט נפתח!',
    category: 'events', priority: 1,
    sunoPrompt: 'Achievement unlocked power jingle, 6 seconds, bold power chord, gaming achievement sound, satisfying unlock, short impactful burst, proud moment music, Xbox achievement style',
    style: 'Power Chord Jingle', duration: '6s',
  },
  {
    id: 'EVENT-005', name: 'Streak Milestone', nameHe: 'סטריק!',
    category: 'events', priority: 2,
    sunoPrompt: 'Streak milestone fire jingle, 8 seconds, rising build with fire crackling sounds, momentum and heat, ascending intensity, combo achievement music, on fire gaming moment',
    style: 'Rising Buildup', duration: '8s',
  },
  {
    id: 'EVENT-006', name: 'Season Event Theme', nameHe: 'אירוע עונה',
    category: 'events', priority: 4,
    sunoPrompt: 'Festive season event music, celebratory electronic with Middle Eastern flavor, holiday special gaming theme, joyful and energetic, 125 BPM, seasonal celebration loopable',
    style: 'Festive Electronic', duration: '60-90s',
  },
  {
    id: 'EVENT-007', name: 'Personal Best', nameHe: 'שיא אישי!',
    category: 'events', priority: 2,
    sunoPrompt: 'Personal best record stinger, 7 seconds, epic orchestral burst, new record achieved sound, triumphant moment, sports achievement style, huge and memorable, short but massive impact',
    style: 'Epic Stinger', duration: '7s',
  },
  {
    id: 'EVENT-008', name: 'Defeat / Try Again', nameHe: 'כישלון — נסה שוב',
    category: 'events', priority: 2,
    sunoPrompt: 'Playful defeat jingle, 6 seconds, descending melody, whimsical sad but hopeful, try again energy, kids game failure sound, not discouraging, bounce back vibe, chiptune wah-wah',
    style: 'Sad Trombone Reimagined', duration: '6s',
  },

  // === CHARACTERS ===
  {
    id: 'CHAR-001', name: "Ki's Theme", nameHe: 'ערכת קי — גיבור',
    category: 'characters', priority: 1,
    sunoPrompt: 'Adventurous chiptune hero theme with cinematic orchestral swell, energetic young ninja melody, Japanese shakuhachi flute meets 8-bit synth, Hebrew/Middle Eastern scale undertone, brave ascending motif, plucky and determined, bright warm chords, loopable, 120 BPM, kids game main character anthem, no vocals',
    style: 'Adventure Chiptune + Orchestral', duration: '60-90s',
  },
  {
    id: 'CHAR-002', name: "Mika's Theme", nameHe: 'ערכת מיקה — טק הקרית',
    category: 'characters', priority: 1,
    sunoPrompt: 'Cyberpunk electronic pop with chiptune glitch accents, edgy hacker girl theme, sharp digital circuit board sounds, neon synth arpeggios, confident and smart, bitcrushed hi-hats with clean melodic lead, dark purple aesthetic, keyboard typing rhythms woven into beat, 130 BPM, loopable, no vocals',
    style: 'Cyberpunk Pop', duration: '60-90s',
  },
  {
    id: 'CHAR-003', name: "Sensei Zen's Theme", nameHe: 'ערכת סנסיי זן — חכם',
    category: 'characters', priority: 1,
    sunoPrompt: 'Peaceful traditional Japanese shakuhachi flute and koto strings with subtle chiptune warmth, ancient turtle master wisdom, meditation temple bells, gentle water flowing ambient, Hebrew/Middle Eastern pentatonic scale blended with Japanese harmony, slow dignified 70 BPM, serene and wise, deep calm guidance energy, zen garden atmosphere, loopable, no vocals',
    style: 'Traditional Japanese / Zen', duration: '60-90s',
  },
  {
    id: 'CHAR-004', name: "Bug's Theme", nameHe: 'ערכת Bug — קאוס',
    category: 'characters', priority: 2,
    sunoPrompt: 'Bug villain theme, 20 seconds, glitchy chaotic electronic, evil mischief, corrupted data sounds, menacing but cartoonish, digital bug monster leitmotif, erratic rhythm',
    style: 'Glitch Villain', duration: '20s',
  },
  {
    id: 'CHAR-005', name: "Yuki's Theme", nameHe: 'ערכת יוקי — מהירות',
    category: 'characters', priority: 1,
    sunoPrompt: 'Ultra-fast J-pop electronic with chiptune racing pulse, wind rushing SFX, bright energetic female character speed theme, rapid arpeggios building intensity, competitive spirit, lightning-fast 160 BPM bursts alternating with 140 BPM groove, pixel art meets anime energy, triumphant speed demon melody, loopable, no vocals',
    style: 'J-Pop / Fast Electronic', duration: '60-90s',
  },
  {
    id: 'CHAR-006', name: "Luna's Theme", nameHe: 'ערכת לונה — שלווה',
    category: 'characters', priority: 2,
    sunoPrompt: 'Luna calm companion theme, 20 seconds, dreamy ambient pop, soft violin, moonlight atmosphere, gentle encouragement music, slow and comforting, nocturnal serenity',
    style: 'Dream Pop', duration: '20s',
  },
  {
    id: 'CHAR-007', name: "Rex's Theme", nameHe: 'ערכת Rex — משחקיות',
    category: 'characters', priority: 2,
    sunoPrompt: 'Rex dinosaur theme, 20 seconds, cartoon rock with dinosaur roars, heavy stomp rhythm, funny and powerful, T-Rex gaming buddy, prehistoric meets arcade, fun character theme',
    style: 'Dino Rock', duration: '20s',
  },
  {
    id: 'CHAR-008', name: "Glitch's Theme", nameHe: 'ערכת Glitch — כאוס טהור',
    category: 'characters', priority: 2,
    sunoPrompt: 'Corrupted vaporwave meets emotional chiptune, digital noise and bitcrushed fragments, reality-breaking glitch sounds with hidden beautiful melody underneath, time-stretched reversed notes, stuttering rhythm that resolves into warm piano phrase, unstable yet fascinating, sad and mysterious, 100 BPM wobbling, secret boss theme with emotional depth, feminine energy, loopable, no vocals',
    style: 'Glitch / Vaporwave', duration: '60-90s',
  },

  // === STORY ===
  {
    id: 'STORY-001', name: 'Emotional Moment', nameHe: 'סיפור — רגע רגשי',
    category: 'story', priority: 1,
    sunoPrompt: 'Emotional cinematic piano with gentle strings, tearful beautiful melody, chiptune music box undertone adding nostalgic innocence, heartfelt moment in a kids game story, soft violin solo over warm pads, Hebrew/Middle Eastern minor scale emotional progression, slow 65 BPM, bittersweet and touching, friendship and sacrifice theme, building to gentle emotional climax then resolving softly, no vocals',
    style: 'Cinematic Piano / Strings', duration: '90-120s',
  },
  {
    id: 'STORY-002', name: 'Victory/Celebration', nameHe: 'סיפור — ניצחון וחגיגה',
    category: 'story', priority: 1,
    sunoPrompt: 'Triumphant celebration theme combining full orchestra with chiptune joy, all instruments united in victorious melody, brass fanfare with 8-bit sparkle, Middle Eastern percussion celebration (darbuka, frame drum), ascending major key progression building to massive climax, 130 BPM, pure joy and accomplishment, kids game final victory anthem, heroes united moment, confetti energy, sunshine after storm, no vocals',
    style: 'Orchestral Triumphant', duration: '90-120s',
  },

  // === AGE WORLDS ===
  {
    id: 'WORLD-001', name: 'Shatil - Magical Garden', nameHe: 'שתיל — גן קסום (6-8)',
    category: 'worlds', priority: 2,
    sunoPrompt: 'Magical garden ambient for young children, music box melody, bird chirping, gentle bells, 60 BPM, warm and safe, Duolingo kids energy, enchanted forest sounds, loopable lullaby ambient',
    style: 'Toybox Ambient', duration: '120-180s',
  },
  {
    id: 'WORLD-002', name: 'Nevet - Adventure Camp', nameHe: 'נבט — מחנה הרפתקות (8-10)',
    category: 'worlds', priority: 2,
    sunoPrompt: 'Adventure camp theme, upbeat adventure pop, outdoor exploration energy, friendly and exciting, 105 BPM, Pokemon game town music inspired, summer camp vibes, loopable kids adventure',
    style: 'Adventure Pop', duration: '120-180s',
  },
  {
    id: 'WORLD-003', name: 'Geza - Ninja Arena', nameHe: 'גזע — זירת נינג\'ה (10-12)',
    category: 'worlds', priority: 1,
    sunoPrompt: 'Ninja arena dark synthwave, neon gaming ambient, competitive 125 BPM, Brawl Stars energy, dark neon aesthetic, electronic pulses, cool and intense, gaming lobby music, loopable',
    style: 'Dark Synthwave', duration: '120-180s',
  },
  {
    id: 'WORLD-004', name: 'Anaf - Training Hub', nameHe: 'ענף — מרכז אימון (12-14)',
    category: 'worlds', priority: 3,
    sunoPrompt: 'Mature training hub lo-fi minimal, dark ambient with subtle beats, 90 BPM, professional productivity music, teen appropriate, Discord dark theme energy, clean and understated, loopable',
    style: 'Lo-fi Minimal', duration: '120-180s',
  },
  {
    id: 'WORLD-005', name: 'Tzameret - Professional', nameHe: 'צמרת — מקצועי (14-16+)',
    category: 'worlds', priority: 3,
    sunoPrompt: 'Professional minimal electronic ambient, near silence with subtle texture, developer/programmer atmosphere, 70 BPM, mature and respectful, Monkeytype dark mode energy, barely there music, loopable',
    style: 'Minimal Electronic', duration: '120-180s',
  },
]

// Track ID -> file name convention mapping
function trackIdToFileName(id) {
  const track = FULL_CATALOG.find(t => t.id === id)
  if (!track) return null

  const nameSlug = track.name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${nameSlug}.mp3`
}

function trackIdToCategory(id) {
  const track = FULL_CATALOG.find(t => t.id === id)
  return track?.category || 'misc'
}

// ─── Load Data ───────────────────────────────────────────────────────────────

function loadPrompts() {
  if (!existsSync(PROMPTS_PATH)) {
    return []
  }
  return JSON.parse(readFileSync(PROMPTS_PATH, 'utf-8'))
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    return { generated_tracks: [], pending_tracks: [], not_generated: [] }
  }
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
}

function saveManifest(manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8')
}

// ─── Determine Track Status ─────────────────────────────────────────────────

function getTrackStatuses() {
  const manifest = loadManifest()

  // Build set of existing files
  const existingFiles = new Set()
  for (const track of manifest.generated_tracks || []) {
    for (const f of track.files || []) {
      existingFiles.add(f)
    }
  }

  // Also check for files in category subdirectories
  const categories = ['characters', 'gameplay', 'battle', 'story', 'menu', 'events', 'worlds']
  for (const cat of categories) {
    const catDir = resolve(MUSIC_DIR, cat)
    if (existsSync(catDir)) {
      try {
        const files = readdirSync(catDir).filter(f => !f.startsWith('.'))
        for (const f of files) {
          existingFiles.add(`${cat}/${f}`)
        }
      } catch {
        // ignore
      }
    }
  }

  // Build pending IDs set
  const pendingIds = new Set((manifest.pending_tracks || []).map(t => t.id))

  // Map track statuses
  return FULL_CATALOG.map(track => {
    // Check if it has an existing file in the old flat structure
    if (track.existingFile && existingFiles.has(track.existingFile)) {
      return { ...track, status: 'done', filePath: track.existingFile }
    }

    // Check if it exists in the category folder
    const expectedFile = trackIdToFileName(track.id)
    const categoryPath = `${track.category}/${expectedFile}`
    if (existingFiles.has(categoryPath)) {
      return { ...track, status: 'done', filePath: categoryPath }
    }

    // Check if the manifest has it in generated_tracks
    const genTrack = (manifest.generated_tracks || []).find(g =>
      g.trackId === track.id || g.name === expectedFile?.replace('.mp3', '')
    )
    if (genTrack) {
      return { ...track, status: 'done', filePath: genTrack.files?.[0] || categoryPath }
    }

    // Check if it has a prompt ready
    const hasPrompt = pendingIds.has(track.id)

    return {
      ...track,
      status: hasPrompt ? 'prompt-ready' : 'planned',
    }
  })
}

// ─── Commands ────────────────────────────────────────────────────────────────

function cmdStatus() {
  const statuses = getTrackStatuses()
  const manifest = loadManifest()

  console.log('')
  console.log(`${c.bold}${c.magenta}  NINJA KEYBOARD - MUSIC PRODUCTION DASHBOARD${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  // Category summary
  const categories = {
    menu:       { label: 'Menu Themes',          emoji: '🏠' },
    gameplay:   { label: 'Gameplay / Practice',   emoji: '⌨️' },
    battle:     { label: 'Battle Music',          emoji: '⚔️' },
    events:     { label: 'Events / Stingers',     emoji: '🎉' },
    characters: { label: 'Character Themes',      emoji: '🥷' },
    story:      { label: 'Story Music',           emoji: '📖' },
    worlds:     { label: 'Age World Ambients',    emoji: '🌍' },
  }

  let totalDone = 0
  let totalPromptReady = 0
  let totalPlanned = 0
  let totalTracks = 0

  for (const [catKey, catInfo] of Object.entries(categories)) {
    const tracks = statuses.filter(t => t.category === catKey)
    const done = tracks.filter(t => t.status === 'done').length
    const promptReady = tracks.filter(t => t.status === 'prompt-ready').length
    const planned = tracks.filter(t => t.status === 'planned').length

    totalDone += done
    totalPromptReady += promptReady
    totalPlanned += planned
    totalTracks += tracks.length

    const bar = makeProgressBar(done, tracks.length, 20)
    const doneColor = done === tracks.length ? c.green : done > 0 ? c.yellow : c.red
    console.log(`  ${catInfo.emoji} ${c.bold}${catInfo.label.padEnd(22)}${c.reset} ${bar} ${doneColor}${done}/${tracks.length}${c.reset}${promptReady > 0 ? ` ${c.cyan}(${promptReady} prompt-ready)${c.reset}` : ''}${planned > 0 ? ` ${c.dim}(${planned} planned)${c.reset}` : ''}`)
  }

  console.log('')
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)

  const totalBar = makeProgressBar(totalDone, totalTracks, 20)
  const pct = Math.round((totalDone / totalTracks) * 100)
  console.log(`  ${c.bold}TOTAL${c.reset}                        ${totalBar} ${c.bold}${totalDone}/${totalTracks}${c.reset} (${pct}%)`)
  console.log('')

  // Quick stats
  console.log(`  ${c.green}Done:${c.reset}         ${totalDone} tracks (existing MP3 files)`)
  console.log(`  ${c.cyan}Prompt Ready:${c.reset} ${totalPromptReady} tracks (prompts written, ready to generate)`)
  console.log(`  ${c.dim}Planned:${c.reset}      ${totalPlanned} tracks (in master plan, need prompts)`)
  console.log('')

  // Existing files
  const genTracks = manifest.generated_tracks || []
  if (genTracks.length > 0) {
    console.log(`  ${c.bold}Existing files:${c.reset}`)
    for (const gt of genTracks) {
      console.log(`    ${c.green}✓${c.reset} ${gt.title || gt.name} ${c.dim}→ ${(gt.files || []).join(', ')}${c.reset}`)
    }
    console.log('')
  }

  console.log(`  ${c.yellow}Next step:${c.reset} Run ${c.bold}node scripts/suno-music-pipeline.mjs next${c.reset} to see priority tracks`)
  console.log('')
}

function makeProgressBar(done, total, width) {
  const filled = Math.round((done / total) * width)
  const empty = width - filled
  const filledChar = done === total ? `${c.green}${'█'.repeat(filled)}${c.reset}` : `${c.yellow}${'█'.repeat(filled)}${c.reset}`
  const emptyChar = `${c.dim}${'░'.repeat(empty)}${c.reset}`
  return `${filledChar}${emptyChar}`
}

function cmdList() {
  const statuses = getTrackStatuses()

  console.log('')
  console.log(`${c.bold}${c.magenta}  ALL TRACKS${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  let currentCategory = ''
  for (const track of statuses) {
    if (track.category !== currentCategory) {
      currentCategory = track.category
      console.log(`  ${c.bold}${c.cyan}── ${currentCategory.toUpperCase()} ──${c.reset}`)
    }

    const statusIcon = track.status === 'done'
      ? `${c.green}✓ DONE${c.reset}`
      : track.status === 'prompt-ready'
        ? `${c.yellow}● READY${c.reset}`
        : `${c.dim}○ PLAN${c.reset}`

    const priorityLabel = track.priority === 1 ? `${c.red}P1${c.reset}` : track.priority === 2 ? `${c.yellow}P2${c.reset}` : track.priority === 3 ? `${c.cyan}P3${c.reset}` : `${c.dim}P4${c.reset}`

    console.log(`  ${track.id.padEnd(12)} ${statusIcon.padEnd(25)} ${priorityLabel} ${track.name} ${c.dim}(${track.nameHe})${c.reset}`)

    if (track.status === 'done' && track.filePath) {
      console.log(`  ${''.padEnd(12)} ${c.dim}→ ${track.filePath}${c.reset}`)
    }
  }
  console.log('')
}

function cmdNext() {
  const statuses = getTrackStatuses()

  // Priority order: prompt-ready P1 first, then planned P1, then prompt-ready P2, etc.
  const needsWork = statuses
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      // Prompt-ready before planned
      if (a.status === 'prompt-ready' && b.status !== 'prompt-ready') return -1
      if (b.status === 'prompt-ready' && a.status !== 'prompt-ready') return 1
      // Then by priority
      return a.priority - b.priority
    })

  console.log('')
  console.log(`${c.bold}${c.magenta}  NEXT TRACKS TO GENERATE${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  const top10 = needsWork.slice(0, 10)
  for (let i = 0; i < top10.length; i++) {
    const track = top10[i]
    const statusIcon = track.status === 'prompt-ready'
      ? `${c.green}PROMPT READY${c.reset}`
      : `${c.dim}needs prompt${c.reset}`

    console.log(`  ${c.bold}${i + 1}.${c.reset} ${c.cyan}${track.id}${c.reset} — ${track.name} ${c.dim}(${track.nameHe})${c.reset}`)
    console.log(`     Status: ${statusIcon}  |  Priority: ${c.yellow}P${track.priority}${c.reset}  |  Category: ${track.category}`)
    console.log(`     Style: ${c.dim}${track.style}${c.reset}  |  Duration: ${track.duration}`)

    if (track.status === 'prompt-ready') {
      console.log(`     ${c.green}→ Run: node scripts/suno-music-pipeline.mjs copy ${track.id}${c.reset}`)
    }
    console.log('')
  }

  if (needsWork.length > 10) {
    console.log(`  ${c.dim}... and ${needsWork.length - 10} more tracks${c.reset}`)
    console.log('')
  }
}

function cmdCopy(trackId) {
  if (!trackId) {
    console.error(`${c.red}Error: Please provide a track ID. Example: node scripts/suno-music-pipeline.mjs copy CHAR-001${c.reset}`)
    process.exit(1)
  }

  const trackIdUpper = trackId.toUpperCase()

  // First check the full catalog
  const catalogTrack = FULL_CATALOG.find(t => t.id === trackIdUpper)
  if (!catalogTrack) {
    console.error(`${c.red}Error: Track "${trackIdUpper}" not found in catalog.${c.reset}`)
    console.error(`Valid IDs: ${FULL_CATALOG.map(t => t.id).join(', ')}`)
    process.exit(1)
  }

  // Use the prompt from suno-prompts.json if available (it's more detailed), otherwise from catalog
  const prompts = loadPrompts()
  const promptTrack = prompts.find(p => p.id === trackIdUpper)
  const prompt = promptTrack?.sunoPrompt || catalogTrack.sunoPrompt
  const style = promptTrack?.style || catalogTrack.style

  // Copy to clipboard - try multiple methods for cross-platform support
  let copied = false
  // Method 1: Windows clip via stdin (most reliable)
  if (!copied) {
    try {
      execSync('clip', { input: prompt, shell: 'cmd.exe', stdio: ['pipe', 'pipe', 'pipe'] })
      copied = true
    } catch { /* try next method */ }
  }
  // Method 2: PowerShell Set-Clipboard
  if (!copied) {
    try {
      execSync(`powershell -command "Set-Clipboard -Value '${prompt.replace(/'/g, "''")}'"`  , { stdio: ['pipe', 'pipe', 'pipe'] })
      copied = true
    } catch { /* try next method */ }
  }
  // Method 3: pbcopy (macOS) or xclip (Linux)
  if (!copied) {
    try {
      execSync('pbcopy', { input: prompt, stdio: ['pipe', 'pipe', 'pipe'] })
      copied = true
    } catch { /* not macOS */ }
  }
  if (!copied) {
    console.error(`${c.yellow}Warning: Could not copy to clipboard automatically.${c.reset}`)
    console.log('')
    console.log(`${c.bold}Copy this prompt manually:${c.reset}`)
    console.log('')
    console.log(prompt)
    console.log('')
    return
  }

  console.log('')
  console.log(`${c.green}✓ Copied to clipboard!${c.reset}`)
  console.log('')
  console.log(`${c.bold}Track:${c.reset}    ${catalogTrack.id} — ${catalogTrack.name} (${catalogTrack.nameHe})`)
  console.log(`${c.bold}Style:${c.reset}    ${style}`)
  console.log(`${c.bold}Duration:${c.reset} ${catalogTrack.duration}`)
  console.log(`${c.bold}Category:${c.reset} ${catalogTrack.category}`)
  console.log('')
  console.log(`${c.bold}Suno Prompt:${c.reset}`)
  console.log(`${c.dim}${prompt}${c.reset}`)
  console.log('')
  console.log(`${c.cyan}Style tag for Suno:${c.reset}`)
  console.log(`${c.dim}${style}${c.reset}`)
  console.log('')
  console.log(`${c.yellow}Next steps:${c.reset}`)
  console.log(`  1. Open ${c.bold}suno.com${c.reset} and paste the prompt`)
  console.log(`  2. Set style to: ${c.dim}${style}${c.reset}`)
  console.log(`  3. Generate and download the best version`)
  console.log(`  4. Import: ${c.bold}node scripts/suno-music-pipeline.mjs import ${trackIdUpper} <path-to-file>${c.reset}`)
  console.log('')
}

function cmdImport(trackId, sourcePath) {
  if (!trackId || !sourcePath) {
    console.error(`${c.red}Error: Please provide track ID and file path.${c.reset}`)
    console.error(`Example: node scripts/suno-music-pipeline.mjs import CHAR-001 ~/Downloads/track.mp3`)
    process.exit(1)
  }

  const trackIdUpper = trackId.toUpperCase()

  // Validate track exists
  const catalogTrack = FULL_CATALOG.find(t => t.id === trackIdUpper)
  if (!catalogTrack) {
    console.error(`${c.red}Error: Track "${trackIdUpper}" not found in catalog.${c.reset}`)
    process.exit(1)
  }

  // Resolve source path (handle ~ expansion)
  let resolvedSource = sourcePath.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '')
  resolvedSource = resolve(resolvedSource)

  // Validate source file exists
  if (!existsSync(resolvedSource)) {
    console.error(`${c.red}Error: Source file not found: ${resolvedSource}${c.reset}`)
    process.exit(1)
  }

  // Validate it's an audio file
  const ext = extname(resolvedSource).toLowerCase()
  if (!['.mp3', '.wav', '.ogg', '.m4a', '.webm'].includes(ext)) {
    console.error(`${c.red}Error: Expected audio file (.mp3, .wav, .ogg, .m4a), got: ${ext}${c.reset}`)
    process.exit(1)
  }

  // Create category directory
  const categoryDir = resolve(MUSIC_DIR, catalogTrack.category)
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true })
    console.log(`${c.dim}Created directory: ${categoryDir}${c.reset}`)
  }

  // Determine destination filename
  const destFileName = trackIdToFileName(trackIdUpper)
  // If source is not mp3, keep original extension
  const finalFileName = ext === '.mp3' ? destFileName : destFileName.replace('.mp3', ext)
  const destPath = resolve(categoryDir, finalFileName)

  // Copy file
  copyFileSync(resolvedSource, destPath)

  // Get file size
  const stats = statSync(destPath)
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1)

  // Try to get duration using ffprobe if available
  let duration = null
  try {
    const ffprobeOutput = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${resolvedSource}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim()
    duration = parseFloat(ffprobeOutput)
  } catch {
    // ffprobe not available, duration stays null
  }

  // Update manifest
  const manifest = loadManifest()

  // Remove from pending_tracks if present
  manifest.pending_tracks = (manifest.pending_tracks || []).filter(t => t.id !== trackIdUpper)

  // Remove from not_generated if present
  const notGenName = destFileName.replace('.mp3', '')
  manifest.not_generated = (manifest.not_generated || []).filter(t => t.name !== notGenName)

  // Add to generated_tracks
  const relativePath = `${catalogTrack.category}/${finalFileName}`
  const existingGen = (manifest.generated_tracks || []).find(g => g.trackId === trackIdUpper)

  if (existingGen) {
    // Add as additional version
    existingGen.files = existingGen.files || []
    existingGen.files.push(relativePath)
    if (duration) {
      existingGen.durations = existingGen.durations || []
      existingGen.durations.push(duration)
    }
  } else {
    // New track entry
    const newEntry = {
      trackId: trackIdUpper,
      name: destFileName.replace('.mp3', ''),
      title: catalogTrack.name,
      titleHe: catalogTrack.nameHe,
      description: `${catalogTrack.style} - ${catalogTrack.nameHe}`,
      style: catalogTrack.style,
      category: catalogTrack.category,
      files: [relativePath],
      importedAt: new Date().toISOString(),
      status: 'ready',
    }
    if (duration) {
      newEntry.durations = [duration]
      newEntry.duration = duration
    }
    manifest.generated_tracks = manifest.generated_tracks || []
    manifest.generated_tracks.push(newEntry)
  }

  saveManifest(manifest)

  console.log('')
  console.log(`${c.green}✓ Track imported successfully!${c.reset}`)
  console.log('')
  console.log(`${c.bold}Track:${c.reset}    ${catalogTrack.id} — ${catalogTrack.name} (${catalogTrack.nameHe})`)
  console.log(`${c.bold}Source:${c.reset}   ${resolvedSource}`)
  console.log(`${c.bold}Dest:${c.reset}     ${destPath}`)
  console.log(`${c.bold}Size:${c.reset}     ${sizeMB} MB`)
  if (duration) {
    console.log(`${c.bold}Duration:${c.reset} ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`)
  }
  console.log('')

  // Show updated status
  const statuses = getTrackStatuses()
  const catTracks = statuses.filter(t => t.category === catalogTrack.category)
  const catDone = catTracks.filter(t => t.status === 'done').length
  console.log(`${c.bold}${catalogTrack.category}:${c.reset} ${catDone}/${catTracks.length} tracks done`)
  console.log('')
}

function cmdValidate() {
  const manifest = loadManifest()
  let errors = 0
  let warnings = 0

  console.log('')
  console.log(`${c.bold}${c.magenta}  VALIDATION REPORT${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  // Check generated tracks have files
  for (const track of manifest.generated_tracks || []) {
    for (const file of track.files || []) {
      const filePath = resolve(MUSIC_DIR, file)
      if (!existsSync(filePath)) {
        console.log(`  ${c.red}✗ MISSING FILE${c.reset}: ${track.title || track.name} → ${file}`)
        console.log(`    ${c.dim}Expected at: ${filePath}${c.reset}`)
        errors++
      } else {
        const stats = statSync(filePath)
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1)
        console.log(`  ${c.green}✓${c.reset} ${(track.title || track.name).padEnd(30)} ${file.padEnd(35)} ${c.dim}(${sizeMB} MB)${c.reset}`)
      }
    }
  }

  // Check for orphaned files in music directory
  console.log('')
  console.log(`  ${c.bold}Checking for orphaned files...${c.reset}`)

  const knownFiles = new Set()
  for (const track of manifest.generated_tracks || []) {
    for (const f of track.files || []) {
      knownFiles.add(f)
    }
  }

  const categories = ['characters', 'gameplay', 'battle', 'story', 'menu', 'events', 'worlds']
  for (const cat of categories) {
    const catDir = resolve(MUSIC_DIR, cat)
    if (existsSync(catDir)) {
      try {
        const files = readdirSync(catDir).filter(f => !f.startsWith('.'))
        for (const f of files) {
          const relPath = `${cat}/${f}`
          if (!knownFiles.has(relPath)) {
            console.log(`  ${c.yellow}⚠ ORPHANED${c.reset}: ${relPath} (not in manifest)`)
            warnings++
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Check for flat files that should be in categories
  try {
    const allMusicFiles = readdirSync(MUSIC_DIR).filter(f => f.endsWith('.mp3'))
    for (const fileName of allMusicFiles) {
      if (!knownFiles.has(fileName)) {
        // Check if it's a known generated track in old flat format
        const isKnownFlat = (manifest.generated_tracks || []).some(t => (t.files || []).includes(fileName))
        if (!isKnownFlat) {
          console.log(`  ${c.yellow}⚠ FLAT FILE${c.reset}: ${fileName} (should be in a category subfolder)`)
          warnings++
        }
      }
    }
  } catch {
    // ignore
  }

  // Check pending tracks still have valid prompts
  const promptIds = new Set(FULL_CATALOG.map(t => t.id))
  for (const pending of manifest.pending_tracks || []) {
    if (!promptIds.has(pending.id)) {
      console.log(`  ${c.yellow}⚠ UNKNOWN PENDING${c.reset}: ${pending.id} (not in catalog)`)
      warnings++
    }
  }

  console.log('')
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  if (errors === 0 && warnings === 0) {
    console.log(`  ${c.green}✓ All checks passed!${c.reset}`)
  } else {
    if (errors > 0) console.log(`  ${c.red}${errors} error(s)${c.reset}`)
    if (warnings > 0) console.log(`  ${c.yellow}${warnings} warning(s)${c.reset}`)
  }
  console.log('')
}

function cmdHelp() {
  console.log(`
${c.bold}${c.magenta}  SUNO MUSIC PIPELINE - Ninja Keyboard${c.reset}
${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}

  ${c.bold}Commands:${c.reset}

  ${c.cyan}status${c.reset}              Dashboard of track completion by category
  ${c.cyan}list${c.reset}                List all tracks with current state
  ${c.cyan}next${c.reset}                Show priority tracks to generate next
  ${c.cyan}copy${c.reset} ${c.dim}<ID>${c.reset}           Copy Suno prompt to clipboard
  ${c.cyan}import${c.reset} ${c.dim}<ID> <PATH>${c.reset}  Import downloaded track into project
  ${c.cyan}validate${c.reset}            Check manifest integrity and file existence
  ${c.cyan}help${c.reset}                Show this help

  ${c.bold}Examples:${c.reset}

  node scripts/suno-music-pipeline.mjs status
  node scripts/suno-music-pipeline.mjs copy CHAR-001
  node scripts/suno-music-pipeline.mjs import CHAR-001 ~/Downloads/suno-ki-theme.mp3
  node scripts/suno-music-pipeline.mjs validate

  ${c.bold}Track ID Format:${c.reset}

  MENU-001..006    Menu themes
  PLAY-001..005    Gameplay / practice
  BATTLE-001..010  Battle music
  EVENT-001..008   Event stingers / jingles
  CHAR-001..008    Character themes
  STORY-001..002   Story music
  WORLD-001..005   Age world ambients

  ${c.bold}File Structure:${c.reset}

  public/audio/music/
    characters/     Character theme tracks
    gameplay/       Practice & challenge tracks
    battle/         Rival & boss battle tracks
    story/          Narrative cinematic tracks
    menu/           Menu & navigation tracks
    events/         Stingers & jingles
    worlds/         Age world ambient tracks

  ${c.bold}Workflow:${c.reset}

  1. ${c.cyan}status${c.reset}   → See what needs generating
  2. ${c.cyan}next${c.reset}     → Pick highest priority track
  3. ${c.cyan}copy ID${c.reset}  → Copy prompt to clipboard
  4. Open ${c.bold}suno.com${c.reset}, paste prompt, generate, download
  5. ${c.cyan}import ID path${c.reset} → Import into project
  6. ${c.cyan}validate${c.reset} → Verify everything is correct
`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const command = args[0]?.toLowerCase() || 'help'

switch (command) {
  case 'status':
    cmdStatus()
    break
  case 'list':
    cmdList()
    break
  case 'next':
    cmdNext()
    break
  case 'copy':
    cmdCopy(args[1])
    break
  case 'import':
    cmdImport(args[1], args[2])
    break
  case 'validate':
    cmdValidate()
    break
  case 'help':
  case '--help':
  case '-h':
    cmdHelp()
    break
  default:
    console.error(`${c.red}Unknown command: ${command}${c.reset}`)
    console.error(`Run ${c.bold}node scripts/suno-music-pipeline.mjs help${c.reset} for usage.`)
    process.exit(1)
}
