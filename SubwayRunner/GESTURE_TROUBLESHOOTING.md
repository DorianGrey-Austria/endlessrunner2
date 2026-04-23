# Gesture Control Troubleshooting Guide

**Updated**: April 2026 — covers GestureManager 3-mode architecture

---

## Step 1: Use the Debug Overlay (recommended)

The fastest way to diagnose gesture issues is the **real-time debug overlay**:

1. Add `?gestureDebug=1` to the URL: `http://localhost:8001?gestureDebug=1`
2. Or: Click the gear icon next to "Neu kalibrieren" > Debug tab > toggle "Show Debug Overlay"
3. The overlay shows:
   - **SKIP reason**: Why frames are being dropped (e.g. "visibility: LS=0.31 < 0.40")
   - **Raw vs Filtered values**: Whether filtering is too aggressive
   - **Thresholds**: Whether they match your actual movement range
   - **FPS**: Whether detection is running at expected ~30fps

## Step 2: Console Debug Commands

```js
// Full debug info from active mode
gestureManager.getExtendedDebugInfo()

// Current config values
gestureManager.getConfig()

// Force recalibration
gestureManager.startCalibration()

// Switch mode at runtime
gestureManager.switchMode('bodyPose')  // or 'adaptive' or 'oneEuro'

// Adjust thresholds live
gestureManager.applyConfig({ jumpThreshold: 0.08, minVisibility: 0.3 })
```

---

## Common Issues

### Head Mode: No lane changes detected

**Symptoms**: Head turns don't register as left/right lane changes.

**Debug**: Check overlay for `filteredYaw` values while turning head. Compare with `THRESH L/R`.

**Causes & Fixes**:
1. **Range too small during calibration** → Overlay shows "Bewegungsbereich zu klein!" → Recalibrate, move head further
2. **Dead zone too large** → Config Panel > Head > reduce Dead Zone from 2.0 to 1.0
3. **Sensitivity too low** → Config Panel > Head > increase Sensitivity from 0.45 to 0.6
4. **Face too far from camera** → Yaw is now distance-normalized (April 2026), but face must be > 3% of frame

### Head Mode: Jump/duck not triggering

**Symptoms**: Looking up/down doesn't trigger jump/duck.

**Debug**: Check overlay for `filteredPitch` values while nodding. Compare with `THRESH U/D`.

**Causes & Fixes**:
1. **Pitch baseline wrong** → Config Panel > Head > adjust Pitch Baseline (default 0.4). Try 0.35-0.45.
2. **Cooldown active** → Wait 350ms between actions (normal behavior)
3. **Old calibration data** → After April 2026 update, old calibration is auto-discarded. Force recalibrate.

### Body Mode: No detection at all

**Symptoms**: Nothing happens, no lane changes, no jump/duck.

**Debug**: Check overlay for `VIS` section — shows landmark visibility scores.

**Causes & Fixes**:
1. **Visibility too low** → If all VIS values < 0.4, the mode skips ALL frames. Fix:
   - Move closer to camera or improve lighting
   - Config Panel > Body > reduce Min Visibility to 0.3
   - Check `SKIP` reason in overlay
2. **Only shoulders visible** → Progressive detection activates lean-only mode. Jump/crouch requires hips visible.
3. **Not calibrated** → Check overlay for `cal: NO`. Recalibrate: stand straight for 4 seconds.
4. **Camera too close** → Body mode needs 2-4m distance. At < 1m, use head mode instead.

### Body Mode: Jump not registering

**Symptoms**: Actually jumping but game doesn't react.

**Debug**: Check overlay for `HEIGHT` value and threshold. Check `vel` for velocity.

**Causes & Fixes**:
1. **Jump threshold too high** → Config Panel > Body > reduce Jump Threshold (try 0.07)
2. **Floor tracking drifted** → Recalibrate to reset floor level
3. **Too far from camera** → At 4m+, shoulder movement is < 6% of frame. Use "Far" distance preset.
4. **Velocity threshold not met** → Config Panel > Body > reduce Velocity Jump threshold

### Body Mode: Crouch not registering

**Symptoms**: Ducking doesn't trigger.

**Debug**: Check overlay for `TORSO ratio` value. Must drop below threshold (default 0.82).

**Causes & Fixes**:
1. **Threshold too aggressive** → Config Panel > Body > increase Crouch Threshold to 0.88
2. **Only bending forward, not down** → Crouch measures shoulder-to-hip distance, not head height
3. **Normal torso height miscalibrated** → Recalibrate while standing fully upright

### Camera permission denied

1. Ensure **HTTPS** (or localhost) — camera requires secure context
2. Check browser permissions: Chrome > Settings > Privacy > Camera
3. Close other apps using the camera
4. Try incognito mode to rule out extensions

### MediaPipe loading failed

1. Check network: CDN `cdn.jsdelivr.net` must be reachable
2. Check console for WASM errors
3. Try hard-refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
4. GPU fallback: If WebGL fails, MediaPipeLoader auto-falls back to CPU delegate

---

## Distance Presets (Body Mode)

| Preset | Jump | Crouch | Lean | Visibility | Velocity |
|--------|------|--------|------|------------|----------|
| Close (< 1.5m) | 0.14 | 0.85 | 0.12 | 0.35 | 0.020 |
| Medium (2-3m) | 0.10 | 0.82 | 0.10 | 0.40 | 0.015 |
| Far (3-5m) | 0.07 | 0.78 | 0.08 | 0.45 | 0.010 |

Select via Config Panel > Body > Distance Presets.

---

## Local Testing

```bash
cd SubwayRunner
lsof -ti:8001 | xargs kill -9 2>/dev/null || true
npm run serve
# Open: http://localhost:8001?gestureDebug=1
```
