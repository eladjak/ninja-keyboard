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
import { execSync } from "node:child_process"

// Load .env.suno for API key
const __dirname_early = dirname(fileURLToPath(import.meta.url))
const envSunoPath = resolve(__dirname_early, "..", ".env.suno")
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
  getPendingTracks,
} from "./suno-track-catalog.mjs"

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

// trackNameToSlug, trackIdToFileName, getPromptForTrack, getPendingTracks
// imported from suno-track-catalog.mjs

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

function loadGenerationLog() {
  if (!existsSync(GENERATION_LOG_PATH)) return { runs: [] }
  return JSON.parse(readFileSync(GENERATION_LOG_PATH, "utf-8"))
}

function saveGenerationLog(log) {
  writeFileSync(GENERATION_LOG_PATH, JSON.stringify(log, null, 2), "utf-8")
}

// ============================================================================
// Quality Gates (post-download validation)
// ============================================================================

/**
 * Validate a downloaded audio file against quality criteria.
 * Returns { pass: boolean, issues: string[] }
 */
function qualityCheck(filePath, category) {
  const issues = []

  // 1. File size > 100KB
  try {
    const stats = statSync(filePath)
    if (stats.size < 100 * 1024) {
      issues.push("File too small (" + formatBytes(stats.size) + "), likely corrupt")
    }
  } catch (err) {
    issues.push("Cannot stat file: " + err.message)
    return { pass: false, issues }
  }

  // 2. Duration check via ffprobe
  const durationRange = DURATION_RANGES[category]
  try {
    const output = execSync(
      'ffprobe -v quiet -show_entries format=duration -of csv=p=0 "' + filePath + '"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim()
    const duration = parseFloat(output)
    if (!isNaN(duration)) {
      if (durationRange && duration < durationRange.min) {
        issues.push("Too short: " + formatDuration(duration) + " (min " + durationRange.min + "s for " + durationRange.label + ")")
      }
      if (durationRange && duration > durationRange.max) {
        issues.push("Too long: " + formatDuration(duration) + " (max " + durationRange.max + "s for " + durationRange.label + ")")
      }
    }
  } catch {
    // ffprobe not available, skip duration check
  }

  // 3. Silence detection (reject if >50% silent)
  try {
    const output = execSync(
      'ffprobe -v quiet -af silencedetect=noise=-40dB:d=2 -f null - -i "' + filePath + '" 2>&1',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], shell: true }
    )
    const silenceMatches = output.match(/silence_duration:\s*([\d.]+)/g) || []
    let totalSilence = 0
    for (const m of silenceMatches) {
      const dur = parseFloat(m.replace("silence_duration: ", ""))
      if (!isNaN(dur)) totalSilence += dur
    }

    // Get total duration for percentage calc
    const durOutput = execSync(
      'ffprobe -v quiet -show_entries format=duration -of csv=p=0 "' + filePath + '"',
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim()
    const totalDur = parseFloat(durOutput)
    if (!isNaN(totalDur) && totalDur > 0 && totalSilence / totalDur > 0.5) {
      issues.push("Mostly silent (" + Math.round(totalSilence / totalDur * 100) + "% silence)")
    }
  } catch {
    // ffprobe not available or parsing failed, skip
  }

  return { pass: issues.length === 0, issues }
}

// ============================================================================
// Suno API Client (sunoapi.org cloud API — no Docker needed)
// ============================================================================

const SUNO_API_KEY = process.env.SUNO_API_KEY || ""

/**
 * Generic fetch wrapper with timeout, Bearer auth, and error handling.
 */
