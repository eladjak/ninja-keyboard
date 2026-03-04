"""
Download all generated Ninja Keyboard audio tracks.
"""
import httpx
import os
import json

OUTPUT_DIR = "C:/Users/eladj/projects/ninja-keyboard/public/audio/music"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# All audio URLs extracted from API responses
tracks_to_download = [
    # Main Theme - 2 variants (~213s and ~218s)
    {
        "filename": "main-theme.mp3",
        "url": "https://cdn1.suno.ai/f0d0b762-26f1-4102-90b3-6cb114b0748f.mp3",
        "fallback_url": "https://tempfile.aiquickdraw.com/r/d732e5b3179e4ce09ea0386f7cebfda0.mp3",
        "duration": 213.92,
        "tags": "chiptune, 8-bit, Japanese game music, upbeat, adventure, kids game",
    },
    {
        "filename": "main-theme-v2.mp3",
        "url": "https://cdn1.suno.ai/9d825476-c15f-4d38-a074-879b399242d3.mp3",
        "fallback_url": "https://tempfile.aiquickdraw.com/r/eddc0936960d451f8f00721e944e8641.mp3",
        "duration": 217.88,
        "tags": "chiptune, 8-bit, Japanese game music, upbeat, adventure, kids game",
    },
    # Boss Battle - 2 variants (~292s and ~229s)
    {
        "filename": "boss-battle.mp3",
        "url": "https://cdn1.suno.ai/1b675736-b9a9-4c81-bda6-75612c60ac6e.mp3",
        "fallback_url": "https://tempfile.aiquickdraw.com/r/8b9b79b02e62430fac2d37c2322904d5.mp3",
        "duration": 292.04,
        "tags": "chiptune, orchestral, epic, intense, boss battle, 8-bit, dramatic",
    },
    {
        "filename": "boss-battle-v2.mp3",
        "url": "https://cdn1.suno.ai/4f1fc296-286a-4140-9906-865fa6ee205d.mp3",
        "fallback_url": "https://tempfile.aiquickdraw.com/r/cb2f7b16638b47849277a4fea5fd0766.mp3",
        "duration": 229.32,
        "tags": "chiptune, orchestral, epic, intense, boss battle, 8-bit, dramatic",
    },
    # Cover images
    {
        "filename": "main-theme-cover.jpg",
        "url": "https://cdn2.suno.ai/image_f0d0b762-26f1-4102-90b3-6cb114b0748f.jpeg",
        "fallback_url": "https://musicfile.removeai.ai/ZjBkMGI3NjItMjZmMS00MTAyLTkwYjMtNmNiMTE0YjA3NDhm.jpeg",
        "duration": 0,
        "tags": "",
    },
    {
        "filename": "boss-battle-cover.jpg",
        "url": "https://cdn2.suno.ai/image_1b675736-b9a9-4c81-bda6-75612c60ac6e.jpeg",
        "fallback_url": "https://musicfile.removeai.ai/MWI2NzU3MzYtYjlhOS00YzgxLWJkYTYtNzU2MTJjNjBhYzZl.jpeg",
        "duration": 0,
        "tags": "",
    },
]

results = []

for item in tracks_to_download:
    filename = item["filename"]
    print(f"\nDownloading: {filename} ({item['duration']:.0f}s)")

    success = False
    for url_key in ["url", "fallback_url"]:
        url = item[url_key]
        print(f"  Trying: {url[:70]}...")
        try:
            r = httpx.get(url, timeout=180, follow_redirects=True)
            if r.status_code == 200 and len(r.content) > 1000:
                path = os.path.join(OUTPUT_DIR, filename)
                with open(path, "wb") as f:
                    f.write(r.content)
                kb = len(r.content) / 1024
                print(f"  Saved: {path} ({kb:.0f} KB)")
                results.append({"filename": filename, "status": "ok", "size_kb": round(kb)})
                success = True
                break
            else:
                print(f"  Failed: HTTP {r.status_code}, size={len(r.content)}")
        except Exception as e:
            print(f"  Error: {e}")

    if not success:
        results.append({"filename": filename, "status": "failed"})

# Summary
print("\n" + "=" * 60)
print("DOWNLOAD RESULTS")
print("=" * 60)
for r in results:
    status = r["status"]
    size = f"({r.get('size_kb', 0)} KB)" if status == "ok" else ""
    print(f"  {'OK' if status=='ok' else 'FAIL'}  {r['filename']} {size}")

print(f"\nFiles in {OUTPUT_DIR}:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    path = os.path.join(OUTPUT_DIR, f)
    size = os.path.getsize(path)
    print(f"  {f} ({size/1024:.0f} KB)")

# Save manifest
manifest = {
    "generated_tracks": [
        {
            "name": "main-theme",
            "title": "Ninja Keyboard Main Theme",
            "description": "Happy energetic chiptune ninja game theme for kids",
            "style": "chiptune, 8-bit, Japanese game music, upbeat, adventure, kids game",
            "files": ["main-theme.mp3", "main-theme-v2.mp3"],
            "durations": [213.92, 217.88],
            "cover": "main-theme-cover.jpg",
        },
        {
            "name": "boss-battle",
            "title": "Boss Battle",
            "description": "Epic intense boss battle music for the rival/challenge mode",
            "style": "chiptune, orchestral, epic, intense, boss battle, 8-bit, dramatic",
            "files": ["boss-battle.mp3", "boss-battle-v2.mp3"],
            "durations": [292.04, 229.32],
            "cover": "boss-battle-cover.jpg",
        }
    ],
    "not_generated": [
        {
            "name": "practice-mode",
            "reason": "Insufficient credits (needed 25 more credits)",
            "prompt": "Calm relaxing lo-fi typing music, soft piano and ambient pads"
        },
        {
            "name": "victory-fanfare",
            "reason": "Insufficient credits",
            "prompt": "Short triumphant victory fanfare, brass and chiptune"
        },
        {
            "name": "character-unlock",
            "reason": "Insufficient credits",
            "prompt": "Magical sparkle jingle, whimsical discovery music"
        }
    ]
}

manifest_path = os.path.join(OUTPUT_DIR, "music-manifest.json")
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
print(f"\nManifest saved: {manifest_path}")
