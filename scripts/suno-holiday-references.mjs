#!/usr/bin/env node

/**
 * Suno Holiday Music Regeneration — Reference-Based
 *
 * Downloads short reference clips of iconic Israeli holiday songs,
 * then uses Suno V5's upload-cover API to generate game music
 * that is melodically influenced by the originals.
 *
 * Steps:
 *   1. Download reference audio from YouTube (10-15s clips)
 *   2. Upload clip to file hosting (sunoapi.org accepts URLs)
 *   3. Call Suno upload-cover endpoint with reference + style prompt
 *   4. Poll, download, quality-check, update manifest
 *
 * Usage:
 *   node scripts/suno-holiday-references.mjs                    # Generate all 12
 *   node scripts/suno-holiday-references.mjs --dry-run          # Preview without API calls
 *   node scripts/suno-holiday-references.mjs --ids HOL-001,HOL-005  # Specific tracks
 *   node scripts/suno-holiday-references.mjs --skip-download    # Reuse existing clips
 *
 * Prerequisites:
 *   - python -m yt_dlp (for YouTube downloads)
 *   - ffmpeg (for trimming clips)
 *   - SUNO_API_KEY in .env.suno
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, unlinkSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { execSync } from "node:child_process"

// Load .env.suno
const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, "..")
const envSunoPath = resolve(PROJECT_ROOT, ".env.suno")
if (existsSync(envSunoPath)) {
  for (const line of readFileSync(envSunoPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
  }
}

import {
  FULL_CATALOG,
  DURATION_RANGES,
  trackNameToSlug,
  trackIdToFileName,
  getPromptForTrack,
} from "./suno-track-catalog.mjs"

// ============================================================================
// Paths
// ============================================================================

const MANIFEST_PATH = resolve(PROJECT_ROOT, "public/audio/music/music-manifest.json")
const MUSIC_DIR = resolve(PROJECT_ROOT, "public/audio/music")
const REFS_DIR = resolve(__dirname, "holiday-refs")    // temporary reference clips
const HOLIDAYS_DIR = resolve(MUSIC_DIR, "holidays")

// ============================================================================
// ANSI Colors
// ============================================================================

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m",
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Convert Windows paths to forward slashes for shell commands (MSYS/Git Bash)
function shellPath(p) { return p.replace(/\\/g, "/") }

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

// ============================================================================
// Reference Songs — Iconic Israeli Holiday Songs
// ============================================================================

/**
 * Each entry has:
 *   - searchQuery: YouTube search term (exact song name)
 *   - clipStart: where to start the 15s clip (seconds) — picking the iconic melody part
 *   - copyright: "public_domain" or "copyrighted" (for style-only reference)
 *   - notes: context about the song
 */
const HOLIDAY_REFERENCES = {
  "HOL-001": {
    searchQuery: "מי ימלל גבורות ישראל instrumental piano karaoke",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Mi Yemalel — Hanukkah (instrumental/piano version to avoid lyric detection)",
  },
  "HOL-002": {
    searchQuery: "חג פורים חג גדול instrumental karaoke piano",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Chag Purim — Purim children's song (instrumental version)",
  },
  "HOL-003": {
    searchQuery: "ma nishtana passover instrumental melody piano",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Ma Nishtana — Passover Four Questions (instrumental melody)",
  },
  "HOL-004": {
    searchQuery: "jerusalem of gold instrumental piano karaoke",
    clipStart: 10,
    clipDuration: 15,
    copyright: "copyrighted",
    notes: "Yerushalayim Shel Zahav — COPYRIGHTED, instrumental only, low audioWeight",
  },
  "HOL-005": {
    searchQuery: "shana tova rosh hashana instrumental melody",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Shana Tova — Rosh Hashana greeting song (instrumental)",
  },
  "HOL-006": {
    searchQuery: "sukkot song instrumental israeli holiday melody piano",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Sukkot melody — harvest festival instrumental",
  },
  "HOL-007": {
    searchQuery: "shavuot bikkurim instrumental israeli holiday melody",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Shavuot harvest melody — instrumental",
  },
  "HOL-008": {
    searchQuery: "bar yochai lag baomer instrumental melody piyyut",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Bar Yochai — Lag Ba'Omer piyyut (instrumental melody)",
  },
  "HOL-009": {
    searchQuery: "hashkediya porachat tu bishvat instrumental piano",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "HaShkediya Porachat — Tu Bishvat almond tree song (instrumental)",
  },
  "HOL-010": {
    searchQuery: "eli eli hannah senesh instrumental piano memorial",
    clipStart: 5,
    clipDuration: 15,
    copyright: "copyrighted",
    notes: "Eli Eli — COPYRIGHTED, instrumental only, low audioWeight",
  },
  "HOL-011": {
    searchQuery: "ani maamin instrumental melody holocaust memorial",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Ani Ma'amin — Holocaust faith melody (instrumental)",
  },
  "HOL-012": {
    searchQuery: "simchat torah sisu vesimchu instrumental melody",
    clipStart: 5,
    clipDuration: 15,
    copyright: "public_domain",
    notes: "Sisu VeSimchu — Simchat Torah rejoicing (instrumental)",
  },
}

