# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Latest**: 4.1.1-MINIMAL-UI (Minimalist UI Design - Clean Gameplay Experience)
- **Previous**: 4.1.0-LEVELS (Level System - 2 Levels with Neon Night Run)
- **Before**: 4.0.8-TURBO (Massive Performance Optimization + Better Graphics)
- **Before**: 4.0.7-SMART (Intelligent Spawn Distribution System)
- **Before**: 4.0.6-PURE (Pure Collectibles Only)
- **Before**: 4.0.5-BALANCED (Perfect Balance & Realistic Kiwis)
- **Before**: 4.0.4-PERFORMANCE (High-Performance Optimizations)
- **Before**: 4.0.0 (SUPER FUN EDITION - 10 Mega-Features von 5 Sub-Agents implementiert)

### **VERSION UPDATE PROCESS**
1. Update version in `SubwayRunner/index.html` (around line 440)
2. Update this CLAUDE.md file with new version info
3. Always mention new version when saying "test it online"
4. Format: "🌐 Version X.Y.Z available at https://ki-revolution.at/"

### **VERSION HISTORY LOG**
- 4.1.1-MINIMAL-UI: Minimalist UI Design (UI state system, clean HUD, all info in menu, 100% gameplay focus)
- 4.1.0-LEVELS: Level System Implementation (2 levels, Neon Night Run, smooth transitions, new obstacles)
- 4.0.8-TURBO: Massive Performance Optimization (material cache, object pooling, frustum culling, 50% less draw calls)
- 4.0.7-SMART: Intelligent Spawn Distribution System (speed-adaptive spacing, anti-clustering, early game boost)
- 4.0.6-PURE: Pure Collectibles Only (removed all power-ups, fixed spacing)
- 4.0.5-BALANCED: Perfect Balance & Realistic Kiwis (limited spawns, bigger kiwis)
- 4.0.4-PERFORMANCE: High-Performance Optimizations (+300% speed boost)
- 4.0.3-FIXED: Kiwi/Broccoli Only Mode (disabled Score Token coins)
- 4.0.2-STABLE: Enterprise DevOps Production (monitoring, feature flags)
- 4.0.1: HOTFIX - Critical production errors fixed
- 4.0.0: SUPER FUN EDITION - 10 Mega-Features

### **🚀 AUTO-DEPLOYMENT RULE (CRITICAL)**
**WICHTIGE REGEL**: Nach jeder längeren Programmier-Session IMMER sofort online stellen!
- Nach Implementierung von Features/Fixes: `git add . && git commit -m "message" && git push`
- GitHub Actions deployed automatisch zu https://ki-revolution.at/
- Nutzer sollen immer die neueste Version testen können
- Online läuft derzeit nur eine Testversion - regelmäßige Updates sind essentiell

### **EXTENDED VERSION HISTORY LOG**
- 4.0.2: STABLE EDITION - Production-ready (Enterprise security, DevOps monitoring, feature flags, auto-rollback, performance tracking, error recovery)
- 4.0.1: HOTFIX - Critical production errors fixed (syntax error, CSP policy, function access)
- 4.0.0: SUPER FUN EDITION - 10 Mega-Features (only 3/10 fully implemented: Power-Up Fusion, Adrenaline Mode, Obstacle Destruction)
- 3.6.1: CRITICAL BUGFIX - Collectibles spawning repair (fixed totalCollectibles vs collectedKiwis confusion, spawn logic now works correctly)
- 3.6.0: Complete gamification system (30 kiwi limit, broccoli bonuses, elongated kiwi design, duck confetti, UI progress bars, smart 30:7 spawn ratio)
- 3.5.4: Complete collectible & power-up overhaul (max 2 per pattern + 50/50 balance + 3D horseshoe magnet + blue vignette + large collectible magnet)
- 3.5.2: Smart collectible spawning + obstacle avoidance + counter fixes + speed-based density
- 3.5.1: Kiwi visual improvements + duck obstacle height fixes + duck scoring system
- 3.5.0: Complete tiered bonus system implementation
- 3.4.2: Gamification (Kiwi/Broccoli collectibles, 80% achievement, jump fix)
- 3.4.1: Score system emergency overhaul (centralized scoring, throttling)
- 3.4.0: Visual effects, gesture control, collision fixes

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
- **SubwayRunner**: No specific test framework - rely on browser testing
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
- **Current Version**: 4.0.6-PURE (Pure Collectibles Only)
- **Deployment**: Automatic via GitHub Actions to https://ki-revolution.at/

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

## Development Philosophy

**UI/UX First**: User experience is paramount. Every technical decision should prioritize the player's experience, ensuring intuitive controls, smooth performance, and engaging visual feedback across all devices.