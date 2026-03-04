# Ninja Keyboard - Age-Adaptive UX Specification

## Document Status
- **Version**: 1.0
- **Date**: 2026-03-04
- **Scope**: Comprehensive specification for radically different experiences per age theme and role

---

## 1. Current State Analysis

### What Exists Today
- **5 age themes** defined in `src/styles/themes/` with `AgeTheme` type: `shatil` (6-8), `nevet` (8-10), `geza` (10-12), `anaf` (12-14), `tzameret` (14-16+)
- **CSS variables** in `src/styles/css/theme-vars.css` scaling `--theme-radius`, `--theme-font-scale`, `--theme-button-height`, `--theme-spacing` per `[data-theme]`
- **Color schemes** independent of age: `default`, `dark`, `high-contrast`, `dark-high-contrast`
- **ThemeProvider** at `src/components/providers/theme-provider.tsx` sets `data-theme` and `data-scheme` attributes on `<html>`
- **Theme store** at `src/stores/theme-store.ts` persists `ageName` and `colorScheme` via Zustand + localStorage
- **One layout**: `AppShell` with `Sidebar` (desktop) + `BottomTabs` (mobile) + `Header`, identical for all ages
- **One visual language**: Dark gaming theme (`#0d0b1a` base, neon glows, `.game-bg`, `.game-card-border`, `.game-button`, `.ninja-gradient`) hardcoded everywhere
- **Ki mascot**: Single image-based mascot with 8 mood animations, 3 sizes (`small`/`medium`/`large`), speech bubbles
- **12 characters**: Model sheets generated but only Ki is integrated. Character-to-page mapping exists in docs but not in code
- **Sound system**: 15 Web Audio API synthesized sounds, same for all ages

### The Core Problem
The dark gaming aesthetic (`#0d0b1a`, neon glows, gradient borders, "game-" CSS classes) is hardcoded into:
1. `globals.css` `:root` and `.dark` (lines 52-120)
2. Gaming utility classes (`.game-bg`, `.game-card-border`, `.game-button`, `.game-stat-badge`) (lines 418-495)
3. Layout components (`sidebar.tsx`, `header.tsx`, `bottom-tabs.tsx`) with hardcoded `bg-[#0d0b1a]`, `bg-[#080618]`, `border-[oklch(0.25_0.04_292)]`
4. `home-client.tsx` with hardcoded `style={{ background: '#0d0b1a' }}` and gaming class usage
5. No conditional rendering based on `ageName` in any component

The existing `[data-theme]` selectors only change 4 low-level variables (radius, font-scale, button-height, spacing). They do not change colors, backgrounds, character presence, animation intensity, navigation structure, or gamification behavior.

---

## 2. Design Philosophy Per Age Tier

### Shatil (6-8) - "Magical Garden"
**Emotional target**: Safe, warm, wonder. Like walking into a friendly cartoon world.
**Real-world reference**: Duolingo Kids, Khan Academy Kids, PBS Kids games.

A 6-year-old should feel like they're playing, not studying. Large touch targets, constant positive reinforcement, characters that feel like friends. The screen should never feel empty or intimidating. Light backgrounds with cheerful colors. Every interaction should produce a delightful response.

### Nevet (8-10) - "Adventure Camp"
**Emotional target**: Fun, exciting, slightly challenging. Like a Saturday morning cartoon adventure.
**Real-world reference**: Prodigy Math, Club Penguin, early Pokemon games.

Kids in this range are gaining confidence and want to feel "cool" but still need warmth. Characters are companions on a journey. Gamification is front-and-center but not overwhelming. Light-to-medium palette. First hints of competition.

### Geza (10-12) - "Ninja Arena"
**Emotional target**: Cool, competitive, gaming. Like Brawl Stars or Fortnite lobbies.
**Real-world reference**: Brawl Stars, Clash Royale, Roblox UI.

This is the current design's sweet spot. Dark backgrounds, neon accents, gaming cards, competitive elements. Characters are fellow warriors. Rankings matter. Battle mode is a first-class feature. The UI should feel like a premium mobile game.

### Anaf (12-14) - "Training Hub"
**Emotional target**: Mature, efficient, respect for the user's intelligence. Like a well-made productivity app with gaming touches.
**Real-world reference**: Monkeytype (dark mode), Discord, Notion-lite.

Teens are self-conscious about "childish" things. The mascot should be subtle or optional. Data and progress should be prominent. The UI should feel sleek and modern, not gamey. Dark mode by default but cleaner than Geza's neon-heavy approach.

### Tzameret (14-16+) - "Pro Dashboard"
**Emotional target**: Professional, minimal, data-first. Like a developer tool or analytics dashboard.
**Real-world reference**: Monkeytype, Keybr.com, typing.io.

No characters unless explicitly enabled. Clean typography, dense information, keyboard shortcuts for everything. The focus is purely on WPM, accuracy, and improvement graphs. Achievement system becomes "milestones" with understated presentation.

---

## 3. Visual System Per Age

### 3.1 Background & Color Palette

```
Theme       | Background          | Card Background      | Text         | Accent Style
------------|---------------------|----------------------|--------------|------------------
Shatil      | Warm cream #FFF8F0  | White #FFFFFF        | Dark #2D3436 | Soft pastels
            | Soft gradient to    | Rounded, drop-shadow | Rounded font | Candy colors
            | light lavender      | (no borders)         |              | No neon/glow
------------|---------------------|----------------------|--------------|------------------
Nevet       | Light sky #F0F4FF   | White #FFFFFF        | Dark #2D3436 | Bright primaries
            | Subtle cloud        | Light border,        | Slightly     | Moderate
            | pattern overlay     | gentle shadow        | smaller      | saturation
------------|---------------------|----------------------|--------------|------------------
Geza        | Deep dark #0d0b1a   | Dark glass           | Light #e8e8f0| Neon purple/green
            | Radial gradient     | oklch(0.13 0.025     | Glow effects | Full gaming
            | ambient glows       | 290)                 |              | aesthetic
------------|---------------------|----------------------|--------------|------------------
Anaf        | Neutral dark        | Subtle card          | Light gray   | Muted purple
            | #1a1a2e (softer)    | #252540              | #d1d5db      | accent, no glow
            | No radial glows     | Clean 1px borders    |              | Underline > glow
------------|---------------------|----------------------|--------------|------------------
Tzameret    | Near-black #111111  | #1a1a1a              | #e5e5e5      | Monochrome +
            | or Pure white       | or #f5f5f5 (light)   | or #333      | single accent
            | (user choice)       | Minimal border       |              | No gradients
```

### 3.2 CSS Variable Expansion

The current `[data-theme]` selectors need to be expanded from 4 variables to approximately 25. New variables required in `theme-vars.css`:

