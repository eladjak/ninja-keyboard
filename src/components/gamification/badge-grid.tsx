'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BadgeDisplay } from '@/components/gamification/badge-display'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import { useBadgeStore } from '@/stores/badge-store'
import type { BadgeCategory } from '@/lib/gamification/badge-definitions'

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  persistence: 'התמדה',
  accuracy: 'דיוק',
  speed: 'מהירות',
  exploration: 'חקירה',
  accessibility: 'נגישות',
  special: 'מיוחד',
}

// Only categories that have at least one badge defined
const ACTIVE_CATEGORIES: BadgeCategory[] = [
  'special',
  'persistence',
  'accuracy',
  'speed',
  'exploration',
]

export function BadgeGrid() {
  const { earnedBadges } = useBadgeStore()
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all')

  const earnedCount = Object.keys(earnedBadges).length
  const totalCount = BADGE_DEFINITIONS.length

  const displayedBadges =
    selectedCategory === 'all'
      ? BADGE_DEFINITIONS
      : BADGE_DEFINITIONS.filter((b) => b.category === selectedCategory)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-sm text-muted-foreground" dir="rtl">
        {earnedCount}/{totalCount} הישגים
      </p>

      {/* Category tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(v) => setSelectedCategory(v as BadgeCategory | 'all')}
        dir="rtl"
      >
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">הכל</TabsTrigger>
          {ACTIVE_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Single content panel (we filter outside tabs) */}
        {(['all', ...ACTIVE_CATEGORIES] as const).map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4" dir="rtl">
              {displayedBadges.map((badge) => (
                <BadgeDisplay
                  key={badge.id}
                  badge={badge}
                  earned={badge.id in earnedBadges}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
