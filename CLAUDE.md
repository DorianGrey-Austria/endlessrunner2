# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES (TOP PRIORITY!)

### 🔴 AUTO-DEPLOYMENT IST PFLICHT!
- **NACH JEDER IMPLEMENTIERUNG (>1 MIN)**: `git add . && git commit -m "message" && git push`
- **SOFORT NACH DEPLOYMENT**: `open -a "Google Chrome" https://ki-revolution.at/`
- **URL FORMAT**: Immer als **🌐 https://ki-revolution.at/** (klickbar!)
- **BROWSER**: Chrome verwenden (NIEMALS Safari)
- **NACH DEPLOYMENT SAGEN**: "**🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/**"

### 🚀 AUTOMATISCHER WORKFLOW (KRITISCH!)
**REGEL**: Bei JEDER Implementierung die länger als 1 Minute dauert:
1. **Git Commit & Push**: Sofort nach Implementierung
2. **Chrome Auto-Open**: `open -a "Google Chrome" https://ki-revolution.at/`
3. **Teste sofort**: Funktionalität prüfen
4. **Berichte Ergebnis**: "Version X.Y.Z getestet - funktioniert/Problem gefunden"

**ZWECK**: Keine Zeitverschwendung - sofortiges Testen ermöglichen!

### 📋 WORKFLOW STANDARDS
1. **Versionierung**: IMMER updaten (MAJOR.MINOR.PATCH)
2. **Dokumentation**: Änderungen sofort in .md Dateien
3. **Testing**: "Teste in Chrome: **🌐 https://ki-revolution.at/**"
4. **UI/UX First**: User Experience > Technische Eleganz
5. **Kurze Antworten**: Präzise, action-orientiert mit ✅

**SIEHE AUCH**: [CLAUDE_CODE_RULES.md](./CLAUDE_CODE_RULES.md) für vollständige Regeln!

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
- **Latest**: 5.1.4-LEVEL3-REMOVED (Completely removed Level 3 to eliminate shader errors)
- **Previous**: 5.1.3-SHADER-DISPOSAL (Fixed shader material memory leak)
- **Before**: 5.1.2-LEVEL3-SKIP (Prevent Level 3 loading to avoid shader errors)
- **Before**: 5.1.1-SHADER-FIX (Fixed critical Three.js shader errors)
- **Before**: 5.1.0-ACTION (Fast action gameplay, mobile controls, stars, icons-only UI)
- **Before**: 5.0.0-ULTIMATE (Initial V5 with reduced collectibles, mobile ducking)
- **Before**: 4.5.10-LEVEL-PROGRESSION (Two Functional Levels with Cyberpunk Theme)
- **Before**: 4.5.0-CHARACTER-SYSTEM (5 Unique Playable Characters)

### **CURRENT CODEBASE STATUS**
The game is currently at version 5.1.4-LEVEL3-REMOVED. This version has completely removed Level 3 to eliminate recurring shader errors. The game now features faster gameplay speed (0.15 start, 0.60 max), improved mobile controls (swipe up to stand, swipe up again to jump), star collectibles for invincibility (replacing mystery boxes), icons-only UI during gameplay, proper 3-2-1 countdown at start, and level display. The SubwayRunner/index.html is the primary production file with embedded modules.

### **VERSION UPDATE PROCESS**
1. Update version in `SubwayRunner/index.html` (search for "version:" string)
2. Update this CLAUDE.md file with new version info
3. Always mention new version when saying "test it online"
4. Format: "🌐 Version X.Y.Z available at https://ki-revolution.at/"

### **DEBUGGING & TROUBLESHOOTING**
- **Debug Files**: `SubwayRunner/DEBUG_GUIDE.md`, `SubwayRunner/TROUBLESHOOTING.md`
- **Syntax Validation**: `SubwayRunner/syntax_validator.html`, `SubwayRunner/find_syntax_error.js`
- **Function Testing**: `SubwayRunner/function_test.html`, `SubwayRunner/quick_test.html`
- **Development Backups**: Multiple .backup files in SubwayRunner/ for version rollbacks

### **KEY FEATURES IMPLEMENTED**
- **9 Unique Levels**: Each with distinct themes, obstacles, and mechanics (Level 3 removed)
- **5 Playable Characters**: NEON-7 (Cyberpunk), Commander Void (Space), Lara Thornwood (Jungle), Bjorn Frostbeard (Ice), Seraphina Prism (Crystal)
- **Level System**: Automatic progression every 1000 points
- **Visual Effects**: Enhanced graphics with particles, shaders, and post-processing
- **Gesture Control**: MediaPipe integration for head tracking
- **Ghost Racing**: Daily challenges with Supabase integration
- **Collectibles**: Kiwis (7), Broccolis (7), and Stars (max 2 for invincibility)
- **Performance**: Object pooling, frustum culling, adaptive quality
- **Shader Error Resolution**: Complete removal of problematic Level 3 to ensure stable gameplay

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
# Main game file: index.html (single file with embedded CSS/JS)
python -m http.server 8001
# Navigate to localhost:8001

