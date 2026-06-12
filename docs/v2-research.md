# V2 Research — Typing-for-Kids Genre Best Practices

> Shabbat deep-iteration, 2026-06-12. Sources: TypingClub, Nitro Type, Dance Mat Typing (BBC), keybr.
> Goal: extract concrete mechanics worth adopting; map each against ninja-keyboard's current state.

## Sources reviewed
- [Nitro Type](https://www.nitrotype.com/) + [Modulo educator review](https://www.modulo.app/all-resources/nitro-type-review)
- [Dance Mat Typing 2025 review](https://nitrotype.blog/dance-mat-typing-review-2025/) + [Common Sense Education review](https://www.commonsense.org/education/reviews/dance-mat-typing)
- [keybr help / algorithm](https://www.keybr.com/help) + [CosmicKeys keybr analysis](https://cosmickeys.app/en/blog/keybr-review)
- [Typesy genre roundup](https://www.typesy.com/from-abcs-to-qwerty-the-best-typing-games-for-your-little-typists/)

## Key finding
Gamification increases typing practice time by 40-60% and skill retention by 25-35% vs plain drills.
The genre leaders each own ONE core loop: TypingClub = stars/mastery map · Nitro Type = competition juice ·
Dance Mat = character-narrated celebration · keybr = adaptive weak-key targeting.
Ninja-keyboard already has pieces of all four — V2's job is to CONNECT them into one journey.

## 12 mechanics extracted (status vs our codebase)

| # | Mechanic | Source | Status in ninja-keyboard | V2 action |
|---|----------|--------|--------------------------|-----------|
| 1 | **Stars (1-3) per lesson, visible on the map** — replay motivation ("get 3 stars") | TypingClub | Stars computed in results modal only; lessons map shows WPM/acc numbers | **ADOPT: show mastery stars on lessons map** (Block 4) |
| 2 | **Character-narrated journey** — animated teacher guides every stage, story glue between lessons | Dance Mat | Story chapters exist (6 chapters, trigger system) but lessons themselves are "dry" — no per-lesson narrative line | **ADOPT: per-lesson story intro + outro lines (Ki's journey)** (Block 3) |
| 3 | **Celebration song/moment at every stage end** — never skip the win | Dance Mat | Confetti + fanfare + stars on completion ✅ | Keep; outro story line adds voice (Block 3) |
| 4 | **No penalty for mistakes, but instant ping** — safe-to-fail audio feedback | Dance Mat | keyClick/correct/error SFX + screen shake ✅ | Already shipped (sound-manager.ts) |
| 5 | **Weak-key adaptive targeting** — every lesson includes your worst key | keybr | `/drill` weak-key mode exists ✅ | Shipped (iter 18). v3: auto-suggest drill after lesson |
| 6 | **Confidence-gated progression** — new keys unlock only at confidence 1.0 | keybr | Linear unlock (complete previous lesson) | v3 candidate: accuracy-gated unlock, needs balancing |
| 7 | **Competitive races with live opponents** — speed feeds avatar performance | Nitro Type | Battle mode vs AI opponents + combo tiers + power-ups ✅ | Enhance: opponent PERSONALITY — Box taunts/encouragements (Block 3) |
| 8 | **Streak/combo with escalating visuals** — tiered feedback at 5/10/25/50 | Nitro Type | Battle has 5-tier combo ✅; lesson page has NO streak counter | **ADOPT: combo streak counter in lessons** (Block 4) |
| 9 | **Printable certificate per level block** — parent-visible artifact | Dance Mat | Parent report page exists; no certificate | v3 candidate: certificate at lessons 5/10/15/20 |
| 10 | **Garage/collection meta-economy** — earn currency, buy cosmetics | Nitro Type | Character unlocks + badges + holiday skins ✅ | Shipped; v3: spendable currency |
| 11 | **Per-key visual feedback on the on-screen keyboard** — key "lights up" with travel | TypingClub | Keyboard highlights next key; press state is flat | **ADOPT: per-key ripple on press** (Block 4) |
| 12 | **Daily goal + streak calendar** — "come back tomorrow" loop | TypingClub | Daily challenge card + XP streak ✅ | Shipped |

## V2 scope decision (this session)
- **Block 2 (sound)** — AUDIT ONLY: sound stack already exceeds the brief (MP3 SFX + Web Audio synthesis
  fallback, music manager with zones/crossfade, settings-store persisted `soundEnabled`/`soundVolume`).
- **Block 3 (narrative)** — biggest gap → per-lesson `storyIntroHe`/`storyOutroHe` for all 20 lessons + Box battle taunts.
- **Block 4 (juice)** — mastery stars on map + lesson streak counter + per-key ripple.
- **Blocks 5-6** — backgrounds + polish → v3 backlog unless time remains.
