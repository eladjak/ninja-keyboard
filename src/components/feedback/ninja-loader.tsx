'use client'

import { motion } from 'framer-motion'

interface NinjaLoaderProps {
  /** Loading message */
  message?: string
  /** Compact mode for inline usage */
  compact?: boolean
}

/**
 * Ninja-themed loading indicator with Ki mascot thinking animation.
 */
export function NinjaLoader({ message = 'טוען...', compact = false }: NinjaLoaderProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-4" dir="rtl">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4" dir="rtl">
      {/* Ki mascot thinking */}
      <motion.div
        animate={{ translateY: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 48 48" width={64} height={64} aria-hidden="true">
          {/* Head */}
          <circle cx="24" cy="24" r="20" fill="#2D3436" />
          {/* Headband */}
          <rect x="4" y="12" width="40" height="6" rx="2" fill="#6C5CE7" />
          <path d="M4,15 Q0,12 2,8" stroke="#6C5CE7" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M4,15 Q-1,16 1,20" stroke="#6C5CE7" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Mask */}
          <rect x="8" y="22" width="32" height="10" rx="4" fill="#1A1A2E" />
          {/* Thinking eyes (one squinted) */}
          <path d="M15,18 A2.5,2.5 0 1,1 20,18 A2.5,2.5 0 1,1 15,18" fill="white" />
          <path d="M28,17 A2.5,3.5 0 1,1 33,17 A2.5,3.5 0 1,1 28,17" fill="white" />
          <circle cx="17" cy="18" r="1.5" fill="#2D3436" />
          <circle cx="31" cy="17" r="1.5" fill="#2D3436" />
        </svg>
      </motion.div>

      {/* Typing dots */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}
