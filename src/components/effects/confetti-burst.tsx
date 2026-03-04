'use client'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

interface ConfettiBurstProps {
  /** Whether to trigger the burst */
  active: boolean
  /** Number of confetti particles */
  count?: number
}

interface Particle {
  id: number
  x: number
  delay: number
  color: string
  size: number
  rotation: number
  duration: number
}

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF', '#A29BFE', '#FF6B81']

export function ConfettiBurst({ active, count = 30 }: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  useEffect(() => {
    if (!active || reducedMotion) {
      setParticles([])
      return
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      duration: 1.2 + Math.random() * 0.8,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 2500)
    return () => clearTimeout(timer)
  }, [active, count, reducedMotion])

  if (particles.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