```css
[data-theme='shatil'] {
  /* Existing */
  --theme-radius: 1.25rem;
  --theme-font-scale: 1.25;
  --theme-button-height: 60px;
  --theme-spacing: 1.5;

  /* NEW: Color atmosphere */
  --theme-bg: #FFF8F0;
  --theme-bg-secondary: #FFF0E6;
  --theme-card-bg: #FFFFFF;
  --theme-card-border: #F0E0D0;
  --theme-card-shadow: 0 4px 12px rgba(0,0,0,0.06);
  --theme-text: #2D3436;
  --theme-text-muted: #636E72;

  /* NEW: Gaming intensity (0=none, 1=full) */
  --theme-glow-intensity: 0;
  --theme-neon-opacity: 0;
  --theme-gradient-border: 0;

  /* NEW: Character & Animation */
  --theme-mascot-size: 120px;
  --theme-mascot-position: center;
  --theme-animation-scale: 1.5;
  --theme-celebration-intensity: 3; /* 1=subtle, 2=normal, 3=maximum */

  /* NEW: Navigation */
  --theme-nav-icon-size: 28px;
  --theme-nav-label-size: 14px;
  --theme-nav-gap: 8px;

  /* NEW: Typography */
  --theme-heading-weight: 800;
  --theme-body-line-height: 1.75;
  --theme-letter-spacing: 0.02em;
}

[data-theme='geza'] {
  --theme-bg: #0d0b1a;
  --theme-bg-secondary: #080618;
  --theme-card-bg: oklch(0.13 0.025 290);
  --theme-card-border: oklch(0.25 0.04 292);
  --theme-card-shadow: 0 4px 16px oklch(0 0 0 / 40%);
  --theme-text: #e8e8f0;
  --theme-text-muted: #9e9eb8;

  --theme-glow-intensity: 1;
  --theme-neon-opacity: 1;
  --theme-gradient-border: 1;

  --theme-mascot-size: 64px;
  --theme-mascot-position: corner;
  --theme-animation-scale: 1;
  --theme-celebration-intensity: 2;

  --theme-nav-icon-size: 20px;
  --theme-nav-label-size: 12px;
  --theme-nav-gap: 4px;

  --theme-heading-weight: 800;
  --theme-body-line-height: 1.5;
  --theme-letter-spacing: 0.05em;
}

[data-theme='tzameret'] {
  --theme-bg: #111111;
  --theme-bg-secondary: #1a1a1a;
  --theme-card-bg: #1e1e1e;
  --theme-card-border: #333333;
  --theme-card-shadow: none;
  --theme-text: #e5e5e5;
  --theme-text-muted: #888888;

  --theme-glow-intensity: 0;
  --theme-neon-opacity: 0;
  --theme-gradient-border: 0;

  --theme-mascot-size: 0px;
  --theme-mascot-position: hidden;
  --theme-animation-scale: 0.3;
  --theme-celebration-intensity: 1;

  --theme-nav-icon-size: 16px;
  --theme-nav-label-size: 11px;
  --theme-nav-gap: 2px;

  --theme-heading-weight: 600;
  --theme-body-line-height: 1.4;
  --theme-letter-spacing: 0;
}
```

### 3.3 Typography Scale

```
Element        | Shatil (6-8)  | Nevet (8-10)  | Geza (10-12)  | Anaf (12-14)  | Tzameret (14-16+)
---------------|---------------|---------------|----------------|---------------|------------------
Page heading   | 2.25rem/36px  | 1.875rem/30px | 1.5rem/24px    | 1.25rem/20px  | 1.125rem/18px
               | extrabold     | bold          | extrabold      | semibold      | semibold
               | rounded feel  | clean         | gradient text  | clean         | monospace accent
Section title  | 1.5rem/24px   | 1.25rem/20px  | 1rem/16px      | 0.875rem/14px | 0.75rem/12px
               | bold          | semibold      | extrabold+caps | medium+caps   | medium+caps
Body text      | 1.125rem/18px | 1rem/16px     | 0.875rem/14px  | 0.875rem/14px | 0.8125rem/13px
               | line-h 1.75   | line-h 1.6    | line-h 1.5     | line-h 1.5    | line-h 1.4
Button text    | 1.125rem/18px | 1rem/16px     | 0.875rem/14px  | 0.8125rem/13px| 0.75rem/12px
               | bold          | semibold      | bold           | medium        | medium
Stat numbers   | 2.5rem/40px   | 2rem/32px     | 1.75rem/28px   | 1.5rem/24px   | 1.25rem/20px
               | extrabold     | bold          | bold+glow      | semibold      | tabular-nums
```

### 3.4 Animation Intensity

```
Interaction      | Shatil         | Nevet          | Geza           | Anaf           | Tzameret
-----------------|----------------|----------------|----------------|----------------|----------------
Page enter       | Bounce up      | Slide up       | Slide up       | Fade in        | Instant
                 | 400ms spring   | 300ms ease     | 250ms ease     | 200ms fade     | 0ms
Card appear      | Scale+bounce   | Slide+fade     | Slide+fade     | Fade only      | Instant
                 | stagger 80ms   | stagger 60ms   | stagger 40ms   | stagger 20ms   | no stagger
Hover effects    | Scale 1.05     | Scale 1.03     | Scale 1.02     | Border color   | Underline
                 | + wobble       | + lift shadow  | + glow         | change only    | only
Button press     | Squish 0.9     | Scale 0.95     | Scale 0.98     | Scale 0.98     | Opacity 0.8
                 | + particles    | + brief flash  | + press shadow | instant        | instant
Correct key      | Star burst     | Brief flash    | Color flash    | Color change   | Color change
                 | + sound + Ki   | + sound        | + sound        | no sound dflt  | no animation
Error key        | Gentle shake   | Shake          | Red flash      | Red underline  | Red underline
                 | Ki sad face    | shake 2x       | shake 1x       | no shake       | no shake
Level complete   | Full confetti  | Confetti       | Radial burst   | Checkmark      | Stat update
                 | + Ki cheering  | + celebration  | + XP animation | + brief toast  | + toast only
                 | 3sec duration  | 2sec duration  | 1.5sec dur     | 0.5sec         | instant
```

### 3.5 Sound Design Per Age

The existing `SoundManager` should accept an `ageSoundProfile` parameter that modifies synthesis:

```
Sound Event    | Shatil          | Nevet          | Geza           | Anaf           | Tzameret
---------------|-----------------|----------------|----------------|----------------|----------------
Key click      | Soft xylophone  | Light click    | Crisp tick     | Subtle tick    | Off by default
               | 400Hz sine      | 600Hz tri      | 800Hz square   | 1000Hz sine    | silent
Correct        | Ascending chime | Bright ding    | Quick beep up  | Minimal ping   | Off by default
               | 3-note melody   | 2-note melody  | 1-note beep    | 1-note soft    | silent
Error          | Gentle "oops"   | Soft buzz      | Short buzz     | Click only     | Off by default
               | low wobble      | 200Hz tri      | 150Hz square   | 300Hz sine     | silent
Level up       | Full fanfare    | Victory tune   | Power-up sound | Subtle chime   | Off by default
               | 8-note melody   | 5-note melody  | 3-note quick   | 2-note quiet   | silent
               | 2sec duration   | 1.5sec dur     | 0.8sec dur     | 0.4sec dur     | silent
Ambient music  | Gentle lullaby  | Upbeat playful | Gaming EDM     | Lo-fi beats    | Off by default
               | (future)        | (future)       | (future)       | (future)       | (future)
Volume default | 0.6             | 0.7            | 0.7            | 0.5            | 0.0
Frequency      | Every action    | Every action   | Important only | Key moments    | Off by default
```

