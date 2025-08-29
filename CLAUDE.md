# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT & WORKFLOW RULES (TOP PRIORITY!)

### 🔴 AUTO-DEPLOYMENT IS MANDATORY!
- **AFTER EVERY CHANGE**: `git add . && git commit -m "message" && git push`
- **ALWAYS GO LIVE IMMEDIATELY**: Every code change must be deployed!
- **URL FORMAT**: Always as **🌐 https://ki-revolution.at/** (clickable!)
- **BROWSER**: Use Chrome (NEVER Safari)
- **AFTER DEPLOYMENT SAY**: "**🌐 Version X.Y.Z now live on https://ki-revolution.at/**"
- **NO LOCAL TESTS**: Test directly online at https://ki-revolution.at/

### 📋 WORKFLOW STANDARDS
1. **Versioning**: ALWAYS update (MAJOR.MINOR.PATCH)
2. **Documentation**: Changes immediately in .md files
3. **Testing**: "Test in Chrome: **🌐 https://ki-revolution.at/**"
4. **UI/UX First**: User Experience > Technical Elegance
5. **Concise Answers**: Precise, action-oriented with ✅

## Repository Architecture Overview

This is a collection of endless runner games built with different technologies, following a UI/UX-first philosophy. The project demonstrates modern web gaming capabilities across multiple platforms and technologies.

### Primary Projects:
- **SubwayRunner**: Main production game (Vanilla JS + Three.js, deployed via GitHub Actions)
- **Endless3D**: Perspective-based 3D runner with modular world system
- **EndlessRunner-MVP**: Feature-rich browser runner (10,000+ lines) with enterprise-grade architecture
- **GestureRunnerPro**: Godot 4.3 gesture-controlled runner with webcam integration
- **godot-mcp**: MCP server for AI-driven Godot integration

**Primary Focus**: SubwayRunner is the main production game at https://ki-revolution.at/

### Core Philosophy:
- **UI/UX First**: User experience drives all technical decisions
- **Performance Intelligence**: Adaptive rendering (60-120 FPS based on device)
- **Universal Compatibility**: From IE11 to modern M1/M2 iPads

## SubwayRunner - Core Architecture (Primary Project)

### Dual Architecture System:
- **Production**: Single `index.html` file (~5000+ lines embedded JavaScript)
- **Development**: React + TypeScript in `src/` folder (Vite, React Three Fiber)

### Key Technical Details:
- **Three.js 0.158.0**: 3D graphics engine
- **Game Loop**: 60 FPS requestAnimationFrame with modular update system
- **Collision Detection**: 3D bounding box with configurable tolerance (0.2-0.3)
- **Object Pooling**: Performance optimization for obstacles/collectibles
- **Module System**: Dynamic ES6 module loading for gesture control
- **Dependencies**: Supabase (backend), MediaPipe (gestures), Headtrackr.js (tracking)

### Game Constants (NEVER CHANGE):
- **Base Speed**: 0.12 (perfect balance tested extensively)
- **Lane Positions**: [-2, 0, 2] (left, center, right)
- **Jump Height**: 2.5 units, Duration ~600ms
- **Score Cap**: 999,999 (prevents overflow bugs)
- **Win Condition**: 30 kiwis collected

### Core Game Systems:
```javascript
// Main game loop structure (embedded in index.html)
function animate() {
    requestAnimationFrame(animate);
    if (gameState === 'playing') {
        updatePlayer();      // Input, jumping, lane switching
        updateObstacles();   // Move and spawn obstacles
        updateCollectibles(); // Move and spawn collectibles
        checkCollisions();   // 3D bounding box detection
        updateScore();       // Direct updates (no queue system)
        updateSpeed();       // Progressive difficulty
    }
    renderer.render(scene, camera);
}
```

## Essential Development Commands

### SubwayRunner (Primary Project)
```bash
cd SubwayRunner

# Development
python -m http.server 8001      # Local development server
npm run dev                     # React dev server (port 5173)
npm run serve                   # Live-server with watch mode on port 8001

# Testing (MANDATORY BEFORE DEPLOY)
npm run test                    # Custom test suite (syntax, performance, logic)
npx playwright test            # Browser automation tests
npm run test:watch             # Watch mode for development
npm run pretest                # Pre-test check with echo output
npm run predeploy              # Pre-deployment validation

# Linting & Building
npm run lint                   # ESLint for TypeScript/React
npm run build                  # TypeScript + Vite build
npm run preview                # Preview built application

# Deployment
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
# Automatic deployment via GitHub Actions to https://ki-revolution.at/
```

### Other Projects
```bash
# Endless3D / EndlessRunner-MVP
python -m http.server 8000     # Simple static serving

# GestureRunnerPro (Godot 4.3+)
godot --path GestureRunnerPro  # Open in Godot editor
godot --path GestureRunnerPro --headless --export-release "HTML5" web_export/  # Export HTML5

# godot-mcp (MCP Server)
npm run build                  # Build TypeScript to JavaScript
npm run inspector              # Launch MCP inspector tool
npm run watch                  # Watch mode for development
```

