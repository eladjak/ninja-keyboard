import os
import json

BASE = "C:/Users/eladj/projects/ninja-keyboard/public/audio"

# Duration map from ffprobe output
DURATION_MAP = {
    "music/battle/blaze-dragon-battle.mp3": 223.32,
    "music/battle/blaze-dragon-battle-v2.mp3": 189.984,
    "music/battle/blaze-dragon-battle-v3.mp3": 336.072,
    "music/battle/blaze-dragon-battle-v4.mp3": 247.752,
    "music/battle/boss-defeated-fanfare.mp3": 10.032,
    "music/battle/boss-defeated-fanfare-v2.mp3": 9.912,
    "music/battle/boss-defeated-fanfare-v3.mp3": 6.144,
    "music/battle/boss-defeated-fanfare-v4.mp3": 4.944,
    "music/battle/bug-boss-act-2.mp3": 284.472,
    "music/battle/bug-boss-act-2-v2.mp3": 169.272,
    "music/battle/bug-boss-act-2-v3.mp3": 194.76,
    "music/battle/bug-boss-act-2-v4.mp3": 192.0,
    "music/battle/bug-king-final.mp3": 171.0,
    "music/battle/bug-king-final-v2.mp3": 199.872,
    "music/battle/bug-king-final-v3.mp3": 154.512,
    "music/battle/bug-king-final-v4.mp3": 239.28,
    "music/battle/glitch-secret-boss.mp3": 201.48,
    "music/battle/glitch-secret-boss-v2.mp3": 184.824,
    "music/battle/glitch-secret-boss-v3.mp3": 234.6,
    "music/battle/glitch-secret-boss-v4.mp3": 175.224,
    "music/battle/pre-battle-anticipation.mp3": 150.504,
    "music/battle/pre-battle-anticipation-v2.mp3": 193.704,
    "music/battle/pre-battle-anticipation-v3.mp3": 188.472,
    "music/battle/pre-battle-anticipation-v4.mp3": 161.04,
    "music/battle/shadow-cat-battle.mp3": 139.824,
    "music/battle/shadow-cat-battle-v2.mp3": 85.272,
    "music/battle/shadow-cat-battle-v3.mp3": 139.824,
    "music/battle/shadow-cat-battle-v4.mp3": 85.272,
    "music/battle/storm-fox-battle.mp3": 296.904,
    "music/battle/storm-fox-battle-v2.mp3": 239.88,
    "music/battle/storm-fox-battle-v3.mp3": 296.904,
    "music/battle/storm-fox-battle-v4.mp3": 239.88,
    "music/battle/tournament-arena.mp3": 135.0,
    "music/battle/tournament-arena-v2.mp3": 220.56,
    "music/battle/tournament-arena-v3.mp3": 178.32,
    "music/battle/tournament-arena-v4.mp3": 183.12,
    "music/boss-battle.mp3": 292.08,
    "music/boss-battle-v2.mp3": 229.344,
    "music/characters/bugs-theme.mp3": 36.432,
    "music/characters/bugs-theme-v2.mp3": 19.344,
    "music/characters/bugs-theme-v3.mp3": 12.864,
    "music/characters/bugs-theme-v4.mp3": 33.792,
    "music/characters/bugs-theme-v5.mp3": 33.792,
    "music/characters/glitchs-theme.mp3": 162.48,
    "music/characters/glitchs-theme-v2.mp3": 126.36,
    "music/characters/glitchs-theme-v3.mp3": 105.024,
    "music/characters/glitchs-theme-v4.mp3": 110.4,
    "music/characters/kis-theme.mp3": 278.784,
    "music/characters/kis-theme-v2.mp3": 180.0,
    "music/characters/kis-theme-v3.mp3": 180.0,
    "music/characters/kis-theme-v4.mp3": 278.784,
    "music/characters/lunas-theme.mp3": 34.824,
    "music/characters/lunas-theme-v2.mp3": 64.872,
    "music/characters/lunas-theme-v3.mp3": 14.952,
    "music/characters/lunas-theme-v4.mp3": 14.952,
    "music/characters/mikas-theme.mp3": 201.624,
    "music/characters/mikas-theme-v2.mp3": 154.992,
    "music/characters/mikas-theme-v3.mp3": 154.992,
    "music/characters/mikas-theme-v4.mp3": 201.624,
    "music/characters/rexs-theme.mp3": 21.6,
    "music/characters/rexs-theme-v2.mp3": 12.864,
    "music/characters/rexs-theme-v3.mp3": 18.84,
    "music/characters/rexs-theme-v4.mp3": 11.232,
    "music/characters/sensei-zens-theme.mp3": 291.984,
    "music/characters/sensei-zens-theme-v2.mp3": 270.0,
    "music/characters/sensei-zens-theme-v3.mp3": 270.0,
    "music/characters/sensei-zens-theme-v4.mp3": 291.984,
    "music/characters/yukis-theme.mp3": 184.224,
    "music/characters/yukis-theme-v2.mp3": 145.584,
    "music/characters/yukis-theme-v3.mp3": 184.224,
    "music/characters/yukis-theme-v4.mp3": 145.584,
    "music/events/achievement-unlock.mp3": 9.912,
    "music/events/achievement-unlock-v2.mp3": 9.24,
    "music/events/achievement-unlock-v3.mp3": 5.64,
    "music/events/achievement-unlock-v4.mp3": 7.512,
    "music/events/character-unlock.mp3": 21.984,
    "music/events/character-unlock-v2.mp3": 13.272,
    "music/events/character-unlock-v3.mp3": 5.76,
    "music/events/character-unlock-v4.mp3": 4.944,
    "music/events/defeat-try-again.mp3": 82.632,
    "music/events/defeat-try-again-v2.mp3": 44.064,
    "music/events/defeat-try-again-v3.mp3": 6.912,
    "music/events/defeat-try-again-v4.mp3": 7.752,
    "music/events/level-up-jingle.mp3": 10.44,
    "music/events/level-up-jingle-v2.mp3": 14.112,
    "music/events/level-up-jingle-v3.mp3": 3.384,
    "music/events/level-up-jingle-v4.mp3": 5.952,
    "music/events/personal-best.mp3": 8.04,
    "music/events/personal-best-v2.mp3": 10.584,
    "music/events/personal-best-v3.mp3": 4.8,
    "music/events/personal-best-v4.mp3": 9.84,
    "music/events/season-event-theme.mp3": 174.72,
    "music/events/season-event-theme-v2.mp3": 134.76,
    "music/events/season-event-theme-v3.mp3": 115.992,
    "music/events/season-event-theme-v4.mp3": 184.56,
    "music/events/streak-milestone.mp3": 22.512,
    "music/events/streak-milestone-v2.mp3": 27.264,
    "music/events/streak-milestone-v3.mp3": 10.032,
    "music/events/streak-milestone-v4.mp3": 10.8,
    "music/events/victory-fanfare.mp3": 11.664,
    "music/events/victory-fanfare-v2.mp3": 21.072,
    "music/events/victory-fanfare-v3.mp3": 3.912,
    "music/events/victory-fanfare-v4.mp3": 11.544,
    "music/gameplay/accuracy-challenge.mp3": 160.944,
    "music/gameplay/accuracy-challenge-v2.mp3": 179.76,
    "music/gameplay/accuracy-challenge-v3.mp3": 323.832,
    "music/gameplay/accuracy-challenge-v4.mp3": 419.904,
    "music/gameplay/practice-easy.mp3": 99.312,
    "music/gameplay/practice-easy-v2.mp3": 114.792,
    "music/gameplay/practice-easy-v3.mp3": 72.024,
    "music/gameplay/practice-easy-v4.mp3": 72.0,
    "music/gameplay/practice-hard.mp3": 185.64,
    "music/gameplay/practice-hard-v2.mp3": 164.784,
    "music/gameplay/practice-hard-v3.mp3": 244.992,
    "music/gameplay/practice-hard-v4.mp3": 289.32,
    "music/gameplay/practice-medium.mp3": 152.04,
    "music/gameplay/practice-medium-v2.mp3": 142.68,
    "music/gameplay/practice-medium-v3.mp3": 163.032,
    "music/gameplay/practice-medium-v4.mp3": 153.144,
    "music/gameplay/speed-test.mp3": 236.472,
    "music/gameplay/speed-test-v2.mp3": 121.992,
    "music/gameplay/speed-test-v3.mp3": 121.992,
    "music/gameplay/speed-test-v4.mp3": 236.472,
    "music/main-theme.mp3": 213.96,
    "music/main-theme-v2.mp3": 217.92,
    "music/menu/battle-menu.mp3": 169.8,
    "music/menu/battle-menu-v2.mp3": 213.744,
    "music/menu/battle-menu-v3.mp3": 75.912,
    "music/menu/battle-menu-v4.mp3": 261.984,
    "music/menu/games-hub.mp3": 112.944,
    "music/menu/games-hub-v2.mp3": 117.912,
    "music/menu/games-hub-v3.mp3": 67.824,
    "music/menu/games-hub-v4.mp3": 107.52,
    "music/menu/lessons-menu.mp3": 169.2,
    "music/menu/lessons-menu-v2.mp3": 157.56,
    "music/menu/lessons-menu-v3.mp3": 110.544,
    "music/menu/lessons-menu-v4.mp3": 231.504,
    "music/menu/profile-progress.mp3": 128.88,
    "music/menu/profile-progress-v2.mp3": 165.0,
    "music/menu/profile-progress-v3.mp3": 278.784,
    "music/menu/profile-progress-v4.mp3": 180.024,
    "music/menu/settings.mp3": 248.04,
    "music/menu/settings-v2.mp3": 206.424,
    "music/menu/settings-v3.mp3": 309.984,
    "music/menu/settings-v4.mp3": 255.984,
    "music/story/emotional-moment.mp3": 132.6,
    "music/story/emotional-moment-v2.mp3": 184.344,
    "music/story/emotional-moment-v3.mp3": 319.992,
    "music/story/emotional-moment-v4.mp3": 270.504,
    "music/story/victory-celebration.mp3": 129.984,
    "music/story/victory-celebration-v2.mp3": 158.064,
    "music/story/victory-celebration-v3.mp3": 193.752,
    "music/story/victory-celebration-v4.mp3": 153.552,
    "music/worlds/anaf-training-hub.mp3": 144.96,
    "music/worlds/anaf-training-hub-v2.mp3": 207.96,
    "music/worlds/anaf-training-hub-v3.mp3": 140.784,
    "music/worlds/anaf-training-hub-v4.mp3": 134.88,
    "music/worlds/geza-ninja-arena.mp3": 196.56,
    "music/worlds/geza-ninja-arena-v2.mp3": 178.992,
    "music/worlds/geza-ninja-arena-v3.mp3": 203.664,
    "music/worlds/geza-ninja-arena-v4.mp3": 189.504,
    "music/worlds/nevet-adventure-camp.mp3": 84.984,
    "music/worlds/nevet-adventure-camp-v2.mp3": 127.704,
    "music/worlds/nevet-adventure-camp-v3.mp3": 146.184,
    "music/worlds/nevet-adventure-camp-v4.mp3": 122.76,
    "music/worlds/shatil-magical-garden.mp3": 126.264,
    "music/worlds/shatil-magical-garden-v2.mp3": 172.512,
    "music/worlds/shatil-magical-garden-v3.mp3": 14.04,
    "music/worlds/shatil-magical-garden-v4.mp3": 24.072,
    "music/worlds/tzameret-professional.mp3": 174.624,
    "music/worlds/tzameret-professional-v2.mp3": 256.68,
    "music/worlds/tzameret-professional-v3.mp3": 212.712,
    "music/worlds/tzameret-professional-v4.mp3": 328.824,
}