---

## 4. Character Presence Per Age

### 4.1 Character Visibility Matrix

```
Character       | Shatil (6-8)    | Nevet (8-10)    | Geza (10-12)    | Anaf (12-14)    | Tzameret (14-16+)
----------------|-----------------|-----------------|-----------------|-----------------|-------------------
Ki (mascot)     | LARGE, always   | MEDIUM, always  | SMALL, always   | TINY, header    | HIDDEN
                | center/bottom   | corner floating | corner fixed    | icon only       | (toggle in settings)
Sensei Zen      | LARGE in lessons| MEDIUM lessons  | SMALL lessons   | Tooltip avatar  | HIDDEN
Yuki            | LARGE speed-test| MEDIUM speed    | SMALL speed     | Hidden          | HIDDEN
Luna            | LARGE practice  | MEDIUM practice | SMALL practice  | Hidden          | HIDDEN
Noa             | LARGE on errors | MEDIUM errors   | SMALL errors    | Hidden          | HIDDEN
Kai             | LARGE battle    | MEDIUM battle   | SMALL battle    | Hidden          | HIDDEN
Mika            | LARGE shortcuts | MEDIUM shortcuts| SMALL shortcuts | Hidden          | HIDDEN
Pixel           | LARGE stats     | MEDIUM stats    | SMALL stats     | SMALL stats     | Hidden
Rex             | LARGE games     | MEDIUM games    | SMALL games     | Hidden          | HIDDEN
Rivals          | LARGE in battle | MEDIUM battle   | STANDARD battle | SMALL battle    | Text name only
```

### 4.2 Character Size Definitions

```
Size    | Pixel Dimensions | Used For           | Rendering
--------|------------------|--------------------|--------------------
LARGE   | 120-160px        | Shatil primary     | Full body, animated idle loop
MEDIUM  | 64-96px          | Nevet primary      | Upper body, subtle idle
SMALL   | 36-48px          | Geza/Anaf          | Head only, minimal animation
TINY    | 24-32px          | Anaf header icon   | Static avatar circle
HIDDEN  | 0px              | Tzameret default   | Not rendered (display:none)
```

### 4.3 Speech Bubble Frequency

```
Theme      | Frequency        | Style                    | Content Type
-----------|------------------|--------------------------|------------------
Shatil     | Every 30 seconds | Large rounded bubble,    | Encouragement, hints,
           | + every event    | cartoon tail, animated   | celebrations, instructions
           |                  | pop-in, stays 5 sec      | "!כל הכבוד" "!המשך ככה"
Nevet      | Every 60 seconds | Medium bubble,           | Tips, milestone
           | + major events   | subtle fade-in,          | congratulations
           |                  | stays 4 sec              | "!שיא חדש" "!מעולה"
Geza       | Major events only| Small compact bubble,    | Battle taunts,
           | (level up, badge)| quick slide-in,          | competitive encouragement
           |                  | stays 3 sec              | "!אש" "!בום"
Anaf       | Achievements only| Minimal tooltip style,   | Factual updates only
           |                  | stays 2 sec              | "WPM חדש: 45"
Tzameret   | Never (default)  | Not rendered             | N/A
```

### 4.4 Character Position Architecture

For Shatil/Nevet, the character should be a core part of the page layout, not just a floating overlay:

```
Shatil Layout:
+-----------------------------------------+
| Header (simplified, large)              |
+-----------------------------------------+
|                                         |
|  [Character: Ki]     [Main Content]     |
|  120px, animated     Big cards          |
|  speech bubble       Large text         |
|  above or beside     Lots of spacing    |
|                                         |
+-----------------------------------------+
| Bottom Tabs (large icons, 4 tabs max)   |
+-----------------------------------------+

Geza Layout (current):
+-----------------------------------------+
| Header (gaming, compact)                |
+-----------------------------------------+
|                                         |
|  [Main Content]              [Ki: 48px] |
|  Gaming cards                corner     |
|  Dense grid                  floating   |
|  Neon effects                           |
|                                         |
+-----------------------------------------+
| Bottom Tabs (5 tabs, compact)           |
+-----------------------------------------+

Tzameret Layout:
+-----------------------------------------+
| Minimal Header (text only, shortcuts)   |
+-----------------------------------------+
|                                         |
|  [Main Content]                         |
|  Data tables, charts                    |
|  Dense typography                       |
|  No characters                          |
|  Keyboard shortcuts shown               |
|                                         |
+-----------------------------------------+
| No bottom tabs (keyboard nav)           |
| or minimal 3-tab footer                 |
+-----------------------------------------+
```

---

## 5. Navigation Per Age/Role

### 5.1 Student Navigation by Age

#### Shatil (6-8) - Guided, Minimal Choice

```
Bottom tabs (mobile): 3 tabs only
  [Home icon]    [Lessons icon]    [Games icon]
  "בית"          "שיעורים"         "משחקים"

No sidebar on desktop (same bottom-style nav, just larger)
No settings page exposed (parent controls via PIN)
No statistics page (progress shown inline on home)
No battle mode (too competitive for this age)
No keyboard shortcuts page

Home page: Single "next step" card with big CTA button
  "!בואו נתחיל" -> auto-navigates to next lesson
  No quick-links grid (too many choices)
  Progress shown as a visual path/map, not numbers
```

#### Nevet (8-10) - Guided with Exploration

```
Bottom tabs (mobile): 4 tabs
  [Home]    [Lessons]    [Games]    [Profile]
  "בית"     "שיעורים"    "משחקים"   "שלי"

Desktop: Simplified sidebar with grouped sections
  - Learning: Home, Lessons
  - Fun: Games, Speed Test
  - Me: Profile, Badges

Home page: Next lesson CTA + quick-links (4 items max)
Battle mode unlocks at level 5
Statistics shown as simple bar charts, not tables
```

#### Geza (10-12) - Full Navigation (Current)

```
Bottom tabs (mobile): 5 tabs (current design)
  [Home] [Lessons] [Practice] [Battle] [Profile]

Desktop: Full sidebar with all groups (current design)
  - Learning: Home, Lessons, Practice, Speed Test
  - Play: Battle, Games, Shortcuts
  - Achievements: Leaderboard, Certificates, Statistics
  - Personal: Profile, Settings

This is the current design and works well for this age.
```

#### Anaf (12-14) - Efficient Navigation

