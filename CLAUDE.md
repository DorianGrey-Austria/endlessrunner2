# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Multi-project endless runner game collection. **SubwayRunner** is the actively deployed production game.

| Project | Tech Stack | Status |
|---------|-----------|--------|
| **SubwayRunner** | Vanilla JS + Three.js (monolithic) | PRODUCTION - deployed to endlessrunner.vibecoding.company |
| SubwayRunner/src/ | React + R3F + Zustand + TypeScript | EXPERIMENTAL - not deployed |
| EndlessRunner-MVP, Endless3D, GestureRunnerPro | Various | Historical archives — ignore |

**Live**: https://endlessrunner.vibecoding.company/

---

## Commands

### SubwayRunner (Primary)
```bash
cd SubwayRunner

# Kill port before starting (MANDATORY - prevents conflicts)
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

npm install                    # Dependencies
npm run serve                  # Live-server for vanilla version (port 8001)
npm run dev                    # Managed Vite dev server (port 8037) - React version only
npm run dev:raw                # Direct Vite dev server on 8037
npm run dev:stop               # Stop only the React dev service
npm run test                   # Run test-runner.js (validates index.html) — has pretest hook
npm run test:watch             # Watch mode with nodemon
npm run predeploy              # Chains test + deploy-readiness check
npm run build                  # Production build - React version only
npm run lint                   # ESLint (0 warnings allowed)
```

### Playwright E2E Tests
```bash
cd SubwayRunner
npx playwright test                                    # Run all E2E tests
npx playwright test tests/e2e/game-start-health.spec.js  # Single test
npx playwright test --headed                           # With browser visible
npx playwright show-report                             # View HTML report
```

### Deployment

