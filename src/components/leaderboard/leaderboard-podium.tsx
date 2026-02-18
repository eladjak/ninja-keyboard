'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getMedalEmoji } from '@/lib/leaderboard/leaderboard-utils'
import type { LeaderboardEntry } from '@/lib/leaderboard/leaderboard-utils'

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[]
}

const PODIUM_CONFIG = [
  { order: 1, rank: 2, height: 'h-28', delay: 0.2, label: '\u05DE\u05E7\u05D5\u05DD 2' }, // מקום 2
  { order: 0, rank: 1, height: 'h-36', delay: 0, label: '\u05DE\u05E7\u05D5\u05DD 1' }, // מקום 1
  { order: 2, rank: 3, height: 'h-20', delay: 0.4, label: '\u05DE\u05E7\u05D5\u05DD 3' }, // מקום 3
]

const PODIUM_COLORS: Record<number, string> = {
  1: 'bg-yellow-400/20 border-yellow-400',
  2: 'bg-gray-300/20 border-gray-400',
  3: 'bg-orange-400/20 border-orange-400',
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length < 3) return null

  // entries assumed sorted by rank, take top 3
  const top3 = entries.slice(0, 3)

  return (
    <div
      className="flex items-end justify-center gap-3 py-4"
      dir="rtl"
      role="list"
      aria-label={'\u05E4\u05D5\u05D3\u05D9\u05D5\u05DD'} // פודיום
    >
      {PODIUM_CONFIG.map(({ order, rank, height, delay, label }) => {
        // Display order: 2nd, 1st, 3rd — data index is rank-1
        const entry = top3[rank - 1]
        const medal = getMedalEmoji(rank)

        return (
          <motion.div
            key={entry.id}
            role="listitem"
            aria-label={`${label}: ${entry.name}`}
            className={cn(
              'flex flex-col items-center gap-1',
              order === 0 && 'order-2',
              order === 1 && 'order-1',
              order === 2 && 'order-3',
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay }}
          >
            {/* Avatar + medal */}
            <span className="text-3xl" data-testid={`podium-avatar-${rank}`}>
              {entry.avatarEmoji}
            </span>
            <span className="text-sm font-bold" data-testid={`podium-name-${rank}`}>
              {entry.name}
            </span>
            <span className="text-xs text-muted-foreground" data-testid={`podium-wpm-${rank}`}>
              {entry.wpm} {'\u05DE\u05DC"\u05D3'} {/* מל"ד */}
            </span>

            {/* Podium block */}
            <div
              className={cn(
                'w-20 rounded-t-lg border-t-2 flex items-center justify-center',
                height,
                PODIUM_COLORS[rank],
              )}
              data-testid={`podium-block-${rank}`}
            >
              <span className="text-2xl">{medal}</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
