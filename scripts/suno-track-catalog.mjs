#!/usr/bin/env node

/**
 * Suno Track Catalog - Single Source of Truth
 *
 * Shared catalog module for all Suno music automation scripts.
 * Contains the full 56-track catalog, helper functions, and quality gate constants.
 *
 * Used by:
 *   - suno-generate-batch.mjs (batch generation)
 *   - suno-music-pipeline.mjs (pipeline management)
 *
 * Self-test: node scripts/suno-track-catalog.mjs
 */

import { readFileSync, existsSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, "..")
const PROMPTS_PATH = resolve(__dirname, "suno-prompts.json")
const MANIFEST_PATH = resolve(PROJECT_ROOT, "public/audio/music/music-manifest.json")
const MUSIC_DIR = resolve(PROJECT_ROOT, "public/audio/music")

// ============================================================================
// Full Track Catalog (56 tracks)
// ============================================================================

export const FULL_CATALOG = [
  // === MENU (6 tracks) ===
  { id: "MENU-001", name: "Home Screen Theme", nameHe: "ערכת המסך הראשי", category: "menu", priority: 1, existingFile: "main-theme.mp3", sunoPrompt: "Happy energetic chiptune ninja game theme for kids, Japanese 8-bit adventure music, upbeat melody, loopable", style: "Chiptune 8-bit", duration: "60-90s" },
  { id: "MENU-002", name: "Lessons Menu", nameHe: "תפריט השיעורים", category: "menu", priority: 2, sunoPrompt: "Calm focused lo-fi study music, soft piano, gentle synth pads, loopable ambient, 80 BPM, peaceful concentration music, Japanese inspired", style: "Lo-fi / Ambient", duration: "60-90s" },
  { id: "MENU-003", name: "Battle Menu", nameHe: "תפריט קרבות", category: "menu", priority: 2, sunoPrompt: "Intense synthwave battle lobby music, pulsing bass, building tension, electronic 130 BPM, dark neon aesthetic, gaming pre-battle theme, loopable", style: "Synthwave", duration: "60-90s" },
  { id: "MENU-004", name: "Games Hub", nameHe: "מרכז המשחקים", category: "menu", priority: 3, sunoPrompt: "Playful chiptune pop game hub music, bouncy melody, fun 8-bit sounds with modern electronic twist, 125 BPM, arcade energy, kids friendly, loopable", style: "Chiptune Pop", duration: "60-90s" },
  { id: "MENU-005", name: "Profile / Progress", nameHe: "פרופיל והתקדמות", category: "menu", priority: 3, sunoPrompt: "Reflective proud ambient orchestral music, soft strings with piano, gentle achievement melody, emotional warmth, 70 BPM, inspiring journey music, loopable", style: "Ambient Orchestral", duration: "60-90s" },
  { id: "MENU-006", name: "Settings", nameHe: "הגדרות", category: "menu", priority: 4, sunoPrompt: "Minimal neutral ambient background music, soft electronic pads, no melody, pure atmosphere, 60 BPM, very calm and unobtrusive, settings screen mood, loopable", style: "Minimal Ambient", duration: "60-90s" },

  // === GAMEPLAY (5 tracks) ===
  { id: "PLAY-001", name: "Practice Easy", nameHe: "תרגול — קל", category: "gameplay", priority: 1, sunoPrompt: "Calm lo-fi study music with soft chiptune textures, gentle piano over warm analog pads, mellow hip-hop beat with typing rhythm undertone, soft jazzy chords, Japanese aesthetic ambient, 80 BPM, peaceful concentration music, minimal melodic movement to avoid distraction, warm bass, focus zone for keyboard practice, kid-friendly calm, loopable, no vocals", style: "Lo-fi Hip Hop", duration: "120-180s" },
  { id: "PLAY-002", name: "Practice Medium", nameHe: "תרגול — בינוני", category: "gameplay", priority: 2, sunoPrompt: "Upbeat focus music, indie electronic, melodic synths, steady 110 BPM, energetic but not stressful, productivity flow state, no lyrics, loopable", style: "Indie Electronic", duration: "120-180s" },
  { id: "PLAY-003", name: "Practice Hard", nameHe: "תרגול — קשה", category: "gameplay", priority: 3, sunoPrompt: "High intensity drum and bass music, fast 160 BPM, electronic synths, driving beat, focus zone music, no vocals, intense typing session energy, loopable", style: "Drum and Bass", duration: "120-180s" },
  { id: "PLAY-004", name: "Speed Test", nameHe: "אדרנלין — מבחן מהירות", category: "gameplay", priority: 1, sunoPrompt: "Adrenaline rush EDM with chiptune countdown elements, building from 120 to 140 BPM, epic synthwave drop, racing heartbeat bass, competitive speed challenge anthem, ticking clock tension with 8-bit urgency, electronic builds and releases, intense but not scary for kids, pixel art meets stadium energy, typing speed test power music, loopable, no vocals", style: "EDM / Synthwave", duration: "120-180s" },
  { id: "PLAY-005", name: "Accuracy Challenge", nameHe: "אתגר דיוק", category: "gameplay", priority: 3, sunoPrompt: "Minimal techno precision music, clean 120 BPM, mathematical beats, surgical focus, no melodic distractions, pure rhythm typing music, loopable, accuracy and focus", style: "Minimal Techno", duration: "120-180s" },

  // === BATTLE (10 tracks) ===
  { id: "BATTLE-001", name: "Pre-Battle Anticipation", nameHe: "אנטיסיפציה לפני קרב", category: "battle", priority: 2, sunoPrompt: "Pre-battle anticipation music, orchestral tension building, 30 seconds, dramatic strings, nervous energy, video game battle intro, not full combat yet, suspenseful", style: "Orchestral Tension", duration: "30-60s" },
  { id: "BATTLE-002", name: "Shadow Cat Battle", nameHe: "Shadow Cat — קרב קל", category: "battle", priority: 1, sunoPrompt: "Shadow ninja cat battle music, chiptune 8-bit, sneaky mysterious melody, 120 BPM, competitive but friendly, kids game battle theme, Japanese shadow aesthetic, loopable", style: "Chiptune Battle", duration: "120-180s" },
  { id: "BATTLE-003", name: "Storm Fox Battle", nameHe: "Storm Fox — קרב בינוני", category: "battle", priority: 1, sunoPrompt: "Storm fox battle music, electro rock with electric guitar riffs, powerful synths, 135 BPM, wind and thunder sounds woven in, intense competitive, loopable game battle", style: "Electro Rock", duration: "120-180s" },
  { id: "BATTLE-004", name: "Blaze Dragon Battle", nameHe: "Blaze Dragon — קרב קשה", category: "battle", priority: 2, sunoPrompt: "Blaze dragon epic metal battle, heavy guitars, orchestral brass, fire and fury, 145 BPM, epic boss battle intensity, no holds barred, loopable high energy gaming anthem", style: "Metal / Epic", duration: "120-180s" },
  { id: "BATTLE-005", name: "Bug Boss Act 1", nameHe: "Bug — מעשה ראשון", category: "battle", priority: 1, existingFile: "boss-battle.mp3", sunoPrompt: "Bug monster boss act 1, glitchy electronic music, playful chaos, digital glitch sounds, mischievous 125 BPM, not too scary, whimsical evil, video game boss theme, loopable", style: "Glitchy Electronic", duration: "120-180s" },
  { id: "BATTLE-006", name: "Bug Boss Act 2", nameHe: "Bug — מעשה שני", category: "battle", priority: 2, sunoPrompt: "Bug boss act 2, darker electronic battle, corrupted glitch synths, 140 BPM, increasing threat, digital corruption sounds, tense and dangerous, loopable boss fight escalation", style: "Dark Electronic", duration: "120-180s" },
  { id: "BATTLE-007", name: "Bug King Final", nameHe: "Bug King — מעשה שלישי", category: "battle", priority: 2, sunoPrompt: "Bug King final boss epic orchestral with glitch corruption, massive choir, heavy bass drops, 150 BPM, apocalyptic video game finale, strings and glitch combined, ultimate showdown loopable", style: "Epic Orchestral + Glitch", duration: "120-180s" },
  { id: "BATTLE-008", name: "Glitch Secret Boss", nameHe: "Glitch — בוס סודי", category: "battle", priority: 3, sunoPrompt: "Secret glitch boss corrupted vaporwave, reality breaking sounds, reversed melodies, time-stretched vocals, unsettling 100 BPM, reality corruption, mysterious and eerie, loopable hidden boss theme", style: "Vaporwave Corrupted", duration: "120-180s" },
  { id: "BATTLE-009", name: "Boss Defeated Fanfare", nameHe: "בוס הובס!", category: "battle", priority: 2, sunoPrompt: "Boss defeated victory stinger, 8 seconds, triumphant brass fanfare, climactic resolution, epic orchestral sting, video game victory moment, short and powerful, celebration burst", style: "Orchestral Stinger", duration: "5-10s" },
  { id: "BATTLE-010", name: "Tournament Arena", nameHe: "זירת טורנירים", category: "battle", priority: 2, sunoPrompt: "Epic tournament arena theme with full orchestral power and chiptune accents, competitive crowd energy, brass fanfare meets electronic bass drops, stadium anthem with 8-bit gaming nostalgia, building intensity, 135 BPM, majestic and competitive, esports meets retro gaming glory, Middle Eastern percussion undertone, champion energy, loopable, no vocals", style: "Orchestral / Esports", duration: "120-180s" },

  // === EVENTS / STINGERS (8 tracks) ===
  { id: "EVENT-001", name: "Victory Fanfare", nameHe: "ניצחון!", category: "events", priority: 1, sunoPrompt: "Short triumphant victory fanfare, 10 seconds, bright brass section, ascending melody, proud achievement celebration, video game level complete, chiptune brass hybrid, uplifting finale", style: "Brass Fanfare", duration: "5-10s" },
  { id: "EVENT-002", name: "Level Up Jingle", nameHe: "עלית רמה!", category: "events", priority: 1, sunoPrompt: "Level up RPG celebration jingle, ascending chiptune arpeggio, classic video game level up, 8-bit celebration with sparkling notes, triumphant short burst of joy, no vocals", style: "Chiptune Jingle", duration: "10-15s" },
  { id: "EVENT-003", name: "Character Unlock", nameHe: "דמות חדשה נפתחה!", category: "events", priority: 1, sunoPrompt: "Character unlock magical discovery jingle, 8 seconds, sparkle sounds, wonder and delight, arpeggio ascending, whimsical bells and synth, new friend revealed music, magical surprise", style: "Magical Jingle", duration: "8s" },
  { id: "EVENT-004", name: "Achievement Unlock", nameHe: "אצ'יבמנט נפתח!", category: "events", priority: 1, sunoPrompt: "Achievement unlocked power jingle, 6 seconds, bold power chord, gaming achievement sound, satisfying unlock, short impactful burst, proud moment music, Xbox achievement style", style: "Power Chord Jingle", duration: "6s" },
  { id: "EVENT-005", name: "Streak Milestone", nameHe: "סטריק!", category: "events", priority: 2, sunoPrompt: "Streak milestone fire jingle, 8 seconds, rising build with fire crackling sounds, momentum and heat, ascending intensity, combo achievement music, on fire gaming moment", style: "Rising Buildup", duration: "8s" },
  { id: "EVENT-006", name: "Season Event Theme", nameHe: "אירוע עונה", category: "events", priority: 4, sunoPrompt: "Festive season event music, celebratory electronic with Middle Eastern flavor, holiday special gaming theme, joyful and energetic, 125 BPM, seasonal celebration loopable", style: "Festive Electronic", duration: "60-90s" },
  { id: "EVENT-007", name: "Personal Best", nameHe: "שיא אישי!", category: "events", priority: 2, sunoPrompt: "Personal best record stinger, 7 seconds, epic orchestral burst, new record achieved sound, triumphant moment, sports achievement style, huge and memorable, short but massive impact", style: "Epic Stinger", duration: "7s" },
  { id: "EVENT-008", name: "Defeat / Try Again", nameHe: "כישלון — נסה שוב", category: "events", priority: 2, sunoPrompt: "Playful defeat jingle, 6 seconds, descending melody, whimsical sad but hopeful, try again energy, kids game failure sound, not discouraging, bounce back vibe, chiptune wah-wah", style: "Sad Trombone Reimagined", duration: "6s" },

  // === CHARACTERS (8 tracks) ===
  { id: "CHAR-001", name: "Ki\u2019s Theme", nameHe: "ערכת קי — גיבור", category: "characters", priority: 1, sunoPrompt: "Adventurous chiptune hero theme with cinematic orchestral swell, energetic young ninja melody, Japanese shakuhachi flute meets 8-bit synth, Hebrew/Middle Eastern scale undertone, brave ascending motif, plucky and determined, bright warm chords, loopable, 120 BPM, kids game main character anthem, no vocals", style: "Adventure Chiptune + Orchestral", duration: "60-90s" },
  { id: "CHAR-002", name: "Mika\u2019s Theme", nameHe: "ערכת מיקה — טק הקרית", category: "characters", priority: 1, sunoPrompt: "Cyberpunk electronic pop with chiptune glitch accents, edgy hacker girl theme, sharp digital circuit board sounds, neon synth arpeggios, confident and smart, bitcrushed hi-hats with clean melodic lead, dark purple aesthetic, keyboard typing rhythms woven into beat, 130 BPM, loopable, no vocals", style: "Cyberpunk Pop", duration: "60-90s" },
  { id: "CHAR-003", name: "Sensei Zen\u2019s Theme", nameHe: "ערכת סנסיי זן — חכם", category: "characters", priority: 1, sunoPrompt: "Peaceful traditional Japanese shakuhachi flute and koto strings with subtle chiptune warmth, ancient turtle master wisdom, meditation temple bells, gentle water flowing ambient, Hebrew/Middle Eastern pentatonic scale blended with Japanese harmony, slow dignified 70 BPM, serene and wise, deep calm guidance energy, zen garden atmosphere, loopable, no vocals", style: "Traditional Japanese / Zen", duration: "60-90s" },
  { id: "CHAR-004", name: "Bug\u2019s Theme", nameHe: "ערכת Bug — קאוס", category: "characters", priority: 2, sunoPrompt: "Bug villain theme, 20 seconds, glitchy chaotic electronic, evil mischief, corrupted data sounds, menacing but cartoonish, digital bug monster leitmotif, erratic rhythm", style: "Glitch Villain", duration: "20s" },
  { id: "CHAR-005", name: "Yuki\u2019s Theme", nameHe: "ערכת יוקי — מהירות", category: "characters", priority: 1, sunoPrompt: "Ultra-fast J-pop electronic with chiptune racing pulse, wind rushing SFX, bright energetic female character speed theme, rapid arpeggios building intensity, competitive spirit, lightning-fast 160 BPM bursts alternating with 140 BPM groove, pixel art meets anime energy, triumphant speed demon melody, loopable, no vocals", style: "J-Pop / Fast Electronic", duration: "60-90s" },
  { id: "CHAR-006", name: "Luna\u2019s Theme", nameHe: "ערכת לונה — שלווה", category: "characters", priority: 2, sunoPrompt: "Luna calm companion theme, 20 seconds, dreamy ambient pop, soft violin, moonlight atmosphere, gentle encouragement music, slow and comforting, nocturnal serenity", style: "Dream Pop", duration: "20s" },
  { id: "CHAR-007", name: "Rex\u2019s Theme", nameHe: "ערכת Rex — משחקיות", category: "characters", priority: 2, sunoPrompt: "Rex dinosaur theme, 20 seconds, cartoon rock with dinosaur roars, heavy stomp rhythm, funny and powerful, T-Rex gaming buddy, prehistoric meets arcade, fun character theme", style: "Dino Rock", duration: "20s" },
  { id: "CHAR-008", name: "Glitch\u2019s Theme", nameHe: "ערכת Glitch — כאוס טהור", category: "characters", priority: 2, sunoPrompt: "Corrupted vaporwave meets emotional chiptune, digital noise and bitcrushed fragments, reality-breaking glitch sounds with hidden beautiful melody underneath, time-stretched reversed notes, stuttering rhythm that resolves into warm piano phrase, unstable yet fascinating, sad and mysterious, 100 BPM wobbling, secret boss theme with emotional depth, feminine energy, loopable, no vocals", style: "Glitch / Vaporwave", duration: "60-90s" },

  // === STORY (2 tracks) ===
  { id: "STORY-001", name: "Emotional Moment", nameHe: "סיפור — רגע רגשי", category: "story", priority: 1, sunoPrompt: "Emotional cinematic piano with gentle strings, tearful beautiful melody, chiptune music box undertone adding nostalgic innocence, heartfelt moment in a kids game story, soft violin solo over warm pads, Hebrew/Middle Eastern minor scale emotional progression, slow 65 BPM, bittersweet and touching, friendship and sacrifice theme, building to gentle emotional climax then resolving softly, no vocals", style: "Cinematic Piano / Strings", duration: "90-120s" },
  { id: "STORY-002", name: "Victory/Celebration", nameHe: "סיפור — ניצחון וחגיגה", category: "story", priority: 1, sunoPrompt: "Triumphant celebration theme combining full orchestra with chiptune joy, all instruments united in victorious melody, brass fanfare with 8-bit sparkle, Middle Eastern percussion celebration (darbuka, frame drum), ascending major key progression building to massive climax, 130 BPM, pure joy and accomplishment, kids game final victory anthem, heroes united moment, confetti energy, sunshine after storm, no vocals", style: "Orchestral Triumphant", duration: "90-120s" },

  // === AGE WORLDS (5 tracks) ===
  { id: "WORLD-001", name: "Shatil - Magical Garden", nameHe: "שתיל — גן קסום (6-8)", category: "worlds", priority: 2, sunoPrompt: "Magical garden ambient for young children, music box melody, bird chirping, gentle bells, 60 BPM, warm and safe, Duolingo kids energy, enchanted forest sounds, loopable lullaby ambient", style: "Toybox Ambient", duration: "120-180s" },
  { id: "WORLD-002", name: "Nevet - Adventure Camp", nameHe: "נבט — מחנה הרפתקות (8-10)", category: "worlds", priority: 2, sunoPrompt: "Adventure camp theme, upbeat adventure pop, outdoor exploration energy, friendly and exciting, 105 BPM, Pokemon game town music inspired, summer camp vibes, loopable kids adventure", style: "Adventure Pop", duration: "120-180s" },
  { id: "WORLD-003", name: "Geza - Ninja Arena", nameHe: "גזע — זירת נינג'ה (10-12)", category: "worlds", priority: 1, sunoPrompt: "Ninja arena dark synthwave, neon gaming ambient, competitive 125 BPM, Brawl Stars energy, dark neon aesthetic, electronic pulses, cool and intense, gaming lobby music, loopable", style: "Dark Synthwave", duration: "120-180s" },
  { id: "WORLD-004", name: "Anaf - Training Hub", nameHe: "ענף — מרכז אימון (12-14)", category: "worlds", priority: 3, sunoPrompt: "Mature training hub lo-fi minimal, dark ambient with subtle beats, 90 BPM, professional productivity music, teen appropriate, Discord dark theme energy, clean and understated, loopable", style: "Lo-fi Minimal", duration: "120-180s" },
  { id: "WORLD-005", name: "Tzameret - Professional", nameHe: "צמרת — מקצועי (14-16+)", category: "worlds", priority: 3, sunoPrompt: "Professional minimal electronic ambient, near silence with subtle texture, developer/programmer atmosphere, 70 BPM, mature and respectful, Monkeytype dark mode energy, barely there music, loopable", style: "Minimal Electronic", duration: "120-180s" },

  // === HOLIDAYS (12 tracks) ===
  { id: "HOL-001", name: "Hanukkah Theme", nameHe: "חנוכה — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Festive Hanukkah dreidel melody with klezmer clarinet and chiptune warmth, candle-lighting glow, celebratory 120 BPM, Middle Eastern scale, joyful Jewish holiday kids game theme, loopable, no vocals", style: "Klezmer Chiptune", duration: "60-90s" },
  { id: "HOL-002", name: "Purim Theme", nameHe: "פורים — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Wild Purim carnival party music, grogger rattle sounds, klezmer meets EDM, chaotic joyful celebration, 140 BPM, costume party energy, Middle Eastern percussion, kids game festive, loopable, no vocals", style: "Klezmer EDM", duration: "60-90s" },
  { id: "HOL-003", name: "Pesach Theme", nameHe: "פסח — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Pesach liberation theme with Four Questions melody echo, dramatic hopeful orchestral, Middle Eastern strings and flute, 100 BPM, Exodus journey from slavery to freedom, cinematic chiptune hybrid, kids game Passover music, loopable, no vocals", style: "Cinematic Middle Eastern", duration: "60-90s" },
  { id: "HOL-004", name: "Yom Ha'atzmaut Theme", nameHe: "יום העצמאות — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Triumphant Israeli independence anthem, Israeli pop-rock with chiptune accents, flag-waving patriotic energy, 130 BPM, modern Hebrew pop meets 8-bit, celebration of statehood, bright and proud, kids game national day theme, loopable, no vocals", style: "Israeli Pop-Rock Chiptune", duration: "60-90s" },
  { id: "HOL-005", name: "Rosh Hashana Theme", nameHe: "ראש השנה — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Majestic Rosh Hashana new year theme, shofar horn call opening, orchestral with Middle Eastern oud and kanun, 90 BPM, solemn yet hopeful, honey sweetness warmth, Jewish new year reflection and renewal, cinematic grandeur, kids game holiday music, loopable, no vocals", style: "Orchestral Middle Eastern", duration: "60-90s" },
  { id: "HOL-006", name: "Sukkot Theme", nameHe: "סוכות — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Joyful Sukkot harvest festival theme, folk acoustic guitar with chiptune warmth, nature sounds and rustling leaves, 110 BPM, outdoor celebration under the stars, lulav and etrog dance energy, Mediterranean folk meets pixel art, kids game autumn festival, loopable, no vocals", style: "Folk Acoustic Chiptune", duration: "60-90s" },
  { id: "HOL-007", name: "Shavuot Theme", nameHe: "שבועות — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Pastoral Shavuot theme, gentle orchestral with ambient textures, Torah giving majesty building to soft climax, 85 BPM, dairy farm serenity meets Mount Sinai grandeur, soft strings and flute pastoral melody, dawn light warmth, kids game spring harvest, loopable, no vocals", style: "Pastoral Orchestral Ambient", duration: "60-90s" },
  { id: "HOL-008", name: "Lag Ba'Omer Theme", nameHe: "ל\"ג בעומר — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Energetic Lag Ba'Omer bonfire theme, crackling fire SFX woven into electronic folk beat, outdoor adventure energy, 125 BPM, bow and arrow heroic motif, nighttime campfire celebration, Israeli folk dance meets chiptune, kids game bonfire night, loopable, no vocals", style: "Electronic Folk", duration: "60-90s" },
  { id: "HOL-009", name: "Tu Bishvat Theme", nameHe: "ט\"ו בשבט — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Gentle Tu Bishvat nature theme, ambient organic sounds with soft chiptune textures, trees growing metaphor in ascending arpeggios, 75 BPM, bird song and wind, planting seeds of hope, earthy warm tones, peaceful environmental awareness, kids game tree holiday, loopable, no vocals", style: "Ambient Organic", duration: "60-90s" },
  { id: "HOL-010", name: "Yom Hazikaron Theme", nameHe: "יום הזיכרון — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Solemn Yom Hazikaron memorial theme, reverent slow orchestral with solo trumpet carrying a mournful melody, 60 BPM, dignified remembrance for fallen soldiers, gentle strings underneath, somber but not frightening for children, respectful patriotic grief, soft piano chords, age-appropriate memorial music, loopable, no vocals", style: "Slow Orchestral Memorial", duration: "60-90s" },
  { id: "HOL-011", name: "Yom Hashoah Theme", nameHe: "יום השואה — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Deeply solemn Yom Hashoah Holocaust memorial, minimal piano with soft strings, 50 BPM, sorrowful yet dignified, single candle flame warmth in darkness, gentle minor key melody carrying weight of memory, respectful and age-appropriate for children, quiet contemplation, hope persisting through sorrow, loopable, no vocals", style: "Minimal Piano Strings", duration: "60-90s" },
  { id: "HOL-012", name: "Simchat Torah Theme", nameHe: "שמחת תורה — ערכת חג", category: "holidays", priority: 3, sunoPrompt: "Joyful Simchat Torah hakafot dancing theme, energetic klezmer celebration with chiptune accents, Torah scroll dancing energy, 135 BPM, circle dance rhythm, clapping hands and stomping feet, exuberant communal joy, Middle Eastern percussion with clarinet lead, kids game festive dance, loopable, no vocals", style: "Klezmer Celebration Chiptune", duration: "60-90s" },
]

