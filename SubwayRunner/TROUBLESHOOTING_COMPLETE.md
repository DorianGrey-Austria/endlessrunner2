# 🔧 SubwayRunner - Complete Troubleshooting Guide
## Stand: 07.08.2025 - Version 3.15-AUDIO-FIX

---

## 📊 **AKTUELLE VERSION: V3.15-AUDIO-FIX**
- **Status**: ✅ PRODUCTION READY
- **Live auf**: https://ki-revolution.at/
- **Deployment**: GitHub Actions → Hostinger (automatisch)

---

## 🚀 **WICHTIGE ERKENNTNISSE AUS DIESEM CHAT-SESSION**

### **1. MULTI-JUMP LANDING PROBLEM (GELÖST)**
**Problem**: Spieler fällt nach Multi-Jump abrupt von 100 zu 0
**Lösung V3.11-V3.12**:
```javascript
// Parabolische Landung mit dynamischer Gravity
let gravityStrength = 30;
if (gameState.jumpVelocity < 0 && gameState.playerY < 2.0) {
    const landingFactor = gameState.playerY / 2.0;
    gravityStrength *= (0.5 + landingFactor * 0.5);
    if (gameState.playerY < 1.0) {
        gameState.jumpVelocity *= 0.95; // Velocity damping
    }
}
```

### **2. AUDIO MUTE BUTTON (KRITISCH - GELÖST)**
**Problem**: Button ändert Icon aber Sound spielt weiter
**Root Causes**:
1. preloadSounds() Race Condition
2. createTone/createNoise ignorieren isMuted
3. masterGain wird nicht auf 0 gesetzt

**Lösung V3.15**:
```javascript
// In ALLEN Sound-Methoden:
if (!this.audioContext || this.isMuted) return;

// Zentrale Volume-Kontrolle:
updateMasterVolume() {
    if (this.masterGain) {
        this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
}
```

### **3. SOUND SYSTEM MODERNISIERUNG**
**Implementiert**: Hybrid System für echte Sounds
- `/sounds/` Ordner für MP3 uploads
- jsDelivr CDN Integration
- Lazy Loading (3 Prioritätsstufen)
- Fallback auf Synthesizer

**Upload Workflow für User**:
1. MP3s in `/SubwayRunner/sounds/` legen
2. Korrekte Namen: jump.mp3, coin.mp3, etc.
3. Git commit & push
4. Automatisch über CDN verfügbar

### **4. MOBILE TOUCH CONTROLS (PERFEKT)**
**V3.10-MOBILE-PRO Features**:
- Swipe für Lane-Wechsel
- Swipe Up für Jump/Multi-Jump
- Swipe Down für Duck
- KEIN Auto-Aufstehen mehr
- Professionelles Mobile UI

### **5. POSE DETECTION (IMPLEMENTIERT)**
**MediaPipe Integration**:
- 200x150px Preview Window
- 33 Body Landmarks
- Colored Rectangles für Body Parts
- GPU Acceleration

---

## 🎮 **VERSION HISTORY (WICHTIGSTE)**

### **BASISVERSION 3 FINAL** (05.08.2025)
- **Status**: ✅ 60 Sekunden durchgespielt ohne Crash
- **Features**: Basic Runner, Duck Detection, Collectibles
- **Keine**: Level/Characters (zu komplex)

### **V3.9-MOBILE** (07.08.2025)
- TouchController implementiert
- Swipe-Gesten für alle Richtungen

### **V3.10-MOBILE-PRO** (07.08.2025)
- Duck Auto-Aufstehen ENTFERNT
- Multi-Jump mit Swipe Up
- Professionelles Mobile UI

### **V3.11-SMOOTH-LANDING** (07.08.2025)
- Sanfte Multi-Jump Landung
- Graduelle Gravity-Berechnung

### **V3.12-AUDIO-CONTROL** (07.08.2025)
- Audio Mute Button (links oben)
- Audio standardmäßig STUMM
- LocalStorage für Präferenz

### **V3.13-HIGHSCORE-TIMING** (07.08.2025)
- Highscore Panel nur 5 Sek am Anfang
- Highscore Panel in letzten 5 Sek

### **V3.14-SOUND-IMPROVEMENT** (07.08.2025)
- Weniger synthetische Sounds
- AudioManager für externe Sounds
- ⚠️ PROBLEM: Mute Button funktioniert nicht

### **V3.15-AUDIO-FIX** (07.08.2025)
- ✅ Audio Button funktioniert
- Sound Upload System ready
- Lazy Loading implementiert

