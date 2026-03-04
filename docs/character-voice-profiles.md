# Ninja Keyboard -- Character Voice Profiles

**Version:** 1.0
**Date:** March 2026
**Engine:** ElevenLabs API (eleven_v3 model)
**Total Characters:** 14 (13 voiced + Pixel robot via Web Audio)

---

## Voice Design Philosophy

The Ninja Keyboard voice system follows these principles:

1. **Character-Speed Mapping**: Each character's speech speed reflects their personality -- fast characters speak faster, wise characters speak slower.
2. **Stability as Character Trait**: ElevenLabs stability parameter is used creatively -- Glitch has very low stability (0.2) to create unpredictable, stuttery speech, while Sensei Zen has high stability (0.7) for calm consistency.
3. **Hebrew-Native**: All lines are in Hebrew. The eleven_v3 model handles Hebrew well with these premade English voices.
4. **Age-Appropriate**: Voices are selected to match character ages -- younger characters use young-sounding voices, the old turtle master uses an elderly voice.

---

## Voice Profiles

### Heroes

#### 1. Ki (קי) -- Main Protagonist
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Liam (TX3LPaxmHKxFdv7VOQHJ) |
| **Voice Description** | Energetic, Social Media Creator |
| **Gender/Age** | Male, Young |
| **Character Age** | 10 years old |
| **Speed** | 1.1 (excited, enthusiastic) |
| **Stability** | 0.5 (balanced) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Liam's energetic, youthful quality captures Ki's brave enthusiasm. The slightly fast speed conveys his excitement about discovering the keyboard world. |
| **Voice Direction** | Bright, excited, adventurous. Think: a kid who just discovered something amazing. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `ki/ki-discovery.mp3` | !וואו! המקלדת הזו זוהרת | Lesson 1 pre -- discovering the glowing keyboard |
| `ki/ki-victory.mp3` | ...ניצחנו! אבל הוא ברח | Lesson 7 post -- defeating Bug mini-boss |
| `ki/ki-team.mp3` | !ביחד אנחנו חזקים יותר | Lesson 2 post -- team formation |
| `ki/ki-final.mp3` | !עכשיו אנחנו מוכנים | Lesson 14 post -- team united |

---

#### 2. Mika (מיקה) -- Tech Partner
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Jessica (cgSgspJ2msm6clMCkdW9) |
| **Voice Description** | Playful, Bright, Warm |
| **Gender/Age** | Female, Young |
| **Character Age** | 10 years old |
| **Speed** | 1.05 (slightly fast, confident) |
| **Stability** | 0.5 (balanced) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Jessica's playful brightness matches Mika's smart, confident personality. Not overly cute -- she's an equal partner, not a sidekick. |
| **Voice Direction** | Smart, confident, encouraging. The tech-savvy friend who always has a plan. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `mika/mika-intro.mp3` | !בוא ננסה ביחד, קי | Lesson 2 pre -- Mika's first appearance |
| `mika/mika-fight.mp3` | !לא ניתן לבאג לנצח | Lesson 6 pre -- rallying against Bug |
| `mika/mika-hack.mp3` | !בואי נפרוץ את המערכת | Lesson 17 pre -- hacking Bug's systems |

---

