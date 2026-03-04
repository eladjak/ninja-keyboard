"""
Poll for task completion and download audio files.
"""
import httpx
import json
import os
import time

API_KEY = "20c9ce8e9c49318f28237957ddd3312c"
BASE_URL = "https://api.sunoapi.org"
OUTPUT_DIR = "C:/Users/eladj/projects/ninja-keyboard/public/audio/music"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Task IDs from previous step
task_ids = {
    "main-theme": "fa155092bcf10030365bd68066f0d384",
    "boss-battle": "cbe7f0ca572817a2b51f0f78bd832473",
}

def check_status(task_id):
    r = httpx.get(
        f"{BASE_URL}/api/v1/generate/record-info",
        headers=headers,
        params={"taskId": task_id},
        timeout=30
    )
    return r.json()

def download_file(url, filename):
    print(f"  Downloading: {url[:80]}...")
    r = httpx.get(url, timeout=180, follow_redirects=True)
    if r.status_code == 200:
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, "wb") as f:
            f.write(r.content)
        kb = len(r.content) / 1024
        print(f"  Saved: {path} ({kb:.0f} KB)")
        return True
    else:
        print(f"  Download failed: HTTP {r.status_code}")
        return False

results = {}
pending = dict(task_ids)
max_wait = 600  # 10 minutes
start = time.time()

print(f"Polling {len(pending)} tasks...")
print(f"Tasks: {list(pending.keys())}")
print()

poll_count = 0
while pending and (time.time() - start) < max_wait:
    poll_count += 1
    elapsed = int(time.time() - start)
    print(f"[Poll #{poll_count} | {elapsed}s elapsed] Checking {len(pending)} pending task(s)...")

    completed_names = []
    for track_name, task_id in pending.items():
        status = check_status(task_id)
        code = status.get("code", -1)

        if code != 200:
            print(f"  {track_name}: API error code={code} msg={status.get('msg','?')}")
            continue

        data = status.get("data", {})
        suno_data = data.get("sunoData", [])
        task_state = data.get("status", data.get("callbackType", "?"))

        print(f"  {track_name}: task_state={task_state}, tracks={len(suno_data)}")

        # Show full data on first poll
        if poll_count == 1:
            print(f"  Full response: {json.dumps(data, indent=2)[:800]}")

        audio_found = []
        for i, track in enumerate(suno_data):
            audio_url = track.get("audioUrl", "")
            image_url = track.get("imageUrl", "")
            track_state = track.get("status", track.get("state", "?"))
            print(f"    Track[{i}]: state={track_state}, audio={'YES' if audio_url else 'no'}")

            if audio_url:
                audio_found.append({
                    "url": audio_url,
                    "filename": f"{track_name}.mp3" if i == 0 else f"{track_name}-v{i+1}.mp3",
                    "image_url": image_url,
                })

        if audio_found:
            print(f"  => Downloading {len(audio_found)} file(s) for {track_name}!")
            downloaded = []
            for a in audio_found:
                if download_file(a["url"], a["filename"]):
                    downloaded.append(a["filename"])
                # Also download cover image if available
                if a.get("image_url"):
                    img_filename = a["filename"].replace(".mp3", ".jpg")
                    download_file(a["image_url"], img_filename)

            results[track_name] = {"status": "success", "files": downloaded}
            completed_names.append(track_name)

        elif task_state in ("FAILED", "failed", "error"):
            print(f"  => Task FAILED for {track_name}")
            results[track_name] = {"status": "failed", "task_id": task_id}
            completed_names.append(track_name)

    for name in completed_names:
        del pending[name]

    if pending:
        wait_secs = 20
        print(f"\nStill waiting for: {list(pending.keys())}. Sleeping {wait_secs}s...\n")
        time.sleep(wait_secs)

# Mark any still-pending as timeout
for track_name, task_id in pending.items():
    results[track_name] = {"status": "timeout", "task_id": task_id}

# Summary
print("\n" + "=" * 60)
print("DOWNLOAD SUMMARY")
print("=" * 60)
for track_name, result in results.items():
    status = result.get("status")
    files = result.get("files", [])
    print(f"  {track_name}: {status}")
    for f in files:
        print(f"    -> public/audio/music/{f}")

# Show what's in the output dir
print(f"\nFiles in {OUTPUT_DIR}:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
    print(f"  {f} ({size/1024:.0f} KB)")

# Save results
results_path = os.path.join(OUTPUT_DIR, "generation-results.json")
with open(results_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nResults saved to: {results_path}")
