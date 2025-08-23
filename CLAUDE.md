# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 ADDITIONAL RESOURCES

- **[MCP_TIPS.md](./MCP_TIPS.md)** - Comprehensive guide for MCP Server configuration and best practices
- **[claude_desktop_config.json](./claude_desktop_config.json)** - Optimized MCP configuration for this project

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

### V5.3.31-CLEANED (Latest - Post Rollback)
- **Three.js v0.150.0**: Stable version with WebGL compatibility  
- **MediaPipe 3-Spur-System**: 3-Lane horizontal detection works perfectly
- **Current Status**: Horizontal gestures work, vertical needs fixing
- **Performance**: Restored to 60 FPS after removing debug logs
- **Shield Power-Up**: 3 seconds protection with visual dome  
- **Magnet Power-Up**: Attracts collectibles from all lanes (golden ring)
- **Rainbow World**: Round 2 with psychedelic portal
- **10 Unique Levels**: City, Space, Jungle, Ice, Crystal, etc.
- **5 Characters**: NEON-7, Commander Void, Lara Thornwood, Bjorn Frostbeard, Seraphina Prism

### CRITICAL: GESTURE CONTROL STATUS
- **3-Spur-Detection**: ✅ Funktional (Links/Mitte/Rechts perfect!)
- **Jump/Duck Controls**: ❌ STILL NOT WORKING (needs Y-axis verification)  
- **Mirror Correction**: ✅ Intuitive horizontal movement
- **Debug-Status**: PRODUCTION_MODE = true (for performance)
- **Camera Requirements**: HTTPS + Chrome/Edge required

### CRITICAL LEARNINGS FROM V5.3.33 CRASH:
- **NEVER log every frame** (kills performance instantly)
- **NEVER manipulate DOM during gestures** (causes errors)
- **ALWAYS use ultra-sensitive boundaries** (48%/52% or tighter)
- **ALWAYS test with PRODUCTION_MODE = true**

## Architecture

### SubwayRunner Structure
- **Monolithic HTML**: Single `index.html` file (~5000+ lines embedded JS)
- **Core Systems**: Single init() function with direct Three.js integration
- **Game Loop**: `animate()` function with requestAnimationFrame
- **Collision System**: 3D bounding box detection with 0.2-0.3 unit tolerance
- **Performance**: Object pooling for obstacles/collectibles, frustum culling
- **Rendering**: Three.js v0.150.0 from unpkg CDN, WebGL with fallback
- **Gesture Control**: MediaPipe FaceMesh integration for real-time head tracking

### Key Systems
- **Lane Management**: 3-lane system with positions [-2, 0, 2]
- **Obstacle Spawning**: Pattern-based generation with increasing difficulty
- **Collectible System**: Kiwis (main) and Broccolis (bonus) with spawn balancing
- **Power-ups**: Shield (3s immunity) and Magnet (collectible attraction)
- **Level Progression**: 10 unique environments with themed obstacles

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

### GESTURE SYSTEM STATUS (V5.3.26):
- **Mirror Correction**: ✅ Head movements now mirror natural expectations
- **Boundary Optimization**: ✅ Vertical boundaries tuned for accessibility
- **6-Direction Control**: ✅ All movement directions (Left/Center/Right/Jump/Duck/Neutral) functional

### Current Gesture Boundaries (OPTIMIZED)
```javascript
// HORIZONTAL BOUNDARIES (3-Lane Detection):
LEFT_LANE_BOUNDARY: 0.35   // 0%-35% = LEFT LANE
RIGHT_LANE_BOUNDARY: 0.65  // 65%-100% = RIGHT LANE (35%-65% = MIDDLE)

// VERTICAL BOUNDARIES (Accessibility Optimized):
UP_BOUNDARY: 0.35     // Jump trigger zone
DOWN_BOUNDARY: 0.65   // Duck trigger zone

// MIRROR CORRECTION: avgEyeX → (1.0 - avgEyeX) for intuitive control
```

### GESTURE TESTING PROTOCOL:
1. **6-Direction Verification**: Systematically test Left/Center/Right/Jump/Duck/Neutral
2. **Mirror Response Check**: Head left = Player right (intuitive mapping)
3. **Boundary Accessibility**: All users should reach trigger zones comfortably

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
1. Search for current version (e.g., `V5.3.26`) in `SubwayRunner/index.html`
2. Update version string in HTML title tag
3. Update CLAUDE.md version tracking
4. Test gesture control functionality if changes affect MediaPipe
5. Commit with format: `🎮 Version X.Y.Z: [feature]`

### Development Status (V5.3.31 - Post Rollback):
- **Status**: Horizontal works perfect, vertical needs fixing
- **Next Goal**: Get Jump/Duck working with ultra-sensitive detection
- **Critical Docs**: 
  - GESTURE_TROUBLESHOOTING_V5.3.34.md (performance crash analysis)
  - GESTURE_ROADMAP_NEXT_SESSION.md (next steps)
- **Key Issue**: Y-coordinate interpretation might be inverted

### Emergency Rollback
```bash
ls SubwayRunner/*.backup  # Find backup version
cp SubwayRunner/index.html.BASISVERSION5.backup SubwayRunner/index.html
git add . && git commit -m "🚨 ROLLBACK to stable version" && git push
```

## Testing & Debugging

### Test Suite Overview
- **`test-runner.js`**: Main test suite (syntax validation, structure analysis, performance checks)
- **`tests/game.test.js`**: Playwright browser automation tests
- **`test-live-game.js`**: Live gameplay testing with user simulation
- **`quick-critical-test.js`**: Fast critical function validation
- **Gesture Tests**: `gesture-test-standalone.html`, `pose-detection-test.html`

### Testing Commands
```bash
npm run test                 # Run complete test suite via test-runner.js
npm run test:playwright      # Run Playwright browser tests
npm run test:browser         # Live gameplay testing
npm run predeploy           # Pre-deployment validation (combines all tests)
node quick-critical-test.js  # Fast critical checks
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

### Core Game Files
- **SubwayRunner/index.html**: Main production game (~5000+ lines monolithic HTML/JS)
- **SubwayRunner/js/**: Modular JavaScript components (GestureController, levels, etc.)
- **SubwayRunner/css/gesture-overlay.css**: Gesture control UI styling

### Documentation & Debugging
- **GESTURE_TROUBLESHOOTING_COMPLETE.md**: Complete gesture control debugging guide
- **DEBUG_GUIDE.md**: Common issues and systematic solutions
- **GESTURE_ROADMAP_V5.3.25.md**: Gesture system development history

### Testing & Quality Assurance  
- **test-runner.js**: Main automated test suite
- **tests/**: Playwright browser automation tests
- **quick-critical-test.js**: Fast validation for critical functions

### Deployment & CI/CD
- **.github/workflows/hostinger-deploy.yml**: Auto-deployment to ki-revolution.at
- **package.json**: NPM scripts and dependencies

### Emergency Recovery
- **SubwayRunner/*.backup**: Versioned backup files for rollback
- **index.html.BASISVERSION5.backup**: Stable fallback version

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