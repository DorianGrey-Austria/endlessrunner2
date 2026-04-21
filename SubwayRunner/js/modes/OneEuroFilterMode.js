/**
 * OneEuroFilterMode - Fast response with adaptive smoothing
 *
 * Uses the One Euro Filter algorithm for signal smoothing:
 * - Adaptive: responds quickly to fast movements
 * - Stable: smooths effectively when idle
 * - No drift: maintains position without accumulated error
 *
 * Best for: Mobile/tablet users who need quick response.
 */

import { BaseGestureMode } from './BaseGestureMode.js';
import { OneEuroFilter } from '../utils/OneEuroFilter.js';
import { createFaceLandmarker, getDrawingUtils, getConstants } from '../utils/MediaPipeLoader.js';

export class OneEuroFilterMode extends BaseGestureMode {
    constructor(options = {}) {
        super(options);

        // FaceLandmarker instance (Tasks Vision API)
        this.faceLandmarker = null;
        this.drawingUtils = null;
        this.faceOvalConnections = null;
        this.faceTessConnections = null;

        // One Euro Filters tuned for fast mobile gaming response
        // Higher beta = faster response, higher minCutoff = less smoothing at rest
        this.yawFilter = new OneEuroFilter(1.5, 0.01, 1.0);
        this.pitchFilter = new OneEuroFilter(1.5, 0.01, 1.0);

        // Calibration (simple neutral position)
        this.calibration = {
            yaw: 0,
            pitch: 0
        };

        // Thresholds (45%/55% as per best practices)
        this.thresholds = {
            yawLeft: -12,
            yawRight: 12,
            pitchUp: -15,
            pitchDown: 20,
            cooldownMs: 300
        };

        // Current values
        this.currentYaw = 0;
        this.currentPitch = 0;
        this.rawYaw = 0;
        this.rawPitch = 0;

        // Action cooldown
        this.lastActionTime = 0;

        // Dead zone — ignore micro-movements near neutral (best practice 2026)
        this.deadZone = options.deadZone || 2.0; // degrees

        // Hysteresis — prevents lane flickering at threshold boundaries
        this.hysteresis = 0.3; // 30% of threshold range
        this.lastLane = 'center';

        // FPS tracking
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
        return 'One Euro Filter';
    }

    get description() {
        return 'Schnelle Reaktion mit adaptiver Glättung (ideal für Mobile)';
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
            this.faceOvalConnections = constants.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL;
            this.faceTessConnections = constants.FaceLandmarker.FACE_LANDMARKS_TESSELATION;
        } catch (e) {
            // Drawing is cosmetic, not critical
        }

        this.onStatusChange('initialized', 'One Euro Filter bereit');
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

            // Start detection loop
            this.detectLoop();

            this.onStatusChange('running', 'Face Mesh aktiv');

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
        if (this.frameCounter % this.frameSkip === 0 && this.video.readyState >= 2) {
            const results = this.faceLandmarker.detectForVideo(this.video, performance.now());
            this.onResults(results);
        }

