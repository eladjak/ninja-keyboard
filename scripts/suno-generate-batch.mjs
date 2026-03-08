#!/usr/bin/env node

/**
 * Suno Batch Music Generator - Ninja Keyboard
 *
 * Fully automated music generation using gcui-art/suno-api as a local proxy.
 * Reads prompts from suno-prompts.json and the full catalog in suno-music-pipeline.mjs,
 * generates tracks via Suno API, downloads MP3s, and updates the manifest.
 *
 * Usage:
 *   node scripts/suno-generate-batch.mjs                    # Generate all pending tracks
 *   node scripts/suno-generate-batch.mjs --dry-run          # Preview what will be generated
 *   node scripts/suno-generate-batch.mjs --track CHAR-001   # Generate specific track only
 *   node scripts/suno-generate-batch.mjs --limit 5          # Generate only first 5 pending
 *   node scripts/suno-generate-batch.mjs --category battle  # Generate all battle tracks
 *   node scripts/suno-generate-batch.mjs --pick             # Interactive: pick best take after generation
 *
 * Prerequisites:
 *   - gcui-art/suno-api running at http://localhost:3000
 *   - Run `node scripts/suno-setup.mjs` first to verify
 *
 * Cost: 5 credits per generation request, each produces 2 song variations.
 * Premier subscription: 10,000 credits/month.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

// ─── Paths ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const PROMPTS_PATH = resolve(__dirname, 'suno-prompts.json')
const MANIFEST_PATH = resolve(PROJECT_ROOT, 'public/audio/music/music-manifest.json')
const MUSIC_DIR = resolve(PROJECT_ROOT, 'public/audio/music')

// ─── Configuration ──────────────────────────────────────────────────────────

const SUNO_API_BASE = process.env.SUNO_API_URL || 'http://localhost:3000'
const POLL_INTERVAL_MS = 5000       // Poll every 5 seconds for completion
const POLL_TIMEOUT_MS = 300000      // Max 5 minutes per track
const DELAY_BETWEEN_GENS_MS = 3000  // 3 second delay between generation requests
const CREDITS_PER_GENERATION = 5    // Each generation costs 5 credits

// ─── ANSI Colors ────────────────────────────────────────────────────────────

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
}

// ─── Full Track Catalog ─────────────────────────────────────────────────────
// Duplicated from suno-music-pipeline.mjs for independence.
// Each track has: id, name, nameHe, category, priority, sunoPrompt, style, duration
// Tracks with existingFile are already generated (e.g., main-theme, boss-battle).

const FULL_CATALOG = [
  // === MENU ===
  { id: 'MENU-001', name: 'Home Screen Theme', nameHe: 'ערכת המסך הראשי', category: 'menu', priority: 1, existingFile: 'main-theme.mp3', sunoPrompt: 'Happy energetic chiptune ninja game theme for kids, Japanese 8-bit adventure music, upbeat melody, loopable', style: 'Chiptune 8-bit', duration: '60-90s' },
  { id: 'MENU-002', name: 'Lessons Menu', nameHe: 'תפריט השיעורים', category: 'menu', priority: 2, sunoPrompt: 'Calm focused lo-fi study music, soft piano, gentle synth pads, loopable ambient, 80 BPM, peaceful concentration music, Japanese inspired', style: 'Lo-fi / Ambient', duration: '60-90s' },
  { id: 'MENU-003', name: 'Battle Menu', nameHe: 'תפריט קרבות', category: 'menu', priority: 2, sunoPrompt: 'Intense synthwave battle lobby music, pulsing bass, building tension, electronic 130 BPM, dark neon aesthetic, gaming pre-battle theme, loopable', style: 'Synthwave', duration: '60-90s' },
  { id: 'MENU-004', name: 'Games Hub', nameHe: 'מרכז המשחקים', category: 'menu', priority: 3, sunoPrompt: 'Playful chiptune pop game hub music, bouncy melody, fun 8-bit sounds with modern electronic twist, 125 BPM, arcade energy, kids friendly, loopable', style: 'Chiptune Pop', duration: '60-90s' },
  { id: 'MENU-005', name: 'Profile / Progress', nameHe: 'פרופיל והתקדמות', category: 'menu', priority: 3, sunoPrompt: 'Reflective proud ambient orchestral music, soft strings with piano, gentle achievement melody, emotional warmth, 70 BPM, inspiring journey music, loopable', style: 'Ambient Orchestral', duration: '60-90s' },
  { id: 'MENU-006', name: 'Settings', nameHe: 'הגדרות', category: 'menu', priority: 4, sunoPrompt: 'Minimal neutral ambient background music, soft electronic pads, no melody, pure atmosphere, 60 BPM, very calm and unobtrusive, settings screen mood, loopable', style: 'Minimal Ambient', duration: '60-90s' },

  // === GAMEPLAY ===
  { id: 'PLAY-001', name: 'Practice Easy', nameHe: 'תרגול — קל', category: 'gameplay', priority: 1, sunoPrompt: 'Calm lo-fi study music with soft chiptune textures, gentle piano over warm analog pads, mellow hip-hop beat with typing rhythm undertone, soft jazzy chords, Japanese aesthetic ambient, 80 BPM, peaceful concentration music, minimal melodic movement to avoid distraction, warm bass, focus zone for keyboard practice, kid-friendly calm, loopable, no vocals', style: 'Lo-fi Hip Hop', duration: '120-180s' },
  { id: 'PLAY-002', name: 'Practice Medium', nameHe: 'תרגול — בינוני', category: 'gameplay', priority: 2, sunoPrompt: 'Upbeat focus music, indie electronic, melodic synths, steady 110 BPM, energetic but not stressful, productivity flow state, no lyrics, loopable', style: 'Indie Electronic', duration: '120-180s' },
  { id: 'PLAY-003', name: 'Practice Hard', nameHe: 'תרגול — קשה', category: 'gameplay', priority: 3, sunoPrompt: 'High intensity drum and bass music, fast 160 BPM, electronic synths, driving beat, focus zone music, no vocals, intense typing session energy, loopable', style: 'Drum and Bass', duration: '120-180s' },
  { id: 'PLAY-004', name: 'Speed Test', nameHe: 'אדרנלין — מבחן מהירות', category: 'gameplay', priority: 1, sunoPrompt: 'Adrenaline rush EDM with chiptune countdown elements, building from 120 to 140 BPM, epic synthwave drop, racing heartbeat bass, competitive speed challenge anthem, ticking clock tension with 8-bit urgency, electronic builds and releases, intense but not scary for kids, pixel art meets stadium energy, typing speed test power music, loopable, no vocals', style: 'EDM / Synthwave', duration: '120-180s' },
  { id: 'PLAY-005', name: 'Accuracy Challenge', nameHe: 'אתגר דיוק', category: 'gameplay', priority: 3, sunoPrompt: 'Minimal techno precision music, clean 120 BPM, mathematical beats, surgical focus, no melodic distractions, pure rhythm typing music, loopable, accuracy and focus', style: 'Minimal Techno', duration: '120-180s' },

  // === BATTLE ===
  { id: 'BATTLE-001', name: 'Pre-Battle Anticipation', nameHe: 'אנטיסיפציה לפני קרב', category: 'battle', priority: 2, sunoPrompt: 'Pre-battle anticipation music, orchestral tension building, 30 seconds, dramatic strings, nervous energy, video game battle intro, not full combat yet, suspenseful', style: 'Orchestral Tension', duration: '30-60s' },
  { id: 'BATTLE-002', name: 'Shadow Cat Battle', nameHe: 'Shadow Cat — קרב קל', category: 'battle', priority: 1, sunoPrompt: 'Shadow ninja cat battle music, chiptune 8-bit, sneaky mysterious melody, 120 BPM, competitive but friendly, kids game battle theme, Japanese shadow aesthetic, loopable', style: 'Chiptune Battle', duration: '120-180s' },
  { id: 'BATTLE-003', name: 'Storm Fox Battle', nameHe: 'Storm Fox — קרב בינוני', category: 'battle', priority: 1, sunoPrompt: 'Storm fox battle music, electro rock with electric guitar riffs, powerful synths, 135 BPM, wind and thunder sounds woven in, intense competitive, loopable game battle', style: 'Electro Rock', duration: '120-180s' },
  { id: 'BATTLE-004', name: 'Blaze Dragon Battle', nameHe: 'Blaze Dragon — קרב קשה', category: 'battle', priority: 2, sunoPrompt: 'Blaze dragon epic metal battle, heavy guitars, orchestral brass, fire and fury, 145 BPM, epic boss battle intensity, no holds barred, loopable high energy gaming anthem', style: 'Metal / Epic', duration: '120-180s' },
  { id: 'BATTLE-005', name: 'Bug Boss Act 1', nameHe: 'Bug — מעשה ראשון', category: 'battle', priority: 1, existingFile: 'boss-battle.mp3', sunoPrompt: 'Bug monster boss act 1, glitchy electronic music, playful chaos, digital glitch sounds, mischievous 125 BPM, not too scary, whimsical evil, video game boss theme, loopable', style: 'Glitchy Electronic', duration: '120-180s' },
  { id: 'BATTLE-006', name: 'Bug Boss Act 2', nameHe: 'Bug — מעשה שני', category: 'battle', priority: 2, sunoPrompt: 'Bug boss act 2, darker electronic battle, corrupted glitch synths, 140 BPM, increasing threat, digital corruption sounds, tense and dangerous, loopable boss fight escalation', style: 'Dark Electronic', duration: '120-180s' },
  { id: 'BATTLE-007', name: 'Bug King Final', nameHe: 'Bug King — מעשה שלישי', category: 'battle', priority: 2, sunoPrompt: 'Bug King final boss epic orchestral with glitch corruption, massive choir, heavy bass drops, 150 BPM, apocalyptic video game finale, strings and glitch combined, ultimate showdown loopable', style: 'Epic Orchestral + Glitch', duration: '120-180s' },
  { id: 'BATTLE-008', name: 'Glitch Secret Boss', nameHe: 'Glitch — בוס סודי', category: 'battle', priority: 3, sunoPrompt: 'Secret glitch boss corrupted vaporwave, reality breaking sounds, reversed melodies, time-stretched vocals, unsettling 100 BPM, reality corruption, mysterious and eerie, loopable hidden boss theme', style: 'Vaporwave Corrupted', duration: '120-180s' },
  { id: 'BATTLE-009', name: 'Boss Defeated Fanfare', nameHe: 'בוס הובס!', category: 'battle', priority: 2, sunoPrompt: 'Boss defeated victory stinger, 8 seconds, triumphant brass fanfare, climactic resolution, epic orchestral sting, video game victory moment, short and powerful, celebration burst', style: 'Orchestral Stinger', duration: '5-10s' },
  { id: 'BATTLE-010', name: 'Tournament Arena', nameHe: 'זירת טורנירים', category: 'battle', priority: 2, sunoPrompt: 'Epic tournament arena theme with full orchestral power and chiptune accents, competitive crowd energy, brass fanfare meets electronic bass drops, stadium anthem with 8-bit gaming nostalgia, building intensity, 135 BPM, majestic and competitive, esports meets retro gaming glory, Middle Eastern percussion undertone, champion energy, loopable, no vocals', style: 'Orchestral / Esports', duration: '120-180s' },

  // === EVENTS / STINGERS ===
  { id: 'EVENT-001', name: 'Victory Fanfare', nameHe: 'ניצחון!', category: 'events', priority: 1, sunoPrompt: 'Short triumphant victory fanfare, 10 seconds, bright brass section, ascending melody, proud achievement celebration, video game level complete, chiptune brass hybrid, uplifting finale', style: 'Brass Fanfare', duration: '5-10s' },
  { id: 'EVENT-002', name: 'Level Up Jingle', nameHe: 'עלית רמה!', category: 'events', priority: 1, sunoPrompt: 'Level up RPG jingle, 5 seconds, ascending chiptune melody, classic video game level up sound, happy and energetic, 8-bit celebration, short burst of joy', style: 'Chiptune Jingle', duration: '5s' },
  { id: 'EVENT-003', name: 'Character Unlock', nameHe: 'דמות חדשה נפתחה!', category: 'events', priority: 1, sunoPrompt: 'Character unlock magical discovery jingle, 8 seconds, sparkle sounds, wonder and delight, arpeggio ascending, whimsical bells and synth, new friend revealed music, magical surprise', style: 'Magical Jingle', duration: '8s' },
  { id: 'EVENT-004', name: 'Achievement Unlock', nameHe: 'אצ\'יבמנט נפתח!', category: 'events', priority: 1, sunoPrompt: 'Achievement unlocked power jingle, 6 seconds, bold power chord, gaming achievement sound, satisfying unlock, short impactful burst, proud moment music, Xbox achievement style', style: 'Power Chord Jingle', duration: '6s' },
  { id: 'EVENT-005', name: 'Streak Milestone', nameHe: 'סטריק!', category: 'events', priority: 2, sunoPrompt: 'Streak milestone fire jingle, 8 seconds, rising build with fire crackling sounds, momentum and heat, ascending intensity, combo achievement music, on fire gaming moment', style: 'Rising Buildup', duration: '8s' },
  { id: 'EVENT-006', name: 'Season Event Theme', nameHe: 'אירוע עונה', category: 'events', priority: 4, sunoPrompt: 'Festive season event music, celebratory electronic with Middle Eastern flavor, holiday special gaming theme, joyful and energetic, 125 BPM, seasonal celebration loopable', style: 'Festive Electronic', duration: '60-90s' },
  { id: 'EVENT-007', name: 'Personal Best', nameHe: 'שיא אישי!', category: 'events', priority: 2, sunoPrompt: 'Personal best record stinger, 7 seconds, epic orchestral burst, new record achieved sound, triumphant moment, sports achievement style, huge and memorable, short but massive impact', style: 'Epic Stinger', duration: '7s' },
  { id: 'EVENT-008', name: 'Defeat / Try Again', nameHe: 'כישלון — נסה שוב', category: 'events', priority: 2, sunoPrompt: 'Playful defeat jingle, 6 seconds, descending melody, whimsical sad but hopeful, try again energy, kids game failure sound, not discouraging, bounce back vibe, chiptune wah-wah', style: 'Sad Trombone Reimagined', duration: '6s' },

  // === CHARACTERS ===
  { id: 'CHAR-001', name: "Ki's Theme", nameHe: 'ערכת קי — גיבור', category: 'characters', priority: 1, sunoPrompt: 'Adventurous chiptune hero theme with cinematic orchestral swell, energetic young ninja melody, Japanese shakuhachi flute meets 8-bit synth, Hebrew/Middle Eastern scale undertone, brave ascending motif, plucky and determined, bright warm chords, loopable, 120 BPM, kids game main character anthem, no vocals', style: 'Adventure Chiptune + Orchestral', duration: '60-90s' },
  { id: 'CHAR-002', name: "Mika's Theme", nameHe: 'ערכת מיקה — טק הקרית', category: 'characters', priority: 1, sunoPrompt: 'Cyberpunk electronic pop with chiptune glitch accents, edgy hacker girl theme, sharp digital circuit board sounds, neon synth arpeggios, confident and smart, bitcrushed hi-hats with clean melodic lead, dark purple aesthetic, keyboard typing rhythms woven into beat, 130 BPM, loopable, no vocals', style: 'Cyberpunk Pop', duration: '60-90s' },
  { id: 'CHAR-003', name: "Sensei Zen's Theme", nameHe: 'ערכת סנסיי זן — חכם', category: 'characters', priority: 1, sunoPrompt: 'Peaceful traditional Japanese shakuhachi flute and koto strings with subtle chiptune warmth, ancient turtle master wisdom, meditation temple bells, gentle water flowing ambient, Hebrew/Middle Eastern pentatonic scale blended with Japanese harmony, slow dignified 70 BPM, serene and wise, deep calm guidance energy, zen garden atmosphere, loopable, no vocals', style: 'Traditional Japanese / Zen', duration: '60-90s' },
  { id: 'CHAR-004', name: "Bug's Theme", nameHe: 'ערכת Bug — קאוס', category: 'characters', priority: 2, sunoPrompt: 'Bug villain theme, 20 seconds, glitchy chaotic electronic, evil mischief, corrupted data sounds, menacing but cartoonish, digital bug monster leitmotif, erratic rhythm', style: 'Glitch Villain', duration: '20s' },
  { id: 'CHAR-005', name: "Yuki's Theme", nameHe: 'ערכת יוקי — מהירות', category: 'characters', priority: 1, sunoPrompt: 'Ultra-fast J-pop electronic with chiptune racing pulse, wind rushing SFX, bright energetic female character speed theme, rapid arpeggios building intensity, competitive spirit, lightning-fast 160 BPM bursts alternating with 140 BPM groove, pixel art meets anime energy, triumphant speed demon melody, loopable, no vocals', style: 'J-Pop / Fast Electronic', duration: '60-90s' },
  { id: 'CHAR-006', name: "Luna's Theme", nameHe: 'ערכת לונה — שלווה', category: 'characters', priority: 2, sunoPrompt: 'Luna calm companion theme, 20 seconds, dreamy ambient pop, soft violin, moonlight atmosphere, gentle encouragement music, slow and comforting, nocturnal serenity', style: 'Dream Pop', duration: '20s' },
  { id: 'CHAR-007', name: "Rex's Theme", nameHe: 'ערכת Rex — משחקיות', category: 'characters', priority: 2, sunoPrompt: 'Rex dinosaur theme, 20 seconds, cartoon rock with dinosaur roars, heavy stomp rhythm, funny and powerful, T-Rex gaming buddy, prehistoric meets arcade, fun character theme', style: 'Dino Rock', duration: '20s' },
  { id: 'CHAR-008', name: "Glitch's Theme", nameHe: 'ערכת Glitch — כאוס טהור', category: 'characters', priority: 2, sunoPrompt: 'Corrupted vaporwave meets emotional chiptune, digital noise and bitcrushed fragments, reality-breaking glitch sounds with hidden beautiful melody underneath, time-stretched reversed notes, stuttering rhythm that resolves into warm piano phrase, unstable yet fascinating, sad and mysterious, 100 BPM wobbling, secret boss theme with emotional depth, feminine energy, loopable, no vocals', style: 'Glitch / Vaporwave', duration: '60-90s' },

  // === STORY ===
  { id: 'STORY-001', name: 'Emotional Moment', nameHe: 'סיפור — רגע רגשי', category: 'story', priority: 1, sunoPrompt: 'Emotional cinematic piano with gentle strings, tearful beautiful melody, chiptune music box undertone adding nostalgic innocence, heartfelt moment in a kids game story, soft violin solo over warm pads, Hebrew/Middle Eastern minor scale emotional progression, slow 65 BPM, bittersweet and touching, friendship and sacrifice theme, building to gentle emotional climax then resolving softly, no vocals', style: 'Cinematic Piano / Strings', duration: '90-120s' },
  { id: 'STORY-002', name: 'Victory/Celebration', nameHe: 'סיפור — ניצחון וחגיגה', category: 'story', priority: 1, sunoPrompt: 'Triumphant celebration theme combining full orchestra with chiptune joy, all instruments united in victorious melody, brass fanfare with 8-bit sparkle, Middle Eastern percussion celebration (darbuka, frame drum), ascending major key progression building to massive climax, 130 BPM, pure joy and accomplishment, kids game final victory anthem, heroes united moment, confetti energy, sunshine after storm, no vocals', style: 'Orchestral Triumphant', duration: '90-120s' },

  // === AGE WORLDS ===
  { id: 'WORLD-001', name: 'Shatil - Magical Garden', nameHe: 'שתיל — גן קסום (6-8)', category: 'worlds', priority: 2, sunoPrompt: 'Magical garden ambient for young children, music box melody, bird chirping, gentle bells, 60 BPM, warm and safe, Duolingo kids energy, enchanted forest sounds, loopable lullaby ambient', style: 'Toybox Ambient', duration: '120-180s' },
  { id: 'WORLD-002', name: 'Nevet - Adventure Camp', nameHe: 'נבט — מחנה הרפתקות (8-10)', category: 'worlds', priority: 2, sunoPrompt: 'Adventure camp theme, upbeat adventure pop, outdoor exploration energy, friendly and exciting, 105 BPM, Pokemon game town music inspired, summer camp vibes, loopable kids adventure', style: 'Adventure Pop', duration: '120-180s' },
  { id: 'WORLD-003', name: 'Geza - Ninja Arena', nameHe: "גזע — זירת נינג'ה (10-12)", category: 'worlds', priority: 1, sunoPrompt: 'Ninja arena dark synthwave, neon gaming ambient, competitive 125 BPM, Brawl Stars energy, dark neon aesthetic, electronic pulses, cool and intense, gaming lobby music, loopable', style: 'Dark Synthwave', duration: '120-180s' },
  { id: 'WORLD-004', name: 'Anaf - Training Hub', nameHe: 'ענף — מרכז אימון (12-14)', category: 'worlds', priority: 3, sunoPrompt: 'Mature training hub lo-fi minimal, dark ambient with subtle beats, 90 BPM, professional productivity music, teen appropriate, Discord dark theme energy, clean and understated, loopable', style: 'Lo-fi Minimal', duration: '120-180s' },
  { id: 'WORLD-005', name: 'Tzameret - Professional', nameHe: 'צמרת — מקצועי (14-16+)', category: 'worlds', priority: 3, sunoPrompt: 'Professional minimal electronic ambient, near silence with subtle texture, developer/programmer atmosphere, 70 BPM, mature and respectful, Monkeytype dark mode energy, barely there music, loopable', style: 'Minimal Electronic', duration: '120-180s' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function log(icon, msg) {
  console.log(`  ${c.dim}[${timestamp()}]${c.reset} ${icon} ${msg}`)
}

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

// Category name mapping: catalog uses plural forms for directory names
function getCategoryDir(catalogCategory) {
  // The catalog uses: menu, gameplay, battle, events, characters, story, worlds
  // Some of these map differently to the manifest conventions
  return catalogCategory
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

/**
 * Load prompts from suno-prompts.json. These are the detailed, curated prompts.
 * For tracks NOT in suno-prompts.json, we fall back to the catalog prompt.
 */
