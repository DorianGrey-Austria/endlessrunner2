# 🎮 Subway Runner 3D - Complete Documentation

**Ein 3D Endless Runner Game mit Three.js - 10 Levels, Collectibles, Gestensteuerung**

**🌐 Live Version:** https://ki-revolution.at/

**📅 Letzte Aktualisierung:** 21. November 2025
**🔧 Entwicklungsphase:** Hauptcomputer-Entwicklung
**📦 Aktuelle Version:** V4.8-ULTRA-STABLE

---

## 🚀 QUICK START

### Lokales Testing
```bash
cd SubwayRunner
python3 -m http.server 8001
# Browser: http://localhost:8001
```

### Tests ausführen
```bash
cd SubwayRunner
npm install
npm run test
```

### Deployment
```bash
git add .
git commit -m "🎮 Version X.Y.Z: [Feature]"
git push origin claude/add-ten-game-levels-01Rnx9eL8goPbqSZBnfiq8TR
# Automatisch deployed zu https://ki-revolution.at/
```

---

## 📚 DOKUMENTATION OVERVIEW

### 📊 [PROJECT_STATUS.md](./PROJECT_STATUS.md) - **START HIER!**
**Kompletter Projekt-Status und Architektur-Übersicht**
- Was funktioniert (Stand V4.8)
- Verfügbare Versionen im Vergleich
- Architektur & Code-Struktur
- Performance-Metriken
- Bekannte Probleme
- Empfehlungen für Hauptcomputer

### 📜 [VERSION_HISTORY.md](./VERSION_HISTORY.md)
**Vollständige Versions-Historie mit technischen Details**
- Alle Versionen von V3.1 bis V4.8
- Features & Änderungen pro Version
- Lessons Learned
- Vergleichstabelle
- Empfehlungen für Master-Version

### 🛠️ [CLAUDE.md](./CLAUDE.md)
**Entwicklungs-Guidelines und Rules**
- Critical Deployment Rules
- Workflow Standards
- Versioning Rules
- Testing Workflow

### 📝 [CLAUDE_CODE_RULES.md](./CLAUDE_CODE_RULES.md)
**Universelle Entwicklungs-Regeln**

---

## 🎯 PROJEKT-ÜBERSICHT

### Was ist Subway Runner 3D?

Ein **3D Endless Runner** im Subway-Stil mit Three.js, entwickelt über 7 Tage intensive Mobile-Entwicklung.

**Core Features:**
- 🎮 3-Lane Endless Runner (A/D für Lane-Switch, W/Space für Jump, S für Duck)
- 🍎 Collectibles (Äpfel für Speed Boost, Brokkoli für Health)
- 🎨 10 thematisch unterschiedliche Levels
- 🔄 Automatische Level-Progression (alle 500 Punkte)
- ⚡ Smooth Fade-Transitions zwischen Levels
- 🛡️ Production-ready Memory Management
- 🧪 Vollständige Test-Suite (Playwright)
- 🚀 Automatisches Deployment via GitHub Actions

---

## 📦 VERFÜGBARE VERSIONEN

### ⭐ V4.8-ULTRA-STABLE (AKTUELL - EMPFOHLEN)

**Datei:** `SubwayRunner/index.html`
**Status:** ✅ 100% Stabil, Production-Ready
**Größe:** 190.99KB (4527 Zeilen)

**Philosophie:** Stabilität über Effekte!

**Features:**
- Minimalistische Levels (nur Fog-Farbe + 2-3 statische Objekte)
- KEINE Partikel-Systeme
- KEINE Animationen
- Garantiert durchspielbar ohne Crashes
- Konstant 60 FPS

**Perfekt für:**
- Stabiles Gameplay
- Performance-Testing
- Als Basis für weitere Features

---

### 🎨 V4.7-STABLE-TRANSITIONS (BACKUP)

**Datei:** `SubwayRunner/index-backup-v4.7-before-simple.html`
**Status:** ✅ Funktioniert, aber komplexer
**Größe:** 223.39KB (5144 Zeilen)

**Philosophie:** Visueller Wow-Effekt!

**Features:**
- Alle 10 Levels mit fancy Effekten
- Partikel-Systeme (Dampf, Funken, Digital Rain, Blasen, etc.)
- Animierte Elemente (rotierende Kristalle, schwebende Gems)
- Complex nested groups
- Smooth Transitions mit Memory Management

**Perfekt für:**
- Visuell beeindruckende Demos
- Feature-Inspiration
- Effekte-Referenz

---

## 🏗️ ARCHITEKTUR

### Dateistruktur
```
endlessrunner2/
├── SubwayRunner/
│   ├── index.html                          # ⭐ MAIN FILE (V4.8)
│   ├── index-backup-v4.7-before-simple.html # Backup mit Effekten
│   ├── SIMPLE_LEVELS.txt                    # Level-Design Philosophie
│   ├── test-runner.js                       # Test Suite
│   ├── tests/                               # Playwright Tests
│   ├── package.json                         # Dependencies
│   └── ...
├── .github/
│   └── workflows/
│       └── hostinger-deploy.yml             # Auto-Deployment
├── README.md                                # Diese Datei
├── PROJECT_STATUS.md                        # ⭐ Detaillierter Status
├── VERSION_HISTORY.md                       # ⭐ Komplette Historie
├── CLAUDE.md                                # Dev Guidelines
└── ...
```

