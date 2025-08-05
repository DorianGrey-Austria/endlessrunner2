# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES (TOP PRIORITY!)

### 🔴 AUTO-DEPLOYMENT IST PFLICHT!
- **NACH JEDER SESSION**: `git add . && git commit -m "message" && git push`
- **URL FORMAT**: Immer als **🌐 https://ki-revolution.at/** (klickbar!)
- **BROWSER**: Chrome verwenden (NIEMALS Safari)
- **NACH DEPLOYMENT SAGEN**: "**🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/**"

### 📋 WORKFLOW STANDARDS
1. **Versionierung**: IMMER updaten (MAJOR.MINOR.PATCH)
2. **Dokumentation**: Änderungen sofort in .md Dateien
3. **Testing**: "Teste in Chrome: **🌐 https://ki-revolution.at/**"
4. **UI/UX First**: User Experience > Technische Eleganz
5. **Kurze Antworten**: Präzise, action-orientiert mit ✅

**SIEHE AUCH**: [CLAUDE_CODE_RULES.md](./CLAUDE_CODE_RULES.md) für vollständige Regeln!

## Quick Task Reference

### Adding a New Obstacle Type
1. Add to obstacle spawning logic in `index.html` (~line 1500-2000)
2. Create geometry and material with Three.js
3. Add collision detection case
4. Test spawn patterns and difficulty balance

### Modifying Game Speed
- Base speed: Search for `baseSpeed = 0.12` in index.html
- Speed scaling: Look for `speedMultiplier` calculations
- Max speed cap: Find `Math.min(baseSpeed * multiplier, 0.35)`

### Fixing Collision Issues
1. Find `checkCollisions()` function
2. Adjust `tolerance` values (0.2-0.3 typical)
3. Debug with console.log bounding boxes
4. Test with different obstacle types

### Updating Score Display
- Score element: `document.getElementById('score')`
- Update throttled to 10 FPS (performance optimization)
- Score cap at 999,999 to prevent overflow

### Emergency Rollback
```bash
# Find backup version
ls SubwayRunner/*.backup
# Restore specific version
cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html
# Deploy immediately
git add . && git commit -m "🚨 ROLLBACK to V4.6.11" && git push
```

## 🔴 CRITICAL LESSONS LEARNED - 10 HOURS OF FAILURE (03.08.2025)

### **THE DISASTER: 12 Failed Attempts in 10 Hours**
After 10+ hours trying to implement simple collectibles (Kiwis & Broccolis), we produced a WORSE version than we started with. This is a complete system failure that requires fundamental workflow changes.

### **ROOT CAUSES OF REPEATED FAILURE:**

#### **1. RESEARCH FAILURE - REINVENTING INSTEAD OF REUSING**
- **PROBLEM**: Ignored existing working implementations
- **PATTERN**: User says "we had working version" → I create new from scratch
- **SOLUTION**: ALWAYS search for existing code first:
```bash
# MANDATORY before any implementation:
git log --oneline | grep -i "feature_name"
grep -r "function_name" . --include="*.backup"
```

#### **2. MATHEMATICAL IGNORANCE**
- **DISASTER**: Set 30% spawn rate = 18 collectibles/second at 60 FPS
- **PATTERN**: Deploy without calculating: Rate × FPS × Time
- **SOLUTION**: ALWAYS calculate before deploying:
```javascript
// MANDATORY calculation:
const spawnsPerSecond = spawnRate * fps;
const totalIn30Seconds = spawnsPerSecond * 30;
console.log(`Will spawn ${totalIn30Seconds} items`);
```

#### **3. DEPLOYMENT WITHOUT TESTING**
- **PATTERN**: Deploy → Fail → Emergency Fix → Worse → Rollback (12 times!)
- **SOLUTION**: MANDATORY local testing checklist:
  - [ ] Game starts successfully
  - [ ] Feature works as expected
  - [ ] Performance acceptable (60 FPS)
  - [ ] No console errors
  - [ ] Play for minimum 30 seconds

#### **4. OVER-ENGINEERING SIMPLE REQUESTS**
- **USER WANTS**: Simple collectibles
- **I DELIVER**: 80+ lines complex code with rings, seeds, glints
- **RESULT**: Game doesn't start
- **SOLUTION**: Maximum 20 lines for simple features

#### **5. IGNORING USER FEEDBACK**
- **USER**: "We're making it too complicated"
- **ME**: Makes it MORE complicated
- **SOLUTION**: User feedback is LAW - simplify immediately

