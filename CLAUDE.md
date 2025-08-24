# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES

### AUTO-DEPLOYMENT IST PFLICHT!
- **NACH JEDER ÄNDERUNG**: `git add . && git commit -m "message" && git push`
- **URL FORMAT**: Immer als **🌐 https://ki-revolution.at/** (klickbar!)
- **BROWSER**: Chrome verwenden (NIEMALS Safari)
- **NACH DEPLOYMENT**: "**🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/**"

### ⚠️ VERSIONSVERWALTUNG IST PFLICHT!
**BEI JEDER CODE-ÄNDERUNG MUSS DIE VERSION AKTUALISIERT WERDEN:**
1. **HTML Title Tag**: `<title>Subway Runner 3D - VX.Y.Z-FEATURE</title>`
2. **UI Version Display**: Im Spiel-UI (Zeile ~734)
3. **Alle Kommentare**: Versions-Referenzen in Code-Kommentaren
4. **Cache-Busting**: URLs mit ?v=X.Y.Z Parameter
5. **Format**: MAJOR.MINOR.PATCH-DESCRIPTION
6. **IMMER erhöhen**: Niemals alte Versionsnummern behalten!
7. **CHECK COMMAND**: `grep -n "V5\.3\.\d+" SubwayRunner/index.html` vor Deployment

## Repository Overview

Endless runner game collection with **SubwayRunner** as primary production project (vanilla JS + Three.js).

**Live URL**: 🌐 https://ki-revolution.at/ (auto-deployed via GitHub Actions)

## Common Development Commands

```bash
# Local Development
cd SubwayRunner
python -m http.server 8001  # Serve locally at localhost:8001
npm run serve               # Alternative: live-server with auto-reload

# Testing (run from SubwayRunner directory)
npm run test                 # Run test-runner.js (syntax, structure, performance, logic)
npx playwright test         # Run browser automation tests
node test-live-game.js      # Test live browser gameplay
node quick-critical-test.js # Fast critical function validation

# Linting & Type Checking
npm run lint                # ESLint checks (TypeScript/React components)

# Pre-deployment Validation
npm run predeploy           # Combines all tests before deployment

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
```

## Current Version & Features

### V5.3.47 (Latest)
- **Three.js v0.158.0**: Locked CDN version - DO NOT CHANGE
- **MediaPipe Gesture Control**: 3-Lane horizontal detection works perfectly
- **Current Status**: Horizontal gestures ✅ | Vertical (Jump/Duck) ❌ needs Y-axis fix
- **Performance**: 60 FPS with PRODUCTION_MODE = true
- **Power-ups**: Shield (3s immunity), Magnet (collectible attraction)
- **10 Unique Levels**: Progressive difficulty with themed environments
- **5 Characters**: Each with unique abilities and visuals

### CRITICAL: Performance & Gesture Control

#### Gesture Control Status
- **Horizontal (3-Lane)**: ✅ Working perfectly
- **Vertical (Jump/Duck)**: ❌ Needs Y-axis fix
- **Mirror Correction**: ✅ Intuitive mapping
- **Requirements**: HTTPS + Chrome/Edge (Safari breaks MediaPipe)

#### Performance Rules (NEVER VIOLATE)
- **NEVER log every frame** - instant performance death
- **NEVER manipulate DOM during gestures** - causes crashes
- **ALWAYS test with PRODUCTION_MODE = true**
- **ALWAYS use ultra-sensitive boundaries** (48%/52% or tighter)

## Architecture

### Core Structure
- **Monolithic Design**: Single `SubwayRunner/index.html` (~5000+ lines embedded JS)
- **Three.js Integration**: v0.158.0 from unpkg CDN - DO NOT CHANGE VERSION
- **Game Loop**: `animate()` with requestAnimationFrame at 60 FPS
- **Collision System**: 3D bounding box with 0.2-0.3 unit tolerance
- **Performance**: Object pooling, frustum culling, lazy loading
- **Gesture Control**: MediaPipe FaceMesh for head tracking (optional)
- **Testing**: Node.js test runner with Playwright browser automation
- **Deployment**: GitHub Actions → Hostinger FTP auto-deployment

