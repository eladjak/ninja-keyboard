# Ninja Keyboard — Chrome MCP Review Sprint

**Project:** Ninja Keyboard (נינג'ה מקלדת) — Hebrew touch-typing app for kids ages 6-16
**Framework:** Next.js 15 (App Router) + React 19 + TypeScript strict
**i18n:** next-intl, Hebrew-first RTL
**Brand colors:** Primary `#6C5CE7` (purple), Secondary `#00B894` (green)
**Last iteration:** 14 (2026-03-22)

---

## 1. URL

| Environment | URL |
|-------------|-----|
| **Local dev** | `http://localhost:3000` |

**Start the dev server first:**
```bash
cd ~/projects/ninja-keyboard
npm run dev
```

---

## 2. Chrome MCP Setup

Load tools via ToolSearch before use:
```
ToolSearch: "select:mcp__claude-in-chrome__navigate"
ToolSearch: "select:mcp__claude-in-chrome__computer"
ToolSearch: "select:mcp__claude-in-chrome__read_console_messages"
ToolSearch: "select:mcp__claude-in-chrome__resize_window"
ToolSearch: "select:mcp__claude-in-chrome__javascript_tool"
```

---

## 3. Global Checks (Run on Every Page)

### RTL Verification (CRITICAL — entire app must be RTL)
```javascript
// Run via mcp__claude-in-chrome__javascript_tool
document.documentElement.dir === 'rtl' && document.documentElement.lang === 'he'
```

**CSS logical properties check** — the project mandates logical CSS only (no `ml-`, `pl-`, `left-`). If any of these appear in rendered styles it's a bug:
```javascript
Array.from(document.querySelectorAll('*'))
  .map(el => getComputedStyle(el))
  .filter(s => s.marginLeft !== s.marginRight)  // flag asymmetric margins
  .length
```

### Theme Verification
Ninja Keyboard has 5 age-based themes:
| Theme | Age | Expected Look |
|-------|-----|---------------|
| `shatil` | 6-8 | Very playful, large fonts, bright colors |
| `nevet` | 8-10 | Playful, rounded, colorful |
| `geza` | 10-12 | Balanced, game-like |
| `anaf` | 12-14 | More serious, competitive |
| `tzameret` | 14-16+ | Near-adult, professional |

Check which theme is active and whether colors/fonts match the theme spec.

### Console Errors
```
mcp__claude-in-chrome__read_console_messages
```
Expected: 0 errors. TypeScript strict is enabled — any runtime type errors are bugs.

### Responsiveness Breakpoints
```
mcp__claude-in-chrome__resize_window({ width: 390, height: 844 })   // mobile
mcp__claude-in-chrome__resize_window({ width: 768, height: 1024 })  // tablet
mcp__claude-in-chrome__resize_window({ width: 1280, height: 800 })  // desktop
```

---

## 4. Page-by-Page Review

### Auth Routes (`/auth/`)

#### Login
**URL:** `http://localhost:3000/login`
**Check:**
- [ ] Hebrew RTL layout, Heebo font
- [ ] Email + password fields RTL-aligned
- [ ] "כניסה" (Login) button visible, purple `#6C5CE7`
- [ ] "Google" OAuth button present (if configured)
- [ ] "הירשם" (Register) link present
- [ ] "שכחתי סיסמה" (Forgot password) link present
- [ ] Error messages in Hebrew
- [ ] Form accessible via Tab key

#### Register
**URL:** `http://localhost:3000/register`
**Check:**
- [ ] All form fields RTL
- [ ] Role selector: תלמיד/מורה/הורה (Student/Teacher/Parent) in Hebrew
- [ ] Password confirmation field
- [ ] Terms acceptance checkbox with Hebrew label

#### Join (Class Code)
**URL:** `http://localhost:3000/join`
**Check:**
- [ ] Class code input centered and large (for kids)
- [ ] Hebrew instructions visible
- [ ] Accessible for young children (large touch targets ≥ 44px)

#### Student Setup (Onboarding)
**URL:** `http://localhost:3000/student-setup`
**Check:**
- [ ] Age/grade selector renders in Hebrew
- [ ] Theme preview changes based on age selection
- [ ] Friendly illustrations/character present
- [ ] "בואו נתחיל" (Let's start) CTA button

---

### App Routes (`/app/` — Protected)

#### Home Dashboard
**URL:** `http://localhost:3000/home`
**Priority:** CRITICAL
**Check:**
- [ ] Ninja character visible (Yuki or current active character)
- [ ] Streak counter displayed with flame icon
- [ ] XP bar with Hebrew label
- [ ] "שיעור הבא" (Next Lesson) card prominent
- [ ] Recent achievements section
- [ ] Navigation sidebar RTL (on right side)
- [ ] Primary color `#6C5CE7` used for active states

#### Lessons
**URL:** `http://localhost:3000/lessons`
**Priority:** CRITICAL
**Check:**
- [ ] Lesson categories in Hebrew (rows, home row, etc.)
- [ ] Progress indicators per lesson (complete/in-progress/locked)
- [ ] Age-appropriate styling matches active theme
- [ ] Lock icons on future lessons (logical, not confusing for kids)
- [ ] XP reward labels on lesson cards

#### Active Lesson / Typing Practice
**URL:** `http://localhost:3000/lessons/[id]`
**Priority:** CRITICAL (this is the core gameplay)
**Check:**
- [ ] Keyboard visualization renders correctly (Hebrew layout shown)
- [ ] Target key highlight in `#6C5CE7`
- [ ] Finger guide shown on correct finger
- [ ] WPM/accuracy counter in Hebrew format
- [ ] Timer (if present) RTL direction
- [ ] Typed text vs target text: correct/incorrect character highlighting
- [ ] Sound effects trigger on correct/incorrect keys (if audio enabled)
- [ ] Ninja character animates on success

#### Battle Mode
**URL:** `http://localhost:3000/battle`
**Priority:** HIGH
**Check:**
- [ ] Opponent selection in Hebrew
- [ ] Race track / progress bar RTL direction (progress fills right-to-left)
- [ ] WPM counters for both players
- [ ] Victory/defeat animations render
- [ ] Rematch button in Hebrew

#### Progress
**URL:** `http://localhost:3000/progress`
**Priority:** HIGH
**Check:**
- [ ] Charts/graphs render (Recharts or similar)
- [ ] Hebrew axis labels on charts
- [ ] Date format: Hebrew or ISO (not US format)
- [ ] WPM over time graph
- [ ] Accuracy over time graph
- [ ] "שיפור" (Improvement) stats in Hebrew

#### Profile
**URL:** `http://localhost:3000/profile`
**Priority:** HIGH
**Check:**
- [ ] User avatar/character display
- [ ] Level badge + XP progress
- [ ] Achievements/badges grid with Hebrew names
- [ ] Stats summary (total sessions, best WPM, etc.) in Hebrew
- [ ] Edit profile button works

#### Settings
**URL:** `http://localhost:3000/settings`
**Priority:** MEDIUM
**Check:**
- [ ] Language selector: Hebrew/English toggle
- [ ] Theme selector: 5 age themes selectable
- [ ] Audio on/off toggle RTL-aligned
- [ ] Keyboard layout selector
- [ ] Notification preferences
- [ ] All labels in Hebrew

#### Leaderboard
**URL:** `http://localhost:3000/leaderboard`
**Priority:** MEDIUM
**Check:**
- [ ] Ranking table RTL
- [ ] Podium (top 3) renders correctly
- [ ] Current user highlighted
- [ ] WPM and accuracy columns labeled in Hebrew
- [ ] "אני" or similar label for current user row

#### Onboarding
**URL:** `http://localhost:3000/onboarding`
**Priority:** HIGH (first-run experience)
**Check:**
- [ ] Step-by-step wizard RTL
- [ ] Character introduction (Yuki ninja) renders
- [ ] Age selection updates theme preview in real-time
- [ ] Keyboard placement tutorial illustration
- [ ] Progress dots/steps visible

#### Placement Test
**URL:** `http://localhost:3000/placement`
**Priority:** HIGH
**Check:**
- [ ] Instructions in Hebrew
- [ ] Test keyboard renders correctly
- [ ] Results screen shows skill level in Hebrew

#### Shortcuts Page
**URL:** `http://localhost:3000/shortcuts`
**Priority:** MEDIUM
**Check:**
- [ ] Keyboard shortcut list renders with Hebrew descriptions
- [ ] Windows shortcuts shown (Ctrl+C, etc.)
- [ ] RTL layout: key labels on right, descriptions on left (or appropriate RTL order)

#### Speed Test
**URL:** `http://localhost:3000/speed-test`
**Priority:** MEDIUM
**Check:**
- [ ] Free-typing speed test paragraph in Hebrew
- [ ] Timer counts down in Hebrew numeral format (or standard)
- [ ] Results: WPM, accuracy shown with Hebrew labels

#### Story Mode
**URL:** `http://localhost:3000/story`
**Priority:** HIGH (narrative feature)
**Check:**
- [ ] Story panels/slides render
- [ ] Hebrew text in speech bubbles RTL
- [ ] Ninja character expressions/animations load
- [ ] "המשך" (Continue) button present
- [ ] Story progress saved

#### Games
**URL:** `http://localhost:3000/games`
**Priority:** MEDIUM
**Check:**
- [ ] Game selection cards with Hebrew titles
- [ ] Thumbnails/icons load (no broken images)
- [ ] Age-appropriate game options shown

#### Jukebox
**URL:** `http://localhost:3000/jukebox`
**Priority:** LOW (audio feature)
**Check:**
- [ ] Track list in Hebrew (holiday music titles)
- [ ] Play/pause controls work
- [ ] Track covers/artwork display (48 cover JPGs)
- [ ] Holiday category filter in Hebrew
- [ ] Volume control accessible

#### Badges
**URL:** `http://localhost:3000/badges`
**Priority:** MEDIUM
**Check:**
- [ ] Badge grid renders — no broken images (96 known art gaps from audit)
- [ ] Hebrew badge names and descriptions
- [ ] Earned vs locked visual distinction
- [ ] Badge categories in Hebrew

#### Certificates
**URL:** `http://localhost:3000/certificates`
**Priority:** LOW
**Check:**
- [ ] Certificate template renders with Hebrew content
- [ ] Student name populates correctly
- [ ] Print/download button present

#### Teacher Dashboard
**URL:** `http://localhost:3000/teacher`
**Priority:** HIGH (for teacher users)
**Check:**
- [ ] Class list in Hebrew
- [ ] Student progress table RTL
- [ ] Assign lesson feature works
- [ ] Export/report buttons present

#### Parent Report
**URL:** `http://localhost:3000/parent-report`
**Priority:** MEDIUM
**Check:**
- [ ] Summary statistics in Hebrew
- [ ] Child's progress timeline RTL
- [ ] Print-friendly layout

#### Tips
**URL:** `http://localhost:3000/tips`
**Priority:** LOW
**Check:**
- [ ] Typing tips in Hebrew, RTL
- [ ] Illustrations render

#### Statistics
**URL:** `http://localhost:3000/statistics`
**Priority:** MEDIUM
**Check:**
- [ ] Charts with Hebrew labels
- [ ] Date ranges in Hebrew format
- [ ] Filter controls in Hebrew

#### Accessibility
**URL:** `http://localhost:3000/accessibility`
**Priority:** LOW
**Check:**
- [ ] Accessibility settings panel
- [ ] Font size adjustment
- [ ] High contrast toggle

---

## 5. Known Issues (From Iteration 14 Audit Data)

From `docs/game-feedback-review.html` — 96 known gaps:
- **9 Critical** — treat these as blockers
- **33 High** — fix before marking sprint complete
- **48 Medium** — document and schedule
- **6 Low** — note only

The full gap list is in:
- `~/projects/ninja-keyboard/docs/game-feedback-review.html`
- `~/projects/ninja-keyboard/docs/art-audit.json` — art gaps
- `~/projects/ninja-keyboard/docs/audio-audit.json` — missing audio
- `~/projects/ninja-keyboard/docs/audit-data.json` — full audit data

**Before starting Chrome review**, open `docs/game-feedback-review.html` in a browser to know which issues are already tracked.

---

## 6. Fix Workflow

```bash
cd ~/projects/ninja-keyboard

# 1. TypeScript check
npm run typecheck

# 2. Run tests
npm run test

# 3. After fixing, verify build
npm run build
```

**RTL rule (MANDATORY):** Only use CSS logical properties:
- `ms-4` not `ml-4`
- `ps-4` not `pl-4`
- `start-0` not `left-0`
- `end-0` not `right-0`

---

## 7. Issue Log Template

```
## Issue #N
- **Page:** [URL]
- **Severity:** Critical / High / Medium / Low
- **Category:** Visual / RTL / i18n / a11y / Audio / Animation
- **Description:** [what is wrong]
- **Source file:** [component path if known]
- **Fix:** [what was changed]
- **Verified:** [ ] Yes
```

---

## 8. Chrome MCP Quick Reference

```javascript
// Navigate
mcp__claude-in-chrome__navigate({ url: "http://localhost:3000/lessons" })

// Screenshot
mcp__claude-in-chrome__computer({ action: "screenshot" })

// Check RTL
mcp__claude-in-chrome__javascript_tool({ script: "document.documentElement.dir" })

// Find broken images
mcp__claude-in-chrome__javascript_tool({
  script: "Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)"
})

// Check active theme class
mcp__claude-in-chrome__javascript_tool({
  script: "document.documentElement.className"
})

// Console errors
mcp__claude-in-chrome__read_console_messages({})

// Mobile viewport
mcp__claude-in-chrome__resize_window({ width: 390, height: 844 })

// Tab through elements (a11y)
mcp__claude-in-chrome__shortcuts_execute({ keys: "Tab" })
```
