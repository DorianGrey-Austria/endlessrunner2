// LevelManager.js - Manages all game levels
const LevelManager = {
    levels: {},
    currentLevel: 1,
    scene: null,
    renderer: null,
    
    // Initialize the level manager
    init: function() {
        console.log('🎮 LevelManager initialized');
        
        // Register default level 1 (from base game)
        this.registerLevel(1, {
            name: "Classic Subway",
            description: "The original subway tunnel",
            load: function(scene) {
                // Level 1 is built into the base game
                console.log('Loading Level 1: Classic Subway');
            },
            update: function(deltaTime) {
                // Level 1 specific updates
            },
            cleanup: function() {
                // Level 1 cleanup
            }
        });
    },
    
    // Register a new level
    registerLevel: function(id, levelModule) {
        this.levels[id] = levelModule;
        console.log(`✅ Level ${id} registered: ${levelModule.name}`);
    },
    
    // Load a specific level
    loadLevel: function(id, scene, renderer) {
        const level = this.levels[id];
        if (!level) {
            console.error(`Level ${id} not found!`);
            return false;
        }
        
        // Cleanup previous level if exists
        if (this.currentLevel && this.levels[this.currentLevel] && this.levels[this.currentLevel].cleanup) {
            this.levels[this.currentLevel].cleanup();
        }
        
        console.log(`🌟 Loading Level ${id}: ${level.name}`);
        
        // Store references
        this.scene = scene;
        this.renderer = renderer;
        this.currentLevel = id;
        
        // Load the new level
        if (level.load) {
            level.load(scene, renderer);
        }
        
        // Update game state
        if (window.gameState) {
            window.gameState.currentLevel = id;
        }
        
        return true;
    },
    
    // Get current level info
    getCurrentLevel: function() {
        return this.levels[this.currentLevel];
    },
    
    // Get all available levels
    getAvailableLevels: function() {
        return Object.entries(this.levels).map(([id, level]) => ({
            id: parseInt(id),
            name: level.name,
            description: level.description || ''
        }));
    },
    
    // Update current level
    update: function(deltaTime) {
        const currentLevel = this.levels[this.currentLevel];
        if (currentLevel && currentLevel.update) {
            currentLevel.update(deltaTime);
        }
    },
    
    // Check if player reached level transition point
    checkLevelTransition: function(score) {
        // Transition every 1000 points for now
        const nextLevelScore = this.currentLevel * 1000;
        if (score >= nextLevelScore && this.levels[this.currentLevel + 1]) {
            console.log(`🎉 Level transition triggered! Moving to level ${this.currentLevel + 1}`);
            this.loadLevel(this.currentLevel + 1, this.scene, this.renderer);
            return true;
        }
        return false;
    },
    
    // Reset to first level
    reset: function() {
        this.loadLevel(1, this.scene, this.renderer);
    }
};

// Register with GameCore
if (window.GameCore) {
    window.GameCore.registerModule('levels', LevelManager);
}