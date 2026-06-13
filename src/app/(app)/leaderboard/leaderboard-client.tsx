'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium'
import { generateMockLeaderboard } from '@/lib/leaderboard/leaderboard-utils'

export function LeaderboardClient() {
  const entries = useMemo(() => generateMockLeaderboard(20), [])

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Demo-data notice (honest label until real backend rankings ship).
          We do NOT fake a "current player" highlight here — the names below are
          illustrative examples, not real competitors, so nothing is marked "you". */}
      <p
        className="text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-center text-xs"
        role="note"
      >
        {'השמות כאן הם הדגמה בלבד 🏆 תחרות אמיתית בין שחקנים תיפתח יחד עם החשבונות — ואז תופיע כאן גם אתה!'}
      </p>

      {/* Podium card */}
      <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
        <CardHeader>
          <CardTitle className="text-glow flex items-center gap-2">
            <span className="text-xl">{'\uD83C\uDFC6'}</span>
            {'\u05DE\u05D5\u05D1\u05D9\u05DC\u05D9\u05DD'} {/* מובילים */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardPodium entries={entries} />
        </CardContent>
      </Card>

      {/* Full table card */}
      <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
        <CardHeader>
          <CardTitle className="text-glow flex items-center gap-2">
            <span className="text-xl">{'\uD83D\uDCCA'}</span>
            {'\u05D8\u05D1\u05DC\u05EA \u05D3\u05D9\u05E8\u05D5\u05D2'} {/* טבלת דירוג */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}
