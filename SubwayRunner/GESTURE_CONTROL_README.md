# SubwayRunner Gesture Control System

**Version**: April 2026 (3-Mode Architecture)
**Last Updated**: 2026-04-23

## Architecture

Strategy Pattern with `GestureManager` orchestrator and 3 interchangeable modes:

```
GestureManager.js (Orchestrator)
  ├── AdaptiveCalibrationMode.js  (HEAD - DEFAULT, 5s auto-learning, 45% sensitivity)
  ├── OneEuroFilterMode.js        (HEAD - Mobile, 1.5s snapshot, fast response)
  └── BodyPoseMode.js             (BODY - TV/Beamer, real jumping at 2-4m)

Supporting:
  ├── BaseGestureMode.js          (Abstract base class, yaw/pitch calculation)
  ├── utils/MediaPipeLoader.js    (WASM singleton, GPU/CPU fallback)
  ├── utils/OneEuroFilter.js      (Adaptive signal smoothing)
  ├── ui/GestureDebugOverlay.js   (Real-time debug overlay)
  └── ui/GestureConfigPanel.js    (In-game settings panel)
```

### Key Technologies
- **MediaPipe Tasks Vision** v0.10.34 (FaceLandmarker + PoseLandmarker Lite)
- **One Euro Filter** (adaptive smoothing — fast response, stable at rest)
- **GPU delegate** with CPU fallback (WebGL auto-detection)
- **Camera**: 640x480, front-facing, ~30fps detection at 60fps rendering

## Modes

### Head: AdaptiveCalibrationMode (DEFAULT)
- 5-second calibration: records min/max yaw/pitch, sets thresholds at 45% of user's range
- Yaw normalized by face width (distance-independent since April 2026)
- Auto-detects pitch baseline from face proportions
- Dead zone: 2.0 deg, hysteresis: 30%, frame skip: every 2nd frame
- One Euro Filter (minCutoff=1.5, beta=0.01)

### Head: OneEuroFilterMode (Mobile)
- 1.5-second calibration: snapshot of neutral position
- Same One Euro Filter parameters
- Fixed thresholds (yaw: +/-12, pitch: -15/+20)
- Best for quick-start mobile gaming

### Body: BodyPoseMode (TV/Beamer)
- PoseLandmarker Lite (33 body landmarks)
- Hybrid jump detection: position-based + velocity-based
- One Euro Filters on all position signals (since April 2026)
- Progressive detection: shoulders-only = lean-only, full body = all gestures
- 4-second calibration with quality validation (min 15 frames)
- Floor tracking with recency-weighted averaging + drift correction
- Visibility threshold: 0.4 (configurable)

## Config Panel

Gear icon button next to recalibrate. Three tabs:

**Head**: Sensitivity (0.2-0.8), Dead Zone (0.5-5.0 deg), Pitch Baseline (0.3-0.5), Hysteresis (0.1-0.5)

**Body**: Jump/Crouch/Lean thresholds, Min Visibility, Velocity Jump, Distance Presets (close/medium/far)

**Debug**: Toggle overlay, toggle console logging

Settings persist in `localStorage['subwayRunner_gestureConfig']` (separate from calibration data in `localStorage['subwayRunner_gestureCalibration']`).

## Debug Overlay

Activate via URL: `?gestureDebug=1` or toggle in Config Panel > Debug tab.

Shows real-time:
- Raw vs filtered values
- Thresholds and dead zones
- Frame skip reasons (why detection didn't trigger)
- Landmark visibility (body mode)
- Action history (last 5 with timestamps)
- FPS counter

Console commands:
```js
// Extended debug info
gestureManager.getExtendedDebugInfo()

// Current config
gestureManager.getConfig()

// Apply config at runtime
gestureManager.applyConfig({ sensitivity: 0.5, deadZone: 3.0 })
```

## Usage

```js
// New GestureManager API (current)
import { GestureManager } from './js/GestureManager.js';

const manager = new GestureManager({
    defaultMode: 'adaptive',
    video: document.getElementById('gestureVideo'),
    canvas: document.getElementById('gestureCanvas'),
    onGestureDetected: (gesture) => {
        // gesture.type: 'lane' | 'action'
        // gesture.lane: 'left' | 'center' | 'right'
        // gesture.action: 'jump' | 'duck' | 'none'
    },
    onStatusChange: (status, message) => console.log(status, message),
    onCalibrationProgress: (progress, step) => { /* update UI */ }
});

await manager.start();
manager.switchMode('bodyPose');
manager.startCalibration();
```

## Best Practices for Detection

1. **Lighting**: Face the light source, avoid backlighting
2. **Camera**: At eye level, 40-80cm for head, 2-4m for body
3. **Background**: Plain background improves landmark detection
4. **Browser**: Chrome/Edge recommended (best WebGL performance)
5. **Calibrate**: Always recalibrate when changing position or distance

## Threshold Defaults (April 2026)

| Parameter | Head (Adaptive) | Head (OneEuro) | Body |
|-----------|----------------|----------------|------|
| Yaw L/R | 45% of range | +/-12 | -- |
| Pitch U/D | 45% of range | -15/+20 | -- |
| Jump | -- | -- | 0.10 (10% frame height) |
| Crouch | -- | -- | 0.82 (torso ratio) |
| Lean | -- | -- | 0.10 (10% offset) |
| Dead Zone | 2.0 deg | 2.0 deg | -- |
| Cooldown | 350ms | 300ms | 400ms jump, 300ms crouch |
| Visibility | face geometry | face geometry | 0.4 per landmark |
| Frame Skip | 2 (every other) | 2 | 2 |

## File Structure

```
js/
  GestureManager.js           # Orchestrator (Strategy Pattern + localStorage)
  GestureController.js        # Legacy fallback (not used by default)
  GestureControllerProjector.js  # Legacy projector (not used by default)
  modes/
    BaseGestureMode.js        # Abstract base (lifecycle, yaw/pitch, confidence)
    AdaptiveCalibrationMode.js  # Default head mode
    OneEuroFilterMode.js      # Mobile head mode
    BodyPoseMode.js           # Full body mode
  utils/
    MediaPipeLoader.js        # WASM singleton (FaceLandmarker + PoseLandmarker)
    OneEuroFilter.js          # Adaptive signal filter
  ui/
    GestureDebugOverlay.js    # Real-time debug overlay
    GestureConfigPanel.js     # Settings panel with sliders
    LevelSelector.js          # Level selection UI
css/
  gesture-overlay.css         # Canvas overlay styles
  gesture-config.css          # Config panel + debug overlay styles
```
