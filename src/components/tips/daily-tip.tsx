'use client'

import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { getRandomTip, CATEGORY_LABELS } from '@/lib/content/typing-tips'
import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'

const CATEGORY_ACCENT: Record<string, string> = {
  posture: 'var(--game-accent-green)',
  technique: 'var(--game-accent-purple)',
  practice: '#a855f7',
  mindset: '#f59e0b',
}

interface DailyTipProps {
  className?: string
}

export function DailyTip({ className }: DailyTipProps) {
  const { level } = useXpStore()

  // Deterministic tip based on today's date
  const tip = useMemo(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    return getRandomTip(level, seed)
  }, [level])

  const accent = CATEGORY_ACCENT[tip.category] ?? 'var(--game-accent-purple)'

  return (
    <div
      className={cn('game-card-border', className)}
      style={{ borderColor: 'oklch(0.75 0.18 80 / 25%)' }}
      data-testid="daily-tip"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Lightbulb
          className="mt-0.5 size-5 shrink-0"
          style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 6px oklch(0.75 0.18 80 / 50%))' }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{tip.titleHe}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
            >
              {CATEGORY_LABELS[tip.category]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{tip.contentHe}</p>
        </div>
      </div>
    </div>
  )
}
