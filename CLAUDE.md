# CLAUDE.md - EndlessRunner

## 🚨 DEPLOYMENT WORKFLOW
**MANDATORY**: Nach jeder Änderung sofort deployen:
```bash
git add . && git commit -m "🎮 Version X.Y.Z: [description]" && git push
```
**Live URL**: https://ki-revolution.at/ (Chrome verwenden!)

## Architektur
**SubwayRunner** = Haupt-Produktionsspiel (Vanilla JS + Three.js)
- **Production**: Root `index.html` (5000+ lines) → ki-revolution.at
- **Development**: SubwayRunner/ mit React + TypeScript

## Core Constants (NICHT ÄNDERN)
```javascript
BASE_SPEED = 0.12
LANE_POSITIONS = [-2, 0, 2]
JUMP_HEIGHT = 2.5
WIN_CONDITION = 30  // Kiwis
```

## Commands
```bash
cd SubwayRunner
npm run test        # PFLICHT vor Deploy
npm run self-test   # Pre-Deploy Check
python3 -m http.server 8001  # Local Test
```

## Level System (10 Level)
- **Level 1-2**: Tutorial (leicht)
- **Level 3**: PEAK Schwierigkeit
- **Level 4-5**: Entspannung
- **Level 6-10**: Progressive Steigerung

## Version Management
1. Update `index.html` title UND `package.json`
2. Format: `🎮 Version X.Y.Z: [description]`
3. Nie gleiche Version 2x deployen

## Workflow
1. Test → `npm run test`
2. Deploy → `git add . && git commit && git push`
3. Verify → https://ki-revolution.at/