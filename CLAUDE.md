# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**EndlessRunner** is a collection of endless runner game projects exploring different technologies:

- **SubwayRunner**: React + Three.js + TypeScript (modern production 3D runner, PRIMARY FOCUS)
- **EndlessRunner-MVP**: Vanilla JavaScript (feature-rich 10,000+ lines, contains advanced analytics & shop systems)
- **Endless3D**: Three.js perspective renderer (modular world system)
- **GestureRunnerPro**: Godot 4.3 (gesture-controlled with WebCam, MediaPipe integration)
- **godot-mcp**: Godot MCP server (AI integration tools)

**Current Status**: SubwayRunner primary game at https://ki-revolution.at/
⚠️ **CRITICAL**: V4.5.10 build has WRONG game state (only 1 level, excessive speed). See troubleshooting.md for details. Need to find working 3+ level version.

## Critical Deployment Rules (MANDATORY)

**After EVERY code change to SubwayRunner:**
1. ✅ Run tests: `cd SubwayRunner && npm run test` (must pass)
2. ✅ Test locally: `npm run serve` (serves on 8001)
3. ✅ Check console: Verify no errors (especially collision/spawn systems)
4. ✅ Deploy: `git add . && git commit -m "🎮 Version X.Y.Z: description" && git push`
5. ✅ Verify: Live at https://ki-revolution.at/ within 2-3 minutes

**NEVER deploy with**:
- Failing tests
- Console errors
- FPS drops below 50
- Unvetted math changes (spawn rates, speed, collision tolerance)

## Quick Commands

### SubwayRunner (Production)
```bash
cd SubwayRunner

# Development & Testing
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server (port 5173)
npm run serve                  # Serve vanilla version (port 8001)
npm run test                   # Run test suite (test-runner.js)
npm run test:watch            # Watch mode with nodemon
npm run build                 # Build for production
npm run lint                  # ESLint (max 0 warnings)

# Deployment (via GitHub Actions on push)
git add . && git commit -m "🎮 V4.5.X: description" && git push
```

### Other Projects
```bash
# Endless3D / EndlessRunner-MVP
cd Endless3D && python3 -m http.server 8000
# Navigate to localhost:8000

# GestureRunnerPro (Godot)
godot --path GestureRunnerPro

# godot-mcp
cd godot-mcp && npm install && npm run build
```

## Architecture

### SubwayRunner (React/Three.js/TypeScript)
- **Build Tool**: Vite (fast bundling, HMR dev server)
- **State Management**: Zustand (lightweight, Redux-like)
- **3D Library**: React Three Fiber (@react-three/fiber for React integration)
- **Styling**: Tailwind CSS + custom Three.js materials
- **Testing**: test-runner.js (custom suite) + Playwright (browser automation)
- **Performance**: React component-based with Frame-based updates via useFrame hook
- **Key Systems**:
  - Collision detection (3D bounding boxes)
  - Object pooling (obstacle/collectible reuse)
  - Level progression (10 levels, auto-advance at 1000-point intervals)
  - Score management (capped at 999,999)

**Port**:
- Dev: 5173 (Vite)
- Production: 8001 (http.server serving dist/)

**Build Structure**:
- `src/`: React components & game logic (not deployed)
- `dist/`: Built production files (deployed to Hostinger)
- `public/`: Static assets
- `test-runner.js`: Node.js test suite

### EndlessRunner-MVP (Vanilla JavaScript)
- **Lines**: ~10,900 lines (comprehensive feature set)
- **Architecture**: Event-driven, modular
- **Advanced Systems**: Shop/upgrade economy, analytics, difficulty scaling
- **Device Optimization**: GPU tier detection, adaptive quality
- **Note**: Not currently deployed; serves as reference implementation

### Deployment Pipeline
**GitHub Actions** (`.github/workflows/hostinger-deploy.yml`):
1. Trigger: Push to main branch
2. Action: Build SubwayRunner dist/
3. Deploy: FTP upload to Hostinger
4. Live: https://ki-revolution.at/ (2-3 min latency)