---

## 🐛 **BEKANNTE PROBLEME & LÖSUNGEN**

### **1. hemisphereLight Doppel-Deklaration**
```javascript
// PROBLEM
const hemisphereLight = new THREE.HemisphereLight(...); // Zeile 824
const hemisphereLight = new THREE.HemisphereLight(...); // Zeile 844 FEHLER!

// LÖSUNG
const hemisphereLight = new THREE.HemisphereLight(...);
const skyHemisphereLight = new THREE.HemisphereLight(...); // Umbenannt!
```

### **2. Jump Timeout System**
```javascript
// WICHTIG: Absolute Timeout als Sicherheit
gameState.maxJumpDuration = 2000; // 2 Sekunden MAX
const shouldForceLand = jumpDuration > gameState.maxJumpDuration;
```

### **3. Score Explosion Bug (GELÖST)**
- Problem: Score springt auf 2+ Milliarden
- Ursache: Jedes Obstacle gab +10 Points beim Verlassen
- Lösung: Score Queue System entfernt

---

## 🛠️ **DEPLOYMENT & TESTING**

### **GitHub Actions Deployment**
```yaml
# .github/workflows/hostinger-deploy.yml
- Trigger: Push to main
- Target: Hostinger via FTP
- Secrets: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD
```

### **Test Commands**
```bash
# Lokaler Test
python3 -m http.server 8001

# Playwright Tests
npm run test

# Deployment
git add . && git commit -m "message" && git push
```

### **Browser Requirements**
- Chrome verwenden (NIEMALS Safari!)
- Mobile: iOS Safari OK
- WebGL Support erforderlich

---

## 💡 **WICHTIGE LEARNINGS**

### **1. RESEARCH FIRST**
```bash
# IMMER zuerst suchen was existiert
git log --oneline | grep -i "feature"
grep -r "function" . --include="*.backup"
```

### **2. MATHEMATICAL VALIDATION**
```javascript
// IMMER berechnen vor Deploy
const spawnRate = 0.02;
const fps = 60;
const itemsPerSecond = spawnRate * fps; // 1.2
const itemsIn30Sec = itemsPerSecond * 30; // 36
```

### **3. LOCAL TESTING MANDATORY**
- Minimum 30 Sekunden spielen
- Console auf Errors prüfen
- FPS Monitor (muss > 50 bleiben)

### **4. KEEP IT SIMPLE**
- Max 20 Zeilen für simple Features
- Keine Over-Engineering
- User Feedback ist LAW

---

## 📝 **CLAUDE.md RULES (NIEMALS VERGESSEN!)**

### **AUTO-DEPLOYMENT IST PFLICHT**
```bash
git add . && git commit -m "message" && git push
```
- IMMER sofort online stellen
- URL als: **🌐 https://ki-revolution.at/**
- Nach Deploy: "Version X.Y.Z jetzt live"

### **VERSIONIERUNG**
- PATCH (+0.0.1): Bug fixes
- MINOR (+0.1.0): Major features  
- MAJOR (+1.0.0): Complete rewrites

### **WORKFLOW STANDARDS**
1. Versionierung IMMER updaten
2. Dokumentation sofort
3. Testing in Chrome
4. UI/UX First
5. Kurze Antworten mit ✅

---

## 🎯 **NÄCHSTE SCHRITTE**

### **Sound System**
1. User lädt MP3s in `/sounds/` Ordner
2. Commit & Push
3. Game lädt automatisch über CDN

### **Performance**
- IndexedDB für Offline-Caching
- Service Worker für PWA
- WebAssembly für Physics?

### **Features**
- Ghost Racing vervollständigen
- Level System reaktivieren
- Character Selection

---

## 🚨 **EMERGENCY ROLLBACK**

```bash
# Backup finden
ls SubwayRunner/*.backup

# Specific Version wiederherstellen
cp SubwayRunner/index.html.V3.15.backup SubwayRunner/index.html

# Sofort deployen
git add . && git commit -m "🚨 ROLLBACK to V3.15" && git push
```

---

## 📞 **SUPPORT & KONTAKT**

- **Live Game**: https://ki-revolution.at/
- **Repository**: github.com/DorianGrey-Austria/endlessrunner2
- **Deployment**: Automatisch via GitHub Actions
- **Hosting**: Hostinger

---

**STATUS: PRODUCTION READY** ✅
**LETZTE STABILE VERSION: V3.15-AUDIO-FIX**