```
Bottom tabs (mobile): 5 tabs (same items, more compact)
  Icons only, no labels (save space)
  Tab labels shown as tooltip on long-press

Desktop: Collapsible sidebar (collapsed by default)
  Icon-only rail (40px wide) expanding on hover to full sidebar
  Keyboard shortcut hints next to each item

Home page: Dashboard with WPM chart front-and-center
  Quick-actions as a horizontal scrollable pill bar
  No mascot in hero section
```

#### Tzameret (14-16+) - Keyboard-First

```
Bottom tabs (mobile): 3 tabs
  [Practice] [Stats] [Settings]
  Minimal labels, no icons for older teens

Desktop: No sidebar. Top horizontal nav bar only.
  Practice | Speed Test | Statistics | Keyboard Shortcuts | Settings
  Cmd+K style command palette for all navigation

Home page = typing area directly (no dashboard)
  Or: minimal dashboard with WPM/accuracy/streak numbers
  Chart below fold
  No heroes, no celebrations, no characters

Keyboard shortcuts (visible in UI):
  Alt+1 = Practice
  Alt+2 = Speed Test
  Alt+3 = Statistics
  Alt+S = Settings
  Esc   = Back to home
  /     = Command palette
```

### 5.2 Teacher/Admin Navigation

```
Layout: Sidebar-first, data-heavy

Sidebar (always expanded on desktop):
  - Dashboard (overview)
  - My Classes
    - Class A
    - Class B
    - (+ Create Class)
  - Students
    - All Students
    - Struggling Students (flagged)
  - Reports
    - Class Progress
    - Individual Reports
    - Export (CSV/PDF)
  - Assignments
    - Create Assignment
    - Active Assignments
  - Settings
    - Class Settings
    - Age Theme per Class
    - Sound/Animation Policies

Main content: Data tables, sortable, filterable
  - Student list with WPM, accuracy, last active, streak
  - Color-coded progress (red/yellow/green)
  - Bulk actions (assign lesson, send message)

Characters: Sensei Zen avatar in sidebar header (subtle)
            Pixel robot for data tooltips (optional)

No gaming elements. Professional color scheme.
Uses Anaf/Tzameret visual language.
```

### 5.3 Parent Navigation

```
Layout: Simple card-based, mobile-first

Screens:
  - Overview (child's progress summary)
  - Progress Details (WPM over time chart)
  - Settings (age theme, sound, session limits)
  - Notifications (milestones, concerns)

Characters: Ki appears as child's "tutor" avatar
            Warm, reassuring visual language (Shatil/Nevet palette)

No gaming elements. Clean, trustworthy design.
No competitive features shown.
Emphasis: "Your child is improving" with positive framing.
```

---

## 6. Gamification Per Age

### 6.1 Reward System

```
Feature          | Shatil (6-8)    | Nevet (8-10)    | Geza (10-12)    | Anaf (12-14)    | Tzameret (14-16+)
-----------------|-----------------|-----------------|-----------------|-----------------|-------------------
XP display       | Stars, not      | XP with star    | XP with number  | XP number only  | "Points" or
                 | numbers. Star   | icon, colorful  | + animated bar  | in header badge | hidden entirely
                 | collection      | level badge     | neon glow       | minimal styling |
Level system     | "Ninja belts"   | Numbered levels | Numbered levels | Numbered levels | "Milestones"
                 | White->Yellow   | with fun names  | with rank title | number only     | (every 10th)
                 | ->Orange->etc   | "Ninja Starter" | "Shadow Ninja"  | "Level 15"      | "Milestone 3"
Streak           | Flame character | Flame counter   | Flame + counter | Number + icon   | Number only
                 | animation daily | with animation  | neon style      | compact         | "12-day streak"
Celebrations     | MAXIMUM         | HIGH            | MEDIUM          | LOW             | MINIMAL
                 | Full-screen     | Confetti rain   | Radial burst    | Brief checkmark | Toast notification
                 | confetti, Ki    | + sound + badge | + sound + XP    | + XP number     | "Lesson complete"
                 | cheering, 3sec  | popup, 2sec     | float, 1.5sec   | float, 0.5sec   | "45 WPM avg"
                 | sound fanfare   |                 |                 |                 |
Badge display    | Big, animated,  | Medium badges,  | Compact badge   | List view,      | Text-based
                 | popup with Ki   | grid display    | grid + hover    | earned date     | achievement log
                 | narration       | + unlock anim   | detail          | shown           | (table format)
Leaderboard      | NOT SHOWN       | Class only,     | Global + class  | Global + class  | Global only,
                 | (too pressured) | all get medals  | competitive     | filter by time  | sortable table
Progress visual  | Path/map with   | Progress bar    | XP bar + level  | Percentage      | Numbers only:
                 | character        | with character  | badge in header | in settings     | WPM, accuracy,
                 | walking on it   | at current spot | + sidebar stats | page only       | time practiced
```

### 6.2 Celebration Component Variants

The `AchievementNotification` component at `src/components/gamification/achievement-notification.tsx` should be refactored into an age-adaptive wrapper:

```typescript
// src/components/gamification/age-celebration.tsx

interface CelebrationConfig {
  confetti: boolean
  confettiDuration: number        // ms
  confettiParticleCount: number
  screenFlash: boolean
  mascotReaction: boolean
  mascotSize: 'large' | 'medium' | 'small' | 'hidden'
  soundFanfare: boolean
  xpFloatAnimation: boolean
  toastOnly: boolean
  autoDissmissMs: number
}

const CELEBRATION_CONFIGS: Record<AgeName, CelebrationConfig> = {
  shatil: {
    confetti: true,
    confettiDuration: 3000,
    confettiParticleCount: 150,
    screenFlash: true,
    mascotReaction: true,
    mascotSize: 'large',
    soundFanfare: true,
    xpFloatAnimation: true,
    toastOnly: false,
    autoDissmissMs: 5000,
  },
  nevet: {
    confetti: true,
    confettiDuration: 2000,
    confettiParticleCount: 80,
    screenFlash: false,
    mascotReaction: true,
    mascotSize: 'medium',
    soundFanfare: true,
    xpFloatAnimation: true,
    toastOnly: false,
    autoDissmissMs: 4000,
  },
  geza: {
    confetti: true,
    confettiDuration: 1500,
    confettiParticleCount: 50,
    screenFlash: false,
    mascotReaction: true,
    mascotSize: 'small',
    soundFanfare: true,
    xpFloatAnimation: true,
    toastOnly: false,
    autoDissmissMs: 3000,
  },
  anaf: {
    confetti: false,
    confettiDuration: 0,
    confettiParticleCount: 0,
    screenFlash: false,
    mascotReaction: false,
    mascotSize: 'hidden',
    soundFanfare: false,
    xpFloatAnimation: true,
    toastOnly: true,
    autoDissmissMs: 2000,
  },
  tzameret: {
    confetti: false,
    confettiDuration: 0,
    confettiParticleCount: 0,
    screenFlash: false,
    mascotReaction: false,
    mascotSize: 'hidden',
    soundFanfare: false,
    xpFloatAnimation: false,
    toastOnly: true,
    autoDissmissMs: 1500,
  },
}
```

### 6.3 Teacher/Admin Gamification

