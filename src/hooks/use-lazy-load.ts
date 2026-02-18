'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLazyLoadOptions {
  /** Intersection threshold (0 to 1). Default: 0 */
  threshold?: number
  /** Root margin for the observer. Default: '0px' */
  rootMargin?: string
  /** If true, stop observing after first intersection. Default: true */
  once?: boolean
}

interface UseLazyLoadResult<T extends HTMLElement> {
  /** Ref to attach to the target element */
  ref: (node: T | null) => void
  /** Whether the element is currently visible in the viewport */
  isVisible: boolean
  /** Whether the element has ever been visible (useful for once mode) */
  hasLoaded: boolean
}

/**
 * Hook that uses IntersectionObserver to detect when an element enters the viewport.
 * SSR-safe: returns sensible defaults on the server.
 *
 * @param options - Configuration options
 * @returns Object with ref callback, visibility state, and loaded state
 */
export function useLazyLoad<T extends HTMLElement = HTMLElement>(
  options: UseLazyLoadOptions = {},
): UseLazyLoadResult<T> {
  const { threshold = 0, rootMargin = '0px', once = true } = options

  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const nodeRef = useRef<T | null>(null)

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  const ref = useCallback(
    (node: T | null) => {
      // Clean up previous observer
      if (nodeRef.current && observerRef.current) {
        observerRef.current.unobserve(nodeRef.current)
      }

      nodeRef.current = node

      // SSR guard
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return
      }

      if (!node) {
        cleanup()
        return
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (!entry) return

          const visible = entry.isIntersecting
          setIsVisible(visible)

          if (visible) {
            setHasLoaded(true)
            if (once && observerRef.current) {
              observerRef.current.unobserve(node)
              observerRef.current.disconnect()
              observerRef.current = null
            }
          }
        },
        { threshold, rootMargin },
      )

      observerRef.current.observe(node)
    },
    [threshold, rootMargin, once, cleanup],
  )

  // Clean up on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { ref, isVisible, hasLoaded }
}
