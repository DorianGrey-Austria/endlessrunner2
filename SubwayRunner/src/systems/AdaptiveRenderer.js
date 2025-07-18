/**
 * AdaptiveRenderer - Handles adaptive rendering based on device capabilities
 */
class AdaptiveRenderer {
    constructor(gameEngine, deviceDetector) {
        this.gameEngine = gameEngine;
        this.deviceDetector = deviceDetector;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Performance monitoring
        this.performanceMonitor = {
            frameCount: 0,
            lastFPSUpdate: 0,
            currentFPS: 60,
            targetFPS: 60,
            frameDropCount: 0,
            qualityAdjustments: 0
        };
        
        // Quality settings
        this.qualitySettings = null;
        this.currentQuality = 'medium';
        
        // Adaptive features
        this.adaptiveQualityEnabled = true;
        this.lastQualityAdjustment = 0;
        this.qualityAdjustmentCooldown = 2000; // 2 seconds
        
        // Render settings
        this.renderSettings = {
            shadowMapSize: 1024,
            pixelRatio: 1,
            antialiasing: true,
            shadowsEnabled: true,
            postProcessing: false,
            lodEnabled: true,
            cullingEnabled: true
        };
    }

    /**
     * Initialize adaptive renderer
     */
    init() {
        this.renderer = this.gameEngine.getRenderer();
        this.scene = this.gameEngine.getScene();
        this.camera = this.gameEngine.getCamera();
        
        // Get device-specific settings
        this.qualitySettings = this.deviceDetector.getQualitySettings();
        this.currentQuality = this.deviceDetector.qualityLevel;
        
        // Apply initial quality settings
        this.applyQualitySettings();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        console.log('🎮 AdaptiveRenderer initialized:', {
            quality: this.currentQuality,
            settings: this.qualitySettings
        });
    }

    /**
     * Apply quality settings to renderer
     */
    applyQualitySettings() {
        const settings = this.qualitySettings;
        
        // Renderer settings
        this.renderer.setPixelRatio(settings.pixelRatio);
        this.renderer.shadowMap.enabled = settings.shadowsEnabled;
        this.renderer.shadowMap.type = settings.shadowsEnabled ? 
            THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
        
        // Shadow map size
        if (settings.shadowsEnabled) {
            this.renderSettings.shadowMapSize = settings.shadowMapSize;
            this.updateShadowMapSize();
        }
        
        // Antialiasing
        this.renderSettings.antialiasing = settings.antialiasing;
        
        // Store settings for runtime adjustments
        this.renderSettings = {
            ...this.renderSettings,
            ...settings
        };
        
        // Apply fog settings
        if (this.scene.fog) {
            this.scene.fog.density = settings.fogEnabled ? 0.02 : 0;
        }
        
        console.log('🎨 Quality settings applied:', this.currentQuality);
    }

