/**
 * MediaPipeLoader - Singleton loader for MediaPipe Tasks Vision
 *
 * Ensures WASM runtime (~15MB) is loaded only once, shared across all gesture modes.
 * Provides factory methods for FaceLandmarker and PoseLandmarker with GPU delegate.
 */

const TASKS_VISION_VERSION = '0.10.34';
const TASKS_VISION_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}`;
const WASM_CDN = `${TASKS_VISION_CDN}/wasm`;

const FACE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';
const POSE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

// Cached module and vision instance
let tasksVisionModule = null;
let visionInstance = null;

/**
 * Dynamically import the Tasks Vision module (cached)
 */
async function getModule() {
    if (!tasksVisionModule) {
        tasksVisionModule = await import(`${TASKS_VISION_CDN}/vision_bundle.mjs`);
    }
    return tasksVisionModule;
}

/**
 * Get or create the FilesetResolver vision instance (singleton)
 */
export async function getVisionInstance() {
    if (!visionInstance) {
        const { FilesetResolver } = await getModule();
        visionInstance = await FilesetResolver.forVisionTasks(WASM_CDN);
    }
    return visionInstance;
}

/**
 * Create a FaceLandmarker with GPU delegate (CPU fallback)
 * @param {Object} options
 * @param {number} options.minDetectionConfidence - Default 0.7
 * @param {number} options.minTrackingConfidence - Default 0.7
 * @returns {Promise<FaceLandmarker>}
 */
export async function createFaceLandmarker(options = {}) {
    const { FaceLandmarker } = await getModule();
    const vision = await getVisionInstance();

    const conf = {
        minDetectionConfidence: options.minDetectionConfidence || 0.7,
        minTrackingConfidence: options.minTrackingConfidence || 0.7
    };

    // Try GPU first, fall back to CPU
    try {
        return await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: FACE_MODEL_URL,
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: conf.minDetectionConfidence,
            minFacePresenceConfidence: conf.minDetectionConfidence,
            minTrackingConfidence: conf.minTrackingConfidence
        });
    } catch (gpuError) {
        console.warn('GPU delegate failed for FaceLandmarker, falling back to CPU:', gpuError.message);
        return await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: FACE_MODEL_URL,
                delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: conf.minDetectionConfidence,
            minFacePresenceConfidence: conf.minDetectionConfidence,
            minTrackingConfidence: conf.minTrackingConfidence
        });
    }
}

/**
 * Create a PoseLandmarker with GPU delegate (CPU fallback)
 * @param {Object} options
 * @param {number} options.minDetectionConfidence - Default 0.7
 * @param {number} options.minTrackingConfidence - Default 0.7
 * @returns {Promise<PoseLandmarker>}
 */
export async function createPoseLandmarker(options = {}) {
    const { PoseLandmarker } = await getModule();
    const vision = await getVisionInstance();

    const conf = {
        minDetectionConfidence: options.minDetectionConfidence || 0.7,
        minTrackingConfidence: options.minTrackingConfidence || 0.7
    };

    try {
        return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: POSE_MODEL_URL,
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: conf.minDetectionConfidence,
            minPosePresenceConfidence: conf.minDetectionConfidence,
            minTrackingConfidence: conf.minTrackingConfidence
        });
    } catch (gpuError) {
        console.warn('GPU delegate failed for PoseLandmarker, falling back to CPU:', gpuError.message);
        return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: POSE_MODEL_URL,
                delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: conf.minDetectionConfidence,
            minPosePresenceConfidence: conf.minDetectionConfidence,
            minTrackingConfidence: conf.minTrackingConfidence
        });
    }
}

/**
 * Get the DrawingUtils class for canvas rendering
 * @returns {Promise<typeof DrawingUtils>}
 */
export async function getDrawingUtils() {
    const { DrawingUtils } = await getModule();
    return DrawingUtils;
}

/**
 * Get landmark connection constants
 */
export async function getConstants() {
    const mod = await getModule();
    return {
        FaceLandmarker: mod.FaceLandmarker,
        PoseLandmarker: mod.PoseLandmarker
    };
}
