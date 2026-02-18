'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Zap, Shield, Flame, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDailyChallenge, getTodayDateStr } from '@/lib/challenges/daily-challenge'
import { useDailyChallengeStore } from '@/stores/daily-challenge-store'
import { cn } from '@/lib/utils'
import type { ChallengeType } from '@/lib/challenges/daily-challenge'

const TYPE_CONFIG: Record<ChallengeType, { icon: typeof Target; color: string; bg: string; label: string }> = {
  speed: {
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    label: 'מהירות',
  },
  accuracy: {
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'דיוק',
  },
  endurance: {
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
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
    <Card className={cn('overflow-hidden', className)} data-testid="daily-challenge">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base">
            <Target className="size-5 text-primary" />
            אתגר יומי
          </span>
          {streak > 1 && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="size-3 text-orange-500" />
              {streak} ימים
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Challenge info */}
        <div className="flex items-start gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-lg', config.bg)}>
            <Icon className={cn('size-5', config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{challenge.titleHe}</h3>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{challenge.descriptionHe}</p>
          </div>
        </div>

        {/* Reward */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">פרס השלמה</span>
          <span className="flex items-center gap-1 font-medium text-primary">
            <Zap className="size-4" />
            +{challenge.xpReward} XP
          </span>
        </div>

        {/* Action */}
        {completed ? (
          <motion.div
            className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <CheckCircle2 className="size-5" />
            <span className="font-medium">אתגר הושלם!</span>
          </motion.div>
        ) : (
          <Link href="/practice">
            <Button className="w-full gap-2">
              התחל אתגר
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
