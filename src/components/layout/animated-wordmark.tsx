import type { CSSProperties } from 'react'

/**
 * נינג׳ה מקלדת — staggered letter-bounce wordmark.
 * Pattern: ~/.claude/docs/logo-animation-pattern.md
 *
 * - RTL order enforced by `.logo-anim { direction: rtl }` (bidi gotcha #2:
 *   per-letter inline-block spans are isolated bidi units).
 * - Each word wraps in `.logo-anim__word`; the space between words stays a
 *   plain text node (an animated space-only span collapses).
 * - Pure CSS animation — safe in both Server and Client Components.
 */
const WORDMARK_WORDS = [
  ['נ', 'י', 'נ', 'ג', '׳', 'ה'],
  ['מ', 'ק', 'ל', 'ד', 'ת'],
] as const

export function AnimatedWordmark() {
  return (
    <>
      <span className="sr-only">נינג׳ה מקלדת</span>
      <span className="logo-anim" aria-hidden="true">
        {WORDMARK_WORDS.map((word, w) => {
          const offset = WORDMARK_WORDS.slice(0, w).reduce(
            (n, ws) => n + ws.length,
            0
          )
          return (
            <span key={w}>
              {w > 0 ? ' ' : null}
              <span className="logo-anim__word">
                {word.map((ch, i) => (
                  <span
                    key={i}
                    className="logo-anim__ch"
                    style={{ '--i': offset + i } as CSSProperties}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </>
  )
}
