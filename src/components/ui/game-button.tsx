'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/audio/sound-manager'

// ── Variant configuration ────────────────────────────────────────────
const VARIANT_STYLES = {
  primary: {
    bg: 'bg-gradient-to-br from-[#6C5CE7] to-[#8B7EF8]',
    border: 'border-b-[3px] border-[#4a3cb0]',
    shadow: 'shadow-[0_4px_20px_rgba(108,92,231,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]',
    hoverShadow:
      'hover:shadow-[0_6px_28px_rgba(108,92,231,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]',
    text: 'text-white',
    glow: true,
  },
  secondary: {
    bg: 'bg-gradient-to-br from-[#00B894] to-[#00d4a8]',
    border: 'border-b-[3px] border-[#007d65]',
    shadow: 'shadow-[0_4px_20px_rgba(0,184,148,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]',
    hoverShadow:
      'hover:shadow-[0_6px_28px_rgba(0,184,148,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]',
    text: 'text-white',
    glow: false,
  },
  danger: {
    bg: 'bg-gradient-to-br from-[#E17055] to-[#fd7979]',
    border: 'border-b-[3px] border-[#c0392b]',
    shadow: 'shadow-[0_4px_20px_rgba(225,112,85,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]',
    hoverShadow:
      'hover:shadow-[0_6px_28px_rgba(225,112,85,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]',
    text: 'text-white',
    glow: false,
  },
  warning: {
    bg: 'bg-gradient-to-br from-[#FDCB6E] to-[#FFEAA7]',
    border: 'border-b-[3px] border-[#d4a017]',
    shadow: 'shadow-[0_4px_20px_rgba(253,203,110,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]',
    hoverShadow:
      'hover:shadow-[0_6px_28px_rgba(253,203,110,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]',
    text: 'text-[#1A1A2E]',
    glow: false,
  },
  ghost: {
    bg: 'bg-transparent',
    border: 'border-b-[3px] border-transparent',
    shadow: 'shadow-none',
    hoverShadow: 'hover:shadow-[0_4px_20px_rgba(108,92,231,0.2)]',
    text: 'text-[var(--game-accent-purple)]',
    glow: false,
  },
} as const

type GameButtonVariant = keyof typeof VARIANT_STYLES

// ── Size configuration ───────────────────────────────────────────────
const SIZE_STYLES = {
  sm: 'min-h-[36px] px-3 py-1.5 text-sm font-bold rounded-[10px_8px_10px_8px]',
  md: 'min-h-[48px] px-5 py-2.5 text-base font-bold rounded-[14px_10px_14px_10px]',
  lg: 'min-h-[56px] px-7 py-3 text-lg font-extrabold rounded-[16px_12px_16px_12px]',
  xl: 'min-h-[64px] px-9 py-4 text-xl font-black rounded-[20px_14px_20px_14px]',
} as const

type GameButtonSize = keyof typeof SIZE_STYLES

// ── Framer Motion spring config (Brawl Stars style) ──────────────────
const SPRING_CONFIG = { type: 'spring' as const, stiffness: 400, damping: 15 }

// ── Glow pulse keyframes (CSS via Tailwind arbitrary) ─────────────────
const GLOW_PULSE_CLASS =
  'before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:animate-[game-btn-pulse_2s_ease-in-out_infinite] before:pointer-events-none before:bg-[radial-gradient(circle,rgba(108,92,231,0.3)_0%,transparent_70%)]'

// ── Props ────────────────────────────────────────────────────────────
export interface GameButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  /** Visual variant */
  variant?: GameButtonVariant
  /** Button size */
  size?: GameButtonSize
  /** Whether the button is in loading state */
  loading?: boolean
  /** Disable sound on press */
  silent?: boolean
  /** Accessible label (used as aria-label when children is not a string) */
  'aria-label'?: string
  children: React.ReactNode
}

/**
 * GameButton -- Brawl Stars-inspired asymmetric button with spring physics.
 *
 * Features:
 * - Asymmetric border-radius (different corners) for game feel
 * - 3D depth via bottom border + box-shadow
 * - Spring press animation (scale + translateY)
 * - Glow pulse on primary variant
 * - Sound integration via soundManager.playButtonClick()
 * - RTL-compatible (CSS logical properties, no directional classes)
 * - Accessible: focus-visible ring, min 48px touch target, keyboard support
 */
export function GameButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  silent = false,
  disabled,
  className,
  onClick,
  children,
  ...props
}: GameButtonProps) {
  const style = VARIANT_STYLES[variant]
  const sizeClass = SIZE_STYLES[size]
  const isDisabled = disabled || loading

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      if (!silent) {
        soundManager.playButtonClick()
      }
      onClick?.(e as never)
    },
    [isDisabled, silent, onClick],
  )

  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      // ── Spring animation ───────────────────────────────
      whileHover={
        isDisabled
          ? undefined
          : {
              y: -3,
              scale: 1.03,
              transition: { ...SPRING_CONFIG, duration: 0.15 },
            }
      }
      whileTap={
        isDisabled
          ? undefined
          : {
              scale: 0.93,
              y: 2,
              transition: { ...SPRING_CONFIG, duration: 0.12 },
            }
      }
      className={cn(
        // Base
        'relative inline-flex items-center justify-center gap-2 cursor-pointer select-none',
        'font-[var(--font-heebo)] tracking-[-0.02em]',
        'transition-shadow duration-150',
        'outline-none',
        // Focus visible ring (accessible)
        'focus-visible:ring-2 focus-visible:ring-[var(--game-accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--game-bg-primary)]',
        // Variant
        style.bg,
        style.border,
        style.shadow,
        style.hoverShadow,
        style.text,
        // Glow pulse on primary
        style.glow && !isDisabled && GLOW_PULSE_CLASS,
        // Size
        sizeClass,
        // Disabled
        isDisabled && 'pointer-events-none opacity-50 saturate-50',
        // Active state: remove bottom border illusion
        'active:border-b-0 active:mt-[3px]',
        className,
      )}
      {...props}
    >
      {/* Inner content */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {loading ? (
          <span
            className="inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
            role="status"
            aria-label="טוען..."
          />
        ) : null}
        {children}
      </span>
    </motion.button>
  )
}
