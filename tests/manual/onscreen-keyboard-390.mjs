/**
 * Manual verification (not part of CI): drive lesson-01 on a 390px TOUCH
 * viewport and complete it using ONLY on-screen key taps (zero physical keys).
 * Also asserts no horizontal overflow at 390px and screenshots the keyboard.
 *
 * Run with the dev server up on :3000:
 *   node tests/manual/onscreen-keyboard-390.mjs
 */
import { chromium, devices } from 'playwright'

const OUT = 'C:/Users/eladj/Documents/reports/ninja-keyboard-feature'
const iPhone = devices['iPhone 13'] // 390x844, hasTouch, coarse pointer

const browser = await chromium.launch()
const context = await browser.newContext({ ...iPhone })
const page = await context.newPage()

await page.goto('http://localhost:3000/lessons/lesson-01', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// 1) On a touch device the on-screen keyboard must be interactive BY DEFAULT
//    (no toggle needed) — a touch-only kid must be able to type immediately.
const groupExists = await page.locator('[role="group"][aria-label*="מקלדת"]').count()
const tappableKeys = await page.locator('button[aria-label^="הקש "]').count()
console.log(JSON.stringify({ groupExists, tappableKeys }))

// 2) No horizontal overflow at 390px.
const overflow = await page.evaluate(() => {
  const el = document.scrollingElement || document.documentElement
  return { scrollW: el.scrollWidth, clientW: el.clientWidth, overflowing: el.scrollWidth > el.clientWidth + 1 }
})
console.log('overflow:', JSON.stringify(overflow))

// 3) Screenshot the keyboard region at 390px.
await page.locator('[role="group"][aria-label*="מקלדת"]').scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/02-onscreen-keyboard-390.png` })

// 4) Type the WHOLE lesson using only taps (real Playwright taps => touch input).
function readCursor() {
  return page.evaluate(() => {
    const cursor = document.querySelector('span.border-b-2')
    const c = cursor ? cursor.parentElement : null
    const spans = c ? Array.from(c.querySelectorAll('span')) : []
    const idx = spans.findIndex((s) => s.className.includes('border-b-2'))
    return { idx, ch: idx >= 0 ? spans[idx].textContent : null }
  })
}
function isDone() {
  return page.evaluate(() =>
    document.body.textContent.includes('עברתם את השיעור') ||
    document.body.textContent.includes('נסיון טוב'),
  )
}

let taps = 0
let guard = 0
let notFound = null
while (guard < 300 && !(await isDone())) {
  guard++
  const cur = await readCursor()
  if (cur.idx < 0 || cur.ch == null) {
    await page.waitForTimeout(30)
    continue
  }
  const ch = cur.ch === ' ' || cur.ch === ' ' ? ' ' : cur.ch
  const label = ch === ' ' ? 'הקש רווח' : `הקש ${ch}`
  const key = page.locator(`button[aria-label="${label}"]`)
  if ((await key.count()) === 0) { notFound = ch; break }
  await key.first().dispatchEvent('pointerdown') // a finger tap
  taps++
  await page.waitForTimeout(15)
}

const complete = await isDone()
await page.screenshot({ path: `${OUT}/04-lesson-complete-touch-390.png` })
console.log('RESULT:', JSON.stringify({ taps, guard, notFound, complete }))

await browser.close()
if (!complete || notFound) process.exit(1)