// ============================================================================
// Category directory mapping
// ============================================================================

export const CATEGORY_DIRS = {
  menu: "menu",
  gameplay: "gameplay",
  battle: "battle",
  events: "events",
  characters: "characters",
  story: "story",
  worlds: "worlds",
  holidays: "holidays",
}

// ============================================================================
// Duration ranges for quality gates (in seconds)
// ============================================================================

export const DURATION_RANGES = {
  events: { min: 3, max: 30, label: "Stinger/Jingle" },
  menu: { min: 30, max: 150, label: "Menu Theme" },
  characters: { min: 15, max: 150, label: "Character Theme" },
  gameplay: { min: 60, max: 300, label: "Gameplay Loop" },
  battle: { min: 5, max: 300, label: "Battle Music" },
  story: { min: 60, max: 300, label: "Story Cinematic" },
  worlds: { min: 60, max: 300, label: "World Ambient" },
  holidays: { min: 30, max: 150, label: "Holiday Theme" },
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Convert a track name to a file-system-safe slug. */
export function trackNameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/** Get the expected MP3 filename for a track ID. */
export function trackIdToFileName(id) {
  const track = FULL_CATALOG.find(t => t.id === id)
  if (!track) return null
  return trackNameToSlug(track.name) + ".mp3"
}

/** Look up a track by its ID. */
export function getTrackById(id) {
  return FULL_CATALOG.find(t => t.id === id) || null
}

/** Get all tracks in a given category. */
export function getTracksByCategory(category) {
  return FULL_CATALOG.filter(t => t.category === category)
}

/** Get all tracks at a given priority level. */
export function getTracksByPriority(priority) {
  return FULL_CATALOG.filter(t => t.priority === priority)
}

/**
 * Get the best available prompt for a track ID.
 * Prefers suno-prompts.json (curated, more detailed) over the catalog prompt.
 */
export function getPromptForTrack(id, promptsJsonPath) {
  const pPath = promptsJsonPath || PROMPTS_PATH
  const catalogEntry = FULL_CATALOG.find(t => t.id === id)
  if (!catalogEntry) return null

  let detailedEntry = null
  if (existsSync(pPath)) {
    try {
      const prompts = JSON.parse(readFileSync(pPath, "utf-8"))
      detailedEntry = prompts.find(p => p.id === id)
    } catch { /* use catalog fallback */ }
  }

  return {
    id,
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
 * Get tracks that still need to be generated.
 * A track is pending if it has no existingFile and no file in the manifest/filesystem.
 */
export function getPendingTracks(manifestPath) {
  const mPath = manifestPath || MANIFEST_PATH
  let manifest = { generated_tracks: [], pending_tracks: [], not_generated: [] }
  if (existsSync(mPath)) {
    manifest = JSON.parse(readFileSync(mPath, "utf-8"))
  }

  // Build set of existing file paths
  const existingFiles = new Set()
  for (const track of manifest.generated_tracks || []) {
    for (const f of track.files || []) existingFiles.add(f)
  }
  const categories = Object.values(CATEGORY_DIRS)
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

/**
 * Parse a duration string like "60-90s" or "5s" into { min, max } in seconds.
 */
export function parseDurationString(durationStr) {
  if (!durationStr) return null
  const match = durationStr.match(/^(\d+)(?:-(\d+))?s?$/)
  if (!match) return null
  const min = parseInt(match[1], 10)
  const max = match[2] ? parseInt(match[2], 10) : min
  return { min, max }
}

// ============================================================================
// Self-test (run directly: node scripts/suno-track-catalog.mjs)
// ============================================================================

if (process.argv[1] && (process.argv[1].endsWith("suno-track-catalog.mjs") || process.argv[1].endsWith("suno-track-catalog"))) {
  const categories = {}
  for (const t of FULL_CATALOG) {
    categories[t.category] = (categories[t.category] || 0) + 1
  }

  const withExisting = FULL_CATALOG.filter(t => t.existingFile).length
  const pending = getPendingTracks()
  const priorities = { 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const t of FULL_CATALOG) priorities[t.priority] = (priorities[t.priority] || 0) + 1

  console.log("")
  console.log("  \x1b[1m\x1b[35mSUNO TRACK CATALOG - Self Test\x1b[0m")
  console.log("  \x1b[2m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m")
  console.log("")
  console.log("  Total tracks:    \x1b[1m" + FULL_CATALOG.length + "\x1b[0m")
  console.log("  Existing files:  \x1b[32m" + withExisting + "\x1b[0m")
  console.log("  Pending:         \x1b[33m" + pending.length + "\x1b[0m")
  console.log("")
  console.log("  \x1b[1mBy category:\x1b[0m")
  for (const [cat, count] of Object.entries(categories)) {
    console.log("    " + cat.padEnd(14) + " " + count + " tracks")
  }
  console.log("")
  console.log("  \x1b[1mBy priority:\x1b[0m")
  for (const [p, count] of Object.entries(priorities)) {
    if (count > 0) console.log("    P" + p + "             " + count + " tracks")
  }
  console.log("")

  // Verify prompt coverage
  let promptsCovered = 0
  if (existsSync(PROMPTS_PATH)) {
    const prompts = JSON.parse(readFileSync(PROMPTS_PATH, "utf-8"))
    promptsCovered = prompts.length
  }
  console.log("  \x1b[1mPrompt coverage:\x1b[0m")
  console.log("    Curated (suno-prompts.json): \x1b[36m" + promptsCovered + "\x1b[0m")
  console.log("    Catalog fallback:            \x1b[2m" + (FULL_CATALOG.length - promptsCovered) + "\x1b[0m")
  console.log("")

  // Verify helper functions
  const testTrack = getTrackById("CHAR-001")
  const testCat = getTracksByCategory("battle")
  const testP1 = getTracksByPriority(1)
  const testPrompt = getPromptForTrack("CHAR-001")
  const testFileName = trackIdToFileName("CHAR-001")

  console.log("  \x1b[1mFunction tests:\x1b[0m")
  console.log("    getTrackById('CHAR-001'):         " + (testTrack ? "\x1b[32m✓\x1b[0m " + testTrack.name : "\x1b[31m✗\x1b[0m"))
  console.log("    getTracksByCategory('battle'):     " + (testCat.length > 0 ? "\x1b[32m✓\x1b[0m " + testCat.length + " tracks" : "\x1b[31m✗\x1b[0m"))
  console.log("    getTracksByPriority(1):            " + (testP1.length > 0 ? "\x1b[32m✓\x1b[0m " + testP1.length + " tracks" : "\x1b[31m✗\x1b[0m"))
  console.log("    getPromptForTrack('CHAR-001'):     " + (testPrompt ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"))
  console.log("    trackIdToFileName('CHAR-001'):     " + (testFileName ? "\x1b[32m✓\x1b[0m " + testFileName : "\x1b[31m✗\x1b[0m"))
  console.log("    getPendingTracks():                " + "\x1b[32m✓\x1b[0m " + pending.length + " pending")
  console.log("")
}
