'use client'

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

interface XpFloatProps {
  /** XP amount to display */
  amount: number
  /** Trigger the animation */
  trigger: boolean
}

export function XpFloat({ amount, trigger }: XpFloatProps) {
  const [visible, setVisible] = useState(false)
  const reducedMotion = useSettingsStore((s) => s.reducedMotion)

  useEffect(() => {
    if (!trigger || amount <= 0) return

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(timer)
  }, [trigger, amount])

  if (!visible || reducedMotion) return null

  return (
    <div
      className="xp-float-text pointer-events-none absolute -top-2 start-1/2 z-50 -translate-x-1/2 text-lg font-black text-primary"
      aria-hidden="true"
    >
      +{amount} XP
    </div>
  )
}