### **NEW MANDATORY WORKFLOW:**

#### **PHASE 1: ARCHAEOLOGICAL RESEARCH** (ALWAYS FIRST!)
```bash
# Find ALL existing implementations:
git log --oneline --grep="feature"
grep -r "createFunction" . --include="*.html" --include="*.backup"
# Extract working code, DON'T reinvent
```

#### **PHASE 2: MATHEMATICAL VALIDATION**
```javascript
// BEFORE any spawn rate change:
const validation = {
  spawnRate: 0.02,
  fps: 60,
  itemsPerSecond: 0.02 * 60, // 1.2
  itemsIn30Sec: 1.2 * 30,     // 36
  acceptable: 36 < 50         // true ✓
};
```

#### **PHASE 3: LOCAL TESTING** (NO EXCEPTIONS!)
1. Start local server: `python3 -m http.server 8001`
2. Test in Chrome (NEVER Safari)
3. Play minimum 30 seconds
4. Verify all features work
5. Check console for errors
6. Monitor FPS (must stay >50)

#### **PHASE 4: INCREMENTAL DEPLOYMENT**
- ONE feature per deployment
- Small changes only
- Immediate user feedback
- Rollback if ANY issues

### **THE 5 COMMANDMENTS OF FUTURE DEVELOPMENT:**

1. **THOU SHALT NOT REINVENT** - Always search existing code first
2. **THOU SHALT CALCULATE** - Math check every spawn rate/performance change
3. **THOU SHALT TEST LOCALLY** - No deployment without 30-second test
4. **THOU SHALT KEEP IT SIMPLE** - <20 lines for simple features
5. **THOU SHALT LISTEN TO USERS** - Their feedback is absolute law

### **SUCCESS METRICS TO TRACK:**
- **Deployment Success Rate**: Must be >80% (currently 0%)
- **Time to Working Feature**: Must be <2 hours (currently 10+ hours)
- **User Satisfaction**: "It works!" not "This can't be happening!"
- **Code Reuse**: >50% existing, <50% new (currently 0% reuse)

### **COMMITMENT:**
Never again will we have 12 emergency rollbacks in 10 hours. The solution is NOT in complex new code, but in finding and combining existing working pieces. 

**NEW MANTRA**: **RESEARCH → EXTRACT → COMBINE → TEST → DEPLOY**

## Repository Overview

This is a collection of endless runner game projects built with different technologies, following a UI/UX-first development philosophy where user experience drives all technical decisions.

- **SubwayRunner**: Vanilla JavaScript + Three.js (main production game, deployed via GitHub Actions)
- **Endless3D**: Vanilla JavaScript + Three.js (perspective-based 3D runner with world system)
- **EndlessRunner-MVP**: Pure JavaScript (feature-rich browser runner)
- **GestureRunnerPro**: Godot 4.3 (gesture-controlled runner with MediaPipe WebCam integration)
- **godot-mcp**: Godot MCP server for AI integration

**Primary Project**: SubwayRunner is the main production game with automated deployment to Hostinger.

## 🚨 VERSIONING RULES (NEVER DELETE!)

### **CRITICAL: Version Management System**
**RULE 1**: Every deployment MUST increment the sub-version number  
**RULE 2**: Version format: MAJOR.MINOR.PATCH (e.g., 3.5.0)  
**RULE 3**: Increment rules:
- **PATCH** (+0.0.1): Bug fixes, small improvements, feature additions
- **MINOR** (+0.1.0): Major features, significant UI changes, new systems  
- **MAJOR** (+1.0.0): Complete rewrites, fundamental architecture changes

### **CURRENT VERSION TRACKING**
- **BASISVERSION 3**: V3.0-COLLECTIBLES (✅ STABLE BASE - Äpfel & Brokkoli funktionieren!)
- **Previous**: V2.2-DUCK-FIX (✅ Duck collision detection restored)
- **Before**: V2.1-STABILIZED (Basic version with stability features)
- **Before**: 4.6.13-SCORE-FIX (🚨 CRITICAL: Fixed 2 billion score bug, removed queue system)
- **Before**: 4.6.12-MINIMAL-FIX (✅ Reset to stable + minimal Y positioning fixes only)
- **Before**: 4.6.11-PERFORMANCE-FIXED (Last stable version before V4.7.x disaster)
- **Before**: 4.7.x Series (FAILED - Aggressive spawn patterns caused 30-second crashes)
- **Before**: 4.6.10-COLLECTIBLES-PERFECTED (Failed - collectibles in ground)
- **Before**: 4.6.9-BROCCOLI-FIXED (Stable version before issues)
- **Before**: 4.6.8-REALISTIC-FRUITS (Halbierte Kiwis mit grünem Fruchtfleisch)
- **Before**: 4.6.7-COLLECTIBLES-ALIGNED (Alle Collectibles auf einheitlicher Höhe)
- **Before**: 4.6.6-COLLECTIBLES-FIXED (Brokkoli jetzt auf Spielerhöhe)

