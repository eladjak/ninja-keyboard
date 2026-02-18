'use client'

import { useMemo, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTipsForLevel, CATEGORY_LABELS } from '@/lib/content/typing-tips'
import type { TypingTip } from '@/lib/content/typing-tips'
import { useXpStore } from '@/stores/xp-store'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  posture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  technique: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  practice: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  mindset: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

type CategoryFilter = TypingTip['category'] | 'all'

export default function TipsPage() {
  const { level } = useXpStore()
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const tips = useMemo(() => {
    const available = getTipsForLevel(level)
    if (filter === 'all') return available
    return available.filter((t) => t.category === filter)
  }, [level, filter])

  const categories: CategoryFilter[] = ['all', 'posture', 'technique', 'practice', 'mindset']
  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'הכל',
    ...CATEGORY_LABELS,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">טיפים להקלדה</h1>
          <p className="text-sm text-muted-foreground">
            {tips.length} טיפים זמינים לרמה שלך
          </p>
        </div>
        <Lightbulb className="size-8 text-amber-500" />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="סינון לפי קטגוריה">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            role="radio"
            aria-checked={filter === cat}
          >
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      {/* Tips */}
      <div className="space-y-3">
        {tips.map((tip) => (
          <Card key={tip.id}>
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
        ))}
      </div>
    </div>
  )
}