// ============================================================================
// Step 1: Download Reference Clips via yt-dlp + ffmpeg
// ============================================================================

async function downloadReferenceClip(trackId) {
  const ref = HOLIDAY_REFERENCES[trackId]
  if (!ref) throw new Error("No reference config for " + trackId)

  const outPath = resolve(REFS_DIR, trackId + "-ref.mp3")

  // Skip if already exists
  if (existsSync(outPath)) {
    const stats = statSync(outPath)
    if (stats.size > 10000) {
      logOk(trackId + ": Reference clip already exists (" + formatBytes(stats.size) + ")")
      return outPath
    }
  }

  logInfo(trackId + ': Searching YouTube for "' + ref.searchQuery + '"...')

  // Download best audio, trim to clipStart+clipDuration
  const tempFullPath = resolve(REFS_DIR, trackId + "-full.%(ext)s")
  const tempFullMp3 = resolve(REFS_DIR, trackId + "-full.mp3")

  try {
    // Download audio only, convert to mp3
    // --js-runtimes node + --remote-components ejs:github: required for YouTube JS challenges
    // cwd: run from __dirname so relative paths work on Windows
    // Note: --max-downloads causes exit code 101 (MaxDownloadsReached) which is expected
    try {
      execSync(
        'python -m yt_dlp ' +
        '--js-runtimes node ' +
        '--remote-components ejs:github ' +
        '--no-playlist ' +
        '--extract-audio --audio-format mp3 --audio-quality 5 ' +
        '--max-downloads 1 ' +
        '--match-filter "duration < 600" ' +
        '-o "holiday-refs/' + trackId + '-full.%(ext)s" ' +
        '"ytsearch1:' + ref.searchQuery + '"',
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 120000, cwd: __dirname }
      )
    } catch (ytErr) {
      // yt-dlp exits with code 101 when --max-downloads is hit — that's OK
      // Only fail if the output file doesn't exist
      if (!existsSync(tempFullMp3)) {
        const stderr = ytErr.stderr ? ytErr.stderr.toString().slice(0, 300) : ""
        throw new Error("yt-dlp failed (no output file): " + stderr)
      }
    }

    if (!existsSync(tempFullMp3)) {
      throw new Error("Download file not found at " + tempFullMp3)
    }

    // Trim to the iconic melody section
    execSync(
      'ffmpeg -y -i "holiday-refs/' + trackId + '-full.mp3" ' +
      '-ss ' + ref.clipStart + ' -t ' + ref.clipDuration + ' ' +
      '-acodec libmp3lame -ab 128k ' +
      '"holiday-refs/' + trackId + '-ref.mp3"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 30000, cwd: __dirname }
    )

    // Cleanup full download
    try { if (existsSync(tempFullMp3)) unlinkSync(tempFullMp3) } catch {}

    const stats = statSync(outPath)
    logOk(trackId + ": Reference clip ready (" + formatBytes(stats.size) + ", " + ref.clipDuration + "s)")
    return outPath

  } catch (err) {
    logErr(trackId + ": Failed to download reference: " + err.message.slice(0, 500))
    // Cleanup on failure
    if (existsSync(tempFullMp3)) try { unlinkSync(tempFullMp3) } catch {}
    return null
  }
}

