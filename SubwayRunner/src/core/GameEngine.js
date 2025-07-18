/**
 * GameEngine - Core Three.js Game Engine
 * Handles scene initialization, rendering, and core game loop
 */
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.renderCallbacks = [];
        this.updateCallbacks = [];
        
        // Camera shake system
        this.cameraShakeIntensity = 0;
        this.cameraShakeDecay = 0.95;
        this.baseCameraPosition = new THREE.Vector3(0, 3, 8);
        
        // Performance monitoring
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
    }

    /**
     * Initialize the Three.js scene, camera, and renderer
     */
    async init() {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87CEEB);
            
            // Add fog for depth
            this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            this.camera.position.copy(this.baseCameraPosition);
            this.camera.lookAt(0, 0, 0);
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Add renderer to DOM
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(this.renderer.domElement);
                this.renderer.domElement.id = 'gameCanvas';
            }
            
            // Setup lighting
            this.setupLighting();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('✅ GameEngine initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ GameEngine initialization failed:', error);
            return false;
        }
    }

    /**
     * Setup basic lighting for the scene
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for dynamic lighting
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
        pointLight.position.set(0, 10, 10);
        this.scene.add(pointLight);
    }

    /**
     * Start the game loop
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            console.log('🚀 GameEngine started');
        }
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        console.log('⏹️ GameEngine stopped');
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;

        const deltaTime = this.clock.getDelta();
        const currentTime = performance.now();

        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }

        // Update all registered update callbacks
        this.updateCallbacks.forEach(callback => {
            try {
                callback(deltaTime, currentTime);
            } catch (error) {
                console.error('Update callback error:', error);
            }
        });

        // Apply camera shake
        this.updateCameraShake();

        // Render the scene
        this.renderer.render(this.scene, this.camera);

        // Execute render callbacks
        this.renderCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Render callback error:', error);
            }
        });

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update camera shake effect
     */
    updateCameraShake() {
        if (this.cameraShakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
            const shakeZ = (Math.random() - 0.5) * this.cameraShakeIntensity;
            
            this.camera.position.x = this.baseCameraPosition.x + shakeX;
            this.camera.position.y = this.baseCameraPosition.y + shakeY;
            this.camera.position.z = this.baseCameraPosition.z + shakeZ;
            
            this.cameraShakeIntensity *= this.cameraShakeDecay;
            
            if (this.cameraShakeIntensity < 0.001) {
                this.cameraShakeIntensity = 0;
                this.camera.position.copy(this.baseCameraPosition);
            }
        }
    }

    /**
     * Trigger camera shake effect
     */
    shakeCamera(intensity = 0.3) {
        this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, intensity);
    }

    /**
     * Register a callback to be called during the update phase
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    /**
     * Register a callback to be called during the render phase
     */
    onRender(callback) {
        this.renderCallbacks.push(callback);
    }

    /**
     * Remove an update callback
     */
    removeUpdateCallback(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index > -1) {
            this.updateCallbacks.splice(index, 1);
        }
    }

    /**
     * Remove a render callback
     */
    removeRenderCallback(callback) {
        const index = this.renderCallbacks.indexOf(callback);
        if (index > -1) {
            this.renderCallbacks.splice(index, 1);
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Add object to scene
     */
    addToScene(object) {
        if (this.scene) {
            this.scene.add(object);
        }
    }

    /**
     * Remove object from scene
     */
    removeFromScene(object) {
        if (this.scene) {
            this.scene.remove(object);
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Get scene reference
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get camera reference
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get renderer reference
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        
        console.log('🗑️ GameEngine disposed');
    }
}

// Make class available globally
window.GameEngine = GameEngine;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}