'use client'

import { motion } from 'framer-motion'
import { Users, Zap, Target, TrendingUp } from 'lucide-react'
import type { ClassStats } from '@/lib/teacher/dashboard-utils'

// ── Single stat bubble ───────────────────────────────────────────

interface StatBubbleProps {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  value: string | number
  label: string
  delay?: number
}

function StatBubble({ icon: Icon, iconColor, value, label, delay = 0 }: StatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-[var(--game-bg-elevated)] px-2 py-3"
    >
      <Icon className={`size-5 ${iconColor}`} aria-hidden />
      <span className="text-xl font-bold tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </motion.div>
  )
}

// ── Component ────────────────────────────────────────────────────

export interface ClassStatsBarProps {
  stats: ClassStats
}

export function ClassStatsBar({ stats }: ClassStatsBarProps) {
  return (
    <div
      className="flex gap-2"
      role="region"
      aria-label="סטטיסטיקות כיתה"
    >
      <StatBubble
        icon={Users}
        iconColor="text-primary"
        value={stats.studentCount}
        label="תלמידים"
        delay={0}
      />
      <StatBubble
        icon={Zap}
        iconColor="text-amber-400"
        value={`${stats.averageWpm}`}
        label="מ/ד ממוצע"
        delay={0.04}
      />
      <StatBubble
        icon={Target}
        iconColor="text-green-400"
        value={`${stats.averageAccuracy}%`}
        label="דיוק ממוצע"
        delay={0.08}
      />
      <StatBubble
        icon={TrendingUp}
        iconColor="text-purple-400"
        value={`${stats.onTrackRate}%`}
        label="במסלול"
        delay={0.12}
      />
    </div>
  )
}
