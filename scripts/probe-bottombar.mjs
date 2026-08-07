/**
 * The 11-key defect class, generalised: after scrolling AS FAR AS THE PAGE
 * ALLOWS, is any interactive control still underneath the fixed bottom nav?
 * Those controls are not "reachable if you scroll" — they are unreachable.
 */
import { chromium } from '@playwright/test'
const BASE = process.argv[2] ?? 'http://localhost:3000'
const PAGES = ['/home', '/lessons', '/practice', '/shop', '/settings', '/progress', '/statistics', '/leaderboard', '/badges', '/games', '/shortcuts', '/speed-test', '/certificates', '/tips', '/drill', '/jukebox']

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()

let totalBlocked = 0
for (const path of PAGES) {
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => null)
  if (!resp || resp.status() >= 400) {
    console.log(`\n=== ${path} === -> ${resp ? resp.status() : 'ERR'} (skipped)`)
    continue
  }
  await page.waitForTimeout(500)
  // scroll to the very bottom, the best a child can do
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(700)

  const r = await page.evaluate(() => {
    const nav = document.querySelector('nav.fixed.bottom-0') || [...document.querySelectorAll('nav,div')].find((e) => {
      const cs = getComputedStyle(e)
      return cs.position === 'fixed' && cs.bottom === '0px' && e.getBoundingClientRect().height > 30
    })
    const navBox = nav ? nav.getBoundingClientRect() : null
    const atBottom =
      Math.abs(window.scrollY + innerHeight - document.documentElement.scrollHeight) < 3
    const blocked = []
    if (navBox) {
      const SEL = 'button, a[href], input, [role="button"], [role="switch"]'
      for (const el of document.querySelectorAll(SEL)) {
        if (nav.contains(el)) continue
        const b = el.getBoundingClientRect()
        if (!b.width || !b.height) continue
        if (getComputedStyle(el).visibility === 'hidden') continue
        const cx = b.left + b.width / 2
        const cy = b.top + b.height / 2
        // centre sits inside the nav band and the nav wins the hit test
        if (cy >= navBox.top && cy <= navBox.bottom && cx >= navBox.left && cx <= navBox.right) {
          const top = document.elementFromPoint(cx, cy)
          if (top && !el.contains(top) && top !== el && nav.contains(top))
            blocked.push(
              (el.getAttribute('aria-label') || el.textContent.trim() || el.tagName).slice(0, 34),
            )
        }
      }
    }
    return {
      scrollable: document.documentElement.scrollHeight > innerHeight,
      atBottom,
      navHeight: navBox ? Math.round(navBox.height) : null,
      navTop: navBox ? Math.round(navBox.top) : null,
      blocked,
    }
  })
  totalBlocked += r.blocked.length
  console.log(
    `\n=== ${path} === scrollable=${r.scrollable} scrolledToBottom=${r.atBottom} navTop=${r.navTop} navH=${r.navHeight}`,
  )
  console.log(
    `  controls still UNDER the bar at max scroll: ${r.blocked.length}` +
      (r.blocked.length ? ` -> ${JSON.stringify(r.blocked)}` : ''),
  )
}
console.log(`\nTOTAL blocked-at-max-scroll across ${PAGES.length} routes: ${totalBlocked}`)
await browser.close()
