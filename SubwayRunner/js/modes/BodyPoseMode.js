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

        // MediaPipe Pose instance
        this.pose = null;

        // Floor tracking (for jump detection)
        this.floorHistory = [];
        this.floorLevel = 0;
        this.floorSamples = 30; // Average over 30 frames

        // Pose data
        this.shoulderY = 0;
        this.hipY = 0;
        this.torsoHeight = 0;
        this.noseX = 0;
        this.shoulderCenterX = 0;

        // Thresholds
        this.thresholds = {
            jumpThreshold: 0.08,   // 8% of frame height above floor
            crouchThreshold: 0.7,  // Torso shrinks to 70% of normal
            leanThreshold: 0.15    // 15% of torso width
        };

        // Cooldowns
        this.lastJumpTime = 0;
        this.lastCrouchTime = 0;
        this.jumpCooldown = 500;
        this.crouchCooldown = 300;

        // Calibration
        this.normalTorsoHeight = 0;
        this.isFloorCalibrated = false;

        // Body not visible tracking
        this.noBodyFrames = 0;
        this.noBodyThreshold = 30; // 30 frames = ~1 second

        // FPS
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();

        // Animation frame
        this.animationId = null;
    }

    get name() {
        return 'Ganzkörper-Tracking';
    }

    get description() {
        return 'Echtes Springen und Ducken (ideal für TV/Beamer)';
    }

    async initialize(video, canvas) {
        await super.initialize(video, canvas);

        // Load MediaPipe Pose
        if (typeof Pose === 'undefined') {
            throw new Error('MediaPipe Pose not loaded. Include the CDN scripts.');
        }

        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        this.pose.setOptions({
            modelComplexity: 1,           // 0=lite, 1=full, 2=heavy
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.pose.onResults(this.onResults.bind(this));

        this.onStatusChange('initialized', 'Body Pose bereit');
    }

    async start() {
        await super.start();

        try {
            // Request higher resolution for body tracking
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;
            await this.video.play();

            this.canvas.width = this.video.videoWidth || 1280;
            this.canvas.height = this.video.videoHeight || 720;

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
        if (this.pose) {
            this.pose.close();
            this.pose = null;
        }

        super.destroy();
    }

    async detectLoop() {
        if (!this.isRunning) return;

        if (this.video.readyState >= 2) {
            await this.pose.send({ image: this.video });
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
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

        if (results.poseLandmarks) {
            const landmarks = results.poseLandmarks;

            // Draw pose skeleton
            if (typeof drawConnectors !== 'undefined') {
                drawConnectors(this.ctx, landmarks, POSE_CONNECTIONS, { color: '#ff6b35', lineWidth: 3 });
                drawLandmarks(this.ctx, landmarks, { color: '#fff', lineWidth: 1, radius: 4 });
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
                    message: 'Körper nicht sichtbar - zum Kopf-Tracking wechseln?'
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

        // Calculate positions
        this.shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        this.shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        this.hipY = (leftHip.y + rightHip.y) / 2;
        this.noseX = nose.x;

        // Torso height (distance from shoulders to hips)
        this.torsoHeight = this.hipY - this.shoulderY;

        // Calibrate normal torso height on first detection
        if (!this.isFloorCalibrated && this.torsoHeight > 0) {
            this.normalTorsoHeight = this.torsoHeight;
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
        this.floorLevel = sorted.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(10, sorted.length);
    }

    detectBodyLean() {
        // Calculate lean: nose position relative to shoulder center
        const lean = this.noseX - this.shoulderCenterX;

        let newLane = 'center';

        if (lean < -this.thresholds.leanThreshold) {
            newLane = 'left';  // Leaning left (nose left of shoulders)
        } else if (lean > this.thresholds.leanThreshold) {
            newLane = 'right'; // Leaning right
        }

        this.emitGesture('lane', newLane);
    }

    detectJump() {
        const now = Date.now();
        if (now - this.lastJumpTime < this.jumpCooldown) return;

        // Jump detected when shoulders rise significantly above floor
        // (shoulder Y decreases = higher position)
        const heightAboveFloor = this.floorLevel - this.shoulderY;

        if (heightAboveFloor > this.thresholds.jumpThreshold) {
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
