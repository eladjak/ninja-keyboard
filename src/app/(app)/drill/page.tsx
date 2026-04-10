'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, RotateCcw, Play, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypingArea } from '@/components/typing/typing-area'
import { SessionStats } from '@/components/typing/session-stats'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { generateDrillText, type DrillDifficulty } from '@/lib/typing-engine/drill-generator'
import { computeSessionStats } from '@/lib/typing-engine/engine'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeakKeyEntry {
  char: string
  accuracy: number
  total: number
}

type DrillPhase = 'setup' | 'active' | 'results'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_LABELS: Record<DrillDifficulty, string> = {
  easy: 'קל — תווים בודדים',
  medium: 'בינוני — מילים קצרות',
  hard: 'קשה — משפטים מלאים',
}

const DIFFICULTY_ORDER: DrillDifficulty[] = ['easy', 'medium', 'hard']

const MAX_WEAK_KEYS = 5

// ─── Accuracy badge ───────────────────────────────────────────────────────────

function accuracyColor(acc: number): string {
  if (acc >= 90) return 'text-green-400'
  if (acc >= 70) return 'text-yellow-400'
  return 'text-red-400'
}

function accuracyBg(acc: number): string {
  if (acc >= 90) return 'bg-green-900/30 border-green-700/50'
  if (acc >= 70) return 'bg-yellow-900/30 border-yellow-700/50'
  return 'bg-red-900/30 border-red-700/50'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WeakKeyBadge({
  entry,
  selected,
  onToggle,
}: {
  entry: WeakKeyEntry
  selected: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`מקש ${entry.char} — דיוק ${entry.accuracy}%. לחץ להוסיף לתרגיל`}
      className={cn(
        'relative flex flex-col items-center gap-1 rounded-xl border px-4 py-3 font-mono text-2xl font-bold transition-colors duration-150',
        selected
          ? 'border-[#6C5CE7] bg-[#6C5CE7]/20 text-white shadow-[0_0_12px_rgba(108,92,231,0.4)]'
          : cn('bg-[#12102a] hover:bg-[#1a1740]', accuracyBg(entry.accuracy)),
        !selected && accuracyColor(entry.accuracy),
      )}
    >
      <span>{entry.char}</span>
      <span className="text-xs font-normal tabular-nums text-muted-foreground">
        {entry.accuracy}%
      </span>
      {selected && (
        <motion.span
          layoutId={`sel-${entry.char}`}
          className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-[#6C5CE7] text-[10px] text-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  )
}

function DifficultyToggle({
  value,
  onChange,
}: {
  value: DrillDifficulty
  onChange: (d: DrillDifficulty) => void
}) {
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-[#2a2560] bg-[#0d0b1a]"
      role="radiogroup"
      aria-label="רמת קושי"
    >
      {DIFFICULTY_ORDER.map((d) => (
        <button
          key={d}
          role="radio"
          aria-checked={value === d}
          onClick={() => onChange(d)}
          className={cn(
            'flex-1 px-3 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]',
            value === d
              ? 'bg-[#6C5CE7] text-white'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {d === 'easy' ? 'קל' : d === 'medium' ? 'בינוני' : 'קשה'}
        </button>
      ))}
    </div>
  )
}

function ResultsPanel({
  stats,
  drillKeys,
  previousAccuracies,
  onRetry,
  onNewDrill,
}: {
  stats: { wpm: number; accuracy: number; durationMs: number }
  drillKeys: WeakKeyEntry[]
  previousAccuracies: Record<string, number>
  onRetry: () => void
  onNewDrill: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Summary */}
      <Card className="border-[#2a2560] bg-[#12102a]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Target className="size-4 text-[#6C5CE7]" />
            תוצאות התרגיל
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg bg-[#0d0b1a] py-3">
            <span className="text-2xl font-bold text-[#6C5CE7] tabular-nums">{stats.wpm}</span>
            <span className="text-xs text-muted-foreground">מילים/דקה</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-[#0d0b1a] py-3">
            <span className={cn('text-2xl font-bold tabular-nums', accuracyColor(stats.accuracy))}>
              {stats.accuracy}%
            </span>
            <span className="text-xs text-muted-foreground">דיוק</span>
          </div>
          <div className="col-span-2 flex flex-col items-center rounded-lg bg-[#0d0b1a] py-3 sm:col-span-1">
            <span className="text-2xl font-bold text-white tabular-nums">
              {Math.round(stats.durationMs / 1000)}ש
            </span>
            <span className="text-xs text-muted-foreground">משך</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-key improvement */}
      {drillKeys.length > 0 && (
        <Card className="border-[#2a2560] bg-[#12102a]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-white">
              <TrendingUp className="size-4 text-[#00B894]" />
              השוואה לפני/אחרי
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {drillKeys.map((k) => {
              const prev = previousAccuracies[k.char] ?? k.accuracy
              const improved = k.accuracy - prev
              return (
                <div
                  key={k.char}
                  className="flex flex-col items-center rounded-lg border border-[#2a2560] bg-[#0d0b1a] px-4 py-2"
                >
                  <span className="font-mono text-xl font-bold text-white">{k.char}</span>
                  <span className={cn('text-xs tabular-nums', accuracyColor(k.accuracy))}>
                    {k.accuracy}%
                  </span>
                  {improved !== 0 && (
                    <span
                      className={cn(
                        'mt-0.5 text-[10px] font-semibold tabular-nums',
                        improved > 0 ? 'text-[#00B894]' : 'text-red-400',
                      )}
                    >
                      {improved > 0 ? '+' : ''}
                      {improved}%
                    </span>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw className="size-4" />
          תרגל שוב
        </button>
        <button
          onClick={onNewDrill}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#2a2560] bg-[#12102a] px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          תרגיל חדש
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DrillPage() {
  const getProblematicKeys = usePracticeHistoryStore((s) => s.getProblematicKeys)

  const sessionText = useTypingSessionStore((s) => s.text)
  const currentIndex = useTypingSessionStore((s) => s.currentIndex)
  const keystrokes = useTypingSessionStore((s) => s.keystrokes)
  const isActive = useTypingSessionStore((s) => s.isActive)
  const startSession = useTypingSessionStore((s) => s.startSession)
  const typeKey = useTypingSessionStore((s) => s.typeKey)
  const endSession = useTypingSessionStore((s) => s.endSession)
  const getStats = useTypingSessionStore((s) => s.getStats)
  const startedAt = useTypingSessionStore((s) => s.startedAt)

  // ── Local state ──
  const [phase, setPhase] = useState<DrillPhase>('setup')
  const [weakKeys, setWeakKeys] = useState<WeakKeyEntry[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [difficulty, setDifficulty] = useState<DrillDifficulty>('medium')
  const [drillText, setDrillText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [finishedStats, setFinishedStats] = useState<{
    wpm: number
    accuracy: number
    durationMs: number
  } | null>(null)
  const [previousAccuracies, setPreviousAccuracies] = useState<Record<string, number>>({})
  const [showAllKeys, setShowAllKeys] = useState(false)

  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load weak keys from history on mount ──
  useEffect(() => {
    const keys = getProblematicKeys().slice(0, MAX_WEAK_KEYS)
    setWeakKeys(keys)
    // Pre-select all returned keys by default
    setSelectedKeys(new Set(keys.map((k) => k.char)))
  }, [getProblematicKeys])

  // ── Elapsed timer ──
  useEffect(() => {
    if (phase === 'active' && isActive && startedAt !== null) {
      elapsedTimer.current = setInterval(() => {
        setElapsed(performance.now() - startedAt)
      }, 250)
    } else {
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current)
        elapsedTimer.current = null
      }
    }
    return () => {
      if (elapsedTimer.current) clearInterval(elapsedTimer.current)
    }
  }, [phase, isActive, startedAt])

  // ── Detect drill completion (all chars typed) ──
  useEffect(() => {
    if (phase !== 'active') return
    if (drillText.length === 0) return
    if (currentIndex >= drillText.length) {
      handleDrillComplete()
    }
  }, [currentIndex, drillText, phase])

  // ── Handlers ──

  const handleToggleKey = useCallback((char: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(char)) {
        next.delete(char)
      } else {
        next.add(char)
      }
      return next
    })
  }, [])

  const handleStartDrill = useCallback(() => {
    const keys = Array.from(selectedKeys)
    if (keys.length === 0) return

    // Snapshot current accuracies for before/after comparison
    const snapshot: Record<string, number> = {}
    for (const k of weakKeys) {
      if (selectedKeys.has(k.char)) snapshot[k.char] = k.accuracy
    }
    setPreviousAccuracies(snapshot)

    const text = generateDrillText(keys, difficulty)
    setDrillText(text)
    setElapsed(0)
    setFinishedStats(null)
    startSession(text, 'drill')
    setPhase('active')
  }, [selectedKeys, difficulty, weakKeys, startSession])

  const handleDrillComplete = useCallback(() => {
    const stats = getStats()
    endSession()
    setPhase('results')
    if (stats) {
      setFinishedStats({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: stats.durationMs,
      })
    }
  }, [getStats, endSession])

  const handleRetry = useCallback(() => {
    const keys = Array.from(selectedKeys)
    const text = generateDrillText(keys, difficulty)
    setDrillText(text)
    setElapsed(0)
    setFinishedStats(null)
    startSession(text, 'drill')
    setPhase('active')
  }, [selectedKeys, difficulty, startSession])

  const handleNewDrill = useCallback(() => {
    endSession()
    setPhase('setup')
    setFinishedStats(null)
    setElapsed(0)
  }, [endSession])

  // ── Derived ──
  const visibleWeakKeys = showAllKeys ? weakKeys : weakKeys.slice(0, 5)

  const realtimeStats = phase === 'active' && isActive
    ? (() => {
        const s = getStats()
        return {
          wpm: s?.wpm ?? 0,
          accuracy: s?.accuracy ?? 100,
          keystrokes: keystrokes.length,
        }
      })()
    : { wpm: 0, accuracy: 100, keystrokes: 0 }

  // ── Render ──
  return (
    <main
      className="mx-auto max-w-2xl space-y-5 px-4 py-6"
      dir="rtl"
      lang="he"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#6C5CE7]/20 text-[#6C5CE7]">
          <Target className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">תרגיל מקשים חלשים</h1>
          <p className="text-xs text-muted-foreground">
            זיהינו את המקשים הקשים לך — נתרגל אותם עכשיו
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Setup phase ── */}
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Weak keys picker */}
            <Card className="border-[#2a2560] bg-[#12102a]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white">
                  בחר מקשים לתרגיל
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  אלה המקשים שהיה לך הכי קשה עם בפגישות קודמות
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {weakKeys.length === 0 ? (
                  <p className="rounded-lg border border-[#2a2560] bg-[#0d0b1a] p-4 text-center text-sm text-muted-foreground">
                    עדיין אין לנו מידע על מקשים חלשים.
                    <br />
                    תרגל קצת ואז בוא לכאן!
                  </p>
                ) : (
                  <>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="מקשים לבחירה לתרגיל"
                    >
                      {visibleWeakKeys.map((k) => (
                        <WeakKeyBadge
                          key={k.char}
                          entry={k}
                          selected={selectedKeys.has(k.char)}
                          onToggle={() => handleToggleKey(k.char)}
                        />
                      ))}
                    </div>

                    {weakKeys.length > 5 && (
                      <button
                        onClick={() => setShowAllKeys((v) => !v)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        aria-expanded={showAllKeys}
                      >
                        {showAllKeys ? (
                          <>
                            <ChevronUp className="size-3" />
                            הצג פחות
                          </>
                        ) : (
                          <>
                            <ChevronDown className="size-3" />
                            הצג עוד {weakKeys.length - 5} מקשים
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Difficulty selector */}
            <Card className="border-[#2a2560] bg-[#12102a]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white">רמת קושי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <DifficultyToggle value={difficulty} onChange={setDifficulty} />
                <p className="text-xs text-muted-foreground">
                  {DIFFICULTY_LABELS[difficulty]}
                </p>
              </CardContent>
            </Card>

            {/* Start button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={handleStartDrill}
              disabled={selectedKeys.size === 0}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-opacity',
                selectedKeys.size === 0
                  ? 'cursor-not-allowed bg-[#6C5CE7]/30 text-white/40'
                  : 'bg-[#6C5CE7] text-white hover:opacity-90',
              )}
              aria-disabled={selectedKeys.size === 0}
            >
              <Play className="size-5" />
              התחל תרגיל
              {selectedKeys.size > 0 && (
                <span className="ms-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {selectedKeys.size} מקשים
                </span>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* ── Active phase ── */}
        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Drill banner */}
            <div className="flex items-center justify-between rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 px-4 py-2">
              <span className="text-sm font-medium text-[#6C5CE7]">
                תרגיל פעיל — {difficulty === 'easy' ? 'קל' : difficulty === 'medium' ? 'בינוני' : 'קשה'}
              </span>
              <div className="flex gap-1">
                {Array.from(selectedKeys).map((char) => (
                  <span
                    key={char}
                    className="rounded bg-[#6C5CE7]/20 px-2 py-0.5 font-mono text-sm font-bold text-[#6C5CE7]"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats strip */}
            <SessionStats
              wpm={realtimeStats.wpm}
              accuracy={realtimeStats.accuracy}
              keystrokes={realtimeStats.keystrokes}
              elapsed={elapsed}
            />

            {/* Typing area */}
            <TypingArea
              text={drillText}
              currentIndex={currentIndex}
              keystrokes={keystrokes}
              isActive={isActive}
              onKeyPress={typeKey}
            />

            {/* Abandon button */}
            <button
              onClick={handleNewDrill}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2560] bg-transparent py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-4" />
              חזור לבחירה
            </button>
          </motion.div>
        )}

        {/* ── Results phase ── */}
        {phase === 'results' && finishedStats && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <ResultsPanel
              stats={finishedStats}
              drillKeys={weakKeys.filter((k) => selectedKeys.has(k.char))}
              previousAccuracies={previousAccuracies}
              onRetry={handleRetry}
              onNewDrill={handleNewDrill}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
