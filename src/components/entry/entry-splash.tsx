/**
 * App-entry choreography for נינג'ה מקלדת — "a single precise strike".
 *
 * The voice (why THIS and not a cartoon ninja): the product is a typing dojo,
 * so the splash is made of the product itself. The ten keys are lesson 1-4's
 * literal `targetKeys` (`src/lib/content/lessons.ts`): ש ד ג כ ע י ח ל ך ף —
 * the Hebrew home row. They arrive staggered BY FINGER, index-first and pinky
 * last, which is the order a touch-typist actually learns them. Then one green
 * stroke is drawn beneath them, right-to-left (the direction a Hebrew hand
 * moves), fast and sharp. That stroke is also the loading gesture — no separate
 * progress bar, because one earned element beats two decorative ones.
 *
 * Contract (wow-ui-standard §7, matching the proven triplus `hub-entry.ts`):
 * - Plays ONCE EVER per browser (first visit only — "מאוד מגניב" once, noise
 *   afterwards). A localStorage flag gates it; bump `ENTRY_SEEN_KEY` to
 *   re-premiere. If storage is blocked the splash is SKIPPED entirely, never
 *   replayed on every navigation.
 * - `prefers-reduced-motion`: skipped ENTIRELY — a triple belt. (1) the gate
 *   script never arms it, (2) a CSS `display:none !important` catches a
 *   mid-session flip, (3) the overlay's BASE state is `display:none`, so with
 *   animations off there is simply nothing to see.
 * - Never blocks interaction: `pointer-events: none` for its whole life, and it
 *   is `display:none` except during the ~1.8s it is actually playing.
 * - No-JS safe: base state is `display:none`; only the gate script's class on
 *   `<html>` reveals it. With JS blocked nothing flashes at all.
 * - Motion diet: `transform` + `opacity` + `stroke-dashoffset` only.
 * - Brand: every colour is a ninja-keyboard token (dark field
 *   `--game-bg-primary`, purple `--game-accent-purple`, green
 *   `--game-accent-green`). Nothing foreign.
 *
 * WHY A CLASS ON `<html>` AND NOT DOM SURGERY (learned the hard way, 7.8.2026):
 * the obvious port of the triplus pattern — server-render the overlay, then have
 * an inline script show or remove the node — does not survive React. Injecting
 * or removing nodes inside React's subtree before hydration produces a
 * hydration mismatch (React error #418); React then re-renders the whole tree
 * client-side and undoes the script's work, so the splash reappeared on second
 * visits and under reduced-motion, exactly where it must not. Measured with a
 * control arm: the same page with the same components but no DOM injection had
 * zero page errors. So the markup here is rendered ONCE by the server, is never
 * mutated, and all state lives in a single class on `<html>` — the same
 * mechanism the theme scripts in this fleet already use safely.
 *
 * Server component, no props, no state. Rendered at the top of the `(app)`
 * layout only: the marketing landing page and auth screens deliberately skip it.
 */

/** localStorage key gating the once-EVER entrance. Bump the suffix to re-premiere. */
export const ENTRY_SEEN_KEY = 'ninja-entry-seen-v1'

/** The class the gate script puts on `<html>` while the entrance plays. */
const PLAY_CLASS = 'nk-play'

/** The Hebrew home row, in the product's own lesson order (lessons.ts). */
const HOME_ROW = ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'] as const

/**
 * Stagger delay per key, in "steps", by the finger that presses it — index
 * fingers first (כ ע), then middle (ג י), ring (ד ח), pinky (ש ל), and finally
 * the two outer keys (ך ף). This is the order the hand learns, not left-to-right.
 */
const FINGER_STEP: Record<string, number> = {
  כ: 0,
  ע: 0,
  ג: 1,
  י: 1,
  ד: 2,
  ח: 2,
  ש: 3,
  ל: 3,
  ך: 4,
  ף: 4,
}

const KEY_W = 40
const KEY_GAP = 4
const KEY_X0 = 12

