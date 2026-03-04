"""
Ninja Keyboard - Game Music Generator
Uses Suno API to generate all game music tracks.
"""

import httpx
import time
import json
import os
import sys

API_KEY = "20c9ce8e9c49318f28237957ddd3312c"
BASE_URL = "https://api.sunoapi.org"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = "C:/Users/eladj/projects/ninja-keyboard/public/audio/music"

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

# Dummy callback URL - required by API but we'll poll manually
CALLBACK_URL = "https://example.com/webhook/ninja-keyboard"


def generate_track(track: dict) -> dict:
    """Generate a single track using custom mode with wait_audio=True."""
    print(f"\n--- Generating: {track['title']} ---")

    payload = {
        "instrumental": True,
        "model": "V3_5",
        "wait_audio": True,   # Wait for completion inline
        "customMode": True,
        "prompt": track["prompt"],
        "style": track["style"],
        "title": track["title"],
        "callBackUrl": CALLBACK_URL,
    }

    print(f"Sending request (wait_audio=True, may take up to 5 min)...")

    try:
        response = httpx.post(
            f"{BASE_URL}/api/v1/generate",
            headers=headers,
            json=payload,
            timeout=360  # 6 minute timeout
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)[:2000]}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}


def generate_track_async(track: dict) -> dict:
    """Generate track without waiting, return task_id for polling."""
    print(f"\n--- Submitting (async): {track['title']} ---")

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
        response = httpx.post(
            f"{BASE_URL}/api/v1/generate",
            headers=headers,
            json=payload,
            timeout=60
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)[:500]}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}


def check_task_status(task_id: str) -> dict:
    """Poll for task status."""
    try:
        response = httpx.get(
            f"{BASE_URL}/api/v1/generate/record-info",
            headers=headers,
            params={"taskId": task_id},
            timeout=30
        )
        return response.json()
    except Exception as e:
        print(f"Error checking status: {e}")
        return {"error": str(e)}


def download_audio(url: str, filename: str) -> bool:
    """Download audio file to disk."""
    try:
        print(f"Downloading: {url[:80]}...")
        response = httpx.get(url, timeout=120, follow_redirects=True)
        if response.status_code == 200:
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(response.content)
            size_kb = len(response.content) / 1024
            print(f"Saved: {filepath} ({size_kb:.1f} KB)")
            return True
        else:
            print(f"Download failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"Download error: {e}")
        return False


def extract_audio_from_result(result: dict, track_name: str) -> list:
    """Extract audio URLs from a generation result."""
    audio_files = []
    data = result.get("data", {})

    if isinstance(data, dict):
        suno_data = data.get("sunoData", [])
        for i, track in enumerate(suno_data):
            audio_url = track.get("audioUrl", "")
            if audio_url:
                audio_files.append({
                    "url": audio_url,
                    "id": track.get("id", ""),
                    "filename": f"{track_name}.mp3" if i == 0 else f"{track_name}-{i+1}.mp3"
                })

    return audio_files


def wait_for_task(task_id: str, track_name: str, max_wait: int = 360) -> list:
    """Wait for task completion and return audio URLs."""
    print(f"\nPolling task {task_id}...")
    elapsed = 0
    poll_interval = 15

    while elapsed < max_wait:
        time.sleep(poll_interval)
        elapsed += poll_interval

        status = check_task_status(task_id)

        if "error" in status:
            print(f"[{elapsed}s] Error: {status['error']}")
            break

        data = status.get("data", {})
        suno_data = data.get("sunoData", [])
        task_status = data.get("status", data.get("callbackType", "unknown"))
        print(f"[{elapsed}s] task_status={task_status}, suno_data_count={len(suno_data)}")

        completed = []
        for i, track in enumerate(suno_data):
            audio_url = track.get("audioUrl", "")
            state = track.get("status", track.get("state", "unknown"))
            print(f"  Track {i}: state={state}, has_url={bool(audio_url)}")

            if audio_url:
                completed.append({
                    "url": audio_url,
                    "id": track.get("id", ""),
                    "filename": f"{track_name}.mp3" if i == 0 else f"{track_name}-{i+1}.mp3"
                })

        if completed:
            print(f"Complete! Found {len(completed)} track(s)")
            return completed

        if task_status in ("failed", "error", "FAILED"):
            print(f"Task failed: {task_status}")
            break

    return []


def get_credits() -> float:
    """Check available credits."""
    try:
        response = httpx.get(
            f"{BASE_URL}/api/v1/generate/credit",
            headers=headers,
            timeout=15
        )
        result = response.json()
        credits = result.get("data", 0)
        print(f"Available credits: {credits}")
        return float(credits)
    except Exception as e:
        print(f"Credits error: {e}")
        return 0


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("Ninja Keyboard - Music Generator")
    print("=" * 60)

    credits = get_credits()
    if credits <= 0:
        print("ERROR: No credits available!")
        return

    results = {}

    # Generate tracks one at a time with wait_audio=True for first track
    # to understand the response format, then async for the rest

    for i, track in enumerate(TRACKS):
        print(f"\n{'='*50}")
        print(f"Track {i+1}/{len(TRACKS)}: {track['name']}")
        print(f"{'='*50}")

        if i == 0:
            # First track: use wait_audio=True to see complete response
            result = generate_track(track)
        else:
            # Subsequent tracks: async
            result = generate_track_async(track)

        if "error" in result:
            results[track["name"]] = {"status": "error", "error": result["error"]}
            continue

        code = result.get("code", -1)
        if code != 200:
            msg = result.get("msg", "Unknown error")
            print(f"API error code {code}: {msg}")
            results[track["name"]] = {"status": "api_error", "error": msg}
            continue

        data = result.get("data", {})

        # Check if wait_audio returned completed tracks
        audio_files = extract_audio_from_result(result, track["name"])

        if audio_files:
            # Already have the audio URLs
            print(f"Got {len(audio_files)} audio URL(s) immediately!")
            downloaded = []
            for audio in audio_files:
                success = download_audio(audio["url"], audio["filename"])
                if success:
                    downloaded.append(audio["filename"])

            results[track["name"]] = {
                "status": "success",
                "files": downloaded
            }
        else:
            # Need to poll
            task_id = data.get("taskId", "")
            if not task_id:
                print(f"No taskId and no audio URLs in response!")
                results[track["name"]] = {"status": "failed", "error": "No taskId or audio"}
                continue

            print(f"Got taskId: {task_id}, will poll...")
            audio_files = wait_for_task(task_id, track["name"])

            if audio_files:
                downloaded = []
                for audio in audio_files:
                    success = download_audio(audio["url"], audio["filename"])
                    if success:
                        downloaded.append(audio["filename"])

                results[track["name"]] = {
                    "status": "success",
                    "task_id": task_id,
                    "files": downloaded
                }
            else:
                results[track["name"]] = {
                    "status": "timeout",
                    "task_id": task_id,
                    "files": []
                }

        # Small delay between tracks
        time.sleep(5)

        # Check remaining credits
        get_credits()

    # Print summary
    print("\n" + "=" * 60)
    print("GENERATION SUMMARY")
    print("=" * 60)
    for track_name, result in results.items():
        status = result.get("status", "unknown")
        files = result.get("files", [])
        print(f"  {track_name}: {status}")
        for f in files:
            print(f"    -> public/audio/music/{f}")

    # Save results JSON
    results_path = os.path.join(OUTPUT_DIR, "generation-results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {results_path}")

    return results


if __name__ == "__main__":
    main()