### Code-Architektur (index.html)

**Embedded JavaScript Module:**
```javascript
// 1. Three.js Setup (Scene, Camera, Renderer, Lights)
// 2. Game State Management (score, lives, speed, level)
// 3. Level Manager System
//    - registerLevel() - Levels registrieren
//    - loadLevel() - Level laden mit Fade-Transition
//    - cleanup() - Memory Management (recursive disposal)
//    - checkProgression() - Auto-Level-Wechsel
// 4. 10 Level Definitions (load, update, cleanup)
// 5. Game Loop (Player, Obstacles, Collectibles, Collision)
// 6. UI Updates (Score, Level, Lives, Indicators)
```

**Kern-Systeme:**
- **Level Manager:** Verwaltet 10 Levels, Transitions, Cleanup
- **Spawn System:** Distance-based mit Speed-Scaling
- **Collision Detection:** 3D Bounding Box mit Toleranz
- **Memory Management:** Recursive disposal, Texture cleanup, GC pauses
- **Score System:** Direct updates, UI throttling (10 FPS)

---

## 🎨 DIE 10 LEVELS

| Level | Name | Theme | Fog Color | Special Features |
|-------|------|-------|-----------|------------------|
| 1 | Classic Subway | Graue U-Bahn | `0x444444` | Industrielle Wände |
| 2 | Neon Night | Cyberpunk | `0x001133` | Dunkelblaue Neon-Atmosphäre |
| 3 | Sky High | Himmel | `0x87CEEB` | Helle Wolken-Ästhetik |
| 4 | Underwater | Ozean | `0x003366` | Tiefblaue Unterwasser-Welt |
| 5 | Volcanic | Vulkan | `0x8B0000` | Dunkelrote Lava-Höhle |
| 6 | Arctic | Eis | `0xB0E0E6` | Hellblaue Eislandschaft |
| 7 | Jungle | Dschungel | `0x3CB371` | Grüne Vegetation |
| 8 | Space | Weltraum | `0x000011` | Schwarzes Vakuum |
| 9 | Crystal | Kristall | `0x4B0082` | Indigo-Kristallhöhle |
| 10 | Dimension | Portal | `0x1a001a` | Dunkellila Dimension |

**Level-Progression:**
- Level 2: 500 Punkte
- Level 3: 1000 Punkte
- Level 4: 1500 Punkte
- ...
- Level 10: 4500 Punkte ⭐

---

## 🛠️ TECHNISCHE DETAILS

### Performance
- **FPS:** Konstant 60 FPS (V4.8)
- **Memory:** Minimaler Footprint durch aggressive Cleanup
- **Dateigröße:** 190.99KB (V4.8), 223.39KB (V4.7)

### Memory Management (Best Practices 2025)
```javascript
// Recursive disposal
- Geometries ✅
- Materials ✅
- Textures (ALL types: map, normalMap, envMap, lightMap, etc.) ✅
- Children (recursive) ✅
- Remove from parent ✅
- Memory Monitoring (renderer.info) ✅
```

### Transition System
```
0ms:    Fade to Black Start
500ms:  Fade Complete → Start Cleanup
600ms:  Cleanup Done → GC Pause (100ms)
700ms:  Load New Level
1200ms: Fade Back → Resume Game
```

### Testing
```bash
npm run test         # Alle Tests
npm run test:watch   # Watch Mode
npx playwright test  # Browser Tests
```

**Test Coverage:**
- ✅ Syntax Validation
- ✅ Structure Tests (HTML, Game State, Level Manager)
- ✅ Performance Tests (Score cap, object limits)
- ✅ Game Logic Tests (Level progression, collision)

---

## 🚀 DEPLOYMENT

### GitHub Actions Workflow
- **Trigger:** Push zu Branch `claude/add-ten-game-levels-01Rnx9eL8goPbqSZBnfiq8TR`
- **Process:**
  1. Copy `SubwayRunner/index.html` → `deploy/index.html`
  2. Create `.htaccess` (Security, HTTPS, Compression)
  3. FTP Deploy zu Hostinger
- **Live URL:** https://ki-revolution.at/
- **Deployment Time:** ~2-3 Minuten

### Secrets (bereits konfiguriert)
- ✅ `FTP_SERVER`
- ✅ `FTP_USERNAME`
- ✅ `FTP_PASSWORD`

---

## 🎯 ROADMAP FÜR HAUPTCOMPUTER

### Phase 1: Master-Version erstellen
**Ziel:** Beste Features aus V4.7 und V4.8 kombinieren

**Basis:** V4.8-ULTRA-STABLE
**Hinzufügen aus V4.7:**
- ✅ Fade-Transitions (funktioniert perfekt)
- ✅ Memory-Monitoring (hilfreich)
- ✅ Error Recovery (Sicherheitsnetz)

