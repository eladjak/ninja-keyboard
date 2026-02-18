'use client'

import { useCallback, useEffect, useRef } from 'react'

interface KeyboardShortcut {
  /** Key to listen for (e.g., '/', 'h', 'Escape'). */
  key: string
  /** Whether Ctrl (or Cmd on Mac) must be held. Defaults to false. */
  ctrl?: boolean
  /** Whether Shift must be held. Defaults to false. */
  shift?: boolean
  /** Whether Alt must be held. Defaults to false. */
  alt?: boolean
  /** Handler to call when the shortcut is triggered. */
  handler: (event: KeyboardEvent) => void
  /** Human-readable description for accessibility / help screen. */
  description?: string
}

interface UseKeyboardShortcutsOptions {
  /** Array of keyboard shortcuts to register. */
  shortcuts: KeyboardShortcut[]
  /** Whether shortcuts are enabled. Defaults to true. */
  enabled?: boolean
  /**
   * Whether to disable shortcuts when a text input/textarea/contenteditable
   * is focused (to prevent conflicts with typing). Defaults to true.
   */
  disableWhenTyping?: boolean
}

/** Tags that indicate the user is typing text. */
const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTypingTarget(element: Element | null): boolean {
  if (!element) return false
  if (TYPING_TAGS.has(element.tagName)) return true
  if (element.getAttribute('contenteditable') === 'true') return true
  if (element.getAttribute('role') === 'textbox') return true
  return false
}

/**
 * Global keyboard shortcuts hook.
 * Registers shortcut handlers on the document.
 * Automatically disables shortcuts when the user is typing in an input.
 * Supports Hebrew keyboard layouts (listens to `event.key`).
 * SSR-safe.
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { shortcuts, enabled = true, disableWhenTyping = true } = options
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (typeof document === 'undefined') return

      // Skip if typing in an input field
      if (disableWhenTyping && isTypingTarget(document.activeElement)) {
        return
      }

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const keyMatch = event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.handler(event)
          return
        }
      }
    },
    [disableWhenTyping],
  )

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
