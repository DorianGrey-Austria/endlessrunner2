/**
 * Professional Level Manager with error handling and progressive loading
 * 
 * @module LevelManagerPro
 */

class LevelManagerPro {
    constructor() {
        this.levels = new Map();
        this.currentLevel = null;
        this.previousLevel = null;
        this.isTransitioning = false;
        this.transitionCallbacks = [];
        
        // Loading state
        this.loadingState = {
            isLoading: false,
            progress: 0,
            currentAsset: '',
            errors: []
        };
        
        // Performance monitoring
        this.performance = {
            levelLoadTimes: new Map(),
            transitionTimes: new Map(),
            lastTransitionStart: 0
        };
        
        // Configuration
        this.config = {
            transitionDuration: 2000, // ms
            preloadNextLevel: true,
            maxRetries: 3,
            memoryWarningThreshold: 500 * 1024 * 1024, // 500MB
            fallbackLevel: 1
        };
        
        // Debug mode
        this.debugMode = false;
    }
    
    /**
     * Enable debug logging
     */
    enableDebug() {
        this.debugMode = true;
        if (window.ResourceManager) {
            window.ResourceManager.enableDebug();
        }
        console.log('[LevelManagerPro] Debug mode enabled');
    }
    
    /**
     * Register a level
     */
    registerLevel(level) {
        if (!(level instanceof LevelBase)) {
            console.error('[LevelManagerPro] Level must extend LevelBase');
            return false;
        }
        
        this.levels.set(level.id, level);
        console.log(`[LevelManagerPro] Registered level ${level.id}: ${level.name}`);
        return true;
    }
    
    /**
     * Initialize the manager
     */
    async initialize(scene, resourceManager) {
        console.log('[LevelManagerPro] Initializing...');
        
        this.scene = scene;
        this.resourceManager = resourceManager || window.ResourceManager;
        
        if (!this.resourceManager) {
            console.error('[LevelManagerPro] ResourceManager not found!');
            throw new Error('ResourceManager is required');
        }
        
        // Check if we have any levels registered
        if (this.levels.size === 0) {
            console.error('[LevelManagerPro] No levels registered!');
            throw new Error('No levels registered');
        }
        
        console.log(`[LevelManagerPro] Initialized with ${this.levels.size} levels`);
    }
    
    /**
     * Load a specific level
     */
    async loadLevel(levelId, skipTransition = false) {
        if (this.isTransitioning) {
            console.warn('[LevelManagerPro] Already transitioning, request ignored');
            return false;
        }
        
        const level = this.levels.get(levelId);
        if (!level) {
            console.error(`[LevelManagerPro] Level ${levelId} not found`);
            return false;
        }
        
        console.log(`[LevelManagerPro] Loading level ${levelId}: ${level.name}`);
        
        // Start performance timing
        const startTime = performance.now();
        this.performance.lastTransitionStart = startTime;
        
        try {
            this.isTransitioning = true;
            this.loadingState.isLoading = true;
            this.loadingState.errors = [];
            
            // Transition effect if not skipping
            if (!skipTransition && this.currentLevel) {
                await this.playTransition('out');
            }
            
            // Pause current level
            if (this.currentLevel) {
                this.currentLevel.pause();
                this.previousLevel = this.currentLevel;
            }
            
            // Initialize new level
            this.loadingState.currentAsset = 'Initializing level...';
            await this.initializeLevelWithRetry(level);
            
            // Dispose previous level after new one is ready
            if (this.previousLevel && this.previousLevel !== level) {
                this.loadingState.currentAsset = 'Cleaning up previous level...';
                await this.disposeLevelSafely(this.previousLevel);
            }
            
            // Set as current level
            this.currentLevel = level;
            
            // Transition effect
            if (!skipTransition) {
                await this.playTransition('in');
            }
            
            // Record performance
            const loadTime = performance.now() - startTime;
            this.performance.levelLoadTimes.set(levelId, loadTime);
            console.log(`[LevelManagerPro] Level ${levelId} loaded in ${loadTime.toFixed(0)}ms`);
            
            // Notify callbacks
            this.transitionCallbacks.forEach(cb => cb(levelId, level));
            
            // Check memory usage
            this.checkMemoryUsage();
            
            // Preload next level if configured
            if (this.config.preloadNextLevel) {
                this.preloadNextLevel(levelId);
            }
            
            return true;
            
        } catch (error) {
            console.error(`[LevelManagerPro] Failed to load level ${levelId}:`, error);
            this.loadingState.errors.push(error.message);
            
            // Try fallback level
            if (levelId !== this.config.fallbackLevel) {
                console.log(`[LevelManagerPro] Attempting fallback to level ${this.config.fallbackLevel}`);
                return await this.loadLevel(this.config.fallbackLevel, true);
            }
            
            return false;
            
        } finally {
            this.isTransitioning = false;
            this.loadingState.isLoading = false;
            this.loadingState.progress = 0;
        }
    }
    