# React version (development)
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "message" && git push
# Deploys to https://ki-revolution.at/ via Hostinger FTP
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
  - **Production**: Single HTML file (index.html) with embedded CSS/JS
  - **Development**: React + TypeScript version with Vite build system
- **Three.js Integration**: Direct Three.js usage (vanilla) or React Three Fiber (React version)
- **Game Loop**: RequestAnimationFrame-based game loop with delta time
- **Obstacle System**: 7+ obstacle types including tunnels, barriers, spikes, walls
- **Audio System**: Background music with WAV format support
- **Deployment**: GitHub Actions automatic deployment to Hostinger via FTP
- **Version Display**: UI shows current version and deployment date
- **Gesture Control**: MediaPipe integration for head tracking controls

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

## 🚨 **CRITICAL GAME DESIGN RULES** (Never delete!)

### **🎮 LEVEL PROGRESSION SYSTEM (FUNDAMENTAL RULE)**
**CRITICAL RULE**: Level progression happens ONLY by completing levels, NOT by score!

- ✅ **Level Completion**: Player must finish entire level to unlock next level
- ✅ **Sequential Unlocking**: Level 2 unlocks only after Level 1 completion
- ✅ **No Score-Based Progression**: Points do NOT trigger level changes
- ✅ **Developer Testing Button**: Temporary skip button for development/testing ONLY

**Implementation**: 
- Level progression triggered by reaching level end, not score milestones
- Each level has defined length/completion criteria
- After level completion: "Level Complete!" + "Next Level" button appears
- Score is for ranking/achievements, NOT for level unlocking

### **🍎 COLLECTIBLE SYSTEM RULES - ABSOLUTE DEFINITIONEN**

**RULE 1**: EXAKT DIESE COLLECTIBLES PRO SPIEL:
- ✅ **10 Kiwis** (große, realistische braune Früchte) 
- ✅ **10 Broccolis** (grüne Gemüse)
- ✅ **Stars** (für temporäre Unbesiegbarkeit) - unbegrenzt spawnable

**RULE 2**: ABSOLUT VERBOTEN:
- ❌ **KEINE** leuchtenden Vierecke/Boxen
- ❌ **KEINE** Power-ups (Magnete, Schilde, Speed-Boosts)  
- ❌ **KEINE** Score-Token oder Münzen
- ❌ **KEINE** geometrischen Formen als Collectibles
- ❌ **KEINE** Mystery Boxes oder goldene Fountains

**RULE 3**: PLATZIERUNGS-REGELN (UNVERHANDELBAR):
- ✅ **MINIMUM 40+ Einheiten Abstand zu Hindernissen** (nie daneben oder darin)
- ✅ **NIEMALS parallel zu Hindernissen spawnen**
- ✅ **SEQUENZIELLE Spawning** - Collectibles kommen NACH Hindernissen
- ✅ **Safe-Zone-Checking** mit 30+ Einheiten Clearance in alle Richtungen
- ✅ **Hindernisse-Prüfung** vor JEDEM Collectible-Spawn

### **🎯 COLLECTIBLE BALANCE RULES - FESTE ZAHLEN**
- **EXAKT**: 10 Kiwis + 10 Broccolis + unbegrenzt Stars
- **Kiwi-Broccoli-Verhältnis**: 50:50 (nicht mehr 85:15)
- **Stars**: Spawnen nur nach erfolgreicher Hindernissvermeidung
- **Spawn-Reihenfolge**: Kiwi → Broccoli → Star (rotierend)
- **NIEMALS**: Mehr als 1 Collectible pro Spawn-Zyklus
- **NIEMALS**: Collectibles in allen 3 Lanes gleichzeitig

### **🛡️ ANTI-HINDERNISSE-NÄHE-SYSTEM**
```javascript
// SENIOR DEVELOPER RULE: Diese Funktion MUSS vor jedem Collectible-Spawn aufgerufen werden
function isCollectibleSpawnSafe(lane, zPosition) {
    const MINIMUM_DISTANCE = 40; // Erhöht von 30 auf 40
    const PARALLEL_CHECK_RANGE = 20; // Prüfe 20 Einheiten vor/zurück
    
    // Prüfe ALLE Hindernisse in der Nähe
    for (let obstacle of obstacles) {
        if (!obstacle || !obstacle.position) continue;
        
        const distance = Math.abs(obstacle.position.z - zPosition);
        const laneDistance = Math.abs(obstacle.position.x - LANE_POSITIONS[lane]);
        
        // REGEL: Mindestabstand einhalten
        if (distance < MINIMUM_DISTANCE && laneDistance < 2) {
            return false;
        }
        
        // REGEL: Keine parallelen Spawns
        if (distance < PARALLEL_CHECK_RANGE && laneDistance < 2) {
            return false;
        }
    }
    
    return true;
}
```

