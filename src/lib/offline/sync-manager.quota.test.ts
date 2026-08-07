import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { savePendingResult, getPendingResults } from './sync-manager'
import type { SessionStats } from '@/lib/typing-engine/types'

const stats: SessionStats = {
  wpm: 22,
  accuracy: 94,
  totalKeystrokes: 100,
  correctKeystrokes: 94,
  errorKeystrokes: 6,
  durationMs: 60_000,
  keyAccuracy: {},
}

describe('a completed lesson is never reported as queued when it was dropped', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('returns null when storage is full', () => {
    // The school-tablet case: disk full, setItem throws QuotaExceededError.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(savePendingResult('lesson-01', stats)).toBeNull()
  })

  it('does not fire the "queue changed" event on a failed write', () => {
    const listener = vi.fn()
    window.addEventListener('ninja:pending-results-changed', listener)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    savePendingResult('lesson-01', stats)

    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener('ninja:pending-results-changed', listener)
  })

  // Counter-control: `return null` unconditionally would pass both tests above
  // while breaking every offline save.
  it('CONTROL: a normal write still queues the result and fires the event', () => {
    const listener = vi.fn()
    window.addEventListener('ninja:pending-results-changed', listener)

    const saved = savePendingResult('lesson-01', stats)

    expect(saved).not.toBeNull()
    expect(saved?.lessonId).toBe('lesson-01')
    expect(getPendingResults()).toHaveLength(1)
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener('ninja:pending-results-changed', listener)
  })
})
