#!/usr/bin/env node

/**
 * Suno API Setup & Health Check - Ninja Keyboard
 *
 * Validates that the gcui-art/suno-api Docker container is running
 * and the Suno cookie is active with sufficient credits.
 *
 * Usage:
 *   node scripts/suno-setup.mjs
 *
 * Prerequisites:
 *   1. Docker installed and running
 *   2. Suno Premier account (app.suno.ai)
 *   3. Session cookie extracted from browser DevTools
 *
 * The script will:
 *   - Check if Docker is available
 *   - Check if the suno-api container is running
 *   - Test API connectivity
 *   - Verify the cookie is active
 *   - Show remaining credits
 */

import { execSync } from 'node:child_process'

// ─── Configuration ──────────────────────────────────────────────────────────

const SUNO_API_BASE = process.env.SUNO_API_URL || 'http://localhost:3000'
const CONTAINER_NAME = 'suno-api'
const DOCKER_IMAGE = 'gcui-art/suno-api'

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`)
}

function ok(msg) { log(`${c.green}[OK]${c.reset}`, msg) }
function fail(msg) { log(`${c.red}[FAIL]${c.reset}`, msg) }
function warn(msg) { log(`${c.yellow}[WARN]${c.reset}`, msg) }
function info(msg) { log(`${c.blue}[INFO]${c.reset}`, msg) }

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  } catch {
    return null
  }
}

async function fetchJSON(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${res.statusText}` }
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timeout)
    return { error: err.message }
  }
}

// ─── Checks ─────────────────────────────────────────────────────────────────

function checkDocker() {
  console.log('')
  info(`${c.bold}Step 1: Checking Docker...${c.reset}`)

  const dockerVersion = runCmd('docker --version')
  if (!dockerVersion) {
    fail('Docker is not installed or not in PATH.')
    console.log('')
    console.log(`  ${c.yellow}Install Docker Desktop:${c.reset}`)
    console.log(`    https://www.docker.com/products/docker-desktop/`)
    console.log('')
    return false
  }

  ok(`Docker found: ${c.dim}${dockerVersion}${c.reset}`)

  // Check if Docker daemon is running
  const dockerInfo = runCmd('docker info --format "{{.ServerVersion}}"')
  if (!dockerInfo) {
    fail('Docker daemon is not running. Start Docker Desktop first.')
    return false
  }

  ok(`Docker daemon running (server ${c.dim}v${dockerInfo}${c.reset})`)
  return true
}

