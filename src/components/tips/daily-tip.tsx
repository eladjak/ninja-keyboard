'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { getRandomTip, CATEGORY_LABELS } from '@/lib/content/typing-tips'
import { useXpStore } from '@/stores/xp-store'
import { useHydrated } from '@/hooks/use-hydrated'
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
  // Gate the persisted level so the first client render matches the server's
  // (level 1) — otherwise the tip text picked from the seed differs and React
  // reports a hydration mismatch.
  const hydrated = useHydrated()
  const { level: storeLevel } = useXpStore()
  const level = hydrated ? storeLevel : 1

  // Deterministic tip based on today's date
  const tip = useMemo(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    return getRandomTip(level, seed)
  }, [level])

  const accent = CATEGORY_ACCENT[tip.category] ?? 'var(--game-accent-purple)'

  return (
    <div
      className={cn('game-card-border relative', className)}
      style={{ borderColor: 'oklch(0.75 0.18 80 / 25%)' }}
      data-testid="daily-tip"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Speech bubble text area */}
        <div className="relative flex-1">
          {/* Triangle pointing toward Sensei Zen (end side = right in RTL) */}
          <div
            className="absolute top-4 -end-2 size-0"
            style={{
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderInlineStart: '8px solid oklch(0.18 0.02 260 / 90%)',
            }}
          />
          <div
            className="rounded-xl px-3 py-2.5"
            style={{
              background: 'oklch(0.18 0.02 260 / 90%)',
              border: `1px solid ${accent}25`,
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
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

        {/* Sensei Zen companion */}
        <div className="relative shrink-0">
          <div
            className="overflow-hidden rounded-full"
            style={{
              width: 72,
              height: 72,
              border: '2px solid #FAD39040',
              boxShadow: '0 0 12px #FAD39030',
            }}
          >
            <Image
              src="/images/characters/model-sheets/sensei-zen.jpg"
              alt="סנסיי זן"
              width={72}
              height={72}
              className="object-cover object-top"
            />
          </div>
          {/* Name label */}
          <p
            className="mt-1 text-center text-[10px] font-semibold"
            style={{ color: '#FAD390' }}
          >
            סנסיי זן
          </p>
        </div>
      </div>
    </div>
  )
}
