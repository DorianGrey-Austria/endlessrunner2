# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Multi-project endless runner game collection. **SubwayRunner** is the actively deployed production game.

| Project | Tech Stack | Status |
|---------|-----------|--------|
| **SubwayRunner** | Vanilla JS + Three.js (monolithic) | PRODUCTION - deployed to ki-revolution.at |
| SubwayRunner/src/ | React + R3F + Zustand + TypeScript | EXPERIMENTAL - not deployed |
| EndlessRunner-MVP | (empty directory) | Historical reference only |

**Live**: https://ki-revolution.at/

---

## Commands

### SubwayRunner (Primary)
```bash
cd SubwayRunner

# Kill port before starting (MANDATORY - prevents conflicts)
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

npm install                    # Dependencies
npm run serve                  # Live-server for vanilla version (port 8001)
npm run dev                    # Vite dev server (port 5173) - React version only
npm run test                   # Run test-runner.js (validates index.html)
npm run test:watch             # Watch mode with nodemon
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
Auto-deploys on git push to main via GitHub Actions → FTP → Hostinger.
```bash
git add . && git commit -m "VX.Y.Z: description" && git push
# Live in ~2-3 minutes at ki-revolution.at
```

### Versioning
Format: `MAJOR.MINOR.PATCH` (e.g. 4.5.10). Bump PATCH for fixes, MINOR for features, MAJOR for breaking changes. Update version in both `index.html` and `package.json`.

---

## Architecture

### Dual Architecture (CRITICAL)

**Production (deployed)**: `SubwayRunner/index.html`
- Monolithic vanilla JS (~5300 lines) with embedded Three.js
- Three.js v0.158.0 via CDN, MediaPipe via CDN (gesture control)
- Global `gameState` object on `window` (score, lives, level, isPlaying)
- Supabase SDK intentionally removed to prevent identifier conflicts

**Experimental (NOT deployed)**: `SubwayRunner/src/`
- React 18 + R3F + Zustand 4.4 + TypeScript
- Never merged to production pipeline
- `npm run dev` starts on port 5173

### Module System (`SubwayRunner/js/`)

External JS modules deployed alongside `index.html`. Loaded as ES6 modules.

**GameCore** (`js/core/GameCore.js`): Registry pattern — modules register themselves and get initialized in order: `utils → levels → characters → ui → effects`. Late-registered modules auto-initialize.

**LevelManager** (`js/levels/LevelManager.js`): 10-level progression system. Level 1 is built into base game; Level 2+ registered dynamically via `registerLevel()`. Each level has `load()`, `update()`, `cleanup()` lifecycle.

**Gesture Control Stack**:
```
GestureControllerProjector.js  (MediaPipe detection — primary)
  → BaseGestureMode.js         (abstract base)
    ├─ BodyPoseMode.js         (pose-based control)
    ├─ AdaptiveCalibrationMode.js
    └─ OneEuroFilterMode.js    (smoothed input)
      → OneEuroFilter.js       (low-latency signal filtering)
```

**Utilities**: `utils/MediaPipeLoader.js` (on-demand MediaPipe Tasks Vision API loader), `utils/OneEuroFilter.js`.

**Styles**: `css/gesture-overlay.css` (video canvas overlay, gesture status, debug mode).

Other modules: `GestureController.js` (legacy fallback), `GestureManager.js` (state management), `ui/LevelSelector.js`.

### Player Controls

| Action | Keys |
|--------|------|
| Lane switch | A/D or Arrow Left/Right |
| Jump | W or Space |
| Duck | S or Arrow Down |

### Version Files

| File | Purpose |
|------|---------|
| `index.html` | Current production version (V4.3-STABLE-MULTIJUMP) |
| `index.html.V4.3-BALANCED.html` | Stable balanced version (rollback target) |
| `index-v3.6.2-working.html` | Verified working baseline |

---

## Deployment Pipeline

**GitHub Actions** (`.github/workflows/hostinger-deploy.yml`):
1. Copies `SubwayRunner/index.html` → `deploy/index.html`
2. Copies `SubwayRunner/js/` → `deploy/js/`
3. Copies `SubwayRunner/css/` → `deploy/css/`
4. Generates `.htaccess` (HTTPS, compression, caching, CSP headers)
5. FTP uploads to Hostinger root

**CI Pipeline** (`.github/workflows/test-before-deploy.yml`): Runs on every push/PR to main — `npm run test` (static) + Playwright E2E → deploy only if all tests pass. Test artifacts and failure screenshots uploaded automatically.

**Required Secrets**: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

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

| Test File | Purpose |
|-----------|---------|
| `game-start-health.spec.js` | Canvas/WebGL verification, startup errors, 404 detection |
| `game-startup-critical.spec.js` | Critical startup validation |
| `game-stability.spec.js` | FPS and memory stability |
| `sound-system.spec.js` | Audio system validation |
| `intelligent-gameplay.spec.js` | Reactive gameplay with obstacle detection |
| `full-game-cycle.spec.js` | Start → Play → Game Over → Highscore → Restart |
| `multi-round-stability.spec.js` | Memory leak detection, 3 consecutive games |
| `quick-supabase-check.spec.js` | Database integration check |

**Test utilities** in `tests/utils/`: `game-test-utils.js` (WebGL error filtering, shared helpers), `gameplay-simulator.js`, `obstacle-detector.js`

**Playwright config** (`playwright.config.cjs`): Auto-starts `live-server` on port 8001, 60s timeout, single worker (sequential), headless Chromium at 1280x720, 100ms slowMo. Reports to `tests/playwright-report/`.

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
```javascript
const errors = [];
page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));
page.on('requestfailed', r => errors.push(r.url()));
// ... test ...
expect(errors).toHaveLength(0);
```

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

## Known Issues

- **Safari**: Lower FPS compared to Chrome
- **Headless Testing**: WebGL context errors are expected in CI (filter in tests)
- **Supabase SDK**: Removed from index.html to prevent identifier conflicts (see TROUBLESHOOTING.md #11)
- **Browser Cache**: Different browsers can show different game versions due to cache conflicts — always hard-refresh (Cmd+Shift+R) when testing. Use Chrome, not Safari
