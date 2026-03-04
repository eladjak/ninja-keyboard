# Character Progression System -- Ninja Keyboard

**Version:** 1.0
**Last Updated:** March 2026
**Status:** Design spec -- ready for implementation
**Depends on:** character-bible-merged.md, story-store.ts, xp-store.ts, badge-store.ts, character-config.ts

---

## 1. Character Unlock Tree

### 1.1 Visual Unlock Map

```
START: Ki (קי) + Pixel (פיקסל)
│      Ki = always present, main mascot
│      Pixel = UI helper from lesson 1, not a story unlock
│
├─── Lesson 2 completed ──────────────── Mika (מיקה) joins as equal partner
│    storyFlag: mikaJoined
│    Narrative: "You're too slow." She challenges Ki.
│
├─── Lesson 3 completed ──────────────── Sensei Zen (סנסיי זן) appears as mentor
│    storyFlag: senseiIntroduced
│    Narrative: Ancient turtle master greets the student.
│
├─── Lesson 4 + Speed Test attempted ── Yuki (יוקי) speed specialist
│    storyFlag: yukiJoined (NEW)
│    Condition: completedLessons >= 4 AND speedTestAttempts >= 1
│    Narrative: "I'm the fastest! Let's race."
│
├─── Lesson 5 + 10 practice sessions ── Luna (לונה) practice companion
│    storyFlag: lunaJoined
│    Condition: completedLessons >= 5 AND practiceSessionCount >= 10
│    Narrative: "Slow down. Breathe. Then type."
│
├─── Beat Bug Boss (Lesson 7) ───────── Noa (נועה) medic unlocked
│    storyFlag: noaJoined
│    Condition: bossResults[7].defeated === true
│    Narrative: Noa appears to heal the scrambled text Bug left behind.
│
├─── 50 WPM achieved (any session) ──── Kai (קאי) fire warrior
│    storyFlag: kaiJoined (NEW)
│    Condition: bestWpm >= 50 (from practice-history or xp-store)
│    Narrative: "You type with fire! Join me in the arena."
│
└─── 5 games played ─────────────────── Rex (רקס) gamer buddy
     storyFlag: rexJoined (NEW)
     Condition: gamesPlayed >= 5
     Narrative: "Even with tiny arms, I keep playing! You too!"
```

### 1.2 Unlock Conditions -- Formal Definitions

| Character | ID | Unlock Condition | Store Source |
|-----------|------------|---------------------------------------------|------------------------------|
| Ki | `ki` | Always unlocked (default) | -- |
| Pixel | `pixel` | Always available (UI helper) | -- |
| Mika | `mika` | `completedLessons` includes lesson 2+ | xp-store |
| Sensei Zen | `senseiZen` | `completedLessons` includes lesson 3+ | xp-store |
| Yuki | `yuki` | Lesson 4+ AND `speedTestAttempts >= 1` | xp-store + NEW tracking |
| Luna | `luna` | Lesson 5+ AND `practiceSessionCount >= 10` | xp-store + practice-history |
| Noa | `noa` | `bossResults[7].defeated === true` | story-store |
| Kai | `kai` | Best WPM >= 50 (any mode) | practice-history-store |
| Rex | `rex` | `gamesPlayed >= 5` | NEW tracking needed |

### 1.3 TypeScript Types for Unlock System

```typescript
// src/lib/progression/unlock-conditions.ts

import type { CharacterName } from '@/types/story'

export type UnlockConditionType =
  | 'always'
  | 'lesson_completed'
  | 'lesson_and_speed_test'
  | 'lesson_and_practice_count'
  | 'boss_defeated'
  | 'wpm_milestone'
  | 'games_played'

export interface UnlockCondition {
  type: UnlockConditionType
  /** Minimum lesson number required (if applicable) */
  minLesson?: number
  /** Minimum practice sessions required */
  minPracticeSessions?: number
  /** Minimum speed test attempts required */
  minSpeedTests?: number
  /** Boss lesson number that must be defeated */
  bossLesson?: number
  /** WPM threshold to reach */
  wpmThreshold?: number
  /** Minimum games played */
  minGames?: number
}

export interface CharacterUnlockDef {
  character: CharacterName
  condition: UnlockCondition
  /** Story flag to set on unlock */
  storyFlag?: string
  /** Hebrew announcement text shown on unlock */
  unlockTextHe: string
  /** Sound cue ID to play */
  unlockSound: string
}

export const CHARACTER_UNLOCK_DEFS: CharacterUnlockDef[] = [
  {
    character: 'ki',
    condition: { type: 'always' },
    unlockTextHe: '',
    unlockSound: '',
  },
  {
    character: 'pixel',
    condition: { type: 'always' },
    unlockTextHe: '',
    unlockSound: '',
  },
  {
    character: 'mika',
    condition: { type: 'lesson_completed', minLesson: 2 },
    storyFlag: 'mikaJoined',
    unlockTextHe: '!מיקה הצטרפה לקבוצה',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'senseiZen',
    condition: { type: 'lesson_completed', minLesson: 3 },
    storyFlag: 'senseiIntroduced',
    unlockTextHe: '!סנסיי זן מופיע',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'yuki',
    condition: { type: 'lesson_and_speed_test', minLesson: 4, minSpeedTests: 1 },
    storyFlag: 'yukiJoined',
    unlockTextHe: '!יוקי אתגרה אותך למירוץ',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'luna',
    condition: { type: 'lesson_and_practice_count', minLesson: 5, minPracticeSessions: 10 },
    storyFlag: 'lunaJoined',
    unlockTextHe: '!לונה מלמדת אותך ריכוז',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'noa',
    condition: { type: 'boss_defeated', bossLesson: 7 },
    storyFlag: 'noaJoined',
    unlockTextHe: '!נועה המרפאה הצטרפה',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'kai',
    condition: { type: 'wpm_milestone', wpmThreshold: 50 },
    storyFlag: 'kaiJoined',
    unlockTextHe: '!קאי לוחם האש מכיר בכוחך',
    unlockSound: 'characterUnlock',
  },
  {
    character: 'rex',
    condition: { type: 'games_played', minGames: 5 },
    storyFlag: 'rexJoined',
    unlockTextHe: '!רקס רוצה לשחק איתך',
    unlockSound: 'characterUnlock',
  },
]
```

### 1.4 Unlock Checker Function

