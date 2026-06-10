#!/usr/bin/env python3
"""SubwayRunner 3D Asset Generator using Hyper3D Rodin API.

Generates GLB models for the endless runner game, compresses with gltf-transform,
and validates output. Adapted from pferdehof pipeline.

Usage:
  python3 scripts/rodin_generate.py --dry-run          # Preview what would be generated
  python3 scripts/rodin_generate.py --tier 1            # Generate tier 1 only
  python3 scripts/rodin_generate.py --tier 1,2,3        # All tiers
  python3 scripts/rodin_generate.py --only player,apple # Specific assets
  python3 scripts/rodin_generate.py --max-credits 20    # Credit limit
"""

from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# --- Config ---
HYPER3D_API_URL = "https://hyperhuman.deemos.com/api/v2/rodin"
HYPER3D_STATUS_URL = "https://hyperhuman.deemos.com/api/v2/status"
HYPER3D_DOWNLOAD_URL = "https://hyperhuman.deemos.com/api/v2/download"
HYPER3D_BALANCE_URL = "https://hyperhuman.deemos.com/api/v2/check_balance"
POLL_INTERVAL = 8
MAX_POLL_TIME = 600
CREDIT_PER_JOB = 0.5

SCRIPT_DIR = Path(__file__).resolve().parent
MODELS_DIR = SCRIPT_DIR.parent / "models"
STATE_PATH = SCRIPT_DIR / "rodin_state.json"

GLB_MAGIC = b"glTF"

# --- Style suffix appended to all prompts ---
STYLE_SUFFIX = (
    "Colorful cartoon game style, vibrant saturated colors, clean low-poly geometry, "
    "matte clay-like surface, soft studio lighting, white background. "
    "Game-ready 3D asset, single object centered, no ground plane."
)

