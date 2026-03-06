# Ninja Keyboard -- Character Integration Map

**Version:** 1.0
**Date:** March 2026
**Purpose:** Definitive blueprint for all character appearances, unlocks, expressions, and age-adaptive behavior across the entire game. This document drives art generation, code implementation, and narrative scripting.

**Related Documents:**
- `docs/character-bible-merged.md` -- Full character profiles
- `docs/age-adaptive-ux-spec.md` -- Age-based UX specifications
- `docs/ninja-keyboard-spec-v9-FINAL.md` -- Master spec (sections 22-23)
- `src/lib/story/story-script.ts` -- Current Act 1 story implementation
- `src/types/story.ts` -- Story type definitions

---

## 1. Character Encounter Timeline (20 Lessons)

### 1.1 Master Timeline Overview

```
LESSON  ACT   CHARACTERS PRESENT                    BOSS?   NARRATIVE ARC
------  ----  ------------------------------------  ------  -------------------------
  1     Act1  Ki, Sensei Zen (voice)                 No     Discovery
  2     Act1  Ki, Mika (intro)                       No     Partnership begins
  3     Act1  Ki, Mika                               No     Home row mastery
  4     Act1  Ki, Mika                               No     Speed training
  5     Act1  Ki, Mika, Bug (intro)                  No     First villain encounter
  6     Act1  Ki, Mika, Bug                          No     Fighting back
  7     Act1  Ki, Mika vs Bug                       MINI    Act 1 Boss: "Bug the Small"
  8     Act2  Sensei Zen (physical), Ki, Mika        No     Mentor arrival
  9     Act2  Ki, Mika, Sensei Zen                   No     Full keyboard training
 10     Act2  Yuki (intro), Ki, Mika                 No     Speed specialist joins
 11     Act2  Luna (intro), Ki                       No     Focus & patience
 12     Act2  Glitch (intro), Ki, Mika               No     Chaos escalation
 13     Act2  Kai (intro), Noa (intro), Ki, Mika     No     Warriors & healers
 14     Act2  ALL heroes, Bug                        No     Team unites
 15     Act2  ALL heroes vs Bug + Glitch            MID     Act 2 Boss: dual villain
 16     Act3  Ki, Mika, Bug                          No     Error Maze entrance
 17     Act3  Mika, Luna, Pixel                      No     Tech + focus combo
 18     Act3  Glitch (redemption), Ki                No     Wild card turns
 19     Act3  Kai, Noa, Yuki                         No     Final push
 20     Act3  ALL characters vs Bug King           FINAL    Graduation boss
```

---

### 1.2 Detailed Per-Lesson Breakdown

#### Lesson 1: "The Glowing Keyboard" (ההתעוררות)

| Field | Value |
|-------|-------|
| **Act** | 1 -- "The Awakening" |
| **Hero** | Ki (קי) |
| **Mentor** | Sensei Zen (סנסאי זן) -- voice only, echoing from the dojo walls |
| **Villain** | None |
| **Supporting** | None |
| **Story Beat (Pre)** | Ki wanders into an old dojo and discovers a keyboard that glows when touched. Sensei Zen's voice echoes: "?אהה, תלמיד חדש" |
| **Story Beat (Post)** | Ki feels the keys respond to his fingers. "!האצבעות שלי מרגישות את המקשים" |
| **Narrative Purpose** | Establish the premise: magic keyboard, mysterious mentor, player = Ki. This is the "call to adventure." |
| **Typing Focus** | Home row discovery (ש, ד, ג, כ, ע, י, ח, ל) |
| **Ki Mood** | thinking -> happy |
| **Environment** | Training Dojo (dimly lit, keyboard glowing) |

#### Lesson 2: "A Partner Appears" (מיקה נכנסת)

| Field | Value |
|-------|-------|
| **Act** | 1 |
| **Hero** | Ki (קי), Mika (מיקה) -- first appearance |
| **Mentor** | None |
| **Villain** | None |
| **Story Beat (Pre)** | Mika steps out of the shadows: "!בוא ננסה ביחד, קי" She was already training in secret. |
| **Story Beat (Post)** | Ki: "!ביחד אנחנו חזקים יותר" Partnership established. |
| **Narrative Purpose** | Introduce Mika as an equal partner (NOT a sidekick). Establish the speed vs. accuracy dynamic. |
| **Typing Focus** | Home row practice with partner encouragement |
| **Ki Mood** | excited -> cheering |
| **Mika Mood** | excited -> happy |
| **Story Flag Set** | `mikaJoined: true` |

#### Lesson 3: "Home Row Mastery" (שורת הבית)

| Field | Value |
|-------|-------|
| **Act** | 1 |
| **Hero** | Ki, Mika |
| **Story Beat (Pre)** | Ki: "...האצבעות שלי מתחילות לזכור" (muscle memory forming) |
| **Story Beat (Post)** | Mika: "!שורת הבית - הבסיס של כל נינג'ה" |
| **Narrative Purpose** | Reinforce mastery of home row. Mika as the knowledgeable one. |
| **Typing Focus** | Home row fluency, speed increase |
| **Environment** | Training Dojo (brighter now, Ki is more comfortable) |

#### Lesson 4: "Faster!" (יותר מהר)

| Field | Value |
|-------|-------|
| **Act** | 1 |
| **Hero** | Ki, Mika |
| **Story Beat (Pre)** | Mika: "!הפעם - יותר מהר" (competitive push) |
| **Story Beat (Post)** | Ki: "!אני מרגיש את המהירות" |
| **Narrative Purpose** | Introduce speed as a goal. Mika pushes Ki to improve. |
| **Typing Focus** | Upper row introduction |

#### Lesson 5: "Bug Strikes!" (הבאג מופיע)

| Field | Value |
|-------|-------|
| **Act** | 1 |
| **Hero** | Ki, Mika |
| **Villain** | Bug (באג) -- first appearance |
| **Story Beat (Pre)** | Bug bursts in, giggling: "!הא הא! בלבלתי לכם את האותיות" Letters start scrambling on screen. |
| **Story Beat (Post)** | Ki, startled: "!מי זה היה?! הוא בלבל הכל" |
| **Narrative Purpose** | Introduce the antagonist. Bug = the player's own typing errors externalized as a character. The villain is cute and funny, not scary. |
| **Typing Focus** | Lower row + dealing with letter scrambles |
| **Bug Mood** | mischievous (giggling, antenna wiggling) |
| **Story Flag Set** | `bugFirstAppearance: true` |
| **Environment** | Training Dojo (lights flicker, green pixels appear) |

#### Lesson 6: "Fighting Back" (לא ניתן לבאג לנצח)

| Field | Value |
|-------|-------|
| **Act** | 1 |
| **Hero** | Ki, Mika |
| **Villain** | Bug (lurking, scrambling occasionally) |
| **Story Beat (Pre)** | Mika, determined: "!לא ניתן לבאג לנצח" |
| **Story Beat (Post)** | Ki: "!אנחנו מתחזקים" |
| **Narrative Purpose** | Build confidence before the boss fight. The team is ready. |
| **Typing Focus** | Full keyboard consolidation |

#### Lesson 7: MINI-BOSS -- "Bug the Small" (באג הקטן)

| Field | Value |
|-------|-------|
| **Act** | 1 (climax) |
| **Hero** | Ki, Mika |
| **Villain** | Bug (באג) -- Boss Form: "Bug the Small" |
| **Boss Config** | 10 words in 60 seconds, Bug HP = 100, each correct word = -10 HP |
| **Story Beat (Pre)** | Bug: "!עכשיו אני מבלבל עשר מילים שלמות" (puffs up, confident) |
| **Story Beat (Post - Win)** | Ki: "!ניצחנו! אבל הוא ברח..." (Bug hugs himself, dizzy, flies away) |
| **Story Beat (Post - Lose)** | Bug: "!הא הא! אחזור מחר" (Bug dances, triumphant) |
| **Narrative Purpose** | First boss encounter. Teach that typing accuracy is the "weapon." Bug escapes (NEVER dies), setting up Act 2. |
| **Boss Mechanics** | Every correct word = -1 heart from Bug. 5-word combo = -2 hearts (Super Hit!). Error = Bug heals +1 heart. |
| **Visual Language** | Hearts as HP. Bug "hugs himself" when hit. Poof cloud when defeated. Stars and sparkles. No explosions, no blood, no violence. |
| **Story Flag Check** | `bossDefeated` or `bossNotDefeated` |
| **Environment** | Bug's Den (Home Row Forest) |

