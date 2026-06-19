'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium'
import { fetchLeaderboard } from '@/lib/leaderboard/leaderboard-service'
import type { LeaderboardEntry } from '@/lib/leaderboard/leaderboard-utils'

export function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isReal, setIsReal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLeaderboard(20).then((result) => {
      if (cancelled) return
      if (result.isOk()) {
        setEntries(result.value.entries)
        setIsReal(result.value.isReal)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      {/* Data-source notice: honest about whether scores are real or demo.
          When Supabase is configured and users exist, isReal=true and the
          notice changes to indicate live standings. */}
      {!loading && (
        <p
          className="text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-center text-xs"
          role="note"
          data-testid="leaderboard-notice"
        >
          {isReal
            ? '🏆 אלה הדירוגים האמיתיים של השחקנים!'
            : 'השמות כאן הם הדגמה בלבד 🏆 תחרות אמיתית בין שחקנים תיפתח יחד עם החשבונות — ואז תופיע כאן גם אתה!'}
        </p>
      )}

      {loading ? (
        <div className="py-8 text-center text-muted-foreground" data-testid="loading-state">
          {'טוען דירוגים...'}
        </div>
      ) : (
        <>
          {/* Podium card */}
          <Card className="game-card-border" style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}>
            <CardHeader>
              <CardTitle className="text-glow flex items-center gap-2">
                <span className="text-xl">{'🏆'}</span>
                {'מובילים'} {/* מובילים */}
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
                <span className="text-xl">{'📊'}</span>
                {'טבלת דירוג'} {/* טבלת דירוג */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={entries} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
