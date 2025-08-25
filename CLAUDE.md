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
8. **CURRENT VERSION CHECK**: `grep -n "V5\.3\.5[0-9]" SubwayRunner/index.html` (V5.3.50+)
9. **VERSION VALIDATION**: Ensure all version references are consistent across title, UI, and comments

## Repository Overview

Endless runner game collection with **SubwayRunner** as primary production project (vanilla JS + Three.js).

**Live URL**: 🌐 https://ki-revolution.at/ (auto-deployed via GitHub Actions)

### Project Structure
- **SubwayRunner/**: Main production game (vanilla JS + Three.js)
- **GestureRunnerPro/**: Advanced Godot-based runner with professional features
- **EndlessRunner-MVP/**: React/TypeScript version with Vite build system
- **Endless3D/**: Legacy 3D runner implementation
- **godot-mcp/**: MCP (Model Context Protocol) integration for Godot development

## Common Development Commands

```bash
# Local Development
cd SubwayRunner
python -m http.server 8001  # Serve locally at localhost:8001
npm run serve               # Alternative: live-server with auto-reload

# Testing (run from SubwayRunner directory)
npm run test                 # Run test-runner.js (syntax, structure, performance, logic)
npm run test:watch           # Watch mode for continuous testing
npm run test:browser         # Live browser gameplay testing
npm run test:playwright      # Browser automation tests with Playwright
node test-live-game.js      # Test live browser gameplay
node quick-critical-test.js # Fast critical function validation

# Linting & Type Checking
npm run lint                # ESLint checks (TypeScript/React components)

# Pre-deployment Validation
npm run predeploy           # Combines all tests before deployment
npm run pretest             # Pre-test setup and validation

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push

# React/TypeScript Development (EndlessRunner-MVP)
cd EndlessRunner-MVP/SubwayRunner
npm run dev                  # Vite dev server at localhost:5173
npm run build               # Build for production
npm run lint                # TypeScript/React linting

# Godot Development (GestureRunnerPro)
# Use Godot Editor 4.x - project files are in GestureRunnerPro/
# MCP integration available via godot-mcp/ directory

# MCP Integration (godot-mcp)
cd godot-mcp
npm install              # Install MCP server dependencies
npm run build           # Build TypeScript to JavaScript
npm run watch           # Watch mode for development
npm run inspector       # Run MCP inspector tool

# BMAD Method Integration (if available)
npx bmad-method install  # Install BMAD Method framework
npx bmad-method status   # Check installation status
npx bmad-method list:expansions  # List available expansion packs
```

## Current Version & Features

### V5.3.62 (Current - GESTURE-WORKS)
- **Three.js v0.158.0**: Locked CDN version - DO NOT CHANGE
- **MediaPipe Gesture Control**: Eye-tracking implementation for vertical gestures
- **Current Status**: Horizontal gestures ✅ | Vertical (Jump/Duck) being fixed with eye-tracking  
- **Performance**: 60 FPS with PRODUCTION_MODE = true
- **Power-ups**: Shield (3s immunity), Magnet (collectible attraction)
- **10 Unique Levels**: Progressive difficulty with themed environments
- **5 Characters**: Each with unique abilities and visuals
- **Stability**: Production-ready with active gesture control improvements

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
- **Monolithic Design**: Single `SubwayRunner/index.html` (~4700+ lines embedded JS)
- **Three.js Integration**: v0.158.0 from unpkg CDN - DO NOT CHANGE VERSION
- **Game Loop**: `animate()` with requestAnimationFrame at 60 FPS
- **Collision System**: 3D bounding box with 0.2-0.3 unit tolerance
- **Performance**: Object pooling, frustum culling, lazy loading
- **Gesture Control**: MediaPipe FaceMesh for head tracking (optional)
- **Testing**: Node.js test runner with Playwright browser automation
- **Deployment**: GitHub Actions → Hostinger FTP auto-deployment

### Modular JavaScript Components (SubwayRunner/js/)
- **GameCore.js**: Central module registration and dependency injection
- **GestureControllerProjector.js**: MediaPipe-based gesture detection with eye tracking
- **MainMenuManager.js**: Menu UI and state management
- **CharacterManager.js**: Character selection and abilities
- **LevelManager.js**: Progressive level system with themes
- **PowerUpManager.js**: Shield and magnet power-up logic
- **ObstacleManager.js**: Obstacle spawning and pooling
- **ScoreManager.js**: Score tracking and persistence

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

### Working with Modular Components
The game uses a modular architecture with components in `SubwayRunner/js/`:
1. **GameCore.js** registers all modules - check dependencies here first
2. **Module pattern**: Each file exports to `window.GameModules`
3. **Access modules**: `window.GameModules.ModuleName`
4. **Add new module**: Register in GameCore.js, follow existing patterns

### Adding New Obstacles
1. Edit `SubwayRunner/js/ObstacleManager.js` for spawn logic
2. Or edit main file `SubwayRunner/index.html:1500-2000` for inline changes
3. Create Three.js geometry/material
4. Add collision detection case
5. Test spawn patterns locally with `npm run test:browser`

### Adding New Features
1. Check if feature belongs in existing module (`js/*.js`)
2. For new systems, create module in `js/` directory
3. Register in `GameCore.js`
4. Follow existing module patterns for consistency
5. Test with `npm run test` before deployment

### Version Update Process  
1. Search current version: `grep -n "V5\.3\.\d+" SubwayRunner/index.html`
2. Update ALL occurrences (title, UI, comments)
3. Test changes: `npm run predeploy`
4. Commit: `🎮 Version X.Y.Z: [feature]`
5. Push to deploy automatically

### Emergency Rollback
```bash
cp SubwayRunner/index.html.BASISVERSION5.backup SubwayRunner/index.html
git add . && git commit -m "🚨 ROLLBACK to stable" && git push
```

## Testing

### Test Files
- `test-runner.js`: Main test suite (syntax, structure, performance)
- `tests/game.test.js`: Playwright browser automation tests
- `test-live-game.js`: Live gameplay testing
- `quick-critical-test.js`: Fast critical function validation

### Test Commands (from SubwayRunner/)
```bash
# Run complete test suite
npm run test               # All tests via test-runner.js
npm run predeploy         # Pre-deployment validation (all tests)

# Run specific test types
npm run test:playwright    # Browser automation tests only
npm run test:browser       # Live browser gameplay testing
npm run test:watch         # Watch mode for continuous testing

# Run single test file
node test-runner.js        # Main test suite directly
node quick-critical-test.js # Fast validation of critical functions
node test-live-game.js     # Live browser gameplay test

# Debug specific test
npm run test -- --verbose  # Verbose output for debugging
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

### Production (SubwayRunner)
- `SubwayRunner/index.html`: Main game (~4700 lines)
- `SubwayRunner/index.html.BASISVERSION5.backup`: Stable fallback
- `SubwayRunner/js/*.js`: Modular JavaScript components
- `.github/workflows/hostinger-deploy.yml`: Auto-deployment
- `.github/workflows/test-before-deploy.yml`: Test-then-deploy pipeline

### Testing Infrastructure
- `SubwayRunner/test-runner.js`: Main test suite
- `SubwayRunner/tests/game.test.js`: Playwright browser tests
- `SubwayRunner/test-live-game.js`: Live gameplay testing
- `SubwayRunner/quick-critical-test.js`: Fast validation
- `SubwayRunner/package.json`: NPM scripts and dependencies

### Alternative Implementations
- `EndlessRunner-MVP/`: React 18 + TypeScript + Three.js implementation
- `GestureRunnerPro/`: Godot 4.3 game engine version
- `godot-mcp/`: MCP server for AI-assisted Godot development

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