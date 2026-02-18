import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnlineStatus } from '@/hooks/use-online-status'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fireOnline() {
  act(() => {
    window.dispatchEvent(new Event('online'))
  })
}

function fireOffline() {
  act(() => {
    window.dispatchEvent(new Event('offline'))
  })
}

// ── Setup ────────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useOnlineStatus', () => {
  it('defaults to online when navigator.onLine is true', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.isOnline).toBe(true)
  })

  it('defaults to offline when navigator.onLine is false', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.isOnline).toBe(false)
  })

  it('detects going offline via window event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.isOnline).toBe(true)

    fireOffline()
    expect(result.current.isOnline).toBe(false)
  })

  it('detects coming back online via window event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.isOnline).toBe(false)

    fireOnline()
    expect(result.current.isOnline).toBe(true)
  })

  it('sets wasOffline to false initially when online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.wasOffline).toBe(false)
  })

  it('sets wasOffline to true after going offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.wasOffline).toBe(false)

    fireOffline()
    expect(result.current.wasOffline).toBe(true)
  })

  it('keeps wasOffline true even after coming back online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())

    fireOffline()
    expect(result.current.wasOffline).toBe(true)

    fireOnline()
    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(true)
  })

  it('handles multiple offline/online cycles', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnlineStatus())

    fireOffline()
    expect(result.current.isOnline).toBe(false)
    expect(result.current.wasOffline).toBe(true)

    fireOnline()
    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(true)

    fireOffline()
    expect(result.current.isOnline).toBe(false)

    fireOnline()
    expect(result.current.isOnline).toBe(true)
    expect(result.current.wasOffline).toBe(true)
  })

  it('cleans up event listeners on unmount', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useOnlineStatus())

    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })
})