```typescript
// src/lib/progression/unlock-checker.ts

import type { CharacterName } from '@/types/story'
import { CHARACTER_UNLOCK_DEFS, type CharacterUnlockDef } from './unlock-conditions'

export interface UnlockContext {
  /** Highest completed lesson number */
  highestCompletedLesson: number
  /** Number of speed test attempts */
  speedTestAttempts: number
  /** Total practice sessions completed */
  practiceSessionCount: number
  /** Best WPM ever achieved */
  bestWpm: number
  /** Total games played */
  gamesPlayed: number
  /** Boss results: lessonNumber -> { defeated } */
  bossResults: Record<number, { defeated: boolean }>
  /** Already unlocked characters */
  alreadyUnlocked: CharacterName[]
}

export function checkUnlockCondition(
  def: CharacterUnlockDef,
  ctx: UnlockContext,
): boolean {
  const c = def.condition

  switch (c.type) {
    case 'always':
      return true

    case 'lesson_completed':
      return ctx.highestCompletedLesson >= (c.minLesson ?? 1)

    case 'lesson_and_speed_test':
      return (
        ctx.highestCompletedLesson >= (c.minLesson ?? 1) &&
        ctx.speedTestAttempts >= (c.minSpeedTests ?? 1)
      )

    case 'lesson_and_practice_count':
      return (
        ctx.highestCompletedLesson >= (c.minLesson ?? 1) &&
        ctx.practiceSessionCount >= (c.minPracticeSessions ?? 1)
      )

    case 'boss_defeated':
      return ctx.bossResults[c.bossLesson ?? 0]?.defeated === true

    case 'wpm_milestone':
      return ctx.bestWpm >= (c.wpmThreshold ?? 0)

    case 'games_played':
      return ctx.gamesPlayed >= (c.minGames ?? 1)

    default:
      return false
  }
}

/** Returns character IDs that are newly unlockable but not yet unlocked. */
export function getNewlyUnlockable(ctx: UnlockContext): CharacterUnlockDef[] {
  const alreadySet = new Set(ctx.alreadyUnlocked)
  return CHARACTER_UNLOCK_DEFS.filter(
    (def) => !alreadySet.has(def.character) && checkUnlockCondition(def, ctx),
  )
}
```

---

## 2. Companion System

### 2.1 Overview

The player selects one **active companion** from their pool of unlocked hero characters. The companion appears in the typing area alongside the player, displays contextual reactions, and provides a small passive bonus.

**Key design rules:**
- Only **hero characters** can be companions (not villains, not rivals).
- Ki is the default companion and cannot be deselected entirely -- if the player "unequips" their companion, Ki returns.
- Companions are purely motivational + small mechanical bonuses. They must NOT gate content.
- Companion bonuses stack with age-theme scaling (younger themes get bigger bonuses to keep things fun; older themes can disable companion visuals but keep the bonus).

### 2.2 Companion Bonuses

| Companion | ID | Passive Bonus | Bonus Value | How It Works |
|-----------|------------|------------------------------|-------------|----------------------------------------------|
| Ki | `ki` | XP Boost | +5% XP per session | All XP earned is multiplied by 1.05 |
| Mika | `mika` | Shortcut Tips | Shows tip popup | Random keyboard shortcut tip every 2 minutes |
| Yuki | `yuki` | Speed Timer Bonus | +3 seconds | Speed tests & timed challenges get +3s |
| Luna | `luna` | Practice Hints | Highlight weak keys | At practice start, highlights 3 weakest keys |
| Noa | `noa` | Extra Life | +1 heart in boss | Boss battles start with 1 extra heart |
| Kai | `kai` | Combo Multiplier | +10% combo bonus | Combo XP multiplier increased by 0.1x |
| Sensei Zen | `senseiZen` | Wisdom XP | +3% XP + daily tip | +3% XP plus a daily wisdom quote tooltip |
| Pixel | `pixel` | Stats Overlay | Mini stats HUD | Shows live WPM/accuracy in corner during typing |
| Rex | `rex` | Game Score Bonus | +10% game score | All mini-game scores multiplied by 1.1 |

### 2.3 Companion Reactions

Each companion has 5 reaction triggers tied to typing performance. These fire as small animated overlays (speech bubble + mood change on the companion avatar).

| Trigger | When | Companion Reaction (Hebrew) |
|---------|------|----------------------------|
| `streak_5` | 5 correct characters in a row | Random encouragement from active companion |
| `streak_20` | 20 correct in a row (flow state) | Excited reaction, specific to companion personality |
| `error_burst` | 3+ errors in 5 seconds | Gentle encouragement, companion-specific |
| `milestone_wpm` | New personal best WPM | Celebration, companion cheers |
| `session_complete` | Lesson/practice finishes | Summary line from companion |

**Example reactions by companion:**

| Companion | streak_20 | error_burst |
|-----------|-----------|-------------|
| Ki | "!וואו, אתה על אש" | "!גם אני טועה לפעמים, קדימה" |
| Mika | "!מהר ומדויק, ככה אני אוהבת" | "!Ctrl+Z ונמשיך" |
| Yuki | "!כמעט עקפת אותי" | "!לאט יותר, מדויק יותר" |
| Luna | "...נשימה עמוקה... מושלם" | "!נשימה. שקט. ומתחילים מחדש" |
| Noa | "!את מתקדמת מדהים" | "!לא נורא, ננסה שוב ביחד" |
| Kai | "!אש באצבעות" | "!לוחם אמיתי לא מוותר" |
| Sensei Zen | "!סבלנות מובילה למהירות" | "!כל טעות היא שיעור" |
| Pixel | "!שיפור של 12% מאתמול" | "!סורק... מומלץ להאט קצת" |
| Rex | "!ררררמ! מהיר כמו דינוזאור" | "!גם עם ידיים קטנות, ממשיכים" |

### 2.4 TypeScript Types -- Companion System

```typescript
// src/types/companion.ts

import type { CharacterName, CharacterMood } from '@/types/story'

export type CompanionBonusType =
  | 'xp_boost'
  | 'shortcut_tips'
  | 'speed_timer_bonus'
  | 'practice_hints'
  | 'extra_life'
  | 'combo_multiplier'
  | 'wisdom_xp'
  | 'stats_overlay'
  | 'game_score_bonus'

export interface CompanionBonus {
  type: CompanionBonusType
  /** Numeric value of the bonus (percent as decimal, seconds, or count) */
  value: number
  /** Hebrew description for tooltip */
  descriptionHe: string
}

export type CompanionReactionTrigger =
  | 'streak_5'
  | 'streak_20'
  | 'error_burst'
  | 'milestone_wpm'
  | 'session_complete'

export interface CompanionReaction {
  trigger: CompanionReactionTrigger
  /** Hebrew text bubble content */
  textHe: string
  /** Mood the companion switches to during reaction */
  mood: CharacterMood
  /** Duration to show the reaction in ms */
  durationMs: number
}

export interface CompanionDef {
  character: CharacterName
  bonus: CompanionBonus
  reactions: Record<CompanionReactionTrigger, CompanionReaction>
}
```

---

## 3. Rival Progression

### 3.1 Rival Unlock Chain

Rivals are independent from the hero unlock tree. They live in the Battle Arena and unlock sequentially based on battle victories.

```
Battle Arena Entry (available from Lesson 4)
│
├─── Shadow (שאדו) -- Always available once Battle unlocks
│    Difficulty: Easy
│    WPM range: 15-25
│    Personality: Mysterious, quiet
│
│    [Beat Shadow 3 times]
│         │
│         v
├─── Storm (סטורם) -- Unlocked
│    Difficulty: Medium
│    WPM range: 25-40
│    Personality: Fast, cocky
│
│    [Beat Storm 3 times]
│         │
│         v
├─── Blaze (בלייז) -- Unlocked
│    Difficulty: Hard
│    WPM range: 40-60
│    Personality: Fierce, honorable
│
│    [Beat Blaze 3 times]
│         │
│         v
└─── ??? Secret Rival: Phantom (פנטום) -- Unlocked
     Difficulty: Nightmare
     WPM range: 60-80
     Species: Ghost ninja (translucent, faded colors)
     Personality: Silent. Types one word at the battle end: "...worthy."
     Defeat Quote: "...ראוי"
     NEEDS ART: Gemini generation required
```