async function sunoFetch(baseUrl, path, options = {}) {
  const url = baseUrl + path
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

/** Check remaining credits via sunoapi.org. */
async function getCredits(baseUrl) {
  try {
    // sunoapi.org: GET /api/v1/generate/record-info is for tasks;
    // credits info may come from the generate response or a dedicated endpoint.
    // For now, do a lightweight check by hitting the generate endpoint docs.
    // If the API returns 401, key is bad. If 200, we're good.
    const res = await fetch(baseUrl + "/api/v1/generate/record-info?taskId=test", {
      headers: { "Authorization": "Bearer " + SUNO_API_KEY },
    })
    if (res.status === 401) {
      return { remaining: null, total: null, error: "Invalid API key" }
    }
    return { remaining: "available", total: "sunoapi.org", error: null }
  } catch (err) {
    return { remaining: null, total: null, error: err.message }
  }
}

/**
 * POST /api/v1/generate - Submit a generation request to sunoapi.org.
 * Returns a taskId that can be polled for completion.
 * Custom mode: instrumental with style (tags) and title.
 */
async function submitGeneration(baseUrl, prompt, tags, title) {
  // Sanitize title: replace curly quotes with straight ASCII to prevent encoding issues
  const safeTitle = title
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\u0590-\u05FF]/g, "")  // keep ASCII + Hebrew only
  const safeTags = tags
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')

  const body = {
    customMode: true,
    instrumental: true,
    style: safeTags,
    title: safeTitle,
    model: "V5",
    callBackUrl: "https://httpbin.org/post",
  }

  const data = await sunoFetch(baseUrl, "/api/v1/generate", {
    method: "POST",
    body: JSON.stringify(body),
  })

  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error("Generate failed: " + (data.msg || JSON.stringify(data).slice(0, 300)))
  }

  // Return a pseudo-clips array with the taskId so the pipeline can poll
  return [{ id: data.data.taskId, _isTaskId: true }]
}

/**
 * Poll sunoapi.org for generation completion.
 * GET /api/v1/generate/record-info?taskId=xxx
 * Returns array of clip objects with audio_url when complete.
 */
