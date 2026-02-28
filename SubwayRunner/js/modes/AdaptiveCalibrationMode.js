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
import { SimpleFilter } from '../utils/OneEuroFilter.js';

export class AdaptiveCalibrationMode extends BaseGestureMode {
    constructor(options = {}) {
        super(options);

        // FaceMesh instance
        this.faceMesh = null;
        this.camera = null;

        // Filters
        this.yawFilter = new SimpleFilter(0.4);
        this.pitchFilter = new SimpleFilter(0.4);

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

        // Animation frame
        this.animationId = null;
    }

    get name() {
        return 'Auto-Kalibrierung';
    }

    get description() {
        return 'Lernt deinen Bewegungsbereich automatisch (45% Sensitivity)';
    }

    async initialize(video, canvas) {
        await super.initialize(video, canvas);

        // Load MediaPipe FaceMesh
        if (typeof FaceMesh === 'undefined') {
            throw new Error('MediaPipe FaceMesh not loaded. Include the CDN scripts.');
        }

        this.faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.faceMesh.onResults(this.onResults.bind(this));

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

            // Start calibration immediately
            this.startCalibration();

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
        if (this.faceMesh) {
            this.faceMesh.close();
            this.faceMesh = null;
        }

        super.destroy();
    }

    async detectLoop() {
        if (!this.isRunning) return;

        if (this.video.readyState >= 2) {
            await this.faceMesh.send({ image: this.video });
        }

        this.animationId = requestAnimationFrame(() => this.detectLoop());
    }

    onResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Mirror the image
        this.ctx.translate(this.canvas.width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            const landmarks = results.multiFaceLandmarks[0];

            // Draw face mesh
            this.ctx.save();
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.scale(-1, 1);
            if (typeof drawConnectors !== 'undefined') {
                drawConnectors(this.ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#58a6ff', lineWidth: 2 });
            }
            this.ctx.restore();

            // Calculate values
            const rawYaw = this.calculateYaw(landmarks);
            const rawPitch = this.calculatePitch(landmarks);

            this.currentYaw = this.yawFilter.filter(rawYaw);
            this.currentPitch = this.pitchFilter.filter(rawPitch);

            // Handle phases
            if (this.isCalibrating) {
                this.handleCalibration();
            } else if (this.isRunning) {
                this.detectGestures();
            }

            // Draw head indicator
            this.drawHeadIndicator();
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
        // Lane detection
        let newLane = 'center';
        const yaw = this.currentYaw;

        if (yaw < this.thresholds.yawLeft) {
            newLane = 'left';
        } else if (yaw > this.thresholds.yawRight) {
            newLane = 'right';
        }

        this.emitGesture('lane', newLane);

        // Action detection
        const pitch = this.currentPitch;
        let newAction = 'none';

        if (pitch < this.thresholds.pitchUp) {
            newAction = 'jump';
        } else if (pitch > this.thresholds.pitchDown) {
            newAction = 'duck';
        }

        this.emitGesture('action', newAction);
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