**Required GitHub Secrets**:
- `FTP_SERVER`: Hostinger IP
- `FTP_USERNAME`: FTP account
- `FTP_PASSWORD`: FTP password

## Version Management

**Format**: MAJOR.MINOR.PATCH (semantic versioning)

**Update locations**:
1. `SubwayRunner/package.json` → `version` field
2. `SubwayRunner/src/` → Game version constant
3. Git commit message → Include version in prefix

**Current**: V4.5.10 (multi-jump system, auto-start, 10 level progression)

**Bumping rules**:
- **PATCH** (+0.0.1): Bug fixes, balance tweaks, small features
- **MINOR** (+0.1.0): Major features, new levels, UI changes
- **MAJOR** (+1.0.0): Architecture rewrites, core system changes

## Critical Development Rules

### Before Adding ANY Feature
```bash
# Search existing implementation
git log --oneline | grep -i "feature_name"
grep -r "function_name" SubwayRunner/

# Check for similar patterns in EndlessRunner-MVP
grep -r "pattern" EndlessRunner-MVP/
```

### Mathematical Validation (MANDATORY for Game Balance)
```javascript
// Spawn rate changes - ALWAYS validate:
const spawnRate = 0.02;        // Probability per frame
const fps = 60;
const itemsPerSecond = spawnRate * fps;        // 1.2
const itemsPer30Seconds = itemsPerSecond * 30; // 36
console.assert(itemsPer30Seconds < 50, "Too many spawns!");

// Speed changes - ALWAYS test impact:
// Base speed 0.12 is GOLDEN - never modify without math approval
const speedMultiplier = 1 + (level * 0.1);
const cappedSpeed = Math.min(0.12 * speedMultiplier, 0.35);
```

### Collectible System Constraints
- ✅ ONLY: Kiwis (brown spheres), Broccolis (green), Mystery Boxes (max 2/game)
- ❌ NEVER: Power-ups, coins, geometric shapes, rectangular collectibles
- Spawn pattern: 30+ units behind player
- Target balance: 30 Kiwis + 7 Broccolis (85% kiwi bias)

### Testing Workflow (MANDATORY)
1. **Local test** minimum 30 seconds (`npm run serve`, Chrome only)
2. **Check console** for errors in DevTools
3. **Monitor FPS** (must stay >50 throughout)
4. **Run tests**: `npm run test` (all must pass)
5. **Deploy only** after 100% test pass

### Emergency Rollback
```bash
# Find backup version
ls SubwayRunner/dist/*.backup

# Restore specific version
cp SubwayRunner/dist/index.html.V4.5.8.backup SubwayRunner/dist/index.html

# Deploy rollback
git add . && git commit -m "🚨 ROLLBACK to V4.5.8" && git push
```

## Common Tasks

### Add New Obstacle Type
1. Define geometry/material in game initialization
2. Add spawn probability in spawn system (~line with spawnRandom checks)
3. Add collision detection case in `checkCollisions()`
4. Test spawn patterns for ~1 minute gameplay
5. Verify doesn't break level progression

### Modify Game Speed
- Base speed (`0.12`): DO NOT CHANGE - perfectly balanced
- Speed scaling: Use `speedMultiplier = 1 + (level * factor)`
- Max cap: `Math.min(baseSpeed * multiplier, 0.35)`
- Always validate: Calculate items/second before committing

### Fix Collision Issues
1. Locate `checkCollisions()` function
2. Adjust tolerance range (typical: 0.2-0.3 units)
3. Debug with `console.log({ playerPos, obstaclePos, tolerance })`
4. Test collision with multiple obstacle types
5. Verify doesn't cause false positives

### Update Score Display
- HTML element: `document.getElementById('score')`
- Update frequency: Throttled to 10 FPS (not every frame)
- Display cap: 999,999
- Note: Some versions use Zustand store instead

