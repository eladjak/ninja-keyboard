'use client'

import { useMemo } from 'react'
import { Award, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CertificateCard } from '@/components/gamification/certificate-card'
import {
  CERTIFICATES,
  getEarnedCertificates,
  getHighestCertificate,
  getCertificateProgress,
} from '@/lib/gamification/certificate'
import { useXpStore } from '@/stores/xp-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { cn } from '@/lib/utils'

export default function CertificatesPage() {
  const { completedLessons } = useXpStore()
  const practiceHistory = usePracticeHistoryStore()

  const stats = useMemo(() => ({
    bestWpm: practiceHistory.getBestWpm(),
    bestAccuracy: practiceHistory.getBestAccuracy(),
    lessonsCompleted: Object.keys(completedLessons).length,
  }), [practiceHistory, completedLessons])

  const earnedCerts = useMemo(() => getEarnedCertificates(stats), [stats])
  const highest = useMemo(() => getHighestCertificate(stats), [stats])
  const earnedIds = new Set(earnedCerts.map((c) => c.id))

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4" dir="rtl">
      {/* Header */}
      <div className="game-card-border flex items-center justify-between p-4" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
        <div>
          <h1 className="text-xl font-bold text-glow sm:text-2xl">תעודות</h1>
          <p className="text-sm text-muted-foreground">
            {earnedCerts.length > 0
              ? `השגת ${earnedCerts.length} מתוך ${CERTIFICATES.length} תעודות`
              : 'התחל לתרגל כדי להשיג תעודות'}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: 'oklch(0.495 0.205 292 / 20%)', boxShadow: '0 0 12px oklch(0.495 0.205 292 / 30%)' }}>
          <Award className="size-5" style={{ color: 'var(--game-accent-purple)' }} />
        </div>
      </div>

      {/* Current highest certificate */}
      {highest && (
        <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)', background: 'oklch(0.495 0.205 292 / 8%)' }}>
          <CardContent className="flex items-center gap-4 px-4 py-4">
            <span className="text-5xl">{highest.emoji}</span>
            <div>
              <p className="text-sm text-muted-foreground">התעודה הגבוהה ביותר שלך</p>
              <p className="text-lg font-bold text-primary">{highest.titleHe}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All certificates */}
      <div className="space-y-3">
        {CERTIFICATES.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            earned={earnedIds.has(cert.id)}
            progress={getCertificateProgress(cert, stats)}
          />
        ))}
      </div>

      {/* Fun stat */}
      {earnedCerts.length === CERTIFICATES.length && (
        <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)', background: 'oklch(0.495 0.205 292 / 12%)' }}>
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <Trophy className="size-10 text-purple-600" />
            <p className="text-lg font-bold text-purple-600">כל התעודות הושגו!</p>
            <p className="text-sm text-muted-foreground">
              אתה מאסטר נינג׳ה אמיתי של ההקלדה!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
