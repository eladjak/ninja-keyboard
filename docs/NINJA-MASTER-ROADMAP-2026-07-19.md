# Ninja Keyboard — Master Roadmap (Authoritative Execution Plan)

**Date:** 2026-07-19
**Author:** Claude Code (deep ingest + plan-vs-reality reconciliation pass)
**Repo:** `~/projects/ninja-keyboard` · branch `master-roadmap`
**Live demo:** https://ninja-keyboard-nine.vercel.app
**Supersedes for planning purposes:** `NINJA-STATE-AND-PLAN-2026-06-07.md`, `NINJA-PHASE1-BLUEPRINT-2026-06-07.md`. Narrative/product canon still = `ninja-keyboard-spec-v9-FINAL.md` (with the code-vs-spec corrections in §1.4 below).

> **Scope verdict (honest):** This is **not** a near-launch game and **not** a fresh build. It is a **mature, deep single-player demo** (~29 routes, real typing/battle/gamification engines, a full 83-beat 6-chapter story, a 26-character universe, a 44-track audio pipeline, 1368+ passing unit tests, green CI) that is **blocked from being a *product* by a small number of load-bearing gaps** — chiefly (1) no way to type on a touch device, (2) a backend that is wired but effectively empty (no real accounts/data), and (3) the four *differentiating* curriculum pillars existing only as vision, not graded lessons. **This is a large ongoing build, but the highest-value slice is a few weeks of focused engineering, most of it doable without Elad.**

---

## 0. How to read this document

- **§1 Narrative Bible** — the canonical story/character/world state, reconciled against the CODE (which is richer and diverges from spec-v9 — the code is now the source of truth for characters).
- **§2 System status table** — built / partial / stub / missing, with file evidence.
- **§3 Doc contradictions** — where older plans, spec-v9, and the code disagree; newest-wins rulings.
- **§4 Prioritized backlog** — grouped into horizons, ordered by impact for the target audience (Israeli kids 6–16).
- **§5 "Start here"** — the 3–5 highest-leverage items that can begin immediately with zero Elad input.
- **§6 Open questions for Elad** — creative/product decisions that block specific backlog items.

---

## 1. Narrative Bible (canonical, reconciled)

