import { redirect } from 'next/navigation'
import { OnboardingClient } from './onboarding-client'

/**
 * Onboarding page — server component wrapper.
 * Renders the FirstLessonMagic onboarding experience.
 * On completion, navigates the player to the lessons page.
 */
export default function OnboardingPage() {
  return <OnboardingClient />
}
