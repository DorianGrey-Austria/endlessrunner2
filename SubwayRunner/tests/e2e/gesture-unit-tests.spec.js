/**
 * Gesture Control Unit Tests — TDD for direction mapping, detection, and confidence
 *
 * These tests import gesture modules directly in the browser via page.evaluate()
 * and feed synthetic landmark data to verify correct behavior WITHOUT a real camera.
 *
 * Key principle: mock at the landmark boundary, not at the camera level.
 */
import { test, expect } from '@playwright/test';

// Helper: create synthetic face landmarks (478 points)
// Key indices: 1=noseTip, 10=forehead, 152=chin, 234=leftCheek, 454=rightCheek
function createSyntheticLandmarks(overrides = {}) {
    const defaults = {
        noseTip: { x: 0.50, y: 0.45, z: -0.03 },      // index 1
        forehead: { x: 0.50, y: 0.30, z: 0.00 },       // index 10
        chin: { x: 0.50, y: 0.70, z: 0.00 },           // index 152
        leftCheek: { x: 0.35, y: 0.50, z: 0.02 },      // index 234
        rightCheek: { x: 0.65, y: 0.50, z: 0.02 },     // index 454
    };

    const lm = { ...defaults, ...overrides };

    // Create 478 default points at face center
    const landmarks = [];
    for (let i = 0; i < 478; i++) {
        landmarks.push({ x: 0.50, y: 0.50, z: 0.00 });
    }

    // Set key landmarks
    landmarks[1] = lm.noseTip;
    landmarks[10] = lm.forehead;
    landmarks[152] = lm.chin;
    landmarks[234] = lm.leftCheek;
    landmarks[454] = lm.rightCheek;

    return landmarks;
}

test.describe('Gesture Direction Mapping (calculateYaw)', () => {

    test('centered face should produce near-zero yaw', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        const yaw = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const landmarks = JSON.parse(landmarksJSON);
            return mode.calculateYaw(landmarks);
        }, JSON.stringify(createSyntheticLandmarks()));

        // Centered nose → yaw should be near 0
        expect(Math.abs(yaw)).toBeLessThan(2);
    });

    test('user turns head RIGHT → yaw should be POSITIVE', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // When user turns head RIGHT, in front-facing camera the nose moves LEFT (lower x)
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.42, y: 0.45, z: -0.03 }  // nose displaced LEFT in camera = user turned RIGHT
        });

        const yaw = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.calculateYaw(lm);
        }, JSON.stringify(landmarks));

        // User turned RIGHT → yaw MUST be positive
        // BUG: currently returns negative (inverted)
        expect(yaw).toBeGreaterThan(5);
    });

    test('user turns head LEFT → yaw should be NEGATIVE', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // When user turns head LEFT, in front-facing camera the nose moves RIGHT (higher x)
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.58, y: 0.45, z: -0.03 }  // nose displaced RIGHT in camera = user turned LEFT
        });

        const yaw = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.calculateYaw(lm);
        }, JSON.stringify(landmarks));

        // User turned LEFT → yaw MUST be negative
        // BUG: currently returns positive (inverted)
        expect(yaw).toBeLessThan(-5);
    });
});

test.describe('Gesture Direction Mapping (calculatePitch)', () => {

    test('head tilted DOWN → pitch should be POSITIVE (duck)', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // Nose moves DOWN = higher y relative to face → user looks down
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.50, y: 0.55, z: -0.03 }  // nose lower than normal
        });

        const pitch = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.calculatePitch(lm);
        }, JSON.stringify(landmarks));

        // Head down → positive pitch → should map to duck
        expect(pitch).toBeGreaterThan(5);
    });

    test('head tilted UP → pitch should be NEGATIVE (jump)', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // Nose moves UP = lower y relative to face → user looks up
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.50, y: 0.38, z: -0.03 }  // nose higher than normal
        });

        const pitch = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.calculatePitch(lm);
        }, JSON.stringify(landmarks));

        // Head up → negative pitch → should map to jump
        expect(pitch).toBeLessThan(-5);
    });
});

