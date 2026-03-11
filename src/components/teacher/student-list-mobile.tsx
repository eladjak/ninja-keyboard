'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  BookOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { StudentProgress } from '@/lib/teacher/dashboard-utils'
import {
  getStudentStatus,
  calculateProgressTrend,
  formatLastActive,
} from '@/lib/teacher/dashboard-utils'
import { cn } from '@/lib/utils'

// ── Level labels ─────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  shatil: 'שתיל',
  nevet: 'נבט',
  geza: 'גזע',
  anaf: 'ענף',
  tzameret: 'צמרת',
}

const AVATAR_EMOJIS: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  turtle: '🐢',
  dolphin: '🐬',
  butterfly: '🦋',
}

// ── Status helpers ───────────────────────────────────────────────

type StudentStatus = 'on-track' | 'needs-attention' | 'falling-behind'

function StatusBadge({ status }: { status: StudentStatus }) {
  const config = {
    'on-track': {
      label: 'במסלול',
      icon: CheckCircle2,
      className: 'bg-green-600/20 text-green-400 border-green-600/30',
    },
    'needs-attention': {
      label: 'דורש תשומת לב',
      icon: AlertTriangle,
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    'falling-behind': {
      label: 'מפגר',
      icon: AlertTriangle,
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  }[status]

  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1 text-[10px] font-medium', config.className)}>
      <Icon className="size-3" aria-hidden />
      {config.label}
    </Badge>
  )
}

// ── Trend icon ───────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: 'improving' | 'declining' | 'stable' }) {
  if (trend === 'improving') {
    return <TrendingUp className="size-3.5 text-green-400" aria-label="משתפר" />
  }
  if (trend === 'declining') {
    return <TrendingDown className="size-3.5 text-red-400" aria-label="יורד" />
  }
  return <Minus className="size-3.5 text-muted-foreground" aria-label="יציב" />
}

// ── Quick Actions ────────────────────────────────────────────────

interface QuickActionsProps {
  studentName: string
}

function QuickActions({ studentName }: QuickActionsProps) {
  const [sent, setSent] = useState(false)

  function handleEncourage() {
    // TODO: hook up to notification/messaging system
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        variant="outline"
        className="h-8 flex-1 gap-1.5 text-xs"
        onClick={handleEncourage}
        aria-label={`שלח עידוד ל${studentName}`}
      >
        <MessageCircle className="size-3.5" aria-hidden />
        {sent ? '✓ נשלח!' : 'שלח עידוד'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 flex-1 gap-1.5 text-xs"
        aria-label={`הקצה שיעור ל${studentName}`}
      >
        <BookOpen className="size-3.5" aria-hidden />
        הקצה שיעור
      </Button>
    </div>
  )
}

// ── Student Row ──────────────────────────────────────────────────

interface StudentRowProps {
  student: StudentProgress
  index: number
}

function StudentRow({ student, index }: StudentRowProps) {
  const [expanded, setExpanded] = useState(false)
  const status = getStudentStatus(student)
  const trend = calculateProgressTrend(student.history)
  const completionPct =
    student.totalLessons > 0
      ? Math.round((student.currentLesson / student.totalLessons) * 100)
      : 0
  const levelLabel = LEVEL_LABELS[student.level] ?? student.level
  const avatarEmoji = AVATAR_EMOJIS[student.avatarId] ?? '🥷'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
    >
      <div
        className="border-b border-[var(--game-border)] last:border-0"
        role="listitem"
      >
        {/* Summary row — always visible */}
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 px-4 py-3 text-start transition-colors',
            'hover:bg-[var(--game-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
          )}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`תלמיד: ${student.displayName}, ${status === 'on-track' ? 'במסלול' : status === 'needs-attention' ? 'דורש תשומת לב' : 'מפגר'}`}
        >
          {/* Avatar */}
          <span className="text-xl" aria-hidden>
            {avatarEmoji}
          </span>

          {/* Main info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{student.displayName}</span>
              <StatusBadge status={status} />
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendIcon trend={trend} />
                {student.wpm} מ/ד
              </span>
              <span>{student.accuracy}% דיוק</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {formatLastActive(student.lastActive)}
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          {expanded ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
        </button>

        {/* Expanded details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-3 px-4 pb-4">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-[var(--game-bg-elevated)] p-3 text-center">
                  <div>
                    <p className="text-lg font-bold tabular-nums">{student.wpm}</p>
                    <p className="text-[10px] text-muted-foreground">מ/ד</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tabular-nums">{student.accuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">דיוק</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{levelLabel}</p>
                    <p className="text-[10px] text-muted-foreground">רמה</p>
                  </div>
                </div>

                {/* Lesson progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">שיעורים</span>
                    <span className="font-semibold">
                      {student.currentLesson}/{student.totalLessons} ({completionPct}%)
                    </span>
                  </div>
                  <Progress
                    value={completionPct}
                    className="h-1.5"
                    aria-label={`התקדמות שיעורים: ${completionPct}%`}
                  />
                </div>

                {/* Quick actions */}
                <QuickActions studentName={student.displayName} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export interface StudentListMobileProps {
  students: StudentProgress[]
  /** Sort order */
  sortBy?: 'name' | 'wpm' | 'status'
}

export function StudentListMobile({ students, sortBy = 'status' }: StudentListMobileProps) {
  const sorted = [...students].sort((a, b) => {
    if (sortBy === 'wpm') return b.wpm - a.wpm
    if (sortBy === 'name') return a.displayName.localeCompare(b.displayName, 'he')
    // status: falling-behind first, then needs-attention, then on-track
    const statusOrder = { 'falling-behind': 0, 'needs-attention': 1, 'on-track': 2 }
    return statusOrder[getStudentStatus(a)] - statusOrder[getStudentStatus(b)]
  })

  if (sorted.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p className="text-4xl" aria-hidden>
          👥
        </p>
        <p className="mt-2 text-sm">אין תלמידים עדיין</p>
        <p className="text-xs">שתפו את קוד ההצטרפות כדי להוסיף תלמידים</p>
      </div>
    )
  }

  return (
    <div
      role="list"
      aria-label={`רשימת תלמידים (${sorted.length})`}
    >
      {sorted.map((student, i) => (
        <StudentRow key={student.id} student={student} index={i} />
      ))}
    </div>
  )
}