function checkContainer() {
  console.log('')
  info(`${c.bold}Step 2: Checking suno-api container...${c.reset}`)

  // Check if container exists (running or stopped)
  const containerStatus = runCmd(`docker inspect --format="{{.State.Status}}" ${CONTAINER_NAME}`)

  if (!containerStatus) {
    warn(`Container "${CONTAINER_NAME}" does not exist.`)
    console.log('')
    console.log(`  ${c.bold}To start the suno-api container:${c.reset}`)
    console.log('')
    console.log(`  ${c.cyan}1. Get your Suno cookie:${c.reset}`)
    console.log(`     - Open ${c.bold}https://app.suno.ai${c.reset} and log in`)
    console.log(`     - Press ${c.bold}F12${c.reset} to open DevTools`)
    console.log(`     - Go to ${c.bold}Application${c.reset} > ${c.bold}Cookies${c.reset} > ${c.bold}https://clerk.suno.com${c.reset}`)
    console.log(`     - Find the cookie named ${c.bold}__client${c.reset}`)
    console.log(`     - Copy the ENTIRE value (it's very long)`)
    console.log('')
    console.log(`  ${c.cyan}2. Create a ${c.bold}.env${c.reset}${c.cyan} file in the project root:${c.reset}`)
    console.log(`     ${c.dim}echo "SUNO_COOKIE=your_cookie_value_here" > .env.suno${c.reset}`)
    console.log('')
    console.log(`  ${c.cyan}3. Run the container:${c.reset}`)
    console.log(`     ${c.bold}docker run -d --name ${CONTAINER_NAME} -p 3000:3000 \\`)
    console.log(`       --env-file .env.suno \\`)
    console.log(`       ${DOCKER_IMAGE}${c.reset}`)
    console.log('')
    console.log(`  ${c.cyan}Or with inline cookie:${c.reset}`)
    console.log(`     ${c.bold}docker run -d --name ${CONTAINER_NAME} -p 3000:3000 \\`)
    console.log(`       -e SUNO_COOKIE="<paste-cookie-here>" \\`)
    console.log(`       ${DOCKER_IMAGE}${c.reset}`)
    console.log('')
    return false
  }

  if (containerStatus === 'running') {
    ok(`Container "${CONTAINER_NAME}" is running.`)
    return true
  }

  if (containerStatus === 'exited' || containerStatus === 'created') {
    warn(`Container "${CONTAINER_NAME}" exists but is ${containerStatus}. Starting it...`)
    const startResult = runCmd(`docker start ${CONTAINER_NAME}`)
    if (startResult) {
      ok('Container started successfully.')
      // Give it a moment to initialize
      console.log(`  ${c.dim}Waiting 3 seconds for API to initialize...${c.reset}`)
      execSync('timeout /t 3 /nobreak >nul 2>&1 || sleep 3', { stdio: 'pipe' })
      return true
    } else {
      fail('Failed to start the container.')
      console.log(`  Try: ${c.bold}docker logs ${CONTAINER_NAME}${c.reset} to see what went wrong.`)
      return false
    }
  }

  fail(`Container "${CONTAINER_NAME}" is in unexpected state: ${containerStatus}`)
  return false
}

