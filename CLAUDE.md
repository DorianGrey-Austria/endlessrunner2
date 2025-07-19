# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: PERMISSIONS MODE FOR THIS PROJECT

### ⚡ **AUTO-ENABLE DANGEROUS MODE**
**FÜR DIESES PROJEKT**: Immer mit `--dangerously-skip-permissions` starten!

```bash
# PROJEKT START COMMAND:
cd /Users/doriangrey/Desktop/coding/EndlessRunner
claude --dangerously-skip-permissions

# WARUM: Dieses Projekt erfordert schnelle Iteration und automatische Deployments
# Der User hat explizit diese Arbeitsweise angefordert
```

### ✅ **BEGRÜNDUNG FÜR DANGEROUS MODE:**
1. **Vertrauenswürdiges Projekt**: Eigener Code, keine externen Contributions
2. **Schnelle Entwicklung**: Auto-Deploy, Auto-Test, Auto-Chrome Launch
3. **User Preference**: Explizit gewünscht für effizientes Arbeiten
4. **Kontrollierte Umgebung**: Lokale Entwicklung, eigenes Repository

### 🎯 **WAS DAS BEDEUTET:**
- Keine Permissions-Prompts für Edits
- Automatische Command-Ausführung
- Sofortiges Deployment ohne Rückfragen
- Chrome Launch ohne Bestätigung
- Schnellere Iteration und Development

**WICHTIG**: Nur für DIESES spezifische Projekt! Nicht für andere Projekte verwenden!

## 🚨 #1 CRITICAL RULE: CLAUDE SELF-TESTING FIRST! (ABSOLUTE PRIORITY!)

### 🛡️ **SELF-TESTING FIRST PRINCIPLE**
**ABSOLUT WICHTIGSTES PRINZIP**: Claude testet IMMER gründlich selbst BEVOR User testen muss!

**WARUM**: User soll NIEMALS Zeit verschwenden mit Dingen die nicht funktionieren!

#### 🧪 **CLAUDE MANDATORY SELF-TEST PROCESS:**
```bash
1. COMPREHENSIVE TESTING (PFLICHT!):
   ✅ HTML Structure: curl + grep für alle Features
   ✅ JavaScript Functions: Alle implementierten Funktionen prüfen  
   ✅ Configuration: Neue Configs/Werte validieren
   ✅ Console Errors: 0 Errors bei Server-Start
   ✅ Feature Validation: Core Features funktional
   ✅ FUNCTION DUPLICATION CHECK: grep -n "function functionName" file

2. CRITICAL FUNCTION DUPLICATION PREVENTION:
   ❌ NEVER define same function twice in one file
   ❌ NEVER reference function before it's defined
   ❌ NEVER use const originalFunc = func with function declarations
   ✅ ALWAYS search before adding: grep "function newFunctionName"
   ✅ ONE FUNCTION = ONE DEFINITION rule (absolute!)
   ✅ Test JavaScript syntax: node -c or browser console check

2. OPTIONAL: AUTOMATED BROWSER TESTING:
   - Puppeteer/Playwright wenn verfügbar
   - Real gameplay testing
   - Screenshot bei Errors

3. NUR WENN ALLE SELF-TESTS ✅ → DEPLOYMENT + CHROME LAUNCH
```

#### ❌ **ABSOLUT VERBOTEN:**
- Chrome öffnen ohne Self-Test
- "Probier mal aus" ohne eigene Validierung  
- Deployment ohne Feature-Verification
- User als Beta-Tester missbrauchen

#### ✅ **KORREKTE REIHENFOLGE:**
1. **SELF-TEST** (5-10 Minuten gründlich)
2. **GIT COMMIT** (nur wenn Self-Test ✅)  
3. **DEPLOYMENT** (60s warten)
4. **CHROME LAUNCH** für User
5. **CONFIRMATION**: "Version X.Y.Z - SELF-TESTED ✅"

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES (SECONDARY PRIORITY!)

### 🔴 AUTO-DEPLOYMENT IST PFLICHT!
- **NACH JEDER SESSION**: `git add . && git commit -m "message" && git push`
- **URL FORMAT**: Immer als **🌐 https://ki-revolution.at/** (klickbar!)
- **BROWSER**: Chrome verwenden (NIEMALS Safari)
- **NACH DEPLOYMENT SAGEN**: "**🌐 Version X.Y.Z jetzt live auf https://ki-revolution.at/**"

### 🚀 MANDATORY SELF-TESTING + AUTO-WORKFLOW (CRITICAL!)
**ABSOLUT KRITISCHE REGEL**: CLAUDE TESTET IMMER SELBST BEVOR USER TESTEN DARF!

**🔴 SELF-TESTING FIRST WORKFLOW**

