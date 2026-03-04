# Ninja Keyboard Voice Settings V2

Generated: 2026-03-05
Model: eleven_v3 (ElevenLabs)
API: https://api.elevenlabs.io/v1/text-to-speech

## Voice Assignments

### Heroes (Kids - ages 10-12)

| Character | Voice | Voice ID | Stability | Speed | Post-FX |
|-----------|-------|----------|-----------|-------|---------|
| Ki (boy, curious) | Will - Relaxed Optimist | bIHbv24MWmeRgasZH58o | 0.55 | 1.15 | None |
| Mika (girl, confident) | Laura - Enthusiast, Quirky | FGY2WhTYpPnrIDTdsKH5 | 0.50 | 1.15 | None |
| Yuki (girl, fast) | Jessica - Playful, Bright | cgSgspJ2msm6clMCkdW9 | 0.45 | 1.20 | None |
| Luna (girl, calm) | Sarah - Mature, Reassuring | EXAVITQu4vr4xnSDxMaL | 0.70 | 0.95 | None |
| Kai (boy, fiery) | Harry - Fierce Warrior | SOYHLrjzK2X1ezoPC6cr | 0.45 | 1.20 | None |
| Noa (girl, gentle) | Jessica - Playful, Bright | cgSgspJ2msm6clMCkdW9 | 0.65 | 1.05 | None |

### Villains (Digital creatures)

| Character | Voice | Voice ID | Stability | Speed | Post-FX |
|-----------|-------|----------|-----------|-------|---------|
| Bug (mischievous beetle) | Callum - Husky Trickster | N2lVS1w4EtoT3dr4eOWO | 0.30 | 1.10 | Pitch +15%, echo (60ms, 0.4 decay) |
| Bug King (imposing) | Callum - Husky Trickster | N2lVS1w4EtoT3dr4eOWO | 0.35 | 0.90 | Pitch -5%, heavy echo (80ms, 0.5 decay) |
| Glitch (unstable pixel) | Liam - Energetic | TX3LPaxmHKxFdv7VOQHJ | 0.18 | 1.05 | Tremolo (10Hz, 0.5 depth), echo (20ms, 0.3 decay) |

### Other Characters

| Character | Voice | Voice ID | Stability | Speed | Post-FX |
|-----------|-------|----------|-----------|-------|---------|
| Rex (cool dinosaur) | Brian - Deep, Resonant | nPczCjzI2devNBz1zQrb | 0.50 | 0.90 | Pitch -12% |
| Sensei Zen (wise master) | *(unchanged from V1)* | - | - | - | - |

## Voice Lines

### Ki (4 lines)
- ki-discovery.mp3: "!וואו! המקלדת הזו זוהרת" (2.7s)
- ki-team.mp3: "!ביחד אנחנו חזקים יותר" (2.2s)
- ki-victory.mp3: "...ניצחנו! אבל הוא ברח" (2.3s)
- ki-final.mp3: "!עכשיו אנחנו מוכנים" (1.6s)

### Mika (3 lines)
- mika-intro.mp3: "!בוא ננסה ביחד, קי" (1.6s)
- mika-fight.mp3: "!לא ניתן לבאג לנצח" (1.8s)
- mika-hack.mp3: "!בואי נפרוץ את המערכת" (1.9s)

### Bug (4 lines, post-processed)
- bug-scramble.mp3: "!הא הא! בלבלתי לכם את האותיות" (2.7s)
- bug-boss.mp3: "!עכשיו אני מבלבל עשר מילים שלמות" (2.3s)
- bug-king.mp3: "!אני מלך הבאגים! לעולם לא תנצחו אותי" (3.9s)
- bug-defeat.mp3: "!אוי! אחזוווור" (1.8s)

### Glitch (3 lines, post-processed)
- glitch-intro.mp3: "!גגג-גליץ' פ-פ-פה" (1.5s)
- glitch-redemption.mp3: "!א-א-אני לא רוצה להיות ר-ר-רע" (2.8s)
- glitch-thanks.mp3: "...ת-תודה" (1.3s)

### Single Lines
- yuki-challenge.mp3: "!אני הכי מהירה בדוג'ו" (1.6s)
- luna-breathe.mp3: "...נשימה עמוקה, ואז מתחילים" (3.4s)
- kai-fight.mp3: "!בוא נלחם" (1.1s)
- noa-heal.mp3: "!אני כאן, לא נורא לטעות" (2.2s)
- rex-play.mp3: "!גם עם ידיים קטנות - אני פה" (2.1s)

## Post-Processing (ffmpeg)

### Bug
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*1.15,aresample=48000,aecho=0.8:0.88:60:0.4" output.mp3
```

### Bug King
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*0.95,aresample=48000,aecho=0.8:0.7:80:0.5" output.mp3
```

### Glitch
```bash
ffmpeg -y -i input.mp3 -af "tremolo=f=10:d=0.5,aecho=0.8:0.5:20:0.3" output.mp3
```

### Rex
```bash
ffmpeg -y -i input.mp3 -af "asetrate=48000*0.88,aresample=48000" output.mp3
```

## V1 Backups
All V1 files backed up to `{character}/v1/` subdirectories.

## Design Rationale

### Kid Voices
- **Speed 1.15-1.20**: Makes voices sound younger and more energetic
- **Stability 0.45-0.55**: Allows natural vocal variation without being chaotic
- Selected voices labeled "young" in ElevenLabs catalog

### Bug
- **Callum (Husky Trickster)**: Perfect mischievous quality
- **Low stability (0.30)**: Unpredictable, chaotic delivery
- **Pitch +15%**: Makes voice squeakier/more insect-like
- **Echo effect**: Digital reverb for "inside a computer" feel

### Bug King
- Same voice as Bug (Callum) for continuity
- **Slower speed (0.90)**: More imposing gravitas
- **Slight pitch down (-5%)**: Deeper but still recognizable as Bug
- **Heavier echo**: More powerful reverb for boss character

### Glitch
- **Very low stability (0.18)**: Maximum unpredictability for glitchy effect
- **Tremolo (10Hz)**: Creates digital stuttering/wavering
- **Short echo (20ms)**: Digital distortion feel
- **Stutter in text**: "גגג-גליץ' פ-פ-פה" reinforced by voice instability

### Rex
- **Brian (Deep, Resonant)**: Naturally deep voice
- **Pitch -12%**: Even deeper for dinosaur quality
- **Speed 0.90**: Slightly slower for weight/presence
- **No echo**: Keeps it warm and fun, not scary