async function checkConnectivity() {
  console.log('')
  info(`${c.bold}Step 3: Testing API connectivity...${c.reset}`)

  // Simple health check - just try to reach the API
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${SUNO_API_BASE}/api/get_limit`, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      ok(`API is reachable at ${c.dim}${SUNO_API_BASE}${c.reset}`)
      return true
    }

    // Some error codes still mean the API is running
    if (res.status === 401 || res.status === 403) {
      warn(`API is reachable but returned ${res.status}. Cookie may be expired.`)
      return 'auth-error'
    }

    fail(`API returned ${res.status}: ${res.statusText}`)
    return false
  } catch (err) {
    fail(`Cannot connect to ${SUNO_API_BASE}`)
    console.log(`  ${c.dim}Error: ${err.message}${c.reset}`)
    console.log('')
    console.log(`  ${c.yellow}Possible causes:${c.reset}`)
    console.log(`    - Container is still starting up (wait a few seconds)`)
    console.log(`    - Port 3000 is used by another process`)
    console.log(`    - Container crashed (check: ${c.bold}docker logs ${CONTAINER_NAME}${c.reset})`)
    console.log('')
    return false
  }
}

async function checkCredits() {
  console.log('')
  info(`${c.bold}Step 4: Checking credits and cookie validity...${c.reset}`)

  const data = await fetchJSON(`${SUNO_API_BASE}/api/get_limit`)

  if (data.error) {
    fail(`Failed to get credit info: ${data.error}`)
    console.log('')
    console.log(`  ${c.yellow}Your cookie may have expired. To refresh:${c.reset}`)
    console.log(`    1. Open ${c.bold}https://app.suno.ai${c.reset} and log in`)
    console.log(`    2. Press ${c.bold}F12${c.reset} > Application > Cookies > clerk.suno.com`)
    console.log(`    3. Copy the ${c.bold}__client${c.reset} cookie value`)
    console.log(`    4. Restart the container with the new cookie:`)
    console.log(`       ${c.bold}docker rm -f ${CONTAINER_NAME}${c.reset}`)
    console.log(`       ${c.bold}docker run -d --name ${CONTAINER_NAME} -p 3000:3000 \\`)
    console.log(`         -e SUNO_COOKIE="<new-cookie>" \\`)
    console.log(`         ${DOCKER_IMAGE}${c.reset}`)
    console.log('')
    return false
  }

  // The API response format from gcui-art/suno-api
  const creditsLeft = data.credits_left ?? data.total_credits_left ?? data.remaining
  const monthlyLimit = data.monthly_limit ?? data.total_credits ?? data.period

  if (creditsLeft !== undefined) {
    ok(`Cookie is valid and active.`)
    console.log('')
    console.log(`  ${c.bold}Credit Status:${c.reset}`)

    if (monthlyLimit !== undefined) {
      const used = monthlyLimit - creditsLeft
      const pct = Math.round((creditsLeft / monthlyLimit) * 100)
      console.log(`    Remaining: ${c.bold}${c.green}${creditsLeft}${c.reset} / ${monthlyLimit} credits (${pct}%)`)
      console.log(`    Used:      ${used} credits this period`)
    } else {
      console.log(`    Remaining: ${c.bold}${c.green}${creditsLeft}${c.reset} credits`)
    }

    // Calculate how many tracks can be generated
    // Each generation costs 5 credits and produces 2 songs
    const possibleGenerations = Math.floor(creditsLeft / 5)
    const possibleTracks = possibleGenerations * 2
    console.log(`    Can generate: ~${c.bold}${possibleGenerations}${c.reset} requests (${c.bold}${possibleTracks}${c.reset} track variations)`)
    console.log('')

    if (creditsLeft < 50) {
      warn(`Low credits! Consider waiting for monthly reset.`)
    }

    return true
  }

  // If we got a response but couldn't parse credits, show raw data
  warn('Got API response but could not parse credit information.')
  console.log(`  ${c.dim}Raw response: ${JSON.stringify(data).slice(0, 200)}${c.reset}`)

  // Still consider it a success if we got a response (cookie is working)
  return true
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('')
  console.log(`${c.bold}${c.magenta}  SUNO API SETUP - Ninja Keyboard${c.reset}`)
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log(`  ${c.dim}Using gcui-art/suno-api as local proxy${c.reset}`)

  let allPassed = true

  // Step 1: Docker
  const dockerOk = checkDocker()
  if (!dockerOk) {
    allPassed = false
    printSummary(false, 'Docker not available')
    process.exit(1)
  }

  // Step 2: Container
  const containerOk = checkContainer()
  if (!containerOk) {
    allPassed = false
    printSummary(false, 'Container not running')
    process.exit(1)
  }

  // Step 3: Connectivity
  const connectOk = await checkConnectivity()
  if (!connectOk) {
    allPassed = false
    printSummary(false, 'API not reachable')
    process.exit(1)
  }
  if (connectOk === 'auth-error') {
    allPassed = false
    printSummary(false, 'Cookie expired')
    process.exit(1)
  }

  // Step 4: Credits
  const creditsOk = await checkCredits()
  if (!creditsOk) {
    allPassed = false
    printSummary(false, 'Cookie invalid or expired')
    process.exit(1)
  }

  printSummary(true)
}

function printSummary(success, reason) {
  console.log(`${c.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)

  if (success) {
    console.log('')
    console.log(`  ${c.green}${c.bold}ALL CHECKS PASSED${c.reset}`)
    console.log('')
    console.log(`  ${c.bold}Ready to generate music!${c.reset}`)
    console.log(`  Run: ${c.cyan}node scripts/suno-generate-batch.mjs${c.reset}`)
    console.log(`  Or:  ${c.cyan}node scripts/suno-generate-batch.mjs --dry-run${c.reset} (preview)`)
    console.log('')
  } else {
    console.log('')
    console.log(`  ${c.red}${c.bold}SETUP INCOMPLETE${c.reset}: ${reason}`)
    console.log('')
    console.log(`  ${c.yellow}Fix the issue above and run this script again.${c.reset}`)
    console.log('')
  }
}

main().catch(err => {
  console.error(`${c.red}Unexpected error: ${err.message}${c.reset}`)
  process.exit(1)
})
