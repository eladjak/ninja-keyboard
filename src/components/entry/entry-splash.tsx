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
 * THE OBJECTION THIS IS BUILT AGAINST. A blocking overlay on an app a child
 * opens daily buys one pleasant moment and carries a real failure mode: if
 * self-removal misfires, the product is unusable and the child cannot say why.
 * That objection is correct, and every clause below exists to answer it — none
 * of them is ceremony:
 *
 * - `pointer-events: none` for the overlay's entire life. Even a stuck overlay
 *   cannot swallow a tap; the app underneath stays usable.
 * - TWO independent teardown paths — `animationend`, AND a timeout that does
 *   not care whether the animation ever ran. The timeout is proven by
 *   deliberately breaking the primary path in `scripts/verify-entry-splash.mjs`.
 * - React owns the node and genuinely UNMOUNTS it, so "gone" means gone from
 *   the document, not merely `display:none` (see `entry-overlay.tsx`).
 * - The base state is `display:none`, so no-JS, reduced-motion and every visit
 *   after the first show nothing at all — no script has to succeed for the
 *   screen to be clear.
 * - A once-ever localStorage gate; blocked storage SKIPS the splash rather than
 *   replaying it on every navigation.
 *
 * Reduced motion is a triple belt, and the gate BAILS rather than hides:
 * (1) this script never adds the play class, so the entrance never starts;
 * (2) `#nk-entry{display:none!important}` inside a `prefers-reduced-motion`
 *     query catches a mid-session flip and cannot be overridden by the class;
 * (3) the overlay is unmounted outright by the effect in `entry-overlay.tsx`.
 * The OS-level preference is read directly via `matchMedia` — never an in-app
 * setting, which can drift out of sync with the real preference.
 *
 * Interaction with this project's own belt: `globals.css` sets
 * `animation-duration: 0.01ms` under reduced motion (deliberately `0.01ms` and
 * NOT `animation: none` — `none` would strip an animation whose final frame is
 * the visible state and could leave an overlay stuck on screen forever). That
 * block is left exactly as it is. Nothing here assumes the entrance takes its
 * nominal ~1.85s; the timeout is an upper bound, not a schedule.
 *
 * Motion diet: `transform` + `opacity` + `stroke-dashoffset` only.
 * Brand: every colour is a ninja-keyboard token — dark field
 * `--game-bg-primary`, purple `--game-accent-purple`, green
 * `--game-accent-green`. Nothing foreign.
 *
 * Rendered at the top of the `(app)` layout only: the marketing landing page
 * and the auth screens deliberately skip it.
 */
import { EntryOverlay } from './entry-overlay'
import { ENTRY_SEEN_KEY, ENTRY_PLAY_CLASS } from './entry-constants'

export { ENTRY_SEEN_KEY }

export function EntrySplash() {
  return (
    <>
      <style>{ENTRY_CSS}</style>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <EntryOverlay />
    </>
  )
}

/**
 * The gate. Runs inline during parse — before first paint — so the entrance
 * either starts immediately or never starts at all, with no flash either way.
 * It touches exactly one thing: a class on `<html>`. It never adds, removes or
 * edits a node React owns; that is what makes it safe alongside hydration.
 *
 * Its own timeout is a third net beneath the React effect's two, for the case
 * where the client bundle never loads at all.
 */
const GATE_SCRIPT = `(function(){try{
  if(window.__nkEntryArmed)return; window.__nkEntryArmed=1;
  /* The OS-level preference, read directly — never an in-app setting, which
     can drift out of sync with what the user actually asked the system for. */
  var rm=false; try{rm=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);}catch(e){}
  var seen=null; try{seen=localStorage.getItem("${ENTRY_SEEN_KEY}");}catch(e){}
  if(rm||seen)return;
  /* If the seen-flag can NOT be persisted (storage blocked / private mode),
     SKIP the splash — otherwise it would replay on every single navigation. */
  try{localStorage.setItem("${ENTRY_SEEN_KEY}","1");}catch(e){return;}
  var html=document.documentElement;
  html.classList.add("${ENTRY_PLAY_CLASS}");
  setTimeout(function(){html.classList.remove("${ENTRY_PLAY_CLASS}");},2800);
}catch(e){}})();`

const ENTRY_CSS = `
/* Base state is display:none — no-JS, reduced-motion and every visit after the
   first therefore show nothing at all, with no script needing to succeed. */
.nk-entry{display:none;position:fixed;inset:0;z-index:400;
  flex-direction:column;align-items:center;justify-content:center;gap:1.6rem;
  background:var(--game-bg-primary,#0d0b1a);pointer-events:none}
.${ENTRY_PLAY_CLASS} .nk-entry{display:flex;animation:nk-entry-fade 1.85s ease both}
.nk-art{width:min(84vw,460px);height:auto;overflow:visible}
/* Keycaps: purple outline, letter in the app's own text colour.
   \`transform-box:fill-box\` is NOT optional — without it an SVG transform-origin
   resolves against the whole viewBox, so \`scale(.9)\` would throw each key most
   of a screen-width sideways instead of shrinking it in place. */
.nk-key{transform-box:fill-box;transform-origin:center}
.nk-key rect{fill:none;stroke:var(--game-accent-purple,#6C5CE7);stroke-width:2}
.nk-key text{fill:#e8e4f5;font-family:var(--font-heebo),system-ui,sans-serif;
  font-size:22px;font-weight:600;text-anchor:middle}
.${ENTRY_PLAY_CLASS} .nk-key{animation:nk-key-in .34s cubic-bezier(.22,1,.36,1) both}
.nk-slash{stroke:var(--game-accent-green,#00B894);stroke-width:3;stroke-linecap:round}
.${ENTRY_PLAY_CLASS} .nk-slash{animation:nk-slash-draw .3s cubic-bezier(.85,0,.15,1) .52s both}
.nk-word{font-family:var(--font-heebo),system-ui,sans-serif;font-weight:700;
  font-size:clamp(1.05rem,3.4vw,1.35rem);letter-spacing:.02em;color:rgba(255,255,255,.9)}
.${ENTRY_PLAY_CLASS} .nk-word{animation:nk-word-in .42s ease-out .74s both}
/* Belt 2: if reduced-motion is (or becomes) active mid-session, the splash
   cannot be shown by any means — ID + !important outranks the play class. */
@media (prefers-reduced-motion:reduce){#nk-entry{display:none!important}}
@keyframes nk-entry-fade{0%,80%{opacity:1}100%{opacity:0}}
@keyframes nk-key-in{from{opacity:0;transform:translateY(10px) scale(.9)}
  to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes nk-slash-draw{from{stroke-dasharray:100 100;stroke-dashoffset:100}
  to{stroke-dasharray:100 100;stroke-dashoffset:0}}
@keyframes nk-word-in{from{opacity:0;transform:translateY(6px)}
  to{opacity:1;transform:translateY(0)}}
`
