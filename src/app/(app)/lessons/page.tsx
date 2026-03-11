import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { LESSONS } from '@/lib/content/lessons'
import { LessonListClient } from './lesson-list-client'

export default function LessonsPage() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-6 p-4">
      <Image src="/images/backgrounds/dojo-bg.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />

      {/* Page header */}
      <div
        className="game-card-border flex items-center gap-3 p-4"
        style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
      >
        <Image
          src="/images/characters/model-sheets/sensei-zen.jpg"
          alt="Sensei Zen"
          width={52}
          height={52}
          className="rounded-full border-2 shadow-lg"
          style={{ borderColor: 'var(--game-accent-purple)', boxShadow: '0 0 12px var(--game-glow-purple)' }}
        />
        <BookOpen className="size-7" style={{ color: 'var(--game-accent-purple)' }} />
        <div>
          <h1 className="text-2xl font-bold text-glow">שיעורי הקלדה</h1>
          <p className="text-sm text-muted-foreground">
            20 שיעורים מדורגים - משורת הבית ועד מאסטר מקלדת
          </p>
        </div>
      </div>

      <LessonListClient lessons={LESSONS} />
    </div>
  )
}
