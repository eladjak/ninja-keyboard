import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

interface ManifestIcon {
  src: string
  sizes: string
  type: string
  purpose: string
}

interface WebManifest {
  id: string
  name: string
  short_name: string
  start_url: string
  scope: string
  display: string
  dir: string
  lang: string
  theme_color: string
  background_color: string
  icons: ManifestIcon[]
}

async function readManifest(): Promise<WebManifest> {
  const raw = await readFile(path.join(ROOT, 'public', 'manifest.json'), 'utf8')
  return JSON.parse(raw) as WebManifest
}

async function readPngDimensions(relativePath: string): Promise<[number, number]> {
  const buffer = await readFile(path.join(ROOT, 'public', relativePath))
  expect(buffer.subarray(1, 4).toString('ascii')).toBe('PNG')
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
}

describe('PWA manifest', () => {
  it('declares the Hebrew standalone app and brand launch colors', async () => {
    const manifest = await readManifest()

    expect(manifest).toMatchObject({
      id: '/home',
      start_url: '/home?source=pwa',
      scope: '/',
      display: 'standalone',
      dir: 'rtl',
      lang: 'he',
      theme_color: '#6C5CE7',
      background_color: '#6C5CE7',
    })
    expect(manifest.name).toContain("נינג'ה")
    expect(manifest.short_name).toBe("נינג'ה")
  })

  it('references real 192px, 512px, and maskable PNG icons', async () => {
    const manifest = await readManifest()
    const expected = [
      ['/icons/icon-192x192.png', '192x192', 'any'],
      ['/icons/icon-512x512.png', '512x512', 'any'],
      ['/icons/maskable-icon-512x512.png', '512x512', 'maskable'],
    ] as const

    for (const [src, sizes, purpose] of expected) {
      expect(manifest.icons).toContainEqual({
        src,
        sizes,
        purpose,
        type: 'image/png',
      })
      const size = Number(sizes.split('x')[0])
      await expect(readPngDimensions(src.slice(1))).resolves.toEqual([size, size])
    }
  })
})

describe('service worker safety contract', () => {
  it('uses revisioned caches and deletes old revisions on activate', async () => {
    const source = await readFile(path.join(ROOT, 'public', 'sw.js'), 'utf8')

    expect(source).toMatch(/BUILD_VERSION = '[a-f0-9]{12}'/)
    expect(source).not.toContain('__BUILD_VERSION__')
    expect(source).toContain("self.addEventListener('activate'")
    expect(source).toContain('!CURRENT_CACHES.has(name)')
    expect(source).toContain('caches.delete(name)')
  })

  it('keeps HTML network-first and same-origin static assets cache-first', async () => {
    const source = await readFile(path.join(ROOT, 'public', 'sw.js'), 'utf8')

    expect(source).toContain('networkFirstPage(request, url)')
    expect(source).toContain('cacheFirstStatic(request)')
    expect(source).toContain("request.mode === 'navigate'")
    expect(source).toContain("url.pathname.startsWith('/_next/static/')")
  })

  it('never caches API, auth, RSC, sensitive-header, or Supabase traffic', async () => {
    const source = await readFile(path.join(ROOT, 'public', 'sw.js'), 'utf8')

    for (const marker of [
      "'/api'",
      "'/auth'",
      "'/auth/v1'",
      "'/rest/v1'",
      "'authorization'",
      "'apikey'",
      "'supabase.co'",
      "url.searchParams.has('_rsc')",
    ]) {
      expect(source).toContain(marker)
    }
  })

  it('precaches every bundled lesson and all three mini-game routes', async () => {
    const source = await readFile(path.join(ROOT, 'public', 'sw.js'), 'utf8')

    expect(source).toContain('/lessons/lesson-')
    expect(source).toContain("'/lessons/shortcut-lesson-advanced'")
    expect(source).toContain("'/games/word-rain'")
    expect(source).toContain("'/games/letter-memory'")
    expect(source).toContain("'/games/ninja-slice'")
  })
})