# SFX duration map (from ffprobe)
SFX_DURATION_MAP = {
    "achievement-unlock.mp3": 3.030204,
    "bug-appear.mp3": 1.515102,
    "character-unlock.mp3": 3.030204,
    "correct-answer.mp3": 0.522449,
    "countdown-beep.mp3": 0.522449,
    "countdown-go.mp3": 1.044898,
    "glitch-warp.mp3": 1.044898,
    "keyboard-click.mp3": 0.522449,
    "keyboard-combo.mp3": 1.515102,
    "level-up.mp3": 2.037551,
    "ninja-slash.mp3": 0.522449,
    "star-earn.mp3": 1.044898,
    "streak-fire.mp3": 1.515102,
    "victory-cheers.mp3": 3.030204,
    "wrong-answer.mp3": 0.522449,
    "xp-gain.mp3": 1.044898,
}

# SFX files actually referenced by code (sound-manager.ts SFX_FILES)
SFX_USED_KEYS = {
    "keyboard-click.mp3", "correct-answer.mp3", "wrong-answer.mp3",
    "level-up.mp3", "xp-gain.mp3", "countdown-beep.mp3", "countdown-go.mp3",
    "keyboard-combo.mp3", "achievement-unlock.mp3", "character-unlock.mp3",
    "star-earn.mp3", "streak-fire.mp3", "victory-cheers.mp3",
    "ninja-slash.mp3", "bug-appear.mp3", "glitch-warp.mp3",
}

