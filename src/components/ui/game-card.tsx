'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GameCardProps {
  children: React.ReactNode
  className?: string
  /** Stagger delay for entrance animation */
  delay?: number
  /** Gradient accent color class */
  accentColor?: string
  /** Click handler */
  onClick?: () => void
}

/**
 * Enhanced card with gradient border, hover glow, and entrance animation.
 * Used for game cards, stats, and quick links for the AAA look.
 */
export function GameCard({
  children,
  className,
  delay = 0,
  accentColor,
  onClick,
}: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'game-card relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow',
        'hover:shadow-lg hover:shadow-primary/5',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Top gradient accent line */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-0.5',
          accentColor ?? 'ninja-gradient',
        )}
      />

      {/* Shine effect on hover */}
      <div className="card-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300" />

      {children}
    </motion.div>
  )
}
