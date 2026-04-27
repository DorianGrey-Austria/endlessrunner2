# Best Practices Gestensteuerung — April 2026

Stand: 2026-04-23 | Projekt: SubwayRunner | MediaPipe Tasks Vision @0.10.34

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
// WICHTIG: Relativ zur kalibrierten Neutralposition, NICHT zu Null!
const effectiveYaw = Math.abs(yaw - neutralYaw) < this.deadZone ? neutralYaw : yaw;
```

**Wichtig:** Dead Zone relativ zu `neutralYaw` (nicht 0), VOR Threshold-Check anwenden. Bug INF-013 war genau dieses Problem.

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

| Parameter | Wert (April 2026) | Erklaerung |
|-----------|------|------------|
| jumpThreshold | **0.10 (10%)** | Frame-Hoehe ueber Floor (war 0.06 — zu nah an Noise-Floor) |
| crouchThreshold | **0.82 (82%)** | Torso schrumpft auf 82% (war 0.75 — brauchte Vollhocke) |
| leanThreshold | 0.10 (10%) | Lean-Offset fuer Lane-Wechsel |
| walkThreshold | 0.08 (8%) | Laterale Verschiebung fuer Lane-Wechsel |
| velocityJumpThreshold | 0.015 | Aufwaerts-Geschwindigkeit |
| minVisibility | **0.4** | Body Landmark Sichtbarkeit (war 0.6 — zu strikt fuer PoseLandmarker Lite) |

Alle Werte konfigurierbar ueber Config Panel oder `gestureManager.applyConfig()`.

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

### Body-Modus (Progressive Detection — April 2026)
PoseLandmarker liefert `.visibility` (0-1) pro Landmark. Threshold: 0.4 (konfigurierbar).

**Progressiver Ansatz:** Nicht alles verwerfen wenn ein Landmark fehlt.
- Schultern sichtbar (>= 0.4): Lane-Detection via Lean
- Schultern + Hueften sichtbar: Alle Gesten (Jump, Crouch, Lean)
- Nichts sichtbar: Frame verwerfen, `lastSkipReason` loggen

```js
const shouldersVisible = (ls.visibility >= 0.4) && (rs.visibility >= 0.4);
const hipsVisible = (lh.visibility >= 0.4) && (rh.visibility >= 0.4);
if (!shouldersVisible) { this.lastSkipReason = `visibility too low`; return; }
this.detectBodyLean(); // Immer wenn Schultern sichtbar
if (hipsVisible && this.isFloorCalibrated) {
    this.detectJump();
    this.detectCrouch();
}
```

---

## 12. Yaw-Normalisierung (April 2026)

Yaw muss durch Gesichtsbreite geteilt werden — sonst ist der Wert distanzabhaengig.

```js
// ALT (distanzabhaengig — nah = wild, fern = kaum Bewegung):
return (noseTip.x - faceCenter) * 100;

// NEU (distanzunabhaengig):
const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
return ((noseTip.x - faceCenter) / faceWidth) * 50;
```

Gleiche Kopfdrehung ergibt jetzt den gleichen Yaw-Wert bei 30cm und bei 1m Distanz.

**Achtung:** Schema-Migration noetig — alte Kalibrierungsdaten (schemaVersion < 2) werden automatisch verworfen.

---

## 13. Config Panel + Debug Overlay (April 2026)

### Config Panel
In-Game Settings Panel mit Slider fuer alle Parameter. Getrennt von Kalibrierung in `localStorage['subwayRunner_gestureConfig']`.

Drei Tabs: Head (Sensitivity, Dead Zone, Pitch Baseline, Hysteresis), Body (Jump/Crouch/Lean Thresholds, Visibility, Distance Presets), Debug (Overlay Toggle, Console Logging).

### Debug Overlay
Real-time Anzeige aller Werte + Skip-Gruende + Action-History. Aktivieren via `?gestureDebug=1` URL-Param.

**Wichtigste Diagnose-Info:** `lastSkipReason` — zeigt WARUM ein Frame verworfen wurde. Das fehlte zuvor komplett und machte Debugging unmoeglich.

### One Euro Filter fuer Body Mode
Body-Positionen (shoulderY, hipY, shoulderCenterX) werden jetzt durch One Euro Filter geglaettet (minCutoff=1.0, beta=0.005). Reduziert Landmark-Jitter erheblich.

---

## 14. Front-Camera Spiegelung (CRITICAL — April 2026)

Front-facing Kameras spiegeln das Bild horizontal. MediaPipe Tasks Vision Landmarks sind in **Original-Koordinaten** (NICHT gespiegelt). Das Display wird via `ctx.scale(-1, 1)` korrekt gespiegelt, aber die **Richtungsberechnung muss negiert werden**:

- `calculateYaw()`: `(faceCenter - noseTip.x)` — NICHT `(noseTip.x - faceCenter)`
- `detectBodyLean()`: `shoulderCenterX - noseX` fuer Lean, `neutralX - shoulderCenterX` fuer Walk

**Konvention:** Positive Werte = User bewegt sich nach RECHTS, Negative = nach LINKS.

**Test-Absicherung:** `gesture-unit-tests.spec.js` — 12 Unit-Tests mit synthetischen Landmarks. MUSS gruene Tests liefern bei jeder Aenderung.

## 15. TDD-Pattern fuer Gestensteuerung (April 2026)

Gestensteuerung kann NICHT nur mit E2E-Smoke-Tests abgesichert werden:

1. **Landmark-Unit-Tests:** Synthetische 478-Punkt Arrays → `calculateYaw/Pitch` → Assert Vorzeichen
2. **Detection-Pipeline-Tests:** Mock-Kalibrierung + Thresholds → `detectGestures` → Assert Lane/Action
3. **Confidence-Tests:** Unplausible Landmarks → `isFaceConfident` → Assert false

Pattern: Playwright `page.evaluate()` mit dynamischem `import()` der Gesture-Module. Kein echtes Video noetig.

---

## Offene Optimierungen (Nice-to-Have)

- **Adaptive Frame Skipping:** Frame Skip dynamisch anpassen basierend auf GPU-Last (z.B. via `performance.now()` Delta)
- **WebWorker fuer MediaPipe:** Detection in separatem Thread → kein Main-Thread-Blocking. Komplex wegen Canvas-Zugriff
- **Detection Area Config:** User soll einstellen koennen in welchem Bereich des Kamerabilds Gesten erkannt werden (ROI)
- **Fake-Webcam E2E:** Playwright `--use-fake-device-for-media-stream` + Y4M Video-Fixtures fuer volle Pipeline-Tests