# === BUILD MUSIC TRACKS ===
music_tracks = []
music_by_category = {}

for dirpath, dirnames, filenames in os.walk(os.path.join(BASE, "music")):
    dirnames.sort()
    for fn in sorted(filenames):
        if not fn.endswith(".mp3"):
            continue
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, BASE).replace("\\", "/")

        parts = rel.split("/")
        if len(parts) >= 3:
            cat = parts[1]
        else:
            cat = "root"

        size_bytes = os.path.getsize(full)
        size_kb = round(size_bytes / 1024, 1)

        name_no_ext = fn[:-4]
        variant = "v1"
        for v in ["v2", "v3", "v4", "v5"]:
            if name_no_ext.endswith("-" + v):
                variant = v
                break

        dur = round(DURATION_MAP.get(rel, 0), 2)

        # Quality: events/jingles are OK even if small. Others < 80KB suspect.
        if cat == "events" and size_kb < 10:
            qflag = "bad"
        elif cat == "events":
            qflag = "ok"
        elif size_kb < 50:
            qflag = "bad"
        elif size_kb < 80:
            qflag = "suspect"
        else:
            qflag = "ok"

        # usedInCode: only main-theme.mp3 and boss-battle.mp3 are at paths
        # the code actually tries to load. All others are in subdirs that the
        # DEFAULT_ZONE_TRACKS doesn't point to correctly.
        used = rel in ("music/main-theme.mp3", "music/boss-battle.mp3")

        music_tracks.append({
            "file": rel,
            "category": cat,
            "sizeKB": size_kb,
            "durationSec": dur,
            "variant": variant,
            "usedInCode": used,
            "qualityFlag": qflag,
        })

        if cat not in music_by_category:
            music_by_category[cat] = {"count": 0, "totalSizeMB": 0.0}
        music_by_category[cat]["count"] += 1
        music_by_category[cat]["totalSizeMB"] = round(
            music_by_category[cat]["totalSizeMB"] + size_kb / 1024, 3
        )

