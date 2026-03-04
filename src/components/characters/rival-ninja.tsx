'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { BattleDifficulty } from '@/lib/battle/battle-engine'

interface RivalNinjaProps {
  difficulty: BattleDifficulty
  size?: number
  animated?: boolean
}

const RIVAL_CONFIG: Record<BattleDifficulty, {
  name: string
  nameHe: string
  image: string
  glowColor: string
}> = {
  easy: {
    name: 'Shadow',
    nameHe: 'צל',
    image: '/images/characters/shadow.jpg',
    glowColor: 'rgba(99, 110, 114, 0.4)',
  },
  medium: {
    name: 'Storm',
    nameHe: 'סערה',
    image: '/images/characters/storm.jpg',
    glowColor: 'rgba(9, 132, 227, 0.4)',
  },
  hard: {
    name: 'Blaze',
    nameHe: 'להבה',
    image: '/images/characters/blaze.jpg',
    glowColor: 'rgba(214, 48, 49, 0.4)',
  },
}

export function RivalNinja({ difficulty, size = 80, animated = true }: RivalNinjaProps) {
  const config = RIVAL_CONFIG[difficulty]

  const content = (
    <div
      className="relative flex flex-col items-center gap-2"
      data-testid={`rival-${difficulty}`}
    >
      <div
        className="overflow-hidden rounded-full border-3 border-current"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 20px ${config.glowColor}`,
          borderColor: config.glowColor,
        }}
      >
        <Image
          src={config.image}
          alt={config.nameHe}
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
      <span className="text-xs font-bold text-foreground">{config.nameHe}</span>
    </div>
  )

  if (!animated) return content

  return (
    <motion.div
      animate={{ translateY: [0, -4, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {content}
    </motion.div>
  )
}

export function getRivalName(difficulty: BattleDifficulty): string {
  return RIVAL_CONFIG[difficulty].nameHe
}