---

#### Lesson 8: "The Master Appears" (סנסאי זן מגיע)

| Field | Value |
|-------|-------|
| **Act** | 2 -- "The Training" |
| **Hero** | Ki, Mika |
| **Mentor** | Sensei Zen (סנסאי זן) -- physical appearance (no longer voice only) |
| **Story Beat (Pre)** | Sensei Zen walks out, slow and deliberate: "!סבלנות היא הנשק החזק ביותר" Reveals: "To defeat Bug, you must master EVERY key." |
| **Story Beat (Post)** | Sensei Zen: "!כל מסע מתחיל בלחיצה אחת" |
| **Narrative Purpose** | Introduce the true mentor. Raise the stakes. The training is about to get serious. |
| **Typing Focus** | Shift key, numbers, beginning of full keyboard |
| **Story Flag Set** | `senseiIntroduced: true` |
| **Environment** | Training Dojo (now fully lit, Sensei Zen's ancient keyboard visible on a pedestal) |

#### Lesson 9: "Full Keyboard Training" (כל המקשים)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | Ki, Mika |
| **Mentor** | Sensei Zen |
| **Story Beat (Pre)** | Sensei Zen, mysterious: "המקלדת מדברת... אם תקשיבו" |
| **Story Beat (Post)** | Ki: "!עכשיו אני מכיר כל מקש" |
| **Narrative Purpose** | Consolidate full keyboard mastery under Sensei Zen's guidance. |
| **Typing Focus** | Symbols, punctuation, full keyboard |

#### Lesson 10: "The Speed Challenge" (יוקי מאתגרת)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | Ki, Mika |
| **New Ally** | Yuki (יוקי) -- first appearance, challenges the team to a race |
| **Story Beat (Pre)** | Yuki flips in with a grin: "!אני הכי מהירה בדוג'ו" She challenges Ki: "!בואי נראה מי יותר מהירה" |
| **Story Beat (Post)** | Yuki, impressed: "!לא רע... בפעם הבאה לא תנצחו" |
| **Narrative Purpose** | Introduce speed as a dedicated skill. Yuki is the speed benchmark. Rival-friend dynamic with Ki. |
| **Typing Focus** | Speed drills, timed exercises |

#### Lesson 11: "The Moon Garden" (גן הירח)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | Ki |
| **New Ally** | Luna (לונה) -- first appearance in the Moonlit Garden |
| **Story Beat (Pre)** | Luna, serene: "...נשימה עמוקה, ואז מתחילים" She appears bathed in moonlight. |
| **Story Beat (Post)** | Luna: "!הדיוק שלך משתפר" |
| **Narrative Purpose** | Counterweight to the game's energy. Luna teaches that accuracy and patience matter more than raw speed. Calm before the storm of Glitch's arrival. |
| **Typing Focus** | Accuracy-focused exercises, deliberate typing |
| **Story Flag Set** | `lunaJoined: true` |
| **Environment** | Moonlit Garden (new environment, silver/indigo tones) |

#### Lesson 12: "Glitch Strikes!" (גליץ' מכה)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | Ki, Mika |
| **Villain** | Glitch (גליץ') -- first appearance |
| **Story Beat (Pre)** | Screen distorts. Pixels scatter. Glitch materializes: "!גגג-גליץ' פ-פ-פה" The keyboard layout flips. |
| **Story Beat (Post)** | Mika: "!הוא שיבש את כל המקשים" Ki: "...עכשיו יש לנו שני אויבים" |
| **Narrative Purpose** | Escalation. Bug was annoying; Glitch is chaotic. Glitch FLIPS the keyboard layout, creating a new kind of challenge. But Glitch stutters and seems confused -- planting seeds for the redemption arc. |
| **Typing Focus** | Typing under disruption, adapting to layout changes |
| **Story Flag Set** | `glitchRevealed: true` |
| **Environment** | Glitch Cave (RGB aberration, static overlays) |

#### Lesson 13: "Warriors and Healers" (לוחמים ומרפאים)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | Ki, Mika |
| **New Allies** | Kai (קאי) -- fire warrior, Noa (נועה) -- medic ninja |
| **Story Beat (Pre)** | Kai bursts in, flames on his fists: "!בוא נלחם" Noa follows, calm: "...ואני אתקן מה שהבאג שובר" |
| **Story Beat (Post)** | Ki: "!עכשיו אנחנו צוות שלם" |
| **Narrative Purpose** | Complete the team. Kai = power/defense for battles. Noa = healing/correction, the direct foil to Bug. Noa heals what Bug breaks. |
| **Typing Focus** | Team exercises: accuracy (Noa's influence) + combat drills (Kai's energy) |
| **Story Flag Set** | `noaJoined: true` |

#### Lesson 14: "United We Type" (ביחד אנחנו חזקים)

| Field | Value |
|-------|-------|
| **Act** | 2 |
| **Hero** | ALL heroes (Ki, Mika, Yuki, Luna, Kai, Noa) |
| **Mentor** | Sensei Zen (watching, proud) |
| **Villain** | Bug (scrambling entire paragraphs) |
| **Story Beat (Pre)** | Bug returns with full paragraphs of scrambled text. Sensei Zen: "...רק ביחד תוכלו" |
| **Story Beat (Post)** | All heroes celebrate together. Ki: "!עכשיו אנחנו מוכנים" |
| **Narrative Purpose** | Showcase the full team working together before the mid-boss. Each hero contributes their specialty. |
| **Typing Focus** | Long paragraphs, mixed challenges |

#### Lesson 15: MID-BOSS -- "Bug + Glitch" (באג וגליץ' יחד)

| Field | Value |
|-------|-------|
| **Act** | 2 (climax) |
| **Hero** | ALL heroes |
| **Villain** | Bug (באג) + Glitch (גליץ') -- dual boss |
| **Boss Config** | 20 words + error insertion fixes + keyboard layout flips. Bug HP = 150 (words), Glitch HP = 100 (fixes). Time limit: 90 seconds. |
| **Story Beat (Pre)** | Bug: "!הפעם הבאתי חבר" Glitch: "!א-א-אני לא מ-מכוון... אבל ב-בלגן זה כיף" |
| **Story Beat (Post - Win)** | Bug flees again. Glitch stutters: "?מ-מה קורה ל-לי" and dissolves into pixels, confused. |
| **Story Beat (Post - Lose)** | Bug and Glitch high-five (or try to -- Glitch's hand passes through Bug). |
| **Narrative Purpose** | Raise stakes dramatically. Two villains at once. Glitch's confusion hints at the redemption arc in Act 3. |
| **Boss Mechanics** | Bug scrambles words (type them correctly). Glitch flips random keys (adapt quickly). Combo system: 5 correct = Super Hit. |
| **Environment** | Glitch Cave / Bug's Den overlap (split-screen aesthetic, green + pink/blue pixels) |

---

#### Lesson 16: "Enter the Error Maze" (מבוך השגיאות)

| Field | Value |
|-------|-------|
| **Act** | 3 -- "The Ninja" |
| **Hero** | Ki, Mika |
| **Villain** | Bug (host of the maze) |
| **Story Beat (Pre)** | Bug, on a giant screen: "!ברוכים הבאים לעולם שלי" The Error Maze opens. |
| **Story Beat (Post)** | Ki: "...המבוך הזה מסובך, אבל לא נוותר" |
| **Narrative Purpose** | Enter the final act. Bug has built an entire digital labyrinth of scrambled text. The team must navigate it. |
| **Typing Focus** | Complex sentences, mixed Hebrew, error detection |
| **Environment** | Error Maze (corrupted digital labyrinth, green/purple glitch aesthetic) |

#### Lesson 17: "Hacking Through" (מיקה פורצת)

| Field | Value |
|-------|-------|
| **Act** | 3 |
| **Hero** | Mika (lead), Luna, Pixel (data support) |
| **Story Beat (Pre)** | Mika activates her wrist gauntlets: "!בואי נפרוץ את המערכת" Luna: "!ואני אמצא את הדרך השקטה" |
| **Story Beat (Post)** | Pixel: "!חומת אש פרוצה! 73% מהמבוך ממופה" |
| **Narrative Purpose** | Showcase Mika's tech skills (keyboard shortcuts) and Luna's calm focus. Pixel provides data. This is Mika and Luna's spotlight lesson. |
| **Typing Focus** | Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z, etc.) + accuracy |
| **Note** | Ki takes a back seat. Let Mika and Luna shine. |

#### Lesson 18: "Glitch Wavers" (גליץ' מתלבט)

| Field | Value |
|-------|-------|
| **Act** | 3 |
| **Hero** | Ki, Glitch (גליץ') -- partial ally |
| **Story Beat (Pre)** | Glitch appears, flickering: "!א-א-אני לא רוצה להיות ר-ר-רע" Player must type accurately to "calm" Glitch. |
| **Story Beat (Post)** | Glitch stabilizes briefly: "...ת-תודה" Then glitches out again, but leaves a path open. |
| **Narrative Purpose** | Glitch's redemption arc. The wild card briefly helps before losing control again. Morally ambiguous: Glitch is not evil, just broken. Accurate typing = empathy/healing, not violence. |
| **Typing Focus** | Precision typing under visual distortion (Glitch's aura causes screen effects) |
| **Glitch Moods** | confused -> calm/friendly -> glitching (losing control) |

#### Lesson 19: "Hold the Line" (מחזיקים מעמד)

| Field | Value |
|-------|-------|
| **Act** | 3 |
| **Hero** | Kai (lead), Noa, Yuki |
| **Villain** | Bug's minions (small scramble effects) |
| **Story Beat (Pre)** | Kai: "!אני אעצור אותם - אתם תקלידו" Noa: "!ואני אתקן כל שגיאה" Yuki: "!מהר, אין הרבה זמן" |
| **Story Beat (Post)** | The path to Bug King's Palace is clear. Kai, exhausted but proud: "!עשינו את זה" |
| **Narrative Purpose** | Each remaining hero contributes their specialty. Kai = protection/defense, Noa = error healing, Yuki = speed. This is Kai, Noa, and Yuki's spotlight lesson. |
| **Typing Focus** | Speed (Yuki) + accuracy (Noa) + endurance (Kai's encouragement) |

#### Lesson 20: FINAL BOSS -- "Bug King" (מלך הבאגים)

| Field | Value |
|-------|-------|
| **Act** | 3 (finale) |
| **Hero** | ALL heroes (Ki, Mika, Yuki, Luna, Kai, Noa) |
| **Mentor** | Sensei Zen (watching, whispering wisdom) |
| **Companions** | Pixel (data overlay), Rex (cheerleader) |
| **Villain** | Bug King (מלך הבאגים) -- Bug at full power with tiny crown and code cape |
| **Boss Config** | 50 words in 120 seconds, 90%+ accuracy required. Bug King HP = 200. |
| **Story Beat (Pre)** | Bug, wearing a tiny golden crown: "!אני מלך הבאגים! לעולם לא תנצחו אותי" All heroes rally behind the player. Sensei Zen: "...כל מה שלמדת מוביל לרגע הזה" |
| **Story Beat (Post - Win)** | Bug King's crown falls off. Bug hugs himself, dizzy spirals in eyes. "!אוי! אחזוווור..." Bug flies away (poof cloud). ALL heroes celebrate. Sensei Zen removes his glasses, wipes a tear: "...נינג'ה אמיתי" Certificate appears: "True Keyboard Ninja." |
| **Story Beat (Post - Lose)** | Bug King: "!עוד סיבוב? אני ממתין" (encouraging retry, not mocking) |
| **Narrative Purpose** | Grand finale. Every hero helps via the combo system. The player graduates. Bug escapes (setting up future content). |
| **Combo System** | Ki = speed burst (+10% WPM for 5 sec), Mika = accuracy shield (1 free error), Yuki = burst mode (double points for 3 sec), Luna = focus lens (bigger keys for 3 sec), Kai = power strike (correct word = -2 HP), Noa = healing (remove 1 error from record) |
| **Story Flag Set** | `finalBossDefeated: true` |
| **Environment** | Bug King's Palace (corrupted digital throne room, purple/green, epic scale) |
| **Post-Game** | Certificate of "True Keyboard Ninja." Credits roll with chibi character art. Bug escapes, winking at camera. |

---

## 2. Character Unlock Mechanics

### 2.1 Unlock Philosophy

Characters unlock through NATURAL story progression, not artificial gates. When a character appears in the narrative, they become available as a companion across the game. This rewards lesson completion with tangible content.

### 2.2 Unlock Schedule

| # | Character | Hebrew | Unlock Trigger | Lesson | Unlock Type |
|---|-----------|--------|----------------|--------|-------------|
| 1 | Ki | קי | Available from start | 0 | Default -- always present |
| 2 | Mika | מיקה | Complete Lesson 2 | 2 | Story -- joins as partner |
| 3 | Sensei Zen | סנסאי זן | Complete Lesson 8 | 8 | Story -- appears physically |
| 4 | Yuki | יוקי | Complete Lesson 10 | 10 | Story -- speed challenge |
| 5 | Luna | לונה | Complete Lesson 11 | 11 | Story -- moon garden visit |
| 6 | Kai | קאי | Complete Lesson 13 | 13 | Story -- warrior arrives |
| 7 | Noa | נועה | Complete Lesson 13 | 13 | Story -- medic arrives |
| 8 | Pixel | פיקסל | Available from start | 0 | UI element -- always present in stats |
| 9 | Rex | רקס | Complete any 3 games in Games Hub | N/A | Achievement -- gaming milestone |
| 10 | Shadow | צל | Enter Battle Arena for the first time | N/A | Battle -- first opponent revealed |
| 11 | Storm | סערה | Defeat Shadow in Battle Arena | N/A | Battle -- mid-tier unlocked |
| 12 | Blaze | להבה | Defeat Storm in Battle Arena | N/A | Battle -- final rival unlocked |
| 13 | Bug | באג | Story-revealed at Lesson 5 (NOT unlockable as companion) | 5 | Villain -- appears only in boss/events |
| 14 | Glitch | גליץ' | Story-revealed at Lesson 12 (NOT unlockable as companion) | 12 | Villain -- appears only in boss/events |

### 2.3 Early Access Exceptions

The following characters appear in their page roles BEFORE story unlock, but without dialogue or narrative context:

| Character | Pre-Unlock Appearance | Condition |
|-----------|----------------------|-----------|
| Sensei Zen | Voice-only in Lesson 1 intro; small avatar on lesson cards | Before Lesson 8 |
| Pixel | Always visible on Statistics page as data display robot | From start |
| Rex | Small icon on Games page as gaming buddy | From start |
| Noa | Contextual appearance when error rate > 40% on any lesson | From start, no story dialogue |

### 2.4 What Unlocking Means

When a character unlocks, the following changes occur:

| Unlock Effect | Description |
|---------------|-------------|
| **Companion Selection** | Player can choose the character as their active companion on the home dashboard |
| **Dialogue Activation** | Character begins speaking in their assigned pages (speech bubbles) |
| **Celebration Animation** | A one-time unlock animation plays: character jumps in, poses, says a greeting line |
| **Profile Gallery** | Character appears in the player's "My Team" gallery on the profile page |
| **Achievement Badge** | "New Ally" badge awarded: "(character name) הצטרף/ה לצוות" |
| **Page Enhancement** | Character appears in their assigned page at the appropriate size for the age theme |
| **Home Carousel** | Unlocked characters cycle on the home dashboard (max 3 visible at once) |

### 2.5 Unlock Animation Specifications

Each unlock plays a 3-second animation:

| Character | Unlock Animation | Greeting Line |
|-----------|-----------------|---------------|
| Mika | Slides in from right, holographic gauntlets flash | "!היי! ביחד נהיה בלתי ניתנים לעצירה" |
| Sensei Zen | Fades in slowly with golden glow, bows | "...סבלנות, תלמידים. הכל מתחיל כאן" |
| Yuki | Speed blur entrance, cat ears bounce | "!הכי מהירה בדוג'ו - עד עכשיו" |
| Luna | Descends from above with moonlight particles | "...נשימה, ריכוז, ואז... הקלדה מושלמת" |
| Kai | Bursts in with flame effects (particles, not real fire) | "!אש באצבעות! בוא נלחם" |
| Noa | Walks in gently, green healing sparkles | "!אני כאן, לא נורא לטעות" |
| Rex | Stomps in, tiny arms waving | "!גם עם ידיים קטנות - אני פה" |
| Shadow | Materializes from darkness, purple eyes glow | "...צל מופיע. הכינו את האצבעות" |
| Storm | Lightning flash, then appears | "!ברק! מוכנים לגורל שלכם?" |
| Blaze | Fire circle, then steps through | "!אש קדושה! רק הראויים ישרדו" |

---

## 3. Character Roles Per Page

### 3.1 Complete Page-to-Character Map

| Page | Primary Character | Secondary Character(s) | Tertiary / Contextual | Environment |
|------|-------------------|------------------------|----------------------|-------------|
| **Home Dashboard** | Ki (welcome, daily tip) | Cycling unlocked companions (max 3) | Pixel (stats bar) | Gradient bg, adaptive |
| **Lessons** | Sensei Zen (guide, intro) | Ki (encouragement, reactions) | Lesson-specific (see timeline) | Training Dojo |
| **Practice (Free)** | Luna (calm guide) | Noa (appears if errors > 40%) | Ki (small, corner) | Moonlit Garden |
| **Speed Test** | Yuki (competitor, races player) | Rex (cheerleader, reacts to speed) | Ki (small, watching) | Speed Arena |
| **Battle Arena** | Kai (coach, strategy tips) | Shadow/Storm/Blaze (opponents) | Ki (small, cheering) | Battle Colosseum |
| **Keyboard Shortcuts** | Mika (tech expert, demonstrations) | Pixel (data overlay, shortcut hints) | Ki (small, learning) | Cyber Lab |
| **Games Hub** | Rex (gaming buddy, intro to each game) | Pixel (score display) | Ki (small, playing) | Games Arcade |
| **Statistics** | Pixel (primary data presenter) | -- | Ki (tiny, corner) | Data UI overlay |
| **Profile / Settings** | Ki (small icon, selected companion) | -- | -- | -- |
| **Onboarding** | Ki (main guide) | Sensei Zen (wisdom tips) | -- | Training Dojo |
| **Boss Battles** | ALL heroes (rally) | Bug / Glitch (enemies) | Pixel (HP/time display) | Varies by act |
| **Error Help (overlay)** | Noa (contextual healer) | -- | -- | Floating overlay |
| **Achievements** | Ki (cheering) | Relevant character per achievement | -- | -- |
| **World Map** | Ki (traveler marker) | Characters at their locations | -- | World Map view |

### 3.2 Sidebar & Navigation Characters

| UI Element | Character | Behavior |
|------------|-----------|----------|
| Sidebar logo/avatar | Ki (small mascot, reactive to page) | Idle on sidebar. Happy when navigating. |
| Lesson completion | Ki + Sensei Zen (celebration) | Ki cheers, Sensei nods wisely |
| Achievement popup | Ki (cheering mood) | Jumps, sparkles |
| Error streak (>5) | Noa (appears as overlay) | "!לא נורא, ננסה שוב" |
| Daily tip (home) | Sensei Zen (bubble) | Rotates through wisdom quotes |
| Streak counter | Ki (flame animation at streak > 7) | Flame grows with streak |
| Level-up banner | Relevant page character | Character-specific celebration |

### 3.3 Teacher / Admin View

Teachers see a professional, data-focused interface:

| Element | Student View | Teacher View |
|---------|-------------|--------------|
| Primary character | Ki (energetic, large) | Sensei Zen (wise, small avatar) |
| Character presence | Full characters, animated | Sensei Zen avatar in sidebar only |
| Data companion | Pixel (cheerful) | Pixel (analytical, prominent) |
| Dialogue tone | Fun, slang, encouragement | Professional, data-driven |
| Story/Narrative | Full bubbles and story beats | Disabled |
| Battle mode | Available | Hidden or "demo" only |
| Characters in reports | Emoji icons per student | Names only, no characters |

---

## 4. Villain Arc Structure

### 4.1 Bug's (באג) Complete Arc

#### Act 1: "The Nuisance" (Lessons 5-7)

Bug is introduced as a cute, mischievous creature that scrambles a few letters. He is NOT threatening -- more like a naughty puppy. His attacks are small: swapping individual letters, inserting wrong characters.

| Lesson | Bug's Power Level | Attack Type | Scramble Scope |
|--------|------------------|-------------|----------------|
| 5 | Low | Swaps 2-3 letters per word | Individual letters |
| 6 | Low-Medium | Swaps letters + inserts wrong chars | 1-2 words at a time |
| 7 (Boss) | Medium | Scrambles 10 complete words | Full words |

**Bug's Motivation:** Bug does not understand he is "bad." He thinks scrambling is FUN. He giggles. He dances. He is chaos personified, not malice. This is critical for the kids' emotional safety.

#### Act 2: "The Escalation" (Lessons 8-15)

Bug grows stronger as the player grows stronger. He scrambles entire sentences now. He recruits Glitch (reluctantly -- Glitch is confused about sides). The duo creates bigger disruptions.

| Lesson | Bug's Power Level | Attack Type | New Ability |
|--------|------------------|-------------|-------------|
| 8-11 | Medium | Paragraph-level scrambles | Faster scrambling |
| 12 | Medium-High | Works with Glitch | Glitch flips keyboard layout |
| 13-14 | High | Full paragraph + error insertions | Errors auto-regenerate |
| 15 (Boss) | High | 20 words + keyboard flips | Dual villain mechanics |

#### Act 3: "The Bug King" (Lessons 16-20)

Bug builds the Error Maze -- an entire digital world of scrambled text. He crowns himself "Bug King" with a tiny golden crown. At full power, he scrambles everything: text, UI elements, even character dialogue (briefly). But he is STILL cute. Even as Bug King, he looks like a chubby beetle wearing a crown too big for his head.

| Lesson | Bug's Power Level | Attack Type | Context |
|--------|------------------|-------------|---------|
| 16 | Very High | Hosts the Error Maze | Environmental hazard |
| 17-19 | Very High | Minions + persistent scrambles | Team navigates maze |
| 20 (Boss) | Maximum -- "Bug King" | 50 words, 90% accuracy, timer | Final showdown |

#### "Bug Never Dies" Rule (CRITICAL)

This is a core design principle rooted in child psychology:

| Scenario | What Happens | Visual | Audio |
|----------|-------------|--------|-------|
| Bug hit by correct word | Bug hugs himself, antenna droop | Spiral eyes (dizzy), wobble | Cartoon "boing" |
| Bug loses HP | Shell cracks slightly (like eggshell, cute) | Small pixel particles escape | Soft "pop" |
| Bug loses all HP | Bug King's crown falls off. Bug shrinks to small size. | Dizzy spirals, silly face | Slide whistle |
| Bug "defeated" | Bug puffs up cheeks, says "!אחזוווור" and FLIES AWAY | Poof cloud, sparkles | Whoosh + giggle |
| Bug never | Dies, shows pain, bleeds, explodes, is destroyed | N/A | N/A |

**Post-game:** Bug winks at the camera during credits. He will return in future content (Season 2, monthly boss events, seasonal events). Bug is the franchise's recurring comedic villain.

### 4.2 Glitch's (גליץ') Arc

#### Pre-Appearance (Lessons 1-11)

Glitch does not exist in the narrative yet. No foreshadowing (to keep Act 2 surprise clean).

#### Introduction (Lesson 12)

Glitch materializes during a lesson, causing screen distortion. Unlike Bug, Glitch does not seem to WANT to cause problems. He stutters, apologizes, and seems confused about his own existence. This immediately makes Glitch a sympathetic figure.

#### Alliance with Bug (Lessons 12-15)

Bug recruits Glitch, but it is an uneasy alliance:
- Bug tells Glitch to "mess things up"
- Glitch complies but keeps apologizing
- In the Lesson 15 boss fight, Glitch fights alongside Bug but is clearly not committed
- Glitch's attacks are more chaotic and less targeted than Bug's

#### Redemption Arc (Lesson 18)

The player "calms" Glitch by typing accurately. As accuracy increases, Glitch's pixels settle into a more defined, peaceful shape. Glitch briefly helps by opening a path in the Error Maze. Then Glitch loses control again and dissolves into pixels.

**Glitch's arc is about empathy:** The player does not FIGHT Glitch -- they CALM Glitch through mastery. This teaches kids that not all opposition is hostile; some "enemies" are just confused and need patience.

#### Post-Game Status

Glitch remains a wild card. In seasonal events (especially Purim), Glitch returns as a neutral chaos agent. Sometimes helpful, sometimes disruptive. Always sympathetic.

### 4.3 "The Weapon = The Keyboard" Mechanic

The central combat metaphor of Ninja Keyboard:

```
ATTACK    = Typing a word correctly
COMBO     = 5 correct words in a row
SUPER HIT = Combo completes (double damage)
DEFENSE   = High accuracy (>90%) prevents Bug from healing
HEALING   = Noa's special (removes 1 error from record)
SHIELD    = Mika's special (1 free error forgiven)
BOOST     = Ki's speed burst, Yuki's burst mode, Kai's power strike
FOCUS     = Luna's calm lens (bigger key targets for 3 seconds)
```

| Action | Player Skill | Game Mechanic | Visual Feedback |
|--------|-------------|---------------|-----------------|
| Correct word | Accuracy | Bug takes -1 heart | Green flash, star particles |
| 5-word combo | Consistency | Bug takes -2 hearts (Super Hit!) | Gold flash, all heroes cheer |
| Typing error | Mistake | Bug heals +1 heart | Red flash, Bug giggles |
| High speed | Speed | Timer bonus, more points | Speed lines, Yuki celebrates |
| Shortcut used | Knowledge | Breaks through barriers | Circuit pattern, Mika celebrates |

### 4.4 Bug's Future Forms (Post-Launch Content)

| Form | Event | Visual Description |
|------|-------|--------------------|
| Bug the Small | Lesson 7 | Standard chibi beetle, lime green, mischievous grin |
| Bug + Glitch | Lesson 15 | Bug rides on Glitch's pixel cloud |
| Bug King | Lesson 20 | 1.5x size, tiny golden crown, code cape, glowing shell |
| Hanukkah Bug | Kislev event | Bug wearing a tiny dreidel hat, scrambles Hanukkah words |
| Purim Bug | Adar event | Bug in a costume (different each year), extra silly |
| Beach Bug | Summer event | Bug with tiny sunglasses and a beach umbrella |
| SPAM (future) | Monthly boss | Email spam entity -- new villain, not Bug |
| VIRUS (future) | Monthly boss | Text corruption entity -- new villain |

---

## 5. Skins / Alternate Modes

### 5.1 Seasonal Character Skins

Characters can wear seasonal costumes during holiday events. These are purely cosmetic.

| Event | Characters with Skins | Skin Description |
|-------|-----------------------|-----------------|
| **Hanukkah** (כסלו) | Ki: Menorah headband, blue/white accents. Mika: Dreidel hologram drone. | "Hanukkah Ninja" skin set |
| **Purim** (אדר) | ALL characters get silly costumes. Ki as a clown. Mika as a robot. Rex as a chicken. Bug gets the BEST costume. | "Purim Flip" skin set -- Glitch is the star (flips everything) |
| **Tu BiShvat** (שבט) | Noa: Flower crown, vine patterns. Rex: Tree costume. | "Garden Ninja" skin set |
| **Hebrew Week** | Sensei Zen: Traditional scribe outfit, quill accessory. | "Guardian of Hebrew" skin |
| **Book Week** (אייר) | Luna: Book pages flowing around her. Ki: Bookworm glasses. | "Story Ninja" skin set |
| **Summer** (יולי-אוגוסט) | Ki: Beach shorts, surfboard. Yuki: Swimming goggles, water splash effects. | "Beach Ninja" skin set |
| **Cyber Week** (פברואר) | Mika: Enhanced cyberpunk armor, dual drones. Pixel: Red alert mode. | "Cyber Ninja" skin set |
| **Back to School** (ספטמבר) | Ki: Backpack, pencil behind ear. Sensei Zen: Blackboard pointer. | "First Day" skin set |

### 5.2 Player Avatar Skins

Players do NOT play AS a character. The characters are companions. However, players can customize their profile avatar:

| Customization | Source | How Unlocked |
|---------------|--------|--------------|
| Default avatar | 6 pre-set ninja silhouettes | Available from start |
| Character-inspired avatar | Ki-style, Mika-style, etc. | Unlock the character + reach WPM milestone |
| Seasonal avatar frame | Holiday-themed border | Complete seasonal event |
| Achievement badge overlay | Specific badges overlay on avatar | Earn the achievement |
| "Ninja Belt" color | White -> Yellow -> Green -> Blue -> Purple -> Black | WPM thresholds (10, 20, 30, 40, 50, 60) |

### 5.3 Game Mode Character Variants

| Game Mode | Character Variant | Description |
|-----------|------------------|-------------|
| **Word Rain** (Games) | Rex catches falling words | Rex runs left-right, tiny arms reaching |
| **Ninja Slice** (Games) | Ki slices flying characters | Fruit-Ninja style but with Hebrew letters |
| **Letter Memory** (Games) | Pixel reveals matching pairs | Memory card game, Pixel flips cards |
| **Speed Sprint** (Speed Test) | Yuki races alongside player text | Split-screen race visualization |
| **Shortcut Dojo** (Shortcuts) | Mika demonstrates each shortcut | Holographic keyboard overlay |
| **Boss Rush** (Special) | All heroes vs. Bug forms | Rapid-fire boss sequence |
| **Zen Mode** (Practice) | Luna only, no others | Minimal UI, calm music, moonlight |
| **Challenge Mode** (Battle) | Kai coaches, rival appears | 1v1 visualization |

### 5.4 Teacher View Characters

| Character | Teacher View Role | Visual |
|-----------|------------------|--------|
| Sensei Zen | Primary teacher-facing character | Small avatar in sidebar header, professional tone |
| Pixel | Analytics companion | Prominent on dashboards, shows class data |
| All others | Hidden | Not shown in teacher view |

---

## 6. Age-Adaptive Character Visibility

### 6.1 Master Visibility Matrix

```
CHARACTER         SHATIL (6-8)      NEVET (8-10)      GEZA (10-12)      ANAF (12-14)      TZAMERET (14-16+)
                  "Magical Garden"  "Adventure Camp"   "Ninja Arena"     "Training Hub"    "Pro Dashboard"
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Ki (mascot)      | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | TINY 28px       | HIDDEN
                 | center, always  | corner, always  | corner, fixed   | header icon     | (settings toggle)
                 | animated idle   | subtle idle     | minimal anim    | static avatar   |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Mika (tech)      | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | shortcuts page  | shortcuts page  | shortcuts page  |                 |
                 | extra friendly  | competitive     | sarcastic cool  |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Sensei Zen       | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | Tooltip avatar  | HIDDEN
(mentor)         | lessons page    | lessons page    | lessons page    | Loading tips    | (tip text only)
                 | "grandpa" warm  | wise + warm     | cryptic riddles | Wisdom quotes   |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Yuki (speed)     | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | speed test      | speed test      | speed test      |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Luna (focus)     | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | practice page   | practice page   | practice page   |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Kai (battle)     | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | battle arena    | battle arena    | battle arena    |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Noa (healer)     | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | on errors       | on errors       | on errors       |                 |
                 | extra patient   | encouraging     | concise help    |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Pixel (data)     | LARGE 100px     | MEDIUM 64px     | SMALL 48px      | SMALL 36px      | HIDDEN
                 | stats page      | stats page      | stats page      | stats page      | (data without char)
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Rex (games)      | LARGE 120px     | MEDIUM 80px     | SMALL 48px      | HIDDEN          | HIDDEN
                 | games hub       | games hub       | games hub       |                 |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Bug (villain)    | VERY cute       | Cute villain    | Full villain    | Full villain    | Small icon
                 | 5 words boss    | 10 words boss   | Timer+accuracy  | +leaderboard    | "Beat record"
                 | giant celebrate | celebrate       | combo system    | compete         | no story framing
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Glitch           | DOES NOT APPEAR | Brief in Act 2  | Full presence   | Full presence   | Icon-only
                 | (too confusing) | "silly" framing | interesting     | challenge-focus | or absent
-----------------+------------------+-----------------+-----------------+-----------------+------------------
Rivals           | LARGE, friendly | MEDIUM, rival   | STANDARD battle | SMALL, serious  | Text name only
(Shadow/Storm/   | "let's play!"  | "let's race!"   | full competitive| leaderboard     | pure typing test
Blaze)           |                 |                 | rankings        | focused         |
-----------------+------------------+-----------------+-----------------+-----------------+------------------
```

### 6.2 Detailed Behavior Per Age Tier

#### Shatil (6-8) -- "Magical Garden"

**Active Characters:** Ki, Mika, Sensei Zen, Noa, Pixel, Rex, Bug (cute version), Shadow (friendly)

**NOT shown:** Glitch (too confusing/potentially scary), Storm (too intense), Blaze (too intense)

| Behavioral Rule | Detail |
|----------------|--------|
| Character style | Extra chibi proportions, softer colors, BIGGER eyes, rounded shapes |
| Ki | Large, central, talks A LOT. Animated reactions to every keystroke. Celebrates every correct word. |
| Mika | When present, extra friendly (not competitive). "!בואי נעשה ביחד" instead of challenging. |
| Sensei Zen | "Grandpa turtle" energy. Speaks simply, very encouraging. Max 5 words per bubble. |
| Bug | VERY cute. Boss fight = 5 words, no timer. Bug "runs away" with a silly face. GIANT celebration after. |
| Noa | Appears quickly if errors detected (>30% error rate). Extra patient. "!לא נורא, ננסה שוב" |
| Dialogue | Max 5 words per speech bubble. Simple Hebrew. Niqqud (vowels) optional but available. |
| Boss adaptation | Bug escapes after 5 words. No timer pressure. Massive confetti + star celebration. |
| Narrative | Minimal. Short bubbles, no complex plot. "Ki found a keyboard! Let's type!" |

#### Nevet (8-10) -- "Adventure Camp"

**Active Characters:** Ki, Mika, Sensei Zen, Yuki, Luna, Noa, Kai, Pixel, Rex, Bug, Shadow, Storm

**Limited:** Glitch (brief appearance, "silly" framing only)

| Behavioral Rule | Detail |
|----------------|--------|
| Character style | Standard chibi, bright colors, energetic |
| Ki | Medium-sized, reactive, encouraging but less "hand-holding" than Shatil |
| Mika | Full competitive personality. "!בואי נראה מי יותר מדויקת" |
| Bug | Cute villain. 10-word boss fights, relaxed timing. |
| Glitch | Appears only in Lesson 12+, framed as "the silly pixel thing" not threatening. |
| Dialogue | Max 8 words per bubble. More story context. |
| Boss adaptation | 10 words, relaxed timing, combo encouraged but not required. |
| Narrative | Full Act 1-3 story with appropriate simplification. |

#### Geza (10-12) -- "Ninja Arena"

**Active Characters:** ALL 14 characters at full presence.

| Behavioral Rule | Detail |
|----------------|--------|
| Character style | Slightly taller proportions (less chibi), more detailed, cooler aesthetic |
| Ki | Small, in corner. Less talking, more action. Reacts to big moments only. |
| Mika | Cooler, more sarcastic. Tech-savvy persona amplified. |
| Bug | Full villain. Boss fights include time + accuracy + combo system. |
| Glitch | Full presence. Interesting and mysterious, not just "silly." |
| Rivals | Shadow/Storm/Blaze fully engaged. Leaderboards active. Competitive focus. |
| Dialogue | 10+ words per bubble. Full Hebrew. Battle taunts. |
| Boss adaptation | Timer + accuracy + combo system. Class leaderboard comparison. |
| Narrative | Complete 3-act story with all story beats. |

#### Anaf (12-14) -- "Training Hub"

**Active Characters:** Ki (tiny), Pixel (data), Bug/Glitch (challenge mode), Rivals (leaderboard)

**Hidden:** Mika, Yuki, Luna, Kai, Noa, Rex, Sensei Zen (except as tips)

| Behavioral Rule | Detail |
|----------------|--------|
| Character style | More detailed, less cartoonish, sleek |
| Ki | Icon/avatar only (28px). Minimal dialogue. Appears in header. |
| Pixel | More prominent as analytics companion. Shows data, not personality. |
| Sensei Zen | Rare. Wisdom quotes as loading screen tips, no visual character. |
| Bug/Glitch | Full challenge, but narrative delivered through SHORT tooltips only. |
| Rivals | Active in battle mode with leaderboard focus. |
| Dialogue | Factual. "WPM: 45, Accuracy: 92%" not "!מעולה! כל הכבוד" |
| Boss adaptation | Full mechanics + class leaderboard. "Beat your best" messaging. |
| Narrative | Dramatically reduced. "Show, don't tell." Data-driven progression. |

#### Tzameret (14-16+) -- "Pro Dashboard"

**Active Characters:** None by default. Pixel available as data display (no personality). Ki toggleable in settings.

| Behavioral Rule | Detail |
|----------------|--------|
| Character style | Most detailed/mature art style IF enabled, but DEFAULT = invisible |
| Ki | Fully disabled by default. Toggleable in Settings > Appearance > "Show Mascot." |
| All heroes | Not rendered. `display: none` via `[data-theme='tzameret'] [data-role='mascot']`. |
| Pixel | Data display only. No face emotions, no personality. Just charts and numbers. |
| Bug | Boss fights are pure typing challenges. Bug is a small animated icon (24px), not a character. |
| Glitch | Absent or icon-only in special events. |
| Sensei Zen | Tip text only. No visual representation. |
| Dialogue | Zero speech bubbles. Progress shown as numbers and graphs. |
| Boss adaptation | "Beat your personal record." No story framing whatsoever. Pure skill benchmark. |
| Narrative | None. The entire story system is disabled. |

### 6.3 CSS Implementation Reference

```css
/* Character visibility by theme */
[data-theme='shatil'] [data-role='mascot'] {
  width: var(--mascot-size-large, 120px);
  display: block;
}

[data-theme='nevet'] [data-role='mascot'] {
  width: var(--mascot-size-medium, 80px);
  display: block;
}

[data-theme='geza'] [data-role='mascot'] {
  width: var(--mascot-size-small, 48px);
  display: block;
}

[data-theme='anaf'] [data-role='mascot'] {
  width: var(--mascot-size-tiny, 28px);
  display: block; /* Ki only; others hidden */
}

[data-theme='tzameret'] [data-role='mascot'] {
  display: none;
}

/* Per-character visibility overrides */
[data-theme='shatil'] [data-character='glitch'] { display: none; }
[data-theme='shatil'] [data-character='storm'] { display: none; }
[data-theme='shatil'] [data-character='blaze'] { display: none; }

[data-theme='anaf'] [data-character]:not([data-character='ki']):not([data-character='pixel']) {
  display: none;
}
```

---

## 7. Expression/Pose Requirements Per Character

### 7.1 Ki (קי) -- Main Mascot

**Total expressions needed: 12**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Default state on all pages | P0 |
| happy | שמח | Correct answer, small win | P0 |
| excited | נרגש | Big achievement, level up, combo | P0 |
| thinking | חושב | Lesson intro, before typing starts | P0 |
| sad | עצוב | Failed attempt, low score | P0 |
| cheering | מעודד | Boss defeated, milestone reached | P0 |
| sleeping | ישן | Idle timeout (>60 sec no input) | P1 |
| surprised | מופתע | Bug appears, unexpected event | P1 |
| determined | נחוש | Boss battle start, challenge accepted | P1 |
| celebrating | חוגג | Lesson complete, achievement unlocked | P1 |
| confused | מבולבל | Glitch distortion, layout change | P2 |
| winking | קורץ | Easter egg, secret found | P2 |

**Poses (for model sheet / full-body art):**

| Pose | Hebrew Name | Usage |
|------|-------------|-------|
| Standing ready | עמידת מוכנות | Default full-body, home page |
| Running | ריצה | Speed test, transitions |
| Typing | מקליד | During lessons, typing area adjacent |
| Victory | ניצחון | Post-boss, achievement |
| Pointing forward | מצביע | "Let's go!" CTA moments |
| Sitting cross-legged | ישיבה | Practice mode, calm moments |

### 7.2 Mika (מיקה) -- Tech Ninja

**Total expressions needed: 10**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Default on shortcuts page | P0 |
| happy | שמחה | Correct shortcut used | P0 |
| excited | נרגשת | Tech challenge completed, shortcut mastery | P0 |
| thinking | חושבת | Analyzing a problem, before demonstrating shortcut | P0 |
| competitive | תחרותית | Challenging the player, speed comparison | P0 |
| impressed | מרשימה | Player exceeds expectations | P1 |
| hacking | פורצת | Keyboard shortcut demonstrations, Cyber Lab | P1 |
| determined | נחושה | Boss battle, putting on orange mask | P1 |
| sarcastic | ציניקנית | Player makes obvious mistake (Geza+ age only) | P2 |
| celebrating | חוגגת | Boss defeated, mission complete | P2 |

**Special Visual State:**
| State | Description |
|-------|-------------|
| Orange Mask (battle mode) | Mika puts on her original orange mask during boss battles. Easter egg callback. |
| Drone active | Shoulder drone buzzes during shortcut demonstrations, projects holograms. |

### 7.3 Yuki (יוקי) -- Speed Specialist

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Default on speed test page | P0 |
| racing | מתחרה | During speed test, running alongside player text | P0 |
| impressed | מרשימה | Player beats a speed record | P0 |
| taunting | מתגרה | Pre-race challenge, playful provocation | P1 |
| defeated | מפסידה | Player beats her record (positive defeat, she smiles) | P1 |
| celebrating | חוגגת | Speed milestone, burst mode | P1 |
| stretching | מתמתחת | Pre-race warmup animation | P2 |
| windswept | ברוח | Ultra-high speed reached (>50 WPM) | P2 |

### 7.4 Luna (לונה) -- Moon Ninja / Calm Guide

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Serene default, eyes half-closed, gentle smile | P0 |
| peaceful | שלווה | Calm practice mode, meditation | P0 |
| encouraging | מעודדת | Player improving accuracy | P0 |
| meditating | מתרגלת | Zen mode active, deep focus | P1 |
| concerned | מודאגת | Player frustrated (high error + slow speed) | P1 |
| happy | שמחה | Accuracy goal reached | P1 |
| moonlit | אור ירח | Special state when accuracy >95%, glowing aura | P2 |
| whispering | לוחשת | Giving quiet tips during boss battles | P2 |

### 7.5 Kai (קאי) -- Fire Warrior

**Total expressions needed: 10**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Ready stance, fists at sides, flame on chest emblem | P0 |
| battle-ready | מוכן לקרב | Battle arena default, intense focus | P0 |
| attacking | תוקף | Player lands a combo in boss battle | P0 |
| defending | מגן | Player under pressure, Bug attacking fast | P1 |
| victory | ניצחון | Battle won, rival defeated | P1 |
| defeat | הפסד | Battle lost (encouraging defeat, "next time!") | P1 |
| fired-up | בוער | Streak >10, combo achieved | P1 |
| coaching | מאמן | Between rounds, giving tips | P2 |
| exhausted | מותש | After long boss fight, leaning on knees | P2 |
| saluting | מצדיע | Respecting the opponent after fair battle | P2 |

### 7.6 Noa (נועה) -- Medic Ninja / Error Healer

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Gentle smile, healing pouch ready | P0 |
| healing | מרפאה | Correcting an error, green sparkle effect | P0 |
| encouraging | מעודדת | Player retrying after mistakes | P0 |
| happy | שמחה | Error rate decreasing, player improving | P1 |
| concerned | מודאגת | High error rate (>50%), appears with extra support | P1 |
| celebrating | חוגגת | Error-free lesson completed | P1 |
| working | עובדת | Actively healing scrambled text (boss battles) | P2 |
| proud | גאה | Player masters a previously difficult key | P2 |

**Special Behavior:** Noa is the ONLY character who appears contextually across ALL pages when the player struggles. She is not bound to one page.

### 7.7 Sensei Zen (סנסאי זן) -- Wise Turtle

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Sitting in meditation pose, eyes slightly open | P0 |
| teaching | מלמד | Lesson intro, presenting new concept | P0 |
| wise | חכם | Giving wisdom tip, riddle, proverb | P0 |
| proud | גאה | Student completes lesson, reaches milestone | P1 |
| thoughtful | מהרהר | Loading screen, transition moment | P1 |
| laughing | צוחק | Light humor moment, student makes funny mistake | P1 |
| mysterious | מסתורי | Hinting at Bug's weakness, foreshadowing | P2 |
| emotional | נרגש | Final boss victory, removes glasses, wipes tear | P2 |

**Special Visual State:**
| State | Description |
|-------|-------------|
| Black mask visible | Sensei Code's old mask hangs on Sensei Zen's shell -- lore item |
| Ancient keyboard glow | The pedestal keyboard in his dojo glows during key story moments |

### 7.8 Pixel (פיקסל) -- Robot Data Assistant

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Floating, gentle hover animation, screen face = :) | P0 |
| analyzing | מנתח | Processing data, showing stats | P0 |
| happy | שמח | Good data: WPM up, accuracy up | P0 |
| alert | התראה | Important stat change, record broken | P1 |
| scanning | סורק | Looking at student data, searching | P1 |
| celebrating | חוגג | Personal best achieved | P1 |
| sad-face | עצוב | Negative trend in data (decrease) | P2 |
| glitching | מתגלטש | Near Glitch events, minor static (Easter egg) | P2 |

**Screen Face Expressions:** Pixel's "face" is a screen. Emotions show as pixel art on the screen: :) for happy, :/ for concerned, ! for alert, <3 for celebrating, etc.

### 7.9 Rex (רקס) -- Dino Ninja

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Standing, tiny arms at sides, big goofy grin | P0 |
| excited | נרגש | Game started, player doing well | P0 |
| cheering | מעודד | Player scores in a game, catches words | P0 |
| trying | מנסה | Tiny arms reaching for something, relatable humor | P1 |
| laughing | צוחק | Funny game moment, self-deprecating humor | P1 |
| celebrating | חוגג | Game completed, high score | P1 |
| sleeping | ישן | Idle in games hub, waiting | P2 |
| stomping | דורך | Entrance animation, game start | P2 |

### 7.10 Bug (באג) -- Cute Villain

**Total expressions needed: 10**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| idle | מצב רגיל | Hovering, antenna wiggling, mischievous grin | P0 |
| mischievous | שובב | Scrambling letters, causing trouble | P0 |
| giggling | צוחק | After creating an error, self-amused | P0 |
| hit | נפגע | Player types correctly (hugs self, dizzy NOT in pain) | P0 |
| fleeing | בורח | Defeated, flying away with silly expression | P0 |
| confident | בטוח | Pre-boss, puffing up chest | P1 |
| surprised | מופתע | Player gets a big combo | P1 |
| healing | מתרפא | Player makes an error, Bug regains HP | P1 |
| king-form | מלך | Bug King: wearing crown, cape, 1.5x size | P1 |
| dancing | רוקד | Bug won (player lost), celebratory dance | P2 |

**CRITICAL Animation Rule:**
- "Hit" = Bug hugs himself + spiral eyes (dizzy), NEVER shows pain
- "Fleeing" = Poof cloud + "!אחזוווור" speech bubble + whoosh away
- "King-form" = Same cute beetle + tiny crown + code cape. Still adorable.

### 7.11 Glitch (גליץ') -- Shape-Shifting Chaos

**Total expressions needed: 8**

| Expression | Hebrew Name | Usage Context | Priority |
|------------|-------------|--------------|----------|
| default | ברירת מחדל | Vaguely humanoid pixel cluster, confused eyes (??) | P0 |
| attacking | תוקף | Body stretches, pixels flying outward, distortion | P0 |
| glitching | מתגלטש | Half one form / half another, heavy static | P0 |
| calm | רגוע | Pixels settle, eyes become gentle crescents, peaceful | P1 |
| confused | מבולבל | Stuttering animation, flickering between shapes | P1 |
| dissolving | מתפורר | Losing form, pixels scattering outward | P1 |
| helping | עוזר | Brief moment of clarity, opens path (Lesson 18) | P2 |
| reforming | מתאחד | Coming back together after dissolving | P2 |

**Special Visual Rule:** Glitch has NO fixed form. Every frame should show subtle pixel movement. The only constants are the two white circular "eyes" and the general size/silhouette.

### 7.12 Battle Rivals

#### Shadow (צל) -- Easy Rival

| Expression | Hebrew Name | Priority |
|------------|-------------|----------|
| idle | מצב רגיל | P0 -- crouching, mysterious, purple eyes glow |
| stalking | אורב | P0 -- pre-battle, circling player |
| attacking | תוקף | P0 -- pounce forward |
| defeated | מובס | P1 -- sits down, licks paw, dignified |
| victory | ניצחון | P1 -- stands tall, tail swish |
| respect | כבוד | P2 -- bows head after fair fight |

#### Storm (סערה) -- Medium Rival

| Expression | Hebrew Name | Priority |
|------------|-------------|----------|
| idle | מצב רגיל | P0 -- lightning crackling around, cocky grin |
| charging | נטען | P0 -- pre-attack, electricity building |
| attacking | תוקף | P0 -- lightning strike forward |
| defeated | מובס | P1 -- static discharge, surprised |
| victory | ניצחון | P1 -- howls, lightning backdrop |
| respect | כבוד | P2 -- nods, lightning calms |

#### Blaze (להבה) -- Hard Rival

| Expression | Hebrew Name | Priority |
|------------|-------------|----------|
| idle | מצב רגיל | P0 -- standing regal, fire aura, gold armor |
| powering-up | מתגבר | P0 -- flames intensify, wings spread |
| attacking | תוקף | P0 -- fire breath (stylized, not violent) |
| defeated | מובס | P1 -- flame dims, bows with honor |
| victory | ניצחון | P1 -- flies up, roars (cartoonish) |
| respect | כבוד | P2 -- presents flame as gift (friendly post-battle) |

---

## 8. Implementation Checklist

### 8.1 Art Assets Needed

| Character | Model Sheet | Exists? | Expressions Sheet | Exists? | Poses Sheet | Exists? |
|-----------|-------------|---------|-------------------|---------|-------------|---------|
| Ki | `ki-boy-v2.jpg` | YES | Needs generation | NO | Needs generation | NO |
| Mika | `mika-girl.jpg` | YES | Needs generation | NO | Needs generation | NO |
| Yuki | `yuki-girl.jpg` | YES | Needs generation | NO | -- | -- |
| Luna | `luna-girl.jpg` | YES | Needs generation | NO | -- | -- |
| Kai | `kai-boy.jpg` | YES | Needs generation | NO | Needs generation | NO |
| Noa | `noa-girl.jpg` | YES | Needs generation | NO | -- | -- |
| Sensei Zen | `sensei-zen.jpg` | YES | Needs generation | NO | -- | -- |
| Pixel | `pixel-robot.jpg` | YES | Screen faces sheet | NO | -- | -- |
| Rex | `rex-dino.jpg` | YES | Needs generation | NO | -- | -- |
| Bug | `bug-villain.jpg` | YES | Needs generation | NO | Boss forms sheet | NO |
| Glitch | `glitch-entity.jpg` | YES | Needs generation | NO | -- | -- |
| Shadow | `shadow-cat.jpg` | YES | Battle expressions | NO | -- | -- |
| Storm | `storm-fox.jpg` | YES | Battle expressions | NO | -- | -- |
| Blaze | `blaze-dragon.jpg` | YES | Battle expressions | NO | -- | -- |
| Bug King | `bug-king.jpg` | YES | -- | -- | -- | -- |

**Summary:** 14/14 model sheets exist. 0/14 expression sheets exist. 0/4 pose sheets exist. 0/3 battle expression sheets exist.

### 8.2 Code Components Needed

| Component | Purpose | Status |
|-----------|---------|--------|
| `CharacterRenderer` | Renders any character at any size/expression by theme | Needs creation |
| `CharacterVisibility` | HOC/hook that hides characters based on age theme | Needs creation |
| `StoryBeatPlayer` | Displays pre/post lesson dialogue bubbles | Partial (Act 1 only) |
| `BossEncounter` | Full boss battle UI with HP, timer, combo | Needs creation |
| `UnlockAnimation` | Plays character unlock celebration | Needs creation |
| `CharacterCarousel` | Cycles unlocked characters on home page | Needs creation |
| `NpcOverlay` | Noa's contextual error help overlay | Needs creation |
| `CompanionSelector` | Profile page companion selection | Needs creation |

### 8.3 Story Script Expansion

| Script | Current State | Needed |
|--------|--------------|--------|
| Act 1 (Lessons 1-7) | Implemented in `story-script.ts` | Complete but needs Sensei Zen voice-only beat for L1 |
| Act 2 (Lessons 8-15) | NOT implemented | Full script with all character intros |
| Act 3 (Lessons 16-20) | NOT implemented | Full script with Glitch redemption + Bug King |
| Boss configs | Only Lesson 7 configured | Need L15 (Bug+Glitch) and L20 (Bug King) |
| Story flags | Defined in types | Need `kaiJoined`, `rexUnlocked` additions |

### 8.4 Type System Expansion

The `CharacterMood` type in `src/types/story.ts` currently supports:
```
idle | happy | excited | thinking | sad | cheering | concerned | mischievous | sleeping | surprised
```

**Additional moods needed:**
```
determined | celebrating | confused | winking | competitive | impressed | hacking |
sarcastic | racing | taunting | defeated | windswept | peaceful | meditating |
moonlit | whispering | battle-ready | attacking | defending | victory | defeat |
fired-up | coaching | exhausted | saluting | healing | working | proud |
teaching | wise | laughing | mysterious | emotional | analyzing | alert |
scanning | glitching | trying | stomping | giggling | hit | fleeing |
confident | king-form | dancing | calm | dissolving | helping | reforming |
stalking | charging | powering-up | respect
```

**Recommendation:** Group moods into categories and use a union type per character tier rather than one massive shared type:

```typescript
type CoreMood = 'idle' | 'happy' | 'excited' | 'thinking' | 'sad' | 'cheering' | 'surprised'
type HeroMood = CoreMood | 'determined' | 'celebrating' | 'confused'
type CombatMood = 'battle-ready' | 'attacking' | 'defending' | 'victory' | 'defeat'
type VillainMood = 'idle' | 'mischievous' | 'giggling' | 'hit' | 'fleeing' | 'confident' | 'surprised'
type GlitchMood = 'default' | 'attacking' | 'glitching' | 'calm' | 'confused' | 'dissolving' | 'helping' | 'reforming'
```

---

## 9. Quick Reference Cards

### 9.1 "Which Characters Appear in Lesson X?"

| Lesson | Characters | Boss? |
|--------|-----------|-------|
| 1 | Ki, Sensei Zen (voice) | |
| 2 | Ki, **Mika (NEW)** | |
| 3 | Ki, Mika | |
| 4 | Ki, Mika | |
| 5 | Ki, Mika, **Bug (NEW)** | |
| 6 | Ki, Mika, Bug | |
| 7 | Ki, Mika vs Bug | MINI-BOSS |
| 8 | Ki, Mika, **Sensei Zen (NEW physical)** | |
| 9 | Ki, Mika, Sensei Zen | |
| 10 | Ki, Mika, **Yuki (NEW)** | |
| 11 | Ki, **Luna (NEW)** | |
| 12 | Ki, Mika, **Glitch (NEW)** | |
| 13 | Ki, Mika, **Kai (NEW)**, **Noa (NEW)** | |
| 14 | ALL heroes, Bug | |
| 15 | ALL heroes vs Bug + Glitch | MID-BOSS |
| 16 | Ki, Mika, Bug | |
| 17 | Mika, Luna, Pixel | |
| 18 | Ki, Glitch (redemption) | |
| 19 | Kai, Noa, Yuki | |
| 20 | ALL characters vs Bug King | FINAL BOSS |

### 9.2 "Which Character Owns Which Page?"

| Page | Owner | Hebrew |
|------|-------|--------|
| Home | Ki | קי |
| Lessons | Sensei Zen | סנסאי זן |
| Practice | Luna | לונה |
| Speed Test | Yuki | יוקי |
| Battle | Kai | קאי |
| Shortcuts | Mika | מיקה |
| Games | Rex | רקס |
| Statistics | Pixel | פיקסל |
| Profile | Player's choice | -- |
| Boss Battles | Bug / Glitch | באג / גליץ' |
| Error Help | Noa | נועה |

### 9.3 "What Size is Each Character at Each Age?"

| Character | Shatil | Nevet | Geza | Anaf | Tzameret |
|-----------|--------|-------|------|------|----------|
| Ki | 120px | 80px | 48px | 28px | 0 |
| Mika | 120px | 80px | 48px | 0 | 0 |
| Sensei Zen | 120px | 80px | 48px | tip text | 0 |
| Yuki | 120px | 80px | 48px | 0 | 0 |
| Luna | 120px | 80px | 48px | 0 | 0 |
| Kai | 120px | 80px | 48px | 0 | 0 |
| Noa | 120px | 80px | 48px | 0 | 0 |
| Pixel | 100px | 64px | 48px | 36px | 0 |
| Rex | 120px | 80px | 48px | 0 | 0 |

---

*Document version: 1.0*
*Last updated: March 2026*
*Status: Blueprint ready for art generation and code implementation.*
*Next steps: Generate expression sheets for all 14 characters, then implement CharacterRenderer and CharacterVisibility components.*