test.describe('Face Confidence Validation (isFaceConfident)', () => {

    test('normal face should be confident', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        const confident = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.isFaceConfident(lm);
        }, JSON.stringify(createSyntheticLandmarks()));

        expect(confident).toBe(true);
    });

    test('too-small face should NOT be confident', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // Face with very narrow width (cheeks too close)
        const landmarks = createSyntheticLandmarks({
            leftCheek: { x: 0.49, y: 0.50, z: 0.02 },
            rightCheek: { x: 0.51, y: 0.50, z: 0.02 }
        });

        const confident = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.isFaceConfident(lm);
        }, JSON.stringify(landmarks));

        expect(confident).toBe(false);
    });

    test('nose outside face bounds should NOT be confident', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.10, y: 0.45, z: -0.03 }  // nose far outside face
        });

        const confident = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const mode = new BaseGestureMode();
            const lm = JSON.parse(landmarksJSON);
            return mode.isFaceConfident(lm);
        }, JSON.stringify(landmarks));

        expect(confident).toBe(false);
    });
});

test.describe('Gesture Detection Logic (AdaptiveCalibrationMode)', () => {

    test('right yaw beyond threshold → should emit RIGHT lane', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        const result = await page.evaluate(async () => {
            // Import modules
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');
            const { OneEuroFilter } = await import('./js/utils/OneEuroFilter.js');

            // Create a minimal testable mode (bypasses MediaPipe loading)
            class TestMode extends BaseGestureMode {
                get name() { return 'test'; }
                get description() { return 'test'; }
            }

            const emitted = [];
            const mode = new TestMode({
                onGestureDetected: (g) => emitted.push(g)
            });

            // Simulate calibrated state
            mode.currentLane = 'center';
            mode.currentAction = 'none';

            // Set calibration thresholds (like after a real calibration)
            const thresholds = {
                yawLeft: -10,
                yawRight: 10,
                pitchUp: -15,
                pitchDown: 20
            };

            const calibration = {
                neutralYaw: 0,
                neutralPitch: 0,
                minYaw: -20,
                maxYaw: 20,
                minPitch: -20,
                maxPitch: 20,
                samples: [{ yaw: 0, pitch: 0 }]
            };

            // Manually construct detectGestures context
            // We need to call detectGestures with positive yaw (= head turned right AFTER fix)
            const deadZone = 2.0;
            const hysteresis = 0.3;
            const lastLane = 'center';
            const yaw = 15;  // positive = right (after yaw fix)
            const pitch = 0;
            const neutralYaw = calibration.neutralYaw || 0;
            const neutralPitch = calibration.neutralPitch || 0;

            const effectiveYaw = Math.abs(yaw - neutralYaw) < deadZone ? neutralYaw : yaw;
            const effectivePitch = Math.abs(pitch - neutralPitch) < deadZone ? neutralPitch : pitch;

            // Lane detection (same logic as AdaptiveCalibrationMode.detectGestures)
            let newLane = 'center';
            const yawRange = thresholds.yawRight - thresholds.yawLeft;
            const hyst = yawRange * hysteresis;

            if (lastLane === 'left') {
                newLane = effectiveYaw < (thresholds.yawLeft + hyst) ? 'left' : 'center';
            } else if (lastLane === 'right') {
                newLane = effectiveYaw > (thresholds.yawRight - hyst) ? 'right' : 'center';
            } else {
                if (effectiveYaw < thresholds.yawLeft) newLane = 'left';
                else if (effectiveYaw > thresholds.yawRight) newLane = 'right';
            }

            // Emit gesture
            mode.emitGesture('lane', newLane);

            return { newLane, emitted, effectiveYaw };
        });

        // Positive yaw (15) should map to RIGHT lane
        expect(result.newLane).toBe('right');
        expect(result.emitted.length).toBeGreaterThan(0);
        expect(result.emitted[0].lane).toBe('right');
    });

    test('full pipeline: user turns RIGHT → calculateYaw → detectGestures → RIGHT lane', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // This is THE critical end-to-end direction test
        // User turns head RIGHT = nose moves LEFT in camera frame (front-facing camera mirror)
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.38, y: 0.45, z: -0.03 }  // nose far LEFT in camera = user turned RIGHT
        });

        const result = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');

            class TestMode extends BaseGestureMode {
                get name() { return 'test'; }
                get description() { return 'test'; }
            }

            const emitted = [];
            const mode = new TestMode({
                onGestureDetected: (g) => emitted.push(g)
            });

            const lm = JSON.parse(landmarksJSON);

            // Step 1: Calculate yaw from landmarks
            const yaw = mode.calculateYaw(lm);

            // Step 2: Apply thresholds (simulating calibrated state)
            const thresholds = { yawLeft: -10, yawRight: 10 };
            const deadZone = 2.0;
            const neutralYaw = 0;

            const effectiveYaw = Math.abs(yaw - neutralYaw) < deadZone ? neutralYaw : yaw;

            let newLane = 'center';
            if (effectiveYaw < thresholds.yawLeft) newLane = 'left';
            else if (effectiveYaw > thresholds.yawRight) newLane = 'right';

            mode.emitGesture('lane', newLane);

            return { yaw, effectiveYaw, newLane, emitted };
        }, JSON.stringify(landmarks));

        // THE CRITICAL ASSERTION:
        // User turned RIGHT → game must go RIGHT
        // BUG: currently yaw is negative (-20) → maps to LEFT → WRONG
        expect(result.yaw).toBeGreaterThan(5);
        expect(result.newLane).toBe('right');
    });

    test('full pipeline: user turns LEFT → calculateYaw → detectGestures → LEFT lane', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        // User turns head LEFT = nose moves RIGHT in camera frame
        const landmarks = createSyntheticLandmarks({
            noseTip: { x: 0.62, y: 0.45, z: -0.03 }  // nose far RIGHT in camera = user turned LEFT
        });

        const result = await page.evaluate(async (landmarksJSON) => {
            const { BaseGestureMode } = await import('./js/modes/BaseGestureMode.js');

            class TestMode extends BaseGestureMode {
                get name() { return 'test'; }
                get description() { return 'test'; }
            }

            const emitted = [];
            const mode = new TestMode({
                onGestureDetected: (g) => emitted.push(g)
            });

            const lm = JSON.parse(landmarksJSON);
            const yaw = mode.calculateYaw(lm);

            const thresholds = { yawLeft: -10, yawRight: 10 };
            const deadZone = 2.0;
            const neutralYaw = 0;

            const effectiveYaw = Math.abs(yaw - neutralYaw) < deadZone ? neutralYaw : yaw;

            let newLane = 'center';
            if (effectiveYaw < thresholds.yawLeft) newLane = 'left';
            else if (effectiveYaw > thresholds.yawRight) newLane = 'right';

            mode.emitGesture('lane', newLane);

            return { yaw, effectiveYaw, newLane, emitted };
        }, JSON.stringify(landmarks));

        // User turned LEFT → game must go LEFT
        expect(result.yaw).toBeLessThan(-5);
        expect(result.newLane).toBe('left');
    });
});

