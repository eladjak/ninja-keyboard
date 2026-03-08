'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Lock, Play, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { CHARACTER_CONFIGS } from '@/lib/story/character-config'
import { useStoryStore } from '@/stores/story-store'
import { getAllChapterBeats } from '@/hooks/use-story-trigger'
import { StoryPlayer } from '@/components/story/story-player'
import type { DialogChoice, DialogStoryBeat, CharacterName } from '@/types/story'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract unique characters from a beat's dialog lines */
function getBeatCharacters(beat: DialogStoryBeat): CharacterName[] {
  const seen = new Set<CharacterName>()
  for (const line of beat.lines) {
    seen.add(line.character)
  }
  return [...seen]
}

/** Get a short Hebrew label for the beat's trigger type */
function getTriggerLabel(beat: DialogStoryBeat): string {
  switch (beat.trigger.type) {
    case 'lesson-complete':
      return `שיעור ${beat.trigger.lessonId.replace('lesson-', '')}`
    case 'wpm-milestone':
      return `${beat.trigger.wpm} מ/ד`
    case 'badge-earned':
      return 'תג הישג'
    case 'battle-result':
      return beat.trigger.result === 'win' ? 'ניצחון בקרב' : 'הפסד בקרב'
    case 'streak':
      return `רצף ${beat.trigger.days} ימים`
    case 'manual':
      return 'סיפור בונוס'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StoryPage() {
  const seenDialogBeats = useStoryStore((s) => s.seenDialogBeats)
  const recordDialogChoice = useStoryStore((s) => s.recordDialogChoice)

  const [replayingBeat, setReplayingBeat] = useState<DialogStoryBeat | null>(
    null,
  )
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1)

  const chapters = getAllChapterBeats()

  const handleReplay = useCallback((beat: DialogStoryBeat) => {
    setReplayingBeat(beat)
  }, [])

  const handleReplayComplete = useCallback(() => {
    setReplayingBeat(null)
  }, [])

  const handleChoice = useCallback(
    (lineId: string, choice: DialogChoice) => {
      if (replayingBeat) {
        recordDialogChoice(replayingBeat.id, lineId, choice)
      }
    },
    [replayingBeat, recordDialogChoice],
  )

  const toggleChapter = useCallback(
    (chapter: number) => {
      setExpandedChapter(expandedChapter === chapter ? null : chapter)
    },
    [expandedChapter],
  )

  return (
    <div className="relative mx-auto max-w-2xl space-y-6 p-4" dir="rtl">
      {/* Background */}
      <Image
        src="/images/backgrounds/dojo-bg.jpg"
        alt=""
        fill
        className="pointer-events-none fixed inset-0 -z-10 object-cover opacity-10"
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">ספר הסיפור</h1>
          <p className="text-sm text-muted-foreground">
            צפו מחדש בסצנות שכבר חוויתם במסע הנינג&apos;ה
          </p>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-4">
        {chapters.map(({ chapter, titleHe, beats }) => {
          const isExpanded = expandedChapter === chapter
          const seenCount = beats.filter(
            (b) => seenDialogBeats[b.id],
          ).length

          return (
            <div
              key={chapter}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
            >
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter)}
                className={cn(
                  'flex w-full items-center justify-between p-4',
                  'text-start transition-colors duration-150',
                  'hover:bg-white/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-accent-purple)]/50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--game-accent-purple), var(--game-accent-green))',
                    }}
                  >
                    {chapter}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">
                      פרק {chapter}: {titleHe}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {seenCount} / {beats.length} סצנות נצפו
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>

              {/* Chapter beats */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 px-4 pb-4">
                      {beats.map((beat) => {
                        const isSeen = seenDialogBeats[beat.id] === true
                        const characters = getBeatCharacters(beat)
                        const triggerLabel = getTriggerLabel(beat)

                        return (
                          <div
                            key={beat.id}
                            className={cn(
                              'flex items-center gap-3 rounded-lg p-3',
                              'border transition-colors duration-150',
                              isSeen
                                ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                : 'border-white/5 bg-black/20 opacity-60',
                            )}
                          >
                            {/* Character avatars */}
                            <div className="flex -space-x-2 space-x-reverse">
                              {characters.slice(0, 3).map((char) => {
                                const config = CHARACTER_CONFIGS[char]
                                return (
                                  <div
                                    key={char}
                                    className={cn(
                                      'relative size-8 overflow-hidden rounded-full border-2',
                                      isSeen
                                        ? 'border-white/20'
                                        : 'border-white/5 grayscale',
                                    )}
                                  >
                                    <Image
                                      src={config.image}
                                      alt={config.nameHe}
                                      fill
                                      className="object-cover"
                                      sizes="32px"
                                    />
                                  </div>
                                )
                              })}
                              {characters.length > 3 && (
                                <div className="flex size-8 items-center justify-center rounded-full border-2 border-white/10 bg-black/40 text-xs text-white/60">
                                  +{characters.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Beat info */}
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'truncate text-sm font-medium',
                                  isSeen
                                    ? 'text-white/90'
                                    : 'text-white/40',
                                )}
                              >
                                {isSeen
                                  ? beat.lines[0]?.text.slice(0, 50) +
                                    (beat.lines[0]?.text.length > 50
                                      ? '...'
                                      : '')
                                  : '???'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {triggerLabel} &middot; {beat.lines.length}{' '}
                                שורות
                              </p>
                            </div>

                            {/* Play / Lock button */}
                            {isSeen ? (
                              <button
                                onClick={() => handleReplay(beat)}
                                className={cn(
                                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                  'bg-[var(--game-accent-purple)]/20 text-[var(--game-accent-purple)]',
                                  'transition-colors duration-150',
                                  'hover:bg-[var(--game-accent-purple)]/30',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-accent-purple)]/50',
                                )}
                                aria-label="הפעל מחדש"
                              >
                                <Play className="size-4" />
                              </button>
                            ) : (
                              <div
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/20"
                                aria-label="נעול"
                              >
                                <Lock className="size-4" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Story Player Overlay for replay */}
      <AnimatePresence>
        {replayingBeat && (
          <StoryPlayer
            key={replayingBeat.id}
            beat={replayingBeat}
            onComplete={handleReplayComplete}
            onChoice={handleChoice}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