music_total_kb = sum(t["sizeKB"] for t in music_tracks)
music_used_count = sum(1 for t in music_tracks if t["usedInCode"])

# === BUILD SFX ===
sfx_files = []
sfx_dir = os.path.join(BASE, "sfx")
for fn in sorted(os.listdir(sfx_dir)):
    if not fn.endswith(".mp3"):
        continue
    full = os.path.join(sfx_dir, fn)
    size_kb = round(os.path.getsize(full) / 1024, 1)
    dur = round(SFX_DURATION_MAP.get(fn, 0), 3)
    used = fn in SFX_USED_KEYS
    sfx_files.append({
        "file": "sfx/" + fn,
        "sizeKB": size_kb,
        "durationSec": dur,
        "usedInCode": used,
    })

sfx_used = sum(1 for f in sfx_files if f["usedInCode"])

# === BUILD VOICES ===
# Voice duration data from ffprobe output
VOICE_DUR = {
    "voices/bug/bug-boss.mp3": 5.712,
    "voices/bug/bug-boss-raw.mp3": 5.642,
    "voices/bug/bug-buzz.mp3": 3.48,
    "voices/bug/bug-buzz-raw.mp3": 4.362,
    "voices/bug/bug-defeat.mp3": 4.92,
    "voices/bug/bug-defeat-raw.mp3": 4.833,
    "voices/bug/bug-king.mp3": 4.512,
    "voices/bug/bug-king-raw.mp3": 4.441,
    "voices/bug/bug-pest.mp3": 3.048,
    "voices/bug/bug-pest-raw.mp3": 3.788,
    "voices/bug/bug-scared.mp3": 2.856,
    "voices/bug/bug-scared-raw.mp3": 3.553,
    "voices/bug/bug-scatter.mp3": 3.36,
    "voices/bug/bug-scatter-raw.mp3": 4.206,
    "voices/bug/bug-scramble.mp3": 7.704,
    "voices/bug/bug-scramble-raw.mp3": 7.628,
    "voices/bug/bug-taunt.mp3": 4.584,
    "voices/bug/bug-taunt-raw.mp3": 4.519,
    "voices/bugKing/bugking-boss.mp3": 4.728,
    "voices/bugKing/bugking-boss-raw.mp3": 4.284,
    "voices/bugKing/bugking-crown.mp3": 4.8,
    "voices/bugKing/bugking-crown-raw.mp3": 4.362,
    "voices/bugKing/bugking-defeat.mp3": 5.928,
    "voices/bugKing/bugking-defeat-raw.mp3": 5.407,
    "voices/bugKing/bugking-scramble.mp3": 7.488,
    "voices/bugKing/bugking-scramble-raw.mp3": 6.844,
    "voices/bugKing/bugking-taunt.mp3": 4.296,
    "voices/bugKing/bugking-taunt-raw.mp3": 3.866,
    "voices/glitch/glitch-chaos.mp3": 7.497,
    "voices/glitch/glitch-chaos-raw.mp3": 7.471,
    "voices/glitch/glitch-intro.mp3": 11.18,
    "voices/glitch/glitch-intro-raw.mp3": 11.154,
    "voices/glitch/glitch-redemption.mp3": 7.262,
    "voices/glitch/glitch-redemption-raw.mp3": 7.236,
    "voices/glitch/glitch-thanks.mp3": 6.766,
    "voices/glitch/glitch-thanks-raw.mp3": 6.766,
    "voices/kai/kai-challenge.mp3": 4.598,
    "voices/kai/kai-fight.mp3": 3.631,
    "voices/kai/kai-victory.mp3": 3.553,
    "voices/ki/ki-battle-start.mp3": 2.926,
    "voices/ki/ki-discovery.mp3": 3.631,
    "voices/ki/ki-encourage.mp3": 3.161,
    "voices/ki/ki-final.mp3": 4.911,
    "voices/ki/ki-greeting.mp3": 2.769,
    "voices/ki/ki-level-up.mp3": 2.847,
    "voices/ki/ki-team.mp3": 3.396,
    "voices/ki/ki-victory.mp3": 4.206,
    "voices/luna/luna-breathe.mp3": 5.251,
    "voices/luna/luna-create.mp3": 4.911,
    "voices/luna/luna-encourage.mp3": 5.956,
    "voices/mika/mika-encourage.mp3": 3.396,
    "voices/mika/mika-fight.mp3": 4.519,
    "voices/mika/mika-hack.mp3": 2.273,
    "voices/mika/mika-intro.mp3": 4.284,
    "voices/mika/mika-shortcut.mp3": 3.788,
    "voices/noa/noa-celebrate.mp3": 3.161,
    "voices/noa/noa-heal.mp3": 4.911,
    "voices/noa/noa-support.mp3": 4.284,
    "voices/rex/rex-fun.mp3": 2.904,
    "voices/rex/rex-fun-raw.mp3": 3.004,
    "voices/rex/rex-play.mp3": 2.424,
    "voices/rex/rex-play-raw.mp3": 2.508,
    "voices/sensei-zen/sensei-final.mp3": 1.646,
    "voices/sensei-zen/sensei-journey.mp3": 2.429,
    "voices/sensei-zen/sensei-patience.mp3": 3.474,
    "voices/yuki/yuki-challenge.mp3": 1.907,
    "voices/yuki/yuki-encourage.mp3": 2.9,
    "voices/yuki/yuki-speed.mp3": 1.907,
    "voices/yuki/yuki-taunt.mp3": 2.273,
    "voices/yuki/yuki-win.mp3": 2.612,
}

