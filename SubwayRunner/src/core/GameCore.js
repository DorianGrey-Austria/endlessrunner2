/**
 * 🎮 GAME CORE - Main Game Engine
 * Enterprise-grade game core with performance optimization
 * 
 * @version 6.0.0-ENTERPRISE
 * @author Claude Code Senior Developer
 */

class GameCore {
    constructor() {
        this.version = '6.0.0-ENTERPRISE';
        this.isInitialized = false;
        this.isRunning = false;
        this.isPaused = false;
        
        // Core systems
        this.renderer = null;
        this.physics = null;
        this.audio = null;
        this.input = null;
        this.ui = null;
        this.levels = null;
        this.psychology = null;
        
        // Performance monitoring
        this.performance = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            triangles: 0,
            lastUpdate: Date.now()
        };
        
        // Game state
        this.gameState = {
            currentLevel: 1,
            score: 0,
            bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
            lives: 3,
            isPlaying: false,
            isPowerUpActive: false,
            timeElapsed: 0,
            startTime: 0,
            
            // Player state
            player: {
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                lane: 1,
                isJumping: false,
                isDucking: false,
                isInvincible: false,
                health: 100
            },
            
            // Collections
            collectibles: [],
            obstacles: [],
            effects: [],
            
            // Metrics
            metrics: {
                totalPlayTime: 0,
                gamesPlayed: 0,
                totalScore: 0,
                averageScore: 0,
                bestStreak: 0,
                currentStreak: 0
            }
        };
        
        // System configuration
        this.config = {
            // Performance settings
            performance: {
                targetFPS: 60,
                enableVSync: true,
                maxDrawCalls: 1000,
                maxTriangles: 100000,
                enableFrustumCulling: true,
                enableOcclusion: true,
                enableLOD: true,
                shadowMapSize: 1024,
                maxTextures: 32
            },
            
            // Gameplay settings
            gameplay: {
                baseSpeed: 0.15,
                maxSpeed: 0.60,
                acceleration: 0.001,
                jumpHeight: 4.0,
                duckDuration: 800,
                invincibilityTime: 2000,
                lanes: [-6, 0, 6],
                gameLength: 60000 // 60 seconds
            },
            
            // Visual settings
            visual: {
                fogEnabled: true,
                shadowsEnabled: true,
                particlesEnabled: true,
                postProcessingEnabled: true,
                bloomEnabled: true,
                motionBlurEnabled: false,
                ambientOcclusionEnabled: false
            },
            
            // Audio settings
            audio: {
                masterVolume: 0.7,
                musicVolume: 0.5,
                sfxVolume: 0.8,
                enableSpatialAudio: true,
                maxSources: 32
            }
        };
        
