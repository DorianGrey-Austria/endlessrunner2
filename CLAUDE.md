# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES

### AUTO-DEPLOYMENT IST PFLICHT!
- **NACH JEDER ÄNDERUNG**: `git add . && git commit -m "message" && git push`
- **URL FORMAT**: Immer als **🌐 https://ki-revolution.at/** (klickbar!)
- **BROWSER**: Chrome verwenden (NIEMALS Safari)
- **NACH DEPLOYMENT**: "**🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/**"

## Repository Overview

Endless runner game collection with **SubwayRunner** as primary production project (vanilla JS + Three.js).

**Live URL**: 🌐 https://ki-revolution.at/ (auto-deployed via GitHub Actions)

## Common Development Commands

### SubwayRunner (Primary Project)
```bash
# Local Development
cd SubwayRunner
python -m http.server 8001  # Serve locally at localhost:8001

# Testing
npm run test                 # Run test-runner.js (syntax, structure, performance, logic)
npx playwright test         # Run browser automation tests
node test-live-game.js      # Test live browser gameplay

# Linting & Type Checking (if available)
npm run lint                # ESLint checks
npm run typecheck           # TypeScript type checking (for React components)

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
```

## Current Version & Features

### V5.3.25-ULTRA-GESTURE-SYSTEM (Latest - NEEDS FIXES)
- **Three.js v0.150.0**: Stable version with WebGL compatibility
- **MediaPipe 3-Spur-System**: 3-Lane detection implemented BUT BUGGY
- **Current Issues**: Spiegelverkehrt + Jump/Duck nicht funktional
- **Shield Power-Up**: 3 seconds protection with visual dome  
- **Magnet Power-Up**: Attracts collectibles from all lanes (golden ring)
- **Rainbow World**: Round 2 with psychedelic portal
- **10 Unique Levels**: City, Space, Jungle, Ice, Crystal, etc.
- **5 Characters**: NEON-7, Commander Void, Lara Thornwood, Bjorn Frostbeard, Seraphina Prism

### CRITICAL: GESTURE CONTROL STATUS
- **3-Spur-Detection**: ✅ Funktional (Links/Mitte/Rechts erkannt)
- **Mirror-Bug**: ❌ Kopf links → Spieler links (falsch, sollte rechts sein)  
- **Jump/Duck**: ❌ Funktioniert nicht (Boundaries zu extrem)
- **Debug-Status**: PRODUCTION_MODE = false (Logs aktiv)
- **Next Steps**: Mirror-Korrektur + Boundary-Tuning (siehe GESTURE_ROADMAP_V5.3.25.md)

## Architecture

### SubwayRunner Structure
- **Production**: Single `index.html` file (~5000+ lines embedded JS)
- **Core Systems**: Single init() function, no GameCore system
- **Game Loop**: `animate()` function with state management
- **Collision**: 3D bounding box with 0.2-0.3 tolerance
- **Performance**: Object pooling, frustum culling, 60 FPS target
- **Three.js**: Loaded from unpkg CDN (v0.150.0)

### Key Constants
- **Base Speed**: 0.12 (PERFEKT - nicht ändern!)
- **Lane Positions**: [-2, 0, 2]
- **Jump Height**: 2.5 units
- **Score Cap**: 999,999
- **Win Condition**: 30 kiwis collected

## Gesture Control System - V5.3.25 STATUS

### MediaPipe Integration
- **Face Mesh Detection**: Uses MediaPipe FaceMesh for real-time gesture recognition
- **3-Spur System**: Revolutionäres 3-Lane-Detection (Links/Mitte/Rechts)
- **Camera Requirements**: HTTPS required, Chrome/Edge preferred
- **Current Status**: BUGGY - needs Mirror-Korrektur + Boundary-Fixes

### KNOWN ISSUES (V5.3.25):
- **Mirror-Bug**: Kopf links → Spieler links (falsch, sollte rechts)
- **Jump/Duck broken**: Boundaries zu extrem (0.25/0.75 statt 0.35/0.65)
- **Root Cause**: Kamera-Spiegelung beim 3-Spur-Upgrade entfernt

### Current Gesture Boundaries (BUGGY)
```javascript
// 3-SPUR BOUNDARIES (funktional):
LEFT_LANE_BOUNDARY: 0.35   // 0%-35% = LEFT LANE
RIGHT_LANE_BOUNDARY: 0.65  // 65%-100% = RIGHT LANE (35%-65% = MIDDLE)

// VERTICAL BOUNDARIES (ZU EXTREM):
UP_BOUNDARY: 0.25     // Zu schwer erreichbar (sollte 0.35)
DOWN_BOUNDARY: 0.75   // Zu schwer erreichbar (sollte 0.65)
```

