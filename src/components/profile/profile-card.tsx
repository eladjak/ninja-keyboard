'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
    <div
      className={cn('game-card-border overflow-hidden', className)}
      dir="rtl"
      style={{ borderColor: 'oklch(0.495 0.205 292 / 35%)' }}
    >
      <div className="space-y-6 p-6">
        {/* Avatar & rank area */}
        <div className="flex flex-col items-center gap-3">
          {/* Avatar circle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex size-24 items-center justify-center rounded-full text-5xl"
            style={{
              border: '4px solid var(--game-accent-purple)',
              background: 'oklch(0.495 0.205 292 / 15%)',
              boxShadow: '0 0 24px oklch(0.495 0.205 292 / 40%)',
            }}
            aria-label={`דרגת נינג׳ה: ${rankName}`}
          >
            <span role="img" aria-hidden="true">
              {rankEmoji}
            </span>
          </motion.div>

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
              className="rounded border-b-2 bg-transparent text-center text-xl font-bold outline-none"
              style={{ borderColor: 'var(--game-accent-purple)', color: 'var(--game-accent-purple)' }}
              aria-label="שם תצוגה"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer text-xl font-bold transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--game-accent-purple)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--foreground)' }}
              aria-label="ערוך שם תצוגה"
            >
              {displayName}
            </button>
          )}

          {/* Rank badge */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
            style={{
              background: 'oklch(0.495 0.205 292 / 20%)',
              border: '1.5px solid oklch(0.495 0.205 292 / 40%)',
              color: 'var(--game-accent-purple)',
              textShadow: 'var(--game-text-glow-sm)',
            }}
          >
            {rankEmoji} {rankName}
          </span>
        </div>

        {/* XP progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold" style={{ color: 'var(--game-accent-purple)' }}>רמה {level}</span>
            <span className="text-muted-foreground text-xs">
              {level >= 20 ? 'מקסימום!' : `עוד ${xpRemaining} XP לרמה הבאה`}
            </span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full"
            style={{ background: 'oklch(0.18 0.02 290)', border: '1px solid var(--game-border)' }}
            role="progressbar"
            aria-label={`התקדמות לרמה הבאה: ${progress}%`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6C5CE7, #00B894)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            יעד הבא: {milestone.label}
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-3"
          role="list"
          aria-label="סטטיסטיקות"
        >
          <StatItem label="מהירות מרבית" value={`${bestWpm} מ/ד`} icon="⚡" accent="#f59e0b" />
          <StatItem label="דיוק ממוצע" value={`${avgAccuracy}%`} icon="🎯" accent="#00B894" />
          <StatItem label="שיעורים" value={`${totalLessons}`} icon="📚" accent="#6C5CE7" />
          <StatItem label="סטריק" value={`${streak} ימים`} icon="🔥" accent="#f97316" />
        </div>

        {/* Total XP */}
        <div className="text-center">
          <span
            className="text-2xl font-black"
            style={{ color: 'var(--game-accent-purple)', textShadow: 'var(--game-text-glow)' }}
          >
            {totalXp.toLocaleString()}
          </span>{' '}
          <span className="text-sm text-muted-foreground">נקודות ניסיון</span>
        </div>
      </div>
    </div>
  )
}

function StatItem({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: string
  accent: string
}) {
  return (
    <div
      role="listitem"
      className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
      style={{
        background: `${accent}15`,
        border: `1.5px solid ${accent}35`,
      }}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="text-lg font-bold" style={{ color: accent }}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
