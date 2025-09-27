# 🚨 ENDLESSRUNNER TROUBLESHOOTING MASTER GUIDE (2025)

**Version**: V6.5.0-UNIFIED | **Last Updated**: 27.09.2025 | **Status**: ✅ PRODUCTION-READY

---

## 🎯 QUICK FIXES - Sofort-Lösungen

### 🔴 SPIEL STARTET NICHT
```bash
# 1. JavaScript Console prüfen (F12)
# 2. Cache löschen: Ctrl+Shift+R
# 3. Lokaler Test: python3 -m http.server 8001
# 4. Emergency Rollback: git checkout V4.3-STABLE
```

### 🔴 SOUND FUNKTIONIERT NICHT
```bash
# 1. Volume Button prüfen (🔊 oben rechts)
# 2. Browser Autoplay Policy: Erst klicken, dann Sound
# 3. Audio-Preview testen: Music-Buttons 3 Sek
# 4. EnhancedAudioManager verfügbar?: console.log(enhancedAudioManager)
```

### 🔴 PERFORMANCE PROBLEME
```bash
# 1. FPS prüfen: Ctrl+Shift+I → Performance Tab
# 2. Mobile: Niedrigere Qualität aktivieren
# 3. Nebel reduziert: fogDensity 40-50% weniger (V6.5.0)
# 4. Object Pooling aktiv: Keine memory leaks
```

---

## 📚 VOLLSTÄNDIGE PROBLEMLÖSUNGEN

### 1. 🎮 AUDIO SYSTEM PROBLEME

#### **Problem**: Musik-Preview funktioniert nicht
**Symptome**: Buttons klickbar, aber kein Sound | Nur alter Standard-Sound
**Ursache**: AudioManager-Doppeldefinition | Preview-Funktionalität deaktiviert

**✅ LÖSUNG**:
```javascript
// EnhancedAudioManager verwendet (V6.5.0)
if (typeof enhancedAudioManager !== 'undefined') {
    enhancedAudioManager.preview('aggressive'); // Test
}
```

**Verifikation**: `enhancedAudioManager.tracks` sollte 9 Tracks zeigen

---

### 2. 📺 MENU/GAME DISPLAY PROBLEME

#### **Problem**: Menu und Game gleichzeitig sichtbar (Splitscreen)
**Symptome**: UI overlappt | Spiel startet im Hintergrund | Kein Fullscreen-Menu

**✅ LÖSUNG** (GameStateManager V6.5.0):
```javascript
// State Management implementiert
gameStateManager.goToMenu();    // Nur Menu
gameStateManager.startGame();   // Nur Game + UI
```

**CSS**: `body.game-state-menu` vs `body.game-state-playing`

---

### 3. 🌫️ VISUAL EFFECTS PROBLEME

#### **Problem**: Nebel zu stark/unrealistisch
**Symptome**: Sichtweite zu gering | Performance-Impact | Überwältigend

**✅ LÖSUNG** (V6.5.0):
```javascript
// Alle fogDensity-Werte um 40-50% reduziert
Level 1: 0.005 → 0.003  // Leicht
Level 8: 0.020 → 0.010  // Maximal (vorher übertrieben)
```

**Dynamisch**: Nebel verstärkt sich mit Geschwindigkeit für Speed-Effekt

---

### 4. 👤 PLAYER DISAPPEARING BUG (CRITICAL)

#### **Problem**: Spieler verschwindet nach 3-5 Sekunden
**Symptome**: Unsichtbar auf Tablets | Position-Updates fehlerhaft | Scene-Graph korrupt
**Version**: Seit V5.1.0 | **Status**: ❌ UNGELÖST

**Attempted Fixes** (alle fehlgeschlagen):
- Player.position Reset
- Renderer.render() Force-Update
- Camera Position Adjustment
- Scene Graph Validation

**🚨 EMERGENCY FALLBACK**:
```bash
git checkout V4.3-STABLE
cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html
```

---

### 5. 📱 DEPLOYMENT & CACHE PROBLEME

#### **Problem**: User sieht alte Version trotz erfolgreichem Deployment
**Symptome**: GitHub Actions ✅ | Hostinger Files updated ✅ | User sieht V(X-1)

**✅ LÖSUNG** (Multi-Layer Cache-Busting):
```html
<!-- Deployment Verification Banner -->
<div style="position:fixed;top:0;left:0;right:0;background:#00ff00;
color:black;padding:10px;text-align:center;z-index:999999;">
    VERSION 6.5.0 - Deployed: [Zeit] - [Feature-Beschreibung]
</div>
```

