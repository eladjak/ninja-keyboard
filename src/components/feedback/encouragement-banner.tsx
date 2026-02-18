'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EncouragementBannerProps {
  /** Hebrew text to display */
  message: string
  /** Visual type of the banner */
  type: 'encourage' | 'celebrate' | 'calm' | 'hint' | 'summary'
  /** Optional emoji to show alongside the message */
  emoji?: string
  /** Whether the banner is visible */
  visible: boolean
  /** Called when the banner should be dismissed */
  onDismiss?: () => void
}

/** Auto-dismiss delay in ms — only for encourage/celebrate */
const AUTO_DISMISS_DELAY = 3000

/** Background color classes per type */
const typeStyles: Record<EncouragementBannerProps['type'], string> = {
  encourage: 'bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-100',
  celebrate: 'bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-100',
  calm:      'bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-100',
  hint:      'bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-100',
  summary:   'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800/50 dark:border-zinc-600 dark:text-zinc-100',
}

/** Default emojis per type when none provided */
const defaultEmoji: Record<EncouragementBannerProps['type'], string> = {
  encourage: '💪',
  celebrate: '🎉',
  calm:      '😌',
  hint:      '☝️',
  summary:   '📊',
}

/** Types that auto-dismiss after AUTO_DISMISS_DELAY */
const AUTO_DISMISS_TYPES = new Set<EncouragementBannerProps['type']>(['encourage', 'celebrate'])

/**
 * A floating banner shown at the top of the typing area with contextual
 * encouragement messages. Slides down when visible, auto-dismisses for
 * encourage/celebrate types after 3 seconds.
 */
export function EncouragementBanner({
  message,
  type,
  emoji,
  visible,
  onDismiss,
}: EncouragementBannerProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-dismiss for encourage/celebrate types
  useEffect(() => {
    if (!visible || !AUTO_DISMISS_TYPES.has(type) || !onDismiss) return

    timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_DELAY)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [visible, type, onDismiss])

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const displayEmoji = emoji ?? defaultEmoji[type]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="polite"
          dir="rtl"
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm',
            typeStyles[type],
          )}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {/* Emoji */}
          <span aria-hidden="true" className="shrink-0 text-lg leading-none">
            {displayEmoji}
          </span>

          {/* Message */}
          <span className="flex-1">{message}</span>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              aria-label="סגור"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
