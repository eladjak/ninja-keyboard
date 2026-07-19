'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlacementTest } from '@/components/onboarding/placement-test'
import { getRecommendedLessonHref } from '@/lib/onboarding/first-run'
import { pushUserTrack } from '@/lib/sync/progress-sync'
import { useThemeStore } from '@/stores/theme-store'
import type { PlacementResult } from '@/lib/placement/placement-engine'

export function PlacementClient() {
  const router = useRouter()
  const completePlacement = useThemeStore(
    (state) => state.completePlacement,
  )

  const handleResult = useCallback(
    (result: PlacementResult) => {
      completePlacement(result)
      // Safe no-op for guests; preserves the existing optional sync boundary.
      void pushUserTrack({ placementResult: { ...result } })
    },
    [completePlacement],
  )

  const handleComplete = useCallback(
    (result: PlacementResult) => {
      router.push(getRecommendedLessonHref(result.recommendedLesson))
    },
    [router],
  )

  return <PlacementTest onResult={handleResult} onComplete={handleComplete} />
}
