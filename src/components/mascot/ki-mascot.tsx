'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MascotMood } from '@/lib/mascot/mascot-reactions'

interface KiMascotProps {
  mood?: MascotMood
  message?: string
  messageDuration?: number
  size?: 'small' | 'medium' | 'large'
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

// --- Eye rendering helpers (anime-style, big iris) ---

interface EyeProps {
  cx: number
  cy: number
  mood: MascotMood
}

function NinjaEye({ cx, cy, mood }: EyeProps) {
  const blinkAnim = mood !== 'sleeping'
    ? (
      <animate
        attributeName="ry"
        values="5;5;0.5;5;5"
        dur="4s"
        repeatCount="indefinite"
        keyTimes="0;0.46;0.48;0.50;1"
      />
    )
    : null

  if (mood === 'sleeping') {
    // Closed arc
    return (
      <path
        d={`M${cx - 4},${cy} Q${cx},${cy - 3} ${cx + 4},${cy}`}
        stroke="#00B894"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    )
  }

  if (mood === 'happy' || mood === 'cheering') {
    // Happy squint arc (^_^)
    return (
      <path
        d={`M${cx - 4},${cy + 1} Q${cx},${cy - 4} ${cx + 4},${cy + 1}`}
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    )
  }

  // Sizes vary by mood
  const ry = mood === 'surprised' ? 6 : mood === 'sad' ? 3.5 : 5
  const rx = mood === 'surprised' ? 4.5 : 4
  const pupilColor = mood === 'thinking' ? '#00B894' : '#6C5CE7'

  return (
    <g>
      {/* Sclera (white) */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white">
        {blinkAnim}
      </ellipse>
      {/* Iris (colored) */}
      <ellipse cx={cx} cy={cy + 1} rx={rx * 0.6} ry={ry * 0.55} fill={pupilColor}>
        {blinkAnim}
      </ellipse>
      {/* Pupil (dark) */}
      <ellipse cx={cx} cy={cy + 1} rx={rx * 0.28} ry={ry * 0.28} fill="#1A0533">
        {blinkAnim}
      </ellipse>
      {/* Highlight */}
      <ellipse cx={cx + rx * 0.2} cy={cy - ry * 0.25} rx={rx * 0.15} ry={ry * 0.12} fill="white" opacity="0.9" />
    </g>
  )
}

// Eyebrow shape per mood
function NinjaBrow({ cx, cy, mood }: { cx: number; cy: number; mood: MascotMood }) {
  if (mood === 'sleeping' || mood === 'happy' || mood === 'cheering') return null
  const offset = mood === 'sad' ? 2 : mood === 'thinking' && cx < 32 ? -3 : 0
  const tilt = mood === 'sad' ? 1.5 : mood === 'thinking' && cx < 32 ? -2 : mood === 'surprised' ? -3 : 0
  return (
    <path
      d={`M${cx - 4},${cy + offset} Q${cx},${cy + tilt + offset - 2} ${cx + 4},${cy + offset}`}
      stroke="#2D3436"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  )
}

// Shuriken star at belt level
function Shuriken({ cx, cy }: { cx: number; cy: number }) {
  const r = 3.5
  const arms = 4
  const points: string[] = []
  for (let i = 0; i < arms * 2; i++) {
    const angle = (Math.PI / arms) * i - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.42
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`)
  }
  return (
    <g>
      <polygon
        points={points.join(' ')}
        fill="#00B894"
        stroke="#007A62"
        strokeWidth="0.5"
      />
      <circle cx={cx} cy={cy} r={1.2} fill="#2D3436" />
    </g>
  )
}

// Full-body Ki ninja SVG (viewBox 0 0 64 80)
function KiNinjaSVG({ mood, containerW, containerH }: { mood: MascotMood; containerW: number; containerH: number }) {
  return (
    <svg
      viewBox="0 0 64 80"
      width={containerW}
      height={containerH}
      role="img"
      aria-label="קי - הנינג'ה המלווה"
      data-testid="ninja-svg"
      overflow="visible"
    >
      <defs>
        {/* Headband ribbon wave animation */}
        <style>{`
          @keyframes ribbon-wave {
            0%   { d: path("M 8 26 Q 4 28 5 32 Q 3 36 6 38"); }
            50%  { d: path("M 8 26 Q 2 29 4 33 Q 1 37 5 39"); }
            100% { d: path("M 8 26 Q 4 28 5 32 Q 3 36 6 38"); }
          }
          @keyframes ribbon-wave2 {
            0%   { d: path("M 8 26 Q 3 24 4 20 Q 2 16 5 14"); }
            50%  { d: path("M 8 26 Q 1 23 3 19 Q 0 15 4 13"); }
            100% { d: path("M 8 26 Q 3 24 4 20 Q 2 16 5 14"); }
          }
          .ribbon-tail-1 { animation: ribbon-wave 1.8s ease-in-out infinite; }
          .ribbon-tail-2 { animation: ribbon-wave2 2.1s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── LEGS ── */}
      {/* Left leg */}
      <rect x="19" y="57" width="10" height="16" rx="5" fill="#3D3D3D" />
      {/* Right leg */}
      <rect x="35" y="57" width="10" height="16" rx="5" fill="#3D3D3D" />
      {/* Left boot */}
      <ellipse cx="24" cy="72" rx="6" ry="4" fill="#2D3436" />
      {/* Right boot */}
      <ellipse cx="40" cy="72" rx="6" ry="4" fill="#2D3436" />

      {/* ── BODY / TORSO ── */}
      <rect x="16" y="40" width="32" height="20" rx="8" fill="#6C5CE7" />

      {/* Belt / sash */}
      <rect x="16" y="53" width="32" height="5" rx="2.5" fill="#00B894" />

      {/* Shuriken on belt */}
      <Shuriken cx={32} cy={55.5} />

      {/* ── ARMS ── */}
      {/* Left arm - raised when cheering/excited */}
      <rect
        x="6"
        y={mood === 'cheering' || mood === 'excited' ? 32 : 42}
        width="10"
        height="18"
        rx="5"
        fill="#6C5CE7"
        style={{
          transition: 'y 0.3s ease',
          transformOrigin: '11px 42px',
          transform: mood === 'cheering' || mood === 'excited' ? 'rotate(-40deg)' : 'none',
        }}
      />
      {/* Right arm */}
      <rect
        x="48"
        y={mood === 'cheering' ? 32 : 42}
        width="10"
        height="18"
        rx="5"
        fill="#6C5CE7"
        style={{
          transition: 'y 0.3s ease',
          transformOrigin: '53px 42px',
          transform: mood === 'cheering' ? 'rotate(40deg)' : 'none',
        }}
      />
      {/* Left hand */}
      <circle cx="11" cy={mood === 'cheering' || mood === 'excited' ? 48 : 58} r="4.5" fill="#2D3436" />
      {/* Right hand */}
      <circle cx="53" cy={mood === 'cheering' ? 48 : 58} r="4.5" fill="#2D3436" />

      {/* ── HEAD ── */}
      {/* Head base - chunky, rounded */}
      <ellipse cx="32" cy="24" rx="18" ry="20" fill="#2D3436" />

      {/* Ninja mask lower half */}
      <rect x="14" y="30" width="36" height="14" rx="7" fill="#1A0533" />
      {/* Mask nose bridge ridge */}
      <ellipse cx="32" cy="33" rx="5" ry="2.5" fill="#2A1050" />

      {/* Headband */}
      <rect x="12" y="20" width="40" height="7" rx="3.5" fill="#6C5CE7" />
      {/* Headband accent stripe */}
      <rect x="12" y="22" width="40" height="1.5" rx="0.75" fill="#8B7FFF" opacity="0.6" />

      {/* Ribbon tail 1 (lower) */}
      <path
        className="ribbon-tail-1"
        d="M 8 26 Q 4 28 5 32 Q 3 36 6 38"
        stroke="#6C5CE7"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ribbon tail 2 (upper) */}
      <path
        className="ribbon-tail-2"
        d="M 8 26 Q 3 24 4 20 Q 2 16 5 14"
        stroke="#8B7FFF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── EYES ── */}
      <g data-testid="mascot-eyes">
        {/* Left eye brow */}
        <NinjaBrow cx={23} cy={14} mood={mood} />
        {/* Right eye brow */}
        <NinjaBrow cx={41} cy={14} mood={mood} />

        {/* Left eye */}
        <NinjaEye cx={23} cy={21} mood={mood} />
        {/* Right eye */}
        <NinjaEye cx={41} cy={21} mood={mood} />
      </g>

      {/* Sleeping ZZZs */}
      {mood === 'sleeping' && (
        <>
          <text x="50" y="16" fontSize="6" fill="#00B894" opacity="0.9" fontWeight="bold">z</text>
          <text x="54" y="11" fontSize="8" fill="#6C5CE7" opacity="0.7" fontWeight="bold">z</text>
          <text x="59" y="5" fontSize="10" fill="#00B894" opacity="0.5" fontWeight="bold">z</text>
        </>
      )}

      {/* Surprised sparkles */}
      {mood === 'surprised' && (
        <>
          <text x="0" y="10" fontSize="10">✦</text>
          <text x="52" y="8" fontSize="8">✦</text>
          <text x="56" y="20" fontSize="6">✦</text>
        </>
      )}

      {/* Thinking bubble dots */}
      {mood === 'thinking' && (
        <>
          <circle cx="52" cy="18" r="2" fill="#6C5CE7" opacity="0.5" />
          <circle cx="56" cy="13" r="2.5" fill="#6C5CE7" opacity="0.4" />
          <circle cx="60" cy="7" r="3.5" fill="#6C5CE7" opacity="0.3" />
        </>
      )}
    </svg>
  )
}

// --- Mini image for sidebar (32px) ---
export function KiNinjaMini({ className }: { className?: string }) {
  return (
    <Image
      src="/images/characters/ki-mascot.jpg"
      alt="קי"
      width={32}
      height={32}
      className={cn('rounded-full', className)}
      style={{ display: 'inline-block' }}
    />
  )
}

// --- Image size map (square, 1:1 aspect) ---
const IMAGE_SIZE_MAP: Record<NonNullable<KiMascotProps['size']>, number> = {
  small: 40,
  medium: 64,
  large: 96,
}

// --- Main export ---
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

  const imgSize = IMAGE_SIZE_MAP[size]
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
        style={{ width: imgSize, height: imgSize }}
      >
        <Image
          src="/images/characters/ki-mascot.jpg"
          alt="Ki הנינג'ה"
          width={imgSize}
          height={imgSize}
          className="rounded-full"
          data-testid="ninja-svg"
        />
      </motion.div>
    </div>
  )
}