# --- Asset definitions: id -> {prompt, tier, max_attempts} ---
ASSETS = {
    # Tier 1 — always visible, highest impact
    "player": {
        "prompt": "A cartoon urban runner kid character in T-pose, full body visible. "
                  "Wearing bright blue hoodie, dark navy pants, black sneakers with neon green stripes, "
                  "red backpack on back, orange baseball cap. Golden skin tone, large expressive eyes, "
                  "cheerful expression. Athletic kid build, about 12 years old.",
        "tier": 1, "max_attempts": 3
    },
    "apple": {
        "prompt": "A shiny cartoon red apple with short brown stem and small green leaf on top. "
                  "Glossy surface, bright saturated red color, game collectible item, simple shape.",
        "tier": 1, "max_attempts": 2
    },
    "broccoli": {
        "prompt": "A cute cartoon broccoli vegetable standing upright. Dark green rounded floret cluster "
                  "on top of a light green thick stem. Game collectible item, simple chunky shape.",
        "tier": 1, "max_attempts": 2
    },
    "obstacle_lowbarrier": {
        "prompt": "A cartoon orange traffic construction barrier with diagonal yellow and black warning stripes. "
                  "Two legs at the bottom, flat top beam. Urban road construction obstacle, simple blocky shape.",
        "tier": 1, "max_attempts": 2
    },
    "obstacle_jumpblock": {
        "prompt": "A cartoon gray concrete cinder block cube with visible cracks and rough surface texture. "
                  "Square proportions, urban construction debris obstacle. Chunky solid block.",
        "tier": 1, "max_attempts": 2
    },
    "obstacle_duckbeam": {
        "prompt": "A cartoon steel I-beam floating horizontally at head height, industrial blue-gray metal "
                  "with visible bolts and rivets. Two thin vertical support poles on each end. "
                  "Construction site overhead obstacle.",
        "tier": 1, "max_attempts": 2
    },
    "env_streetlamp": {
        "prompt": "A cartoon urban street lamp post. Tall dark gray metal pole with decorative base, "
                  "warm glowing yellow round lamp bulb on top in a classic lantern housing. City furniture prop.",
        "tier": 1, "max_attempts": 2
    },
    "env_trafficsign": {
        "prompt": "A cartoon urban traffic sign on a thin metal post. Red octagonal stop sign shape "
                  "with white border. Simple clean city street prop.",
        "tier": 1, "max_attempts": 2
    },

    # Tier 2 — frequently visible
    "obstacle_spikes": {
        "prompt": "A cartoon orange-red metal spike cone pointing upward, dangerous ground hazard. "
                  "Single sharp cone shape with metallic sheen, sits on a small circular base plate.",
        "tier": 2, "max_attempts": 2
    },
    "obstacle_hurdleset": {
        "prompt": "A cartoon green athletic hurdle for track and field. Two vertical posts connected by "
                  "a horizontal green bar with a yellow warning stripe. Sport jumping obstacle.",
        "tier": 2, "max_attempts": 2
    },
    "obstacle_wallgap": {
        "prompt": "A cartoon industrial concrete wall with an archway gap at the bottom center to duck through. "
                  "Gray concrete texture, small red warning light on top. Solid rectangular wall with passage.",
        "tier": 2, "max_attempts": 2
    },
    "obstacle_rotatingblade": {
        "prompt": "A cartoon industrial spinning fan hazard. Central gray cylindrical hub with three flat "
                  "dark red blades extending outward like a propeller. Dangerous mechanical obstacle.",
        "tier": 2, "max_attempts": 2
    },
    "obstacle_swinghammer": {
        "prompt": "A cartoon pendulum hammer trap. Gray vertical support post with a swinging brown arm "
                  "and large dark metallic hammerhead at the bottom. Medieval-industrial obstacle.",
        "tier": 2, "max_attempts": 2
    },
    "obstacle_bouncingball": {
        "prompt": "A cartoon glowing orange rubber bouncing ball. Perfectly spherical, bright orange color "
                  "with a subtle inner glow effect. Game hazard ball, smooth surface.",
        "tier": 2, "max_attempts": 2
    },
    "env_building_1": {
        "prompt": "A cartoon urban apartment building, rectangular shape, about 5 stories tall. "
                  "Beige-brown facade with rows of small lit yellow windows. Flat rooftop with a small "
                  "AC unit. Simple city skyline background building.",
        "tier": 2, "max_attempts": 2
    },

    # Tier 3 — nice to have
    "obstacle_movingwall": {
        "prompt": "A cartoon sliding industrial wall panel. Flat gray concrete slab with alternating "
                  "yellow and red diagonal warning stripes. Simple rectangular moving obstacle.",
        "tier": 3, "max_attempts": 1
    },
    "obstacle_spinninglaser": {
        "prompt": "A cartoon sci-fi laser emitter hub. Dark gray cylindrical base with two extending "
                  "thin red glowing beam arms on opposite sides. Futuristic spinning hazard device.",
        "tier": 3, "max_attempts": 1
    },
    "env_building_2": {
        "prompt": "A cartoon narrow urban townhouse building, about 4 stories. Warm brick-red facade "
                  "with small balconies and flower boxes. Pointed roof. European city architecture.",
        "tier": 3, "max_attempts": 1
    },
    "env_building_3": {
        "prompt": "A cartoon wide modern office building, about 6 stories. Blue-gray glass facade "
                  "with a rooftop antenna. Corporate urban architecture, clean geometric shape.",
        "tier": 3, "max_attempts": 1
    },
    "env_tunnelpipe": {
        "prompt": "A cartoon industrial ceiling pipe segment. Gray metal tube with two bracket clamps. "
                  "Horizontal pipe section, subway tunnel infrastructure prop.",
        "tier": 3, "max_attempts": 1
    },
}


# --- SSL ---
def _make_ssl_context() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    try:
        import certifi
        ctx.load_verify_locations(certifi.where())
    except Exception:
        ctx.load_default_certs()
    return ctx

