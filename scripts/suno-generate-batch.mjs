#!/usr/bin/env node

/**
 * Suno Batch Music Generator - Ninja Keyboard
 *
 * Fully automated music generation using gcui-art/suno-api as a local Docker proxy.
 * Reads prompts from suno-prompts.json and the full track catalog, generates tracks
 * via the Suno API, polls for completion, downloads MP3s, and updates the manifest.
 *
 * Usage:
 *   node scripts/suno-generate-batch.mjs                          # Generate all pending
 *   node scripts/suno-generate-batch.mjs --dry-run                # Preview without API calls
 *   node scripts/suno-generate-batch.mjs --batch-size 3           # 3 parallel generations
 *   node scripts/suno-generate-batch.mjs --base-url http://localhost:8080
 *   node scripts/suno-generate-batch.mjs --output-dir ./output
 *   node scripts/suno-generate-batch.mjs --track CHAR-001         # Single track
 *   node scripts/suno-generate-batch.mjs --ids CHAR-001,CHAR-002  # Multiple specific tracks
 *   node scripts/suno-generate-batch.mjs --category battle        # All battle tracks
 *   node scripts/suno-generate-batch.mjs --limit 5                # First 5 pending
 *   node scripts/suno-generate-batch.mjs --retry-failed           # Retry previously failed
 *   node scripts/suno-generate-batch.mjs --pick                   # Log song IDs for comparison
 *
 * Prerequisites:
 *   - gcui-art/suno-api running in Docker (run `node scripts/suno-setup.mjs` first)
 *   - Suno Premier subscription with valid cookie configured in the container
 *
 * Cost: ~10 credits per generation request, each produces 2 song variations.
 * Premier subscription: 10,000 credits/month.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// ============================================================================
// Paths
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, "..")
const PROMPTS_PATH = resolve(__dirname, "suno-prompts.json")
const MANIFEST_PATH = resolve(PROJECT_ROOT, "public/audio/music/music-manifest.json")
const MUSIC_DIR = resolve(PROJECT_ROOT, "public/audio/music")
const GENERATION_LOG_PATH = resolve(__dirname, "suno-generation-log.json")

// ============================================================================
// ANSI Colors
// ============================================================================

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
}

// ============================================================================
// Full Track Catalog (duplicated from suno-music-pipeline.mjs for independence)
// ============================================================================

const FULL_CATALOG = [
  // === MENU ===
  { id: "MENU-001", name: "Home Screen Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05D4\u05DE\u05E1\u05DA \u05D4\u05E8\u05D0\u05E9\u05D9", category: "menu", priority: 1, existingFile: "main-theme.mp3", sunoPrompt: "Happy energetic chiptune ninja game theme for kids, Japanese 8-bit adventure music, upbeat melody, loopable", style: "Chiptune 8-bit", duration: "60-90s" },
  { id: "MENU-002", name: "Lessons Menu", nameHe: "\u05EA\u05E4\u05E8\u05D9\u05D8 \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD", category: "menu", priority: 2, sunoPrompt: "Calm focused lo-fi study music, soft piano, gentle synth pads, loopable ambient, 80 BPM, peaceful concentration music, Japanese inspired", style: "Lo-fi / Ambient", duration: "60-90s" },
  { id: "MENU-003", name: "Battle Menu", nameHe: "\u05EA\u05E4\u05E8\u05D9\u05D8 \u05E7\u05E8\u05D1\u05D5\u05EA", category: "menu", priority: 2, sunoPrompt: "Intense synthwave battle lobby music, pulsing bass, building tension, electronic 130 BPM, dark neon aesthetic, gaming pre-battle theme, loopable", style: "Synthwave", duration: "60-90s" },
  { id: "MENU-004", name: "Games Hub", nameHe: "\u05DE\u05E8\u05DB\u05D6 \u05D4\u05DE\u05E9\u05D7\u05E7\u05D9\u05DD", category: "menu", priority: 3, sunoPrompt: "Playful chiptune pop game hub music, bouncy melody, fun 8-bit sounds with modern electronic twist, 125 BPM, arcade energy, kids friendly, loopable", style: "Chiptune Pop", duration: "60-90s" },
  { id: "MENU-005", name: "Profile / Progress", nameHe: "\u05E4\u05E8\u05D5\u05E4\u05D9\u05DC \u05D5\u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA", category: "menu", priority: 3, sunoPrompt: "Reflective proud ambient orchestral music, soft strings with piano, gentle achievement melody, emotional warmth, 70 BPM, inspiring journey music, loopable", style: "Ambient Orchestral", duration: "60-90s" },
  { id: "MENU-006", name: "Settings", nameHe: "\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA", category: "menu", priority: 4, sunoPrompt: "Minimal neutral ambient background music, soft electronic pads, no melody, pure atmosphere, 60 BPM, very calm and unobtrusive, settings screen mood, loopable", style: "Minimal Ambient", duration: "60-90s" },

  // === GAMEPLAY ===
  { id: "PLAY-001", name: "Practice Easy", nameHe: "\u05EA\u05E8\u05D2\u05D5\u05DC \u2014 \u05E7\u05DC", category: "gameplay", priority: 1, sunoPrompt: "Calm lo-fi study music with soft chiptune textures, gentle piano over warm analog pads, mellow hip-hop beat with typing rhythm undertone, soft jazzy chords, Japanese aesthetic ambient, 80 BPM, peaceful concentration music, minimal melodic movement to avoid distraction, warm bass, focus zone for keyboard practice, kid-friendly calm, loopable, no vocals", style: "Lo-fi Hip Hop", duration: "120-180s" },
  { id: "PLAY-002", name: "Practice Medium", nameHe: "\u05EA\u05E8\u05D2\u05D5\u05DC \u2014 \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9", category: "gameplay", priority: 2, sunoPrompt: "Upbeat focus music, indie electronic, melodic synths, steady 110 BPM, energetic but not stressful, productivity flow state, no lyrics, loopable", style: "Indie Electronic", duration: "120-180s" },
  { id: "PLAY-003", name: "Practice Hard", nameHe: "\u05EA\u05E8\u05D2\u05D5\u05DC \u2014 \u05E7\u05E9\u05D4", category: "gameplay", priority: 3, sunoPrompt: "High intensity drum and bass music, fast 160 BPM, electronic synths, driving beat, focus zone music, no vocals, intense typing session energy, loopable", style: "Drum and Bass", duration: "120-180s" },
  { id: "PLAY-004", name: "Speed Test", nameHe: "\u05D0\u05D3\u05E8\u05E0\u05DC\u05D9\u05DF \u2014 \u05DE\u05D1\u05D7\u05DF \u05DE\u05D4\u05D9\u05E8\u05D5\u05EA", category: "gameplay", priority: 1, sunoPrompt: "Adrenaline rush EDM with chiptune countdown elements, building from 120 to 140 BPM, epic synthwave drop, racing heartbeat bass, competitive speed challenge anthem, ticking clock tension with 8-bit urgency, electronic builds and releases, intense but not scary for kids, pixel art meets stadium energy, typing speed test power music, loopable, no vocals", style: "EDM / Synthwave", duration: "120-180s" },
  { id: "PLAY-005", name: "Accuracy Challenge", nameHe: "\u05D0\u05EA\u05D2\u05E8 \u05D3\u05D9\u05D5\u05E7", category: "gameplay", priority: 3, sunoPrompt: "Minimal techno precision music, clean 120 BPM, mathematical beats, surgical focus, no melodic distractions, pure rhythm typing music, loopable, accuracy and focus", style: "Minimal Techno", duration: "120-180s" },

  // === BATTLE ===
  { id: "BATTLE-001", name: "Pre-Battle Anticipation", nameHe: "\u05D0\u05E0\u05D8\u05D9\u05E1\u05D9\u05E4\u05E6\u05D9\u05D4 \u05DC\u05E4\u05E0\u05D9 \u05E7\u05E8\u05D1", category: "battle", priority: 2, sunoPrompt: "Pre-battle anticipation music, orchestral tension building, 30 seconds, dramatic strings, nervous energy, video game battle intro, not full combat yet, suspenseful", style: "Orchestral Tension", duration: "30-60s" },
  { id: "BATTLE-002", name: "Shadow Cat Battle", nameHe: "Shadow Cat \u2014 \u05E7\u05E8\u05D1 \u05E7\u05DC", category: "battle", priority: 1, sunoPrompt: "Shadow ninja cat battle music, chiptune 8-bit, sneaky mysterious melody, 120 BPM, competitive but friendly, kids game battle theme, Japanese shadow aesthetic, loopable", style: "Chiptune Battle", duration: "120-180s" },
  { id: "BATTLE-003", name: "Storm Fox Battle", nameHe: "Storm Fox \u2014 \u05E7\u05E8\u05D1 \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9", category: "battle", priority: 1, sunoPrompt: "Storm fox battle music, electro rock with electric guitar riffs, powerful synths, 135 BPM, wind and thunder sounds woven in, intense competitive, loopable game battle", style: "Electro Rock", duration: "120-180s" },
  { id: "BATTLE-004", name: "Blaze Dragon Battle", nameHe: "Blaze Dragon \u2014 \u05E7\u05E8\u05D1 \u05E7\u05E9\u05D4", category: "battle", priority: 2, sunoPrompt: "Blaze dragon epic metal battle, heavy guitars, orchestral brass, fire and fury, 145 BPM, epic boss battle intensity, no holds barred, loopable high energy gaming anthem", style: "Metal / Epic", duration: "120-180s" },
  { id: "BATTLE-005", name: "Bug Boss Act 1", nameHe: "Bug \u2014 \u05DE\u05E2\u05E9\u05D4 \u05E8\u05D0\u05E9\u05D5\u05DF", category: "battle", priority: 1, existingFile: "boss-battle.mp3", sunoPrompt: "Bug monster boss act 1, glitchy electronic music, playful chaos, digital glitch sounds, mischievous 125 BPM, not too scary, whimsical evil, video game boss theme, loopable", style: "Glitchy Electronic", duration: "120-180s" },
  { id: "BATTLE-006", name: "Bug Boss Act 2", nameHe: "Bug \u2014 \u05DE\u05E2\u05E9\u05D4 \u05E9\u05E0\u05D9", category: "battle", priority: 2, sunoPrompt: "Bug boss act 2, darker electronic battle, corrupted glitch synths, 140 BPM, increasing threat, digital corruption sounds, tense and dangerous, loopable boss fight escalation", style: "Dark Electronic", duration: "120-180s" },
  { id: "BATTLE-007", name: "Bug King Final", nameHe: "Bug King \u2014 \u05DE\u05E2\u05E9\u05D4 \u05E9\u05DC\u05D9\u05E9\u05D9", category: "battle", priority: 2, sunoPrompt: "Bug King final boss epic orchestral with glitch corruption, massive choir, heavy bass drops, 150 BPM, apocalyptic video game finale, strings and glitch combined, ultimate showdown loopable", style: "Epic Orchestral + Glitch", duration: "120-180s" },
  { id: "BATTLE-008", name: "Glitch Secret Boss", nameHe: "Glitch \u2014 \u05D1\u05D5\u05E1 \u05E1\u05D5\u05D3\u05D9", category: "battle", priority: 3, sunoPrompt: "Secret glitch boss corrupted vaporwave, reality breaking sounds, reversed melodies, time-stretched vocals, unsettling 100 BPM, reality corruption, mysterious and eerie, loopable hidden boss theme", style: "Vaporwave Corrupted", duration: "120-180s" },
  { id: "BATTLE-009", name: "Boss Defeated Fanfare", nameHe: "\u05D1\u05D5\u05E1 \u05D4\u05D5\u05D1\u05E1!", category: "battle", priority: 2, sunoPrompt: "Boss defeated victory stinger, 8 seconds, triumphant brass fanfare, climactic resolution, epic orchestral sting, video game victory moment, short and powerful, celebration burst", style: "Orchestral Stinger", duration: "5-10s" },
  { id: "BATTLE-010", name: "Tournament Arena", nameHe: "\u05D6\u05D9\u05E8\u05EA \u05D8\u05D5\u05E8\u05E0\u05D9\u05E8\u05D9\u05DD", category: "battle", priority: 2, sunoPrompt: "Epic tournament arena theme with full orchestral power and chiptune accents, competitive crowd energy, brass fanfare meets electronic bass drops, stadium anthem with 8-bit gaming nostalgia, building intensity, 135 BPM, majestic and competitive, esports meets retro gaming glory, Middle Eastern percussion undertone, champion energy, loopable, no vocals", style: "Orchestral / Esports", duration: "120-180s" },

  // === EVENTS / STINGERS ===
  { id: "EVENT-001", name: "Victory Fanfare", nameHe: "\u05E0\u05D9\u05E6\u05D7\u05D5\u05DF!", category: "events", priority: 1, sunoPrompt: "Short triumphant victory fanfare, 10 seconds, bright brass section, ascending melody, proud achievement celebration, video game level complete, chiptune brass hybrid, uplifting finale", style: "Brass Fanfare", duration: "5-10s" },
  { id: "EVENT-002", name: "Level Up Jingle", nameHe: "\u05E2\u05DC\u05D9\u05EA \u05E8\u05DE\u05D4!", category: "events", priority: 1, sunoPrompt: "Level up RPG jingle, 5 seconds, ascending chiptune melody, classic video game level up sound, happy and energetic, 8-bit celebration, short burst of joy", style: "Chiptune Jingle", duration: "5s" },
  { id: "EVENT-003", name: "Character Unlock", nameHe: "\u05D3\u05DE\u05D5\u05EA \u05D7\u05D3\u05E9\u05D4 \u05E0\u05E4\u05EA\u05D7\u05D4!", category: "events", priority: 1, sunoPrompt: "Character unlock magical discovery jingle, 8 seconds, sparkle sounds, wonder and delight, arpeggio ascending, whimsical bells and synth, new friend revealed music, magical surprise", style: "Magical Jingle", duration: "8s" },
  { id: "EVENT-004", name: "Achievement Unlock", nameHe: "\u05D0\u05E6\u05F3\u05D9\u05D1\u05DE\u05E0\u05D8 \u05E0\u05E4\u05EA\u05D7!", category: "events", priority: 1, sunoPrompt: "Achievement unlocked power jingle, 6 seconds, bold power chord, gaming achievement sound, satisfying unlock, short impactful burst, proud moment music, Xbox achievement style", style: "Power Chord Jingle", duration: "6s" },
  { id: "EVENT-005", name: "Streak Milestone", nameHe: "\u05E1\u05D8\u05E8\u05D9\u05E7!", category: "events", priority: 2, sunoPrompt: "Streak milestone fire jingle, 8 seconds, rising build with fire crackling sounds, momentum and heat, ascending intensity, combo achievement music, on fire gaming moment", style: "Rising Buildup", duration: "8s" },
  { id: "EVENT-006", name: "Season Event Theme", nameHe: "\u05D0\u05D9\u05E8\u05D5\u05E2 \u05E2\u05D5\u05E0\u05D4", category: "events", priority: 4, sunoPrompt: "Festive season event music, celebratory electronic with Middle Eastern flavor, holiday special gaming theme, joyful and energetic, 125 BPM, seasonal celebration loopable", style: "Festive Electronic", duration: "60-90s" },
  { id: "EVENT-007", name: "Personal Best", nameHe: "\u05E9\u05D9\u05D0 \u05D0\u05D9\u05E9\u05D9!", category: "events", priority: 2, sunoPrompt: "Personal best record stinger, 7 seconds, epic orchestral burst, new record achieved sound, triumphant moment, sports achievement style, huge and memorable, short but massive impact", style: "Epic Stinger", duration: "7s" },
  { id: "EVENT-008", name: "Defeat / Try Again", nameHe: "\u05DB\u05D9\u05E9\u05DC\u05D5\u05DF \u2014 \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1", category: "events", priority: 2, sunoPrompt: "Playful defeat jingle, 6 seconds, descending melody, whimsical sad but hopeful, try again energy, kids game failure sound, not discouraging, bounce back vibe, chiptune wah-wah", style: "Sad Trombone Reimagined", duration: "6s" },

  // === CHARACTERS ===
  { id: "CHAR-001", name: "Ki\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05E7\u05D9 \u2014 \u05D2\u05D9\u05D1\u05D5\u05E8", category: "characters", priority: 1, sunoPrompt: "Adventurous chiptune hero theme with cinematic orchestral swell, energetic young ninja melody, Japanese shakuhachi flute meets 8-bit synth, Hebrew/Middle Eastern scale undertone, brave ascending motif, plucky and determined, bright warm chords, loopable, 120 BPM, kids game main character anthem, no vocals", style: "Adventure Chiptune + Orchestral", duration: "60-90s" },
  { id: "CHAR-002", name: "Mika\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05DE\u05D9\u05E7\u05D4 \u2014 \u05D8\u05E7 \u05D4\u05E7\u05E8\u05D9\u05EA", category: "characters", priority: 1, sunoPrompt: "Cyberpunk electronic pop with chiptune glitch accents, edgy hacker girl theme, sharp digital circuit board sounds, neon synth arpeggios, confident and smart, bitcrushed hi-hats with clean melodic lead, dark purple aesthetic, keyboard typing rhythms woven into beat, 130 BPM, loopable, no vocals", style: "Cyberpunk Pop", duration: "60-90s" },
  { id: "CHAR-003", name: "Sensei Zen\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05E1\u05E0\u05E1\u05D9\u05D9 \u05D6\u05DF \u2014 \u05D7\u05DB\u05DD", category: "characters", priority: 1, sunoPrompt: "Peaceful traditional Japanese shakuhachi flute and koto strings with subtle chiptune warmth, ancient turtle master wisdom, meditation temple bells, gentle water flowing ambient, Hebrew/Middle Eastern pentatonic scale blended with Japanese harmony, slow dignified 70 BPM, serene and wise, deep calm guidance energy, zen garden atmosphere, loopable, no vocals", style: "Traditional Japanese / Zen", duration: "60-90s" },
  { id: "CHAR-004", name: "Bug\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA Bug \u2014 \u05E7\u05D0\u05D5\u05E1", category: "characters", priority: 2, sunoPrompt: "Bug villain theme, 20 seconds, glitchy chaotic electronic, evil mischief, corrupted data sounds, menacing but cartoonish, digital bug monster leitmotif, erratic rhythm", style: "Glitch Villain", duration: "20s" },
  { id: "CHAR-005", name: "Yuki\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05D9\u05D5\u05E7\u05D9 \u2014 \u05DE\u05D4\u05D9\u05E8\u05D5\u05EA", category: "characters", priority: 1, sunoPrompt: "Ultra-fast J-pop electronic with chiptune racing pulse, wind rushing SFX, bright energetic female character speed theme, rapid arpeggios building intensity, competitive spirit, lightning-fast 160 BPM bursts alternating with 140 BPM groove, pixel art meets anime energy, triumphant speed demon melody, loopable, no vocals", style: "J-Pop / Fast Electronic", duration: "60-90s" },
  { id: "CHAR-006", name: "Luna\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA \u05DC\u05D5\u05E0\u05D4 \u2014 \u05E9\u05DC\u05D5\u05D5\u05D4", category: "characters", priority: 2, sunoPrompt: "Luna calm companion theme, 20 seconds, dreamy ambient pop, soft violin, moonlight atmosphere, gentle encouragement music, slow and comforting, nocturnal serenity", style: "Dream Pop", duration: "20s" },
  { id: "CHAR-007", name: "Rex\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA Rex \u2014 \u05DE\u05E9\u05D7\u05E7\u05D9\u05D5\u05EA", category: "characters", priority: 2, sunoPrompt: "Rex dinosaur theme, 20 seconds, cartoon rock with dinosaur roars, heavy stomp rhythm, funny and powerful, T-Rex gaming buddy, prehistoric meets arcade, fun character theme", style: "Dino Rock", duration: "20s" },
  { id: "CHAR-008", name: "Glitch\u2019s Theme", nameHe: "\u05E2\u05E8\u05DB\u05EA Glitch \u2014 \u05DB\u05D0\u05D5\u05E1 \u05D8\u05D4\u05D5\u05E8", category: "characters", priority: 2, sunoPrompt: "Corrupted vaporwave meets emotional chiptune, digital noise and bitcrushed fragments, reality-breaking glitch sounds with hidden beautiful melody underneath, time-stretched reversed notes, stuttering rhythm that resolves into warm piano phrase, unstable yet fascinating, sad and mysterious, 100 BPM wobbling, secret boss theme with emotional depth, feminine energy, loopable, no vocals", style: "Glitch / Vaporwave", duration: "60-90s" },

  // === STORY ===
  { id: "STORY-001", name: "Emotional Moment", nameHe: "\u05E1\u05D9\u05E4\u05D5\u05E8 \u2014 \u05E8\u05D2\u05E2 \u05E8\u05D2\u05E9\u05D9", category: "story", priority: 1, sunoPrompt: "Emotional cinematic piano with gentle strings, tearful beautiful melody, chiptune music box undertone adding nostalgic innocence, heartfelt moment in a kids game story, soft violin solo over warm pads, Hebrew/Middle Eastern minor scale emotional progression, slow 65 BPM, bittersweet and touching, friendship and sacrifice theme, building to gentle emotional climax then resolving softly, no vocals", style: "Cinematic Piano / Strings", duration: "90-120s" },
  { id: "STORY-002", name: "Victory/Celebration", nameHe: "\u05E1\u05D9\u05E4\u05D5\u05E8 \u2014 \u05E0\u05D9\u05E6\u05D7\u05D5\u05DF \u05D5\u05D7\u05D2\u05D9\u05D2\u05D4", category: "story", priority: 1, sunoPrompt: "Triumphant celebration theme combining full orchestra with chiptune joy, all instruments united in victorious melody, brass fanfare with 8-bit sparkle, Middle Eastern percussion celebration (darbuka, frame drum), ascending major key progression building to massive climax, 130 BPM, pure joy and accomplishment, kids game final victory anthem, heroes united moment, confetti energy, sunshine after storm, no vocals", style: "Orchestral Triumphant", duration: "90-120s" },

  // === AGE WORLDS ===
  { id: "WORLD-001", name: "Shatil - Magical Garden", nameHe: "\u05E9\u05EA\u05D9\u05DC \u2014 \u05D2\u05DF \u05E7\u05E1\u05D5\u05DD (6-8)", category: "worlds", priority: 2, sunoPrompt: "Magical garden ambient for young children, music box melody, bird chirping, gentle bells, 60 BPM, warm and safe, Duolingo kids energy, enchanted forest sounds, loopable lullaby ambient", style: "Toybox Ambient", duration: "120-180s" },
  { id: "WORLD-002", name: "Nevet - Adventure Camp", nameHe: "\u05E0\u05D1\u05D8 \u2014 \u05DE\u05D7\u05E0\u05D4 \u05D4\u05E8\u05E4\u05EA\u05E7\u05D5\u05EA (8-10)", category: "worlds", priority: 2, sunoPrompt: "Adventure camp theme, upbeat adventure pop, outdoor exploration energy, friendly and exciting, 105 BPM, Pokemon game town music inspired, summer camp vibes, loopable kids adventure", style: "Adventure Pop", duration: "120-180s" },
  { id: "WORLD-003", name: "Geza - Ninja Arena", nameHe: "\u05D2\u05D6\u05E2 \u2014 \u05D6\u05D9\u05E8\u05EA \u05E0\u05D9\u05E0\u05D2\u05F3\u05D4 (10-12)", category: "worlds", priority: 1, sunoPrompt: "Ninja arena dark synthwave, neon gaming ambient, competitive 125 BPM, Brawl Stars energy, dark neon aesthetic, electronic pulses, cool and intense, gaming lobby music, loopable", style: "Dark Synthwave", duration: "120-180s" },
  { id: "WORLD-004", name: "Anaf - Training Hub", nameHe: "\u05E2\u05E0\u05E3 \u2014 \u05DE\u05E8\u05DB\u05D6 \u05D0\u05D9\u05DE\u05D5\u05DF (12-14)", category: "worlds", priority: 3, sunoPrompt: "Mature training hub lo-fi minimal, dark ambient with subtle beats, 90 BPM, professional productivity music, teen appropriate, Discord dark theme energy, clean and understated, loopable", style: "Lo-fi Minimal", duration: "120-180s" },
  { id: "WORLD-005", name: "Tzameret - Professional", nameHe: "\u05E6\u05DE\u05E8\u05EA \u2014 \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9 (14-16+)", category: "worlds", priority: 3, sunoPrompt: "Professional minimal electronic ambient, near silence with subtle texture, developer/programmer atmosphere, 70 BPM, mature and respectful, Monkeytype dark mode energy, barely there music, loopable", style: "Minimal Electronic", duration: "120-180s" },
]

// ============================================================================
// Helpers
// ============================================================================

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false })
}

function log(icon, msg) {
  console.log("  " + c.dim + "[" + timestamp() + "]" + c.reset + " " + icon + " " + msg)
}

function logOk(msg) { log(c.green + "[OK]" + c.reset + "  ", msg) }
function logErr(msg) { log(c.red + "[ERR]" + c.reset + " ", msg) }
function logWarn(msg) { log(c.yellow + "[WARN]" + c.reset, msg) }
function logInfo(msg) { log(c.blue + "[..]" + c.reset + "  ", msg) }

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m + ":" + String(s).padStart(2, "0")
}

/** Convert a track name to a file-system-safe slug. */
function trackNameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function trackIdToFileName(id) {
  const track = FULL_CATALOG.find(t => t.id === id)
  if (!track) return null
  return trackNameToSlug(track.name) + ".mp3"
}

