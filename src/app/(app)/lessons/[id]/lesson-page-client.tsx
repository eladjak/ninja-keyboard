'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, Trophy, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTypingSessionStore } from '@/stores/typing-session-store'
import { useXpStore } from '@/stores/xp-store'
import {
  computeSessionStats,
  isLessonComplete,
  calculateXpReward,
} from '@/lib/typing-engine/engine'
import { CHAR_TO_KEY } from '@/lib/typing-engine/keyboard-layout'
import type { LessonDefinition, LessonContent } from '@/lib/typing-engine/types'

interface LessonPageClientProps {
  lesson: LessonDefinition
  content: LessonContent
}

export function LessonPageClient({ lesson, content }: LessonPageClientProps) {
  const router = useRouter()
  const store = useTypingSessionStore()
  const xpStore = useXpStore()

  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [pressedKey, setPressedKey] = useState<string | undefined>()
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [finalStats, setFinalStats] = useState<ReturnType<
    typeof computeSessionStats
  > | null>(null)

  // Initialize session with first line
  useEffect(() => {
    if (content.lines.length > 0) {
      store.startSession(content.lines[0], lesson.id)
      xpStore.updateStreak()
    }
    return () => {
      store.endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string, code: string) => {
      if (!store.isActive || store.isPaused) return

      store.typeKey(key, code)

      // Visual feedback
      setPressedKey(key)
      setTimeout(() => setPressedKey(undefined), 100)

      const expected = store.text[store.currentIndex]
      const correct = key === expected
      setLastCorrect(correct)
      setTimeout(() => setLastCorrect(null), 200)
    },
    [store],
  )

  // Check if current line is complete
  useEffect(() => {
    if (!store.isActive) return
    if (store.currentIndex < store.text.length) return

    const nextIndex = currentLineIndex + 1

    if (nextIndex < content.lines.length) {
      // Move to next line
      setCurrentLineIndex(nextIndex)
      store.nextLine(content.lines[nextIndex])
    } else {
      // Lesson complete
      store.endSession()
      const stats = store.getStats()
      if (stats) {
        setFinalStats(stats)
        const completed = isLessonComplete(
          stats,
          lesson.targetWpm,
          lesson.targetAccuracy,
        )
        if (completed) {
          const reward = calculateXpReward(
            stats,
            lesson.targetWpm,
            lesson.targetAccuracy,
            xpStore.streak,
          )
          xpStore.addXp(reward.total)
          xpStore.completeLesson(lesson.id, stats.wpm, stats.accuracy)
        }
      }
      setShowResults(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentIndex, store.text.length])

  // Keyboard event listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!store.isActive || store.isPaused || showResults) return
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.key === 'Tab' || e.key === 'Escape') return

      // Allow space and printable characters
      if (e.key.length === 1 || e.key === ' ') {
        e.preventDefault()
        handleKeyPress(e.key, e.code)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [store.isActive, store.isPaused, showResults, handleKeyPress])

  const activeChar = store.isActive ? store.text[store.currentIndex] : undefined
  const activeKeyDef = activeChar ? CHAR_TO_KEY.get(activeChar) : undefined

  const stats = store.getStats()
  const realtimeWpm = store.getRealtimeWpm()
  const elapsed = store.startedAt ? performance.now() - store.startedAt : 0

  const handleRetry = () => {
    setCurrentLineIndex(0)
    setShowResults(false)
    setFinalStats(null)
    store.startSession(content.lines[0], lesson.id)
  }

  const handleNextLesson = () => {
    const nextLevel = lesson.level + 1
    if (nextLevel <= 20) {
      router.push(`/lessons/lesson-${String(nextLevel).padStart(2, '0')}`)
    } else {
      router.push('/lessons')
    }
  }

  const getStars = (stats: ReturnType<typeof computeSessionStats>): number => {
    const wpmRatio = stats.wpm / lesson.targetWpm
    const accRatio = stats.accuracy / lesson.targetAccuracy
    const avg = (wpmRatio + accRatio) / 2
    if (avg >= 1.3) return 3
    if (avg >= 1.0) return 2
    if (avg >= 0.7) return 1
    return 0
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg">
            {lesson.level}
          </Badge>
          <div>
            <h1 className="text-xl font-bold">{lesson.titleHe}</h1>
            <p className="text-sm text-muted-foreground">
              {lesson.descriptionHe}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>יעד: {lesson.targetWpm} מ/ד</span>
          <span>|</span>
          <span>{lesson.targetAccuracy}% דיוק</span>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{realtimeWpm || stats?.wpm || 0}</div>
          <div className="text-xs text-muted-foreground">מ/ד</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{stats?.accuracy ?? 100}%</div>
          <div className="text-xs text-muted-foreground">דיוק</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">{stats?.totalKeystrokes ?? 0}</div>
          <div className="text-xs text-muted-foreground">הקשות</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold">
            {Math.floor(elapsed / 60000)}:{String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">זמן</div>
        </Card>
      </div>

      {/* Progress bar for lines */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>שורה {currentLineIndex + 1} מתוך {content.lines.length}</span>
        <div className="h-2 flex-1 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-200"
            style={{
              width: `${((currentLineIndex + (store.currentIndex / Math.max(store.text.length, 1))) / content.lines.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Typing Area */}
      <Card className="min-h-[120px] p-6">
        <div className="text-2xl leading-relaxed" dir="rtl">
          {store.text.split('').map((char, i) => {
            let className = 'text-muted-foreground/40'
            if (i < store.currentIndex) {
              const keystroke = store.keystrokes[i]
              className = keystroke?.isCorrect
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            } else if (i === store.currentIndex) {
              className =
                'text-foreground bg-primary/20 border-b-2 border-primary'
            }
            return (
              <span key={i} className={className}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </div>
        {!store.isActive && !showResults && (
          <p className="mt-4 text-center text-muted-foreground">
            לחצו על מקש כלשהו כדי להתחיל...
          </p>
        )}
      </Card>

      {/* Finger hint */}
      {activeKeyDef && (
        <div className="text-center text-sm text-muted-foreground">
          {activeKeyDef.hand === 'right' ? 'יד ימין' : 'יד שמאל'} -{' '}
          {activeKeyDef.finger === 'pinky'
            ? 'זרת'
            : activeKeyDef.finger === 'ring'
              ? 'קמיצה'
              : activeKeyDef.finger === 'middle'
                ? 'אמה'
                : 'אצבע מורה'}
        </div>
      )}

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && finalStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mb-2 flex justify-center gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Star
                      key={i}
                      className={`size-8 ${
                        i < getStars(finalStats)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <CardTitle>
                  {isLessonComplete(
                    finalStats,
                    lesson.targetWpm,
                    lesson.targetAccuracy,
                  )
                    ? 'כל הכבוד! עברתם את השיעור!'
                    : 'נסיון טוב! נסו שוב'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">{finalStats.wpm}</div>
                    <div className="text-sm text-muted-foreground">
                      מילים לדקה
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {finalStats.accuracy}%
                    </div>
                    <div className="text-sm text-muted-foreground">דיוק</div>
                  </div>
                </div>

                {isLessonComplete(
                  finalStats,
                  lesson.targetWpm,
                  lesson.targetAccuracy,
                ) && (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Trophy className="size-5" />
                    <span className="font-bold">
                      +
                      {
                        calculateXpReward(
                          finalStats,
                          lesson.targetWpm,
                          lesson.targetAccuracy,
                          xpStore.streak,
                        ).total
                      }{' '}
                      XP
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleRetry}
                  >
                    <RotateCcw className="me-2 size-4" />
                    נסו שוב
                  </Button>
                  <Button className="flex-1" onClick={handleNextLesson}>
                    השיעור הבא
                    <ArrowRight className="ms-2 size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
