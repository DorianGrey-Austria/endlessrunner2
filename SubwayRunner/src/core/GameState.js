/**
 * GameState - Manages the overall game state and progression
 */
class GameState {
    constructor() {
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.distance = 0;
        this.gameSpeed = 0.12;
        this.maxSpeed = 0.35;
        this.speedIncrease = 0.001;
        
        // Collections
        this.kiwisCollected = 0;
        this.broccolisCollected = 0;
        this.starsCollected = 0;
        this.totalCollectibles = 0;
        this.targetKiwis = 10;
        this.targetBroccolis = 10;
        
        // Power-ups
        this.activePowerUps = new Map();
        this.powerUpDurations = {
            invincibility: 5000,
            magnet: 8000,
            doubleScore: 10000
        };
        
        // Camera and effects
        this.cameraShakeIntensity = 0;
        this.cameraZoom = 1.0;
        this.visualEffects = {
            speedLines: false,
            vignette: false,
            magnetEffect: false
        };
        
        // Performance tracking
        this.fps = 60;
        this.deltaTime = 0;
        this.lastUpdateTime = 0;
        
        // Score system
        this.scoreQueue = 0;
        this.lastScoreUpdate = 0;
        this.scoreUpdateInterval = 100; // ms
        this.maxScorePerUpdate = 100;
        
        // Level progression
        this.levelThreshold = 1000;
        this.levelCompleted = false;
        
        // Statistics
        this.startTime = Date.now();
        this.playTime = 0;
        this.obstaclesAvoided = 0;
        this.perfectRuns = 0;
        
        // Callbacks
        this.callbacks = {
            onScoreChange: [],
            onLivesChange: [],
            onLevelChange: [],
            onGameOver: [],
            onPowerUpActivate: [],
            onPowerUpDeactivate: [],
            onCollectibleGather: []
        };
    }

    /**
     * Initialize game state
     */
    init() {
        this.reset();
        console.log('✅ GameState initialized');
    }

    /**
     * Reset game state to initial values
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        this.distance = 0;
        this.gameSpeed = 0.12;
        
        // Reset collections
        this.kiwisCollected = 0;
        this.broccolisCollected = 0;
        this.starsCollected = 0;
        this.totalCollectibles = 0;
        
        // Reset power-ups
        this.activePowerUps.clear();
        this.cameraShakeIntensity = 0;
        this.cameraZoom = 1.0;
        
        // Reset visual effects
        this.visualEffects = {
            speedLines: false,
            vignette: false,
            magnetEffect: false
        };
        
        // Reset score system
        this.scoreQueue = 0;
        this.lastScoreUpdate = 0;
        
        // Reset statistics
        this.startTime = Date.now();
        this.playTime = 0;
        this.obstaclesAvoided = 0;
        this.perfectRuns = 0;
        this.levelCompleted = false;
        
        console.log('🔄 GameState reset');
    }

    /**
     * Start the game
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.startTime = Date.now();
        
        this.triggerCallback('onGameStart');
        console.log('🚀 Game started');
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.isRunning && !this.isGameOver) {
            this.isPaused = !this.isPaused;
            this.triggerCallback('onPause', this.isPaused);
            console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
        }
    }

    /**
     * End the game
     */
    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.playTime = Date.now() - this.startTime;
        
        this.triggerCallback('onGameOver', this.getGameOverData());
        console.log('💀 Game over');
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        
        this.deltaTime = deltaTime;
        const currentTime = Date.now();
        
        // Update play time
        this.playTime = currentTime - this.startTime;
        
        // Update score queue
        this.updateScoreQueue(currentTime);
        
        // Update power-ups
        this.updatePowerUps(currentTime);
        
        // Update game speed
        this.updateGameSpeed();
        
        // Update distance
        this.updateDistance(deltaTime);
        
        // Check level progression
        this.checkLevelProgression();
        
        // Update visual effects
        this.updateVisualEffects();
        