function loadDetailedPrompts() {
  if (!existsSync(PROMPTS_PATH)) return []
  return JSON.parse(readFileSync(PROMPTS_PATH, 'utf-8'))
}

/**
 * Get the best available prompt for a track ID.
 * Prefers suno-prompts.json (more detailed) over the catalog prompt.
 */
function getPromptForTrack(trackId) {
  const detailed = loadDetailedPrompts()
  const detailedEntry = detailed.find(p => p.id === trackId)
  const catalogEntry = FULL_CATALOG.find(t => t.id === trackId)

  if (!catalogEntry) return null

  return {
    id: trackId,
    name: catalogEntry.name,
    nameHe: catalogEntry.nameHe,
    category: catalogEntry.category,
    priority: catalogEntry.priority,
    style: detailedEntry?.style || catalogEntry.style,
    duration: catalogEntry.duration,
    // Prefer the detailed prompt from suno-prompts.json
    sunoPrompt: detailedEntry?.sunoPrompt || catalogEntry.sunoPrompt,
  }
}

/**
 * Determine which tracks need to be generated.
 * A track is "pending" if:
 *   1. It has no existingFile in the catalog
 *   2. Its MP3 doesn't already exist in the category directory
 *   3. It's not already in the manifest's generated_tracks
 */
function getPendingTracks() {
  const manifest = loadManifest()

  // Build set of existing files
  const existingFiles = new Set()

  // Check flat files in music dir
  for (const track of manifest.generated_tracks || []) {
    for (const f of track.files || []) {
      existingFiles.add(f)
    }
  }

  // Check category subdirectories
  const categories = ['characters', 'gameplay', 'battle', 'story', 'menu', 'events', 'worlds']
  for (const cat of categories) {
    const catDir = resolve(MUSIC_DIR, cat)
    if (existsSync(catDir)) {
      try {
        const files = readdirSync(catDir).filter(f => !f.startsWith('.'))
        for (const f of files) {
          existingFiles.add(`${cat}/${f}`)
        }
      } catch { /* ignore */ }
    }
  }

  const pending = []

  for (const track of FULL_CATALOG) {
    // Skip tracks that already have files
    if (track.existingFile) continue

    const expectedFile = trackIdToFileName(track.id)
    const categoryPath = `${track.category}/${expectedFile}`

    // Skip if file exists in category directory
    if (existingFiles.has(categoryPath)) continue

    // Skip if flat file exists
    if (existingFiles.has(expectedFile)) continue

    // Skip if already tracked as generated
    const isGenerated = (manifest.generated_tracks || []).some(g =>
      g.trackId === track.id || g.name === expectedFile?.replace('.mp3', '')
    )
    if (isGenerated) continue

    // This track needs generation
    pending.push(track)
  }

  // Sort by priority (P1 first) then by ID for deterministic order
  pending.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.id.localeCompare(b.id)
  })

  return pending
}