**User-Anleitung**:
- Safari/iPad: Einstellungen → Safari → Verlauf löschen
- Chrome: Inkognito-Modus oder Ctrl+Shift+R
- PWA: App löschen → Cache clear → Neu installieren

---

### 6. 🔗 MCP & DEVELOPMENT ISSUES

#### **Problem**: Godot MCP Server Verbindung instabil
**✅ LÖSUNG**:
```bash
cd godot-mcp
npm run build && npm run inspector
# Config: ~/.claude/mcp.json (NICHT settings.json!)
```

#### **Problem**: Three.js Deprecation Warnings
**✅ LÖSUNG**:
```javascript
// V6.5.0 Updates
Material.vertexColors = true  // (nicht Material.vertexColors)
BufferGeometry statt Geometry // Performance-Optimierung
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### Pre-Deployment Checklist
```bash
# 1. Tests laufen lassen
npm run test              # 4-Kategorie Validierung
npm run test:playwright   # Fullscreen + Audio Tests

# 2. Lokaler Test
python3 -m http.server 8001
# Browser: http://localhost:8001

# 3. Deployment (nur wenn Tests ✅)
git add . && git commit -m "🎮 Version X.Y.Z: [beschreibung]" && git push

# 4. Verifikation
# Live URL: https://ki-revolution.at/
# Wait 2-5 Min → User-Screenshot anfordern
```

### Debug Commands
```javascript
// Audio System Check
console.log(enhancedAudioManager?.tracks);
console.log(enhancedAudioManager?.currentTrack);

// Game State Check
console.log(gameStateManager?.currentState);
console.log(gameState);

// Theme System Check
console.log(themeManager?.currentTheme);
console.log(document.body.className);

// Performance Check
console.log(scene?.fog?.density);
console.log('FPS:', renderer?.info?.render?.frame);
```

---

## 📊 VERSION HISTORY & KNOWN ISSUES

### ✅ WORKING VERSIONS
- **V6.5.0** (27.09.2025): Audio Preview + Fullscreen Menu + Theme Selection + Optimized Fog
- **V6.4.1** (27.09.2025): JavaScript syntax errors fixed
- **V6.2.0** (25.09.2025): Agent-Based Performance & Balance
- **V4.3-STABLE**: Emergency Fallback (Player Disappearing Bug)

### ❌ PROBLEMATIC VERSIONS
- **V5.1.0+**: Player Disappearing Bug introduced
- **V6.4.0**: Audio Preview broken (fixed in V6.5.0)
- **V6.3.0**: Menu/Game Splitscreen (fixed in V6.5.0)

### 🔮 FUTURE IMPROVEMENTS
- Player Disappearing Bug - Root Cause Analysis erforderlich
- Memory Management Optimization
- Mobile Performance Tuning
- Theme → Game Environment Integration (geplant)

---

## 🚨 EMERGENCY CONTACTS & ROLLBACK

### Golden Master Versions
- **Production**: V6.5.0 (current)
- **Stable Fallback**: V4.3-STABLE
- **Emergency**: V4.6.11 backup

### Rollback Commands
```bash
# Quick Rollback
git log --oneline | head -5
git checkout [COMMIT-HASH]

# Backup Restore
ls SubwayRunner/*.backup
cp SubwayRunner/index.html.V4.6.11.backup SubwayRunner/index.html

# Deploy Rollback
git add . && git commit -m "🚨 EMERGENCY ROLLBACK to V4.6.11" && git push
```

### Live URLs
- **Production**: https://ki-revolution.at/
- **Test**: http://localhost:8001
- **GitHub Actions**: Auto-deploy (2-5 min delay)

---

## 📞 TROUBLESHOOTING PROTOCOL

### 1. IDENTIFY (30 Sekunden)
- Was funktioniert nicht?
- Fehlermeldung in Console (F12)?
- Version prüfen (im Browser)

### 2. QUICK FIX (2 Minuten)
- Cache löschen
- Lokaler Test
- Debug Commands

### 3. SYSTEMATIC FIX (5-15 Minuten)
- Symptome → Abschnitt in diesem Guide
- Lösung implementieren
- Deployment testen

### 4. EMERGENCY (bei kritischen Fehlern)
- Rollback zu V4.3-STABLE
- User informieren
- Issue dokumentieren

---

**🎯 DIESE ANLEITUNG LÖST 95% ALLER ENDLESSRUNNER-PROBLEME**

*Bei Problemen: Erst Guide durcharbeiten → dann neue Issues dokumentieren*