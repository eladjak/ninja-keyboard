import { notFound } from 'next/navigation'
import { LESSONS, getLessonById } from '@/lib/content/lessons'
import { getLessonContent } from '@/lib/content/sentences'
import { getShortcutLessonById } from '@/lib/content/shortcuts'
import { LessonPageClient } from './lesson-page-client'
import { ShortcutLessonPageClient } from './shortcut-lesson-page-client'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const lesson = getLessonById(id)

  if (!lesson) {
    notFound()
  }

  if (lesson.activity === 'shortcuts') {
    const shortcutLesson = getShortcutLessonById(lesson.id)
    if (!shortcutLesson) {
      notFound()
    }
    return (
      <ShortcutLessonPageClient
        lesson={lesson}
        shortcutLesson={shortcutLesson}
      />
    )
  }

  const content = getLessonContent(id)
  if (!content) {
    notFound()
  }

  return <LessonPageClient lesson={lesson} content={content} />
}

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ id: lesson.id }))
}