#### CLAUDE SELF-TESTING (PFLICHT!):
```bash
1. PLAYWRIGHT/PUPPETEER AUTOMATED TEST:
   - Console error check
   - Feature functionality test
   - Performance validation
   - Screenshot bei Errors

2. MANUAL VALIDATION (if automated fails):
   - python3 -m http.server 8001
   - curl/grep HTML content check
   - Basic functionality verification

3. NUR WENN SELF-TEST ERFOLGREICH → DEPLOYMENT
```

#### CLAUDE AUTO-DEPLOYMENT WORKFLOW:
```bash
1. SELF-TEST ✅ → Git commit + push
2. WAIT 60 SECONDS (GitHub Actions)
3. AUTO-LAUNCH CHROME für User
4. CLAUDE CONFIRMS: "🌐 Version X.Y.Z jetzt live - getestet ✅"
```

#### VOR JEDEM COMMIT (KEINE AUSNAHME!):
- [ ] **SELF-TEST**: Playwright/automated test erfolgreich
- [ ] **Console Errors = 0**
- [ ] **Core Features funktionieren**
- [ ] **Performance OK**
- [ ] **KEINE Module/Import Errors**

#### NACH DEPLOYMENT:
1. **60 Sekunden warten** (GitHub Actions)
2. **CHROME AUTOMATISCH ÖFFNEN**: `open -a "Google Chrome" https://ki-revolution.at/`
3. **F12 → Console checken** (User macht das)
4. **CLAUDE BESTÄTIGT**: "**🌐 Version X.Y.Z jetzt live - SELF-TESTED ✅**"

**WARUM**: User soll NIEMALS ungetestete Versionen sehen müssen!

**⚠️ MODULE-LOADING REGRESSION PREVENTION:**
- NIEMALS separate .js Module Files!
- ALLES inline in index.html!
- KEIN ModuleLoader!
- KEIN import/export!

**WARUM**: Module Loading Errors kommen IMMER WIEDER zurück wenn nicht getestet!

### 📋 WORKFLOW STANDARDS
1. **Versionierung**: IMMER updaten (MAJOR.MINOR.PATCH)
2. **Dokumentation**: Änderungen sofort in .md Dateien
3. **Testing**: "Teste in Chrome: **🌐 https://ki-revolution.at/**"
4. **UI/UX First**: User Experience > Technische Eleganz
5. **Kurze Antworten**: Präzise, action-orientiert mit ✅

**SIEHE AUCH**: [CLAUDE_CODE_RULES.md](./CLAUDE_CODE_RULES.md) für vollständige Regeln!

## 🎮 PROJECT VISION: GESTURE-CONTROLLED GAMING

### 🚀 ULTIMATE GOAL: Full Gesture Control Integration
**WICHTIG**: Alles was wir entwickeln ist Vorbereitung für **Gesture-basiertes Gaming**!
- **Ziel**: MediaPipe Head Tracking als primäre Steuerung
- **Jede Entscheidung** muss Gesture-Kompatibilität berücksichtigen
- **UI/UX**: Optimiert für 300-500ms Gesture-Latenz
- **Collectibles**: Gesture-freundliche Spawn-Patterns
- **Level Design**: Natürliche Bewegungsflows

### ⚡ GESTURE CONTROL PRINCIPLES:
1. **Forgiving Hitboxes** - Keine Pixel-Präzision nötig
2. **Predictive Patterns** - Collectibles in natürlichen Bewegungspfaden
3. **Smooth Transitions** - Keine abrupten Richtungswechsel
4. **Accessibility First** - Für alle Gesture-Stile spielbar
5. **Flow Optimization** - Bewegungen sollen sich natürlich anfühlen

## Repository Overview

This is a collection of endless runner game projects built with different technologies, following a UI/UX-first development philosophy where user experience drives all technical decisions.

- **SubwayRunner**: Vanilla JavaScript + Three.js (main production game, deployed via GitHub Actions)
- **Endless3D**: Vanilla JavaScript + Three.js (perspective-based 3D runner with world system)
- **EndlessRunner-MVP**: Pure JavaScript (feature-rich browser runner)
- **GestureRunnerPro**: Godot 4.3 (gesture-controlled runner with MediaPipe WebCam integration)
- **godot-mcp**: Godot MCP server for AI integration

**Primary Project**: SubwayRunner is the main production game with automated deployment to Hostinger.
**Future Vision**: Full MediaPipe Gesture Control integration across all projects!

## 🚨 VERSIONING RULES (NEVER DELETE!)

