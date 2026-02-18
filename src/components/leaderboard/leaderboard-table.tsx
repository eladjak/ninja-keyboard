'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  sortLeaderboard,
  assignRanks,
  getMedalEmoji,
  getLeaderboardTitle,
} from '@/lib/leaderboard/leaderboard-utils'
import type {
  LeaderboardEntry,
  LeaderboardCategory,
  TimeRange,
} from '@/lib/leaderboard/leaderboard-utils'

const CATEGORIES: LeaderboardCategory[] = ['wpm', 'accuracy', 'xp', 'streak']

const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  wpm: '\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA', // מהירות
  accuracy: '\u05D3\u05D9\u05D5\u05E7', // דיוק
  xp: '\u05E0\u05D9\u05E7\u05D5\u05D3', // ניקוד
  streak: '\u05E8\u05E6\u05E3', // רצף
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  daily: '\u05D9\u05D5\u05DE\u05D9', // יומי
  weekly: '\u05E9\u05D1\u05D5\u05E2\u05D9', // שבועי
  allTime: '\u05DB\u05DC \u05D4\u05D6\u05DE\u05E0\u05D9\u05DD', // כל הזמנים
}

const TIME_RANGES: TimeRange[] = ['daily', 'weekly', 'allTime']

const TREND_ICONS: Record<string, string> = {
  up: '\u2191', // ↑
  down: '\u2193', // ↓
  stable: '\u2013', // –
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentPlayerId?: string
}

function getRankRowClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950/30'
  if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/30'
  if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/30'
  return ''
}

function getCategoryValue(entry: LeaderboardEntry, category: LeaderboardCategory): string {
  switch (category) {
    case 'wpm':
      return `${entry.wpm}`
    case 'accuracy':
      return `${entry.accuracy}%`
    case 'xp':
      return `${entry.xp.toLocaleString()}`
    case 'streak':
      return `${entry.streak}`
  }
}

export function LeaderboardTable({ entries, currentPlayerId }: LeaderboardTableProps) {
  const [category, setCategory] = useState<LeaderboardCategory>('wpm')
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly')

  const sorted = assignRanks(sortLeaderboard(entries, category))

  return (
    <div className="space-y-4" dir="rtl">
      {/* Category tabs */}
      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as LeaderboardCategory)}
        dir="rtl"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} data-testid={`category-${cat}`}>
              {CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="mb-2 text-lg font-bold" data-testid="leaderboard-title">
              {getLeaderboardTitle(cat)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Time range selector */}
      <div className="flex gap-2" role="group" aria-label="טווח זמן">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setTimeRange(range)}
            data-testid={`time-${range}`}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {TIME_RANGE_LABELS[range]}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground" data-testid="empty-state">
          {'\u05D0\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DC\u05D4\u05E6\u05D9\u05D2'} {/* אין נתונים להציג */}
        </p>
      ) : (
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{'\u05D3\u05D9\u05E8\u05D5\u05D2'}</TableHead> {/* דירוג */}
                <TableHead>{'\u05E9\u05DD'}</TableHead> {/* שם */}
                <TableHead>{'\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA'}</TableHead> {/* מהירות */}
                <TableHead>{'\u05D3\u05D9\u05D5\u05E7'}</TableHead> {/* דיוק */}
                <TableHead>{'\u05E8\u05DE\u05D4'}</TableHead> {/* רמה */}
                <TableHead>{'\u05DE\u05D2\u05DE\u05D4'}</TableHead> {/* מגמה */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry) => {
                const medal = getMedalEmoji(entry.rank)
                const isCurrentPlayer = entry.id === currentPlayerId

                return (
                  <TableRow
                    key={entry.id}
                    data-testid={`row-${entry.id}`}
                    className={cn(
                      getRankRowClass(entry.rank),
                      isCurrentPlayer && 'ring-2 ring-primary ring-inset',
                    )}
                  >
                    <TableCell className="font-bold">
                      {medal ? (
                        <span data-testid="medal">{medal} {entry.rank}</span>
                      ) : (
                        entry.rank
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{entry.avatarEmoji}</span>
                        <span>{entry.name}</span>
                        {isCurrentPlayer && (
                          <Badge variant="secondary" data-testid="current-player-badge">
                            {'\u05D0\u05EA\u05D4'} {/* אתה */}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{getCategoryValue(entry, 'wpm')}</TableCell>
                    <TableCell>{getCategoryValue(entry, 'accuracy')}</TableCell>
                    <TableCell>{entry.level}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          entry.trend === 'up' && 'text-green-600',
                          entry.trend === 'down' && 'text-red-500',
                          entry.trend === 'stable' && 'text-muted-foreground',
                        )}
                      >
                        {TREND_ICONS[entry.trend]}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  )
}
