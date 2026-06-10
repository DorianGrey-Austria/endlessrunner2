/**
 * AssetLoader - Progressive Enhancement for GLB 3D Models
 *
 * Loads Hyper3D-generated GLB models on capable devices (MEDIUM/HIGH quality).
 * Falls back silently to procedural geometry when:
 *   - Device lacks WebGL2 / sufficient memory / CPU cores
 *   - Quality tier is LOW
 *   - GLTFLoader CDN failed to load
 *   - Triangle budget exceeded
 *   - Model file not found (404)
 *
 * Usage from game code:
 *   const model = window.AssetLoader && window.AssetLoader.getModel('player');
 *   if (model) { scene.add(model); } else { // procedural fallback }
 */

const THREE_VERSION = '0.158.0';
const GLTF_LOADER_CDN = `https://unpkg.com/three@${THREE_VERSION}/examples/jsm/loaders/GLTFLoader.js`;
const DRACO_LOADER_CDN = `https://unpkg.com/three@${THREE_VERSION}/examples/jsm/loaders/DRACOLoader.js`;
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
const MODELS_BASE = 'models/';

const TRI_BUDGETS = {
    medium: 25000,
    high:   50000
};

const ASSET_MANIFEST = {
    // Tier 1 — always visible
    player:              { tier: 1, maxTris: 8000, maxKB: 500 },
    apple:               { tier: 1, maxTris: 1500, maxKB: 100 },
    broccoli:            { tier: 1, maxTris: 1500, maxKB: 100 },
    obstacle_lowbarrier: { tier: 1, maxTris: 2500, maxKB: 200 },
    obstacle_jumpblock:  { tier: 1, maxTris: 2500, maxKB: 200 },
    obstacle_duckbeam:   { tier: 1, maxTris: 2500, maxKB: 200 },
    env_streetlamp:      { tier: 1, maxTris: 2000, maxKB: 150 },
    env_trafficsign:     { tier: 1, maxTris: 1500, maxKB: 150 },
    // Tier 2 — frequently visible
    obstacle_spikes:         { tier: 2, maxTris: 1500, maxKB: 150 },
    obstacle_hurdleset:      { tier: 2, maxTris: 2500, maxKB: 200 },
    obstacle_wallgap:        { tier: 2, maxTris: 3000, maxKB: 250 },
    obstacle_rotatingblade:  { tier: 2, maxTris: 2500, maxKB: 200 },
    obstacle_swinghammer:    { tier: 2, maxTris: 2500, maxKB: 200 },
    obstacle_bouncingball:   { tier: 2, maxTris: 1500, maxKB: 150 },
    env_building_1:          { tier: 2, maxTris: 3000, maxKB: 300 },
    // Tier 3 — nice to have
    obstacle_movingwall:     { tier: 3, maxTris: 2500, maxKB: 200 },
    obstacle_spinninglaser:  { tier: 3, maxTris: 2500, maxKB: 200 },
    env_building_2:          { tier: 3, maxTris: 3000, maxKB: 300 },
    env_building_3:          { tier: 3, maxTris: 3000, maxKB: 300 },
    env_tunnelpipe:          { tier: 3, maxTris: 1500, maxKB: 150 }
};

// Map obstacle type strings to asset IDs
const OBSTACLE_TYPE_MAP = {
    lowbarrier:     'obstacle_lowbarrier',
    jumpblock:      'obstacle_jumpblock',
    highbarrier:    'obstacle_duckbeam',
    duckbeam:       'obstacle_duckbeam',
    spikes:         'obstacle_spikes',
    hurdleset:      'obstacle_hurdleset',
    wallgap:        'obstacle_wallgap',
    rotatingblade:  'obstacle_rotatingblade',
    swinghammer:    'obstacle_swinghammer',
    bouncingball:   'obstacle_bouncingball',
    movingwall:     'obstacle_movingwall',
    spinninglaser:  'obstacle_spinninglaser'
};

class AssetLoaderSingleton {
    constructor() {
        this.state = 'idle'; // idle | loading | ready | disabled
        this.modelCache = new Map();   // id -> THREE.Group (original loaded)
        this.failedIds = new Set();    // IDs that failed (don't retry)
        this.loadingIds = new Set();   // currently being loaded
        this.sceneTris = 0;            // tracked tris from GLB models in scene
        this.loader = null;            // THREE.GLTFLoader
        this.dracoLoader = null;       // THREE.DRACOLoader
        this.qualityTier = 'high';
    }

    /**
     * Initialize the loader. Call once after Three.js and quality system are ready.
     * Dynamically imports GLTFLoader/DRACOLoader from CDN (ESM modules).
     * @param {string} qualityTier - 'low', 'medium', or 'high'
     */
    init(qualityTier) {
        this.qualityTier = qualityTier || 'high';

        // Disable on low quality
        if (this.qualityTier === 'low') {
            this.state = 'disabled';
            console.log('[AssetLoader] Disabled — low quality mode');
            return;
        }

        // Check Three.js is loaded
        if (!window.THREE) {
            this.state = 'disabled';
            console.log('[AssetLoader] Disabled — THREE not found');
            return;
        }

        // Device capability check
        const mem = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        if (mem < 2 || cores < 2) {
            this.state = 'disabled';
            console.log(`[AssetLoader] Disabled — device too weak (${mem}GB RAM, ${cores} cores)`);
            return;
        }

        // Load GLTFLoader + DRACOLoader dynamically from CDN (ESM)
        this.state = 'loading';
        this._loadLoaders();
    }