### Key Game Constants (DO NOT MODIFY)
```javascript
BASE_SPEED: 0.12          // PERFEKT - nicht ändern!
LANE_POSITIONS: [-2, 0, 2] // 3-lane system
JUMP_HEIGHT: 2.5           // units
SCORE_CAP: 999999         // max score
WIN_CONDITION: 30         // kiwis to collect
```

## Gesture Control System

### MediaPipe Integration
- **Detection**: FaceMesh for real-time head tracking
- **3-Lane System**: Left/Center/Right detection via head position
- **Requirements**: HTTPS + Chrome/Edge (Safari incompatible)

### Gesture Boundaries
```javascript
// Horizontal (Working)
LEFT_LANE_BOUNDARY: 0.35   // 0%-35% = LEFT
RIGHT_LANE_BOUNDARY: 0.65  // 65%-100% = RIGHT

// Vertical (Needs Fix)
UP_BOUNDARY: 0.35     // Jump zone
DOWN_BOUNDARY: 0.65   // Duck zone

// Mirror Correction: (1.0 - avgEyeX)
```

## Development Tasks

### Adding New Obstacles
1. Edit obstacle spawning in `SubwayRunner/index.html:1500-2000`
2. Create Three.js geometry/material
3. Add collision detection case
4. Test spawn patterns locally

### Version Update Process  
1. Search current version in `SubwayRunner/index.html`
2. Update HTML title tag
3. Test changes locally
4. Commit: `🎮 Version X.Y.Z: [feature]`

### Emergency Rollback
```bash
cp SubwayRunner/index.html.BASISVERSION5.backup SubwayRunner/index.html
git add . && git commit -m "🚨 ROLLBACK to stable" && git push
```

## Testing

### Test Files
- `test-runner.js`: Main test suite
- `tests/game.test.js`: Playwright tests
- `test-live-game.js`: Live gameplay testing
- `quick-critical-test.js`: Fast validation

### Test Commands (from SubwayRunner/)
```bash
npm run test               # Complete test suite (test-runner.js)
npm run test:playwright    # Browser automation tests
npm run test:browser       # Live gameplay testing
npm run predeploy         # Pre-deployment validation
node quick-critical-test.js # Fast critical function validation
```

## Deployment

### GitHub Actions → Hostinger
- **Trigger**: Push to main branch
- **Workflow**: `.github/workflows/hostinger-deploy.yml`
- **Process**: `SubwayRunner/index.html` → FTP → ki-revolution.at
- **Auto-deployed**: Every push to main

## Critical Rules

### Before Making Changes
1. **Search existing code**: `grep -r "function_name" SubwayRunner/`
2. **Check backups**: `ls SubwayRunner/*.backup`
3. **Test locally 30+ seconds**
4. **Keep changes minimal** (<20 lines for features)

## Game Balance

### Collectibles
- **Allowed**: Kiwis, Broccolis only
- **Target**: 30 Kiwis + 7 Broccolis per game
- **Spawn Rate**: 85% kiwis, 15% broccolis
- **Spacing**: 30+ units behind obstacles

## Key Files

### Production
- `SubwayRunner/index.html`: Main game (~5000 lines)
- `SubwayRunner/index.html.BASISVERSION5.backup`: Stable fallback
- `.github/workflows/hostinger-deploy.yml`: Auto-deployment

### Testing
- `SubwayRunner/test-runner.js`: Main test suite
- `SubwayRunner/package.json`: NPM scripts

## Workflow

### MANDATORY Steps
1. Test locally: `cd SubwayRunner && npm run test`
2. Deploy: `git add . && git commit -m "🎮 Version X.Y.Z: [feature]" && git push`
3. Report: "🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/"

### NEVER Do This
- ❌ Deploy without testing
- ❌ Use Safari (breaks MediaPipe)
- ❌ Change Three.js from v0.158.0
- ❌ Log every frame (performance killer)
- ❌ Skip version increments
- ❌ Modify BASE_SPEED (performance-tuned)
- ❌ Change LANE_POSITIONS (collision system dependent)