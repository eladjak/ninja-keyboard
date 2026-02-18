import { Button } from '@/components/ui/button'
import { ClassOverview } from '@/components/teacher/class-overview'
import type { ClassData } from '@/components/teacher/class-overview'
import type { StudentProgress } from '@/lib/teacher/dashboard-utils'

// ── Mock Data (replace with Supabase fetch in production) ────────

const MOCK_STUDENTS: StudentProgress[] = [
  {
    id: '1',
    displayName: 'יעל כהן',
    age: 10,
    avatarId: 'fox',
    level: 'geza',
    currentLesson: 8,
    totalLessons: 20,
    wpm: 28,
    accuracy: 92,
    lastActive: new Date().toISOString(),
    history: [
      { date: '2026-02-10', wpm: 20, accuracy: 85 },
      { date: '2026-02-12', wpm: 22, accuracy: 88 },
      { date: '2026-02-14', wpm: 25, accuracy: 90 },
      { date: '2026-02-16', wpm: 28, accuracy: 92 },
    ],
  },
  {
    id: '2',
    displayName: 'אורי לוי',
    age: 9,
    avatarId: 'owl',
    level: 'nevet',
    currentLesson: 3,
    totalLessons: 20,
    wpm: 12,
    accuracy: 75,
    lastActive: new Date(Date.now() - 86400000 * 2).toISOString(),
    history: [
      { date: '2026-02-10', wpm: 14, accuracy: 78 },
      { date: '2026-02-14', wpm: 12, accuracy: 75 },
    ],
  },
  {
    id: '3',
    displayName: 'נועה ברק',
    age: 11,
    avatarId: 'cat',
    level: 'anaf',
    currentLesson: 14,
    totalLessons: 20,
    wpm: 42,
    accuracy: 95,
    lastActive: new Date().toISOString(),
    history: [
      { date: '2026-02-08', wpm: 35, accuracy: 90 },
      { date: '2026-02-10', wpm: 38, accuracy: 92 },
      { date: '2026-02-14', wpm: 40, accuracy: 94 },
      { date: '2026-02-17', wpm: 42, accuracy: 95 },
    ],
  },
]

const MOCK_CLASSES: ClassData[] = [
  {
    id: 'class-1',
    name: 'כיתה ד׳1',
    joinCode: 'ABCXYZ',
    students: MOCK_STUDENTS,
  },
]

// ── Page ─────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">לוח מורה</h1>
          <p className="text-muted-foreground text-sm">ניהול כיתות ומעקב אחר התקדמות תלמידים</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">הפק דו&quot;ח</Button>
          <Button>הוסף כיתה</Button>
        </div>
      </div>

      {/* Classes */}
      {MOCK_CLASSES.map((classData) => (
        <ClassOverview key={classData.id} classData={classData} />
      ))}
    </div>
  )
}
