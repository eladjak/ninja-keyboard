import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce, memoize, throttle } from '@/lib/performance'

// ─── Debounce ────────────────────────────────────────────────────────────────

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays execution until after the specified delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(199)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('resets the timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(80)
    debounced() // reset timer
    vi.advanceTimersByTime(80)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(20)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('passes the latest arguments to the function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    debounced('second')
    debounced('third')

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('cancel prevents the pending invocation', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()
  })

  it('can be called again after cancel', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('a')
    debounced.cancel()

    debounced('b')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('b')
  })

  it('cancel is safe to call when no pending invocation', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    expect(() => debounced.cancel()).not.toThrow()
  })

  it('handles zero delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 0)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledOnce()
  })
})

// ─── Throttle ────────────────────────────────────────────────────────────────

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes immediately on the first call (leading edge)', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('suppresses calls within the limit interval', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledOnce()
  })

  it('allows a call after the limit has passed', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    vi.advanceTimersByTime(200)
    throttled()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('executes trailing call with latest arguments', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled('first')
    throttled('second')
    throttled('third')

    expect(fn).toHaveBeenCalledWith('first')

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('third')
  })

  it('cancel prevents the trailing invocation', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled('first')
    throttled('second')
    throttled.cancel()

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('first')
  })

  it('cancel resets the throttle state', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled('a')
    vi.advanceTimersByTime(100)
    throttled.cancel()

    // Should fire immediately again after cancel
    throttled('b')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('b')
  })

  it('cancel is safe to call when no pending invocation', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    expect(() => throttled.cancel()).not.toThrow()
  })
})

// ─── Memoize ─────────────────────────────────────────────────────────────────

describe('memoize', () => {
  it('returns cached result for same arguments', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(5)).toBe(10)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('computes new result for different arguments', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    expect(memoized(5)).toBe(10)
    expect(memoized(10)).toBe(20)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('handles multiple arguments', () => {
    const fn = vi.fn((a: number, b: number) => a + b)
    const memoized = memoize(fn)

    expect(memoized(1, 2)).toBe(3)
    expect(memoized(1, 2)).toBe(3)
    expect(memoized(2, 1)).toBe(3)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses custom key resolver when provided', () => {
    const fn = vi.fn((obj: { id: number; name: string }) => obj.name.toUpperCase())
    const memoized = memoize(fn, {
      keyResolver: (obj) => String(obj.id),
    })

    expect(memoized({ id: 1, name: 'alice' })).toBe('ALICE')
    // Same id, different name - should return cached
    expect(memoized({ id: 1, name: 'bob' })).toBe('ALICE')
    expect(fn).toHaveBeenCalledOnce()
  })

  it('evicts oldest entry when max cache size is exceeded', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn, { maxCacheSize: 3 })

    memoized(1)
    memoized(2)
    memoized(3)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(memoized.cacheSize).toBe(3)

    // Adding a 4th entry should evict the first (key for arg 1)
    memoized(4)
    expect(memoized.cacheSize).toBe(3)

    // Calling with 1 again should recompute
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it('clearCache removes all cached entries', () => {
    const fn = vi.fn((x: number) => x * 2)
    const memoized = memoize(fn)

    memoized(1)
    memoized(2)
    expect(memoized.cacheSize).toBe(2)

    memoized.clearCache()
    expect(memoized.cacheSize).toBe(0)

    // Should recompute after clear
    memoized(1)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('cacheSize reflects actual cache entries', () => {
    const fn = vi.fn((x: number) => x)
    const memoized = memoize(fn)

    expect(memoized.cacheSize).toBe(0)
    memoized(1)
    expect(memoized.cacheSize).toBe(1)
    memoized(1) // cached, no new entry
    expect(memoized.cacheSize).toBe(1)
    memoized(2)
    expect(memoized.cacheSize).toBe(2)
  })

  it('defaults to maxCacheSize of 100', () => {
    const fn = vi.fn((x: number) => x)
    const memoized = memoize(fn)

    for (let i = 0; i < 110; i++) {
      memoized(i)
    }

    expect(memoized.cacheSize).toBe(100)
  })

  it('handles functions returning undefined', () => {
    const fn = vi.fn(() => undefined)
    const memoized = memoize(fn)

    expect(memoized()).toBeUndefined()
    expect(memoized()).toBeUndefined()
    expect(fn).toHaveBeenCalledOnce()
  })
})
