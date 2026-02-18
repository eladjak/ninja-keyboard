'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useXpStore } from '@/stores/xp-store'
import { Progress } from '@/components/ui/progress'

export default function ProgressPage() {
  const { totalXp, level, streak, completedLessons, levelProgress } =
    useXpStore()

  const completedCount = Object.keys(completedLessons).length

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-6" />
            ההתקדמות שלי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">רמה {level}</span>
              <span className="text-muted-foreground">{totalXp} XP</span>
            </div>
            <Progress value={levelProgress()} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-muted-foreground">שיעורים הושלמו</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">ימים ברצף</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{totalXp}</div>
              <div className="text-xs text-muted-foreground">נקודות XP</div>
            </div>
          </div>

          {/* Completed lessons */}
          {completedCount > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">שיעורים שהושלמו</h3>
              <div className="space-y-1">
                {Object.values(completedLessons).map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span>{lesson.lessonId}</span>
                    <div className="flex gap-3 text-muted-foreground">
                      <span>{lesson.bestWpm} מ/ד</span>
                      <span>{lesson.bestAccuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedCount === 0 && (
            <p className="text-center text-muted-foreground">
              עדיין אין תוצאות. התחל שיעור כדי לראות את ההתקדמות שלך!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