        this.animationId = requestAnimationFrame(() => this.detectLoop());
    }

    onResults(results) {
        // Update FPS counter
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        // Draw video feed
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Mirror the image
        this.ctx.translate(this.canvas.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (results.faceLandmarks && results.faceLandmarks[0]) {
            const landmarks = results.faceLandmarks[0];

            // Draw face mesh overlay
            if (this.drawingUtils) {
                this.ctx.save();
                this.ctx.translate(this.canvas.width, 0);
                this.ctx.scale(-1, 1);
                try {
                    if (this.faceTessConnections) {
                        this.drawingUtils.drawConnectors(landmarks, this.faceTessConnections, { color: '#00ff0030', lineWidth: 0.5 });
                    }
                    if (this.faceOvalConnections) {
                        this.drawingUtils.drawConnectors(landmarks, this.faceOvalConnections, { color: '#e94560', lineWidth: 2 });
                    }
                } catch (e) { /* drawing is cosmetic */ }
                this.ctx.restore();
            }

            // Calculate raw yaw and pitch
            this.rawYaw = this.calculateYaw(landmarks);
            this.rawPitch = this.calculatePitch(landmarks);

            // Apply One Euro Filter
            const timestamp = performance.now();
            this.currentYaw = this.yawFilter.filter(this.rawYaw - this.calibration.yaw, timestamp);
            this.currentPitch = this.pitchFilter.filter(this.rawPitch - this.calibration.pitch, timestamp);

            // Detect gestures
            this.detectGestures();

            // Draw direction indicator
            this.drawDirectionIndicator();
        }
    }

    detectGestures() {
        const now = Date.now();

        // Dead zone — ignore micro-movements near neutral
        const yaw = Math.abs(this.currentYaw) < this.deadZone ? 0 : this.currentYaw;
        const pitch = Math.abs(this.currentPitch) < this.deadZone ? 0 : this.currentPitch;

        // Lane detection with hysteresis (prevents flickering)
        let newLane = 'center';
        const hyst = Math.abs(this.thresholds.yawRight - this.thresholds.yawLeft) * this.hysteresis;

        if (this.lastLane === 'left') {
            newLane = yaw < (this.thresholds.yawLeft + hyst) ? 'left' : 'center';
        } else if (this.lastLane === 'right') {
            newLane = yaw > (this.thresholds.yawRight - hyst) ? 'right' : 'center';
        } else {
            if (yaw < this.thresholds.yawLeft) newLane = 'left';
            else if (yaw > this.thresholds.yawRight) newLane = 'right';
        }

        this.lastLane = newLane;
        this.emitGesture('lane', newLane);

        // Action detection (with cooldown)
        if (now - this.lastActionTime > this.thresholds.cooldownMs) {
            let newAction = 'none';
            if (pitch < this.thresholds.pitchUp) {
                newAction = 'jump';
                this.lastActionTime = now;
            } else if (pitch > this.thresholds.pitchDown) {
                newAction = 'duck';
                this.lastActionTime = now;
            }

            if (newAction !== 'none') {
                this.emitGesture('action', newAction);
                // Auto-clear action after cooldown
                setTimeout(() => {
                    this.emitGesture('action', 'none');
                }, this.thresholds.cooldownMs);
            }
        }
    }

    drawDirectionIndicator() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Draw crosshair
        this.ctx.strokeStyle = '#e94560';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY);
        this.ctx.lineTo(centerX + 20, centerY);
        this.ctx.moveTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX, centerY + 20);
        this.ctx.stroke();

        // Draw direction dot based on filtered values
        const dotX = centerX + this.currentYaw * 3;
        const dotY = centerY + this.currentPitch * 2;

        this.ctx.fillStyle = '#00d9ff';
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    startCalibration() {
        super.startCalibration();

        this.onStatusChange('calibrating', 'Schaue geradeaus!');

        setTimeout(() => {
            // Reset filters
            this.yawFilter.reset();
            this.pitchFilter.reset();

            // Store current position as calibration offset
            this.calibration.yaw = this.rawYaw;
            this.calibration.pitch = this.rawPitch;

            this.isCalibrating = false;
            this.onStatusChange('ready', 'Kalibriert! Neutralposition gespeichert.');
            this.onCalibrationProgress(1, 'done');
        }, 1500);
    }

    getCalibrationData() {
        return {
            calibration: { ...this.calibration },
            thresholds: { ...this.thresholds }
        };
    }

    setCalibrationData(data) {
        if (data.calibration) {
            this.calibration = { ...this.calibration, ...data.calibration };
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
            rawYaw: this.rawYaw,
            rawPitch: this.rawPitch,
            filteredYaw: this.currentYaw,
            filteredPitch: this.currentPitch,
            lane: this.currentLane,
            action: this.currentAction
        };
    }
}
