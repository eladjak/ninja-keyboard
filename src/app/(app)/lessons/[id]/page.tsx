import { notFound } from 'next/navigation'
import { getLessonById } from '@/lib/content/lessons'
import { getLessonContent } from '@/lib/content/sentences'
import { LessonPageClient } from './lesson-page-client'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params
  const lesson = getLessonById(id)
  const content = getLessonContent(id)

  if (!lesson || !content) {
    notFound()
  }

  return <LessonPageClient lesson={lesson} content={content} />
}

export function generateStaticParams() {
  // Pre-generate all 20 lesson pages
  return Array.from({ length: 20 }, (_, i) => ({
    id: `lesson-${String(i + 1).padStart(2, '0')}`,
  }))
}
