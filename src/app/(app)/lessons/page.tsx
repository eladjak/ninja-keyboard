import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { LESSONS } from '@/lib/content/lessons'
import { LessonListClient } from './lesson-list-client'

export default function LessonsPage() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-6 p-4">
      <Image src="/images/backgrounds/dojo-bg.jpg" alt="" fill className="object-cover opacity-10 pointer-events-none fixed inset-0 -z-10" />
      <div className="flex items-center gap-3">
        <Image
          src="/images/characters/model-sheets/sensei-zen.jpg"
          alt="Sensei Zen"
          width={48}
          height={48}
          className="rounded-full border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
        />
        <BookOpen className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">שיעורי הקלדה</h1>
          <p className="text-sm text-muted-foreground">
            20 שיעורים מדורגים - משורת הבית ועד מאסטר מקלדת
          </p>
        </div>
      </div>

      <LessonListClient lessons={LESSONS} />
    </div>
  )
}
