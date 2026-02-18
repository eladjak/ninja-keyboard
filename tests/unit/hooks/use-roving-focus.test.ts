import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRovingFocus } from '@/hooks/use-roving-focus'
import type React from 'react'

function createKeyboardEvent(key: string): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as React.KeyboardEvent
}

describe('useRovingFocus', () => {
  it('should initialize with the given initialIndex', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 5, initialIndex: 2 }),
    )
    expect(result.current.focusedIndex).toBe(2)
  })

  it('should default to index 0', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3 }),
    )
    expect(result.current.focusedIndex).toBe(0)
  })

  it('should return getRovingProps function', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3 }),
    )
    const props = result.current.getRovingProps(0)
    expect(props).toHaveProperty('tabIndex')
    expect(props).toHaveProperty('onKeyDown')
    expect(props).toHaveProperty('onFocus')
    expect(props).toHaveProperty('ref')
    expect(props).toHaveProperty('data-roving-index', 0)
  })

  it('should set tabIndex 0 for focused item and -1 for others', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, initialIndex: 1 }),
    )
    expect(result.current.getRovingProps(0).tabIndex).toBe(-1)
    expect(result.current.getRovingProps(1).tabIndex).toBe(0)
    expect(result.current.getRovingProps(2).tabIndex).toBe(-1)
  })

  it('should move focus down with ArrowDown in vertical mode', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical' }),
    )

    act(() => {
      const props = result.current.getRovingProps(0)
      props.onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    expect(result.current.focusedIndex).toBe(1)
  })

  it('should move focus up with ArrowUp in vertical mode', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical', initialIndex: 2 }),
    )

    act(() => {
      const props = result.current.getRovingProps(2)
      props.onKeyDown(createKeyboardEvent('ArrowUp'))
    })

    expect(result.current.focusedIndex).toBe(1)
  })

  it('should wrap from last to first with ArrowDown when wrap=true', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical', wrap: true, initialIndex: 2 }),
    )

    act(() => {
      const props = result.current.getRovingProps(2)
      props.onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    expect(result.current.focusedIndex).toBe(0)
  })

  it('should wrap from first to last with ArrowUp when wrap=true', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical', wrap: true, initialIndex: 0 }),
    )

    act(() => {
      const props = result.current.getRovingProps(0)
      props.onKeyDown(createKeyboardEvent('ArrowUp'))
    })

    expect(result.current.focusedIndex).toBe(2)
  })

  it('should NOT wrap when wrap=false', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical', wrap: false, initialIndex: 2 }),
    )

    act(() => {
      const props = result.current.getRovingProps(2)
      props.onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    // Should stay at 2
    expect(result.current.focusedIndex).toBe(2)
  })

  it('should jump to first with Home key', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 5, initialIndex: 3 }),
    )

    act(() => {
      const props = result.current.getRovingProps(3)
      props.onKeyDown(createKeyboardEvent('Home'))
    })

    expect(result.current.focusedIndex).toBe(0)
  })

  it('should jump to last with End key', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 5, initialIndex: 1 }),
    )

    act(() => {
      const props = result.current.getRovingProps(1)
      props.onKeyDown(createKeyboardEvent('End'))
    })

    expect(result.current.focusedIndex).toBe(4)
  })

  it('should reverse ArrowLeft/ArrowRight in RTL mode (horizontal)', () => {
    const { result } = renderHook(() =>
      useRovingFocus({
        itemCount: 3,
        orientation: 'horizontal',
        rtl: true,
        initialIndex: 1,
      }),
    )

    // In RTL, ArrowLeft should go FORWARD (index + 1)
    act(() => {
      const props = result.current.getRovingProps(1)
      props.onKeyDown(createKeyboardEvent('ArrowLeft'))
    })
    expect(result.current.focusedIndex).toBe(2)

    // In RTL, ArrowRight should go BACKWARD (index - 1)
    act(() => {
      const props = result.current.getRovingProps(2)
      props.onKeyDown(createKeyboardEvent('ArrowRight'))
    })
    expect(result.current.focusedIndex).toBe(1)
  })

  it('should handle ArrowRight/ArrowLeft in LTR mode (horizontal)', () => {
    const { result } = renderHook(() =>
      useRovingFocus({
        itemCount: 3,
        orientation: 'horizontal',
        rtl: false,
        initialIndex: 0,
      }),
    )

    // In LTR, ArrowRight goes forward
    act(() => {
      const props = result.current.getRovingProps(0)
      props.onKeyDown(createKeyboardEvent('ArrowRight'))
    })
    expect(result.current.focusedIndex).toBe(1)

    // In LTR, ArrowLeft goes backward
    act(() => {
      const props = result.current.getRovingProps(1)
      props.onKeyDown(createKeyboardEvent('ArrowLeft'))
    })
    expect(result.current.focusedIndex).toBe(0)
  })

  it('should ignore vertical arrows in horizontal mode', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'horizontal', initialIndex: 1 }),
    )

    act(() => {
      const props = result.current.getRovingProps(1)
      props.onKeyDown(createKeyboardEvent('ArrowDown'))
    })

    // Should not change
    expect(result.current.focusedIndex).toBe(1)
  })

  it('should ignore horizontal arrows in vertical mode', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical', initialIndex: 1 }),
    )

    act(() => {
      const props = result.current.getRovingProps(1)
      props.onKeyDown(createKeyboardEvent('ArrowRight'))
    })

    expect(result.current.focusedIndex).toBe(1)
  })

  it('should update focusedIndex via setFocusedIndex', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 5 }),
    )

    act(() => {
      result.current.setFocusedIndex(4)
    })

    expect(result.current.focusedIndex).toBe(4)
  })

  it('should call preventDefault on handled keys', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical' }),
    )

    const event = createKeyboardEvent('ArrowDown')
    act(() => {
      result.current.getRovingProps(0).onKeyDown(event)
    })

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('should NOT call preventDefault on unhandled keys', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ itemCount: 3, orientation: 'vertical' }),
    )

    const event = createKeyboardEvent('Enter')
    act(() => {
      result.current.getRovingProps(0).onKeyDown(event)
    })

    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})
