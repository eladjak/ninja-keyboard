'use client'

import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { LESSONS } from '@/lib/content/lessons'
import { LessonListClient } from './lesson-list-client'
import { CharacterIdleWrapper } from '@/components/characters/character-idle-wrapper'

export default function LessonsPage() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-6 p-4">
      <Image src="/images/backgrounds/dojo-bg.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />

      {/* Page header */}
      <div
        className="game-card-border flex items-center gap-3 p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <BookOpen className="size-7" style={{ color: 'var(--game-accent-purple)' }} />
        <div>
          <h1 className="text-2xl font-bold text-glow">שיעורי הקלדה</h1>
          <p className="text-sm text-muted-foreground">
            20 שיעורים מדורגים - משורת הבית ועד מאסטר מקלדת
          </p>
        </div>
      </div>

      {/* Sensei Zen companion character */}
      <div className="flex justify-center">
        <CharacterIdleWrapper character="sensei" intensity="subtle" entryAnimation>
          <Image
            src="/images/characters/heroes/sensei-zen-hero.jpg"
            alt="סנסיי זן - מורה הדרך"
            width={220}
            height={220}
            className="rounded-2xl object-cover drop-shadow-[0_0_28px_rgba(250,211,144,0.5)]"
          />
        </CharacterIdleWrapper>
      </div>

      <LessonListClient lessons={LESSONS} />
    </div>
  )
}
