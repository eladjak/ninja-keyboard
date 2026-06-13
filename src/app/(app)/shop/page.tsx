'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Check, Lock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LESSONS } from '@/lib/content'
import { totalStarsEarned } from '@/lib/typing-engine/stars'
import {
  COSMETICS,
  coinBalance,
  coinsFromStars,
  evaluatePurchase,
  isUnlocked,
  type CosmeticItem,
} from '@/lib/gamification/coins'
import { soundManager } from '@/lib/audio/sound-manager'
import { useXpStore } from '@/stores/xp-store'
import { useSettingsStore } from '@/stores/settings-store'
import { cn } from '@/lib/utils'

export default function ShopPage() {
  const completedLessons = useXpStore((s) => s.completedLessons)
  const coinsSpent = useSettingsStore((s) => s.coinsSpent)
  const unlockedCosmetics = useSettingsStore((s) => s.unlockedCosmetics)
  const equippedAccent = useSettingsStore((s) => s.equippedAccent)
  const purchaseCosmetic = useSettingsStore((s) => s.purchaseCosmetic)
  const equipAccent = useSettingsStore((s) => s.equipAccent)

  const [flash, setFlash] = useState<string | null>(null)

  // Total stars are derived deterministically from best results per lesson.
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

  const earned = coinsFromStars(totalStars)
  const balance = coinBalance(totalStars, coinsSpent)

  function handleBuy(item: CosmeticItem) {
    const result = evaluatePurchase({
      itemId: item.id,
      ownedIds: unlockedCosmetics,
      totalStars,
      coinsSpent,
    })
    if (!result.ok) {
      if (result.error === 'insufficient-funds') {
        setFlash('עוד קצת כוכבים ותוכל לקנות את זה!')
        soundManager.playError()
      }
      return
    }
    purchaseCosmetic(item.id, result.spend)
    soundManager.playLevelComplete()
    setFlash(`קנית: ${item.nameHe} 🎉`)
  }

  function handleEquip(item: CosmeticItem) {
    equipAccent(item.id)
    setFlash(`הצבע ${item.nameHe} פעיל עכשיו!`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4" dir="rtl" lang="he">
      {/* Header + balance */}
      <div className="game-card-border flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-bold text-glow">חנות הנינג׳ה</h1>
          <p className="text-sm text-muted-foreground">
            כל כוכב = 10 מטבעות. קנה צבעים מגניבים לפרופיל!
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{ background: 'oklch(0.78 0.16 75 / 15%)', border: '1.5px solid oklch(0.78 0.16 75 / 40%)' }}
          data-testid="coin-balance"
        >
          <Coins className="size-5" style={{ color: '#f5b301' }} />
          <span className="text-xl font-bold tabular-nums" style={{ color: '#f5b301' }}>
            {balance}
          </span>
        </div>
      </div>

      {/* Earned summary */}
      <p className="text-center text-xs text-muted-foreground">
        אספת {totalStars} כוכבים — כלומר {earned} מטבעות סך הכל.
      </p>

      {/* Flash message */}
      {flash && (
        <motion.p
          key={flash}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg px-3 py-2 text-center text-sm font-medium"
          style={{ background: 'oklch(0.495 0.205 292 / 12%)', color: 'var(--game-accent-purple)' }}
          role="status"
          aria-live="polite"
          data-testid="shop-flash"
        >
          {flash}
        </motion.p>
      )}

      {/* Accent cosmetics grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COSMETICS.map((item) => {
          const owned = isUnlocked(item.id, unlockedCosmetics)
          const equipped = equippedAccent === item.id
          const affordable = balance >= item.cost

          return (
            <Card
              key={item.id}
              className="game-card-border overflow-hidden"
              style={equipped ? { borderColor: item.color, boxShadow: `0 0 12px ${item.color}66` } : undefined}
              data-testid={`cosmetic-${item.id}`}
            >
              <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
                {/* Swatch */}
                <div
                  className="flex size-12 items-center justify-center rounded-full text-2xl"
                  style={{ background: `${item.color}22`, border: `2px solid ${item.color}` }}
                  aria-hidden
                >
                  {item.emoji}
                </div>
                <span className="text-sm font-semibold">{item.nameHe}</span>

                {/* Action */}
                {equipped ? (
                  <span
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                    style={{ background: item.color }}
                  >
                    <Check className="size-3" />
                    פעיל
                  </span>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ borderColor: item.color, color: item.color }}
                    aria-label={`הפעל את הצבע ${item.nameHe}`}
                  >
                    הפעל
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!affordable}
                    aria-label={`קנה את ${item.nameHe} ב-${item.cost} מטבעות`}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity',
                      affordable
                        ? 'text-white hover:opacity-90'
                        : 'cursor-not-allowed opacity-50',
                    )}
                    style={{ background: affordable ? 'linear-gradient(135deg, #f5b301, #d99500)' : 'var(--game-bg-input)', color: affordable ? '#fff' : 'var(--muted-foreground)' }}
                  >
                    {affordable ? <Coins className="size-3" /> : <Lock className="size-3" />}
                    {item.cost}
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-xs text-muted-foreground">
        <Sparkles className="size-3.5" style={{ color: 'var(--game-accent-green)' }} />
        כל הקישוטים הם רק לכיף — אין כסף אמיתי ואין תשלומים.
      </p>
    </div>
  )
}
