"""
Submit music generation tasks (async, no wait).
"""
import httpx
import json
import os

API_KEY = "20c9ce8e9c49318f28237957ddd3312c"
BASE_URL = "https://api.sunoapi.org"
CALLBACK_URL = "https://example.com/webhook/ninja-keyboard"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

TRACKS = [
    {
        "name": "main-theme",
        "title": "Ninja Keyboard Main Theme",
        "prompt": "Happy energetic chiptune ninja game theme for kids, 8-bit retro meets modern, Japanese taiko drums, upbeat adventure melody, 110 BPM, loopable, heroic",
        "style": "chiptune, 8-bit, Japanese game music, upbeat, adventure, kids game",
    },
    {
        "name": "boss-battle",
        "title": "Boss Battle",
        "prompt": "Epic intense boss battle music, dramatic chiptune, fast paced 140 BPM, tension building, heroic kids game style, orchestra hits with 8-bit sounds",
        "style": "chiptune, orchestral, epic, intense, boss battle, 8-bit, dramatic",
    },
    {
        "name": "practice-mode",
        "title": "Practice Mode",
        "prompt": "Calm relaxing lo-fi typing music, soft piano and ambient pads, gentle rhythm 70 BPM, focus and concentration, zen garden atmosphere, peaceful",
        "style": "lo-fi, ambient, calm, focus music, piano, soft, relaxing",
    },
    {
        "name": "victory-fanfare",
        "title": "Victory Fanfare",
        "prompt": "Short triumphant victory fanfare, brass and chiptune, celebratory kids game jingle, triumphant and joyful",
        "style": "fanfare, chiptune, brass, triumphant, victory, kids game, jingle",
    },
    {
        "name": "character-unlock",
        "title": "Character Unlock",
        "prompt": "Magical sparkle jingle, whimsical discovery music, treasure chest opening, chiptune bells, magical and wonderful",
        "style": "magical, chiptune, bells, whimsical, short jingle, discovery",
    },
]

task_ids = {}

for track in TRACKS:
    payload = {
        "instrumental": True,
        "model": "V3_5",
        "wait_audio": False,
        "customMode": True,
        "prompt": track["prompt"],
        "style": track["style"],
        "title": track["title"],
        "callBackUrl": CALLBACK_URL,
    }

    try:
        r = httpx.post(f"{BASE_URL}/api/v1/generate", headers=headers, json=payload, timeout=30)
        result = r.json()
        code = result.get("code", -1)
        if code == 200:
            task_id = result.get("data", {}).get("taskId", "")
            print(f"OK  {track['name']}: taskId={task_id}")
            task_ids[track["name"]] = task_id
        else:
            print(f"ERR {track['name']}: code={code} msg={result.get('msg','?')}")
            task_ids[track["name"]] = None
    except Exception as e:
        print(f"EXC {track['name']}: {e}")
        task_ids[track["name"]] = None

# Save task IDs
with open("C:/Users/eladj/projects/ninja-keyboard/scripts/task_ids.json", "w") as f:
    json.dump(task_ids, f, indent=2)

print("\nSaved task IDs to task_ids.json")
print(json.dumps(task_ids, indent=2))