test.describe('One Euro Filter Responsiveness', () => {

    test('filter should respond to fast movement within 3 frames', async ({ page }) => {
        await page.goto('http://localhost:8001/');
        await page.waitForTimeout(2000);

        const result = await page.evaluate(async () => {
            const { OneEuroFilter } = await import('./js/utils/OneEuroFilter.js');

            // Current params: minCutoff=1.5, beta=0.01
            const filter = new OneEuroFilter(1.5, 0.01, 1.0);

            // Simulate: 5 frames at 0, then sudden jump to 20
            const values = [];
            let t = 0;
            for (let i = 0; i < 5; i++) {
                values.push(filter.filter(0, t));
                t += 33; // ~30fps
            }
            // Sudden movement to 20
            for (let i = 0; i < 5; i++) {
                values.push(filter.filter(20, t));
                t += 33;
            }

            // After 3 frames of "20" input, filter should be at least 50% there (>10)
            const thirdFrameAfterJump = values[7]; // frame 5=first 20, frame 7=third 20

            return { values, thirdFrameAfterJump };
        });

        // Filter should reach >50% of target within 3 frames of fast movement
        // With beta=0.01 this will likely FAIL (filter too sluggish)
        expect(result.thirdFrameAfterJump).toBeGreaterThan(10);
    });
});