Teachers see a different gamification layer entirely:

```
- No personal XP/levels/badges
- Class-level metrics:
  - "Class average WPM this week: 32 (up 4)"
  - "Students meeting targets: 18/24 (75%)"
  - "Struggling students: 3 (need attention)"
- Student comparison table (anonymous option for display to class)
- Weekly class challenges:
  - "If class average reaches 35 WPM, unlock group reward"
- Export buttons for every data view (CSV, PDF)
- Color-coded heat maps:
  - Green = on track
  - Yellow = needs encouragement
  - Red = falling behind
```

---

## 7. Implementation Strategy

### 7.1 Architecture: CSS-First with Component Variants

The strategy uses three layers:

**Layer 1: CSS Custom Properties (what changes with just CSS)**
- Colors, backgrounds, shadows, glows, border styles
- Font sizes, weights, line heights
- Spacing, padding, border-radius
- Animation durations, easing
- Glow/neon opacity (0 or 1)

**Layer 2: Data-Attribute Conditional CSS (what changes with CSS selectors)**
- Visibility of elements (`[data-theme='tzameret'] .mascot { display: none }`)
- Number of grid columns
- Transition behavior

**Layer 3: Component Variants (what needs React logic)**
- Navigation structure (3 tabs vs 5 tabs vs horizontal bar)
- Which character to render and where
- Celebration behavior (confetti vs toast)
- Speech bubble frequency timer
- Dashboard content (map vs cards vs data table)
- Sound synthesis parameters

### 7.2 Implementation of Layer 1: Extended CSS Variables

**File: `src/styles/css/theme-vars.css`**

Expand from the current 4 variables to the full set. All gaming utility classes in `globals.css` should reference these variables instead of hardcoded values:

```css
/* Before (hardcoded in globals.css) */
.game-bg {
  background-color: #0d0b1a;
  background-image:
    radial-gradient(ellipse at 20% 50%, oklch(0.3 0.08 292 / 15%) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, oklch(0.3 0.06 168 / 10%) 0%, transparent 50%);
}

/* After (variable-driven) */
.game-bg {
  background-color: var(--theme-bg);
  background-image: var(--theme-bg-pattern, none);
}

[data-theme='shatil'] {
  --theme-bg-pattern: linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 100%);
}
[data-theme='geza'] {
  --theme-bg-pattern:
    radial-gradient(ellipse at 20% 50%, oklch(0.3 0.08 292 / 15%) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, oklch(0.3 0.06 168 / 10%) 0%, transparent 50%);
}
[data-theme='tzameret'] {
  --theme-bg-pattern: none;
}
```

**Hardcoded values to replace in `globals.css`:**

| Current hardcoded value | Replace with |
|------------------------|--------------|
| `#0d0b1a` (background) | `var(--theme-bg)` |
| `#080618` (sidebar) | `var(--theme-bg-secondary)` |
| `oklch(0.25 0.04 292)` (borders) | `var(--theme-card-border)` |
| `oklch(0.13 0.025 290)` (cards) | `var(--theme-card-bg)` |
| Neon glow box-shadows | Wrap in `calc(var(--theme-glow-intensity) * ...)` or conditional class |
| `text-gray-300`, `text-gray-400` | `var(--theme-text-muted)` |

**Hardcoded values to replace in layout components:**

| File | Current | Replace with |
|------|---------|-------------|
| `sidebar.tsx:68` | `bg-[#080618]` | `bg-[var(--theme-bg-secondary)]` |
| `sidebar.tsx:80` | `bg-[#0c0a20]` | `bg-[var(--theme-card-bg)]` |
| `header.tsx:16` | `bg-[#0d0b1a]/90` | `bg-[var(--theme-bg)]/90` |
| `bottom-tabs.tsx:73` | `bg-[#0d0b1a]/95` | `bg-[var(--theme-bg)]/95` |
| `home-client.tsx:168` | `style={{ background: '#0d0b1a' }}` | Use CSS variable |

### 7.3 Implementation of Layer 2: Attribute Selectors

**File: `src/styles/css/theme-adaptive.css`** (new file)

```css
/* === Character visibility by theme === */
[data-theme='tzameret'] [data-role='mascot'] {
  display: none !important;
}

[data-theme='anaf'] [data-role='mascot'] {
  max-width: 32px;
  max-height: 32px;
}

[data-theme='shatil'] [data-role='mascot'] {
  max-width: 120px;
  max-height: 120px;
}

/* === Glow effects off for light themes === */
[data-theme='shatil'] .neon-text-purple,
[data-theme='shatil'] .neon-text-green,
[data-theme='nevet'] .neon-text-purple,
[data-theme='nevet'] .neon-text-green {
  text-shadow: none;
}

[data-theme='shatil'] .hero-glow-border,
[data-theme='nevet'] .hero-glow-border {
  animation: none;
  border-color: var(--theme-card-border);
}

[data-theme='shatil'] .game-section-title,
[data-theme='nevet'] .game-section-title {
  background: none;
  -webkit-text-fill-color: inherit;
  color: var(--theme-text);
}

/* === Navigation density === */
[data-theme='shatil'] .bottom-tabs-nav {
  height: 72px;
}

[data-theme='tzameret'] .bottom-tabs-nav {
  height: 48px;
}

/* === Card styling by theme === */
[data-theme='shatil'] .game-card-border {
  border: none;
  border-radius: 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  background: white;
}

[data-theme='shatil'] .game-card-border:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: transparent;
  transform: translateY(-2px);
}

[data-theme='tzameret'] .game-card-border {
  border: 1px solid #333;
  border-radius: 0.25rem;
  background: #1e1e1e;
  box-shadow: none;
}

[data-theme='tzameret'] .game-card-border:hover {
  border-color: #555;
  box-shadow: none;
  transform: none;
}
```

### 7.4 Implementation of Layer 3: Component Variants

#### 7.4.1 Age-Adaptive Hook

**File: `src/hooks/use-age-config.ts`** (new)

