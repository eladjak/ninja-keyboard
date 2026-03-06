/**
 * AI Typing Engine — generates human-like keystrokes for rival characters.
 *
 * Core algorithm:
 * 1. Calculate base delay from WPM
 * 2. Apply Gaussian jitter (Box-Muller transform)
 * 3. Apply warmup / fatigue / special behavior modifiers
 * 4. Check for errors (adjacent-key, random, skip)
 * 5. Apply rubber-banding based on player position gap
 * 6. Emit keystroke event with calculated delay
 *
 * Each rival has a unique typing pattern that makes battles feel
 * like competing against a real kid, not a machine.
 */

import type {
  AITypingConfig,
  AIEngineState,
  AIKeystrokeEvent,
  AIMatchResult,
  RivalName,
  DifficultyLevel,
} from '@/types/ai-opponent'

// ── Hebrew Keyboard Adjacency Map ───────────────────────────────────

/** Map of Hebrew characters to their adjacent keys on a standard keyboard */
const HEBREW_ADJACENCY: Readonly<Record<string, readonly string[]>> = {
  'ש': ['ד', 'נ', 'ג'],
  'ד': ['ש', 'ג', 'כ'],
  'כ': ['ד', 'ע', 'ל'],
  'ל': ['כ', 'ח', 'ף'],
  'א': ['ת', 'ט', 'ם'],
  'ב': ['ה', 'נ', 'מ'],
  'ה': ['י', 'ב', 'ח'],
  'ו': ['ם', 'ת', 'ט'],
  'ת': ['א', 'ו', 'ץ'],
  'ר': ['ק', 'ע', 'ד'],
  'ק': ['ר', 'ש'],
  'ע': ['כ', 'ר', 'י'],
  'י': ['ע', 'ה', 'ח'],
  'ח': ['י', 'ל', 'ה'],
  'מ': ['ב', 'צ', 'נ'],
  'נ': ['ש', 'ב', 'מ'],
  'ג': ['ש', 'ד', 'כ'],
  'פ': ['ח', 'ל', 'ף'],
  'ט': ['א', 'ו', 'ז'],
  'צ': ['מ', 'ס', 'ז'],
  'ז': ['ט', 'צ', 'ס'],
  'ס': ['צ', 'ז', 'ב'],
  'ץ': ['ת', '.'],
  'ף': ['ל', 'פ'],
  'ך': ['כ', 'ל'],
  'ם': ['א', 'ו'],
  'ן': ['נ', 'ב'],
}

/** Hebrew final (sofit) letters that cause hesitation */
const SOFIT_LETTERS = new Set(['ץ', 'ף', 'ך', 'ם', 'ן'])

/** Common short Hebrew words that are typed faster (muscle memory) */
const COMMON_HEBREW_WORDS = new Set([
  'של', 'את', 'הוא', 'היא', 'על', 'עם', 'זה', 'זו', 'כי',
  'אם', 'לא', 'גם', 'כל', 'אל', 'בו', 'בה', 'מה', 'מי',
  'אני', 'הם', 'הן', 'יש', 'אין', 'או', 'כן',
])

/** All Hebrew letters for random error generation */
const ALL_HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'.split('')

// ── Utility Functions ───────────────────────────────────────────────

