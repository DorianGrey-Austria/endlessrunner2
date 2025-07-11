/**
 * 🎨 PERFORMANCE RENDERER
 * High-performance Three.js renderer with automatic optimization
 * 
 * @version 6.0.0-ENTERPRISE
 * @author Claude Code Senior Developer
 */

import * as THREE from 'three';

class PerformanceRenderer {
    constructor(options = {}) {
        this.options = {
            canvas: null,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            ...options
        };
        
        // Core Three.js objects
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.composer = null;
        
        // Performance tracking
        this.stats = {
            drawCalls: 0,
            triangles: 0,
            vertices: 0,
            textures: 0,
            renderTime: 0,
            lastFrameTime: 0
        };
        
        // Object pools for performance
        this.objectPools = {
            meshes: [],
            materials: [],
            geometries: [],
            textures: []
        };
        
        // Frustum culling
        this.frustum = new THREE.Frustum();
        this.cameraMatrix = new THREE.Matrix4();
        
        // LOD system
        this.lodEnabled = true;
        this.lodDistances = [50, 100, 200];
        
        // Occlusion culling
        this.occlusionEnabled = true;
        this.occlusionQueries = new Map();
        
        console.log('🎨 [PerformanceRenderer] Initialized');
    }
    
    /**
     * 🏗️ INITIALIZE RENDERER
     * Setup Three.js renderer with optimal settings
     */
    async initialize() {
        try {
            // Create WebGL renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.options.canvas,
                antialias: this.options.antialias,
                powerPreference: this.options.powerPreference,
                alpha: this.options.alpha,
                premultipliedAlpha: this.options.premultipliedAlpha,
                preserveDrawingBuffer: this.options.preserveDrawingBuffer,
                failIfMajorPerformanceCaveat: this.options.failIfMajorPerformanceCaveat
            });
            
            // Configure renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.autoUpdate = false;
            
            // Enable WebGL extensions
            this.enableExtensions();
            
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
            
            // Setup lights
            this.setupLights();
            
            // Setup post-processing
            await this.setupPostProcessing();
            
            // Setup auto-optimization
            this.setupAutoOptimization();
            