### **🌟 STAR SYSTEM RULES**
- **Stars** spawnen nur nach erfolgreicher Hindernissvermeidung
- **Effect**: 5 Sekunden Unbesiegbarkeit
- **Visual**: Goldener Stern mit Glitzer-Effekt
- **Sound**: Besonderer Star-Collection-Sound
- **Spawn-Rate**: 1 Star pro 5 vermiedene Hindernisse

### **🤝 PARTNER-BUTTON SYSTEM**
- **Zweck**: Ermöglicht Level-Progression nach Game Over
- **Erscheint**: Nur nach fehlgeschlagenem Level-Versuch
- **Funktion**: Startet nächstes Level direkt (Development-Feature)
- **Temporär**: Wird später entfernt, wenn Level-Completion-System fertig ist
- **Button-Text**: "🚀 Nächstes Level (X)" - mit Level-Nummer

## Development Guidelines

### Code Style
- Follow existing patterns in each project
- Maintain consistent naming conventions per project type
- Prefer composition over inheritance where applicable

### Performance Considerations
- Always consider object pooling for frequently created/destroyed objects
- Use adaptive quality systems for cross-device compatibility
- Implement proper cleanup in component lifecycle methods

### Testing Strategy
- **SubwayRunner**: Custom test runner (`test-runner.js`) + Playwright tests (`npm run test`)
- **Test Commands**: `npm run test` for full suite, `npm run test:watch` for development
- **Godot projects**: Test in Godot editor and exported builds
- **MCP server**: Test with MCP inspector tool

## Deployment & CI/CD

### GitHub Actions Workflow
- **Trigger**: Push to main branch or manual workflow_dispatch
- **Process**: Copies SubwayRunner/index.html to root, creates deployment package
- **Target**: Hostinger FTP deployment to root directory (server-dir: /)
- **Secrets Required**: FTP_SERVER (use IP address), FTP_USERNAME, FTP_PASSWORD
- **Live URL**: https://ki-revolution.at/
- **Important**: GitHub Secrets are repository-specific - must be reconfigured when switching repos
- **Production**: Includes .htaccess with HTTPS enforcement, compression, caching, and security headers

### Known Issues & Current Focus
- **Next Phase**: Gesture control integration from GestureRunnerPro into SubwayRunner
- **Planned**: Sound system overhaul with realistic audio samples
- **Dual Architecture**: SubwayRunner exists as both vanilla JS (index.html) and React version (src/)

## Project-Specific Notes

### SubwayRunner (Primary Project)
- **Development Port**: 8001 (python -m http.server)
- **Production**: Single HTML file deployment (index.html)
- **React Version**: Available for development (uses Vite, TypeScript, React Three Fiber)
- **Current Version**: 5.1.4-LEVEL3-REMOVED
- **Deployment**: Automatic via GitHub Actions to https://ki-revolution.at/
- **Architecture**: Modular system with embedded GameCore, LevelManager, and Level modules
- **Key Features**: 9 levels (Level 3 removed), 5 characters, gesture control, ghost racing, visual effects
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

## Additional Resources

- **DEPLOYMENT.md**: German-language deployment guide with head tracking setup
- **ROADMAP.md**: Detailed development roadmap for GestureRunnerPro
- **github.hostinger.connection.md**: Troubleshooting guide for GitHub Actions deployment
- **CLAUDE_CODE_RULES.md**: Universal rules for all Claude Code projects
- **MCP-TROUBLESHOOTING.md**: Model Context Protocol troubleshooting guide
- **HEAD_TRACKING_README.md**: MediaPipe head tracking integration guide

## File Structure Patterns
- **index.html**: Main production files with embedded CSS/JS
- **src/**: React/TypeScript development versions
- **features/**: Extracted modular features from v4.x
- **backup files**: Version rollback support (.backup extensions)
- **sounds/**: Audio assets (background music, effects)
- **web_export/**: Godot web export directories

## Development Philosophy

**UI/UX First**: User experience is paramount. Every technical decision should prioritize the player's experience, ensuring intuitive controls, smooth performance, and engaging visual feedback across all devices.