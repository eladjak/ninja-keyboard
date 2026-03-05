# Ninja Keyboard Voice Settings V3

Generated: 2026-03-05
Model: eleven_v3 (ElevenLabs)
API: https://api.elevenlabs.io/v1/text-to-speech
Script: scripts/generate-voices-v3.mjs

## V3 Strategy: Authentic Hebrew Accent

### Problem
V1 and V2 voices sounded too American. The ElevenLabs premade voices are English-trained
and when speaking Hebrew, the accent was clearly American/foreign.

### Approach
1. **ElevenLabs Voice Library (Strategy 1)**: Searched community voices for Hebrew (`iw` language
   code found 200+ voices). However, all community voices require a paid/creator tier plan.
   Result: Could not use community voices on current plan.

2. **Gemini Vision Analysis (Strategy 2)**: Sent all 9 character model sheets to Gemini 2.5 Flash
   for detailed voice analysis. Gemini provided specific recommendations for pitch, energy,
   speed, stability, similarity_boost, style, and Hebrew-specific speech patterns.

3. **Optimized Generation (Strategy 3)**: Used premade voices with three key improvements:
   - **`language_code: 'he'`**: New parameter that forces Hebrew phonetic processing in eleven_v3
   - **Higher stability + similarity_boost**: Per Gemini analysis, higher values preserve Hebrew
     gutturals (ר, ח, ע) and natural Israeli cadence
   - **`style` parameter**: Per Gemini analysis, tuned per character for expressiveness
   - **`use_speaker_boost: true`**: Clearer articulation of Hebrew phonemes

### Key V3 Changes from V2
| Change | V2 | V3 |
|--------|----|----|
| Language code | None | `he` (Hebrew) |
| Stability range | 0.18-0.70 | 0.25-0.85 (higher for Hebrew consistency) |
| Similarity boost range | 0.65-0.85 | 0.82-0.95 (higher for guttural preservation) |
| Style parameter | Not used | 0.30-0.90 (per character personality) |
| Speaker boost | Not used | `true` (clearer articulation) |
| Noa voice | Jessica (same as Yuki) | Alice (clearer, gentler, distinct) |
| Bug voice | Callum (husky/adult) | Liam (energetic/younger) |
| Rex pitch-down | -12% | -10% (more natural) |
| Bug pitch-up | +15% | +12% (less exaggerated) |
| Glitch tremolo | 10Hz, 0.5 depth | 8Hz, 0.6 depth (more pronounced) |

## Voice Assignments

### Heroes (Kids - ages 9-12)

| Character | Voice | Voice ID | Stability | Similarity | Speed | Style | Post-FX |
|-----------|-------|----------|-----------|------------|-------|-------|---------|
| Ki (boy, curious, 10yo) | Will - Relaxed Optimist | bIHbv24MWmeRgasZH58o | 0.78 | 0.92 | 1.15 | 0.65 | None |
| Mika (girl, confident, 10-11yo) | Laura - Enthusiast, Quirky | FGY2WhTYpPnrIDTdsKH5 | 0.80 | 0.95 | 1.10 | 0.65 | None |
| Yuki (girl, fast, speed ninja) | Jessica - Playful, Bright | cgSgspJ2msm6clMCkdW9 | 0.68 | 0.90 | 1.25 | 0.80 | None |
| Luna (girl, calm, mindful) | Sarah - Mature, Reassuring | EXAVITQu4vr4xnSDxMaL | 0.85 | 0.90 | 0.92 | 0.30 | None |
| Kai (boy, fiery warrior) | Harry - Fierce Warrior | SOYHLrjzK2X1ezoPC6cr | 0.70 | 0.88 | 1.25 | 0.80 | None |
| Noa (girl, gentle healer, 9yo) | Alice - Clear, Engaging | Xb7hH8MSUJpSbSDYk0k2 | 0.72 | 0.90 | 0.98 | 0.50 | None |

### Villains (Digital creatures)

| Character | Voice | Voice ID | Stability | Similarity | Speed | Style | Post-FX |
|-----------|-------|----------|-----------|------------|-------|-------|---------|
| Bug (mischievous beetle) | Liam - Energetic | TX3LPaxmHKxFdv7VOQHJ | 0.50 | 0.82 | 1.30 | 0.90 | Pitch +12%, echo (50ms, 0.35) |
| Bug King (imposing boss) | Callum - Husky Trickster | N2lVS1w4EtoT3dr4eOWO | 0.55 | 0.85 | 0.88 | 0.85 | Pitch -8%, heavy echo (80ms, 0.5) |
| Glitch (unstable pixel) | Liam - Energetic | TX3LPaxmHKxFdv7VOQHJ | 0.25 | 0.85 | 1.00 | 0.60 | Tremolo (8Hz, 0.6), echo (25ms, 0.3) |

### Other Characters

| Character | Voice | Voice ID | Stability | Similarity | Speed | Style | Post-FX |
|-----------|-------|----------|-----------|------------|-------|-------|---------|
| Rex (cool dinosaur) | Brian - Deep, Resonant | nPczCjzI2devNBz1zQrb | 0.70 | 0.90 | 0.95 | 0.80 | Pitch -10% |
| Sensei Zen (wise master) | *(unchanged from V1)* | - | - | - | - | - | - |