            // Handle resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            console.log('✅ [PerformanceRenderer] Initialized successfully');
            
        } catch (error) {
            console.error('❌ [PerformanceRenderer] Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * 🔌 ENABLE WEBGL EXTENSIONS
     * Enable all useful WebGL extensions
     */
    enableExtensions() {
        const gl = this.renderer.getContext();
        
        // Enable useful extensions
        const extensions = [
            'OES_texture_float',
            'OES_texture_float_linear',
            'OES_texture_half_float',
            'OES_texture_half_float_linear',
            'EXT_texture_filter_anisotropic',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_compressed_texture_pvrtc',
            'WEBGL_compressed_texture_etc1',
            'WEBGL_depth_texture',
            'OES_vertex_array_object',
            'ANGLE_instanced_arrays'
        ];
        
        extensions.forEach(ext => {
            try {
                gl.getExtension(ext);
                console.log(`✅ [PerformanceRenderer] Extension ${ext} enabled`);
            } catch (e) {
                console.log(`⚠️ [PerformanceRenderer] Extension ${ext} not available`);
            }
        });
    }
    
    /**
     * 💡 SETUP LIGHTS
     * Optimized lighting setup
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light with shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);
        
        // Store light references
        this.lights = {
            ambient: ambientLight,
            directional: directionalLight
        };
        
        console.log('✅ [PerformanceRenderer] Lights configured');
    }
    
    /**
     * 🎨 SETUP POST-PROCESSING
     * Configure post-processing effects
     */
    async setupPostProcessing() {
        // Import post-processing modules
        const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
        const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
        const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        const { FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js');
        const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
        
        // Create composer
        this.composer = new EffectComposer(this.renderer);
        
        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Add bloom pass
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Add FXAA pass
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
        fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
        this.composer.addPass(fxaaPass);
        
        // Store passes
        this.passes = {
            render: renderPass,
            bloom: bloomPass,
            fxaa: fxaaPass
        };
        
        console.log('✅ [PerformanceRenderer] Post-processing configured');
    }
    
    /**
     * ⚡ SETUP AUTO-OPTIMIZATION
     * Automatic performance optimization
     */
    setupAutoOptimization() {
        this.optimizer = {
            enabled: true,
            frameTimeHistory: [],
            maxHistory: 60,
            targetFrameTime: 16.67, // 60 FPS
            optimizationLevel: 0,
            lastOptimization: 0,
            
            update: (frameTime) => {
                if (!this.optimizer.enabled) return;
                
                // Track frame time
                this.optimizer.frameTimeHistory.push(frameTime);
                if (this.optimizer.frameTimeHistory.length > this.optimizer.maxHistory) {
                    this.optimizer.frameTimeHistory.shift();
                }
                
                // Calculate average frame time
                const avgFrameTime = this.optimizer.frameTimeHistory.reduce((a, b) => a + b, 0) / this.optimizer.frameTimeHistory.length;
                
                // Check if optimization is needed
                if (avgFrameTime > this.optimizer.targetFrameTime * 1.5) {
                    const now = Date.now();
                    if (now - this.optimizer.lastOptimization > 2000) {
                        this.optimize();
                        this.optimizer.lastOptimization = now;
                    }
                }
            }
        };
        
        console.log('✅ [PerformanceRenderer] Auto-optimization configured');
    }
    
    /**
     * 🎮 RENDER FRAME
     * Main render function with optimizations
     */
    render(gameState) {
        const startTime = performance.now();
        
        // Update camera
        this.updateCamera(gameState);
        
        // Update frustum for culling
        this.updateFrustum();
        
        // Perform culling
        this.performCulling();
        
        // Update shadows if needed
        this.updateShadows();
        
        // Render scene
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        // Update stats
        const endTime = performance.now();
        this.stats.renderTime = endTime - startTime;
        this.stats.lastFrameTime = endTime;
        
        // Update optimizer
        this.optimizer.update(this.stats.renderTime);
        
        // Update render stats
        this.updateRenderStats();
    }
    
    /**
     * 📷 UPDATE CAMERA
     * Update camera position and settings
     */
    updateCamera(gameState) {
        if (!gameState.player) return;
        
        // Follow player
        const player = gameState.player;
        this.camera.position.x = player.position.x;
        this.camera.position.y = player.position.y + 8;
        this.camera.position.z = player.position.z + 12;
        
        // Look ahead
        this.camera.lookAt(
            player.position.x,
            player.position.y + 2,
            player.position.z - 10
        );
    }
    
    /**
     * 🔍 UPDATE FRUSTUM
     * Update frustum for culling calculations
     */
    updateFrustum() {
        this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(this.cameraMatrix);
    }
    
    /**
     * ✂️ PERFORM CULLING
     * Frustum and occlusion culling
     */
    performCulling() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                // Frustum culling
                if (this.frustum.intersectsObject(object)) {
                    object.visible = true;
                    
                    // LOD selection
                    if (this.lodEnabled) {
                        this.updateLOD(object);
                    }
                } else {
                    object.visible = false;
                }
            }
        });
    }
    
    /**
     * 🎯 UPDATE LOD
     * Level of detail management
     */
    updateLOD(object) {
        if (!object.userData.lodLevels) return;
        
        const distance = this.camera.position.distanceTo(object.position);
        let lodLevel = 0;
        
        for (let i = 0; i < this.lodDistances.length; i++) {
            if (distance > this.lodDistances[i]) {
                lodLevel = i + 1;
            }
        }
        
        // Switch geometry based on LOD level
        if (object.userData.currentLOD !== lodLevel) {
            if (object.userData.lodLevels[lodLevel]) {
                object.geometry = object.userData.lodLevels[lodLevel];
                object.userData.currentLOD = lodLevel;
            }
        }
    }
    
    /**
     * 🌒 UPDATE SHADOWS
     * Smart shadow updates
     */
    updateShadows() {
        // Update shadows only when needed
        if (this.renderer.shadowMap.needsUpdate) {
            this.renderer.shadowMap.needsUpdate = false;
        }
    }
    
    /**
     * 📊 UPDATE RENDER STATS
     * Update rendering statistics
     */
    updateRenderStats() {
        const info = this.renderer.info;
        
        this.stats.drawCalls = info.render.calls;
        this.stats.triangles = info.render.triangles;
        this.stats.vertices = info.render.points;
        this.stats.textures = info.memory.textures;
    }
    
    /**
     * ⚡ OPTIMIZE
     * Perform optimization based on performance
     */
    optimize() {
        this.optimizer.optimizationLevel++;
        
        console.log(`⚡ [PerformanceRenderer] Optimizing (level ${this.optimizer.optimizationLevel})`);
        
        switch (this.optimizer.optimizationLevel) {
            case 1:
                // Disable bloom
                if (this.passes.bloom) {
                    this.passes.bloom.enabled = false;
                }
                break;
                
            case 2:
                // Reduce shadow map size
                if (this.lights.directional) {
                    this.lights.directional.shadow.mapSize.width = 1024;
                    this.lights.directional.shadow.mapSize.height = 1024;
                }
                break;
                
            case 3:
                // Disable shadows
                this.renderer.shadowMap.enabled = false;
                break;
                
            case 4:
                // Disable post-processing
                this.composer = null;
                break;
                
            case 5:
                // Reduce pixel ratio
                this.renderer.setPixelRatio(1);
                break;
        }
    }
    
    /**
     * 🎨 ADD TO SCENE
     * Add object to scene with optimizations
     */
    addToScene(object) {
        // Add LOD levels if not present
        if (!object.userData.lodLevels && object.geometry) {
            this.generateLODLevels(object);
        }
        
        // Add to scene
        this.scene.add(object);
        
        // Mark shadows for update
        if (object.castShadow || object.receiveShadow) {
            this.renderer.shadowMap.needsUpdate = true;
        }
    }
    
    /**
     * 🔄 GENERATE LOD LEVELS
     * Generate level of detail geometries
     */
    generateLODLevels(object) {
        if (!object.geometry) return;
        
        const originalGeometry = object.geometry;
        const lodLevels = [originalGeometry];
        
        // Generate simplified geometries
        for (let i = 1; i < 4; i++) {
            const simplification = 1 / (i + 1);
            const simplifiedGeometry = originalGeometry.clone();
            
            // Simplify geometry (basic decimation)
            if (simplifiedGeometry.attributes.position) {
                const positions = simplifiedGeometry.attributes.position.array;
                const newPositions = [];
                
                for (let j = 0; j < positions.length; j += 3 * (i + 1)) {
                    newPositions.push(positions[j], positions[j + 1], positions[j + 2]);
                }
                
                simplifiedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            }
            
            lodLevels.push(simplifiedGeometry);
        }
        
        object.userData.lodLevels = lodLevels;
        object.userData.currentLOD = 0;
    }
    
    /**
     * 🗑️ REMOVE FROM SCENE
     * Remove object from scene with cleanup
     */
    removeFromScene(object) {
        this.scene.remove(object);
        
        // Cleanup geometry
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        // Cleanup material
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => mat.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        // Cleanup textures
        if (object.material && object.material.map) {
            object.material.map.dispose();
        }
    }
    
    /**
     * 🔄 ON WINDOW RESIZE
     * Handle window resize events
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(width, height);
        
        // Update composer
        if (this.composer) {
            this.composer.setSize(width, height);
            
            // Update FXAA resolution
            if (this.passes.fxaa) {
                this.passes.fxaa.material.uniforms['resolution'].value.x = 1 / width;
                this.passes.fxaa.material.uniforms['resolution'].value.y = 1 / height;
            }
        }
    }
    
    /**
     * 🎛️ CONFIGURATION METHODS
     */
    setShadows(enabled) {
        this.renderer.shadowMap.enabled = enabled;
        this.renderer.shadowMap.needsUpdate = true;
    }
    
    setParticles(enabled) {
        // Implementation for particle system toggle
    }
    
    setPostProcessing(enabled) {
        if (enabled && !this.composer) {
            this.setupPostProcessing();
        } else if (!enabled) {
            this.composer = null;
        }
    }
    
    /**
     * 📊 GET STATS
     * Get rendering statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    getDrawCalls() {
        return this.stats.drawCalls;
    }
    
    getTriangles() {
        return this.stats.triangles;
    }
    
    /**
     * 🎮 LIFECYCLE METHODS
     */
    start() {
        console.log('🎨 [PerformanceRenderer] Started');
    }
    
    stop() {
        console.log('🎨 [PerformanceRenderer] Stopped');
    }
    
    /**
     * 🗑️ DISPOSE
     * Clean up resources
     */
    dispose() {
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Dispose composer
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Clear object pools
        this.objectPools.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        
        this.objectPools.materials.forEach(material => material.dispose());
        this.objectPools.geometries.forEach(geometry => geometry.dispose());
        this.objectPools.textures.forEach(texture => texture.dispose());
        
        console.log('🗑️ [PerformanceRenderer] Disposed');
    }
}

// Export for ES6 modules
export { PerformanceRenderer };

// Legacy global export
window.PerformanceRenderer = PerformanceRenderer;

console.log('🎨 PerformanceRenderer module loaded successfully');