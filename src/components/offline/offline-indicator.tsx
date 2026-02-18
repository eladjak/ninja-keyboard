'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { getPendingResultCount } from '@/lib/offline/sync-manager'

export interface OfflineIndicatorProps {
  /** Whether results are currently being synced */
  isSyncing?: boolean
  /** Optional class name for the wrapper */
  className?: string
}

/**
 * Floating banner that appears when the user goes offline.
 * Shows pending result count and syncing status when reconnecting.
 * RTL layout with Hebrew text, dismissible via X button.
 */
export function OfflineIndicator({ isSyncing = false, className }: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [dismissed, setDismissed] = useState(false)

  const pendingCount = getPendingResultCount()
  const showSyncing = isOnline && wasOffline && isSyncing
  const showOffline = !isOnline
  const showBanner = (showOffline || showSyncing) && !dismissed

  // Reset dismissed state when going offline again
  if (!isOnline && dismissed) {
    setDismissed(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          role="alert"
          aria-live="polite"
          dir="rtl"
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm',
            showSyncing
              ? 'border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-100'
              : 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100',
            className,
          )}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {/* Icon */}
          <span aria-hidden="true" className="shrink-0">
            {showSyncing ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <WifiOff className="size-4" />
            )}
          </span>

          {/* Message */}
          <span className="flex-1">
            {showSyncing
              ? 'מסנכרן תוצאות...'
              : 'אתה במצב לא מקוון'}
            {pendingCount > 0 && !showSyncing && (
              <span className="ms-1 opacity-80">
                ({pendingCount} {pendingCount === 1 ? 'תוצאה ממתינה' : 'תוצאות ממתינות'})
              </span>
            )}
          </span>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="סגור"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
