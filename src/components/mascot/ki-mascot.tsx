'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MascotMood } from '@/lib/mascot/mascot-reactions'

interface KiMascotProps {
  mood?: MascotMood
  message?: string
  messageDuration?: number
  size?: 'small' | 'large'
}

const MOOD_ANIMATIONS: Record<MascotMood, {
  animate: Record<string, number | number[]>
  transition: Record<string, unknown>
}> = {
  idle: {
    animate: { translateY: [0, -6, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  happy: {
    animate: { translateY: [0, -8, 0] },
    transition: { duration: 0.4, repeat: 2, ease: 'easeOut' },
  },
  excited: {
    animate: { translateY: [0, -14, 0], scale: [1, 1.05, 1] },
    transition: { duration: 0.35, repeat: 3, ease: 'easeOut' },
  },
  thinking: {
    animate: { rotate: [0, -5, 0] },
    transition: { duration: 0.8, repeat: 1, ease: 'easeInOut' },
  },
  sad: {
    animate: { translateY: [0, 4, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  cheering: {
    animate: { translateY: [0, -18, 0], scale: [1, 1.08, 1] },
    transition: { duration: 0.5, repeat: 2, ease: 'easeOut' },
  },
  sleeping: {
    animate: { scale: [1, 1.03, 1] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  surprised: {
    animate: { scale: [1, 1.15, 1] },
    transition: { duration: 0.2, repeat: 0, ease: 'easeOut' },
  },
}

function getEyeShape(mood: MascotMood): string {
  switch (mood) {
    case 'happy':
    case 'cheering':
      return 'M14,20 Q17,17 20,20 M28,20 Q31,17 34,20'
    case 'excited':
      return 'M14,18 A3,4 0 1,1 20,18 A3,4 0 1,1 14,18 M28,18 A3,4 0 1,1 34,18 A3,4 0 1,1 28,18'
    case 'thinking':
      return 'M15,18 A2.5,2.5 0 1,1 20,18 A2.5,2.5 0 1,1 15,18 M28,17 A2.5,3.5 0 1,1 33,17 A2.5,3.5 0 1,1 28,17'
    case 'sad':
      return 'M14,20 Q17,22 20,20 M28,20 Q31,22 34,20'
    case 'sleeping':
      return 'M14,19 L20,19 M28,19 L34,19'
    case 'surprised':
      return 'M13,18 A4,5 0 1,1 21,18 A4,5 0 1,1 13,18 M27,18 A4,5 0 1,1 35,18 A4,5 0 1,1 27,18'
    default:
      return 'M14,18 A3,3 0 1,1 20,18 A3,3 0 1,1 14,18 M28,18 A3,3 0 1,1 34,18 A3,3 0 1,1 28,18'
  }
}

export function KiMascot({
  mood = 'idle',
  message,
  messageDuration = 3000,
  size = 'small',
}: KiMascotProps) {
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    if (message) {
      setShowBubble(true)
      const timer = setTimeout(() => {
        setShowBubble(false)
      }, messageDuration)
      return () => clearTimeout(timer)
    }
    setShowBubble(false)
  }, [message, messageDuration])

  const scale = size === 'large' ? 2 : 1
  const containerSize = size === 'large' ? 120 : 60

  const moodAnimation = MOOD_ANIMATIONS[mood]

  return (
    <div
      className="relative inline-flex flex-col items-center"
      data-testid="ki-mascot"
      data-mood={mood}
      data-size={size}
    >
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            className="absolute -top-12 rounded-lg bg-white px-3 py-1.5 text-sm shadow-md dark:bg-gray-800"
            dir="rtl"
            data-testid="speech-bubble"
            initial={{ opacity: 0, scale: 0.8, translateY: 4 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: 4 }}
            transition={{ duration: 0.15 }}
            style={{ whiteSpace: 'nowrap' }}
          >
            {message}
            <div className="absolute -bottom-1 start-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white dark:bg-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={moodAnimation.animate}
        transition={moodAnimation.transition}
        style={{ width: containerSize, height: containerSize }}
      >
        <svg
          viewBox="0 0 48 48"
          width={containerSize}
          height={containerSize}
          role="img"
          aria-label="קי - הנינג'ה המלווה"
          data-testid="ninja-svg"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          {/* Head circle */}
          <circle cx="24" cy="24" r="20" fill="#2D3436" />

          {/* Headband */}
          <rect x="4" y="12" width="40" height="6" rx="2" fill="#6C5CE7" />
          {/* Headband tail */}
          <path d="M4,15 Q0,12 2,8" stroke="#6C5CE7" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M4,15 Q-1,16 1,20" stroke="#6C5CE7" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Mask area (dark band over nose/mouth) */}
          <rect x="8" y="22" width="32" height="10" rx="4" fill="#1A1A2E" />

          {/* Eyes - change shape based on mood */}
          <path
            d={getEyeShape(mood)}
            fill="white"
            data-testid="mascot-eyes"
          >
            {mood !== 'sleeping' && (
              <animate
                attributeName="opacity"
                values="1;1;0;1;1"
                dur="4s"
                repeatCount="indefinite"
                keyTimes="0;0.46;0.48;0.50;1"
              />
            )}
          </path>

          {/* Eye pupils (not for sleeping/happy-squint) */}
          {mood !== 'sleeping' && mood !== 'happy' && mood !== 'cheering' && (
            <>
              <circle cx="17" cy="18" r="1.5" fill="#2D3436" />
              <circle cx="31" cy="18" r="1.5" fill="#2D3436" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  )
}
