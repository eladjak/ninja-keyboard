import type { StudentProgress } from '@/lib/teacher/dashboard-utils'
import { TeacherDashboardClient } from '@/components/teacher/teacher-dashboard-client'
import type { ClassDataClient } from '@/components/teacher/teacher-dashboard-client'

// ── Mock Data (replace with Supabase fetch in production) ─────────

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
  {
    id: '4',
    displayName: 'דניאל אלחרר',
    age: 10,
    avatarId: 'rabbit',
    level: 'geza',
    currentLesson: 5,
    totalLessons: 20,
    wpm: 18,
    accuracy: 68,
    lastActive: new Date(Date.now() - 86400000 * 5).toISOString(),
    history: [
      { date: '2026-02-05', wpm: 20, accuracy: 72 },
      { date: '2026-02-10', wpm: 18, accuracy: 68 },
    ],
  },
  {
    id: '5',
    displayName: 'תמר שפירא',
    age: 11,
    avatarId: 'butterfly',
    level: 'geza',
    currentLesson: 11,
    totalLessons: 20,
    wpm: 35,
    accuracy: 88,
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { date: '2026-02-12', wpm: 28, accuracy: 82 },
      { date: '2026-02-14', wpm: 30, accuracy: 85 },
      { date: '2026-02-17', wpm: 35, accuracy: 88 },
    ],
  },
]

const MOCK_CLASSES: ClassDataClient[] = [
  {
    id: 'class-1',
    name: 'כיתה ד׳1',
    joinCode: 'NINJA42',
    students: MOCK_STUDENTS,
  },
]

// ── Page ──────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  return <TeacherDashboardClient classes={MOCK_CLASSES} />
}
