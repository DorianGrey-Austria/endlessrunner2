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

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
```

## Current Version & Features

### V5.2.1-POWER-UPS-PERFECTED (Latest)
- **Shield Power-Up**: 3 Sekunden Schutz mit visueller Kuppel
- **Magnet Power-Up**: Zieht Collectibles aus allen Lanes an (goldener Ring)
- **Rainbow World**: Round 2 mit psychedelischem Portal
- **10 Unique Levels**: City, Space, Jungle, Ice, Crystal, etc.
- **5 Characters**: NEON-7, Commander Void, Lara Thornwood, Bjorn Frostbeard, Seraphina Prism

## Architecture

### SubwayRunner Structure
- **Production**: Single `index.html` file (~5000+ lines embedded JS)
- **Core Systems**: GameCore, LevelManager, Level modules
- **Game Loop**: `animate()` function with state management
- **Collision**: 3D bounding box with 0.2-0.3 tolerance
- **Performance**: Object pooling, frustum culling, 60 FPS target

### Key Constants
- **Base Speed**: 0.12 (PERFEKT - nicht ändern!)
- **Lane Positions**: [-2, 0, 2]
- **Jump Height**: 2.5 units
- **Score Cap**: 999,999
- **Win Condition**: 30 kiwis collected

## Quick Task Reference

### Adding New Obstacles
1. Add to obstacle spawning logic in `index.html` (~line 1500-2000)
2. Create Three.js geometry and material
3. Add collision detection case
4. Test spawn patterns

### Version Update Process
1. Search for current version (e.g., `V5.2.1`) in `SubwayRunner/index.html`
2. Update version string in HTML
3. Update CLAUDE.md version tracking
4. Commit with format: `🎮 Version X.Y.Z: [feature]`

### Emergency Rollback
```bash
ls SubwayRunner/*.backup  # Find backup version
cp SubwayRunner/index.html.V5.1.backup SubwayRunner/index.html
git add . && git commit -m "🚨 ROLLBACK to V5.1" && git push
```

## Testing & Debugging

### Test Files
- `test-runner.js`: Custom test suite
- `tests/game.test.js`: Playwright browser tests
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
- **SubwayRunner/index.html**: Main production game
- **SubwayRunner/DEBUG_GUIDE.md**: Common issues and solutions
- **.github/workflows/hostinger-deploy.yml**: Auto-deployment config

## Development Workflow

### MANDATORY FOR EVERY CHANGE
1. **Test locally**: `npm run test`
2. **Deploy**: `git add . && git commit -m "message" && git push`
3. **Report**: "✅ Feature deployed! 🌐 Version X.Y.Z live auf https://ki-revolution.at/"

### NEVER
- ❌ Deploy without testing
- ❌ Deploy with known errors
- ❌ Use Safari for testing
- ❌ Skip version increments