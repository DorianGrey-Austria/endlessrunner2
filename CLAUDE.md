# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL DEPLOYMENT WORKFLOW

**MANDATORY**: After every code change, immediately deploy with:
```bash
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
```

**Live URL**: https://ki-revolution.at/ (test in Chrome, not Safari)

## Repository Architecture

This is a collection of endless runner games showcasing different technologies:

### Primary Projects
- **SubwayRunner**: Main production game (Vanilla JS + Three.js) - deployed to https://ki-revolution.at/
- **GestureRunnerPro**: Godot 4.3 webcam gesture-controlled runner
- **EndlessRunner-MVP**: Feature-rich browser runner (10k+ lines)
- **godot-mcp**: MCP server for AI-driven Godot integration
- **Endless3D**: 3D runner with modular world system

**Focus**: SubwayRunner is the primary production game.

## SubwayRunner Architecture

### Dual System
- **Production**: Single `index.html` (~5000+ lines embedded JavaScript)
- **Development**: React + TypeScript in `src/` folder (Vite build system)

### Core Technical Stack
- **Three.js 0.158.0**: 3D graphics engine
- **Game Loop**: 60 FPS with modular update system
- **Collision**: 3D bounding box detection (tolerance 0.2-0.3)
- **Performance**: Object pooling for obstacles/collectibles
- **Integration**: Supabase backend, MediaPipe gestures, ES6 modules

### Critical Game Constants (DO NOT CHANGE)
```javascript
BASE_SPEED = 0.12          // Extensively tested balance
LANE_POSITIONS = [-2, 0, 2]  // Left, center, right
JUMP_HEIGHT = 2.5          // Units, ~600ms duration
SCORE_CAP = 999999         // Prevents overflow
WIN_CONDITION = 30         // Kiwis to collect
```

### Main Game Loop Structure
```javascript
function animate() {
    requestAnimationFrame(animate);
    if (gameState === 'playing') {
        updatePlayer();      // Input, jumping, lane switching
        updateObstacles();   // Move and spawn obstacles
        updateCollectibles(); // Move and spawn collectibles
        checkCollisions();   // 3D bounding box detection
        updateScore();       // Direct updates (no queue)
        updateSpeed();       // Progressive difficulty
    }
    renderer.render(scene, camera);
}
```

## Essential Commands

### SubwayRunner Development
```bash
cd SubwayRunner

# Testing (MANDATORY before deploy)
npm run test              # 4-category test suite
npx playwright test       # Browser automation
npm run predeploy         # Full validation

# Development servers
python3 -m http.server 8001   # Production testing
npm run dev                   # React dev (port 5173)
npm run serve                 # Live-server watch mode

# Building
npm run build             # TypeScript + Vite production
npm run lint              # ESLint validation
```

### Other Projects
```bash
# Godot projects
godot --path GestureRunnerPro
godot --path GestureRunnerPro --headless --export-release "HTML5" web_export/

# MCP development
cd godot-mcp
npm run build && npm run inspector
npm run watch
```

## Version Management

### Current Status
- **ACTIVE**: V5.1.1-PLAYER-FIX (has critical bug - player disappears)
- **STABLE**: V4.3-STABLE (last known working version)
- **DOCUMENTATION**: See TROUBLESHOOTING_PLAYER_DISAPPEARING_BUG.md

### Version Update Process (MANDATORY)
1. Update BOTH `SubwayRunner/index.html` title tag AND `SubwayRunner/package.json` version
2. Increment version numbers (e.g., V4.2 → V4.3, 4.5.10 → 4.5.11)
3. Use emoji commit format: `🎮 Version X.Y.Z: [description]`
4. Never deploy same version twice

### Backup System
Emergency rollback available via `.backup` files in SubwayRunner/:
```bash
ls SubwayRunner/*.backup
cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html
```

## Automated Deployment

### GitHub Actions CI/CD
- **Trigger**: Push to main branch
- **Workflow**: `.github/workflows/hostinger-deploy.yml`
- **Process**: Copies `SubwayRunner/index.html` to production
- **Target**: Hostinger FTP → https://ki-revolution.at/
- **Time**: ~2-3 minutes

## Testing System

### Test Suite (`npm run test`)
**4 Categories**:
1. **Syntax**: Unclosed tags, Three.js loading, GameCore init
2. **Structure**: Level system, essential functions
3. **Performance**: File size, line count monitoring
4. **Game Logic**: Score system, collision detection

### Playwright Testing
- **Config**: `playwright.config.js`
- **Reports**: `tests/playwright-report/`
- **Devices**: Desktop Chrome + iPhone 12
- **Features**: Video/screenshot capture, localhost:8001

### Pre-deployment Checklist
```bash
npm run test    # Must pass before deployment
# Only deploy if tests pass
git add . && git commit -m "message" && git push
```

## Critical Game Rules

### Collectibles
- **Allowed**: Kiwis (brown), Broccolis (green), Mystery Boxes (golden)
- **Forbidden**: Power-ups, geometric shapes, score tokens

### Spawn Logic
- Collectibles: 30+ units behind obstacles, never parallel
- Speed-dependent spacing increases with game speed
- Balance: 85% kiwis, 15% broccoli
- Limits: Max 40 collectibles total, 10 simultaneous

## 🚨 CRITICAL BUG ALERT

**Player Disappearing Bug** (since V5.1.0):
- Player becomes invisible after 3-5 seconds
- Game unplayable on tablets
- All position-based fixes attempted and failed
- See TROUBLESHOOTING_PLAYER_DISAPPEARING_BUG.md for details
- **Emergency fallback**: Rollback to V4.3-STABLE

## Cross-Project Integration

### GestureRunnerPro (Godot 4.3)
- **Autoload**: GameCore, AudioManager, SaveSystem, Analytics
- **Architecture**: Scene-based (Main → Gameplay → UI)
- **Gesture**: MediaPipe via JavaScript bridge

### godot-mcp (MCP Server)
- **Purpose**: AI-driven Godot development
- **Tools**: Scene manipulation, script generation
- **Debug**: `npm run inspector` for MCP communication

## Standard Workflow

1. **Research**: `git log --grep="feature"` and check `.backup` files
2. **Calculate**: Spawn rates with `spawnRate * fps * timeSeconds`
3. **Version**: Update both HTML title and package.json
4. **Test**: `npm run test` + verify 30+ seconds gameplay
5. **Deploy**: Only if tests pass
6. **Verify**: Check live at https://ki-revolution.at/

## Quick Reference

```bash
# Most common workflow
cd SubwayRunner
npm run test
python3 -m http.server 8001
git add . && git commit -m "🎮 Version X.Y.Z: description" && git push

# Emergency restore
ls SubwayRunner/*.backup
cp SubwayRunner/index.html.V[version].backup SubwayRunner/index.html
```

**Auto-deployment after every change is mandatory. Always provide live URL as 🌐 https://ki-revolution.at/**