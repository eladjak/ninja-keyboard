'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { FirstLessonMagic } from '@/components/onboarding/first-lesson-magic'

/**
 * Client component that hosts the FirstLessonMagic onboarding flow.
 * On completion, navigates to the lessons page.
 */
export function OnboardingClient() {
  const router = useRouter()

  const handleComplete = useCallback(
    (result: { xpEarned: number; wordsTyped: number }) => {
      // Result is already handled by FirstLessonMagic (XP added via store).
      // Navigate to lessons so the player can continue.
      void result
      router.push('/lessons')
    },
    [router],
  )

  return <FirstLessonMagic onComplete={handleComplete} />
}
