/**
 * Typing Certificate system.
 * Awards certificates based on milestones.
 */

export type CertificateLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'ninja-master'

export interface Certificate {
  /** Unique certificate ID */
  id: string
  /** Certificate level */
  level: CertificateLevel
  /** Hebrew title */
  titleHe: string
  /** Hebrew description */
  descriptionHe: string
  /** Emoji for the certificate */
  emoji: string
  /** Required WPM to earn */
  requiredWpm: number
  /** Required accuracy to earn */
  requiredAccuracy: number
  /** Required lessons completed */
  requiredLessons: number
}

export const CERTIFICATES: Certificate[] = [
  {
    id: 'cert-bronze',
    level: 'bronze',
    titleHe: 'תעודת ברונזה',
    descriptionHe: 'השלמת 5 שיעורים ראשונים',
    emoji: '🥉',
    requiredWpm: 0,
    requiredAccuracy: 0,
    requiredLessons: 5,
  },
  {
    id: 'cert-silver',
    level: 'silver',
    titleHe: 'תעודת כסף',
    descriptionHe: 'הגעת ל-15 מ/ד עם 80% דיוק',
    emoji: '🥈',
    requiredWpm: 15,
    requiredAccuracy: 80,
    requiredLessons: 10,
  },
  {
    id: 'cert-gold',
    level: 'gold',
    titleHe: 'תעודת זהב',
    descriptionHe: 'הגעת ל-25 מ/ד עם 85% דיוק',
    emoji: '🥇',
    requiredWpm: 25,
    requiredAccuracy: 85,
    requiredLessons: 15,
  },
  {
    id: 'cert-platinum',
    level: 'platinum',
    titleHe: 'תעודת פלטינום',
    descriptionHe: 'הגעת ל-35 מ/ד עם 90% דיוק',
    emoji: '💎',
    requiredWpm: 35,
    requiredAccuracy: 90,
    requiredLessons: 18,
  },
  {
    id: 'cert-ninja-master',
    level: 'ninja-master',
    titleHe: 'מאסטר נינג׳ה',
    descriptionHe: 'השלמת את כל 20 השיעורים עם 40+ מ/ד ו-95% דיוק',
    emoji: '🥷',
    requiredWpm: 40,
    requiredAccuracy: 95,
    requiredLessons: 20,
  },
]

/** Check which certificates a user has earned */
export function getEarnedCertificates(stats: {
  bestWpm: number
  bestAccuracy: number
  lessonsCompleted: number
}): Certificate[] {
  return CERTIFICATES.filter(
    (cert) =>
      stats.lessonsCompleted >= cert.requiredLessons &&
      stats.bestWpm >= cert.requiredWpm &&
      stats.bestAccuracy >= cert.requiredAccuracy,
  )
}

/** Get the highest earned certificate */
export function getHighestCertificate(stats: {
  bestWpm: number
  bestAccuracy: number
  lessonsCompleted: number
}): Certificate | null {
  const earned = getEarnedCertificates(stats)
  return earned.length > 0 ? earned[earned.length - 1] : null
}

/** Get the next certificate to earn */
export function getNextCertificate(stats: {
  bestWpm: number
  bestAccuracy: number
  lessonsCompleted: number
}): Certificate | null {
  for (const cert of CERTIFICATES) {
    if (
      stats.lessonsCompleted < cert.requiredLessons ||
      stats.bestWpm < cert.requiredWpm ||
      stats.bestAccuracy < cert.requiredAccuracy
    ) {
      return cert
    }
  }
  return null // All certificates earned!
}

/**
 * Detect the highest certificate that is newly earned given the current stats
 * but has not yet been celebrated. Returns null when there is nothing new to
 * celebrate. Pure — the caller owns the "already celebrated" set.
 */
export function detectNewCertificate(
  stats: { bestWpm: number; bestAccuracy: number; lessonsCompleted: number },
  celebratedLevels: readonly CertificateLevel[],
): Certificate | null {
  const earned = getEarnedCertificates(stats)
  const celebrated = new Set(celebratedLevels)
  // Earned is ordered low→high; the newest milestone to celebrate is the
  // highest earned level that has not been celebrated yet.
  for (let i = earned.length - 1; i >= 0; i--) {
    if (!celebrated.has(earned[i].level)) return earned[i]
  }
  return null
}

/** Calculate progress toward a specific certificate (0-100) */
export function getCertificateProgress(
  cert: Certificate,
  stats: { bestWpm: number; bestAccuracy: number; lessonsCompleted: number },
): number {
  const parts: number[] = []

  if (cert.requiredLessons > 0) {
    parts.push(Math.min(100, (stats.lessonsCompleted / cert.requiredLessons) * 100))
  }
  if (cert.requiredWpm > 0) {
    parts.push(Math.min(100, (stats.bestWpm / cert.requiredWpm) * 100))
  }
  if (cert.requiredAccuracy > 0) {
    parts.push(Math.min(100, (stats.bestAccuracy / cert.requiredAccuracy) * 100))
  }

  if (parts.length === 0) return 100
  return Math.round(parts.reduce((sum, p) => sum + p, 0) / parts.length)
}
