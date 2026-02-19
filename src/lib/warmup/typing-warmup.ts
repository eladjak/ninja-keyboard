/**
 * Quick typing warmup exercises.
 * Short 30-second drills for daily warmup on the home page.
 */

export interface WarmupExercise {
  id: string
  nameHe: string
  text: string
  /** Focus area */
  focus: 'home-row' | 'top-row' | 'bottom-row' | 'common-words' | 'mixed'
}

export const WARMUP_EXERCISES: WarmupExercise[] = [
  {
    id: 'home-row-1',
    nameHe: 'שורת הבית',
    text: 'שד גכ עי חל שד גכ עי חל שד גכ',
    focus: 'home-row',
  },
  {
    id: 'home-row-2',
    nameHe: 'שורת הבית - מילים',
    text: 'יד של גד כש עד יש לך כל שלי',
    focus: 'home-row',
  },
  {
    id: 'top-row-1',
    nameHe: 'שורה עליונה',
    text: 'קר אט וי נם פר קא טו ני מפ',
    focus: 'top-row',
  },
  {
    id: 'bottom-row-1',
    nameHe: 'שורה תחתונה',
    text: 'זס בה נמ צת זס בה נמ צת',
    focus: 'bottom-row',
  },
  {
    id: 'common-1',
    nameHe: 'מילים נפוצות',
    text: 'שלום בית ילד ספר מים שמש אור חלב',
    focus: 'common-words',
  },
  {
    id: 'common-2',
    nameHe: 'משפטים קצרים',
    text: 'אני לומד להקליד. זה כיף! אני משתפר כל יום.',
    focus: 'common-words',
  },
  {
    id: 'mixed-1',
    nameHe: 'תרגול משולב',
    text: 'הנינג׳ה המהיר קופץ מעל הכלב העצלן',
    focus: 'mixed',
  },
  {
    id: 'mixed-2',
    nameHe: 'אותיות סופיות',
    text: 'לחם מים גן כלב דג פרח חלון שולחן',
    focus: 'mixed',
  },
]

/** Get a random warmup exercise */
export function getRandomWarmup(): WarmupExercise {
  return WARMUP_EXERCISES[Math.floor(Math.random() * WARMUP_EXERCISES.length)]
}

/** Get warmup by focus area */
export function getWarmupByFocus(focus: WarmupExercise['focus']): WarmupExercise[] {
  return WARMUP_EXERCISES.filter((w) => w.focus === focus)
}

/** Get today's warmup (deterministic by date) */
export function getDailyWarmup(): WarmupExercise {
  const today = new Date()
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % WARMUP_EXERCISES.length
  return WARMUP_EXERCISES[dayIndex]
}

/** Focus labels in Hebrew */
export const FOCUS_LABELS: Record<WarmupExercise['focus'], string> = {
  'home-row': 'שורת הבית',
  'top-row': 'שורה עליונה',
  'bottom-row': 'שורה תחתונה',
  'common-words': 'מילים נפוצות',
  'mixed': 'משולב',
}
