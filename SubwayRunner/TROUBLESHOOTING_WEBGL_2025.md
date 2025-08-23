# 🔴 CRITICAL TROUBLESHOOTING - SubwayRunner WebGL Fehler
## Stand: 23.08.2025, 13:27 Uhr

---

## 🚨 AKTUELLE FEHLER (Screenshot-Analyse)

### **1. Three.js Deprecation Warning**
```
Scripts "build/three.js" and "build/three.min.js" are deprecated with r150+
```
- **Problem**: Wir verwenden eine alte URL für Three.js
- **Impact**: Module laden möglicherweise nicht korrekt

### **2. WebGL INVALID_OPERATION Errors**
```
WebGL: INVALID_OPERATION: uniform3f: location is not from the associated program
WebGL: INVALID_OPERATION: uniformMatrix4fv: location is not from the associated program
```
- **Problem**: Shader-Programme nicht korrekt kompiliert/gelinkt
- **Impact**: Rendering komplett kaputt

### **3. Console Errors Überlauf**
```
WebGL: too many errors, no more errors will be reported to the console
```
- **Problem**: So viele Fehler, dass Browser aufgibt
- **Impact**: Weitere Fehler werden versteckt

---

## 📝 BISHERIGE LÖSUNGSVERSUCHE

### **Versuch 1: TensorFlow.js → MediaPipe (22.08)**
- **Was**: Gestensteuerung von TensorFlow auf MediaPipe umgestellt
- **Ergebnis**: ❌ Hat andere Probleme verursacht

### **Versuch 2: startGame Wiederherstellung (22.08)**
- **Was**: Fehlende startGame Funktion wiederhergestellt
- **Ergebnis**: ✅ Teilweise erfolgreich, Button funktioniert

### **Versuch 3: GameCore Deaktivierung (23.08)**
- **Was**: Doppelte Initialisierung verhindert
- **Ergebnis**: ❌ WebGL Fehler bleiben bestehen

### **Versuch 4: WebGL Context Optimierung (23.08)**
- **Was**: Renderer cleanup, WebGL checks
- **Ergebnis**: ❌ Uniform-Fehler bleiben

---

## 🔍 ROOT CAUSE ANALYSE

### **HAUPTPROBLEM: Three.js lädt nicht korrekt**

1. **Veraltete CDN URL**:
   - Aktuell: `https://unpkg.com/three@0.158.0/build/three.min.js`
   - Problem: `/build/` Pfad ist deprecated seit r150

2. **Timing-Problem**:
   - Three.js nicht geladen wenn init() aufgerufen wird
   - WebGL Context wird erstellt bevor Shader ready sind

3. **Mehrfache Initialisierungen**:
   - GameCore System (Zeile 1275)
   - Haupt init() (Zeile 4649)
   - startGameInternal() versucht auch zu initialisieren

4. **Shader-Kompilierung fehlgeschlagen**:
   - Uniforms können nicht gesetzt werden
   - Programme nicht korrekt gelinkt

---

## 💀 WARUM DAS SPIEL NICHT STARTET

```
Three.js lädt nicht → 
  init() schlägt fehl → 
    Scene/Renderer nicht erstellt → 
      startGame() kann nicht starten → 
        GAME DEAD
```

---

## 🛠️ KRITISCHE CODE-STELLEN

### **1. Three.js Import (Zeile 9)**
```javascript
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
```
**PROBLEM**: `/build/` ist deprecated!

### **2. Doppelte Initialisierung (Zeile 1275 & 4649)**
```javascript
window.gameCore = { ... }  // Erste Init
function init() { ... }     // Zweite Init
```
**PROBLEM**: Konflikte!

### **3. WebGL Renderer Creation (Zeile 4684)**
```javascript
renderer = new THREE.WebGLRenderer({ ... });
```
**PROBLEM**: Schlägt fehl wegen Three.js Loading

---

## ⚠️ WEITERE KOMPLIKATIONEN

1. **MediaPipe Scripts** laden zusätzlich (4 Scripts)
2. **Supabase** lädt auch
3. **Multiple Event Listeners** registriert
4. **Verschiedene Versionen** von startGame definiert

---

## 📊 ERROR TIMELINE

1. **Page Load**: Three.js deprecation warning
2. **DOMContentLoaded**: init() aufgerufen
3. **Three.js nicht ready**: init() schlägt fehl
4. **WebGL Context erstellt**: Aber ohne Shader
5. **Render Loop startet**: Uniform errors
6. **Browser gibt auf**: "too many errors"

---

## 🔥 WARUM FRÜHERE FIXES NICHT FUNKTIONIERT HABEN

1. **V5.3.1**: elapsedTime fix → Hat mit WebGL nichts zu tun
2. **V5.3.2**: MediaPipe → Hat Three.js Problem nicht gelöst  
3. **V5.3.3**: GameCore disable → Three.js lädt trotzdem nicht

**KERN-PROBLEM WURDE NIE ADDRESSIERT**: Three.js CDN ist kaputt!

---

## 📋 OFFENE FRAGEN

1. Warum hat es vorher funktioniert?
2. Hat sich die CDN URL geändert?
3. Gibt es einen Backup der funktionierenden Version?
4. Warum so viele verschiedene Init-Systeme?

---

## 🚀 EMPFOHLENE SOFORT-MAßNAHMEN

1. **Three.js CDN URL fixen** (KRITISCH!)
2. **Alle Init-Systeme konsolidieren**
3. **Sauberer Single-Init Flow**
4. **Error Recovery implementieren**
5. **Zurück zu letzter funktionierender Version**

---

**STATUS**: 🔴 KRITISCH - Spiel komplett unspielbar
**PRIORITÄT**: HÖCHSTE
**GESCHÄTZTE FIXZEIT**: 30-60 Minuten mit richtigem Ansatz