### 1.1 World & premise
A Hebrew-first ninja-themed RPG that teaches kids (6–16 + adults) to type and operate a computer. The keyboard is a **magic artifact**; the child is a young ninja in training at an ancient **dojo (הדוג'ו)**. The **weapon is always the keyboard** — words, speed, accuracy, and shortcuts. **Hard rule from the spec, honored in code:** *no swords, fists, weapons, explosions, or blood.* Enemies "escape," never "die." HP is shown as **hearts ❤️**, damage is "the bug vanishes in a cloud," victory is "ניצחתם!" never "הרגתם!".

**World map (spec-v9 §23.4), the intended journey spine:**
🏠 כפר המקלדת → 🌿 יער שורת הבית (lessons 1–7) → 🐛 מאורת באג (mini-boss) → ⛰️ הר הקיצורים (8–12) → 🏰 מגדל הדיוק (13–17) → 🌀 מערת גליץ' → 🌋 מבוך השגיאות (18–19) → 👑 ארמון מלך הבאגים (final boss) → 🎓 היכל הנינג'ה (lesson 20, graduation → ninja mask → certificate).

### 1.2 Characters — CANONICAL STATE IS THE CODE, NOT SPEC-V9 ⚠️
Spec-v9 §22 describes a **6-character** core team (קי, מיקה, טל, באג, סנסיי קוד, גליץ'). **The actual code (`src/data/characters/character-visual-bible.json`, v1.0.0, 2026-03-08) has grown to a ~26-character universe with deep lore.** The code diverged after the spec and is far richer; **treat the visual bible + `src/data/story/chapter-1..6.ts` as canon.** Notable divergences to be aware of (and to eventually reconcile in the spec):
- Spec's **"טל"** (non-binary shortcuts ninja) does **not** appear in the code bible; shortcuts are owned by **מיקה (Mika)**.
- Spec's **"סנסיי קוד"** is **"סנסיי זן" (Sensei Zen — a wise turtle master)** in code.
- Spec's flat "באג/גליץ'" villains became a **layered antagonist hierarchy** in code: באג (cute error) → **גליץ' (tragic heroine)** → **זרה, מלכת הבאגים** → **קרס, מלך הבאגים (final-boss tier)** → **וירוס (The Betrayer)**.
- The code adds a **family/legend backstory**: **אלון קודן** (Ki's father, lost in the Deep Code), **שיר קודן** (Ki's mother, former keyboard ninja), **מאסטר ביט** (legendary founder, Zen's teacher), **פאנטום** (Mika's shadow mentor). Chapter 1 already foreshadows a character **"רז"** via an engraved empty chair.

**Core cast (as shipped in code):**

| # | דמות | תפקיד (code) | פונקציה במשחק |
|---|------|--------------|----------------|
| 1 | **קי** 🥷 | Main mascot & player guide | The player-avatar; curious, fails-and-grows (Pratfall Effect) |
| 2 | **מיקה** ⚡ | Tech ninja & shortcuts expert | Equal partner (not sidekick); precision + shortcuts coach |
| 3 | **יוקי** | Speed specialist | Speed drills / battle |
| 4 | **סנסיי זן** 🐢 | Wise turtle master | Lesson guide, riddles, wisdom |
| 5 | **פיקסל** 🤖 | Robot data assistant | Statistics/heatmap companion (NPC/UI) |
| 6 | **רקס** 🦖 | Dino buddy | Games companion |
| 7 | **באג** 🐛 | Cute villain | Typing-error embodiment; always escapes |
| 8 | **גליץ'** 🌀 | Chaos agent / tragic heroine | Special events, shape-shifting |
| — | **שאדו / סטורם / בלייז / ברק** | Battle rivals (easy→speed) | Opponents in `/battle` (AI typing engine) |
| — | **זרה / קרס / וירוס / פאנטום** | Villain tier / secret rival | Boss + endgame narrative |
| — | **אלון & שיר קודן, מאסטר ביט** | Lore/legend tier | Story backstory |

### 1.3 Story arc — 3 Acts, shipped as 6 chapters
Spec-v9 frames it as 3 Acts across 20 lessons (Act 1 "ההתעוררות" 1–7 → mini-boss L7; Act 2 "האימון" 8–15 → boss L15; Act 3 "הנינג'ה" 16–20 → final boss L20). **In code this is delivered as 6 Hebrew chapters, 83 dialog beats total** (`chapter-1..6.ts`): ch1=10, ch2=13, ch3=14, ch4=14, ch5=16, ch6=16 beats. Story surfaces via **triggers** (`lesson-complete` ×40, `manual` ×28, `battle-result` ×3) rendered as **dialog bubbles** (449 dialog lines, moods + expressions per line), honoring the spec's golden rule: *"Bubble, not cutscene — ~10 sec/lesson, skip button always available."*

> **The cutscene question (spec calls for a YouTube mini-series "הרפתקאות קי").** The *in-app* narrative is bubbles-only by design and is BUILT. Full *animated cutscenes* (the mini-series / trailer content) are a **separate production pipeline** gated on Elad's creative approval — see §6 and the memory note `project_hub_studio_room_and_cutscenes_2026_07_19`.

### 1.4 Chapters 1–6 — narrative status
| Chapter | Theme (code) | Beats | Status |
|---|---|---|---|
| 1 | הקריאה — Ki discovers the dojo, meets first characters | 10 | ✅ written, wired to lesson-1 triggers |
| 2 | early training / Mika joins | 13 | ✅ written |
| 3 | conflict / Bug escalates | 14 | ✅ written |
| 4 | wisdom / mentors | 14 | ✅ written |
| 5 | escalation toward boss | 16 | ✅ written |
| 6 | climax / resolution | 16 | ✅ written |

**All six chapters exist as structured `DialogStoryBeat[]` data and are wired to the trigger/dialog-player system.** The gap is not writing — it's (a) reconciling names with spec-v9, (b) VOICE coverage (many characters have no ElevenLabs voice), and (c) the optional external cutscene series.

---

## 2. System-by-System Status (built / partial / stub / missing)

Legend: 🟢 built & real · 🟡 partial/needs wiring · 🟠 stub/mock · 🔴 missing

| System / Screen | Status | Evidence |
|---|---|---|
| **Typing engine** (WPM/accuracy, per-key stats, finger detection, bigrams, adaptive weak-key) | 🟢 | `src/lib/typing-engine/` — real, unit-tested |
| **20 graded lessons** (Hebrew touch-typing, 3-act story intro/outro per lesson) | 🟢 | `src/lib/content/lessons.ts` (20 lessons) |
| **On-screen Hebrew keyboard** (visual highlight) | 🟢 | `src/components/typing/hebrew-keyboard.tsx` |
| **On-screen keyboard as TOUCH INPUT** (tap to type) | 🟢 **DONE (2026-07-19)** | `Key`/`HebrewKeyboard` now accept `onInput`/`onKeyInput`; tapping a key feeds `(char, code)` through the SAME handler physical keys use. Wired into the live `/lessons/[id]` route (`LessonPageClient`) + practice/speed-test/drill/onboarding/placement. Auto-on for touch devices (`use-touch-device`), toggle on desktop. Verified: lesson-01 completed touch-only (0 physical keys) at 390px, 44px targets, no keyboard overflow. See §A1. |
| **Battle mode** (AI rivals, 5 typing patterns, rubber-banding, combos, power-ups, taunts) | 🟢 | `src/lib/battle/ai-typing-engine.ts`, `battle-taunts.ts` |
| **Mini-games** (letter-memory, ninja-slice, word-rain) | 🟢 | `src/app/(app)/games/*` (infinite-XP bug fixed Jul 2026) |
| **Story / dialog system** (6 chapters, 83 beats, trigger + bubble player) | 🟢 | `src/data/story/*`, `src/components/story/dialog-box.tsx` |
| **Gamification** (XP, 7 ranks/belts, badges, streaks, daily challenge, combos) | 🟢 | `src/lib/gamification/*`, stores |
| **Certificates** (shareable RTL PNG, auto-surface on milestone, Web-Speech voice) | 🟢 | `certificate-canvas.ts`, `certificate-celebration.tsx` |
| **Coin economy + cosmetic shop** (accents/titles/frames, buy/equip) | 🟢 | `coins.ts`, `/shop`, e2e-tested |
| **Weak-key drill → lesson loop** (deep-linked, e2e-tested) | 🟢 | `weak-key-suggestion.ts`, `/drill` |
| **Confidence-gated progression** (accuracy unlocks next lesson) | 🟢 | `progression.ts` |
| **Audio: SFX + music manager** (16 SFX + synth fallback, 15 zones, crossfade, jukebox) | 🟢 | `sound-manager.ts`, `music-manager.ts` |
| **Character voices (ElevenLabs)** | 🟡 | Partial coverage; ~9 characters unvoiced; paid API, keys deferred |
| **Soundtrack completeness (Suno)** | 🟡 | Pipeline exists; some theme songs / jukebox covers missing |
| **Placement test + onboarding** | 🟡 | Pages exist (`/placement`, `/onboarding`); single first-run flow → age-track → seeded lesson **not fully stitched** |
| **Auth (class-code + avatar, teacher OAuth, parent)** | 🟡 | Code + 5 migrations exist; env-gated middleware; **prod is guest-first**, protected routes redirect but **no real accounts exist** |
| **Backend persistence (Supabase)** | 🟡 | Wired (`00004` player-state, `00005` leaderboard RPC applied & live-verified) but **tables empty**; 12 Zustand stores still localStorage-first |
| **Leaderboard** | 🟠 | `get_leaderboard()` RPC is live but returns `[]` → falls back to **deterministic mock**; ranks by XP only (no WPM) |
| **Teacher dashboard** | 🟠 | `teacher/page.tsx` = `MOCK_STUDENTS`/`MOCK_CLASSES`; parent-messaging TODO unwired |
| **Parent report** | 🟠 | Page exists on local/mock data |
| **Curriculum pillars 3–6** (Windows/files, computer literacy, mouseless, multimodal) | 🔴 | **Not graded curriculum.** Only touch-typing + a standalone `/shortcuts` practice page exist. These 4 are the *market differentiator* and are the largest scope gap |
| **Windows simulator** (desktop/file-explorer DOM sandbox) | 🔴 | Spec §6.4; not built |
| **Keyboard-shortcuts as GRADED lessons** | 🟡 | Content lib exists (`keyboard-shortcuts.ts`) + `/shortcuts` page; not promoted into the XP/badge graded track |
| **PWA / offline** | 🟡 | `src/lib/offline` exists; service-worker strategy unconfirmed/incomplete |
| **3D Ki character** | 🟠 | `/3d-poc` uncommitted stub waiting on a GLB model; lowest priority |
| **83 dead `dark:` utilities** | 🔴 cleanup | ~102 `dark:` occurrences in `src/`; theming is **`data-theme`-driven** (`theme-provider.tsx`, `theme-vars.css`) so Tailwind `dark:` variants are **inert dead code** |
| **Tests / CI** | 🟢 | **1368+ unit tests, 96 test files**, e2e (Playwright) green, CI 4/4 jobs green. *(The June state doc's "only 5 test files" claim was wrong/outdated — coverage is a strength, not a gap.)* |
| **Build / typecheck** | 🟢 | `next build` + `tsc --noEmit` green (Next 16, React 19.2) |

---

## 3. Doc contradictions & newest-wins rulings

1. **Character canon:** spec-v9 (6 chars) ↔ code bible (26 chars). **RULING: code wins.** The visual bible + story chapters are canon; spec-v9 §22 is stale. (Action: eventually patch the spec, low priority.)
2. **"MASTERPIECE-PLAN" doc:** referenced in the mandate but **does not exist** in `docs/`. The de-facto master plan was spec-v9 + the June state/blueprint. This document now fills that role.
3. **Test coverage:** `NINJA-STATE-AND-PLAN-2026-06-07.md` §1.5 says "only 5 `*.test.*` files exist." **FALSE as of today** — 96 test files, 1368 unit tests, green e2e/CI. That doc's build/scope analysis is still excellent; only its test claim is outdated.
4. **Migration 00005 status:** flip-flopped in PROGRESS ("not applied" → corrected to "applied, RPC live, returns `[]`"). **RULING: applied & live** (empty because no users). No SQL step remains for the leaderboard *backend*; it just needs real data.
5. **Auth/guest tension:** activating Supabase env made middleware gate `/home` → broke the guest-first primary CTA → fixed by keeping `/home` public (commit `49694c7`). **Guest-first is the intended v1 posture**; only `/progress /profile /settings` gate.
6. **"Box" the battle character:** the v2 narrative brief mentioned "Box" — that's an **agent-network character, not game canon**. Code correctly uses the rival roster + Mika instead. Ignore "Box" for this game.

---

## 4. Prioritized Backlog (by impact for kids 6–16)

### HORIZON A — "Make every kid able to play, and make progress real" (highest leverage, ~2–4 weeks)

**A1. On-screen keyboard as real touch input (THE #1 audience gap). ✅ DONE — 2026-07-19 (branch `feat/onscreen-keyboard`).**
A touch-only kid can now type an entire lesson with zero physical keyboard. **How it works:**
- **`Key`** (`src/components/typing/key.tsx`) gained an optional `onInput(char, code)` + `code` prop. When present the key becomes a REAL, focusable, `aria-label`led button that fires on **pointer-down** (plus Enter/Space for switch/keyboard users), `preventDefault`s to avoid stealing focus, and renders a **≥44px** tap target (WCAG 2.5.5). Width is now **flexible** (`flex-grow` by unit, `minWidth:0`) so a full 10-key row shrinks to fit any container — **no 390px overflow**. Omitting `onInput` keeps the legacy visual-only, `aria-hidden` behaviour (100% backward-compatible with every existing caller).
- **`HebrewKeyboard`** gained `onKeyInput`; it routes every key + the space bar through that one handler and switches `role="img"`→`role="group"` when interactive.
- **`use-touch-device`** hook (`(pointer: coarse)` + `maxTouchPoints`) decides when tap-input is the **primary** input (auto-on) vs. an opt-in **toggle** on desktop.
- **Reuse, not reinvent:** every consumer passes its *existing* `onKeyPress`/`typeKey` handler as `onKeyInput`, so on-screen taps and physical keys share ONE engine path (`session.typeKey` → `processKeystroke`) — identical stats/XP/stars. Both input methods coexist; the physical keyboard is untouched.
- **Wired into:** the live lesson route `LessonPageClient` (the real fix — `LessonView` was dead code), `/practice`, `/speed-test`, `/drill`, onboarding `first-lesson-magic` (Step2/Step4) and `placement-test` (stage1 typing + stage2 key-ID; stage3 modifier-combos left keyboard-only by design).
- **Verified** with Playwright on a 390×844 iPhone-13 touch context: keyboard interactive by default, all rows 308px (fits), 44px keys, **lesson-01 completed with 119 taps and 0 physical keystrokes** (3★/100%/+114XP). Tests added for both input paths + the hook. `next build` + `tsc` + 1378 unit tests all green.
- **Note for Elad:** `src/components/typing/lesson-view.tsx` is **dead code** (defined, never imported — the live route is `LessonPageClient`). Left in place (now consistent) — recommend deleting it in a later cleanup pass.

**A2. Wire real persistence (accounts → cross-device progress).** 🟡→🟢
On auth, hydrate Zustand stores from Supabase (`progress`, `gamification`, `00004` player-state); write-through on lesson/battle completion; keep localStorage as offline cache with merge-on-login (guest→account migration). Backend is already provisioned and typed. **This unblocks leaderboard, teacher dashboard, and retention in one move.**
- **Size:** M–L. **Deps:** a decision to turn accounts on (§6-Q1). **Elad:** 🟡 needs a scope/hosting confirm, then autonomous.

**A3. Real leaderboard off real data.** 🟠→🟢
RPC is live; once A2 seeds `gamification`, replace the mock fallback path with real rows; add a WPM ranking variant (extend `get_leaderboard` with `MAX(wpm)` from `sessions`), plus age/school filters (spec §5.3 "אלופי השיפור" — rank by *improvement*, not just speed, to encourage everyone).
- **Size:** S–M. **Deps:** A2. **Elad:** ❌ no.

**A4. Stitch onboarding → placement → first-lesson into ONE first-run flow.** 🟡→🟢
The pages exist; connect them so a first-time child picks device/age, takes the 2-min placement test, and lands on a seeded first lesson with the age theme applied. First impression = retention.
- **Size:** S–M. **Deps:** none (independent of A2, better with it). **Elad:** ❌ no.

**A5. `dark:` dead-utility cleanup.** 🔴 cleanup
Remove the ~102 inert `dark:` Tailwind variants across `src/` (theming is `data-theme`-driven). Pure hygiene; reduces class noise and prevents future confusion. Verify no visual regression via the existing Playwright screenshot sweep.
- **Size:** S. **Deps:** none. **Elad:** ❌ no.

### HORIZON B — "Deliver the differentiator + close the product loop" (~3–6 weeks)

**B1. Promote keyboard-shortcuts into the GRADED curriculum track** (pillar 4). 🟡→🟢
The content lib + practice page exist; give shortcuts XP, badges, story beats, and a place on the lessons/world map. This is the cheapest of the four missing pillars and converts one market claim from aspiration to fact.
- **Size:** M. **Deps:** none. **Elad:** ❌ no (spec-clear).

**B2. Teacher/parent dashboards on real data.** 🟠→🟢
Class-code join (lib exists) → real student progress reads → parent weekly report. Replace `MOCK_STUDENTS`/`MOCK_CLASSES`; wire the `student-list-mobile.tsx` messaging TODO. Core B2B/B2school value prop.
- **Size:** L. **Deps:** A2. **Elad:** 🟡 product decisions on scope (which metrics, live vs. batch).

**B3. Windows / file-management pillar** (pillar 3) — the DOM sandbox simulator. 🔴
Spec §4.3 + §6.4: a browser-only desktop/file-explorer sandbox with graded "missions" (find the icon, snap windows, build a folder tree, sort files). Largest single new-feature.
- **Size:** XL. **Deps:** design direction. **Elad:** 🟡 art/UX direction for the sim (fake-Windows vs. neutral-OS look — see §6-Q3).

**B4. Voice + soundtrack completion.** 🟡→🟢
Batch-run `ninja-keyboard-voice` (ElevenLabs) for the ~9 unvoiced characters and `ninja-keyboard-suno`/`-music` for missing theme songs + jukebox covers. Pipelines exist — this is execution, but paid APIs.
- **Size:** M (mostly runtime). **Deps:** API keys/budget. **Elad:** 🟡 budget approval + voice-casting sign-off.

**B5. PWA / offline finalize.** 🟡
Confirm service-worker caching strategy (spec §6.9), offline lessons + mini-games + background-sync of pending sessions.
- **Size:** M. **Deps:** none. **Elad:** ❌ no.

### HORIZON C — "Depth, reach & IP" (post-product, months)

- **C1.** Remaining pillars: computer literacy (pillar 1, animated + quiz), **mouseless mastery** (pillar 5, anaf/tzameret), **multimodal input** (pillar 6). *(Size: XL each; Elad: creative direction.)*
- **C2.** English (QWERTY) bilingual track (spec wave 7–8). *(L; autonomous.)*
- **C3.** Seasonal events / live-ops (8 seasonal + weekly + monthly boss events, anti-FOMO). *(M–L; Elad: calendar sign-off.)*
- **C4.** Boss-battle formalization vs. spec (mini-boss L7, boss L15, final L20, class co-op boss). Battle engine exists; needs the *world-map boss gating* + rewards. *(M.)*
- **C5.** Animated cutscene / "הרפתקאות קי" YouTube mini-series. **Blocked on Elad** (style approval + full production pipeline: final model-sheets → storyboard → keyframes → voice/lipsync/VFX/SFX/music/edit). *(XL; Elad-gated — see §6-Q4.)*
- **C6.** 3D Ki (only after a GLB exists; keep behind a flag). *(Low priority.)*
- **C7.** LMS integrations (Google Classroom, Mashov, LTI 1.3), analytics, pen-test. *(L; B2B-driven.)*
- **C8.** Reconcile spec-v9 §22 character canon with the code bible (patch the doc). *(S; do alongside any narrative work.)*
- **C9.** GEO/AEO + marketing landing surface before any public push. *(S–M.)*

---

## 5. START HERE — highest-leverage, zero-Elad-input, spec-clear

These can begin **immediately, autonomously**, in impact order:

1. ~~**A1 — On-screen keyboard touch input.**~~ ✅ **DONE 2026-07-19** (branch `feat/onscreen-keyboard`). The single biggest audience unlock — the typing core is now playable touch-only on phones/tablets/Chromebooks. See §A1.
2. **A5 — `dark:` dead-utility cleanup.** Fast, safe hygiene; screenshot-diff verifies zero regression. *(S)*
3. **A4 — Onboarding→placement→first-lesson flow.** Stitch existing pages; big retention win on first impression. *(S–M)*
4. **B1 — Shortcuts → graded track.** Converts a differentiator claim to fact using content that already exists. *(M)*
5. **A3 — Real leaderboard + WPM ranking + "improvement" board.** *(Do A2 first if accounts are turned on; otherwise ship the WPM/improvement ranking logic + filters now against the RPC so it's ready.)* *(S–M)*

> If Elad greenlights accounts (§6-Q1), **A2 (real persistence)** jumps to #1 — it is the true foundation and unblocks A3/B2/retention. It's held out of the pure-autonomous list only because it implies a product/hosting posture decision.

---

## 6. Open Questions for Elad (creative / product — plan is blocked on these)

- **Q1 — v1 shipping scope & accounts.** Do we ship v1 **guest-first (localStorage only)** and defer real accounts, or turn on **Supabase accounts now** (unblocks leaderboard/teacher/retention but changes the guest UX)? Recommended: *single-player Hebrew typing + shortcuts with real saved progress* — but this is your call and gates A2/B2.
- **Q2 — Target device priority.** Given Israeli classrooms, do we prioritize **tablet/touch** (A1) as the flagship v1 experience, or **desktop with physical keyboard** first? Affects how much A1 grows.
- **Q3 — Windows-simulator look (B3).** Should the file/window sandbox mimic **real Windows** (trademark/UX questions) or a **neutral stylized OS** ("KiOS")? Creative + legal direction needed before building.
- **Q4 — Cutscenes / "הרפתקאות קי" (C5).** Blocked on your **style approval + production pipeline** sign-off (final character model-sheets → storyboard → keyframes → voice/lipsync/VFX/SFX/music/edit). See memory `project_hub_studio_room_and_cutscenes_2026_07_19`. Do we start with a single 60–90s pilot to lock the style?
- **Q5 — Voice budget & casting (B4).** Approve ElevenLabs/Suno spend + sign off on voice character for the ~9 unvoiced characters?
- **Q6 — Character-canon reconciliation.** The code universe (26 chars, deep lore incl. Ki's parents, Phantom, Virus, "רז") outgrew spec-v9's 6. Confirm the **code is canon** so we patch the spec and don't accidentally reintroduce the old "טל / סנסיי קוד" names.
- **Q7 — Narrative depth vs. breadth.** With 4 curriculum pillars still missing, do we prioritize **finishing the differentiating curriculum** (Windows/mouseless/multimodal) or **deepening the existing typing game** (more polish/story/social) for v1? Impacts whether Horizon B or C leads.

---

## 7. Key file references (for whoever executes)

- **Narrative canon:** `src/data/characters/character-visual-bible.json`, `src/data/story/chapter-1..6.ts`, `src/types/story.ts`
- **#1 gap (touch input):** `src/components/typing/key.tsx`, `src/components/typing/typing-area.tsx`, `src/lib/typing-engine/keyboard-layout.ts`
- **Curriculum:** `src/lib/content/lessons.ts` (20, typing-only), `src/lib/content/keyboard-shortcuts.ts`, `/shortcuts`
- **Mocks to replace:** `src/app/(app)/teacher/page.tsx`, `src/lib/leaderboard/leaderboard-service.ts` + `leaderboard-utils.ts`
- **Persistence:** all `src/stores/*` (localStorage `persist`), `supabase/migrations/0000{1..5}`, `src/middleware.ts`, `src/lib/auth/actions.ts`
- **Theme system (for `dark:` cleanup):** `src/components/providers/theme-provider.tsx`, `src/styles/css/theme-vars.css`
- **Execution playbooks (skills):** `~/.claude/skills/ninja-keyboard-{battle,design,music,story,suno,voice}`, `character-consistency`
- **Prior planning:** `docs/NINJA-STATE-AND-PLAN-2026-06-07.md`, `docs/NINJA-PHASE1-BLUEPRINT-2026-06-07.md`, `docs/ninja-keyboard-spec-v9-FINAL.md`, `docs/v2-research.md`, `handoffs/v5..v7`

---

*Master roadmap — Ninja Keyboard | 2026-07-19 | reconciles spec-v9 + June state/blueprint + code reality. Newest-wins: code is canon for characters; this doc is canon for execution ordering.*