**Selektiv hinzufügen aus V4.7:**
- ⚠️ 2-3 einfache Effekte pro Level (KEINE komplexen Partikel-Systeme)
- ⚠️ Minimale Animationen (nur Rotation, KEINE update()-Loops)

### Phase 2: Neue Features
1. **🎵 Sound-System**
   - Hintergrundmusik pro Level
   - SFX (Jump, Collect, Hit)
   - Volume Controls

2. **🎮 Gestensteuerung finalisieren**
   - MediaPipe Integration
   - Head-Tracking
   - Kalibrierung

3. **🏆 Highscore-System**
   - LocalStorage Persistenz
   - Leaderboard UI
   - Daily Challenges

4. **⏸️ Pause-Menü**
   - Pause/Resume
   - Settings
   - Restart

5. **✨ UI Polish**
   - Main Menu
   - Tutorial
   - Better Notifications
   - Level Preview

### Phase 3: Optimization
- Bundle Size Reduction
- Asset Optimization
- Mobile Performance
- PWA Features

---

## ⚠️ BEKANNTE PROBLEME

### V4.8 (Aktuell)
- ❌ Keine visuellen Effekte (absichtlich für Stabilität)
- ❌ Levels sehen alle gleich aus (nur Fog-Farbe unterscheidet)
- ❌ Könnte langweilig wirken

### Generell
- ⚠️ Gestensteuerung noch nicht vollständig integriert
- ⚠️ Kein Sound-System
- ⚠️ Keine Pause-Funktion
- ⚠️ Keine Highscore-Persistenz

---

## 📈 VERSION COMPARISON

| Feature | V3.1 | V4.5 | V4.7 | V4.8 |
|---------|------|------|------|------|
| **Levels** | 2 | 10 | 10 | 10 |
| **Partikel** | ❌ | ✅ | ✅ | ❌ |
| **Animationen** | ❌ | ✅ | ✅ | ❌ |
| **Transitions** | Einfach | Einfach | Fade | Fade |
| **Memory Mgmt** | Basic | Basic | Advanced | Advanced |
| **Stabilität** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Visuals** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔥 LESSONS LEARNED

### Was funktioniert:
- ✅ Minimalistische Level-Designs sind stabiler
- ✅ Recursive disposal verhindert Memory-Leaks
- ✅ Fade-Transitions verbessern UX massiv
- ✅ 500-Punkte-Schwellen sind spielerfreundlich
- ✅ UI-Indikatoren erhöhen Transparenz

### Was NICHT funktioniert:
- ❌ Komplexe Partikel-Systeme in jedem Level
- ❌ Zu viele Animationen in update()
- ❌ Verschachtelte Gruppen ohne Cleanup
- ❌ Zu hohe Level-Schwellen (1000+)

---

## 👥 TEAM & KONTEXT

**Entwicklungsphase 1:** Mobil (letzte Woche)
**Entwicklungsphase 2:** Desktop/Hauptcomputer (jetzt)
**Ziel:** Master-Version mit perfekter Balance zwischen Stabilität und Visuellen Effekten

---

## 🎓 WEITERE RESSOURCEN

### Dokumentation
- **CLAUDE.md:** Entwicklungs-Rules und Workflows
- **CLAUDE_CODE_RULES.md:** Universelle Code-Standards
- **SubwayRunner/DEBUG_GUIDE.md:** Debugging Tips
- **SubwayRunner/TROUBLESHOOTING.md:** Problem-Lösungen

### Research
- Three.js Forum: Scene Cleanup Best Practices
- Stack Overflow: Disposal Patterns 2025
- Codrops: Efficient Three.js Development
- DEV Community: Game Performance Optimization

---

## 💡 EMPFEHLUNGEN

### Für Hauptcomputer-Entwicklung:
1. **Start mit V4.8** - Stabile Basis
2. **Selektiv Effekte hinzufügen** - Aus V4.7 die besten isoliert testen
3. **Testing zwischen Features** - Stabilität bewahren
4. **Sound früh integrieren** - Massiver Impact auf Spielgefühl
5. **UI Polish** - User Experience > Technische Komplexität

### Niemals wieder:
- ❌ Deployment ohne Testing
- ❌ Komplexe Features ohne Research
- ❌ Zu viele Änderungen auf einmal
- ❌ Ignorieren von Memory Management

---

## 🚀 STATUS

**✅ BEREIT FÜR HAUPTCOMPUTER-ENTWICKLUNG!**

Die Mobile-Entwicklungsphase ist abgeschlossen. Alle 10 Levels funktionieren stabil, Tests laufen durch, Deployment ist automatisiert. Die Basis für die Master-Version steht.

**Nächster Schritt:** Features selektiv aus V4.7 integrieren und Sound-System hinzufügen.

---

**🌐 Live Version:** https://ki-revolution.at/
**📧 Fragen?** Siehe PROJECT_STATUS.md und VERSION_HISTORY.md

**Version:** V4.8-ULTRA-STABLE
**Datum:** 21. November 2025
**Branch:** `claude/add-ten-game-levels-01Rnx9eL8goPbqSZBnfiq8TR`