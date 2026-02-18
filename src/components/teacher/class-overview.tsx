'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { StudentProgress, ClassStats } from '@/lib/teacher/dashboard-utils'
import { calculateClassStats, getStudentStatus } from '@/lib/teacher/dashboard-utils'
import { StudentCard } from './student-card'

// ── Types ────────────────────────────────────────────────────────

export interface ClassData {
  id: string
  name: string
  joinCode: string
  students: StudentProgress[]
}

export interface ClassOverviewProps {
  classData: ClassData
}

// ── Status color helper ──────────────────────────────────────────

function getStatusColor(status: ReturnType<typeof getStudentStatus>): string {
  const colors = {
    'on-track': 'bg-green-500',
    'needs-attention': 'bg-yellow-500',
    'falling-behind': 'bg-red-500',
  }
  return colors[status]
}

// ── Stat Card ────────────────────────────────────────────────────

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────

export function ClassOverview({ classData }: ClassOverviewProps) {
  const stats: ClassStats = calculateClassStats(classData.students)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{classData.name}</CardTitle>
            <CardDescription>
              קוד הצטרפות:{' '}
              <span className="font-mono font-bold text-foreground" dir="ltr">
                {classData.joinCode}
              </span>
            </CardDescription>
          </div>
          <Badge variant="outline">{stats.studentCount} תלמידים</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatItem label="מהירות ממוצעת" value={`${stats.averageWpm} מ/ד`} />
          <StatItem label="דיוק ממוצע" value={`${stats.averageAccuracy}%`} />
          <StatItem label="במסלול" value={`${stats.onTrackRate}%`} />
        </div>

        {/* Class Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">התקדמות כיתתית</span>
            <span className="font-semibold">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} aria-label="התקדמות כיתתית" />
        </div>

        {/* Status summary */}
        {classData.students.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            {(['on-track', 'needs-attention', 'falling-behind'] as const).map((status) => {
              const count = classData.students.filter(
                (s) => getStudentStatus(s) === status
              ).length
              if (count === 0) return null
              const labels = {
                'on-track': 'במסלול',
                'needs-attention': 'דורש תשומת לב',
                'falling-behind': 'מפגר',
              }
              return (
                <div key={status} className="flex items-center gap-1">
                  <div className={`size-2 rounded-full ${getStatusColor(status)}`} />
                  <span>
                    {count} {labels[status]}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Student list */}
        {classData.students.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            אין תלמידים בכיתה עדיין. שתפו את קוד ההצטרפות!
          </p>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              תלמידים ({classData.students.length})
            </h3>
            {classData.students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