## Version Management System

### Current Status:
- **CURRENT**: V4.1-3ROUNDS-RESTORED (active deployment)
- **STABLE BASE**: V3.1-BALANCED (tested stable reference)

### Version Update Process:
1. Find version in `SubwayRunner/index.html` title
2. Update version string (e.g., `V4.6.14-NEW-FEATURE`)
3. Update this CLAUDE.md file
4. Use commit format: `🎮 Version X.Y.Z: [description]`

### Backup System:
- Multiple `.backup` files in SubwayRunner/ for emergency rollback
- Use: `cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html`

## Testing & Deployment

### GitHub Actions CI/CD:
- **Workflow**: `.github/workflows/hostinger-deploy.yml`
- **Trigger**: Push to main branch
- **Process**: Copies `SubwayRunner/index.html` → production deployment
- **Target**: Hostinger FTP (https://ki-revolution.at/)
- **Deployment Time**: ~2-3 minutes

### Testing Stack:
- **test-runner.js**: Syntax, structure, performance, logic validation
- **Playwright**: Browser automation tests with screenshots
- **Manual Testing**: ALWAYS test in Chrome after deployment

### Pre-deployment Checklist:
```bash
# MANDATORY workflow:
npm run test          # All tests must pass
# Only deploy if tests pass:
git add . && git commit -m "message" && git push
```

## Critical Game Design Rules

### Collectible System:
**ALLOWED**: Kiwis (brown), Broccolis (green), Mystery Boxes (golden)
**FORBIDDEN**: Power-ups, geometric shapes, score tokens

### Spawn Rules:
- **Collectibles**: 30+ units behind obstacles, never parallel
- **Speed-dependent spacing**: Increases with game speed
- **Balance**: 85% kiwis, 15% broccoli spawning
- **Limits**: Max 40 collectibles total, 10 simultaneous objects

## Emergency Procedures

### If Game Crashes:
1. Check `SubwayRunner/tests/playwright-report/` for test results
2. Look for backup versions: `ls SubwayRunner/*.backup`
3. Restore last working version
4. Deploy immediately

### Performance Issues:
- Monitor: Objects in scene should stay < 50
- Check: FPS must stay > 50
- Debug: Use browser DevTools Performance tab

## Key Files Structure:
```
EndlessRunner/
├── SubwayRunner/           # Main production project
│   ├── index.html          # Production game (5000+ lines embedded JS)
│   ├── src/                # React/TypeScript development version
│   ├── js/                 # Gesture control modules (ES6 modules)
│   ├── tests/              # Playwright tests with HTML reports
│   ├── *.backup           # Emergency rollback versions
│   ├── test-runner.js     # Custom validation suite
│   └── playwright.config.js # Test configuration
├── GestureRunnerPro/       # Godot 4.3 gesture-controlled runner
│   ├── scenes/            # Game scenes (Main, Gameplay, UI)
│   ├── systems/           # Modular game systems
│   ├── autoload/          # Singleton managers
│   └── project.godot      # Godot project configuration
├── godot-mcp/             # MCP server for Godot integration
│   ├── src/               # TypeScript source
│   ├── build/             # Compiled JavaScript
│   └── godot-mcp/         # Godot addon for MCP integration
└── .github/workflows/     # CI/CD automation
    └── hostinger-deploy.yml
```

## Development Philosophy

1. **UI/UX First**: User experience drives all decisions
2. **Performance Priority**: 60+ FPS is mandatory
3. **Incremental Changes**: Small deployments, immediate testing
4. **Research First**: Always check existing implementations before coding
5. **Mathematical Validation**: Calculate impact before implementing spawn changes

## Cross-Project Development

### GestureRunnerPro (Godot 4.3+)
- **Autoload System**: GameCore, AudioManager, SaveSystem, Analytics
- **Scene Architecture**: Main → Gameplay → UI components
- **Gesture Integration**: MediaPipe via JavaScript bridge in web export
- **Performance**: State machine pattern with object pooling

### godot-mcp Integration
- **Purpose**: AI-driven Godot development via MCP protocol
- **Tools**: Scene manipulation, script generation, project management
- **Usage**: `npm run inspector` for debugging MCP communication
- **Godot Addon**: WebSocket server for bidirectional communication

## MANDATORY Workflow for Every Session:

1. **RESEARCH**: `git log --grep="feature"` and `grep -r "function" *.backup`
2. **CALCULATE**: For spawn rates: `spawnRate * fps * timeSeconds`
3. **TEST LOCALLY**: Run for 30+ seconds, check console
4. **DEPLOY**: Only if tests pass
5. **VERIFY**: User tests in Chrome at live URL

**SUCCESS MANTRA**: RESEARCH → EXTRACT → COMBINE → TEST → DEPLOY

---

*Auto-deployment after every change is mandatory. Always provide live URL as **🌐 https://ki-revolution.at/***