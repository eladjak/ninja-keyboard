import { chromium } from '@playwright/test'

const baseUrl = process.env.PWA_BASE_URL ?? 'http://127.0.0.1:3000'
const browser = await chromium.launch()
const context = await browser.newContext({ locale: 'he-IL' })
const page = await context.newPage()
const pageErrors = []

page.on('pageerror', (error) => pageErrors.push(error.message))

try {
  const initialResponse = await page.goto(`${baseUrl}/home`, {
    waitUntil: 'domcontentloaded',
  })
  if (!initialResponse?.ok()) {
    throw new Error(`home returned ${initialResponse?.status() ?? 'no response'}`)
  }

  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.json')
    return { ok: response.ok, data: await response.json() }
  })
  if (!manifest.ok || manifest.data.display !== 'standalone') {
    throw new Error('manifest was not served as a standalone PWA manifest')
  }

  let installState = null
  for (let attempt = 0; attempt < 120; attempt += 1) {
    installState = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ready: false, unsupported: true }
      const registrations = await navigator.serviceWorker.getRegistrations()
      const names = await caches.keys()
      const shellName = names.find((name) => name.includes('-shell-'))
      const staticName = names.find((name) => name.includes('-static-'))
      const shell = shellName ? await caches.open(shellName) : null
      const staticCache = staticName ? await caches.open(staticName) : null
      const required = [
        ['/lessons/lesson-01', shell],
        ['/lessons/shortcut-lesson-advanced', shell],
        ['/games/word-rain', shell],
        ['/games/letter-memory', shell],
        ['/games/ninja-slice', shell],
        ['/icons/icon-192x192.png', staticCache],
      ]
      const missing = []
      for (const [url, cache] of required) {
        if (!cache || !(await cache.match(url))) missing.push(url)
      }

      return {
        ready: Boolean(
          registrations.some((registration) => registration.active) && missing.length === 0,
        ),
        workers: registrations.map((registration) => ({
          active: registration.active?.state ?? null,
          installing: registration.installing?.state ?? null,
          waiting: registration.waiting?.state ?? null,
        })),
        cacheNames: names,
        shellEntries: shell ? (await shell.keys()).length : 0,
        staticEntries: staticCache ? (await staticCache.keys()).length : 0,
        missing,
      }
    })
    if (installState.ready) break
    if (attempt % 10 === 9) {
      console.log(`[pwa] waiting for precache: ${JSON.stringify(installState)}`)
    }
    await page.waitForTimeout(1000)
  }

  if (!installState?.ready) {
    throw new Error(`service worker precache did not complete: ${JSON.stringify(installState)}`)
  }

  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready
    const cacheNames = await caches.keys()
    const cacheKeys = (
      await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          return (await cache.keys()).map((request) => request.url)
        }),
      )
    ).flat()

    return {
      scriptUrl: ready.active?.scriptURL ?? null,
      cacheNames,
      cachedApiOrSupabase: cacheKeys.filter(
        (url) => url.includes('/api/') || url.includes('supabase.co'),
      ),
    }
  })

  if (!registration.scriptUrl?.endsWith('/sw.js')) {
    throw new Error('service worker did not register at /sw.js')
  }
  if (registration.cachedApiOrSupabase.length > 0) {
    throw new Error(`unsafe cached requests: ${registration.cachedApiOrSupabase.join(', ')}`)
  }

  await context.setOffline(true)

  const offlineRoutes = [
    '/lessons',
    '/lessons/lesson-01',
    '/lessons/shortcut-lesson-advanced',
    '/games/word-rain',
    '/games/letter-memory',
    '/games/ninja-slice',
  ]

  for (const route of offlineRoutes) {
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    if (!response?.ok()) {
      throw new Error(`${route} was unavailable offline (${response?.status() ?? 'no response'})`)
    }
    await page.locator('main').waitFor({ state: 'visible' })
  }

  if (pageErrors.length > 0) {
    throw new Error(`page errors during PWA verification: ${pageErrors.join(' | ')}`)
  }

  console.log(
    JSON.stringify(
      {
        manifest: {
          name: manifest.data.name,
          startUrl: manifest.data.start_url,
          icons: manifest.data.icons.length,
        },
        serviceWorker: registration.scriptUrl,
        caches: registration.cacheNames,
        offlineRoutes,
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
