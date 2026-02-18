'use client'

import { useCallback, useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
  '[contenteditable="true"]',
].join(', ')

interface UseFocusTrapOptions {
  /** Whether the focus trap is active. Defaults to true. */
  enabled?: boolean
  /** Callback invoked when Escape is pressed inside the trap. */
  onEscape?: () => void
  /** Whether to auto-focus the first focusable element when the trap activates. Defaults to true. */
  autoFocus?: boolean
}

/**
 * Traps focus within a container element (modal, dialog).
 * Tab / Shift+Tab cycles through focusable elements.
 * Escape key calls optional onEscape handler.
 * SSR-safe.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {},
) {
  const { enabled = true, onEscape, autoFocus = true } = options
  const containerRef = useRef<T>(null)
  const previouslyFocusedRef = useRef<Element | null>(null)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = containerRef.current
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null,
    )
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element to restore later
    previouslyFocusedRef.current = document.activeElement

    // Auto-focus first focusable element
    if (autoFocus) {
      const focusable = getFocusableElements()
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (event.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previously focused element
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [enabled, onEscape, autoFocus, getFocusableElements])

  return containerRef
}
