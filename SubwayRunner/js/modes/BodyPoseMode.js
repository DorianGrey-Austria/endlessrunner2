/**
 * BodyPoseMode - Full body gesture control
 *
 * Uses MediaPipe Pose Landmarker (33 landmarks) for full-body tracking.
 *
 * Jump Detection Strategy (hybrid — best practice April 2026):
 * - Track floor position by recency-weighted averaging of hip Y positions
 * - Position-based: shoulders above floor threshold → jump detected
 * - Velocity-based: rapid upward movement → faster jump reaction
 * - One Euro Filters on all position signals for noise reduction
 *
 * Crouch Detection:
 * - Measure shoulder-to-hip ratio vs calibrated normal
 * - When ratio shrinks below threshold → crouch detected
 *
 * Lean Detection:
 * - Compare nose X position to shoulder center X (lean)
 * - Compare shoulder center to calibrated neutral (walk)
 * - Use whichever detects movement first
 *
 * Progressive Detection (April 2026):
 * - Full body visible → all gestures (jump, crouch, lean, walk)
 * - Only shoulders visible → lean-only lane detection
 * - Nothing visible → skip frame, log reason
 *
 * Best for: TV/Beamer setup with 2-4m distance, real jumping.
 */

import { BaseGestureMode } from './BaseGestureMode.js';
import { OneEuroFilter } from '../utils/OneEuroFilter.js';
import { createPoseLandmarker, getDrawingUtils, getConstants } from '../utils/MediaPipeLoader.js';

// MediaPipe Pose Landmark indices
const POSE = {
    NOSE: 0,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28
};

export class BodyPoseMode extends BaseGestureMode {
    constructor(options = {}) {
        super(options);

        // PoseLandmarker instance (Tasks Vision API)
        this.poseLandmarker = null;
        this.drawingUtils = null;
        this.poseConnections = null;

        // One Euro Filters for position smoothing (April 2026 best practice)
        // Body landmarks are noisier than face → slightly more aggressive smoothing
        this.shoulderYFilter = new OneEuroFilter(1.0, 0.005, 1.0);
        this.hipYFilter = new OneEuroFilter(1.0, 0.005, 1.0);
        this.shoulderXFilter = new OneEuroFilter(1.0, 0.005, 1.0);
        this.noseXFilter = new OneEuroFilter(1.0, 0.005, 1.0);

        // Floor tracking (for jump detection)
        this.floorHistory = [];
        this.floorLevel = 0;
        this.floorSamples = 15; // 15 frames (~0.5s)
        this.lastJumpDetectedTime = 0; // for floor drift correction

        // Pose data (filtered)
        this.shoulderY = 0;
        this.hipY = 0;
        this.torsoHeight = 0;
        this.noseX = 0;
        this.shoulderCenterX = 0;

        // Raw pose data (pre-filter, for debug)
        this.rawShoulderY = 0;
        this.rawHipY = 0;
        this.rawShoulderCenterX = 0;

        // Thresholds (tuned for 2-4m distance — April 2026 values)
        this.thresholds = {
            jumpThreshold: 0.10,   // 10% of frame height above floor (was 0.06 — too tight)
            crouchThreshold: 0.82, // Torso shrinks to 82% of normal (was 0.75 — required full squat)
            leanThreshold: 0.10,   // 10% lean for lane change via leaning
            walkThreshold: 0.08    // 8% lateral shift for lane change via walking
        };

        // Visibility threshold (configurable via Config Panel)
        this.minVisibility = options.minVisibility || 0.4; // was 0.6 — too strict for PoseLandmarker Lite

        // Cooldowns
        this.lastJumpTime = 0;
        this.lastCrouchTime = 0;
        this.jumpCooldown = 400;   // 400ms — faster re-jump for gameplay
        this.crouchCooldown = 300;

        // Calibration
        this.normalTorsoHeight = 0;
        this.neutralX = 0.5;       // Center position (normalized 0-1)
        this.isFloorCalibrated = false;
        this.calibrationFrames = 0; // count valid frames during calibration
        this.calibrationMinFrames = 15; // require at least 15 valid frames

        // Velocity-based jump detection (hybrid — best practice 2026)
        this.prevShoulderY = 0;
        this.shoulderVelocity = 0;
        this.velocitySmoothing = 0.4; // EMA alpha — smooths single-frame spikes
        this.velocityJumpThreshold = 0.015; // upward velocity threshold

        // Hysteresis for lane detection
        this.lastLane = 'center';
        this.hysteresis = 0.3;

        // Body not visible tracking
        this.noBodyFrames = 0;
        this.noBodyThreshold = 30; // 30 frames = ~1 second

        // Debug / Logging (April 2026)
        this.lastSkipReason = null;
        this.landmarkVisibility = { ls: 0, rs: 0, lh: 0, rh: 0 };
        this.skippedFrames = 0;
        this.totalFrames = 0;

        // FPS
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();

        // Animation frame
        this.animationId = null;

        // Frame skipping — avoid GPU contention with Three.js (best practice 2026)
        this.frameSkip = options.frameSkip || 2;
        this.frameCounter = 0;
    }