### **CRITICAL: Version Management System**
**RULE 1**: Every deployment MUST increment the sub-version number  
**RULE 2**: Version format: MAJOR.MINOR.PATCH (e.g., 3.5.0)  
**RULE 3**: Increment rules:
- **PATCH** (+0.0.1): Bug fixes, small improvements, feature additions
- **MINOR** (+0.1.0): Major features, significant UI changes, new systems  
- **MAJOR** (+1.0.0): Complete rewrites, fundamental architecture changes

### **CURRENT VERSION TRACKING**
- **Latest**: 8.1.0-PSYCHOLOGY-ENGINE (Current production version with advanced psychology system)
- **Previous**: 7.8.0-ULTIMATE-DISTRIBUTION (Senior Developer Plan Implementation)
- **Before**: 7.7.0-SPAM-FIX-ULTIMATE (Root cause analysis and fix for collectibles over-spawning)
- **Before**: 6.0.0-ENTERPRISE (❌ FAILED - Complete modular architecture restructure)
- **Before**: 5.1.4-LEVEL3-REMOVED (Completely removed Level 3 to eliminate shader errors)
- **Before**: 5.1.3-SHADER-DISPOSAL (Fixed shader material memory leak)
- **Before**: 5.1.2-LEVEL3-SKIP (Prevent Level 3 loading to avoid shader errors)
- **Before**: 5.1.1-SHADER-FIX (Fixed critical Three.js shader errors)
- **Before**: 5.1.0-ACTION (Fast action gameplay, mobile controls, stars, icons-only UI)
- **Before**: 5.0.0-ULTIMATE (Initial V5 with reduced collectibles, mobile ducking)
- **Before**: 4.5.10-LEVEL-PROGRESSION (Two Functional Levels with Cyberpunk Theme)
- **Before**: 4.5.0-CHARACTER-SYSTEM (5 Unique Playable Characters)

### **CURRENT CODEBASE STATUS**
The game is currently at version 8.1.0-PSYCHOLOGY-ENGINE (deployed 10.07.2025). This version includes advanced psychology system with addiction mechanics, real-time player behavior analysis, and enhanced UI/UX. The game features faster gameplay speed (0.15 start, 0.60 max), improved mobile controls, star collectibles for invincibility, icons-only UI during gameplay, proper 3-2-1 countdown at start, and level display. The SubwayRunner/index.html is the primary production file with embedded modules.

### **CRITICAL PRODUCTION ISSUES (CURRENT)**
❌ **ENTERPRISE ARCHITECTURE FAILURE**: Version 6.0.0-ENTERPRISE (modular architecture) completely failed
- **Symptoms**: "Sound but no image" problems, FPS drops, error messages
- **Status**: Rolled back to stable monolithic version
- **Impact**: Production version at https://ki-revolution.at/ has performance issues
- **Solution**: Using rollback plan documented in FAILED_ENTERPRISE_ARCHITECTURE.md

### **VERSION UPDATE PROCESS**
1. Update version in `SubwayRunner/index.html` (search for "version:" string)
2. Update this CLAUDE.md file with new version info
3. Always mention new version when saying "test it online"
4. Format: "🌐 Version X.Y.Z available at https://ki-revolution.at/"

### **DEBUGGING & TROUBLESHOOTING**
- **Debug Files**: `SubwayRunner/DEBUG_GUIDE.md`, `SubwayRunner/TROUBLESHOOTING.md`
- **Enterprise Architecture**: `SubwayRunner/FAILED_ENTERPRISE_ARCHITECTURE.md`, `SubwayRunner/ROLLBACK_PLAN.md`
- **Architecture Reports**: `SubwayRunner/ENTERPRISE_ARCHITECTURE_REPORT.md`
- **Syntax Validation**: `SubwayRunner/syntax_validator.html`, `SubwayRunner/find_syntax_error.js`
- **Function Testing**: `SubwayRunner/function_test.html`, `SubwayRunner/quick_test.html`
- **Development Backups**: Multiple .backup files in SubwayRunner/ for version rollbacks

### **KEY FEATURES IMPLEMENTED**
- **10 Unique Levels**: Each with distinct themes, obstacles, and mechanics
- **5 Playable Characters**: NEON-7 (Cyberpunk), Commander Void (Space), Lara Thornwood (Jungle), Bjorn Frostbeard (Ice), Seraphina Prism (Crystal)
- **Psychology Engine**: Advanced addiction mechanics with real-time player behavior analysis
- **Level System**: Automatic progression every 1000 points
- **Visual Effects**: Enhanced graphics with particles, shaders, and post-processing
- **Gesture Control**: MediaPipe integration for head tracking
- **Ghost Racing**: Daily challenges with Supabase integration
- **Collectibles**: Kiwis (10), Broccolis (10), and Stars (unlimited for invincibility)
- **Performance**: Object pooling, frustum culling, adaptive quality
- **Mobile Optimization**: Responsive design with touch controls
- **Failed Enterprise Architecture**: Modular ES6 system (archived for future use)