### **BASISVERSION 3 - DEFINITION (05.08.2025 - UPDATED)**
**VERSION**: V3.0-COLLECTIBLES  
**STATUS**: ✅ STABLE & FUNKTIONSFÄHIG & GETESTET
**FEATURES**:
- ✅ Grundlegendes Endless Runner Gameplay
- ✅ Duck Collision Detection (Spieler MUSS ducken bei highbarrier/duckbeam)
- ✅ Stability Features (Score Limits, Object Limits, Memory Monitoring)
- ✅ Verschiedene Hindernistypen (lowbarrier, highbarrier, spikes, etc.)
- ✅ Lane-Switching System
- ✅ Jump & Duck Mechanics
- ✅ **NEU**: Äpfel & Brokkoli Collectibles (4-Sekunden Intervall)
- ✅ **NEU**: Sichere Spawn-Limitierung (max 8 gleichzeitig)
- ❌ KEINE Level/Characters (zu komplex für Basis)

**WARUM BASISVERSION 3?**
Nach erfolgreicher Implementation der Collectibles (Äpfel & Brokkoli mit 4-Sekunden Spawn) ist dies die neue stabile Basis. User bestätigt: "Das hat sehr gut funktioniert" und "es stürzt wahrscheinlich nicht ab".

### **KNOWN ISSUES TO FIX IN V3.1**:
- ⚠️ Zu viele Hindernisse (spawn rate reduzieren)
- ⚠️ Zu wenige Collectibles (von 4 auf 2-3 Sekunden)
- ⚠️ Collectibles spawnen direkt vor/hinter Hindernissen (unfair!)

### **CURRENT CODEBASE STATUS**
The game is currently at version V3.0-COLLECTIBLES (NEUE BASISVERSION 3). The SubwayRunner/index.html is the primary production file with working Apple & Broccoli collectibles.

### **V4.6.13 SCORE-FIX DETAILS**
- **CRITICAL BUG FIXED**: Score explosion to 2+ billion points
- **Root Cause**: Every obstacle leaving screen gave +10 "shield_collision" points
- **Solution**: 
  - Removed buggy addScore line
  - Removed entire score queue system
  - Direct score updates only
  - UI update throttling (10 FPS)
  - Score cap at 999,999
- **NO new features added**

### **V4.6.12 MINIMAL FIX DETAILS**
- **Changes**: ONLY Y-position adjustments
- **Broccoli**: Y=0.3 (confirmed working)
- **Kiwi**: Y=0.3 (same height as broccoli)
- **NO spawn algorithm changes**
- **NO new features**
- **NO performance "optimizations"**

### **GAMEPLAY BALANCE PREFERENCES** (Stand: 27.07.2025)
- **Geschwindigkeit**: PERFEKT! Aktuelle Geschwindigkeit beibehalten (baseSpeed: 0.12)
- **Hindernisse**: Spawn-Raten sind gut balanciert (Start: 0.004, Ende: 0.035)
- **Collectibles**: 10 Kiwis + 5 Broccolis - reduziert für besseres Gameplay
- **Visuals**: Realistische braune Kiwis, bodennahe grüne Broccolis

### **VERSION UPDATE PROCESS**
1. **Find version location**: Search for `V4.6.13-SCORE-FIX` in `SubwayRunner/index.html`
2. **Update version string**: Replace with new version (e.g., `V4.6.14-NEW-FEATURE`)
3. **Update CLAUDE.md**: Add new version to "CURRENT VERSION TRACKING" section
4. **Update commit message**: Use format `🎮 Version X.Y.Z: [feature description]`
5. **User notification format**: "🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/"
6. **Version locations to update**:
   - `SubwayRunner/index.html`: Main version display
   - `CLAUDE.md`: Version tracking section
   - Git commit message: Version reference

