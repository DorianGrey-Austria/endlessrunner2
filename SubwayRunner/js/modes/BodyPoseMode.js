/**
 * BodyPoseMode - Full body gesture control
 *
 * Uses MediaPipe Pose Landmarker (33 landmarks) for full-body tracking.
 *
 * Jump Detection Strategy (from GitHub issue #3909):
 * - Track floor position by averaging hip Y positions over time
 * - When shoulders suddenly rise above floor threshold → jump detected
 *
 * Crouch Detection:
 * - Measure shoulder-to-hip ratio
 * - When ratio shrinks significantly → crouch detected
 *
 * Lean Detection:
 * - Compare nose X position to shoulder center X
 * - Offset beyond threshold → lean left/right
 *
 * Best for: TV/Beamer setup with 2-4m distance, real jumping.
 */

import { BaseGestureMode } from './BaseGestureMode.js';
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

        // Floor tracking (for jump detection)
        this.floorHistory = [];
        this.floorLevel = 0;
        this.floorSamples = 15; // 15 frames (~0.5s) — faster reaction than 30

        // Pose data
        this.shoulderY = 0;
        this.hipY = 0;
        this.torsoHeight = 0;
        this.noseX = 0;
        this.shoulderCenterX = 0;

        // Thresholds (tuned for 2-4m distance from screen)
        this.thresholds = {
            jumpThreshold: 0.06,   // 6% of frame height above floor (more sensitive)
            crouchThreshold: 0.75, // Torso shrinks to 75% of normal (easier to trigger)
            leanThreshold: 0.10,   // 10% lean for lane change via leaning
            walkThreshold: 0.08    // 8% lateral shift for lane change via walking
        };

        // Cooldowns
        this.lastJumpTime = 0;
        this.lastCrouchTime = 0;
        this.jumpCooldown = 400;   // 400ms — faster re-jump for gameplay
        this.crouchCooldown = 300;

        // Calibration
        this.normalTorsoHeight = 0;
        this.neutralX = 0.5;       // Center position (normalized 0-1)
        this.isFloorCalibrated = false;

        // Velocity-based jump detection (hybrid — best practice 2026)
        // Detects upward MOVEMENT, not just absolute position → faster reaction
        this.prevShoulderY = 0;
        this.shoulderVelocity = 0;
        this.velocityJumpThreshold = 0.015; // upward velocity threshold (negative Y = upward)

        // Hysteresis for lane detection
        this.lastLane = 'center';
        this.hysteresis = 0.3;

        // Body not visible tracking
        this.noBodyFrames = 0;
        this.noBodyThreshold = 30; // 30 frames = ~1 second

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
        // Get key landmarks
        const nose = landmarks[POSE.NOSE];
        const leftShoulder = landmarks[POSE.LEFT_SHOULDER];
        const rightShoulder = landmarks[POSE.RIGHT_SHOULDER];
        const leftHip = landmarks[POSE.LEFT_HIP];
        const rightHip = landmarks[POSE.RIGHT_HIP];

        // Confidence check — skip frame if key landmarks have low visibility
        // PoseLandmarker provides .visibility (0-1) per landmark
        const minVisibility = 0.6;
        const keyLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip];
        const allVisible = keyLandmarks.every(lm => (lm.visibility ?? 1) >= minVisibility);
        if (!allVisible) return;

        // Calculate positions
        this.shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        this.shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        this.hipY = (leftHip.y + rightHip.y) / 2;
        this.noseX = nose.x;

        // Torso height (distance from shoulders to hips)
        this.torsoHeight = this.hipY - this.shoulderY;

        // Velocity tracking (negative = upward movement = jumping)
        this.shoulderVelocity = this.prevShoulderY - this.shoulderY;
        this.prevShoulderY = this.shoulderY;

        // Calibrate normal torso height and center position on first detection
        if (!this.isFloorCalibrated && this.torsoHeight > 0) {
            this.normalTorsoHeight = this.torsoHeight;
            this.neutralX = this.shoulderCenterX;
            this.isFloorCalibrated = true;
        }

        // Update floor tracking (use hip Y as floor reference)
        this.updateFloorTracking(this.hipY);

        // Detect gestures
        this.detectBodyLean();
        this.detectJump();
        this.detectCrouch();
    }

    updateFloorTracking(hipY) {
        // Add to history
        this.floorHistory.push(hipY);

        // Keep only last N samples
        if (this.floorHistory.length > this.floorSamples) {
            this.floorHistory.shift();
        }

        // Calculate floor level (average of LOWEST positions = highest Y values)
        const sorted = [...this.floorHistory].sort((a, b) => b - a);
        const topN = Math.min(5, sorted.length);
        this.floorLevel = sorted.slice(0, topN).reduce((a, b) => a + b, 0) / topN;
    }

    detectBodyLean() {
        // Two lane detection methods (best of both):
        // 1. Lean: nose offset from shoulder center (works when standing still)
        // 2. Walk: shoulder center offset from calibrated neutral (works when moving)
        const lean = this.noseX - this.shoulderCenterX;
        const walk = this.shoulderCenterX - this.neutralX;

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

        this.floorHistory = [];
        this.floorLevel = 0;
        this.isFloorCalibrated = false;
        this.normalTorsoHeight = 0;
        this.neutralX = 0.5;
        this.lastLane = 'center';
        this.prevShoulderY = 0;
        this.shoulderVelocity = 0;

        this.onStatusChange('calibrating', 'Boden wird kalibriert - Steh gerade!');

        setTimeout(() => {
            this.isCalibrating = false;
            this.onStatusChange('ready', 'Boden kalibriert!');
            this.onCalibrationProgress(1, 'done');
        }, 2000);
    }

    getCalibrationData() {
        return {
            floorLevel: this.floorLevel,
            normalTorsoHeight: this.normalTorsoHeight,
            neutralX: this.neutralX,
            thresholds: { ...this.thresholds }
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
        this.onStatusChange('ready', 'Kalibrierung geladen');
    }

    // Get debug info for UI
    getDebugInfo() {
        return {
            fps: this.fps,
            shoulderY: this.shoulderY,
            hipY: this.hipY,
            floorLevel: this.floorLevel,
            torsoRatio: this.normalTorsoHeight > 0 ? this.torsoHeight / this.normalTorsoHeight : 0,
            heightAboveFloor: this.floorLevel - this.shoulderY,
            lane: this.currentLane,
            action: this.currentAction
        };
    }
}
