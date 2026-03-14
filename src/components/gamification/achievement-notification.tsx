'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BadgeDefinition } from '@/lib/gamification/badge-definitions'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface AchievementNotificationProps {
  /** Badge that was just earned, or null to hide */
  badge: BadgeDefinition | null
  /** Called after the notification auto-dismisses */
  onDismiss?: () => void
  /** Auto-dismiss delay in ms (default 4000) */
  dismissDelay?: number
}

export function AchievementNotification({
  badge,
  onDismiss,
  dismissDelay = 4000,
}: AchievementNotificationProps) {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!badge) {
      setVisible(false)
      return
    }

    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, dismissDelay)

    return () => clearTimeout(timer)
  }, [badge, dismissDelay, onDismiss])

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -40 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          role="alert"
          aria-live="polite"
          className="fixed start-4 top-4 z-50 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 shadow-lg backdrop-blur-sm"
          dir="rtl"
        >
          <span className="text-3xl" role="img" aria-label={badge.nameHe}>
            {badge.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary">הישג חדש!</p>
            <p className="text-sm font-semibold">{badge.nameHe}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