    /**
     * Update shadow map size for all lights
     */
    updateShadowMapSize() {
        this.scene.traverse((child) => {
            if (child.isLight && child.shadow) {
                child.shadow.mapSize.width = this.renderSettings.shadowMapSize;
                child.shadow.mapSize.height = this.renderSettings.shadowMapSize;
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        const monitoring = this.deviceDetector.getPerformanceMonitoring();
        
        this.performanceMonitor.targetFPS = monitoring.fpsTarget;
        this.adaptiveQualityEnabled = monitoring.qualityAdjustment;
        
        // Start performance monitoring loop
        this.startPerformanceMonitoring();
    }

    /**
     * Start performance monitoring loop
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
            
            if (this.adaptiveQualityEnabled) {
                this.checkQualityAdjustment();
            }
        }, 1000);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.performanceMonitor.lastFPSUpdate;
        
        if (deltaTime >= 1000) {
            this.performanceMonitor.currentFPS = Math.round(
                (this.performanceMonitor.frameCount * 1000) / deltaTime
            );
            
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastFPSUpdate = currentTime;
            
            // Check for frame drops
            if (this.performanceMonitor.currentFPS < this.performanceMonitor.targetFPS * 0.8) {
                this.performanceMonitor.frameDropCount++;
            } else {
                this.performanceMonitor.frameDropCount = 0;
            }
        }
        
        this.performanceMonitor.frameCount++;
    }

    /**
     * Check if quality adjustment is needed
     */
    checkQualityAdjustment() {
        const currentTime = performance.now();
        
        // Cooldown check
        if (currentTime - this.lastQualityAdjustment < this.qualityAdjustmentCooldown) {
            return;
        }
        
        const currentFPS = this.performanceMonitor.currentFPS;
        const targetFPS = this.performanceMonitor.targetFPS;
        const frameDrops = this.performanceMonitor.frameDropCount;
        
        // Reduce quality if performance is poor
        if (frameDrops > 3 && currentFPS < targetFPS * 0.7) {
            this.reduceQuality();
        }
        // Increase quality if performance is good
        else if (frameDrops === 0 && currentFPS > targetFPS * 0.95) {
            this.increaseQuality();
        }
    }

    /**
     * Reduce rendering quality
     */
    reduceQuality() {
        console.log('📉 Reducing quality due to performance issues');
        
        // Reduce pixel ratio
        if (this.renderSettings.pixelRatio > 1) {
            this.renderSettings.pixelRatio = Math.max(1, this.renderSettings.pixelRatio - 0.25);
            this.renderer.setPixelRatio(this.renderSettings.pixelRatio);
        }
        
        // Disable shadows
        else if (this.renderSettings.shadowsEnabled) {
            this.renderSettings.shadowsEnabled = false;
            this.renderer.shadowMap.enabled = false;
        }
        
        // Reduce shadow map size
        else if (this.renderSettings.shadowMapSize > 512) {
            this.renderSettings.shadowMapSize = Math.max(512, this.renderSettings.shadowMapSize / 2);
            this.updateShadowMapSize();
        }
        
        // Disable fog
        else if (this.scene.fog && this.scene.fog.density > 0) {
            this.scene.fog.density = 0;
        }
        
        this.performanceMonitor.qualityAdjustments++;
        this.lastQualityAdjustment = performance.now();
    }

    /**
     * Increase rendering quality
     */
    increaseQuality() {
        // Only increase if we haven't made recent adjustments
        if (this.performanceMonitor.qualityAdjustments > 0) {
            return;
        }
        
        console.log('📈 Increasing quality due to good performance');
        
        const originalSettings = this.qualitySettings;
        
        // Increase pixel ratio
        if (this.renderSettings.pixelRatio < originalSettings.pixelRatio) {
            this.renderSettings.pixelRatio = Math.min(originalSettings.pixelRatio, 
                this.renderSettings.pixelRatio + 0.25);
            this.renderer.setPixelRatio(this.renderSettings.pixelRatio);
        }
        
        // Enable shadows
        else if (!this.renderSettings.shadowsEnabled && originalSettings.shadowsEnabled) {
            this.renderSettings.shadowsEnabled = true;
            this.renderer.shadowMap.enabled = true;
        }
        
        // Increase shadow map size
        else if (this.renderSettings.shadowMapSize < originalSettings.shadowMapSize) {
            this.renderSettings.shadowMapSize = Math.min(originalSettings.shadowMapSize,
                this.renderSettings.shadowMapSize * 2);
            this.updateShadowMapSize();
        }
        
        // Enable fog
        else if (this.scene.fog && this.scene.fog.density === 0 && originalSettings.fogEnabled) {
            this.scene.fog.density = 0.02;
        }
        
        this.lastQualityAdjustment = performance.now();
    }

    /**
     * Force quality level
     */
    setQuality(qualityLevel) {
        this.currentQuality = qualityLevel;
        
        // Get new settings
        const qualitySettings = {
            high: {
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                shadowMapSize: 2048,
                shadowsEnabled: true,
                antialiasing: true,
                fogEnabled: true,
                postProcessing: true
            },
            medium: {
                pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
                shadowMapSize: 1024,
                shadowsEnabled: true,
                antialiasing: true,
                fogEnabled: true,
                postProcessing: false
            },
            low: {
                pixelRatio: 1,
                shadowMapSize: 512,
                shadowsEnabled: false,
                antialiasing: false,
                fogEnabled: false,
                postProcessing: false
            }
        };
        
        this.qualitySettings = qualitySettings[qualityLevel];
        this.applyQualitySettings();
        
        console.log('🎯 Quality manually set to:', qualityLevel);
    }

    /**
     * Get current performance stats
     */
    getPerformanceStats() {
        return {
            currentFPS: this.performanceMonitor.currentFPS,
            targetFPS: this.performanceMonitor.targetFPS,
            frameDrops: this.performanceMonitor.frameDropCount,
            qualityLevel: this.currentQuality,
            qualityAdjustments: this.performanceMonitor.qualityAdjustments,
            renderSettings: { ...this.renderSettings }
        };
    }

    /**
     * Enable/disable adaptive quality
     */
    setAdaptiveQuality(enabled) {
        this.adaptiveQualityEnabled = enabled;
        console.log('🔄 Adaptive quality:', enabled ? 'enabled' : 'disabled');
    }

    /**
     * Get render info for debugging
     */
    getRenderInfo() {
        return {
            renderer: {
                pixelRatio: this.renderer.getPixelRatio(),
                shadowMap: {
                    enabled: this.renderer.shadowMap.enabled,
                    type: this.renderer.shadowMap.type
                }
            },
            scene: {
                fog: this.scene.fog ? {
                    density: this.scene.fog.density,
                    near: this.scene.fog.near,
                    far: this.scene.fog.far
                } : null
            },
            performance: this.getPerformanceStats()
        };
    }

    /**
     * Dispose resources
     */
    dispose() {
        // Clean up performance monitoring
        this.performanceMonitor = null;
        
        console.log('🗑️ AdaptiveRenderer disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveRenderer;
}