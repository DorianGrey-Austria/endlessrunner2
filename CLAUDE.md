# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Multi-project endless runner game collection. **SubwayRunner** is the actively deployed production game.

| Project | Tech Stack | Status |
|---------|-----------|--------|
| **SubwayRunner** | Vanilla JS + Three.js (monolithic) | PRODUCTION - deployed to ki-revolution.at |
| SubwayRunner/src/ | React + R3F + Zustand + TypeScript | EXPERIMENTAL - not deployed |
| EndlessRunner-MVP | Vanilla JS (~11K lines) | Reference implementation |

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
git add . && git commit -m "🎮 VX.Y.Z: description" && git push
# Live in ~2-3 minutes at ki-revolution.at
```

---

## Architecture

### Dual Architecture (CRITICAL)

**Production (deployed)**: `SubwayRunner/index.html`
- Monolithic vanilla JS with embedded Three.js (~12K+ lines)
- Classes: `GameCore`, `LevelManager`
- Three.js v0.158.0 via CDN
- Gesture control via `js/GestureControllerProjector.js` (MediaPipe)

**Experimental (NOT deployed)**: `SubwayRunner/src/`
- React + R3F + Zustand + TypeScript
- Never merged to production pipeline
- `npm run dev` starts on port 5173

### Production Game Systems (index.html)

| System | Description |
|--------|-------------|
| `GameCore` | Main game loop, rendering, collision detection |
| `LevelManager` | Progressive difficulty across 10 levels |
| `gameState` | Global state object (score, lives, level, isPlaying) |
| `addScore()` | Centralized score system (fixed throttling) |

### Version Files

| File | Purpose |
|------|---------|
| `index.html` | Current production version |
| `index.html.V4.3-BALANCED.html` | Stable balanced version |
| `index-v3.6.2-working.html` | Verified working baseline |

---

## Deployment Pipeline

**GitHub Actions** (`.github/workflows/hostinger-deploy.yml`):
1. Copies `SubwayRunner/index.html` → `deploy/index.html`
2. Copies `SubwayRunner/js/` → `deploy/js/`
3. Generates `.htaccess` (HTTPS, compression, caching, CSP headers)
4. FTP uploads to Hostinger root

**Required Secrets**: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

---

## Test Suite

### Pre-deployment Validation (`test-runner.js`)

| Test | Checks |
|------|--------|
| Syntax | Balanced braces, closed tags, Three.js CDN, GameCore presence |
| Structure | Level definitions, `checkLevelTransition`, essential functions |
| Performance | File size <1MB, line count <20K |
| Game Logic | `gameState.score`, `addScore`, collision detection |

### Playwright E2E Tests (`tests/e2e/`)

| Test File | Purpose |
|-----------|---------|
| `game-start-health.spec.js` | Canvas/WebGL verification, startup errors, 404 detection |
| `sound-system.spec.js` | Audio system validation |
| `intelligent-gameplay.spec.js` | Reaktives Gameplay mit Hindernis-Detection |
| `full-game-cycle.spec.js` | Start → Play → Game Over → Highscore → Restart |
| `multi-round-stability.spec.js` | Memory Leak Detection, 3 Spiele hintereinander |

**Test Strategy**: Siehe `_INFO/TESTSTRATEGY.md` für zentrale Game Testing Best Practices.

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
git add . && git commit -m "🚨 ROLLBACK to V4.3" && git push
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
