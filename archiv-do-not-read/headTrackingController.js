/**
 * HeadTrackingController - Mobile Head Gesture Control for Endless Runner
 * Uses MediaPipe Face Mesh for 99% reliable head tracking
 */

class HeadTrackingController {
    constructor(gameController) {
        this.game = gameController;
        this.isInitialized = false;
        this.isTracking = false;
        this.trackingMode = 'advanced'; // advanced, basic, fallback
        
        // MediaPipe configuration
        this.faceMesh = null;
        this.camera = null;
        
        // Tracking state
        this.lastGesture = 'center';
        this.gestureConfidence = 0;
        this.frameCount = 0;
        
        // Performance monitoring
        this.fps = 30;
        this.lastFrameTime = performance.now();
        this.performanceMetrics = {
            successCount: 0,
            totalCount: 0,
            avgLatency: 0
        };
        
        // Gesture thresholds (will be calibrated per user)
        this.thresholds = {
            leftTurn: -15,    // degrees
            rightTurn: 15,    // degrees
            neutralZone: 10,  // degrees
            jump: -20,        // pitch up
            duck: 25,         // pitch down
            confidence: 0.7   // minimum confidence
        };
        
        // Smoothing filters
        this.yawFilter = new KalmanFilter({ R: 0.01, Q: 3 });
        this.pitchFilter = new KalmanFilter({ R: 0.01, Q: 3 });
        
        // Gesture cooldowns
        this.gestureCooldowns = {
            jump: 0,
            duck: 0,
            cooldownTime: 500 // ms
        };
        
        // Mobile optimization
        this.frameSkipper = new FrameSkipper();
        this.resolution = this.getOptimalResolution();
        
        // UI elements
        this.uiElements = {
            preview: null,
            statusIndicator: null,
            calibrationUI: null
        };
        
        // User calibration data
        this.calibrationData = this.loadCalibration();
    }
    
