'use client'

import { useEffect } from 'react'

const CORE_OFFLINE_PATHS = new Set([
  '/home',
  '/lessons',
  '/practice',
  '/speed-test',
  '/drill',
  '/games',
  '/games/word-rain',
  '/games/letter-memory',
  '/games/ninja-slice',
  '/battle',
])

function isCoreOfflinePath(pathname: string): boolean {
  return CORE_OFFLINE_PATHS.has(pathname) || pathname.startsWith('/lessons/')
}

/**
 * Registers the production service worker and keeps core navigation reliable
 * offline. Next.js links normally request an RSC payload; when offline we force
 * a document navigation so the service worker can return the precached page.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    void navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        if (!cancelled) void registration.update()
      })
      .catch((error: unknown) => {
        // Registration failure must never block the guest flow.
        console.warn('[pwa] service worker registration failed', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleOfflineNavigation(event: MouseEvent): void {
      if (navigator.onLine || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || !isCoreOfflinePath(url.pathname)) return

      event.preventDefault()
      window.location.assign(url.href)
    }

    document.addEventListener('click', handleOfflineNavigation, true)
    return () => document.removeEventListener('click', handleOfflineNavigation, true)
  }, [])

  return <>{children}</>
}
