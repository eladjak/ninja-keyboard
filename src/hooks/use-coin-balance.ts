'use client'

import { useMemo } from 'react'
import { LESSONS } from '@/lib/content'
import { totalStarsEarned } from '@/lib/typing-engine/stars'
import {
  accentColorFor,
  coinBalance,
  coinsFromStars,
} from '@/lib/gamification/coins'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'

export interface CoinBalanceState {
  /** Lifetime stars earned (deterministic from best results per lesson). */
  totalStars: number
  /** Lifetime coins earned from those stars. */
  earned: number
  /** Spendable balance = earned − spent. */
  balance: number
  /** Equipped accent cosmetic id. */
  equippedAccent: string
  /** Resolved hex color for the equipped accent. */
  accentColor: string
}

/**
 * Shared coin/accent derivation used by the shop, the header coin badge, and any
 * other surface that needs the live balance or the equipped accent color.
 *
 * Coins are derived (not stored) from stars, so this stays the single source of
 * truth and avoids the shop and header drifting apart.
 */
export function useCoinBalance(): CoinBalanceState {
  const completedLessons = useXpStore((s) => s.completedLessons)
  const coinsSpent = useSettingsStore((s) => s.coinsSpent)
  const equippedAccent = useSettingsStore((s) => s.equippedAccent)

  const totalStars = useMemo(() => {
    const inputs = LESSONS.flatMap((lesson) => {
      const data = completedLessons[lesson.id]
      if (!data) return []
      return [
        {
          bestWpm: data.bestWpm,
          bestAccuracy: data.bestAccuracy,
          targetWpm: lesson.targetWpm,
          targetAccuracy: lesson.targetAccuracy,
        },
      ]
    })
    return totalStarsEarned(inputs)
  }, [completedLessons])

  return {
    totalStars,
    earned: coinsFromStars(totalStars),
    balance: coinBalance(totalStars, coinsSpent),
    equippedAccent,
    accentColor: accentColorFor(equippedAccent),
  }
}
