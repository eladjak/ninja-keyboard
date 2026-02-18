'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useXpStore } from '@/stores/xp-store'
import {
  getNinjaRank,
  getRankDisplayName,
  getRankEmoji,
  getNextMilestone,
} from '@/lib/profile/profile-utils'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  className?: string
}

export function ProfileCard({ className }: ProfileCardProps) {
  const {
    totalXp,
    level,
    streak,
    completedLessons,
    levelProgress,
    xpToNextLevel,
  } = useXpStore()

  const [displayName, setDisplayName] = useState('נינג׳ה אנונימי')
  const [isEditing, setIsEditing] = useState(false)

  const rank = getNinjaRank(level)
  const rankName = getRankDisplayName(rank)
  const rankEmoji = getRankEmoji(rank)
  const progress = levelProgress()
  const xpRemaining = xpToNextLevel()
  const milestone = getNextMilestone(totalXp)

  const lessonsArray = Object.values(completedLessons)
  const totalLessons = lessonsArray.length
  const bestWpm = lessonsArray.length > 0
    ? Math.max(...lessonsArray.map((l) => l.bestWpm))
    : 0
  const avgAccuracy = lessonsArray.length > 0
    ? Math.round(
        lessonsArray.reduce((sum, l) => sum + l.bestAccuracy, 0) /
          lessonsArray.length,
      )
    : 0

  return (
    <Card className={cn('overflow-hidden', className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          הפרופיל שלי
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar & rank area */}
        <div className="flex flex-col items-center gap-3">
          {/* Avatar circle */}
          <div
            className="flex size-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-5xl"
            aria-label={`דרגת נינג׳ה: ${rankName}`}
          >
            <span role="img" aria-hidden="true">
              {rankEmoji}
            </span>
          </div>

          {/* Editable display name */}
          {isEditing ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false)
              }}
              className="border-b-2 border-primary bg-transparent text-center text-xl font-bold outline-none"
              aria-label="שם תצוגה"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer text-xl font-bold hover:text-primary"
              aria-label="ערוך שם תצוגה"
            >
              {displayName}
            </button>
          )}

          {/* Rank badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {rankEmoji} {rankName}
          </span>
        </div>

        {/* XP progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">רמה {level}</span>
            <span className="text-muted-foreground">
              {level >= 20 ? 'מקסימום!' : `עוד ${xpRemaining} XP לרמה הבאה`}
            </span>
          </div>
          <Progress value={progress} aria-label={`התקדמות לרמה הבאה: ${progress}%`} />
          <p className="text-center text-xs text-muted-foreground">
            יעד הבא: {milestone.label}
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-4"
          role="list"
          aria-label="סטטיסטיקות"
        >
          <StatItem
            label="מהירות מרבית"
            value={`${bestWpm} מ/ד`}
            icon="⚡"
          />
          <StatItem
            label="דיוק ממוצע"
            value={`${avgAccuracy}%`}
            icon="🎯"
          />
          <StatItem
            label="שיעורים"
            value={`${totalLessons}`}
            icon="📚"
          />
          <StatItem
            label="סטריק"
            value={`${streak} ימים 🔥`}
            icon="🔥"
          />
        </div>

        {/* Total XP */}
        <div className="text-center">
          <span className="text-2xl font-bold text-primary">
            {totalXp.toLocaleString()}
          </span>{' '}
          <span className="text-sm text-muted-foreground">נקודות ניסיון</span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: string
}) {
  return (
    <div
      role="listitem"
      className="flex flex-col items-center gap-1 rounded-lg border p-3"
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