_SSL_CTX = _make_ssl_context()


# --- API Key ---
def get_api_key() -> str:
    key = os.environ.get("HYPER3D_API_KEY", "")
    if key:
        return key
    keyfile = Path.home() / ".hyper3d_api_key"
    if keyfile.exists():
        return keyfile.read_text().strip()
    raise RuntimeError("HYPER3D_API_KEY not found (set env or ~/.hyper3d_api_key)")


# --- HTTP helpers ---
def http_get_json(url: str, headers: dict) -> dict:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=30, context=_SSL_CTX) as resp:
        return json.loads(resp.read().decode())


def http_post_json(url: str, data: dict, headers: dict) -> dict:
    body = json.dumps(data).encode()
    hdrs = {"Content-Type": "application/json", **headers}
    req = urllib.request.Request(url, data=body, headers=hdrs, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        raise RuntimeError(f"HTTP {e.code}: {error_body[:500]}") from e


def multipart_text_only(url: str, fields: dict, headers: dict) -> dict:
    import uuid
    boundary = uuid.uuid4().hex
    body = b""
    for key, value in fields.items():
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{value}\r\n".encode()
    body += f"--{boundary}--\r\n".encode()
    req_headers = {"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    req = urllib.request.Request(url, data=body, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120, context=_SSL_CTX) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        raise RuntimeError(f"HTTP {e.code}: {error_body[:500]}") from e


# --- API calls ---
def check_balance(api_key: str) -> float:
    headers = {"Authorization": f"Bearer {api_key}"}
    result = http_get_json(HYPER3D_BALANCE_URL, headers)
    return float(result.get("balance", 0))


def submit_generation(api_key: str, prompt: str) -> tuple[str, str]:
    headers = {"Authorization": f"Bearer {api_key}"}
    full_prompt = f"{prompt} {STYLE_SUFFIX}"
    fields = {
        "prompt": full_prompt,
        "tier": "Regular",
        "mesh_format": "glb",
        "quality": "high",
    }
    result = multipart_text_only(HYPER3D_API_URL, fields, headers)
    task_uuid = result.get("uuid", "")
    jobs = result.get("jobs", {})
    sub_key = jobs.get("subscription_key", "") if isinstance(jobs, dict) else ""
    if not task_uuid or not sub_key:
        raise RuntimeError(f"Incomplete API response: {json.dumps(result)[:500]}")
    return task_uuid, sub_key


def poll_until_done(api_key: str, sub_key: str) -> None:
    headers = {"Authorization": f"Bearer {api_key}"}
    start = time.time()
    while True:
        elapsed = time.time() - start
        if elapsed > MAX_POLL_TIME:
            raise RuntimeError(f"Timed out after {MAX_POLL_TIME}s")
        time.sleep(POLL_INTERVAL)
        status = http_post_json(HYPER3D_STATUS_URL, {"subscription_key": sub_key}, headers)
        jobs = status.get("jobs", [])
        statuses = [j.get("status", "?") for j in jobs]
        done = sum(1 for s in statuses if s == "Done")
        print(f"    [{int(elapsed)}s] {done}/{len(statuses)} done {statuses}")
        if all(s == "Done" for s in statuses) and statuses:
            return
        if any(s in ("Failed", "Error", "Cancelled") for s in statuses):
            raise RuntimeError(f"Generation failed: {statuses}")


def download_glb(api_key: str, task_uuid: str, output_path: Path) -> None:
    headers = {"Authorization": f"Bearer {api_key}"}
    result = http_post_json(HYPER3D_DOWNLOAD_URL, {"task_uuid": task_uuid}, headers)
    items = result.get("list", [])
    model_url = None
    for item in items:
        url = item.get("url", "") if isinstance(item, dict) else str(item)
        if ".glb" in url:
            model_url = url
            break
    if not model_url and items:
        first = items[0]
        model_url = first.get("url", "") if isinstance(first, dict) else str(first)
    if not model_url:
        raise RuntimeError(f"No download URL: {json.dumps(result)[:500]}")
    req = urllib.request.Request(model_url)
    with urllib.request.urlopen(req, timeout=120, context=_SSL_CTX) as resp:
        data = resp.read()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(data)


def compress_glb(path: Path) -> tuple[bool, str]:
    import shutil
    import subprocess
    command = shutil.which("gltf-transform")
    if not command:
        return False, "gltf-transform not found"
    temp = path.with_suffix(".compressed.glb")
    try:
        result = subprocess.run(
            [command, "optimize", str(path), str(temp),
             "--compress", "draco", "--texture-compress", "webp"],
            capture_output=True, text=True, timeout=180, check=False,
        )
        if result.returncode != 0:
            if temp.exists():
                temp.unlink()
            return False, f"gltf-transform failed: {(result.stderr or '')[:200]}"
        before = path.stat().st_size
        after = temp.stat().st_size
        temp.replace(path)
        ratio = after * 100 // before if before > 0 else 100
        return True, f"{before // 1024}KB -> {after // 1024}KB ({ratio}%)"
    except Exception as e:
        if temp.exists():
            temp.unlink()
        return False, str(e)


def validate_glb(path: Path, max_mb: float = 50.0) -> tuple[bool, str]:
    """Validate GLB file. max_mb=50 for raw, max_mb=5 for compressed."""
    if not path.exists():
        return False, "File does not exist"
    size = path.stat().st_size
    if size < 100:
        return False, f"Too small: {size} bytes"
    magic = path.read_bytes()[:4]
    if magic != GLB_MAGIC:
        return False, f"Invalid magic bytes: {magic!r}"
    if size > max_mb * 1024 * 1024:
        return False, f"Too large: {size / 1024 / 1024:.1f} MB (limit {max_mb} MB)"
    return True, f"OK ({size / 1024:.0f} KB)"


# --- State management ---
def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"models": {}, "credits_used": 0.0, "balance_start": 0.0}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, ensure_ascii=False))