```typescript
import { useThemeStore } from '@/stores/theme-store'
import { useMemo } from 'react'
import type { AgeName } from '@/types/theme'

export interface AgeConfig {
  // Character
  showMascot: boolean
  mascotSize: 'large' | 'medium' | 'small' | 'tiny' | 'hidden'
  speechBubbleInterval: number   // ms, 0 = disabled
  characterPositionStyle: 'center' | 'beside-content' | 'corner-float' | 'header-icon' | 'hidden'

  // Navigation
  bottomTabCount: 3 | 4 | 5
  showSidebar: boolean
  showBottomTabs: boolean
  sidebarCollapsible: boolean
  showKeyboardShortcuts: boolean
  showCommandPalette: boolean

  // Gamification
  showXpAsStars: boolean         // shatil: stars instead of numbers
  showLeaderboard: boolean
  showBattleMode: boolean
  celebrationIntensity: 'maximum' | 'high' | 'medium' | 'low' | 'minimal'
  progressVisualization: 'map' | 'bar-with-character' | 'bar' | 'percentage' | 'numbers'

  // Visual
  defaultColorScheme: 'default' | 'dark'
  enableGlowEffects: boolean
  enableGradientText: boolean
  enableCardShine: boolean
  animationDurationMultiplier: number  // 1.5 for shatil, 1 for geza, 0.3 for tzameret

  // Sound
  defaultSoundEnabled: boolean
  defaultSoundVolume: number
  soundProfile: 'gentle' | 'playful' | 'gaming' | 'minimal' | 'silent'
}

const AGE_CONFIGS: Record<AgeName, AgeConfig> = {
  shatil: {
    showMascot: true,
    mascotSize: 'large',
    speechBubbleInterval: 30000,
    characterPositionStyle: 'beside-content',
    bottomTabCount: 3,
    showSidebar: false,
    showBottomTabs: true,
    sidebarCollapsible: false,
    showKeyboardShortcuts: false,
    showCommandPalette: false,
    showXpAsStars: true,
    showLeaderboard: false,
    showBattleMode: false,
    celebrationIntensity: 'maximum',
    progressVisualization: 'map',
    defaultColorScheme: 'default',
    enableGlowEffects: false,
    enableGradientText: false,
    enableCardShine: false,
    animationDurationMultiplier: 1.5,
    defaultSoundEnabled: true,
    defaultSoundVolume: 0.6,
    soundProfile: 'gentle',
  },
  nevet: {
    showMascot: true,
    mascotSize: 'medium',
    speechBubbleInterval: 60000,
    characterPositionStyle: 'corner-float',
    bottomTabCount: 4,
    showSidebar: false,
    showBottomTabs: true,
    sidebarCollapsible: false,
    showKeyboardShortcuts: false,
    showCommandPalette: false,
    showXpAsStars: false,
    showLeaderboard: true,
    showBattleMode: true,
    celebrationIntensity: 'high',
    progressVisualization: 'bar-with-character',
    defaultColorScheme: 'default',
    enableGlowEffects: false,
    enableGradientText: false,
    enableCardShine: false,
    animationDurationMultiplier: 1.2,
    defaultSoundEnabled: true,
    defaultSoundVolume: 0.7,
    soundProfile: 'playful',
  },
  geza: {
    showMascot: true,
    mascotSize: 'small',
    speechBubbleInterval: 0,
    characterPositionStyle: 'corner-float',
    bottomTabCount: 5,
    showSidebar: true,
    showBottomTabs: true,
    sidebarCollapsible: false,
    showKeyboardShortcuts: false,
    showCommandPalette: false,
    showXpAsStars: false,
    showLeaderboard: true,
    showBattleMode: true,
    celebrationIntensity: 'medium',
    progressVisualization: 'bar',
    defaultColorScheme: 'dark',
    enableGlowEffects: true,
    enableGradientText: true,
    enableCardShine: true,
    animationDurationMultiplier: 1.0,
    defaultSoundEnabled: true,
    defaultSoundVolume: 0.7,
    soundProfile: 'gaming',
  },
  anaf: {
    showMascot: true,
    mascotSize: 'tiny',
    speechBubbleInterval: 0,
    characterPositionStyle: 'header-icon',
    bottomTabCount: 5,
    showSidebar: true,
    showBottomTabs: true,
    sidebarCollapsible: true,
    showKeyboardShortcuts: true,
    showCommandPalette: false,
    showXpAsStars: false,
    showLeaderboard: true,
    showBattleMode: true,
    celebrationIntensity: 'low',
    progressVisualization: 'percentage',
    defaultColorScheme: 'dark',
    enableGlowEffects: false,
    enableGradientText: false,
    enableCardShine: false,
    animationDurationMultiplier: 0.6,
    defaultSoundEnabled: true,
    defaultSoundVolume: 0.5,
    soundProfile: 'minimal',
  },
  tzameret: {
    showMascot: false,
    mascotSize: 'hidden',
    speechBubbleInterval: 0,
    characterPositionStyle: 'hidden',
    bottomTabCount: 3,
    showSidebar: false,
    showBottomTabs: true,
    sidebarCollapsible: false,
    showKeyboardShortcuts: true,
    showCommandPalette: true,
    showXpAsStars: false,
    showLeaderboard: true,
    showBattleMode: true,
    celebrationIntensity: 'minimal',
    progressVisualization: 'numbers',
    defaultColorScheme: 'dark',
    enableGlowEffects: false,
    enableGradientText: false,
    enableCardShine: false,
    animationDurationMultiplier: 0.3,
    defaultSoundEnabled: false,
    defaultSoundVolume: 0.0,
    soundProfile: 'silent',
  },
}

export function useAgeConfig(): AgeConfig {
  const ageName = useThemeStore((s) => s.ageName)
  return useMemo(() => AGE_CONFIGS[ageName], [ageName])
}

export function getAgeConfig(ageName: AgeName): AgeConfig {
  return AGE_CONFIGS[ageName]
}
```

#### 7.4.2 Adaptive AppShell

**File: `src/components/layout/app-shell.tsx`** (modified)

```typescript
'use client'

import { useAgeConfig } from '@/hooks/use-age-config'
import { ShatilNavigation } from './navigation/shatil-nav'
import { StandardNavigation } from './navigation/standard-nav'
import { CompactNavigation } from './navigation/compact-nav'
import { ProNavigation } from './navigation/pro-nav'
import { PageTransition } from '@/components/transitions/page-transition'

export function AppShell({ children }: { children: React.ReactNode }) {
  const config = useAgeConfig()

  // Select navigation variant based on age config
  if (config.bottomTabCount === 3 && !config.showSidebar && !config.showKeyboardShortcuts) {
    // Shatil: Big tabs, no sidebar, simplified
    return <ShatilNavigation>{children}</ShatilNavigation>
  }

  if (config.showCommandPalette) {
    // Tzameret: Horizontal top nav, command palette, minimal
    return <ProNavigation>{children}</ProNavigation>
  }

  if (config.sidebarCollapsible) {
    // Anaf: Collapsible sidebar, compact nav
    return <CompactNavigation>{children}</CompactNavigation>
  }

  // Nevet & Geza: Standard layout (current design, parameterized)
  return <StandardNavigation>{children}</StandardNavigation>
}
```

#### 7.4.3 Adaptive Home Page

The home page is the most critical page to differentiate by age. Rather than one massive component, split into age-specific compositions:

```
src/components/home/
  shatil-home.tsx    - Map/path view, large Ki, big CTA, stars
  nevet-home.tsx     - Adventure card view, character companions, badges
  geza-home.tsx      - Current gaming dashboard (refactored from home-client.tsx)
  anaf-home.tsx      - Clean dashboard, WPM chart primary, compact stats
  tzameret-home.tsx  - Minimal: typing area or pure data dashboard
  home-router.tsx    - Reads ageName, renders correct variant
```

This avoids a single component with 50 conditionals. Each variant imports shared sub-components (stat cards, progress charts) but composes them differently.

### 7.5 Extended AgeTheme Type