# Characters that have voice lines in main (non-versioned) folder
CHAR_WITH_VOICES = {
    "bug", "bugKing", "glitch", "kai", "ki", "luna", "mika", "noa", "rex", "sensei-zen", "yuki"
}
EXPECTED_CHARS = ["ki", "mika", "luna", "noa", "rex", "sensei-zen", "yuki", "bug", "bugKing", "glitch", "kai"]

# Build voice character data
voice_chars = {}
voice_preview_files = []

for dirpath, dirnames, filenames in os.walk(os.path.join(BASE, "voices")):
    dirnames.sort()
    rel_dir = os.path.relpath(dirpath, BASE).replace("\\", "/")

    for fn in sorted(filenames):
        if not fn.endswith(".mp3"):
            continue
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, BASE).replace("\\", "/")
        size_kb = round(os.path.getsize(full) / 1024, 1)

        parts = rel.split("/")
        # voices/<char>/<file> or voices/<char>/v1/<file> or voices/voice-design-previews/<file>
        if len(parts) < 3:
            continue

        char_name = parts[1]  # e.g. "bug", "ki", "voice-design-previews"

        if char_name == "voice-design-previews":
            voice_preview_files.append({"file": rel, "sizeKB": size_kb})
            continue

        # Is this a versioned file?
        is_archived = len(parts) >= 4 and parts[2] in ("v1", "v2", "v3", "v4")

        if char_name not in voice_chars:
            voice_chars[char_name] = {
                "character": char_name,
                "files": [],
                "archivedFiles": [],
                "totalSizeKB": 0.0,
                "usedInCode": False,  # voices aren't currently wired up in the main app
            }

        if is_archived:
            voice_chars[char_name]["archivedFiles"].append(rel)
        else:
            dur = round(VOICE_DUR.get(rel, 0), 3)
            voice_chars[char_name]["files"].append({
                "file": rel,
                "sizeKB": size_kb,
                "durationSec": dur,
                "isRaw": "-raw" in fn,
            })
            voice_chars[char_name]["totalSizeKB"] = round(
                voice_chars[char_name]["totalSizeKB"] + size_kb, 1
            )

