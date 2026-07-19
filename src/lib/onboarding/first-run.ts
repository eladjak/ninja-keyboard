interface FirstRunProgress {
  onboardingCompleted: boolean
  placementCompleted: boolean
}

/**
 * Return the next required first-run route, or null when the guest is ready
 * for the normal dashboard. Kept pure so route guards share one policy.
 */
export function getFirstRunDestination({
  onboardingCompleted,
  placementCompleted,
}: FirstRunProgress): '/onboarding' | '/placement' | null {
  if (!onboardingCompleted) return '/onboarding'
  if (!placementCompleted) return '/placement'
  return null
}

/** Build a safe URL for the live lesson route (LessonPageClient). */
export function getRecommendedLessonHref(recommendedLesson: number): string {
  const lessonNumber = Number.isFinite(recommendedLesson)
    ? Math.min(20, Math.max(1, Math.round(recommendedLesson)))
    : 1

  return `/lessons/lesson-${String(lessonNumber).padStart(2, '0')}`
}