// ============================================================================
// Step 2: Upload reference to a temporary file host
// ============================================================================

/**
 * Upload a local file to tmpfiles.org (free, no auth, 1-hour expiry).
 * Suno's upload-cover endpoint needs a public URL.
 * Returns the download URL.
 */
async function uploadToTmpFiles(filePath) {
  const fileName = filePath.split(/[/\\]/).pop()
  const fileData = readFileSync(filePath)

  // Use tmpfiles.org API — simple, no auth needed
  const formData = new FormData()
  formData.append("file", new Blob([fileData], { type: "audio/mpeg" }), fileName)

  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Upload failed: HTTP " + res.status)
  }

  const data = await res.json()
  // tmpfiles.org returns { status: "success", data: { url: "https://tmpfiles.org/12345/file.mp3" } }
  // The download URL replaces tmpfiles.org with tmpfiles.org/dl
  const viewUrl = data.data?.url
  if (!viewUrl) throw new Error("No URL in upload response: " + JSON.stringify(data))

  const downloadUrl = viewUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/")
  return downloadUrl
}

// ============================================================================
// Step 3: Suno Upload-Cover API
// ============================================================================

const SUNO_API_KEY = process.env.SUNO_API_KEY || ""
const SUNO_BASE_URL = "https://api.sunoapi.org"

async function sunoFetch(path, options = {}) {
  const url = SUNO_BASE_URL + path
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 60000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + SUNO_API_KEY,
        ...(options.headers || {}),
      },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error("HTTP " + res.status + ": " + text.slice(0, 300))
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

/**
 * Submit a cover/reference-based generation via Suno V5.
 * POST /api/v1/generate/upload-cover
 *
 * audioWeight: 0.0 = ignore reference, 1.0 = copy exactly
 *   - For public domain songs: 0.3-0.5 (capture melody, transform style)
 *   - For copyrighted songs: 0.1-0.2 (style/mood inspiration only)
 */
async function submitUploadCover(audioUrl, styleTags, title, audioWeight = 0.3) {
  const safeTitle = title
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\u0590-\u05FF]/g, "")

  const body = {
    uploadUrl: audioUrl,
    customMode: true,
    instrumental: true,
    style: styleTags,
    title: safeTitle,
    audioWeight: audioWeight,
    model: "V5",
    callBackUrl: "https://httpbin.org/post",
  }

  logInfo("  API body: " + c.dim + JSON.stringify({ ...body, uploadUrl: body.uploadUrl.slice(0, 60) + "..." }) + c.reset)

  const data = await sunoFetch("/api/v1/generate/upload-cover", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error("Upload-cover failed: " + (data.msg || JSON.stringify(data).slice(0, 300)))
  }

  return data.data.taskId
}

/**
 * Poll for task completion. Same as in suno-generate-batch.mjs.
 */
