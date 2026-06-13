import { describe, it, expect, beforeEach } from 'vitest'
import { useCertificateCelebrationStore } from '@/stores/certificate-celebration-store'

describe('certificate-celebration-store', () => {
  beforeEach(() => {
    useCertificateCelebrationStore.setState({ celebratedLevels: [] })
  })

  it('starts with no celebrated levels', () => {
    expect(useCertificateCelebrationStore.getState().celebratedLevels).toEqual([])
  })

  it('marks a level celebrated', () => {
    useCertificateCelebrationStore.getState().markCelebrated('bronze')
    expect(
      useCertificateCelebrationStore.getState().hasCelebrated('bronze'),
    ).toBe(true)
    expect(
      useCertificateCelebrationStore.getState().hasCelebrated('silver'),
    ).toBe(false)
  })

  it('is idempotent — marking twice keeps a single entry', () => {
    const { markCelebrated } = useCertificateCelebrationStore.getState()
    markCelebrated('gold')
    markCelebrated('gold')
    expect(
      useCertificateCelebrationStore.getState().celebratedLevels,
    ).toEqual(['gold'])
  })

  it('accumulates distinct levels', () => {
    const { markCelebrated } = useCertificateCelebrationStore.getState()
    markCelebrated('bronze')
    markCelebrated('silver')
    expect(
      useCertificateCelebrationStore.getState().celebratedLevels,
    ).toEqual(['bronze', 'silver'])
  })
})