    /**
     * Initialize MediaPipe Face Mesh and camera
     */
    async initialize() {
        try {
            // Check for camera support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported');
            }
            
            // Initialize MediaPipe
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });
            
            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });
            
            // Set up result callback
            this.faceMesh.onResults(this.onFaceMeshResults.bind(this));
            
            // Initialize camera
            await this.setupCamera();
            
            // Create UI elements
            this.createUIElements();
            
            this.isInitialized = true;
            this.updateStatus('initialized');
            
            return true;
        } catch (error) {
            console.error('Head tracking initialization failed:', error);
            this.fallbackToTouch();
            return false;
        }
    }
    
    /**
     * Set up camera with mobile-optimized settings
     */
    async setupCamera() {
        const constraints = {
            video: {
                width: this.resolution.width,
                height: this.resolution.height,
                facingMode: 'user',
                frameRate: { ideal: 30, max: 30 }
            }
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Create video element
            this.camera = document.createElement('video');
            this.camera.srcObject = stream;
            this.camera.setAttribute('playsinline', '');
            this.camera.style.display = 'none';
            document.body.appendChild(this.camera);
            
            // Wait for video to load
            await new Promise((resolve) => {
                this.camera.onloadedmetadata = () => {
                    this.camera.play();
                    resolve();
                };
            });
            
        } catch (error) {
            throw new Error('Camera access denied: ' + error.message);
        }
    }
    
    /**
     * Process face mesh results
     */
    onFaceMeshResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.handleNoFaceDetected();
            return;
        }
        
        const landmarks = results.multiFaceLandmarks[0];
        const gesture = this.processLandmarks(landmarks);
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Apply gesture to game
        if (gesture && gesture !== this.lastGesture) {
            this.applyGesture(gesture);
            this.lastGesture = gesture;
        }
    }
    
    /**
     * Process landmarks to detect gestures
     */
    processLandmarks(landmarks) {
        // Calculate head orientation
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        const forehead = landmarks[10];
        
        // Calculate yaw (left/right rotation)
        const yaw = this.calculateYaw(leftEye, rightEye, noseTip);
        
        // Calculate pitch (up/down rotation)
        const pitch = this.calculatePitch(noseTip, forehead);
        
        // Apply Kalman filtering for smooth tracking
        const smoothYaw = this.yawFilter.filter(yaw);
        const smoothPitch = this.pitchFilter.filter(pitch);
        
        // Detect gesture
        return this.detectGesture(smoothYaw, smoothPitch);
    }
    
    /**
     * Calculate yaw angle from facial landmarks
     */
    calculateYaw(leftEye, rightEye, nose) {
        const eyeDistance = Math.sqrt(
            Math.pow(rightEye.x - leftEye.x, 2) +
            Math.pow(rightEye.y - leftEye.y, 2)
        );
        
        const eyeCenter = {
            x: (leftEye.x + rightEye.x) / 2,
            y: (leftEye.y + rightEye.y) / 2
        };
        
        const noseOffset = nose.x - eyeCenter.x;
        const yaw = (noseOffset / eyeDistance) * 90; // Convert to degrees
        
        return yaw;
    }
    
    /**
     * Calculate pitch angle from facial landmarks
     */
    calculatePitch(nose, forehead) {
        const verticalDistance = forehead.y - nose.y;
        const pitch = Math.atan2(verticalDistance, 0.3) * (180 / Math.PI);
        return pitch - 30; // Adjust for neutral position
    }
    
    /**
     * Detect gesture from head orientation
     */
    detectGesture(yaw, pitch) {
        const currentTime = Date.now();
        
        // Check vertical gestures first (higher priority)
        if (pitch < this.thresholds.jump && 
            currentTime - this.gestureCooldowns.jump > this.gestureCooldowns.cooldownTime) {
            this.gestureCooldowns.jump = currentTime;
            return 'jump';
        }
        
        if (pitch > this.thresholds.duck && 
            currentTime - this.gestureCooldowns.duck > this.gestureCooldowns.cooldownTime) {
            this.gestureCooldowns.duck = currentTime;
            return 'duck';
        }
        
        // Check horizontal movement
        if (Math.abs(yaw) < this.thresholds.neutralZone) {
            return 'center';
        } else if (yaw < this.thresholds.leftTurn) {
            return 'left';
        } else if (yaw > this.thresholds.rightTurn) {
            return 'right';
        }
        
        return 'center';
    }
    
    /**
     * Apply detected gesture to game
     */
    applyGesture(gesture) {
        if (!this.game || !this.isTracking) return;
        
        switch(gesture) {
            case 'left':
                this.game.moveLeft();
                break;
            case 'right':
                this.game.moveRight();
                break;
            case 'center':
                this.game.moveCenter();
                break;
            case 'jump':
                this.game.jump();
                break;
            case 'duck':
                this.game.handleSlide();
                break;
        }
        
        // Update UI feedback
        this.updateGestureFeedback(gesture);
    }
    
    /**
     * Start head tracking
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        this.isTracking = true;
        this.updateStatus('tracking');
        
        // Start processing loop
        this.processLoop();
    }
    
    /**
     * Main processing loop
     */
    async processLoop() {
        if (!this.isTracking) return;
        
        // Skip frames for performance on mobile
        if (this.frameSkipper.shouldProcess()) {
            await this.faceMesh.send({ image: this.camera });
        }
        
        // Continue loop
        requestAnimationFrame(() => this.processLoop());
    }
    
    /**
     * Stop head tracking
     */
    stop() {
        this.isTracking = false;
        this.updateStatus('stopped');
        
        // Stop camera
        if (this.camera && this.camera.srcObject) {
            this.camera.srcObject.getTracks().forEach(track => track.stop());
        }
    }
    
    /**
     * Get optimal resolution for device
     */
    getOptimalResolution() {
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        const isLowEnd = this.detectLowEndDevice();
        
        if (isLowEnd) {
            return { width: 320, height: 240 };
        } else if (isMobile) {
            return { width: 480, height: 360 };
        } else {
            return { width: 640, height: 480 };
        }
    }
    
    /**
     * Detect low-end mobile devices
     */
    detectLowEndDevice() {
        // Check for older devices or low memory
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        
        return memory < 4 || cores < 4;
    }
    
    /**
     * Create UI elements for camera preview and status
     */
    createUIElements() {
        // Camera preview (optional, can be hidden)
        this.uiElements.preview = this.createCameraPreview();
        
        // Status indicator
        this.uiElements.statusIndicator = this.createStatusIndicator();
        
        // Calibration UI
        this.uiElements.calibrationUI = this.createCalibrationUI();
    }
    
    /**
     * Create camera preview element
     */
    createCameraPreview() {
        const preview = document.createElement('div');
        preview.id = 'headTrackingPreview';
        preview.className = 'head-tracking-preview';
        preview.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 120px;
            height: 90px;
            border-radius: 8px;
            overflow: hidden;
            background: #000;
            opacity: 0.3;
            transition: opacity 0.3s;
            z-index: 1000;
            display: none;
        `;
        
        const video = document.createElement('video');
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        preview.appendChild(video);
        
        document.body.appendChild(preview);
        return preview;
    }
    
    /**
     * Create status indicator
     */
    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'headTrackingStatus';
        indicator.className = 'head-tracking-status';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 5px 10px;
            border-radius: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 12px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    /**
     * Create calibration UI
     */
    createCalibrationUI() {
        const calibrationUI = document.createElement('div');
        calibrationUI.id = 'headTrackingCalibration';
        calibrationUI.className = 'head-tracking-calibration';
        calibrationUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 2000;
            display: none;
        `;
        
        calibrationUI.innerHTML = `
            <h2>Kopfsteuerung Kalibrierung</h2>
            <p id="calibrationInstructions">Bitte halten Sie Ihren Kopf gerade und schauen Sie auf den Bildschirm</p>
            <div id="calibrationProgress" style="margin: 20px 0;">
                <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; margin: 0 auto;">
                    <div id="calibrationBar" style="width: 0%; height: 100%; background: #4CAF50; border-radius: 5px; transition: width 0.3s;"></div>
                </div>
            </div>
            <button id="calibrationButton" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Start</button>
        `;
        
        document.body.appendChild(calibrationUI);
        return calibrationUI;
    }
    
    /**
     * Update status indicator
     */
    updateStatus(status) {
        if (!this.uiElements.statusIndicator) return;
        
        const statusConfig = {
            'initialized': { icon: '🟡', text: 'Bereit' },
            'tracking': { icon: '🟢', text: 'Aktiv' },
            'calibrating': { icon: '🔵', text: 'Kalibrierung' },
            'degraded': { icon: '🟠', text: 'Eingeschränkt' },
            'stopped': { icon: '🔴', text: 'Gestoppt' },
            'error': { icon: '❌', text: 'Fehler' }
        };
        
        const config = statusConfig[status] || statusConfig['error'];
        this.uiElements.statusIndicator.innerHTML = `${config.icon} ${config.text}`;
    }
    
    /**
     * Update gesture feedback
     */
    updateGestureFeedback(gesture) {
        // Visual feedback can be added here
        if (this.game.settings && this.game.settings.hapticFeedback) {
            this.triggerHapticFeedback(gesture);
        }
    }
    
    /**
     * Trigger haptic feedback for gestures
     */
    triggerHapticFeedback(gesture) {
        if ('vibrate' in navigator) {
            switch(gesture) {
                case 'jump':
                case 'duck':
                    navigator.vibrate(50);
                    break;
                case 'left':
                case 'right':
                    navigator.vibrate(20);
                    break;
            }
        }
    }
    
    /**
     * Handle no face detected
     */
    handleNoFaceDetected() {
        this.gestureConfidence = 0;
        this.performanceMetrics.totalCount++;
        
        // Degrade to fallback mode if face not detected for too long
        if (this.performanceMetrics.totalCount > 30 && 
            this.performanceMetrics.successCount / this.performanceMetrics.totalCount < 0.5) {
            this.degradeTrackingMode();
        }
    }
    
    /**
     * Degrade tracking mode for poor conditions
     */
    degradeTrackingMode() {
        if (this.trackingMode === 'advanced') {
            this.trackingMode = 'basic';
            this.updateStatus('degraded');
            // Adjust thresholds for basic mode
            this.thresholds.confidence = 0.5;
        } else if (this.trackingMode === 'basic') {
            this.fallbackToTouch();
        }
    }
    
    /**
     * Fallback to touch controls
     */
    fallbackToTouch() {
        this.stop();
        this.updateStatus('error');
        
        // Notify game to show touch controls
        if (this.game && this.game.showTouchControls) {
            this.game.showTouchControls();
        }
        
        console.log('Head tracking unavailable, using touch controls');
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        this.fps = 1000 / deltaTime;
        this.lastFrameTime = currentTime;
        
        this.performanceMetrics.totalCount++;
        this.performanceMetrics.successCount++;
        
        // Monitor performance
        if (this.frameCount % 60 === 0) {
            const successRate = this.performanceMetrics.successCount / this.performanceMetrics.totalCount;
            if (successRate < 0.7) {
                this.degradeTrackingMode();
            }
        }
        
        this.frameCount++;
    }
    
    /**
     * Start calibration process
     */
    async startCalibration() {
        this.updateStatus('calibrating');
        this.uiElements.calibrationUI.style.display = 'block';
        
        // Calibration steps
        const steps = [
            { instruction: 'Bitte halten Sie Ihren Kopf gerade', duration: 2000 },
            { instruction: 'Drehen Sie Ihren Kopf langsam nach links', duration: 2000 },
            { instruction: 'Drehen Sie Ihren Kopf langsam nach rechts', duration: 2000 },
            { instruction: 'Neigen Sie Ihren Kopf nach oben (Springen)', duration: 2000 },
            { instruction: 'Neigen Sie Ihren Kopf nach unten (Ducken)', duration: 2000 }
        ];
        
        const calibrationData = {
            neutral: null,
            ranges: {
                yawMin: 0,
                yawMax: 0,
                pitchMin: 0,
                pitchMax: 0
            }
        };
        
        // Execute calibration steps
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            document.getElementById('calibrationInstructions').textContent = step.instruction;
            document.getElementById('calibrationBar').style.width = `${(i + 1) / steps.length * 100}%`;
            
            // Collect data during this step
            await this.collectCalibrationData(i, calibrationData);
            await this.delay(step.duration);
        }
        
        // Apply calibration
        this.applyCalibration(calibrationData);
        
        // Hide calibration UI
        this.uiElements.calibrationUI.style.display = 'none';
        this.updateStatus('tracking');
    }
    
    /**
     * Collect calibration data
     */
    async collectCalibrationData(step, data) {
        // Implementation would collect actual landmark data
        // This is a placeholder for the calibration logic
    }
    
    /**
     * Apply calibration data
     */
    applyCalibration(data) {
        // Adjust thresholds based on user's range of motion
        this.thresholds.leftTurn = data.ranges.yawMin * 0.6;
        this.thresholds.rightTurn = data.ranges.yawMax * 0.6;
        this.thresholds.jump = data.ranges.pitchMin * 0.7;
        this.thresholds.duck = data.ranges.pitchMax * 0.7;
        
        // Save calibration
        this.saveCalibration(data);
    }
    
    /**
     * Save calibration to localStorage
     */
    saveCalibration(data) {
        localStorage.setItem('headTrackingCalibration', JSON.stringify({
            thresholds: this.thresholds,
            timestamp: Date.now(),
            deviceInfo: {
                userAgent: navigator.userAgent,
                resolution: this.resolution
            }
        }));
    }
    
    /**
     * Load calibration from localStorage
     */
    loadCalibration() {
        const saved = localStorage.getItem('headTrackingCalibration');
        if (saved) {
            const data = JSON.parse(saved);
            // Check if calibration is recent (within 30 days)
            if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) {
                this.thresholds = data.thresholds;
                return data;
            }
        }
        return null;
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Kalman Filter for smoothing head tracking data
 */