### 3.2 Rival Record Tracking

```typescript
// Addition to story-store or new battle-store

export interface RivalRecord {
  /** Total battles fought against this rival */
  totalBattles: number
  /** Wins against this rival */
  wins: number
  /** Best WPM achieved against this rival */
  bestWpm: number
  /** Best accuracy achieved against this rival */
  bestAccuracy: number
  /** Timestamp of first victory */
  firstVictoryAt: number | null
}

export type RivalId = 'shadow' | 'storm' | 'blaze' | 'phantom'

// State shape:
// rivalRecords: Record<RivalId, RivalRecord>
```

### 3.3 Rival Unlock Conditions

| Rival | Unlock Condition | Badge Awarded on First Defeat |
|-------|------------------------------------------|-------------------------------|
| Shadow | Battle Arena unlocked (Lesson 4+) | "shadow-slayer" -- "נוצח צל" |
| Storm | `rivalRecords.shadow.wins >= 3` | "storm-breaker" -- "שובר סערות" |
| Blaze | `rivalRecords.storm.wins >= 3` | "blaze-tamer" -- "מאלף להבות" |
| Phantom | `rivalRecords.blaze.wins >= 3` | "phantom-hunter" -- "צייד רוחות" |

### 3.4 Progressive Difficulty Scaling

Each rival's WPM scales slightly based on the player's performance to keep battles engaging:

```typescript
function getRivalEffectiveWpm(
  baseRange: [number, number],
  playerBestWpm: number,
): number {
  const [min, max] = baseRange
  // Rival types at 70-90% of player's best, clamped to their range
  const adapted = playerBestWpm * (0.7 + Math.random() * 0.2)
  return Math.max(min, Math.min(max, adapted))
}
```

---

## 4. Villain Encounter Schedule

### 4.1 Bug Tease Moments (Visual Glitches)

Before Bug appears as a boss, small tease moments build tension. These are cosmetic-only and do NOT affect gameplay.

