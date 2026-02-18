import { describe, it, expect } from 'vitest'
import {
  isConsentRequired,
  getRequiredConsents,
  checkConsentStatus,
  isConsentValid,
  createConsentRecord,
  revokeConsent,
  getConsentExpiryDate,
} from '@/lib/privacy/consent-manager'
import type { ConsentRecord, ConsentType } from '@/lib/privacy/consent-manager'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRecord(
  overrides: Partial<ConsentRecord> = {},
): ConsentRecord {
  return {
    studentId: 'student-1',
    consentType: 'data_collection',
    consenterId: 'parent-1',
    consenterRole: 'parent',
    grantedAt: new Date().toISOString(),
    version: '1.0',
    ...overrides,
  }
}

// ── isConsentRequired ─────────────────────────────────────────────────────────

describe('isConsentRequired', () => {
  it('returns true for age 12 (under 13)', () => {
    expect(isConsentRequired(12)).toBe(true)
  })

  it('returns true for age 0 (infant edge case)', () => {
    expect(isConsentRequired(0)).toBe(true)
  })

  it('returns true for age 6 (youngest app user)', () => {
    expect(isConsentRequired(6)).toBe(true)
  })

  it('returns false for age 13 (exactly 13, COPPA threshold)', () => {
    expect(isConsentRequired(13)).toBe(false)
  })

  it('returns false for age 16 (teenager)', () => {
    expect(isConsentRequired(16)).toBe(false)
  })

  it('returns false for age 18 (adult)', () => {
    expect(isConsentRequired(18)).toBe(false)
  })
})

// ── getRequiredConsents ───────────────────────────────────────────────────────

describe('getRequiredConsents', () => {
  it('returns an array of consent types', () => {
    const consents = getRequiredConsents()
    expect(Array.isArray(consents)).toBe(true)
    expect(consents.length).toBeGreaterThan(0)
  })

  it('includes data_collection as a required consent', () => {
    const consents = getRequiredConsents()
    expect(consents).toContain('data_collection')
  })

  it('includes all four consent types', () => {
    const consents = getRequiredConsents()
    const expected: ConsentType[] = [
      'data_collection',
      'analytics',
      'progress_sharing',
      'teacher_view',
    ]
    for (const type of expected) {
      expect(consents).toContain(type)
    }
  })
})

// ── isConsentValid ────────────────────────────────────────────────────────────

describe('isConsentValid', () => {
  it('returns true for a fresh, un-revoked consent', () => {
    const record = makeRecord()
    expect(isConsentValid(record)).toBe(true)
  })

  it('returns false when consent has been revoked', () => {
    const record = makeRecord({ revokedAt: new Date().toISOString() })
    expect(isConsentValid(record)).toBe(false)
  })

  it('returns false when consent was granted more than 1 year ago', () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const record = makeRecord({ grantedAt: twoYearsAgo.toISOString() })
    expect(isConsentValid(record)).toBe(false)
  })

  it('returns true when consent is exactly 364 days old (not yet expired)', () => {
    const nearlyOneYear = new Date()
    nearlyOneYear.setDate(nearlyOneYear.getDate() - 364)
    const record = makeRecord({ grantedAt: nearlyOneYear.toISOString() })
    expect(isConsentValid(record)).toBe(true)
  })
})

// ── getConsentExpiryDate ──────────────────────────────────────────────────────

describe('getConsentExpiryDate', () => {
  it('returns a date exactly 1 year after grantedAt', () => {
    const grantedAt = '2024-01-15T10:00:00.000Z'
    const expiry = getConsentExpiryDate(grantedAt)
    expect(expiry).toBe('2025-01-15T10:00:00.000Z')
  })

  it('returns a valid ISO date string', () => {
    const grantedAt = new Date().toISOString()
    const expiry = getConsentExpiryDate(grantedAt)
    expect(() => new Date(expiry)).not.toThrow()
    expect(new Date(expiry).getFullYear()).toBe(new Date().getFullYear() + 1)
  })
})

// ── createConsentRecord ───────────────────────────────────────────────────────