See [Deployment Pipeline](#deployment-pipeline) below for full CI/CD details.

```bash
# Auto-deploy (triggers both CI workflows on push to main)
git add . && git commit -m "VX.Y.Z: description" && git push

# Manual VPS deploy
./deploy.sh
```

### Versioning
Format: `MAJOR.MINOR.PATCH` (e.g. 4.5.10). Bump PATCH for fixes, MINOR for features, MAJOR for breaking changes. Update version in both `index.html` and `package.json`.

**Note**: `package.json` version and `index.html` `<title>` version can drift apart — always check both when bumping.

---

## Architecture

### Dual Architecture (CRITICAL)

**Production (deployed)**: `SubwayRunner/index.html`
- Monolithic vanilla JS (single large file) with embedded Three.js
- Three.js v0.158.0 via CDN, MediaPipe Tasks Vision API @0.10.34 (loaded on demand via `js/utils/MediaPipeLoader.js`)
- Global `gameState` object on `window` (score, lives, level, isPlaying)
- Supabase SDK intentionally removed to prevent identifier conflicts

**Experimental (NOT deployed)**: `SubwayRunner/src/`
- React 18 + R3F + Zustand 4.4 + TypeScript
- Never merged to production pipeline
- `npm run dev` starts on port 8037

### Module System (`SubwayRunner/js/`)

External JS modules deployed alongside `index.html`. Loaded as ES6 modules.

**GameCore** (`js/core/GameCore.js`): Registry pattern — modules register themselves and get initialized in order: `utils → levels → characters → ui → effects`. Late-registered modules auto-initialize.

**LevelManager** (`js/levels/LevelManager.js`): 10-level progression system. Level 1 is built into base game; Level 2+ registered dynamically via `registerLevel()`. Each level has `load()`, `update()`, `cleanup()` lifecycle.

**Gesture Control System** (3 root modules + Strategy Pattern modes):

| Module | Role |
|--------|------|
| `GestureManager.js` | Orchestrator — runtime mode switching, calibration persistence via localStorage |
| `GestureControllerProjector.js` | Legacy projector controller with Kalman filter (28KB, separate system) |
| `GestureController.js` | Legacy fallback controller |

Mode hierarchy in `js/modes/` (all optimized to April 2026 best practices):
```
BaseGestureMode.js               (abstract base + isFaceConfident() + calculateYaw/Pitch)
  ├─ AdaptiveCalibrationMode.js  (DEFAULT — 5s range learning, 45% sensitivity)
  ├─ OneEuroFilterMode.js        (fast mobile — 1.5s neutral snapshot)
  └─ BodyPoseMode.js             (TV/Beamer — real jumping/ducking at 2-4m)
```

All modes share: One Euro / Kalman filtering, dead zone (2°), hysteresis (30%), frame skipping (every 2nd frame), action cooldowns (300-400ms), confidence filtering, face/body-lost tracking.

**BodyPoseMode specifics**: Lean + Walk dual-lane detection, hybrid velocity+position jump detection (EMA-smoothed), floor calibration (15 frames, top-5 average), neutralX tracking.

**Reference**: `bestPractice_gestensteuerung.md` — complete documentation of all gesture best practices.

**Utilities**: `utils/MediaPipeLoader.js` (shared WASM singleton for MediaPipe Tasks Vision @0.10.34), `utils/OneEuroFilter.js` (adaptive signal filtering), `utils/AssetLoader.js` (GLB model progressive enhancement).

**GLB Asset System** (`js/utils/AssetLoader.js` + `models/*.glb`): Progressive enhancement — loads 20 Hyper3D-generated DRACO-compressed GLB models on MEDIUM/HIGH quality, procedural fallback on LOW or weak devices. ESM `import()` with import map for Three.js loaders. Player swapped async via `_trySwapPlayerGLB()` in game loop. Tri-budget: 25K (medium), 50K (high). Generation script: `scripts/rodin_generate.py`. To add a new GLB asset: register ID in `ASSET_MANIFEST` + `OBSTACLE_TYPE_MAP` in AssetLoader.js, add GLB to `models/`, add fallback check in the matching create-function.

**UI Modules** (`js/ui/`):
- `GestureConfigPanel.js` (16KB) — mode selection, sensitivity sliders, calibration trigger, music track selector
- `GestureDebugOverlay.js` (10KB) — real-time yaw/pitch/confidence visualization, threshold markers, FPS
- `LevelSelector.js` (9.5KB) — level selection interface

**Styles**: `css/gesture-overlay.css` (video canvas overlay, gesture status, debug mode), `css/gesture-config.css` (config panel styling).

### Sound/Audio System

**Web Audio API** for all game audio — no `<audio>` elements. Two subsystems:

1. **SFX** (procedural): Oscillator-based sounds for jump, crash, coin, level-up. Generated in real-time via `AudioContext`.
2. **Music** (file-based): 6 MP3 tracks in `sounds/music/` (each ~241KB, generated via ElevenLabs):
   `ambient-subway`, `chiptune-classic`, `drum-and-bass`, `epic-orchestral`, `lofi-chill`, `synthwave-runner`

Music selection persisted via `localStorage` key `subwayRunner_musicTrack`. The config panel (`GestureConfigPanel.js`) includes a track selector with preview playback.

### Version Files

Production version lives in `index.html` `<title>` tag and `package.json` `version` field. These can drift apart — always check both when bumping.

Primary rollback target: `index.html.V4.3-BALANCED.html`. Additional timestamped backups exist — discover with `ls SubwayRunner/index*.html*`.

---

## Deployment Pipeline

Two CI workflows run on `git push main`:

**Primary** (`.github/workflows/hostinger-deploy.yml`):
1. Copies `SubwayRunner/{index.html, js/, css/}` → `deploy/`
2. rsync via SSH to VPS at `/var/www/endlessrunner.vibecoding.company/`
3. Triggers on push to `main` or manual dispatch. Live in ~2 min.

**CI + Legacy FTP** (`.github/workflows/test-before-deploy.yml`):
1. `npm run test` (static validation) + Playwright E2E
2. On success: FTP deploy to Hostinger with generated `.htaccess` (HTTPS, compression, CSP headers)
3. Triggers on push/PR to `main`
4. Uploads test artifacts and failure screenshots

**Manual** (`deploy.sh`): rsync + Nginx config. Cleans remote dir, uploads whitelist, reloads Nginx. Verifies via HTTP.

**Deploy whitelist**: `index.html`, `js/`, `css/`, `models/` (GLB 3D assets). `sounds/` is NOT in the deploy pipeline — music files must be deployed manually or the pipeline must be updated when adding audio assets.

**Required Secrets**: `VPS_HOST`, `VPS_PASSWORD` (primary), `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (legacy). Credentials in `.env` (gitignored).

---

## Test Suite

### Pre-deployment Validation (`test-runner.js`)

| Test | Checks |
|------|--------|
| Syntax | Balanced braces, closed tags, Three.js CDN, GameCore presence |
| Structure | Level definitions, `checkLevelTransition`, essential functions (`startGame`, `gameLoop`, `updateUI`, `checkCollisions`) |
| Performance | File size <1MB, line count <20K |
| Game Logic | `gameState.score`, `addScore`, collision detection |

Outputs `pre-deployment-report.json`.

### Playwright E2E Tests (`tests/e2e/`)

~10 spec files covering: startup health, game-start guards, FPS/memory stability, sound system, gameplay simulation, full game cycle, multi-round leak detection, gesture unit tests (synthetic landmarks), and Supabase checks. Discover with `ls tests/e2e/*.spec.js`.

**Test utilities** in `tests/utils/`: `game-test-utils.js` (WebGL error filtering, shared helpers), `gameplay-simulator.js`, `obstacle-detector.js`

**Playwright config** (`playwright.config.cjs`): Auto-starts `http-server` on port 8001, 60s timeout, single worker (sequential), headless Chromium at 1280x720, 100ms slowMo. Screenshots on every test, video/trace retained on failure. Reports to `tests/playwright-report/`. Retries: 0 local, 2 in CI.

**Note**: `npm run serve` uses `live-server` (with live-reload), but Playwright uses `http-server` (static, no reload). Both serve on port 8001 — kill the port before switching between them.

**Critical**: E2E tests use 5-second settle time for 3D rendering stabilization.

---

## Git Branches

| Branch | Purpose |
|--------|---------|
| `main` | Active development |
| `working-monolithic-baseline` | Last known stable (V3.6.1) |
| `stable-game-v8` | Fallback stable version |

---

## Emergency Rollback

```bash
# Find backups
ls SubwayRunner/*.backup SubwayRunner/*.V4.3-*.html

# Restore and deploy
cp SubwayRunner/index.html.V4.3-BALANCED.html SubwayRunner/index.html
git add . && git commit -m "ROLLBACK to V4.3" && git push
```

---

## Critical Development Rules

### MANDATORY: Console Error Detection in Tests
Every E2E test must collect console errors, page errors, and failed requests — then assert zero at the end. See `tests/utils/game-test-utils.js` for the shared pattern.

### MANDATORY: 3D Game Testing Protocol
1. Wait for canvas element (30s timeout)
2. **Wait 5 seconds** for 3D scene to settle
3. Check for asset 404 errors (.glb, .gltf)
4. Verify `gameState` and `scene` exist in window scope

### MANDATORY: Pre-deployment Workflow
```
Implement → npm run test → Playwright E2E → Fix ALL errors → Re-test GREEN → THEN deploy
```
- **NEVER** deploy without running tests
- **NEVER** trust "it works" without browser verification
- **NEVER** claim success without user confirmation

---

## Workflow Conventions

See `CLAUDE_CODE_RULES.md` for full rules. Key points:
- **Auto-deploy after every feature/fix** — commit and push to main triggers CI. No exceptions, even for small changes.
- **Chrome only** for testing — never Safari (Cmd+Shift+R to hard-refresh)
- **60+ FPS** performance target
- **Version bumps** in both `index.html` `<title>` and `package.json` `version`
- **Two package.json files**: Root-level one is minimal (dev tooling only). `SubwayRunner/package.json` is the main one with all game dependencies and scripts.

---

## Known Issues

- **Safari**: Lower FPS compared to Chrome
- **Headless Testing**: WebGL context errors are expected in CI (filter in tests)
- **Supabase SDK**: Removed from index.html to prevent identifier conflicts (see troubleshooting.md #11)
- **Browser Cache**: Always hard-refresh (Cmd+Shift+R) when testing — different browsers can show stale versions
- **Sounds not deployed**: `sounds/` directory is not in deploy whitelist. Music tracks won't work on production unless manually deployed or pipeline updated

---

## Project Context

- **`ROADMAP.md`** (root): Project history (Phases 1-9), current tasks. Phase 9 = gesture optimization (April 2026).
- **`bestPractice_gestensteuerung.md`** (root): Complete gesture control best practices — 11 chapters covering MediaPipe setup, filtering, dead zones, hysteresis, calibration, frame skipping, confidence filtering.
- **`troubleshooting.md`** (root): Known issues and solutions (INF-001 through INF-015). INF-013/14/15 = gesture-specific bugs.
- **`CLAUDE_CODE_RULES.md`** (root): Deployment and workflow conventions. Key rules summarized in "Workflow Conventions" above.
- **`AGENTS.md`** (root): Mirrors CLAUDE.md for Codex agent compatibility.