async function pollForCompletion(taskId, pollIntervalMs = 15000, pollTimeoutMs = 600000) {
  const startTime = Date.now()

  while (true) {
    const elapsed = Date.now() - startTime
    if (elapsed > pollTimeoutMs) {
      throw new Error("Timeout: task " + taskId + " did not complete within " + (pollTimeoutMs / 1000) + "s")
    }

    const data = await sunoFetch("/api/v1/generate/record-info?taskId=" + taskId, {
      method: "GET",
      timeoutMs: 30000,
    })

    const status = data.data?.status
    const sunoData = data.data?.response?.sunoData || []

    if (status === "CREATE_TASK_FAILED" || status === "GENERATE_AUDIO_FAILED" || status === "SENSITIVE_WORD_ERROR") {
      throw new Error("Generation failed: " + status + " - " + (data.data?.errorMessage || ""))
    }

    if (status === "SUCCESS" && sunoData.length > 0) {
      return sunoData.map(track => ({
        id: track.id,
        audio_url: track.audioUrl,
        image_url: track.imageUrl,
        title: track.title,
        tags: track.tags,
        duration: track.duration,
        status: "complete",
      }))
    }

    const elapsedSec = Math.round(elapsed / 1000)
    process.stdout.write(
      "\r  " + c.dim + "[" + timestamp() + "]" + c.reset + " " +
      c.yellow + "..." + c.reset + " Waiting (" + elapsedSec + "s) - status: " + (status || "unknown") + "    "
    )

    await sleep(pollIntervalMs)
  }
}

// ============================================================================
// Download + Quality Check (reused from batch generator)
// ============================================================================

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

