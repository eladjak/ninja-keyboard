'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Combo thresholds and labels ──────────────────────────────────────

interface ComboTier {
  min: number
  label: string
  color: string
  glow: string
}

const COMBO_TIERS: ComboTier[] = [
  { min: 50, label: 'אלוף!', color: '#FFD700', glow: '0 0 20px #FFD700' },
  { min: 30, label: 'סופר!', color: '#FF6B6B', glow: '0 0 16px #FF6B6B' },
  { min: 20, label: 'מדהים!', color: '#FF9F43', glow: '0 0 14px #FF9F43' },
  { min: 10, label: 'מצוין!', color: '#6C5CE7', glow: '0 0 12px #6C5CE7' },
  { min: 5, label: 'יפה!', color: '#00B894', glow: '0 0 10px #00B894' },
]

function getTier(combo: number): ComboTier | null {
  for (const tier of COMBO_TIERS) {
    if (combo >= tier.min) return tier
  }
  return null
}

// ── Milestone popups ────────────────────────────────────────────────

const MILESTONES = [10, 20, 30, 50, 75, 100] as const

export interface BattleComboProps {
  /** Current consecutive correct keystroke count */
  combo: number
  /** Additional class names */
  className?: string
}

/**
 * Battle combo counter with tier labels and milestone popups.
 * Shows "x{combo}" with color-coded tier label when combo ≥ 5.
 * Flashes a milestone popup at 10, 20, 30, 50, 75, 100.
 */
export function BattleCombo({ combo, className }: BattleComboProps) {
  const [milestoneKey, setMilestoneKey] = useState(0)
  const [lastMilestone, setLastMilestone] = useState<number | null>(null)

  const tier = getTier(combo)

  // Detect milestones
  useEffect(() => {
    const hit = MILESTONES.find((m) => combo === m)
    if (hit) {
      setLastMilestone(hit)
      setMilestoneKey((k) => k + 1)
    }
  }, [combo])

  if (!tier) return null

  return (
    <div className={className}>
      {/* Combo counter */}
      <motion.div
        key={combo}
        initial={{ scale: 1.3, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2"
      >
        <span
          className="text-3xl font-black tabular-nums"
          style={{ color: tier.color, textShadow: tier.glow }}
        >
          x{combo}
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: tier.color }}
        >
          {tier.label}
        </span>
      </motion.div>

      {/* Milestone popup */}
      <AnimatePresence>
        {lastMilestone && (
          <motion.div
            key={milestoneKey}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute -top-8 text-center"
            style={{
              color: tier.color,
              textShadow: tier.glow,
              fontSize: '1.25rem',
              fontWeight: 900,
            }}
          >
            {lastMilestone} רצף!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
