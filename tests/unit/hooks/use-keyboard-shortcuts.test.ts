import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

function pressKey(
  key: string,
  opts: Partial<KeyboardEventInit> = {},
  target?: HTMLElement,
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...opts,
  })
  ;(target ?? document).dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should register a shortcut and fire the handler', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: '/', ctrl: true, handler }],
      }),
    )

    pressKey('/', { ctrlKey: true })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not fire handler when modifier does not match', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: '/', ctrl: true, handler }],
      }),
    )

    // Press without Ctrl
    pressKey('/')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should support Shift modifier', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: '?', shift: true, handler }],
      }),
    )

    pressKey('?', { shiftKey: true })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support Alt modifier', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'h', alt: true, handler }],
      }),
    )

    pressKey('h', { altKey: true })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should clean up listeners on unmount', () => {
    const handler = vi.fn()

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
      }),
    )

    unmount()
    pressKey('k')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should not fire handler when typing in an input', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
        disableWhenTyping: true,
      }),
    )

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    pressKey('k')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should not fire handler when typing in a textarea', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
        disableWhenTyping: true,
      }),
    )

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    pressKey('k')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should fire handler when disableWhenTyping is false even in an input', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
        disableWhenTyping: false,
      }),
    )

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    pressKey('k')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not fire handler when enabled is false', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
        enabled: false,
      }),
    )

    pressKey('k')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle multiple shortcuts', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          { key: 'a', handler: handler1 },
          { key: 'b', handler: handler2 },
        ],
      }),
    )

    pressKey('a')
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).not.toHaveBeenCalled()

    pressKey('b')
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should not fire handler when typing in a contenteditable element', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
        disableWhenTyping: true,
      }),
    )

    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    document.body.appendChild(div)
    div.focus()

    pressKey('k')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should support case-insensitive key matching', () => {
    const handler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', handler }],
      }),
    )

    pressKey('K')
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
