'use client'

import { motion } from 'framer-motion'
import type { BattleDifficulty } from '@/lib/battle/battle-engine'

interface RivalNinjaProps {
  difficulty: BattleDifficulty
  size?: number
  animated?: boolean
}

const RIVAL_CONFIG: Record<BattleDifficulty, {
  name: string
  bodyColor: string
  accentColor: string
  eyeColor: string
  headbandColor: string
}> = {
  easy: {
    name: 'Shadow',
    bodyColor: '#2D3436',
    accentColor: '#636E72',
    eyeColor: '#DFE6E9',
    headbandColor: '#636E72',
  },
  medium: {
    name: 'Storm',
    bodyColor: '#0984E3',
    accentColor: '#74B9FF',
    eyeColor: '#DBEAFE',
    headbandColor: '#0652DD',
  },
  hard: {
    name: 'Blaze',
    bodyColor: '#D63031',
    accentColor: '#FF7675',
    eyeColor: '#FFEAA7',
    headbandColor: '#E17055',
  },
}

/**
 * AI rival ninja character for battle mode.
 * 3 variants: Shadow (easy), Storm (medium), Blaze (hard).
 */
export function RivalNinja({ difficulty, size = 48, animated = true }: RivalNinjaProps) {
  const config = RIVAL_CONFIG[difficulty]

  const svgContent = (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={`${config.name} - יריב נינג'ה`}
    >
      {/* Head */}
      <circle cx="24" cy="24" r="20" fill={config.bodyColor} />

      {/* Headband */}
      <rect x="4" y="12" width="40" height="6" rx="2" fill={config.headbandColor} />
      {/* Headband tails - mirrored (on right for rival) */}
      <path d="M44,15 Q48,12 46,8" stroke={config.headbandColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M44,15 Q49,16 47,20" stroke={config.headbandColor} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Mask */}
      <rect x="8" y="22" width="32" height="10" rx="4" fill="#1A1A2E" />

      {/* Angry eyes */}
      <path d="M13,16 L20,18 L13,20 Z" fill={config.eyeColor} />
      <path d="M35,16 L28,18 L35,20 Z" fill={config.eyeColor} />

      {/* Eye glow */}
      <circle cx="17" cy="18" r="1.5" fill={config.accentColor} opacity="0.8" />
      <circle cx="31" cy="18" r="1.5" fill={config.accentColor} opacity="0.8" />

      {/* Scar for hard mode */}
      {difficulty === 'hard' && (
        <path d="M30,8 L26,16" stroke="#FFEAA7" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      )}

      {/* Electric sparks for medium */}
      {difficulty === 'medium' && (
        <>
          <path d="M6,8 L8,12 L5,11 L7,15" stroke="#74B9FF" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M42,8 L40,12 L43,11 L41,15" stroke="#74B9FF" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
        </>
      )}
    </svg>
  )

  if (!animated) return svgContent

  return (
    <motion.div
      animate={{ translateY: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {svgContent}
    </motion.div>
  )
}
