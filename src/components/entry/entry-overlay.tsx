'use client'

import { useEffect, useRef, useState } from 'react'
import { ENTRY_PLAY_CLASS, HOME_ROW, FINGER_STEP, KEY_W, KEY_GAP, KEY_X0 } from './entry-constants'

/**
 * The overlay itself, owned by React so that React can genuinely REMOVE it.
 *
 * Why a client component rather than DOM surgery from the gate script: an
 * overlay that merely sits at `display:none` has still mounted and still holds
 * a full-viewport node in the document. That is not the same guarantee as the
 * node being gone, and only the second one is the contract. But removing a
 * React-owned node imperatively before hydration raises error #418 and React
 * re-renders it straight back (measured 7.8.2026). The way to have both is to
 * let React do the removing: server-render the overlay, hydrate it unchanged —
 * so there is no mismatch — then unmount it from an effect.
 *
 * Teardown has TWO independent paths, and the second is the one that matters:
 * `animationend` normally ends it, and a timeout ends it regardless. If the
 * animation never fires — a background tab, bfcache, a future CSS change, a
 * browser quirk — the timeout still unmounts the overlay. A removal that has
 * only ever been seen to succeed is indistinguishable from one that cannot
 * fail, so `scripts/verify-entry-splash.mjs` deliberately breaks the
 * `animationend` path and proves the timeout alone still clears the screen.
 *
 * Note on this project specifically: `globals.css` sets
 * `animation-duration: 0.01ms` under `prefers-reduced-motion`, so an entrance
 * can complete almost instantly rather than in its nominal ~1.85s. Nothing here
 * assumes the nominal duration — the timeout is an upper bound, not a schedule.
 */
export function EntryOverlay() {
  // Starts mounted so the client's first render matches the server's exactly.
  // The unmount happens in an effect, i.e. strictly after hydration.
  const [mounted, setMounted] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const playing = html.classList.contains(ENTRY_PLAY_CLASS)

    const finish = () => {
      html.classList.remove(ENTRY_PLAY_CLASS)
      setMounted(false)
    }

    // Not playing (returning visitor, reduced motion, blocked storage): the
    // node was never visible — take it out of the document immediately.
    if (!playing) {
      finish()
      return
    }

    const el = ref.current
    const onEnd = (ev: AnimationEvent) => {
      if (ev.target === el) finish()
    }
    el?.addEventListener('animationend', onEnd)
    // The backup. Independent of the animation ever firing.
    const timer = window.setTimeout(finish, 2600)

    return () => {
      el?.removeEventListener('animationend', onEnd)
      window.clearTimeout(timer)
    }
  }, [])

  if (!mounted) return null

  return (
    <div id="nk-entry" className="nk-entry" aria-hidden="true" ref={ref}>
      <svg
        className="nk-art"
        viewBox="0 0 460 108"
        focusable="false"
        aria-hidden="true"
      >
        <g className="nk-keys">
          {HOME_ROW.map((letter, i) => {
            const x = KEY_X0 + i * (KEY_W + KEY_GAP)
            // Stagger by finger, not by position — index leads, pinky last.
            const delay = `${0.06 + FINGER_STEP[letter] * 0.075}s`
            return (
              <g className="nk-key" key={letter} style={{ animationDelay: delay }}>
                <rect x={x} y={18} width={KEY_W} height={44} rx={9} />
                <text x={x + KEY_W / 2} y={47}>
                  {letter}
                </text>
              </g>
            )
          })}
        </g>
        {/* The strike: drawn right-to-left, the direction a Hebrew hand moves.
            `pathLength` normalises the dash maths to 100 whatever the geometry. */}
        <path
          className="nk-slash"
          pathLength={100}
          d="M448 78 L12 96"
          fill="none"
        />
      </svg>
      <span className="nk-word">נינג&apos;ה מקלדת</span>
    </div>
  )
}