// ============================================================================
// Data Loading
// ============================================================================

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    return { generated_tracks: [], pending_tracks: [], not_generated: [] }
  }
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"))
}

function saveManifest(manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8")
}

/** Load detailed prompts from suno-prompts.json (curated, high-quality prompts). */
function loadDetailedPrompts() {
  if (!existsSync(PROMPTS_PATH)) return []
  return JSON.parse(readFileSync(PROMPTS_PATH, "utf-8"))
}

function loadGenerationLog() {
  if (!existsSync(GENERATION_LOG_PATH)) return { runs: [] }
  return JSON.parse(readFileSync(GENERATION_LOG_PATH, "utf-8"))
}

function saveGenerationLog(log) {
  writeFileSync(GENERATION_LOG_PATH, JSON.stringify(log, null, 2), "utf-8")
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
    sunoPrompt: detailedEntry?.sunoPrompt || catalogEntry.sunoPrompt,
  }
}

/**
 * Determine which tracks still need to be generated.
 * A track is pending if it has no existingFile and no MP3 in the manifest/filesystem.
 */
function getPendingTracks() {
  const manifest = loadManifest()

  // Build set of existing file paths
  const existingFiles = new Set()
  for (const track of manifest.generated_tracks || []) {
    for (const f of track.files || []) existingFiles.add(f)
  }
  const categories = ["characters", "gameplay", "battle", "story", "menu", "events", "worlds"]
  for (const cat of categories) {
    const catDir = resolve(MUSIC_DIR, cat)
    if (existsSync(catDir)) {
      try {
        for (const f of readdirSync(catDir).filter(f => !f.startsWith("."))) {
          existingFiles.add(cat + "/" + f)
        }
      } catch { /* ignore */ }
    }
  }

  const pending = []
  for (const track of FULL_CATALOG) {
    if (track.existingFile) continue
    const expectedFile = trackIdToFileName(track.id)
    const categoryPath = track.category + "/" + expectedFile
    if (existingFiles.has(categoryPath) || existingFiles.has(expectedFile)) continue
    const isGenerated = (manifest.generated_tracks || []).some(g =>
      g.trackId === track.id || g.name === expectedFile?.replace(".mp3", "")
    )
    if (isGenerated) continue
    pending.push(track)
  }

  // Sort: P1 first, then by ID
  pending.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.id.localeCompare(b.id))
  return pending
}

