/**
 * GestureController - Professional Face-based Gesture Control for SubwayRunner
 * Uses MediaPipe Face Landmarks for head movement detection
 * 
 * Features:
 * - Lightweight face tracking (468 landmarks)
 * - Head position (yaw/pitch) based gestures
 * - Kalman filtering for smooth movement
 * - Auto-calibration system
 * - Performance optimization with frame skipping
 * - Debug visualization mode
 */

import { FaceLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

export class GestureController {
    constructor(options = {}) {
        // Configuration
        this.options = {
            videoElement: options.videoElement || null,
            canvasElement: options.canvasElement || null,
            onGestureDetected: options.onGestureDetected || (() => {}),
            onStatsUpdate: options.onStatsUpdate || (() => {}),
            onError: options.onError || (() => {}),
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            smoothingFrames: 5,
            sensitivity: 0.5,
            debugMode: false
        };
        
        // State
        this.isRunning = false;
        this.faceLandmarker = null;
        this.lastVideoTime = -1;
        this.gestureHistory = [];
        this.lastGesture = 'NONE';
        
        // Calibration
        this.calibrationData = {
            neutralYaw: 0,
            neutralPitch: 0,
            yawRange: 15,  // degrees
            pitchRange: 15,
            isCalibrated: false
        };
        
        // Performance tracking
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastFrameTime: performance.now(),
            faceDetected: false,
            yaw: 0,
            pitch: 0
        };
        
        // Kalman filter for smoothing
        this.kalmanFilter = {
            yaw: new KalmanFilter(0.01, 1),
            pitch: new KalmanFilter(0.01, 1)
        };
        
        // Gesture thresholds
        this.thresholds = {
            yawLeft: -0.6,    // Relative to calibrated neutral
            yawRight: 0.6,
            pitchUp: -0.6,
            pitchDown: 0.6,
            deadZone: 0.2     // Neutral zone to prevent jitter
        };
        
        // Canvas context for drawing
        this.ctx = this.options.canvasElement ? 
            this.options.canvasElement.getContext('2d') : null;
        this.drawingUtils = null;
        
        // Frame skipping for performance
        this.frameSkipCounter = 0;
        this.frameSkipRate = 2; // Process every nth frame
    }
    
    async start() {
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.options.videoElement.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.options.videoElement.onloadedmetadata = resolve;
            });
            
            // Initialize MediaPipe
            await this.initializeMediaPipe();
            
            // Start detection loop
            this.isRunning = true;
            this.detectLoop();
            
            // Auto-calibrate after 2 seconds
            setTimeout(() => this.calibrate(), 2000);
            
        } catch (error) {
            this.options.onError(`Failed to start camera: ${error.message}`);
            throw error;
        }
    }
    
    stop() {
        this.isRunning = false;
        
        // Stop video stream
        if (this.options.videoElement && this.options.videoElement.srcObject) {
            const tracks = this.options.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.options.videoElement.srcObject = null;
        }
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.options.canvasElement.width, this.options.canvasElement.height);
        }
    }
    
    async initializeMediaPipe() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker_lite/float16/latest/face_landmarker_lite.task",
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
            minFaceDetectionConfidence: this.options.minDetectionConfidence,
            minFacePresenceConfidence: this.options.minDetectionConfidence,
            minTrackingConfidence: this.options.minTrackingConfidence
        });
        
        // Initialize drawing utils if canvas available
        if (this.ctx) {
            this.drawingUtils = new DrawingUtils(this.ctx);
        }
    }
    
    detectLoop() {
        if (!this.isRunning || !this.faceLandmarker) {
            return;
        }
        
        // Frame skipping for performance
        this.frameSkipCounter++;
        if (this.frameSkipCounter < this.frameSkipRate) {
            requestAnimationFrame(() => this.detectLoop());
            return;
        }
        this.frameSkipCounter = 0;
        
        const video = this.options.videoElement;
        const startTimeMs = performance.now();
        
        if (video.readyState >= 2 && this.lastVideoTime !== video.currentTime) {
            this.lastVideoTime = video.currentTime;
            
            // Detect faces
            const results = this.faceLandmarker.detectForVideo(video, startTimeMs);
            
            // Update FPS
            this.updateFPS();
            
            // Process results
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                this.processFaceLandmarks(results);
                this.stats.faceDetected = true;
            } else {
                this.stats.faceDetected = false;
                this.updateGesture('NONE');
            }
            
            // Draw visualization if in debug mode
            if (this.options.debugMode && this.ctx) {
                this.drawDebugVisualization(results);
            } else if (this.ctx) {
                this.drawMinimalVisualization();
            }
            
            // Update stats
            this.options.onStatsUpdate(this.stats);
        }
        
        requestAnimationFrame(() => this.detectLoop());
    }
    
    processFaceLandmarks(results) {
        const landmarks = results.faceLandmarks[0];
        
        // Calculate head pose using key landmarks
        const nose = landmarks[1];
        const forehead = landmarks[9];
        const chin = landmarks[152];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];
        
        // Calculate yaw (left/right rotation)
        const earDistance = rightEar.x - leftEar.x;
        const faceCenterX = (leftEar.x + rightEar.x) / 2;
        const noseOffsetX = nose.x - faceCenterX;
        let yaw = (noseOffsetX / earDistance) * 2; // Normalize to -1 to 1
        
        // Calculate pitch (up/down rotation)
        const faceHeight = chin.y - forehead.y;
        const noseCenterY = (forehead.y + chin.y) / 2;
        const noseOffsetY = nose.y - noseCenterY;
        let pitch = (noseOffsetY / faceHeight) * 2; // Normalize to -1 to 1
        
        // Apply Kalman filtering for smooth movement
        yaw = this.kalmanFilter.yaw.filter(yaw);
        pitch = this.kalmanFilter.pitch.filter(pitch);
        
        // Store raw values for stats
        this.stats.yaw = yaw * 45; // Convert to approximate degrees
        this.stats.pitch = pitch * 45;
        
        // Apply calibration
        if (this.calibrationData.isCalibrated) {
            yaw -= this.calibrationData.neutralYaw;
            pitch -= this.calibrationData.neutralPitch;
        }
        
        // Apply sensitivity
        yaw *= this.options.sensitivity * 2;
        pitch *= this.options.sensitivity * 2;
        
        // Detect gesture based on head position
        const gesture = this.detectGesture(yaw, pitch);
        this.updateGesture(gesture);
    }
    
    detectGesture(yaw, pitch) {
        // Check dead zone first
        const inDeadZone = Math.abs(yaw) < this.thresholds.deadZone && 
                          Math.abs(pitch) < this.thresholds.deadZone;
        
        // Priority order: Duck > Jump > Left/Right > None
        if (pitch > this.thresholds.pitchDown) {
            return 'DUCK';
        } else if (pitch < this.thresholds.pitchUp) {
            return 'JUMP';
        } else if (yaw < this.thresholds.yawLeft) {
            return 'MOVE_LEFT';
        } else if (yaw > this.thresholds.yawRight) {
            return 'MOVE_RIGHT';
        } else if (inDeadZone || this.lastGesture === 'DUCK') {
            return 'NONE';
        }
        
        // Keep last gesture if not in dead zone (hysteresis)
        return this.lastGesture;
    }
    
    updateGesture(gesture) {
        // Add to history for smoothing
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.options.smoothingFrames) {
            this.gestureHistory.shift();
        }
        
        // Get most common gesture in history
        const gestureCount = {};
        this.gestureHistory.forEach(g => {
            gestureCount[g] = (gestureCount[g] || 0) + 1;
        });
        
        let maxCount = 0;
        let smoothedGesture = 'NONE';
        for (const [g, count] of Object.entries(gestureCount)) {
            if (count > maxCount) {
                maxCount = count;
                smoothedGesture = g;
            }
        }
        
        // Only trigger callback if gesture changed
        if (smoothedGesture !== this.lastGesture) {
            this.lastGesture = smoothedGesture;
            this.options.onGestureDetected(smoothedGesture);
        }
    }
    
    calibrate() {
        // Use current position as neutral
        this.calibrationData.neutralYaw = this.stats.yaw / 45; // Convert back from degrees
        this.calibrationData.neutralPitch = this.stats.pitch / 45;
        this.calibrationData.isCalibrated = true;
        
        // Show calibration feedback
        if (this.ctx) {
            const canvas = this.options.canvasElement;
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CALIBRATED!', canvas.width / 2, canvas.height / 2);
            
            setTimeout(() => {
                if (this.ctx) {
                    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }, 1000);
        }
    }
    
    drawMinimalVisualization() {
        const canvas = this.options.canvasElement;
        const video = this.options.videoElement;
        
        // Set canvas size
        canvas.width = 180;
        canvas.height = 135;
        
        // Draw video feed (mirrored)
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        this.ctx.restore();
        
        // Draw face detection indicator
        if (this.stats.faceDetected) {
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        } else {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        }
        
        // Draw current gesture
        if (this.lastGesture !== 'NONE') {
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.lastGesture, canvas.width / 2, canvas.height - 10);
        }
    }
    
    drawDebugVisualization(results) {
        const canvas = this.options.canvasElement;
        const video = this.options.videoElement;
        
        // Set canvas size for debug mode
        canvas.width = 320;
        canvas.height = 240;
        
        // Draw video feed
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        this.ctx.restore();
        
        // Draw face landmarks
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            // Draw all landmarks
            this.ctx.fillStyle = '#00ff88';
            landmarks.forEach(landmark => {
                const x = (1 - landmark.x) * canvas.width; // Mirror X coordinate
                const y = landmark.y * canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            });
            
            // Draw key landmarks larger
            const keyLandmarks = [1, 9, 152, 234, 454]; // nose, forehead, chin, ears
            this.ctx.fillStyle = '#ff0000';
            keyLandmarks.forEach(idx => {
                const landmark = landmarks[idx];
                const x = (1 - landmark.x) * canvas.width;
                const y = landmark.y * canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            });
        }
        
        // Draw stats
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.stats.fps.toFixed(1)}`, 10, 20);
        this.ctx.fillText(`Yaw: ${this.stats.yaw.toFixed(1)}°`, 10, 35);
        this.ctx.fillText(`Pitch: ${this.stats.pitch.toFixed(1)}°`, 10, 50);
        this.ctx.fillText(`Gesture: ${this.lastGesture}`, 10, 65);
    }
    
    updateFPS() {
        this.stats.frameCount++;
        const now = performance.now();
        const elapsed = now - this.stats.lastFrameTime;
        
        if (elapsed >= 1000) {
            this.stats.fps = (this.stats.frameCount * 1000) / elapsed;
            this.stats.frameCount = 0;
            this.stats.lastFrameTime = now;
        }
    }
    
    // Configuration methods
    setSensitivity(value) {
        this.options.sensitivity = Math.max(0.1, Math.min(1, value));
    }
    
    setSmoothingFrames(frames) {
        this.options.smoothingFrames = Math.max(1, Math.min(10, frames));
    }
    
    setDebugMode(enabled) {
        this.options.debugMode = enabled;
        if (!enabled && this.ctx) {
            // Clear canvas when disabling debug mode
            this.ctx.clearRect(0, 0, this.options.canvasElement.width, this.options.canvasElement.height);
        }
    }
    
    setFrameSkipRate(rate) {
        this.frameSkipRate = Math.max(1, Math.min(5, rate));
    }
}

// Simple Kalman Filter implementation for smoothing
class KalmanFilter {
    constructor(processNoise = 0.01, measurementNoise = 1) {
        this.processNoise = processNoise;
        this.measurementNoise = measurementNoise;
        this.value = 0;
        this.uncertainty = 1;
    }
    
    filter(measurement) {
        // Prediction
        this.uncertainty += this.processNoise;
        
        // Update
        const gain = this.uncertainty / (this.uncertainty + this.measurementNoise);
        this.value += gain * (measurement - this.value);
        this.uncertainty *= (1 - gain);
        
        return this.value;
    }
    
    reset() {
        this.value = 0;
        this.uncertainty = 1;
    }
}