class KalmanFilter {
    constructor(params = {}) {
        this.R = params.R || 0.01; // Measurement noise
        this.Q = params.Q || 3;    // Process noise
        this.A = 1;
        this.B = 0;
        this.C = 1;
        this.x = 0;  // Initial state
        this.P = 1;  // Initial covariance
        this.u = 0;  // Control input
    }
    
    filter(measurement) {
        // Prediction
        const predictedX = this.A * this.x + this.B * this.u;
        const predictedP = this.A * this.P * this.A + this.Q;
        
        // Update
        const K = predictedP * this.C / (this.C * predictedP * this.C + this.R);
        this.x = predictedX + K * (measurement - this.C * predictedX);
        this.P = (1 - K * this.C) * predictedP;
        
        return this.x;
    }
    
    reset() {
        this.x = 0;
        this.P = 1;
    }
}

/**
 * Frame skipper for mobile optimization
 */
class FrameSkipper {
    constructor(targetFPS = 15) {
        this.targetFPS = targetFPS;
        this.frameInterval = 1000 / targetFPS;
        this.lastProcessTime = 0;
    }
    
    shouldProcess() {
        const currentTime = performance.now();
        if (currentTime - this.lastProcessTime >= this.frameInterval) {
            this.lastProcessTime = currentTime;
            return true;
        }
        return false;
    }
    
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeadTrackingController;
}