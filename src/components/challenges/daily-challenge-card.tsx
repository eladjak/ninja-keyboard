'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Zap, Shield, Flame, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDailyChallenge, getTodayDateStr } from '@/lib/challenges/daily-challenge'
import { useDailyChallengeStore } from '@/stores/daily-challenge-store'
import { cn } from '@/lib/utils'
import type { ChallengeType } from '@/lib/challenges/daily-challenge'

const TYPE_CONFIG: Record<ChallengeType, { icon: typeof Target; accent: string; glow: string; label: string }> = {
  speed: {
    icon: Zap,
    accent: '#f59e0b',
    glow: 'oklch(0.75 0.18 80 / 35%)',
    label: 'מהירות',
  },
  accuracy: {
    icon: Target,
    accent: 'var(--game-accent-purple)',
    glow: 'oklch(0.55 0.2 292 / 35%)',
    label: 'דיוק',
  },
  endurance: {
    icon: Shield,
    accent: 'var(--game-accent-green)',
    glow: 'oklch(0.672 0.148 168 / 35%)',
    label: 'סיבולת',
  },
}

interface DailyChallengeCardProps {
  className?: string
}

export function DailyChallengeCard({ className }: DailyChallengeCardProps) {
  const today = getTodayDateStr()
  const challenge = useMemo(() => getDailyChallenge(today), [today])
  const { isChallengeCompleted, getChallengeStreak } = useDailyChallengeStore()
  const completed = isChallengeCompleted(today)
  const streak = getChallengeStreak()
  const config = TYPE_CONFIG[challenge.type]
  const Icon = config.icon

  return (
    <div
      className={cn('game-card-border overflow-hidden', className)}
      style={{ borderColor: completed ? 'oklch(0.672 0.148 168 / 40%)' : 'oklch(0.75 0.18 80 / 35%)' }}
      data-testid="daily-challenge"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 pb-3"
        style={{ borderBottom: '1px solid var(--game-border)' }}
      >
        <div className="flex items-center gap-2">
          <Target className="size-5" style={{ color: '#f59e0b' }} />
          <h3 className="game-section-title text-base">אתגר יומי</h3>
        </div>
        {streak > 1 && (
          <span
            className="game-stat-badge"
            style={{ borderColor: 'oklch(0.65 0.22 40 / 40%)', color: '#f97316' }}
          >
            <Flame className="size-3 text-orange-500" />
            {streak} ימים
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        {/* Challenge info */}
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${config.accent}20`, boxShadow: `0 0 10px ${config.glow}` }}
          >
            <Icon className="size-5" style={{ color: config.accent }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{challenge.titleHe}</h3>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: `${config.accent}20`, color: config.accent, border: `1px solid ${config.accent}40` }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{challenge.descriptionHe}</p>
          </div>
        </div>

        {/* Reward */}
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2"
          style={{ background: 'var(--game-hover-bg)', border: '1px solid var(--game-border)' }}
        >
          <span className="text-sm text-muted-foreground">פרס השלמה</span>
          <span
            className="flex items-center gap-1 font-bold"
            style={{ color: '#f59e0b', textShadow: '0 0 8px oklch(0.75 0.18 80 / 40%)' }}
          >
            <Zap className="size-4" />
            +{challenge.xpReward} XP
          </span>
        </div>

        {/* Action */}
        {completed ? (
          <motion.div
            className="flex items-center justify-center gap-2 rounded-xl py-3"
            style={{
              background: 'oklch(0.672 0.148 168 / 15%)',
              border: '1px solid oklch(0.672 0.148 168 / 40%)',
              color: 'var(--game-accent-green)',
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <CheckCircle2 className="size-5" />
            <span className="font-medium">אתגר הושלם!</span>
          </motion.div>
        ) : (
          <Link href="/practice">
            <Button className="game-button w-full gap-2">
              התחל אתגר
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
