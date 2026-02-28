/**
 * GestureManager - Orchestrator for gesture control modes
 *
 * Pattern: Strategy Pattern with lazy loading
 *
 * Features:
 * - Switch between modes at runtime
 * - Preserve calibration data when switching
 * - Graceful degradation (Body Pose → Adaptive fallback)
 * - Keyboard controls remain active in parallel
 *
 * Available Modes:
 * - adaptive: Auto-Kalibrierung (DEFAULT) - learns user's range
 * - oneEuro: One Euro Filter - fast response, good for mobile
 * - bodyPose: Ganzkörper-Tracking - real jumping, TV/Beamer
 */

import { AdaptiveCalibrationMode } from './modes/AdaptiveCalibrationMode.js';
import { OneEuroFilterMode } from './modes/OneEuroFilterMode.js';
import { BodyPoseMode } from './modes/BodyPoseMode.js';

export class GestureManager {
    /**
     * @param {Object} options
     * @param {string} options.defaultMode - Default mode ('adaptive', 'oneEuro', 'bodyPose')
     * @param {HTMLVideoElement} options.video - Video element for camera
     * @param {HTMLCanvasElement} options.canvas - Canvas for overlay
     * @param {Function} options.onGestureDetected - Callback for gestures
     * @param {Function} options.onModeChange - Callback when mode changes
     * @param {Function} options.onStatusChange - Callback for status updates
     * @param {Function} options.onCalibrationProgress - Callback for calibration UI
     * @param {Function} options.onError - Callback for errors
     */
    constructor(options = {}) {
        this.options = options;

        // DOM elements
        this.video = options.video;
        this.canvas = options.canvas;

        // Mode registry
        this.modes = new Map();
        this.activeMode = null;
        this.activeModeKey = null;
        this.defaultMode = options.defaultMode || 'adaptive';

        // Calibration storage (persists across mode switches)
        this.calibrationStorage = new Map();

        // State
        this.isInitialized = false;
        this.isRunning = false;

        // Callbacks
        this.onGestureDetected = options.onGestureDetected || (() => {});
        this.onModeChange = options.onModeChange || (() => {});
        this.onStatusChange = options.onStatusChange || (() => {});
        this.onCalibrationProgress = options.onCalibrationProgress || (() => {});
        this.onError = options.onError || console.error;

        // Current gesture state (for external access)
        this.currentLane = 'center';
        this.currentAction = 'none';
    }

    /**
     * Get available modes
     * @returns {Array<{key: string, name: string, description: string}>}
     */
    getAvailableModes() {
        return [
            {
                key: 'adaptive',
                name: 'Auto-Kalibrierung',
                description: 'Lernt deinen Bewegungsbereich (Empfohlen)'
            },
            {
                key: 'oneEuro',
                name: 'One Euro Filter',
                description: 'Schnelle Reaktion (ideal für Mobile)'
            },
            {
                key: 'bodyPose',
                name: 'Ganzkörper-Tracking',
                description: 'Echtes Springen (TV/Beamer)'
            }
        ];
    }

    /**
     * Initialize the manager
     */
    async initialize() {
        if (!this.video || !this.canvas) {
            throw new Error('Video and canvas elements are required');
        }

        this.isInitialized = true;
        this.onStatusChange('initialized', 'GestureManager bereit');
    }

    /**
     * Create a mode instance
     * @private
     */
    createMode(modeKey) {
        const modeOptions = {
            onGestureDetected: (gesture) => this.handleGesture(gesture),
            onError: (error) => this.handleError(error),
            onCalibrationProgress: (progress, step) => this.onCalibrationProgress(progress, step),
            onStatusChange: (status, message) => this.onStatusChange(status, message)
        };

        switch (modeKey) {
            case 'adaptive':
                return new AdaptiveCalibrationMode(modeOptions);
            case 'oneEuro':
                return new OneEuroFilterMode(modeOptions);
            case 'bodyPose':
                return new BodyPoseMode(modeOptions);
            default:
                throw new Error(`Unknown mode: ${modeKey}`);
        }
    }