// ─── Suno API Client ────────────────────────────────────────────────────────

async function sunoFetch(path, options = {}) {
  const url = `${SUNO_API_BASE}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
    }

    return await res.json()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

/**
 * Check remaining credits via the Suno API proxy.
 */
async function getCredits() {
  try {
    const data = await sunoFetch('/api/get_limit')
    return {
      remaining: data.credits_left ?? data.total_credits_left ?? data.remaining ?? null,
      total: data.monthly_limit ?? data.total_credits ?? data.period ?? null,
    }
  } catch (err) {
    return { remaining: null, total: null, error: err.message }
  }
}

/**
 * Submit a generation request to Suno via the local API proxy.
 * Returns an array of song objects (usually 2) with their IDs.
 */
async function submitGeneration(prompt, tags, title) {
  const body = {
    prompt,
    tags,
    title,
    make_instrumental: true,
    wait_audio: false,
  }

  log(`${c.blue}>>>${c.reset}`, `Submitting: ${c.bold}${title}${c.reset}`)
  log(`${c.dim}   ${c.reset}`, `${c.dim}Tags: ${tags}${c.reset}`)

  const data = await sunoFetch('/api/custom_generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // The API returns an array of song objects
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Unexpected response format: ${JSON.stringify(data).slice(0, 200)}`)
  }

  const ids = data.map(s => s.id)
  log(`${c.green}<<<${c.reset}`, `Got ${data.length} song IDs: ${c.dim}${ids.join(', ')}${c.reset}`)

  return data
}

