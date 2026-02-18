'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { HebrewKeyboard } from '@/components/typing/hebrew-keyboard'
import { processKeystroke } from '@/lib/typing-engine/engine'
import { ALL_KEYS } from '@/lib/typing-engine/keyboard-layout'
import { computePlacementResult } from '@/lib/placement/placement-engine'
import { soundManager } from '@/lib/audio/sound-manager'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { Keystroke } from '@/lib/typing-engine/types'
import type { PlacementResult, Stage1Data, Stage2Data, Stage3Data } from '@/lib/placement/placement-engine'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────

/** Free-typing sentence for stage 1 */
const STAGE1_TEXT = 'הילד אוהב לשחק בגן ולקרוא ספרים'

/** Duration of each stage in milliseconds */
const STAGE_DURATION_MS = 30_000

/** Hebrew letters used for key identification in stage 2 */
const STAGE2_KEYS = ALL_KEYS
  .filter((k) => k.char !== ' ' && /[\u05D0-\u05EA]/.test(k.char))
  .map((k) => k.char)

/** Keyboard shortcuts for stage 3 */
const STAGE3_SHORTCUTS = [
  { display: 'Ctrl+C', keys: ['Control', 'c'], label: 'העתק' },
  { display: 'Ctrl+V', keys: ['Control', 'v'], label: 'הדבק' },
  { display: 'Ctrl+Z', keys: ['Control', 'z'], label: 'בטל' },
  { display: 'Alt+Tab', keys: ['Alt', 'Tab'], label: 'החלף חלון' },
]

/** Level display names in Hebrew */
const LEVEL_NAMES: Record<string, string> = {
  shatil:   'שתיל 🌱',
  nevet:    'נבט 🌿',
  geza:     'גזע 🌳',
  anaf:     'ענף 🍃',
  tzameret: 'צמרת 👑',
}

type Stage = 'intro' | 'stage1' | 'stage2' | 'stage3' | 'results'

// ── Component ────────────────────────────────────────────────────

interface PlacementTestProps {
  /** Called when the test is complete with results */
  onComplete?: (result: PlacementResult) => void
}

