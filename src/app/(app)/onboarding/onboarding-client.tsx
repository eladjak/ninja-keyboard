'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import {
  GuestOnboarding,
  type GuestOnboardingResult,
} from '@/components/onboarding/guest-onboarding'
import { useHydrated } from '@/hooks/use-hydrated'
import { getRecommendedLessonHref } from '@/lib/onboarding/first-run'
import { pushUserTrack } from '@/lib/sync/progress-sync'
import { useConsentStore } from '@/stores/consent-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeStore } from '@/stores/theme-store'

/**
 * Guest-first onboarding host. Persisted guests skip completed steps after the
 * stores hydrate; fresh guests provide a name and age before placement.
 */
export function OnboardingClient() {
  const router = useRouter()
  const hydrated = useHydrated()
  const navigatingRef = useRef(false)
  const onboardingCompleted = useThemeStore(
    (state) => state.onboardingCompleted,
  )
  const placementCompleted = useThemeStore(
    (state) => state.placementCompleted,
  )
  const placementResult = useThemeStore((state) => state.placementResult)
  const completeOnboarding = useThemeStore(
    (state) => state.completeOnboarding,
  )
  const setAgeName = useThemeStore((state) => state.setAgeName)
  const setPlayerName = useSettingsStore((state) => state.setPlayerName)
  const setStudentAge = useConsentStore((state) => state.setStudentAge)

  useEffect(() => {
    if (!hydrated || navigatingRef.current || !onboardingCompleted) return

    if (!placementCompleted) {
      router.replace('/placement')
      return
    }

    router.replace(
      placementResult
        ? getRecommendedLessonHref(placementResult.recommendedLesson)
        : '/home',
    )
  }, [
    hydrated,
    onboardingCompleted,
    placementCompleted,
    placementResult,
    router,
  ])

  const handleComplete = useCallback(
    (result: GuestOnboardingResult) => {
      navigatingRef.current = true
      setPlayerName(result.playerName)
      setStudentAge(result.studentAge)
      setAgeName(result.ageName)
      completeOnboarding()
      // Guest mode resolves this as a network-free no-op. It remains ready for
      // the existing optional account sync without introducing an auth flow.
      void pushUserTrack({
        ageGroup: result.ageName,
        onboardingCompleted: true,
      })
      router.push('/placement')
    },
    [
      completeOnboarding,
      router,
      setAgeName,
      setPlayerName,
      setStudentAge,
    ],
  )

  if (!hydrated || onboardingCompleted) {
    return (
      <div
        className="flex min-h-[50dvh] items-center justify-center"
        role="status"
      >
        <p className="text-muted-foreground">מכינים את המסלול שלך…</p>
      </div>
    )
  }

  return <GuestOnboarding onComplete={handleComplete} />
}
