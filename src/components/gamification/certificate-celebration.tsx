'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PartyPopper } from 'lucide-react'
import { ConfettiBurst } from '@/components/effects/confetti-burst'
import { NinjaCertificate } from '@/components/gamification/ninja-certificate'
import {
  type Certificate,
  detectNewCertificate,
} from '@/lib/gamification/certificate'
import { soundManager } from '@/lib/audio/sound-manager'
import { useSpeech } from '@/hooks/use-speech'
import { useSettingsStore } from '@/stores/settings-store'
import { useXpStore } from '@/stores/xp-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { useCertificateCelebrationStore } from '@/stores/certificate-celebration-store'

/**
 * Watches gamification progress and auto-surfaces a celebratory modal the moment
 * a new certificate milestone (bronze/silver/gold/platinum/ninja-master) is
 * earned — instead of the milestone only being visible if the kid happens to
 * open /certificates. Mounted once in the app shell. Each level celebrates once.
 */
export function CertificateCelebration() {
  const completedLessons = useXpStore((s) => s.completedLessons)
  const getBestWpm = usePracticeHistoryStore((s) => s.getBestWpm)
  const getBestAccuracy = usePracticeHistoryStore((s) => s.getBestAccuracy)
  const celebratedLevels = useCertificateCelebrationStore(
    (s) => s.celebratedLevels,
  )
  const markCelebrated = useCertificateCelebrationStore((s) => s.markCelebrated)
  const playerName = useSettingsStore((s) => s.playerName)
  const { speak, cancel } = useSpeech()

  const [active, setActive] = useState<Certificate | null>(null)
  // Guard so we don't fire on the very first hydration render before stores
  // have settled (avoids a spurious pop on page load for already-earned certs
  // that were earned in a prior session — those get marked silently).
  const hydratedRef = useRef(false)

  useEffect(() => {
    const stats = {
      bestWpm: getBestWpm(),
      bestAccuracy: getBestAccuracy(),
      lessonsCompleted: Object.keys(completedLessons).length,
    }
    const fresh = detectNewCertificate(stats, celebratedLevels)
    if (!fresh) return

    if (!hydratedRef.current) {
      // First settle pass: a certificate already qualifies from a prior session.
      // Mark it celebrated silently so we only pop for genuinely NEW milestones.
      hydratedRef.current = true
      markCelebrated(fresh.level)
      return
    }

    setActive(fresh)
    markCelebrated(fresh.level)
    soundManager.playLevelComplete()

    // Celebratory spoken Hebrew line (free Web Speech API). No-ops silently
    // when voice is off, sound is muted, reduced-motion is on, or no Hebrew
    // voice exists in this browser.
    const greeting = playerName.trim()
      ? `כל הכבוד ${playerName.trim()}! השגת ${fresh.titleHe}!`
      : `כל הכבוד! השגת ${fresh.titleHe}!`
    speak(greeting)
  }, [
    completedLessons,
    celebratedLevels,
    getBestWpm,
    getBestAccuracy,
    markCelebrated,
    playerName,
    speak,
  ])

  // Once we've run at least one effect, subsequent earns are "new".
  useEffect(() => {
    hydratedRef.current = true
  }, [])

  // Stars scale with milestone tier (bronze→1 … ninja-master→3).
  const STAR_BY_LEVEL: Record<Certificate['level'], number> = {
    bronze: 1,
    silver: 2,
    gold: 2,
    platinum: 3,
    'ninja-master': 3,
  }
  const stars = active ? STAR_BY_LEVEL[active.level] : 1

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-testid="certificate-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="הושגה תעודה חדשה"
        >
          <ConfettiBurst active count={40} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="game-card-border relative w-full max-w-md overflow-y-auto p-5"
            style={{ maxHeight: '90dvh', borderColor: 'oklch(0.495 0.205 292 / 45%)' }}
            dir="rtl"
          >
            <button
              onClick={() => {
                cancel()
                setActive(null)
              }}
              className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="סגור"
            >
              <X className="size-4" />
            </button>

            <div className="mb-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-2">
                <PartyPopper className="size-5 text-primary" />
                <h2 className="text-lg font-bold text-glow">השגת תעודה חדשה!</h2>
              </div>
              <p className="text-2xl">{active.emoji}</p>
              <p className="text-lg font-bold text-primary">{active.titleHe}</p>
              <p className="text-sm text-muted-foreground">{active.descriptionHe}</p>
            </div>

            <NinjaCertificate level={active.level} stars={stars} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