        console.log('🚀 [GameCore] Enterprise Game Core initialized');
    }
    
    /**
     * 🏗️ INITIALIZE CORE SYSTEMS
     * Sets up all game systems with optimal performance
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🏗️ [GameCore] Initializing enterprise systems...');
        
        try {
            // Initialize renderer first
            await this.initializeRenderer();
            
            // Initialize core systems
            await this.initializePhysics();
            await this.initializeAudio();
            await this.initializeInput();
            await this.initializeUI();
            await this.initializeLevels();
            await this.initializePsychology();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup game loop
            this.setupGameLoop();
            
            this.isInitialized = true;
            console.log('✅ [GameCore] Enterprise initialization complete');
            
        } catch (error) {
            console.error('❌ [GameCore] Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * 🎨 INITIALIZE RENDERER
     * High-performance Three.js renderer with optimizations
     */
    async initializeRenderer() {
        // Import renderer module
        const { PerformanceRenderer } = await import('./renderer/PerformanceRenderer.js');
        
        this.renderer = new PerformanceRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: this.detectDeviceCapabilities().antialias,
            powerPreference: 'high-performance',
            alpha: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
        });
        
        await this.renderer.initialize();
        console.log('✅ [GameCore] Performance renderer initialized');
    }
    
    /**
     * ⚡ INITIALIZE PHYSICS
     * Lightweight physics system optimized for mobile
     */
    async initializePhysics() {
        const { LightweightPhysics } = await import('./physics/LightweightPhysics.js');
        
        this.physics = new LightweightPhysics({
            gravity: -9.81,
            enableBroadPhase: true,
            enableSpatialHashing: true,
            maxBodies: 1000,
            maxConstraints: 100
        });
        
        await this.physics.initialize();
        console.log('✅ [GameCore] Lightweight physics initialized');
    }
    
    /**
     * 🔊 INITIALIZE AUDIO
     * Optimized audio system with spatial audio support
     */
    async initializeAudio() {
        const { AudioManager } = await import('./audio/AudioManager.js');
        
        this.audio = new AudioManager({
            context: 'auto',
            maxSources: this.config.audio.maxSources,
            enableSpatialAudio: this.config.audio.enableSpatialAudio,
            masterVolume: this.config.audio.masterVolume
        });
        
        await this.audio.initialize();
        console.log('✅ [GameCore] Audio manager initialized');
    }
    
    /**
     * 🎮 INITIALIZE INPUT
     * Multi-input system (touch, keyboard, gestures)
     */
    async initializeInput() {
        const { InputManager } = await import('./input/InputManager.js');
        
        this.input = new InputManager({
            enableTouch: true,
            enableKeyboard: true,
            enableGestures: true,
            enableGamepad: false,
            touchSensitivity: 0.8,
            gestureThreshold: 0.3
        });
        
        await this.input.initialize();
        console.log('✅ [GameCore] Input manager initialized');
    }
    
    /**
     * 🎯 INITIALIZE UI
     * Responsive UI system with psychology integration
     */
    async initializeUI() {
        const { UIManager } = await import('./ui/UIManager.js');
        
        this.ui = new UIManager({
            enablePsychology: true,
            enableAnimations: true,
            enableResponsive: true,
            enableAccessibility: true
        });
        
        await this.ui.initialize();
        console.log('✅ [GameCore] UI manager initialized');
    }
    
    /**
     * 🏔️ INITIALIZE LEVELS
     * Modular level system with asset streaming
     */
    async initializeLevels() {
        const { LevelManager } = await import('./levels/LevelManager.js');
        
        this.levels = new LevelManager({
            enableStreaming: true,
            enablePreloading: true,
            maxLoadedLevels: 3,
            compressionEnabled: true,
            cachingEnabled: true
        });
        
        await this.levels.initialize();
        console.log('✅ [GameCore] Level manager initialized');
    }
    
    /**
     * 🧠 INITIALIZE PSYCHOLOGY
     * Advanced psychology system for addiction mechanics
     */
    async initializePsychology() {
        const { PsychologyEngine } = await import('./psychology/PsychologyEngine.js');
        
        this.psychology = new PsychologyEngine({
            enableRealTimeAnalysis: true,
            enableDynamicUI: true,
            enableMetrics: true,
            enableNotifications: true
        });
        
        await this.psychology.initialize();
        console.log('✅ [GameCore] Psychology engine initialized');
    }
    
    /**
     * 📊 SETUP PERFORMANCE MONITORING
     * Real-time performance tracking and optimization
     */
    setupPerformanceMonitoring() {
        this.performanceMonitor = {
            frameCount: 0,
            lastFrameTime: performance.now(),
            fpsHistory: [],
            
            update: () => {
                const now = performance.now();
                const delta = now - this.performanceMonitor.lastFrameTime;
                this.performanceMonitor.lastFrameTime = now;
                
                this.performance.frameTime = delta;
                this.performance.fps = 1000 / delta;
                
                // Track FPS history
                this.performanceMonitor.fpsHistory.push(this.performance.fps);
                if (this.performanceMonitor.fpsHistory.length > 120) {
                    this.performanceMonitor.fpsHistory.shift();
                }
                
                // Auto-optimize if performance drops
                if (this.performance.fps < 30) {
                    this.autoOptimize();
                }
                
                this.performanceMonitor.frameCount++;
            }
        };
        
        console.log('✅ [GameCore] Performance monitoring active');
    }
    
    /**
     * 🔄 SETUP GAME LOOP
     * High-performance game loop with delta time
     */
    setupGameLoop() {
        let lastTime = 0;
        
        const gameLoop = (currentTime) => {
            if (!this.isRunning || this.isPaused) {
                requestAnimationFrame(gameLoop);
                return;
            }
            
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update performance monitoring
            this.performanceMonitor.update();
            
            // Update game systems
            this.update(deltaTime);
            
            // Render frame
            this.render();
            
            // Continue loop
            requestAnimationFrame(gameLoop);
        };
        
        this.gameLoop = gameLoop;
        console.log('✅ [GameCore] Game loop configured');
    }
    
    /**
     * 🎮 UPDATE GAME SYSTEMS
     * Main update loop for all game systems
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        // Update core systems
        if (this.physics) this.physics.update(deltaTime);
        if (this.audio) this.audio.update(deltaTime);
        if (this.input) this.input.update(deltaTime);
        if (this.ui) this.ui.update(deltaTime);
        if (this.levels) this.levels.update(deltaTime);
        if (this.psychology) this.psychology.update(deltaTime);
        
        // Update game state
        this.updateGameState(deltaTime);
        
        // Update collections
        this.updateCollectibles(deltaTime);
        this.updateObstacles(deltaTime);
        this.updateEffects(deltaTime);
    }
    
    /**
     * 🎯 UPDATE GAME STATE
     * Core game logic updates
     */
    updateGameState(deltaTime) {
        if (!this.gameState.isPlaying) return;
        
        // Update time
        this.gameState.timeElapsed += deltaTime;
        
        // Update score
        this.gameState.score += Math.floor(deltaTime * 0.1);
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Check game conditions
        this.checkGameConditions();
    }
    
    /**
     * 🏃 UPDATE PLAYER
     * Player movement and state updates
     */
    updatePlayer(deltaTime) {
        const player = this.gameState.player;
        
        // Apply gravity
        if (player.isJumping) {
            player.velocity.y -= 0.5 * deltaTime;
            player.position.y += player.velocity.y * deltaTime;
            
            if (player.position.y <= 0) {
                player.position.y = 0;
                player.velocity.y = 0;
                player.isJumping = false;
            }
        }
        
        // Update position
        player.position.x = this.config.gameplay.lanes[player.lane];
        
        // Update health
        if (player.isInvincible) {
            player.health = Math.min(100, player.health + deltaTime * 0.1);
        }
    }
    
    /**
     * 🎨 RENDER FRAME
     * Main rendering call
     */
    render() {
        if (!this.renderer) return;
        
        this.renderer.render(this.gameState);
        
        // Update render stats
        this.performance.drawCalls = this.renderer.getDrawCalls();
        this.performance.triangles = this.renderer.getTriangles();
    }
    
    /**
     * 🚀 START GAME
     * Initialize and start the game
     */
    async start() {
        if (this.isRunning) return;
        
        try {
            // Initialize if not already done
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            // Reset game state
            this.resetGameState();
            
            // Start systems
            if (this.renderer) this.renderer.start();
            if (this.physics) this.physics.start();
            if (this.audio) this.audio.start();
            if (this.input) this.input.start();
            if (this.levels) this.levels.start();
            if (this.psychology) this.psychology.start();
            
            // Start game loop
            this.isRunning = true;
            this.gameState.isPlaying = true;
            this.gameState.startTime = Date.now();
            
            requestAnimationFrame(this.gameLoop);
            
            console.log('🎮 [GameCore] Game started successfully');
            
        } catch (error) {
            console.error('❌ [GameCore] Failed to start game:', error);
            throw error;
        }
    }
    
    /**
     * ⏹️ STOP GAME
     * Clean shutdown of all systems
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.gameState.isPlaying = false;
        
        // Stop systems
        if (this.renderer) this.renderer.stop();
        if (this.physics) this.physics.stop();
        if (this.audio) this.audio.stop();
        if (this.input) this.input.stop();
        if (this.levels) this.levels.stop();
        if (this.psychology) this.psychology.stop();
        
        console.log('⏹️ [GameCore] Game stopped');
    }
    
    /**
     * 🔄 RESET GAME STATE
     * Reset all game state for new game
     */
    resetGameState() {
        this.gameState.score = 0;
        this.gameState.lives = 3;
        this.gameState.timeElapsed = 0;
        this.gameState.isPlaying = false;
        this.gameState.isPowerUpActive = false;
        
        // Reset player
        this.gameState.player.position = { x: 0, y: 0, z: 0 };
        this.gameState.player.velocity = { x: 0, y: 0, z: 0 };
        this.gameState.player.lane = 1;
        this.gameState.player.isJumping = false;
        this.gameState.player.isDucking = false;
        this.gameState.player.isInvincible = false;
        this.gameState.player.health = 100;
        
        // Clear collections
        this.gameState.collectibles = [];
        this.gameState.obstacles = [];
        this.gameState.effects = [];
    }
    
    /**
     * 🎯 DETECT DEVICE CAPABILITIES
     * Auto-detect optimal settings for device
     */
    detectDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
            return {
                tier: 'LOW',
                antialias: false,
                shadows: false,
                maxTextures: 8,
                maxVertices: 10000
            };
        }
        
        // Detect GPU capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Detect device type
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
        
        let tier = 'MEDIUM';
        
        if (isMobile && !isTablet) {
            tier = 'LOW';
        } else if (isTablet) {
            tier = 'MEDIUM';
        } else {
            tier = 'HIGH';
        }
        
        return {
            tier,
            antialias: tier !== 'LOW',
            shadows: tier === 'HIGH',
            maxTextures: tier === 'LOW' ? 8 : tier === 'MEDIUM' ? 16 : 32,
            maxVertices: tier === 'LOW' ? 10000 : tier === 'MEDIUM' ? 50000 : 100000,
            isMobile,
            isTablet,
            renderer
        };
    }
    
    /**
     * ⚡ AUTO-OPTIMIZE
     * Automatic performance optimization
     */
    autoOptimize() {
        console.log('⚡ [GameCore] Auto-optimizing performance...');
        
        // Reduce visual quality
        if (this.config.visual.shadowsEnabled) {
            this.config.visual.shadowsEnabled = false;
            if (this.renderer) this.renderer.setShadows(false);
        }
        
        if (this.config.visual.particlesEnabled) {
            this.config.visual.particlesEnabled = false;
            if (this.renderer) this.renderer.setParticles(false);
        }
        
        if (this.config.visual.postProcessingEnabled) {
            this.config.visual.postProcessingEnabled = false;
            if (this.renderer) this.renderer.setPostProcessing(false);
        }
        
        // Reduce physics accuracy
        if (this.physics) {
            this.physics.setQuality('LOW');
        }
        
        // Reduce audio quality
        if (this.audio) {
            this.audio.setQuality('LOW');
        }
        
        console.log('✅ [GameCore] Performance optimized');
    }
    
    /**
     * 🎪 GAME EVENTS
     * Handle major game events
     */
    onGameOver() {
        this.gameState.isPlaying = false;
        
        // Update best score
        if (this.gameState.score > this.gameState.bestScore) {
            this.gameState.bestScore = this.gameState.score;
            localStorage.setItem('bestScore', this.gameState.bestScore.toString());
        }
        
        // Update metrics
        this.gameState.metrics.gamesPlayed++;
        this.gameState.metrics.totalScore += this.gameState.score;
        this.gameState.metrics.averageScore = this.gameState.metrics.totalScore / this.gameState.metrics.gamesPlayed;
        
        // Trigger psychology analysis
        if (this.psychology) {
            this.psychology.analyzeGameSession(this.gameState);
        }
        
        console.log('🎪 [GameCore] Game over - Score:', this.gameState.score);
    }
    
    /**
     * 📊 GET PERFORMANCE STATS
     * Get current performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.performance,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            deviceCapabilities: this.detectDeviceCapabilities()
        };
    }
    
    /**
     * 🎮 UPDATE COLLECTIBLES
     * Manage collectible objects
     */
    updateCollectibles(deltaTime) {
        this.gameState.collectibles = this.gameState.collectibles.filter(collectible => {
            // Move collectible
            collectible.position.z += this.config.gameplay.baseSpeed * deltaTime;
            
            // Check if collected
            if (this.checkCollision(this.gameState.player, collectible)) {
                this.collectItem(collectible);
                return false;
            }
            
            // Remove if too far
            return collectible.position.z > -50;
        });
    }
    
    /**
     * 🚧 UPDATE OBSTACLES
     * Manage obstacle objects
     */
    updateObstacles(deltaTime) {
        this.gameState.obstacles = this.gameState.obstacles.filter(obstacle => {
            // Move obstacle
            obstacle.position.z += this.config.gameplay.baseSpeed * deltaTime;
            
            // Check collision
            if (this.checkCollision(this.gameState.player, obstacle)) {
                this.hitObstacle(obstacle);
            }
            
            // Remove if too far
            return obstacle.position.z > -50;
        });
    }
    
    /**
     * ✨ UPDATE EFFECTS
     * Manage particle effects
     */
    updateEffects(deltaTime) {
        this.gameState.effects = this.gameState.effects.filter(effect => {
            effect.update(deltaTime);
            return effect.isAlive();
        });
    }
    
    /**
     * 🎯 CHECK COLLISION
     * Optimized collision detection
     */
    checkCollision(player, object) {
        const distance = Math.sqrt(
            Math.pow(player.position.x - object.position.x, 2) +
            Math.pow(player.position.y - object.position.y, 2) +
            Math.pow(player.position.z - object.position.z, 2)
        );
        
        return distance < 2.0;
    }
    
    /**
     * 🎁 COLLECT ITEM
     * Handle item collection
     */
    collectItem(item) {
        this.gameState.score += item.value || 10;
        
        // Create collection effect
        this.addEffect({
            type: 'collection',
            position: { ...item.position },
            duration: 1000
        });
        
        // Play sound
        if (this.audio) {
            this.audio.play('collect');
        }
        
        console.log('🎁 [GameCore] Item collected');
    }
    
    /**
     * 💥 HIT OBSTACLE
     * Handle obstacle collision
     */
    hitObstacle(obstacle) {
        if (this.gameState.player.isInvincible) return;
        
        this.gameState.player.health -= 25;
        this.gameState.player.isInvincible = true;
        
        // Create damage effect
        this.addEffect({
            type: 'damage',
            position: { ...obstacle.position },
            duration: 1000
        });
        
        // Play sound
        if (this.audio) {
            this.audio.play('hit');
        }
        
        // Check game over
        if (this.gameState.player.health <= 0) {
            this.onGameOver();
        }
        
        // Remove invincibility after time
        setTimeout(() => {
            this.gameState.player.isInvincible = false;
        }, this.config.gameplay.invincibilityTime);
        
        console.log('💥 [GameCore] Obstacle hit');
    }
    
    /**
     * ✨ ADD EFFECT
     * Add particle effect to game
     */
    addEffect(effectData) {
        const effect = {
            ...effectData,
            id: Date.now() + Math.random(),
            startTime: Date.now(),
            isAlive: function() {
                return Date.now() - this.startTime < this.duration;
            },
            update: function(deltaTime) {
                // Update effect logic here
            }
        };
        
        this.gameState.effects.push(effect);
    }
    
    /**
     * 🎯 CHECK GAME CONDITIONS
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Check time limit
        if (this.gameState.timeElapsed >= this.config.gameplay.gameLength) {
            this.onGameOver();
        }
        
        // Check lives
        if (this.gameState.lives <= 0) {
            this.onGameOver();
        }
    }
}

// Export for ES6 modules
export { GameCore };

// Legacy global export for compatibility
window.GameCore = GameCore;

console.log('🚀 GameCore module loaded successfully');