/**
 * Poll for song completion. Suno generates songs asynchronously.
 * We poll until status is 'complete' or 'streaming' (which means audio_url is available).
 */
async function pollForCompletion(songIds) {
  const idsParam = songIds.join(',')
  const startTime = Date.now()

  while (true) {
    const elapsed = Date.now() - startTime
    if (elapsed > POLL_TIMEOUT_MS) {
      throw new Error(`Timeout: songs ${idsParam} did not complete within ${POLL_TIMEOUT_MS / 1000}s`)
    }

    const data = await sunoFetch(`/api/get?ids=${idsParam}`)

    if (!Array.isArray(data)) {
      throw new Error(`Unexpected poll response: ${JSON.stringify(data).slice(0, 200)}`)
    }

    // Check if all songs are complete
    const allComplete = data.every(s =>
      s.status === 'complete' || s.status === 'streaming' || s.audio_url
    )

    if (allComplete) {
      const elapsedSec = Math.round(elapsed / 1000)
      log(`${c.green}[OK]${c.reset}`, `All ${data.length} songs complete (${elapsedSec}s)`)
      return data
    }

    // Show progress
    const statuses = data.map(s => s.status || 'unknown')
    const elapsedSec = Math.round(elapsed / 1000)
    process.stdout.write(`\r  ${c.dim}[${timestamp()}]${c.reset} ${c.yellow}...${c.reset} Waiting (${elapsedSec}s) - statuses: ${statuses.join(', ')}    `)

    await sleep(POLL_INTERVAL_MS)
  }
}

