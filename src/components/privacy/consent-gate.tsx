'use client'

import { useConsentStore } from '@/stores/consent-store'
import { ConsentForm } from './consent-form'

interface ConsentGateProps {
  children: React.ReactNode
  /** Age threshold for requiring consent. Defaults to 13 (COPPA/IL law). */
  requiredAge?: number
  /** Optional custom fallback instead of the default ConsentForm */
  fallback?: React.ReactNode
}

/**
 * ConsentGate
 *
 * Wraps protected content and blocks access until parental consent is given
 * for students under the required age threshold.
 *
 * - age < requiredAge AND no consent → show fallback (or ConsentForm)
 * - age >= requiredAge → render children directly
 * - age unknown → render children (consent not yet configured)
 */
export function ConsentGate({
  children,
  requiredAge = 13,
  fallback,
}: ConsentGateProps) {
  const studentAge = useConsentStore((s) => s.studentAge)
  const needsConsent = useConsentStore((s) => s.needsConsent)

  // Age not set yet – allow through (onboarding flow will set it)
  if (studentAge === undefined) {
    return <>{children}</>
  }

  // Old enough – no consent needed
  if (studentAge >= requiredAge) {
    return <>{children}</>
  }

  // Young student: check whether consent was already given
  if (!needsConsent()) {
    return <>{children}</>
  }

  // Consent required but not yet given
  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      role="main"
      aria-label="טופס הסכמת הורים"
    >
      {fallback ?? <ConsentForm />}
    </div>
  )
}
