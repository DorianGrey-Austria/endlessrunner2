/**
 * Base Level Class with lifecycle management
 * All levels should extend this class
 * 
 * @module LevelBase
 */

class LevelBase {
    constructor(id, name, config) {
        this.id = id;
        this.name = name;
        this.config = {
            // Visual settings
            fogColor: '#87CEEB',
            fogDensity: 0.02,
            skyColor: '#87CEEB',
            ambientIntensity: 0.6,
            sunIntensity: 0.8,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.0,
            obstacleSpawnMultiplier: 1.0,
            collectibleSpawnMultiplier: 1.0,
            
            // Level-specific features
            hasSpecialMechanics: false,
            specialMechanics: [],
            
            // Override with level-specific config
            ...config
        };
        
        // Level state
        this.isInitialized = false;
        this.isActive = false;
        this.resources = new Set();
        this.updateCallbacks = [];
        this.animationFrames = new Set();
        
        // Environment objects
        this.environmentGroup = null;
        this.dynamicObjects = [];
        this.particles = [];
        this.lights = [];
        
        // Performance
        this.lastUpdateTime = 0;
        this.frameCount = 0;
    }
    
    /**
     * Initialize the level
     * @param {THREE.Scene} scene - The main game scene
     * @param {ResourceManager} resourceManager - Resource tracking
     */
    async init(scene, resourceManager) {
        console.log(`[Level ${this.id}] Initializing ${this.name}...`);
        
        try {
            // Create environment group
            this.environmentGroup = new THREE.Group();
            this.environmentGroup.name = `Level${this.id}_Environment`;
            
            // Track with resource manager
            resourceManager.trackGroup(this.environmentGroup, `level_${this.id}`);
            
            // Apply visual settings
            this.applyVisualSettings(scene);
            
            // Create level-specific environment
            await this.createEnvironment(scene, resourceManager);
            
            // Initialize special mechanics if any
            if (this.config.hasSpecialMechanics) {
                this.initializeSpecialMechanics(scene, resourceManager);
            }
            
            // Add to scene
            scene.add(this.environmentGroup);
            
            this.isInitialized = true;
            this.isActive = true;
            
            console.log(`[Level ${this.id}] Initialization complete`);
            
        } catch (error) {
            console.error(`[Level ${this.id}] Initialization failed:`, error);
            throw error;
        }
    }
    
    /**
     * Apply visual settings to the scene
     */
    applyVisualSettings(scene) {
        const config = this.config;
        
        // Update fog
        if (scene.fog) {
            scene.fog.color.set(config.fogColor);
            scene.fog.density = config.fogDensity;
        }
        
        // Update ambient light
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.intensity = config.ambientIntensity;
        }
        
        // Update directional light
        const directionalLight = scene.children.find(child => child.type === 'DirectionalLight');
        if (directionalLight) {
            directionalLight.intensity = config.sunIntensity;
        }
        