    async _loadLoaders() {
        try {
            const [gltfModule, dracoModule] = await Promise.all([
                import(GLTF_LOADER_CDN),
                import(DRACO_LOADER_CDN)
            ]);

            this.dracoLoader = new dracoModule.DRACOLoader();
            this.dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
            this.dracoLoader.setDecoderConfig({ type: 'js' });

            this.loader = new gltfModule.GLTFLoader();
            this.loader.setDRACOLoader(this.dracoLoader);

            this.state = 'ready';
            console.log(`[AssetLoader] Ready — quality: ${this.qualityTier}, tri budget: ${this._getTriBudget()}`);

            // Preload all tiers immediately (staggered to avoid network congestion)
            this._preloadTier(3);
        } catch (err) {
            this.state = 'disabled';
            console.log('[AssetLoader] Disabled — CDN loader import failed:', err.message);
        }
    }

    /**
     * Update quality tier (called when adaptive system switches)
     */
    setQuality(tier) {
        this.qualityTier = tier;
        if (tier === 'low') {
            this.state = 'disabled';
        } else if (this.loader) {
            this.state = 'ready';
        }
    }

    /**
     * Get a cloned model for use in the scene, or null if not available.
     * @param {string} id - Asset ID (e.g., 'player', 'obstacle_lowbarrier')
     * @returns {THREE.Group|null}
     */
    getModel(id) {
        if (this.state !== 'ready') return null;

        const cached = this.modelCache.get(id);
        if (!cached) {
            // Trigger lazy load if not yet attempted
            if (!this.failedIds.has(id) && !this.loadingIds.has(id)) {
                this._loadModel(id);
            }
            return null;
        }

        // Check tri budget
        const manifest = ASSET_MANIFEST[id];
        const tris = manifest ? manifest.maxTris : 3000;
        if (this.sceneTris + tris > this._getTriBudget()) {
            return null; // budget exceeded, use procedural
        }

        // Clone the model
        const clone = cached.clone();

        // Deep clone materials so instances can be colored independently
        clone.traverse(child => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(m => m.clone());
                } else {
                    child.material = child.material.clone();
                }
            }
        });

        // Track tris
        clone.userData._assetTris = tris;
        this.sceneTris += tris;

        // Store flash materials for effects (invulnerability, etc.)
        const flashMats = [];
        clone.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                flashMats.push(...mats);
            }
        });
        clone.userData.flashMaterials = flashMats;
        clone.userData._originalColors = flashMats.map(m => m.color ? m.color.clone() : null);

        return clone;
    }

    /**
     * Get model for an obstacle type string.
     * @param {string} obstacleType - e.g., 'lowbarrier', 'jumpblock'
     * @returns {THREE.Group|null}
     */
    getObstacleModel(obstacleType) {
        const id = OBSTACLE_TYPE_MAP[obstacleType];
        return id ? this.getModel(id) : null;
    }

    /**
     * Release tri budget when a GLB model is removed from scene.
     * Call this when disposing an obstacle/collectible.
     * @param {THREE.Object3D} model
     */
    releaseModel(model) {
        if (model && model.userData._assetTris) {
            this.sceneTris = Math.max(0, this.sceneTris - model.userData._assetTris);
        }
    }

    /**
     * Check if a model is loaded and ready.
     */
    isReady(id) {
        return this.modelCache.has(id);
    }

    /**
     * Dispose all cached models and loaders.
     */
    dispose() {
        this.modelCache.forEach((model, id) => {
            model.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => {
                        if (m.map) m.map.dispose();
                        if (m.normalMap) m.normalMap.dispose();
                        m.dispose();
                    });
                }
            });
        });
        this.modelCache.clear();
        this.failedIds.clear();
        this.loadingIds.clear();
        this.sceneTris = 0;
        if (this.dracoLoader) this.dracoLoader.dispose();
    }

    // --- Private ---

    _getTriBudget() {
        return TRI_BUDGETS[this.qualityTier] || TRI_BUDGETS.medium;
    }

    _preloadTier(tier) {
        const ids = Object.entries(ASSET_MANIFEST)
            .filter(([, def]) => def.tier <= tier)
            .map(([id]) => id);
        // Stagger loads (100ms intervals, tier 1 first)
        ids.forEach((id, i) => {
            setTimeout(() => this._loadModel(id), i * 100);
        });
    }

    _loadModel(id) {
        if (this.modelCache.has(id) || this.failedIds.has(id) || this.loadingIds.has(id)) return;
        if (!ASSET_MANIFEST[id]) return;

        this.loadingIds.add(id);
        const url = MODELS_BASE + id + '.glb';

        this.loader.load(
            url,
            (gltf) => {
                this.loadingIds.delete(id);
                const model = gltf.scene;

                // Enable shadows on all meshes
                model.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Store height info from bounding box
                const box = new THREE.Box3().setFromObject(model);
                model.userData.height = box.max.y - box.min.y;
                model.userData.width = box.max.x - box.min.x;
                model.userData.depth = box.max.z - box.min.z;

                this.modelCache.set(id, model);

                const totalCached = this.modelCache.size;
                const totalAssets = Object.keys(ASSET_MANIFEST).length;
                console.log(`[AssetLoader] Loaded ${id} (${totalCached}/${totalAssets})`);
            },
            undefined, // progress callback (not needed)
            (error) => {
                this.loadingIds.delete(id);
                this.failedIds.add(id);
                // Silent fail — procedural fallback will be used
                if (error && error.message && !error.message.includes('404')) {
                    console.warn(`[AssetLoader] Failed to load ${id}:`, error.message);
                }
            }
        );
    }
}

// Singleton on window
window.AssetLoader = new AssetLoaderSingleton();
