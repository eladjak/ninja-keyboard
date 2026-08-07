/**
 * Entry-splash verification harness.
 *
 * Every assertion has a CONTROL ARM — a state in which it must FAIL — so a green
 * run means the harness is actually looking at what it claims to measure. The
 * failure guarded against is not "the splash is broken"; it is "the check passes
 * for a reason unrelated to the splash".
 *
 * It asserts VISIBILITY, not DOM presence: the overlay is server-rendered once
 * and lives permanently at `display:none`, driven by a class on <html>. Counting
 * nodes would report a permanent pass and a permanent fail respectively, and
 * measure nothing.
 *
 * Page errors are a first-class assertion. The real defect found on 7.8.2026 was
 * a React hydration mismatch that silently re-rendered the tree and undid the
 * gate — invisible to any check that only looked at the splash.
 *
 * Usage: node scripts/verify-entry-splash.mjs <baseUrl> <appPath> <overlayId> <outDir>
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [, , BASE, APP_PATH, OVERLAY_ID, OUT] = process.argv
if (!BASE || !APP_PATH || !OVERLAY_ID || !OUT) {
  console.error('usage: <baseUrl> <appPath> <overlayId> <outDir>')
  process.exit(2)
}
mkdirSync(OUT, { recursive: true })

const results = []
const check = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const url = BASE + APP_PATH
const sel = `#${OVERLAY_ID}`
const browser = await chromium.launch()

/** Open a page that records its own page errors. */
async function openPage(ctx) {
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(e.message.split('\n')[0].slice(0, 80)))
  return page
}

/** Is the overlay actually showing? Absent counts as not showing. */
const shown = (page) =>
  page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return { visible: false, reason: 'absent' }
    const cs = getComputedStyle(el)
    return {
      visible: cs.display !== 'none' && Number(cs.opacity) > 0.05,
      display: cs.display,
      opacity: cs.opacity,
      pointerEvents: cs.pointerEvents,
    }
  }, sel)

// ─── 1. FIRST VISIT ─────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } })
  const page = await openPage(ctx)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700) // mid-entrance, not at rest
  const s = await shown(page)
  await page.screenshot({ path: `${OUT}/1-first-visit.png` })
  check('first visit: splash is showing', s.visible, JSON.stringify(s))
  // The non-negotiable: it must NEVER swallow a click.
  check(
    'never blocks interaction',
    s.pointerEvents === 'none',
    `pointer-events=${s.pointerEvents}`,
  )

  await page.waitForTimeout(2600)
  const after = await shown(page)
  await page.screenshot({ path: `${OUT}/2-after-entrance.png` })
  check('gets out of the way when done', !after.visible, JSON.stringify(after))
  check(
    'no page errors (hydration intact)',
    page.errors.length === 0,
    page.errors.join(' | ') || 'none',
  )

  // ─── 2. SECOND VISIT: must not play ───────────────────────────────────────
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const second = await shown(page)
  await page.screenshot({ path: `${OUT}/3-second-visit.png` })
  check(
    'second visit: no splash (never delays a returning user)',
    !second.visible,
    JSON.stringify(second),
  )
  await ctx.close()
}

// ─── 3. REDUCED MOTION, fresh storage ───────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 860 },
    reducedMotion: 'reduce',
  })
  const page = await openPage(ctx)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const s = await shown(page)
  await page.screenshot({ path: `${OUT}/4-reduced-motion.png` })
  check('reduced-motion: splash never shows', !s.visible, JSON.stringify(s))
  // Control for the flag itself — otherwise this passes on a plain context.
  const rm = await page.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  check('CONTROL: context really is reduced-motion', rm === true, `matches=${rm}`)
  await ctx.close()
}

// ─── 4. CONTROL: a fresh browser must play it again ─────────────────────────
// Without this, "second visit shows nothing" could be true because the splash
// never works at all.
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 860 } })
  const page = await openPage(ctx)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  const s = await shown(page)
  check(
    'CONTROL: fresh browser plays it again (the gate is the reason, not breakage)',
    s.visible,
    JSON.stringify(s),
  )
  await ctx.close()
}

// ─── 5. NO-JS: nothing may flash ────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 860 },
    javaScriptEnabled: false,
  })
  const page = await openPage(ctx)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  const s = await shown(page)
  await page.screenshot({ path: `${OUT}/5-no-js.png` })
  check('no-JS: splash stays hidden', !s.visible, JSON.stringify(s))
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