    get name() {
        return 'Ganzkörper-Tracking';
    }

    get description() {
        return 'Echtes Springen und Ducken (ideal für TV/Beamer)';
    }

    async initialize(video, canvas) {
        await super.initialize(video, canvas);

        // Load PoseLandmarker via Tasks Vision API (shared WASM singleton)
        this.onStatusChange('loading', 'Lade Body-Tracking Modell...');
        this.poseLandmarker = await createPoseLandmarker({
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        // Load drawing utilities
        try {
            const DrawingUtils = await getDrawingUtils();
            this.drawingUtils = new DrawingUtils(this.ctx);
            const constants = await getConstants();
            this.poseConnections = constants.PoseLandmarker.POSE_CONNECTIONS;
        } catch (e) {
            // Drawing is cosmetic, not critical
        }

        this.onStatusChange('initialized', 'Body Pose bereit');
    }

    async start() {
        await super.start();

        try {
            // 640x480 is sufficient — MediaPipe internally downscales to 256x256
            // Higher resolutions waste GPU bandwidth without improving detection
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });

            this.video.srcObject = stream;
            await this.video.play();

            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;

            // Start detection
            this.detectLoop();

            this.onStatusChange('running', 'Ganzkörper-Tracking aktiv');

        } catch (err) {
            this.onError({
                type: 'CAMERA_ERROR',
                message: err.message,
                suggestedMode: 'adaptive'
            });
        }
    }

    stop() {
        super.stop();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stop();

        // Stop camera stream
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }

        // Cleanup MediaPipe
        if (this.poseLandmarker) {
            this.poseLandmarker.close();
            this.poseLandmarker = null;
        }