/**
 * Gaussian random number using Box-Muller transform.
 * Returns a value from a normal distribution with the given mean and stdDev.
 */
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  // Prevent log(0)
  const safeU1 = Math.max(u1, 1e-10)
  const z = Math.sqrt(-2 * Math.log(safeU1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * stdDev
}

/** Random number between min and max (inclusive) */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Random integer between min and max (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Extract the current word at a given index in the text.
 * Used to check word familiarity for burst typing.
 */
function getCurrentWord(text: string, index: number): string {
  let start = index
  let end = index

  // Walk backwards to find word start
  while (start > 0 && text[start - 1] !== ' ') {
    start--
  }
  // Walk forwards to find word end
  while (end < text.length && text[end] !== ' ') {
    end++
  }

  return text.slice(start, end)
}

/**
 * Get an adjacent error character for a given Hebrew character.
 * Falls back to a random Hebrew letter if no adjacency data exists.
 */
function getAdjacentErrorChar(targetChar: string): string {
  const neighbors = HEBREW_ADJACENCY[targetChar]
  if (neighbors && neighbors.length > 0) {
    return neighbors[Math.floor(Math.random() * neighbors.length)]
  }
  // Fallback: random Hebrew letter (not the correct one)
  const filtered = ALL_HEBREW_LETTERS.filter((c) => c !== targetChar)
  return filtered[Math.floor(Math.random() * filtered.length)] ?? targetChar
}

/**
 * Generate an error character based on the error type.
 */
function getErrorChar(
  targetChar: string,
  errorType: 'adjacent' | 'random' | 'skip',
): string {
  switch (errorType) {
    case 'adjacent':
      return getAdjacentErrorChar(targetChar)
    case 'random': {
      const filtered = ALL_HEBREW_LETTERS.filter((c) => c !== targetChar)
      return filtered[Math.floor(Math.random() * filtered.length)] ?? targetChar
    }
    case 'skip':
      // Skip the current character (type the next one instead)
      return targetChar
    default:
      return getAdjacentErrorChar(targetChar)
  }
}

// ── Special Behavior Modifiers ──────────────────────────────────────

/**
 * Apply pattern-specific delay modifications.
 * Each pattern creates a distinct "feel" during the battle.
 */
function applySpecialBehavior(
  config: AITypingConfig,
  state: AIEngineState,
  delay: number,
  elapsed: number,
): number {
  switch (config.pattern) {
    case 'steady':
      // Shadow: minimize variance, very consistent timing
      return clamp(delay, delay * 0.85, delay * 1.15)

    case 'burst-pause': {
      // Storm: random speed bursts then pauses
      if (state.inBurst) {
        const burstDelay = delay * 0.5
        state.burstRemaining--
        if (state.burstRemaining <= 0) {
          state.inBurst = false
        }
        return burstDelay
      }
      if (Math.random() < 0.08) {
        // Start a new burst (3-8 characters of fast typing)
        state.inBurst = true
        state.burstRemaining = randomInt(3, 8)
        return delay * 0.5
      }
      return delay
    }

    case 'burnout': {
      // Blaze: linear decay over time (starts fast, gets tired)
      const burnoutFactor = 1 + (elapsed / 60_000) * 0.04
      return delay * burnoutFactor
    }

    case 'accelerate': {
      // Virus: exponential speedup over time (starts slow, terrifying finish)
      const accelFactor = Math.max(0.4, 1 - (elapsed / 120_000) * 0.6)
      return delay * accelFactor
    }

    case 'chaotic': {
      // Bug: high variance, wildly unpredictable
      const chaos = Math.random()
      if (chaos < 0.3) return delay * 0.5      // Very fast
      if (chaos < 0.5) return delay * 1.8      // Very slow
      return delay                              // Normal
    }

    default:
      return delay
  }
}

/**
 * Apply rubber-banding based on the gap between AI and player positions.
 * Makes the match feel close without being obviously rigged.
 */
function applyRubberBanding(
  config: AITypingConfig,
  state: AIEngineState,
  delay: number,
  textLength: number,
): number {
  if (config.rubberBandStrength <= 0) return delay

  const gap = state.currentPosition - state.playerPosition

  // AI is leading by >15 chars: slow down (make a "natural" mistake)
  if (gap > 15) {
    const overageRatio = Math.min((gap - 15) / 20, 1)
    const slowdown = 1 + overageRatio * config.maxSpeedAdjustment * config.rubberBandStrength
    return delay * slowdown
  }

  // Player is leading by >10 chars: AI speeds up subtly
  if (gap < -10) {
    const deficitRatio = Math.min((-gap - 10) / 20, 1)
    const speedup = 1 - deficitRatio * config.maxSpeedAdjustment * config.rubberBandStrength
    return delay * Math.max(speedup, 1 - config.maxSpeedAdjustment)
  }

  // Tension builder: last 20% of text, AI speeds up 10% for close finish
  const progressRatio = state.currentPosition / textLength
  if (progressRatio > 0.8) {
    const tensionFactor = 1 - 0.1 * ((progressRatio - 0.8) / 0.2)
    return delay * tensionFactor
  }

  return delay
}

// ── Rival Preset Configurations ─────────────────────────────────────

/** Pre-built typing configurations for each rival character */
export const RIVAL_CONFIGS: Readonly<Record<RivalName, AITypingConfig>> = {
  shadow: {
    baseWPM: 37,
    wpmVariance: 0.08,
    errorRate: 0.04,
    correctionDelay: [150, 300],
    errorType: 'adjacent',
    burstProbability: 0.15,
    burstSpeedMultiplier: 1.2,
    pauseProbability: 0.05,
    pauseDuration: [200, 500],
    fatigueRate: 0.005,
    warmupDuration: 8,
    warmupMultiplier: 1.2,
    rubberBandStrength: 0.6,
    maxSpeedAdjustment: 0.12,
    pattern: 'steady',
  },
  storm: {
    baseWPM: 45,
    wpmVariance: 0.25,
    errorRate: 0.08,
    correctionDelay: [180, 400],
    errorType: 'adjacent',
    burstProbability: 0.45,
    burstSpeedMultiplier: 1.8,
    pauseProbability: 0.30,
    pauseDuration: [600, 2000],
    fatigueRate: 0.01,
    warmupDuration: 5,
    warmupMultiplier: 1.1,
    rubberBandStrength: 0.5,
    maxSpeedAdjustment: 0.15,
    pattern: 'burst-pause',
  },
  blaze: {
    baseWPM: 55,
    wpmVariance: 0.12,
    errorRate: 0.04,
    correctionDelay: [200, 500],
    errorType: 'adjacent',
    burstProbability: 0.20,
    burstSpeedMultiplier: 1.3,
    pauseProbability: 0.08,
    pauseDuration: [300, 700],
    fatigueRate: 0.04,
    warmupDuration: 0,
    warmupMultiplier: 1.0,
    rubberBandStrength: 0.4,
    maxSpeedAdjustment: 0.10,
    pattern: 'burnout',
  },
  yuki: {
    baseWPM: 75,
    wpmVariance: 0.05,
    errorRate: 0.015,
    correctionDelay: [60, 120],
    errorType: 'adjacent',
    burstProbability: 0.10,
    burstSpeedMultiplier: 1.15,
    pauseProbability: 0.03,
    pauseDuration: [150, 350],
    fatigueRate: 0.002,
    warmupDuration: 3,
    warmupMultiplier: 1.1,
    rubberBandStrength: 0.2,
    maxSpeedAdjustment: 0.05,
    pattern: 'steady',
  },
  bug: {
    baseWPM: 48,
    wpmVariance: 0.18,
    errorRate: 0.20,
    correctionDelay: [80, 180],
    errorType: 'random',
    burstProbability: 0.30,
    burstSpeedMultiplier: 1.4,
    pauseProbability: 0.10,
    pauseDuration: [200, 600],
    fatigueRate: 0.008,
    warmupDuration: 5,
    warmupMultiplier: 1.3,
    rubberBandStrength: 0.5,
    maxSpeedAdjustment: 0.12,
    pattern: 'chaotic',
  },
  virus: {
    baseWPM: 25,
    wpmVariance: 0.10,
    errorRate: 0.07,
    correctionDelay: [150, 350],
    errorType: 'adjacent',
    burstProbability: 0.10,
    burstSpeedMultiplier: 1.3,
    pauseProbability: 0.15,
    pauseDuration: [400, 1000],
    fatigueRate: -0.03,
    warmupDuration: 15,
    warmupMultiplier: 1.6,
    rubberBandStrength: 0.7,
    maxSpeedAdjustment: 0.20,
    pattern: 'accelerate',
  },
}

// ── Difficulty Scaling ──────────────────────────────────────────────

/** WPM scaling factors per difficulty level (1-5) */
const WPM_SCALE: Record<DifficultyLevel, number> = {
  1: 0.5,
  2: 0.7,
  3: 1.0,
  4: 1.2,
  5: 1.5,
}

/** Error rate scaling factors per difficulty level */
const ERROR_SCALE: Record<DifficultyLevel, number> = {
  1: 2.0,
  2: 1.5,
  3: 1.0,
  4: 0.7,
  5: 0.5,
}

/**
 * Scale a rival config to a given difficulty level.
 * Lower difficulty = slower AI with more errors.
 * Higher difficulty = faster AI with fewer errors.
 */
export function scaleToDifficulty(
  config: AITypingConfig,
  difficulty: DifficultyLevel,
): AITypingConfig {
  const wpmScale = WPM_SCALE[difficulty]
  const errorScale = ERROR_SCALE[difficulty]

  return {
    ...config,
    baseWPM: config.baseWPM * wpmScale,
    errorRate: Math.min(config.errorRate * errorScale, 0.35),
  }
}

// ── Core Engine ─────────────────────────────────────────────────────

/** Average Hebrew word length in characters (including spaces) */
const AVG_CHARS_PER_WORD = 5

/**
 * Create a fresh engine state for a new battle.
 */
export function createEngineState(): AIEngineState {
  return {
    startTime: Date.now(),
    currentPosition: 0,
    totalErrors: 0,
    totalCorrections: 0,
    pendingCorrection: null,
    recentlyCorrected: 0,
    inBurst: false,
    burstRemaining: 0,
    playerPosition: 0,
  }
}

/**
 * Calculate the delay until the next AI keystroke and determine
 * whether it will be correct or an error.
 *
 * This is the heart of the AI typing engine. It combines:
 * - Base WPM timing
 * - Gaussian jitter for human-like variance
 * - Warmup period (first N seconds slower)
 * - Fatigue simulation (gradual slowdown, or speedup for Virus)
 * - Pattern-specific behavior (burst-pause, burnout, etc.)
 * - Word familiarity (common words typed faster)
 * - Sofit letter hesitation
 * - Thinking pauses between words
 * - Rubber-banding based on player gap
 * - Post-error caution
 */
export function calculateNextKeystroke(
  config: AITypingConfig,
  state: AIEngineState,
  targetText: string,
  textLength: number,
): { delay: number; char: string; isError: boolean } {
  const currentIndex = state.currentPosition

  // If we're correcting a previous error, handle the correction sequence
  if (state.pendingCorrection !== null) {
    const correction = state.pendingCorrection
    state.pendingCorrection = null
    state.totalCorrections++
    state.recentlyCorrected = randomInt(2, 3) // slower for 2-3 chars after
    return {
      delay: correction.delay,
      char: correction.correctChar,
      isError: false,
    }
  }

  // 1. Base delay from WPM (average 5 chars per Hebrew word)
  const baseDelay = 60_000 / (config.baseWPM * AVG_CHARS_PER_WORD)

  // 2. Gaussian jitter (Box-Muller transform)
  const jitter = gaussianRandom(0, baseDelay * config.wpmVariance)
  let delay = baseDelay + jitter

  // 3. Warmup effect (first N seconds are slower)
  const elapsed = Date.now() - state.startTime
  if (config.warmupDuration > 0 && elapsed < config.warmupDuration * 1000) {
    const warmupProgress = elapsed / (config.warmupDuration * 1000)
    const warmupFactor = config.warmupMultiplier - (config.warmupMultiplier - 1) * warmupProgress
    delay *= warmupFactor
  }

  // 4. Fatigue effect (after 60 seconds)
  // Positive fatigueRate = slowdown (most chars), negative = speedup (Virus)
  if (elapsed > 60_000) {
    const fatigueMinutes = (elapsed - 60_000) / 60_000
    delay *= (1 + config.fatigueRate * fatigueMinutes)
  }

  // 5. Pattern-specific behavior modifiers
  delay = applySpecialBehavior(config, state, delay, elapsed)

  // 6. Word familiarity — common Hebrew words typed faster (muscle memory)
  const targetChar = targetText[currentIndex]
  if (targetChar !== undefined) {
    const currentWord = getCurrentWord(targetText, currentIndex)
    if (COMMON_HEBREW_WORDS.has(currentWord) && Math.random() < config.burstProbability) {
      delay *= (1 / config.burstSpeedMultiplier)
    }

    // 7. Sofit letter hesitation (final forms are harder to locate)
    if (SOFIT_LETTERS.has(targetChar)) {
      delay *= randomBetween(1.5, 3.0)
    }

    // 8. Thinking pause between words
    if (targetChar === ' ' && Math.random() < config.pauseProbability) {
      delay += randomBetween(config.pauseDuration[0], config.pauseDuration[1])
    }
  }

  // 9. Rubber-banding adjustment
  delay = applyRubberBanding(config, state, delay, textLength)

  // 10. Post-error caution (2-3 chars after correction are slower)
  if (state.recentlyCorrected > 0) {
    delay *= 1.2
    state.recentlyCorrected--
  }

  // 11. Error check
  const isError = Math.random() < config.errorRate
  let char = targetChar ?? ''

  if (isError && targetChar !== undefined) {
    char = getErrorChar(targetChar, config.errorType)
    state.totalErrors++
    // Schedule correction with human-like delay
    state.pendingCorrection = {
      delay: randomBetween(config.correctionDelay[0], config.correctionDelay[1]),
      correctChar: targetChar,
    }
  }

  // Minimum delay of 30ms to prevent unrealistic speed
  return { delay: Math.max(delay, 30), char, isError }
}

/**
 * Run the AI typing engine as an async generator.
 * Yields keystroke events with calculated delays.
 * Can be stopped by calling the returned abort controller.
 *
 * This approach avoids Web Workers (which have Next.js SSR complications)
 * and instead uses setTimeout chains on the main thread, which is
 * lightweight enough for a single opponent typing at human speed.
 */
export function createAITypingRunner(
  config: AITypingConfig,
  targetText: string,
  rubberBandEnabled: boolean,
  onKeystroke: (event: AIKeystrokeEvent) => void,
  onComplete: (result: AIMatchResult) => void,
): {
  start: () => void
  stop: () => void
  updatePlayerPosition: (position: number) => void
} {
  const state = createEngineState()
  const textLength = targetText.length
  let stopped = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // Apply rubber-banding settings
  const activeConfig: AITypingConfig = rubberBandEnabled
    ? config
    : { ...config, rubberBandStrength: 0 }

  function scheduleNext(): void {
    if (stopped || state.currentPosition >= textLength) {
      if (!stopped && state.currentPosition >= textLength) {
        const totalTime = Date.now() - state.startTime
        const finalWPM = Math.round(
          (state.currentPosition / AVG_CHARS_PER_WORD) / (totalTime / 60_000),
        )
        const totalKeystrokes = state.currentPosition + state.totalErrors
        const accuracy = totalKeystrokes > 0
          ? Math.round((state.currentPosition / totalKeystrokes) * 100)
          : 100

        onComplete({
          totalTime,
          finalWPM,
          accuracy,
          totalErrors: state.totalErrors,
          totalCorrections: state.totalCorrections,
        })
      }
      return
    }

    const result = calculateNextKeystroke(activeConfig, state, targetText, textLength)

    timeoutId = setTimeout(() => {
      if (stopped) return

      // Only advance position on correct keystrokes
      if (!result.isError) {
        state.currentPosition++
      }

      const elapsed = Date.now() - state.startTime
      const currentWPM = elapsed > 0
        ? Math.round((state.currentPosition / AVG_CHARS_PER_WORD) / (elapsed / 60_000))
        : 0

      onKeystroke({
        char: result.char,
        time: Date.now(),
        isError: result.isError,
        position: state.currentPosition,
        wpm: currentWPM,
      })

      scheduleNext()
    }, result.delay)
  }

  return {
    start: () => {
      state.startTime = Date.now()
      stopped = false
      scheduleNext()
    },
    stop: () => {
      stopped = true
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
    updatePlayerPosition: (position: number) => {
      state.playerPosition = position
    },
  }
}

// ── Rival Display Info ──────────────────────────────────────────────

/** Display metadata for each rival character */
export const RIVAL_DISPLAY: Readonly<Record<RivalName, {
  name: string
  nameHe: string
  emoji: string
  description: string
  image: string
  glowColor: string
  themeColor: string
}>> = {
  shadow: {
    name: 'Shadow',
    nameHe: 'צל',
    emoji: '🐱',
    description: 'הקלדה יציבה ומדויקת',
    image: '/images/characters/shadow.jpg',
    glowColor: 'rgba(99, 110, 114, 0.4)',
    themeColor: 'var(--blue, #74B9FF)',
  },
  storm: {
    name: 'Storm',
    nameHe: 'סערה',
    emoji: '🦊',
    description: 'פרצים בלתי צפויים',
    image: '/images/characters/storm.jpg',
    glowColor: 'rgba(9, 132, 227, 0.4)',
    themeColor: 'var(--cyan, #00CEC9)',
  },
  blaze: {
    name: 'Blaze',
    nameHe: 'להבה',
    emoji: '🐉',
    description: 'מתחיל חם, נשרף',
    image: '/images/characters/blaze.jpg',
    glowColor: 'rgba(214, 48, 49, 0.4)',
    themeColor: 'var(--red, #FF6B6B)',
  },
  yuki: {
    name: 'Yuki',
    nameHe: 'יוקי',
    emoji: '❄️',
    description: 'שותפת אימונים קשוחה',
    image: '/images/characters/model-sheets/yuki-model-sheet.jpg',
    glowColor: 'rgba(108, 92, 231, 0.4)',
    themeColor: 'var(--purple, #6C5CE7)',
  },
  bug: {
    name: 'Bug',
    nameHe: 'באג',
    emoji: '🐛',
    description: 'טעויות רבות, תיקונים מהירים',
    image: '/images/characters/model-sheets/bug-model-sheet.jpg',
    glowColor: 'rgba(0, 184, 148, 0.4)',
    themeColor: 'var(--green, #00B894)',
  },
  virus: {
    name: 'Virus',
    nameHe: 'וירוס',
    emoji: '☣️',
    description: 'מתחיל לאט, מאיץ בטירוף',
    image: '/images/characters/model-sheets/virus-model-sheet.jpg',
    glowColor: 'rgba(255, 107, 107, 0.35)',
    themeColor: 'var(--red, #FF6B6B)',
  },
}
