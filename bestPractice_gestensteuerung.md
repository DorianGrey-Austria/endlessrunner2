# Best Practices Gestensteuerung — April 2026

Stand: 2026-04-21 | Projekt: SubwayRunner | MediaPipe Tasks Vision @0.10.34

---

## 1. MediaPipe Setup

### WASM Singleton
Ein einziger `FilesetResolver.forVisionTasks()` Aufruf fuer alle Modi. Unser `MediaPipeLoader.js` cached die WASM-Instanz — nie doppelt laden.

### GPU Delegate + CPU Fallback
```js
delegate: navigator.gpu ? 'GPU' : 'CPU'
```
GPU-Beschleunigung wenn verfuegbar, automatischer Fallback auf CPU. Bereits implementiert in `MediaPipeLoader.js`.

### Camera-Aufloesung
- **Face-Modi** (Handy): 640x480 — Face Mesh skaliert intern auf 192x192
- **Body-Modus** (TV/Beamer): 640x480 — Pose Landmarker skaliert intern auf 256x256
- Hoehere Aufloesungen verschwenden GPU-Bandbreite ohne Detektionsverbesserung

### Task Runner Cleanup
Immer `.close()` auf FaceLandmarker/PoseLandmarker aufrufen in `destroy()`. Verhindert WASM-Memory-Leaks.

---

## 2. Signal-Glaettung

### One Euro Filter (empfohlen fuer Face-Modi)
Adaptiver Filter — glaettet bei Stillstand, reagiert schnell bei Bewegung.

**Tuned Params:**
```js
minCutoff = 1.5   // weniger Smoothing bei Stillstand → weniger Lag
beta = 0.01        // Speed-Coefficient → schnelle Antwort
dCutoff = 1.0      // Derivative Cutoff
```

Referenzwerte aus der Literatur: `minCutoff=1.0, beta=0.007`. Unsere Werte sind etwas aggressiver fuer Gaming-Reaktionszeit.

### Kalman Filter (Alternative fuer Projector-Modus)
`GestureControllerProjector.js` nutzt AdvancedKalmanFilter mit `processNoise=0.008, measurementNoise=0.8`. Gut fuer statischere Setups.

---

## 3. Dead Zone

Mikro-Bewegungen nahe der Neutralposition ignorieren. Verhindert False Positives durch natuerliches Kopfwackeln.

```js
this.deadZone = 2.0; // Grad — Bewegungen kleiner als das werden ignoriert
const effectiveYaw = Math.abs(yaw) < this.deadZone ? 0 : yaw;
```

**Wichtig:** Dead Zone VOR Threshold-Check anwenden, nicht danach.

---

## 4. Hysteresis

Einmal in einer Lane angekommen, braucht es 30% Rueckbewegung Richtung Center um die Lane zu verlassen. Verhindert Flickern an Threshold-Grenzen.

```js
this.hysteresis = 0.3; // 30% der Threshold-Range
```

### Face-Modi (Yaw-basiert)
```js
if (lastLane === 'left') {
    newLane = yaw < (thresholds.yawLeft + hyst) ? 'left' : 'center';
}
```

### Body-Modus (Lean + Walk)
Dual-Detection: Lean (Nase vs. Schulter-Center) ODER Walk (Schulter-Center vs. kalibrierte Neutralposition). Hysteresis auf den kombinierten Threshold.

---

## 5. Action-Cooldowns

Verhindert Jump/Duck-Spam durch wiederholtes Triggern.

| Modus | Jump | Duck | Lane |
|-------|------|------|------|
| AdaptiveCalibration | 350ms | 350ms | kein Cooldown (Hysteresis genuegt) |
| OneEuroFilter | 300ms | 300ms | kein Cooldown |
| BodyPose | 400ms | 300ms | kein Cooldown |

**Auto-Clear:** Nach Cooldown-Ende wird `action: 'none'` emittiert → Game-Loop bekommt sauberen Reset.

---

## 6. Frame Skipping (GPU-Konkurrenz)

Three.js und MediaPipe teilen sich den WebGL-Kontext. Ohne Frame Skipping blockieren sie sich gegenseitig.

```js
this.frameSkip = 2; // Jedes 2. Frame → ~30fps Detection bei 60fps Rendering
this.frameCounter = 0;

detectLoop() {
    this.frameCounter++;
    if (this.frameCounter % this.frameSkip === 0 && video.readyState >= 2) {
        // MediaPipe Detection nur wenn Three.js nicht gerade rendert
        const results = landmarker.detectForVideo(video, performance.now());
    }
    requestAnimationFrame(() => this.detectLoop());
}
```