/**
 * Download an MP3 file from a URL to a local path.
 */
async function downloadFile(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status} for ${url}`)
  }

  // Ensure directory exists
  const dir = dirname(destPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(res.body, fileStream)

  const stats = statSync(destPath)
  return stats.size
}

// ─── Generation Pipeline ───────────────────────────────────────────────────

/**
 * Generate a single track: submit, poll, download, update manifest.
 * Suno produces 2 variations per request -- we save both.
 */
async function generateTrack(track) {
  const prompt = getPromptForTrack(track.id)
  if (!prompt) {
    log(`${c.red}[ERR]${c.reset}`, `Track ${track.id} not found in catalog`)
    return { success: false, error: 'Track not found' }
  }

  const categoryDir = resolve(MUSIC_DIR, track.category)
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true })
  }

  try {
    // Step 1: Submit generation
    const songs = await submitGeneration(
      prompt.sunoPrompt,
      prompt.style,
      prompt.name
    )

    const songIds = songs.map(s => s.id)

    // Step 2: Poll for completion
    console.log('') // newline after the submission log
    const completedSongs = await pollForCompletion(songIds)
    console.log('') // newline after progress indicator

    // Step 3: Download all variations
    const downloadedFiles = []
    const durations = []

    for (let i = 0; i < completedSongs.length; i++) {
      const song = completedSongs[i]
      const audioUrl = song.audio_url

      if (!audioUrl) {
        log(`${c.yellow}[WARN]${c.reset}`, `Song ${song.id} has no audio_url, skipping download`)
        continue
      }

      // First variation = track-name.mp3, second = track-name-v2.mp3, etc.
      const baseFileName = trackIdToFileName(track.id)
      const fileName = i === 0 ? baseFileName : baseFileName.replace('.mp3', `-v${i + 1}.mp3`)
      const destPath = resolve(categoryDir, fileName)

      log(`${c.cyan}[DL]${c.reset}`, `Downloading take ${i + 1}: ${c.dim}${audioUrl.slice(0, 80)}...${c.reset}`)

      const fileSize = await downloadFile(audioUrl, destPath)
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(1)

      downloadedFiles.push(`${track.category}/${fileName}`)
      durations.push(song.duration || null)

      log(`${c.green}[OK]${c.reset}`, `Saved: ${c.bold}${track.category}/${fileName}${c.reset} (${sizeMB} MB)`)
    }

    // Step 4: Update manifest
    if (downloadedFiles.length > 0) {
      updateManifest(track, downloadedFiles, durations, completedSongs)
    }

    return {
      success: true,
      files: downloadedFiles,
      songIds,
      creditsCost: CREDITS_PER_GENERATION,
    }

  } catch (err) {
    log(`${c.red}[ERR]${c.reset}`, `Failed to generate ${track.id}: ${err.message}`)
    return { success: false, error: err.message }
  }
}

/**
 * Update music-manifest.json after a successful generation.
 */
function updateManifest(track, files, durations, songData) {
  const manifest = loadManifest()

  // Remove from pending_tracks if present
  manifest.pending_tracks = (manifest.pending_tracks || []).filter(t => t.id !== track.id)

  // Remove from not_generated if present
  const nameSlug = trackIdToFileName(track.id)?.replace('.mp3', '')
  manifest.not_generated = (manifest.not_generated || []).filter(t => t.name !== nameSlug)

  // Check if already in generated_tracks
  const existingGen = (manifest.generated_tracks || []).find(g => g.trackId === track.id)

  if (existingGen) {
    // Add new files to existing entry
    existingGen.files = [...(existingGen.files || []), ...files]
    existingGen.durations = [...(existingGen.durations || []), ...durations.filter(d => d != null)]
  } else {
    // Create new generated track entry
    const newEntry = {
      trackId: track.id,
      name: nameSlug,
      title: track.name,
      titleHe: track.nameHe,
      description: `${track.style} - ${track.nameHe}`,
      style: track.style,
      category: track.category,
      files,
      durations: durations.filter(d => d != null),
      sunoSongIds: songData.map(s => s.id),
      generatedAt: new Date().toISOString(),
      status: 'ready',
    }
    manifest.generated_tracks = manifest.generated_tracks || []
    manifest.generated_tracks.push(newEntry)
  }

  saveManifest(manifest)
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: false,
    trackId: null,
    limit: null,
    category: null,
    pick: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
      case '-n':
        options.dryRun = true
        break
      case '--track':
      case '-t':
        options.trackId = args[++i]?.toUpperCase()
        break
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10)
        break
      case '--category':
      case '-c':
        options.category = args[++i]?.toLowerCase()
        break
      case '--pick':
      case '-p':
        options.pick = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        // Allow bare track ID (e.g., `CHAR-001`)
        if (/^[A-Z]+-\d+$/i.test(args[i])) {
          options.trackId = args[i].toUpperCase()
        } else {
          console.error(`${c.red}Unknown option: ${args[i]}${c.reset}`)
          printHelp()
          process.exit(1)
        }
    }
  }

  return options
}

function printHelp() {
  console.log(`
