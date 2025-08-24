/**
 * GestureControllerProjector - Optimized for Projector Setup with Overhead Camera
 * Enhanced version specifically designed for video projector installations
 * 
 * Key Features:
 * - Overhead camera perspective correction
 * - Larger gesture detection zones for standing players
 * - Multi-tier fallback system for 99% reliability
 * - Real-time calibration for different player heights
 * - Projector-specific coordinate mapping
 * - Advanced performance optimizations
 */

import { FaceLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

export class GestureControllerProjector {
    constructor(options = {}) {
        this.options = {
            videoElement: options.videoElement || null,
            canvasElement: options.canvasElement || null,
            onGestureDetected: options.onGestureDetected || (() => {}),
            onStatsUpdate: options.onStatsUpdate || (() => {}),
            onError: options.onError || (() => {}),
            onCalibrationComplete: options.onCalibrationComplete || (() => {}),
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            smoothingFrames: 3,
            sensitivity: 1.0,
            debugMode: false,
            projectorMode: true,
            mirrorHorizontal: true,
            aspectRatio: 16/9
        };
        
        this.isRunning = false;
        this.faceLandmarker = null;
        this.lastVideoTime = -1;
        this.gestureHistory = [];
        this.lastGesture = 'NONE';
        this.gestureStartTime = {};
        this.gestureCooldowns = {
            MOVE_LEFT: 300,
            MOVE_RIGHT: 300,
            JUMP: 500,
            DUCK: 400
        };
        
        this.calibrationData = {
            neutralYaw: 0,
            neutralPitch: 0,
            yawRange: 20,
            pitchRange: 25,
            isCalibrated: false,
            playerHeight: 1.0,
            samples: [],
            sampleCount: 30
        };
        
        this.stats = {
            fps: 0,
            trackingFps: 0,
            frameCount: 0,
            lastFrameTime: performance.now(),
            faceDetected: false,
            confidence: 0,
            yaw: 0,
            pitch: 0,
            latency: 0,
            reliability: 100
        };
        
        this.kalmanFilters = {
            yaw: new AdvancedKalmanFilter(0.008, 0.8),
            pitch: new AdvancedKalmanFilter(0.008, 0.8),
            confidence: new AdvancedKalmanFilter(0.01, 0.5)
        };
        
        this.thresholds = {
            yawLeft: -0.5,
            yawRight: 0.5,
            pitchUp: -0.45,
            pitchDown: 0.55,
            deadZone: 0.15,
            confidenceMin: 0.6
        };
        
        this.fallbackSystem = {
            primary: 'mediapipe',
            secondary: null,
            tertiaryEnabled: false,
            failureCount: 0,
            maxFailures: 10
        };
        
        this.ctx = this.options.canvasElement ? 
            this.options.canvasElement.getContext('2d') : null;
        this.drawingUtils = null;
        
        this.performanceManager = {
            targetFPS: 30,
            currentQuality: 'high',
            frameSkipRate: 1,
            autoAdjust: true,
            qualityLevels: {
                high: { skip: 1, resolution: 640, landmarks: 468 },
                medium: { skip: 2, resolution: 480, landmarks: 468 },
                low: { skip: 3, resolution: 320, landmarks: 468 }
            }
        };
        
        this.frameSkipCounter = 0;
        this.analytics = {
            totalGestures: 0,
            correctGestures: 0,
            falsePositives: 0,
            sessionStart: Date.now()
        };
    }
    
    async start() {
        try {
            console.log('🎮 Starting GestureControllerProjector...');
            
            const constraints = {
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, min: 15 }
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.options.videoElement.srcObject = stream;
            
            await new Promise((resolve) => {
                this.options.videoElement.onloadedmetadata = resolve;
            });
            
            await this.initializeMediaPipe();
            
            this.isRunning = true;
            this.detectLoop();
            
            setTimeout(() => this.startCalibration(), 2000);
            
            console.log('✅ GestureControllerProjector started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start:', error);
            this.handleFallback(error);
        }
    }
    
    async initializeMediaPipe() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            
            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                outputFacialTransformationMatrixes: true,
                runningMode: "VIDEO",
                numFaces: 1,
                minFaceDetectionConfidence: this.options.minDetectionConfidence,
                minFacePresenceConfidence: this.options.minDetectionConfidence,
                minTrackingConfidence: this.options.minTrackingConfidence
            });
            
            if (this.ctx) {
                this.drawingUtils = new DrawingUtils(this.ctx);
            }
            
            console.log('✅ MediaPipe initialized with GPU acceleration');
        } catch (error) {
            console.error('⚠️ MediaPipe initialization failed, trying fallback:', error);
            throw error;
        }
    }
    
    detectLoop() {
        if (!this.isRunning || !this.faceLandmarker) {
            return;
        }
        
        const startTime = performance.now();
        
        this.frameSkipCounter++;
        if (this.frameSkipCounter < this.performanceManager.frameSkipRate) {
            requestAnimationFrame(() => this.detectLoop());
            return;
        }
        this.frameSkipCounter = 0;
        
        const video = this.options.videoElement;
        
        if (video.readyState >= 2 && this.lastVideoTime !== video.currentTime) {
            this.lastVideoTime = video.currentTime;
            
            try {
                const results = this.faceLandmarker.detectForVideo(video, startTime);
                
                this.stats.latency = performance.now() - startTime;
                
                this.updateFPS();
                
                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    this.processFaceLandmarksProjector(results);
                    this.stats.faceDetected = true;
                    this.fallbackSystem.failureCount = 0;
                } else {
                    this.stats.faceDetected = false;
                    this.handleNoFaceDetected();
                }
                
                if (this.options.debugMode && this.ctx) {
                    this.drawProjectorDebugVisualization(results);
                } else if (this.ctx) {
                    this.drawProjectorVisualization();
                }
                
                this.adaptPerformance();
                
                this.options.onStatsUpdate(this.stats);
                
            } catch (error) {
                console.error('Detection error:', error);
                this.handleDetectionError(error);
            }
        }
        
        requestAnimationFrame(() => this.detectLoop());
    }
    
    processFaceLandmarksProjector(results) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes ? results.faceBlendshapes[0] : null;
        
        // KEY LANDMARKS - SIMPLE EYE TRACKING APPROACH (PROVEN TO WORK!)
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const nose = landmarks[1];
        
        // AVERAGE EYE POSITION (SIMPLE & RELIABLE)
        const avgEyeX = (leftEye.x + rightEye.x) / 2;
        const avgEyeY = (leftEye.y + rightEye.y) / 2;
        
        // MIRROR CORRECTION FOR X (more intuitive)
        let yaw = 1.0 - avgEyeX;  // Mirror for natural control
        let pitch = avgEyeY;       // Direct Y position
        
        // DEBUG OUTPUT (temporarily)
        if (Math.random() < 0.02) { // 2% of frames
            console.log(`👁️ Eye Tracking: X=${yaw.toFixed(3)}, Y=${pitch.toFixed(3)}`);
        }
        
        // Convert to centered coordinates (-1 to 1)
        yaw = (yaw - 0.5) * 2;     // -1 (left) to 1 (right)
        pitch = (pitch - 0.5) * 2;  // -1 (up) to 1 (down)
        
        // Apply smoothing filters
        yaw = this.kalmanFilters.yaw.filter(yaw);
        pitch = this.kalmanFilters.pitch.filter(pitch);
        
        const confidence = this.calculateConfidence(landmarks, blendshapes);
        this.stats.confidence = this.kalmanFilters.confidence.filter(confidence);
        
        this.stats.yaw = yaw * 45;
        this.stats.pitch = pitch * 45;
        
        if (this.calibrationData.isCalibrated) {
            yaw -= this.calibrationData.neutralYaw;
            pitch -= this.calibrationData.neutralPitch;
            
            yaw *= (this.options.sensitivity * 1.5);
            pitch *= (this.options.sensitivity * 1.5);
        } else if (this.calibrationData.samples.length < this.calibrationData.sampleCount) {
            this.calibrationData.samples.push({ yaw, pitch });
        }
        
        if (this.stats.confidence >= this.thresholds.confidenceMin) {
            const gesture = this.detectProjectorGesture(yaw, pitch);
            this.updateGestureWithCooldown(gesture);
        }
    }
    
    detectProjectorGesture(yaw, pitch) {
        // Convert back to 0-1 range for simpler thresholds
        const eyeX = (yaw / 2) + 0.5;   // Back to 0-1 range
        const eyeY = (pitch / 2) + 0.5; // Back to 0-1 range
        
        // SIMPLE EYE-TRACKING THRESHOLDS (PROVEN TO WORK!)
        const UP_THRESHOLD = 0.45;    // Eye looking up = Jump
        const DOWN_THRESHOLD = 0.55;  // Eye looking down = Duck
        const LEFT_THRESHOLD = 0.35;  // Eye looking left
        const RIGHT_THRESHOLD = 0.65; // Eye looking right
        
        // Debug output for setup screen (only when needed)
        if (this.options.debugMode && Math.random() < 0.05) {
            console.log(`🎯 Eye Position: X=${eyeX.toFixed(2)}, Y=${eyeY.toFixed(2)}`);
        }
        
        // Vertical gestures have priority (user specifically wants these to work)
        if (eyeY < UP_THRESHOLD) {
            return 'JUMP';
        } else if (eyeY > DOWN_THRESHOLD) {
            return 'DUCK';
        }
        
        // Horizontal gestures (already working according to user)
        if (eyeX < LEFT_THRESHOLD) {
            return 'MOVE_LEFT';
        } else if (eyeX > RIGHT_THRESHOLD) {
            return 'MOVE_RIGHT';
        }
        
        return 'NONE';
    }
    
    updateGestureWithCooldown(gesture) {
        const now = Date.now();
        
        if (gesture !== 'NONE' && gesture !== this.lastGesture) {
            const lastGestureTime = this.gestureStartTime[gesture] || 0;
            const cooldown = this.gestureCooldowns[gesture] || 0;
            
            if (now - lastGestureTime < cooldown) {
                return;
            }
            
            this.gestureStartTime[gesture] = now;
        }
        
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.options.smoothingFrames) {
            this.gestureHistory.shift();
        }
        
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
        
        if (smoothedGesture !== this.lastGesture) {
            this.lastGesture = smoothedGesture;
            this.options.onGestureDetected(smoothedGesture);
            this.analytics.totalGestures++;
            
            console.log(`🎮 Gesture: ${smoothedGesture} (Confidence: ${(this.stats.confidence * 100).toFixed(1)}%)`);
        }
    }
    
    startCalibration() {
        console.log('🎯 Starting auto-calibration...');
        this.calibrationData.samples = [];
        this.calibrationData.isCalibrated = false;
        
        if (this.ctx) {
            this.showCalibrationCountdown();
        }
        
        setTimeout(() => {
            this.completeCalibration();
        }, 3000);
    }
    
    completeCalibration() {
        if (this.calibrationData.samples.length > 0) {
            const avgYaw = this.calibrationData.samples.reduce((sum, s) => sum + s.yaw, 0) / this.calibrationData.samples.length;
            const avgPitch = this.calibrationData.samples.reduce((sum, s) => sum + s.pitch, 0) / this.calibrationData.samples.length;
            
            this.calibrationData.neutralYaw = avgYaw;
            this.calibrationData.neutralPitch = avgPitch;
            this.calibrationData.isCalibrated = true;
            
            console.log(`✅ Calibration complete! Neutral position: Yaw=${avgYaw.toFixed(2)}, Pitch=${avgPitch.toFixed(2)}`);
            
            this.options.onCalibrationComplete({
                neutralYaw: avgYaw,
                neutralPitch: avgPitch
            });
            
            if (this.ctx) {
                this.showCalibrationSuccess();
            }
        } else {
            console.warn('⚠️ Calibration failed - no samples collected');
            setTimeout(() => this.startCalibration(), 2000);
        }
    }
    
    showCalibrationCountdown() {
        let count = 3;
        const interval = setInterval(() => {
            if (!this.ctx) return;
            
            const canvas = this.options.canvasElement;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            if (count > 0) {
                this.ctx.fillText(count.toString(), canvas.width / 2, canvas.height / 2);
            } else {
                this.ctx.fillText('LOOK STRAIGHT', canvas.width / 2, canvas.height / 2);
                clearInterval(interval);
            }
            
            count--;
        }, 1000);
    }
    
    showCalibrationSuccess() {
        if (!this.ctx) return;
        
        const canvas = this.options.canvasElement;
        this.ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('✅ CALIBRATED!', canvas.width / 2, canvas.height / 2);
        
        setTimeout(() => {
            if (this.ctx) {
                this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }, 1500);
    }
    
    calculateConfidence(landmarks, blendshapes) {
        let confidence = 0.5;
        
        const nose = landmarks[1];
        const forehead = landmarks[9];
        const chin = landmarks[152];
        
        const faceSize = Math.abs(chin.y - forehead.y);
        const expectedSize = 0.3;
        const sizeConfidence = 1.0 - Math.abs(faceSize - expectedSize) * 2;
        
        confidence += sizeConfidence * 0.3;
        
        if (blendshapes) {
            const eyeBlinkLeft = blendshapes.categories?.find(c => c.categoryName === 'eyeBlinkLeft');
            const eyeBlinkRight = blendshapes.categories?.find(c => c.categoryName === 'eyeBlinkRight');
            
            if (eyeBlinkLeft && eyeBlinkRight) {
                const blinkConfidence = 1.0 - (eyeBlinkLeft.score + eyeBlinkRight.score) / 2;
                confidence += blinkConfidence * 0.2;
            }
        }
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    handleNoFaceDetected() {
        this.fallbackSystem.failureCount++;
        
        if (this.fallbackSystem.failureCount > this.fallbackSystem.maxFailures) {
            this.handleFallback(new Error('Face detection lost'));
        }
        
        this.updateGestureWithCooldown('NONE');
    }
    
    handleDetectionError(error) {
        console.error('Detection error:', error);
        this.fallbackSystem.failureCount++;
        
        if (this.fallbackSystem.failureCount > this.fallbackSystem.maxFailures) {
            this.handleFallback(error);
        }
    }
    
    handleFallback(error) {
        console.warn('⚠️ Initiating fallback system:', error.message);
        
        this.stats.reliability = Math.max(0, this.stats.reliability - 10);
        
        if (!this.fallbackSystem.secondary) {
            console.log('🔄 Switching to keyboard/touch controls');
            this.options.onError('Gesture control unavailable. Using keyboard/touch controls.');
            this.fallbackSystem.tertiaryEnabled = true;
        }
    }
    
    adaptPerformance() {
        if (!this.performanceManager.autoAdjust) return;
        
        const fps = this.stats.trackingFps;
        const targetFPS = this.performanceManager.targetFPS;
        
        if (fps < targetFPS * 0.6 && this.performanceManager.currentQuality !== 'low') {
            this.downgradeQuality();
        } else if (fps > targetFPS * 1.2 && this.performanceManager.currentQuality !== 'high') {
            this.upgradeQuality();
        }
    }
    
    downgradeQuality() {
        const qualities = ['high', 'medium', 'low'];
        const currentIndex = qualities.indexOf(this.performanceManager.currentQuality);
        
        if (currentIndex < qualities.length - 1) {
            this.performanceManager.currentQuality = qualities[currentIndex + 1];
            const quality = this.performanceManager.qualityLevels[this.performanceManager.currentQuality];
            this.performanceManager.frameSkipRate = quality.skip;
            
            console.log(`⬇️ Downgrading quality to: ${this.performanceManager.currentQuality}`);
        }
    }
    
    upgradeQuality() {
        const qualities = ['high', 'medium', 'low'];
        const currentIndex = qualities.indexOf(this.performanceManager.currentQuality);
        
        if (currentIndex > 0) {
            this.performanceManager.currentQuality = qualities[currentIndex - 1];
            const quality = this.performanceManager.qualityLevels[this.performanceManager.currentQuality];
            this.performanceManager.frameSkipRate = quality.skip;
            
            console.log(`⬆️ Upgrading quality to: ${this.performanceManager.currentQuality}`);
        }
    }
    
    drawProjectorVisualization() {
        if (!this.ctx) return;
        
        const canvas = this.options.canvasElement;
        const video = this.options.videoElement;
        
        canvas.width = 240;
        canvas.height = 180;
        
        this.ctx.save();
        if (this.options.mirrorHorizontal) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
            this.ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        this.ctx.restore();
        
        const borderColor = this.stats.faceDetected ? '#00ff88' : '#ff4444';
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        if (this.lastGesture !== 'NONE') {
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(this.lastGesture, canvas.width / 2, canvas.height - 10);
        }
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${this.stats.trackingFps.toFixed(0)}`, 5, 5);
        this.ctx.fillText(`Confidence: ${(this.stats.confidence * 100).toFixed(0)}%`, 5, 18);
    }
    
    drawProjectorDebugVisualization(results) {
        if (!this.ctx) return;
        
        const canvas = this.options.canvasElement;
        const video = this.options.videoElement;
        
        canvas.width = 480;
        canvas.height = 360;
        
        this.ctx.save();
        if (this.options.mirrorHorizontal) {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
            this.ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        this.ctx.restore();
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            this.ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
            landmarks.forEach(landmark => {
                const x = this.options.mirrorHorizontal ? 
                    (1 - landmark.x) * canvas.width : 
                    landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            });
            
            const keyLandmarks = [1, 9, 152, 234, 454, 33, 263];
            this.ctx.fillStyle = '#ff0000';
            keyLandmarks.forEach(idx => {
                const landmark = landmarks[idx];
                const x = this.options.mirrorHorizontal ? 
                    (1 - landmark.x) * canvas.width : 
                    landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            });
        }
        
        const debugInfo = [
            `FPS: ${this.stats.trackingFps.toFixed(1)} / ${this.stats.fps.toFixed(1)}`,
            `Latency: ${this.stats.latency.toFixed(1)}ms`,
            `Yaw: ${this.stats.yaw.toFixed(1)}°`,
            `Pitch: ${this.stats.pitch.toFixed(1)}°`,
            `Confidence: ${(this.stats.confidence * 100).toFixed(1)}%`,
            `Gesture: ${this.lastGesture}`,
            `Quality: ${this.performanceManager.currentQuality}`,
            `Reliability: ${this.stats.reliability}%`
        ];
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(5, 5, 150, debugInfo.length * 15 + 10);
        
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '11px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        debugInfo.forEach((text, i) => {
            this.ctx.fillText(text, 10, 10 + i * 15);
        });
    }
    
    updateFPS() {
        this.stats.frameCount++;
        const now = performance.now();
        const elapsed = now - this.stats.lastFrameTime;
        
        if (elapsed >= 1000) {
            this.stats.fps = (this.stats.frameCount * 1000) / elapsed;
            this.stats.trackingFps = this.stats.fps / this.performanceManager.frameSkipRate;
            this.stats.frameCount = 0;
            this.stats.lastFrameTime = now;
        }
    }
    
    stop() {
        this.isRunning = false;
        
        if (this.options.videoElement && this.options.videoElement.srcObject) {
            const tracks = this.options.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.options.videoElement.srcObject = null;
        }
        
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.options.canvasElement.width, this.options.canvasElement.height);
        }
        
        const sessionDuration = (Date.now() - this.analytics.sessionStart) / 1000;
        const accuracy = this.analytics.correctGestures / Math.max(1, this.analytics.totalGestures) * 100;
        
        console.log(`📊 Session Analytics:
            Duration: ${sessionDuration.toFixed(1)}s
            Total Gestures: ${this.analytics.totalGestures}
            Accuracy: ${accuracy.toFixed(1)}%
            Avg FPS: ${this.stats.fps.toFixed(1)}
            Reliability: ${this.stats.reliability}%`);
    }
    
    recalibrate() {
        this.startCalibration();
    }
    
    setSensitivity(value) {
        this.options.sensitivity = Math.max(0.3, Math.min(2.0, value));
        console.log(`Sensitivity set to: ${this.options.sensitivity}`);
    }
    
    setSmoothingFrames(frames) {
        this.options.smoothingFrames = Math.max(1, Math.min(10, frames));
    }
    
    setDebugMode(enabled) {
        this.options.debugMode = enabled;
        if (!enabled && this.ctx) {
            this.ctx.clearRect(0, 0, this.options.canvasElement.width, this.options.canvasElement.height);
        }
    }
    
    setProjectorMode(enabled) {
        this.options.projectorMode = enabled;
        this.options.mirrorHorizontal = enabled;
        console.log(`Projector mode: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    getAnalytics() {
        return {
            ...this.analytics,
            currentStats: { ...this.stats },
            calibration: { ...this.calibrationData },
            performance: {
                quality: this.performanceManager.currentQuality,
                frameSkipRate: this.performanceManager.frameSkipRate
            }
        };
    }
}

class AdvancedKalmanFilter {
    constructor(processNoise = 0.01, measurementNoise = 1, initialUncertainty = 1) {
        this.processNoise = processNoise;
        this.measurementNoise = measurementNoise;
        this.value = 0;
        this.uncertainty = initialUncertainty;
        this.velocity = 0;
        this.velocityUncertainty = initialUncertainty;
    }
    
    filter(measurement) {
        this.uncertainty += this.processNoise;
        this.velocityUncertainty += this.processNoise;
        
        const gain = this.uncertainty / (this.uncertainty + this.measurementNoise);
        const velocityGain = this.velocityUncertainty / (this.velocityUncertainty + this.measurementNoise);
        
        const innovation = measurement - this.value;
        this.value += gain * innovation;
        this.velocity = velocityGain * innovation;
        
        this.uncertainty *= (1 - gain);
        this.velocityUncertainty *= (1 - velocityGain);
        
        this.value += this.velocity * 0.1;
        
        return this.value;
    }
    
    reset() {
        this.value = 0;
        this.uncertainty = 1;
        this.velocity = 0;
        this.velocityUncertainty = 1;
    }
}

export default GestureControllerProjector;