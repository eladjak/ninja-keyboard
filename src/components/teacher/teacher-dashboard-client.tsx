'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Map, Plus, Share2, ClipboardCopy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import type { StudentProgress } from '@/lib/teacher/dashboard-utils'
import { calculateClassStats } from '@/lib/teacher/dashboard-utils'
import { ClassStatsBar } from './class-stats-bar'
import { StudentListMobile } from './student-list-mobile'
import { CharacterSkillMap } from './character-skill-map'

// ── Types ────────────────────────────────────────────────────────

export interface ClassDataClient {
  id: string
  name: string
  joinCode: string
  students: StudentProgress[]
}

export interface TeacherDashboardClientProps {
  classes: ClassDataClient[]
}

// ── Join code copy button ────────────────────────────────────────

function JoinCodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API might be blocked
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-[var(--game-border)] bg-[var(--game-bg-elevated)] px-2 py-1 font-mono text-sm font-bold tabular-nums transition-colors hover:bg-[var(--game-hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`קוד הצטרפות: ${code}. לחץ להעתקה`}
      dir="ltr"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="size-3.5 text-green-400" aria-hidden />
      ) : (
        <ClipboardCopy className="size-3.5 text-muted-foreground" aria-hidden />
      )}
    </button>
  )
}

// ── Sort selector ────────────────────────────────────────────────

type SortKey = 'status' | 'wpm' | 'name'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'status', label: 'לפי סטטוס' },
  { value: 'wpm', label: 'לפי מהירות' },
  { value: 'name', label: 'לפי שם' },
]

// ── Class Panel ──────────────────────────────────────────────────

function ClassPanel({ classData }: { classData: ClassDataClient }) {
  const [sortBy, setSortBy] = useState<SortKey>('status')
  const stats = calculateClassStats(classData.students)
  const completionRate = stats.completionRate

  const attentionCount = classData.students.filter((s) => {
    const pct = s.totalLessons > 0 ? s.currentLesson / s.totalLessons : 0
    return s.accuracy < 80 || pct < 0.3
  }).length

  return (
    <div className="space-y-4">
      {/* Class header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{classData.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>קוד הצטרפות:</span>
            <JoinCodeCopy code={classData.joinCode} />
            {attentionCount > 0 && (
              <Badge variant="outline" className="gap-1 border-yellow-500/40 text-yellow-400 text-xs">
                {attentionCount} דורשים תשומת לב
              </Badge>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Share2 className="size-3.5" aria-hidden />
          שתף דוח
        </Button>
      </div>

      {/* Stats bar */}
      <ClassStatsBar stats={stats} />

      {/* Overall progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">התקדמות כיתתית ממוצעת</span>
          <span className="font-semibold">{completionRate}%</span>
        </div>
        <Progress
          value={completionRate}
          className="h-2"
          aria-label={`התקדמות כיתתית: ${completionRate}%`}
        />
      </div>

      {/* Students list with sort */}
      <Card
        style={{ background: 'var(--game-bg-card)', borderColor: 'var(--game-border)' }}
      >
        <CardHeader className="pb-0 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              תלמידים ({classData.students.length})
            </CardTitle>
            {/* Sort buttons */}
            <div className="flex gap-1" role="group" aria-label="מיין לפי">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={`rounded-md px-2 py-0.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    sortBy === opt.value
                      ? 'bg-primary/20 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-[var(--game-hover-bg)]'
                  }`}
                  aria-pressed={sortBy === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <StudentListMobile students={classData.students} sortBy={sortBy} />
        </CardContent>
      </Card>
    </div>
  )
}

// ── No classes empty state ───────────────────────────────────────

function EmptyClasses({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <span className="text-5xl" aria-hidden>
        🏫
      </span>
      <div>
        <p className="font-semibold">עדיין אין כיתות</p>
        <p className="mt-1 text-sm text-muted-foreground">
          צרו כיתה ראשונה ושתפו את קוד ההצטרפות עם התלמידים
        </p>
      </div>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="size-4" aria-hidden />
        צור כיתה ראשונה
      </Button>
    </motion.div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function TeacherDashboardClient({ classes }: TeacherDashboardClientProps) {
  const [activeClass, setActiveClass] = useState(classes[0]?.id ?? null)

  const currentClass = classes.find((c) => c.id === activeClass)

  return (
    <div className="mx-auto max-w-2xl space-y-5" dir="rtl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">לוח מורה</h1>
          <p className="text-sm text-muted-foreground">מעקב כיתתי ומפת מיומנויות</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus className="size-3.5" aria-hidden />
          הוסף כיתה
        </Button>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="class" className="w-full">
        <TabsList className="w-full" aria-label="תצוגות לוח המורה">
          <TabsTrigger value="class" className="flex-1 gap-1.5">
            <Users className="size-4" aria-hidden />
            כיתה
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 gap-1.5">
            <Map className="size-4" aria-hidden />
            מפת מיומנויות
          </TabsTrigger>
        </TabsList>

        {/* Class tab */}
        <TabsContent value="class" className="mt-4 space-y-4">
          {classes.length === 0 ? (
            <EmptyClasses onAdd={() => {}} />
          ) : (
            <>
              {/* Class selector (when multiple classes) */}
              {classes.length > 1 && (
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="בחר כיתה"
                >
                  {classes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveClass(c.id)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        activeClass === c.id
                          ? 'border-primary bg-primary/10 font-semibold text-primary'
                          : 'border-[var(--game-border)] text-muted-foreground hover:bg-[var(--game-hover-bg)]'
                      }`}
                      aria-pressed={activeClass === c.id}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Current class */}
              {currentClass && <ClassPanel classData={currentClass} />}
            </>
          )}
        </TabsContent>

        {/* Skills map tab */}
        <TabsContent value="skills" className="mt-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              כל דמות במשחק מלמדת מיומנות הקלדה שונה. הסבר למורים ולהורים על הקשר בין הנרטיב לפדגוגיה.
            </p>
            <CharacterSkillMap />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