${c.bold}${c.magenta}  SUNO BATCH GENERATOR - Ninja Keyboard${c.reset}
${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}

  ${c.bold}Usage:${c.reset}
    node scripts/suno-generate-batch.mjs [options]

  ${c.bold}Options:${c.reset}
    ${c.cyan}--dry-run, -n${c.reset}          Preview what will be generated (no API calls)
    ${c.cyan}--track, -t <ID>${c.reset}      Generate a specific track only (e.g., CHAR-001)
    ${c.cyan}--limit, -l <N>${c.reset}       Generate at most N tracks
    ${c.cyan}--category, -c <CAT>${c.reset}  Generate tracks in a category only
                           Categories: menu, gameplay, battle, events, characters, story, worlds
    ${c.cyan}--pick, -p${c.reset}            Log Suno song IDs for manual comparison after generation
    ${c.cyan}--help, -h${c.reset}            Show this help

  ${c.bold}Examples:${c.reset}
    node scripts/suno-generate-batch.mjs                     # Generate all pending
    node scripts/suno-generate-batch.mjs --dry-run            # Preview plan
    node scripts/suno-generate-batch.mjs --track CHAR-001     # Single track
    node scripts/suno-generate-batch.mjs --limit 5            # First 5 pending
    node scripts/suno-generate-batch.mjs --category battle    # All battle tracks
    node scripts/suno-generate-batch.mjs CHAR-001             # Shorthand for --track

  ${c.bold}Prerequisites:${c.reset}
    Run ${c.cyan}node scripts/suno-setup.mjs${c.reset} first to verify the API is ready.

  ${c.bold}Cost:${c.reset}
    5 credits per generation request, each produces 2 song variations.
    Premier subscription: 10,000 credits/month.