**File: `src/types/theme.ts`** (modified)

```typescript
export type AgeName = 'shatil' | 'nevet' | 'geza' | 'anaf' | 'tzameret'
export type UserRole = 'student' | 'teacher' | 'parent'

export type ColorScheme = 'default' | 'dark' | 'high-contrast' | 'dark-high-contrast'

export type AnimationIntensity = 'playful' | 'standard' | 'subtle' | 'minimal' | 'none'
export type CelebrationLevel = 'maximum' | 'high' | 'medium' | 'low' | 'minimal'
export type CharacterSize = 'large' | 'medium' | 'small' | 'tiny' | 'hidden'
export type NavDensity = 'spacious' | 'standard' | 'compact' | 'minimal'

export interface AgeTheme {
  name: AgeName
  label: string
  emoji: string
  ageRange: [number, number]

  // Layout
  borderRadius: string
  fontScale: number
  buttonSize: 'sm' | 'default' | 'lg'
  buttonHeight: number
  spacing: 'compact' | 'default' | 'spacious'

  // Visual atmosphere
  defaultScheme: ColorScheme          // NEW
  enableGlowEffects: boolean          // NEW
  enableGradientText: boolean         // NEW

  // Animation
  animations: AnimationIntensity
  animationDurationScale: number      // NEW: multiplier for all durations

  // Character
  defaultCharacterSize: CharacterSize // NEW
  showSpeechBubbles: boolean          // NEW

  // Gamification
  celebrationLevel: CelebrationLevel  // NEW
  showXpAsStars: boolean              // NEW

  // Navigation
  navDensity: NavDensity              // NEW
  maxBottomTabs: number               // NEW
}

export interface ThemeConfig {
  age: AgeTheme
  colorScheme: ColorScheme
  role: UserRole                       // NEW
}
```

---

## 8. Detailed Page-by-Page Adaptation

### 8.1 Home Page

| Aspect | Shatil | Nevet | Geza | Anaf | Tzameret |
|--------|--------|-------|------|------|----------|
| Hero | Ki character walking on a path, speech bubble saying "!בוא נתחיל", warm gradient bg, no stats | Character with backpack, "Adventure continues!" speech, moderate gradient, streak flame | Dark gaming hero with bg image, Ki small in corner, XP bar, neon border glow | Clean card with WPM trend sparkline, no hero image, compact | No hero. Just inline stats row: WPM / Accuracy / Streak |
| Stats | Star collection (visual, not numbers). "5 stars collected today!" | 4 stat cards with friendly icons and colors | 4 stat cards with neon glow + gradient borders (current) | Horizontal stat pills in a single row | Single line: "45 WPM / 96% acc / 12d streak" |
| CTA | One giant button: "!בוא נשחק" taking full width, rounded, bouncy hover | "Continue adventure" button with arrow + lesson name | "Continue Lesson: X" gaming button with gradient (current) | Compact "Continue: X" button, secondary style | Auto-start last practice, or "Start typing" link |
| Quick links | 2 big cards: "Practice" + "Games" only. Illustrated with characters | 4 cards: Lessons, Games, Speed, Badges | 6 cards in grid (current) | 6 items as text pills with icons | Not shown (command palette instead) |
| Progress | Map/path with character position marker showing 5 lesson "islands" | Progress bar with character at current position | XP bar + level badge (current) | Percentage ring chart | WPM line chart, full width |

### 8.2 Lesson Page (Typing Area)

| Aspect | Shatil | Nevet | Geza | Anaf | Tzameret |
|--------|--------|-------|------|------|----------|
| Character | Sensei Zen (large) beside typing area, reacting to each keystroke | Sensei Zen (medium) in top corner, reacts to milestones | Ki (small) corner, reacts on complete | No character | No character |
| Text display | Extra large (1.25rem+), generous spacing, short words (3-4 chars), 2-3 words per line | Large (1.1rem), standard spacing, short sentences | Standard (1rem), full sentences (current) | Standard (1rem), longer passages | Slightly small (0.9rem), dense text, monospace option |
| Keyboard visual | Large, colorful zones, animated finger guide always on, big keys | Standard, color zones, finger guide default on | Standard, zones optional (current) | Compact, monochrome, finger guide off by default | No visual keyboard by default (toggle available) |
| Error feedback | Key turns orange (not red), Noa appears briefly saying "!ננסה שוב", gentle shake | Key turns red briefly, 2x shake | Key turns red, 1x shake, flash (current) | Red underline only, no shake | Red underline, no animation |
| Correct feedback | Key sparkles green, star flies up to collection, sound chime | Brief green flash, soft ding | Color flash (current) | No visual feedback beyond cursor advancing | Cursor advance only |
| Speed indicator | Not shown (too pressuring for young kids) | Shown as gentle speedometer visual | WPM number, updating live (current) | WPM number, compact | WPM + accuracy, live, with graph |

### 8.3 Battle Mode

| Aspect | Shatil | Nevet | Geza | Anaf | Tzameret |
|--------|--------|-------|------|------|----------|
| Availability | HIDDEN from navigation | Unlocks at level 5, "Friendly Match" framing | Full battle mode (current) | Full battle mode, competitive stats | Available, minimal UI |
| Opponent display | N/A | Character full body, name, level | Character + health bar + typing speed (current) | Text name + WPM number only | Just WPM comparison bar |
| Outcome | N/A | "You both did great!" framing, both get stars | Winner/loser with XP rewards (current) | Win/lose + stats comparison table | Stats table, WPM delta, accuracy |
| Character | N/A | Kai (medium) cheering you on | Kai (small) in corner | No character | No character |

---

## 9. Implementation Priority Order

### Phase 1: CSS Variable Foundation (1-2 weeks)
**Impact: Medium. Foundation for everything else.**

1. Expand `theme-vars.css` with full variable set for all 5 themes (~25 variables each)
2. Replace ALL hardcoded colors in `globals.css` gaming utilities with CSS variables
3. Replace hardcoded colors in `sidebar.tsx`, `header.tsx`, `bottom-tabs.tsx`, `home-client.tsx`
4. Create `theme-adaptive.css` with `[data-theme]` conditional rules
5. Update `ThemeProvider` to also set `--theme-bg`, `--theme-card-bg`, etc. as inline styles (or rely on CSS selectors)

**Result**: Changing theme in settings immediately changes the entire color atmosphere without touching any React component.

### Phase 2: Character Visibility System (1 week)
**Impact: High. Characters appearing/hiding per age is the most noticeable change.**

1. Add `data-role="mascot"` attributes to all character elements
2. Create `use-age-config.ts` hook
3. Wrap `KiMascot` in an `AgeMascot` component that reads config and conditionally renders
4. Add character size variants to `KiMascot` (`tiny` = 24px circle, `hidden` = null)
5. CSS rules to hide/resize mascot per theme

**Result**: Shatil shows big Ki, Tzameret shows nothing.

### Phase 3: Navigation Variants (2 weeks)
**Impact: High. Different nav structures per age changes the entire feel.**