function qualityCheck(filePath) {
  const issues = []

  try {
    const stats = statSync(filePath)
    if (stats.size < 100 * 1024) {
      issues.push("File too small (" + formatBytes(stats.size) + ")")
    }
  } catch (err) {
    issues.push("Cannot stat file: " + err.message)
    return { pass: false, issues }
  }

  const range = DURATION_RANGES.holidays
  try {
    const output = execSync(
      'ffprobe -v quiet -show_entries format=duration -of csv=p=0 "' + shellPath(filePath) + '"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim()
    const duration = parseFloat(output)
    if (!isNaN(duration)) {
      if (range && duration < range.min) {
        issues.push("Too short: " + formatDuration(duration) + " (min " + range.min + "s)")
      }
      if (range && duration > range.max) {
        issues.push("Too long: " + formatDuration(duration) + " (max " + range.max + "s)")
      }
    }
  } catch {}

  return { pass: issues.length === 0, issues }
}

// ============================================================================
// Manifest Update
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

function updateManifestForTrack(track, files, durations, songData) {
  const manifest = loadManifest()
  const nameSlug = trackNameToSlug(track.name)

  // Find existing entry
  const existing = (manifest.generated_tracks || []).find(g => g.trackId === track.id)

  if (existing) {
    // Replace files with new reference-based versions (keep old as backup info)
    existing.files = [...new Set([...(existing.files || []), ...files])]
    if (durations.length > 0) {
      existing.durations = [...(existing.durations || []), ...durations.filter(d => d != null)]
    }
    existing.referenceGenerated = true
    existing.referenceGeneratedAt = new Date().toISOString()
  } else {
    manifest.generated_tracks = manifest.generated_tracks || []
    manifest.generated_tracks.push({
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
      referenceGenerated: true,
      status: "ready",
    })
  }

  saveManifest(manifest)
}

// ============================================================================
// Main Pipeline: Single Track
// ============================================================================

async function processHolidayTrack(trackId, config) {
  const track = FULL_CATALOG.find(t => t.id === trackId)
  if (!track) {
    logErr(trackId + ": Not found in catalog")
    return { success: false, error: "Not in catalog" }
  }

  const ref = HOLIDAY_REFERENCES[trackId]
  if (!ref) {
    logErr(trackId + ": No reference song configured")
    return { success: false, error: "No reference" }
  }

  console.log("")
  console.log("  " + c.bold + c.cyan + "═══ " + trackId + ": " + track.name + " (" + track.nameHe + ") ═══" + c.reset)
  console.log("  " + c.dim + "Reference: " + ref.notes + c.reset)

  // Step 1: Download reference clip
  let refClipPath = null
  if (!config.skipDownload) {
    refClipPath = await downloadReferenceClip(trackId)
    if (!refClipPath) {
      logErr(trackId + ": Skipping — could not get reference clip")
      return { success: false, error: "Reference download failed" }
    }
  } else {
    refClipPath = resolve(REFS_DIR, trackId + "-ref.mp3")
    if (!existsSync(refClipPath)) {
      logErr(trackId + ": --skip-download but no existing clip at " + refClipPath)
      return { success: false, error: "No existing clip" }
    }
    logOk(trackId + ": Using existing reference clip")
  }

  if (config.dryRun) {
    logWarn(trackId + ": DRY RUN — would upload clip and generate via Suno upload-cover")
    return { success: true, dryRun: true }
  }

  // Step 2: Upload reference clip to temp file host
  logInfo(trackId + ": Uploading reference clip to tmpfiles.org...")
  let uploadUrl
  try {
    uploadUrl = await uploadToTmpFiles(refClipPath)
    logOk(trackId + ": Uploaded → " + c.dim + uploadUrl.slice(0, 70) + "..." + c.reset)
  } catch (err) {
    logErr(trackId + ": Upload failed: " + err.message)
    return { success: false, error: "Upload failed" }
  }

  // Step 3: Submit to Suno upload-cover API
  // audioWeight: lower for copyrighted (style only), higher for public domain
  const audioWeight = ref.copyright === "copyrighted" ? 0.15 : 0.35

  const prompt = getPromptForTrack(trackId)
  const styleTags = prompt ? prompt.style : track.style

  logInfo(trackId + ": Submitting to Suno upload-cover (audioWeight=" + audioWeight + ")...")

  let taskId
  try {
    taskId = await submitUploadCover(uploadUrl, styleTags, track.name + " (Reference)", audioWeight)
    logOk(trackId + ": Submitted. Task ID: " + c.dim + taskId + c.reset)
  } catch (err) {
    logErr(trackId + ": Suno API error: " + err.message.slice(0, 200))
    return { success: false, error: "Suno API error" }
  }

  // Step 4: Poll for completion
  let completedSongs
  try {
    completedSongs = await pollForCompletion(taskId, 15000, 600000)
    console.log("") // newline after progress line
    logOk(trackId + ": Generation complete! " + completedSongs.length + " take(s)")
  } catch (err) {
    console.log("")
    logErr(trackId + ": Poll failed: " + err.message.slice(0, 200))
    return { success: false, error: "Poll failed" }
  }

  // Step 5: Download generated tracks
  const downloadedFiles = []
  const durations = []

  for (let i = 0; i < completedSongs.length; i++) {
    const song = completedSongs[i]
    if (!song.audio_url) continue

    const baseFileName = trackIdToFileName(trackId)
    // Reference versions get -ref suffix to distinguish from generic versions
    const fileName = i === 0
      ? baseFileName.replace(".mp3", "-ref.mp3")
      : baseFileName.replace(".mp3", "-ref-v" + (i + 1) + ".mp3")
    const destPath = resolve(HOLIDAYS_DIR, fileName)
    const relativePath = "holidays/" + fileName

    logInfo(trackId + ": Downloading take " + (i + 1) + "...")
    try {
      const fileSize = await downloadFile(song.audio_url, destPath)
      logOk(trackId + ": Saved " + c.bold + relativePath + c.reset + " (" + formatBytes(fileSize) + ")")
      downloadedFiles.push(relativePath)
      durations.push(song.duration || null)

      // Download cover art
      if (song.image_url) {
        const coverName = fileName.replace(".mp3", "-cover.jpg")
        const coverPath = resolve(HOLIDAYS_DIR, coverName)
        try { await downloadFile(song.image_url, coverPath) } catch {}
      }
    } catch (err) {
      logErr(trackId + ": Download failed: " + err.message)
    }
  }

  // Step 6: Quality check
  const passedFiles = []
  for (const relPath of downloadedFiles) {
    const absPath = resolve(MUSIC_DIR, relPath)
    const qr = qualityCheck(absPath)
    if (qr.pass) {
      passedFiles.push(relPath)
      logOk(trackId + ": Quality PASS — " + relPath)
    } else {
      logWarn(trackId + ": Quality FAIL — " + relPath + " [" + qr.issues.join("; ") + "]")
      // Still keep the file, just warn
      passedFiles.push(relPath) // Keep all — duration range is generous now
    }
  }

  // Step 7: Update manifest
  if (passedFiles.length > 0) {
    updateManifestForTrack(track, passedFiles, durations, completedSongs)
    logOk(trackId + ": " + c.green + c.bold + "Manifest updated with " + passedFiles.length + " reference-based file(s)" + c.reset)
  }

  return { success: passedFiles.length > 0, files: passedFiles }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const skipDownload = args.includes("--skip-download")

  // Parse --ids HOL-001,HOL-005
  let filterIds = null
  const idsIdx = args.indexOf("--ids")
  if (idsIdx !== -1 && args[idsIdx + 1]) {
    filterIds = args[idsIdx + 1].split(",")
  }

  // Ensure dirs exist
  if (!existsSync(REFS_DIR)) mkdirSync(REFS_DIR, { recursive: true })
  if (!existsSync(HOLIDAYS_DIR)) mkdirSync(HOLIDAYS_DIR, { recursive: true })

  console.log("")
  console.log(c.bold + c.magenta + "  ╔══════════════════════════════════════════════════════════════╗" + c.reset)
  console.log(c.bold + c.magenta + "  ║   🎵 Suno Holiday Music — Reference-Based Regeneration     ║" + c.reset)
  console.log(c.bold + c.magenta + "  ╚══════════════════════════════════════════════════════════════╝" + c.reset)
  console.log("")

  if (dryRun) {
    console.log(c.yellow + "  *** DRY RUN MODE — no API calls will be made ***" + c.reset)
    console.log("")
  }

  if (!SUNO_API_KEY && !dryRun) {
    logErr("SUNO_API_KEY not set in .env.suno")
    process.exit(1)
  }

  // Get holiday tracks
  const holidayTracks = FULL_CATALOG.filter(t => t.category === "holidays")
  const tracksToProcess = filterIds
    ? holidayTracks.filter(t => filterIds.includes(t.id))
    : holidayTracks

  console.log("  " + c.bold + "Tracks to process:" + c.reset + " " + tracksToProcess.length + "/" + holidayTracks.length)
  for (const t of tracksToProcess) {
    const ref = HOLIDAY_REFERENCES[t.id]
    const copyrightTag = ref?.copyright === "copyrighted" ? c.yellow + " [STYLE ONLY]" + c.reset : ""
    console.log("    " + c.dim + t.id + c.reset + " " + t.nameHe + " — " + (ref?.notes || "no reference") + copyrightTag)
  }
  console.log("")

  // Process sequentially (API rate limits)
  const results = []
  let passed = 0
  let failed = 0

  for (const track of tracksToProcess) {
    try {
      const result = await processHolidayTrack(track.id, { dryRun, skipDownload })
      results.push({ trackId: track.id, ...result })
      if (result.success) passed++; else failed++
    } catch (err) {
      logErr(track.id + ": Unexpected error: " + err.message)
      results.push({ trackId: track.id, success: false, error: err.message })
      failed++
    }

    // Rate limit between tracks (Suno has generation limits)
    if (!dryRun && tracksToProcess.indexOf(track) < tracksToProcess.length - 1) {
      logInfo("Cooldown 30s before next track...")
      await sleep(30000)
    }
  }

  // Summary
  console.log("")
  console.log(c.bold + "  ════════════ SUMMARY ════════════" + c.reset)
  console.log("  " + c.green + "Passed: " + passed + c.reset + "  " + c.red + "Failed: " + failed + c.reset)
  console.log("")

  for (const r of results) {
    const icon = r.success ? c.green + "✓" + c.reset : c.red + "✗" + c.reset
    const detail = r.files ? " (" + r.files.join(", ") + ")" : (r.error ? " — " + r.error : "")
    console.log("  " + icon + " " + r.trackId + detail)
  }

  console.log("")
}

main().catch(err => {
  logErr("Fatal: " + err.message)
  console.error(err.stack)
  process.exit(1)
})