        // Store original renderer clear color for restoration
        if (window.renderer) {
            this._originalClearColor = window.renderer.getClearColor(new THREE.Color());
            window.renderer.setClearColor(config.skyColor);
        }
    }
    
    /**
     * Create environment - Override in child classes
     */
    async createEnvironment(scene, resourceManager) {
        // This method should be overridden by child classes
        console.warn(`[Level ${this.id}] createEnvironment not implemented`);
    }
    
    /**
     * Initialize special mechanics - Override if needed
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Override in child classes that have special mechanics
    }
    
    /**
     * Update the level
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        if (!this.isActive) return;
        
        this.frameCount++;
        
        // Update dynamic objects
        this.updateDynamicObjects(deltaTime, gameState);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update special mechanics
        if (this.config.hasSpecialMechanics) {
            this.updateSpecialMechanics(deltaTime, gameState);
        }
        
        // Call registered update callbacks
        this.updateCallbacks.forEach(callback => callback(deltaTime, gameState));
    }
    
    /**
     * Update dynamic objects - Override in child classes
     */
    updateDynamicObjects(deltaTime, gameState) {
        // Default rotation for floating objects
        this.dynamicObjects.forEach(obj => {
            if (obj.userData.rotationSpeed) {
                obj.rotation.y += obj.userData.rotationSpeed * deltaTime;
            }
            if (obj.userData.floatSpeed) {
                obj.position.y = obj.userData.baseY + 
                    Math.sin(Date.now() * 0.001 * obj.userData.floatSpeed) * obj.userData.floatAmplitude;
            }
        });
    }
    
    /**
     * Update particles
     */
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            if (!particle.userData.update) return false;
            
            const alive = particle.userData.update(particle, deltaTime);
            if (!alive && particle.parent) {
                particle.parent.remove(particle);
                if (particle.geometry) particle.geometry.dispose();
                if (particle.material) particle.material.dispose();
            }
            return alive;
        });
    }
    
    /**
     * Update special mechanics - Override if needed
     */
    updateSpecialMechanics(deltaTime, gameState) {
        // Override in child classes
    }
    
    /**
     * Add a dynamic object to the level
     */
    addDynamicObject(object, config = {}) {
        object.userData = {
            ...object.userData,
            ...config
        };
        this.dynamicObjects.push(object);
        this.environmentGroup.add(object);
    }
    
    /**
     * Create a particle effect
     */
    createParticle(position, config = {}) {
        const defaultConfig = {
            size: 0.1,
            color: 0xFFFFFF,
            lifetime: 1.0,
            velocity: new THREE.Vector3(0, 1, 0),
            gravity: 0,
            fadeOut: true
        };
        
        const particleConfig = { ...defaultConfig, ...config };
        
        const geometry = new THREE.SphereGeometry(particleConfig.size);
        const material = new THREE.MeshBasicMaterial({ 
            color: particleConfig.color,
            transparent: particleConfig.fadeOut,
            opacity: 1.0
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        
        particle.userData = {
            velocity: particleConfig.velocity.clone(),
            lifetime: particleConfig.lifetime,
            maxLifetime: particleConfig.lifetime,
            gravity: particleConfig.gravity,
            fadeOut: particleConfig.fadeOut,
            update: (p, dt) => {
                // Update position
                p.position.add(p.userData.velocity.clone().multiplyScalar(dt));
                
                // Apply gravity
                if (p.userData.gravity) {
                    p.userData.velocity.y -= p.userData.gravity * dt;
                }
                
                // Update lifetime
                p.userData.lifetime -= dt;
                
                // Fade out
                if (p.userData.fadeOut && p.material.opacity !== undefined) {
                    p.material.opacity = Math.max(0, p.userData.lifetime / p.userData.maxLifetime);
                }
                
                return p.userData.lifetime > 0;
            }
        };
        
        this.particles.push(particle);
        this.environmentGroup.add(particle);
        
        return particle;
    }
    
    /**
     * Register an update callback
     */
    registerUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
    }
    
    /**
     * Pause the level
     */
    pause() {
        this.isActive = false;
        console.log(`[Level ${this.id}] Paused`);
    }
    
    /**
     * Resume the level
     */
    resume() {
        this.isActive = true;
        console.log(`[Level ${this.id}] Resumed`);
    }
    
    /**
     * Get level statistics
     */
    getStats() {
        return {
            id: this.id,
            name: this.name,
            isActive: this.isActive,
            dynamicObjectCount: this.dynamicObjects.length,
            particleCount: this.particles.length,
            frameCount: this.frameCount,
            memoryEstimate: this.environmentGroup ? this.environmentGroup.children.length * 1024 : 0
        };
    }
    
    /**
     * Cleanup and dispose the level
     */
    dispose(scene, resourceManager) {
        console.log(`[Level ${this.id}] Starting disposal...`);
        
        this.isActive = false;
        
        // Clear update callbacks
        this.updateCallbacks = [];
        
        // Clear animation frames
        this.animationFrames.forEach(id => cancelAnimationFrame(id));
        this.animationFrames.clear();
        
        // Remove particles
        this.particles.forEach(particle => {
            if (particle.parent) particle.parent.remove(particle);
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
        });
        this.particles = [];
        
        // Clear dynamic objects
        this.dynamicObjects = [];
        
        // Remove environment group from scene
        if (this.environmentGroup && scene) {
            scene.remove(this.environmentGroup);
        }
        
        // Dispose level-specific resources through ResourceManager
        if (resourceManager) {
            resourceManager.disposeLevelResources(`level_${this.id}`);
        }
        
        // Restore original clear color
        if (window.renderer && this._originalClearColor) {
            window.renderer.setClearColor(this._originalClearColor);
        }
        
        // Call level-specific cleanup
        this.onDispose();
        
        this.environmentGroup = null;
        this.isInitialized = false;
        
        console.log(`[Level ${this.id}] Disposal complete`);
    }
    
    /**
     * Level-specific cleanup - Override in child classes
     */
    onDispose() {
        // Override in child classes for level-specific cleanup
    }
    
    /**
     * Create a simple building (helper method)
     */
    createBuilding(width, height, depth, color, position) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ color });
        const building = new THREE.Mesh(geometry, material);
        
        building.position.copy(position);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        return building;
    }
    
    /**
     * Create animated neon light (helper method)
     */
    createNeonLight(geometry, color, intensity = 1) {
        const material = new THREE.MeshBasicMaterial({
            color,
            emissive: color,
            emissiveIntensity: intensity,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add glow animation
        this.registerUpdateCallback((dt) => {
            if (material.opacity) {
                material.opacity = 0.6 + Math.sin(Date.now() * 0.003) * 0.2;
                material.emissiveIntensity = intensity + Math.sin(Date.now() * 0.002) * 0.3;
            }
        });
        
        return mesh;
    }
}

// Export for use
window.LevelBase = LevelBase;

console.log('[LevelBase] Base level class loaded');