async function pollForCompletion(baseUrl, songIds, pollIntervalMs, pollTimeoutMs) {
  // songIds[0] is actually the taskId from sunoapi.org
  const taskId = songIds[0]
  const startTime = Date.now()

  while (true) {
    const elapsed = Date.now() - startTime
    if (elapsed > pollTimeoutMs) {
      throw new Error("Timeout: task " + taskId + " did not complete within " + (pollTimeoutMs / 1000) + "s")
    }

    const data = await sunoFetch(baseUrl, "/api/v1/generate/record-info?taskId=" + taskId, {
      method: "GET",
      timeoutMs: 30000,
    })

    const status = data.data?.status
    const sunoData = data.data?.response?.sunoData || []

    // Check for terminal failure states
    if (status === "CREATE_TASK_FAILED" || status === "GENERATE_AUDIO_FAILED" || status === "SENSITIVE_WORD_ERROR") {
      throw new Error("Generation failed: " + status + " - " + (data.data?.errorMessage || ""))
    }

    // SUCCESS = all tracks generated
    if (status === "SUCCESS" && sunoData.length > 0) {
      // Map sunoapi.org response to our expected clip format
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

    // FIRST_SUCCESS = first track done, second still generating — wait for full
    // PENDING / TEXT_SUCCESS = still in progress

    const elapsedSec = Math.round(elapsed / 1000)
    process.stdout.write("\r  " + c.dim + "[" + timestamp() + "]" + c.reset + " " + c.yellow + "..." + c.reset + " Waiting (" + elapsedSec + "s) - status: " + (status || "unknown") + "    ")

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

      // Step 4: Quality gates
      const qualityResults = []
      for (const relPath of downloadedFiles) {
        const absPath = resolve(config.outputDir, relPath)
        const qr = qualityCheck(absPath, track.category)
        qualityResults.push({ file: relPath, ...qr })
        if (qr.pass) {
          logOk(track.id + ": Quality PASS - " + relPath)
        } else {
          logWarn(track.id + ": Quality FAIL - " + relPath + " [" + qr.issues.join("; ") + "]")
        }
      }

      const passedFiles = qualityResults.filter(q => q.pass).map(q => q.file)
      const failedFiles = qualityResults.filter(q => !q.pass)

      // Step 5: Update manifest
      if (passedFiles.length > 0) {
        updateManifest(track, passedFiles, durations, completedSongs)
        logOk(track.id + ": Manifest updated with " + passedFiles.length + " file(s).")
      }

      // Track quality rejections in manifest
      if (failedFiles.length > 0) {
        const manifest = loadManifest()
        manifest.quality_rejected = manifest.quality_rejected || []
        for (const f of failedFiles) {
          manifest.quality_rejected.push({
            trackId: track.id,
            file: f.file,
            issues: f.issues,
            rejectedAt: new Date().toISOString(),
          })
        }
        saveManifest(manifest)
        logWarn(track.id + ": " + failedFiles.length + " file(s) quality-rejected.")
      }

      return {
        success: passedFiles.length > 0,
        files: passedFiles,
        qualityFailed: failedFiles.length,
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
    baseUrl: process.env.SUNO_API_URL || "https://api.sunoapi.org",
    batchSize: 2,
    outputDir: MUSIC_DIR,
    dryRun: false,
    trackId: null,
    ids: null,
    limit: null,
    category: null,
    pick: false,
    retryFailed: false,
    qualityCheck: false,
    regenRejected: false,
    maxRetries: 3,
    pollIntervalMs: 5000,
    pollTimeoutMs: 600000,
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
      case "--quality-check":
        options.qualityCheck = true; break
      case "--regen-rejected":
        options.regenRejected = true; break
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
  console.log("    " + c.cyan + "--quality-check" + c.reset + "       Validate existing files (no generation)")
  console.log("    " + c.cyan + "--regen-rejected" + c.reset + "      Re-generate quality-rejected tracks")
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

  // ── Quality check mode (validate existing files, no generation) ──────

  if (options.qualityCheck) {
    console.log("")
    console.log("  " + c.bold + "Quality Check Mode" + c.reset + " - Validating existing files...")
    console.log("")

    const manifest = loadManifest()
    const generated = manifest.generated_tracks || []
    let passed = 0, failed = 0
    const newRejections = []

    for (const entry of generated) {
      for (const relPath of entry.files || []) {
        const absPath = resolve(options.outputDir, relPath)
        if (!existsSync(absPath)) {
          logWarn(entry.trackId + ": File missing - " + relPath)
          failed++
          continue
        }
        const qr = qualityCheck(absPath, entry.category)
        if (qr.pass) {
          logOk(entry.trackId + ": PASS - " + relPath)
          passed++
        } else {
          logWarn(entry.trackId + ": FAIL - " + relPath + " [" + qr.issues.join("; ") + "]")
          failed++
          newRejections.push({
            trackId: entry.trackId,
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

    console.log("")
    console.log("  " + c.bold + "Results:" + c.reset + " " + c.green + passed + " passed" + c.reset + ", " + c.red + failed + " failed" + c.reset)
    if (newRejections.length > 0) {
      console.log("  " + c.yellow + newRejections.length + " new rejection(s) recorded in manifest." + c.reset)
    }
    console.log("")
    return
  }

  // ── Regen-rejected mode (re-generate quality-rejected tracks) ────────

  if (options.regenRejected) {
    const manifest = loadManifest()
    const rejected = manifest.quality_rejected || []
    if (rejected.length === 0) {
      console.log("")
      logOk("No quality-rejected tracks to re-generate.")
      console.log("")
      return
    }

    // Get unique track IDs from rejected list
    const rejectedIds = [...new Set(rejected.map(r => r.trackId))]
    console.log("")
    console.log("  " + c.bold + "Re-generating " + rejectedIds.length + " quality-rejected track(s):" + c.reset)
    for (const id of rejectedIds) {
      console.log("    " + c.cyan + id + c.reset)
    }
    console.log("")

    // Clear rejected entries for these tracks (they'll be re-evaluated after regen)
    manifest.quality_rejected = rejected.filter(r => !rejectedIds.includes(r.trackId))
    saveManifest(manifest)

    // Build track list and fall through to normal generation
    options.ids = rejectedIds
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