// ============================================================================
// Suno API Client (gcui-art/suno-api endpoints)
// ============================================================================

/**
 * Generic fetch wrapper with timeout and error handling.
 */
async function sunoFetch(baseUrl, path, options = {}) {
  const url = baseUrl + path
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error("HTTP " + res.status + ": " + text.slice(0, 200))
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

/** GET /api/get_limit - Check remaining credits. */
async function getCredits(baseUrl) {
  try {
    const data = await sunoFetch(baseUrl, "/api/get_limit")
    return {
      remaining: data.credits_left ?? data.total_credits_left ?? data.remaining ?? null,
      total: data.monthly_limit ?? data.total_credits ?? data.period ?? null,
    }
  } catch (err) {
    return { remaining: null, total: null, error: err.message }
  }
}

/**
 * POST /api/custom_generate - Submit a generation request.
 * Returns an array of clip/song objects (usually 2) each with an `id`.
 */
async function submitGeneration(baseUrl, prompt, tags, title) {
  const body = { prompt, tags, title, make_instrumental: true, wait_audio: false }

  const data = await sunoFetch(baseUrl, "/api/custom_generate", {
    method: "POST",
    body: JSON.stringify(body),
  })

  // gcui-art/suno-api returns an array of clip objects, or wraps in { data: [...] }
  const clips = Array.isArray(data) ? data : (data.data && Array.isArray(data.data)) ? data.data : [data]
  const ids = clips.map(s => s.id).filter(Boolean)

  if (ids.length === 0) {
    throw new Error("No clip IDs in API response: " + JSON.stringify(data).slice(0, 200))
  }

  return clips
}

/**
 * GET /api/get?ids=id1,id2 - Poll for generation completion.
 * Returns array of clip objects with status and audio_url.
 */
async function pollForCompletion(baseUrl, songIds, pollIntervalMs, pollTimeoutMs) {
  const idsParam = songIds.join(",")
  const startTime = Date.now()

  while (true) {
    const elapsed = Date.now() - startTime
    if (elapsed > pollTimeoutMs) {
      throw new Error("Timeout: songs " + idsParam + " did not complete within " + (pollTimeoutMs / 1000) + "s")
    }

    const data = await sunoFetch(baseUrl, "/api/get?ids=" + idsParam)
    const clips = Array.isArray(data) ? data : (data.data && Array.isArray(data.data)) ? data.data : [data]

    const anyFailed = clips.some(s => s.status === "error" || s.status === "failed")
    if (anyFailed) {
      throw new Error("Generation failed on Suno side for IDs: " + idsParam)
    }

    const allComplete = clips.every(s =>
      s.status === "complete" || s.status === "streaming" || s.audio_url
    )

    if (allComplete) {
      return clips
    }

    // Show progress inline
    const statuses = clips.map(s => s.status || "unknown")
    const elapsedSec = Math.round(elapsed / 1000)
    process.stdout.write("\r  " + c.dim + "[" + timestamp() + "]" + c.reset + " " + c.yellow + "..." + c.reset + " Waiting (" + elapsedSec + "s) - statuses: " + statuses.join(", ") + "    ")

    await sleep(pollIntervalMs)
  }
}

/**
 * Download a file from a URL to disk. Returns file size in bytes.
 */
async function downloadFile(url, destPath) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) throw new Error("HTTP " + res.status)

    const buffer = Buffer.from(await res.arrayBuffer())
    const dir = dirname(destPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(destPath, buffer)
    return buffer.length
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

// ============================================================================
// Manifest Update
// ============================================================================

function updateManifest(track, files, durations, songData) {
  const manifest = loadManifest()
  const nameSlug = trackNameToSlug(track.name)

  // Remove from pending_tracks and not_generated
  manifest.pending_tracks = (manifest.pending_tracks || []).filter(t => t.id !== track.id)
  manifest.not_generated = (manifest.not_generated || []).filter(t => t.name !== nameSlug)

  // Check if already in generated_tracks
  const existingGen = (manifest.generated_tracks || []).find(g => g.trackId === track.id)

  if (existingGen) {
    existingGen.files = [...new Set([...(existingGen.files || []), ...files])]
    if (durations.length > 0) {
      existingGen.durations = [...(existingGen.durations || []), ...durations.filter(d => d != null)]
    }
  } else {
    const newEntry = {
      trackId: track.id,
      name: nameSlug,
      title: track.name,
      titleHe: track.nameHe,
      description: track.style + " - " + track.nameHe,
      style: track.style,
      category: track.category,
      files,
      durations: durations.filter(d => d != null),
      sunoSongIds: songData.map(s => s.id),
      generatedAt: new Date().toISOString(),
      status: "ready",
    }
    manifest.generated_tracks = manifest.generated_tracks || []
    manifest.generated_tracks.push(newEntry)
  }

  saveManifest(manifest)
}

// ============================================================================
// Single Track Generation Pipeline
// ============================================================================

/**
 * Generate a single track: submit, poll, download, update manifest.
 * Returns a result object with success status, files, and metadata.
 * Includes retry logic with exponential backoff.
 */
async function generateTrack(track, config) {
  const prompt = getPromptForTrack(track.id)
  if (!prompt) {
    logErr(track.id + ": Track not found in catalog")
    return { success: false, error: "Track not found" }
  }

  const categoryDir = resolve(config.outputDir, track.category)
  if (!existsSync(categoryDir)) mkdirSync(categoryDir, { recursive: true })

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    if (attempt > 1) {
      const backoffMs = 5000 * attempt
      logWarn(track.id + ": Retry " + (attempt - 1) + "/" + (config.maxRetries - 1) + " (backoff " + (backoffMs / 1000) + "s)...")
      await sleep(backoffMs)
    }

    try {
      // Step 1: Submit generation
      logInfo(track.id + ": Submitting \"" + track.name + "\"...")
      logInfo(track.id + ": " + c.dim + "Tags: " + prompt.style + c.reset)

      const songs = await submitGeneration(config.baseUrl, prompt.sunoPrompt, prompt.style, prompt.name)
      const songIds = songs.map(s => s.id)

      logOk(track.id + ": Submitted. Song IDs: " + c.dim + songIds.join(", ") + c.reset)

      // Step 2: Poll for completion
      const completedSongs = await pollForCompletion(config.baseUrl, songIds, config.pollIntervalMs, config.pollTimeoutMs)
      console.log("") // newline after inline progress

      // Step 3: Download all variations
      const downloadedFiles = []
      const durations = []

      for (let i = 0; i < completedSongs.length; i++) {
        const song = completedSongs[i]
        const audioUrl = song.audio_url
        if (!audioUrl) {
          logWarn(track.id + ": Song " + song.id + " has no audio_url, skipping")
          continue
        }

        const baseFileName = trackIdToFileName(track.id)
        const fileName = i === 0 ? baseFileName : baseFileName.replace(".mp3", "-v" + (i + 1) + ".mp3")
        const destPath = resolve(categoryDir, fileName)
        const relativePath = track.category + "/" + fileName

        logInfo(track.id + ": Downloading take " + (i + 1) + "...")

        const fileSize = await downloadFile(audioUrl, destPath)
        logOk(track.id + ": Saved " + c.bold + relativePath + c.reset + " (" + formatBytes(fileSize) + ")")

        downloadedFiles.push(relativePath)
        durations.push(song.duration || null)

        // Download cover art (best-effort)
        const imageUrl = song.image_url || song.image_large_url
        if (imageUrl) {
          const coverName = fileName.replace(".mp3", "-cover.jpg")
          const coverPath = resolve(categoryDir, coverName)
          try { await downloadFile(imageUrl, coverPath) } catch { /* optional */ }
        }
      }

      // Step 4: Update manifest
      if (downloadedFiles.length > 0) {
        updateManifest(track, downloadedFiles, durations, completedSongs)
        logOk(track.id + ": Manifest updated.")
      }

      return {
        success: downloadedFiles.length > 0,
        files: downloadedFiles,
        songIds,
        creditsCost: 10,
        retryCount: attempt - 1,
      }

    } catch (err) {
      logErr(track.id + ": Attempt " + attempt + " failed - " + err.message)
      if (attempt >= config.maxRetries) {
        return { success: false, error: err.message, retryCount: attempt - 1 }
      }
    }
  }

  return { success: false, error: "Exhausted retries", retryCount: config.maxRetries }
}

