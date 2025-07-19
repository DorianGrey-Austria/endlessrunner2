# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ MULTI-PROJECT CONTEXT WARNING

**AKTUELLE PARALLELE PROJEKTE:**
- 🏃‍♂️ **EndlessRunner** (dieses Projekt) - Gesture-controlled gaming, SubwayRunner, Stars/Kiwis/Broccolis
- 🎨 **Zeichen-App** (JOE FLOW APP 2025) - Digital drawing/design app mit Canvas-System  
- 📱 **Claude Code Mobile App** - Mobile development project

**CRITICAL:** Claude arbeitet gleichzeitig an mehreren Projekten. IMMER den Projekt-Kontext prüfen bevor Änderungen gemacht werden. Informationen nicht zwischen Projekten verwechseln!

## Project Overview

A collection of endless runner games built with different technologies, following a UI/UX-first philosophy. The primary project is **SubwayRunner** - a browser-based endless runner with automated deployment to https://ki-revolution.at/

### Project Structure
- **SubwayRunner**: Main production game (Vanilla JS + Three.js) - Monolithic architecture
- **Endless3D**: Perspective-based 3D runner (Vanilla JS + Three.js)
- **EndlessRunner-MVP**: Feature-rich browser runner (Pure JavaScript)
- **GestureRunnerPro**: Godot 4.3 implementation with MediaPipe integration
- **godot-mcp**: MCP server for Godot AI integration

## Critical Development Workflow

### 1. Self-Testing Requirements (MANDATORY)
Before ANY deployment, Claude must thoroughly self-test:
```bash
# Required self-tests:
✅ HTML Structure validation (curl + grep)
✅ JavaScript syntax check (node -c or console)
✅ Function duplication check: grep -n "function functionName"
✅ Feature functionality verification
✅ Console errors = 0
✅ Core gameplay mechanics working
```

### 2. Deployment Process (MANDATORY AUTO-WORKFLOW)
**IMMER auf ki-revolution.at deployen - KEINE lokalen Tests!**

```bash
# 1. Commit and push
git add . && git commit -m "descriptive message" && git push

# 2. Wait 60 seconds for GitHub Actions deployment

# 3. Auto-open Chrome (REQUIRED)
open -a "Google Chrome" https://ki-revolution.at/

# 4. Take screenshot and analyze functionality
# 5. Confirm deployment
"🌐 Version X.Y.Z live at https://ki-revolution.at/ - SELF-TESTED ✅"
```

**CRITICAL RULE:** Claude MUSS sich selbst testen durch:
- 60s Timeout nach Push
- Screenshot von ki-revolution.at machen
- Funktionalität analysieren 
- Bestätigung geben

### 3. Version Management
- Format: MAJOR.MINOR.PATCH (e.g., 8.1.0)
- Current: 8.1.0-PSYCHOLOGY-ENGINE
- Update in: `SubwayRunner/index.html` (search "version:")
- Increment: PATCH for fixes, MINOR for features, MAJOR for rewrites

## Common Development Commands

### SubwayRunner (Primary Project)
```bash
cd SubwayRunner

# Development
python -m http.server 8001     # Serve index.html
npm install                     # Install dependencies
npm run dev                     # React dev server (experimental)
npm run test                    # Run Playwright tests
npm run build                   # Build React version

# Testing
node test-runner.js             # Custom pre-deployment tests
npm run serve                   # Live reload server
```

### Other Projects
```bash
# Endless3D & EndlessRunner-MVP
python -m http.server 8000

# GestureRunnerPro
godot --path GestureRunnerPro
godot --export-release "Web" web_export/index.html

# godot-mcp
npm install && npm run build
npm run watch                   # Development mode
```

## Architecture & Key Features

### SubwayRunner Current State
- **Architecture**: Monolithic HTML with embedded JS/CSS (30,000+ lines)
- **Status**: Stable production version (failed modular attempt archived)
- **Deployment**: GitHub Actions → Hostinger FTP
- **Features**: 10 levels, 5 characters, psychology engine, gesture control ready
- **Performance**: Object pooling, adaptive quality, 60+ FPS target

### Critical Game Rules
1. **Collectibles**: EXACTLY 10 Kiwis + 10 Broccolis + unlimited Stars
2. **NO geometric shapes, power-ups, or glowing boxes as collectibles**
3. **Minimum 40 units distance between collectibles and obstacles**
4. **Level progression by completion, NOT by score**

### Known Issues
- Failed enterprise modular architecture (v6.0.0) - rolled back
- Performance optimization needed without architectural changes
- Module loading errors if using imports (keep everything inline)

## Testing Requirements

### Pre-deployment Checklist
- [ ] Run `node test-runner.js` (syntax validation)
- [ ] Check console for 0 errors
- [ ] Verify collectible spawn distances
- [ ] Test on mobile touch controls
- [ ] Validate version number updated

### Playwright Tests
```bash
npm run test              # Full test suite
npm run test:watch        # Development mode
```

## Important Files & Resources

### Debugging
- `SubwayRunner/DEBUG_GUIDE.md` - Comprehensive debugging guide
- `SubwayRunner/syntax_validator.html` - Syntax checking tool
- `SubwayRunner/test-runner.js` - Pre-deployment validation

### Architecture Documentation
- `FAILED_ENTERPRISE_ARCHITECTURE.md` - Lessons from failed modular attempt
- `ROLLBACK_PLAN.md` - Recovery procedures
- Multiple `.backup` files for version rollback

### Deployment
- `.github/workflows/deploy-enterprise.yml` - GitHub Actions config
- Secrets needed: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD

## Development Principles

1. **UI/UX First**: Every decision prioritizes user experience
2. **Gesture-Ready**: Design for 300-500ms latency, forgiving hitboxes
3. **Performance**: Adaptive quality, object pooling, 60+ FPS
4. **Self-Testing**: Never deploy untested code
5. **Auto-Chrome**: Always open browser after deployment

## Quick Start for This Project

### Automatic Start with Permissions Pre-Enabled

This project is configured to automatically use `--dangerously-skip-permissions` mode:

```bash
# Option 1: Use the start script (RECOMMENDED)
./start-claude.sh

# Option 2: Manual start with permissions flag
cd /Users/doriangrey/Desktop/coding/EndlessRunner
claude --dangerously-skip-permissions
```

### Project Configuration

The project includes:
- **`.claude/config.json`** - Automatic permission settings
- **`start-claude.sh`** - Quick start script with pre-enabled permissions

**Note**: This configuration skips all permission prompts for faster development. Only use for this trusted project.