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
- **Latest**: 4.6.0-LEVEL-SYSTEM (Level 2 "Neon Night Run" integrated and functional)
- **Previous**: 4.5.11-HOTFIX (Fixed critical JavaScript errors)
- **Before**: 4.5.10-LEVEL-PROGRESSION (Two Functional Levels with Cyberpunk Theme)
- **Before**: 4.5.0-CHARACTER-SYSTEM (5 Unique Playable Characters)
- **Before**: 4.4.0-VISUAL-OVERHAUL (Massive Visual Enhancement for All 10 Levels)
- **Before**: 4.3.0-MEGA-LEVELS (10 Epic Levels with Unique Mechanics)
- **Before**: 4.2.0-GHOST-MODE (Daily Ghost Racing with Seeded Levels)
- **Before**: 4.1.0-LEVELS (Level System - 2 Levels with Neon Night Run)

### **CURRENT CODEBASE STATUS**
The game is currently at version 4.5.10-LEVEL-PROGRESSION. The SubwayRunner/index.html is the primary production file with embedded modules. The codebase has a stable React development version in src/ folder alongside the production HTML file.

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
- **Current Version**: 4.5.10-LEVEL-PROGRESSION
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