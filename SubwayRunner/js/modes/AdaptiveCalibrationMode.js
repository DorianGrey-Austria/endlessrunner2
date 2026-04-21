/**
 * AdaptiveCalibrationMode - Auto-calibration with user-specific thresholds
 *
 * Best Practice: Calibrate thresholds based on user's actual range of motion
 * - Records min/max values during calibration phase (5 seconds)
 * - Sets thresholds at 45% of user's range (optimal sensitivity)
 * - Prevents 25%/75% issue (too restrictive) and 30%/70% (too loose)
 *
 * This is the DEFAULT mode recommended for most users.
 */

import { BaseGestureMode } from './BaseGestureMode.js';
import { OneEuroFilter } from '../utils/OneEuroFilter.js';
import { createFaceLandmarker, getDrawingUtils, getConstants } from '../utils/MediaPipeLoader.js';

export class AdaptiveCalibrationMode extends BaseGestureMode {
    constructor(options = {}) {
        super(options);

        // FaceLandmarker instance (Tasks Vision API)
        this.faceLandmarker = null;
        this.drawingUtils = null;
        this.faceConnections = null;

        // One Euro Filters (adaptive smoothing — best practice 2026)
        // minCutoff=1.5 for less lag, beta=0.01 for fast response
        this.yawFilter = new OneEuroFilter(1.5, 0.01, 1.0);
        this.pitchFilter = new OneEuroFilter(1.5, 0.01, 1.0);

        // Calibration state
        this.calibrationStartTime = 0;
        this.calibrationDuration = 5000; // 5 seconds
        this.calibration = {
            neutralYaw: 0,
            neutralPitch: 0,
            minYaw: Infinity,
            maxYaw: -Infinity,
            minPitch: Infinity,
            maxPitch: -Infinity,
            samples: []
        };

        // Sensitivity (45% of range)
        this.sensitivity = options.sensitivity || 0.45;

        // Calculated thresholds
        this.thresholds = {
            yawLeft: -15,
            yawRight: 15,
            pitchUp: -15,
            pitchDown: 20
        };

        // Current values
        this.currentYaw = 0;
        this.currentPitch = 0;

        // Action cooldowns (prevents jump/duck spam)
        this.lastActionTime = 0;
        this.actionCooldownMs = 350;

        // Dead zone — ignore micro-movements near neutral (best practice 2026)
        // Prevents false positives from natural head sway
        this.deadZone = options.deadZone || 2.0; // degrees — movements smaller than this are ignored

        // Hysteresis factor — once in a lane, require 30% return toward center to leave
        // Prevents flickering at threshold boundaries
        this.hysteresis = 0.3;
        this.lastLane = 'center';

        // Animation frame
        this.animationId = null;

        // Frame skipping — avoid GPU contention with Three.js (best practice 2026)
        // Process every Nth frame when GPU is busy; 2 = every other frame ≈ 30fps detection
        this.frameSkip = options.frameSkip || 2;
        this.frameCounter = 0;

        // Face-lost tracking (like BodyPoseMode's noBodyFrames)
        this.noFaceFrames = 0;
        this.noFaceThreshold = 60; // ~2 seconds at 30fps — emit warning
    }

    get name() {
        return 'Auto-Kalibrierung';
    }

    get description() {
        return 'Lernt deinen Bewegungsbereich automatisch (45% Sensitivity)';
    }

