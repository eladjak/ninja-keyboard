'use client'

/**
 * FloatingParticles — CSS-only animated background particles.
 * Small (2-4px) semi-transparent purple/teal dots that float upward with slight drift.
 * Uses transform/opacity only (per project rules). Max 20 particles for performance.
 * Respects prefers-reduced-motion via CSS media query (no JS check needed for pure CSS).
 */

interface ParticleConfig {
  id: number
  /** Horizontal position as a percentage */
  x: number
  /** Size in px (2-4) */
  size: number
  /** Animation duration in seconds */
  duration: number
  /** Animation delay in seconds */
  delay: number
  /** Color: 'purple' | 'teal' */
  color: 'purple' | 'teal'
  /** Horizontal drift direction multiplier (-1 | 1) */
  drift: -1 | 1
}

// Fixed particle definitions — generated once, never randomised at runtime.
// Spread across the viewport width with varied timings for a natural look.
const PARTICLES: ParticleConfig[] = [
  { id: 0,  x: 5,   size: 3, duration: 18, delay: 0,    color: 'purple', drift:  1 },
  { id: 1,  x: 10,  size: 2, duration: 22, delay: 3,    color: 'teal',   drift: -1 },
  { id: 2,  x: 18,  size: 4, duration: 16, delay: 7,    color: 'purple', drift:  1 },
  { id: 3,  x: 25,  size: 2, duration: 20, delay: 1,    color: 'teal',   drift: -1 },
  { id: 4,  x: 33,  size: 3, duration: 24, delay: 5,    color: 'purple', drift:  1 },
  { id: 5,  x: 40,  size: 2, duration: 19, delay: 9,    color: 'teal',   drift: -1 },
  { id: 6,  x: 47,  size: 4, duration: 21, delay: 2,    color: 'purple', drift:  1 },
  { id: 7,  x: 54,  size: 3, duration: 17, delay: 6,    color: 'teal',   drift: -1 },
  { id: 8,  x: 62,  size: 2, duration: 23, delay: 11,   color: 'purple', drift:  1 },
  { id: 9,  x: 68,  size: 4, duration: 20, delay: 4,    color: 'teal',   drift: -1 },
  { id: 10, x: 74,  size: 3, duration: 18, delay: 8,    color: 'purple', drift:  1 },
  { id: 11, x: 80,  size: 2, duration: 25, delay: 13,   color: 'teal',   drift: -1 },
  { id: 12, x: 86,  size: 3, duration: 16, delay: 2,    color: 'purple', drift:  1 },
  { id: 13, x: 91,  size: 4, duration: 22, delay: 10,   color: 'teal',   drift: -1 },
  { id: 14, x: 96,  size: 2, duration: 19, delay: 15,   color: 'purple', drift:  1 },
  { id: 15, x: 14,  size: 3, duration: 21, delay: 17,   color: 'teal',   drift:  1 },
  { id: 16, x: 56,  size: 2, duration: 26, delay: 12,   color: 'purple', drift: -1 },
  { id: 17, x: 71,  size: 4, duration: 23, delay: 19,   color: 'teal',   drift:  1 },
  { id: 18, x: 38,  size: 3, duration: 20, delay: 14,   color: 'purple', drift: -1 },
  { id: 19, x: 88,  size: 2, duration: 17, delay: 21,   color: 'teal',   drift:  1 },
]

export function FloatingParticles() {
  return (
    <div
      className="floating-particles-host pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`floating-particle floating-particle--${p.color}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift-x': `${p.drift * (8 + (p.id % 6) * 4)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