30fps Gesture-Detection reicht fuer Gaming — menschliche Reaktionszeit liegt bei ~200ms.

---

## 7. Kalibrierung

### Face-Modi
- **AdaptiveCalibrationMode:** 5s Kalibrierungsphase, User bewegt Kopf in alle Richtungen → Thresholds bei 45% der gemessenen Range
- **OneEuroFilterMode:** 1.5s Neutral-Snapshot → Offset-Korrektur

### Body-Modus
- Floor-Level wird ueber 15 Frames (~0.5s) gemittelt, Top-5 Average
- neutralX (Koerper-Mitte) wird beim ersten Frame kalibriert
- normalTorsoHeight (Stehhaltung) fuer Crouch-Erkennung

### Persistenz
Kalibrierungsdaten werden via `getCalibrationData()` / `setCalibrationData()` gespeichert. GestureManager speichert in localStorage.

---

## 8. Jump-Detection (Body-Modus)

### Hybrid-Ansatz (April 2026)
Zwei komplementaere Methoden:

1. **Position-basiert:** Schultern X% ueber Floor-Level → zuverlaessig aber langsam (erst wenn auf Hoehe)
2. **Velocity-basiert:** Schnelle Aufwaertsbewegung erkannt → reagiert FRUEHER (waehrend des Springens, nicht erst oben)

```js
const heightAboveFloor = this.floorLevel - this.shoulderY;
const velocityJump = this.shoulderVelocity > 0.015;

if (heightAboveFloor > jumpThreshold || velocityJump) {
    // Jump erkannt
}
```

**Vorteil:** ~100ms schnellere Reaktion als rein positionsbasiert.

---

## 9. Tuned Thresholds (2-4m Distanz)

| Parameter | Wert | Erklaerung |
|-----------|------|------------|
| jumpThreshold | 0.06 (6%) | Frame-Hoehe ueber Floor |
| crouchThreshold | 0.75 (75%) | Torso schrumpft auf 75% |
| leanThreshold | 0.10 (10%) | Lean-Offset fuer Lane-Wechsel |
| walkThreshold | 0.08 (8%) | Laterale Verschiebung fuer Lane-Wechsel |
| velocityJumpThreshold | 0.015 | Aufwaerts-Geschwindigkeit |

---

## 10. Architektur-Entscheidungen

### Strategy Pattern
`GestureManager.js` implementiert Runtime-Mode-Switching. Alle Modi erben von `BaseGestureMode.js` und werden austauschbar.

### Lifecycle
```
initialize(video, canvas) → start() → detectLoop() → stop() → destroy()
```

### emitGesture (Deduplizierung)
`BaseGestureMode.emitGesture()` feuert nur bei STATE CHANGE — identische Events werden nicht wiederholt. Reduziert Game-Loop-Last.

---

## 11. Confidence Filtering

Frames mit unzuverlaessigen Landmarks verwerfen statt rauschen.

### Face-Modi (geometrische Plausibilitaet)
FaceLandmarker liefert keine zuverlaessige per-Landmark Visibility. Stattdessen: geometrische Checks.

```js
isFaceConfident(landmarks) {
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    if (faceWidth < 0.03) return false;        // Gesicht zu klein
    const faceHeight = chin.y - forehead.y;
    if (faceHeight < 0.03) return false;        // Gesicht zu flach
    // Nase muss innerhalb des Gesichts liegen
    if (noseTip.x outside cheek bounds) return false;
    return true;
}
```

Implementiert in `BaseGestureMode.isFaceConfident()` — beide Face-Modi rufen das vor Yaw/Pitch-Berechnung auf.

### Body-Modus (Landmark Visibility)
PoseLandmarker liefert `.visibility` (0-1) pro Landmark. Key-Landmarks (Schultern + Hueften) muessen >= 0.6 sein.

```js
const minVisibility = 0.6;
const allVisible = [leftShoulder, rightShoulder, leftHip, rightHip]
    .every(lm => (lm.visibility ?? 1) >= minVisibility);
if (!allVisible) return; // Frame verwerfen
```

---

## Offene Optimierungen (Nice-to-Have)

- **Adaptive Frame Skipping:** Frame Skip dynamisch anpassen basierend auf GPU-Last (z.B. via `performance.now()` Delta)
- **WebWorker fuer MediaPipe:** Detection in separatem Thread → kein Main-Thread-Blocking. Komplex wegen Canvas-Zugriff
