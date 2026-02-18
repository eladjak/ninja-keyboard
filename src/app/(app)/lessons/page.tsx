import { BookOpen } from 'lucide-react'
import { LESSONS } from '@/lib/content/lessons'
import { LessonListClient } from './lesson-list-client'

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="flex items-center gap-3">
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