    async initialize(video, canvas) {
        await super.initialize(video, canvas);

        // Load FaceLandmarker via Tasks Vision API (shared WASM singleton)
        this.onStatusChange('loading', 'Lade Face-Tracking Modell...');
        this.faceLandmarker = await createFaceLandmarker({
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        // Load drawing utilities
        try {
            const DrawingUtils = await getDrawingUtils();
            this.drawingUtils = new DrawingUtils(this.ctx);
            const constants = await getConstants();
            this.faceConnections = constants.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL;
        } catch (e) {
            // Drawing is cosmetic, not critical
        }

        this.onStatusChange('initialized', 'Adaptive Mode bereit');
    }

    async start() {
        await super.start();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });

            this.video.srcObject = stream;
            await this.video.play();

            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;

            // Start calibration only if no saved calibration data exists
            if (this.calibration.samples.length === 0 && this.thresholds.yawLeft === -15) {
                this.startCalibration();
            } else {
                this.onStatusChange('ready', 'Kalibrierung aus Speicher geladen');
            }

            // Start detection loop
            this.detectLoop();

        } catch (err) {
            this.onError({
                type: 'CAMERA_ERROR',
                message: err.message,
                suggestedMode: null
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
        if (this.faceLandmarker) {
            this.faceLandmarker.close();
            this.faceLandmarker = null;
        }

        super.destroy();
    }

    detectLoop() {
        if (!this.isRunning) return;

        this.frameCounter++;
        // Skip frames to reduce GPU contention with Three.js renderer
        if (this.frameCounter % this.frameSkip === 0 && this.video.readyState >= 2) {
            const results = this.faceLandmarker.detectForVideo(this.video, performance.now());
            this.onResults(results);
        }

        this.animationId = requestAnimationFrame(() => this.detectLoop());
    }

    onResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Mirror the image
        this.ctx.translate(this.canvas.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (results.faceLandmarks && results.faceLandmarks[0]) {
            const landmarks = results.faceLandmarks[0];
            this.noFaceFrames = 0;

            // Draw face mesh overlay
            if (this.drawingUtils && this.faceConnections) {
                this.ctx.save();
                this.ctx.translate(this.canvas.width, 0);
                this.ctx.scale(-1, 1);
                try {
                    this.drawingUtils.drawConnectors(landmarks, this.faceConnections, { color: '#58a6ff', lineWidth: 2 });
                } catch (e) { /* drawing is cosmetic */ }
                this.ctx.restore();
            }

            // Confidence check — skip frame if landmarks are unreliable
            if (!this.isFaceConfident(landmarks)) return;

            // Calculate values with One Euro adaptive smoothing
            const rawYaw = this.calculateYaw(landmarks);
            const rawPitch = this.calculatePitch(landmarks);
            const timestamp = performance.now();

            this.currentYaw = this.yawFilter.filter(rawYaw, timestamp);
            this.currentPitch = this.pitchFilter.filter(rawPitch, timestamp);

            // Handle phases
            if (this.isCalibrating) {
                this.handleCalibration();
            } else if (this.isRunning) {
                this.detectGestures();
            }

            // Draw head indicator
            this.drawHeadIndicator();
        } else {
            // Face lost — track and warn
            this.noFaceFrames++;
            if (this.noFaceFrames >= this.noFaceThreshold) {
                this.onStatusChange('warning', 'Gesicht nicht erkannt — schau in die Kamera');
                this.noFaceFrames = 0; // Reset to avoid spam
            }
        }
    }

    startCalibration() {
        this.isCalibrating = true;
        this.calibration = {
            neutralYaw: 0,
            neutralPitch: 0,
            minYaw: Infinity,
            maxYaw: -Infinity,
            minPitch: Infinity,
            maxPitch: -Infinity,
            samples: []
        };

        this.calibrationStartTime = Date.now();
        this.yawFilter.reset();
        this.pitchFilter.reset();

        this.onStatusChange('calibrating', 'Bewege deinen Kopf in alle Richtungen!');
        this.onCalibrationProgress(0, 'start');
    }

    handleCalibration() {
        const elapsed = Date.now() - this.calibrationStartTime;
        const progress = Math.min(elapsed / this.calibrationDuration, 1);

        // Collect samples
        this.calibration.samples.push({
            yaw: this.currentYaw,
            pitch: this.currentPitch
        });

        // Update min/max
        this.calibration.minYaw = Math.min(this.calibration.minYaw, this.currentYaw);
        this.calibration.maxYaw = Math.max(this.calibration.maxYaw, this.currentYaw);
        this.calibration.minPitch = Math.min(this.calibration.minPitch, this.currentPitch);
        this.calibration.maxPitch = Math.max(this.calibration.maxPitch, this.currentPitch);

        // Report progress
        this.onCalibrationProgress(progress, this.getCalibrationStep(progress));

        // Calibration complete
        if (progress >= 1) {
            this.finishCalibration();
        }
    }

    getCalibrationStep(progress) {
        if (progress < 0.25) return 'detect';
        if (progress < 0.5) return 'horizontal';
        if (progress < 0.75) return 'vertical';
        return 'complete';
    }

    finishCalibration() {
        this.isCalibrating = false;

        // Calculate neutral position (median of samples)
        const yaws = this.calibration.samples.map(s => s.yaw).sort((a, b) => a - b);
        const pitches = this.calibration.samples.map(s => s.pitch).sort((a, b) => a - b);
        const mid = Math.floor(yaws.length / 2);

        this.calibration.neutralYaw = yaws[mid] || 0;
        this.calibration.neutralPitch = pitches[mid] || 0;

        // Calculate range
        const yawRange = this.calibration.maxYaw - this.calibration.minYaw;
        const pitchRange = this.calibration.maxPitch - this.calibration.minPitch;

        // Set thresholds at sensitivity% of range (default 45%)
        const sens = this.sensitivity;
        this.thresholds.yawLeft = this.calibration.neutralYaw - (yawRange * sens / 2);
        this.thresholds.yawRight = this.calibration.neutralYaw + (yawRange * sens / 2);
        this.thresholds.pitchUp = this.calibration.neutralPitch - (pitchRange * sens / 2);
        this.thresholds.pitchDown = this.calibration.neutralPitch + (pitchRange * sens / 2);

        this.onStatusChange('ready', 'Kalibrierung abgeschlossen!');
        this.onCalibrationProgress(1, 'done');
    }

    detectGestures() {
        const yaw = this.currentYaw;
        const pitch = this.currentPitch;
        const now = Date.now();

        // Dead zone — ignore micro-movements near CALIBRATED neutral (not zero!)
        const neutralYaw = this.calibration.neutralYaw || 0;
        const neutralPitch = this.calibration.neutralPitch || 0;
        const effectiveYaw = Math.abs(yaw - neutralYaw) < this.deadZone ? neutralYaw : yaw;
        const effectivePitch = Math.abs(pitch - neutralPitch) < this.deadZone ? neutralPitch : pitch;

        // Lane detection with hysteresis (prevents flickering at threshold)
        let newLane = 'center';
        const yawRange = this.thresholds.yawRight - this.thresholds.yawLeft;
        const hyst = yawRange * this.hysteresis;

        if (this.lastLane === 'left') {
            newLane = effectiveYaw < (this.thresholds.yawLeft + hyst) ? 'left' : 'center';
        } else if (this.lastLane === 'right') {
            newLane = effectiveYaw > (this.thresholds.yawRight - hyst) ? 'right' : 'center';
        } else {
            if (effectiveYaw < this.thresholds.yawLeft) newLane = 'left';
            else if (effectiveYaw > this.thresholds.yawRight) newLane = 'right';
        }

        this.lastLane = newLane;
        this.emitGesture('lane', newLane);

        // Action detection with cooldown (prevents jump/duck spam)
        if (now - this.lastActionTime > this.actionCooldownMs) {
            let newAction = 'none';

            if (effectivePitch < this.thresholds.pitchUp) {
                newAction = 'jump';
                this.lastActionTime = now;
            } else if (effectivePitch > this.thresholds.pitchDown) {
                newAction = 'duck';
                this.lastActionTime = now;
            }

            if (newAction !== 'none') {
                this.emitGesture('action', newAction);
                setTimeout(() => this.emitGesture('action', 'none'), this.actionCooldownMs);
            }
        }
    }

    drawHeadIndicator() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw neutral zone
        this.ctx.strokeStyle = '#238636';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw current position
        const dotX = centerX + this.currentYaw * 2;
        const dotY = centerY + this.currentPitch * 1.5;

        this.ctx.fillStyle = this.currentAction !== 'none' ? '#da3633' : '#58a6ff';
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    getCalibrationData() {
        return {
            calibration: { ...this.calibration },
            thresholds: { ...this.thresholds },
            sensitivity: this.sensitivity
        };
    }

    setCalibrationData(data) {
        if (data.calibration) {
            this.calibration = { ...this.calibration, ...data.calibration };
        }
        if (data.thresholds) {
            this.thresholds = { ...this.thresholds, ...data.thresholds };
        }
        if (data.sensitivity !== undefined) {
            this.sensitivity = data.sensitivity;
        }
        this.isCalibrating = false;
        this.onStatusChange('ready', 'Kalibrierung geladen');
    }

    setSensitivity(value) {
        this.sensitivity = value;

        // Recalculate thresholds if already calibrated
        if (!this.isCalibrating && this.calibration.samples.length > 0) {
            const yawRange = this.calibration.maxYaw - this.calibration.minYaw;
            const pitchRange = this.calibration.maxPitch - this.calibration.minPitch;
            const sens = this.sensitivity;

            this.thresholds.yawLeft = this.calibration.neutralYaw - (yawRange * sens / 2);
            this.thresholds.yawRight = this.calibration.neutralYaw + (yawRange * sens / 2);
            this.thresholds.pitchUp = this.calibration.neutralPitch - (pitchRange * sens / 2);
            this.thresholds.pitchDown = this.calibration.neutralPitch + (pitchRange * sens / 2);
        }
    }
}