### **DEBUGGING & TROUBLESHOOTING**
- **Test Files**:
  - `SubwayRunner/test-runner.js`: Custom test suite (syntax, structure, performance, logic)
  - `SubwayRunner/tests/game.test.js`: Playwright browser tests
  - `SubwayRunner/test-gamestate.html`: Manual game state testing
- **Debug Utilities**:
  - `SubwayRunner/syntax_validator.html`: Check JavaScript syntax errors
  - `SubwayRunner/find_syntax_error.js`: Locate syntax issues
  - `SubwayRunner/function_test.html`, `quick_test.html`: Isolated function testing
- **Troubleshooting Docs**:
  - `SubwayRunner/DEBUG_GUIDE.md`: Common issues and solutions
  - `SubwayRunner/TROUBLESHOOTING.md`: Performance and bug fixes
  - `troubleshooting.md`: Repository-wide issues
- **Version Rollback**: Multiple `.backup` files for emergency restoration

### **KEY FEATURES IMPLEMENTED**
- **10 Unique Levels**: Each with distinct themes, obstacles, and mechanics
- **5 Playable Characters**: NEON-7 (Cyberpunk), Commander Void (Space), Lara Thornwood (Jungle), Bjorn Frostbeard (Ice), Seraphina Prism (Crystal)
- **Level System**: Automatic progression every 1000 points
- **Visual Effects**: Enhanced graphics with particles, shaders, and post-processing
- **Gesture Control**: MediaPipe integration for head tracking
- **Ghost Racing**: Daily challenges with Supabase integration
- **Collectibles**: Kiwis, Broccolis, and Mystery Boxes (strict no-power-ups rule)
- **Performance**: Object pooling, frustum culling, adaptive quality

### **🚀 AUTO-DEPLOYMENT RULE (CRITICAL)**
**WICHTIGE REGEL**: Nach jeder längeren Programmier-Session IMMER sofort online stellen!
- Nach Implementierung von Features/Fixes: `git add . && git commit -m "message" && git push`
- GitHub Actions deployed automatisch zu https://ki-revolution.at/
- Nutzer sollen immer die neueste Version testen können
- Online läuft derzeit nur eine Testversion - regelmäßige Updates sind essentiell

## Common Development Commands

### SubwayRunner (Vanilla JS/Three.js) - Primary Project
```bash
cd SubwayRunner

# Local Development
python -m http.server 8001      # Serve index.html locally
npm run serve                   # Alternative: live-server with auto-reload

# Testing Commands
npm run test                    # Run custom test-runner.js (syntax, structure, performance, logic tests)
npm run test:watch             # Run tests in watch mode with nodemon
python -m http.server 8001 &   # Start server for Playwright tests
npx playwright test            # Run Playwright browser tests
npx playwright test --ui       # Run with interactive UI
npx playwright test --debug    # Debug mode

# React Development (src/ folder)
npm install                     # Install dependencies
npm run dev                     # Start Vite dev server (port 5173)
npm run build                   # Build for production
npm run lint                    # Run ESLint (max 0 warnings)
npm run preview                 # Preview production build

# Deployment
npm run predeploy              # Pre-deployment validation (runs tests)
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
# Automatic deployment via GitHub Actions to https://ki-revolution.at/
```

### Endless3D (Vanilla JS/Three.js)
```bash
cd Endless3D
# Serve locally - no build process needed
python -m http.server 8000
# Navigate to localhost:8000
```

### EndlessRunner-MVP (Pure JavaScript)
```bash
cd EndlessRunner-MVP
# Serve locally - no build process needed
python -m http.server 8000
# Navigate to localhost:8000
```

### GestureRunnerPro (Godot)
```bash
# Open project in Godot 4.3+
godot --path GestureRunnerPro

# Export for web
godot --export-release "Web" web_export/index.html

# Serve web export
cd GestureRunnerPro/web_export
python -m http.server 8000
```

### godot-mcp (MCP Server)
```bash
cd godot-mcp
npm install          # Install dependencies
npm run build        # Build TypeScript to JavaScript
npm run watch        # Watch mode for development
npm run inspector    # Run MCP inspector
```

## Architecture Overview

### SubwayRunner Architecture (Primary Project)
- **Dual Architecture**: 
  - **Production**: Single `index.html` file with embedded JavaScript modules (~5000+ lines)
  - **Development**: React + TypeScript in `src/` folder (Vite, React Three Fiber)