## Voice Lines

### Ki (4 lines)
- ki-discovery.mp3: "!וואו! המקלדת הזו זוהרת"
- ki-team.mp3: "!ביחד אנחנו חזקים יותר"
- ki-victory.mp3: "...ניצחנו! אבל הוא ברח"
- ki-final.mp3: "!עכשיו אנחנו מוכנים"

### Mika (3 lines)
- mika-intro.mp3: "!בוא ננסה ביחד, קי"
- mika-fight.mp3: "!לא ניתן לבאג לנצח"
- mika-hack.mp3: "!בואי נפרוץ את המערכת"

### Bug (4 lines, post-processed)
- bug-scramble.mp3: "!הא הא! בלבלתי לכם את האותיות"
- bug-boss.mp3: "!עכשיו אני מבלבל עשר מילים שלמות"
- bug-king.mp3: "!אני מלך הבאגים! לעולם לא תנצחו אותי"
- bug-defeat.mp3: "!אוי! אחזוווור"

### Glitch (3 lines, post-processed)
- glitch-intro.mp3: "!גגג-גליץ' פ-פ-פה"
- glitch-redemption.mp3: "!א-א-אני לא רוצה להיות ר-ר-רע"
- glitch-thanks.mp3: "...ת-תודה"

### Single Lines
- yuki-challenge.mp3: "!אני הכי מהירה בדוג'ו"
- luna-breathe.mp3: "...נשימה עמוקה, ואז מתחילים"
- kai-fight.mp3: "!בוא נלחם"
- noa-heal.mp3: "!אני כאן, לא נורא לטעות"
- rex-play.mp3: "!גם עם ידיים קטנות - אני פה"

## Post-Processing (ffmpeg)

### Bug
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*1.12,aresample=48000,aecho=0.8:0.88:50:0.35" output.mp3
```

### Bug King
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*0.92,aresample=48000,aecho=0.8:0.7:80:0.5" output.mp3
```

### Glitch
```bash
ffmpeg -y -i input.mp3 -af "tremolo=f=8:d=0.6,aecho=0.8:0.5:25:0.3" output.mp3
```

### Rex
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*0.90,aresample=48000" output.mp3
```

## File Structure
```
voices/
├── ki/
│   ├── ki-discovery.mp3         <- V3 (current)
│   ├── ki-team.mp3
│   ├── ki-victory.mp3
│   ├── ki-final.mp3
│   ├── v2/                      <- V2 backup
│   │   └── *.mp3
│   └── v1/                      <- V1 backup
│       └── *.mp3
├── mika/
│   ├── *.mp3                    <- V3 (current)
│   ├── v2/*.mp3                 <- V2 backup
│   └── v1/*.mp3                 <- V1 backup
├── [same pattern for yuki, luna, kai, noa, bug, glitch, rex]
├── sensei-zen/                  <- Unchanged (approved)
│   ├── sensei-patience.mp3
│   ├── sensei-journey.mp3
│   └── sensei-final.mp3
├── VOICE-SETTINGS-V2.md         <- V2 docs (kept for reference)
└── VOICE-SETTINGS-V3.md         <- This file
```

## Gemini Vision Analysis Summary

Each character's model sheet was analyzed by Gemini 2.5 Flash to determine optimal
voice characteristics for authentic Israeli Hebrew.

### Key Gemini Recommendations Applied:
- **Ki**: Medium-high pitch, moderate-fast energy, high stability for consistent Hebrew cadence
- **Mika**: Confident, quick-witted delivery with highest similarity (0.95) for Hebrew preservation
- **Yuki**: High energy/speed + high style (0.80) for competitive personality
- **Luna**: Calm/slow with very low style (0.30) for serene, understated delivery
- **Kai**: Fiery energy with high style (0.80) for warrior passion
- **Noa**: Gentle/warm with moderate style (0.50) for supportive healer
- **Bug**: Low stability (0.50), high speed (1.30), maximum style (0.90) for manic villain
- **Glitch**: Very low stability (0.25) for glitchy unpredictability
- **Rex**: Warm/cool with high style (0.80) for funny encouraging dino

### Hebrew-Specific Gemini Guidance:
- Israeli Hebrew has more direct, staccato rhythm vs flowing English
- Gutturals (ר, ח, ע) are critical differentiators from American accent
- Stress typically on last or second-to-last syllable
- Less "sing-songy" intonation than American English
- Vowels are shorter and crisper, without diphthongization
- Higher stability preserves these authentic patterns in TTS

## V1 and V2 Backups
All V1 files in `{character}/v1/` subdirectories.
All V2 files in `{character}/v2/` subdirectories.

## Future Improvements
- Upgrade to ElevenLabs paid plan to access community Hebrew-native voices
- Consider voice cloning with native Hebrew child speaker samples
- Test Google Cloud TTS Hebrew voices as alternative
- Test Microsoft Azure Hebrew TTS as alternative