voice_chars_list = list(voice_chars.values())
total_voice_files = sum(len(c["files"]) + len(c["archivedFiles"]) for c in voice_chars_list) + len(voice_preview_files)
chars_with_voices = len(voice_chars_list)
# Characters expected but missing voices
all_game_chars = ["ki", "mika", "luna", "noa", "rex", "sensei-zen", "yuki",
                  "bug", "bugKing", "glitch", "kai",
                  # these have no voice folder at all:
                  "shadow", "storm", "blaze", "barak", "phantom", "virus", "pixel", "masterBeat", "sakura", "raz"]
chars_without = [c for c in all_game_chars if c not in voice_chars]

# === ISSUES ===
issues = []

# Music path mismatch: code uses flat paths, files are in subdirs
issues.append(
    "CRITICAL: music-manager.ts DEFAULT_ZONE_TRACKS references flat paths like "
    "'/audio/music/practice-easy.mp3' but files only exist in subdirectories like "
    "'/audio/music/gameplay/practice-easy.mp3'. 12 of 14 zone tracks will 404 at runtime."
)
issues.append(
    "CRITICAL: '/audio/music/stingers/' directory does not exist. "
    "All 8 stinger tracks in STINGER_TRACKS will fail to load (victory-fanfare, level-up, "
    "character-unlock, achievement, streak-fire, season-complete, personal-best, defeat-jingle)."
)
issues.append(
    "CRITICAL: '/audio/music/holidays/' directory does not exist. "
    "All 12 holiday music tracks will fail to load."
)
issues.append(
    "MISSING ZONE TRACKS (no file anywhere): "
    "battle-arena.mp3, profile.mp3, story-mode.mp3, boss-battle-final.mp3, "
    "victory-fanfare.mp3, defeat.mp3, loading.mp3 "
    "- these zones will play silence."
)
issues.append(
    "MISSING BATTLE TRACKS in TRACK_MANIFEST: "
    "battle-shadow.mp3, battle-storm.mp3, battle-pre.mp3 "
    "- referenced by manifest but no file at those paths; "
    "actual files use different naming (shadow-cat-battle.mp3 etc) in battle/ subdir."
)
issues.append(
    "TRACK_MANIFEST character theme paths mismatch: code uses 'ki-theme.mp3', "
    "'sensei-zen-theme.mp3', 'bug-theme.mp3' but actual files are "
    "'kis-theme.mp3', 'sensei-zens-theme.mp3', 'bugs-theme.mp3'."
)
issues.append(
    "TRACK_MANIFEST world path mismatch: code uses 'worlds/geza-arena.mp3' "
    "but file is 'worlds/geza-ninja-arena.mp3'."
)
issues.append(
    "DUPLICATE TRACKS: shadow-cat-battle.mp3 == shadow-cat-battle-v3.mp3 (identical), "
    "shadow-cat-battle-v2.mp3 == shadow-cat-battle-v4.mp3 (identical). "
    "Same for storm-fox-battle.mp3/v3 and v2/v4. "
    "Likely Suno delivered duplicate outputs."
)
issues.append(
    "DUPLICATE TRACKS: kis-theme.mp3 == kis-theme-v4.mp3 (identical 278.784s), "
    "kis-theme-v2.mp3 == kis-theme-v3.mp3 (both 180.0s). "
    "Same duplication pattern in mikas-theme, sensei-zens-theme, yukis-theme."
)
issues.append(
    "SHORT/SUSPECT TRACKS: "
    "bugs-theme-v3.mp3 (12.8s, 300KB), rexs-theme-v4.mp3 (11.2s, 265KB), "
    "rexs-theme-v2.mp3 (12.8s, 282KB), lunas-theme-v3.mp3 (15.0s, 315KB), "
    "lunas-theme-v4.mp3 (15.0s, 315KB), shatil-magical-garden-v3.mp3 (14.0s, 337KB), "
    "shatil-magical-garden-v4.mp3 (24.1s, 574KB) - very short for looping background tracks."
)
issues.append(
    "VOICE SYSTEM NOT WIRED TO APP: Voices exist for 11 characters "
    "(ki, mika, luna, noa, rex, sensei-zen, yuki, bug, bugKing, glitch, kai) "
    "but no component in the app actually plays them. "
    "The story type has a voiceClip field but no voice playback system exists."
)
issues.append(
    "CHARACTERS WITHOUT VOICES: shadow, storm, blaze, barak, phantom, virus, pixel, "
    "masterBeat, sakura, raz have no voice files at all."
)
issues.append(
    "RAW FILES IN PRODUCTION: Many voice files have '-raw' variants alongside processed ones "
    "(e.g. bug-boss-raw.mp3). These are pre-processing source files and should be archived."
)
issues.append(
    "VOICE ARCHIVE NOT CLEANED: Old versions v1, v2, v3 subdirs still present in "
    "bug, glitch, kai, ki, luna, mika, noa, rex voice folders - consuming disk space."
)
issues.append(
    "PREVIEW FILES IN PRODUCTION BUILD: 42 files in voices/voice-design-previews/ "
    "(6.2 MB) are ElevenLabs design previews that should not be served in production."
)
issues.append(
    "music/boss-battle-v2.mp3 exists at root but DEFAULT_ZONE_TRACKS only references "
    "boss-battle.mp3 - the v2 version is unreachable."
)
issues.append(
    "music/main-theme-v2.mp3 exists at root but DEFAULT_ZONE_TRACKS only uses main-theme.mp3 "
    "- the v2 version is unreachable."
)
issues.append(
    "ui-sounds.ts uses pure Web Audio synthesis (no MP3 files) for all UI sounds. "
    "This is intentional (zero file deps) but the SFX system in sound-manager.ts "
    "is a separate parallel system - no integration between them."
)