- **Core Game Systems** (embedded in index.html):
  - **Game State**: Menu, Playing, GameOver, Win states
  - **Scene Management**: Three.js scene, camera, lighting setup
  - **Track System**: 3-lane track with dynamic segment spawning
  - **Collision Detection**: 3D bounding box collision with tolerance settings
  - **Spawn System**: Distance-based spawning with speed scaling
  - **Score System**: Direct updates (queue system removed in v4.6.13)
- **Obstacle Types**: Tunnels, barriers, spikes, walls, moving obstacles, trains
- **Collectibles**: Kiwis (brown spheres), Broccolis (green), Mystery Boxes (golden fountains)
- **Controls**: Keyboard (WASD/Arrows) and planned MediaPipe gesture support
- **Performance**: Object pooling, frustum culling, 60 FPS target

### Endless3D Architecture
- **Modular World System**: JSON-configurable environments and themes
- **Object Pooling**: Efficient obstacle and track segment reuse
- **Adaptive Performance**: Quality scaling based on FPS detection
- **Perspective Rendering**: Objects spawn in distance, move toward player
- **Pattern-based Spawning**: Configurable obstacle patterns per world

### EndlessRunner-MVP Architecture
- **Event-driven**: Clean component communication via custom events
- **Device-adaptive**: GPU tier detection with quality scaling
- **Feature-rich**: Shop system, biomes, power-ups, achievements
- **Analytics System**: Real-time player behavior tracking
- **Cross-platform**: ES5 compatibility with modern progressive enhancement

### GestureRunnerPro Architecture
- **Godot Scene System**: Modular scenes for UI, gameplay, effects
- **Autoloaded Singletons**: GameCore, AudioManager, SaveSystem, Analytics
- **MediaPipe Integration**: Real-time gesture recognition via JavaScript bridge
- **WebCam Support**: Browser webcam access with pose landmark detection
- **Gesture System**: 6 supported gestures (move left/right, jump, duck, shield, magnet)
- **Cross-Platform Bridge**: JavaScriptBridge for web export gesture communication
- **State Machine**: Player states with gesture-driven transitions

### godot-mcp Architecture
- **MCP Protocol**: Model Context Protocol server for Godot integration
- **WebSocket Communication**: Real-time communication with Godot editor
- **Command System**: Modular command processors for different operations
- **Resource Management**: Utilities for Godot scenes, scripts, and projects

## Key Design Patterns

### Performance Optimization
- All projects use object pooling to minimize garbage collection
- Adaptive quality systems adjust rendering based on device capabilities
- Frame-based updates ensure consistent 60+ FPS gameplay

### State Management
- **React projects**: Zustand for minimal state management
- **Vanilla JS**: Event-driven architecture with custom events
- **Godot**: Singleton autoloads for global state, signals for communication

### Collision Detection
- **3D projects**: Bounding box collision with configurable tolerances
- **2D Godot**: Physics body collision layers for precise detection
- **Performance**: Spatial partitioning and early exit optimizations

## Core Implementation Details

### SubwayRunner Game Loop Structure
```javascript
// Main game loop pattern (in index.html)
function animate() {
    requestAnimationFrame(animate);
    
    // 1. Update game state
    if (gameState === 'playing') {
        updatePlayer();          // Handle input, jumping, lane switching
        updateObstacles();       // Move and spawn obstacles
        updateCollectibles();    // Move and spawn collectibles
        checkCollisions();       // Bounding box collision detection
        updateScore();          // Direct score updates (no queue)
        updateSpeed();          // Progressive difficulty
    }
    
    // 2. Render scene
    renderer.render(scene, camera);
}
```