        super.destroy();
    }

    detectLoop() {
        if (!this.isRunning) return;

        this.frameCounter++;
        if (this.frameCounter % this.frameSkip === 0 && this.video.readyState >= 2) {
            const results = this.poseLandmarker.detectForVideo(this.video, performance.now());
            this.onResults(results);
        }

        this.animationId = requestAnimationFrame(() => this.detectLoop());
    }

    onResults(results) {
        // FPS tracking
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        // Clear and draw video
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Mirror the image
        this.ctx.translate(this.canvas.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Tasks Vision API: results.landmarks is an array of pose arrays
        if (results.landmarks && results.landmarks[0]) {
            const landmarks = results.landmarks[0];

            // Draw pose skeleton
            if (this.drawingUtils && this.poseConnections) {
                try {
                    this.drawingUtils.drawConnectors(landmarks, this.poseConnections, { color: '#ff6b35', lineWidth: 3 });
                    this.drawingUtils.drawLandmarks(landmarks, { color: '#fff', lineWidth: 1, radius: 4 });
                } catch (e) { /* drawing is cosmetic */ }
            }

            this.ctx.restore();

            // Reset no-body counter
            this.noBodyFrames = 0;

            // Process pose
            this.processPose(landmarks);
        } else {
            this.ctx.restore();

            // Track frames without body
            this.noBodyFrames++;

            if (this.noBodyFrames >= this.noBodyThreshold) {
                this.onError({
                    type: 'BODY_NOT_VISIBLE',
                    suggestedMode: 'adaptive',
                    message: 'Koerper nicht sichtbar - zum Kopf-Tracking wechseln?'
                });
            }
        }
    }

    processPose(landmarks) {
        this.totalFrames++;
        const timestamp = performance.now();

        // Get key landmarks
        const nose = landmarks[POSE.NOSE];
        const leftShoulder = landmarks[POSE.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE.RIGHT_SHOULDER];
        const leftHip = landmarks[POSE.LEFT_HIP];
        const rightHip = landmarks[POSE.RIGHT_HIP];

        // Track visibility for debug overlay
        this.landmarkVisibility = {
            ls: leftShoulder.visibility ?? 0,
            rs: rightShoulder.visibility ?? 0,
            lh: leftHip.visibility ?? 0,
            rh: rightHip.visibility ?? 0
        };

        // Progressive detection (April 2026 best practice):
        // Check shoulders and hips separately for partial detection
        const shouldersVisible = (this.landmarkVisibility.ls >= this.minVisibility) &&
                                  (this.landmarkVisibility.rs >= this.minVisibility);
        const hipsVisible = (this.landmarkVisibility.lh >= this.minVisibility) &&
                            (this.landmarkVisibility.rh >= this.minVisibility);

        if (!shouldersVisible) {
            this.lastSkipReason = `visibility: LS=${this.landmarkVisibility.ls.toFixed(2)} RS=${this.landmarkVisibility.rs.toFixed(2)} < ${this.minVisibility}`;
            this.skippedFrames++;
            return;
        }

        this.lastSkipReason = null;

        // Calculate raw positions
        this.rawShoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        this.rawShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        this.rawHipY = hipsVisible ? (leftHip.y + rightHip.y) / 2 : this.hipY;

        // Apply One Euro Filters for noise reduction
        this.shoulderCenterX = this.shoulderXFilter.filter(this.rawShoulderCenterX, timestamp);
        this.shoulderY = this.shoulderYFilter.filter(this.rawShoulderY, timestamp);
        this.noseX = this.noseXFilter.filter(nose.x, timestamp);

        if (hipsVisible) {
            this.hipY = this.hipYFilter.filter(this.rawHipY, timestamp);
            this.torsoHeight = this.hipY - this.shoulderY;
        }

        // Velocity tracking with EMA smoothing (prevents single-frame spike false jumps)
        const rawVelocity = this.prevShoulderY - this.shoulderY;
        this.shoulderVelocity = this.velocitySmoothing * rawVelocity +
            (1 - this.velocitySmoothing) * this.shoulderVelocity;
        this.prevShoulderY = this.shoulderY;

        // Calibrate on first full body detection (shoulders + hips)
        if (!this.isFloorCalibrated && hipsVisible && this.torsoHeight > 0) {
            if (this.isCalibrating) {
                this.calibrationFrames++;
            } else {
                // Auto-calibrate on first valid frame
                this.normalTorsoHeight = this.torsoHeight;
                this.neutralX = this.shoulderCenterX;
                this.isFloorCalibrated = true;
            }
        }

        // Update floor tracking (only when hips visible)
        if (hipsVisible) {
            this.updateFloorTracking(this.hipY);
        }

        // Always detect lane changes (shoulders-only is sufficient)
        this.detectBodyLean();

        // Jump and crouch require full body (hips visible + calibrated)
        if (hipsVisible && this.isFloorCalibrated) {
            this.detectJump();
            this.detectCrouch();
        }
    }

    updateFloorTracking(hipY) {
        const now = Date.now();

        // Add to history with timestamp for recency weighting
        this.floorHistory.push({ y: hipY, time: now });

        // Keep only last N samples
        if (this.floorHistory.length > this.floorSamples) {
            this.floorHistory.shift();
        }

        // Recency-weighted averaging: recent samples count more
        // Sort by Y value descending (highest Y = lowest physical position = floor)
        const sorted = [...this.floorHistory].sort((a, b) => b.y - a.y);
        const topN = Math.min(5, sorted.length);
        const topSamples = sorted.slice(0, topN);

        let weightedSum = 0;
        let weightTotal = 0;
        for (const sample of topSamples) {
            // Recency weight: exponential decay, half-life ~500ms
            const age = (now - sample.time) / 1000;
            const weight = Math.exp(-age * 1.4); // ln(2)/0.5 ≈ 1.4
            weightedSum += sample.y * weight;
            weightTotal += weight;
        }

        if (weightTotal > 0) {
            this.floorLevel = weightedSum / weightTotal;
        }

        // Slow drift correction: if no jump for 5 seconds, gradually adjust floor
        // toward current hipY (prevents permanent drift after user repositions)
        const timeSinceJump = now - this.lastJumpDetectedTime;
        if (timeSinceJump > 5000 && this.isFloorCalibrated) {
            const driftAlpha = 0.02; // very slow correction
            this.floorLevel = this.floorLevel * (1 - driftAlpha) + hipY * driftAlpha;
        }
    }

    detectBodyLean() {
        // Two lane detection methods (best of both):
        // 1. Lean: nose offset from shoulder center (works when standing still)
        // 2. Walk: shoulder center offset from calibrated neutral (works when moving)
        // IMPORTANT: Negate both — front-facing camera mirrors horizontally.
        // Camera coords are non-mirrored, so user's LEFT = camera's RIGHT = higher x.
        const lean = this.shoulderCenterX - this.noseX;
        const walk = this.neutralX - this.shoulderCenterX;

        let leanLane = 'center';
        let walkLane = 'center';

        // Lean detection
        if (lean < -this.thresholds.leanThreshold) leanLane = 'left';
        else if (lean > this.thresholds.leanThreshold) leanLane = 'right';

        // Walk detection (lateral movement in the frame)
        if (walk < -this.thresholds.walkThreshold) walkLane = 'left';
        else if (walk > this.thresholds.walkThreshold) walkLane = 'right';

        // Use whichever detects a lane change (lean OR walk)
        let newLane = leanLane !== 'center' ? leanLane : walkLane;

        // Hysteresis — once in a lane, require partial return to leave
        const combinedThreshold = Math.max(this.thresholds.leanThreshold, this.thresholds.walkThreshold);
        const hyst = combinedThreshold * this.hysteresis;

        if (this.lastLane === 'left' && newLane === 'center') {
            // Stay left until lean AND walk are both clearly past hysteresis
            // lean/walk are now corrected: negative = user left, positive = user right
            if (lean < -(this.thresholds.leanThreshold - hyst) || walk < -(this.thresholds.walkThreshold - hyst)) {
                newLane = 'left';
            }
        } else if (this.lastLane === 'right' && newLane === 'center') {
            if (lean > (this.thresholds.leanThreshold - hyst) || walk > (this.thresholds.walkThreshold - hyst)) {
                newLane = 'right';
            }
        }

        this.lastLane = newLane;
        this.emitGesture('lane', newLane);
    }

    detectJump() {
        const now = Date.now();
        if (now - this.lastJumpTime < this.jumpCooldown) return;

        // Hybrid jump detection (best practice 2026):
        // 1. Position-based: shoulders above floor threshold (reliable but slower)
        // 2. Velocity-based: rapid upward movement (faster reaction)
        const heightAboveFloor = this.floorLevel - this.shoulderY;
        const velocityJump = this.shoulderVelocity > this.velocityJumpThreshold;

        if (heightAboveFloor > this.thresholds.jumpThreshold || velocityJump) {
            this.lastJumpTime = now;
            this.lastJumpDetectedTime = now; // for floor drift correction
            this.emitGesture('action', 'jump');

            // Auto-clear after cooldown
            setTimeout(() => {
                this.emitGesture('action', 'none');
            }, this.jumpCooldown);
        }
    }

    detectCrouch() {
        const now = Date.now();
        if (now - this.lastCrouchTime < this.crouchCooldown) return;

        if (!this.isFloorCalibrated || this.normalTorsoHeight === 0) return;

        // Crouch detected when torso height shrinks significantly
        const torsoRatio = this.torsoHeight / this.normalTorsoHeight;

        if (torsoRatio < this.thresholds.crouchThreshold) {
            this.lastCrouchTime = now;
            this.emitGesture('action', 'duck');

            // Auto-clear after cooldown
            setTimeout(() => {
                this.emitGesture('action', 'none');
            }, this.crouchCooldown);
        }
    }

    startCalibration() {
        super.startCalibration();

        // Reset all state
        this.floorHistory = [];
        this.floorLevel = 0;
        this.isFloorCalibrated = false;
        this.normalTorsoHeight = 0;
        this.neutralX = 0.5;
        this.lastLane = 'center';
        this.prevShoulderY = 0;
        this.shoulderVelocity = 0;
        this.calibrationFrames = 0;
        this.lastSkipReason = null;
        this.skippedFrames = 0;

        // Reset One Euro Filters
        this.shoulderYFilter.reset();
        this.hipYFilter.reset();
        this.shoulderXFilter.reset();
        this.noseXFilter.reset();

        this.onStatusChange('calibrating', 'Steh gerade und schau in die Kamera (4 Sekunden)');

        const calibrationDuration = 4000; // 4 seconds (was 2s — too short)
        const startTime = Date.now();

        const checkCalibration = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / calibrationDuration, 1);
            this.onCalibrationProgress(progress, progress < 1 ? 'calibrating' : 'complete');

            if (elapsed < calibrationDuration) {
                requestAnimationFrame(checkCalibration);
                return;
            }

            // Calibration time is up — check quality
            this.isCalibrating = false;

            if (this.calibrationFrames >= this.calibrationMinFrames && this.torsoHeight > 0) {
                // Good calibration
                this.normalTorsoHeight = this.torsoHeight;
                this.neutralX = this.shoulderCenterX;
                this.isFloorCalibrated = true;
                this.onStatusChange('ready', `Kalibriert! (${this.calibrationFrames} Frames erfasst)`);
            } else if (this.calibrationFrames > 0) {
                // Partial calibration — use what we have but warn
                this.normalTorsoHeight = this.torsoHeight;
                this.neutralX = this.shoulderCenterX;
                this.isFloorCalibrated = true;
                this.onStatusChange('warning', `Kalibrierung instabil (nur ${this.calibrationFrames}/${this.calibrationMinFrames} Frames). Erneut versuchen empfohlen.`);
            } else {
                // No valid frames at all
                this.onStatusChange('error', 'Kein Koerper erkannt. Bitte sichtbar vor die Kamera stellen.');
            }

            this.onCalibrationProgress(1, 'done');
        };

        requestAnimationFrame(checkCalibration);
    }

    getCalibrationData() {
        return {
            floorLevel: this.floorLevel,
            normalTorsoHeight: this.normalTorsoHeight,
            neutralX: this.neutralX,
            thresholds: { ...this.thresholds },
            minVisibility: this.minVisibility
        };
    }

    setCalibrationData(data) {
        if (data.floorLevel !== undefined) {
            this.floorLevel = data.floorLevel;
        }
        if (data.normalTorsoHeight !== undefined) {
            this.normalTorsoHeight = data.normalTorsoHeight;
            this.isFloorCalibrated = true;
        }
        if (data.neutralX !== undefined) {
            this.neutralX = data.neutralX;
        }
        if (data.thresholds) {
            this.thresholds = { ...this.thresholds, ...data.thresholds };
        }
        if (data.minVisibility !== undefined) {
            this.minVisibility = data.minVisibility;
        }
        this.onStatusChange('ready', 'Kalibrierung geladen');
    }

    /**
     * Apply config from Config Panel (April 2026)
     */
    applyConfig(config) {
        if (!config) return;
        if (config.jumpThreshold !== undefined) this.thresholds.jumpThreshold = config.jumpThreshold;
        if (config.crouchThreshold !== undefined) this.thresholds.crouchThreshold = config.crouchThreshold;
        if (config.leanThreshold !== undefined) this.thresholds.leanThreshold = config.leanThreshold;
        if (config.walkThreshold !== undefined) this.thresholds.walkThreshold = config.walkThreshold;
        if (config.minVisibility !== undefined) this.minVisibility = config.minVisibility;
        if (config.velocityJumpThreshold !== undefined) this.velocityJumpThreshold = config.velocityJumpThreshold;
    }

    /**
     * Get current config for Config Panel
     */
    getConfig() {
        return {
            jumpThreshold: this.thresholds.jumpThreshold,
            crouchThreshold: this.thresholds.crouchThreshold,
            leanThreshold: this.thresholds.leanThreshold,
            walkThreshold: this.thresholds.walkThreshold,
            minVisibility: this.minVisibility,
            velocityJumpThreshold: this.velocityJumpThreshold
        };
    }

    /**
     * Get debug info for UI overlay (April 2026 — extended)
     */
    getDebugInfo() {
        return {
            mode: 'bodyPose',
            fps: this.fps,
            // Raw values (pre-filter)
            rawShoulderY: this.rawShoulderY,
            rawHipY: this.rawHipY,
            rawShoulderCenterX: this.rawShoulderCenterX,
            // Filtered values
            shoulderY: this.shoulderY,
            hipY: this.hipY,
            shoulderCenterX: this.shoulderCenterX,
            noseX: this.noseX,
            // Derived metrics
            floorLevel: this.floorLevel,
            torsoHeight: this.torsoHeight,
            torsoRatio: this.normalTorsoHeight > 0 ? this.torsoHeight / this.normalTorsoHeight : 0,
            heightAboveFloor: this.floorLevel - this.shoulderY,
            velocity: this.shoulderVelocity,
            // Thresholds (for overlay visualization)
            thresholds: { ...this.thresholds },
            // Landmark visibility
            landmarkVisibility: { ...this.landmarkVisibility },
            minVisibility: this.minVisibility,
            // Diagnostic
            lastSkipReason: this.lastSkipReason,
            skippedFrames: this.skippedFrames,
            totalFrames: this.totalFrames,
            isFloorCalibrated: this.isFloorCalibrated,
            normalTorsoHeight: this.normalTorsoHeight,
            neutralX: this.neutralX,
            // Current state
            lane: this.currentLane,
            action: this.currentAction
        };
    }
}
