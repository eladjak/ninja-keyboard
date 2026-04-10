'use client'

/**
 * BattlePowerUps — power-up buttons displayed below the battle area.
 *
 * Layout (RTL): 4 buttons in a row, right-to-left order.
 * Each button shows: emoji icon + Hebrew name + charge count.
 * Disabled when on cooldown (overlaid with a countdown timer).
 * Glows when charges are available.
 * Active power-ups show a floating indicator above the battle area.
 *
 * Animation rules: transform/opacity ONLY, max 200ms.
 */

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/audio/sound-manager'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import {
  type PowerUpState,
  type PowerUpId,
  POWER_UP_DEFS,
  ALL_POWER_UP_IDS,
  isPowerUpAvailable,
  isPowerUpActive,
  getPowerUpActiveMs,
  getPowerUpCooldownMs,
  getShieldHitsRemaining,
} from '@/lib/battle/power-ups'

// ── Helpers ───────────────────────────────────────────────────────────

function formatSeconds(ms: number): string {
  return `${Math.ceil(ms / 1000)}`
}

// ── Sub-components ────────────────────────────────────────────────────

interface ActiveIndicatorProps {
  powerUpState: PowerUpState
  reduceMotion: boolean
}

/** Floating strip above the battle area showing active power-ups. */
function ActiveIndicators({ powerUpState, reduceMotion }: ActiveIndicatorProps) {
  const activeIds = ALL_POWER_UP_IDS.filter((id) =>
    isPowerUpActive(powerUpState, id),
  )

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      aria-live="polite"
      aria-label="כוחות פעילים"
    >
      <AnimatePresence>
        {activeIds.map((id) => {
          const def = POWER_UP_DEFS[id]
          const activeMs = getPowerUpActiveMs(powerUpState, id)
          const shieldHits = id === 'shield' ? getShieldHitsRemaining(powerUpState) : null

          return (
            <motion.div
              key={id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: 'oklch(0.55 0.2 292 / 20%)',
                border: '1px solid oklch(0.55 0.2 292 / 40%)',
                boxShadow: '0 0 8px oklch(0.55 0.2 292 / 30%)',
                color: 'var(--game-accent-purple, #6C5CE7)',
              }}
              role="status"
              aria-label={`${def.nameHe} פעיל`}
            >
              <span aria-hidden="true">{def.icon}</span>
              <span>{def.nameHe}</span>
              {shieldHits !== null ? (
                <span className="opacity-80">×{shieldHits}</span>
              ) : activeMs > 0 ? (
                <span className="opacity-80 tabular-nums">{formatSeconds(activeMs)}ש׳</span>
              ) : null}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────

export interface BattlePowerUpsProps {
  powerUpState: PowerUpState
  onActivate: (id: PowerUpId) => void
  /** Hide the component entirely when the battle isn't in progress. */
  visible?: boolean
}

export function BattlePowerUps({
  powerUpState,
  onActivate,
  visible = true,
}: BattlePowerUpsProps) {
  const reduceMotion = useReducedMotion()

  const handleActivate = useCallback(
    (id: PowerUpId) => {
      if (!isPowerUpAvailable(powerUpState, id)) return
      soundManager.playComboHit()
      onActivate(id)
    },
    [powerUpState, onActivate],
  )

  if (!visible) return null

  return (
    <div
      className="space-y-2"
      dir="rtl"
      aria-label="כוחות על"
    >
      {/* Active power-up indicators */}
      <ActiveIndicators powerUpState={powerUpState} reduceMotion={reduceMotion} />

      {/* Power-up buttons */}
      <div
        className="flex justify-center gap-2"
        role="group"
        aria-label="בחר כוח על"
      >
        {ALL_POWER_UP_IDS.map((id) => {
          const def = POWER_UP_DEFS[id]
          const slot = powerUpState.slots[id]
          const available = isPowerUpAvailable(powerUpState, id)
          const active = isPowerUpActive(powerUpState, id)
          const cooldownMs = getPowerUpCooldownMs(powerUpState, id)
          const onCooldown = cooldownMs > 0
          const hasCharges = slot.charges > 0

          // Determine visual state
          const isDisabled = !available
          const glowing = available && !active

          return (
            <motion.button
              key={id}
              onClick={() => handleActivate(id)}
              disabled={isDisabled}
              whileTap={reduceMotion || isDisabled ? {} : { scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="relative flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
              style={{
                minWidth: '70px',
                background: active
                  ? 'oklch(0.55 0.2 292 / 25%)'
                  : 'var(--game-hover-bg, oklch(0.15 0.02 290))',
                border: `1px solid ${
                  active
                    ? 'oklch(0.55 0.2 292 / 70%)'
                    : glowing
                      ? 'oklch(0.672 0.148 168 / 50%)'
                      : 'var(--game-border, oklch(0.25 0.02 290))'
                }`,
                boxShadow: glowing
                  ? '0 0 12px oklch(0.672 0.148 168 / 30%)'
                  : active
                    ? '0 0 16px oklch(0.55 0.2 292 / 40%)'
                    : 'none',
                opacity: isDisabled && !onCooldown ? 0.4 : 1,
              }}
              aria-label={`${def.nameHe}: ${def.descriptionHe}${hasCharges ? `. ${slot.charges} טעינות` : ''}${onCooldown ? `. מתקרר ${formatSeconds(cooldownMs)} שניות` : ''}`}
              aria-pressed={active}
              aria-disabled={isDisabled}
              data-testid={`power-up-${id}`}
            >
              {/* Icon */}
              <span
                className="text-xl leading-none"
                aria-hidden="true"
                style={{
                  filter: glowing ? 'drop-shadow(0 0 4px oklch(0.672 0.148 168 / 60%))' : 'none',
                }}
              >
                {def.icon}
              </span>

              {/* Hebrew name */}
              <span
                className="text-xs font-bold leading-tight"
                style={{
                  color: active
                    ? 'var(--game-accent-purple, #6C5CE7)'
                    : glowing
                      ? 'var(--game-accent-green, #00B894)'
                      : 'var(--muted-foreground)',
                }}
              >
                {def.nameHe}
              </span>

              {/* Charge count badge */}
              {hasCharges && !active && (
                <motion.span
                  key={slot.charges}
                  initial={reduceMotion ? false : { scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-[10px] font-black"
                  style={{
                    background: 'var(--game-accent-green, #00B894)',
                    color: '#0d0b1a',
                    boxShadow: '0 0 6px oklch(0.672 0.148 168 / 50%)',
                  }}
                  aria-hidden="true"
                >
                  {slot.charges}
                </motion.span>
              )}

              {/* Cooldown overlay */}
              {onCooldown && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                  style={{ background: 'oklch(0.1 0.02 290 / 75%)' }}
                  aria-hidden="true"
                >
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">
                    {formatSeconds(cooldownMs)}ש׳
                  </span>
                </motion.div>
              )}

              {/* Active pulse ring */}
              {active && !reduceMotion && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  animate={{ opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    border: '2px solid oklch(0.55 0.2 292 / 60%)',
                    boxShadow: '0 0 10px oklch(0.55 0.2 292 / 30%)',
                  }}
                  aria-hidden="true"
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground" aria-hidden="true">
        קומבו של 15 = טעינת כוח על
      </p>
    </div>
  )
}
