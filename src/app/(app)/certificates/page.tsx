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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">תעודות</h1>
          <p className="text-sm text-muted-foreground">
            {earnedCerts.length > 0
              ? `השגת ${earnedCerts.length} מתוך ${CERTIFICATES.length} תעודות`
              : 'התחל לתרגל כדי להשיג תעודות'}
          </p>
        </div>
        <Award className="size-8 text-primary" />
      </div>

      {/* Current highest certificate */}
      {highest && (
        <Card className="border-primary/30 bg-primary/5">
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
        <Card className="border-purple-500/30 bg-purple-50 dark:bg-purple-900/20">
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
