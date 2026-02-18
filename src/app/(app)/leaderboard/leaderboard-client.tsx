'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium'
import { generateMockLeaderboard } from '@/lib/leaderboard/leaderboard-utils'

const CURRENT_PLAYER_ID = 'player-3'

export function LeaderboardClient() {
  const entries = useMemo(() => generateMockLeaderboard(20), [])

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Podium card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">{'\uD83C\uDFC6'}</span>
            {'\u05DE\u05D5\u05D1\u05D9\u05DC\u05D9\u05DD'} {/* מובילים */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardPodium entries={entries} />
        </CardContent>
      </Card>

      {/* Full table card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">{'\uD83D\uDCCA'}</span>
            {'\u05D8\u05D1\u05DC\u05EA \u05D3\u05D9\u05E8\u05D5\u05D2'} {/* טבלת דירוג */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} currentPlayerId={CURRENT_PLAYER_ID} />
        </CardContent>
      </Card>
    </div>
  )
}
