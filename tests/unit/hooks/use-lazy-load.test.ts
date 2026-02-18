import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLazyLoad } from '@/hooks/use-lazy-load'

// Mock IntersectionObserver
type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void

let mockObserverCallback: IntersectionCallback
let mockObserverOptions: IntersectionObserverInit | undefined
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  constructor(callback: IntersectionCallback, options?: IntersectionObserverInit) {
    mockObserverCallback = callback
    mockObserverOptions = options
  }
  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
}

beforeEach(() => {
  mockObserve.mockClear()
  mockUnobserve.mockClear()
  mockDisconnect.mockClear()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function simulateIntersection(isIntersecting: boolean) {
  act(() => {
    mockObserverCallback([{ isIntersecting } as IntersectionObserverEntry])
  })
}

describe('useLazyLoad', () => {
  it('returns isVisible=false and hasLoaded=false initially', () => {
    const { result } = renderHook(() => useLazyLoad())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.hasLoaded).toBe(false)
  })

  it('starts observing when ref is attached to a DOM element', () => {
    const { result } = renderHook(() => useLazyLoad())

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    expect(mockObserve).toHaveBeenCalledWith(element)
  })

  it('sets isVisible=true and hasLoaded=true when element intersects', () => {
    const { result } = renderHook(() => useLazyLoad())

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    simulateIntersection(true)

    expect(result.current.isVisible).toBe(true)
    expect(result.current.hasLoaded).toBe(true)
  })

  it('in once mode (default), stops observing after first intersection', () => {
    const { result } = renderHook(() => useLazyLoad({ once: true }))

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    simulateIntersection(true)

    expect(mockUnobserve).toHaveBeenCalledWith(element)
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('in non-once mode, continues observing after intersection', () => {
    const { result } = renderHook(() => useLazyLoad({ once: false }))

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    simulateIntersection(true)

    // Should NOT have disconnected
    expect(mockDisconnect).not.toHaveBeenCalled()

    // isVisible updates when element leaves viewport
    simulateIntersection(false)
    expect(result.current.isVisible).toBe(false)
    expect(result.current.hasLoaded).toBe(true) // hasLoaded stays true
  })

  it('hasLoaded remains true even after element leaves viewport', () => {
    const { result } = renderHook(() => useLazyLoad({ once: false }))

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    simulateIntersection(true)
    expect(result.current.hasLoaded).toBe(true)

    simulateIntersection(false)
    expect(result.current.hasLoaded).toBe(true)
  })

  it('passes threshold and rootMargin to the IntersectionObserver', () => {
    const { result } = renderHook(() =>
      useLazyLoad({ threshold: 0.5, rootMargin: '100px' }),
    )

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    expect(mockObserverOptions).toEqual({
      threshold: 0.5,
      rootMargin: '100px',
    })
  })

  it('cleans up observer on unmount', () => {
    const { result, unmount } = renderHook(() => useLazyLoad())

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('handles ref being set to null (element removed)', () => {
    const { result } = renderHook(() => useLazyLoad())

    const element = document.createElement('div')
    act(() => {
      result.current.ref(element)
    })

    act(() => {
      result.current.ref(null)
    })

    expect(mockDisconnect).toHaveBeenCalled()
  })
})
