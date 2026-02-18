import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createConsentRecord,
  revokeConsent,
  checkConsentStatus,
  isConsentRequired,
} from '@/lib/privacy/consent-manager'
import type { ConsentRecord, ConsentType } from '@/lib/privacy/consent-manager'

interface ConsentState {
  /** All consent records for this student */
  consents: ConsentRecord[]
  /** The student's age (set during onboarding) */
  studentAge?: number
  /** The student's local ID (used when no auth is available) */
  studentId: string

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Grant one or more consent types (parent or teacher grants) */
  grantConsent: (
    types: ConsentType[],
    consenterId: string,
    role: 'parent' | 'teacher',
  ) => void

  /** Revoke all active consents (right to withdraw) */
  revokeAllConsents: () => void

  /** Check whether a specific consent type is currently valid */
  hasConsent: (type: ConsentType) => boolean

  /** Returns true when the student age requires consent AND no valid consent exists */
  needsConsent: () => boolean

  /** Set or update the student's age */
  setStudentAge: (age: number) => void
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consents: [],
      studentAge: undefined,
      studentId: `local-${Date.now()}`,

      grantConsent: (types, consenterId, role) => {
        const { studentId, consents } = get()
        const newRecords = createConsentRecord(studentId, consenterId, role, types)
        set({ consents: [...consents, ...newRecords] })
      },

      revokeAllConsents: () => {
        const { consents } = get()
        const revoked = consents.map((r) => revokeConsent(r))
        set({ consents: revoked })
      },

      hasConsent: (type) => {
        const { consents } = get()
        const status = checkConsentStatus(consents)
        return status.consentTypes[type]
      },

      needsConsent: () => {
        const { studentAge, consents } = get()
        if (studentAge === undefined) return false
        if (!isConsentRequired(studentAge)) return false
        const status = checkConsentStatus(consents)
        return !status.hasParentalConsent
      },

      setStudentAge: (age) => set({ studentAge: age }),
    }),
    { name: 'ninja-keyboard-consent' },
  ),
)