    /**
     * Switch to a different mode
     * @param {string} modeKey - 'adaptive', 'oneEuro', or 'bodyPose'
     */
    async switchMode(modeKey) {
        // Validate mode
        const validModes = ['adaptive', 'oneEuro', 'bodyPose'];
        if (!validModes.includes(modeKey)) {
            throw new Error(`Invalid mode: ${modeKey}. Valid modes: ${validModes.join(', ')}`);
        }

        // Save current mode's calibration
        if (this.activeMode && this.activeModeKey) {
            this.calibrationStorage.set(this.activeModeKey, this.activeMode.getCalibrationData());
        }

        // Stop current mode
        if (this.activeMode) {
            this.activeMode.destroy();
            this.activeMode = null;
        }

        // Create new mode
        this.activeMode = this.createMode(modeKey);
        this.activeModeKey = modeKey;
        this.modes.set(modeKey, this.activeMode);

        // Initialize new mode
        await this.activeMode.initialize(this.video, this.canvas);

        // Restore calibration if available
        const savedCalibration = this.calibrationStorage.get(modeKey);
        if (savedCalibration) {
            this.activeMode.setCalibrationData(savedCalibration);
        }

        // Start if we were running
        if (this.isRunning) {
            await this.activeMode.start();
        }

        this.onModeChange(modeKey, this.activeMode.name);
        this.onStatusChange('mode_changed', `Modus: ${this.activeMode.name}`);
    }

    /**
     * Start gesture detection
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // If no mode active, start default
        if (!this.activeMode) {
            await this.switchMode(this.defaultMode);
        }

        this.isRunning = true;
        await this.activeMode.start();
    }

    /**
     * Stop gesture detection
     */
    stop() {
        this.isRunning = false;
        if (this.activeMode) {
            this.activeMode.stop();
        }
    }

    /**
     * Full cleanup
     */
    destroy() {
        this.stop();

        // Save calibration before destroying
        if (this.activeMode && this.activeModeKey) {
            this.calibrationStorage.set(this.activeModeKey, this.activeMode.getCalibrationData());
        }

        if (this.activeMode) {
            this.activeMode.destroy();
            this.activeMode = null;
        }

        this.isInitialized = false;
    }

    /**
     * Recalibrate the current mode
     */
    startCalibration() {
        if (this.activeMode) {
            this.activeMode.startCalibration();
        }
    }

    /**
     * Handle gesture from active mode
     * @private
     */
    handleGesture(gesture) {
        if (gesture.type === 'lane') {
            this.currentLane = gesture.lane;
        } else if (gesture.type === 'action') {
            this.currentAction = gesture.action;
        }

        this.onGestureDetected(gesture);
    }

    /**
     * Handle error from active mode
     * @private
     */
    handleError(error) {
        // If body not visible in BodyPose mode, suggest fallback
        if (error.type === 'BODY_NOT_VISIBLE' && error.suggestedMode) {
            this.onError({
                ...error,
                canSwitchMode: true,
                switchTo: error.suggestedMode
            });
        } else {
            this.onError(error);
        }
    }

    /**
     * Get current mode info
     */
    getCurrentMode() {
        return {
            key: this.activeModeKey,
            name: this.activeMode ? this.activeMode.name : null,
            description: this.activeMode ? this.activeMode.description : null,
            isRunning: this.isRunning,
            isCalibrating: this.activeMode ? this.activeMode.isCalibrating : false
        };
    }

    /**
     * Get debug info from current mode
     */
    getDebugInfo() {
        if (this.activeMode && typeof this.activeMode.getDebugInfo === 'function') {
            return this.activeMode.getDebugInfo();
        }
        return {
            lane: this.currentLane,
            action: this.currentAction
        };
    }

    /**
     * Set sensitivity (for adaptive mode)
     */
    setSensitivity(value) {
        if (this.activeMode && typeof this.activeMode.setSensitivity === 'function') {
            this.activeMode.setSensitivity(value);
        }
    }

    /**
     * Export all calibration data (for persistence)
     */
    exportCalibration() {
        // Update current mode's calibration
        if (this.activeMode && this.activeModeKey) {
            this.calibrationStorage.set(this.activeModeKey, this.activeMode.getCalibrationData());
        }

        const data = {};
        this.calibrationStorage.forEach((value, key) => {
            data[key] = value;
        });

        return data;
    }

    /**
     * Import calibration data
     */
    importCalibration(data) {
        Object.entries(data).forEach(([key, value]) => {
            this.calibrationStorage.set(key, value);
        });

        // Apply to current mode if it matches
        if (this.activeMode && this.activeModeKey && data[this.activeModeKey]) {
            this.activeMode.setCalibrationData(data[this.activeModeKey]);
        }
    }
}
