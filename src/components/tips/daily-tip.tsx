'use client'

import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRandomTip, CATEGORY_LABELS } from '@/lib/content/typing-tips'
import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  posture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  technique: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  practice: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  mindset: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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

  return (
    <Card className={cn('overflow-hidden', className)} data-testid="daily-tip">
      <CardContent className="flex items-start gap-3 px-4 py-3">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{tip.titleHe}</h3>
            <Badge
              variant="secondary"
              className={cn('text-xs', CATEGORY_COLORS[tip.category])}
            >
              {CATEGORY_LABELS[tip.category]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{tip.contentHe}</p>
        </div>
      </CardContent>
    </Card>
  )
}