#### 3. Yuki (יוקי) -- Speed Specialist
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Laura (FGY2WhTYpPnrIDTdsKH5) |
| **Voice Description** | Enthusiast, Quirky Attitude |
| **Gender/Age** | Female, Young |
| **Character Age** | 11 years old |
| **Speed** | 1.2 (fast -- she's the speed character!) |
| **Stability** | 0.5 (balanced) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Laura's quirky enthusiasm perfectly matches Yuki's competitive, speedy nature. The 1.2 speed makes her noticeably faster than other characters. |
| **Voice Direction** | Quick, competitive, playful rivalry. Always challenging others to be faster. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `yuki/yuki-challenge.mp3` | !אני הכי מהירה בדוג'ו | Lesson 10 pre -- challenging the team |

---

#### 4. Luna (לונה) -- Focus & Patience
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Lily (pFZP5JQG7iQjIQuC4Bku) |
| **Voice Description** | Velvety Actress |
| **Gender/Age** | Female, Middle-aged (plays young) |
| **Character Age** | 10 years old |
| **Speed** | 0.9 (slow, calming) |
| **Stability** | 0.6 (slightly high -- consistent, steady) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Lily's velvety quality creates a serene, calming presence. The slow speed and higher stability give Luna a meditative feel -- the counterweight to the game's high energy. |
| **Voice Direction** | Serene, gentle, calming. Like a guided meditation for kids. Breathe in, breathe out. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `luna/luna-breathe.mp3` | ...נשימה עמוקה, ואז מתחילים | Lesson 11 pre -- teaching focus |

---

#### 5. Noa (נועה) -- Healer/Medic
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Sarah (EXAVITQu4vr4xnSDxMaL) |
| **Voice Description** | Mature, Reassuring, Confident |
| **Gender/Age** | Female, Young |
| **Character Age** | 9 years old |
| **Speed** | 0.95 (slightly slow, caring) |
| **Stability** | 0.6 (warm consistency) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Sarah's reassuring quality is perfect for the team's healer. Noa never judges mistakes -- she encourages and fixes. |
| **Voice Direction** | Warm, supportive, nurturing. "It's okay to make mistakes" energy. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `noa/noa-heal.mp3` | !אני כאן, לא נורא לטעות | Lesson 13 -- healer's reassurance |

---

#### 6. Kai (קאי) -- Fire Warrior
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Charlie (IKne3meq5aSn9XLyUdCD) |
| **Voice Description** | Deep, Confident, Energetic |
| **Gender/Age** | Male, Young |
| **Character Age** | 12 years old |
| **Speed** | 1.1 (energetic, battle-ready) |
| **Stability** | 0.5 (balanced) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Charlie's deep confidence gives Kai the warrior gravitas he needs. Slightly older-sounding than Ki, matching his 12-year age. |
| **Voice Direction** | Fierce, brave, protective. The team's shield and sword. Short, punchy lines. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `kai/kai-fight.mp3` | !בוא נלחם | Lesson 13 -- warrior's battle cry |

---

### Mentors

#### 7. Sensei Zen (סנסיי זן) -- Ancient Turtle Master
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Bill (pqHfZKP75CvOlQylNhV4) |
| **Voice Description** | Wise, Mature, Balanced |
| **Gender/Age** | Male, Old |
| **Character Age** | Ancient (turtle) |
| **Speed** | 0.8 (very slow, deliberate -- wise elder) |
| **Stability** | 0.7 (high -- steady, sage-like) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Bill is the only "old" voice in the catalog -- perfect for the ancient turtle master. The very slow speed (0.8) creates a deliberate, wise cadence. Every word feels intentional. |
| **Voice Direction** | Slow, wise, warm. Like a grandfather telling stories. Long pauses between thoughts. Speaks in proverbs. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `sensei-zen/sensei-patience.mp3` | !סבלנות היא הנשק החזק ביותר | Lesson 8 pre -- first physical appearance |
| `sensei-zen/sensei-journey.mp3` | !כל מסע מתחיל בלחיצה אחת | Lesson 8 post -- master's wisdom |
| `sensei-zen/sensei-final.mp3` | ...נינג'ה אמיתי | Lesson 20 post -- graduation |

---

#### 8. Pixel (פיקסל) -- Robot Companion
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | River (SAz9YHcvj6GT2YYXdXww) |
| **Voice Description** | Relaxed, Neutral, Informative |
| **Gender/Age** | Neutral, Middle-aged |
| **Character Age** | Robot (ageless) |
| **Speed** | 1.15 (slightly fast, robotic precision) |
| **Stability** | 0.7 (high -- robotic consistency) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | River's neutral, informative tone is perfect for a data robot. The slightly fast speed and high stability create a robotic precision feel. |
| **Voice Direction** | Clinical, precise, data-focused. Reports facts and stats. Occasionally tries humor and fails endearingly. |
| **Note** | Pixel is primarily voiced via Web Audio synthesis in the game. ElevenLabs voice reserved for key story moments only. No lines generated in this batch. |

---

#### 9. Rex (רקס) -- Baby Dinosaur
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Roger (CwhRBWXzGAHq8TQ4Fs17) |
| **Voice Description** | Laid-Back, Casual, Resonant |
| **Gender/Age** | Male, Middle-aged |
| **Character Age** | Baby dinosaur |
| **Speed** | 1.0 (normal) |
| **Stability** | 0.5 (balanced) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Roger's laid-back, casual quality gives Rex a surprisingly chill personality for a dinosaur. The contrast between a deep resonant voice and a tiny baby dino creates humor. |
| **Voice Direction** | Chill, casual, self-deprecating humor about his tiny arms. The team mascot. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `rex/rex-play.mp3` | !גם עם ידיים קטנות - אני פה | Unlock animation -- self-aware humor |

---

### Villains

#### 10. Bug (באג) -- Main Antagonist
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Callum (N2lVS1w4EtoT3dr4eOWO) |
| **Voice Description** | Husky Trickster |
| **Gender/Age** | Male, Middle-aged |
| **Character Age** | Unknown (cute beetle) |
| **Speed** | 1.2 (fast, chaotic energy) |
| **Stability** | 0.4 (low -- unpredictable, mischievous) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Callum's "husky trickster" description is literally Bug. The low stability creates an unpredictable, slightly unhinged quality that makes Bug feel chaotic but funny, never truly scary. |
| **Voice Direction** | Mischievous, giggly, theatrical. A cute villain who loves being bad but is never actually threatening. Think: cartoon villain hamming it up. |

**Generated Lines:**
| File | Hebrew Text | Context |
|------|-------------|---------|
| `bug/bug-scramble.mp3` | !הא הא! בלבלתי לכם את האותיות | Lesson 5 -- Bug's first appearance |
| `bug/bug-boss.mp3` | !עכשיו אני מבלבל עשר מילים שלמות | Lesson 7 -- mini-boss entrance |
| `bug/bug-king.mp3` | !אני מלך הבאגים! לעולם לא תנצחו אותי | Lesson 20 -- final boss entrance |
| `bug/bug-defeat.mp3` | !אוי! אחזוווור | Lesson 20 -- defeated, flies away |

---

#### 11. Glitch (גליץ') -- Chaotic Entity (Redeemable)
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Will (bIHbv24MWmeRgasZH58o) |
| **Voice Description** | Relaxed Optimist |
| **Gender/Age** | Male, Young |
| **Character Age** | Unknown (digital entity) |
| **Speed** | 1.0 (normal baseline) |
| **Stability** | 0.2-0.4 (VERY LOW -- the key to Glitch's character!) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Will's "relaxed optimist" baseline contrasts with the extremely low stability, creating a voice that WANTS to be normal but can't stop glitching. This perfectly mirrors Glitch's arc: he's not evil, he's broken. |
| **Voice Direction** | Stuttering, uncertain, sympathetic. The text itself contains stutters ("גגג-גליץ'"), and the low stability adds additional vocal unpredictability. As Glitch stabilizes in the story (lessons 18+), stability increases from 0.2 to 0.4. |
| **Stability Progression** | Intro: 0.2 (maximum glitch) -> Redemption: 0.25 (still broken) -> Thanks: 0.4 (beginning to stabilize) |

**Generated Lines:**
| File | Hebrew Text | Context | Stability |
|------|-------------|---------|-----------|
| `glitch/glitch-intro.mp3` | !גגג-גליץ' פ-פ-פה | Lesson 12 -- chaotic entrance | 0.2 |
| `glitch/glitch-redemption.mp3` | !א-א-אני לא רוצה להיות ר-ר-רע | Lesson 18 -- wants to change | 0.25 |
| `glitch/glitch-thanks.mp3` | ...ת-תודה | Lesson 18 post -- brief stability | 0.4 |

---

### Rivals (Battle Arena)

#### 12. Shadow (שאדו) -- Cool Cat Ninja
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Eric (cjVigY5qzO86Huf0OWal) |
| **Voice Description** | Smooth, Trustworthy |
| **Gender/Age** | Male, Middle-aged |
| **Character Age** | Unknown (ninja cat) |
| **Speed** | 0.95 (slightly slow, mysterious) |
| **Stability** | 0.6 (smooth consistency) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Eric's smooth quality creates the cool, mysterious rival. Shadow doesn't rush -- he's always in control, always watching from the shadows. |
| **Voice Direction** | Cool, calm, mysterious. Speaks in short, impactful sentences. Never raises his voice. |
| **Status** | No lines generated in this batch. Reserved for Battle Arena integration. |

---

#### 13. Storm (סטורם) -- Electric Fox
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Harry (SOYHLrjzK2X1ezoPC6cr) |
| **Voice Description** | Fierce Warrior |
| **Gender/Age** | Male, Young |
| **Character Age** | Unknown (electric fox) |
| **Speed** | 1.1 (intense, charged) |
| **Stability** | 0.45 (slightly unpredictable -- electric energy) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Harry's "fierce warrior" quality captures Storm's intense, electric personality. The slightly low stability adds an unpredictable edge -- like electricity crackling. |
| **Voice Direction** | Intense, crackling with energy, competitive. Challenges the player with lightning metaphors. |
| **Status** | No lines generated in this batch. Reserved for Battle Arena integration. |

---

#### 14. Blaze (בלייז) -- Fire Dragon
| Field | Value |
|-------|-------|
| **ElevenLabs Voice** | Adam (pNInz6obpgDQGcFmaJgB) |
| **Voice Description** | Dominant, Firm |
| **Gender/Age** | Male, Middle-aged |
| **Character Age** | Unknown (fire dragon) |
| **Speed** | 1.0 (commanding, no rush) |
| **Stability** | 0.55 (balanced -- powerful but controlled) |
| **Similarity Boost** | 0.75 |
| **Why This Voice** | Adam's dominant, firm quality is perfect for the ultimate rival -- a fire dragon. Blaze doesn't need to be fast; his power speaks for itself. |
| **Voice Direction** | Powerful, commanding, ancient. Speaks like royalty. Fire metaphors. The final challenge. |
| **Status** | No lines generated in this batch. Reserved for Battle Arena integration. |

---

## File Structure

```
public/audio/voices/
├── ki/
│   ├── ki-discovery.mp3    (37 KB)  -- Lesson 1 pre
│   ├── ki-victory.mp3      (41 KB)  -- Lesson 7 post (win)
│   ├── ki-team.mp3         (32 KB)  -- Lesson 2 post
│   └── ki-final.mp3        (20 KB)  -- Lesson 14 post
├── mika/
│   ├── mika-intro.mp3      (34 KB)  -- Lesson 2 pre
│   ├── mika-fight.mp3      (31 KB)  -- Lesson 6 pre
│   └── mika-hack.mp3       (31 KB)  -- Lesson 17 pre
├── sensei-zen/
│   ├── sensei-patience.mp3 (55 KB)  -- Lesson 8 pre
│   ├── sensei-journey.mp3  (38 KB)  -- Lesson 8 post
│   └── sensei-final.mp3    (26 KB)  -- Lesson 20 post (win)
├── bug/
│   ├── bug-scramble.mp3    (54 KB)  -- Lesson 5 pre
│   ├── bug-boss.mp3        (42 KB)  -- Lesson 7 pre
│   ├── bug-king.mp3        (60 KB)  -- Lesson 20 pre
│   └── bug-defeat.mp3      (41 KB)  -- Lesson 20 post (win)
├── glitch/
│   ├── glitch-intro.mp3    (29 KB)  -- Lesson 12 pre
│   ├── glitch-redemption.mp3 (41 KB) -- Lesson 18 pre
│   └── glitch-thanks.mp3   (24 KB)  -- Lesson 18 post
├── yuki/
│   └── yuki-challenge.mp3  (32 KB)  -- Lesson 10 pre
├── luna/
│   └── luna-breathe.mp3    (52 KB)  -- Lesson 11 pre
├── kai/
│   └── kai-fight.mp3       (18 KB)  -- Lesson 13 pre
├── noa/
│   └── noa-heal.mp3        (31 KB)  -- Lesson 13 pre
└── rex/
    └── rex-play.mp3        (40 KB)  -- Unlock animation
```

**Total: 22 voice lines, ~799 KB**

---

## Technical Integration Notes

### Playing Voice Lines in the Game

```typescript
// Example: play a character voice line
const audio = new Audio('/audio/voices/ki/ki-discovery.mp3');
audio.volume = 0.8; // character voice volume
audio.play();
```

### Mapping Story Beats to Voice Files

The voice file naming convention maps directly to story beats:

```typescript
// Pattern: /audio/voices/{character}/{character}-{identifier}.mp3
// The identifier matches the story script context

function getVoiceFile(speaker: CharacterName, identifier: string): string {
  const charDir = speaker === 'senseiZen' ? 'sensei-zen' : speaker;
  return `/audio/voices/${charDir}/${charDir}-${identifier}.mp3`;
}
```

### Voice Settings Reference

| Character | Voice ID | Speed | Stability | Personality |
|-----------|----------|-------|-----------|-------------|
| Ki | TX3LPaxmHKxFdv7VOQHJ | 1.1 | 0.5 | Excited, brave |
| Mika | cgSgspJ2msm6clMCkdW9 | 1.05 | 0.5 | Smart, confident |
| Yuki | FGY2WhTYpPnrIDTdsKH5 | 1.2 | 0.5 | Fast, competitive |
| Luna | pFZP5JQG7iQjIQuC4Bku | 0.9 | 0.6 | Calm, serene |
| Noa | EXAVITQu4vr4xnSDxMaL | 0.95 | 0.6 | Warm, caring |
| Kai | IKne3meq5aSn9XLyUdCD | 1.1 | 0.5 | Fierce, brave |
| Sensei Zen | pqHfZKP75CvOlQylNhV4 | 0.8 | 0.7 | Wise, slow |
| Pixel | SAz9YHcvj6GT2YYXdXww | 1.15 | 0.7 | Robotic, precise |
| Rex | CwhRBWXzGAHq8TQ4Fs17 | 1.0 | 0.5 | Chill, casual |
| Bug | N2lVS1w4EtoT3dr4eOWO | 1.2 | 0.4 | Mischievous, chaotic |
| Glitch | bIHbv24MWmeRgasZH58o | 1.0 | 0.2-0.4 | Stuttery, broken |
| Shadow | cjVigY5qzO86Huf0OWal | 0.95 | 0.6 | Smooth, mysterious |
| Storm | SOYHLrjzK2X1ezoPC6cr | 1.1 | 0.45 | Intense, electric |
| Blaze | pNInz6obpgDQGcFmaJgB | 1.0 | 0.55 | Dominant, commanding |

---

## Future Voice Lines (Next Batches)

### Priority 2: Remaining Act 1-3 Story Beats
- Ki: 8 more lines (lessons 3, 4, 5, 9, 16 + unlock reactions)
- Mika: 5 more lines (lessons 3, 4, 12, 15)
- Sensei Zen: 4 more lines (lessons 9, 14, 15, 20)
- Bug: 3 more lines (lessons 15, 16)
- Glitch: 2 more lines (lesson 15)

### Priority 3: Unlock Animations
- 10 greeting lines (one per unlockable character)

### Priority 4: Battle Arena
- Shadow: 3 lines (taunt, defeat, victory)
- Storm: 3 lines (taunt, defeat, victory)
- Blaze: 3 lines (taunt, defeat, victory)

### Priority 5: UI Feedback
- Generic encouragement lines per character (5-8 each)
- Error/mistake reactions (3-5 each)
- Celebration lines for achievements (3-5 each)

---

## Generation Script

The voice generation script is at `scripts/generate-voices.cjs`. To regenerate or add new lines:

```bash
# Edit the VOICE_LINES array in scripts/generate-voices.cjs
# Then run:
node scripts/generate-voices.cjs
```

The script automatically:
- Creates directories as needed
- Generates one line at a time with 2-second delays (rate limit safety)
- Reports success/failure for each line
- Lists all generated files with sizes at the end