## Project Structure

```
EndlessRunner/
├── SubwayRunner/              # PRIMARY: React/Three.js production game
│   ├── src/                   # Source code (not deployed)
│   ├── dist/                  # Built output (deployed to Hostinger)
│   ├── public/                # Static assets
│   ├── test-runner.js         # Custom Node.js test suite
│   ├── package.json           # Version, scripts, dependencies
│   └── vite.config.ts         # Vite bundler config
├── EndlessRunner-MVP/         # Reference implementation (vanilla JS)
├── Endless3D/                 # Three.js perspective renderer
├── GestureRunnerPro/          # Godot gesture-controlled runner
├── godot-mcp/                 # Godot AI integration server
└── [deployment files]         # .htaccess, GitHub Actions workflows
```

## Important Files Reference

| File | Purpose |
|------|---------|
| `SubwayRunner/src/` | Game code (React components, game logic, THREE.js) |
| `SubwayRunner/test-runner.js` | Custom test suite (syntax, structure, performance, collision) |
| `SubwayRunner/package.json` | Version number, npm scripts, dependencies |
| `.github/workflows/hostinger-deploy.yml` | CI/CD automation (builds & deploys on git push) |
| `SubwayRunner/.htaccess` | Production security headers, cache control |
| `EndlessRunner-MVP/` | 10,900 lines of vanilla JS - reference for advanced patterns |

## Known Limitations & Design Notes

- **Browser Support**: Chrome tested; Safari has performance issues
- **Dual Architecture**: SubwayRunner is modern React/Vite; some backup code uses vanilla JS
- **Version Tracking**: Always check `package.json` for current version
- **Performance Target**: 60 FPS on desktop, 30+ on mobile
- **Object Pooling**: Critical for memory efficiency - reuse obstacles/collectibles
- **Level Design**: 10 unique levels with automatic progression

## Key Performance Metrics

- **Frame Time**: <16.6ms (60 FPS target)
- **Collision Tolerance**: 0.2-0.3 units
- **Spawn Distance**: 30-50 units ahead of player
- **Base Speed**: 0.12 units/frame (IMMUTABLE)
- **Max Speed Cap**: 0.35 units/frame
- **Jump Height**: 2.5 units (~600ms duration)
- **Lane Positions**: [-2, 0, 2]
- **Score Display**: 10 FPS throttle, 999,999 cap

## Finding Working Versions

⚠️ **CURRENT ISSUE (Nov 2, 2025)**: V4.5.10 build is broken (only 1 level, too fast)

**Backup Versions Available** (SubwayRunner/):
- `index.html.V4.3-STABLE.backup` (172 KB) - Last known good 4x-jump version
- `index.html.backup-stable-v4.6.2` (328 KB) - Another stable candidate
- `index.html.BASISVERSION5.backup` (172 KB) - Feature-complete version

**Better Alternative for Presentations**:
- `EndlessRunner-MVP/SubwayRunner/index.html` (4,419 lines) - Feature-rich, known working
- Has multiple levels, shop system, proper game progression
- Can be served from port 8000

**To Restore Working Version**:
```bash
# Option 1: Use V4.3-STABLE backup
cp SubwayRunner/index.html.V4.3-STABLE.backup SubwayRunner/index.html
python3 -m http.server 8001 -d SubwayRunner/

# Option 2: Use MVP (more complete)
python3 -m http.server 8000 -d EndlessRunner-MVP/SubwayRunner/
# Navigate to localhost:8000
```

## Reference: EndlessRunner-MVP Architecture

The MVP contains a more complete implementation (4,419 lines) with:
- **Shop System**: Dynamic upgrade economy
- **Analytics**: Real-time player behavior tracking
- **Multiple Levels**: Fully developed progression system
- **Biome System**: 5+ unique environments
- **Difficulty Scaling**: Adaptive spawn rates based on player performance
- These patterns can be ported to SubwayRunner if needed