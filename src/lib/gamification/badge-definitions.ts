/** Badge system type definitions and badge catalog for Ninja Keyboard */

export type BadgeCategory =
  | 'persistence'
  | 'accuracy'
  | 'speed'
  | 'exploration'
  | 'accessibility'
  | 'special'

export type BadgeCondition =
  | { type: 'streak'; days: number }
  | { type: 'accuracy'; minAccuracy: number }
  | { type: 'lesson_no_backspace' }
  | { type: 'modules_tried'; count: number }
  | { type: 'one_hand_lesson' }
  | { type: 'self_voicing_lesson' }
  | { type: 'focus_duration'; minutes: number }
  | { type: 'return_after_absence'; days: number }
  | { type: 'wpm_milestone'; wpm: number }
  | { type: 'lessons_completed'; count: number }
  | { type: 'first_lesson' }
  | { type: 'perfect_lesson' }

export interface BadgeDefinition {
  id: string
  nameHe: string
  nameEn: string
  description: string
  emoji: string
  image?: string
  category: BadgeCategory
  condition: BadgeCondition
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- special / onboarding ---
  {
    id: 'first-lesson',
    nameHe: 'צעד ראשון',
    nameEn: 'First Step',
    description: 'השלמת את השיעור הראשון שלך!',
    emoji: '⭐',
    image: '/images/badges/badge-first-lesson.jpg',
    category: 'special',
    condition: { type: 'first_lesson' },
  },
  {
    id: 'perfect-lesson',
    nameHe: 'מושלם',
    nameEn: 'Perfect',
    description: 'השגת דיוק של 100% בשיעור!',
    emoji: '💎',
    image: '/images/badges/badge-perfect-lesson.jpg',
    category: 'accuracy',
    condition: { type: 'perfect_lesson' },
  },

  // --- persistence ---
  {
    id: 'persistent',
    nameHe: 'מתמיד',
    nameEn: 'Persistent',
    description: '5 ימי אימון ברצף',
    emoji: '🔥',
    image: '/images/badges/badge-streak.jpg',
    category: 'persistence',
    condition: { type: 'streak', days: 5 },
  },

  // --- accuracy ---
  {
    id: 'accurate',
    nameHe: 'מדייק',
    nameEn: 'Accurate',
    description: 'השגת 95% דיוק ומעלה בשיעור',
    emoji: '🎯',
    image: '/images/badges/badge-accuracy.jpg',
    category: 'accuracy',
    condition: { type: 'accuracy', minAccuracy: 95 },
  },
  {
    id: 'patient',
    nameHe: 'סבלן',
    nameEn: 'Patient',
    description: 'השלמת שיעור ללא שימוש ב-Backspace',
    emoji: '🧘',
    image: '/images/badges/badge-patient.jpg',
    category: 'accuracy',
    condition: { type: 'lesson_no_backspace' },
  },

  // --- exploration ---
  {
    id: 'explorer',
    nameHe: 'חוקר',
    nameEn: 'Explorer',
    description: 'ניסית 3 מודולים שונים',
    emoji: '🗺️',
    image: '/images/badges/badge-10-lessons.jpg',
    category: 'exploration',
    condition: { type: 'modules_tried', count: 3 },
  },

  // --- special / focus ---
  {
    id: 'focused',
    nameHe: 'מרוכז',
    nameEn: 'Focused',
    description: 'תרגלת 5 דקות ברצף ללא הפסקה',
    emoji: '🧠',
    image: '/images/badges/badge-focused.jpg',
    category: 'special',
    condition: { type: 'focus_duration', minutes: 5 },
  },
  {
    id: 'comeback',
    nameHe: 'חוזר בתשובה',
    nameEn: 'Comeback',
    description: 'חזרת לתרגל לאחר 7 ימים של היעדרות',
    emoji: '🦅',
    image: '/images/badges/badge-7day-streak.jpg',
    category: 'persistence',
    condition: { type: 'return_after_absence', days: 7 },
  },

  // --- speed milestones ---
  {
    id: 'pilot',
    nameHe: 'טייס',
    nameEn: 'Pilot',
    description: 'הגעת ל-20 מילים לדקה',
    emoji: '✈️',
    image: '/images/badges/badge-speed.jpg',
    category: 'speed',
    condition: { type: 'wpm_milestone', wpm: 20 },
  },
  {
    id: 'rocket',
    nameHe: 'רקטה',
    nameEn: 'Rocket',
    description: 'הגעת ל-30 מילים לדקה',
    emoji: '🚀',
    image: '/images/badges/badge-speed.jpg',
    category: 'speed',
    condition: { type: 'wpm_milestone', wpm: 30 },
  },
  {
    id: 'ninja',
    nameHe: 'נינג\'ה',
    nameEn: 'Ninja',
    description: 'הגעת ל-40 מילים לדקה',
    emoji: '🥷',
    image: '/images/badges/badge-speed-50wpm.jpg',
    category: 'speed',
    condition: { type: 'wpm_milestone', wpm: 40 },
  },
]
