/**
 * Tests for useTouchDevice — decides whether the on-screen keyboard should be
 * the PRIMARY input (touch devices) or an optional toggle (desktop).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTouchDevice } from './use-touch-device'

function mockMatchMedia(coarse: boolean) {
  const listeners: Array<() => void> = []
  const mql = {
    matches: coarse,
    media: '(pointer: coarse)',
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
    // legacy
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia
  return mql
}

describe('useTouchDevice', () => {
  const originalMatchMedia = window.matchMedia
  const originalMaxTouch = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints')

  beforeEach(() => {
    // Default: no touch.
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    if (originalMaxTouch) {
      Object.defineProperty(navigator, 'maxTouchPoints', originalMaxTouch)
    }
    vi.restoreAllMocks()
  })

  it('returns false on a plain desktop (fine pointer, no touch points)', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(false)
  })

  it('returns true when the primary pointer is coarse (touch)', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(true)
  })

  it('returns true when maxTouchPoints > 0 even if pointer media is unavailable', () => {
    mockMatchMedia(false)
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    })
    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(true)
  })
})
