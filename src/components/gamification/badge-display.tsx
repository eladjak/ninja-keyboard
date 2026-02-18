'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BadgeDefinition } from '@/lib/gamification/badge-definitions'

interface BadgeDisplayProps {
  badge: BadgeDefinition
  /** Whether this badge has been earned by the user */
  earned: boolean
  /** Whether to show the glow/entry animation (for newly earned badges) */
  isNew?: boolean
  className?: string
}

export function BadgeDisplay({
  badge,
  earned,
  isNew = false,
  className,
}: BadgeDisplayProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center gap-1', className)}
      initial={isNew ? { scale: 0.6, opacity: 0 } : false}
      animate={isNew ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-label={`${badge.nameHe}${earned ? '' : ' - לא הושג'}`}
    >
      {/* Badge circle */}
      <div
        className={cn(
          'relative flex size-16 items-center justify-center rounded-full border-2 text-3xl',
          earned
            ? 'border-primary bg-primary/10'
            : 'border-muted bg-muted/30 grayscale',
          isNew && 'shadow-[0_0_16px_4px_hsl(var(--primary)/0.5)]',
        )}
      >
        <span role="img" aria-hidden="true">
          {badge.emoji}
        </span>

        {/* Lock overlay for unearned */}
        {!earned && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60"
            aria-hidden="true"
          >
            <Lock className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Hebrew name */}
      <span
        className={cn(
          'text-center text-xs font-medium leading-tight',
          earned ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {badge.nameHe}
      </span>
    </motion.div>
  )
}