describe('createConsentRecord', () => {
  it('creates one record per consent type', () => {
    const types: ConsentType[] = ['data_collection', 'analytics']
    const records = createConsentRecord('student-1', 'parent-1', 'parent', types)
    expect(records).toHaveLength(2)
  })

  it('assigns the correct studentId', () => {
    const records = createConsentRecord('stu-42', 'par-1', 'parent', ['data_collection'])
    expect(records[0].studentId).toBe('stu-42')
  })

  it('assigns the correct consenterId and role', () => {
    const records = createConsentRecord('s', 'p-99', 'teacher', ['teacher_view'])
    expect(records[0].consenterId).toBe('p-99')
    expect(records[0].consenterRole).toBe('teacher')
  })

  it('sets grantedAt to a recent ISO date', () => {
    const before = Date.now()
    const records = createConsentRecord('s', 'p', 'parent', ['data_collection'])
    const after = Date.now()
    const grantedMs = new Date(records[0].grantedAt).getTime()
    expect(grantedMs).toBeGreaterThanOrEqual(before)
    expect(grantedMs).toBeLessThanOrEqual(after)
  })

  it('does not set revokedAt initially', () => {
    const records = createConsentRecord('s', 'p', 'parent', ['analytics'])
    expect(records[0].revokedAt).toBeUndefined()
  })

  it('sets the consent version', () => {
    const records = createConsentRecord('s', 'p', 'parent', ['data_collection'])
    expect(typeof records[0].version).toBe('string')
    expect(records[0].version.length).toBeGreaterThan(0)
  })
})

// ── revokeConsent ─────────────────────────────────────────────────────────────

describe('revokeConsent', () => {
  it('returns a new record with revokedAt set', () => {
    const record = makeRecord()
    const revoked = revokeConsent(record)
    expect(revoked.revokedAt).toBeDefined()
    expect(typeof revoked.revokedAt).toBe('string')
  })

  it('does not mutate the original record', () => {
    const record = makeRecord()
    revokeConsent(record)
    expect(record.revokedAt).toBeUndefined()
  })

  it('sets revokedAt to a valid ISO timestamp close to now', () => {
    const before = Date.now()
    const revoked = revokeConsent(makeRecord())
    const after = Date.now()
    const revokedMs = new Date(revoked.revokedAt!).getTime()
    expect(revokedMs).toBeGreaterThanOrEqual(before)
    expect(revokedMs).toBeLessThanOrEqual(after)
  })
})

// ── checkConsentStatus ────────────────────────────────────────────────────────

describe('checkConsentStatus', () => {
  it('returns no consent when records array is empty', () => {
    const status = checkConsentStatus([])
    expect(status.hasParentalConsent).toBe(false)
    expect(status.canCollectData).toBe(false)
    expect(status.canShareWithTeacher).toBe(false)
    expect(status.canUseAnalytics).toBe(false)
  })

  it('returns true for data_collection when that consent exists and is valid', () => {
    const records = [makeRecord({ consentType: 'data_collection' })]
    const status = checkConsentStatus(records)
    expect(status.consentTypes.data_collection).toBe(true)
    expect(status.canCollectData).toBe(true)
  })

  it('returns false for a revoked consent type', () => {
    const records = [
      makeRecord({ consentType: 'analytics', revokedAt: new Date().toISOString() }),
    ]
    const status = checkConsentStatus(records)
    expect(status.consentTypes.analytics).toBe(false)
    expect(status.canUseAnalytics).toBe(false)
  })

  it('sets hasParentalConsent true when data_collection is consented', () => {
    const records = [makeRecord({ consentType: 'data_collection' })]
    const status = checkConsentStatus(records)
    expect(status.hasParentalConsent).toBe(true)
  })

  it('reflects all four consent types correctly', () => {
    const types: ConsentType[] = [
      'data_collection',
      'analytics',
      'progress_sharing',
      'teacher_view',
    ]
    const records = types.map((consentType) => makeRecord({ consentType }))
    const status = checkConsentStatus(records)
    expect(status.consentTypes.data_collection).toBe(true)
    expect(status.consentTypes.analytics).toBe(true)
    expect(status.consentTypes.progress_sharing).toBe(true)
    expect(status.consentTypes.teacher_view).toBe(true)
    expect(status.canCollectData).toBe(true)
    expect(status.canShareWithTeacher).toBe(true)
    expect(status.canUseAnalytics).toBe(true)
  })
})
