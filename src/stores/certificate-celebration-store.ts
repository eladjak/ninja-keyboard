import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CertificateLevel } from '@/lib/gamification/certificate'

interface CertificateCelebrationState {
  /** Certificate levels whose milestone modal has already been shown. */
  celebratedLevels: CertificateLevel[]
  /** Mark a level as celebrated (idempotent). */
  markCelebrated: (level: CertificateLevel) => void
  /** Whether a level has already been celebrated. */
  hasCelebrated: (level: CertificateLevel) => boolean
}

export const useCertificateCelebrationStore =
  create<CertificateCelebrationState>()(
    persist(
      (set, get) => ({
        celebratedLevels: [],

        markCelebrated: (level) =>
          set((s) =>
            s.celebratedLevels.includes(level)
              ? s
              : { celebratedLevels: [...s.celebratedLevels, level] },
          ),

        hasCelebrated: (level) => get().celebratedLevels.includes(level),
      }),
      { name: 'ninja-keyboard-cert-celebrations' },
    ),
  )