| Lesson | Tease Type | Visual Effect | Duration |
|--------|-----------|---------------|----------|
| 3 | Flicker | A single character on screen briefly flickers green (#00FF41) | 0.5s |
| 4 | Shadow | A tiny beetle silhouette crosses the bottom of the typing area | 1s |
| 5 | Scramble | One word briefly shows scrambled letters before correcting itself | 1.5s |
| 6 | Giggle | Bug's giggle sound plays ("הי הי הי") + small green sparkle in corner | 2s |

**Implementation:** These are driven by the `storyEnabled` flag in story-store. Each tease is a one-time event tracked via `seenStoryBeats[lesson][phase: 'during']`.

### 4.2 Bug Direct Encounters

| Lesson | Encounter | Mechanic | Bug Form |
|--------|-----------|----------|----------|
| **6** | Bug Introduction | Bug appears and scrambles 3 words. Player fixes them. No timer. Tutorial-style. | Base Bug (cute beetle) |
| **7** | **Mini-Boss: "Bug the Small"** | 10 scrambled words in 60 seconds. Each correct word = Bug flinches. After 10 = Bug escapes with poof cloud. | Base Bug |
| **14** | Bug Returns | Bug scrambles entire sentences (not just words). 15 words. No strict timer but Bug "escapes" if player takes >90s. | Base Bug (slightly larger) |
| **15** | **Mid-Boss: "Bug + Glitch"** | 20 words + Glitch flips some key positions. Player must type accurately despite visual disruptions. 120s timer. | Bug + Glitch together |
| **16** | Error Maze Entry | Bug taunts: "Welcome to MY world!" -- continuous typing through scrambled text with Bug causing periodic 3-second disruptions. | Bug |
| **20** | **Final Boss: "Bug King"** | 50 words in 120s, 90%+ accuracy required. Bug wears crown. All heroes present. Combo system active. | Bug King (crown + cape) |

### 4.3 Glitch Encounters

| Lesson | Encounter | Mechanic |
|--------|-----------|----------|
| **12** | Glitch Introduction | Glitch appears and flips keyboard layout for 10 seconds. Player must adapt. Tutorial-style with Mika explaining. |
| **15** | Mid-Boss Partner | Glitch assists Bug. Every 15 seconds, Glitch inverts 3 random key positions for 5 seconds. |
| **18** | Glitch Redemption | Player types 20 words with high accuracy (95%+) to "calm" Glitch. If successful, Glitch briefly becomes an ally and neutralizes Bug's next attack. |

### 4.4 Boss Battle Mechanics -- Detailed

#### Lesson 7: Bug the Small

```typescript
interface BugSmallConfig {
  lessonNumber: 7
  bossName: 'bug'
  nameHe: 'באג הקטן'
  health: 10  // 10 words = 10 HP
  timeLimit: 60  // seconds
  wordsToType: 10
  minAccuracy: 0  // no accuracy requirement for first boss
  bugBehavior: {
    scrambleType: 'word'  // scrambles individual words
    scrambleRate: 1  // one word at a time
    escapeAnimation: 'poof_cloud'  // Bug disappears with a poof
  }
  rewards: {
    xp: 100
    badge: 'bug-buster'  // "מגרש באגים"
    characterUnlock: 'noa'
  }
}
```

#### Lesson 15: Bug + Glitch

```typescript
interface BugGlitchConfig {
  lessonNumber: 15
  bossName: 'bug'
  partnerName: 'glitch'
  nameHe: 'באג וגליץ\''
  health: 20
  timeLimit: 120
  wordsToType: 20
  minAccuracy: 80
  bugBehavior: {
    scrambleType: 'sentence'
    scrambleRate: 2  // scrambles 2 words at once
  }
  glitchBehavior: {
    keyFlipInterval: 15_000  // every 15 seconds
    flipDuration: 5_000     // lasts 5 seconds
    keysFlipped: 3           // flips 3 keys
  }
  rewards: {
    xp: 250
    badge: 'glitch-survivor'  // "שורד גליץ'"
  }
}
```

#### Lesson 20: Bug King

```typescript
interface BugKingConfig {
  lessonNumber: 20
  bossName: 'bug'
  nameHe: 'מלך הבאגים'
  health: 50
  timeLimit: 120
  wordsToType: 50
  minAccuracy: 90
  bugBehavior: {
    scrambleType: 'paragraph'
    scrambleRate: 3
    phases: [
      { healthRange: [50, 35], scrambleRate: 2, speed: 'normal' },
      { healthRange: [34, 15], scrambleRate: 3, speed: 'fast' },
      { healthRange: [14, 0], scrambleRate: 4, speed: 'frantic' },
    ]
  }
  heroComboSystem: {
    ki: { effect: 'speed_boost', bonus: '+5% WPM counts' },
    mika: { effect: 'accuracy_shield', bonus: 'Ignores 1 scramble per 30s' },
    yuki: { effect: 'burst_mode', bonus: '5s of 2x score' },
    luna: { effect: 'focus_aura', bonus: 'Slows Bug scramble rate for 10s' },
    kai: { effect: 'power_strike', bonus: 'Next word counts as 3 HP damage' },
    noa: { effect: 'heal', bonus: 'Removes 1 scramble from screen' },
  }
  rewards: {
    xp: 500
    badge: 'bug-king-slayer'  // "מפיל מלכים"
    storyFlag: 'finalBossDefeated'
    certificate: true  // triggers "True Keyboard Ninja" certificate
  }
}
```

### 4.5 Boss Encounter Adaptation by Age Theme

| Age Theme | Lesson 7 Boss | Lesson 15 Boss | Lesson 20 Boss |
|-----------|---------------|----------------|----------------|
| Shatil (6-8) | 5 words, no timer, massive celebration | 10 words, relaxed timer (180s), no Glitch effects | 20 words, 180s, 80% accuracy, no phases |
| Nevet (8-10) | 10 words, relaxed timer (90s) | 15 words, 150s, mild Glitch effects | 35 words, 150s, 85% accuracy |
| Geza (10-12) | 10 words, 60s (standard) | 20 words, 120s (standard) | 50 words, 120s, 90% (standard) |
| Anaf (12-14) | 12 words, 50s | 25 words, 100s, aggressive Glitch | 60 words, 120s, 92% accuracy |
| Tzameret (14-16) | 15 words, 45s | 30 words, 90s, full Glitch effects | 70 words, 120s, 95% accuracy |

### 4.6 Post-Game & Monthly Boss Events

After completing lesson 20, Bug and Glitch return in monthly rotating boss events:

| Month | Boss Event | Special Mechanic |
|-------|-----------|-----------------|
| Odd months | Bug Rematch | Bug's speed scales to player's current WPM + 10% |
| Even months | Glitch Challenge | Full keyboard flip -- player types on inverted layout |
| Every 3 months | Bug + Glitch Co-op | Class-wide boss: all students contribute damage |
| Purim (Adar) | Glitch Purim Special | Letters are in costume -- must identify the real letter |
| Hanukkah | 8-Night Bug Marathon | 8 progressively harder Bug encounters over 8 days |

---

## 5. Achievement Tie-ins

### 5.1 Badge-to-Character Event Mapping

Certain existing and new badges trigger character events (a brief narrative moment or character reaction). These enhance the feeling that the game world responds to the player's achievements.

| Badge ID | Badge Name | Character Event |
|----------|-----------|-----------------|
| `first-lesson` | "First Step" | Ki cheers: "!יאללה, התחלת את המסע" |
| `persistent` | 5-day streak | Sensei Zen appears: "!סבלנות מובילה לכוח" |
| `accurate` | 95%+ accuracy | Mika nods approvingly: "!מדויק, ככה אני אוהבת" |
| `rocket` | 30 WPM | Yuki challenges: "!לא רע... אבל אני עדיין יותר מהירה" |
| `ninja` | 40 WPM | Kai salutes: "!לוחם אמיתי" |
| `bug-buster` (NEW) | Beat Bug L7 | Noa: "!ביחד ניצחנו את הבאג" |
| `glitch-survivor` (NEW) | Beat Bug+Glitch L15 | Pixel: "!כל המערכות תקינות. ניצחון" |
| `bug-king-slayer` (NEW) | Beat Bug King L20 | ALL characters celebrate together |
| `shadow-slayer` (NEW) | Beat Shadow | Kai: "!הצל נעלם" |
| `storm-breaker` (NEW) | Beat Storm | Kai: "!סערה? לא בשבילך" |
| `blaze-tamer` (NEW) | Beat Blaze | Kai + Yuki: "!אש נגד אש" |
| `phantom-hunter` (NEW) | Beat Phantom | Sensei Zen: "...הגעת למקום שרק מעטים מגיעים" |

### 5.2 New Character-Themed Badges

These badges are specifically tied to the character progression system:

```typescript
// Additions to BADGE_DEFINITIONS in badge-definitions.ts

// New BadgeCondition types needed:
| { type: 'boss_defeated'; lessonNumber: number }
| { type: 'rival_defeated'; rivalId: string }
| { type: 'companion_used'; sessions: number }
| { type: 'all_characters_unlocked' }
| { type: 'games_played'; count: number }
| { type: 'speed_test_attempted' }

const NEW_BADGES: BadgeDefinition[] = [
  // Boss badges
  {
    id: 'bug-buster',
    nameHe: 'מגרש באגים',
    nameEn: 'Bug Buster',
    description: 'ניצחת את באג בקרב הראשון!',
    emoji: '🪲',
    category: 'special',
    condition: { type: 'boss_defeated', lessonNumber: 7 },
  },
  {
    id: 'glitch-survivor',
    nameHe: 'שורד גליץ\'',
    nameEn: 'Glitch Survivor',
    description: 'ניצחת את באג וגליץ\' ביחד!',
    emoji: '⚡',
    category: 'special',
    condition: { type: 'boss_defeated', lessonNumber: 15 },
  },
  {
    id: 'bug-king-slayer',
    nameHe: 'מפיל מלכים',
    nameEn: 'King Slayer',
    description: 'ניצחת את מלך הבאגים! נינג\'ה אמיתי!',
    emoji: '👑',
    category: 'special',
    condition: { type: 'boss_defeated', lessonNumber: 20 },
  },

  // Rival badges
  {
    id: 'shadow-slayer',
    nameHe: 'נוצח צל',
    nameEn: 'Shadow Slayer',
    description: 'ניצחת את שאדו בקרב!',
    emoji: '🐱',
    category: 'special',
    condition: { type: 'rival_defeated', rivalId: 'shadow' },
  },
  {
    id: 'storm-breaker',
    nameHe: 'שובר סערות',
    nameEn: 'Storm Breaker',
    description: 'ניצחת את סטורם בקרב!',
    emoji: '🦊',
    category: 'special',
    condition: { type: 'rival_defeated', rivalId: 'storm' },
  },
  {
    id: 'blaze-tamer',
    nameHe: 'מאלף להבות',
    nameEn: 'Blaze Tamer',
    description: 'ניצחת את בלייז בקרב!',
    emoji: '🐉',
    category: 'special',
    condition: { type: 'rival_defeated', rivalId: 'blaze' },
  },
  {
    id: 'phantom-hunter',
    nameHe: 'צייד רוחות',
    nameEn: 'Phantom Hunter',
    description: 'ניצחת את היריב הסודי!',
    emoji: '👻',
    category: 'special',
    condition: { type: 'rival_defeated', rivalId: 'phantom' },
  },

  // Companion badges
  {
    id: 'best-friends',
    nameHe: 'חברים הכי טובים',
    nameEn: 'Best Friends',
    description: 'תרגלת 20 פעמים עם אותו שותף!',
    emoji: '🤝',
    category: 'persistence',
    condition: { type: 'companion_used', sessions: 20 },
  },

  // Collection badges
  {
    id: 'full-team',
    nameHe: 'הקבוצה המלאה',
    nameEn: 'Full Team',
    description: 'פתחת את כל הדמויות!',
    emoji: '⭐',
    category: 'special',
    condition: { type: 'all_characters_unlocked' },
  },

  // Speed milestone for Kai unlock
  {
    id: 'speed-demon',
    nameHe: 'שד מהירות',
    nameEn: 'Speed Demon',
    description: 'הגעת ל-50 מילים לדקה!',
    emoji: '🔥',
    category: 'speed',
    condition: { type: 'wpm_milestone', wpm: 50 },
  },

  // Games for Rex unlock
  {
    id: 'gamer',
    nameHe: 'גיימר',
    nameEn: 'Gamer',
    description: 'שיחקת 5 משחקים!',
    emoji: '🎮',
    category: 'exploration',
    condition: { type: 'games_played', count: 5 },
  },
]
```

### 5.3 Collection & Completion Rewards

| Collection | Requirement | Reward |
|-----------|-------------|--------|
| All Heroes Unlocked | All 9 hero characters unlocked | "Full Team" badge + 500 XP + special group art wallpaper |
| All Rivals Defeated | Beat Shadow, Storm, Blaze, Phantom at least once | "Arena Champion" badge + 300 XP + golden frame for profile |
| All Bosses Defeated | Beat Bug L7, Bug+Glitch L15, Bug King L20 | "True Ninja" badge + certificate + 1000 XP |
| All Badges Earned | Every badge in the catalog | "Completionist" badge + unique Ki skin (golden ninja) |

---

## 6. Zustand Store Updates Needed

### 6.1 Changes to `story-store.ts`

**New state fields:**

```typescript
// Add to StoryFlags interface
interface StoryFlags {
  // Existing:
  bugFirstAppearance: boolean
  mikaJoined: boolean
  senseiIntroduced: boolean
  noaJoined: boolean
  lunaJoined: boolean
  glitchRevealed: boolean
  finalBossDefeated: boolean

  // NEW:
  yukiJoined: boolean
  kaiJoined: boolean
  rexJoined: boolean
  bugTeaseLesson3: boolean
  bugTeaseLesson4: boolean
  bugTeaseLesson5: boolean
  bugTeaseLesson6: boolean
  glitchCalmed: boolean       // Lesson 18 redemption arc
  phantomRevealed: boolean    // Secret rival discovered
}
```

**New actions:**

```typescript
// Add to StoryState interface:

/** Record a bug tease as seen */
markBugTease: (lessonNumber: number) => void

/** Check and process character unlocks based on current game state */
processUnlocks: (ctx: UnlockContext) => CharacterName[]
```

### 6.2 New `companion-store.ts`

This is a **new store** managing the active companion and companion-specific tracking.

```typescript
// src/stores/companion-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CharacterName } from '@/types/story'
import type { CompanionBonusType } from '@/types/companion'

interface CompanionUsageRecord {
  /** Total sessions with this companion active */
  sessionsCount: number
  /** Total XP earned while this companion was active */
  totalXpEarned: number
  /** Last used timestamp */
  lastUsedAt: number
}

interface CompanionState {
  /** Currently active companion */
  activeCompanion: CharacterName

  /** Per-companion usage tracking */
  companionUsage: Partial<Record<CharacterName, CompanionUsageRecord>>

  /** Set the active companion (must be unlocked -- caller verifies) */
  setActiveCompanion: (character: CharacterName) => void

  /** Record a session completed with the active companion */
  recordCompanionSession: (xpEarned: number) => void

  /** Get the active companion's bonus type and value */
  getActiveBonus: () => { type: CompanionBonusType; value: number }

  /** Get total sessions with a specific companion */
  getCompanionSessions: (character: CharacterName) => number
}

const COMPANION_BONUSES: Record<CharacterName, { type: CompanionBonusType; value: number }> = {
  ki: { type: 'xp_boost', value: 0.05 },
  mika: { type: 'shortcut_tips', value: 1 },
  yuki: { type: 'speed_timer_bonus', value: 3 },
  luna: { type: 'practice_hints', value: 3 },
  noa: { type: 'extra_life', value: 1 },
  kai: { type: 'combo_multiplier', value: 0.1 },
  senseiZen: { type: 'wisdom_xp', value: 0.03 },
  pixel: { type: 'stats_overlay', value: 1 },
  rex: { type: 'game_score_bonus', value: 0.1 },
  // Villains/rivals -- not selectable as companions, but typed for safety:
  bug: { type: 'xp_boost', value: 0 },
  glitch: { type: 'xp_boost', value: 0 },
  shadow: { type: 'xp_boost', value: 0 },
  storm: { type: 'xp_boost', value: 0 },
  blaze: { type: 'xp_boost', value: 0 },
}

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set, get) => ({
      activeCompanion: 'ki' as CharacterName,
      companionUsage: {},

      setActiveCompanion: (character) =>
        set({ activeCompanion: character }),

      recordCompanionSession: (xpEarned) =>
        set((s) => {
          const companion = s.activeCompanion
          const existing = s.companionUsage[companion]
          return {
            companionUsage: {
              ...s.companionUsage,
              [companion]: {
                sessionsCount: (existing?.sessionsCount ?? 0) + 1,
                totalXpEarned: (existing?.totalXpEarned ?? 0) + xpEarned,
                lastUsedAt: Date.now(),
              },
            },
          }
        }),

      getActiveBonus: () => {
        return COMPANION_BONUSES[get().activeCompanion] ?? { type: 'xp_boost', value: 0 }
      },

      getCompanionSessions: (character) => {
        return get().companionUsage[character]?.sessionsCount ?? 0
      },
    }),
    { name: 'ninja-keyboard-companion' },
  ),
)
```

### 6.3 New `battle-record-store.ts`

Tracks rival battle records for the rival progression system.

```typescript
// src/stores/battle-record-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RivalId = 'shadow' | 'storm' | 'blaze' | 'phantom'

interface RivalRecord {
  totalBattles: number
  wins: number
  bestWpm: number
  bestAccuracy: number
  firstVictoryAt: number | null
}

interface BattleRecordState {
  /** Per-rival battle records */
  rivalRecords: Partial<Record<RivalId, RivalRecord>>

  /** Total battles across all rivals */
  totalBattles: number

  /** Record a battle result */
  recordBattle: (
    rivalId: RivalId,
    won: boolean,
    wpm: number,
    accuracy: number,
  ) => void

  /** Check if a rival is unlocked */
  isRivalUnlocked: (rivalId: RivalId) => boolean

  /** Get wins against a specific rival */
  getRivalWins: (rivalId: RivalId) => number
}

export const useBattleRecordStore = create<BattleRecordState>()(
  persist(
    (set, get) => ({
      rivalRecords: {},
      totalBattles: 0,

      recordBattle: (rivalId, won, wpm, accuracy) =>
        set((s) => {
          const existing = s.rivalRecords[rivalId]
          const record: RivalRecord = {
            totalBattles: (existing?.totalBattles ?? 0) + 1,
            wins: (existing?.wins ?? 0) + (won ? 1 : 0),
            bestWpm: Math.max(existing?.bestWpm ?? 0, wpm),
            bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
            firstVictoryAt:
              won && !existing?.firstVictoryAt
                ? Date.now()
                : (existing?.firstVictoryAt ?? null),
          }
          return {
            rivalRecords: { ...s.rivalRecords, [rivalId]: record },
            totalBattles: s.totalBattles + 1,
          }
        }),

      isRivalUnlocked: (rivalId) => {
        const records = get().rivalRecords
        switch (rivalId) {
          case 'shadow':
            return true // Always available
          case 'storm':
            return (records.shadow?.wins ?? 0) >= 3
          case 'blaze':
            return (records.storm?.wins ?? 0) >= 3
          case 'phantom':
            return (records.blaze?.wins ?? 0) >= 3
          default:
            return false
        }
      },

      getRivalWins: (rivalId) => {
        return get().rivalRecords[rivalId]?.wins ?? 0
      },
    }),
    { name: 'ninja-keyboard-battle-records' },
  ),
)
```

### 6.4 Changes to `xp-store.ts`

**New state fields:**

```typescript
// Add to XpState:

/** Number of speed test attempts */
speedTestAttempts: number

/** Number of mini-games played */
gamesPlayed: number

/** Record a speed test attempt */
recordSpeedTest: () => void

/** Record a game played */
recordGamePlayed: () => void
```

**Implementation additions:**

```typescript
// Inside the create() callback, add:

speedTestAttempts: 0,
gamesPlayed: 0,

recordSpeedTest: () =>
  set((s) => ({ speedTestAttempts: s.speedTestAttempts + 1 })),

recordGamePlayed: () =>
  set((s) => ({ gamesPlayed: s.gamesPlayed + 1 })),
```

### 6.5 Changes to `badge-definitions.ts`

Add these new `BadgeCondition` union members:

```typescript
// Add to BadgeCondition type:
| { type: 'boss_defeated'; lessonNumber: number }
| { type: 'rival_defeated'; rivalId: string }
| { type: 'companion_used'; sessions: number }
| { type: 'all_characters_unlocked' }
| { type: 'games_played'; count: number }
| { type: 'speed_test_attempted' }
```

### 6.6 Changes to `badge-checker.ts`

Extend `BadgeContext` and `checkBadgeEarned`:

```typescript
// Add to BadgeContext:
bossResults: Record<number, { defeated: boolean }>
rivalRecords: Record<string, { wins: number }>
companionSessions: Record<string, number>
unlockedCharactersCount: number
gamesPlayed: number
speedTestAttempts: number
totalHeroCharacters: number  // constant = 9

// Add cases to checkBadgeEarned switch:
case 'boss_defeated':
  return ctx.bossResults[cond.lessonNumber]?.defeated === true

case 'rival_defeated':
  return (ctx.rivalRecords[cond.rivalId]?.wins ?? 0) >= 1

case 'companion_used':
  return Object.values(ctx.companionSessions).some(s => s >= cond.sessions)

case 'all_characters_unlocked':
  return ctx.unlockedCharactersCount >= ctx.totalHeroCharacters

case 'games_played':
  return ctx.gamesPlayed >= cond.count

case 'speed_test_attempted':
  return ctx.speedTestAttempts >= 1
```

### 6.7 Integration Points -- Data Flow Diagram

```
┌──────────────┐    ┌───────────────┐    ┌──────────────────┐
│  xp-store    │    │ story-store   │    │ practice-history  │
│              │    │               │    │                   │
│ completedLes │───>│ processUnlock │<───│ results.length    │
│ speedTestAtt │    │ bossResults   │    │ getBestWpm()      │
│ gamesPlayed  │    │ storyFlags    │    │                   │
└──────┬───────┘    └──────┬────────┘    └───────────────────┘
       │                   │
       v                   v
┌──────────────────────────────────┐
│     unlock-checker.ts            │
│     getNewlyUnlockable(ctx)      │
│     → returns CharacterUnlockDef[]│
└──────────────┬───────────────────┘
               │
       ┌───────┴───────┐
       v               v
┌─────────────┐  ┌───────────────┐
│ companion-  │  │ badge-store   │
│ store       │  │               │
│             │  │ earnBadge()   │
│ setActive() │  │               │
└─────────────┘  └───────────────┘
       │
       v
┌──────────────────────────────┐
│ battle-record-store          │
│                              │
│ rivalRecords                 │
│ isRivalUnlocked()            │
└──────────────────────────────┘
```

### 6.8 Progression Check Hook

A React hook that centralizes progression checking, intended to be called after every lesson completion, practice session, speed test, game, or battle.

```typescript
// src/hooks/use-progression-check.ts

import { useCallback } from 'react'
import { useStoryStore } from '@/stores/story-store'
import { useXpStore } from '@/stores/xp-store'
import { useBadgeStore } from '@/stores/badge-store'
import { useCompanionStore } from '@/stores/companion-store'
import { useBattleRecordStore } from '@/stores/battle-record-store'
import { usePracticeHistoryStore } from '@/stores/practice-history-store'
import { getNewlyUnlockable } from '@/lib/progression/unlock-checker'
import { getNewlyEarnedBadges } from '@/lib/gamification/badge-checker'
import { soundManager } from '@/lib/audio/sound-manager'
import type { CharacterName } from '@/types/story'

interface ProgressionEvent {
  type: 'character_unlock' | 'badge_earned' | 'rival_unlocked'
  id: string
  nameHe: string
}

export function useProgressionCheck() {
  const storyStore = useStoryStore()
  const xpStore = useXpStore()
  const badgeStore = useBadgeStore()
  const companionStore = useCompanionStore()
  const battleRecordStore = useBattleRecordStore()
  const practiceHistory = usePracticeHistoryStore()

  const checkProgression = useCallback((): ProgressionEvent[] => {
    const events: ProgressionEvent[] = []

    // 1. Check character unlocks
    const unlockCtx = {
      highestCompletedLesson: /* derive from xpStore.completedLessons */,
      speedTestAttempts: xpStore.speedTestAttempts,
      practiceSessionCount: practiceHistory.results.length,
      bestWpm: practiceHistory.getBestWpm(),
      gamesPlayed: xpStore.gamesPlayed,
      bossResults: storyStore.bossResults,
      alreadyUnlocked: storyStore.unlockedCharacters,
    }

    const newUnlocks = getNewlyUnlockable(unlockCtx)
    for (const def of newUnlocks) {
      storyStore.unlockCharacter(def.character)
      if (def.storyFlag) {
        storyStore.setStoryFlag(def.storyFlag as keyof StoryFlags)
      }
      soundManager.play('characterUnlock')
      events.push({
        type: 'character_unlock',
        id: def.character,
        nameHe: def.unlockTextHe,
      })
    }

    // 2. Check badge unlocks (extended context)
    // ... (build BadgeContext from all stores, call getNewlyEarnedBadges)

    // 3. Check rival unlocks
    const rivals = ['storm', 'blaze', 'phantom'] as const
    for (const rival of rivals) {
      if (battleRecordStore.isRivalUnlocked(rival)) {
        events.push({
          type: 'rival_unlocked',
          id: rival,
          nameHe: `!יריב חדש נפתח`,
        })
      }
    }

    return events
  }, [storyStore, xpStore, badgeStore, companionStore, battleRecordStore, practiceHistory])

  return { checkProgression }
}
```

---

## 7. Music Cue Points

### 7.1 Sound Architecture

The game uses Web Audio API synthesis (no external audio files). All music cues are synthesized tone sequences defined in `src/lib/audio/sounds.ts`. Below are new sound definitions needed for the character progression system.

### 7.2 New Sound Definitions

```typescript
// Additions to SOUNDS in src/lib/audio/sounds.ts

// ── Character Unlock ──────────────────────────────────────────
characterUnlock: {
  name: 'characterUnlock',
  gain: 0.35,
  steps: [
    // Rising fanfare: C5 -> E5 -> G5 -> C6 (major chord arpeggio)
    { frequency: 523, duration: 100, type: 'sine' },
    { frequency: 659, duration: 100, type: 'sine' },
    { frequency: 784, duration: 120, type: 'sine' },
    { frequency: 1047, duration: 200, type: 'sine' },
    // Sparkle tail
    { frequency: 1568, duration: 60, type: 'sine' },
    { frequency: 2093, duration: 80, type: 'sine' },
  ],
},

// ── Boss Encounter ────────────────────────────────────────────
bossEncounter: {
  name: 'bossEncounter',
  gain: 0.35,
  steps: [
    // Dramatic descending: low rumble -> tension -> hit
    { frequency: 110, duration: 200, type: 'sawtooth' },
    { frequency: 147, duration: 150, type: 'sawtooth' },
    { frequency: 110, duration: 100, type: 'sawtooth' },
    { frequency: 220, duration: 300, type: 'square' },
  ],
},

// ── Boss Victory ──────────────────────────────────────────────
bossVictory: {
  name: 'bossVictory',
  gain: 0.4,
  steps: [
    // Triumphant: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
    { frequency: 262, duration: 80, type: 'sine' },
    { frequency: 330, duration: 80, type: 'sine' },
    { frequency: 392, duration: 80, type: 'sine' },
    { frequency: 523, duration: 100, type: 'sine' },
    { frequency: 659, duration: 100, type: 'sine' },
    { frequency: 784, duration: 120, type: 'sine' },
    { frequency: 1047, duration: 250, type: 'sine' },
  ],
},

// ── Boss Defeat (Player Lost) ────────────────────────────────
bossDefeat: {
  name: 'bossDefeat',
  gain: 0.25,
  steps: [
    // Gentle descending: not harsh, encouraging "try again"
    { frequency: 392, duration: 150, type: 'sine' },
    { frequency: 330, duration: 150, type: 'sine' },
    { frequency: 262, duration: 250, type: 'sine' },
  ],
},

// ── Bug Tease ─────────────────────────────────────────────────
bugTease: {
  name: 'bugTease',
  gain: 0.15,
  steps: [
    // Quick mischievous chirp
    { frequency: 800, duration: 40, type: 'square' },
    { frequency: 1200, duration: 30, type: 'square' },
    { frequency: 600, duration: 50, type: 'square' },
  ],
},

// ── Bug Escape (Bug runs away after defeat) ──────────────────
bugEscape: {
  name: 'bugEscape',
  gain: 0.2,
  steps: [
    // Descending comic "womp womp" + flutter
    { frequency: 500, duration: 60, type: 'square' },
    { frequency: 400, duration: 60, type: 'square' },
    { frequency: 300, duration: 80, type: 'square' },
    { frequency: 1200, duration: 20, type: 'sine' },
    { frequency: 1000, duration: 20, type: 'sine' },
    { frequency: 800, duration: 20, type: 'sine' },
  ],
},

// ── Glitch Effect ─────────────────────────────────────────────
glitchEffect: {
  name: 'glitchEffect',
  gain: 0.2,
  steps: [
    // Digital interference: rapid random-ish tones
    { frequency: 200, duration: 30, type: 'sawtooth' },
    { frequency: 1500, duration: 20, type: 'square' },
    { frequency: 100, duration: 40, type: 'sawtooth' },
    { frequency: 2000, duration: 15, type: 'square' },
    { frequency: 300, duration: 30, type: 'sawtooth' },
  ],
},

// ── Companion Reaction ────────────────────────────────────────
companionReaction: {
  name: 'companionReaction',
  gain: 0.15,
  steps: [
    // Soft chime: gentle attention-getter
    { frequency: 880, duration: 50, type: 'sine' },
    { frequency: 1100, duration: 40, type: 'sine' },
  ],
},

// ── Rival Unlock ──────────────────────────────────────────────
rivalUnlock: {
  name: 'rivalUnlock',
  gain: 0.3,
  steps: [
    // Challenging: minor key tension
    { frequency: 220, duration: 100, type: 'sawtooth' },
    { frequency: 262, duration: 100, type: 'sawtooth' },
    { frequency: 220, duration: 80, type: 'sawtooth' },
    { frequency: 330, duration: 150, type: 'sine' },
  ],
},

// ── Story Beat ────────────────────────────────────────────────
storyBeat: {
  name: 'storyBeat',
  gain: 0.15,
  steps: [
    // Ambient: soft and atmospheric
    { frequency: 440, duration: 200, type: 'sine' },
    { frequency: 523, duration: 250, type: 'sine' },
  ],
},

// ── Glitch Calmed (Lesson 18 Redemption) ─────────────────────
glitchCalmed: {
  name: 'glitchCalmed',
  gain: 0.25,
  steps: [
    // Chaotic start settling into harmony
    { frequency: 300, duration: 40, type: 'sawtooth' },
    { frequency: 800, duration: 30, type: 'square' },
    { frequency: 440, duration: 80, type: 'sine' },
    { frequency: 523, duration: 100, type: 'sine' },
    { frequency: 659, duration: 150, type: 'sine' },
  ],
},

// ── Certificate Earned ───────────────────────────────────────
certificateEarned: {
  name: 'certificateEarned',
  gain: 0.4,
  steps: [
    // Grand: full major scale ascending
    { frequency: 262, duration: 80, type: 'sine' },
    { frequency: 294, duration: 60, type: 'sine' },
    { frequency: 330, duration: 60, type: 'sine' },
    { frequency: 349, duration: 60, type: 'sine' },
    { frequency: 392, duration: 80, type: 'sine' },
    { frequency: 440, duration: 80, type: 'sine' },
    { frequency: 494, duration: 80, type: 'sine' },
    { frequency: 523, duration: 100, type: 'sine' },
    { frequency: 659, duration: 100, type: 'sine' },
    { frequency: 784, duration: 120, type: 'sine' },
    { frequency: 1047, duration: 300, type: 'sine' },
  ],
},
```

### 7.3 Music Cue Schedule -- Major Narrative Moments

| Moment | Sound Cue | When It Plays |
|--------|-----------|---------------|
| **Character Unlock** | `characterUnlock` | Immediately when a new character is revealed |
| **Companion Reaction** | `companionReaction` | When active companion shows a speech bubble |
| **Bug Tease (L3-L6)** | `bugTease` | During the brief visual tease moments |
| **Bug Entrance (L6)** | `bossEncounter` | When Bug first appears on screen |
| **Boss Battle Start (L7, L15, L20)** | `battleStart` + `bossEncounter` | Countdown ends, boss battle begins |
| **Boss Defeated** | `bossVictory` + `bugEscape` | Bug's HP reaches 0, escape animation plays |
| **Boss Lost (player failed)** | `bossDefeat` | Timer runs out or accuracy too low |
| **Glitch Appearance (L12)** | `glitchEffect` | Keyboard layout starts flipping |
| **Glitch Key Flips (L15)** | `glitchEffect` | Every time Glitch flips keys mid-battle |
| **Glitch Calmed (L18)** | `glitchCalmed` | Player successfully calms Glitch |
| **Story Beat (dialogue)** | `storyBeat` | When a story beat bubble appears pre/post lesson |
| **Rival Unlock** | `rivalUnlock` | New rival becomes available in Battle Arena |
| **Final Boss Defeated (L20)** | `certificateEarned` | After Bug King escape animation + celebration |
| **Badge Earned** | `badgeUnlock` (existing) | Any badge is awarded |
| **XP Gained** | `xpGain` (existing) | XP counter increments |
| **Level Up** | `achievementFanfare` (existing) | Player levels up |

### 7.4 Age Theme Energy Scaling

The same sound cues play for all age themes, but with volume and complexity adjustments:

| Age Theme | Sound Volume | Extra Layers |
|-----------|-------------|-------------|
| Shatil (6-8) | 100% (louder, more celebratory) | Extra sparkle steps appended to fanfares |
| Nevet (8-10) | 90% | Standard |
| Geza (10-12) | 80% | Standard |
| Anaf (12-14) | 60% | Shortened (fewer steps per cue) |
| Tzameret (14-16) | 40% or off (user setting) | Minimal -- single tone or silent |

**Implementation:** Apply a `themeGainMultiplier` in the sound manager based on the active age theme.

```typescript
// src/lib/audio/sound-manager.ts -- addition

const THEME_GAIN_MULTIPLIERS: Record<string, number> = {
  shatil: 1.0,
  nevet: 0.9,
  geza: 0.8,
  anaf: 0.6,
  tzameret: 0.4,
}
```

### 7.5 Character-Specific Sound Profiles

Each character already has a `soundProfile` in `character-config.ts`. When a character delivers a companion reaction or appears in a story beat, their speech bubble is accompanied by a short tone generated from their profile:

```typescript
function playCharacterChime(character: CharacterName): void {
  const config = CHARACTER_CONFIGS[character]
  const { oscillatorType, frequencyRange } = config.soundProfile
  const [min, max] = frequencyRange
  const mid = (min + max) / 2

  // Play a 2-note chime in the character's frequency range
  soundManager.playSequence([
    { frequency: mid, duration: 60, type: oscillatorType },
    { frequency: mid * 1.25, duration: 80, type: oscillatorType },
  ], config.soundProfile.gain ?? 0.15)
}
```

---

## Appendix A: Implementation Priority

| Phase | Task | Files Affected | Priority |
|-------|------|----------------|----------|
| **1** | Add new StoryFlags (`yukiJoined`, `kaiJoined`, `rexJoined`, etc.) | `types/story.ts`, `stores/story-store.ts` | P0 |
| **1** | Add `speedTestAttempts` and `gamesPlayed` to xp-store | `stores/xp-store.ts` | P0 |
| **1** | Create `unlock-conditions.ts` and `unlock-checker.ts` | `lib/progression/` (new) | P0 |
| **1** | Create `companion-store.ts` | `stores/companion-store.ts` (new) | P0 |
| **1** | Create `battle-record-store.ts` | `stores/battle-record-store.ts` (new) | P0 |
| **2** | Add new badge condition types and badge definitions | `lib/gamification/badge-definitions.ts` | P1 |
| **2** | Extend badge checker with new condition types | `lib/gamification/badge-checker.ts` | P1 |
| **2** | Add new sound cues | `lib/audio/sounds.ts` | P1 |
| **2** | Create `use-progression-check.ts` hook | `hooks/use-progression-check.ts` (new) | P1 |
| **3** | Implement companion selection UI | `components/companion/` (new) | P1 |
| **3** | Implement companion reaction system | `components/companion/companion-reaction.tsx` (new) | P2 |
| **3** | Implement Bug tease visual effects (L3-L6) | `components/story/bug-tease.tsx` (new) | P2 |
| **3** | Implement boss battle mechanics (L7 first) | `components/battle/boss-battle.tsx` (new) | P1 |
| **4** | Implement Glitch effects (keyboard flip) | `components/battle/glitch-effect.tsx` (new) | P2 |
| **4** | Implement Phantom secret rival | `components/characters/rival-ninja.tsx` update | P3 |
| **4** | Implement age-theme sound scaling | `lib/audio/sound-manager.ts` | P2 |
| **5** | Character unlock celebration UI | `components/story/character-unlock.tsx` (new) | P1 |
| **5** | Collection/completion reward UI | `components/gamification/collection-rewards.tsx` (new) | P3 |

---

## Appendix B: Character Progression Timeline (Player's Journey)

A typical player progressing through the game would experience:

```
Lesson 1  → Ki is your guide. Pixel shows stats.
Lesson 2  → UNLOCK: Mika joins! Partnership begins.
Lesson 3  → UNLOCK: Sensei Zen appears. [Bug tease: flicker]
Lesson 4  → [Bug tease: shadow]. Try Speed Test → UNLOCK: Yuki!
Lesson 5  → [Bug tease: scramble]. After 10 practice sessions → UNLOCK: Luna!
Lesson 6  → [Bug tease: giggle]. Bug's first real appearance.
Lesson 7  → BOSS: Bug the Small! Beat him → UNLOCK: Noa!
            BADGE: "Bug Buster"
Lesson 8  → Sensei Zen teaches in person.
Lessons 9-10 → Training. Yuki speed challenges.
Lesson 11 → Luna's Moonlit Garden focus exercises.
Lesson 12 → Glitch appears! Keyboard flip tutorial.
Lesson 13 → Kai + Noa help with combined challenges.
Lesson 14 → Bug scrambles entire paragraphs.
Lesson 15 → BOSS: Bug + Glitch! BADGE: "Glitch Survivor"

[Meanwhile in Battle Arena:]
  Beat Shadow 3x → UNLOCK: Storm rival + BADGE: "Shadow Slayer"
  Beat Storm 3x  → UNLOCK: Blaze rival + BADGE: "Storm Breaker"

[Meanwhile in Games Hub:]
  Play 5 games   → UNLOCK: Rex!

[Meanwhile in practice:]
  Hit 50 WPM     → UNLOCK: Kai! + BADGE: "Speed Demon"

Lesson 16 → Enter the Error Maze.
Lesson 17 → Mika hacks firewalls, Luna finds calm path.
Lesson 18 → Glitch redemption -- calm Glitch with accuracy.
Lesson 19 → Kai holds off Bug's minions.
Lesson 20 → FINAL BOSS: Bug King! ALL heroes help.
            BADGE: "King Slayer"
            CERTIFICATE: "True Keyboard Ninja"

Post-Game → Monthly boss events. Beat Blaze 3x → UNLOCK: Phantom.
            Collect all badges → "Completionist"
            Unlock all characters → "Full Team"
```

---

*Document version: 1.0*
*Last updated: March 2026*
*Status: Ready for implementation. Phase 1 can begin immediately.*
