#!/usr/bin/env node

/**
 * Suno Music Pipeline - Ninja Keyboard
 *
 * Manages the entire music production lifecycle:
 *   - status   : Dashboard of track completion by category (with quality stats)
 *   - list     : List all tracks with their current state
 *   - copy ID  : Copy Suno prompt for a track to clipboard
 *   - import ID PATH : Import a downloaded Suno track into the project
 *   - validate : Check all manifest tracks have matching files
 *   - quality  : Run quality gates on all generated tracks
 *   - regen    : Show tracks that failed quality and need re-generation
 *   - sync     : Generate frontend TypeScript manifest from music-manifest.json
 *   - next     : Show the next priority track to generate
 *
 * Usage:
 *   node scripts/suno-music-pipeline.mjs status
 *   node scripts/suno-music-pipeline.mjs list
 *   node scripts/suno-music-pipeline.mjs copy CHAR-001
 *   node scripts/suno-music-pipeline.mjs import CHAR-001 ~/Downloads/suno-track.mp3
 *   node scripts/suno-music-pipeline.mjs validate
 *   node scripts/suno-music-pipeline.mjs quality
 *   node scripts/suno-music-pipeline.mjs regen
 *   node scripts/suno-music-pipeline.mjs sync
 *   node scripts/suno-music-pipeline.mjs next
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync, readdirSync } from 'node:fs'
import { resolve, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  FULL_CATALOG,
  CATEGORY_DIRS,
  DURATION_RANGES,
  trackNameToSlug,
  trackIdToFileName,
  getTrackById,
  getTracksByCategory,
  getPromptForTrack,
  getPendingTracks,
} from './suno-track-catalog.mjs'

// ─── Paths ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const PROMPTS_PATH = resolve(__dirname, 'suno-prompts.json')
const MANIFEST_PATH = resolve(PROJECT_ROOT, 'public/audio/music/music-manifest.json')
const MUSIC_DIR = resolve(PROJECT_ROOT, 'public/audio/music')
const FRONTEND_MANIFEST_PATH = resolve(PROJECT_ROOT, 'src/data/track-manifest.ts')

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

// ─── Helpers (from shared catalog) ───────────────────────────────────────────

function trackIdToCategory(id) {
  return getTrackById(id)?.category || 'misc'
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m${s.toString().padStart(2, '0')}s` : `${s}s`
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
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
}

// ─── Track Status Resolution ─────────────────────────────────────────────────

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

// ─── Quality Check ───────────────────────────────────────────────────────────

function qualityCheck(filePath, category) {
  const issues = []

  // 1. File size > 100KB
  try {
    const stats = statSync(filePath)
    if (stats.size < 100 * 1024) {
      issues.push(`File too small (${formatBytes(stats.size)}), likely corrupt`)
    }
  } catch (err) {
    issues.push(`Cannot stat file: ${err.message}`)
    return { pass: false, issues }
  }

  // 2. Duration check via ffprobe
  const durationRange = DURATION_RANGES[category]
  try {
    const output = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim()
    const duration = parseFloat(output)
    if (!isNaN(duration)) {
      if (durationRange && duration < durationRange.min) {
        issues.push(`Too short: ${formatDuration(duration)} (min ${durationRange.min}s for ${durationRange.label})`)
      }
      if (durationRange && duration > durationRange.max) {
        issues.push(`Too long: ${formatDuration(duration)} (max ${durationRange.max}s for ${durationRange.label})`)
      }
    }
  } catch {
    // ffprobe not available, skip duration check
  }

  // 3. Silence detection (reject if >50% silent)
  try {
    const output = execSync(
      `ffprobe -v quiet -af silencedetect=noise=-40dB:d=2 -f null - -i "${filePath}" 2>&1`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], shell: true }
    )
    const silenceMatches = output.match(/silence_duration:\s*([\d.]+)/g) || []
    let totalSilence = 0
    for (const m of silenceMatches) {
      const dur = parseFloat(m.replace('silence_duration: ', ''))
      if (!isNaN(dur)) totalSilence += dur
    }

    const durOutput = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim()
    const totalDur = parseFloat(durOutput)
    if (!isNaN(totalDur) && totalDur > 0 && totalSilence / totalDur > 0.5) {
      issues.push(`Mostly silent (${Math.round(totalSilence / totalDur * 100)}% silence)`)
    }
  } catch {
    // ffprobe not available or parsing failed, skip
  }

  return { pass: issues.length === 0, issues }
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

  // Quality stats
  const rejected = manifest.quality_rejected || []
  if (rejected.length > 0) {
    const rejectedIds = [...new Set(rejected.map(r => r.trackId))]
    console.log(`  ${c.red}Quality Rejected:${c.reset} ${rejected.length} file(s) across ${rejectedIds.length} track(s)`)
  }
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

  const catalogTrack = getTrackById(trackIdUpper)
  if (!catalogTrack) {
    console.error(`${c.red}Error: Track "${trackIdUpper}" not found in catalog.${c.reset}`)
    console.error(`Valid IDs: ${FULL_CATALOG.map(t => t.id).join(', ')}`)
    process.exit(1)
  }

  // Use the prompt from suno-prompts.json if available (it's more detailed), otherwise from catalog
  const promptData = getPromptForTrack(trackIdUpper)
  const prompt = promptData?.sunoPrompt || catalogTrack.sunoPrompt
  const style = promptData?.style || catalogTrack.style

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

  const catalogTrack = getTrackById(trackIdUpper)
  if (!catalogTrack) {
    console.error(`${c.red}Error: Track "${trackIdUpper}" not found in catalog.${c.reset}`)
    process.exit(1)
  }

  // Resolve source path (handle ~ expansion)
  let resolvedSource = sourcePath.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '')
  resolvedSource = resolve(resolvedSource)

  if (!existsSync(resolvedSource)) {
    console.error(`${c.red}Error: Source file not found: ${resolvedSource}${c.reset}`)
    process.exit(1)
  }

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
  const finalFileName = ext === '.mp3' ? destFileName : destFileName.replace('.mp3', ext)
  const destPath = resolve(categoryDir, finalFileName)

  copyFileSync(resolvedSource, destPath)

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

  manifest.pending_tracks = (manifest.pending_tracks || []).filter(t => t.id !== trackIdUpper)

  const notGenName = destFileName.replace('.mp3', '')
  manifest.not_generated = (manifest.not_generated || []).filter(t => t.name !== notGenName)

  const relativePath = `${catalogTrack.category}/${finalFileName}`
  const existingGen = (manifest.generated_tracks || []).find(g => g.trackId === trackIdUpper)

  if (existingGen) {
    existingGen.files = existingGen.files || []
    existingGen.files.push(relativePath)
    if (duration) {
      existingGen.durations = existingGen.durations || []
      existingGen.durations.push(duration)
    }
  } else {
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
  console.log(`${c.bold}File:${c.reset}     ${relativePath}`)
  console.log(`${c.bold}Size:${c.reset}     ${sizeMB} MB`)
  if (duration) {
    console.log(`${c.bold}Duration:${c.reset} ${formatDuration(duration)}`)
  }
  console.log(`${c.bold}Category:${c.reset} ${catalogTrack.category}`)
  console.log('')

  // Run quality check on the imported file
  const qr = qualityCheck(destPath, catalogTrack.category)
  if (qr.pass) {
    console.log(`  ${c.green}✓ Quality check passed${c.reset}`)
  } else {
    console.log(`  ${c.yellow}⚠ Quality issues:${c.reset}`)
    for (const issue of qr.issues) {
      console.log(`    ${c.yellow}• ${issue}${c.reset}`)
    }
    // Record in manifest
    manifest.quality_rejected = manifest.quality_rejected || []
    manifest.quality_rejected.push({
      trackId: trackIdUpper,
      file: relativePath,
      issues: qr.issues,
      rejectedAt: new Date().toISOString(),
    })
    saveManifest(manifest)
  }
  console.log('')

  console.log(`${c.dim}Run ${c.bold}node scripts/suno-music-pipeline.mjs validate${c.reset}${c.dim} to verify all tracks.${c.reset}`)
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

  const categoryList = ['characters', 'gameplay', 'battle', 'story', 'menu', 'events', 'worlds']
  for (const cat of categoryList) {
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

// ─── New Commands: quality, regen, sync ──────────────────────────────────────

function cmdQuality() {
  const manifest = loadManifest()
  const generated = manifest.generated_tracks || []

  console.log('')
  console.log(`${c.bold}${c.magenta}  QUALITY CHECK${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  if (generated.length === 0) {
    console.log(`  ${c.dim}No generated tracks to check.${c.reset}`)
    console.log('')
    return
  }

  let passed = 0
  let failed = 0
  const newRejections = []

  for (const entry of generated) {
    const label = entry.trackId || entry.name || 'unknown'
    // Look up category from catalog if not in manifest entry
    const catalogEntry = entry.trackId ? getTrackById(entry.trackId) : null
    const cat = entry.category || catalogEntry?.category || null
    for (const relPath of entry.files || []) {
      const absPath = resolve(MUSIC_DIR, relPath)
      if (!existsSync(absPath)) {
        console.log(`  ${c.red}✗ MISSING${c.reset} ${label}: ${relPath}`)
        failed++
        continue
      }

      const qr = qualityCheck(absPath, cat)
      if (qr.pass) {
        console.log(`  ${c.green}✓ PASS${c.reset}   ${label}: ${relPath}`)
        passed++
      } else {
        console.log(`  ${c.red}✗ FAIL${c.reset}   ${label}: ${relPath}`)
        for (const issue of qr.issues) {
          console.log(`           ${c.dim}• ${issue}${c.reset}`)
        }
        failed++
        newRejections.push({
          trackId: label,
          file: relPath,
          issues: qr.issues,
          rejectedAt: new Date().toISOString(),
        })
      }
    }
  }

  if (newRejections.length > 0) {
    manifest.quality_rejected = [...(manifest.quality_rejected || []), ...newRejections]
    saveManifest(manifest)
  }

  console.log('')
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log(`  ${c.green}${passed} passed${c.reset}  |  ${c.red}${failed} failed${c.reset}`)
  if (newRejections.length > 0) {
    console.log(`  ${c.yellow}${newRejections.length} new rejection(s) recorded in manifest.${c.reset}`)
    console.log(`  ${c.dim}Run: node scripts/suno-generate-batch.mjs --regen-rejected${c.reset}`)
  }
  console.log('')
}

function cmdRegen() {
  const manifest = loadManifest()
  const rejected = manifest.quality_rejected || []

  console.log('')
  console.log(`${c.bold}${c.magenta}  QUALITY-REJECTED TRACKS${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  if (rejected.length === 0) {
    console.log(`  ${c.green}✓ No quality-rejected tracks!${c.reset}`)
    console.log('')
    return
  }

  // Group by track ID
  const byTrack = {}
  for (const r of rejected) {
    if (!byTrack[r.trackId]) byTrack[r.trackId] = []
    byTrack[r.trackId].push(r)
  }

  for (const [trackId, rejections] of Object.entries(byTrack)) {
    const track = getTrackById(trackId)
    console.log(`  ${c.cyan}${trackId}${c.reset} — ${track?.name || 'Unknown'} ${c.dim}(${track?.nameHe || ''})${c.reset}`)
    for (const r of rejections) {
      console.log(`    ${c.red}✗${c.reset} ${r.file}`)
      for (const issue of r.issues) {
        console.log(`      ${c.dim}• ${issue}${c.reset}`)
      }
      console.log(`      ${c.dim}Rejected: ${r.rejectedAt}${c.reset}`)
    }
    console.log('')
  }

  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log(`  ${c.bold}${Object.keys(byTrack).length} track(s)${c.reset} need re-generation.`)
  console.log('')
  console.log(`  ${c.yellow}To re-generate:${c.reset}`)
  console.log(`    node scripts/suno-generate-batch.mjs --regen-rejected`)
  console.log('')
}

function cmdSync() {
  const manifest = loadManifest()

  console.log('')
  console.log(`${c.bold}${c.magenta}  SYNC MANIFEST → FRONTEND TYPESCRIPT${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log('')

  const generated = manifest.generated_tracks || []
  if (generated.length === 0) {
    console.log(`  ${c.yellow}No generated tracks to sync.${c.reset}`)
    console.log('')
    return
  }

  // Map categories to game zones
  const categoryToZone = {
    menu: 'menu',
    gameplay: 'practice',
    battle: 'battle',
    events: 'events',
    characters: 'home',
    story: 'story',
    worlds: 'home',
  }

  // Build typed track entries
  const entries = generated.map(track => {
    const trackId = track.trackId || track.name?.toUpperCase() || 'UNKNOWN'
    const catalogEntry = getTrackById(trackId)
    const cat = track.category || catalogEntry?.category || 'menu'
    const zone = categoryToZone[cat] || 'menu'
    const primaryFile = (track.files || [])[0] || ''

    return {
      id: trackId,
      name: track.name || trackNameToSlug(track.title || ''),
      title: track.title || track.name,
      titleHe: track.titleHe || catalogEntry?.nameHe || '',
      description: track.description || '',
      style: track.style || catalogEntry?.style || '',
      category: cat,
      zone,
      audioUrl: `/audio/music/${primaryFile}`,
      files: (track.files || []).map(f => `/audio/music/${f}`),
      duration: track.duration || (track.durations?.[0]) || null,
      unlockCondition: catalogEntry?.priority === 1 ? 'default' : 'achievement',
      priority: catalogEntry?.priority || 3,
    }
  })

  const tsContent = `// AUTO-GENERATED by suno-music-pipeline.mjs sync command
// Do not edit manually - run: node scripts/suno-music-pipeline.mjs sync
// Generated: ${new Date().toISOString()}

import type { GameZone } from '@/lib/audio/music-manager'

export interface SyncedMusicTrack {
  id: string
  name: string
  title: string
  titleHe: string
  description: string
  style: string
  category: string
  zone: GameZone
  audioUrl: string
  files: string[]
  duration: number | null
  unlockCondition: 'default' | 'achievement'
  priority: number
}

export const SYNCED_TRACK_MANIFEST: SyncedMusicTrack[] = ${JSON.stringify(entries, null, 2)} as const
`

  // Ensure directory exists
  const dir = dirname(FRONTEND_MANIFEST_PATH)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(FRONTEND_MANIFEST_PATH, tsContent, 'utf-8')

  console.log(`  ${c.green}✓${c.reset} Wrote ${c.bold}${entries.length}${c.reset} tracks to ${c.cyan}src/data/track-manifest.ts${c.reset}`)
  console.log('')

  for (const entry of entries) {
    console.log(`  ${c.dim}${entry.id || entry.name}${c.reset} → ${entry.title} ${c.dim}[${entry.zone}]${c.reset}`)
  }

  console.log('')
  console.log(`  ${c.yellow}Note:${c.reset} Import in your code with:`)
  console.log(`    ${c.dim}import { SYNCED_TRACK_MANIFEST } from '@/data/track-manifest'${c.reset}`)
  console.log('')
}

// ─── Help ────────────────────────────────────────────────────────────────────

function cmdHelp() {
  console.log(`
${c.bold}${c.magenta}  SUNO MUSIC PIPELINE - Ninja Keyboard${c.reset}
${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}

  ${c.bold}Commands:${c.reset}

  ${c.cyan}status${c.reset}             Overview dashboard with quality stats
  ${c.cyan}list${c.reset}               List all tracks with status
  ${c.cyan}next${c.reset}               Show priority tracks to generate next
  ${c.cyan}copy <ID>${c.reset}          Copy Suno prompt to clipboard
  ${c.cyan}import <ID> <PATH>${c.reset} Import downloaded track into project
  ${c.cyan}validate${c.reset}           Check all manifest files exist
  ${c.cyan}quality${c.reset}            Run quality gates on all generated tracks
  ${c.cyan}regen${c.reset}              Show quality-rejected tracks for re-generation
  ${c.cyan}sync${c.reset}               Generate frontend TypeScript from manifest
  ${c.cyan}help${c.reset}               Show this help

  ${c.bold}Automation:${c.reset}

  ${c.dim}node scripts/suno-generate-batch.mjs${c.reset}                   Generate all pending tracks
  ${c.dim}node scripts/suno-generate-batch.mjs --quality-check${c.reset}   Validate existing files
  ${c.dim}node scripts/suno-generate-batch.mjs --regen-rejected${c.reset}  Re-generate failed tracks

  ${c.bold}Typical Workflow:${c.reset}

  1. ${c.cyan}status${c.reset}   → See what needs generating
  2. ${c.cyan}next${c.reset}     → Pick highest priority track
  3. ${c.dim}node scripts/suno-generate-batch.mjs${c.reset} → Batch generate (automated)
     ${c.dim}— OR —${c.reset}
  3. ${c.cyan}copy ID${c.reset}  → Copy prompt to clipboard
  4. Open ${c.bold}suno.com${c.reset}, paste prompt, generate, download
  5. ${c.cyan}import ID path${c.reset} → Import into project
  6. ${c.cyan}quality${c.reset}  → Run quality checks
  7. ${c.cyan}validate${c.reset} → Verify everything is correct
  8. ${c.cyan}sync${c.reset}     → Update frontend TypeScript manifest
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
  case 'quality':
    cmdQuality()
    break
  case 'regen':
    cmdRegen()
    break
  case 'sync':
    cmdSync()
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
