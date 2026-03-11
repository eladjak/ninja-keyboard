'use client'

import { useState } from 'react'
import { useBadgeStore } from '@/stores/badge-store'
import {
  BADGE_DEFINITIONS,
  type BadgeDefinition,
} from '@/lib/gamification/badge-definitions'
import { Lock, Trophy } from 'lucide-react'
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
    <div
      className={cn('game-card-border overflow-hidden', className)}
      dir="rtl"
      style={{ borderColor: 'oklch(0.75 0.18 80 / 30%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 pb-3"
        style={{ borderBottom: '1px solid var(--game-border)' }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="size-4" style={{ color: '#f59e0b' }} />
          <h3 className="game-section-title text-base">תגים והישגים</h3>
        </div>
        <span
          className="game-stat-badge text-xs"
          style={{ borderColor: 'oklch(0.75 0.18 80 / 30%)', color: '#f59e0b' }}
        >
          {earnedCount}/{totalCount} תגים
        </span>
      </div>

      <div className="space-y-4 p-4">
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
                  'flex flex-col items-center gap-1 rounded-xl p-2 transition-all',
                  isEarned
                    ? 'cursor-pointer hover:scale-105'
                    : 'cursor-pointer opacity-40',
                )}
                style={isEarned ? { background: 'var(--game-hover-bg)' } : undefined}
                aria-label={`${badge.nameHe}${isEarned ? '' : ' - לא הושג'}`}
              >
                <div
                  className={cn(
                    'relative flex size-12 items-center justify-center rounded-full border-2 text-2xl',
                  )}
                  style={isEarned
                    ? { borderColor: 'oklch(0.55 0.2 292 / 50%)', background: 'oklch(0.55 0.2 292 / 15%)', boxShadow: '0 0 10px oklch(0.55 0.2 292 / 25%)' }
                    : { borderColor: 'var(--game-border)', background: 'oklch(0.15 0.02 290)', filter: 'grayscale(1)' }
                  }
                >
                  <span role="img" aria-hidden="true">
                    {badge.emoji}
                  </span>
                  {!isEarned && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full"
                      style={{ background: 'oklch(0.1 0.02 290 / 60%)' }}
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
      </div>
    </div>
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
      className="rounded-xl p-4"
      style={{ background: 'var(--game-bg-elevated)', border: '1px solid var(--game-border)' }}
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