    /**
     * Initialize level with retry logic
     */
    async initializeLevelWithRetry(level, retries = 0) {
        try {
            await level.init(this.scene, this.resourceManager);
            return true;
        } catch (error) {
            if (retries < this.config.maxRetries) {
                console.warn(`[LevelManagerPro] Retry ${retries + 1}/${this.config.maxRetries} for level ${level.id}`);
                await this.delay(1000); // Wait 1 second before retry
                return await this.initializeLevelWithRetry(level, retries + 1);
            }
            throw error;
        }
    }
    
    /**
     * Safely dispose a level
     */
    async disposeLevelSafely(level) {
        try {
            level.dispose(this.scene, this.resourceManager);
        } catch (error) {
            console.error(`[LevelManagerPro] Error disposing level ${level.id}:`, error);
            // Continue anyway - don't let disposal errors break the game
        }
    }
    
    /**
     * Play transition effect
     */
    async playTransition(direction) {
        return new Promise(resolve => {
            const duration = this.config.transitionDuration;
            const startTime = Date.now();
            
            const fadeOverlay = this.getFadeOverlay();
            fadeOverlay.style.display = 'block';
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                if (direction === 'out') {
                    fadeOverlay.style.opacity = progress;
                } else {
                    fadeOverlay.style.opacity = 1 - progress;
                }
                
                this.loadingState.progress = progress * 100;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (direction === 'in') {
                        fadeOverlay.style.display = 'none';
                    }
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    /**
     * Get or create fade overlay
     */
    getFadeOverlay() {
        let overlay = document.getElementById('levelTransitionOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'levelTransitionOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                opacity: 0;
                z-index: 1000;
                pointer-events: none;
                display: none;
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }
    
    /**
     * Update current level
     */
    update(deltaTime, gameState) {
        if (this.currentLevel && this.currentLevel.isActive) {
            this.currentLevel.update(deltaTime, gameState);
        }
    }
    
    /**
     * Get current level info
     */
    getCurrentLevelInfo() {
        if (!this.currentLevel) return null;
        
        return {
            id: this.currentLevel.id,
            name: this.currentLevel.name,
            config: this.currentLevel.config,
            stats: this.currentLevel.getStats()
        };
    }
    
    /**
     * Get all registered levels
     */
    getAllLevels() {
        return Array.from(this.levels.values()).map(level => ({
            id: level.id,
            name: level.name,
            isLoaded: level === this.currentLevel
        }));
    }
    
    /**
     * Register transition callback
     */
    onLevelTransition(callback) {
        this.transitionCallbacks.push(callback);
    }
    
    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if (!this.resourceManager) return;
        
        const usage = this.resourceManager.estimateMemoryUsage();
        const report = this.resourceManager.getResourceReport();
        
        if (this.debugMode) {
            console.log('[LevelManagerPro] Memory usage:', usage.formatted);
            console.log('[LevelManagerPro] Resource report:', report);
        }
        
        // Warn if memory usage is high
        if (usage.bytes > this.config.memoryWarningThreshold) {
            console.warn(`[LevelManagerPro] High memory usage: ${usage.formatted}`);
            
            // Force garbage collection if available
            if (window.gc) {
                console.log('[LevelManagerPro] Forcing garbage collection...');
                window.gc();
            }
        }
    }
    
    /**
     * Preload next level (background loading)
     */
    async preloadNextLevel(currentLevelId) {
        const nextLevelId = currentLevelId + 1;
        const nextLevel = this.levels.get(nextLevelId);
        
        if (!nextLevel || nextLevel.isInitialized) return;
        
        if (this.debugMode) {
            console.log(`[LevelManagerPro] Preloading level ${nextLevelId} in background`);
        }
        
        // This is a simplified preload - you could extend this to load assets
        // without actually initializing the level in the scene
    }
    
    /**
     * Get loading progress
     */
    getLoadingProgress() {
        return {
            isLoading: this.loadingState.isLoading,
            progress: this.loadingState.progress,
            currentAsset: this.loadingState.currentAsset,
            errors: [...this.loadingState.errors]
        };
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const stats = {
            averageLoadTime: 0,
            slowestLevel: null,
            fastestLevel: null,
            totalTransitions: this.performance.levelLoadTimes.size
        };
        
        if (stats.totalTransitions > 0) {
            let total = 0;
            let slowest = 0;
            let fastest = Infinity;
            
            this.performance.levelLoadTimes.forEach((time, levelId) => {
                total += time;
                if (time > slowest) {
                    slowest = time;
                    stats.slowestLevel = { id: levelId, time };
                }
                if (time < fastest) {
                    fastest = time;
                    stats.fastestLevel = { id: levelId, time };
                }
            });
            
            stats.averageLoadTime = total / stats.totalTransitions;
        }
        
        return stats;
    }
    
    /**
     * Reset manager state
     */
    reset() {
        // Dispose current level
        if (this.currentLevel) {
            this.disposeLevelSafely(this.currentLevel);
        }
        
        // Clear state
        this.currentLevel = null;
        this.previousLevel = null;
        this.isTransitioning = false;
        this.loadingState.errors = [];
        
        // Clear performance data
        this.performance.levelLoadTimes.clear();
        this.performance.transitionTimes.clear();
        
        console.log('[LevelManagerPro] Manager reset');
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export as singleton
const levelManagerPro = new LevelManagerPro();
window.LevelManagerPro = levelManagerPro;

console.log('[LevelManagerPro] Professional level manager loaded');