### URGENT FIXES NEEDED (Next Chat):
1. **Mirror-Korrektur**: avgEyeX → (1.0 - avgEyeX) für intuitive Steuerung
2. **Boundary-Tuning**: UP: 0.25→0.35, DOWN: 0.75→0.65
3. **Testing**: Alle 6 Bewegungen systematisch verifizieren

### Debug Status
- **PRODUCTION_MODE**: false (Ultra-verbose Logs aktiv)
- **Console Logging**: Komplette Gesture-Analyse verfügbar
- **Test Documentation**: Siehe GESTURE_ROADMAP_V5.3.25.md

## Quick Task Reference

### Adding New Obstacles
1. Add to obstacle spawning logic in `index.html` (~line 1500-2000)
2. Create Three.js geometry and material
3. Add collision detection case
4. Test spawn patterns

### Version Update Process  
1. Search for current version (e.g., `V5.3.25`) in `SubwayRunner/index.html`
2. Update version string in HTML (both title and UI element)
3. Update CLAUDE.md version tracking
4. Commit with format: `🎮 Version X.Y.Z: [feature]`

### Current Version Issues (V5.3.25):
- **Status**: 3-Spur System funktional aber spiegelverkehrt + Jump/Duck broken
- **Next Version**: V5.3.26 (Mirror-Fix + Boundary-Tuning)
- **Critical Docs**: GESTURE_ROADMAP_V5.3.25.md contains complete fix-plan

### Emergency Rollback
```bash
ls SubwayRunner/*.backup  # Find backup version
cp SubwayRunner/index.html.BASISVERSION5.backup SubwayRunner/index.html
git add . && git commit -m "🚨 ROLLBACK to stable version" && git push
```

## Testing & Debugging

### Test Files
- `test-runner.js`: Custom test suite (syntax, structure, performance, logic)
- `tests/game.test.js`: Playwright browser tests
- `test-live-game.js`: Live browser gameplay testing
- `quick-critical-test.js`: Quick critical function tests
- Multiple `.backup` files for rollback

### Pre-deployment Validation
```bash
npm run predeploy  # Runs tests before deployment
```

## Deployment Pipeline

### GitHub Actions
- **Trigger**: Push to main branch
- **Workflow**: `.github/workflows/hostinger-deploy.yml`
- **Process**: Copies index.html → deploy/ → FTP to Hostinger
- **Secrets**: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD (in repo settings)
- **Security**: HTTPS forced, CSP headers, compression enabled

## Critical Lessons Learned

### RESEARCH → CALCULATE → TEST → DEPLOY
1. **ALWAYS search existing code first**:
   ```bash
   git log --oneline | grep -i "feature_name"
   grep -r "function_name" SubwayRunner/*.backup
   ```

2. **Calculate spawn rates before deploying**:
   ```javascript
   const spawnRate = 0.02;
   const fps = 60;
   const itemsPerSecond = spawnRate * fps;  // 1.2
   console.log(`Will spawn ${itemsPerSecond * 30} items in 30 seconds`);
   ```

3. **Test locally minimum 30 seconds** before deployment

4. **Keep features simple**: Max 20 lines for basic features

## Game Design Rules

### Collectibles
- ✅ **Allowed**: Kiwis, Broccolis, Mystery Boxes (max 2)
- ❌ **NOT Allowed**: Power-ups, coins, geometric shapes
- **Spawning**: 30+ units behind obstacles, speed-dependent spacing

### Balance
- **Target**: 30 Kiwis + 7 Broccolis per game
- **Spawn Bias**: 85% kiwis, 15% broccolis
- **Pattern Limit**: Max 2 collectibles per pattern

## Important Files

- **CLAUDE_CODE_RULES.md**: Universal deployment rules
- **SubwayRunner/index.html**: Main production game (~5000+ lines)
- **SubwayRunner/GESTURE_TROUBLESHOOTING_COMPLETE.md**: Gesture control debugging
- **SubwayRunner/DEBUG_GUIDE.md**: Common issues and solutions
- **.github/workflows/hostinger-deploy.yml**: Auto-deployment config
- **SubwayRunner/test-runner.js**: Main test suite
- **SubwayRunner/*.backup**: Rollback versions for emergency recovery

## Development Workflow

### MANDATORY FOR EVERY CHANGE
1. **Test locally**: `npm run test`
2. **Deploy**: `git add . && git commit -m "message" && git push`
3. **Report**: "✅ Feature deployed! 🌐 Version X.Y.Z live auf https://ki-revolution.at/"

### NEVER
- ❌ Deploy without testing
- ❌ Deploy with known errors
- ❌ Use Safari for testing (breaks MediaPipe)
- ❌ Skip version increments
- ❌ Modify GameCore system (removed in V5.3.9)
- ❌ Change Three.js version from v0.150.0
- ❌ Change MediaPipe gesture detection boundaries without testing
- ❌ Remove HTTPS requirement (breaks camera access)