'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface CountUpProps {
  /** The real, final value. This is what the server rendered and what must be shown. */
  value: number
  /** Optional suffix rendered inside the same element, e.g. "%". */
  suffix?: string
  /** Animation length in ms. Kept well under the "entrance" budget. */
  durationMs?: number
  className?: string
}

/** ease-out cubic — fast off the mark, settles gently on the real number. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Counts a number up from 0 to its real value once, when it first appears.
 *
 * Three rules from the wow standard, all of which matter more than the effect:
 *
 *  1. THE BASE STATE IS THE TRUTH. First render shows `value` exactly as it
 *     would without this component, so SSR, no-JS and reduced-motion users see
 *     the real number — never a 0 that never animates.
 *  2. IT LANDS ON THE REAL VALUE, not a re-rounded approximation. The final
 *     frame writes `value` itself, so the number a child reads is the number
 *     the engine computed.
 *  3. REDUCED MOTION SKIPS IT ENTIRELY — no timer is even started.
 *
 * A lesson's result screen is the emotional peak of this product: it is the
 * moment a learner finds out how they did. A number that climbs is felt; a
 * number that is simply there is only read.
 */
export function CountUp({
  value,
  suffix = '',
  durationMs = 900,
  className,
}: CountUpProps) {
  const reduceMotion = useReducedMotion()
  // Base state = final state. Never starts at 0.
  const [display, setDisplay] = useState(value)
  const ref = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    if (hasRun.current) {
      // The value changed after we already played (e.g. a retry). Show the
      // truth immediately rather than replaying a climb from zero.
      setDisplay(value)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }

    let frame = 0
    let startedAt = 0

    const run = () => {
      hasRun.current = true
      const step = (now: number) => {
        if (!startedAt) startedAt = now
        const t = Math.min((now - startedAt) / durationMs, 1)
        if (t >= 1) {
          setDisplay(value) // land on the exact value, not a rounded tween
          return
        }
        setDisplay(Math.round(easeOut(t) * value))
        frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasRun.current) {
            setDisplay(0)
            run()
            io.disconnect()
          }
        }
      },
      // threshold 0: a tall card on a phone may never reach 15% visibility.
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value, durationMs, reduceMotion])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {display}
      {suffix}
    </span>
  )
}