# === FINAL JSON ===
audit = {
    "generatedAt": "2026-03-11",
    "music": {
        "tracks": music_tracks,
        "byCategory": {k: {"count": v["count"], "totalSizeMB": round(v["totalSizeMB"], 2)}
                       for k, v in sorted(music_by_category.items())},
        "totalTracks": len(music_tracks),
        "totalSizeMB": round(music_total_kb / 1024, 2),
        "usedInCode": music_used_count,
        "notUsedInCode": len(music_tracks) - music_used_count,
        "notes": [
            "Only main-theme.mp3 and boss-battle.mp3 (at music root) are at paths the runtime code actually resolves.",
            "All subdirectory tracks (gameplay/, battle/, characters/, etc.) are NOT referenced by DEFAULT_ZONE_TRACKS.",
            "The TRACK_MANIFEST (44 tracks) exists in music-manifest.json but the jukebox reads it from music-manager.ts TRACK_MANIFEST constant which has different/wrong paths.",
        ],
    },
    "sfx": {
        "files": sfx_files,
        "totalFiles": len(sfx_files),
        "totalSizeKB": round(sum(f["sizeKB"] for f in sfx_files), 1),
        "usedInCode": sfx_used,
        "notUsedInCode": len(sfx_files) - sfx_used,
        "notes": [
            "All 16 SFX files are referenced in sound-manager.ts SFX_FILES map.",
            "SFX files are tiny (8-49 KB each) because they are short Web Audio-generated MP3s.",
            "sound-manager.ts has dual system: tries MP3 first, falls back to Web Audio synthesis.",
            "ui-sounds.ts (used by use-sound-effect hook) uses ONLY Web Audio synthesis - no SFX files.",
        ],
    },
    "voices": {
        "characters": voice_chars_list,
        "previewFiles": voice_preview_files,
        "totalFiles": total_voice_files,
        "totalMainFiles": sum(len(c["files"]) for c in voice_chars_list),
        "totalArchivedFiles": sum(len(c["archivedFiles"]) for c in voice_chars_list),
        "totalPreviewFiles": len(voice_preview_files),
        "totalSizeMB": round(sum(c["totalSizeKB"] for c in voice_chars_list) / 1024, 2),
        "charactersWithVoices": chars_with_voices,
        "charactersWithoutVoices": len(chars_without),
        "charactersWithoutVoicesList": chars_without,
        "notes": [
            "Voices are ElevenLabs Voice Design v3 generated MP3s with ffmpeg post-processing.",
            "Each character has processed (main) and raw files in main folder.",
            "Old version archives in v1/, v2/, v3/ subdirs still exist.",
            "No voice playback system exists in the React app - voices are assets only.",
            "story.ts type has voiceClip field but no audio player for it.",
        ],
    },
    "codeIntegration": {
        "musicProvider": {
            "exists": True,
            "file": "src/components/audio/music-provider.tsx",
            "pagesUsing": [
                "src/components/providers/app-providers.tsx (wraps entire app)",
                "src/app/(app)/jukebox/page.tsx",
                "src/app/(app)/settings/page.tsx",
                "src/components/layout/sidebar.tsx",
                "src/components/audio/jukebox.tsx",
            ],
            "systemDescription": "MusicManager (Web Audio API) with zone-based playback, crossfading, stingers, holiday overrides. Route-to-zone mapping auto-plays music per page.",
            "criticalIssue": "DEFAULT_ZONE_TRACKS paths do not match actual file locations. Most zones will silently 404.",
        },
        "sfxSystem": {
            "exists": True,
            "files": ["src/lib/audio/sound-manager.ts", "src/lib/audio/ui-sounds.ts", "src/hooks/use-sound-effect.ts"],
            "componentsUsing": [
                "src/components/layout/header.tsx (click, navigate)",
                "src/components/layout/sidebar.tsx (navigate)",
                "src/components/layout/bottom-tabs.tsx (navigate)",
                "src/app/(app)/home/home-client.tsx (achievement, navigate)",
                "src/app/(app)/settings/page.tsx (sound controls)",
            ],
            "systemDescription": "Two parallel sound systems: (1) sound-manager.ts plays MP3 SFX with Web Audio fallback; (2) ui-sounds.ts pure Web Audio synthesis used by use-sound-effect hook. Settings page controls SFX volume/enable.",
            "note": "use-sound-effect uses ui-sounds (synthesis only). soundManager is also a singleton but not via React context.",
        },
        "voiceSystem": {
            "exists": False,
            "filesExist": ["src/lib/audio/voice-generate-all-hebrew.mjs (generation script, not runtime)", "src/data/story/*.ts (voiceClip field in story beats)"],
            "componentsUsing": [],
            "systemDescription": "No runtime voice playback system. Voice files exist as static assets but nothing in the app loads or plays them. Story beats have a voiceClip optional field but no audio player component.",
        },
    },
    "issues": issues,
    "summary": {
        "totalAudioFiles": len(music_tracks) + len(sfx_files) + total_voice_files,
        "totalMusicTracks": len(music_tracks),
        "totalSFXFiles": len(sfx_files),
        "totalVoiceFiles": total_voice_files,
        "estimatedTotalSizeMB": round(
            music_total_kb / 1024 +
            sum(f["sizeKB"] for f in sfx_files) / 1024 +
            sum(c["totalSizeKB"] for c in voice_chars_list) / 1024 +
            sum(f["sizeKB"] for f in voice_preview_files) / 1024,
            1
        ),
        "criticalIssues": 3,
        "qualityIssues": 3,
        "missingFiles": 21,
        "duplicateFilePairs": 6,
    }
}

out_path = "C:/Users/eladj/projects/ninja-keyboard/docs/audio-audit.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2, ensure_ascii=False)

print(f"Wrote audit to {out_path}")
print(f"Total music tracks: {audit['music']['totalTracks']}")
print(f"Total music size: {audit['music']['totalSizeMB']} MB")
print(f"Music used in code: {audit['music']['usedInCode']} / {audit['music']['totalTracks']}")
print(f"Total SFX: {audit['sfx']['totalFiles']} files, {audit['sfx']['totalSizeKB']} KB")
print(f"SFX used in code: {audit['sfx']['usedInCode']} / {audit['sfx']['totalFiles']}")
print(f"Total voice files: {audit['voices']['totalFiles']}")
print(f"Characters with voices: {audit['voices']['charactersWithVoices']}")
print(f"Characters without voices: {audit['voices']['charactersWithoutVoices']}")
print(f"Issues found: {len(issues)}")
