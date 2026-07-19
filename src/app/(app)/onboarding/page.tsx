import { OnboardingClient } from './onboarding-client'

/**
 * Guest-first onboarding page. The client guard resumes returning guests at
 * placement or their recommended lesson after persisted state hydrates.
 */
export default function OnboardingPage() {
  return <OnboardingClient />
}
