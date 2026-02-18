'use client'

import { motion } from 'framer-motion'
import { Award, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Certificate, CertificateLevel } from '@/lib/gamification/certificate'

const LEVEL_COLORS: Record<CertificateLevel, { border: string; bg: string; text: string }> = {
  bronze: {
    border: 'border-amber-700/30',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  silver: {
    border: 'border-gray-400/30',
    bg: 'bg-gray-50 dark:bg-gray-800/30',
    text: 'text-gray-600 dark:text-gray-300',
  },
  gold: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  platinum: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  'ninja-master': {
    border: 'border-purple-500/30',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
}

interface CertificateCardProps {
  certificate: Certificate
  earned: boolean
  progress: number
  className?: string
}

export function CertificateCard({ certificate, earned, progress, className }: CertificateCardProps) {
  const colors = LEVEL_COLORS[certificate.level]

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        earned ? colors.border : 'border-muted opacity-75',
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 px-4 py-4">
        {/* Badge */}
        <div
          className={cn(
            'flex size-14 items-center justify-center rounded-xl text-3xl',
            earned ? colors.bg : 'bg-muted/50',
          )}
        >
          {earned ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {certificate.emoji}
            </motion.span>
          ) : (
            <Lock className="size-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-semibold', earned ? colors.text : 'text-muted-foreground')}>
              {certificate.titleHe}
            </h3>
            {earned && <Award className={cn('size-4', colors.text)} />}
          </div>
          <p className="text-sm text-muted-foreground">{certificate.descriptionHe}</p>

          {/* Progress bar (only for unearned) */}
          {!earned && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={progress} className="h-2" aria-label={`${progress}% להשגת התעודה`} />
              <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