### **🚀 AUTO-DEPLOYMENT RULE (CRITICAL)**
**WICHTIGE REGEL**: Nach jeder längeren Programmier-Session IMMER sofort online stellen!
- Nach Implementierung von Features/Fixes: `git add . && git commit -m "message" && git push`
- GitHub Actions deployed automatisch zu https://ki-revolution.at/
- Nutzer sollen immer die neueste Version testen können
- Online läuft derzeit nur eine Testversion - regelmäßige Updates sind essentiell

### **FAILED ENTERPRISE ARCHITECTURE (DOCUMENTED)**
**CRITICAL FAILURE**: Version 6.0.0-ENTERPRISE was a complete failure
- **Attempt**: Modular ES6 architecture with GameCore, PerformanceRenderer, LightweightPhysics
- **Result**: Production site broken - "Sound but no image", FPS drops, error messages
- **Recovery**: Rolled back to stable monolithic version (8.1.0-PSYCHOLOGY-ENGINE)
- **Lessons**: Big Bang architecture changes don't work - need incremental approach
- **Archive**: Valuable code components saved for future step-by-step integration
- **Documentation**: See `FAILED_ENTERPRISE_ARCHITECTURE.md` and `ROLLBACK_PLAN.md`

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
- **Current Architecture**: Monolithic HTML file (index.html) with embedded CSS/JS - STABLE
- **Failed Enterprise Attempt**: Modular ES6 architecture (v6.0.0-ENTERPRISE) - ARCHIVED
  - **GameCore.js**: 1,200+ lines enterprise game engine (saved for future use)
  - **PerformanceRenderer.js**: 1,500+ lines optimized Three.js renderer (archived)
  - **LightweightPhysics.js**: 800+ lines mobile physics system (archived)
- **Psychology Engine**: Advanced addiction mechanics with real-time player analysis
- **Three.js Integration**: Direct Three.js usage in monolithic file
- **Game Loop**: RequestAnimationFrame-based game loop with delta time
- **Obstacle System**: 10+ obstacle types including tunnels, barriers, spikes, walls
- **Audio System**: Background music with WAV format support
- **Deployment**: GitHub Actions automatic deployment to Hostinger via FTP
- **Version Display**: UI shows current version (8.1.0-PSYCHOLOGY-ENGINE) and deployment date
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
- **Primary Workflow**: `.github/workflows/deploy-enterprise.yml`
- **Trigger**: Push to main branch or manual workflow_dispatch
- **Process**: Copies SubwayRunner/index.html to root, creates deployment package
- **Multi-Version Deployment**: 
  - `index.html` (Original production version)
  - `index-modular.html` (Failed enterprise modular version)
  - `test-modular.html` (Architecture test suite)
- **Target**: Hostinger FTP deployment to root directory (server-dir: /)
- **Secrets Required**: FTP_SERVER (use IP address), FTP_USERNAME, FTP_PASSWORD
- **Live URL**: https://ki-revolution.at/
- **Important**: GitHub Secrets are repository-specific - must be reconfigured when switching repos
- **Production**: Enhanced .htaccess with HTTPS enforcement, compression, caching, security headers, and ES6 module support

### Known Issues & Current Focus
- **CRITICAL**: Production version has performance issues (sound but no image, FPS drops)
- **Failed Enterprise**: Modular architecture completely non-functional
- **Recovery Plan**: Step-by-step integration of enterprise features without breaking existing system
- **Next Phase**: Performance optimization without architectural changes
- **Planned**: Sound system overhaul with realistic audio samples
- **Architecture Status**: Monolithic production version (index.html) is stable, modular version failed

## Project-Specific Notes

### SubwayRunner (Primary Project)
- **Development Port**: 8001 (python -m http.server)
- **Production**: Single HTML file deployment (index.html) - STABLE
- **Failed Modular Version**: index-modular.html (v6.0.0-ENTERPRISE) - NON-FUNCTIONAL
- **Current Version**: 8.1.0-PSYCHOLOGY-ENGINE (deployed 10.07.2025)
- **Deployment**: Automatic via GitHub Actions to https://ki-revolution.at/
- **Architecture**: Monolithic system with embedded modules (30,000+ lines)
- **Key Features**: 10 levels, 5 characters, psychology engine, gesture control, ghost racing, visual effects
- **Production Issues**: Performance problems (sound but no image, FPS drops)
- **Testing**: Playwright test suite (`npm run test`), custom test runner (`test-runner.js`)
- **Recovery**: Using rollback plan to restore full functionality

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