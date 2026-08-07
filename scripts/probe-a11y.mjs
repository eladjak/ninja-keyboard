/**
 * Accessibility instrument: measures rather than eyeballs.
 *  - every interactive element's real hit box (44px WCAG 2.2 AA minimum)
 *  - elements physically covered by a fixed overlay (the 11-key defect class)
 *  - icon-only controls with no accessible name
 *  - axe-core violations
 */
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const BASE = process.argv[2] ?? 'http://localhost:3000'
const PAGES = [
  '/home',
  '/lessons',
  '/lessons/lesson-01',
  '/progress',
  '/settings',
  '/shop',
  '/statistics',
  '/practice',
]

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  const m = await page.evaluate(() => {
    const SEL = 'button, a[href], input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="switch"], [tabindex]:not([tabindex="-1"])'
    const els = [...document.querySelectorAll(SEL)]
    const small = []
    const covered = []
    const unnamed = []
    for (const el of els) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const label = (
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.textContent.trim() ||
        el.querySelector('img[alt]')?.getAttribute('alt') ||
        ''
      ).trim()
      const desc = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/).slice(0, 2).join('.') : ''}`
      if (r.width < 44 || r.height < 44)
        small.push({ d: desc, l: label.slice(0, 22), w: Math.round(r.width), h: Math.round(r.height) })
      if (!label) unnamed.push({ d: desc, w: Math.round(r.width), h: Math.round(r.height) })
      // Is the CENTRE of this element actually the topmost element there?
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight) {
        const top = document.elementFromPoint(cx, cy)
        if (top && top !== el && !el.contains(top) && !top.contains(el))
          covered.push({
            d: desc,
            l: label.slice(0, 18),
            by: `${top.tagName.toLowerCase()}.${(typeof top.className === 'string' ? top.className : '').split(/\s+/).slice(0, 2).join('.')}`,
          })
      }
    }
    return { total: els.length, small, covered, unnamed }
  })

  let axe = { violations: [] }
  try {
    axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
  } catch (e) {
    axe = { violations: [{ id: 'AXE_FAILED_TO_RUN: ' + e.message, nodes: [] }] }
  }

  console.log(`\n=== ${path} ===  interactive=${m.total}`)
  console.log(`  under 44px : ${m.small.length}` + (m.small.length ? ` -> ${JSON.stringify(m.small.slice(0, 6))}` : ''))
  console.log(`  covered    : ${m.covered.length}` + (m.covered.length ? ` -> ${JSON.stringify(m.covered.slice(0, 6))}` : ''))
  console.log(`  no name    : ${m.unnamed.length}` + (m.unnamed.length ? ` -> ${JSON.stringify(m.unnamed.slice(0, 6))}` : ''))
  console.log(
    `  axe        : ${axe.violations.length}` +
      (axe.violations.length
        ? ' -> ' +
          axe.violations
            .map((v) => `${v.id}(${v.nodes.length}) [${v.impact}]`)
            .join(', ')
        : ''),
  )
}
await browser.close()