        this.lastUpdateTime = currentTime;
    }

    /**
     * Add score to the queue
     */
    addScore(amount, source = 'unknown') {
        if (amount > 0) {
            this.scoreQueue += Math.floor(amount);
            
            // Apply score multipliers
            if (this.activePowerUps.has('doubleScore')) {
                this.scoreQueue += Math.floor(amount);
            }
        }
    }

    /**
     * Process score queue
     */
    updateScoreQueue(currentTime) {
        if (this.scoreQueue > 0 && currentTime - this.lastScoreUpdate >= this.scoreUpdateInterval) {
            const scoreToAdd = Math.min(this.scoreQueue, this.maxScorePerUpdate);
            this.score += scoreToAdd;
            this.scoreQueue -= scoreToAdd;
            this.lastScoreUpdate = currentTime;
            
            this.triggerCallback('onScoreChange', this.score, scoreToAdd);
        }
    }

    /**
     * Update power-ups
     */
    updatePowerUps(currentTime) {
        for (const [powerUpType, startTime] of this.activePowerUps) {
            const duration = this.powerUpDurations[powerUpType] || 5000;
            
            if (currentTime - startTime >= duration) {
                this.deactivatePowerUp(powerUpType);
            }
        }
    }

    /**
     * Update game speed
     */
    updateGameSpeed() {
        if (this.gameSpeed < this.maxSpeed) {
            this.gameSpeed += this.speedIncrease;
            this.gameSpeed = Math.min(this.gameSpeed, this.maxSpeed);
        }
    }

    /**
     * Update distance traveled
     */
    updateDistance(deltaTime) {
        this.distance += this.gameSpeed * deltaTime * 100;
    }

    /**
     * Check level progression
     */
    checkLevelProgression() {
        const targetLevel = Math.floor(this.score / this.levelThreshold) + 1;
        
        if (targetLevel > this.currentLevel && !this.levelCompleted) {
            this.levelCompleted = true;
            this.triggerCallback('onLevelComplete', this.currentLevel);
        }
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        this.currentLevel++;
        this.levelCompleted = false;
        this.gameSpeed = Math.min(this.gameSpeed + 0.02, this.maxSpeed);
        
        this.triggerCallback('onLevelChange', this.currentLevel);
        console.log(`🎮 Advanced to level ${this.currentLevel}`);
    }

    /**
     * Update visual effects
     */
    updateVisualEffects() {
        // Speed lines based on speed
        this.visualEffects.speedLines = this.gameSpeed > 0.2;
        
        // Vignette based on speed and power-ups
        this.visualEffects.vignette = this.gameSpeed > 0.25 || this.activePowerUps.has('invincibility');
        
        // Magnet effect
        this.visualEffects.magnetEffect = this.activePowerUps.has('magnet');
    }

    /**
     * Lose a life
     */
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            this.triggerCallback('onLivesChange', this.lives);
            
            if (this.lives === 0) {
                this.gameOver();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Gain a life
     */
    gainLife() {
        if (this.lives < 5) {
            this.lives++;
            this.triggerCallback('onLivesChange', this.lives);
            return true;
        }
        return false;
    }

    /**
     * Collect an item
     */
    collectItem(itemType) {
        switch (itemType) {
            case 'kiwi':
                this.kiwisCollected++;
                this.addScore(10, 'kiwi');
                break;
            case 'broccoli':
                this.broccolisCollected++;
                this.addScore(20, 'broccoli');
                break;
            case 'star':
                this.starsCollected++;
                this.activatePowerUp('invincibility');
                break;
        }
        
        this.totalCollectibles++;
        this.triggerCallback('onCollectibleGather', itemType, this.totalCollectibles);
    }

    /**
     * Activate power-up
     */
    activatePowerUp(powerUpType) {
        const currentTime = Date.now();
        this.activePowerUps.set(powerUpType, currentTime);
        
        this.triggerCallback('onPowerUpActivate', powerUpType);
        console.log(`⚡ Power-up activated: ${powerUpType}`);
        
        // Special effects for power-ups
        switch (powerUpType) {
            case 'invincibility':
                this.cameraShakeIntensity = 0.1;
                break;
            case 'magnet':
                this.cameraZoom = 0.9;
                break;
            case 'doubleScore':
                this.cameraShakeIntensity = 0.05;
                break;
        }
    }

    /**
     * Deactivate power-up
     */
    deactivatePowerUp(powerUpType) {
        this.activePowerUps.delete(powerUpType);
        
        this.triggerCallback('onPowerUpDeactivate', powerUpType);
        console.log(`⚡ Power-up deactivated: ${powerUpType}`);
        
        // Reset effects
        switch (powerUpType) {
            case 'invincibility':
                this.cameraShakeIntensity = 0;
                break;
            case 'magnet':
                this.cameraZoom = 1.0;
                break;
            case 'doubleScore':
                this.cameraShakeIntensity = 0;
                break;
        }
    }

    /**
     * Check if power-up is active
     */
    isPowerUpActive(powerUpType) {
        return this.activePowerUps.has(powerUpType);
    }

    /**
     * Avoid obstacle
     */
    avoidObstacle() {
        this.obstaclesAvoided++;
        this.addScore(5, 'obstacle_avoided');
    }

    /**
     * Register callback
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    /**
     * Remove callback
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    /**
     * Trigger callback
     */
    triggerCallback(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`GameState callback error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get game statistics
     */
    getStats() {
        return {
            score: this.score,
            level: this.currentLevel,
            lives: this.lives,
            distance: Math.floor(this.distance),
            playTime: this.playTime,
            kiwisCollected: this.kiwisCollected,
            broccolisCollected: this.broccolisCollected,
            starsCollected: this.starsCollected,
            totalCollectibles: this.totalCollectibles,
            obstaclesAvoided: this.obstaclesAvoided,
            gameSpeed: this.gameSpeed,
            activePowerUps: Array.from(this.activePowerUps.keys())
        };
    }

    /**
     * Get game over data
     */
    getGameOverData() {
        return {
            ...this.getStats(),
            finalScore: this.score,
            survivalTime: this.playTime,
            levelsCompleted: this.currentLevel - 1,
            collectibleRatio: this.totalCollectibles > 0 ? 
                (this.kiwisCollected + this.broccolisCollected) / this.totalCollectibles : 0
        };
    }

    /**
     * Get current state
     */
    getCurrentState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver,
            ...this.getStats()
        };
    }
}

// Make class available globally
window.GameState = GameState;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}