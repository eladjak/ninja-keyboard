import { describe, it, expect } from 'vitest'
import {
  CERTIFICATES,
  getEarnedCertificates,
  getHighestCertificate,
  getNextCertificate,
  getCertificateProgress,
} from '@/lib/gamification/certificate'

describe('CERTIFICATES', () => {
  it('has 5 certificate levels', () => {
    expect(CERTIFICATES).toHaveLength(5)
  })

  it('certificates are in ascending order of difficulty', () => {
    for (let i = 1; i < CERTIFICATES.length; i++) {
      expect(CERTIFICATES[i].requiredLessons).toBeGreaterThanOrEqual(
        CERTIFICATES[i - 1].requiredLessons,
      )
    }
  })

  it('each certificate has required fields', () => {
    for (const cert of CERTIFICATES) {
      expect(cert.id).toBeTruthy()
      expect(cert.level).toBeTruthy()
      expect(cert.titleHe).toBeTruthy()
      expect(cert.descriptionHe).toBeTruthy()
      expect(cert.emoji).toBeTruthy()
    }
  })
})

describe('getEarnedCertificates', () => {
  it('returns empty array for new user', () => {
    const earned = getEarnedCertificates({ bestWpm: 0, bestAccuracy: 0, lessonsCompleted: 0 })
    expect(earned).toEqual([])
  })

  it('returns bronze when 5 lessons completed', () => {
    const earned = getEarnedCertificates({ bestWpm: 10, bestAccuracy: 70, lessonsCompleted: 5 })
    expect(earned).toHaveLength(1)
    expect(earned[0].level).toBe('bronze')
  })

  it('returns bronze and silver when meeting silver requirements', () => {
    const earned = getEarnedCertificates({ bestWpm: 15, bestAccuracy: 80, lessonsCompleted: 10 })
    expect(earned).toHaveLength(2)
    expect(earned[0].level).toBe('bronze')
    expect(earned[1].level).toBe('silver')
  })

  it('returns all certificates for ninja master', () => {
    const earned = getEarnedCertificates({ bestWpm: 50, bestAccuracy: 98, lessonsCompleted: 20 })
    expect(earned).toHaveLength(5)
    expect(earned[4].level).toBe('ninja-master')
  })

  it('does not earn silver if accuracy is too low', () => {
    const earned = getEarnedCertificates({ bestWpm: 20, bestAccuracy: 70, lessonsCompleted: 10 })
    expect(earned).toHaveLength(1) // Only bronze
  })
})

describe('getHighestCertificate', () => {
  it('returns null for new user', () => {
    expect(getHighestCertificate({ bestWpm: 0, bestAccuracy: 0, lessonsCompleted: 0 })).toBeNull()
  })

  it('returns the highest earned certificate', () => {
    const cert = getHighestCertificate({ bestWpm: 25, bestAccuracy: 85, lessonsCompleted: 15 })
    expect(cert).not.toBeNull()
    expect(cert!.level).toBe('gold')
  })

  it('returns ninja-master for fully completed user', () => {
    const cert = getHighestCertificate({ bestWpm: 50, bestAccuracy: 98, lessonsCompleted: 20 })
    expect(cert!.level).toBe('ninja-master')
  })
})

describe('getNextCertificate', () => {
  it('returns bronze for new user', () => {
    const next = getNextCertificate({ bestWpm: 0, bestAccuracy: 0, lessonsCompleted: 0 })
    expect(next).not.toBeNull()
    expect(next!.level).toBe('bronze')
  })

  it('returns silver after earning bronze', () => {
    const next = getNextCertificate({ bestWpm: 10, bestAccuracy: 70, lessonsCompleted: 5 })
    expect(next!.level).toBe('silver')
  })

  it('returns null when all certificates earned', () => {
    const next = getNextCertificate({ bestWpm: 50, bestAccuracy: 98, lessonsCompleted: 20 })
    expect(next).toBeNull()
  })
})

describe('getCertificateProgress', () => {
  it('returns 0 for new user toward bronze', () => {
    const progress = getCertificateProgress(CERTIFICATES[0], {
      bestWpm: 0,
      bestAccuracy: 0,
      lessonsCompleted: 0,
    })
    expect(progress).toBe(0)
  })

  it('returns 100 when certificate requirements fully met', () => {
    const progress = getCertificateProgress(CERTIFICATES[0], {
      bestWpm: 20,
      bestAccuracy: 90,
      lessonsCompleted: 10,
    })
    expect(progress).toBe(100)
  })

  it('returns partial progress', () => {
    // Silver requires 15 WPM, 80% accuracy, 10 lessons
    const progress = getCertificateProgress(CERTIFICATES[1], {
      bestWpm: 10,
      bestAccuracy: 80,
      lessonsCompleted: 5,
    })
    // Lessons: 5/10 = 50%, WPM: 10/15 = 67%, Accuracy: 80/80 = 100%
    // Average: (50 + 67 + 100) / 3 = 72
    expect(progress).toBeGreaterThan(50)
    expect(progress).toBeLessThan(100)
  })

  it('caps individual components at 100%', () => {
    const progress = getCertificateProgress(CERTIFICATES[0], {
      bestWpm: 100,
      bestAccuracy: 100,
      lessonsCompleted: 100,
    })
    expect(progress).toBe(100)
  })
})