// ============================================================================
// Batch Processing with Parallel Concurrency
// ============================================================================

/**
 * Process tracks with controlled parallelism.
 * Runs up to batchSize generations concurrently.
 */
async function processBatch(tracks, config) {
  const results = { success: [], failed: [], creditsUsed: 0, filesCreated: [], startTime: Date.now() }
  const queue = [...tracks]
  const active = new Map()

  while (queue.length > 0 || active.size > 0) {
    // Fill available slots
    while (queue.length > 0 && active.size < config.batchSize) {
      const track = queue.shift()

      console.log(c.dim + "  --- " + track.id + " - " + track.name + " ---" + c.reset)

      const promise = generateTrack(track, config)
        .then(result => {
          active.delete(track.id)
          if (result.success) {
            results.success.push({ ...track, ...result })
            results.creditsUsed += result.creditsCost || 0
            results.filesCreated.push(...(result.files || []))
          } else {
            results.failed.push({ ...track, error: result.error, retryCount: result.retryCount })
          }
          return result
        })
        .catch(err => {
          active.delete(track.id)
          results.failed.push({ ...track, error: err.message, retryCount: 0 })
        })

      active.set(track.id, promise)

      // Small delay between submissions to avoid rate limiting
      if (queue.length > 0 && active.size < config.batchSize) {
        await sleep(1000)
      }
    }

    // Wait for at least one to finish
    if (active.size > 0) {
      await Promise.race(active.values())
      console.log("")
    }
  }

  return results
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    baseUrl: process.env.SUNO_API_URL || "http://localhost:3000",
    batchSize: 2,
    outputDir: MUSIC_DIR,
    dryRun: false,
    trackId: null,
    ids: null,
    limit: null,
    category: null,
    pick: false,
    retryFailed: false,
    maxRetries: 3,
    pollIntervalMs: 5000,
    pollTimeoutMs: 300000,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--dry-run": case "-n":
        options.dryRun = true; break
      case "--track": case "-t":
        options.trackId = args[++i]?.toUpperCase(); break
      case "--ids":
        options.ids = args[++i].split(",").map(id => id.trim().toUpperCase()); break
      case "--limit": case "-l":
        options.limit = parseInt(args[++i], 10); break
      case "--category": case "-c":
        options.category = args[++i]?.toLowerCase(); break
      case "--pick": case "-p":
        options.pick = true; break
      case "--base-url":
        options.baseUrl = args[++i]; break
      case "--batch-size":
        options.batchSize = parseInt(args[++i], 10)
        if (isNaN(options.batchSize) || options.batchSize < 1) {
          console.error(c.red + "Error: --batch-size must be a positive integer." + c.reset)
          process.exit(1)
        }
        break
      case "--output-dir":
        options.outputDir = resolve(args[++i]); break
      case "--retry-failed":
        options.retryFailed = true; break
      case "--max-retries":
        options.maxRetries = parseInt(args[++i], 10); break
      case "--poll-interval":
        options.pollIntervalMs = parseInt(args[++i], 10) * 1000; break
      case "--poll-timeout":
        options.pollTimeoutMs = parseInt(args[++i], 10) * 1000; break
      case "--help": case "-h":
        printHelp(); process.exit(0); break
      default:
        // Allow bare track ID (e.g., `CHAR-001`)
        if (/^[A-Z]+-\d+$/i.test(args[i])) {
          options.trackId = args[i].toUpperCase()
        } else {
          console.error(c.red + "Unknown option: " + args[i] + c.reset)
          printHelp()
          process.exit(1)
        }
    }
  }

  return options
}