export function PlacementTest({ onComplete }: PlacementTestProps) {
  const addXp = useXpStore((s) => s.addXp)
  const { soundEnabled, soundVolume } = useSettingsStore()

  // Stage management
  const [stage, setStage] = useState<Stage>('intro')
  const [timeLeftMs, setTimeLeftMs] = useState(STAGE_DURATION_MS)

  // Stage 1 state
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [stage1Duration, setStage1Duration] = useState(STAGE_DURATION_MS)

  // Stage 2 state
  const [stage2Keys, setStage2Keys] = useState<string[]>([])
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0)
  const [knownKeys, setKnownKeys] = useState<string[]>([])
  const [awaitingKey, setAwaitingKey] = useState(false)
  const [stage2Feedback, setStage2Feedback] = useState<boolean | null>(null)

  // Stage 3 state
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0)
  const [knownShortcuts, setKnownShortcuts] = useState<string[]>([])
  const [shortcutPressed, setShortcutPressed] = useState<string[]>([])
  const [stage3Feedback, setStage3Feedback] = useState<boolean | null>(null)

  // Results
  const [result, setResult] = useState<PlacementResult | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stageRef = useRef<Stage>('intro')
  stageRef.current = stage

  // ── Sound sync ──────────────────────────────────────────────────
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
    soundManager.setVolume(soundVolume)
  }, [soundEnabled, soundVolume])

  // ── Timer management ────────────────────────────────────────────
  const startTimer = useCallback((durationMs: number, onExpire: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const startTime = Date.now()
    setTimeLeftMs(durationMs)

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, durationMs - elapsed)
      setTimeLeftMs(remaining)
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        onExpire()
      }
    }, 100)
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  // ── Stage transition helpers ─────────────────────────────────────
  const beginStage1 = useCallback(() => {
    setStage('stage1')
    setKeystrokes([])
    setCurrentIndex(0)
    setStartedAt(null)
    setStartedAt(performance.now())
    startTimer(STAGE_DURATION_MS, () => {
      setStage1Duration(STAGE_DURATION_MS)
      advanceToStage2()
    })
  }, [startTimer]) // eslint-disable-line react-hooks/exhaustive-deps

  const advanceToStage2 = useCallback(() => {
    // shuffle and take 10 keys
    const shuffled = [...STAGE2_KEYS].sort(() => Math.random() - 0.5).slice(0, 10)
    setStage2Keys(shuffled)
    setCurrentKeyIndex(0)
    setKnownKeys([])
    setAwaitingKey(true)
    setStage('stage2')
    startTimer(STAGE_DURATION_MS, () => advanceToStage3OrResults([]))
  }, [startTimer]) // eslint-disable-line react-hooks/exhaustive-deps

  const advanceToStage3OrResults = useCallback(
    (finalKnownKeys: string[]) => {
      clearTimer()
      // Determine level from stage1 to decide if stage3 is needed
      const s1data: Stage1Data = {
        keystrokes,
        durationMs: stage1Duration,
      }
      const s2data: Stage2Data = { knownKeys: finalKnownKeys }
      const tempResult = computePlacementResult(s1data, s2data, { knownShortcuts: [] })

      if (tempResult.level === 'geza' || tempResult.level === 'anaf' || tempResult.level === 'tzameret') {
        // Advanced users get stage 3
        setCurrentShortcutIndex(0)
        setKnownShortcuts([])
        setShortcutPressed([])
        setStage('stage3')
        startTimer(STAGE_DURATION_MS, () => finishTest(finalKnownKeys, []))
      } else {
        finishTest(finalKnownKeys, [])
      }
    },
    [clearTimer, keystrokes, stage1Duration, startTimer], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const finishTest = useCallback(
    (finalKnownKeys: string[], finalKnownShortcuts: string[]) => {
      clearTimer()
      const s1data: Stage1Data = { keystrokes, durationMs: stage1Duration }
      const s2data: Stage2Data = { knownKeys: finalKnownKeys }
      const s3data: Stage3Data = { knownShortcuts: finalKnownShortcuts }
      const finalResult = computePlacementResult(s1data, s2data, s3data)
      setResult(finalResult)
      setStage('results')
      soundManager.playLevelComplete()
      addXp(20)
      onComplete?.(finalResult)
    },
    [clearTimer, keystrokes, stage1Duration, addXp, onComplete],
  )

  // ── Stage 1 keyboard handler ─────────────────────────────────────
  const handleStage1Key = useCallback(
    (key: string, code: string) => {
      if (stageRef.current !== 'stage1') return
      if (currentIndex >= STAGE1_TEXT.length) return

      const expected = STAGE1_TEXT[currentIndex]
      const ks = processKeystroke(expected, key, code, performance.now())
      soundManager.playKeyClick()
      if (ks.isCorrect) soundManager.playCorrect()
      else soundManager.playError()

      setPressedKey(key)
      setLastCorrect(ks.isCorrect)
      setTimeout(() => setPressedKey(null), 150)

      setKeystrokes((prev) => [...prev, ks])
      setCurrentIndex((prev) => prev + 1)
    },
    [currentIndex],
  )

  // Attach keyboard listener for stage 1
  useEffect(() => {
    if (stage !== 'stage1') return

    function onKeyDown(e: KeyboardEvent) {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return
      if (e.key === ' ' || e.code === 'Space') e.preventDefault()
      handleStage1Key(e.key, e.code)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stage, handleStage1Key])

  // ── Stage 2 keyboard handler ─────────────────────────────────────
  useEffect(() => {
    if (stage !== 'stage2' || !awaitingKey) return
    if (currentKeyIndex >= stage2Keys.length) return

    const expectedChar = stage2Keys[currentKeyIndex]

    function onKeyDown(e: KeyboardEvent) {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return

      const isCorrect = e.key === expectedChar
      setStage2Feedback(isCorrect)
      soundManager.playKeyClick()
      if (isCorrect) soundManager.playCorrect()
      else soundManager.playError()
      setAwaitingKey(false)

      const nextKnown = isCorrect
        ? [...knownKeys, expectedChar]
        : knownKeys

      setTimeout(() => {
        setStage2Feedback(null)
        const nextIndex = currentKeyIndex + 1
        if (nextIndex >= stage2Keys.length) {
          advanceToStage3OrResults(nextKnown)
        } else {
          setKnownKeys(nextKnown)
          setCurrentKeyIndex(nextIndex)
          setAwaitingKey(true)
        }
      }, 400)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stage, awaitingKey, currentKeyIndex, stage2Keys, knownKeys, advanceToStage3OrResults])

  // ── Stage 3 keyboard handler ─────────────────────────────────────
  useEffect(() => {
    if (stage !== 'stage3') return
    if (currentShortcutIndex >= STAGE3_SHORTCUTS.length) return

    const shortcut = STAGE3_SHORTCUTS[currentShortcutIndex]
    const pressedSet = new Set(shortcutPressed)

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') e.preventDefault()
      const key = e.key
      if (!pressedSet.has(key)) {
        pressedSet.add(key)
        setShortcutPressed([...pressedSet])
      }

      // Check if shortcut is complete
      const allPressed = shortcut.keys.every((k) =>
        [...pressedSet].some((p) => p.toLowerCase() === k.toLowerCase()),
      )

      if (allPressed) {
        const nextKnown = [...knownShortcuts, shortcut.display]
        setStage3Feedback(true)
        soundManager.playCorrect()

        setTimeout(() => {
          setStage3Feedback(null)
          setShortcutPressed([])
          const nextIndex = currentShortcutIndex + 1
          if (nextIndex >= STAGE3_SHORTCUTS.length) {
            finishTest(knownKeys, nextKnown)
          } else {
            setKnownShortcuts(nextKnown)
            setCurrentShortcutIndex(nextIndex)
          }
        }, 400)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      // If user releases keys without completing, mark as not known after a delay
      const key = e.key
      pressedSet.delete(key)
      setShortcutPressed([...pressedSet])
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [stage, currentShortcutIndex, shortcutPressed, knownShortcuts, knownKeys, finishTest])

  // ── Progress percentage ──────────────────────────────────────────
  const progressPercent = Math.round(((STAGE_DURATION_MS - timeLeftMs) / STAGE_DURATION_MS) * 100)
  const timeLeftSecs = Math.ceil(timeLeftMs / 1000)

  // ── Render helpers ───────────────────────────────────────────────
  const activeKeyForStage2 = stage === 'stage2' && stage2Keys[currentKeyIndex]
    ? stage2Keys[currentKeyIndex]
    : undefined

  // ── UI ───────────────────────────────────────────────────────────

  return (
    <div
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6"
      dir="rtl"
    >
      <AnimatePresence mode="wait">

        {/* ── Intro Screen ── */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">
                  מבחן מיקום — נינג׳ה מקלדת
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-center">
                <p className="text-lg text-muted-foreground">
                  נגלה יחד איפה הכישרון שלך עומד!
                  <br />
                  שלושה שלבים קצרים של 30 שניות כל אחד.
                </p>

                <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-4 text-start">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">שלב 1</Badge>
                    <span>הקלד משפט בעברית — נמדוד מהירות ודיוק</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">שלב 2</Badge>
                    <span>זיהוי מקשים — נראה כמה אותיות אתה מכיר</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">שלב 3</Badge>
                    <span>קיצורי מקלדת — רק לתלמידים מתקדמים</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={beginStage1}
                  className="w-full text-lg"
                >
                  בואו נתחיל!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Stage 1: Free Typing ── */}
        {stage === 'stage1' && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <StageHeader
              stageNum={1}
              title="הקלד את המשפט"
              timeLeft={timeLeftSecs}
              progress={progressPercent}
            />

            {/* Text display */}
            <Card>
              <CardContent className="pt-6">
                <div
                  className="rounded-lg bg-muted/30 px-4 py-4"
                  role="textbox"
                  aria-readonly
                  aria-label="טקסט לתרגול"
                >
                  <p className="flex flex-wrap justify-start font-mono text-2xl leading-loose tracking-wider">
                    {STAGE1_TEXT.split('').map((char, index) => {
                      const isTyped = index < currentIndex
                      const isCurrent = index === currentIndex
                      const ks = keystrokes[index]
                      return (
                        <span
                          key={index}
                          className={cn(
                            'relative inline-block transition-colors duration-100',
                            isTyped && ks?.isCorrect && 'text-green-600 dark:text-green-400',
                            isTyped && !ks?.isCorrect && 'bg-red-200/60 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                            isCurrent && 'text-foreground',
                            !isTyped && !isCurrent && 'text-muted-foreground/40',
                          )}
                        >
                          {char === ' ' ? '\u00A0' : char}
                          {isCurrent && (
                            <motion.span
                              className="absolute bottom-0 start-0 h-0.5 w-full rounded-full bg-primary"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                          )}
                        </span>
                      )
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Visual keyboard */}
            <div className="flex justify-center">
              <HebrewKeyboard
                activeKey={STAGE1_TEXT[currentIndex]}
                pressedKey={pressedKey ?? undefined}
                lastCorrect={lastCorrect}
                showFingerColors
              />
            </div>
          </motion.div>
        )}

        {/* ── Stage 2: Key Identification ── */}
        {stage === 'stage2' && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <StageHeader
              stageNum={2}
              title="זיהוי מקשים"
              timeLeft={timeLeftSecs}
              progress={progressPercent}
            />

            <Card>
              <CardContent className="flex flex-col items-center gap-6 pt-6">
                <p className="text-muted-foreground">לחץ על האות:</p>

                {/* Large letter display */}
                <motion.div
                  key={stage2Keys[currentKeyIndex]}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className={cn(
                    'flex h-24 w-24 items-center justify-center rounded-2xl text-6xl font-bold',
                    'border-4 border-primary/30 bg-primary/10',
                    stage2Feedback === true && 'border-green-500 bg-green-100 dark:bg-green-900/30',
                    stage2Feedback === false && 'border-red-500 bg-red-100 dark:bg-red-900/30',
                  )}
                  aria-label={`לחץ על האות ${stage2Keys[currentKeyIndex]}`}
                >
                  {stage2Keys[currentKeyIndex]}
                </motion.div>

                {/* Progress dots */}
                <div className="flex gap-2" role="progressbar" aria-valuemax={stage2Keys.length} aria-valuenow={currentKeyIndex}>
                  {stage2Keys.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors duration-150',
                        i < currentKeyIndex ? 'bg-primary' : 'bg-muted',
                        i === currentKeyIndex && 'bg-primary/60',
                      )}
                    />
                  ))}
                </div>

                {/* Known count */}
                <p className="text-sm text-muted-foreground">
                  זיהית {knownKeys.length} מתוך {currentKeyIndex} אותיות
                </p>
              </CardContent>
            </Card>

            {/* Visual keyboard with highlighted key */}
            <div className="flex justify-center">
              <HebrewKeyboard
                activeKey={activeKeyForStage2}
                showFingerColors={false}
              />
            </div>
          </motion.div>
        )}

        {/* ── Stage 3: Shortcuts ── */}
        {stage === 'stage3' && (
          <motion.div
            key="stage3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <StageHeader
              stageNum={3}
              title="קיצורי מקלדת"
              timeLeft={timeLeftSecs}
              progress={progressPercent}
            />

            <Card>
              <CardContent className="flex flex-col items-center gap-6 pt-6">
                <p className="text-muted-foreground">
                  לחץ על הקיצור:&nbsp;
                  <strong>{STAGE3_SHORTCUTS[currentShortcutIndex]?.label}</strong>
                </p>

                {/* Shortcut display */}
                <motion.div
                  key={currentShortcutIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border-4 px-8 py-4',
                    'border-primary/30 bg-primary/10',
                    stage3Feedback === true && 'border-green-500 bg-green-100 dark:bg-green-900/30',
                  )}
                  aria-label={`לחץ ${STAGE3_SHORTCUTS[currentShortcutIndex]?.display}`}
                >
                  {STAGE3_SHORTCUTS[currentShortcutIndex]?.keys.map((k, i) => (
                    <span key={k} className="flex items-center gap-2">
                      <kbd
                        className={cn(
                          'rounded-lg border border-border bg-card px-3 py-1 font-mono text-xl shadow-sm',
                          shortcutPressed.some((p) => p.toLowerCase() === k.toLowerCase()) &&
                            'bg-primary text-primary-foreground',
                        )}
                      >
                        {k}
                      </kbd>
                      {i < (STAGE3_SHORTCUTS[currentShortcutIndex]?.keys.length ?? 0) - 1 && (
                        <span className="text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </motion.div>

                {/* Progress */}
                <div className="flex gap-2">
                  {STAGE3_SHORTCUTS.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors duration-150',
                        i < currentShortcutIndex ? 'bg-primary' : 'bg-muted',
                        i === currentShortcutIndex && 'bg-primary/60',
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => finishTest(knownKeys, knownShortcuts)}
                >
                  דלג על שלב זה
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Results ── */}
        {stage === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-3xl">
                  {LEVEL_NAMES[result.level] ?? result.level}
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  נמצאנו את הרמה שלך!
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="מהירות" value={`${result.wpm} WPM`} />
                  <StatCard label="דיוק" value={`${result.accuracy}%`} />
                  <StatCard label="מקשים ידועים" value={`${result.knownKeys.length}`} />
                  <StatCard
                    label="טכניקת אצבעות"
                    value={
                      result.fingerTechnique === 'full'
                        ? 'מלאה'
                        : result.fingerTechnique === 'partial'
                          ? 'חלקית'
                          : 'ללא'
                    }
                  />
                </div>

                {/* Recommendation */}
                <div className="rounded-xl bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">אנחנו ממליצים להתחיל מ</p>
                  <p className="text-xl font-bold text-primary">
                    שיעור {result.recommendedLesson}
                  </p>
                </div>

                {/* XP earned */}
                <motion.div
                  className="rounded-xl bg-yellow-100/60 p-3 text-center dark:bg-yellow-900/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    +20 XP על השלמת מבחן המיקום!
                  </p>
                </motion.div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => onComplete?.(result)}
                >
                  בואו נתחיל ללמוד!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────

interface StageHeaderProps {
  stageNum: number
  title: string
  timeLeft: number
  progress: number
}

function StageHeader({ stageNum, title, timeLeft, progress }: StageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-sm">
            שלב {stageNum} / 3
          </Badge>
          <span className="font-semibold">{title}</span>
        </div>
        <span
          className={cn(
            'font-mono text-lg font-bold tabular-nums',
            timeLeft <= 10 && 'text-red-500',
            timeLeft > 10 && 'text-muted-foreground',
          )}
          aria-live="polite"
          aria-label={`${timeLeft} שניות נותרו`}
        >
          {timeLeft}s
        </span>
      </div>
      <Progress
        value={progress}
        className="h-2"
        aria-label="התקדמות שלב"
      />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-muted/40 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  )
}
