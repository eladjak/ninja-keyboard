"""
Inspect full response structure for completed tasks.
"""
import httpx
import json

API_KEY = "20c9ce8e9c49318f28237957ddd3312c"
BASE_URL = "https://api.sunoapi.org"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

task_ids = {
    "main-theme": "fa155092bcf10030365bd68066f0d384",
    "boss-battle": "cbe7f0ca572817a2b51f0f78bd832473",
}

for track_name, task_id in task_ids.items():
    print(f"\n{'='*60}")
    print(f"Task: {track_name} ({task_id})")
    print(f"{'='*60}")

    r = httpx.get(
        f"{BASE_URL}/api/v1/generate/record-info",
        headers=headers,
        params={"taskId": task_id},
        timeout=30
    )
    result = r.json()
    # Print FULL response
    print(json.dumps(result, indent=2))
