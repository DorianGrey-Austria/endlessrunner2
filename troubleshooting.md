# 🔧 SubwayRunner - Troubleshooting Guide

## **Aktueller Status**: ✅ **FUNKTIONSFÄHIG** - Version 3.5.1 erfolgreich deployed

---

## ✅ **BREAKTHROUGH: Overhead Obstacle Fix behoben** - 7. Juli 2025

### **Problem**: Overhead-Hindernisse (duckbeam, highbarrier, wallgap) waren passierbar - Spieler konnten durchspringen statt ducken

#### **Root Cause Analyse**:
1. **Zu hohe Positionierung**: Hindernisse bei Y=1.8 waren zu hoch für realistisches Ducken
2. **Inkonsistente Kollisionshöhen**: Collision Detection nutzte 1.8, aber Spieler-Duckhöhe war nur 0.4
3. **Falsche Avoidance-Logic**: Kollisionsvermeidung funktionierte nicht bei schnellen Bewegungen

#### **✅ Erfolgreiche Lösung**:

**1. Obstacle-Höhen reduziert:**
```javascript
// VORHER - Zu hoch:
obstacle.position.y = 1.8; // Hoch positioniert zum Ducken

// NACHHER - Optimal:
obstacle.position.y = 1.4; // FIXED: Niedriger positioniert für echtes Ducken
```

**2. Kollisionserkennung angepasst:**
```javascript
// VORHER:
let obstacleHeight = 1.8; // Default duck obstacles height

// NACHHER:
let obstacleHeight = 1.4; // Default duck obstacles height
```

**3. Bounding Box Updates:**
```javascript
// highbarrier & duckbeam Bounding Boxes:
// VORHER: min.y = 1.8, max.y = 1.8 + height
// NACHHER: min.y = 1.4, max.y = 1.4 + height
```

#### **🎮 Zusätzliche Verbesserungen**:
- **Duck Bonus System**: +30 Punkte für erfolgreiches Ducken
- **Visual Feedback**: "DUCK MASTER! 🦆" Anzeige
- **Konsistente Collision Detection**: Alle 1.8-Werte auf 1.4 aktualisiert

#### **🔬 Technische Details**:
- **Player Duck Height**: 0.4 (reduziert von 0.6)
- **Obstacle Heights**: 1.4 (reduziert von 1.8) 
- **Clearance**: 1.0 Einheiten für sicheres Ducken
- **Collision Tolerance**: +0.2 für präzise Erkennung

**Ergebnis**: ✅ **Overhead-Hindernisse funktionieren perfekt! Ducken ist jetzt erforderlich und wird belohnt.**

---

## ✅ **Deployment-Problem behoben** - 30. Juni 2025

### **Problem**: GitHub Action deployte nicht zu korrektem Verzeichnis

#### **Lösung**:
```yaml
# Vorher: Falscher Pfad
server-dir: /domains/ki-revolution.at/public_html/

# Nachher: Korrekter Root-Pfad
server-dir: /
```

**Ergebnis**: ✅ Erfolgreiches Deployment zu Hostinger mit sofortiger Aktualisierung

---

## 🚨 **Kritischer Fehler behoben** - 27. Juni 2025

### **Problem**: Spiel konnte nicht starten - JavaScript-Fehler

#### **Fehlermeldungen**:
```
❌ Uncaught SyntaxError: Identifier 'wallMaterial' has already been declared (index):1361:27
❌ Uncaught ReferenceError: startGame is not defined (index):220
❌ GET http://localhost:8001/favicon.ico 404 (File not found)
```

#### **Root Cause Analyse**:

1. **Doppelte Variable-Deklaration** 🔴
   - **Problem**: `wallMaterial` wurde in zwei verschiedenen Obstacle-Typen deklariert
   - **Ort**: Line 1237 (wallgap) und Line 1361 (movingwall)
   - **Ursache**: Copy-Paste Fehler beim Hinzufügen neuer beweglicher Hindernisse

2. **Scope-Konflikt bei Hindernissen** 🔴
   - **Problem**: Neue Hindernisse (`rotatingblade`, `swinginghammer`, `movingwall`) wurden nicht von der generischen Obstacle-Erstellung ausgeschlossen
   - **Effekt**: Doppelte Meshes und undefinierte Variablen

3. **Fehlende Favicon** 🟡
   - **Problem**: Browser suchte nach favicon.ico
   - **Auswirkung**: 404-Fehler (nicht kritisch für Gameplay)

