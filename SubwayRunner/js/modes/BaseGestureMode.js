/**
 * BaseGestureMode - Interface for all gesture control modes
 *
 * All gesture modes must implement this interface to work with GestureManager.
 *
 * Lifecycle:
 * 1. initialize(video, canvas) - Load MediaPipe, setup DOM
 * 2. start() - Begin camera capture and gesture detection
 * 3. stop() - Pause detection (keeps camera ready)
 * 4. destroy() - Full cleanup (release camera, remove listeners)
 *
 * Calibration:
 * - startCalibration() - Begin calibration process
 * - getCalibrationData() - Export calibration for persistence
 * - setCalibrationData(data) - Import previously saved calibration
 */
export class BaseGestureMode {
    /**
     * @param {Object} options
     * @param {Function} options.onGestureDetected - Callback for gesture events
     * @param {Function} options.onError - Callback for errors
     * @param {Function} options.onCalibrationProgress - Callback for calibration UI
     * @param {Function} options.onStatusChange - Callback for status updates
     */
    constructor(options = {}) {
        this.options = options;
        this.isInitialized = false;
        this.isRunning = false;
        this.isCalibrating = false;

        // DOM elements (set during initialize)
        this.video = null;
        this.canvas = null;
        this.ctx = null;

        // Current gesture state
        this.currentLane = 'center';
        this.currentAction = 'none';

        // Callbacks
        this.onGestureDetected = options.onGestureDetected || (() => {});
        this.onError = options.onError || console.error;
        this.onCalibrationProgress = options.onCalibrationProgress || (() => {});
        this.onStatusChange = options.onStatusChange || (() => {});
    }

    /**
     * Get the display name of this mode
     * @returns {string}
     */
    get name() {
        throw new Error('Subclass must implement name getter');
    }

    /**
     * Get a short description of this mode
     * @returns {string}
     */
    get description() {
        throw new Error('Subclass must implement description getter');
    }

    /**
     * Initialize the gesture mode
     * @param {HTMLVideoElement} video - Video element for camera feed
     * @param {HTMLCanvasElement} canvas - Canvas for overlay drawing
     * @returns {Promise<void>}
     */
    async initialize(video, canvas) {
        this.video = video;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isInitialized = true;
        this.onStatusChange('initialized', `${this.name} bereit`);
    }

    /**
     * Start gesture detection
     * @returns {Promise<void>}
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('Mode must be initialized before starting');
        }
        this.isRunning = true;
        this.onStatusChange('running', `${this.name} aktiv`);
    }

    /**
     * Stop gesture detection (keeps camera ready for restart)
     */
    stop() {
        this.isRunning = false;
        this.onStatusChange('stopped', `${this.name} pausiert`);
    }

    /**
     * Full cleanup - release all resources
     */
    destroy() {
        this.stop();
        this.isInitialized = false;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.onStatusChange('destroyed', `${this.name} beendet`);
    }

    /**
     * Start the calibration process
     */
    startCalibration() {
        this.isCalibrating = true;
        this.onStatusChange('calibrating', 'Kalibrierung läuft...');
    }

    /**
     * Export current calibration data for persistence
     * @returns {Object}
     */
    getCalibrationData() {
        return {};
    }

    /**
     * Import previously saved calibration data
     * @param {Object} data
     */
    setCalibrationData(data) {
        // Override in subclass
    }

    /**
     * Emit a gesture event
     * @param {string} type - 'lane' or 'action'
     * @param {string} value - Lane ('left', 'center', 'right') or Action ('jump', 'duck', 'none')
     */
    emitGesture(type, value) {
        if (type === 'lane' && value !== this.currentLane) {
            this.currentLane = value;
            this.onGestureDetected({ type: 'lane', lane: value });
        } else if (type === 'action' && value !== this.currentAction) {
            this.currentAction = value;
            this.onGestureDetected({ type: 'action', action: value });
        }
    }

    /**
     * Calculate yaw (head left/right) from face landmarks
     * @param {Array} landmarks - MediaPipe face landmarks
     * @returns {number} - Yaw angle in degrees (roughly)
     */
    calculateYaw(landmarks) {
        const noseTip = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const faceCenter = (leftCheek.x + rightCheek.x) / 2;
        return (noseTip.x - faceCenter) * 100;
    }

    /**
     * Calculate pitch (head up/down) from face landmarks
     * @param {Array} landmarks - MediaPipe face landmarks
     * @returns {number} - Pitch angle in degrees (roughly)
     */
    calculatePitch(landmarks) {
        const forehead = landmarks[10];
        const noseTip = landmarks[1];
        const chin = landmarks[152];
        const faceHeight = chin.y - forehead.y;
        const noseRelative = (noseTip.y - forehead.y) / faceHeight;
        return (noseRelative - 0.4) * 100;
    }
}
