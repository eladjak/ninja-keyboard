'use client'

import { useCallback, useRef, useState } from 'react'

type Orientation = 'horizontal' | 'vertical' | 'both'

interface UseRovingFocusOptions {
  /** Total number of items in the group. */
  itemCount: number
  /** Orientation of the group. Defaults to 'vertical'. */
  orientation?: Orientation
  /** Whether arrows wrap around at boundaries. Defaults to true. */
  wrap?: boolean
  /** Whether the layout is RTL (reverses horizontal arrow keys). Defaults to false. */
  rtl?: boolean
  /** Initial focused index. Defaults to 0. */
  initialIndex?: number
}

interface RovingProps {
  tabIndex: number
  onKeyDown: (event: React.KeyboardEvent) => void
  onFocus: () => void
  ref: (el: HTMLElement | null) => void
  'data-roving-index': number
}

interface UseRovingFocusReturn {
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  getRovingProps: (index: number) => RovingProps
}

/**
 * Roving focus hook for list/grid navigation.
 * Arrow keys move focus between items. Home/End jump to first/last.
 * RTL-aware: horizontal arrows are reversed when rtl=true.
 * SSR-safe.
 */
export function useRovingFocus(options: UseRovingFocusOptions): UseRovingFocusReturn {
  const { itemCount, orientation = 'vertical', wrap = true, rtl = false, initialIndex = 0 } = options

  const [focusedIndex, setFocusedIndex] = useState(initialIndex)
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map())

  const focusItem = useCallback(
    (index: number) => {
      setFocusedIndex(index)
      const el = itemRefs.current.get(index)
      if (el) {
        el.focus()
      }
    },
    [],
  )

  const moveFocus = useCallback(
    (direction: -1 | 1) => {
      let nextIndex = focusedIndex + direction
      if (wrap) {
        if (nextIndex < 0) nextIndex = itemCount - 1
        if (nextIndex >= itemCount) nextIndex = 0
      } else {
        if (nextIndex < 0 || nextIndex >= itemCount) return
      }
      focusItem(nextIndex)
    },
    [focusedIndex, itemCount, wrap, focusItem],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let handled = false

      switch (event.key) {
        case 'ArrowUp': {
          if (orientation === 'vertical' || orientation === 'both') {
            moveFocus(-1)
            handled = true
          }
          break
        }
        case 'ArrowDown': {
          if (orientation === 'vertical' || orientation === 'both') {
            moveFocus(1)
            handled = true
          }
          break
        }
        case 'ArrowLeft': {
          if (orientation === 'horizontal' || orientation === 'both') {
            // In RTL, left arrow moves forward (next); in LTR, it moves backward (prev)
            moveFocus(rtl ? 1 : -1)
            handled = true
          }
          break
        }
        case 'ArrowRight': {
          if (orientation === 'horizontal' || orientation === 'both') {
            // In RTL, right arrow moves backward (prev); in LTR, it moves forward (next)
            moveFocus(rtl ? -1 : 1)
            handled = true
          }
          break
        }
        case 'Home': {
          focusItem(0)
          handled = true
          break
        }
        case 'End': {
          focusItem(itemCount - 1)
          handled = true
          break
        }
      }

      if (handled) {
        event.preventDefault()
      }
    },
    [orientation, rtl, moveFocus, focusItem, itemCount],
  )

  const getRovingProps = useCallback(
    (index: number): RovingProps => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      onKeyDown: handleKeyDown,
      onFocus: () => setFocusedIndex(index),
      ref: (el: HTMLElement | null) => {
        if (el) {
          itemRefs.current.set(index, el)
        } else {
          itemRefs.current.delete(index)
        }
      },
      'data-roving-index': index,
    }),
    [focusedIndex, handleKeyDown],
  )

  return {
    focusedIndex,
    setFocusedIndex,
    getRovingProps,
  }
}
