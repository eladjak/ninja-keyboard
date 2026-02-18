/**
 * Parental Consent Manager
 *
 * Privacy-first consent management for children under 13.
 * Complies with Israeli Privacy Law Amendment 13 + COPPA.
 *
 * Principles:
 * - Minimum data collection (name + age + email only)
 * - No advertising, no data selling
 * - Right to delete ("מחק את כל הנתונים שלי")
 * - Transparency in simple Hebrew
 * - Consents expire after 1 year (re-confirmation required)
 */

/** Age threshold below which parental consent is mandatory */
const COPPA_AGE_THRESHOLD = 13

/** Consent form version – bump when terms change to trigger re-consent */
const CURRENT_CONSENT_VERSION = '1.0'

/** How long a consent stays valid (milliseconds) */
const CONSENT_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000 // 1 year

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConsentType =
  | 'data_collection'
  | 'analytics'
  | 'progress_sharing'
  | 'teacher_view'

export interface ConsentRecord {
  studentId: string
  consentType: ConsentType
  consenterId: string
  consenterRole: 'parent' | 'teacher'
  /** ISO date string – when consent was granted */
  grantedAt: string
  /** ISO date string – when consent was revoked (undefined = still active) */
  revokedAt?: string
  /** Version of the consent form at time of granting */
  version: string
}

export interface ConsentStatus {
  hasParentalConsent: boolean
  consentTypes: Record<ConsentType, boolean>
  canCollectData: boolean
  canShareWithTeacher: boolean
  canUseAnalytics: boolean
}

// ── Pure functions ────────────────────────────────────────────────────────────

/**
 * Returns true when the student's age requires parental consent (< 13).
 */
export function isConsentRequired(age: number): boolean {
  return age < COPPA_AGE_THRESHOLD
}

/**
 * Returns the list of consent types that must be obtained from a parent/guardian.
 */
export function getRequiredConsents(): ConsentType[] {
  return ['data_collection', 'analytics', 'progress_sharing', 'teacher_view']
}

/**
 * Returns true when the given consent record is still valid:
 * - Not revoked
 * - Not older than 1 year
 */
export function isConsentValid(record: ConsentRecord): boolean {
  if (record.revokedAt !== undefined) return false

  const grantedMs = new Date(record.grantedAt).getTime()
  const expiresMs = grantedMs + CONSENT_VALIDITY_MS
  return Date.now() < expiresMs
}

/**
 * Returns the ISO expiry date string for a consent granted at grantedAt.
 * Expiry = grantedAt + 1 year.
 */
export function getConsentExpiryDate(grantedAt: string): string {
  const date = new Date(grantedAt)
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString()
}

/**
 * Creates an array of ConsentRecord objects – one per requested type.
 * Does NOT mutate any existing records.
 */
export function createConsentRecord(
  studentId: string,
  consenterId: string,
  role: 'parent' | 'teacher',
  types: ConsentType[],
): ConsentRecord[] {
  const grantedAt = new Date().toISOString()

  return types.map((consentType) => ({
    studentId,
    consentType,
    consenterId,
    consenterRole: role,
    grantedAt,
    version: CURRENT_CONSENT_VERSION,
  }))
}

/**
 * Marks a consent record as revoked. Returns a new record (immutable).
 */
export function revokeConsent(record: ConsentRecord): ConsentRecord {
  return {
    ...record,
    revokedAt: new Date().toISOString(),
  }
}

/**
 * Computes the aggregate consent status from a list of consent records.
 * Only valid (non-revoked, non-expired) records count.
 */
export function checkConsentStatus(records: ConsentRecord[]): ConsentStatus {
  const validByType: Partial<Record<ConsentType, boolean>> = {}

  for (const record of records) {
    if (isConsentValid(record)) {
      validByType[record.consentType] = true
    }
  }

  const consentTypes: Record<ConsentType, boolean> = {
    data_collection: validByType.data_collection ?? false,
    analytics: validByType.analytics ?? false,
    progress_sharing: validByType.progress_sharing ?? false,
    teacher_view: validByType.teacher_view ?? false,
  }

  const canCollectData = consentTypes.data_collection
  const hasParentalConsent = canCollectData

  return {
    hasParentalConsent,
    consentTypes,
    canCollectData,
    canShareWithTeacher: consentTypes.progress_sharing || consentTypes.teacher_view,
    canUseAnalytics: consentTypes.analytics,
  }
}
