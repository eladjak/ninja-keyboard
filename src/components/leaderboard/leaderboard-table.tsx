'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { cn, formatNumber } from '@/lib/utils'
import {
  AGE_GROUP_LABELS,
  getMedalEmoji,
  getLeaderboardTitle,
  rankLeaderboard,
} from '@/lib/leaderboard/leaderboard-utils'
import type {
  LeaderboardClassOption,
  LeaderboardEntry,
  LeaderboardCategory,
  LeaderboardFilters,
  TimeRange,
} from '@/lib/leaderboard/leaderboard-utils'
import type { AgeGroup } from '@/types/database'

const CATEGORIES: LeaderboardCategory[] = [
  'xp',
  'wpm',
  'improvement',
  'accuracy',
  'streak',
]

const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  wpm: '\u05DE\u05D4\u05D9\u05E8\u05D5\u05EA', // מהירות
  improvement: 'אלופי השיפור',
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
  category?: LeaderboardCategory
  onCategoryChange?: (category: LeaderboardCategory) => void
  filters?: LeaderboardFilters
  onFiltersChange?: (filters: LeaderboardFilters) => void
  classOptions?: LeaderboardClassOption[]
}

function getRankRowClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-950/30'
  if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/30'
  if (rank === 3) return 'bg-orange-50 dark:bg-orange-950/30'
  return ''
}

function getCategoryValue(
  entry: LeaderboardEntry,
  category: LeaderboardCategory,
): string {
  switch (category) {
    case 'wpm':
      return `${entry.wpm}`
    case 'improvement': {
      const wpmSign = entry.wpmImprovement > 0 ? '+' : ''
      const accuracySign = entry.accuracyImprovement > 0 ? '+' : ''
      return `${wpmSign}${entry.wpmImprovement} מל״ד · ${accuracySign}${entry.accuracyImprovement}%`
    }
    case 'accuracy':
      return `${entry.accuracy}%`
    case 'xp':
      return `${formatNumber(entry.xp)}`
    case 'streak':
      return `${entry.streak}`
  }
}

export function LeaderboardTable({
  entries,
  currentPlayerId,
  category: controlledCategory,
  onCategoryChange,
  filters: controlledFilters,
  onFiltersChange,
  classOptions: providedClassOptions,
}: LeaderboardTableProps) {
  const [internalCategory, setInternalCategory] =
    useState<LeaderboardCategory>('wpm')
  const [internalFilters, setInternalFilters] = useState<LeaderboardFilters>({})
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly')
  const category = controlledCategory ?? internalCategory
  const filters = controlledFilters ?? internalFilters

  const derivedClassOptions = useMemo(() => {
    const options = new Map<string, string>()
    for (const entry of entries) {
      if (entry.classId && entry.className)
        options.set(entry.classId, entry.className)
    }
    return [...options].map(([id, name]) => ({ id, name }))
  }, [entries])

  const classOptions = providedClassOptions ?? derivedClassOptions
  const sorted = useMemo(
    () => rankLeaderboard(entries, category, filters),
    [category, entries, filters],
  )

  function changeCategory(nextCategory: LeaderboardCategory) {
    setInternalCategory(nextCategory)
    onCategoryChange?.(nextCategory)
  }

  function changeFilters(nextFilters: LeaderboardFilters) {
    setInternalFilters(nextFilters)
    onFiltersChange?.(nextFilters)
  }

  const ageGroups = Object.keys(AGE_GROUP_LABELS) as AgeGroup[]

  return (
    <div className="space-y-4" dir="rtl">
      {/* Category tabs */}
      <Tabs
        value={category}
        onValueChange={(value) => changeCategory(value as LeaderboardCategory)}
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
            <div
              className="mb-2 text-lg font-bold"
              data-testid="leaderboard-title"
            >
              {getLeaderboardTitle(cat)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Read filters — the service and pending RPC apply the same values. */}
      <div
        className="grid gap-3 sm:grid-cols-2"
        role="group"
        aria-label="סינון דירוגים"
      >
        <div className="space-y-1">
          <span id="leaderboard-age-label" className="text-sm font-medium">
            קבוצת גיל
          </span>
          <Select
            value={filters.ageGroup ?? 'all'}
            onValueChange={(value) =>
              changeFilters({
                ...filters,
                ageGroup: value === 'all' ? null : (value as AgeGroup),
              })
            }
          >
            <SelectTrigger
              className="w-full"
              aria-labelledby="leaderboard-age-label"
              data-testid="filter-age"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">כל הגילים</SelectItem>
              {ageGroups.map((ageGroup) => (
                <SelectItem key={ageGroup} value={ageGroup}>
                  {AGE_GROUP_LABELS[ageGroup]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span id="leaderboard-class-label" className="text-sm font-medium">
            בית ספר / כיתה
          </span>
          <Select
            value={filters.classId ?? 'all'}
            onValueChange={(value) =>
              changeFilters({
                ...filters,
                classId: value === 'all' ? null : value,
              })
            }
          >
            <SelectTrigger
              className="w-full"
              aria-labelledby="leaderboard-class-label"
              data-testid="filter-class"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">כל הכיתות</SelectItem>
              {classOptions.map((classOption) => (
                <SelectItem key={classOption.id} value={classOption.id}>
                  {classOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
        <p
          className="py-8 text-center text-muted-foreground"
          data-testid="empty-state"
        >
          {
            '\u05D0\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05DC\u05D4\u05E6\u05D9\u05D2'
          }{' '}
          {/* אין נתונים להציג */}
        </p>
      ) : (
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              {/*
                No whitespace or trailing comments between these <TableHead>
                cells: a text node between <th> elements is an invalid child of
                <tr> and triggers a hydration error. Keep the tags tight.
              */}
              <TableRow>
                <TableHead>{'\u05D3\u05D9\u05E8\u05D5\u05D2'}</TableHead>
                <TableHead>{'\u05E9\u05DD'}</TableHead>
                <TableHead>{getLeaderboardTitle(category)}</TableHead>
                <TableHead>{'\u05D3\u05D9\u05D5\u05E7'}</TableHead>
                <TableHead>{'\u05E8\u05DE\u05D4'}</TableHead>
                <TableHead>{'\u05DE\u05D2\u05DE\u05D4'}</TableHead>
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
                        <span data-testid="medal">
                          {medal} {entry.rank}
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{entry.avatarEmoji}</span>
                        <span>{entry.name}</span>
                        {isCurrentPlayer && (
                          <Badge
                            variant="secondary"
                            data-testid="current-player-badge"
                          >
                            {'\u05D0\u05EA\u05D4'} {/* אתה */}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{getCategoryValue(entry, category)}</TableCell>
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