function printHelp() {
  console.log("")
  console.log(c.bold + c.magenta + "  SUNO BATCH GENERATOR - Ninja Keyboard" + c.reset)
  console.log(c.dim + "  =====================================================" + c.reset)
  console.log("")
  console.log(c.bold + "  Usage:" + c.reset)
  console.log("    node scripts/suno-generate-batch.mjs [options]")
  console.log("")
  console.log(c.bold + "  Track Selection:" + c.reset)
  console.log("    " + c.cyan + "--track, -t <ID>" + c.reset + "      Generate a specific track (e.g., CHAR-001)")
  console.log("    " + c.cyan + "--ids <ID1,ID2,...>" + c.reset + "   Generate multiple specific tracks")
  console.log("    " + c.cyan + "--category, -c <CAT>" + c.reset + "  Filter by category (menu, gameplay, battle, events, characters, story, worlds)")
  console.log("    " + c.cyan + "--limit, -l <N>" + c.reset + "       Generate at most N tracks")
  console.log("    " + c.cyan + "--retry-failed" + c.reset + "        Retry tracks that previously failed")
  console.log("")
  console.log(c.bold + "  Execution:" + c.reset)
  console.log("    " + c.cyan + "--dry-run, -n" + c.reset + "         Preview without making API calls")
  console.log("    " + c.cyan + "--batch-size <N>" + c.reset + "      Parallel generations (default: 2, max ~5)")
  console.log("    " + c.cyan + "--base-url <URL>" + c.reset + "      Suno API proxy URL (default: http://localhost:3000)")
  console.log("    " + c.cyan + "--output-dir <DIR>" + c.reset + "    Output directory (default: public/audio/music/)")
  console.log("    " + c.cyan + "--max-retries <N>" + c.reset + "     Max retries per track (default: 3)")
  console.log("    " + c.cyan + "--poll-interval <S>" + c.reset + "   Seconds between polls (default: 5)")
  console.log("    " + c.cyan + "--poll-timeout <S>" + c.reset + "    Max seconds per track (default: 300)")
  console.log("    " + c.cyan + "--pick, -p" + c.reset + "            Log song IDs for manual comparison")
  console.log("    " + c.cyan + "--help, -h" + c.reset + "            Show this help")
  console.log("")
  console.log(c.bold + "  Examples:" + c.reset)
  console.log("    node scripts/suno-generate-batch.mjs --dry-run")
  console.log("    node scripts/suno-generate-batch.mjs --batch-size 3")
  console.log("    node scripts/suno-generate-batch.mjs --track CHAR-001")
  console.log("    node scripts/suno-generate-batch.mjs --ids CHAR-001,CHAR-005,STORY-001")
  console.log("    node scripts/suno-generate-batch.mjs --category battle --limit 5")
  console.log("    node scripts/suno-generate-batch.mjs --retry-failed --max-retries 5")
  console.log("    node scripts/suno-generate-batch.mjs CHAR-001  # shorthand for --track")
  console.log("")
  console.log(c.bold + "  Prerequisites:" + c.reset)
  console.log("    Run " + c.cyan + "node scripts/suno-setup.mjs" + c.reset + " first to verify the API is ready.")
  console.log("")
  console.log(c.bold + "  Cost:" + c.reset)
  console.log("    ~10 credits per generation request, each produces 2 song variations.")
  console.log("    Premier subscription: 10,000 credits/month.")
  console.log("")
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const options = parseArgs()

  console.log("")
  console.log(c.bold + c.magenta + "  SUNO BATCH GENERATOR - Ninja Keyboard" + c.reset)
  console.log(c.dim + "  =====================================================" + c.reset)

  if (options.dryRun) {
    console.log("  " + c.yellow + c.bold + "DRY RUN MODE" + c.reset + " - No API calls will be made")
  }

  // ── Determine tracks to generate ─────────────────────────────────────

  let tracks

  if (options.trackId) {
    // Single track by ID
    const track = FULL_CATALOG.find(t => t.id === options.trackId)
    if (!track) {
      console.error("\n  " + c.red + "Track \"" + options.trackId + "\" not found in catalog." + c.reset)
      console.error("  Valid IDs: " + FULL_CATALOG.map(t => t.id).join(", "))
      process.exit(1)
    }
    tracks = [track]
  } else if (options.ids) {
    // Multiple specific IDs
    tracks = []
    for (const id of options.ids) {
      const track = FULL_CATALOG.find(t => t.id === id)
      if (!track) {
        logWarn("Track ID \"" + id + "\" not found in catalog, skipping.")
      } else {
        tracks.push(track)
      }
    }
  } else {
    // All pending tracks
    tracks = getPendingTracks()

    if (options.category) {
      tracks = tracks.filter(t => t.category === options.category)
    }

    if (options.limit && options.limit > 0) {
      tracks = tracks.slice(0, options.limit)
    }
  }

  if (tracks.length === 0) {
    console.log("")
    logOk("Nothing to generate! All tracks are done or no matching tracks found.")
    console.log("  Run " + c.bold + "node scripts/suno-music-pipeline.mjs status" + c.reset + " to see the dashboard.")
    console.log("")
    return
  }

  // ── Preview plan ─────────────────────────────────────────────────────

  const creditsPerTrack = 10
  const estimatedCredits = tracks.length * creditsPerTrack

  console.log("")
  console.log("  " + c.bold + "Generation Plan:" + c.reset)
  console.log(c.dim + "  -----------------------------------------------------" + c.reset)
  console.log("  API:           " + c.cyan + options.baseUrl + c.reset)
  console.log("  Batch size:    " + c.bold + options.batchSize + c.reset + " concurrent")
  console.log("  Output:        " + c.dim + options.outputDir + c.reset)
  console.log("  Poll interval: " + (options.pollIntervalMs / 1000) + "s")
  console.log("  Poll timeout:  " + (options.pollTimeoutMs / 1000) + "s per track")
  console.log("  Max retries:   " + options.maxRetries)
  console.log("  Tracks:        " + c.bold + tracks.length + c.reset)
  console.log("  Est. credits:  " + c.bold + "~" + estimatedCredits + c.reset + " (" + creditsPerTrack + "/track)")
  console.log("  Est. time:     " + c.bold + Math.ceil(tracks.length * 1.5) + "-" + Math.ceil(tracks.length * 3) + " minutes" + c.reset)
  console.log("")

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i]
    const priorityColor = t.priority === 1 ? c.red : t.priority === 2 ? c.yellow : c.cyan
    console.log("  " + c.dim + String(i + 1).padStart(2) + "." + c.reset + " " + c.cyan + t.id.padEnd(12) + c.reset + " " + t.name + " " + c.dim + "(" + t.nameHe + ")" + c.reset + " " + priorityColor + "P" + t.priority + c.reset + " " + c.dim + "[" + t.category + "]" + c.reset)
  }
  console.log("")

  // ── Dry run exit ─────────────────────────────────────────────────────

  if (options.dryRun) {
    console.log("  " + c.yellow + "DRY RUN complete." + c.reset + " Remove --dry-run to start generating.")
    console.log("")

    // Show prompt details
    console.log("  " + c.bold + "Prompt details:" + c.reset)
    console.log("")
    for (const t of tracks) {
      const prompt = getPromptForTrack(t.id)
      console.log("  " + c.cyan + t.id + c.reset + " " + c.bold + t.name + c.reset)
      console.log("  " + c.dim + "Prompt: " + (prompt?.sunoPrompt || "N/A").slice(0, 120) + "..." + c.reset)
      console.log("  " + c.dim + "Style:  " + (prompt?.style || "N/A") + c.reset)
      console.log("")
    }

    // Quick API check
    const credits = await getCredits(options.baseUrl)
    if (credits.remaining !== null) {
      console.log("  " + c.green + "API reachable." + c.reset + " Credits: " + c.bold + credits.remaining + c.reset + (credits.total ? " / " + credits.total : ""))
    } else {
      console.log("  " + c.yellow + "API not reachable at " + options.baseUrl + c.reset)
      console.log("  " + c.dim + "Run: node scripts/suno-setup.mjs" + c.reset)
    }
    console.log("")
    return
  }

  // ── Pre-flight: check API and credits ────────────────────────────────

  logInfo("Checking Suno API connectivity...")
  const credits = await getCredits(options.baseUrl)

  if (credits.error) {
    logErr("Cannot reach Suno API: " + credits.error)
    console.log("  Run " + c.bold + "node scripts/suno-setup.mjs" + c.reset + " to diagnose.")
    console.log("")
    process.exit(1)
  }

  if (credits.remaining !== null) {
    logOk("API connected. Credits: " + c.bold + credits.remaining + c.reset + (credits.total ? " / " + credits.total : ""))

    if (credits.remaining < estimatedCredits) {
      logWarn("Need ~" + estimatedCredits + " credits but only " + credits.remaining + " available.")
      const maxTracks = Math.floor(credits.remaining / creditsPerTrack)
      if (maxTracks === 0) {
        logErr("Not enough credits for even one track. Wait for monthly reset.")
        process.exit(1)
      }
      logWarn("Will generate at most " + maxTracks + " tracks before running out.")
      tracks = tracks.slice(0, maxTracks)
    }
  } else {
    logWarn("Could not read credit count. Proceeding anyway...")
  }

  // ── Generate ─────────────────────────────────────────────────────────

  console.log("")
  console.log(c.dim + "  =====================================================" + c.reset)
  console.log("  " + c.bold + "Starting generation of " + tracks.length + " tracks (batch size: " + options.batchSize + ")..." + c.reset)
  console.log(c.dim + "  =====================================================" + c.reset)
  console.log("")

  const config = {
    baseUrl: options.baseUrl,
    outputDir: options.outputDir,
    batchSize: options.batchSize,
    maxRetries: options.maxRetries,
    pollIntervalMs: options.pollIntervalMs,
    pollTimeoutMs: options.pollTimeoutMs,
  }

  const results = await processBatch(tracks, config)

  const totalTime = Math.round((Date.now() - results.startTime) / 1000)

  // ── Summary ──────────────────────────────────────────────────────────

  console.log(c.dim + "  =====================================================" + c.reset)
  console.log("")
  console.log("  " + c.bold + c.magenta + "GENERATION SUMMARY" + c.reset)
  console.log("")
  console.log("  Total time:   " + c.bold + formatDuration(totalTime) + c.reset)
  console.log("  " + c.green + "Succeeded:" + c.reset + "     " + c.bold + results.success.length + c.reset + " tracks")
  console.log("  " + c.red + "Failed:" + c.reset + "        " + c.bold + results.failed.length + c.reset + " tracks")
  console.log("  " + c.cyan + "Credits used:" + c.reset + "  ~" + results.creditsUsed)
  console.log("  " + c.blue + "Files created:" + c.reset + " " + results.filesCreated.length)
  console.log("")

  // Successful tracks
  if (results.success.length > 0) {
    console.log("  " + c.bold + c.green + "Generated tracks:" + c.reset)
    for (const t of results.success) {
      console.log("    " + c.green + "+" + c.reset + " " + t.id + " - " + t.name + (t.retryCount > 0 ? " " + c.dim + "(retries: " + t.retryCount + ")" + c.reset : ""))
      for (const f of t.files || []) {
        console.log("      " + c.dim + f + c.reset)
      }
    }
    console.log("")
  }

  // Failed tracks
  if (results.failed.length > 0) {
    console.log("  " + c.bold + c.red + "Failed tracks:" + c.reset)
    for (const t of results.failed) {
      console.log("    " + c.red + "x" + c.reset + " " + t.id + " - " + t.name + ": " + c.dim + t.error + c.reset)
    }
    console.log("")
    console.log("  " + c.yellow + "To retry failed tracks:" + c.reset)
    const failedIds = results.failed.map(t => t.id).join(",")
    console.log("    node scripts/suno-generate-batch.mjs --ids " + failedIds)
    console.log("")
  }

  // Pick mode: show song IDs for comparison
  if (options.pick && results.success.length > 0) {
    console.log("  " + c.bold + c.cyan + "Pick mode: Compare takes" + c.reset)
    console.log("  " + c.dim + "Each track generated 2 takes. Listen and keep the better one." + c.reset)
    console.log("")
    for (const entry of results.success) {
      if (entry.songIds) {
        console.log("  " + c.bold + entry.id + c.reset + " - " + entry.name)
        console.log("    Song IDs: " + entry.songIds.join(", "))
        console.log("    Files:    " + (entry.files || []).join(", "))
        console.log("    Listen:   https://suno.com/song/" + entry.songIds[0])
        console.log("")
      }
    }
  }

  // Post-generation credit check
  const postCredits = await getCredits(options.baseUrl)
  if (postCredits.remaining !== null) {
    console.log("  " + c.bold + "Credits remaining:" + c.reset + " " + postCredits.remaining + (postCredits.total ? " / " + postCredits.total : ""))
  }

  // Save generation log
  const genLog = loadGenerationLog()
  genLog.runs.push({
    timestamp: new Date().toISOString(),
    durationSec: totalTime,
    baseUrl: options.baseUrl,
    batchSize: options.batchSize,
    tracksRequested: tracks.length,
    succeeded: results.success.length,
    failed: results.failed.length,
    creditsUsed: results.creditsUsed,
    results: [
      ...results.success.map(r => ({ trackId: r.id, status: "success", files: r.files || [], retryCount: r.retryCount || 0 })),
      ...results.failed.map(r => ({ trackId: r.id, status: "failed", error: r.error, retryCount: r.retryCount || 0 })),
    ],
  })
  saveGenerationLog(genLog)

  // Show remaining work
  const remainingPending = getPendingTracks()
  if (remainingPending.length > 0) {
    console.log("  " + c.bold + "Still pending:" + c.reset + " " + remainingPending.length + " tracks")
    console.log("  Run " + c.cyan + "node scripts/suno-music-pipeline.mjs status" + c.reset + " for full dashboard.")
  } else {
    console.log("  " + c.green + c.bold + "ALL TRACKS GENERATED!" + c.reset + " The soundtrack is complete.")
  }

  console.log("")

  if (results.failed.length > 0) process.exit(1)
}

main().catch(err => {
  console.error("\n" + c.red + "Unexpected error: " + err.message + c.reset)
  console.error(c.dim + err.stack + c.reset)
  process.exit(1)
})