1. Create `ShatilNavigation` (3 big tabs, no sidebar)
2. Create `ProNavigation` for Tzameret (horizontal top bar, command palette)
3. Create `CompactNavigation` for Anaf (collapsible sidebar)
4. Modify `AppShell` to route to correct variant based on `useAgeConfig()`
5. Parameterize `BottomTabs` for tab count and icon size

**Result**: 6-year-old sees 3 big friendly tabs. 16-year-old sees a clean horizontal bar.

### Phase 4: Home Page Variants (2 weeks)
**Impact: Highest. This is the page users see first and most often.**

1. Extract shared components from `home-client.tsx` (stat cards, progress chart, quick links)
2. Create `ShatilHome` (path map, big Ki, stars, giant CTA)
3. Create `TzameretHome` (pure data dashboard or instant typing start)
4. Create `AnafHome` (clean dashboard, WPM primary)
5. Create `HomeRouter` that delegates to correct variant
6. Refactor current `home-client.tsx` into `GezaHome`

**Result**: Completely different home experience per age.

### Phase 5: Celebration & Gamification Adaptation (1 week)
**Impact: Medium. Affects emotional experience significantly.**

1. Create `CelebrationConfig` record per age
2. Refactor `AchievementNotification` to use config
3. Create confetti/star-burst/toast variants
4. Parameterize XP display (stars vs numbers)
5. Sound profile per age in `SoundManager`

**Result**: Shatil gets full confetti explosions, Tzameret gets a subtle toast.

### Phase 6: Animation Intensity System (1 week)
**Impact: Medium. Polishes the feel per age.**

1. Create `useAnimationConfig()` hook that returns duration multipliers
2. Apply multiplier to all `framer-motion` transitions via a wrapper
3. Disable `whileHover` scale effects for Anaf/Tzameret
4. Remove stagger delays for Tzameret

**Result**: Animations feel age-appropriate instead of universally "gamey".

### Phase 7: Typing Area Adaptation (1-2 weeks)
**Impact: High. This is the core activity.**

1. Scale text size per age theme
2. Character presence beside typing area for Shatil/Nevet
3. Error/correct feedback intensity per age
4. WPM display visibility per age (hidden for Shatil)
5. Visual keyboard size and complexity per age

**Result**: 6-year-old sees large text, helpful Sensei, and star rewards. 16-year-old sees dense text and a WPM counter.

### Phase 8: Teacher/Parent Dashboards (2-3 weeks)
**Impact: Medium (new audience). Enables growth beyond student-only.**

1. Add `role` to user profile / theme store
2. Create Teacher layout with data-focused sidebar
3. Create Student list / progress table views
4. Create Parent overview with simplified progress view
5. Role-based route protection

**Result**: Teachers see a professional class management tool, not a kids' game.

---

## 10. Migration Checklist for Existing Hardcoded Values

Every file that needs modification to support adaptive theming:

### Critical (blocks everything)
- [ ] `src/styles/css/theme-vars.css` - Expand from 4 to 25+ variables per theme
- [ ] `src/app/globals.css` - Replace all `#0d0b1a`, `#080618`, `oklch(0.25...)` with `var(--theme-*)`
- [ ] `src/types/theme.ts` - Expand `AgeTheme` interface

### High Priority (most visible)
- [ ] `src/components/layout/sidebar.tsx` - Remove hardcoded `bg-[#080618]`, `bg-[#0c0a20]`, `border-[oklch(...)]`
- [ ] `src/components/layout/header.tsx` - Remove hardcoded `bg-[#0d0b1a]/90`, `border-[oklch(...)]`
- [ ] `src/components/layout/bottom-tabs.tsx` - Remove hardcoded `bg-[#0d0b1a]/95`, `border-[oklch(...)]`
- [ ] `src/components/layout/app-shell.tsx` - Add age-adaptive navigation routing
- [ ] `src/app/(app)/home/home-client.tsx` - Remove hardcoded `style={{ background: '#0d0b1a' }}`
- [ ] `src/components/providers/theme-provider.tsx` - Set more CSS variables, set default color scheme per age

### Medium Priority (enhances experience)
- [ ] `src/components/mascot/ki-mascot.tsx` - Add `tiny` and `hidden` size variants
- [ ] `src/components/gamification/achievement-notification.tsx` - Age-adaptive celebration
- [ ] `src/lib/audio/sound-manager.ts` - Add `setSoundProfile()` method
- [ ] `src/lib/audio/sounds.ts` - Multiple sound parameter sets per profile
- [ ] `src/components/ui/game-card.tsx` - Respect `--theme-glow-intensity`
- [ ] `src/stores/theme-store.ts` - Add `role: UserRole` field

### Low Priority (polish)
- [ ] All page components under `src/app/(app)/` - Remove hardcoded gaming class usage where inappropriate
- [ ] `src/components/typing/typing-area.tsx` - Text size and character feedback per age
- [ ] `src/components/typing/lesson-view.tsx` - Speed indicator visibility per age
- [ ] `src/components/statistics/progress-chart.tsx` - Chart style per age (friendly vs data-dense)

---

## 11. Testing Strategy

### Visual Regression
Each theme switch should be screenshot-tested at key pages:
- Home page x 5 themes = 5 screenshots
- Lesson page x 5 themes = 5 screenshots
- Battle page x 3 themes (not shown in shatil) = 3 screenshots

### Accessibility per Theme
- Shatil light theme: contrast ratio check (WCAG AA large text is sufficient for ages 6-8)
- Tzameret dark theme: contrast ratio check (WCAG AA standard text)
- All themes: keyboard navigation still works
- All themes: screen reader announces the same content

### E2E Test Matrix
Existing E2E tests should be parameterized to run with at least 3 themes:
- `shatil` (light, large, young)
- `geza` (dark, standard, current default)
- `tzameret` (dark, compact, mature)

This catches layout breakage, missing elements, and navigation routing issues.

---

## 12. Summary: What Changes vs What Stays

### Stays the Same Across All Ages
- Core typing engine (pure functions)
- Lesson content and curriculum
- Backend/Supabase schema
- Authentication flow
- RTL layout direction
- Hebrew font families (Heebo, Assistant, Inter)
- Brand colors (purple #6C5CE7, green #00B894) - used as accent, not as full palette
- Accessibility fundamentals (focus visible, aria labels, skip nav)
- Zustand store architecture
- Sound synthesis engine (parameters change, architecture stays)

### Changes Radically Per Age
- Background color and atmosphere (light cream vs dark neon vs clean dark)
- Character presence, size, position, and frequency
- Navigation structure (3 tabs vs full sidebar vs horizontal bar)
- Celebration intensity (confetti vs toast)
- Animation speed and presence
- Typography scale and weight
- Card styling (soft shadows vs neon borders vs clean borders)
- Gamification framing (stars vs XP vs milestones)
- Sound profile (gentle vs gaming vs silent)
- Home page composition (map vs cards vs data dashboard)
- Information density (sparse vs dense)