export function EntrySplash() {
  const keys = HOME_ROW.map((letter, i) => {
    const x = KEY_X0 + i * (KEY_W + KEY_GAP)
    const delay = `${0.06 + FINGER_STEP[letter] * 0.075}s`
    return (
      <g className="nk-key" key={letter} style={{ animationDelay: delay }}>
        <rect x={x} y={18} width={KEY_W} height={44} rx={9} />
        <text x={x + KEY_W / 2} y={47}>
          {letter}
        </text>
      </g>
    )
  })

  return (
    <>
      <style>{ENTRY_CSS}</style>
      <div id="nk-entry" className="nk-entry" aria-hidden="true">
        <svg
          className="nk-art"
          viewBox="0 0 460 108"
          focusable="false"
          aria-hidden="true"
        >
          <g className="nk-keys">{keys}</g>
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
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
    </>
  )
}

/**
 * The gate. Runs inline during parse — before first paint — so the entrance
 * either starts immediately or never starts at all. It touches exactly one
 * thing: a class on `<html>`. It never adds, removes, or edits a node React owns.
 */
const GATE_SCRIPT = `(function(){try{
  if(window.__nkEntryArmed)return; window.__nkEntryArmed=1;
  var rm=false; try{rm=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);}catch(e){}
  var seen=null; try{seen=localStorage.getItem("${ENTRY_SEEN_KEY}");}catch(e){}
  if(rm||seen)return;
  /* If the seen-flag can NOT be persisted (storage blocked / private mode),
     SKIP the splash — otherwise it would replay on every single navigation. */
  try{localStorage.setItem("${ENTRY_SEEN_KEY}","1");}catch(e){return;}
  var html=document.documentElement;
  html.classList.add("${PLAY_CLASS}");
  function end(){ html.classList.remove("${PLAY_CLASS}"); }
  document.addEventListener("animationend",function(ev){
    if(ev.target&&ev.target.id==="nk-entry")end();
  });
  /* Backup: if the overlay is hidden before its animation can fire (background
     tab, bfcache), animationend never arrives and the class must still come off. */
  setTimeout(end,2600);
}catch(e){}})();`

const ENTRY_CSS = `
/* Base state is display:none — no-JS, reduced-motion and every visit after the
   first therefore show nothing at all, with no script needing to succeed. */
.nk-entry{display:none;position:fixed;inset:0;z-index:400;
  flex-direction:column;align-items:center;justify-content:center;gap:1.6rem;
  background:var(--game-bg-primary,#0d0b1a);pointer-events:none}
.${PLAY_CLASS} .nk-entry{display:flex;animation:nk-entry-fade 1.85s ease both}
.nk-art{width:min(84vw,460px);height:auto;overflow:visible}
/* Keycaps: purple outline, letter in the app's own text colour.
   \`transform-box:fill-box\` is NOT optional — without it an SVG transform-origin
   resolves against the whole viewBox, so \`scale(.9)\` would throw each key most
   of a screen-width sideways instead of shrinking it in place. */
.nk-key{transform-box:fill-box;transform-origin:center}
.nk-key rect{fill:none;stroke:var(--game-accent-purple,#6C5CE7);stroke-width:2}
.nk-key text{fill:#e8e4f5;font-family:var(--font-heebo),system-ui,sans-serif;
  font-size:22px;font-weight:600;text-anchor:middle}
.${PLAY_CLASS} .nk-key{animation:nk-key-in .34s cubic-bezier(.22,1,.36,1) both}
.nk-slash{stroke:var(--game-accent-green,#00B894);stroke-width:3;stroke-linecap:round}
.${PLAY_CLASS} .nk-slash{animation:nk-slash-draw .3s cubic-bezier(.85,0,.15,1) .52s both}
.nk-word{font-family:var(--font-heebo),system-ui,sans-serif;font-weight:700;
  font-size:clamp(1.05rem,3.4vw,1.35rem);letter-spacing:.02em;color:rgba(255,255,255,.9)}
.${PLAY_CLASS} .nk-word{animation:nk-word-in .42s ease-out .74s both}
/* Belt 2 over the script gate: if reduced-motion is (or becomes) active mid
   session, the splash cannot be shown by any means. */
@media (prefers-reduced-motion:reduce){#nk-entry{display:none!important}}
@keyframes nk-entry-fade{0%,80%{opacity:1}100%{opacity:0}}
@keyframes nk-key-in{from{opacity:0;transform:translateY(10px) scale(.9)}
  to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes nk-slash-draw{from{stroke-dasharray:100 100;stroke-dashoffset:100}
  to{stroke-dasharray:100 100;stroke-dashoffset:0}}
@keyframes nk-word-in{from{opacity:0;transform:translateY(6px)}
  to{opacity:1;transform:translateY(0)}}
`
