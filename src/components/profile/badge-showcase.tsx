'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useBadgeStore } from '@/stores/badge-store'
import {
  BADGE_DEFINITIONS,
  type BadgeDefinition,
} from '@/lib/gamification/badge-definitions'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeShowcaseProps {
  className?: string
}

export function BadgeShowcase({ className }: BadgeShowcaseProps) {
  const { earnedBadges } = useBadgeStore()
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(
    null,
  )

  const earnedCount = Object.keys(earnedBadges).length
  const totalCount = BADGE_DEFINITIONS.length

  return (
    <Card className={cn('overflow-hidden', className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>תגים והישגים</span>
          <span className="text-sm font-normal text-muted-foreground">
            {earnedCount}/{totalCount} תגים
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Badge grid */}
        <div
          className="grid grid-cols-4 gap-3 sm:grid-cols-5"
          role="list"
          aria-label="רשימת תגים"
        >
          {BADGE_DEFINITIONS.map((badge) => {
            const isEarned = badge.id in earnedBadges
            return (
              <button
                key={badge.id}
                role="listitem"
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg p-2 transition-colors',
                  isEarned
                    ? 'cursor-pointer hover:bg-primary/5'
                    : 'cursor-pointer opacity-50 hover:bg-muted/50',
                )}
                aria-label={`${badge.nameHe}${isEarned ? '' : ' - לא הושג'}`}
              >
                <div
                  className={cn(
                    'relative flex size-12 items-center justify-center rounded-full border-2 text-2xl',
                    isEarned
                      ? 'border-primary bg-primary/10'
                      : 'border-muted bg-muted/30 grayscale',
                  )}
                >
                  <span role="img" aria-hidden="true">
                    {badge.emoji}
                  </span>
                  {!isEarned && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60"
                      aria-hidden="true"
                    >
                      <Lock className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-center text-[10px] font-medium leading-tight',
                    isEarned ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {badge.nameHe}
                </span>
              </button>
            )
          })}
        </div>

        {/* Badge detail panel */}
        {selectedBadge && (
          <BadgeDetailPanel
            badge={selectedBadge}
            isEarned={selectedBadge.id in earnedBadges}
            earnedDate={
              selectedBadge.id in earnedBadges
                ? earnedBadges[selectedBadge.id].earnedAt
                : undefined
            }
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function BadgeDetailPanel({
  badge,
  isEarned,
  earnedDate,
  onClose,
}: {
  badge: BadgeDefinition
  isEarned: boolean
  earnedDate?: string
  onClose: () => void
}) {
  const formattedDate = earnedDate
    ? new Date(earnedDate).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div
      className="rounded-lg border bg-muted/30 p-4"
      role="dialog"
      aria-label={`פרטי תג: ${badge.nameHe}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-hidden="true">
            {badge.emoji}
          </span>
          <div>
            <h3 className="font-bold">{badge.nameHe}</h3>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            {isEarned && formattedDate && (
              <p className="mt-1 text-xs text-primary">
                הושג ב-{formattedDate}
              </p>
            )}
            {!isEarned && (
              <p className="mt-1 text-xs text-muted-foreground">
                עדיין לא הושג
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="סגור פרטי תג"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