### Key Game Constants & Configuration
- **Base Speed**: 0.12 (perfect balance, don't change)
- **Max Speed**: ~0.35 (after collecting many items)
- **Lane Positions**: [-2, 0, 2] (left, center, right)
- **Jump Height**: 2.5 units
- **Jump Duration**: ~600ms
- **Collision Tolerance**: 0.2-0.3 units
- **Spawn Distance**: 30-50 units ahead
- **Score Cap**: 999,999 (prevents overflow)
- **Win Condition**: 30 kiwis collected

### Critical Bug Fixes History
- **V4.6.13**: Fixed 2 billion score bug (removed score queue system)
- **V4.6.12**: Fixed collectible Y-positioning (Y=0.3 for ground items)
- **V4.7.x**: FAILED - Aggressive spawning caused crashes (rolled back)

## 🎮 **BASISVERSION 3 - IMPLEMENTATION GUIDE**

### **ADDING FEATURES TO BASISVERSION 3**
When adding ANY new feature to BASISVERSION 3, follow this checklist:

1. **RESEARCH FIRST**
   ```bash
   # Check if feature existed before
   git log --oneline --grep="feature_name"
   grep -r "createFeature" SubwayRunner/*.backup
   ```

2. **CALCULATE IMPACT**
   ```javascript
   // For any spawn rate feature:
   const spawnRate = 0.02; // 2% chance
   const fps = 60;
   const itemsPerSecond = spawnRate * fps; // 1.2
   const itemsPer30Seconds = itemsPerSecond * 30; // 36
   console.log(`Will spawn ${itemsPer30Seconds} items in 30 seconds`);
   ```

3. **INCREMENTAL IMPLEMENTATION**
   - Start with MINIMAL code (max 20 lines)
   - Test locally for 30+ seconds
   - Only add complexity if basic version works

4. **VERSION INCREMENT**
   - V2.2 → V2.3 for small features
   - V2.2 → V3.0 for collectibles/major features

## 🚨 **CRITICAL GAME DESIGN RULES** (Never delete!)

### **Collectible System Rules**
**RULE 1**: ONLY these collectibles allowed:
- ✅ **Kiwis** (large, realistic brown fruit) 
- ✅ **Broccolis** (green vegetables)
- ✅ **Mystery Boxes** (max 2 per game) - golden sparkly fountains

**RULE 2**: NO rectangular/box collectibles:
- ❌ **NO** Power-ups (magnets, shields, speed boosts)  
- ❌ **NO** Score tokens or coins
- ❌ **NO** Geometric shapes as collectibles
- ❌ **NO** Rectangle/cube collectibles

**RULE 3**: Collectible spawning must be:
- ✅ **30+ units behind obstacles** (never next to or inside obstacles)
- ✅ **Speed-dependent spacing** that increases with game speed
- ✅ **Sequential spawning** - collectibles come AFTER obstacles, never parallel
- ✅ **Safe lane checking** with 25+ unit clearance

### **Collectible Balance Rules**
- **Target**: 30 Kiwis + 7 Broccolis (minimum 20 kiwis guaranteed)
- **Total limit**: 40 collectibles max for good gameplay
- **Bias**: 85% kiwi spawning, 15% broccoli spawning
- **Pattern limits**: Max 2 collectibles per pattern (never all 3 lanes)

## Development Guidelines

### Code Style
- Follow existing patterns in each project
- NO COMMENTS in code unless explicitly requested
- Maintain consistent naming conventions

### Performance Priorities
- Object pooling for all spawned objects (obstacles, collectibles)
- 60 FPS target on all devices
- Cleanup destroyed objects to prevent memory leaks

### Testing Strategy
- **SubwayRunner Testing Stack**:
  - **test-runner.js**: Validates syntax, HTML structure, performance metrics, game logic
  - **Playwright Tests**: Browser automation tests for gameplay, UI, collision detection
  - **Test Reports**: HTML reports in `tests/playwright-report/`
  - **Error Artifacts**: Screenshots and traces saved in `test-results/`
- **Test Execution**:
  ```bash
  npm run test          # Run all tests (test-runner.js)
  npx playwright test   # Run Playwright tests
  npm run test:watch    # Watch mode for development
  ```
- **Pre-deployment**: `npm run predeploy` runs tests before allowing deployment
- **Test Coverage**: Syntax validation, game initialization, collision detection, UI updates

## Deployment & CI/CD

### GitHub Actions Workflow
- **Workflow File**: `.github/workflows/hostinger-deploy.yml`
- **Trigger**: Push to main branch or manual workflow_dispatch
- **Process**: 
  1. Copies `SubwayRunner/index.html` to `deploy/index.html`
  2. Creates production `.htaccess` with security headers, HTTPS redirect, compression
  3. Deploys via FTP-Deploy-Action@v4.3.4
- **Target**: Hostinger FTP root directory (server-dir: /)
- **Secrets Required** (set in GitHub repo settings):
  - `FTP_SERVER`: Hostinger server IP address (not domain)
  - `FTP_USERNAME`: FTP username from Hostinger panel
  - `FTP_PASSWORD`: FTP password
- **Live URL**: https://ki-revolution.at/
- **Deployment Time**: ~2-3 minutes after push
- **Important**: GitHub Secrets are repository-specific - must be reconfigured when switching repos

### Known Issues & Current Focus
- **Next Phase**: Gesture control integration from GestureRunnerPro into SubwayRunner
- **Planned**: Sound system overhaul with realistic audio samples
- **Dual Architecture**: SubwayRunner exists as both vanilla JS (index.html) and React version (src/)

## Project-Specific Notes

### SubwayRunner (Primary Project)
- **Development Port**: 8001 (python -m http.server)
- **Production**: Single HTML file deployment (index.html)
- **React Version**: Available for development (uses Vite, TypeScript, React Three Fiber)
- **Current Version**: 4.6.13-SCORE-FIX
- **Deployment**: Automatic via GitHub Actions to https://ki-revolution.at/
- **Architecture**: Modular system with embedded GameCore, LevelManager, and Level modules
- **Key Features**: 10 levels, 5 characters, gesture control, ghost racing, visual effects
- **Testing**: Playwright test suite (`npm run test`), custom test runner (`test-runner.js`)

### Endless3D
- Fully modular world system - add new worlds via JSON config
- German documentation - maintain language consistency
- Advanced shader effects and post-processing

### EndlessRunner-MVP
- Extensive feature set - over 10,000 lines of code
- iPad M1/M2 optimization with 120 FPS support
- UI/UX first development philosophy

### GestureRunnerPro
- **MediaPipe Version**: 0.10.0 from CDN for pose detection
- **Gesture Recognition**: 240x180 video preview with real-time skeleton overlay
- **Browser Requirements**: WebRTC (getUserMedia), WebGL, HTTPS for camera access
- **Key Files**: systems/gesture/GestureInterface.gd, web_export/mediapipe/gesture_bridge.html
- **Gesture Thresholds**: 15% torso height for lean, 30% above shoulders for jump

### godot-mcp
- Requires Godot editor to be running for full functionality
- TypeScript source compiled to JavaScript for distribution
- Provides tools for scene management, script editing, and project operations

## Important Documentation Files

- **CLAUDE_CODE_RULES.md**: Universal rules for all Claude Code projects (MUST READ)
- **github.hostinger.connection.md**: Fix deployment issues with GitHub Actions
- **SubwayRunner/DEBUG_GUIDE.md**: Common game bugs and solutions
- **HEAD_TRACKING_README.md**: MediaPipe gesture control setup

## File Structure
- **SubwayRunner/index.html**: Main production game (5000+ lines, embedded JS)
- **SubwayRunner/src/**: React development version (not deployed)
- **SubwayRunner/*.backup**: Emergency rollback files
- **SubwayRunner/tests/**: Playwright tests and reports
- **.github/workflows/**: GitHub Actions deployment scripts

## 🚨 MANDATORY DEVELOPMENT WORKFLOW (NEVER SKIP!)

### **TESTING → DEPLOYMENT → REPORT WORKFLOW**

Für JEDE größere Änderung MUSS dieser Workflow befolgt werden:

#### **SCHRITT 1: PLAYWRIGHT TESTING** 
```bash
# PFLICHT: Tests ausführen vor JEDEM Deployment
npm run test
```

#### **SCHRITT 2: FEHLER BEHEBEN**
- ❌ **BEI FEHLERN**: Sofort alle Errors beheben
- ❌ **NIEMALS deployen** wenn Tests fehlschlagen
- ✅ **ERST wenn alle Tests grün**: Weiter zu Schritt 3

#### **SCHRITT 3: DEPLOYMENT (nur bei erfolgreichen Tests)**
```bash
# NUR wenn Tests erfolgreich:
git add . && git commit -m "message" && git push
```

#### **SCHRITT 4: USER BENACHRICHTIGUNG**
```
✅ [Feature] erfolgreich implementiert und deployed!
🧪 Alle Tests erfolgreich durchgelaufen
🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/
```

### **NIEMALS WIEDER:**
- ❌ Deployment ohne Testing
- ❌ Deployment mit bekannten Fehlern  
- ❌ User Benachrichtigung ohne Verifikation
- ❌ "Sollte funktionieren" Aussagen

### **IMMER:**
- ✅ Testing vor JEDEM Deployment
- ✅ Error-free Status vor Online-Stellung
- ✅ Verifikation vor User-Report