---

## ✅ **Lösung implementiert**:

### **1. Variable-Umbenennung**
```javascript
// VORHER (Fehler):
case 'wallgap':
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    // ... später im Code ...
case 'movingwall':
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // ❌ FEHLER!

// NACHHER (Behoben):
case 'wallgap':
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
    // ... später im Code ...
case 'movingwall':
    const movingWallMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // ✅ OK!
    const movingWall = new THREE.Mesh(movingWallGeometry, movingWallMaterial);
```

### **2. Obstacle-Ausnahme-Liste erweitert**
```javascript
// VORHER:
if (type !== 'hurdleset' && type !== 'wallgap') {

// NACHHER:
if (type !== 'hurdleset' && type !== 'wallgap' && 
    type !== 'rotatingblade' && type !== 'swinginghammer' && type !== 'movingwall' &&
    type !== 'bouncingball' && type !== 'spinninglaser') {
```

### **3. .gitignore hinzugefügt**
```gitignore
# Git Ignore
.DS_Store
node_modules/
*.log
dist/
.env
.vite/
*.tmp
Thumbs.db
```

---

## 🎮 **Neue Features in V2.0**:

### **5 Neue bewegliche Hindernisse**:
1. **🌪️ Rotating Blades** - Rotierende Klingen mit variablen Geschwindigkeiten
2. **🔨 Swinging Hammer** - Schwingende Hämmer mit Timing-Mechanik
3. **🧱 Moving Wall** - Seitlich bewegende Wände 
4. **🏀 Bouncing Ball** - Auf-und-ab hüpfende Bälle mit Schatten-Effekten
5. **⚡ Spinning Laser** - Rotierende Laser-Strahlen mit Warnlichtern

### **Enhanced Systems**:
- **Präzise 3D Bounding-Box Kollisionen**
- **Near-Miss Bonus-System**
- **Realistische Audio mit Reverb-Effekten**
- **Speed-responsive Dynamic Audio**
- **Material-spezifische Collision-Effekte**

---

## 🔍 **Debugging-Tipps für Entwickler**:

### **JavaScript-Fehler finden**:
1. **Browser DevTools öffnen** (F12)
2. **Console-Tab prüfen** auf Fehler
3. **Sources-Tab nutzen** für Breakpoints
4. **Network-Tab** für Asset-Loading Probleme

### **Häufige Fehlerquellen**:
- ❌ **Doppelte Variable-Deklarationen** (const/let/var)
- ❌ **Undefined Functions** in onclick-Handlers  
- ❌ **Scope-Probleme** bei nested Functions
- ❌ **Fehlende Semikolons** in JavaScript
- ❌ **Asset-Loading** Fehler (Three.js, Texturen)

### **Performance-Optimierung**:
- ✅ **Object Pooling** für Partikel
- ✅ **Delta Time** für framerate-unabhängige Animation
- ✅ **Culling** für weit entfernte Objekte
- ✅ **Bounded Collision Checks** statt Distance-basiert

---

## 🚀 **Deployment-Checklist**:

- [x] **JavaScript-Syntax validiert**
- [x] **Alle Asset-Pfade funktionieren**
- [x] **Browser-Kompatibilität getestet**
- [x] **Performance-optimiert**
- [x] **Git-Repository sauber**
- [x] **Dokumentation aktualisiert**

---

## 📞 **Support-Informationen**:

### **Spiel-URL**: http://localhost:8001
### **Version**: 2.0 (Enhanced Moving Obstacles)
### **Last Update**: 27. Juni 2025
### **Status**: ✅ **STABLE**

### **Bekannte Browser-Kompatibilität**:
- ✅ **Chrome 90+**
- ✅ **Firefox 85+** 
- ✅ **Safari 14+**
- ✅ **Edge 90+**

---

## 🔄 **Change Log**:

### **V2.0** (2025-06-27):
- ✅ Fixed variable naming conflicts
- ✅ Enhanced collision system  
- ✅ Added 5 new moving obstacles
- ✅ Improved audio system
- ✅ Better error handling

### **V1.0** (2025-06-26):
- ✅ Basic parallax system
- ✅ Player orientation fix
- ✅ Environment synchronization
- ✅ Initial obstacle system

---

*Dieses Dokument wird bei jedem kritischen Fix aktualisiert.*