`)
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const options = parseArgs()

  console.log('')
  console.log(`${c.bold}${c.magenta}  SUNO BATCH GENERATOR - Ninja Keyboard${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)

  if (options.dryRun) {
    console.log(`  ${c.yellow}${c.bold}DRY RUN MODE${c.reset} - No API calls will be made`)
  }

  // ─── Determine tracks to generate ────────────────────────────────────

  let tracks

  if (options.trackId) {
    // Single specific track
    const track = FULL_CATALOG.find(t => t.id === options.trackId)
    if (!track) {
      console.error(`\n  ${c.red}Track "${options.trackId}" not found in catalog.${c.reset}`)
      console.error(`  Valid IDs: ${FULL_CATALOG.map(t => t.id).join(', ')}`)
      process.exit(1)
    }
    tracks = [track]
  } else {
    // Get all pending tracks
    tracks = getPendingTracks()

    // Filter by category if specified
    if (options.category) {
      tracks = tracks.filter(t => t.category === options.category)
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      tracks = tracks.slice(0, options.limit)
    }
  }

  if (tracks.length === 0) {
    console.log('')
    console.log(`  ${c.green}${c.bold}Nothing to generate!${c.reset} All tracks are done or no matching tracks found.`)
    console.log(`  Run ${c.bold}node scripts/suno-music-pipeline.mjs status${c.reset} to see the dashboard.`)
    console.log('')
    return
  }

  // ─── Preview tracks ──────────────────────────────────────────────────

  console.log('')
  console.log(`  ${c.bold}Tracks to generate: ${tracks.length}${c.reset}`)
  console.log(`  ${c.bold}Estimated credits: ${tracks.length * CREDITS_PER_GENERATION}${c.reset} (${CREDITS_PER_GENERATION}/track)`)
  console.log(`  ${c.bold}Estimated time: ${Math.ceil(tracks.length * 1.5)}–${Math.ceil(tracks.length * 3)} minutes${c.reset}`)
  console.log('')

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i]
    const priorityColor = t.priority === 1 ? c.red : t.priority === 2 ? c.yellow : c.cyan
    console.log(`  ${c.dim}${String(i + 1).padStart(2)}.${c.reset} ${c.cyan}${t.id}${c.reset} ${t.name} ${c.dim}(${t.nameHe})${c.reset} ${priorityColor}P${t.priority}${c.reset} ${c.dim}[${t.category}]${c.reset}`)
  }
  console.log('')

  if (options.dryRun) {
    console.log(`  ${c.yellow}DRY RUN complete.${c.reset} Remove --dry-run to start generating.`)
    console.log('')

    // Show prompt details for each track
    console.log(`  ${c.bold}Prompt details:${c.reset}`)
    console.log('')
    for (const t of tracks) {
      const prompt = getPromptForTrack(t.id)
      console.log(`  ${c.cyan}${t.id}${c.reset} ${c.bold}${t.name}${c.reset}`)
      console.log(`  ${c.dim}Prompt: ${prompt.sunoPrompt.slice(0, 120)}...${c.reset}`)
      console.log(`  ${c.dim}Style:  ${prompt.style}${c.reset}`)
      console.log('')
    }
    return
  }

  // ─── Pre-flight: check API and credits ────────────────────────────────

  log(`${c.blue}[CHK]${c.reset}`, 'Checking Suno API connectivity...')

  const credits = await getCredits()
  if (credits.error) {
    console.log('')
    log(`${c.red}[ERR]${c.reset}`, `Cannot reach Suno API: ${credits.error}`)
    console.log(`  Run ${c.bold}node scripts/suno-setup.mjs${c.reset} to diagnose.`)
    console.log('')
    process.exit(1)
  }

  if (credits.remaining !== null) {
    log(`${c.green}[OK]${c.reset}`, `API connected. Credits: ${c.bold}${credits.remaining}${c.reset}${credits.total ? ` / ${credits.total}` : ''}`)

    const creditsNeeded = tracks.length * CREDITS_PER_GENERATION
    if (credits.remaining < creditsNeeded) {
      log(`${c.yellow}[WARN]${c.reset}`, `Need ${creditsNeeded} credits but only ${credits.remaining} available.`)
      const maxTracks = Math.floor(credits.remaining / CREDITS_PER_GENERATION)
      log(`${c.yellow}[WARN]${c.reset}`, `Will generate at most ${maxTracks} tracks before running out.`)
      tracks = tracks.slice(0, maxTracks)

      if (tracks.length === 0) {
        log(`${c.red}[ERR]${c.reset}`, 'Not enough credits for even one track. Wait for monthly reset.')
        process.exit(1)
      }
    }
  } else {
    log(`${c.yellow}[WARN]${c.reset}`, 'Could not read credit count. Proceeding anyway...')
  }

  // ─── Generate loop ────────────────────────────────────────────────────

  console.log('')
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log(`  ${c.bold}Starting generation of ${tracks.length} tracks...${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  const results = {
    success: [],
    failed: [],
    creditsUsed: 0,
    filesCreated: [],
    startTime: Date.now(),
  }

  const pickLog = [] // For --pick mode

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]

    console.log(`${c.dim}  ─── Track ${i + 1}/${tracks.length} ───${c.reset}`)
    log(`${c.magenta}[GEN]${c.reset}`, `${c.bold}${track.id}${c.reset} — ${track.name} ${c.dim}(${track.nameHe})${c.reset}`)

    const result = await generateTrack(track)

    if (result.success) {
      results.success.push({ ...track, ...result })
      results.creditsUsed += result.creditsCost
      results.filesCreated.push(...result.files)

      if (options.pick && result.songIds) {
        pickLog.push({
          id: track.id,
          name: track.name,
          songIds: result.songIds,
          files: result.files,
        })
      }

      log(`${c.green}[OK]${c.reset}`, `${c.green}${track.id} complete!${c.reset} Files: ${result.files.join(', ')}`)
    } else {
      results.failed.push({ ...track, error: result.error })
      log(`${c.red}[FAIL]${c.reset}`, `${track.id} failed: ${result.error}`)
    }

    console.log('')

    // Rate limiting delay between generations (skip after last one)
    if (i < tracks.length - 1) {
      log(`${c.dim}[WAIT]${c.reset}`, `${c.dim}Waiting ${DELAY_BETWEEN_GENS_MS / 1000}s before next generation...${c.reset}`)
      await sleep(DELAY_BETWEEN_GENS_MS)
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────────

  const totalTime = Math.round((Date.now() - results.startTime) / 1000)
  const minutes = Math.floor(totalTime / 60)
  const seconds = totalTime % 60

  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')
  console.log(`  ${c.bold}${c.magenta}GENERATION COMPLETE${c.reset}`)
  console.log('')
  console.log(`  ${c.green}Succeeded:${c.reset}     ${results.success.length} tracks`)
  console.log(`  ${c.red}Failed:${c.reset}        ${results.failed.length} tracks`)
  console.log(`  ${c.cyan}Credits used:${c.reset}  ~${results.creditsUsed}`)
  console.log(`  ${c.blue}Files created:${c.reset} ${results.filesCreated.length}`)
  console.log(`  ${c.dim}Total time:${c.reset}    ${minutes}m ${seconds}s`)
  console.log('')

  // Show successful tracks
  if (results.success.length > 0) {
    console.log(`  ${c.bold}${c.green}Generated tracks:${c.reset}`)
    for (const t of results.success) {
      console.log(`    ${c.green}+${c.reset} ${t.id} — ${t.name}`)
      for (const f of t.files) {
        console.log(`      ${c.dim}${f}${c.reset}`)
      }
    }
    console.log('')
  }

  // Show failed tracks
  if (results.failed.length > 0) {
    console.log(`  ${c.bold}${c.red}Failed tracks:${c.reset}`)
    for (const t of results.failed) {
      console.log(`    ${c.red}x${c.reset} ${t.id} — ${t.name}: ${c.dim}${t.error}${c.reset}`)
    }
    console.log('')
    console.log(`  ${c.yellow}To retry failed tracks:${c.reset}`)
    for (const t of results.failed) {
      console.log(`    node scripts/suno-generate-batch.mjs --track ${t.id}`)
    }
    console.log('')
  }

  // Show pick log if --pick mode
  if (options.pick && pickLog.length > 0) {
    console.log(`  ${c.bold}${c.cyan}Pick mode: Compare takes${c.reset}`)
    console.log(`  ${c.dim}Each track generated 2 takes. Listen and keep the better one.${c.reset}`)
    console.log('')
    for (const entry of pickLog) {
      console.log(`  ${c.bold}${entry.id}${c.reset} — ${entry.name}`)
      console.log(`    Suno IDs: ${entry.songIds.join(', ')}`)
      console.log(`    Files:    ${entry.files.join(', ')}`)
      console.log(`    Listen at: https://suno.com/song/${entry.songIds[0]}`)
      console.log('')
    }
  }

  // Check remaining credits
  const postCredits = await getCredits()
  if (postCredits.remaining !== null) {
    console.log(`  ${c.bold}Credits remaining:${c.reset} ${postCredits.remaining}${postCredits.total ? ` / ${postCredits.total}` : ''}`)
  }

  // Show what's still pending
  const remainingPending = getPendingTracks()
  if (remainingPending.length > 0) {
    console.log(`  ${c.bold}Still pending:${c.reset} ${remainingPending.length} tracks`)
    console.log(`  Run ${c.cyan}node scripts/suno-music-pipeline.mjs status${c.reset} for full dashboard.`)
  } else {
    console.log(`  ${c.green}${c.bold}ALL TRACKS GENERATED!${c.reset} The soundtrack is complete.`)
  }

  console.log('')

  // Exit with error code if any failures
  if (results.failed.length > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error(`\n${c.red}Unexpected error: ${err.message}${c.reset}`)
  console.error(`${c.dim}${err.stack}${c.reset}`)
  process.exit(1)
})
