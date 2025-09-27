# 🚨 MASTER TROUBLESHOOTING - EndlessRunner (2025)

## 📋 HÄUFIGSTE PROBLEME & LÖSUNGEN

### 🎮 SPIEL STARTET NICHT - Version 6.3.0 (27.09.2025)

**PROBLEM**: Nach Music-System Implementation startet das Spiel nicht mehr bei "Classic" Click.

**URSACHE**:
- Audio-Manager überschreibt `window.selectControl` Funktion BEVOR die originale Funktion definiert wird
- Timing-Problem: DOMContentLoaded Event feuert vor der Definition der Game-Funktionen

**LÖSUNG**:
```javascript
// Warten auf vollständiges Laden aller Scripts
setTimeout(() => {
    if (typeof window.selectControl === 'function') {
        const originalSelectControl = window.selectControl;
        window.selectControl = function(controlType) {
            originalSelectControl(controlType);
            // Audio-Integration...
        };
    }
}, 100);
```

**STATUS**: ✅ BEHOBEN in V6.3.0

---

### 👤 PLAYER VERSCHWINDET (seit V5.1.0)

**PROBLEM**: Spieler wird nach 3-5 Sekunden unsichtbar auf Tablets.

**URSACHE**: Position-Updates überschreiben Player-Position unerwartet.

**ALLE VERSUCHE**:
- Player.position Reset
- Renderer.render() Force-Update
- Camera Position Adjustment
- Scene Graph Validation

**STATUS**: ❌ UNGELÖST - Emergency Fallback: V4.3-STABLE

---

### 🎥 HEAD TRACKING KALIBRIERUNG

**PROBLEM**: MediaPipe Head Tracking unzuverlässig.

**LÖSUNG**:
- Manual Calibration Button hinzugefügt
- Gesture Sensitivity angepasst
- iPhone/iPad spezifische Fixes

**STATUS**: ✅ BEHOBEN

---

### 📦 MCP CONNECTION ISSUES

**PROBLEM**: Godot MCP Server Verbindung instabil.

**LÖSUNG**:
```bash
cd godot-mcp
npm run build && npm run inspector
```

**STATUS**: ✅ BEHOBEN

---

### ⚠️ THREE.JS DEPRECATION WARNINGS

**PROBLEM**: Three.js 0.158.0 Deprecation Warnings.

**LÖSUNG**:
- Material.vertexColors → Material.vertexColors = true
- Geometry → BufferGeometry Migration
- Performance Optimizations

**STATUS**: ✅ BEHOBEN

---

### 🔄 ROLLBACK FEHLER (28.08.2025)

**PROBLEM**: Git Rollback zu V20.8 fehlgeschlagen.

**URSACHE**: Merge Conflicts in Large Files.

**LÖSUNG**: Manual Cherry-Pick von funktionierenden Commits.

**STATUS**: ✅ BEHOBEN

---

## 🛠️ DEBUGGING WORKFLOW

### 1. SOFORT-CHECKS
```bash
# Browser Console für JavaScript Errors
# Network Tab für Failed Requests
# Audio Context State prüfen
```

### 2. GAME-STATE VALIDATION
```javascript
console.log('gameState:', gameState);
console.log('player position:', player.position);
console.log('audioManager:', audioManager);
```

### 3. ROLLBACK STRATEGY
```bash
# Backup Files verfügbar:
ls SubwayRunner/*.backup

# Emergency Restore:
cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html
```

---

## 📊 VERSION HISTORY

- **V6.3.0** (27.09.2025): Music System + UI Redesign
- **V6.2.x** (25-27.09.2025): Audio System Implementation
- **V6.1.x**: Level System Balancing
- **V5.1.0**: Player Disappearing Bug introduced ❌
- **V4.3-STABLE**: Last known stable version ✅

---

## 🎯 FUTURE IMPROVEMENTS

### Needed:
- Player Disappearing Bug - Root Cause Analysis
- Memory Management Optimization
- Mobile Performance Tuning
- Error Handling Enhancement

### Completed:
- ✅ Modern Music UI (V6.3.0)
- ✅ Audio Manager System
- ✅ Cache-Busting Testing
- ✅ Performance Monitoring

---

## 🚨 EMERGENCY CONTACTS

**Golden Master**: Version 23.2 (commit a00d4c7)
**Stable Fallback**: V4.3-STABLE
**Live URL**: https://ki-revolution.at/

**Testing Protocol**:
1. npm run test
2. Local test: python3 -m http.server 8001
3. Deploy only if tests ✅
4. User verification required