# --- Main ---
def generate_asset(api_key: str, asset_id: str, asset_def: dict, state: dict) -> bool:
    output_path = MODELS_DIR / f"{asset_id}.glb"

    # Skip if already accepted
    model_state = state["models"].get(asset_id, {})
    if model_state.get("status") == "ACCEPTED":
        print(f"  [SKIP] {asset_id} — already accepted")
        return True

    attempts = model_state.get("attempts", 0)
    max_attempts = asset_def.get("max_attempts", 2)
    if attempts >= max_attempts:
        print(f"  [SKIP] {asset_id} — max attempts reached ({attempts}/{max_attempts})")
        return False

    print(f"\n{'='*60}")
    print(f"  Generating: {asset_id} (attempt {attempts + 1}/{max_attempts})")
    print(f"{'='*60}")

    try:
        # Submit
        print(f"  Submitting to Hyper3D Rodin...")
        task_uuid, sub_key = submit_generation(api_key, asset_def["prompt"])
        print(f"  Task UUID: {task_uuid[:16]}...")

        # Poll
        print(f"  Polling status (interval: {POLL_INTERVAL}s)...")
        poll_until_done(api_key, sub_key)

        # Download
        print(f"  Downloading GLB...")
        download_glb(api_key, task_uuid, output_path)

        # Pre-compression validation (lenient — raw Hyper3D files are 10-15 MB)
        ok, msg = validate_glb(output_path, max_mb=50.0)
        if not ok:
            raise RuntimeError(f"Raw validation failed: {msg}")
        print(f"  Raw file: {msg}")

        # Compress (critical — reduces 10-14 MB to 500 KB-1.2 MB)
        print(f"  Compressing (DRACO + WebP)...")
        comp_ok, comp_msg = compress_glb(output_path)
        if comp_ok:
            print(f"  Compressed: {comp_msg}")
        else:
            print(f"  Compression skipped: {comp_msg}")

        # Post-compression validation (strict)
        ok, msg = validate_glb(output_path, max_mb=5.0)
        if not ok:
            raise RuntimeError(f"Post-compression validation failed: {msg}")

        # Update state
        state["models"][asset_id] = {
            "status": "ACCEPTED",
            "attempts": attempts + 1,
            "output_size_kb": output_path.stat().st_size // 1024,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        state["credits_used"] = state.get("credits_used", 0) + CREDIT_PER_JOB
        save_state(state)

        print(f"  ACCEPTED: {asset_id} ({output_path.stat().st_size // 1024} KB)")
        return True

    except Exception as e:
        print(f"  FAILED: {asset_id} — {e}")
        state["models"][asset_id] = {
            "status": "FAILED",
            "attempts": attempts + 1,
            "error": str(e)[:200],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        save_state(state)
        return False


def main():
    parser = argparse.ArgumentParser(description="SubwayRunner Hyper3D Asset Generator")
    parser.add_argument("--dry-run", action="store_true", help="Preview without generating")
    parser.add_argument("--tier", type=str, default="1,2,3", help="Tiers to generate (e.g., '1' or '1,2')")
    parser.add_argument("--only", type=str, default="", help="Comma-separated asset IDs to generate")
    parser.add_argument("--max-credits", type=float, default=20.0, help="Maximum credits to spend")
    parser.add_argument("--api-key", type=str, default="", help="Hyper3D API key (overrides env/file)")
    args = parser.parse_args()

    # API key
    api_key = args.api_key or get_api_key()

    # Filter assets
    tiers = set(int(t) for t in args.tier.split(","))
    if args.only:
        only_ids = set(args.only.split(","))
        assets = {k: v for k, v in ASSETS.items() if k in only_ids}
    else:
        assets = {k: v for k, v in ASSETS.items() if v["tier"] in tiers}

    # Sort by tier (lower = higher priority)
    sorted_assets = sorted(assets.items(), key=lambda x: x[1]["tier"])

    # Check balance
    balance = check_balance(api_key)
    print(f"\nHyper3D Balance: {balance} credits")
    print(f"Max credits for this run: {args.max_credits}")
    print(f"Assets to generate: {len(sorted_assets)}")
    print(f"Estimated cost: {sum(v.get('max_attempts', 2) for _, v in sorted_assets) * CREDIT_PER_JOB:.1f} credits (worst case)")

    if args.dry_run:
        print(f"\n--- DRY RUN ---")
        for asset_id, asset_def in sorted_assets:
            print(f"  [{asset_def['tier']}] {asset_id} (max {asset_def['max_attempts']} attempts)")
            print(f"      {asset_def['prompt'][:80]}...")
        print(f"\nTotal: {len(sorted_assets)} assets")
        return

    # Load state
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    state = load_state()
    state["balance_start"] = balance

    # Generate
    accepted = 0
    failed = 0
    for asset_id, asset_def in sorted_assets:
        # Credit guard
        if state.get("credits_used", 0) >= args.max_credits:
            print(f"\n  Credit limit reached ({args.max_credits}). Stopping.")
            break

        # Balance guard
        current_balance = balance - state.get("credits_used", 0)
        if current_balance < CREDIT_PER_JOB:
            print(f"\n  Balance too low ({current_balance:.1f}). Stopping.")
            break

        if generate_asset(api_key, asset_id, asset_def, state):
            accepted += 1
        else:
            failed += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"  SUMMARY")
    print(f"{'='*60}")
    print(f"  Accepted: {accepted}")
    print(f"  Failed:   {failed}")
    print(f"  Credits used: {state.get('credits_used', 0):.1f}")
    print(f"  Balance remaining: {balance - state.get('credits_used', 0):.1f}")
    print(f"  Models in {MODELS_DIR}/")
    save_state(state)


if __name__ == "__main__":
    main()
