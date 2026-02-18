'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudentProgress, ProgressTrend } from '@/lib/teacher/dashboard-utils'
import {
  calculateProgressTrend,
  getStudentStatus,
  getTrendArrow,
  formatLastActive,
} from '@/lib/teacher/dashboard-utils'

// ── Level Labels ────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  shatil: 'שתיל',
  nevet: 'נבט',
  geza: 'גזע',
  anaf: 'ענף',
  tzameret: 'צמרת',
}

// ── Status Colors ───────────────────────────────────────────────

function getStatusBadge(status: ReturnType<typeof getStudentStatus>) {
  const map = {
    'on-track': { label: 'במסלול', variant: 'default' as const, className: 'bg-green-600' },
    'needs-attention': { label: 'דורש תשומת לב', variant: 'secondary' as const, className: 'bg-yellow-500 text-black' },
    'falling-behind': { label: 'מפגר אחרי', variant: 'destructive' as const, className: '' },
  }
  return map[status]
}

// ── Trend Colors ────────────────────────────────────────────────

function getTrendColor(trend: ProgressTrend): string {
  const colors: Record<ProgressTrend, string> = {
    improving: 'text-green-600',
    declining: 'text-red-600',
    stable: 'text-muted-foreground',
  }
  return colors[trend]
}

// ── Component ───────────────────────────────────────────────────

export interface StudentCardProps {
  student: StudentProgress
}

export function StudentCard({ student }: StudentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const status = getStudentStatus(student)
  const statusBadge = getStatusBadge(status)
  const wpmTrend = calculateProgressTrend(student.history)
  const trendArrow = getTrendArrow(wpmTrend)
  const trendColor = getTrendColor(wpmTrend)
  const levelLabel = LEVEL_LABELS[student.level] ?? student.level

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`כרטיס תלמיד: ${student.displayName}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setExpanded((prev) => !prev)
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{student.displayName}</CardTitle>
          <Badge className={statusBadge.className} variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Primary stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">מהירות:</span>
            <span className="font-semibold">{student.wpm}</span>
            <span className={`font-bold ${trendColor}`} data-testid="trend-arrow">
              {trendArrow}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">דיוק:</span>
            <span className="font-semibold">{student.accuracy}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">רמה:</span>
            <span className="font-semibold">{levelLabel}</span>
          </div>
        </div>

        {/* Secondary info row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            שיעורים: {student.currentLesson}/{student.totalLessons}
          </span>
          <span>פעילות אחרונה: {formatLastActive(student.lastActive)}</span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t pt-3 mt-2 space-y-2 text-sm" data-testid="expanded-details">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">גיל:</span>
              <span>{student.age ?? 'לא צוין'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">מגמה:</span>
              <span className={trendColor}>
                {wpmTrend === 'improving' && 'משתפר'}
                {wpmTrend === 'declining' && 'יורד'}
                {wpmTrend === 'stable' && 'יציב'}
              </span>
            </div>
            {student.history.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">היסטוריה:</span>
                <span>{student.history.length} רשומות</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
