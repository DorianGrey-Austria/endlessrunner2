# 🎮 GESTENSTEUERUNG DOKUMENTATION - ENDLESS RUNNER

## 📊 STATUS: NICHT FUNKTIONSFÄHIG (Stand: 07.08.2025)

---

## 🔴 KRITISCHE PROBLEME

### **PROBLEM 1: ES6 Module Loading Fehler**
**Symptome:**
- Alert: "Gestensteuerung konnte nicht geladen werden"
- Console: `Failed to load module './js/GestureControllerProjector.js'`
- Button ist sichtbar aber funktioniert nicht

**Root Cause:**
- ES6 Module imports funktionieren nur mit korrektem MIME Type `application/javascript`
- Server (Hostinger) liefert möglicherweise falschen MIME Type
- CORS Probleme bei Module Loading
- Race Condition zwischen Module Load und DOM Ready

### **PROBLEM 2: Fehlende MediaPipe CDN Integration**
**Symptome:**
- `FaceLandmarker is not defined`
- MediaPipe Tasks Vision lädt nicht

**Root Cause:**
- CDN Script Tags fehlen im HTML
- Falsche Import Syntax für MediaPipe

---

## 🛠️ IMPLEMENTIERUNGSVERSUCHE (Chronologie)

### **Version 1: Initial Implementation (FAILED)**
```javascript
// Versuch mit type="module" Script Tag
<script type="module">
    import { GestureControllerProjector } from './js/GestureControllerProjector.js';
    window.GestureControllerProjector = GestureControllerProjector;
</script>
```
**Problem**: Module wird async geladen, Code erwartet sync

### **Version 2: Dynamic Loading (FAILED)**
```javascript
// Versuch mit dynamischem Import beim Button Click
async function loadGestureModule() {
    const module = await import('./js/GestureControllerProjector.js');
    window.GestureControllerProjector = module.default;
}
```
**Problem**: CORS/MIME Type Fehler

### **Version 3: Pre-Loading (CURRENT - FAILED)**
```javascript
// Versuch mit Pre-Loading im Header
import('./js/GestureControllerProjector.js')
    .then(module => {
        window.GestureControllerProjector = module.GestureControllerProjector;
    })
```
**Problem**: Module wird trotzdem nicht gefunden

---

## 🎯 TECHNISCHE ANFORDERUNGEN

### **MediaPipe Face Mesh Requirements**
- **468 3D Facial Landmarks** für präzises Tracking
- **30+ FPS** Performance auf Mid-Range Hardware
- **GPU Acceleration** via WebGL
- **CDN Loading** von `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0`

### **Browser Requirements**
- ES6 Module Support
- WebRTC (getUserMedia)
- WebGL Support
- HTTPS (für Kamera-Zugriff)

### **Gesture Mapping**
| Kopfbewegung | Spielaktion |
|--------------|-------------|
| Links neigen | Lane wechseln links |
| Rechts neigen | Lane wechseln rechts |
| Kopf hoch | Springen |
| Kopf runter | Ducken |

---

## 📁 DATEISTRUKTUR

```
SubwayRunner/
├── index.html                           # Hauptspiel mit Gesture Button
├── js/
│   └── GestureControllerProjector.js   # Gesture Control Module (650 Zeilen)
├── gesture-test.html                   # Standalone Test (funktioniert lokal)
├── gesture-projector-test.html         # Projektor-optimierte Version
└── GESTURE_TROUBLESHOOTING.md          # Debug-Anleitung
```

---

## 🔧 LÖSUNG: INLINE IMPLEMENTATION

### **EMPFOHLENER FIX: Kein ES6 Module, sondern Inline Script**

```javascript
// STATT ES6 Module:
<script>
(function() {
    // GestureControllerProjector Code direkt inline
    class GestureControllerProjector {
        constructor(options) {
            // ... vollständiger Code ...
        }
    }
    
    // Global verfügbar machen
    window.GestureControllerProjector = GestureControllerProjector;
})();
</script>

// MediaPipe CDN direkt laden
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js"></script>
```

### **Alternative: Webpack Bundle**
```bash
# Alle Dependencies in eine Datei bundlen
npx webpack js/GestureControllerProjector.js -o js/gesture-bundle.js
```

---

## 🧪 TEST-PROTOKOLL

### **Lokaler Test (FUNKTIONIERT)**
```bash
cd SubwayRunner
python3 -m http.server 8001
# http://localhost:8001/gesture-test.html ✅
```

### **Production Test (FAILED)**
```
https://endlessrunner.vibecoding.company/
- Button sichtbar ✅
- Module Loading ❌
- Kamera Start ❌
```

---

## 📊 PERFORMANCE TARGETS

| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Tracking FPS | 30+ | N/A |
| Latenz | <20ms | N/A |
| CPU Usage | <15% | N/A |
| Accuracy | >95% | N/A |
| Reliability | 99% | 0% |

---

## 🚫 WARUM ES NICHT FUNKTIONIERT

### **1. Module Loading Chain Broken**
```
index.html → import() → GestureControllerProjector.js → import MediaPipe ❌
```

### **2. Server Configuration**
- Hostinger liefert möglicherweise falschen MIME Type für .js files
- Keine .htaccess Regel für ES6 Modules

### **3. Missing Dependencies**
- MediaPipe CDN Script Tags fehlen
- Kalman Filter Class nicht definiert
- DrawingUtils nicht importiert

---

## ✅ WORKING SOLUTION TEMPLATE

```html
<!DOCTYPE html>
<html>
<head>
    <!-- MediaPipe CDN First -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
    
    <!-- Inline Gesture Controller -->
    <script>
        // Vollständiger Code ohne imports
        class GestureController {
            // ...
        }
        window.GestureController = GestureController;
    </script>
</head>
<body>
    <!-- Game Code -->
</body>
</html>
```

---

## 📝 LESSONS LEARNED

1. **ES6 Modules sind problematisch** für Production Deployments
2. **CDN Loading ist zuverlässiger** als lokale Module
3. **Inline Scripts funktionieren immer** (aber sind schwer zu warten)
4. **Server Configuration matters** - MIME Types müssen stimmen
5. **Fallback Systeme sind essentiell** - Keyboard muss immer funktionieren

---

## 🎯 NÄCHSTE SCHRITTE

1. **Option A**: Komplette Inline-Implementation ohne ES6 Modules
2. **Option B**: Webpack Bundle mit allen Dependencies
3. **Option C**: CDN-basierte Lösung (alle Scripts von CDN)
4. **Option D**: Aufgeben und nur Keyboard/Touch Support

---

## 📞 SUPPORT

Bei Fragen zur Gestensteuerung:
- Siehe `GESTURE_TROUBLESHOOTING.md`
- Siehe `gestureControlTips.md` für Best Practices
- Console Debug: `debugGesture()`
- Test-Seite: `/gesture-test.html`

---

**STATUS: NICHT PRODUKTIONSREIF - GRUNDLEGENDE ARCHITEKTUR-ÄNDERUNG ERFORDERLICH**