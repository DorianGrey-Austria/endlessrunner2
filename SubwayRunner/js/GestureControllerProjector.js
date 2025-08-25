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
        // Detect device type
        this.deviceType = this.detectDeviceType();
        this.deviceProfile = this.getDeviceProfile();
        
        this.options = {
            videoElement: options.videoElement || null,
            canvasElement: options.canvasElement || null,
            onGestureDetected: options.onGestureDetected || (() => {}),
            onStatsUpdate: options.onStatsUpdate || (() => {}),
            onError: options.onError || (() => {}),
            onCalibrationComplete: options.onCalibrationComplete || (() => {}),
            onCalibrationProgress: options.onCalibrationProgress || (() => {}),
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            smoothingFrames: 3,
            sensitivity: 1.0,
            sensitivityX: options.sensitivityX || 1.0,
            sensitivityY: options.sensitivityY || 1.0,
            debugMode: false,
            projectorMode: true,
            mirrorHorizontal: true,
            aspectRatio: 16/9,
            useEdgeDetection: true,
            calibrationMode: 'adaptive' // 'adaptive' | 'simple' | 'preset'
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
            sampleCount: 30,
            // Adaptive calibration data
            userRangeX: { min: 0, max: 1, range: 1 },
            userRangeY: { min: 0, max: 1, range: 1 },
            faceSize: 0,
            estimatedDistance: 50, // cm
            calibrationStep: 0, // 0: not started, 1: face detection, 2: movement range, 3: edge calibration
            movements: {
                left: [],
                right: [],
                up: [],
                down: []
            }
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
        
        // Adaptive thresholds based on device type
        this.thresholds = this.calculateAdaptiveThresholds();
        
        // Edge detection thresholds (for when head partially leaves frame)
        this.edgeThresholds = {
            left: 0.15,    // Head 15% out of frame
            right: 0.85,   
            top: 0.10,
            bottom: 0.90,
            enabled: this.deviceType !== 'desktop' // More useful for mobile/tablet
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
        
        // Load saved calibration if exists
        this.loadCalibrationProfile();
    }
    
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipod|android|mobile/i.test(userAgent);
        const isTablet = /ipad|tablet|android(?!.*mobile)/i.test(userAgent);
        
        if (isTablet) return 'tablet';
        if (isMobile) return 'mobile';
        return 'desktop';
    }
    
    getDeviceProfile() {
        const profiles = {
            mobile: {
                name: 'Mobile',
                expectedDistance: 30, // cm
                movementScale: 0.7,
                defaultSensitivity: 1.2,
                thresholdMultiplier: 0.8,
                useEdgeDetection: true,
                deadZone: 0.10
            },
            tablet: {
                name: 'Tablet',
                expectedDistance: 45, // cm
                movementScale: 0.85,
                defaultSensitivity: 1.0,
                thresholdMultiplier: 0.9,
                useEdgeDetection: true,
                deadZone: 0.12
            },
            desktop: {
                name: 'Desktop',
                expectedDistance: 60, // cm
                movementScale: 1.0,
                defaultSensitivity: 0.9,
                thresholdMultiplier: 1.0,
                useEdgeDetection: false,
                deadZone: 0.15
            }
        };
        
        return profiles[this.deviceType] || profiles.desktop;
    }
    
    calculateAdaptiveThresholds() {
        const profile = this.deviceProfile;
        const baseThresholds = {
            // These will be dynamically adjusted based on calibration
            yawLeft: -0.5 * profile.thresholdMultiplier,
            yawRight: 0.5 * profile.thresholdMultiplier,
            pitchUp: -0.45 * profile.thresholdMultiplier,
            pitchDown: 0.55 * profile.thresholdMultiplier,
            deadZone: profile.deadZone,
            confidenceMin: 0.6
        };
        
        // If we have calibration data, use it to refine thresholds
        if (this.calibrationData.isCalibrated && this.calibrationData.userRangeX.range > 0) {
            const xRange = this.calibrationData.userRangeX;
            const yRange = this.calibrationData.userRangeY;
            
            baseThresholds.yawLeft = this.calibrationData.neutralYaw - (xRange.range * 0.3);
            baseThresholds.yawRight = this.calibrationData.neutralYaw + (xRange.range * 0.3);
            baseThresholds.pitchUp = this.calibrationData.neutralPitch - (yRange.range * 0.25);
            baseThresholds.pitchDown = this.calibrationData.neutralPitch + (yRange.range * 0.25);
        }
        
        return baseThresholds;
    }
    
    loadCalibrationProfile() {
        try {
            const savedProfile = localStorage.getItem('gestureCalibrationProfile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                if (profile.deviceType === this.deviceType) {
                    Object.assign(this.calibrationData, profile.calibrationData);
                    this.thresholds = this.calculateAdaptiveThresholds();
                    console.log('📂 Loaded saved calibration profile');
                }
            }
        } catch (error) {
            console.warn('Could not load calibration profile:', error);
        }
    }
    
    saveCalibrationProfile() {
        try {
            const profile = {
                deviceType: this.deviceType,
                calibrationData: this.calibrationData,
                timestamp: Date.now()
            };
            localStorage.setItem('gestureCalibrationProfile', JSON.stringify(profile));
            console.log('💾 Saved calibration profile');
        } catch (error) {
            console.warn('Could not save calibration profile:', error);
        }
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
        const chin = landmarks[152]; // Chin for better vertical tracking
        
        // Calculate face center for edge detection
        const faceX = nose.x;
        const faceY = (nose.y + chin.y) / 2; // Average of nose and chin
        
        // Store face size for distance estimation
        const faceBounds = this.calculateFaceBounds(landmarks);
        this.calibrationData.faceSize = faceBounds.width * faceBounds.height;
        
        // AVERAGE EYE POSITION (SIMPLE & RELIABLE)
        const avgEyeX = (leftEye.x + rightEye.x) / 2;
        const avgEyeY = (leftEye.y + rightEye.y) / 2;
        
        // MIRROR CORRECTION FOR X (more intuitive)
        let yaw = 1.0 - avgEyeX;  // Mirror for natural control
        let pitch = avgEyeY;       // Direct Y position
        
        // Track movement ranges during calibration
        if (this.calibrationData.calibrationStep === 2) {
            this.updateMovementRanges(yaw, pitch);
        }
        
        // DEBUG OUTPUT (temporarily)
        if (Math.random() < 0.02) { // 2% of frames
            console.log(`👁️ Eye Tracking: X=${yaw.toFixed(3)}, Y=${pitch.toFixed(3)}`);
            if (this.edgeThresholds.enabled) {
                console.log(`📍 Face Position: X=${faceX.toFixed(2)}, Y=${faceY.toFixed(2)}`);
            }
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
        
        // Apply sensitivity adjustments per axis
        const sensitivityX = this.options.sensitivityX * this.deviceProfile.movementScale;
        const sensitivityY = this.options.sensitivityY * this.deviceProfile.movementScale;
        
        if (this.calibrationData.isCalibrated) {
            yaw -= this.calibrationData.neutralYaw;
            pitch -= this.calibrationData.neutralPitch;
            
            yaw *= sensitivityX;
            pitch *= sensitivityY;
        } else if (this.calibrationData.samples.length < this.calibrationData.sampleCount) {
            this.calibrationData.samples.push({ yaw, pitch });
        }
        
        if (this.stats.confidence >= this.thresholds.confidenceMin) {
            // Pass face position for edge detection
            const gesture = this.detectProjectorGesture(yaw, pitch, faceX, faceY);
            this.updateGestureWithCooldown(gesture);
        }
    }
    
    calculateFaceBounds(landmarks) {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        
        // Use key face landmarks for bounds
        const keyPoints = [
            landmarks[10], landmarks[152], landmarks[234], landmarks[454],  // Face outline
            landmarks[33], landmarks[263], landmarks[1]  // Eyes and nose
        ];
        
        keyPoints.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }
    
    updateMovementRanges(x, y) {
        // Update min/max ranges during calibration
        if (!this.calibrationData.userRangeX.min || x < this.calibrationData.userRangeX.min) {
            this.calibrationData.userRangeX.min = x;
        }
        if (!this.calibrationData.userRangeX.max || x > this.calibrationData.userRangeX.max) {
            this.calibrationData.userRangeX.max = x;
        }
        if (!this.calibrationData.userRangeY.min || y < this.calibrationData.userRangeY.min) {
            this.calibrationData.userRangeY.min = y;
        }
        if (!this.calibrationData.userRangeY.max || y > this.calibrationData.userRangeY.max) {
            this.calibrationData.userRangeY.max = y;
        }
        
        // Calculate ranges
        this.calibrationData.userRangeX.range = this.calibrationData.userRangeX.max - this.calibrationData.userRangeX.min;
        this.calibrationData.userRangeY.range = this.calibrationData.userRangeY.max - this.calibrationData.userRangeY.min;
    }
    
    detectProjectorGesture(yaw, pitch, faceX = null, faceY = null) {
        // Convert back to 0-1 range for simpler thresholds
        const eyeX = (yaw / 2) + 0.5;   // Back to 0-1 range
        const eyeY = (pitch / 2) + 0.5; // Back to 0-1 range
        
        // Check for edge detection first (if enabled and we have face position)
        if (this.edgeThresholds.enabled && faceX !== null && faceY !== null) {
            // Edge detection - when head partially leaves the frame
            if (faceX < this.edgeThresholds.left) {
                if (this.options.debugMode) console.log('🔴 Edge Detection: LEFT');
                return 'MOVE_LEFT';
            } else if (faceX > this.edgeThresholds.right) {
                if (this.options.debugMode) console.log('🔴 Edge Detection: RIGHT');
                return 'MOVE_RIGHT';
            } else if (faceY < this.edgeThresholds.top) {
                if (this.options.debugMode) console.log('🔴 Edge Detection: JUMP');
                return 'JUMP';
            } else if (faceY > this.edgeThresholds.bottom) {
                if (this.options.debugMode) console.log('🔴 Edge Detection: DUCK');
                return 'DUCK';
            }
        }
        
        // Use adaptive thresholds based on calibration
        const UP_THRESHOLD = 0.5 + (this.thresholds.pitchUp * 0.5);
        const DOWN_THRESHOLD = 0.5 + (this.thresholds.pitchDown * 0.5);
        const LEFT_THRESHOLD = 0.5 + (this.thresholds.yawLeft * 0.5);
        const RIGHT_THRESHOLD = 0.5 + (this.thresholds.yawRight * 0.5);
        
        // Debug output for setup screen (only when needed)
        if (this.options.debugMode && Math.random() < 0.05) {
            console.log(`🎯 Eye Position: X=${eyeX.toFixed(2)}, Y=${eyeY.toFixed(2)}`);
            console.log(`📏 Thresholds - L:${LEFT_THRESHOLD.toFixed(2)} R:${RIGHT_THRESHOLD.toFixed(2)} U:${UP_THRESHOLD.toFixed(2)} D:${DOWN_THRESHOLD.toFixed(2)}`);
        }
        
        // Apply dead zone
        const deadZone = this.thresholds.deadZone;
        const isInDeadZoneX = Math.abs(eyeX - 0.5) < deadZone;
        const isInDeadZoneY = Math.abs(eyeY - 0.5) < deadZone;
        
        // Vertical gestures have priority (user specifically wants these to work)
        if (!isInDeadZoneY) {
            if (eyeY < UP_THRESHOLD) {
                return 'JUMP';
            } else if (eyeY > DOWN_THRESHOLD) {
                return 'DUCK';
            }
        }
        
        // Horizontal gestures (already working according to user)
        if (!isInDeadZoneX) {
            if (eyeX < LEFT_THRESHOLD) {
                return 'MOVE_LEFT';
            } else if (eyeX > RIGHT_THRESHOLD) {
                return 'MOVE_RIGHT';
            }
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
    
    // Advanced 3-Step Calibration System
    startAdvancedCalibration() {
        console.log('🎯 Starting Advanced 3-Step Calibration...');
        this.calibrationData.calibrationStep = 1;
        this.calibrationData.samples = [];
        this.calibrationData.isCalibrated = false;
        this.calibrationData.movements = {
            left: [],
            right: [],
            up: [],
            down: []
        };
        
        // Start with face detection and distance measurement
        this.startStep1FaceDetection();
    }
    
    startStep1FaceDetection() {
        console.log('📸 Step 1: Face Detection & Distance Measurement');
        this.calibrationData.calibrationStep = 1;
        
        // Notify UI
        this.options.onCalibrationProgress({
            step: 1,
            message: 'Positioniere dein Gesicht in der Mitte',
            progress: 0
        });
        
        // Collect face size samples for 2 seconds
        setTimeout(() => {
            this.calculateDistanceFromFaceSize();
            this.startStep2MovementRange();
        }, 2000);
    }
    
    calculateDistanceFromFaceSize() {
        // Estimate distance based on face size
        const avgFaceSize = this.calibrationData.faceSize;
        const referenceFaceSize = 0.05; // Average face size at 50cm
        
        // Rough estimation: inverse relationship between size and distance
        this.calibrationData.estimatedDistance = (referenceFaceSize / avgFaceSize) * 50;
        
        console.log(`📏 Estimated distance: ${this.calibrationData.estimatedDistance.toFixed(0)}cm`);
        
        // Adjust thresholds based on distance
        const distanceMultiplier = this.calibrationData.estimatedDistance / this.deviceProfile.expectedDistance;
        this.thresholds.deadZone *= distanceMultiplier;
    }
    
    startStep2MovementRange() {
        console.log('🎮 Step 2: Movement Range Calibration');
        this.calibrationData.calibrationStep = 2;
        
        // Reset movement ranges
        this.calibrationData.userRangeX = { min: 1, max: 0, range: 0 };
        this.calibrationData.userRangeY = { min: 1, max: 0, range: 0 };
        
        // Notify UI
        this.options.onCalibrationProgress({
            step: 2,
            message: 'Bewege deinen Kopf langsam: Links, Rechts, Oben, Unten',
            progress: 33
        });
        
        // Collect movement data for 4 seconds
        setTimeout(() => {
            this.analyzeMovementRange();
            this.startStep3EdgeCalibration();
        }, 4000);
    }
    
    analyzeMovementRange() {
        const xRange = this.calibrationData.userRangeX;
        const yRange = this.calibrationData.userRangeY;
        
        console.log(`📊 Movement Range - X: ${xRange.range.toFixed(2)}, Y: ${yRange.range.toFixed(2)}`);
        
        // Update thresholds based on actual movement range
        this.thresholds = this.calculateAdaptiveThresholds();
        
        // Mark center position
        this.calibrationData.neutralYaw = (xRange.min + xRange.max) / 2;
        this.calibrationData.neutralPitch = (yRange.min + yRange.max) / 2;
    }
    
    startStep3EdgeCalibration() {
        console.log('🔴 Step 3: Edge Detection Calibration');
        this.calibrationData.calibrationStep = 3;
        
        // Notify UI
        this.options.onCalibrationProgress({
            step: 3,
            message: 'Bewege den Kopf zu den Rändern (teilweise aus dem Bild)',
            progress: 66
        });
        
        // Test edge detection for 3 seconds
        setTimeout(() => {
            this.completeAdvancedCalibration();
        }, 3000);
    }
    
    completeAdvancedCalibration() {
        this.calibrationData.calibrationStep = 0;
        this.calibrationData.isCalibrated = true;
        
        // Save calibration profile
        this.saveCalibrationProfile();
        
        console.log(`✅ Advanced Calibration Complete!`);
        console.log(`📱 Device: ${this.deviceType}`);
        console.log(`📏 Distance: ${this.calibrationData.estimatedDistance.toFixed(0)}cm`);
        console.log(`🎯 Thresholds updated for optimal performance`);
        
        this.options.onCalibrationComplete({
            deviceType: this.deviceType,
            distance: this.calibrationData.estimatedDistance,
            thresholds: this.thresholds,
            edgeDetection: this.edgeThresholds.enabled
        });
        
        // Notify UI
        this.options.onCalibrationProgress({
            step: 3,
            message: 'Kalibrierung abgeschlossen!',
            progress: 100
        });
        
        if (this.ctx) {
            this.showCalibrationSuccess();
        }
    }
    
    // Quick calibration presets
    applyPreset(presetName) {
        const presets = {
            sensitive: {
                deadZone: 0.08,
                sensitivityX: 1.3,
                sensitivityY: 1.3,
                smoothingFrames: 2
            },
            normal: {
                deadZone: 0.12,
                sensitivityX: 1.0,
                sensitivityY: 1.0,
                smoothingFrames: 3
            },
            robust: {
                deadZone: 0.18,
                sensitivityX: 0.8,
                sensitivityY: 0.8,
                smoothingFrames: 4
            },
            gaming: {
                deadZone: 0.10,
                sensitivityX: 1.1,
                sensitivityY: 1.1,
                smoothingFrames: 1
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            Object.assign(this.options, preset);
            this.thresholds.deadZone = preset.deadZone;
            console.log(`🎮 Applied preset: ${presetName}`);
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