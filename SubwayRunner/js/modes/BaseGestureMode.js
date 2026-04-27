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
     * Check if face landmarks are trustworthy (best practice 2026)
     * Validates geometric plausibility rather than per-landmark visibility
     * @param {Array} landmarks - MediaPipe face landmarks
     * @returns {boolean} - true if landmarks are reliable enough for gesture detection
     */
    isFaceConfident(landmarks) {
        const noseTip = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        // Face must have reasonable width (> 3% of frame)
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        if (faceWidth < 0.03) return false;

        // Face must have reasonable height
        const faceHeight = chin.y - forehead.y;
        if (faceHeight < 0.03) return false;

        // Nose must be between cheeks (not wildly outside face)
        if (noseTip.x < leftCheek.x - faceWidth * 0.5 || noseTip.x > rightCheek.x + faceWidth * 0.5) return false;

        return true;
    }

    /**
     * Calculate yaw (head left/right) from face landmarks
     * Normalized by face width → distance-independent (April 2026 fix)
     *
     * IMPORTANT: Front-facing camera mirrors the image. MediaPipe landmarks
     * are in the original (non-mirrored) frame. When user turns head RIGHT,
     * noseTip.x DECREASES in camera coords. We negate to correct for this,
     * so positive yaw = user turned right, negative = user turned left.
     *
     * @param {Array} landmarks - MediaPipe face landmarks
     * @returns {number} - Yaw angle (positive=right, negative=left, distance-independent)
     */
    calculateYaw(landmarks) {
        const noseTip = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const faceCenter = (leftCheek.x + rightCheek.x) / 2;
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        if (faceWidth < 0.01) return 0; // safety: face too small
        // Negate: front-facing camera mirrors horizontally
        // faceCenter - noseTip.x: positive when nose is LEFT of center in camera = user turned RIGHT
        return ((faceCenter - noseTip.x) / faceWidth) * 50;
    }

    /**
     * Calculate pitch (head up/down) from face landmarks
     * Configurable baseline → adapts to different face proportions (April 2026 fix)
     * @param {Array} landmarks - MediaPipe face landmarks
     * @param {number} pitchBaseline - Expected nose position ratio (default 0.4)
     * @returns {number} - Pitch angle (roughly degrees)
     */
    calculatePitch(landmarks, pitchBaseline = 0.4) {
        const forehead = landmarks[10];
        const noseTip = landmarks[1];
        const chin = landmarks[152];
        const faceHeight = chin.y - forehead.y;
        if (faceHeight < 0.01) return 0; // safety: face too small
        const noseRelative = (noseTip.y - forehead.y) / faceHeight;
        return (noseRelative - pitchBaseline) * 100;
    }
}
