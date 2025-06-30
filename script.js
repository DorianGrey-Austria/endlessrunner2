class EndlessRunner {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element "gameCanvas" not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Cannot get 2D context from canvas!');
            return;
        }
        
        // PERFORMANCE OBJECT - muss zuerst initialisiert werden!
        this.performance = {
            fps: 60,
            frameCount: 0,
            lastFpsUpdate: 0,
            renderTime: 0,
            particleCount: 0,
            lowPerformanceMode: false,
            maxParticles: 100,
            adaptiveQuality: 1.0,
            memoryUsage: 0,
            cullDistance: 1000,
            renderBudget: 16.67, // 60 FPS target
            frameDropCount: 0,
            avgFrameTime: 16.67,
            performanceLevel: 'high',
            dynamicLOD: true,
            objectPooling: true,
            batchRendering: true,
            cullingEnabled: true,
            qualityScale: 1.0,
            maxRenderTime: 0,
            emergencyModeActive: false,
            qualityPresets: {
                ultra: { particles: 150, effects: 1.0, shadows: true, postProcessing: true },
                high: { particles: 100, effects: 0.8, shadows: true, postProcessing: true },
                medium: { particles: 75, effects: 0.6, shadows: true, postProcessing: false },
                low: { particles: 50, effects: 0.4, shadows: false, postProcessing: false }
            }
        };
        
        // ADAPTIVE PERFORMANCE INITIALIZATION
        this.initializeAdaptivePerformance();
        
        // Responsive Canvas-Größe
        this.setupCanvas();
        
        window.addEventListener('resize', () => this.setupCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.setupCanvas(), 100);
        });
        
        this.gameState = 'start';
        this.score = 0;
        this.distance = 0;
        this.speed = 2;
        this.maxSpeed = 8;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        
        this.player = {
            x: 100,
            y: 400,
            width: 40,
            height: 60,
            velocityY: 0,
            isJumping: false,
            isSliding: false,
            isWallRunning: false,
            wallRunSide: null, // 'left' or 'right'
            wallRunTime: 0,
            color: '#ff6b6b',
            animationFrame: 0,
            bobOffset: 0,
            trailParticles: [],
            glowIntensity: 1.0,
            // ENHANCED ANIMATION SYSTEM
            advancedAnimation: {
                bodyTilt: 0,                 // Dynamic body rotation
                armSwing: 0,                 // Arm swing phase
                legCycle: 0,                 // Running leg cycle
                breathingCycle: 0,           // Idle breathing
                emotionalIntensity: 0,       // Expression intensity
                tailEffect: 0,               // Energy tail animation
                morphing: 0,                 // Shape morphing
                energyPulse: 0,              // Energy pulse phase
                shadowIntensity: 1.0,        // Dynamic shadow
                auraEffect: 0                // Aura/energy field
            },
            trailSystem: {
                particles: [],
                maxParticles: 30,
                emissionRate: 0.8,
                lastEmission: 0
            },
            speedTrails: [],
            actionTrails: []
        };
        
        this.ground = {
            y: 460,
            height: 140
        };
        
        this.obstacles = [];
        this.powerups = [];
        this.clouds = [];
        this.backgroundElements = [];
        this.walls = [];
        this.obstaclePatterns = [];
        this.currentPattern = null;
        this.patternProgress = 0;
        
        this.riskRewardZones = [];
        this.currentZone = null;
        this.zoneSpawnDistance = 1500;
        
        // CHARACTER PROGRESSION SYSTEM
        this.characterProgression = {
            level: parseInt(localStorage.getItem('playerLevel')) || 1,
            experience: parseInt(localStorage.getItem('playerExp')) || 0,
            expToNext: 100,
            totalExp: parseInt(localStorage.getItem('totalExp')) || 0,
            skillPoints: parseInt(localStorage.getItem('skillPoints')) || 0,
            unlockedCharacters: JSON.parse(localStorage.getItem('unlockedCharacters') || '["default"]'),
            currentCharacter: localStorage.getItem('currentCharacter') || 'default',
            characterStats: this.initializeCharacterStats()
        };
        
        // PROGRESSIVE DIFFICULTY SYSTEM
        this.difficultyProgression = {
            currentTier: 1,
            tierProgress: 0,
            tierThresholds: [500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000, 50000],
            tierBonuses: {
                1: { scoreMultiplier: 1.0, speedIncrease: 0, specialFeatures: [] },
                2: { scoreMultiplier: 1.2, speedIncrease: 0.5, specialFeatures: ['wallrun_boost'] },
                3: { scoreMultiplier: 1.5, speedIncrease: 1.0, specialFeatures: ['wallrun_boost', 'combo_chains'] },
                4: { scoreMultiplier: 1.8, speedIncrease: 1.5, specialFeatures: ['wallrun_boost', 'combo_chains', 'epic_moments'] },
                5: { scoreMultiplier: 2.2, speedIncrease: 2.0, specialFeatures: ['wallrun_boost', 'combo_chains', 'epic_moments', 'boss_encounters'] },
                6: { scoreMultiplier: 2.7, speedIncrease: 2.5, specialFeatures: ['all_previous', 'dynamic_weather'] },
                7: { scoreMultiplier: 3.3, speedIncrease: 3.0, specialFeatures: ['all_previous', 'dynamic_weather', 'portal_system'] },
                8: { scoreMultiplier: 4.0, speedIncrease: 3.5, specialFeatures: ['all_previous', 'master_challenges'] },
                9: { scoreMultiplier: 5.0, speedIncrease: 4.0, specialFeatures: ['all_previous', 'legendary_mode'] },
                10: { scoreMultiplier: 6.5, speedIncrease: 5.0, specialFeatures: ['all_previous', 'infinite_mastery'] }
            }
        };
        
        // UNLOCKABLE CONTENT SYSTEM
        this.unlockableContent = {
            characters: {
                default: { name: 'Runner', unlocked: true, cost: 0, abilities: [] },
                speedster: { name: 'Speedster', unlocked: false, cost: 150, abilities: ['speed_boost', 'quick_recovery'] },
                acrobat: { name: 'Acrobat', unlocked: false, cost: 300, abilities: ['double_jump', 'wall_cling'] },
                tank: { name: 'Tank', unlocked: false, cost: 500, abilities: ['damage_resistance', 'heavy_landing'] },
                ninja: { name: 'Ninja', unlocked: false, cost: 750, abilities: ['stealth_mode', 'precision_strikes'] },
                elemental: { name: 'Elemental', unlocked: false, cost: 1000, abilities: ['elemental_trail', 'weather_control'] },
                cosmic: { name: 'Cosmic', unlocked: false, cost: 1500, abilities: ['gravity_manipulation', 'time_dilation'] },
                legendary: { name: 'Legend', unlocked: false, cost: 2500, abilities: ['all_abilities', 'legend_aura'] }
            },
            themes: {
                classic: { name: 'Classic', unlocked: true, cost: 0 },
                neon: { name: 'Neon City', unlocked: false, cost: 200 },
                forest: { name: 'Mystic Forest', unlocked: false, cost: 400 },
                space: { name: 'Space Station', unlocked: false, cost: 600 },
                underwater: { name: 'Ocean Depths', unlocked: false, cost: 800 },
                volcanic: { name: 'Lava World', unlocked: false, cost: 1200 },
                crystalline: { name: 'Crystal Caves', unlocked: false, cost: 1800 }
            },
            powerupUpgrades: {
                shield_duration: { level: 1, maxLevel: 5, cost: 100, effect: 'Extends shield duration' },
                speed_intensity: { level: 1, maxLevel: 5, cost: 150, effect: 'Increases speed boost power' },
                magnet_range: { level: 1, maxLevel: 5, cost: 120, effect: 'Expands magnet collection range' },
                double_points_multiplier: { level: 1, maxLevel: 3, cost: 200, effect: 'Higher point multipliers' }
            }
        };
        
        // LONG-TERM PROGRESSION TRACKING
        this.progressionStats = {
            totalDistance: parseInt(localStorage.getItem('totalDistance')) || 0,
            totalJumps: parseInt(localStorage.getItem('totalJumps')) || 0,
            totalWallRuns: parseInt(localStorage.getItem('totalWallRuns')) || 0,
            totalPowerupsCollected: parseInt(localStorage.getItem('totalPowerups')) || 0,
            totalBossesDefeated: parseInt(localStorage.getItem('totalBosses')) || 0,
            sessionsPlayed: parseInt(localStorage.getItem('sessionsPlayed')) || 0,
            achievementsUnlocked: parseInt(localStorage.getItem('achievements')) || 0
        };
        
        // SHOP & UPGRADE SYSTEM
        this.shopSystem = {
            currency: parseInt(localStorage.getItem('shopCurrency')) || 0,
            earnedThisSession: 0,
            unlockedUpgrades: JSON.parse(localStorage.getItem('unlockedUpgrades') || '[]'),
            availableUpgrades: {
                jumpBoost: { 
                    name: 'Jump Boost', 
                    description: 'Increase jump height by 15%',
                    cost: 500, 
                    maxLevel: 5, 
                    currentLevel: 0,
                    effect: { jumpPower: 0.15 },
                    icon: '🚀'
                },
                speedRunner: { 
                    name: 'Speed Runner', 
                    description: 'Start with higher base speed',
                    cost: 750, 
                    maxLevel: 3, 
                    currentLevel: 0,
                    effect: { baseSpeed: 0.5 },
                    icon: '⚡'
                },
                shieldMaster: { 
                    name: 'Shield Master', 
                    description: 'Shield lasts 50% longer',
                    cost: 600, 
                    maxLevel: 4, 
                    currentLevel: 0,
                    effect: { shieldDuration: 0.5 },
                    icon: '🛡️'
                },
                coinMagnet: { 
                    name: 'Coin Magnet', 
                    description: 'Increased coin collection range',
                    cost: 400, 
                    maxLevel: 6, 
                    currentLevel: 0,
                    effect: { magnetRange: 0.25 },
                    icon: '🧲'
                },
                hazardResist: { 
                    name: 'Hazard Resist', 
                    description: 'Reduced environmental damage',
                    cost: 800, 
                    maxLevel: 3, 
                    currentLevel: 0,
                    effect: { hazardResistance: 0.33 },
                    icon: '🔥'
                },
                biomeExplorer: { 
                    name: 'Biome Explorer', 
                    description: 'Bonus rewards in new biomes',
                    cost: 1000, 
                    maxLevel: 1, 
                    currentLevel: 0,
                    effect: { biomeBonus: 2.0 },
                    icon: '🌍'
                }
            }
        };
        
        // BIOME SYSTEM
        this.biomeSystem = {
            currentBiome: 'forest',
            biomeDistance: 0,
            transitionDistance: 2000, // Change biome every 2000m
            availableBiomes: {
                forest: {
                    name: 'Mystic Forest',
                    colors: { sky: '#87CEEB', ground: '#8FBC8F', accent: '#228B22' },
                    hazards: ['falling_leaves', 'tree_branches'],
                    bonusCoins: 1.0,
                    musicTempo: 1.0,
                    description: 'Ancient woods with natural obstacles'
                },
                desert: {
                    name: 'Scorching Desert',
                    colors: { sky: '#FFD700', ground: '#DEB887', accent: '#CD853F' },
                    hazards: ['sandstorm', 'heat_waves', 'quicksand'],
                    bonusCoins: 1.2,
                    musicTempo: 1.1,
                    description: 'Harsh desert with environmental dangers'
                },
                arctic: {
                    name: 'Frozen Wasteland',
                    colors: { sky: '#B0E0E6', ground: '#F0F8FF', accent: '#4682B4' },
                    hazards: ['ice_patches', 'blizzard', 'frozen_obstacles'],
                    bonusCoins: 1.3,
                    musicTempo: 0.9,
                    description: 'Icy terrain with slippery surfaces'
                },
                volcano: {
                    name: 'Lava Peaks',
                    colors: { sky: '#FF4500', ground: '#8B0000', accent: '#FF6347' },
                    hazards: ['lava_geysers', 'falling_rocks', 'heat_damage'],
                    bonusCoins: 1.5,
                    musicTempo: 1.3,
                    description: 'Volcanic landscape with extreme heat'
                },
                cyber: {
                    name: 'Neon City',
                    colors: { sky: '#1a1a2e', ground: '#16213e', accent: '#00ffff' },
                    hazards: ['laser_grids', 'electric_fields', 'data_streams'],
                    bonusCoins: 1.4,
                    musicTempo: 1.2,
                    description: 'Futuristic cityscape with digital hazards'
                }
            },
            unlockedBiomes: JSON.parse(localStorage.getItem('unlockedBiomes') || '["forest"]')
        };
        
        // ENVIRONMENTAL HAZARDS SYSTEM
        this.hazardSystem = {
            activeHazards: [],
            hazardSpawnTimer: 0,
            hazardSpawnInterval: 3000, // 3 seconds
            hazardTypes: {
                falling_leaves: {
                    name: 'Falling Leaves',
                    damage: 0,
                    effect: 'vision_obstruction',
                    duration: 2000,
                    visual: { color: '#228B22', size: 'small', pattern: 'falling' }
                },
                sandstorm: {
                    name: 'Sandstorm',
                    damage: 10,
                    effect: 'speed_reduction',
                    duration: 4000,
                    visual: { color: '#DEB887', size: 'large', pattern: 'swirling' }
                },
                ice_patches: {
                    name: 'Ice Patches',
                    damage: 0,
                    effect: 'slippery_movement',
                    duration: 1500,
                    visual: { color: '#B0E0E6', size: 'medium', pattern: 'ground_patch' }
                },
                lava_geysers: {
                    name: 'Lava Geysers',
                    damage: 25,
                    effect: 'knockback',
                    duration: 1000,
                    visual: { color: '#FF4500', size: 'large', pattern: 'eruption' }
                },
                laser_grids: {
                    name: 'Laser Grids',
                    damage: 15,
                    effect: 'precise_timing_required',
                    duration: 3000,
                    visual: { color: '#00ffff', size: 'medium', pattern: 'grid' }
                }
            }
        };
        
        // Load shop progress
        this.loadShopProgress();
        
        // Initialize current biome
        this.initializeBiome();
        
        // DYNAMIC EVENT SYSTEM - Erweitert das bestehende System
        this.dynamicEvents = {
            active: null,
            nextEventDistance: 2000,
            cooldownTimer: 0,
            eventHistory: [],
            intensityLevel: 1.0,
            availableEvents: [
                {
                    id: 'speed_surge',
                    name: 'SPEED SURGE',
                    probability: 0.3,
                    duration: 8000,
                    effect: { speedMultiplier: 2.0, particleBoost: 1.5 },
                    color: '#ff6600'
                },
                {
                    id: 'gravity_shift', 
                    name: 'GRAVITY SHIFT',
                    probability: 0.25,
                    duration: 6000,
                    effect: { gravityMultiplier: 0.5, jumpBoost: 1.8 },
                    color: '#9966ff'
                },
                {
                    id: 'matrix_mode',
                    name: 'BULLET TIME',
                    probability: 0.2,
                    duration: 5000,
                    effect: { timeScale: 0.6, precisionBonus: 2.0 },
                    color: '#00ff88'
                },
                {
                    id: 'obstacle_rain',
                    name: 'OBSTACLE STORM',
                    probability: 0.15,
                    duration: 10000,
                    effect: { obstacleMultiplier: 3.0, scoreMultiplier: 3.0 },
                    color: '#ff3333'
                },
                {
                    id: 'coin_burst',
                    name: 'TREASURE BURST',
                    probability: 0.1,
                    duration: 7000,
                    effect: { coinSpawn: 5.0, magnetRange: 2.0 },
                    color: '#ffd700'
                }
            ]
        };
        
        // ENVIRONMENTAL STORYTELLING - Neue Dimension
        this.environmentalNarrative = {
            currentTheme: 'urban',
            themeProgress: 0,
            transitionActive: false,
            themes: {
                urban: {
                    name: 'Cyber City',
                    colors: ['#4ecdc4', '#ff6b6b', '#ffd93d'],
                    obstacles: ['building', 'drone', 'laser'],
                    atmosphere: 'neon'
                },
                forest: {
                    name: 'Digital Forest',
                    colors: ['#27ae60', '#f39c12', '#8e44ad'],
                    obstacles: ['tree', 'branch', 'root'],
                    atmosphere: 'organic'
                },
                space: {
                    name: 'Cosmic Void',
                    colors: ['#2c3e50', '#9b59b6', '#e74c3c'],
                    obstacles: ['asteroid', 'satellite', 'wormhole'],
                    atmosphere: 'ethereal'
                }
            },
            transitionDistance: 5000
        };
        
        // EPIC MOMENTS SYSTEM - Verstärkt bestehende Near-Miss Mechanik
        this.epicMoments = {
            active: false,
            type: null,
            intensity: 0,
            duration: 0,
            slowMotionFactor: 1.0,
            cinematicEffects: false,
            replayData: [],
            momentTypes: {
                'legendary_escape': { threshold: 0.95, slowMo: 0.3, duration: 2000 },
                'perfect_flow': { threshold: 0.9, slowMo: 0.5, duration: 1500 },
                'clutch_save': { threshold: 0.85, slowMo: 0.4, duration: 1800 },
                'zone_master': { threshold: 0.8, slowMo: 0.6, duration: 1200 }
            }
        };
        
        // COMMUNITY CHALLENGES - Erweitert Daily Challenges
        this.communityEvents = {
            active: null,
            globalProgress: 0,
            playerContribution: 0,
            weeklyChallenge: null,
            leaderboard: [],
            achievements: []
        };
        
        this.dailyChallenges = [];
        this.challengeProgress = {};
        this.lastChallengeCheck = 0;
        
        // Performance object already initialized above
        
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1;
        this.lastActionTime = 0;
        
        // GAMEPLAY ENHANCEMENT VARIABLES
        this.timeScale = 1.0;
        this.temporaryGravity = 0.8;
        this.obstacleSpawnMultiplier = 1.0;
        this.scoreMultiplierBonus = 1.0;
        this.magnetRangeMultiplier = 1.0;
        
        this.difficultyLevel = 1;
        this.speedZones = [];
        this.achievements = [];
        this.activePowerups = [];
        
        this.boss = null;
        this.bossSpawnDistance = 3000; // Später spawnen
        this.bossActive = false;
        this.bossPhase = 0;
        
        this.difficultyBalancing = {
            playerDeaths: 0,
            averageRunDistance: 0,
            totalRuns: 0,
            adaptiveDifficulty: 1.0, // Multiplikator
            lastPerformanceCheck: 0
        };
        
        this.soundEnabled = true;
        this.screenFlash = 0;
        this.countdownActive = false;
        this.countdownValue = 3;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.audioInitialized = false;
        
        this.keys = {};
        this.mousePressed = false;
        this.touchActive = false;
        
        this.gestureDetection = {
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            minSwipeDistance: 50,
            swipeDetected: false
        };
        
        this.lastObstacleSpawn = 0;
        this.lastPowerupSpawn = 0;
        this.lastCloudSpawn = 0;
        this.lastPatternSpawn = 0;
        this.nextPatternDistance = 500;
        
        this.camera = { 
            x: 0, 
            shake: 0, 
            shakeIntensity: 0,
            shakeX: 0,
            shakeY: 0,
            shakeRotation: 0,
            shakeType: 'normal' // 'normal', 'explosion', 'earthquake', 'impact'
        };
        
        // SPANNUNG-BOOSTER: Near-Miss Adrenalin-System
        this.nearMissSystem = {
            dangerDistance: 25,     // Pixel-Grenze für "knapp vorbei"
            rewardMultiplier: 2.0,  // Belohnungs-Multiplikator
            comboBonus: 3,          // Extra Combo-Punkte
            cooldownTime: 500,      // ms zwischen Near-Miss Events
            lastNearMiss: 0,
            totalNearMisses: 0,
            streakCount: 0,         // Aufeinanderfolgende Near-Misses
            maxStreak: 0
        };
        
        // Temporäre UI-Nachrichten
        this.temporaryMessages = [];
        
        // ESCALATION-BOOSTER: Flow State Momentum System
        this.flowState = {
            level: 0,                    // 0-5 Flow-Level
            momentum: 0,                 // Aufgebaute Energie 0-500
            multiplier: 1,               // Belohnungsmultiplikator
            thresholds: [50, 120, 220, 350, 500], // Momentum-Schwellen für Level-Ups
            decayRate: 0.98,            // Verlustrate pro Frame ohne Aktion
            momentumGainRate: 8,        // Momentum-Gewinn pro erfolgreicher Aktion
            levelUpEffects: [],         // Aktive Level-Up-Effekte
            lastLevelUp: 0,
            maxLevelReached: 0
        };
        
        // NEAR-MISS-BOOSTER: Last Second Escape System
        this.lastSecondEscape = {
            active: false,
            timeWindow: 150,        // 150ms Zeitfenster für "last second"
            collisionPredicted: false,
            predictedObstacle: null,
            escapeBonus: 0,
            totalEscapes: 0,
            maxEscapeStreak: 0,
            currentEscapeStreak: 0,
            dangerWarningTime: 0
        };
        
        // INTELLIGENT AI: Dynamic Difficulty Learning System
        this.adaptiveAI = {
            playerSkillLevel: 1.0,        // 0.5-3.0 skill rating
            learningRate: 0.02,           // How fast AI adapts
            sessionData: {
                attempts: 0,
                successRate: 0,
                averageReactionTime: 300,
                preferredActions: { jump: 0, slide: 0, wallrun: 0 },
                difficultyPreference: 1.0,
                flowStateReached: 0,
                nearMissSuccess: 0,
                lastSecondEscapes: 0
            },
            patternAI: {
                lastPatternSuccess: true,
                patternComplexity: 1.0,
                adaptiveSpacing: 200,       // Distance between obstacles
                smartPrediction: true,
                learningBuffer: []          // Stores last 20 player actions
            },
            emotionalState: {
                frustration: 0,             // 0-1 frustration level
                confidence: 0.5,            // 0-1 confidence level  
                engagement: 1.0,            // 0-1 engagement level
                adaptationNeeded: false
            }
        };
        
        // PROGRESSION SYSTEM: Unlockable Skill Abilities
        this.skillSystem = {
            unlockedAbilities: [],
            availableAbilities: [
                {
                    id: 'double_jump',
                    name: 'Double Jump',
                    description: 'Press jump again in mid-air',
                    unlockRequirement: { type: 'combo', value: 15 },
                    cooldown: 0,
                    uses: 0
                },
                {
                    id: 'dash_attack',
                    name: 'Dash Attack',
                    description: 'Swipe right to destroy obstacles',
                    unlockRequirement: { type: 'near_miss', value: 10 },
                    cooldown: 0,
                    uses: 0
                },
                {
                    id: 'time_slow',
                    name: 'Bullet Time',
                    description: 'Hold slide to slow time',
                    unlockRequirement: { type: 'last_second_escape', value: 5 },
                    cooldown: 0,
                    uses: 0
                },
                {
                    id: 'perfect_landing',
                    name: 'Perfect Landing',
                    description: 'Land precisely for extra points',
                    unlockRequirement: { type: 'flow_level', value: 4 },
                    cooldown: 0,
                    uses: 0
                },
                {
                    id: 'obstacle_preview',
                    name: 'Future Sight',
                    description: 'See upcoming obstacles',
                    unlockRequirement: { type: 'skill_level', value: 2.0 },
                    cooldown: 0,
                    uses: 0
                }
            ],
            skillPoints: 0,
            masteryChallenges: []
        };
        
        // ADAPTIVE AUDIO: Dynamic Music Engine
        this.audioEngine = {
            intensity: 0.5,              // 0-1 current music intensity
            targetIntensity: 0.5,        // Target intensity to reach
            bassLevel: 0.5,              // Bass/drums intensity
            melodyLevel: 0.5,            // Melody complexity
            effectsLevel: 0.5,           // Sound effects volume
            bpm: 120,                    // Base beats per minute
            targetBpm: 120,              // Target BPM to reach
            adaptationRate: 0.02,        // How fast audio adapts
            contextualLayers: {
                danger: 0,               // Danger level (0-1)
                flow: 0,                 // Flow state level (0-1)
                tension: 0,              // Tension/suspense (0-1)
                triumph: 0               // Success/celebration (0-1)
            },
            dynamicFrequencies: [],      // For procedural audio
            lastBeat: 0,
            nextBeatTime: 0
        };
        
        // ADVANCED GRAPHICS: Shader-Style Effects System
        this.advancedGraphics = {
            shaderEffects: {
                distortion: 0,           // Screen distortion
                colorSeparation: 0,      // RGB separation
                scanlines: 0.3,          // CRT scanlines
                pixelation: 0,           // Pixel effect
                edgeGlow: 0.5,           // Edge lighting
                filmGrain: 0.2,          // Noise texture
                heatDistortion: 0,       // Heat wave effect
                lightRays: 0.4           // Volumetric lighting
            },
            dynamicLighting: {
                ambientColor: [0.3, 0.4, 0.6],  // RGB ambient
                directionalLight: {
                    direction: [-0.5, -0.8, 0.3],
                    color: [1.0, 0.9, 0.7],
                    intensity: 0.8
                },
                pointLights: [],
                shadowQuality: 0.8,
                lightBounces: 1
            },
            materialSystem: {
                player: { roughness: 0.3, metallic: 0.1, emission: 0.2 },
                obstacles: { roughness: 0.8, metallic: 0.0, emission: 0.0 },
                powerups: { roughness: 0.1, metallic: 0.9, emission: 0.8 },
                background: { roughness: 0.9, metallic: 0.0, emission: 0.1 }
            },
            renderPipeline: {
                depthBuffer: [],
                normalBuffer: [],
                colorBuffer: [],
                effectsBuffer: [],
                compositeMode: 'advanced'
            }
        };
        this.parallaxLayers = [];
        this.particles = [];
        this.lightSources = [];
        this.time = 0;
        
        // INSTANT GRATIFICATION SYSTEM FOR MAXIMUM FUN
        this.instantFeedback = {
            perfectTimingWindow: 150, // ms window for "Perfect!" feedback
            lastActionTime: 0,
            perfectStreak: 0,
            recentActions: [], // Track timing for combo detection
            visualRewards: [], // Active screen celebrations
            soundQueue: [], // Satisfying audio feedback queue
            juiceLevel: 1.0, // Overall "game juice" intensity multiplier
            screenShakeIntensity: 1.0,
            satisfactionScore: 100 // Player satisfaction level
        };
        
        // MICRO-ACHIEVEMENT SYSTEM - Dopamine Hits Every 10-15 Seconds
        this.microAchievements = {
            recentUnlocks: [],
            nextAchievementTime: Date.now() + 8000, // Next micro-achievement in 8s
            actionCounter: 0,
            streakRewards: {
                3: { name: "Nice Start!", color: "#10b981", particles: 12, score: 50 },
                5: { name: "Getting Warmed Up!", color: "#3b82f6", particles: 18, score: 100 },
                8: { name: "On Fire! 🔥", color: "#f59e0b", particles: 25, score: 200 },
                12: { name: "Unstoppable!", color: "#ef4444", particles: 35, score: 350 },
                15: { name: "LEGENDARY RUN! ⭐", color: "#8b5cf6", particles: 50, score: 500 },
                20: { name: "GOD MODE! 👑", color: "#fbbf24", particles: 75, score: 1000 }
            },
            quickRewards: [
                { name: "Style Points!", action: "perfect_landing", reward: 150, color: "#06d6a0" },
                { name: "Close Call Master!", action: "near_miss_combo", reward: 200, color: "#f72585" },
                { name: "Speed Demon!", action: "max_speed_hit", reward: 100, color: "#ff006e" },
                { name: "Combo Artist!", action: "combo_builder", reward: 175, color: "#8338ec" },
                { name: "Air Time Pro!", action: "long_jump", reward: 125, color: "#3a86ff" },
                { name: "Smooth Operator!", action: "clean_run", reward: 225, color: "#06ffa5" }
            ]
        };
        
        // VISUAL JUICE SYSTEM - Screen Effects for Satisfaction
        this.visualJuice = {
            screenPulse: 0,
            chromaticShift: 0,
            particleBurst: 0,
            timeDistortion: 0,
            glowIntensity: 0,
            cameraZoom: 1.0,
            colorSaturation: 1.0,
            celebrationQueue: []
        };
        
        this.enhancedLighting = {
            globalAmbient: { r: 0.2, g: 0.2, b: 0.3, intensity: 0.4 },
            keyLight: { x: 0.3, y: 0.1, intensity: 0.8, color: { r: 1, g: 0.95, b: 0.8 } },
            fillLight: { x: 0.7, y: 0.3, intensity: 0.3, color: { r: 0.8, g: 0.9, b: 1 } },
            rimLight: { x: 0.9, y: 0.2, intensity: 0.6, color: { r: 1, g: 0.8, b: 0.6 } },
            shadowCascades: []
        };
        this.weatherSystem = {
            type: 'clear', // 'rain', 'snow', 'wind'
            intensity: 0,
            particles: []
        };
        this.dustClouds = [];
        this.speedLines = [];
        this.perspective = {
            horizon: 0.6, // 60% vom Bildschirm
            depth: 0.8,   // Tiefenfaktor
            vanishingPoint: { x: 0.5, y: 0.6 }
        };
        this.motionBlur = 0;
        this.chromaticAberration = 0;
        this.shadowSystem = { enabled: true, intensity: 0.3 };
        this.postProcessing = {
            motionBlur: 0,
            chromaticAberration: 0,
            colorGrading: { hue: 0, saturation: 1, brightness: 1 },
            vignette: 0,
            bloom: 0,
            scanlines: false,
            glitch: 0,
            distortion: 0,
            filmGrain: 0
        };
        
        this.initializeParallax();
        this.initializeEventListeners();
        this.generateInitialClouds();
        this.initializeObstaclePatterns();
        this.initializeAchievements();
        this.initializeDailyChallenges();
        this.initializeSounds();
        
        // Initialize head tracking
        this.headTracking = null;
        this.headTrackingEnabled = false;
        
        // Initialize fun systems
        this.initializeFunSystems();
        
        this.gameLoop();
    }
    
    // =====================================
    // FUN SYSTEMS - INSTANT GRATIFICATION
    // =====================================
    
    initializeFunSystems() {
        // Clean up old micro-achievements over time
        setInterval(() => {
            this.microAchievements.recentUnlocks = this.microAchievements.recentUnlocks.filter(
                unlock => Date.now() - unlock.time < 3000
            );
        }, 1000);
        
        // Auto-trigger micro-achievements
        setInterval(() => {
            this.checkTimedMicroAchievements();
        }, 5000);
    }
    
    triggerPerfectTiming(message, timeDelta) {
        this.instantFeedback.perfectStreak++;
        
        // Visual celebration
        this.triggerMicroCelebration(message, '#ffd700', 30);
        
        // Screen juice effects
        this.visualJuice.screenPulse = 0.3;
        this.visualJuice.chromaticShift = 0.2;
        this.visualJuice.timeDistortion = 0.1;
        
        // ENHANCED AUDIO FEEDBACK for perfect timing
        this.playSound('perfect_timing');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([30, 20, 40]);
        }
        
        // Satisfaction boost
        this.instantFeedback.satisfactionScore = Math.min(150, this.instantFeedback.satisfactionScore + 10);
    }
    
    triggerVisualJuice(actionType, intensity = 1.0) {
        const juice = this.visualJuice;
        
        switch(actionType) {
            case 'jump':
                juice.screenPulse = Math.max(juice.screenPulse, 0.15 * intensity);
                juice.cameraZoom = 1.0 + (0.05 * intensity);
                juice.glowIntensity = Math.max(juice.glowIntensity, 0.3 * intensity);
                break;
                
            case 'combo':
                juice.particleBurst = intensity;
                juice.colorSaturation = 1.0 + (0.2 * intensity);
                juice.chromaticShift = 0.1 * intensity;
                break;
                
            case 'perfect':
                juice.screenPulse = 0.4 * intensity;
                juice.timeDistortion = 0.2 * intensity;
                juice.glowIntensity = 0.6 * intensity;
                break;
        }
        
        // Auto-decay visual effects
        setTimeout(() => {
            Object.keys(juice).forEach(key => {
                if (typeof juice[key] === 'number') {
                    juice[key] *= 0.7;
                }
            });
        }, 200);
    }
    
    triggerMicroCelebration(message, color, particleCount = 15) {
        // Add to celebration queue
        this.visualJuice.celebrationQueue.push({
            message: message,
            color: color,
            time: Date.now(),
            duration: 2000,
            x: this.player.x + this.player.width / 2,
            y: this.player.y - 50
        });
        
        // Particle explosion
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            color,
            'explosion',
            particleCount
        );
        
        // Screen effect
        this.screenFlash = Math.min(this.screenFlash + 0.1, 0.3);
    }
    
    checkMicroAchievements() {
        const actions = this.microAchievements.actionCounter;
        const now = Date.now();
        
        // Streak-based rewards
        for (let [threshold, reward] of Object.entries(this.microAchievements.streakRewards)) {
            if (actions == parseInt(threshold)) {
                this.triggerMicroAchievement(reward);
                break;
            }
        }
        
        // Check for quick rewards based on recent actions
        this.checkQuickRewards();
        
        // Time-based micro-achievement
        if (now >= this.microAchievements.nextAchievementTime) {
            this.triggerRandomMicroAchievement();
            this.microAchievements.nextAchievementTime = now + (8000 + Math.random() * 7000); // 8-15s
        }
    }
    
    checkQuickRewards() {
        const recentActions = this.instantFeedback.recentActions.slice(-5);
        const perfectCount = recentActions.filter(a => a.perfect).length;
        
        if (perfectCount >= 3) {
            const reward = this.microAchievements.quickRewards.find(r => r.action === 'perfect_combo');
            if (reward) this.triggerMicroAchievement(reward);
        }
        
        if (this.speed >= this.maxSpeed * 0.9) {
            const reward = this.microAchievements.quickRewards.find(r => r.action === 'max_speed_hit');
            if (reward) this.triggerMicroAchievement(reward);
        }
        
        if (this.combo >= 8) {
            const reward = this.microAchievements.quickRewards.find(r => r.action === 'combo_builder');
            if (reward) this.triggerMicroAchievement(reward);
        }
    }
    
    triggerMicroAchievement(achievement) {
        const now = Date.now();
        
        // Avoid spam
        const recent = this.microAchievements.recentUnlocks.find(
            unlock => unlock.name === achievement.name && now - unlock.time < 5000
        );
        if (recent) return;
        
        // Add to recent unlocks
        this.microAchievements.recentUnlocks.push({
            name: achievement.name,
            time: now,
            color: achievement.color
        });
        
        // Trigger celebration
        this.triggerMicroCelebration(achievement.name, achievement.color, achievement.particles || 20);
        
        // Award score
        if (achievement.score) {
            this.score += achievement.score;
            this.showInstantScorePopup(achievement.score, this.gameWidth / 2, this.gameHeight / 3, true);
            
            // ENHANCED AUDIO FEEDBACK for micro-achievements
            this.playSound('micro_achievement');
        }
        
        // Boost satisfaction
        this.instantFeedback.satisfactionScore = Math.min(150, this.instantFeedback.satisfactionScore + 15);
    }
    
    triggerRandomMicroAchievement() {
        const motivationalMessages = [
            { name: "Keep Going! 💪", color: "#10b981", score: 75 },
            { name: "You're Awesome! ⭐", color: "#3b82f6", score: 100 },
            { name: "Feeling Good! 😎", color: "#f59e0b", score: 85 },
            { name: "In The Zone! 🎯", color: "#ef4444", score: 90 },
            { name: "Pure Skill! 🔥", color: "#8b5cf6", score: 110 }
        ];
        
        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        this.triggerMicroAchievement(message);
    }
    
    showInstantScorePopup(score, x, y, isPerfect = false) {
        // Create floating score text
        const popup = {
            score: score,
            x: x,
            y: y,
            life: 1.0,
            velocityY: -2,
            isPerfect: isPerfect,
            color: isPerfect ? '#ffd700' : '#00ff88',
            size: isPerfect ? 24 : 18
        };
        
        // Add to visual rewards array
        this.instantFeedback.visualRewards.push(popup);
    }
    
    updateFunSystems() {
        // Update visual juice effects
        this.updateVisualJuice();
        
        // Update floating score popups
        this.updateScorePopups();
        
        // Update micro-celebration queue
        this.updateCelebrations();
        
        // Decay satisfaction over time
        this.instantFeedback.satisfactionScore = Math.max(50, this.instantFeedback.satisfactionScore - 0.1);
    }
    
    updateVisualJuice() {
        const juice = this.visualJuice;
        
        // Auto-decay all effects
        Object.keys(juice).forEach(key => {
            if (typeof juice[key] === 'number' && key !== 'colorSaturation') {
                juice[key] = Math.max(0, juice[key] * 0.95);
            }
        });
        
        // Reset camera zoom and color saturation
        juice.cameraZoom = Math.max(1.0, juice.cameraZoom * 0.95);
        juice.colorSaturation = Math.max(1.0, juice.colorSaturation * 0.98);
    }
    
    updateScorePopups() {
        for (let i = this.instantFeedback.visualRewards.length - 1; i >= 0; i--) {
            const popup = this.instantFeedback.visualRewards[i];
            
            popup.life -= 0.02;
            popup.y += popup.velocityY;
            popup.velocityY *= 0.98;
            
            if (popup.life <= 0) {
                this.instantFeedback.visualRewards.splice(i, 1);
            }
        }
    }
    
    // INSTANT FEEDBACK RENDERING - Visual juice for enhanced fun
    renderFloatingScorePopups() {
        this.ctx.save();
        
        for (const popup of this.instantFeedback.visualRewards) {
            const alpha = Math.max(0, popup.life);
            const scale = popup.isPerfect ? 1.2 + (1 - popup.life) * 0.3 : 1.0;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.font = `bold ${popup.size * scale}px Arial`;
            this.ctx.fillStyle = popup.color;
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.textAlign = 'center';
            
            // Perfect timing gets special effects
            if (popup.isPerfect) {
                this.ctx.shadowColor = popup.color;
                this.ctx.shadowBlur = 10;
                this.ctx.strokeText(`+${popup.score}`, popup.x, popup.y);
            }
            
            this.ctx.fillText(`+${popup.score}`, popup.x, popup.y);
            this.ctx.shadowBlur = 0;
        }
        
        this.ctx.restore();
    }
    
    renderMicroCelebrations() {
        this.ctx.save();
        
        for (const celebration of this.visualJuice.celebrationQueue) {
            const age = (Date.now() - celebration.time) / celebration.duration;
            const alpha = Math.max(0, 1 - age);
            const scale = 1 + age * 0.5;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.font = `bold ${20 * scale}px Arial`;
            this.ctx.fillStyle = celebration.color;
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = celebration.color;
            this.ctx.shadowBlur = 8;
            
            this.ctx.fillText(celebration.message, celebration.x, celebration.y - age * 30);
        }
        
        this.ctx.restore();
    }

    updateCelebrations() {
        const now = Date.now();
        this.visualJuice.celebrationQueue = this.visualJuice.celebrationQueue.filter(
            celebration => now - celebration.time < celebration.duration
        );
    }
    
    // =====================================
    // ADVANCED SYSTEMS INITIALIZATION
    // =====================================
    
    initializeObjectPools() {
        // Create object pools for performance optimization
        this.objectPools = {};
        
        // Particle pool
        this.objectPools.particles = new ObjectPool(
            () => ({
                x: 0, y: 0, velocityX: 0, velocityY: 0,
                life: 1, maxLife: 1, size: 1, color: '#fff',
                type: 'default', active: false
            }),
            (particle) => {
                particle.active = false;
                particle.life = 1;
                particle.maxLife = 1;
            },
            100
        );
        
        // Obstacle pool
        this.objectPools.obstacles = new ObjectPool(
            () => ({
                x: 0, y: 0, width: 40, height: 40,
                type: 'box', color: '#8b4513', active: false
            }),
            (obstacle) => {
                obstacle.active = false;
            },
            20
        );
        
        // Powerup pool
        this.objectPools.powerups = new ObjectPool(
            () => ({
                x: 0, y: 0, width: 25, height: 25,
                type: 'coin', color: '#ffd700', rotation: 0,
                pulsePhase: 0, active: false
            }),
            (powerup) => {
                powerup.active = false;
                powerup.rotation = 0;
                powerup.pulsePhase = 0;
            },
            30
        );
        
        console.log('Object pools initialized:', Object.keys(this.objectPools));
    }
    
    initializeSafeSystems() {
        // Wrap critical systems with error resilience
        this.safeSystems = {};
        
        this.safeSystems.renderer = new SafeSystemWrapper(
            this,
            'Renderer',
            () => {
                console.warn('Renderer fallback: skipping frame');
                return null;
            }
        );
        
        this.safeSystems.physics = new SafeSystemWrapper(
            this,
            'Physics',
            () => {
                console.warn('Physics fallback: maintaining last state');
                return null;
            }
        );
        
        this.safeSystems.audio = new SafeSystemWrapper(
            this,
            'Audio',
            () => {
                console.warn('Audio fallback: silent mode');
                return null;
            }
        );
        
        console.log('Safe system wrappers initialized');
    }
    
    // Enhanced particle creation using object pools
    createPooledParticle(x, y, color, type, count = 1) {
        if (!this.objectPools || !this.objectPools.particles) {
            return this.createAdvancedParticles(x, y, color, type, count);
        }
        
        for (let i = 0; i < count; i++) {
            const particle = this.objectPools.particles.acquire();
            
            particle.x = x + (Math.random() - 0.5) * 20;
            particle.y = y + (Math.random() - 0.5) * 20;
            particle.velocityX = (Math.random() - 0.5) * 8;
            particle.velocityY = (Math.random() - 0.5) * 8;
            particle.color = color;
            particle.type = type;
            particle.life = 1;
            particle.maxLife = 0.5 + Math.random() * 1.5;
            particle.size = 2 + Math.random() * 4;
            particle.active = true;
            
            this.particles.push(particle);
        }
    }
    
    // Enhanced particle cleanup
    updatePooledParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.life -= 0.016;
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // gravity
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                
                // Return to pool if it's a pooled object
                if (particle._pooled && this.objectPools.particles) {
                    this.objectPools.particles.release(particle);
                }
            }
        }
    }
    
    setupCanvas() {
        const container = document.getElementById('gameContainer');
        const containerRect = container.getBoundingClientRect();
        
        // ENHANCED DEVICE DETECTION
        this.deviceInfo = this.detectDeviceCapabilities();
        
        // ADAPTIVE CANVAS SIZING BASED ON DEVICE TYPE
        const { width, height } = this.calculateOptimalCanvasSize(containerRect);
        
        // Apply sizing with performance considerations
        const pixelRatio = this.getOptimalPixelRatio();
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // ENHANCED CANVAS CONTEXT SETUP
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        this.ctx.scale(pixelRatio, pixelRatio);
        
        // Enable crisp rendering on high-DPI displays
        if (pixelRatio > 1) {
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.webkitImageSmoothingEnabled = false;
            this.ctx.mozImageSmoothingEnabled = false;
        }
        
        // ADAPTIVE GAME WORLD DIMENSIONS
        this.gameWidth = this.canvas.width / pixelRatio;
        this.gameHeight = this.canvas.height / pixelRatio;
        
        // DEVICE-SPECIFIC OPTIMIZATIONS
        this.applyDeviceOptimizations();
        
        // ADAPTIVE GAME ELEMENT POSITIONING
        this.adaptGameElementsToScreen();
        
        console.log(`Canvas setup: ${width}x${height} (${this.deviceInfo.type}, ${this.deviceInfo.category})`);
    }
    
    detectDeviceCapabilities() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Enhanced device type detection with iPad focus
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isIPad = /iPad/i.test(userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(userAgent));
        const isTablet = isIPad || (isMobile && (Math.min(screenWidth, screenHeight) >= 768));
        const isPhone = isMobile && !isTablet;
        const isDesktop = !isMobile;
        
        // Screen category detection
        let category = 'standard';
        if (screenWidth >= 3840) category = '4k';
        else if (screenWidth >= 2560) category = 'ultrawide';
        else if (screenWidth >= 1920) category = 'fullhd';
        else if (screenWidth >= 1200) category = 'laptop';
        else if (screenWidth >= 768) category = 'tablet';
        else category = 'mobile';
        
        // Performance estimation with detailed categorization
        const estimatedPerformance = this.estimateDevicePerformance(pixelRatio, screenWidth, userAgent);
        const performanceCategory = this.categorizeDevicePerformance(estimatedPerformance, userAgent, screenWidth);
        
        return {
            type: isPhone ? 'phone' : isTablet ? 'tablet' : 'desktop',
            category,
            isMobile,
            isTablet,
            isPhone,
            isDesktop,
            isIPad,
            screenWidth,
            screenHeight,
            viewportWidth,
            viewportHeight,
            pixelRatio,
            performance: estimatedPerformance,
            hasTouch: 'ontouchstart' in window,
            hasKeyboard: !isMobile || isTablet,
            orientation: viewportWidth > viewportHeight ? 'landscape' : 'portrait',
            supportsHaptic: 'vibrate' in navigator,
            supportsForceTouch: false, // Will be set dynamically during touch events
            maxTouchPoints: navigator.maxTouchPoints || 1,
            platform: navigator.platform || 'unknown',
            category: isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone',
            performanceCategory: performanceCategory,
            cpuCores: navigator.hardwareConcurrency || 1,
            memoryGB: navigator.deviceMemory || 1,
            // iPad-specific optimizations
            iPadModel: this.detectIPadGeneration(userAgent, screenWidth, screenHeight, pixelRatio),
            supportsWebGL2: !!window.WebGL2RenderingContext,
            gpuTier: this.estimateGPUPerformance(userAgent, isIPad)
        };
    }
    
    detectIPadGeneration(userAgent, width, height, pixelRatio) {
        if (!/iPad/i.test(userAgent) && !(/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)) {
            return null;
        }
        
        // iPad generation detection based on screen characteristics
        const screenSize = Math.max(width, height);
        
        if (screenSize >= 1366 && pixelRatio >= 2) return 'iPad Pro 12.9" (2018+)'; // M1/M2 iPads
        if (screenSize >= 1194 && pixelRatio >= 2) return 'iPad Air (2020+)';        // A14+ iPads  
        if (screenSize >= 1112 && pixelRatio >= 2) return 'iPad Pro 11" (2018+)';    // A12X+ iPads
        if (screenSize >= 1024 && pixelRatio >= 2) return 'iPad (2017+)';            // A9+ iPads
        if (screenSize >= 1024) return 'iPad (Classic)';                             // Older iPads
        
        return 'iPad (Unknown)';
    }
    
    estimateGPUPerformance(userAgent, isIPad) {
        if (!isIPad) {
            // Non-iPad device GPU estimation
            return window.WebGL2RenderingContext ? 2 : 1;
        }
        
        // iPad-specific GPU performance estimation
        const currentYear = new Date().getFullYear();
        const screenPixels = window.screen.width * window.screen.height * (window.devicePixelRatio || 1);
        
        // M1/M2 iPad Pro and Air detection (highest performance)
        if (screenPixels >= 5000000 && currentYear >= 2021) return 4; // M-series iPads
        
        // A12X/A14 iPads (high performance)  
        if (screenPixels >= 3000000 && currentYear >= 2018) return 3; // Recent iPad Pros
        
        // A10/A11 iPads (medium performance)
        if (screenPixels >= 2000000 && currentYear >= 2016) return 2; // Mid-range iPads
        
        return 1; // Older iPads
    }
    
    estimateDevicePerformance(pixelRatio, screenWidth, userAgent) {
        let score = 100; // Base score
        
        // Pixel ratio impact
        if (pixelRatio > 2) score -= 20;
        else if (pixelRatio > 1.5) score -= 10;
        
        // Resolution impact
        if (screenWidth >= 3840) score -= 30; // 4K
        else if (screenWidth >= 2560) score -= 20; // QHD+
        else if (screenWidth >= 1920) score -= 10; // Full HD
        
        // Device-specific adjustments
        if (/iPhone/.test(userAgent)) {
            if (/iPhone 1[2-9]/.test(userAgent)) score += 20; // Modern iPhones
            else score -= 10; // Older iPhones
        }
        
        if (/iPad/.test(userAgent)) score += 10;
        if (/Android/.test(userAgent)) score -= 5; // Generally more varied performance
        
        return Math.max(20, Math.min(100, score)); // Clamp between 20-100
    }
    
    categorizeDevicePerformance(score, userAgent, screenWidth) {
        // Detailed performance categorization for adaptive quality
        
        // HIGH-END: Latest devices, powerful hardware
        if (score >= 85) {
            return 'high_end';
        }
        
        // MID-RANGE: Standard modern devices
        if (score >= 65) {
            return 'mid_range';
        }
        
        // LOW-END: Older devices, budget hardware
        if (score >= 45) {
            return 'low_end';
        }
        
        // LEGACY: Very old/weak devices
        return 'legacy';
    }
    
    initializeAdaptivePerformance() {
        // PERFORMANCE BUDGETS for different device categories
        const budgets = {
            high_end: {
                maxParticles: 200,
                particleComplexity: 1.0,
                postProcessing: true,
                advancedEffects: true,
                shadowSystem: true,
                targetFPS: 60,
                cullingDistance: 1200,
                maxTrails: 50,
                enableShaderEffects: true,
                particlePhysics: true
            },
            mid_range: {
                maxParticles: 120,
                particleComplexity: 0.8,
                postProcessing: true,
                advancedEffects: true,
                shadowSystem: true,
                targetFPS: 45,
                cullingDistance: 1000,
                maxTrails: 30,
                enableShaderEffects: false,
                particlePhysics: true
            },
            low_end: {
                maxParticles: 60,
                particleComplexity: 0.6,
                postProcessing: false,
                advancedEffects: false,
                shadowSystem: false,
                targetFPS: 30,
                cullingDistance: 800,
                maxTrails: 15,
                enableShaderEffects: false,
                particlePhysics: false
            },
            legacy: {
                maxParticles: 25,
                particleComplexity: 0.4,
                postProcessing: false,
                advancedEffects: false,
                shadowSystem: false,
                targetFPS: 20,
                cullingDistance: 600,
                maxTrails: 8,
                enableShaderEffects: false,
                particlePhysics: false
            }
        };
        
        const category = this.deviceInfo.performanceCategory;
        const budget = budgets[category] || budgets.mid_range;
        
        // Apply performance budget
        this.performanceBudget = budget;
        this.performance.maxParticles = budget.maxParticles;
        this.performance.targetFPS = budget.targetFPS;
        this.performance.cullDistance = budget.cullingDistance;
        
        // Configure systems based on budget
        this.configureAdaptiveSystems();
        
        console.log(`Performance Budget Applied: ${category}`, budget);
    }
    
    configureAdaptiveSystems() {
        const budget = this.performanceBudget;
        
        // PARTICLE SYSTEM CONFIGURATION
        this.adaptiveParticles = {
            enabled: true,
            maxCount: budget.maxParticles,
            complexity: budget.particleComplexity,
            physicsEnabled: budget.particlePhysics,
            trailLimit: budget.maxTrails,
            emissionRate: budget.particleComplexity
        };
        
        // GRAPHICS SYSTEM CONFIGURATION
        this.adaptiveGraphics = {
            postProcessing: budget.postProcessing,
            shadows: budget.shadowSystem,
            advancedEffects: budget.advancedEffects,
            shaderEffects: budget.enableShaderEffects,
            bloomEnabled: budget.postProcessing,
            motionBlur: budget.postProcessing && budget.advancedEffects
        };
        
        // PHYSICS SYSTEM CONFIGURATION
        this.adaptivePhysics = {
            collisionPrecision: budget.particleComplexity,
            updateFrequency: Math.max(30, budget.targetFPS),
            spatialOptimization: budget.cullingDistance
        };
        
        // AUDIO SYSTEM CONFIGURATION
        this.adaptiveAudio = {
            enabled: true,
            simultaneousSounds: Math.floor(budget.maxParticles / 10),
            volumeReduction: category === 'legacy' ? 0.7 : 1.0
        };
    }
    
    calculateOptimalCanvasSize(containerRect) {
        const device = this.deviceInfo;
        let width, height;
        
        if (device.isMobile) {
            // Mobile: Full viewport with safe areas
            width = device.viewportWidth;
            height = device.viewportHeight;
            
            // Account for safe areas on modern phones
            if (device.isPhone && 'CSS' in window && 'supports' in CSS) {
                if (CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')) {
                    height -= 20; // Rough safe area compensation
                }
            }
        } else {
            // Desktop: Responsive with device-specific limits
            const limits = this.getDesktopCanvasLimits(device.category);
            const aspectRatio = limits.maxWidth / limits.maxHeight;
            
            width = Math.min(containerRect.width * limits.widthRatio, limits.maxWidth);
            height = width / aspectRatio;
            
            if (height > containerRect.height * limits.heightRatio) {
                height = containerRect.height * limits.heightRatio;
                width = height * aspectRatio;
            }
        }
        
        return { width: Math.floor(width), height: Math.floor(height) };
    }
    
    getDesktopCanvasLimits(category) {
        const limits = {
            '4k': { maxWidth: 1600, maxHeight: 900, widthRatio: 0.8, heightRatio: 0.85 },
            'ultrawide': { maxWidth: 1400, maxHeight: 800, widthRatio: 0.75, heightRatio: 0.8 },
            'fullhd': { maxWidth: 1200, maxHeight: 700, widthRatio: 0.85, heightRatio: 0.75 },
            'laptop': { maxWidth: 1000, maxHeight: 600, widthRatio: 0.9, heightRatio: 0.7 },
            'standard': { maxWidth: 800, maxHeight: 600, widthRatio: 0.9, heightRatio: 0.7 }
        };
        
        return limits[category] || limits.standard;
    }
    
    getOptimalPixelRatio() {
        const device = this.deviceInfo;
        const baseRatio = window.devicePixelRatio || 1;
        
        // Performance-based pixel ratio adjustment
        if (device.performance < 50) {
            return Math.min(baseRatio, 1.5); // Limit for low-performance devices
        } else if (device.performance < 75) {
            return Math.min(baseRatio, 2); // Moderate limitation
        }
        
        return baseRatio; // Full resolution for high-performance devices
    }
    
    applyDeviceOptimizations() {
        const device = this.deviceInfo;
        
        // IPAD-SPECIFIC PERFORMANCE OPTIMIZATIONS
        if (device.isIPad) {
            this.applyIPadOptimizations(device);
        }
        
        // Performance-based optimizations
        if (device.performance < 60) {
            this.performance.maxParticles = Math.floor(this.performance.maxParticles * 0.7);
            this.performance.lowPerformanceMode = true;
        }
        
        // Mobile-specific optimizations
        if (device.isMobile) {
            // Reduce particle count on mobile
            this.performance.maxParticles = Math.floor(this.performance.maxParticles * 0.8);
            
            // Simplify effects on phones (but keep quality high for tablets)
            if (device.isPhone) {
                this.shadowSystem.enabled = false;
                this.postProcessing.filmGrain = 0;
                this.postProcessing.scanlines = false;
            }
        }
        
        // Touch optimizations
        if (device.hasTouch) {
            // Increase touch target sizes
            this.touchTargetScale = device.isPhone ? 1.2 : 1.0;
            
            // Enhanced gesture sensitivity
            this.gestureDetection.minSwipeDistance = device.isPhone ? 30 : 50;
        }
        
        // GPU-tier based optimizations
        this.applyGPUTierOptimizations(device.gpuTier);
    }
    
    applyIPadOptimizations(device) {
        // iPad-specific performance and visual optimizations
        const gpuTier = device.gpuTier;
        const pixelRatio = device.pixelRatio;
        
        if (gpuTier >= 3) {
            // High-end iPads (M1/M2, A12X+) - Enable all features
            this.performance.qualityPresets.current = 'ultra';
            this.performance.maxParticles = 200;
            this.shadowSystem.enabled = true;
            this.shadowSystem.quality = 'high';
            this.postProcessing.enabled = true;
            this.postProcessing.bloom = 0.8;
            this.postProcessing.chromaticAberration = 0.3;
            
            // Enable advanced graphics features
            this.advancedGraphics.shaderEffects.enabled = true;
            this.advancedGraphics.dynamicLighting.enabled = true;
            this.advancedGraphics.volumetricEffects = true;
            
        } else if (gpuTier >= 2) {
            // Mid-range iPads (A10/A11) - Balanced quality
            this.performance.qualityPresets.current = 'high';
            this.performance.maxParticles = 150;
            this.shadowSystem.enabled = true;
            this.shadowSystem.quality = 'medium';
            this.postProcessing.enabled = true;
            this.postProcessing.bloom = 0.6;
            
        } else {
            // Older iPads - Optimize for performance
            this.performance.qualityPresets.current = 'medium';
            this.performance.maxParticles = 100;
            this.shadowSystem.enabled = false;
            this.postProcessing.enabled = false;
        }
        
        // iPad-specific canvas optimizations
        if (pixelRatio > 2) {
            // High-DPI iPads - intelligent downscaling for performance
            this.canvas.style.imageRendering = 'pixelated';
        }
        
        // Memory management for iPads
        this.setupIPadMemoryManagement(device.memoryGB);
        
        console.log(`iPad optimizations applied: ${device.iPadModel}, GPU Tier: ${gpuTier}`);
    }
    
    applyGPUTierOptimizations(gpuTier) {
        switch(gpuTier) {
            case 4: // Highest tier (M1/M2 iPads)
                this.performance.renderBudget = 8.33; // 120 FPS target
                this.performance.cullingEnabled = false; // No need to cull on high-end
                break;
            case 3: // High tier (A12X/A14 iPads)
                this.performance.renderBudget = 16.67; // 60 FPS target
                this.performance.cullingEnabled = true;
                this.performance.cullDistance = 1500;
                break;
            case 2: // Medium tier (A10/A11 iPads)
                this.performance.renderBudget = 33.33; // 30 FPS target
                this.performance.cullingEnabled = true;
                this.performance.cullDistance = 1000;
                break;
            default: // Low tier
                this.performance.renderBudget = 50; // 20 FPS target
                this.performance.cullingEnabled = true;
                this.performance.cullDistance = 800;
        }
    }
    
    setupIPadMemoryManagement(memoryGB) {
        // Adjust object pools based on available memory
        const poolSizeMultiplier = Math.min(2.0, memoryGB / 4); // Scale based on 4GB baseline
        
        if (this.objectPools) {
            Object.values(this.objectPools).forEach(pool => {
                pool.maxSize = Math.floor(pool.maxSize * poolSizeMultiplier);
            });
        }
        
        // Memory cleanup intervals
        if (memoryGB < 3) {
            // Aggressive cleanup on low-memory iPads
            setInterval(() => this.forceGarbageCollection(), 30000);
        }
    }
    
    forceGarbageCollection() {
        // Force cleanup of unused particles and objects
        this.particles = this.particles.filter(p => p.life > 0);
        this.obstacles = this.obstacles.filter(o => o.x > -200);
        this.powerups = this.powerups.filter(p => p.x > -200);
        
        // Trigger garbage collection hint if available
        if (window.gc) {
            window.gc();
        }
    }
    
    adaptGameElementsToScreen() {
        const device = this.deviceInfo;
        
        // ADAPTIVE PLAYER POSITIONING
        if (this.player) {
            const relativeX = device.isMobile ? 0.2 : 0.15;
            const relativeY = device.isMobile ? 0.7 : 0.65;
            
            this.player.x = Math.min(this.player.x || this.gameWidth * relativeX, this.gameWidth * relativeX);
            this.player.y = Math.min(this.player.y || this.gameHeight * relativeY, this.gameHeight * relativeY);
            
            // Scale player size for very small screens
            if (device.isPhone && device.viewportWidth < 400) {
                this.player.width = Math.max(30, this.player.width * 0.8);
                this.player.height = Math.max(45, this.player.height * 0.8);
            }
        }
        
        // ADAPTIVE GROUND POSITIONING
        if (this.ground) {
            this.ground.y = this.gameHeight - (device.isMobile ? 100 : 140);
            this.ground.height = device.isMobile ? 100 : 140;
        }
        
        // ADAPTIVE UI SCALING
        this.uiScale = this.calculateUIScale(device);
        
        // Update camera bounds
        if (this.camera) {
            this.camera.bounds = {
                minX: 0,
                maxX: this.gameWidth,
                minY: 0,
                maxY: this.gameHeight
            };
        }
    }
    
    calculateUIScale(device) {
        if (device.isPhone) {
            if (device.viewportWidth < 400) return 0.8;
            if (device.viewportWidth < 500) return 0.9;
            return 1.0;
        } else if (device.isTablet) {
            return 1.1;
        } else {
            // Desktop scaling based on resolution
            if (device.category === '4k') return 1.4;
            if (device.category === 'ultrawide') return 1.2;
            return 1.0;
        }
    }
    
    initializeParallax() {
        // ENHANCED PARALLAX SYSTEM: More layers for massive depth
        this.parallaxLayers = [
            { elements: [], speed: 0.05, type: 'far_mountains', color: '#6b7280', alpha: 0.3 },
            { elements: [], speed: 0.1, type: 'mountains', color: '#4a5568', alpha: 0.6 },
            { elements: [], speed: 0.15, type: 'clouds', color: '#f8fafc', alpha: 0.7 },
            { elements: [], speed: 0.25, type: 'distant_hills', color: '#a7f3d0', alpha: 0.5 },
            { elements: [], speed: 0.3, type: 'hills', color: '#68d391', alpha: 0.8 },
            { elements: [], speed: 0.45, type: 'far_trees', color: '#4ade80', alpha: 0.6 },
            { elements: [], speed: 0.6, type: 'trees', color: '#38a169', alpha: 0.9 },
            { elements: [], speed: 0.75, type: 'mid_bushes', color: '#22c55e', alpha: 0.8 },
            { elements: [], speed: 0.8, type: 'bushes', color: '#2f855a', alpha: 1.0 },
            { elements: [], speed: 0.9, type: 'grass', color: '#15803d', alpha: 1.0 }
        ];
        
        for (let layer of this.parallaxLayers) {
            for (let i = 0; i < 15; i++) {
                let element = {
                    x: Math.random() * this.canvas.width * 4,
                    y: 300 + Math.random() * 100
                };
                
                switch(layer.type) {
                    case 'far_mountains':
                        element.width = 120 + Math.random() * 200;
                        element.height = 80 + Math.random() * 100;
                        element.y = 150 + Math.random() * 80;
                        break;
                    case 'mountains':
                        element.width = 80 + Math.random() * 120;
                        element.height = 100 + Math.random() * 150;
                        element.y = 200 + Math.random() * 100;
                        break;
                    case 'clouds':
                        element.width = 40 + Math.random() * 80;
                        element.height = 20 + Math.random() * 30;
                        element.y = 50 + Math.random() * 150;
                        element.driftSpeed = 0.2 + Math.random() * 0.3;
                        element.verticalOffset = Math.random() * Math.PI * 2;
                        break;
                    case 'distant_hills':
                        element.width = 70 + Math.random() * 100;
                        element.height = 40 + Math.random() * 60;
                        element.y = 280 + Math.random() * 80;
                        break;
                    case 'hills':
                        element.width = 60 + Math.random() * 80;
                        element.height = 60 + Math.random() * 80;
                        element.y = 320 + Math.random() * 60;
                        break;
                    case 'far_trees':
                        element.width = 12 + Math.random() * 18;
                        element.height = 30 + Math.random() * 40;
                        element.y = 360 + Math.random() * 50;
                        break;
                    case 'trees':
                        element.width = 15 + Math.random() * 25;
                        element.height = 40 + Math.random() * 60;
                        element.y = 380 + Math.random() * 40;
                        break;
                    case 'mid_bushes':
                        element.width = 18 + Math.random() * 28;
                        element.height = 12 + Math.random() * 20;
                        element.y = 410 + Math.random() * 25;
                        break;
                    case 'bushes':
                        element.width = 20 + Math.random() * 30;
                        element.height = 15 + Math.random() * 25;
                        element.y = 420 + Math.random() * 20;
                        break;
                    case 'grass':
                        element.width = 8 + Math.random() * 12;
                        element.height = 5 + Math.random() * 10;
                        element.y = 440 + Math.random() * 15;
                        element.swayPhase = Math.random() * Math.PI * 2;
                        break;
                }
                
                layer.elements.push(element);
            }
        }
    }
    
    initializeObstaclePatterns() {
        this.obstaclePatterns = [
            {
                name: 'single',
                obstacles: [{ type: 'box', delay: 0 }]
            },
            {
                name: 'double_jump',
                obstacles: [
                    { type: 'spike', delay: 0 },
                    { type: 'bird', delay: 800 }
                ]
            },
            {
                name: 'slide_sequence',
                obstacles: [
                    { type: 'bird', delay: 0 },
                    { type: 'bird', delay: 300 },
                    { type: 'bird', delay: 600 }
                ]
            },
            {
                name: 'mixed_challenge',
                obstacles: [
                    { type: 'box', delay: 0 },
                    { type: 'spike', delay: 500 },
                    { type: 'bird', delay: 1000 },
                    { type: 'box', delay: 1300 }
                ]
            },
            {
                name: 'rapid_fire',
                obstacles: [
                    { type: 'spike', delay: 0 },
                    { type: 'spike', delay: 400 },
                    { type: 'spike', delay: 800 },
                    { type: 'box', delay: 1200 }
                ]
            },
            {
                name: 'alternating',
                obstacles: [
                    { type: 'bird', delay: 0 },
                    { type: 'spike', delay: 600 },
                    { type: 'bird', delay: 1200 },
                    { type: 'box', delay: 1800 }
                ]
            }
        ];
    }
    
    initializeAchievements() {
        this.achievements = [
            { id: 'first_jump', name: 'First Jump', description: 'Jump for the first time', unlocked: false },
            { id: 'combo_5', name: 'Combo Master', description: 'Achieve a 5x combo', unlocked: false },
            { id: 'distance_1000', name: 'Long Runner', description: 'Run 1000m', unlocked: false },
            { id: 'speed_demon', name: 'Speed Demon', description: 'Reach maximum speed', unlocked: false },
            { id: 'powerup_collector', name: 'Collector', description: 'Collect 10 powerups', unlocked: false },
            { id: 'perfect_pattern', name: 'Perfect Pattern', description: 'Complete a pattern without taking damage', unlocked: false },
            { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat your first boss', unlocked: false },
            { id: 'zone_master', name: 'Zone Master', description: 'Survive a risk zone for 3+ seconds', unlocked: false }
        ];
    }
    
    initializeDailyChallenges() {
        const today = new Date().toDateString();
        const savedChallenges = localStorage.getItem('dailyChallenges');
        const savedDate = localStorage.getItem('challengeDate');
        
        // Prüfe ob neue Challenges für heute generiert werden müssen
        if (!savedChallenges || savedDate !== today) {
            this.generateDailyChallenges();
            localStorage.setItem('challengeDate', today);
        } else {
            this.dailyChallenges = JSON.parse(savedChallenges);
            this.challengeProgress = JSON.parse(localStorage.getItem('challengeProgress') || '{}');
        }
    }
    
    generateDailyChallenges() {
        const challengeTemplates = [
            {
                id: 'distance_runner',
                name: 'Distance Runner',
                description: 'Run {target}m in a single game',
                type: 'distance',
                target: [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)],
                reward: 1000
            },
            {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Achieve a {target}x combo',
                type: 'combo',
                target: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
                reward: 750
            },
            {
                id: 'collector',
                name: 'Power Collector',
                description: 'Collect {target} powerups',
                type: 'powerups',
                target: [3, 5, 8, 12][Math.floor(Math.random() * 4)],
                reward: 500
            },
            {
                id: 'score_hunter',
                name: 'Score Hunter',
                description: 'Score {target} points in one game',
                type: 'score',
                target: [5000, 10000, 20000, 30000][Math.floor(Math.random() * 4)],
                reward: 1200
            },
            {
                id: 'obstacle_dodger',
                name: 'Obstacle Dodger',
                description: 'Avoid {target} obstacles in a row',
                type: 'obstacles_avoided',
                target: [10, 20, 30, 50][Math.floor(Math.random() * 4)],
                reward: 800
            },
            {
                id: 'wall_runner',
                name: 'Wall Runner',
                description: 'Perform {target} wall runs',
                type: 'wall_runs',
                target: [2, 5, 8, 10][Math.floor(Math.random() * 4)],
                reward: 600
            },
            {
                id: 'swipe_master',
                name: 'Swipe Master',
                description: 'Perform {target} swipe gestures',
                type: 'swipe_jumps',
                target: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
                reward: 400
            }
        ];
        
        // Wähle 3 zufällige Challenges für heute
        this.dailyChallenges = [];
        const shuffled = challengeTemplates.sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < 3; i++) {
            const template = shuffled[i];
            const challenge = {
                ...template,
                id: template.id + '_' + Date.now() + '_' + i,
                description: template.description.replace('{target}', template.target),
                progress: 0,
                completed: false
            };
            this.dailyChallenges.push(challenge);
        }
        
        // Reset Progress für neue Challenges
        this.challengeProgress = {};
        this.saveChallenges();
    }
    
    saveChallenges() {
        localStorage.setItem('dailyChallenges', JSON.stringify(this.dailyChallenges));
        localStorage.setItem('challengeProgress', JSON.stringify(this.challengeProgress));
    }
    
    updateChallengeProgress(type, value = 1) {
        for (let challenge of this.dailyChallenges) {
            if (challenge.type === type && !challenge.completed) {
                challenge.progress = Math.min(challenge.progress + value, challenge.target);
                
                if (challenge.progress >= challenge.target) {
                    challenge.completed = true;
                    this.completeDailyChallenge(challenge);
                }
            }
        }
        this.saveChallenges();
    }
    
    completeDailyChallenge(challenge) {
        // Belohnung geben
        this.score += challenge.reward;
        
        // Visueller Effekt
        this.createAdvancedParticles(
            this.gameWidth / 2,
            this.gameHeight / 2,
            '#ffd700',
            'explosion',
            25
        );
        
        // Challenge-Completion-Nachricht
        this.showChallengeCompleteMessage(challenge);
    }
    
    showChallengeCompleteMessage(challenge) {
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '30%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.background = 'linear-gradient(45deg, #ffd700, #ffaa00)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '20px 30px';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '1001';
        messageDiv.style.animation = 'challengeComplete 3s ease-in-out';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.6)';
        messageDiv.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 8px;">📅 DAILY CHALLENGE COMPLETE!</div>
            <div style="font-size: 14px; margin-bottom: 5px;">${challenge.name}</div>
            <div style="font-size: 12px; opacity: 0.9;">+${challenge.reward} Points</div>
        `;
        
        document.getElementById('ui').appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    initializeSounds() {
        // Web Audio API mit verbesserter Browser-Kompatibilität
        this.audioContext = null;
        this.audioSupported = false;
        
        try {
            // Fallback-Reihenfolge für verschiedene Browser
            var AudioContextClass = window.AudioContext || 
                                   window.webkitAudioContext || 
                                   window.mozAudioContext || 
                                   window.msAudioContext;
            
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.audioSupported = true;
                
                // State-Management für verschiedene Browser
                if (this.audioContext.state) {
                    // Moderne Browser
                    if (this.isMobile && this.audioContext.state === 'suspended') {
                        this.soundEnabled = false;
                    }
                } else {
                    // Ältere Browser ohne state property
                    this.soundEnabled = !this.isMobile;
                }
                
                console.log('Audio Context initialized:', this.audioContext.state || 'unknown state');
            } else {
                console.log('Web Audio API not available');
                this.soundEnabled = false;
            }
        } catch (e) {
            console.log('Web Audio API initialization failed:', e);
            this.soundEnabled = false;
            this.audioSupported = false;
        }
    }
    
    enableAudio() {
        if (!this.audioSupported || !this.audioContext) return;
        
        try {
            // Moderne Browser mit resume()
            if (this.audioContext.resume && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.soundEnabled = true;
                    this.audioInitialized = true;
                    console.log('Audio enabled');
                }).catch((e) => {
                    console.log('Audio resume failed:', e);
                });
            }
            // Ältere Browser ohne state/resume
            else if (!this.audioContext.state) {
                this.soundEnabled = true;
                this.audioInitialized = true;
                console.log('Audio enabled (legacy)');
            }
        } catch (e) {
            console.log('Audio enable failed:', e);
        }
    }
    
    playSound(type, frequency, duration) {
        // Default-Werte für ältere Browser ohne Default-Parameter
        frequency = frequency || 440;
        duration = duration || 0.1;
        
        if (!this.soundEnabled || !this.audioSupported || !this.audioContext) return;
        
        // State-Check nur bei modernen Browsern
        if (this.audioContext.state && this.audioContext.state === 'suspended') return;
        
        try {
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch(type) {
            case 'jump':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
                break;
            case 'powerup':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
                duration = 0.2;
                break;
            case 'collision':
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
                duration = 0.3;
                break;
            case 'combo':
                oscillator.frequency.setValueAtTime(400 + this.combo * 50, this.audioContext.currentTime);
                duration = 0.05;
                break;
            case 'perfect_timing':
                // Magical ascending sound for perfect timing
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.15);
                duration = 0.15;
                break;
            case 'micro_achievement':
                // Bright celebratory sound for micro-achievements
                oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
                duration = 0.2;
                break;
            case 'satisfaction_boost':
                // Gentle positive reinforcement sound
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.08);
                duration = 0.08;
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Sound playback failed:', e);
            // Fallback: Sound deaktivieren wenn fehlerhaft
            this.soundEnabled = false;
        }
    }
    
    initializeEventListeners() {
        // Button Events mit Touch-Unterstützung
        this.addButtonListener('startButton', () => this.startGame());
        this.addButtonListener('restartButton', () => this.restartGame());
        this.addButtonListener('resumeButton', () => this.resumeGame());
        this.addButtonListener('menuButton', () => this.showMenu());
        
        // Head Tracking Settings
        this.addButtonListener('headTrackingToggle', (e) => this.toggleHeadTracking(e));
        this.addButtonListener('cameraPreviewToggle', (e) => this.toggleCameraPreview(e));
        this.addButtonListener('calibrateHeadTracking', () => this.calibrateHeadTracking());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            }
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.pauseGame();
            }
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.pauseGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameState === 'playing') {
                this.mousePressed = true;
                this.handleInput();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mousePressed = false;
            this.player.isSliding = false;
        });
        
        // Touch Events für Canvas mit Kompatibilitäts-Check
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // Touch-unterstütztes Gerät
            this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), this.getTouchOptions());
            this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), this.getTouchOptions());
            this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), this.getTouchOptions());
        } else {
            // Fallback für Desktop ohne Touch
            console.log('Touch events not supported, using mouse only');
        }
        
        
        // Fallback Touch Events für gesamten Screen
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.addEventListener('touchstart', this.handleDocumentTouch.bind(this), this.getTouchOptions());
            document.addEventListener('touchend', this.handleDocumentTouchEnd.bind(this), this.getTouchOptions());
        }
    }
    
    addButtonListener(buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Click Event
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.enableAudio();
            callback();
        });
        
        // Touch Events für bessere Mobile-Erfahrung
        // Touch Events nur wenn unterstützt
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.enableAudio();
                button.classList.add('active');
            }, this.getTouchOptions());
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.classList.remove('active');
                callback();
            }, this.getTouchOptions());
        }
    }
    
    // Touch-Event Hilfsfunktionen
    getTouchOptions() {
        // Feature-Detection für passive Events
        var supportsPassive = false;
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                    return false;
                }
            });
            window.addEventListener('test', function() {}, opts);
            window.removeEventListener('test', function() {}, opts);
        } catch (e) {
            // Passive nicht unterstützt
        }
        
        return supportsPassive ? { passive: false } : false;
    }
    
    handleTouchStart(e) {
        if (e.preventDefault) e.preventDefault();
        this.enableAudio();
        
        if (this.gameState === 'playing') {
            this.touchActive = true;
            this.touchStartTime = Date.now();
            
            // ENHANCED MULTI-TOUCH GESTURE DETECTION
            const touch = e.touches[0];
            this.gestureDetection.touchStartX = touch.clientX;
            this.gestureDetection.touchStartY = touch.clientY;
            this.gestureDetection.touchStartTime = Date.now();
            this.gestureDetection.swipeDetected = false;
            
            // PRESSURE DETECTION for Force Touch devices
            if (touch.force !== undefined) {
                this.gestureDetection.pressure = touch.force;
                this.deviceInfo.supportsForceTouch = true;
            } else {
                this.gestureDetection.pressure = 1.0;
            }
            
            // MULTI-TOUCH DETECTION
            if (e.touches.length > 1) {
                this.handleMultiTouch(e.touches);
                return; // Multi-touch has its own handling
            }
            
            // ENHANCED HAPTIC FEEDBACK for touch start
            if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
                navigator.vibrate(10); // Light tap feedback
            }
            
            this.handleInput();
        }
    }
    
    handleTouchEnd(e) {
        if (e.preventDefault) e.preventDefault();
        
        if (this.gameState === 'playing') {
            // ENHANCED GESTURE DETECTION with timing and pressure
            const touch = e.changedTouches[0];
            this.gestureDetection.touchEndX = touch.clientX;
            this.gestureDetection.touchEndY = touch.clientY;
            this.gestureDetection.touchEndTime = Date.now();
            
            // PRESSURE TRACKING for gesture end
            if (touch.force !== undefined) {
                this.gestureDetection.endPressure = touch.force;
            }
            
            // MULTI-TOUCH END DETECTION
            if (e.touches.length > 0) {
                this.handleMultiTouchEnd(e.touches);
                return;
            }
            
            this.detectSwipeGesture();
        }
        
        this.touchActive = false;
        this.touchStartTime = null;
        this.player.isSliding = false;
        
        // RESET GESTURE DETECTION STATE
        this.gestureDetection.pressure = 1.0;
        this.gestureDetection.endPressure = 1.0;
    }
    
    handleTouchMove(e) {
        if (e.preventDefault) e.preventDefault();
        
        // DYNAMIC PRESSURE TRACKING during move
        if (e.touches[0] && e.touches[0].force !== undefined) {
            this.gestureDetection.pressure = Math.max(
                this.gestureDetection.pressure,
                e.touches[0].force
            );
        }
        
        // MULTI-TOUCH MOVE DETECTION
        if (e.touches.length > 1) {
            this.handleMultiTouchMove(e.touches);
        }
        
        // Verhindert Scrollen während des Spiels
    }
    
    handleMultiTouch(touches) {
        // ADVANCED MULTI-TOUCH GESTURES
        if (touches.length === 2) {
            // TWO-FINGER GESTURES
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            // Store initial two-finger state
            this.gestureDetection.twoFingerStart = {
                distance: distance,
                centerX: (touch1.clientX + touch2.clientX) / 2,
                centerY: (touch1.clientY + touch2.clientY) / 2,
                time: Date.now()
            };
            
            // IMMEDIATE MULTI-TOUCH ACTION - Special ability
            this.handleTwoFingerTap();
            
        } else if (touches.length === 3) {
            // THREE-FINGER GESTURE - Emergency brake
            this.handleThreeFingerGesture();
        }
    }
    
    handleMultiTouchMove(touches) {
        if (touches.length === 2 && this.gestureDetection.twoFingerStart) {
            // PINCH/SPREAD DETECTION
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            const distanceChange = currentDistance - this.gestureDetection.twoFingerStart.distance;
            
            if (Math.abs(distanceChange) > 20) { // Significant pinch/spread
                if (distanceChange > 0) {
                    // SPREAD GESTURE - Boost/Power-up activation
                    this.handleSpreadGesture(distanceChange);
                } else {
                    // PINCH GESTURE - Precision mode
                    this.handlePinchGesture(Math.abs(distanceChange));
                }
            }
        }
    }
    
    handleMultiTouchEnd(touches) {
        // CLEANUP MULTI-TOUCH STATE
        this.gestureDetection.twoFingerStart = null;
        this.gestureDetection.multiTouchActive = false;
    }
    
    handleTwoFingerTap() {
        // SPECIAL ABILITY: Shield activation or combo multiplier
        if (this.hasActivePowerup('shield')) {
            // Extend shield duration
            const shield = this.activePowerups.find(p => p.type === 'shield');
            if (shield) {
                shield.duration += 2000; // Add 2 seconds
                this.showMultiTouchFeedback('SHIELD EXTENDED!', '#00ff88');
            }
        } else {
            // Emergency speed boost
            this.speed = Math.min(this.speed + 1.5, this.maxSpeed);
            this.score += 100;
            this.showMultiTouchFeedback('EMERGENCY BOOST!', '#ff6600');
        }
        
        // Enhanced haptic for multi-touch
        if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]); // Double pulse
        }
        
        // Visual effect
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#ffff00',
            'explosion',
            20
        );
    }
    
    handleThreeFingerGesture() {
        // EMERGENCY BRAKE - Slow down dramatically but gain control
        this.speed = Math.max(this.speed - 2, 1.0);
        this.score += 50;
        
        this.showMultiTouchFeedback('EMERGENCY BRAKE!', '#ff0066');
        
        // Strong haptic feedback
        if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100]);
        }
        
        // Dramatic visual effect
        this.createAdvancedParticles(
            this.player.x,
            this.player.y + this.player.height,
            '#ff0066',
            'dust',
            25
        );
    }
    
    handleSpreadGesture(spreadAmount) {
        // SPREAD = Power activation
        const powerLevel = Math.min(spreadAmount / 100, 2.0);
        
        // Activate or enhance current powerup
        if (this.activePowerups.length > 0) {
            // Boost existing powerup
            const powerup = this.activePowerups[0];
            powerup.intensity = Math.min((powerup.intensity || 1.0) * 1.3, 2.0);
            this.showMultiTouchFeedback('POWER BOOST!', '#9b59b6');
        } else {
            // Create temporary speed boost
            this.speed = Math.min(this.speed + powerLevel, this.maxSpeed);
            this.showMultiTouchFeedback('SPREAD BOOST!', '#3498db');
        }
    }
    
    handlePinchGesture(pinchAmount) {
        // PINCH = Precision mode / Slow-mo
        const precisionLevel = Math.min(pinchAmount / 50, 1.0);
        
        // Temporary precision mode
        this.timeScale = Math.max(0.7, 1.0 - precisionLevel * 0.3);
        this.showMultiTouchFeedback('PRECISION MODE!', '#e74c3c');
        
        // Reset after short duration
        setTimeout(() => {
            this.timeScale = 1.0;
        }, 1000);
    }
    
    showMultiTouchFeedback(message, color) {
        const feedback = document.createElement('div');
        feedback.style.position = 'absolute';
        feedback.style.top = '30%';
        feedback.style.left = '50%';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.color = color;
        feedback.style.fontSize = this.deviceInfo?.isPhone ? '16px' : '20px';
        feedback.style.fontWeight = 'bold';
        feedback.style.zIndex = '1002';
        feedback.style.pointerEvents = 'none';
        feedback.style.textShadow = `0 0 15px ${color}`;
        feedback.style.animation = 'pulse 0.5s ease-in-out';
        feedback.textContent = message;
        
        document.getElementById('ui').appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1500);
    }
    
    handleDocumentTouch(e) {
        if (e.target === this.canvas) return;
        
        this.enableAudio();
        
        if (this.gameState === 'playing') {
            if (e.preventDefault) e.preventDefault();
            this.touchActive = true;
            this.touchStartTime = Date.now();
            this.handleInput();
        }
    }
    
    handleDocumentTouchEnd(e) {
        if (e.target === this.canvas) return;
        
        if (this.gameState === 'playing') {
            if (e.preventDefault) e.preventDefault();
            this.touchActive = false;
            this.touchStartTime = null;
            this.player.isSliding = false;
        }
    }
    
    detectSwipeGesture() {
        if (this.gestureDetection.swipeDetected) return;
        
        const deltaX = this.gestureDetection.touchEndX - this.gestureDetection.touchStartX;
        const deltaY = this.gestureDetection.touchEndY - this.gestureDetection.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // DEVICE-RESPONSIVE SWIPE DETECTION with iPad optimization
        let minDistance;
        if (this.deviceInfo) {
            if (this.deviceInfo.isIPad) {
                minDistance = 25; // Shorter swipe distance for iPad precision
            } else if (this.deviceInfo.isPhone) {
                minDistance = 30;
            } else if (this.deviceInfo.isTablet) {
                minDistance = 40;
            } else {
                minDistance = 50;
            }
        } else {
            minDistance = this.gestureDetection.minSwipeDistance;
        }
            
        if (distance < minDistance) return;
        
        this.gestureDetection.swipeDetected = true;
        
        // ENHANCED GESTURE ANALYSIS with Device Adaptation
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        const velocity = this.calculateSwipeVelocity();
        const pressure = this.gestureDetection.pressure || 1.0;
        
        // Device-specific gesture thresholds
        const verticalBias = this.deviceInfo?.isPhone ? 1.2 : 1.0; // Phones prefer vertical gestures
        
        if (Math.abs(deltaY) > Math.abs(deltaX) * verticalBias) {
            // Vertikale Swipes
            if (deltaY < 0) {
                this.handleSwipeUp(velocity, pressure);
            } else {
                this.handleSwipeDown(velocity, pressure);
            }
        } else {
            // Horizontale Swipes
            if (deltaX > 0) {
                this.handleSwipeRight(velocity, pressure);
            } else {
                this.handleSwipeLeft(velocity, pressure);
            }
        }
        
        // Enhanced visual feedback with device scaling
        this.showSwipeFeedback(deltaX, deltaY, velocity);
    }
    
    calculateSwipeVelocity() {
        const timeDelta = this.gestureDetection.touchEndTime - this.gestureDetection.touchStartTime;
        const deltaX = this.gestureDetection.touchEndX - this.gestureDetection.touchStartX;
        const deltaY = this.gestureDetection.touchEndY - this.gestureDetection.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        return timeDelta > 0 ? Math.min(distance / timeDelta * 10, 5.0) : 1.0; // Normalized velocity
    }
    
    handleSwipeUp(velocity = 1.0, pressure = 1.0) {
        if (!this.player.isJumping) {
            this.jump();
            
            // ENHANCED iPad-OPTIMIZED JUMP MECHANICS
            const velocityBonus = this.deviceInfo?.isIPad ? 
                Math.min(velocity * 1.2, 4.0) :  // Higher velocity bonus for iPad
                Math.min(velocity * 0.8, 3.0);
            
            const pressureBonus = this.deviceInfo?.supportsForceTouch ? pressure * 0.5 : 0;
            this.player.velocityY -= (2 + velocityBonus + pressureBonus);
            
            // DEVICE-ADAPTIVE PARTICLES with iPad enhancement
            let particleCount, particleIntensity;
            if (this.deviceInfo?.isIPad) {
                particleCount = Math.floor(20 + (velocity * 8)); // More particles on iPad
                particleIntensity = 1.2 + (velocity * 0.4);      // Higher intensity
            } else {
                particleCount = this.deviceInfo?.isPhone ? 10 : 15;
                particleIntensity = 1.0 + (velocity * 0.3);
            }
            
            this.createAdvancedParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height,
                `hsl(180, 80%, ${50 + velocity * 10}%)`, // Color intensity based on velocity
                'burst',
                particleCount,
                { intensity: particleIntensity }
            );
            
            // ENHANCED HAPTIC FEEDBACK with iPad detection
            if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
                let vibrationPattern;
                if (this.deviceInfo?.isIPad) {
                    // Richer haptic patterns for iPad
                    vibrationPattern = [
                        Math.floor(velocity * 40), 
                        20, 
                        Math.floor(velocity * 30)
                    ];
                } else {
                    vibrationPattern = Math.floor(velocity * 50); // 0-250ms based on velocity
                }
                navigator.vibrate(vibrationPattern);
            }
            
            // Challenge Progress
            this.updateChallengeProgress('swipe_jumps', 1);
        }
    }
    
    handleSwipeDown(velocity = 1.0, pressure = 1.0) {
        if (this.player.isJumping) {
            this.slide();
            
            // VELOCITY-BASED SLAM POWER - Fast swipes = faster descent
            const velocityBonus = Math.min(velocity * 0.6, 2.5);
            const pressureBonus = this.deviceInfo?.supportsForceTouch ? pressure * 0.4 : 0;
            this.player.velocityY += (3 + velocityBonus + pressureBonus);
            
            // DEVICE-ADAPTIVE DUST EFFECT
            const particleCount = this.deviceInfo?.isPhone ? 8 : 12;
            const dustIntensity = 1.0 + (velocity * 0.4);
            
            this.createAdvancedParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height,
                `hsl(30, 90%, ${40 + velocity * 15}%)`, // Warmer color for faster swipes
                'dust',
                Math.floor(particleCount * dustIntensity)
            );
            
            // HAPTIC FEEDBACK - heavier for slam
            if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
                const vibrationPattern = [Math.floor(velocity * 30), 20, Math.floor(velocity * 20)];
                navigator.vibrate(vibrationPattern);
            }
        } else {
            // Allow sliding from ground with powerful swipe
            if (velocity > 2.0) {
                this.slide();
                this.createAdvancedParticles(
                    this.player.x,
                    this.player.y + this.player.height,
                    '#ff8800',
                    'trail',
                    8
                );
            }
        }
    }
    
    handleSwipeRight(velocity = 1.0, pressure = 1.0) {
        // ABILITY: Try Dash Attack first
        if (this.hasAbility('dash_attack') && this.useAbility('dash_attack')) {
            return; // Dash attack was executed
        }
        
        // VELOCITY-BASED SPEED BOOST - Faster swipes = bigger boost
        const speedBoost = Math.min(0.5 + (velocity * 0.3), 2.0);
        const pressureMultiplier = this.deviceInfo?.supportsForceTouch ? (1 + pressure * 0.3) : 1;
        
        this.speed = Math.min(this.speed + (speedBoost * pressureMultiplier), this.maxSpeed);
        
        // VELOCITY-BASED SCORE BONUS
        const scoreBonus = Math.floor(25 * (1 + velocity * 0.4));
        this.score += scoreBonus;
        
        // DEVICE-ADAPTIVE VISUAL FEEDBACK
        const trailLength = this.deviceInfo?.isPhone ? 8 : 12;
        const trailIntensity = 1.0 + (velocity * 0.5);
        
        this.createAdvancedParticles(
            this.player.x + this.player.width,
            this.player.y + this.player.height / 2,
            `hsl(${30 - velocity * 10}, 90%, ${50 + velocity * 10}%)`, // Orange to red based on velocity
            'trail',
            Math.floor(trailLength * trailIntensity)
        );
        
        // VELOCITY-RESPONSIVE SCREEN FLASH
        this.screenFlash = Math.min(0.2 + (velocity * 0.1), 0.5);
        
        // HAPTIC FEEDBACK - burst pattern for boost
        if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
            const burstPattern = [30, 10, 20, 10, Math.floor(velocity * 40)];
            navigator.vibrate(burstPattern);
        }
        
        // TEMPORARY SPEED INDICATOR
        this.showSpeedBoostIndicator(scoreBonus, velocity);
    }
    
    handleSwipeLeft(velocity = 1.0, pressure = 1.0) {
        // ENHANCED WALL DETECTION with velocity-based range
        const detectionRange = 150 + (velocity * 30); // Faster swipes = longer range
        let wallFound = false;
        
        for (let wall of this.walls) {
            if (Math.abs(wall.x - this.player.x) < detectionRange) {
                wallFound = true;
                
                // VELOCITY-BASED WALL INTERACTION
                const magneticStrength = Math.min(0.1 + (velocity * 0.05), 0.25);
                const pressureBonus = this.deviceInfo?.supportsForceTouch ? pressure * 0.1 : 0;
                
                // Enhanced wall attraction particles
                const particleCount = Math.floor(8 + (velocity * 4));
                this.createAdvancedParticles(
                    wall.x + wall.width / 2,
                    wall.y + wall.height / 2,
                    `hsl(160, 85%, ${60 + velocity * 10}%)`, // Brighter green for faster swipes
                    'explosion',
                    particleCount
                );
                
                // VELOCITY-ENHANCED MAGNETIC PULL
                if (this.player.isJumping) {
                    const pullForce = (magneticStrength + pressureBonus);
                    this.player.x += (wall.x - this.player.x) * pullForce;
                    
                    // Add slight upward boost for fast swipes
                    if (velocity > 2.0) {
                        this.player.velocityY -= 1.0;
                    }
                }
                
                // HAPTIC FEEDBACK for wall detection
                if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
                    const wallVibration = [Math.floor(velocity * 25), 15, Math.floor(velocity * 15)];
                    navigator.vibrate(wallVibration);
                }
                
                break;
            }
        }
        
        // FALLBACK: No wall found - Create defensive move
        if (!wallFound) {
            // VELOCITY-BASED DEFENSIVE MANEUVER
            if (velocity > 1.5) {
                // Quick evasive action - slight slowdown for control
                this.speed = Math.max(this.speed - 0.3, 1.0);
                
                this.createAdvancedParticles(
                    this.player.x - 20,
                    this.player.y + this.player.height / 2,
                    '#88aaff',
                    'spark',
                    6
                );
                
                // Light haptic for failed wall attempt
                if (this.deviceInfo?.supportsHaptic && navigator.vibrate) {
                    navigator.vibrate(15);
                }
            }
        }
    }
    
    showSwipeFeedback(deltaX, deltaY, velocity = 1.0) {
        // ENHANCED VISUAL FEEDBACK with velocity-based intensity
        const centerX = this.gameWidth / 2;
        const centerY = this.gameHeight / 2;
        
        // Device-adaptive feedback intensity
        const feedbackIntensity = this.deviceInfo?.isPhone ? 0.8 : 1.0;
        const arrowCount = Math.floor(3 + (velocity * 2) * feedbackIntensity);
        
        // VELOCITY-ENHANCED ARROW EFFECT
        for (let i = 0; i < arrowCount; i++) {
            setTimeout(() => {
                const progress = i / arrowCount;
                const alpha = 1.0 - (progress * 0.7); // Fade out effect
                
                this.createAdvancedParticles(
                    centerX + (deltaX * 0.3 * i * feedbackIntensity),
                    centerY + (deltaY * 0.3 * i * feedbackIntensity),
                    `hsla(${180 + velocity * 30}, 80%, 70%, ${alpha})`, // Color shifts with velocity
                    'spark',
                    Math.floor(2 + velocity)
                );
            }, i * Math.max(30, 80 - velocity * 10)); // Faster sequence for higher velocity
        }
        
        // DEVICE-SPECIFIC DIRECTIONAL INDICATOR
        if (this.deviceInfo?.isTablet || this.deviceInfo?.isDesktop) {
            this.showDirectionalIndicator(deltaX, deltaY, velocity);
        }
    }
    
    showDirectionalIndicator(deltaX, deltaY, velocity) {
        // Show directional arrow on larger screens
        const angle = Math.atan2(deltaY, deltaX);
        const distance = 60 + velocity * 20;
        
        const arrowX = this.gameWidth / 2 + Math.cos(angle) * distance;
        const arrowY = this.gameHeight / 2 + Math.sin(angle) * distance;
        
        this.createAdvancedParticles(
            arrowX, arrowY,
            `hsl(${(angle * 180 / Math.PI + 360) % 360}, 90%, 60%)`,
            'burst',
            Math.floor(4 + velocity * 2)
        );
    }
    
    showSpeedBoostIndicator(scoreBonus, velocity) {
        // TEMPORARY SPEED BOOST VISUAL INDICATOR
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.top = '50%';
        indicator.style.left = '50%';
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.color = `hsl(${30 - velocity * 10}, 90%, ${50 + velocity * 10}%)`;
        indicator.style.fontSize = `${14 + velocity * 2}px`;
        indicator.style.fontWeight = 'bold';
        indicator.style.zIndex = '1001';
        indicator.style.pointerEvents = 'none';
        indicator.style.textShadow = '0 0 10px rgba(255, 102, 0, 0.8)';
        indicator.textContent = `+${scoreBonus} BOOST!`;
        
        // DEVICE-ADAPTIVE POSITIONING
        if (this.deviceInfo?.isPhone) {
            indicator.style.fontSize = `${12 + velocity * 1.5}px`;
            indicator.style.top = '40%';
        }
        
        document.getElementById('ui').appendChild(indicator);
        
        // ANIMATED REMOVAL
        const animationDuration = Math.min(1000 + velocity * 200, 2000);
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.transition = 'all 0.5s ease-out';
                indicator.style.opacity = '0';
                indicator.style.transform = 'translate(-50%, -70%) scale(1.2)';
                
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 500);
            }
        }, animationDuration);
    }
    
    generateInitialClouds() {
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * (this.gameWidth || 800) * 2,
                y: Math.random() * 150 + 50,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        this.startCountdown();
    }
    
    startCountdown() {
        this.countdownActive = true;
        this.countdownValue = 3;
        
        const countdownInterval = setInterval(() => {
            if (this.countdownValue > 0) {
                this.createAdvancedParticles(
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                    '#4ecdc4',
                    'explosion',
                    15
                );
                this.countdownValue--;
            } else {
                clearInterval(countdownInterval);
                this.countdownActive = false;
                this.gameState = 'playing';
                
                // PROGRESSION: Track session start
                this.progressionStats.sessionsPlayed++;
                
                this.resetGame();
            }
        }, 1000);
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.resetGame();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    showMenu() {
        this.gameState = 'start';
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.distance = 0;
        this.speed = 2;
        this.player.x = 100;
        this.player.y = 400;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isSliding = false;
        this.player.isWallRunning = false;
        this.player.wallRunSide = null;
        this.player.wallRunTime = 0;
        this.obstacles = [];
        this.powerups = [];
        this.walls = [];
        this.riskRewardZones = [];
        this.currentZone = null;
        this.zoneSpawnDistance = 1500;
        this.camera.x = 0;
        this.lastObstacleSpawn = 0;
        this.lastPowerupSpawn = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1;
        this.lastActionTime = 0;
        this.difficultyLevel = 1;
        this.activePowerups = [];
        this.currentPattern = null;
        this.patternProgress = 0;
        this.nextPatternDistance = 500;
        this.updateUI();
    }
    
    handleInput() {
        if (this.mousePressed || this.touchActive || this.keys['Space']) {
            if (!this.player.isJumping) {
                this.jump();
            } else if (this.touchActive && this.touchStartTime) {
                // Touch länger als 200ms = Slide
                const touchDuration = Date.now() - this.touchStartTime;
                if (touchDuration > 200) {
                    this.slide();
                }
            }
        }
    }
    
    // =====================================
    // HEAD TRACKING METHODS
    // =====================================
    
    async toggleHeadTracking(event) {
        const toggle = event.target || document.getElementById('headTrackingToggle');
        
        if (toggle.checked) {
            if (!this.headTracking) {
                // Create head tracking instance with game controller reference
                this.headTracking = new HeadTrackingController({
                    jump: () => this.jump(),
                    handleSlide: () => this.slide(),
                    moveLeft: () => {}, // Not used in this game
                    moveRight: () => {}, // Not used in this game
                    moveCenter: () => {}, // Not used in this game
                    settings: this.settings,
                    showTouchControls: () => this.showTouchControls()
                });
            }
            
            const initialized = await this.headTracking.initialize();
            
            if (initialized) {
                this.headTrackingEnabled = true;
                await this.headTracking.start();
                
                // Enable related UI controls
                document.getElementById('cameraPreviewToggle').disabled = false;
                document.getElementById('calibrateHeadTracking').disabled = false;
                
                // Show notification
                this.showNotification('Head Tracking aktiviert! 📹', 3000);
            } else {
                // Failed to initialize
                toggle.checked = false;
                this.showNotification('Kamera nicht verfügbar ❌', 3000);
            }
        } else {
            // Disable head tracking
            if (this.headTracking) {
                this.headTracking.stop();
                this.headTrackingEnabled = false;
                
                // Disable related UI controls
                document.getElementById('cameraPreviewToggle').disabled = true;
                document.getElementById('calibrateHeadTracking').disabled = true;
                document.getElementById('cameraPreviewToggle').checked = false;
                
                this.showNotification('Head Tracking deaktiviert', 2000);
            }
        }
    }
    
    toggleCameraPreview(event) {
        if (!this.headTracking || !this.headTrackingEnabled) return;
        
        const toggle = event.target || document.getElementById('cameraPreviewToggle');
        const preview = document.getElementById('headTrackingPreview');
        
        if (preview) {
            preview.style.display = toggle.checked ? 'block' : 'none';
        }
    }
    
    async calibrateHeadTracking() {
        if (!this.headTracking || !this.headTrackingEnabled) return;
        
        // Pause game during calibration
        const wasPlaying = this.gameState === 'playing';
        if (wasPlaying) {
            this.pauseGame();
        }
        
        await this.headTracking.startCalibration();
        
        // Resume game after calibration
        if (wasPlaying) {
            this.resumeGame();
        }
    }
    
    showTouchControls() {
        // Show touch control areas as fallback
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }
    
    showNotification(message, duration = 3000) {
        // Reuse achievement notification for general notifications
        const notification = document.getElementById('achievementNotification');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        if (notification && title && description) {
            title.textContent = 'System';
            description.textContent = message;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, duration);
        }
    }
    
    jump() {
        if (!this.player.isJumping && !this.player.isSliding) {
            // INSTANT GRATIFICATION: Perfect Timing Detection
            const now = Date.now();
            const timeSinceLastAction = now - this.instantFeedback.lastActionTime;
            let isPerfectTiming = false;
            
            if (timeSinceLastAction < this.instantFeedback.perfectTimingWindow && this.instantFeedback.lastActionTime > 0) {
                isPerfectTiming = true;
                this.triggerPerfectTiming("PERFECT JUMP! 💫", timeSinceLastAction);
            }
            
            this.instantFeedback.lastActionTime = now;
            this.instantFeedback.recentActions.push({ 
                action: 'jump', 
                time: now, 
                perfect: isPerfectTiming 
            });
            
            // Regular jump with enhanced feedback
            this.player.velocityY = -15;
            this.player.isJumping = true;
            this.player.doubleJumpUsed = false;
            
            // MICRO-ACHIEVEMENT: Action Counter
            this.microAchievements.actionCounter++;
            this.checkMicroAchievements();
            
            // ENHANCED VISUAL JUICE
            const particleCount = 12 + (isPerfectTiming ? 8 : 0) + (this.combo > 5 ? 6 : 0);
            const particleColor = isPerfectTiming ? '#ffd700' : (this.combo > 10 ? '#ff6b6b' : '#4ecdc4');
            
            this.createAdvancedParticles(
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height, 
                particleColor, 
                'burst', 
                particleCount
            );
            
            this.createActionTrail('jump');
            
            // INSTANT VISUAL REWARD
            this.triggerVisualJuice('jump', isPerfectTiming ? 2.0 : 1.0);
            
            // Enhanced shake with satisfaction factor
            this.triggerShake(3 * this.instantFeedback.juiceLevel, 'impact', 1.0);
            this.increaseCombo();
            this.checkAchievement('first_jump');
            
            // Score with immediate visual feedback
            const baseScore = 5;
            const perfectBonus = isPerfectTiming ? 15 : 0;
            const comboBonus = this.combo > 5 ? this.combo * 2 : 0;
            const totalScore = baseScore + perfectBonus + comboBonus;
            
            this.score += totalScore;
            
            if (totalScore > baseScore) {
                this.showInstantScorePopup(totalScore, this.player.x, this.player.y - 30, isPerfectTiming);
                
                // ENHANCED AUDIO FEEDBACK for bonus scores
                if (!isPerfectTiming) { // Avoid double sound for perfect timing
                    this.playSound('satisfaction_boost');
                }
            }
            
            this.playSound('jump');
            
            // PROGRESSION: Award experience and track stats
            this.awardExperience(2 + (isPerfectTiming ? 3 : 0), isPerfectTiming ? 'Perfect Jump' : 'Jump');
            this.progressionStats.totalJumps++;
            
            // FLOW STATE: Enhanced momentum for perfect timing
            this.addFlowMomentum(isPerfectTiming ? 12 : 5);
            
        } else if (this.player.isJumping && this.hasAbility('double_jump') && !this.player.doubleJumpUsed) {
            // Double jump with celebration
            this.useAbility('double_jump');
            this.triggerMicroCelebration("DOUBLE JUMP! ⚡", '#ff6b6b', 20);
            
            // PROGRESSION: Bonus experience for advanced technique
            this.awardExperience(5, 'Double Jump');
        }
    }
    
    slide() {
        if (this.player.isJumping) {
            this.player.isSliding = true;
            this.player.velocityY += 2;
            this.createActionTrail('slide');
            
            // ABILITY: Try Time Slow
            if (this.hasAbility('time_slow') && !this.timeSlowActive) {
                this.useAbility('time_slow');
            }
        }
    }
    
    updatePlayer() {
        this.player.animationFrame += 0.2;
        this.player.bobOffset = Math.sin(this.player.animationFrame) * 2;
        
        // ENHANCED ANIMATION SYSTEM UPDATE
        this.updateAdvancedAnimations();
        
        // Lauf-Animation
        if (!this.player.isJumping && !this.player.isSliding) {
            this.player.runCycle += this.player.runSpeed;
        }
        
        // Squash & Stretch bei Sprung
        if (this.player.isJumping) {
            if (this.player.velocityY < 0) {
                // Sprung nach oben - gestreckt
                this.player.squashStretch.x = 0.8;
                this.player.squashStretch.y = 1.3;
                this.player.emotion = 'determined';
            } else {
                // Fallen - gequetscht
                this.player.squashStretch.x = 1.2;
                this.player.squashStretch.y = 0.8;
                this.player.emotion = 'scared';
            }
        } else {
            // Normal - zurück zur Normalform
            this.player.squashStretch.x = 1;
            this.player.squashStretch.y = 1;
            this.player.emotion = this.combo > 5 ? 'happy' : 'normal';
        }
        
        // Blinzel-Animation
        this.player.blinkTimer -= 0.016;
        if (this.player.blinkTimer <= 0 && Math.random() < 0.01) {
            this.player.blinkTimer = 0.15;
        }
        
        if (this.player.isJumping && !this.player.isWallRunning) {
            // DYNAMIC GRAVITY - Beachtet Events wie Gravity Shift
            const gravity = this.temporaryGravity || 0.8;
            this.player.velocityY += gravity;
            this.player.y += this.player.velocityY * this.timeScale;
            
            // Prüfe Wall-Run-Möglichkeit
            let wall = this.checkWallCollision();
            if (wall && this.player.velocityY > 0) {
                this.startWallRun(wall);
            }
            
            if (this.player.y >= 400) {
                this.player.y = 400;
                this.player.velocityY = 0;
                this.player.isJumping = false;
                this.player.isSliding = false;
                this.createAdvancedParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, '#8FBC8F', 'impact', 8);
                this.triggerShake(2, 'impact', 0.8);
            }
        }
        
        // Wall-Run Update
        this.updateWallRun();
        
        if (this.player.isSliding) {
            this.player.height = 30;
            this.player.y = 430;
        } else {
            this.player.height = 60;
            if (!this.player.isJumping) {
                this.player.y = 400 + this.player.bobOffset;
            }
        }
        
        this.updatePlayerTrail();
        this.updateAdvancedTrails();
        this.player.glowIntensity = 0.8 + Math.sin(this.time * 0.1) * 0.2;
        
        // Dust cloud beim Landen
        if (!this.player.isJumping && this.player.velocityY === 0 && Math.random() < 0.3) {
            this.createAdvancedParticles(
                this.player.x + Math.random() * this.player.width,
                this.player.y + this.player.height,
                '#D2B48C',
                'dust',
                2
            );
        }
    }
    
    updateAdvancedTrails() {
        this.updateSpeedTrails();
        this.updateActionTrails();
        this.updateEnhancedPlayerTrails();
    }
    
    updateSpeedTrails() {
        // Speed-basierte Trails
        if (this.speed > 4) {
            const now = Date.now();
            const emissionRate = (this.speed - 4) * 200; // Mehr Speed = mehr Trails
            
            if (now - this.player.trailSystem.lastEmission > emissionRate) {
                this.createSpeedTrail();
                this.player.trailSystem.lastEmission = now;
            }
        }
        
        // Update existing speed trails
        for (let i = this.player.speedTrails.length - 1; i >= 0; i--) {
            const trail = this.player.speedTrails[i];
            trail.life -= 0.02;
            trail.y += trail.velocityY;
            trail.x += trail.velocityX;
            trail.size *= 0.98;
            trail.opacity = trail.life;
            
            if (trail.life <= 0 || trail.size < 1) {
                this.player.speedTrails.splice(i, 1);
            }
        }
    }
    
    createSpeedTrail() {
        const trail = {
            x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
            y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 30,
            velocityX: -this.speed * 0.5 + (Math.random() - 0.5) * 2,
            velocityY: (Math.random() - 0.5) * 4,
            size: 8 + Math.random() * 12,
            life: 1.0,
            opacity: 0.8,
            color: this.getSpeedTrailColor(),
            type: 'speed'
        };
        
        this.player.speedTrails.push(trail);
        
        // Limit anzahl
        if (this.player.speedTrails.length > 40) {
            this.player.speedTrails.shift();
        }
    }
    
    getSpeedTrailColor() {
        const speedRatio = (this.speed - 2) / (this.maxSpeed - 2);
        
        if (speedRatio < 0.3) {
            return `hsl(180, 70%, 60%)`; // Cyan
        } else if (speedRatio < 0.6) {
            return `hsl(120, 80%, 50%)`; // Grün
        } else if (speedRatio < 0.8) {
            return `hsl(60, 90%, 60%)`; // Gelb
        } else {
            return `hsl(0, 100%, 60%)`; // Rot
        }
    }
    
    updateActionTrails() {
        // Update action-specific trails
        for (let i = this.player.actionTrails.length - 1; i >= 0; i--) {
            const trail = this.player.actionTrails[i];
            trail.life -= 0.03;
            trail.x += trail.velocityX;
            trail.y += trail.velocityY;
            trail.size *= trail.sizeDecay || 0.96;
            
            // Spezielle Updates basierend auf Trail-Typ
            switch (trail.type) {
                case 'jump':
                    trail.velocityY += 0.3; // Gravity
                    break;
                case 'slide':
                    trail.velocityX *= 0.95; // Friction
                    break;
                case 'wallrun':
                    trail.opacity = trail.life * 0.8;
                    break;
            }
            
            if (trail.life <= 0) {
                this.player.actionTrails.splice(i, 1);
            }
        }
    }
    
    createActionTrail(type, customProperties = {}) {
        const baseTrail = {
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height / 2,
            life: 1.0,
            size: 6,
            velocityX: 0,
            velocityY: 0,
            type: type,
            sizeDecay: 0.96
        };
        
        // Type-specific eigenschaften
        switch (type) {
            case 'jump':
                Object.assign(baseTrail, {
                    color: '#00ffff',
                    size: 12,
                    velocityY: -3,
                    velocityX: (Math.random() - 0.5) * 4,
                    life: 1.5,
                    glowIntensity: 1.0
                });
                break;
            case 'slide':
                Object.assign(baseTrail, {
                    color: '#ffaa00',
                    size: 8,
                    velocityX: -this.speed * 0.3,
                    velocityY: Math.random() * 2,
                    life: 1.0,
                    sizeDecay: 0.93
                });
                break;
            case 'wallrun':
                Object.assign(baseTrail, {
                    color: '#ff00aa',
                    size: 10,
                    velocityX: (Math.random() - 0.5) * 3,
                    velocityY: Math.random() * 4,
                    life: 1.2,
                    glowIntensity: 0.8
                });
                break;
            case 'combo':
                Object.assign(baseTrail, {
                    color: `hsl(${this.combo * 30}, 80%, 60%)`,
                    size: 6 + this.combo,
                    velocityX: (Math.random() - 0.5) * 6,
                    velocityY: (Math.random() - 0.5) * 6,
                    life: 0.8 + this.combo * 0.1,
                    glowIntensity: 1.2
                });
                break;
        }
        
        // Custom properties überschreiben
        Object.assign(baseTrail, customProperties);
        
        this.player.actionTrails.push(baseTrail);
    }
    
    updateEnhancedPlayerTrails() {
        // Enhanced continuous player trail
        const trailSystem = this.player.trailSystem;
        
        if (Date.now() - trailSystem.lastEmission > 50) { // Emit every 50ms
            this.createEnhancedPlayerTrail();
            trailSystem.lastEmission = Date.now();
        }
        
        // Update existing trails
        for (let i = trailSystem.particles.length - 1; i >= 0; i--) {
            const particle = trailSystem.particles[i];
            particle.life -= 0.025;
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.size *= 0.98;
            particle.opacity = particle.life * 0.6;
            
            if (particle.life <= 0) {
                trailSystem.particles.splice(i, 1);
            }
        }
    }
    
    createEnhancedPlayerTrail() {
        const trailSystem = this.player.trailSystem;
        
        const particle = {
            x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * this.player.width,
            y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * this.player.height,
            velocityX: -this.speed * 0.2 + (Math.random() - 0.5) * 2,
            velocityY: (Math.random() - 0.5) * 3,
            size: 4 + Math.random() * 6,
            life: 1.0,
            opacity: 0.7,
            color: this.player.color,
            glowIntensity: this.player.glowIntensity
        };
        
        trailSystem.particles.push(particle);
        
        // Limit particle count
        if (trailSystem.particles.length > trailSystem.maxParticles) {
            trailSystem.particles.shift();
        }
    }
    
    // ENHANCED CHARACTER ANIMATION SYSTEM
    updateAdvancedAnimations() {
        const anim = this.player.advancedAnimation;
        
        // Dynamic body tilt based on speed and movement
        if (this.player.isJumping) {
            anim.bodyTilt = Math.sin(this.time * 0.15) * 8 + (this.player.velocityY * 0.5);
        } else {
            anim.bodyTilt = Math.sin(this.time * 0.3) * 3 + (this.speed - 2) * 2;
        }
        
        // Arm swing synchronized with running
        if (!this.player.isSliding) {
            anim.armSwing = Math.sin(this.time * 0.4 + Math.PI) * 20;
        } else {
            anim.armSwing = 0;
        }
        
        // Leg cycle for running animation
        if (!this.player.isJumping) {
            anim.legCycle = (this.time * 0.5) % (Math.PI * 2);
        } else {
            anim.legCycle = Math.PI; // Legs together when jumping
        }
        
        // Breathing cycle during idle moments
        anim.breathingCycle = Math.sin(this.time * 0.08) * 1.5;
        
        // Emotional intensity based on game state
        if (this.combo > 10) {
            anim.emotionalIntensity = Math.min(1.0, anim.emotionalIntensity + 0.02);
        } else if (this.speed > 6) {
            anim.emotionalIntensity = Math.min(0.8, anim.emotionalIntensity + 0.01);
        } else {
            anim.emotionalIntensity = Math.max(0, anim.emotionalIntensity - 0.005);
        }
        
        // Energy tail effect based on flow state and speed
        const energyFactor = (this.flowState.level * 0.3) + (this.speed / this.maxSpeed * 0.4);
        anim.tailEffect = Math.sin(this.time * 0.2) * energyFactor * 15;
        
        // Shape morphing for dynamic character
        if (this.player.isWallRunning) {
            anim.morphing = Math.min(0.3, anim.morphing + 0.05);
        } else {
            anim.morphing = Math.max(0, anim.morphing - 0.02);
        }
        
        // Energy pulse synchronized with heartbeat
        anim.energyPulse = Math.sin(this.time * 0.12) * (0.5 + anim.emotionalIntensity);
        
        // Dynamic shadow intensity
        anim.shadowIntensity = 0.7 + (this.speed / this.maxSpeed * 0.3) + Math.sin(this.time * 0.1) * 0.1;
        
        // Aura effect for high performance
        if (this.combo > 5 || this.flowState.level > 2) {
            anim.auraEffect = Math.min(1.0, anim.auraEffect + 0.03);
        } else {
            anim.auraEffect = Math.max(0, anim.auraEffect - 0.01);
        }
    }
    
    spawnObstacle() {
        const now = Date.now();
        
        if (this.distance > this.nextPatternDistance && !this.currentPattern) {
            this.startObstaclePattern();
        }
        
        if (this.currentPattern) {
            this.updateObstaclePattern(now);
        } else if (now - this.lastObstacleSpawn > (2000 - (this.speed * 150)) / this.obstacleSpawnMultiplier) {
            this.spawnSingleObstacle();
            this.lastObstacleSpawn = now;
            
            // DYNAMIC EVENT SPAWNING - Spawn additional obstacles during events
            if (this.obstacleSpawnMultiplier > 1 && Math.random() < 0.5) {
                setTimeout(() => this.spawnSingleObstacle(), 200);
                if (this.obstacleSpawnMultiplier >= 3 && Math.random() < 0.3) {
                    setTimeout(() => this.spawnSingleObstacle(), 400);
                }
            }
        }
    }
    
    startObstaclePattern() {
        const availablePatterns = this.obstaclePatterns.filter(p => {
            if (this.difficultyLevel < 2 && (p.name === 'mixed_challenge' || p.name === 'rapid_fire')) return false;
            if (this.difficultyLevel < 3 && p.name === 'alternating') return false;
            return true;
        });
        
        this.currentPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
        this.patternProgress = 0;
        this.lastPatternSpawn = Date.now();
        this.nextPatternDistance = this.distance + 800 + Math.random() * 400;
    }
    
    updateObstaclePattern(now) {
        if (this.patternProgress < this.currentPattern.obstacles.length) {
            const obstacle = this.currentPattern.obstacles[this.patternProgress];
            
            if (now - this.lastPatternSpawn >= obstacle.delay) {
                this.spawnSingleObstacle(obstacle.type);
                this.patternProgress++;
            }
        } else {
            this.currentPattern = null;
            this.patternProgress = 0;
        }
    }
    
    spawnSingleObstacle(forceType = null) {
        const types = ['box', 'spike', 'bird'];
        const type = forceType || types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.gameWidth + 50,
            type: type,
            color: '#8b4513',
            isFromPattern: !!forceType
        };
        
        switch (type) {
            case 'box':
                obstacle.y = 420;
                obstacle.width = 40;
                obstacle.height = 40;
                break;
            case 'spike':
                obstacle.y = 440;
                obstacle.width = 20;
                obstacle.height = 20;
                obstacle.color = '#ff4444';
                break;
            case 'bird':
                obstacle.y = 300 + Math.random() * 100;
                obstacle.width = 30;
                obstacle.height = 20;
                obstacle.color = '#444';
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    spawnPowerup() {
        const now = Date.now();
        if (now - this.lastPowerupSpawn > 6000 - (this.difficultyLevel * 1000) && Math.random() < 0.4) {
            const types = ['coin', 'shield', 'speed', 'magnet', 'double_points'];
            const weights = [0.4, 0.2, 0.15, 0.15, 0.1];
            
            let random = Math.random();
            let type = 'coin';
            let cumulative = 0;
            
            for (let i = 0; i < types.length; i++) {
                cumulative += weights[i];
                if (random <= cumulative) {
                    type = types[i];
                    break;
                }
            }
            
            this.powerups.push({
                x: this.gameWidth + 50,
                y: 350 + Math.random() * 50,
                width: 25,
                height: 25,
                type: type,
                color: this.getPowerupColor(type),
                rotation: 0,
                pulsePhase: Math.random() * Math.PI * 2
            });
            this.lastPowerupSpawn = now;
        }
    }
    
    getPowerupColor(type) {
        switch(type) {
            case 'coin': return '#ffd700';
            case 'shield': return '#4ecdc4';
            case 'speed': return '#ff6b6b';
            case 'magnet': return '#9b59b6';
            case 'double_points': return '#2ecc71';
            default: return '#ffd700';
        }
    }
    
    activatePowerup(type) {
        const duration = 5000;
        const now = Date.now();
        
        // PROGRESSION: Track powerup collection
        this.progressionStats.totalPowerupsCollected++;
        
        switch(type) {
            case 'coin':
                this.score += Math.floor(50 * this.comboMultiplier * this.scoreMultiplierBonus);
                this.awardExperience(3, 'Coin');
                // Shop System: Award currency
                this.addShopCurrency(5);
                
                // Emit coin collection event
                window.gameEvents.emit('powerup:collected', {
                    type: 'coin',
                    value: 50,
                    timestamp: Date.now()
                });
                break;
            case 'shield':
                this.activePowerups.push({ type: 'shield', endTime: now + duration });
                this.awardExperience(8, 'Shield');
                break;
            case 'speed':
                this.activePowerups.push({ type: 'speed', endTime: now + duration });
                this.awardExperience(6, 'Speed Boost');
                break;
            case 'magnet':
                this.activePowerups.push({ type: 'magnet', endTime: now + duration });
                this.awardExperience(7, 'Magnet');
                break;
            case 'double_points':
                this.activePowerups.push({ type: 'double_points', endTime: now + duration });
                this.awardExperience(10, 'Double Points');
                break;
        }
    }
    
    updateActivePowerups() {
        const now = Date.now();
        this.activePowerups = this.activePowerups.filter(powerup => now < powerup.endTime);
    }
    
    hasActivePowerup(type) {
        return this.activePowerups.some(p => p.type === type);
    }
    
    spawnCloud() {
        const now = Date.now();
        if (now - this.lastCloudSpawn > 3000) {
            this.clouds.push({
                x: this.gameWidth + 100,
                y: Math.random() * 150 + 50,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 0.3 + Math.random() * 0.4
            });
            this.lastCloudSpawn = now;
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.speed;
            
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                let points = 10;
                if (this.hasActivePowerup('double_points')) points *= 2;
                this.score += points * this.comboMultiplier;
                this.increaseCombo();
                // Shop System: Award currency for successful avoidance
                this.addShopCurrency(2);
            }
            
            // ADRENALIN-BOOSTER: Near-Miss Detektion
            this.detectNearMiss(obstacle);
            
            if (this.checkCollision(this.player, obstacle)) {
                if (this.hasActivePowerup('shield')) {
                    this.obstacles.splice(i, 1);
                    this.activePowerups = this.activePowerups.filter(p => p.type !== 'shield');
                    this.createAdvancedParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#4ecdc4', 'explosion', 15);
                    this.triggerShake(3, 'explosion', 1.2);
                } else {
                    this.createPooledParticle(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff4757', 'explosion', 20);
                    
                    // Emit collision event
                    window.gameEvents.emit('player:collision', {
                        obstacle: obstacle,
                        player: this.player,
                        timestamp: Date.now()
                    });
                    this.triggerShake(8, 'explosion', 2.0);
                    this.screenFlash = 1.0;
                    this.resetCombo();
                    this.playSound('collision');
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.x -= this.speed;
            powerup.rotation += 0.1;
            
            if (powerup.x + powerup.width < 0) {
                this.powerups.splice(i, 1);
            }
            
            if (this.checkCollision(this.player, powerup) || (this.hasActivePowerup('magnet') && this.getDistance(this.player, powerup) < 80)) {
                this.powerups.splice(i, 1);
                this.activatePowerup(powerup.type);
                this.increaseCombo();
                this.createAdvancedParticles(powerup.x + powerup.width/2, powerup.y + powerup.height/2, powerup.color, 'explosion', 15);
                this.triggerShake(1, 'normal', 0.5);
                this.checkAchievement('powerup_collector');
                this.playSound('powerup');
            }
        }
    }
    
    updateClouds() {
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            cloud.x -= cloud.speed;
            
            if (cloud.x + cloud.width < 0) {
                this.clouds.splice(i, 1);
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    darkenColor(hexColor, factor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Darken by factor
        const newR = Math.floor(r * factor);
        const newG = Math.floor(g * factor);
        const newB = Math.floor(b * factor);
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    createAdvancedParticles(x, y, color, type, count) {
        // ADAPTIVE PARTICLE COUNT based on performance budget
        if (!this.adaptiveParticles || !this.adaptiveParticles.enabled) return;
        
        const adjustedCount = Math.floor(count * this.adaptiveParticles.complexity);
        const finalCount = Math.min(adjustedCount, this.adaptiveParticles.maxCount - this.particles.length);
        
        if (finalCount <= 0) return;
        
        for (let i = 0; i < finalCount; i++) {
            let particle = {
                x: x,
                y: y,
                vx: 0,
                vy: 0,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 4,
                color: color,
                type: type
            };
            
            switch(type) {
                case 'burst':
                    const angle = (Math.PI * 2 * i) / count;
                    particle.vx = Math.cos(angle) * (2 + Math.random() * 3);
                    particle.vy = Math.sin(angle) * (2 + Math.random() * 3) - 2;
                    break;
                case 'explosion':
                    particle.vx = (Math.random() - 0.5) * 8;
                    particle.vy = (Math.random() - 0.5) * 8 - 2;
                    particle.size = 3 + Math.random() * 6;
                    break;
                case 'impact':
                    particle.vx = (Math.random() - 0.5) * 4;
                    particle.vy = -Math.random() * 3 - 1;
                    break;
                case 'trail':
                    particle.vx = (Math.random() - 0.5) * 2;
                    particle.vy = (Math.random() - 0.5) * 2;
                    particle.decay = 0.05;
                    particle.size = 1 + Math.random() * 2;
                    break;
                case 'dust':
                    particle.vx = (Math.random() - 0.5) * 3;
                    particle.vy = -Math.random() * 2 - 1;
                    particle.size = 3 + Math.random() * 5;
                    particle.decay = 0.03;
                    break;
                case 'speed':
                    particle.vx = -this.speed * 2 - Math.random() * 5;
                    particle.vy = (Math.random() - 0.5) * 2;
                    particle.size = 1 + Math.random() * 2;
                    particle.decay = 0.08;
                    break;
                case 'weather':
                    particle.vx = this.weatherSystem.type === 'rain' ? -1 : (Math.random() - 0.5) * 2;
                    particle.vy = this.weatherSystem.type === 'rain' ? 8 : 2;
                    particle.size = this.weatherSystem.type === 'rain' ? 1 : 2 + Math.random() * 3;
                    particle.decay = 0.01;
                    break;
            }
            
            this.particles.push(particle);
        }
    }
    
    updatePlayerTrail() {
        if (this.gameState === 'playing') {
            // Enhanced trail with multiple particles
            for (let i = 0; i < 2; i++) {
                this.createAdvancedParticles(
                    this.player.x + Math.random() * this.player.width,
                    this.player.y + this.player.height - 5 + Math.random() * 10,
                    `hsl(${180 + Math.sin(this.time * 0.1 + i) * 30}, 70%, ${50 + Math.random() * 30}%)`,
                    'trail',
                    1
                );
            }
            
            // Speed-based trail intensity
            if (this.speed > 4) {
                this.createAdvancedParticles(
                    this.player.x,
                    this.player.y + this.player.height / 2,
                    `hsl(${Math.random() * 60 + 180}, 90%, 70%)`,
                    'trail',
                    1
                );
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Enhanced physics
            if (p.type === 'dust') {
                p.vx *= 0.98; // Air resistance
                p.vy += 0.05; // Lighter gravity
            } else if (p.type === 'speed') {
                p.vx *= 1.02; // Acceleration
            } else if (p.type === 'weather') {
                if (this.weatherSystem.type === 'rain') {
                    p.vy += 0.2; // Rain acceleration
                } else {
                    p.vx += Math.sin(this.time * 0.1) * 0.1; // Wind effect
                }
            } else {
                p.vy += 0.1; // Normal gravity
            }
            
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            // Remove off-screen particles
            if (p.life <= 0 || p.x < -50 || p.x > this.gameWidth + 50 || p.y > this.gameHeight + 50) {
                this.particles.splice(i, 1);
            }
        }
        
        this.updateWeatherSystem();
        this.updateSpeedLines();
    }
    
    updateWeatherSystem() {
        // Random weather changes
        if (Math.random() < 0.001) {
            const weathers = ['clear', 'rain', 'snow'];
            this.weatherSystem.type = weathers[Math.floor(Math.random() * weathers.length)];
            this.weatherSystem.intensity = Math.random() * 0.5 + 0.2;
        }
        
        // Generate weather particles
        if (this.weatherSystem.type !== 'clear' && Math.random() < this.weatherSystem.intensity) {
            this.createAdvancedParticles(
                Math.random() * this.gameWidth,
                -10,
                this.weatherSystem.type === 'rain' ? '#4682B4' : '#FFFFFF',
                'weather',
                1
            );
        }
    }
    
    updateSpeedLines() {
        // Speed lines bei hoher Geschwindigkeit
        if (this.speed > 6) {
            const intensity = (this.speed - 6) / 4;
            if (Math.random() < intensity) {
                this.createAdvancedParticles(
                    this.gameWidth,
                    Math.random() * this.gameHeight * 0.8 + this.gameHeight * 0.1,
                    `rgba(255, 255, 255, ${0.3 + intensity * 0.4})`,
                    'speed',
                    1
                );
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update difficulty balancing
        this.updateDifficultyBalancing();
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.distance) + 'm';
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('maxCombo').textContent = this.maxCombo;
        document.getElementById('levelReached').textContent = this.difficultyLevel;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        this.canvas.classList.add('shake');
        setTimeout(() => this.canvas.classList.remove('shake'), 500);
    }
    
    updateDifficultyBalancing() {
        this.difficultyBalancing.playerDeaths++;
        this.difficultyBalancing.totalRuns++;
        
        // Berechne durchschnittliche Laufdistanz
        const storedStats = JSON.parse(localStorage.getItem('difficultyStats') || '{"totalDistance": 0, "runs": 0}');
        storedStats.totalDistance += this.distance;
        storedStats.runs++;
        this.difficultyBalancing.averageRunDistance = storedStats.totalDistance / storedStats.runs;
        
        // Adaptive Schwierigkeit basierend auf Performance
        if (this.difficultyBalancing.averageRunDistance < 500) {
            this.difficultyBalancing.adaptiveDifficulty = 0.7; // Einfacher
        } else if (this.difficultyBalancing.averageRunDistance > 2000) {
            this.difficultyBalancing.adaptiveDifficulty = 1.3; // Schwerer
        } else {
            this.difficultyBalancing.adaptiveDifficulty = 1.0; // Normal
        }
        
        localStorage.setItem('difficultyStats', JSON.stringify(storedStats));
        localStorage.setItem('adaptiveDifficulty', this.difficultyBalancing.adaptiveDifficulty.toString());
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('distanceValue').textContent = Math.floor(this.distance);
        document.getElementById('speedValue').textContent = (this.speed / 2).toFixed(1);
        document.getElementById('levelValue').textContent = this.difficultyLevel;
        
        const comboElement = document.getElementById('combo');
        const comboValueElement = document.getElementById('comboValue');
        
        if (this.combo > 0) {
            comboElement.classList.remove('hidden');
            comboValueElement.textContent = this.combo;
        } else {
            comboElement.classList.add('hidden');
        }
        
        this.updatePowerupStatus();
        this.updateChallengesUI();
        this.updatePerformanceDisplay();
        this.updateProgressionUI();
        
        if (this.distance >= 1000) {
            this.checkAchievement('distance_1000');
        }
    }
    
    updatePowerupStatus() {
        const container = document.getElementById('powerupStatus');
        container.innerHTML = '';
        
        for (let powerup of this.activePowerups) {
            const indicator = document.createElement('div');
            indicator.className = `powerup-indicator powerup-${powerup.type}`;
            
            const remainingTime = Math.ceil((powerup.endTime - Date.now()) / 1000);
            let name = powerup.type.charAt(0).toUpperCase() + powerup.type.slice(1).replace('_', ' ');
            
            indicator.textContent = `${name} (${remainingTime}s)`;
            container.appendChild(indicator);
        }
    }
    
    increaseCombo() {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastActionTime = Date.now();
        
        this.comboMultiplier = 1 + Math.floor(this.combo / 5) * 0.5;
        
        if (this.combo >= 5) {
            this.checkAchievement('combo_5');
        }
        
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y - 20,
            `hsl(${120 + this.combo * 10}, 80%, 60%)`,
            'burst',
            Math.min(this.combo, 10)
        );
        
        this.createActionTrail('combo');
        this.playSound('combo');
        
        // FLOW STATE: Momentum-Boost bei Combo-Aufbau
        this.addFlowMomentum(this.combo * 2); // Mehr Momentum für höhere Combos
    }
    
    resetCombo() {
        this.combo = 0;
        this.comboMultiplier = 1;
    }
    
    updateComboDecay() {
        if (this.combo > 0 && Date.now() - this.lastActionTime > 3000) {
            this.resetCombo();
        }
        
        // Near-Miss Streak Reset bei längerer Inaktivität
        if (Date.now() - this.nearMissSystem.lastNearMiss > 2000) {
            this.nearMissSystem.streakCount = 0;
        }
    }
    
    getDistance(obj1, obj2) {
        const dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
        const dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkAchievement(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.showAchievement(achievement);
            // Shop System: Award currency for achievements
            this.addShopCurrency(25);
            
            // Emit achievement event
            window.gameEvents.emit('achievement:unlocked', {
                id: id,
                achievement: achievement,
                timestamp: Date.now()
            });
        }
    }
    
    showAchievement(achievement) {
        this.createAdvancedParticles(
            this.canvas.width / 2,
            100,
            '#ffd700',
            'explosion',
            25
        );
        
        const notification = document.getElementById('achievementNotification');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        title.textContent = achievement.name;
        description.textContent = achievement.description;
        
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
    
    drawBackground() {
        this.ctx.save();
        
        // Advanced camera shake
        this.ctx.translate(this.camera.shakeX, this.camera.shakeY);
        if (this.camera.shakeRotation !== 0) {
            this.ctx.translate(this.gameWidth / 2, this.gameHeight / 2);
            this.ctx.rotate(this.camera.shakeRotation);
            this.ctx.translate(-this.gameWidth / 2, -this.gameHeight / 2);
        }
        
        const timeOfDay = Math.sin(this.time * 0.01) * 0.5 + 0.5;
        
        // Use biome colors if biome system is active
        let skyColor = '#87CEEB';
        let groundColor = '#8FBC8F';
        
        if (this.biomeSystem && this.biomeSystem.availableBiomes) {
            const currentBiome = this.biomeSystem.availableBiomes[this.biomeSystem.currentBiome];
            if (currentBiome) {
                skyColor = currentBiome.colors.sky;
                groundColor = currentBiome.colors.ground;
            }
        }
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (timeOfDay > 0.5) {
            gradient.addColorStop(0, skyColor);
            gradient.addColorStop(0.3, skyColor);
            gradient.addColorStop(0.7, groundColor);
            gradient.addColorStop(1, groundColor);
        } else {
            // Darken colors for night time
            gradient.addColorStop(0, this.darkenColor(skyColor, 0.6));
            gradient.addColorStop(0.3, this.darkenColor(skyColor, 0.5));
            gradient.addColorStop(0.7, this.darkenColor(groundColor, 0.4));
            gradient.addColorStop(1, this.darkenColor(groundColor, 0.3));
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        for (let layer of this.parallaxLayers) {
            this.ctx.fillStyle = layer.color;
            this.ctx.globalAlpha = layer.alpha || 1.0;
            
            for (let element of layer.elements) {
                const x = element.x - this.camera.x * layer.speed;
                
                // Skip elements that are too far off screen
                if (x < -element.width - 100 || x > this.gameWidth + 100) continue;
                
                this.ctx.save();
                
                if (layer.type === 'far_mountains') {
                    // Far mountains with atmospheric perspective
                    const mountainGradient = this.ctx.createLinearGradient(x, element.y, x, element.y + element.height);
                    mountainGradient.addColorStop(0, '#9ca3af');
                    mountainGradient.addColorStop(1, '#6b7280');
                    this.ctx.fillStyle = mountainGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, element.y + element.height);
                    this.ctx.lineTo(x + element.width / 2, element.y);
                    this.ctx.lineTo(x + element.width, element.y + element.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                } else if (layer.type === 'mountains') {
                    const mountainGradient = this.ctx.createLinearGradient(x, element.y, x, element.y + element.height);
                    mountainGradient.addColorStop(0, '#6b7280');
                    mountainGradient.addColorStop(1, '#374151');
                    this.ctx.fillStyle = mountainGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, element.y + element.height);
                    this.ctx.lineTo(x + element.width / 2, element.y);
                    this.ctx.lineTo(x + element.width, element.y + element.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                } else if (layer.type === 'hills') {
                    const hillGradient = this.ctx.createRadialGradient(
                        x + element.width / 2, element.y + element.height / 2, 0,
                        x + element.width / 2, element.y + element.height / 2, element.width
                    );
                    hillGradient.addColorStop(0, '#84cc16');
                    hillGradient.addColorStop(1, '#65a30d');
                    this.ctx.fillStyle = hillGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x + element.width / 2, element.y + element.height, element.width / 2, Math.PI, 0);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                } else if (layer.type === 'clouds') {
                    // Animated clouds with drift
                    const cloudY = element.y + Math.sin(this.time * element.driftSpeed + element.verticalOffset) * 10;
                    this.ctx.globalAlpha = (layer.alpha || 1.0) * 0.8;
                    
                    this.ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
                    
                    // Multi-circle cloud shape
                    this.ctx.beginPath();
                    this.ctx.arc(x, cloudY, element.width / 3, 0, Math.PI * 2);
                    this.ctx.arc(x + element.width / 3, cloudY - element.height / 4, element.width / 4, 0, Math.PI * 2);
                    this.ctx.arc(x + element.width / 2, cloudY, element.width / 3, 0, Math.PI * 2);
                    this.ctx.arc(x + element.width * 0.7, cloudY - element.height / 6, element.width / 5, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                } else if (layer.type === 'distant_hills') {
                    // Distant hills with soft gradients
                    const hillGradient = this.ctx.createRadialGradient(
                        x + element.width / 2, element.y + element.height / 2, 0,
                        x + element.width / 2, element.y + element.height / 2, element.width
                    );
                    hillGradient.addColorStop(0, '#a7f3d0');
                    hillGradient.addColorStop(1, '#6ee7b7');
                    this.ctx.fillStyle = hillGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x + element.width / 2, element.y + element.height, element.width / 2, Math.PI, 0);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                } else if (layer.type === 'far_trees') {
                    // Simplified far trees
                    this.ctx.fillStyle = '#65a30d';
                    this.ctx.fillRect(x + element.width / 3, element.y + element.height * 0.7, element.width / 3, element.height * 0.3);
                    
                    this.ctx.fillStyle = '#4ade80';
                    this.ctx.beginPath();
                    this.ctx.arc(x + element.width / 2, element.y + element.height * 0.4, element.width / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                } else if (layer.type === 'trees') {
                    this.ctx.fillStyle = '#8b4513';
                    this.ctx.fillRect(x + element.width / 3, element.y + element.height * 0.6, element.width / 3, element.height * 0.4);
                    
                    const treeGradient = this.ctx.createRadialGradient(
                        x + element.width / 2, element.y + element.height * 0.3, 0,
                        x + element.width / 2, element.y + element.height * 0.3, element.width
                    );
                    treeGradient.addColorStop(0, '#22c55e');
                    treeGradient.addColorStop(1, '#16a34a');
                    this.ctx.fillStyle = treeGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x + element.width / 2, element.y + element.height * 0.3, element.width / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                } else if (layer.type === 'mid_bushes') {
                    // Medium distance bushes
                    const bushGradient = this.ctx.createRadialGradient(
                        x + element.width / 2, element.y + element.height / 2, 0,
                        x + element.width / 2, element.y + element.height / 2, element.width
                    );
                    bushGradient.addColorStop(0, '#22c55e');
                    bushGradient.addColorStop(1, '#16a34a');
                    this.ctx.fillStyle = bushGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.ellipse(x + element.width / 2, element.y + element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                } else if (layer.type === 'bushes') {
                    const bushGradient = this.ctx.createRadialGradient(
                        x + element.width / 2, element.y + element.height / 2, 0,
                        x + element.width / 2, element.y + element.height / 2, element.width
                    );
                    bushGradient.addColorStop(0, '#16a34a');
                    bushGradient.addColorStop(1, '#15803d');
                    this.ctx.fillStyle = bushGradient;
                    
                    this.ctx.beginPath();
                    this.ctx.ellipse(x + element.width / 2, element.y + element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                } else if (layer.type === 'grass') {
                    // Animated grass blades with wind effect
                    const swayOffset = Math.sin(this.time * 0.05 + element.swayPhase) * 2;
                    this.ctx.fillStyle = '#15803d';
                    this.ctx.strokeStyle = '#166534';
                    this.ctx.lineWidth = 1;
                    
                    // Draw multiple grass blades
                    for (let blade = 0; blade < 3; blade++) {
                        const bladeX = x + (blade / 3) * element.width;
                        this.ctx.beginPath();
                        this.ctx.moveTo(bladeX, element.y + element.height);
                        this.ctx.lineTo(bladeX + swayOffset, element.y);
                        this.ctx.stroke();
                    }
                }
                
                this.ctx.restore();
                
                if (x < -element.width) {
                    element.x += this.canvas.width * 3;
                }
            }
            
            // Reset alpha for next layer
            this.ctx.globalAlpha = 1.0;
        }
        
        this.ctx.restore();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let cloud of this.clouds) {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawGround() {
        this.ctx.save();
        
        // 3D Perspektivischer Boden
        const horizonY = this.gameHeight * this.perspective.horizon;
        const vanishX = this.gameWidth * this.perspective.vanishingPoint.x;
        
        // Boden-Gradient mit Perspektive
        const gradient = this.ctx.createLinearGradient(0, horizonY, 0, this.gameHeight);
        gradient.addColorStop(0, '#A0C5A0');
        gradient.addColorStop(0.3, '#8FBC8F');
        gradient.addColorStop(1, '#556B2F');
        
        // Perspektivische Boden-Form
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.gameHeight);
        this.ctx.lineTo(this.gameWidth, this.gameHeight);
        this.ctx.lineTo(vanishX + this.gameWidth * 0.2, horizonY);
        this.ctx.lineTo(vanishX - this.gameWidth * 0.2, horizonY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 3D Gitter-Linien
        this.ctx.strokeStyle = 'rgba(34, 139, 34, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Horizontale Linien (perspektivisch)
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const y = horizonY + (this.gameHeight - horizonY) * t * t;
            const width = this.gameWidth * (0.1 + 0.9 * t);
            const offset = (this.gameWidth - width) / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(offset, y);
            this.ctx.lineTo(offset + width, y);
            this.ctx.stroke();
        }
        
        // Vertikale Fluchtlinien
        for (let i = 0; i < 5; i++) {
            const x = (i / 4) * this.gameWidth;
            const endX = vanishX + (x - vanishX) * 0.2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.gameHeight);
            this.ctx.lineTo(endX, horizonY);
            this.ctx.stroke();
        }
        
        // Schatten-Ebene
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, this.ground.y - 5, this.gameWidth, 5);
        
        this.ctx.restore();
    }
    
    drawDynamicShadows() {
        if (!this.shadowSystem.enabled) return;
        
        this.ctx.save();
        
        // Lichtquelle (Sonne) Position
        const lightAngle = Math.sin(this.time * 0.01) * 0.3 + 0.2;
        const lightX = this.gameWidth * (0.7 + Math.sin(this.time * 0.005) * 0.2);
        const lightY = this.gameHeight * 0.1;
        
        // Player Schatten
        this.drawObjectShadow(this.player, lightX, lightY, this.shadowSystem.intensity);
        
        // Obstacle Schatten
        for (let obstacle of this.obstacles) {
            this.drawObjectShadow(obstacle, lightX, lightY, this.shadowSystem.intensity * 0.7);
        }
        
        // Powerup Schatten (weicher)
        for (let powerup of this.powerups) {
            this.drawObjectShadow(powerup, lightX, lightY, this.shadowSystem.intensity * 0.4);
        }
        
        this.ctx.restore();
    }
    
    drawObjectShadow(obj, lightX, lightY, intensity) {
        const objCenterX = obj.x + obj.width / 2;
        const objCenterY = obj.y + obj.height / 2;
        const groundY = this.ground.y;
        
        // Schatten-Projektion berechnen
        const deltaX = objCenterX - lightX;
        const deltaY = objCenterY - lightY;
        
        // Schatten-Endpunkt auf dem Boden
        const shadowScale = (groundY - lightY) / (objCenterY - lightY);
        const shadowX = lightX + deltaX * shadowScale;
        const shadowY = groundY;
        
        // Schatten-Form
        this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
        this.ctx.beginPath();
        
        // Elliptischer Schatten
        const shadowWidth = obj.width * (0.5 + Math.abs(deltaX) / this.gameWidth);
        const shadowHeight = obj.height * 0.3;
        
        this.ctx.save();
        this.ctx.translate(shadowX, shadowY);
        this.ctx.scale(shadowWidth / obj.width, shadowHeight / obj.height);
        
        if (this.ctx.ellipse) {
            this.ctx.ellipse(0, 0, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
        } else {
            // Fallback für ältere Browser
            this.ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawPlayer() {
        this.ctx.save();
        
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        const anim = this.player.advancedAnimation;
        
        // AURA EFFECT - Draw first as background
        if (anim.auraEffect > 0) {
            this.drawPlayerAura(centerX, centerY, anim.auraEffect);
        }
        
        // Enhanced Glow Outline for Player
        const glowIntensity = this.getGlowIntensity('player');
        let glowColor = '#4ecdc4';
        
        // Dynamic glow color based on state
        if (this.combo > 10) {
            glowColor = '#ffd700'; // Gold for high combo
        } else if (this.hasActivePowerup('shield')) {
            glowColor = '#00ff88'; // Green for shield
        } else if (this.player.isJumping) {
            glowColor = '#ff6b6b'; // Red for jumping
        }
        
        this.drawGlowOutline(
            this.player.x - 5, 
            this.player.y - 5, 
            this.player.width + 10, 
            this.player.height + 10, 
            glowColor, 
            glowIntensity
        );
        
        // ADVANCED TRANSFORMATION SYSTEM
        this.ctx.translate(centerX, centerY);
        
        // Body tilt from advanced animation
        this.ctx.rotate((anim.bodyTilt * Math.PI) / 180);
        
        // Squash & Stretch + Morphing
        const morphFactor = 1 + anim.morphing;
        this.ctx.scale(
            this.player.squashStretch.x * morphFactor, 
            this.player.squashStretch.y / morphFactor
        );
        
        // Energy pulse scaling
        const pulseFactor = 1 + (anim.energyPulse * 0.1);
        this.ctx.scale(pulseFactor, pulseFactor);
        
        this.ctx.translate(-this.player.width / 2, -this.player.height / 2);
        
        // ENHANCED DYNAMIC SHADOW
        this.ctx.shadowColor = `rgba(255, 107, 107, ${this.player.glowIntensity * anim.shadowIntensity})`;
        this.ctx.shadowBlur = 15 + (anim.emotionalIntensity * 10);
        this.ctx.shadowOffsetX = anim.bodyTilt * 0.3;
        this.ctx.shadowOffsetY = 5 + (anim.energyPulse * 3);
        
        // ENHANCED BODY WITH ADVANCED EFFECTS
        const bodyGradient = this.ctx.createRadialGradient(
            this.player.width/2, this.player.height/2, 0, 
            this.player.width/2, this.player.height/2, this.player.width
        );
        
        // Dynamic body colors based on emotional intensity
        const emotionFactor = anim.emotionalIntensity;
        const baseRed = 255 - (emotionFactor * 50);
        const baseGreen = 107 + (emotionFactor * 50);
        const baseBlue = 107 + (emotionFactor * 100);
        
        bodyGradient.addColorStop(0, `rgb(${baseRed + 50}, ${baseGreen + 30}, ${baseBlue + 30})`);
        bodyGradient.addColorStop(0.7, `rgb(${baseRed}, ${baseGreen}, ${baseBlue})`);
        bodyGradient.addColorStop(1, `rgb(${baseRed - 50}, ${baseGreen - 30}, ${baseBlue - 30})`);
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        
        // Advanced animated body shape with breathing
        const breathingOffset = anim.breathingCycle;
        const dynamicBodyTilt = anim.bodyTilt * 0.1;
        
        if (this.ctx.roundRect) {
            this.ctx.roundRect(
                0, 
                dynamicBodyTilt + breathingOffset, 
                this.player.width, 
                this.player.height - Math.abs(dynamicBodyTilt) + breathingOffset, 
                8 + (anim.emotionalIntensity * 4)
            );
        } else {
            this.ctx.rect(
                0, 
                dynamicBodyTilt + breathingOffset, 
                this.player.width, 
                this.player.height - Math.abs(dynamicBodyTilt) + breathingOffset
            );
        }
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // ADVANCED ANIMATED ARMS
        this.drawAdvancedArms(anim);
        
        // ADVANCED ANIMATED LEGS
        this.drawAdvancedLegs(anim);
        
        // ENERGY TAIL EFFECT
        if (anim.tailEffect > 0) {
            this.drawEnergyTail(anim.tailEffect);
        }
        
        // Animierte Augen mit Emotionen
        this.drawAnimatedEyes();
        
        // ENHANCED ACTION INDICATORS
        if (this.player.isJumping) {
            this.ctx.strokeStyle = `rgba(78, 205, 196, ${0.8 + anim.energyPulse * 0.2})`;
            this.ctx.lineWidth = 3 + (anim.emotionalIntensity * 2);
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(-4, -4, this.player.width + 8, this.player.height + 8);
            this.ctx.setLineDash([]);
        }
        
        if (this.player.isSliding) {
            for (let i = 0; i < 3; i++) {
                this.ctx.strokeStyle = `rgba(78, 205, 196, ${(0.8 - i * 0.2) + anim.energyPulse * 0.3})`;
                this.ctx.lineWidth = 2 + anim.emotionalIntensity;
                this.ctx.beginPath();
                this.ctx.moveTo(-i * 8, this.player.height / 2);
                this.ctx.lineTo(this.player.width - i * 8, this.player.height / 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    // ADVANCED CHARACTER ANIMATION SUPPORT FUNCTIONS
    drawPlayerAura(centerX, centerY, intensity) {
        this.ctx.save();
        
        const radius = 50 + (intensity * 30);
        const auraGradient = this.ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
        
        auraGradient.addColorStop(0, `rgba(78, 205, 196, ${intensity * 0.3})`);
        auraGradient.addColorStop(0.5, `rgba(255, 215, 0, ${intensity * 0.2})`);
        auraGradient.addColorStop(1, `rgba(255, 107, 107, ${intensity * 0.1})`);
        
        this.ctx.fillStyle = auraGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawAdvancedArms(anim) {
        this.ctx.save();
        
        this.ctx.strokeStyle = `rgba(255, 71, 87, ${0.9 + anim.emotionalIntensity * 0.1})`;
        this.ctx.lineWidth = 3 + (anim.emotionalIntensity * 2);
        this.ctx.lineCap = 'round';
        
        const armLength = 20 + (anim.emotionalIntensity * 5);
        const swingAngle = (anim.armSwing * Math.PI) / 180;
        
        // Left arm
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.width * 0.2, this.player.height * 0.3);
        this.ctx.lineTo(
            this.player.width * 0.2 + Math.cos(swingAngle) * armLength,
            this.player.height * 0.3 + Math.sin(swingAngle) * armLength
        );
        this.ctx.stroke();
        
        // Right arm
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.width * 0.8, this.player.height * 0.3);
        this.ctx.lineTo(
            this.player.width * 0.8 + Math.cos(-swingAngle) * armLength,
            this.player.height * 0.3 + Math.sin(-swingAngle) * armLength
        );
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawAdvancedLegs(anim) {
        this.ctx.save();
        
        this.ctx.strokeStyle = `rgba(255, 71, 87, ${0.9 + anim.emotionalIntensity * 0.1})`;
        this.ctx.lineWidth = 4 + (anim.emotionalIntensity * 2);
        this.ctx.lineCap = 'round';
        
        const legLength = 15 + (anim.emotionalIntensity * 3);
        
        // Advanced leg cycle animation
        const leftLegAngle = Math.sin(anim.legCycle) * 15;
        const rightLegAngle = Math.sin(anim.legCycle + Math.PI) * 15;
        
        // Left leg
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.width * 0.3, this.player.height);
        this.ctx.lineTo(
            this.player.width * 0.3 + Math.sin((leftLegAngle * Math.PI) / 180) * legLength,
            this.player.height + Math.cos((leftLegAngle * Math.PI) / 180) * legLength
        );
        this.ctx.stroke();
        
        // Right leg
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.width * 0.7, this.player.height);
        this.ctx.lineTo(
            this.player.width * 0.7 + Math.sin((rightLegAngle * Math.PI) / 180) * legLength,
            this.player.height + Math.cos((rightLegAngle * Math.PI) / 180) * legLength
        );
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawEnergyTail(intensity) {
        this.ctx.save();
        
        const tailLength = intensity;
        const segments = 8;
        
        for (let i = 0; i < segments; i++) {
            const segmentRatio = i / segments;
            const alpha = (1 - segmentRatio) * (intensity / 15) * 0.8;
            const width = (8 - i) * (intensity / 15);
            
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';
            
            const waveOffset = Math.sin(this.time * 0.3 + i * 0.5) * 3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(-i * 3, this.player.height * 0.5 + waveOffset);
            this.ctx.lineTo(-(i + 1) * 3, this.player.height * 0.5 + waveOffset * 1.2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawAnimatedEyes() {
        // Augen-Position und -Größe
        const eyeY = 12;
        const eyeSize = this.player.blinkTimer > 0 ? 1 : 6;
        
        // Emotionsabhängige Augenfarbe
        let eyeColor = '#4ecdc4';
        if (this.player.emotion === 'scared') eyeColor = '#ff6b6b';
        else if (this.player.emotion === 'happy') eyeColor = '#2ecc71';
        else if (this.player.emotion === 'determined') eyeColor = '#f39c12';
        
        const eyeGlow = this.ctx.createRadialGradient(12, eyeY, 0, 12, eyeY, 8);
        eyeGlow.addColorStop(0, '#ffffff');
        eyeGlow.addColorStop(0.5, eyeColor);
        eyeGlow.addColorStop(1, 'transparent');
        
        // Linkes Auge
        this.ctx.fillStyle = eyeGlow;
        this.ctx.beginPath();
        this.ctx.arc(12, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rechtes Auge
        this.ctx.beginPath();
        this.ctx.arc(28, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupillen (nur wenn nicht blinzelnd)
        if (this.player.blinkTimer <= 0) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(12, eyeY, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(28, eyeY, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Augenbrauen für Emotionen
            if (this.player.emotion === 'determined' || this.player.emotion === 'scared') {
                this.ctx.strokeStyle = '#ff4757';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                if (this.player.emotion === 'determined') {
                    this.ctx.moveTo(8, eyeY - 8);
                    this.ctx.lineTo(16, eyeY - 6);
                    this.ctx.moveTo(24, eyeY - 6);
                    this.ctx.lineTo(32, eyeY - 8);
                } else {
                    this.ctx.moveTo(8, eyeY - 6);
                    this.ctx.lineTo(16, eyeY - 8);
                    this.ctx.moveTo(24, eyeY - 8);
                    this.ctx.lineTo(32, eyeY - 6);
                }
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    drawObstacles() {
        for (let obstacle of this.obstacles) {
            this.ctx.save();
            
            // Enhanced Glow Outline for Obstacles
            const distance = Math.abs(obstacle.x - this.player.x);
            const glowIntensity = this.getGlowIntensity('obstacle', distance);
            let glowColor = '#ff4444';
            
            if (obstacle.type === 'bird') {
                glowColor = '#666666';
            }
            
            // Danger warning - stronger glow when close
            if (distance < 100) {
                glowColor = '#ff0000';
                this.drawGlowOutline(
                    obstacle.x - 3, 
                    obstacle.y - 3, 
                    obstacle.width + 6, 
                    obstacle.height + 6, 
                    glowColor, 
                    glowIntensity * 1.5,
                    obstacle.type === 'spike' ? 'triangle' : 'circle'
                );
            }
            
            if (obstacle.type === 'spike') {
                this.ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
                this.ctx.shadowBlur = 10;
                
                const spikeGradient = this.ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
                spikeGradient.addColorStop(0, '#ff6b6b');
                spikeGradient.addColorStop(0.5, '#ff4444');
                spikeGradient.addColorStop(1, '#cc2222');
                
                this.ctx.fillStyle = spikeGradient;
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#990000';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
            } else if (obstacle.type === 'bird') {
                const wingFlap = Math.sin(this.time * 0.3) * 5;
                
                this.ctx.shadowColor = 'rgba(68, 68, 68, 0.6)';
                this.ctx.shadowBlur = 8;
                
                const birdGradient = this.ctx.createRadialGradient(
                    obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 0,
                    obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, obstacle.width
                );
                birdGradient.addColorStop(0, '#666666');
                birdGradient.addColorStop(1, '#333333');
                
                this.ctx.fillStyle = birdGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 
                               obstacle.width/2, obstacle.height/2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.3, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#444444';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height/2 + wingFlap);
                this.ctx.lineTo(obstacle.x - 8, obstacle.y + obstacle.height/2 - wingFlap);
                this.ctx.moveTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height/2 + wingFlap);
                this.ctx.lineTo(obstacle.x + obstacle.width + 8, obstacle.y + obstacle.height/2 - wingFlap);
                this.ctx.stroke();
                
            } else {
                this.ctx.shadowColor = 'rgba(139, 69, 19, 0.6)';
                this.ctx.shadowBlur = 8;
                
                const boxGradient = this.ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
                boxGradient.addColorStop(0, '#cd853f');
                boxGradient.addColorStop(0.5, '#8b4513');
                boxGradient.addColorStop(1, '#654321');
                
                this.ctx.fillStyle = boxGradient;
                this.ctx.beginPath();
                
                // Fallback für ältere Browser ohne roundRect
                if (this.ctx.roundRect) {
                    this.ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 4);
                } else {
                    this.ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#4a2c17';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#a0522d';
                this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 3);
                this.ctx.fillRect(obstacle.x + 5, obstacle.y + obstacle.height - 8, obstacle.width - 10, 3);
            }
            
            this.ctx.restore();
        }
    }
    
    drawPowerups() {
        for (let powerup of this.powerups) {
            this.ctx.save();
            
            const centerX = powerup.x + powerup.width / 2;
            const centerY = powerup.y + powerup.height / 2;
            
            // Enhanced Glow Outline for Powerups
            const distance = Math.abs(powerup.x - this.player.x);
            const glowIntensity = this.getGlowIntensity('powerup', distance);
            let glowColor = '#ffd700';
            
            // Type-specific glow colors
            switch(powerup.type) {
                case 'shield': glowColor = '#4ecdc4'; break;
                case 'speed': glowColor = '#ff6b6b'; break;
                case 'magnet': glowColor = '#9b59b6'; break;
                case 'double_points': glowColor = '#2ecc71'; break;
            }
            
            // Attraction effect when magnet is active
            if (this.hasActivePowerup('magnet') && distance < 80) {
                this.drawGlowOutline(
                    powerup.x - 8, 
                    powerup.y - 8, 
                    powerup.width + 16, 
                    powerup.height + 16, 
                    '#ff00ff', 
                    glowIntensity * 2.0,
                    'circle'
                );
            } else {
                this.drawGlowOutline(
                    powerup.x - 4, 
                    powerup.y - 4, 
                    powerup.width + 8, 
                    powerup.height + 8, 
                    glowColor, 
                    glowIntensity,
                    'circle'
                );
            }
            
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.shadowBlur = 20;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(powerup.rotation);
            
            const pulseScale = 1 + Math.sin(this.time * 8 + powerup.pulsePhase) * 0.1;
            this.ctx.scale(pulseScale, pulseScale);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, powerup.width * 1.5);
            gradient.addColorStop(0, '#ffff99');
            gradient.addColorStop(0.3, '#ffd700');
            gradient.addColorStop(0.7, '#ffb700');
            gradient.addColorStop(1, '#ff8c00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const radius = i % 2 === 0 ? powerup.width / 2 : powerup.width / 3;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#cc7700';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            
            let symbol = '$';
            switch(powerup.type) {
                case 'shield': symbol = '🛡️'; break;
                case 'speed': symbol = '⚡'; break;
                case 'magnet': symbol = '🧲'; break;
                case 'double_points': symbol = '2x'; break;
            }
            
            this.ctx.fillText(symbol, 0, 3);
            
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            
            this.ctx.globalAlpha = particle.life;
            
            if (particle.type === 'explosion') {
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.time += 0.016;
        
        // Use safe system wrappers for critical updates
        this.safeSystems.physics.safeCall('updatePlayer');
        this.safeSystems.physics.safeCall('spawnObstacle');
        this.safeSystems.physics.safeCall('spawnPowerup');
        this.safeSystems.physics.safeCall('spawnCloud');
        this.safeSystems.physics.safeCall('updateObstacles');
        this.safeSystems.physics.safeCall('updatePowerups');
        this.safeSystems.physics.safeCall('updateClouds');
        this.updatePooledParticles(); // Use enhanced pooled particle system
        this.safeSystems.physics.safeCall('updateWalls');
        this.updateCamera();
        
        this.distance += this.speed * 0.1;
        this.camera.x += this.speed;
        
        this.updateDifficulty();
        this.updateSpeed();
        this.updateActivePowerups();
        this.updateComboDecay();
        this.updateScreenFlash();
        this.updateTemporaryMessages();
        this.updateFlowState();
        this.predictCollision();
        this.checkLastSecondEscape();
        this.updateAdaptiveAI();
        this.updateSkillSystem();
        this.updateAdaptiveAudio();
        this.updateAdvancedGraphics();
        this.updatePostProcessing();
        this.updateBoss();
        this.spawnWall();
        this.updateRiskRewardZones();
        this.updateDailyChallengeProgress();
        
        // NEW GAMEPLAY SYSTEMS
        this.updateDynamicEvents();
        this.updateEnvironmentalNarrative();
        this.updateEpicMoments();
        this.updateCommunityEvents();
        
        // PROGRESSION SYSTEM
        this.updateProgression();
        
        // EXPANSION SYSTEMS
        this.updateBiomeSystem();
        this.updateEnvironmentalHazards();
        
        this.updateUI();
    }
    
    updateDifficulty() {
        const newLevel = Math.floor(this.distance / 500) + 1;
        if (newLevel !== this.difficultyLevel) {
            this.difficultyLevel = newLevel;
            this.showDifficultyMessage();
            
            // PROGRESSION: Distance milestone experience
            const milestoneExp = newLevel * 25;
            this.awardExperience(milestoneExp, `${newLevel * 500}m Milestone`);
        }
    }
    
    updateSpeed() {
        let targetSpeed = 2 + (this.difficultyLevel - 1) * 0.5;
        if (this.hasActivePowerup('speed')) {
            targetSpeed *= 1.5;
        }
        
        if (this.speed < Math.min(targetSpeed, this.maxSpeed)) {
            this.speed += 0.002;
        }
        
        if (this.speed >= this.maxSpeed) {
            this.checkAchievement('speed_demon');
        }
    }
    
    showDifficultyMessage() {
        this.createAdvancedParticles(
            this.canvas.width / 2,
            this.canvas.height / 2,
            '#ff6b6b',
            'explosion',
            20
        );
    }
    
    updateCamera() {
        if (this.camera.shakeIntensity > 0) {
            this.updateAdvancedShake();
            this.camera.shakeIntensity *= 0.9;
            if (this.camera.shakeIntensity < 0.1) {
                this.camera.shakeIntensity = 0;
                this.camera.shake = 0;
                this.camera.shakeX = 0;
                this.camera.shakeY = 0;
                this.camera.shakeRotation = 0;
            }
        }
    }
    
    updateAdvancedShake() {
        const intensity = this.camera.shakeIntensity;
        
        switch (this.camera.shakeType) {
            case 'explosion':
                // Radiale Explosion mit Rotation
                this.camera.shakeX = (Math.random() - 0.5) * intensity * 2;
                this.camera.shakeY = (Math.random() - 0.5) * intensity * 2;
                this.camera.shakeRotation = (Math.random() - 0.5) * intensity * 0.02;
                this.camera.shake = intensity;
                break;
                
            case 'earthquake':
                // Horizontaler Shake mit Wellen
                this.camera.shakeX = Math.sin(Date.now() * 0.02) * intensity;
                this.camera.shakeY = Math.sin(Date.now() * 0.015) * intensity * 0.3;
                this.camera.shake = this.camera.shakeX;
                break;
                
            case 'impact':
                // Kurzer, harter Schlag
                const direction = Math.random() * Math.PI * 2;
                this.camera.shakeX = Math.cos(direction) * intensity;
                this.camera.shakeY = Math.sin(direction) * intensity;
                this.camera.shake = intensity;
                break;
                
            default: // 'normal'
                this.camera.shake = (Math.random() - 0.5) * intensity;
                this.camera.shakeX = this.camera.shake;
                this.camera.shakeY = (Math.random() - 0.5) * intensity * 0.5;
                break;
        }
    }
    
    triggerShake(intensity, type = 'normal', duration = 1.0) {
        this.camera.shakeIntensity = Math.max(this.camera.shakeIntensity, intensity);
        this.camera.shakeType = type;
        
        // Optional: Spezielle Effekte basierend auf Typ
        if (type === 'explosion') {
            this.screenFlash = Math.max(this.screenFlash, 0.5);
        }
    }
    
    // GLOW SYSTEM: Advanced Outline and Glow Effects
    drawGlowOutline(x, y, width, height, color, intensity = 1.0, type = 'rectangle') {
        this.ctx.save();
        
        // Multiple glow layers for professional effect
        const layers = [
            { blur: 25 * intensity, alpha: 0.3 * intensity },
            { blur: 15 * intensity, alpha: 0.5 * intensity },
            { blur: 8 * intensity, alpha: 0.7 * intensity },
            { blur: 3 * intensity, alpha: 0.9 * intensity }
        ];
        
        layers.forEach(layer => {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = layer.blur;
            this.ctx.globalAlpha = layer.alpha;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            if (type === 'circle') {
                this.ctx.arc(x + width/2, y + height/2, Math.max(width, height)/2, 0, Math.PI * 2);
            } else if (type === 'triangle') {
                this.ctx.moveTo(x + width/2, y);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.lineTo(x, y + height);
                this.ctx.closePath();
            } else {
                this.ctx.rect(x, y, width, height);
            }
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    getGlowIntensity(objectType, distance = 0) {
        const baseIntensity = {
            'player': 1.2 + Math.sin(this.time * 0.1) * 0.3,
            'powerup': 1.5 + Math.sin(this.time * 0.15) * 0.5,
            'obstacle': 0.8 + Math.sin(this.time * 0.05) * 0.2,
            'boss': 2.0 + Math.sin(this.time * 0.2) * 0.8
        };
        
        let intensity = baseIntensity[objectType] || 1.0;
        
        // Distance-based intensity (closer = more intense)
        if (distance > 0) {
            intensity *= Math.max(0.3, 1 - distance / 200);
        }
        
        // Combo multiplier for player
        if (objectType === 'player' && this.combo > 0) {
            intensity *= (1 + this.combo * 0.1);
        }
        
        return Math.min(intensity, 3.0);
    }
    
    // ADRENALIN-BOOSTER: Near-Miss Detection System
    detectNearMiss(obstacle) {
        // Skip bereits verarbeitete Hindernisse
        if (obstacle.nearMissTriggered) return;
        
        const distance = this.getDistance(this.player, obstacle);
        const now = Date.now();
        
        // Prüfe Near-Miss Bedingungen
        if (distance < this.nearMissSystem.dangerDistance && 
            distance > 0 && 
            !this.checkCollision(this.player, obstacle) &&
            (now - this.nearMissSystem.lastNearMiss) > this.nearMissSystem.cooldownTime) {
            
            obstacle.nearMissTriggered = true;
            this.nearMissSystem.lastNearMiss = now;
            this.nearMissSystem.totalNearMisses++;
            this.nearMissSystem.streakCount++;
            this.nearMissSystem.maxStreak = Math.max(this.nearMissSystem.maxStreak, this.nearMissSystem.streakCount);
            
            // MASSIVE Belohnung berechnen
            const baseBonus = 150;
            const streakMultiplier = 1 + (this.nearMissSystem.streakCount * 0.5);
            const finalBonus = Math.floor(baseBonus * this.nearMissSystem.rewardMultiplier * streakMultiplier);
            
            // Score-Boost
            this.score += finalBonus;
            this.combo += this.nearMissSystem.comboBonus;
            
            // ADRENALIN-Effekte
            this.triggerShake(4 + this.nearMissSystem.streakCount, 'impact', 0.8);
            this.screenFlash = 0.6 + (this.nearMissSystem.streakCount * 0.1);
            
            // Visuelle Adrenalin-Explosion
            const glowColor = this.nearMissSystem.streakCount > 3 ? '#ffd700' : '#ff6600';
            this.createAdvancedParticles(
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height/2, 
                glowColor, 
                'explosion', 
                15 + (this.nearMissSystem.streakCount * 5)
            );
            
            // Streak-abhängige Nachrichten
            let message = `CLOSE CALL! +${finalBonus}`;
            if (this.nearMissSystem.streakCount >= 3) {
                message = `INSANE STREAK! +${finalBonus}`;
            } else if (this.nearMissSystem.streakCount >= 2) {
                message = `DANGEROUS! +${finalBonus}`;
            }
            
            this.showTemporaryMessage(message, glowColor, 2000);
            
            // FLOW STATE: Massive Momentum für Near-Miss Events
            this.addFlowMomentum(20 + (this.nearMissSystem.streakCount * 10));
            
            // Trigger Sound (simuliert durch intensiveren Screen-Flash)
            this.playSound('near_miss');
        }
    }
    
    showTemporaryMessage(text, color = '#ffffff', duration = 1500) {
        const message = {
            text: text,
            color: color,
            startTime: Date.now(),
            duration: duration,
            x: this.gameWidth / 2,
            y: this.gameHeight / 2 - 100,
            alpha: 1.0,
            scale: 1.5
        };
        
        this.temporaryMessages.push(message);
    }
    
    updateTemporaryMessages() {
        const now = Date.now();
        
        this.temporaryMessages = this.temporaryMessages.filter(message => {
            const elapsed = now - message.startTime;
            const progress = elapsed / message.duration;
            
            if (progress >= 1.0) return false;
            
            // Fade-out Animation
            message.alpha = 1.0 - progress;
            message.scale = 1.5 - (progress * 0.5);
            message.y -= 2; // Floating up effect
            
            return true;
        });
    }
    
    drawTemporaryMessages() {
        this.ctx.save();
        
        for (let message of this.temporaryMessages) {
            this.ctx.globalAlpha = message.alpha;
            this.ctx.font = `bold ${Math.floor(24 * message.scale)}px Arial`;
            this.ctx.fillStyle = message.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Text-Outline für bessere Lesbarkeit
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(message.text, message.x, message.y);
            this.ctx.fillText(message.text, message.x, message.y);
        }
        
        this.ctx.restore();
    }
    
    // ESCALATION-BOOSTER: Flow State Momentum System
    updateFlowState() {
        // Natürlicher Momentum-Verfall
        this.flowState.momentum *= this.flowState.decayRate;
        if (this.flowState.momentum < 1) this.flowState.momentum = 0;
        
        // Flow-Level basierend auf Momentum berechnen
        let newLevel = 0;
        for (let i = 0; i < this.flowState.thresholds.length; i++) {
            if (this.flowState.momentum >= this.flowState.thresholds[i]) {
                newLevel = i + 1;
            }
        }
        
        // Level-Up-Effekte
        if (newLevel > this.flowState.level) {
            this.triggerFlowLevelUp(newLevel);
        }
        
        // Level-Down bei Momentum-Verlust
        if (newLevel < this.flowState.level) {
            this.flowState.level = newLevel;
        }
        
        this.flowState.level = newLevel;
        this.flowState.multiplier = 1 + (this.flowState.level * 0.3);
        this.flowState.maxLevelReached = Math.max(this.flowState.maxLevelReached, this.flowState.level);
    }
    
    addFlowMomentum(baseAmount = null) {
        const amount = baseAmount || this.flowState.momentumGainRate;
        const bonus = this.flowState.level * 2; // Höhere Level = mehr Momentum
        this.flowState.momentum += amount + bonus;
        
        // Cap bei maximaler Momentum
        this.flowState.momentum = Math.min(this.flowState.momentum, 500);
    }
    
    triggerFlowLevelUp(level) {
        this.flowState.lastLevelUp = Date.now();
        
        // MASSIVE visuelle Verstärkung basierend auf Level
        const shakeIntensity = 3 + (level * 2);
        this.triggerShake(shakeIntensity, 'explosion', 1.0 + (level * 0.2));
        
        // Progressiv verstärkende Post-Processing-Effekte
        this.postProcessing.bloom = 0.5 + (level * 0.3);
        this.postProcessing.chromaticAberration = 0.2 + (level * 0.1);
        this.screenFlash = 0.3 + (level * 0.1);
        
        // Level-spezifische Partikel-Explosionen
        const particleCount = 15 + (level * 8);
        const particleColor = `hsl(${level * 60}, 100%, ${50 + level * 10}%)`;
        
        // Screen-wide Partikel-Regen
        for (let i = 0; i < particleCount; i++) {
            this.createAdvancedParticles(
                Math.random() * this.gameWidth,
                Math.random() * this.gameHeight,
                particleColor,
                'spark', 1
            );
        }
        
        // Zentrierte Player-Explosion
        this.createAdvancedParticles(
            this.player.x + this.player.width/2,
            this.player.y + this.player.height/2,
            particleColor,
            'explosion',
            20 + (level * 5)
        );
        
        // Level-spezifische Nachrichten
        const messages = [
            "WARMING UP!", 
            "GETTING HOT!", 
            "ON FIRE!", 
            "UNSTOPPABLE!", 
            "GODLIKE!"
        ];
        
        const message = `FLOW LEVEL ${level}! ${messages[level - 1] || 'MAXIMUM FLOW!'}`;
        this.showTemporaryMessage(message, particleColor, 2500);
        
        // Level-Up Sound (simuliert durch verschiedene Effekte)
        this.playSound('flow_level_up');
    }
    
    drawFlowStateIndicator() {
        // Flow State UI in der oberen rechten Ecke
        this.ctx.save();
        
        const barWidth = 200;
        const barHeight = 8;
        const x = this.gameWidth - barWidth - 20;
        const y = 60;
        
        // Hintergrund
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(x - 10, y - 15, barWidth + 20, barHeight + 30);
        
        // Flow Bar Hintergrund
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Flow Bar Fill
        const progress = this.flowState.momentum / 500; // Max momentum
        const fillWidth = barWidth * progress;
        
        // Gradient basierend auf Flow Level
        const gradient = this.ctx.createLinearGradient(x, y, x + fillWidth, y);
        
        if (this.flowState.level >= 4) {
            gradient.addColorStop(0, '#ff0080');
            gradient.addColorStop(1, '#ffd700');
        } else if (this.flowState.level >= 3) {
            gradient.addColorStop(0, '#ff4400');
            gradient.addColorStop(1, '#ff8800');
        } else if (this.flowState.level >= 2) {
            gradient.addColorStop(0, '#ff6600');
            gradient.addColorStop(1, '#ffaa00');
        } else if (this.flowState.level >= 1) {
            gradient.addColorStop(0, '#ffaa00');
            gradient.addColorStop(1, '#ffcc00');
        } else {
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#45b7d1');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, fillWidth, barHeight);
        
        // Glow Effekt bei hohem Flow
        if (this.flowState.level > 0) {
            this.ctx.shadowColor = gradient;
            this.ctx.shadowBlur = 10 + (this.flowState.level * 5);
            this.ctx.fillRect(x, y, fillWidth, barHeight);
            this.ctx.shadowBlur = 0;
        }
        
        // Flow Level Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FLOW LEVEL ${this.flowState.level}`, x, y - 5);
        
        // Multiplier anzeigen
        if (this.flowState.multiplier > 1) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${this.flowState.multiplier.toFixed(1)}x`, x + barWidth, y - 5);
        }
        
        this.ctx.restore();
    }
    
    // NEAR-MISS-BOOSTER: Last Second Escape System
    predictCollision() {
        if (this.lastSecondEscape.collisionPredicted) return;
        
        for (let obstacle of this.obstacles) {
            const timeToCollision = (obstacle.x - this.player.x) / this.speed;
            
            // Prüfe ob Kollision in nächsten 0.5 Sekunden wahrscheinlich
            if (timeToCollision > 0 && timeToCollision < 0.5) {
                const willCollide = this.checkFutureCollision(obstacle, timeToCollision);
                
                if (willCollide && !obstacle.lastSecondWarned) {
                    obstacle.lastSecondWarned = true;
                    this.lastSecondEscape.collisionPredicted = true;
                    this.lastSecondEscape.predictedObstacle = obstacle;
                    this.lastSecondEscape.dangerWarningTime = Date.now();
                    this.lastSecondEscape.escapeBonus = 800 + (this.flowState.level * 200); // Massive Belohnung
                    
                    // DANGER-Visuelles Feedback
                    this.postProcessing.glitch = 0.8;
                    this.postProcessing.vignette = 0.6;
                    
                    // Danger-Warnung anzeigen
                    this.showTemporaryMessage("⚠️ DANGER! ⚠️", '#ff0000', 800);
                    
                    break;
                }
            }
        }
    }
    
    checkFutureCollision(obstacle, timeToCollision) {
        // Vorhersage der Spielerposition
        const futurePlayerY = this.player.y + (this.player.velocityY * timeToCollision * 60);
        const futurePlayerX = this.player.x; // X-Position ändert sich nicht relativ
        
        // Prüfe ob Kollision basierend auf aktueller Bewegungsrichtung wahrscheinlich
        return (futurePlayerX < obstacle.x + obstacle.width &&
                futurePlayerX + this.player.width > obstacle.x &&
                futurePlayerY < obstacle.y + obstacle.height &&
                futurePlayerY + this.player.height > obstacle.y);
    }
    
    checkLastSecondEscape() {
        if (this.lastSecondEscape.collisionPredicted && this.lastSecondEscape.predictedObstacle) {
            const now = Date.now();
            const timeSinceWarning = now - this.lastSecondEscape.dangerWarningTime;
            const timeSinceAction = now - this.lastActionTime;
            
            // Prüfe ob Spieler in letzter Sekunde reagiert hat
            if (timeSinceAction < this.lastSecondEscape.timeWindow && 
                timeSinceWarning > 200 && // Mindestens 200ms Warnung
                !this.checkCollision(this.player, this.lastSecondEscape.predictedObstacle)) {
                
                // ERFOLGREICHE Last-Second-Rettung!
                this.lastSecondEscape.totalEscapes++;
                this.lastSecondEscape.currentEscapeStreak++;
                this.lastSecondEscape.maxEscapeStreak = Math.max(
                    this.lastSecondEscape.maxEscapeStreak, 
                    this.lastSecondEscape.currentEscapeStreak
                );
                
                // Score-Belohnung mit Streak-Bonus
                const streakMultiplier = 1 + (this.lastSecondEscape.currentEscapeStreak * 0.5);
                const finalBonus = Math.floor(this.lastSecondEscape.escapeBonus * streakMultiplier);
                
                this.score += finalBonus;
                this.combo += 8; // Massive Combo-Boost
                
                // MASSIVE Belohnungseffekte
                this.triggerShake(8 + this.lastSecondEscape.currentEscapeStreak, 'explosion', 2.0);
                this.postProcessing.bloom = 2.0;
                this.postProcessing.chromaticAberration = 0;
                this.postProcessing.glitch = 0;
                this.postProcessing.vignette = 0;
                this.screenFlash = 1.0;
                
                // Euphorie-Partikel-Explosion
                const particleColor = this.lastSecondEscape.currentEscapeStreak > 2 ? '#ffd700' : '#00ff00';
                this.createAdvancedParticles(
                    this.player.x + this.player.width/2, 
                    this.player.y + this.player.height/2,
                    particleColor, 
                    'explosion', 
                    30 + (this.lastSecondEscape.currentEscapeStreak * 10)
                );
                
                // Screen-wide Celebration
                for (let i = 0; i < 20; i++) {
                    this.createAdvancedParticles(
                        Math.random() * this.gameWidth,
                        Math.random() * this.gameHeight,
                        particleColor,
                        'spark', 1
                    );
                }
                
                // Streak-abhängige Nachrichten
                let message = `LAST SECOND SAVE! +${finalBonus}`;
                if (this.lastSecondEscape.currentEscapeStreak >= 3) {
                    message = `MIRACLE STREAK! +${finalBonus}`;
                } else if (this.lastSecondEscape.currentEscapeStreak >= 2) {
                    message = `CLUTCH MASTER! +${finalBonus}`;
                }
                
                this.showTemporaryMessage(message, particleColor, 3000);
                
                // FLOW STATE: Massive Momentum für Last-Second-Escapes
                this.addFlowMomentum(40 + (this.lastSecondEscape.currentEscapeStreak * 20));
                
                this.playSound('last_second_escape');
            }
            
            // Reset nach Zeitfenster oder wenn Hindernis vorbei ist
            if (timeSinceWarning > 1000 || this.lastSecondEscape.predictedObstacle.x < this.player.x) {
                this.resetLastSecondEscape();
            }
        }
    }
    
    resetLastSecondEscape() {
        // Streak reset nur bei erfolgloser Rettung
        if (this.lastSecondEscape.collisionPredicted && 
            Date.now() - this.lastSecondEscape.dangerWarningTime > 1000) {
            this.lastSecondEscape.currentEscapeStreak = 0;
        }
        
        this.lastSecondEscape.collisionPredicted = false;
        this.lastSecondEscape.predictedObstacle = null;
        this.lastSecondEscape.dangerWarningTime = 0;
        this.postProcessing.glitch = 0;
        this.postProcessing.vignette = 0;
    }
    
    // INTELLIGENT AI: Dynamic Difficulty Learning System
    updateAdaptiveAI() {
        // Analyze player performance in real-time
        this.analyzePlayerSkill();
        this.updateEmotionalState();
        this.adaptDifficultyDynamically();
        this.optimizeObstaclePatterns();
    }
    
    analyzePlayerSkill() {
        const ai = this.adaptiveAI;
        
        // Calculate success metrics
        const recentActions = ai.patternAI.learningBuffer.slice(-10);
        if (recentActions.length > 0) {
            const successfulActions = recentActions.filter(action => action.success).length;
            ai.sessionData.successRate = successfulActions / recentActions.length;
        }
        
        // Adjust skill level based on multiple factors
        let skillAdjustment = 0;
        
        // Flow state achievement indicates high skill
        if (this.flowState.level >= 3) {
            skillAdjustment += 0.05;
            ai.sessionData.flowStateReached++;
        }
        
        // Near-miss mastery indicates precision
        if (this.nearMissSystem.streakCount >= 2) {
            skillAdjustment += 0.03;
            ai.sessionData.nearMissSuccess++;
        }
        
        // Last second escapes show quick reflexes
        if (this.lastSecondEscape.currentEscapeStreak >= 1) {
            skillAdjustment += 0.04;
            ai.sessionData.lastSecondEscapes++;
        }
        
        // Combo consistency shows mastery
        if (this.combo >= 10) {
            skillAdjustment += 0.02;
        }
        
        // Reduce skill if player is struggling
        if (ai.sessionData.successRate < 0.3) {
            skillAdjustment -= 0.03;
        }
        
        // Apply gradual skill adjustment
        ai.playerSkillLevel += skillAdjustment * ai.learningRate;
        ai.playerSkillLevel = Math.max(0.5, Math.min(3.0, ai.playerSkillLevel));
    }
    
    updateEmotionalState() {
        const ai = this.adaptiveAI;
        const emotional = ai.emotionalState;
        
        // Frustration increases with repeated failures
        if (ai.sessionData.successRate < 0.4) {
            emotional.frustration = Math.min(1.0, emotional.frustration + 0.01);
        } else {
            emotional.frustration = Math.max(0, emotional.frustration - 0.005);
        }
        
        // Confidence builds with consistent success
        if (ai.sessionData.successRate > 0.7 && this.combo > 5) {
            emotional.confidence = Math.min(1.0, emotional.confidence + 0.008);
        } else if (ai.sessionData.successRate < 0.3) {
            emotional.confidence = Math.max(0.1, emotional.confidence - 0.01);
        }
        
        // Engagement depends on challenge balance
        const challengeBalance = Math.abs(ai.playerSkillLevel - ai.sessionData.difficultyPreference);
        if (challengeBalance < 0.3) {
            emotional.engagement = Math.min(1.0, emotional.engagement + 0.005);
        } else {
            emotional.engagement = Math.max(0.3, emotional.engagement - 0.008);
        }
        
        // Trigger adaptation if needed
        emotional.adaptationNeeded = (emotional.frustration > 0.6 || 
                                     emotional.engagement < 0.5 || 
                                     emotional.confidence < 0.2);
    }
    
    adaptDifficultyDynamically() {
        const ai = this.adaptiveAI;
        
        if (ai.emotionalState.adaptationNeeded) {
            // Reduce difficulty if player is frustrated
            if (ai.emotionalState.frustration > 0.6) {
                ai.patternAI.adaptiveSpacing += 10;
                ai.patternAI.patternComplexity *= 0.95;
                this.showTemporaryMessage("Difficulty Adjusted", '#4ecdc4', 1500);
            }
            
            // Increase difficulty if player is too confident and engaged
            if (ai.emotionalState.confidence > 0.8 && ai.emotionalState.engagement > 0.8) {
                ai.patternAI.adaptiveSpacing = Math.max(150, ai.patternAI.adaptiveSpacing - 5);
                ai.patternAI.patternComplexity = Math.min(2.0, ai.patternAI.patternComplexity * 1.02);
            }
        }
        
        // Cap spacing and complexity
        ai.patternAI.adaptiveSpacing = Math.max(120, Math.min(300, ai.patternAI.adaptiveSpacing));
        ai.patternAI.patternComplexity = Math.max(0.5, Math.min(2.5, ai.patternAI.patternComplexity));
    }
    
    optimizeObstaclePatterns() {
        const ai = this.adaptiveAI;
        
        // Learn from player's preferred actions
        if (this.lastActionTime && Date.now() - this.lastActionTime < 100) {
            const action = {
                type: this.player.isJumping ? 'jump' : (this.player.isSliding ? 'slide' : 'wallrun'),
                success: !this.gameState === 'over',
                reactionTime: Date.now() - this.lastActionTime,
                timestamp: Date.now()
            };
            
            ai.patternAI.learningBuffer.push(action);
            
            // Keep only last 20 actions for analysis
            if (ai.patternAI.learningBuffer.length > 20) {
                ai.patternAI.learningBuffer.shift();
            }
            
            // Update preferred actions
            if (action.success) {
                ai.sessionData.preferredActions[action.type]++;
            }
        }
    }
    
    getAdaptiveObstacleSpacing() {
        // Return AI-calculated optimal spacing
        const baseSpacing = 200;
        const skillModifier = this.adaptiveAI.playerSkillLevel;
        const emotionalModifier = 1 - (this.adaptiveAI.emotionalState.frustration * 0.3);
        
        return Math.floor(baseSpacing * emotionalModifier / skillModifier);
    }
    
    shouldSpawnComplexPattern() {
        // AI decides if player is ready for complex patterns
        const ai = this.adaptiveAI;
        const readyForChallenge = (
            ai.playerSkillLevel > 1.2 &&
            ai.emotionalState.confidence > 0.6 &&
            ai.emotionalState.frustration < 0.4 &&
            ai.sessionData.successRate > 0.6
        );
        
        return readyForChallenge && Math.random() < (ai.patternAI.patternComplexity * 0.3);
    }
    
    // PROGRESSION SYSTEM: Skill Abilities Management
    checkSkillUnlocks() {
        for (let ability of this.skillSystem.availableAbilities) {
            if (this.skillSystem.unlockedAbilities.includes(ability.id)) continue;
            
            let canUnlock = false;
            
            switch (ability.unlockRequirement.type) {
                case 'combo':
                    canUnlock = this.maxCombo >= ability.unlockRequirement.value;
                    break;
                case 'near_miss':
                    canUnlock = this.nearMissSystem.totalNearMisses >= ability.unlockRequirement.value;
                    break;
                case 'last_second_escape':
                    canUnlock = this.lastSecondEscape.totalEscapes >= ability.unlockRequirement.value;
                    break;
                case 'flow_level':
                    canUnlock = this.flowState.maxLevelReached >= ability.unlockRequirement.value;
                    break;
                case 'skill_level':
                    canUnlock = this.adaptiveAI.playerSkillLevel >= ability.unlockRequirement.value;
                    break;
            }
            
            if (canUnlock) {
                this.unlockAbility(ability.id);
            }
        }
    }
    
    unlockAbility(abilityId) {
        this.skillSystem.unlockedAbilities.push(abilityId);
        const ability = this.skillSystem.availableAbilities.find(a => a.id === abilityId);
        
        // Massive unlock celebration
        this.triggerShake(10, 'explosion', 3.0);
        this.postProcessing.bloom = 2.5;
        this.screenFlash = 1.0;
        
        // Screen-wide celebration particles
        for (let i = 0; i < 50; i++) {
            this.createAdvancedParticles(
                Math.random() * this.gameWidth,
                Math.random() * this.gameHeight,
                '#ffd700',
                'spark', 1
            );
        }
        
        this.showTemporaryMessage(`🎉 ${ability.name} UNLOCKED! 🎉`, '#ffd700', 4000);
        this.playSound('ability_unlock');
    }
    
    hasAbility(abilityId) {
        return this.skillSystem.unlockedAbilities.includes(abilityId);
    }
    
    useAbility(abilityId) {
        if (!this.hasAbility(abilityId)) return false;
        
        const ability = this.skillSystem.availableAbilities.find(a => a.id === abilityId);
        if (!ability || ability.cooldown > 0) return false;
        
        switch (abilityId) {
            case 'double_jump':
                return this.executeDoubleJump();
            case 'dash_attack':
                return this.executeDashAttack();
            case 'time_slow':
                return this.executeTimeSlow();
            case 'perfect_landing':
                return this.executePerfectLanding();
            case 'obstacle_preview':
                return this.executeObstaclePreview();
        }
        
        return false;
    }
    
    executeDoubleJump() {
        if (this.player.isJumping && !this.player.doubleJumpUsed) {
            this.player.velocityY = -12;
            this.player.doubleJumpUsed = true;
            
            // Special double jump effects
            this.createAdvancedParticles(
                this.player.x + this.player.width/2, 
                this.player.y + this.player.height/2, 
                '#00ffff', 'explosion', 20
            );
            
            this.addFlowMomentum(15);
            this.showTemporaryMessage("DOUBLE JUMP!", '#00ffff', 1000);
            return true;
        }
        return false;
    }
    
    executeDashAttack() {
        // Destroy nearby obstacles
        const dashRange = 100;
        let obstaclesDestroyed = 0;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            const distance = Math.abs(obstacle.x - this.player.x);
            
            if (distance < dashRange) {
                this.obstacles.splice(i, 1);
                obstaclesDestroyed++;
                
                this.createAdvancedParticles(
                    obstacle.x + obstacle.width/2, 
                    obstacle.y + obstacle.height/2, 
                    '#ff6600', 'explosion', 15
                );
            }
        }
        
        if (obstaclesDestroyed > 0) {
            this.score += obstaclesDestroyed * 200;
            this.combo += obstaclesDestroyed * 2;
            this.addFlowMomentum(20 * obstaclesDestroyed);
            
            this.triggerShake(5, 'impact', 1.0);
            this.showTemporaryMessage(`DASH ATTACK! +${obstaclesDestroyed * 200}`, '#ff6600', 1500);
            return true;
        }
        
        return false;
    }
    
    executeTimeSlow() {
        // Temporarily slow down the game
        this.timeSlowActive = true;
        this.timeSlowDuration = 2000; // 2 seconds
        this.timeSlowStartTime = Date.now();
        
        this.postProcessing.chromaticAberration = 0.5;
        this.showTemporaryMessage("⏰ BULLET TIME ⏰", '#00ff00', 2000);
        
        return true;
    }
    
    updateSkillSystem() {
        this.checkSkillUnlocks();
        
        // Update cooldowns
        for (let ability of this.skillSystem.availableAbilities) {
            if (ability.cooldown > 0) {
                ability.cooldown--;
            }
        }
        
        // Handle time slow
        if (this.timeSlowActive) {
            const elapsed = Date.now() - this.timeSlowStartTime;
            if (elapsed >= this.timeSlowDuration) {
                this.timeSlowActive = false;
                this.postProcessing.chromaticAberration = 0;
            }
        }
        
        // Reset double jump when landing
        if (!this.player.isJumping) {
            this.player.doubleJumpUsed = false;
        }
    }
    
    drawSkillIndicators() {
        this.ctx.save();
        
        const startX = 20;
        const startY = this.gameHeight - 80;
        const iconSize = 40;
        const spacing = 50;
        
        for (let i = 0; i < this.skillSystem.unlockedAbilities.length; i++) {
            const abilityId = this.skillSystem.unlockedAbilities[i];
            const ability = this.skillSystem.availableAbilities.find(a => a.id === abilityId);
            
            if (!ability) continue;
            
            const x = startX + (i * spacing);
            const y = startY;
            
            // Background circle
            this.ctx.fillStyle = ability.cooldown > 0 ? 'rgba(100, 100, 100, 0.8)' : 'rgba(0, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ability icon (simplified)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            let icon = '?';
            switch (abilityId) {
                case 'double_jump': icon = '⬆️'; break;
                case 'dash_attack': icon = '💥'; break;
                case 'time_slow': icon = '⏰'; break;
                case 'perfect_landing': icon = '🎯'; break;
                case 'obstacle_preview': icon = '👁️'; break;
            }
            
            this.ctx.fillText(icon, x + iconSize/2, y + iconSize/2);
        }
        
        this.ctx.restore();
    }
    
    // ADAPTIVE AUDIO: Dynamic Music Engine
    updateAdaptiveAudio() {
        this.analyzeGameplayIntensity();
        this.adaptMusicLayers();
        this.updateAudioEffects();
    }
    
    analyzeGameplayIntensity() {
        const audio = this.audioEngine;
        const layers = audio.contextualLayers;
        
        // Analyze danger level
        let dangerLevel = 0;
        if (this.lastSecondEscape.collisionPredicted) dangerLevel += 0.8;
        if (this.nearMissSystem.streakCount > 0) dangerLevel += 0.3;
        if (this.speed > 6) dangerLevel += 0.4;
        if (this.bossActive) dangerLevel += 0.6;
        layers.danger = Math.min(1.0, dangerLevel);
        
        // Analyze flow state
        layers.flow = this.flowState.level / 5.0;
        
        // Analyze tension
        let tensionLevel = 0;
        if (this.adaptiveAI.emotionalState.frustration > 0.5) tensionLevel += 0.6;
        if (this.combo > 10) tensionLevel += 0.4;
        if (this.nearMissSystem.streakCount >= 2) tensionLevel += 0.5;
        layers.tension = Math.min(1.0, tensionLevel);
        
        // Analyze triumph moments
        let triumphLevel = 0;
        if (this.lastSecondEscape.currentEscapeStreak > 0) triumphLevel += 0.8;
        if (this.flowState.level >= 4) triumphLevel += 0.7;
        if (this.nearMissSystem.streakCount >= 3) triumphLevel += 0.6;
        layers.triumph = Math.min(1.0, triumphLevel);
        
        // Calculate target intensity and BPM
        const intensityFactors = [
            layers.danger * 0.4,
            layers.flow * 0.3,
            layers.tension * 0.2,
            layers.triumph * 0.1
        ];
        
        audio.targetIntensity = Math.min(1.0, intensityFactors.reduce((a, b) => a + b, 0.3));
        audio.targetBpm = 120 + (audio.targetIntensity * 60); // 120-180 BPM range
    }
    
    adaptMusicLayers() {
        const audio = this.audioEngine;
        
        // Gradually adapt to target values
        audio.intensity += (audio.targetIntensity - audio.intensity) * audio.adaptationRate;
        audio.bpm += (audio.targetBpm - audio.bpm) * audio.adaptationRate;
        
        // Adapt individual layers based on context
        const layers = audio.contextualLayers;
        
        // Bass responds to danger and flow
        audio.bassLevel = Math.min(1.0, (layers.danger * 0.6) + (layers.flow * 0.4));
        
        // Melody responds to flow and triumph
        audio.melodyLevel = Math.min(1.0, (layers.flow * 0.5) + (layers.triumph * 0.5));
        
        // Effects respond to tension and triumph
        audio.effectsLevel = Math.min(1.0, (layers.tension * 0.4) + (layers.triumph * 0.6));
    }
    
    updateAudioEffects() {
        const audio = this.audioEngine;
        
        // Update beat timing for rhythm-based effects
        const beatInterval = (60 / audio.bpm) * 1000; // ms per beat
        const now = Date.now();
        
        if (now >= audio.nextBeatTime) {
            audio.lastBeat = now;
            audio.nextBeatTime = now + beatInterval;
            this.triggerAudioBeat();
        }
        
        // Generate dynamic frequencies for procedural audio
        if (audio.dynamicFrequencies.length < 8) {
            const baseFreq = 220 + (audio.intensity * 440); // 220-660 Hz
            const harmonic = baseFreq * (1 + Math.random() * 2);
            audio.dynamicFrequencies.push({
                frequency: harmonic,
                amplitude: audio.intensity * 0.3,
                decay: 0.95
            });
        }
        
        // Decay frequencies
        audio.dynamicFrequencies = audio.dynamicFrequencies.filter(freq => {
            freq.amplitude *= freq.decay;
            return freq.amplitude > 0.01;
        });
    }
    
    triggerAudioBeat() {
        const audio = this.audioEngine;
        
        // Visual beat synchronization
        if (audio.intensity > 0.7) {
            // Pulse the flow state indicator to the beat
            const flowBar = document.querySelector('#flowStateIndicator');
            if (flowBar) {
                flowBar.style.transform = `scale(${1 + audio.intensity * 0.1})`;
                setTimeout(() => {
                    if (flowBar) flowBar.style.transform = 'scale(1)';
                }, 100);
            }
            
            // Subtle screen pulse for high intensity moments
            this.screenFlash = Math.max(this.screenFlash, audio.intensity * 0.1);
        }
        
        // Particle beat sync
        if (audio.bassLevel > 0.6 && Math.random() < audio.bassLevel) {
            this.createAdvancedParticles(
                Math.random() * this.gameWidth,
                this.gameHeight - 50,
                `hsl(${audio.intensity * 360}, 70%, 50%)`,
                'spark', 1
            );
        }
    }
    
    getContextualSoundVolume(soundType) {
        const audio = this.audioEngine;
        const base = 0.3;
        
        switch (soundType) {
            case 'jump':
            case 'collision':
                return base + (audio.effectsLevel * 0.4);
            case 'powerup':
            case 'combo':
                return base + (audio.contextualLayers.triumph * 0.5);
            case 'near_miss':
            case 'last_second_escape':
                return base + (audio.contextualLayers.tension * 0.6);
            case 'flow_level_up':
            case 'ability_unlock':
                return base + (audio.contextualLayers.triumph * 0.8);
            default:
                return base + (audio.effectsLevel * 0.2);
        }
    }
    
    drawAudioVisualization() {
        // Optional: Visual representation of audio intensity
        if (this.audioEngine.intensity > 0.6) {
            this.ctx.save();
            
            const x = this.gameWidth - 100;
            const y = this.gameHeight - 150;
            const size = 60;
            
            // Audio intensity circle
            this.ctx.globalAlpha = this.audioEngine.intensity * 0.3;
            this.ctx.fillStyle = `hsl(${this.audioEngine.intensity * 120}, 80%, 50%)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * this.audioEngine.intensity, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Beat pulse
            const beatProgress = (Date.now() - this.audioEngine.lastBeat) / ((60 / this.audioEngine.bpm) * 1000);
            if (beatProgress < 0.2) {
                this.ctx.globalAlpha = (0.2 - beatProgress) * 2;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    // ADVANCED GRAPHICS: Shader-Style Effects System
    updateAdvancedGraphics() {
        this.updateShaderEffects();
        this.updateDynamicLighting();
        this.updateMaterialProperties();
    }
    
    updateShaderEffects() {
        const gfx = this.advancedGraphics.shaderEffects;
        
        // Dynamic effect adjustment based on gameplay
        if (this.flowState.level >= 3) {
            gfx.edgeGlow = 0.8 + Math.sin(this.time * 0.1) * 0.2;
            gfx.lightRays = 0.6 + (this.flowState.level * 0.1);
        }
        
        if (this.lastSecondEscape.collisionPredicted) {
            gfx.distortion = 0.3 + Math.sin(this.time * 0.05) * 0.2;
            gfx.colorSeparation = 0.4;
        } else {
            gfx.distortion *= 0.9;
            gfx.colorSeparation *= 0.9;
        }
        
        if (this.nearMissSystem.streakCount > 0) {
            gfx.heatDistortion = 0.2 + (this.nearMissSystem.streakCount * 0.1);
        } else {
            gfx.heatDistortion *= 0.95;
        }
        
        // Speed-based effects
        if (this.speed > 6) {
            gfx.scanlines = 0.5;
            gfx.filmGrain = 0.3;
        }
    }
    
    updateDynamicLighting() {
        const lighting = this.advancedGraphics.dynamicLighting;
        
        // Time-of-day lighting
        const timeOfDay = Math.sin(this.time * 0.01) * 0.5 + 0.5;
        lighting.ambientColor = [
            0.2 + timeOfDay * 0.4,
            0.3 + timeOfDay * 0.3,
            0.4 + timeOfDay * 0.2
        ];
        
        // Dynamic directional light
        lighting.directionalLight.intensity = 0.6 + timeOfDay * 0.4;
        
        // Add point lights for special effects
        if (this.flowState.level >= 2) {
            const existingPlayerLight = lighting.pointLights.find(l => l.id === 'player');
            if (!existingPlayerLight) {
                lighting.pointLights.push({
                    id: 'player',
                    x: this.player.x + this.player.width/2,
                    y: this.player.y + this.player.height/2,
                    color: [0.3, 0.8, 1.0],
                    intensity: this.flowState.level * 0.3,
                    radius: 80
                });
            } else {
                existingPlayerLight.x = this.player.x + this.player.width/2;
                existingPlayerLight.y = this.player.y + this.player.height/2;
                existingPlayerLight.intensity = this.flowState.level * 0.3;
            }
        }
        
        // Remove expired lights
        lighting.pointLights = lighting.pointLights.filter(light => 
            light.intensity > 0.01 || light.id === 'player'
        );
    }
    
    updateMaterialProperties() {
        // Dynamic material changes based on game state
        if (this.combo > 10) {
            this.advancedGraphics.materialSystem.player.emission = 0.4 + (this.combo * 0.02);
            this.advancedGraphics.materialSystem.player.metallic = 0.3;
        }
        
        if (this.hasActivePowerup('shield')) {
            this.advancedGraphics.materialSystem.player.roughness = 0.1;
            this.advancedGraphics.materialSystem.player.metallic = 0.8;
        }
    }
    
    applyAdvancedPostProcessing() {
        // ADAPTIVE POST-PROCESSING based on performance budget
        if (!this.adaptiveGraphics || !this.adaptiveGraphics.postProcessing) return;
        
        const canvas = this.canvas;
        const ctx = this.ctx;
        const gfx = this.advancedGraphics.shaderEffects;
        
        // Skip expensive pixel manipulation on low-end devices
        if (this.deviceInfo.performanceCategory === 'legacy') return;
        
        // OPTIMIZED iPad POST-PROCESSING PIPELINE
        if (this.deviceInfo.isIPad && this.deviceInfo.gpuTier >= 3) {
            this.applyIPadOptimizedEffects(ctx, gfx);
            return;
        }
        
        // Get current frame data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply shader-style effects based on performance budget
        if (this.adaptiveGraphics.shaderEffects) {
            this.applyColorSeparation(data, canvas.width, canvas.height, gfx.colorSeparation);
            this.applyFilmGrain(data, canvas.width, canvas.height, gfx.filmGrain);
            this.applyScanlines(data, canvas.width, canvas.height, gfx.scanlines);
            this.applyDistortion(data, canvas.width, canvas.height, gfx.distortion);
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        // Apply additional effects that require drawing (only on capable devices)
        if (this.adaptiveGraphics.advancedEffects) {
            this.applyEdgeGlow(gfx.edgeGlow);
            this.applyVolumetricLighting(gfx.lightRays);
        }
    }
    
    applyIPadOptimizedEffects(ctx, gfx) {
        // iPad-specific GPU-accelerated effects using compositing modes
        ctx.save();
        
        // Enhanced Bloom Effect for iPad
        if (this.postProcessing.bloom > 0) {
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = this.postProcessing.bloom * 0.3;
            ctx.filter = 'blur(8px) brightness(1.5)';
            ctx.drawImage(this.canvas, 0, 0);
            ctx.filter = 'none';
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }
        
        // Enhanced Color Grading for iPads
        if (gfx.colorSeparation > 0) {
            const intensity = gfx.colorSeparation;
            ctx.globalCompositeOperation = 'multiply';
            
            // Red channel shift
            ctx.fillStyle = `rgba(255, 100, 100, ${intensity * 0.3})`;
            ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            
            // Blue channel shift  
            ctx.fillStyle = `rgba(100, 100, 255, ${intensity * 0.3})`;
            ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Dynamic Lighting Effects
        if (gfx.lightRays > 0) {
            this.drawVolumetricLighting(ctx, gfx.lightRays);
        }
        
        // Edge Glow Enhancement
        if (gfx.edgeGlow > 0) {
            this.drawAdvancedEdgeGlow(ctx, gfx.edgeGlow);
        }
        
        ctx.restore();
    }
    
    drawVolumetricLighting(ctx, intensity) {
        const centerX = this.gameWidth * 0.8;
        const centerY = this.gameHeight * 0.2;
        const maxRadius = Math.max(this.gameWidth, this.gameHeight);
        
        // Create radial gradient for volumetric light
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, `rgba(255, 245, 180, ${intensity * 0.3})`);
        gradient.addColorStop(0.4, `rgba(255, 220, 100, ${intensity * 0.15})`);
        gradient.addColorStop(0.8, `rgba(255, 180, 50, ${intensity * 0.05})`);
        gradient.addColorStop(1, 'rgba(255, 180, 50, 0)');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        ctx.globalCompositeOperation = 'source-over';
    }
    
    drawAdvancedEdgeGlow(ctx, intensity) {
        // Enhanced edge glow for high-end iPads
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(100, 200, 255, ${intensity * 0.6})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `rgba(100, 200, 255, ${intensity})`;
        ctx.shadowBlur = 15;
        
        // Glow around player
        ctx.strokeRect(
            this.player.x - 5, 
            this.player.y - 5, 
            this.player.width + 10, 
            this.player.height + 10
        );
        
        // Glow around obstacles for visual clarity
        this.obstacles.forEach(obstacle => {
            if (obstacle.x > -100 && obstacle.x < this.gameWidth + 100) {
                ctx.strokeRect(obstacle.x - 2, obstacle.y - 2, obstacle.width + 4, obstacle.height + 4);
            }
        });
        
        ctx.restore();
    }
    
    applyColorSeparation(data, width, height, intensity) {
        if (intensity <= 0) return;
        
        const offset = Math.floor(intensity * 5);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                // Red channel shift
                if (x + offset < width) {
                    const srcI = (y * width + (x + offset)) * 4;
                    data[i] = data[srcI];
                }
                
                // Blue channel shift
                if (x - offset >= 0) {
                    const srcI = (y * width + (x - offset)) * 4;
                    data[i + 2] = data[srcI + 2];
                }
            }
        }
    }
    
    applyFilmGrain(data, width, height, intensity) {
        if (intensity <= 0) return;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 255;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }
    
    applyScanlines(data, width, height, intensity) {
        if (intensity <= 0) return;
        
        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                data[i] *= (1 - intensity);
                data[i + 1] *= (1 - intensity);
                data[i + 2] *= (1 - intensity);
            }
        }
    }
    
    applyDistortion(data, width, height, intensity) {
        if (intensity <= 0) return;
        
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const normalizedDistance = distance / maxRadius;
                
                const distortAmount = intensity * Math.sin(normalizedDistance * Math.PI * 4) * 5;
                const angle = Math.atan2(dy, dx);
                
                const sourceX = Math.floor(x + Math.cos(angle) * distortAmount);
                const sourceY = Math.floor(y + Math.sin(angle) * distortAmount);
                
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const sourceI = (sourceY * width + sourceX) * 4;
                    const targetI = (y * width + x) * 4;
                    
                    data[targetI] = data[sourceI];
                    data[targetI + 1] = data[sourceI + 1];
                    data[targetI + 2] = data[sourceI + 2];
                }
            }
        }
    }
    
    applyEdgeGlow(intensity) {
        if (intensity <= 0) return;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = intensity * 0.3;
        
        // Edge detection simulation through multiple blur layers
        const gradient = this.ctx.createRadialGradient(
            this.gameWidth/2, this.gameHeight/2, 0,
            this.gameWidth/2, this.gameHeight/2, this.gameWidth
        );
        gradient.addColorStop(0, 'rgba(64, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(32, 128, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 64, 255, 0.0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        this.ctx.restore();
    }
    
    applyVolumetricLighting(intensity) {
        if (intensity <= 0) return;
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = intensity * 0.4;
        
        // God rays effect
        const rayCount = 8;
        const lightX = this.gameWidth * 0.8;
        const lightY = this.gameHeight * 0.2;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const rayLength = this.gameWidth * 1.5;
            
            const gradient = this.ctx.createLinearGradient(
                lightX, lightY,
                lightX + Math.cos(angle) * rayLength,
                lightY + Math.sin(angle) * rayLength
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 100, 0.0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 20;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(lightX, lightY);
            this.ctx.lineTo(
                lightX + Math.cos(angle) * rayLength,
                lightY + Math.sin(angle) * rayLength
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    updateScreenFlash() {
        if (this.screenFlash > 0) {
            this.screenFlash -= 0.05;
            if (this.screenFlash < 0) this.screenFlash = 0;
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // ADAPTIVE RENDERING based on performance category
        if (this.emergencyMode || this.deviceInfo.performanceCategory === 'legacy') {
            this.renderLowEndFallback();
            return;
        }
        
        // STANDARD RENDERING with adaptive quality - using safe system wrappers
        this.safeSystems.renderer.safeCall('drawBackground');
        this.safeSystems.renderer.safeCall('drawClouds');
        this.safeSystems.renderer.safeCall('drawGround');
        
        // Only draw shadows on capable devices
        if (this.adaptiveGraphics.shadows) {
            this.drawDynamicShadows();
        }
        
        this.drawParticles();
        this.drawRiskRewardZones();
        this.drawWalls();
        
        // Advanced trails only on mid-range and above
        if (this.deviceInfo.performanceCategory !== 'low_end') {
            this.drawAdvancedTrails();
        }
        
        // MODERN SHADER-STYLE RENDERING
        this.applyModernShaderEffects();
        
        this.drawPlayer();
        this.drawObstacles();
        this.drawPowerups();
        this.drawBoss();
        
        // ADVANCED VISUAL ENHANCEMENTS
        this.drawModernVFX();
        this.applyHolographicEffects();
        
        // Lighting effects only on capable devices
        if (this.adaptiveGraphics.advancedEffects) {
            this.drawLightingEffects();
        }
        
        // Post-processing only when enabled
        if (this.adaptiveGraphics.postProcessing) {
            this.applyPostProcessing();
            this.applyAdvancedPostProcessing();
        }
        
        if (this.countdownActive) {
            this.drawCountdown();
        }
        
        if (this.screenFlash > 0) {
            this.drawScreenFlash();
        }
        
        // ADRENALIN-NACHRICHTEN über allem anderen rendern
        this.drawTemporaryMessages();
        
        // Flow State Indicator
        this.drawFlowStateIndicator();
        
        // Skill Abilities UI
        this.drawSkillIndicators();
        
        // INSTANT GRATIFICATION SYSTEMS - Enhanced fun visual feedback
        this.renderFloatingScorePopups();
        this.renderMicroCelebrations();
        
        // Audio Visualization
        this.drawAudioVisualization();
        
        // EXPANSION SYSTEMS RENDERING
        this.drawEnvironmentalHazards();
        this.drawShopUI();
    }
    
    drawCountdown() {
        this.ctx.save();
        
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
        this.ctx.font = 'bold 120px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const text = this.countdownValue > 0 ? this.countdownValue.toString() : 'GO!';
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(text, this.gameWidth / 2, this.gameHeight / 2);
        this.ctx.fillText(text, this.gameWidth / 2, this.gameHeight / 2);
        
        this.ctx.restore();
    }
    
    drawScreenFlash() {
        this.ctx.save();
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlash * 0.8})`;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        this.ctx.restore();
    }
    
    drawLightingEffects() {
        this.ctx.save();
        
        this.updateEnhancedLighting();
        this.applyThreePointLighting();
        this.drawVolometricRays();
        this.applySpeedBasedLighting();
        
        this.ctx.restore();
    }
    
    updateEnhancedLighting() {
        const timeOfDay = Math.sin(this.time * 0.008) * 0.5 + 0.5;
        const intensity = Math.sin(this.time * 0.02) * 0.1 + 0.9;
        
        // Key Light (Hauptlicht) - bewegt sich mit Tageszeit
        this.enhancedLighting.keyLight.x = 0.2 + timeOfDay * 0.6;
        this.enhancedLighting.keyLight.y = 0.1 + Math.sin(timeOfDay * Math.PI) * 0.2;
        this.enhancedLighting.keyLight.intensity = 0.6 + timeOfDay * 0.4;
        
        // Anpassung der Lichtfarben an Tageszeit
        if (timeOfDay > 0.7) {
            // Warmes Tageslicht
            this.enhancedLighting.keyLight.color = { r: 1, g: 0.95, b: 0.8 };
            this.enhancedLighting.globalAmbient = { r: 0.9, g: 0.9, b: 1, intensity: 0.6 };
        } else if (timeOfDay > 0.3) {
            // Goldene Stunde
            this.enhancedLighting.keyLight.color = { r: 1, g: 0.8, b: 0.6 };
            this.enhancedLighting.globalAmbient = { r: 1, g: 0.7, b: 0.5, intensity: 0.4 };
        } else {
            // Blaue Stunde/Nacht
            this.enhancedLighting.keyLight.color = { r: 0.6, g: 0.8, b: 1 };
            this.enhancedLighting.globalAmbient = { r: 0.2, g: 0.3, b: 0.6, intensity: 0.3 };
        }
        
        // Rim Light Animation für dramatische Silhouetten
        this.enhancedLighting.rimLight.intensity = 0.4 + Math.sin(this.time * 0.05) * 0.3;
    }
    
    applyThreePointLighting() {
        // Key Light - Hauptbeleuchtung
        this.applyDirectionalLight(
            this.enhancedLighting.keyLight.x * this.gameWidth,
            this.enhancedLighting.keyLight.y * this.gameHeight,
            this.enhancedLighting.keyLight.intensity,
            this.enhancedLighting.keyLight.color,
            this.gameWidth * 1.5
        );
        
        // Fill Light - Aufhellung der Schatten
        this.applyDirectionalLight(
            this.enhancedLighting.fillLight.x * this.gameWidth,
            this.enhancedLighting.fillLight.y * this.gameHeight,
            this.enhancedLighting.fillLight.intensity,
            this.enhancedLighting.fillLight.color,
            this.gameWidth * 1.2
        );
        
        // Rim Light - Konturbeleuchtung
        this.applyDirectionalLight(
            this.enhancedLighting.rimLight.x * this.gameWidth,
            this.enhancedLighting.rimLight.y * this.gameHeight,
            this.enhancedLighting.rimLight.intensity,
            this.enhancedLighting.rimLight.color,
            this.gameWidth * 0.8
        );
    }
    
    applyDirectionalLight(x, y, intensity, color, radius) {
        const lightGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);
        
        lightGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.15})`);
        lightGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${intensity * 0.08})`);
        lightGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${intensity * 0.03})`);
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = lightGradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    drawVolometricRays() {
        // Volumetrische Lichtstrahlen für dramatische Atmosphäre
        const rayCount = 8;
        const keyLight = this.enhancedLighting.keyLight;
        
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.1;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + this.time * 0.01;
            const rayLength = this.gameWidth * 0.8;
            const startX = keyLight.x * this.gameWidth;
            const startY = keyLight.y * this.gameHeight;
            const endX = startX + Math.cos(angle) * rayLength;
            const endY = startY + Math.sin(angle) * rayLength;
            
            const rayGradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
            rayGradient.addColorStop(0, `rgba(255, 255, 200, ${keyLight.intensity * 0.3})`);
            rayGradient.addColorStop(0.5, `rgba(255, 255, 150, ${keyLight.intensity * 0.1})`);
            rayGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
            
            this.ctx.strokeStyle = rayGradient;
            this.ctx.lineWidth = 2 + Math.sin(this.time * 0.03 + i) * 1;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    applySpeedBasedLighting() {
        // Speed-Streak-Beleuchtung
        if (this.speed > 6) {
            const speedIntensity = (this.speed - 6) / 4;
            
            // Motion-basierte Lichtstreifen
            this.ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < 5; i++) {
                const streakGradient = this.ctx.createLinearGradient(
                    this.gameWidth * (0.8 + i * 0.05), 0,
                    this.gameWidth * (0.3 + i * 0.1), this.gameHeight
                );
                streakGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                streakGradient.addColorStop(0.5, `rgba(100, 200, 255, ${speedIntensity * 0.1})`);
                streakGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = streakGradient;
                this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            }
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Traditionelle Speed-Vignette (beibehalten)
        if (this.speed > 6) {
            const vignetteIntensity = (this.speed - 6) / 4;
            const vignetteGradient = this.ctx.createRadialGradient(
                this.gameWidth / 2, this.gameHeight / 2, 0,
                this.gameWidth / 2, this.gameHeight / 2, this.gameWidth * 0.8
            );
            vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignetteGradient.addColorStop(0.7, `rgba(0, 0, 0, ${vignetteIntensity * 0.1})`);
            vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteIntensity * 0.3})`);
            
            this.ctx.fillStyle = vignetteGradient;
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }
    }
    
    updatePostProcessing() {
        // Motion Blur bei hoher Geschwindigkeit
        this.postProcessing.motionBlur = Math.max(0, (this.speed - 5) * 0.3);
        
        // Chromatic Aberration bei Kollisionen
        if (this.chromaticAberration > 0) {
            this.postProcessing.chromaticAberration = this.chromaticAberration;
            this.chromaticAberration *= 0.95;
        }
        
        // Dynamic Color Grading basierend auf Level
        const levelHue = (this.difficultyLevel * 30) % 360;
        this.postProcessing.colorGrading.hue = levelHue;
        this.postProcessing.colorGrading.saturation = 1 + Math.sin(this.time * 0.01) * 0.2;
        
        // Vignette bei hoher Geschwindigkeit
        this.postProcessing.vignette = Math.min(0.4, (this.speed - 6) * 0.1);
        
        // Bloom-Effekt bei Power-ups und hohen Combos
        this.postProcessing.bloom = Math.max(0, this.combo / 20 + (this.hasActivePowerup() ? 0.3 : 0));
        
        // Scanlines-Effekt für Retro-Look bei bestimmten Levels
        this.postProcessing.scanlines = (this.difficultyLevel % 3 === 0);
        
        // Glitch-Effekt bei kritischen Situationen
        if (this.obstacles.some(obs => Math.abs(obs.x - this.player.x) < 80)) {
            this.postProcessing.glitch = Math.random() * 0.5;
        } else {
            this.postProcessing.glitch *= 0.8;
        }
        
        // Distortion-Effekt bei hoher Geschwindigkeit
        this.postProcessing.distortion = Math.max(0, (this.speed - 7) * 0.2);
        
        // Film Grain für cinematischen Look
        this.postProcessing.filmGrain = 0.1 + Math.sin(this.time * 0.1) * 0.05;
    }
    
    applyPostProcessing() {
        // Post-Processing-Effekte auf das gesamte Canvas
        this.ctx.save();
        
        // Chromatic Aberration Effekt
        if (this.postProcessing.chromaticAberration > 0) {
            const offset = this.postProcessing.chromaticAberration;
            
            // Rot-Kanal verschieben
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
            this.ctx.fillRect(-offset, 0, this.gameWidth, this.gameHeight);
            
            // Blau-Kanal verschieben
            this.ctx.fillStyle = `rgba(0, 0, 255, 0.3)`;
            this.ctx.fillRect(offset, 0, this.gameWidth, this.gameHeight);
            
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Color Grading mit Filter (nur moderne Browser)
        if (this.ctx.filter && (this.postProcessing.colorGrading.saturation !== 1 || this.postProcessing.colorGrading.brightness !== 1)) {
            const saturation = this.postProcessing.colorGrading.saturation * 100;
            const brightness = this.postProcessing.colorGrading.brightness * 100;
            const hue = this.postProcessing.colorGrading.hue;
            
            this.ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`;
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.filter = 'none';
        }
        
        // VISUAL JUICE EFFECTS - Enhanced fun feedback
        const juice = this.visualJuice;
        
        // Screen pulse effect for perfect timing
        if (juice.screenPulse > 0) {
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(255, 255, 100, ${juice.screenPulse * 0.3})`;
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Chromatic shift for juice effects
        if (juice.chromaticShift > 0) {
            const shift = juice.chromaticShift * 3;
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = `rgba(255, 0, 255, ${juice.chromaticShift * 0.2})`;
            this.ctx.fillRect(-shift, 0, this.gameWidth, this.gameHeight);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Enhanced glow for special actions
        if (juice.glowIntensity > 0) {
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(0, 255, 150, ${juice.glowIntensity * 0.15})`;
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Bloom-Effekt
        if (this.postProcessing.bloom > 0) {
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = this.postProcessing.bloom * 0.5;
            
            // Mehrfaches Zeichnen für Bloom-Effekt
            for (let i = 0; i < 3; i++) {
                this.ctx.drawImage(this.canvas, 
                    -i * 2, -i * 2, 
                    this.gameWidth + i * 4, this.gameHeight + i * 4
                );
            }
            
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
        
        // Scanlines-Effekt
        if (this.postProcessing.scanlines) {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            for (let y = 0; y < this.gameHeight; y += 4) {
                this.ctx.fillRect(0, y, this.gameWidth, 2);
            }
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        // Glitch-Effekt
        if (this.postProcessing.glitch > 0) {
            const intensity = this.postProcessing.glitch;
            const sliceHeight = 5;
            const numSlices = Math.floor(this.gameHeight / sliceHeight);
            
            for (let i = 0; i < numSlices; i++) {
                if (Math.random() < intensity) {
                    const y = i * sliceHeight;
                    const offset = (Math.random() - 0.5) * 20 * intensity;
                    
                    // Verschiebe Slice horizontal
                    const imageData = this.ctx.getImageData(0, y, this.gameWidth, sliceHeight);
                    this.ctx.putImageData(imageData, offset, y);
                }
            }
        }
        
        // Speed-basierte Vignette
        if (this.postProcessing.vignette > 0) {
            const vignetteGradient = this.ctx.createRadialGradient(
                this.gameWidth / 2, this.gameHeight / 2, 0,
                this.gameWidth / 2, this.gameHeight / 2, this.gameWidth * 0.8
            );
            vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignetteGradient.addColorStop(0.7, `rgba(0, 0, 0, ${this.postProcessing.vignette * 0.3})`);
            vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${this.postProcessing.vignette})`);
            
            this.ctx.fillStyle = vignetteGradient;
            this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }
        
        // Film Grain
        if (this.postProcessing.filmGrain > 0) {
            this.ctx.globalCompositeOperation = 'overlay';
            this.ctx.globalAlpha = this.postProcessing.filmGrain;
            
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * this.gameWidth;
                const y = Math.random() * this.gameHeight;
                const size = Math.random() * 2;
                const alpha = Math.random() * 0.5;
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.fillRect(x, y, size, size);
            }
            
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.restore();
    }
    
    updateBoss() {
        // Boss-Spawning bei bestimmten Distanzen
        if (!this.bossActive && this.distance >= this.bossSpawnDistance) {
            this.spawnBoss();
        }
        
        if (this.boss && this.bossActive) {
            this.boss.x -= this.speed;
            this.boss.time += 0.016;
            
            // Boss AI - verschiedene Angriffsmuster
            switch (this.bossPhase) {
                case 0: // Charge Attack
                    if (this.boss.time > 2) {
                        this.boss.velocityY = -15;
                        this.bossPhase = 1;
                    }
                    break;
                case 1: // Flying Phase
                    this.boss.y += this.boss.velocityY;
                    this.boss.velocityY += 0.8;
                    if (this.boss.y >= this.boss.groundY) {
                        this.boss.y = this.boss.groundY;
                        this.boss.velocityY = 0;
                        this.bossPhase = 2;
                        this.boss.time = 0;
                    }
                    break;
                case 2: // Ground Slam
                    if (this.boss.time > 1) {
                        this.createBossShockwave();
                        this.bossPhase = 3;
                        this.boss.time = 0;
                    }
                    break;
                case 3: // Recovery
                    if (this.boss.time > 2) {
                        this.bossPhase = 0;
                        this.boss.time = 0;
                    }
                    break;
            }
            
            // Boss Health System
            if (this.checkBossHit()) {
                this.boss.health--;
                this.triggerShake(8, 'impact', 1.5);
                this.screenFlash = 0.6;
                
                if (this.boss.health <= 0) {
                    this.defeatBoss();
                }
            }
            
            // Boss verlässt Bildschirm
            if (this.boss.x < -this.boss.width - 100) {
                this.bossActive = false;
                this.boss = null;
                this.bossSpawnDistance += 3000;
            }
        }
    }
    
    spawnBoss() {
        this.boss = {
            x: this.gameWidth + 100,
            y: this.ground.y - 100,
            width: 120,
            height: 100,
            groundY: this.ground.y - 100,
            velocityY: 0,
            health: 3,
            maxHealth: 3,
            time: 0,
            color: '#8b0000',
            eyeGlow: 1.0,
            attackCooldown: 0
        };
        this.bossActive = true;
        this.bossPhase = 0;
        
        // Dramatic entrance effects
        this.camera.shakeIntensity = 5;
        this.createAdvancedParticles(this.boss.x, this.boss.y, '#ff0000', 'explosion', 30);
    }
    
    createBossShockwave() {
        // Shockwave-Effekt bei Boss-Landung
        for (let i = 0; i < 20; i++) {
            this.createAdvancedParticles(
                this.boss.x + this.boss.width / 2,
                this.boss.y + this.boss.height,
                '#ffaa00',
                'explosion',
                1
            );
        }
        
        // Screen shake
        this.triggerShake(12, 'earthquake', 2.5);
        
        // Temporärer Slow-Motion-Effekt
        this.speed *= 0.3;
        setTimeout(() => {
            this.speed = Math.min(this.speed / 0.3, this.maxSpeed);
        }, 500);
    }
    
    checkBossHit() {
        if (!this.boss || this.bossPhase !== 1) return false;
        
        // Kollisionserkennung zwischen Player und Boss
        return (this.player.x < this.boss.x + this.boss.width &&
                this.player.x + this.player.width > this.boss.x &&
                this.player.y < this.boss.y + this.boss.height &&
                this.player.y + this.player.height > this.boss.y &&
                this.player.isJumping);
    }
    
    defeatBoss() {
        // Boss besiegt
        this.score += 1000;
        this.combo += 10;
        this.triggerShake(15, 'explosion', 3.0);
        this.screenFlash = 1.0;
        
        // PROGRESSION: Massive experience for boss defeat
        this.awardExperience(100, 'BOSS DEFEATED!');
        this.progressionStats.totalBossesDefeated++;
        
        // Explosion-Effekte
        for (let i = 0; i < 50; i++) {
            this.createAdvancedParticles(
                this.boss.x + Math.random() * this.boss.width,
                this.boss.y + Math.random() * this.boss.height,
                '#ff6600',
                'explosion',
                1
            );
        }
        
        this.bossActive = false;
        this.boss = null;
        this.bossSpawnDistance += 3000;
        
        this.checkAchievement('boss_slayer');
    }
    
    drawBoss() {
        if (!this.boss || !this.bossActive) return;
        
        this.ctx.save();
        
        // Enhanced Boss Glow Outline
        const glowIntensity = this.getGlowIntensity('boss');
        let glowColor = '#ff0000';
        
        // Dynamic glow based on boss phase
        switch(this.bossPhase) {
            case 0: glowColor = '#ff4400'; break; // Charging
            case 1: glowColor = '#ff0000'; break; // Flying
            case 2: glowColor = '#ffaa00'; break; // Ground slam
            case 3: glowColor = '#8b0000'; break; // Recovery
        }
        
        // Health-based intensity (lower health = more intense)
        const healthRatio = this.boss.health / this.boss.maxHealth;
        const finalIntensity = glowIntensity * (2 - healthRatio);
        
        this.drawGlowOutline(
            this.boss.x - 10, 
            this.boss.y - 10, 
            this.boss.width + 20, 
            this.boss.height + 20, 
            glowColor, 
            finalIntensity
        );
        
        // Boss Schatten
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.ellipse(
            this.boss.x + this.boss.width / 2,
            this.ground.y + this.ground.height - 10,
            this.boss.width * 0.6, 15, 0, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Boss Körper mit Gradient
        const bossGradient = this.ctx.createLinearGradient(
            this.boss.x, this.boss.y,
            this.boss.x, this.boss.y + this.boss.height
        );
        bossGradient.addColorStop(0, this.boss.color);
        bossGradient.addColorStop(0.5, '#660000');
        bossGradient.addColorStop(1, '#330000');
        
        this.ctx.fillStyle = bossGradient;
        if (this.ctx.roundRect) {
            this.ctx.roundRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height, 15);
        } else {
            this.ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
        }
        this.ctx.fill();
        
        // Boss Augen mit Glow-Effekt
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10 * this.boss.eyeGlow;
        this.ctx.fillStyle = '#ff0000';
        
        // Linkes Auge
        this.ctx.beginPath();
        this.ctx.arc(this.boss.x + 25, this.boss.y + 30, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rechtes Auge
        this.ctx.beginPath();
        this.ctx.arc(this.boss.x + this.boss.width - 25, this.boss.y + 30, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Boss Health Bar
        const healthBarWidth = 200;
        const healthBarHeight = 10;
        const healthBarX = (this.gameWidth - healthBarWidth) / 2;
        const healthBarY = 30;
        
        // Health Bar Hintergrund
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4);
        
        // Health Bar Füllstand
        const healthPercentage = this.boss.health / this.boss.maxHealth;
        this.ctx.fillStyle = healthPercentage > 0.5 ? '#ff0000' : '#ffaa00';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Health Bar Rahmen
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Boss Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BOSS', this.gameWidth / 2, healthBarY - 10);
        
        this.ctx.restore();
    }
    
    spawnWall() {
        // Walls spawnen seltener als normale Obstacles
        if (Math.random() < 0.002 && this.distance > 1000) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const wall = {
                x: this.gameWidth + 100,
                y: side === 'left' ? 0 : 0,
                width: 20,
                height: this.gameHeight * 0.7,
                side: side,
                color: '#444444',
                grippable: true
            };
            
            // Position der Wand je nach Seite
            if (side === 'left') {
                wall.x = -wall.width;
            } else {
                wall.x = this.gameWidth;
            }
            
            this.walls.push(wall);
        }
    }
    
    updateWalls() {
        for (let i = this.walls.length - 1; i >= 0; i--) {
            let wall = this.walls[i];
            
            // Wände bewegen sich mit dem Spiel
            if (wall.side === 'right') {
                wall.x -= this.speed;
            }
            
            // Entferne Wände, die außerhalb des Bildschirms sind
            if ((wall.side === 'left' && wall.x > this.gameWidth) ||
                (wall.side === 'right' && wall.x < -wall.width)) {
                this.walls.splice(i, 1);
            }
        }
    }
    
    checkWallCollision() {
        if (!this.player.isJumping || this.player.isWallRunning) return null;
        
        for (let wall of this.walls) {
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            
            // Überprüfe Kollision mit Wand
            if (wall.side === 'left' && 
                playerCenterX <= wall.x + wall.width + 10 &&
                playerCenterY >= wall.y &&
                playerCenterY <= wall.y + wall.height) {
                return wall;
            }
            
            if (wall.side === 'right' && 
                playerCenterX >= wall.x - 10 &&
                playerCenterY >= wall.y &&
                playerCenterY <= wall.y + wall.height) {
                return wall;
            }
        }
        return null;
    }
    
    startWallRun(wall) {
        this.player.isWallRunning = true;
        this.player.wallRunSide = wall.side;
        this.player.wallRunTime = 0;
        this.player.velocityY = 0;
        
        // Positioniere Player an der Wand
        if (wall.side === 'left') {
            this.player.x = wall.x + wall.width + 2;
        } else {
            this.player.x = wall.x - this.player.width - 2;
        }
        
        // Partikel-Effekt für Wall-Run-Start
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height,
            '#00ffff',
            'trail',
            10
        );
    }
    
    updateWallRun() {
        if (!this.player.isWallRunning) return;
        
        this.player.wallRunTime += 0.016;
        
        // Wall-Run hat eine maximale Dauer
        if (this.player.wallRunTime > 2.5) {
            this.endWallRun();
            return;
        }
        
        // Langsames Fallen während Wall-Run
        this.player.velocityY += 0.2;
        this.player.y += this.player.velocityY;
        
        // Partikel-Effekt während Wall-Run
        if (Math.random() < 0.3) {
            this.createAdvancedParticles(
                this.player.x + (this.player.wallRunSide === 'left' ? 0 : this.player.width),
                this.player.y + this.player.height * 0.8,
                '#00aaff',
                'spark',
                1
            );
        }
        
        // Prüfe ob Player noch an der Wand ist
        let wallContact = this.checkWallCollision();
        if (!wallContact || wallContact.side !== this.player.wallRunSide) {
            this.endWallRun();
        }
    }
    
    endWallRun() {
        if (!this.player.isWallRunning) return;
        
        this.player.isWallRunning = false;
        this.player.wallRunSide = null;
        this.player.wallRunTime = 0;
        
        // Boost beim Verlassen der Wand
        this.player.velocityY = -8;
        
        // Combo-Bonus für Wall-Run
        this.combo += 2;
        this.score += 50;
        
        // PROGRESSION: Significant experience for advanced technique
        this.awardExperience(15, 'Wall Run');
        this.progressionStats.totalWallRuns++;
        
        // Shop System: Award currency for wall running
        this.addShopCurrency(15);
        
        // Challenge Progress für Wall-Running
        this.updateChallengeProgress('wall_runs', 1);
        
        // Partikel-Effekt für Wall-Run-Ende
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#ffff00',
            'explosion',
            15
        );
    }
    
    drawWalls() {
        for (let wall of this.walls) {
            this.ctx.save();
            
            // Wand-Gradient für 3D-Effekt
            const wallGradient = this.ctx.createLinearGradient(
                wall.x, 0, wall.x + wall.width, 0
            );
            
            if (wall.side === 'left') {
                wallGradient.addColorStop(0, '#222222');
                wallGradient.addColorStop(1, wall.color);
            } else {
                wallGradient.addColorStop(0, wall.color);
                wallGradient.addColorStop(1, '#222222');
            }
            
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            
            // Grip-Textur für Wände
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let y = wall.y; y < wall.y + wall.height; y += 20) {
                this.ctx.fillRect(wall.x + 2, y, wall.width - 4, 2);
            }
            
            this.ctx.restore();
        }
    }
    
    updateRiskRewardZones() {
        // Spawn neue Risk/Reward Zone
        if (!this.currentZone && this.distance >= this.zoneSpawnDistance) {
            this.spawnRiskRewardZone();
        }
        
        // Update aktive Zone
        if (this.currentZone) {
            this.currentZone.x -= this.speed;
            
            // Prüfe ob Player in Zone ist
            const playerInZone = (
                this.player.x + this.player.width > this.currentZone.x &&
                this.player.x < this.currentZone.x + this.currentZone.width &&
                this.player.y + this.player.height > this.currentZone.y &&
                this.player.y < this.currentZone.y + this.currentZone.height
            );
            
            if (playerInZone && !this.currentZone.playerInside) {
                this.enterRiskRewardZone();
            } else if (!playerInZone && this.currentZone.playerInside) {
                this.exitRiskRewardZone();
            }
            
            // Zone-spezifische Effekte
            if (this.currentZone.playerInside) {
                this.currentZone.activeTime += 0.016;
                
                // Kontinuierliche Effekte je nach Zone-Typ
                switch (this.currentZone.type) {
                    case 'speed_boost':
                        this.speed = Math.min(this.speed + 0.02, this.maxSpeed * 1.5);
                        break;
                    case 'coin_rain':
                        if (Math.random() < 0.1) {
                            this.score += 10;
                            this.createAdvancedParticles(
                                this.player.x + Math.random() * this.player.width,
                                this.player.y,
                                '#ffd700',
                                'coin',
                                1
                            );
                        }
                        break;
                    case 'combo_multiplier':
                        this.comboMultiplier = Math.max(this.comboMultiplier, 3);
                        break;
                }
                
                // Risiko-Effekte
                if (Math.random() < this.currentZone.dangerLevel * 0.005) {
                    this.spawnZoneDanger();
                }
            }
            
            // Entferne Zone wenn sie den Bildschirm verlassen hat
            if (this.currentZone.x + this.currentZone.width < -100) {
                this.currentZone = null;
                this.zoneSpawnDistance = this.distance + 2000 + Math.random() * 1000;
            }
        }
    }
    
    spawnRiskRewardZone() {
        const zoneTypes = [
            {
                type: 'speed_boost',
                name: 'Speed Zone',
                color: '#ff6600',
                dangerLevel: 0.7,
                reward: 'Increased speed and score multiplier'
            },
            {
                type: 'coin_rain',
                name: 'Treasure Zone',
                color: '#ffd700',
                dangerLevel: 0.5,
                reward: 'Continuous coin drops'
            },
            {
                type: 'combo_multiplier',
                name: 'Combo Zone',
                color: '#9b59b6',
                dangerLevel: 0.8,
                reward: 'Triple combo multiplier'
            }
        ];
        
        const zoneType = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
        
        this.currentZone = {
            x: this.gameWidth + 50,
            y: this.ground.y - 200,
            width: 300,
            height: 200,
            type: zoneType.type,
            name: zoneType.name,
            color: zoneType.color,
            dangerLevel: zoneType.dangerLevel,
            reward: zoneType.reward,
            playerInside: false,
            activeTime: 0,
            pulseIntensity: 1.0,
            warningShown: false
        };
    }
    
    enterRiskRewardZone() {
        this.currentZone.playerInside = true;
        
        // Visuelle Effekte beim Betreten
        this.camera.shakeIntensity = 3;
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            this.currentZone.color,
            'explosion',
            20
        );
        
        // Zeige Zone-Info kurz an
        this.showZoneMessage();
        
        // Post-Processing-Effekte
        this.postProcessing.colorGrading.saturation += 0.5;
        this.postProcessing.bloom += 0.3;
    }
    
    exitRiskRewardZone() {
        this.currentZone.playerInside = false;
        
        // Bonus für das Überleben der Zone
        const survivalBonus = Math.floor(this.currentZone.activeTime * 100 * this.currentZone.dangerLevel);
        this.score += survivalBonus;
        this.combo += Math.floor(this.currentZone.dangerLevel * 5);
        
        // Achievement Check
        if (this.currentZone.activeTime > 3) {
            this.checkAchievement('zone_master');
        }
        
        // Reset Post-Processing
        this.postProcessing.colorGrading.saturation = 1;
        this.postProcessing.bloom = 0;
        
        // Großer visueller Effekt beim Verlassen
        this.createAdvancedParticles(
            this.currentZone.x + this.currentZone.width / 2,
            this.currentZone.y + this.currentZone.height / 2,
            '#00ff00',
            'explosion',
            30
        );
    }
    
    spawnZoneDanger() {
        // Spawn gefährliche Obstacles in der Zone
        const obstacleTypes = ['spike', 'bird', 'laser'];
        const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        let obstacle = {
            x: this.currentZone.x + Math.random() * this.currentZone.width,
            y: this.ground.y - 60,
            width: 40,
            height: 60,
            type: obstacleType,
            color: '#ff0000',
            dangerous: true
        };
        
        if (obstacleType === 'bird') {
            obstacle.y = this.ground.y - 150;
            obstacle.velocityY = 0;
        } else if (obstacleType === 'laser') {
            obstacle.width = 10;
            obstacle.height = this.gameHeight;
            obstacle.y = 0;
            obstacle.color = '#ff00ff';
        }
        
        this.obstacles.push(obstacle);
    }
    
    showZoneMessage() {
        // Zeige kurze Zone-Information
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.background = `linear-gradient(45deg, ${this.currentZone.color}, rgba(0,0,0,0.8))`;
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '15px 25px';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.animation = 'zoneMessage 2s ease-in-out';
        messageDiv.innerHTML = `
            <div>${this.currentZone.name}</div>
            <small style="opacity: 0.8">${this.currentZone.reward}</small>
        `;
        
        document.getElementById('ui').appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 2000);
    }
    
    drawRiskRewardZones() {
        if (!this.currentZone) return;
        
        this.ctx.save();
        
        // Zone-Hintergrund mit pulsierendem Effekt
        this.currentZone.pulseIntensity = 0.7 + Math.sin(this.time * 0.05) * 0.3;
        
        const zoneGradient = this.ctx.createRadialGradient(
            this.currentZone.x + this.currentZone.width / 2,
            this.currentZone.y + this.currentZone.height / 2,
            0,
            this.currentZone.x + this.currentZone.width / 2,
            this.currentZone.y + this.currentZone.height / 2,
            this.currentZone.width / 2
        );
        
        const alpha = this.currentZone.playerInside ? 0.4 : 0.2;
        zoneGradient.addColorStop(0, `${this.currentZone.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        zoneGradient.addColorStop(0.7, `${this.currentZone.color}${Math.floor(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
        zoneGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = zoneGradient;
        this.ctx.fillRect(this.currentZone.x, this.currentZone.y, this.currentZone.width, this.currentZone.height);
        
        // Zone-Rahmen
        this.ctx.strokeStyle = this.currentZone.color;
        this.ctx.lineWidth = 3 * this.currentZone.pulseIntensity;
        this.ctx.setLineDash([10, 5]);
        this.ctx.strokeRect(this.currentZone.x, this.currentZone.y, this.currentZone.width, this.currentZone.height);
        this.ctx.setLineDash([]);
        
        // Zone-Label
        this.ctx.fillStyle = this.currentZone.color;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.currentZone.name,
            this.currentZone.x + this.currentZone.width / 2,
            this.currentZone.y - 10
        );
        
        // Gefahr-Indikator
        if (this.currentZone.dangerLevel > 0.6) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(
                'HIGH RISK!',
                this.currentZone.x + this.currentZone.width / 2,
                this.currentZone.y + this.currentZone.height + 20
            );
        }
        
        this.ctx.restore();
    }
    
    drawAdvancedTrails() {
        this.ctx.save();
        
        // Draw speed trails
        for (let trail of this.player.speedTrails) {
            this.ctx.globalAlpha = trail.opacity;
            this.ctx.fillStyle = trail.color;
            this.ctx.shadowColor = trail.color;
            this.ctx.shadowBlur = 8;
            
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw action trails
        for (let trail of this.player.actionTrails) {
            this.ctx.globalAlpha = trail.life;
            this.ctx.fillStyle = trail.color;
            
            if (trail.glowIntensity) {
                this.ctx.shadowColor = trail.color;
                this.ctx.shadowBlur = trail.glowIntensity * 10;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
        
        // Draw enhanced player trails
        for (let particle of this.player.trailSystem.particles) {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.glowIntensity * 5;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    updateDailyChallengeProgress() {
        // Distance Challenge
        this.updateChallengeProgress('distance', this.distance - (this.lastChallengeCheck || 0));
        
        // Score Challenge
        this.updateChallengeProgress('score', this.score);
        
        // Combo Challenge
        if (this.combo > 0) {
            this.updateChallengeProgress('combo', this.combo);
        }
        
        this.lastChallengeCheck = this.distance;
    }
    
    updateChallengesUI() {
        const challengesList = document.getElementById('challengesList');
        if (!challengesList) return;
        
        challengesList.innerHTML = '';
        
        for (let challenge of this.dailyChallenges) {
            const challengeDiv = document.createElement('div');
            challengeDiv.className = 'challenge-item' + (challenge.completed ? ' completed' : '');
            
            const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100);
            
            challengeDiv.innerHTML = `
                <div class="challenge-name">${challenge.name}</div>
                <div class="challenge-description">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${challenge.progress}/${challenge.target}</div>
                </div>
            `;
            
            challengesList.appendChild(challengeDiv);
        }
    }
    
    updatePerformanceDisplay() {
        const performanceDisplay = document.getElementById('performanceDisplay');
        if (!performanceDisplay) return;
        
        const fpsColor = this.performance.fps > 50 ? '#4ecdc4' : 
                        this.performance.fps > 30 ? '#ffaa00' : '#ff6b6b';
        
        const qualityColor = {
            'ultra': '#00ff00',
            'high': '#4ecdc4',
            'medium': '#ffaa00',
            'low': '#ff6b6b',
            'emergency': '#ff0000'
        }[this.performance.performanceLevel] || '#ffaa00';
        
        const frameTimeColor = this.performance.avgFrameTime < 16.67 ? '#4ecdc4' :
                              this.performance.avgFrameTime < 25 ? '#ffaa00' : '#ff6b6b';
        
        performanceDisplay.innerHTML = `
            <div style="font-size: 11px; margin-bottom: 5px;">
                <span style="color: ${fpsColor};">FPS: ${this.performance.fps}</span>
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                <span style="color: ${frameTimeColor};">Frame: ${this.performance.avgFrameTime.toFixed(1)}ms</span>
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                <span style="color: ${qualityColor};">Quality: ${this.performance.performanceLevel.toUpperCase()}</span>
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                Particles: ${this.performance.particleCount}/${this.performance.maxParticles}
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                Memory: ${this.performance.memoryUsage.toFixed(1)}KB
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                Device: ${this.deviceInfo.performanceCategory.replace('_', ' ').toUpperCase()}
            </div>
            <div style="font-size: 10px; margin-bottom: 3px;">
                Budget: ${(this.adaptiveParticles?.complexity * 100 || 100).toFixed(0)}%
            </div>
            <div style="font-size: 10px;">
                ${this.emergencyMode ? '<span style="color: #ff0000;">EMERGENCY MODE</span>' : 'Drops: ' + this.performance.frameDropCount}
            </div>
        `;
    }
    
    updateProgressionUI() {
        // Create progression UI if it doesn't exist
        let progressionDisplay = document.getElementById('progressionDisplay');
        if (!progressionDisplay) {
            progressionDisplay = document.createElement('div');
            progressionDisplay.id = 'progressionDisplay';
            progressionDisplay.className = 'info-panel';
            progressionDisplay.style.position = 'absolute';
            progressionDisplay.style.bottom = '20px';
            progressionDisplay.style.left = '20px';
            progressionDisplay.style.maxWidth = '200px';
            progressionDisplay.innerHTML = `
                <div class="panel-header">⚡ Progression</div>
                <div id="progressionContent" class="panel-content"></div>
            `;
            document.getElementById('ui').appendChild(progressionDisplay);
        }
        
        const content = document.getElementById('progressionContent');
        if (!content) return;
        
        const progression = this.characterProgression;
        const tier = this.difficultyProgression.currentTier;
        
        // Calculate experience progress percentage
        const expPercentage = (progression.experience / progression.expToNext * 100).toFixed(0);
        
        content.innerHTML = `
            <div style="font-size: 11px; margin-bottom: 5px; color: #ffd700;">
                <strong>Level ${progression.level}</strong>
            </div>
            <div style="font-size: 9px; margin-bottom: 3px;">
                EXP: ${progression.experience}/${progression.expToNext}
            </div>
            <div style="background: rgba(255,255,255,0.2); height: 3px; border-radius: 2px; margin-bottom: 5px;">
                <div style="background: linear-gradient(90deg, #4ecdc4, #45b7d1); height: 100%; width: ${expPercentage}%; border-radius: 2px;"></div>
            </div>
            <div style="font-size: 9px; margin-bottom: 3px; color: #ff6600;">
                Tier ${tier} 
            </div>
            <div style="font-size: 8px; margin-bottom: 2px;">
                SP: ${progression.skillPoints}
            </div>
            <div style="font-size: 8px;">
                Total: ${progression.totalExp} EXP
            </div>
        `;
        
        // Hide on very small screens
        if (this.deviceInfo?.isPhone && this.deviceInfo.viewportWidth < 400) {
            progressionDisplay.style.display = 'none';
        } else {
            progressionDisplay.style.display = 'block';
        }
    }
    
    gameLoop() {
        try {
            const frameStart = performance.now();
            
            this.updatePerformanceMetrics();
            this.update();
            this.render();
            
            this.performance.renderTime = performance.now() - frameStart;
        } catch (error) {
            this.handleError(error, 'gameLoop');
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePerformanceMetrics() {
        this.performance.frameCount++;
        const now = performance.now();
        
        // ADVANCED PERFORMANCE MONITORING
        this.updateAdvancedPerformanceMetrics(now);
        
        if (now - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = now;
            
            // INTELLIGENT QUALITY ADJUSTMENT
            this.adaptiveQualityAdjustment();
            
            // APPLY PERFORMANCE OPTIMIZATIONS
            this.optimizeAdvancedAnimations();
            this.optimizeShaderEffects();
            this.optimizeRenderPipeline();
        }
        
        // Update particle count with dynamic culling
        this.updateParticleManagement();
        
        // Memory usage estimation
        this.estimateMemoryUsage();
    }
    
    updateAdvancedPerformanceMetrics(now) {
        // Calculate moving average frame time
        this.performance.avgFrameTime = (this.performance.avgFrameTime * 0.9) + (this.performance.renderTime * 0.1);
        
        // Track frame drops
        if (this.performance.renderTime > this.performance.renderBudget * 1.5) {
            this.performance.frameDropCount++;
        }
        
        // Adaptive quality based on sustained performance
        if (this.performance.avgFrameTime > this.performance.renderBudget * 1.2) {
            this.performance.adaptiveQuality = Math.max(0.3, this.performance.adaptiveQuality - 0.01);
        } else if (this.performance.avgFrameTime < this.performance.renderBudget * 0.8) {
            this.performance.adaptiveQuality = Math.min(1.0, this.performance.adaptiveQuality + 0.005);
        }
    }
    
    adaptiveQualityAdjustment() {
        const fps = this.performance.fps;
        const avgFrameTime = this.performance.avgFrameTime;
        
        // Determine performance level based on multiple metrics
        let newLevel = this.performance.performanceLevel;
        
        if (fps >= 55 && avgFrameTime < 14) {
            newLevel = 'ultra';
        } else if (fps >= 45 && avgFrameTime < 18) {
            newLevel = 'high';
        } else if (fps >= 30 && avgFrameTime < 25) {
            newLevel = 'medium';
        } else {
            newLevel = 'low';
        }
        
        // Apply new quality level if changed
        if (newLevel !== this.performance.performanceLevel) {
            this.applyQualityPreset(newLevel);
            this.performance.performanceLevel = newLevel;
            console.log(`Performance level changed to: ${newLevel} (FPS: ${fps}, Frame time: ${avgFrameTime.toFixed(2)}ms)`);
        }
        
        // EMERGENCY PERFORMANCE CHECK
        if (fps < 15 && avgFrameTime > 50 && this.performance.frameDropCount > 10) {
            this.emergencyPerformanceMode();
        }
        
        // ADAPTIVE PERFORMANCE BUDGET ADJUSTMENT
        this.adjustPerformanceBudget(fps, avgFrameTime);
    }
    
    applyQualityPreset(level) {
        const preset = this.performance.qualityPresets[level];
        
        // Apply particle limits
        this.performance.maxParticles = preset.particles;
        
        // Apply effect intensity
        const effectScale = preset.effects;
        if (this.advancedGraphics) {
            this.advancedGraphics.effectIntensity = effectScale;
        }
        
        // Apply shadow settings
        if (this.shadowSystem) {
            this.shadowSystem.enabled = preset.shadows;
        }
        
        // Apply post-processing
        if (this.postProcessing) {
            this.postProcessing.enabled = preset.postProcessing;
            if (!preset.postProcessing) {
                this.postProcessing.bloom = 0;
                this.postProcessing.filmGrain = 0;
                this.postProcessing.scanlines = false;
            }
        }
        
        // Update low performance mode flag
        this.performance.lowPerformanceMode = (level === 'low');
        
        // Apply performance budget adjustments
        if (this.adaptiveParticles) {
            this.adaptiveParticles.maxCount = preset.particles;
            this.adaptiveParticles.complexity = Math.min(this.adaptiveParticles.complexity, preset.effects);
        }
    }
    
    adjustPerformanceBudget(fps, avgFrameTime) {
        // REAL-TIME PERFORMANCE BUDGET ADJUSTMENT
        const targetFPS = this.performanceBudget.targetFPS;
        const fpsRatio = fps / targetFPS;
        
        if (fpsRatio < 0.8) {
            // Performance below target - reduce quality
            this.adaptiveParticles.complexity = Math.max(0.3, this.adaptiveParticles.complexity * 0.95);
            this.adaptiveParticles.maxCount = Math.max(10, this.adaptiveParticles.maxCount * 0.9);
            
            // Disable expensive features on significant drops
            if (fpsRatio < 0.6) {
                this.adaptiveGraphics.shadows = false;
                this.adaptiveGraphics.shaderEffects = false;
            }
            
        } else if (fpsRatio > 1.2 && this.adaptiveParticles.complexity < this.performanceBudget.particleComplexity) {
            // Performance above target - can increase quality gradually
            this.adaptiveParticles.complexity = Math.min(
                this.performanceBudget.particleComplexity, 
                this.adaptiveParticles.complexity * 1.02
            );
            
            this.adaptiveParticles.maxCount = Math.min(
                this.performanceBudget.maxParticles,
                this.adaptiveParticles.maxCount * 1.05
            );
        }
    }
    
    emergencyPerformanceMode() {
        console.warn('Emergency Performance Mode Activated!');
        
        // EXTREME PERFORMANCE REDUCTION
        this.adaptiveParticles.enabled = false;
        this.adaptiveGraphics.postProcessing = false;
        this.adaptiveGraphics.shadows = false;
        this.adaptiveGraphics.advancedEffects = false;
        this.adaptiveGraphics.shaderEffects = false;
        
        // Reduce game complexity
        this.performance.maxParticles = 5;
        this.performance.cullDistance = 400;
        
        // Disable advanced physics
        this.adaptivePhysics.collisionPrecision = 0.3;
        this.adaptivePhysics.updateFrequency = 20;
        
        // Show user notification
        this.showPerformanceWarning();
        
        // Flag emergency mode
        this.emergencyMode = true;
    }
    
    showPerformanceWarning() {
        const warning = document.createElement('div');
        warning.style.position = 'absolute';
        warning.style.top = '20px';
        warning.style.left = '50%';
        warning.style.transform = 'translateX(-50%)';
        warning.style.background = 'rgba(255, 140, 0, 0.9)';
        warning.style.color = 'white';
        warning.style.padding = '10px 20px';
        warning.style.borderRadius = '8px';
        warning.style.fontSize = '12px';
        warning.style.zIndex = '1003';
        warning.style.textAlign = 'center';
        warning.textContent = '⚡ Performance optimized for smoother gameplay';
        
        document.getElementById('ui').appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 4000);
    }
    
    // DEVICE-SPECIFIC FALLBACK RENDERING
    renderLowEndFallback() {
        // Simplified rendering for legacy devices
        this.ctx.save();
        
        // Simple background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#8FBC8F');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Simplified player (rectangle)
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Simple obstacles (rectangles)
        this.ctx.fillStyle = '#8b4513';
        for (let obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // Simple powerups (circles)
        this.ctx.fillStyle = '#ffd700';
        for (let powerup of this.powerups) {
            this.ctx.beginPath();
            this.ctx.arc(powerup.x + powerup.width/2, powerup.y + powerup.height/2, powerup.width/2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    updateParticleManagement() {
        this.performance.particleCount = this.particles.length;
        
        // INTELLIGENT PARTICLE CULLING
        if (this.performance.cullingEnabled) {
            this.cullDistantParticles();
        }
        
        // DYNAMIC PARTICLE LIMITING
        const targetParticles = Math.floor(this.performance.maxParticles * this.performance.adaptiveQuality);
        if (this.particles.length > targetParticles) {
            // Remove oldest particles first
            this.particles = this.particles.slice(-targetParticles);
        }
        
        // TRAIL SYSTEM OPTIMIZATION
        this.optimizeTrailSystems();
    }
    
    cullDistantParticles() {
        const playerX = this.player.x;
        const cullDistance = this.performance.cullDistance;
        
        this.particles = this.particles.filter(particle => {
            const distance = Math.abs(particle.x - playerX);
            return distance < cullDistance;
        });
    }
    
    optimizeTrailSystems() {
        // Optimize player trail system
        const trailSystem = this.player.trailSystem;
        const maxTrails = Math.floor(trailSystem.maxParticles * this.performance.adaptiveQuality);
        
        if (trailSystem.particles.length > maxTrails) {
            trailSystem.particles = trailSystem.particles.slice(-maxTrails);
        }
        
        // Optimize speed trails
        const maxSpeedTrails = Math.floor(40 * this.performance.adaptiveQuality);
        if (this.player.speedTrails.length > maxSpeedTrails) {
            this.player.speedTrails = this.player.speedTrails.slice(-maxSpeedTrails);
        }
        
        // Optimize action trails
        const maxActionTrails = Math.floor(30 * this.performance.adaptiveQuality);
        if (this.player.actionTrails.length > maxActionTrails) {
            this.player.actionTrails = this.player.actionTrails.slice(-maxActionTrails);
        }
    }
    
    estimateMemoryUsage() {
        // Rough memory usage estimation
        const particleMemory = this.particles.length * 0.1; // KB per particle
        const trailMemory = (this.player.trailSystem.particles.length + 
                            this.player.speedTrails.length + 
                            this.player.actionTrails.length) * 0.05;
        const objectMemory = (this.obstacles.length + this.powerups.length + this.clouds.length) * 0.2;
        
        this.performance.memoryUsage = particleMemory + trailMemory + objectMemory;
    }
    
    enableLowPerformanceMode() {
        this.performance.lowPerformanceMode = true;
        this.performance.maxParticles = 50;
        
        // Disable expensive post-processing effects
        this.postProcessing.bloom = 0;
        this.postProcessing.filmGrain = 0;
        this.postProcessing.scanlines = false;
        
        console.log('Low performance mode enabled');
    }
    
    disableLowPerformanceMode() {
        this.performance.lowPerformanceMode = false;
        this.performance.maxParticles = 100;
        console.log('Low performance mode disabled');
    }
    
    // ADVANCED PERFORMANCE OPTIMIZATIONS
    optimizeAdvancedAnimations() {
        const perf = this.performance;
        
        // Reduce animation complexity based on performance
        if (perf.performanceLevel === 'low') {
            // Disable advanced character animations
            this.player.advancedAnimation.bodyTilt *= 0.5;
            this.player.advancedAnimation.armSwing *= 0.5;
            this.player.advancedAnimation.morphing = 0;
            this.player.advancedAnimation.auraEffect = 0;
        } else if (perf.performanceLevel === 'medium') {
            // Reduce animation intensity
            this.player.advancedAnimation.morphing *= 0.7;
            this.player.advancedAnimation.auraEffect *= 0.7;
        }
    }
    
    optimizeShaderEffects() {
        const perf = this.performance;
        const gfx = this.advancedGraphics.shaderEffects;
        
        // Scale effect intensity based on performance
        const intensityScale = perf.adaptiveQuality;
        
        if (perf.performanceLevel === 'low') {
            // Disable expensive effects
            gfx.distortion = 0;
            gfx.colorSeparation = 0;
            gfx.edgeGlow = 0;
            gfx.volumetricLighting = 0;
        } else {
            // Scale effects based on quality
            gfx.distortion *= intensityScale;
            gfx.colorSeparation *= intensityScale;
            gfx.edgeGlow *= intensityScale;
            gfx.volumetricLighting *= intensityScale;
        }
    }
    
    optimizeRenderPipeline() {
        const perf = this.performance;
        
        // Dynamic LOD (Level of Detail) for distant objects
        if (perf.dynamicLOD) {
            this.applyDynamicLOD();
        }
        
        // Batch similar render calls
        if (perf.batchRendering) {
            this.batchSimilarRenderCalls();
        }
        
        // Frustum culling for off-screen objects
        if (perf.cullingEnabled) {
            this.cullOffScreenObjects();
        }
    }
    
    applyDynamicLOD() {
        const playerX = this.player.x;
        const lodDistance = 500;
        
        // Reduce detail for distant obstacles
        this.obstacles.forEach(obstacle => {
            const distance = Math.abs(obstacle.x - playerX);
            obstacle.lodLevel = distance > lodDistance ? 'low' : 'high';
        });
        
        // Reduce detail for distant clouds
        this.clouds.forEach(cloud => {
            const distance = Math.abs(cloud.x - playerX);
            cloud.lodLevel = distance > lodDistance * 2 ? 'low' : 'high';
        });
    }
    
    batchSimilarRenderCalls() {
        // Group similar objects for batch rendering
        if (this.particles.length > 50) {
            this.renderParticlesBatched();
        }
    }
    
    renderParticlesBatched() {
        // Batch particle rendering by type and color
        const batches = new Map();
        
        this.particles.forEach(particle => {
            const key = `${particle.type}_${particle.color}`;
            if (!batches.has(key)) {
                batches.set(key, []);
            }
            batches.get(key).push(particle);
        });
        
        // Store for optimized rendering
        this.particleBatches = batches;
    }
    
    cullOffScreenObjects() {
        const screenMargin = 200;
        const leftBound = -screenMargin;
        const rightBound = this.gameWidth + screenMargin;
        
        // Cull obstacles
        this.obstacles = this.obstacles.filter(obstacle => 
            obstacle.x + obstacle.width > leftBound && obstacle.x < rightBound
        );
        
        // Cull powerups
        this.powerups = this.powerups.filter(powerup => 
            powerup.x + powerup.width > leftBound && powerup.x < rightBound
        );
        
        // Cull clouds with larger margin
        this.clouds = this.clouds.filter(cloud => 
            cloud.x + cloud.width > leftBound - 400 && cloud.x < rightBound + 400
        );
    }
    
    // EMERGENCY PERFORMANCE RECOVERY
    emergencyPerformanceMode() {
        console.warn('Emergency performance mode activated');
        
        // Drastically reduce all effects
        this.performance.maxParticles = 25;
        this.performance.adaptiveQuality = 0.2;
        
        // Disable all advanced features
        this.advancedGraphics.shaderEffects = {};
        this.player.advancedAnimation = {
            bodyTilt: 0, armSwing: 0, legCycle: 0, breathingCycle: 0,
            emotionalIntensity: 0, tailEffect: 0, morphing: 0,
            energyPulse: 0, shadowIntensity: 1.0, auraEffect: 0
        };
        
        // Clear all particles
        this.particles = [];
        this.player.trailSystem.particles = [];
        this.player.speedTrails = [];
        this.player.actionTrails = [];
        
        // Disable shadows and post-processing
        this.shadowSystem.enabled = false;
        this.postProcessing.enabled = false;
        
        this.performance.performanceLevel = 'emergency';
    }
    
    // DYNAMIC EVENT SYSTEM - Erweitert das bestehende Risk/Reward System
    updateDynamicEvents() {
        const events = this.dynamicEvents;
        
        // Check for new event spawn
        if (!events.active && this.distance >= events.nextEventDistance && events.cooldownTimer <= 0) {
            this.triggerRandomEvent();
        }
        
        // Update active event
        if (events.active) {
            events.active.remainingTime -= 16; // 60fps
            
            // Apply event effects
            this.applyEventEffects(events.active);
            
            // Check if event expired
            if (events.active.remainingTime <= 0) {
                this.endCurrentEvent();
            }
        }
        
        // Update cooldown
        if (events.cooldownTimer > 0) {
            events.cooldownTimer -= 16;
        }
    }
    
    triggerRandomEvent() {
        const events = this.dynamicEvents;
        const availableEvents = events.availableEvents.filter(event => {
            // Don't repeat recent events
            const recentEvents = events.eventHistory.slice(-3);
            return !recentEvents.includes(event.id);
        });
        
        // Weighted selection based on probability and flow state
        const flowMultiplier = 1 + (this.flowState.level * 0.2);
        let totalWeight = 0;
        const weights = availableEvents.map(event => {
            const weight = event.probability * flowMultiplier;
            totalWeight += weight;
            return weight;
        });
        
        const random = Math.random() * totalWeight;
        let accumulator = 0;
        
        for (let i = 0; i < availableEvents.length; i++) {
            accumulator += weights[i];
            if (random <= accumulator) {
                this.startEvent(availableEvents[i]);
                break;
            }
        }
    }
    
    startEvent(eventTemplate) {
        const events = this.dynamicEvents;
        
        events.active = {
            ...eventTemplate,
            remainingTime: eventTemplate.duration,
            startTime: Date.now(),
            intensity: 1.0 + (this.flowState.level * 0.3)
        };
        
        // Add to history
        events.eventHistory.push(eventTemplate.id);
        if (events.eventHistory.length > 5) {
            events.eventHistory.shift();
        }
        
        // Visual announcement
        this.showEventNotification(events.active);
        
        // Set next event distance
        events.nextEventDistance = this.distance + 3000 + Math.random() * 2000;
        events.cooldownTimer = 5000; // 5 second minimum between events
        
        console.log(`Dynamic Event Started: ${events.active.name}`);
    }
    
    applyEventEffects(event) {
        const effect = event.effect;
        const intensity = event.intensity;
        
        switch (event.id) {
            case 'speed_surge':
                this.speed = Math.min(this.speed * effect.speedMultiplier, this.maxSpeed * 2);
                this.createEventParticles(event.color, effect.particleBoost * intensity);
                break;
                
            case 'gravity_shift':
                // Modify gravity in updatePlayer - store in temporary variable
                this.temporaryGravity = 0.8 * effect.gravityMultiplier;
                if (this.keys['Space'] && this.player.isJumping) {
                    this.player.velocityY *= effect.jumpBoost;
                }
                break;
                
            case 'matrix_mode':
                this.timeScale = effect.timeScale;
                this.postProcessing.bloom = 1.5;
                this.postProcessing.chromaticAberration = 0.3;
                // Precision bonus for near misses
                this.nearMissSystem.precisionBonus = effect.precisionBonus;
                break;
                
            case 'obstacle_rain':
                // Increase obstacle spawn rate
                this.obstacleSpawnMultiplier = effect.obstacleMultiplier;
                this.scoreMultiplierBonus = effect.scoreMultiplier;
                break;
                
            case 'coin_burst':
                // Spawn extra coins
                if (Math.random() < 0.3 * effect.coinSpawn) {
                    this.spawnEventCoin();
                }
                // Extend magnet range
                this.magnetRangeMultiplier = effect.magnetRange;
                break;
        }
    }
    
    endCurrentEvent() {
        const events = this.dynamicEvents;
        
        if (events.active) {
            // Clean up event effects
            this.timeScale = 1.0;
            this.temporaryGravity = 0.8;
            this.obstacleSpawnMultiplier = 1.0;
            this.scoreMultiplierBonus = 1.0;
            this.magnetRangeMultiplier = 1.0;
            this.nearMissSystem.precisionBonus = 1.0;
            
            // Reset post-processing
            this.postProcessing.bloom = 0;
            this.postProcessing.chromaticAberration = 0;
            
            console.log(`Dynamic Event Ended: ${events.active.name}`);
            events.active = null;
        }
    }
    
    showEventNotification(event) {
        // Create dramatic event announcement
        const notification = {
            text: `⚡ ${event.name} ⚡`,
            color: event.color,
            scale: 2.0,
            duration: 3000,
            position: { x: this.gameWidth / 2, y: this.gameHeight / 3 }
        };
        
        this.showTemporaryMessage(notification.text, notification.color, notification.duration);
        
        // Screen flash
        this.screenFlash = 0.8;
        
        // Particle burst
        this.createAdvancedParticles(
            this.gameWidth / 2, this.gameHeight / 3, 
            event.color, 'explosion', 30
        );
    }
    
    createEventParticles(color, intensity) {
        const count = Math.floor(5 * intensity);
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            color, 'trail', count
        );
    }
    
    spawnEventCoin() {
        this.powerups.push({
            x: this.gameWidth + Math.random() * 200,
            y: 350 + Math.random() * 100,
            width: 25,
            height: 25,
            type: 'coin',
            color: '#ffd700',
            rotation: 0,
            pulsePhase: Math.random() * Math.PI * 2
        });
    }
    
    // ENVIRONMENTAL NARRATIVE SYSTEM
    updateEnvironmentalNarrative() {
        const env = this.environmentalNarrative;
        
        // Progress theme transition
        env.themeProgress += this.speed * 0.1;
        
        // Check for theme transition
        if (env.themeProgress >= env.transitionDistance && !env.transitionActive) {
            this.startThemeTransition();
        }
        
        // Update transition
        if (env.transitionActive) {
            this.updateThemeTransition();
        }
        
        // Apply atmospheric effects
        this.applyThemeAtmosphere();
    }
    
    startThemeTransition() {
        const env = this.environmentalNarrative;
        const themes = Object.keys(env.themes);
        const currentIndex = themes.indexOf(env.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        env.nextTheme = themes[nextIndex];
        env.transitionActive = true;
        env.transitionProgress = 0;
        
        // Visual announcement
        const themeName = env.themes[env.nextTheme].name;
        this.showTemporaryMessage(`Entering ${themeName}`, '#ffffff', 3000);
        
        console.log(`Theme transition started: ${env.currentTheme} → ${env.nextTheme}`);
    }
    
    updateThemeTransition() {
        const env = this.environmentalNarrative;
        env.transitionProgress += 0.02;
        
        if (env.transitionProgress >= 1.0) {
            env.currentTheme = env.nextTheme;
            env.transitionActive = false;
            env.themeProgress = 0;
            console.log(`Theme transition completed: ${env.currentTheme}`);
        }
    }
    
    applyThemeAtmosphere() {
        const env = this.environmentalNarrative;
        const theme = env.themes[env.currentTheme];
        
        // Modify game colors based on theme
        if (theme.atmosphere === 'neon') {
            this.postProcessing.bloom = 0.3;
            this.postProcessing.scanlines = 0.2;
        } else if (theme.atmosphere === 'organic') {
            this.postProcessing.filmGrain = 0.2;
        } else if (theme.atmosphere === 'ethereal') {
            this.postProcessing.chromaticAberration = 0.1;
        }
    }
    
    // EPIC MOMENTS SYSTEM - Erweitert das bestehende Near-Miss System
    updateEpicMoments() {
        const epic = this.epicMoments;
        
        // Check for epic moment triggers
        this.detectEpicMoments();
        
        // Update active epic moment
        if (epic.active) {
            epic.duration -= 16;
            
            // Apply slow motion
            this.timeScale = epic.slowMotionFactor;
            
            // Enhanced visual effects
            this.applyEpicMomentEffects();
            
            // Record replay data
            this.recordReplayFrame();
            
            // End epic moment
            if (epic.duration <= 0) {
                this.endEpicMoment();
            }
        }
    }
    
    detectEpicMoments() {
        const epic = this.epicMoments;
        
        if (epic.active) return; // Already in epic moment
        
        // Legendary escape: Extremely close near-miss with high flow state
        if (this.nearMissSystem.streakCount >= 3 && this.flowState.level >= 4) {
            this.triggerEpicMoment('legendary_escape');
            return;
        }
        
        // Perfect flow: High combo + high flow state
        if (this.combo >= 15 && this.flowState.level >= 3) {
            this.triggerEpicMoment('perfect_flow');
            return;
        }
        
        // Clutch save: Last second escape with high streak
        if (this.lastSecondEscape.currentEscapeStreak >= 2) {
            this.triggerEpicMoment('clutch_save');
            return;
        }
        
        // Zone master: Surviving high-danger zone for extended time
        if (this.currentZone && this.currentZone.activeTime > 5 && this.currentZone.dangerLevel > 0.7) {
            this.triggerEpicMoment('zone_master');
            return;
        }
    }
    
    triggerEpicMoment(type) {
        const epic = this.epicMoments;
        const momentConfig = epic.momentTypes[type];
        
        epic.active = true;
        epic.type = type;
        epic.intensity = momentConfig.threshold;
        epic.duration = momentConfig.duration;
        epic.slowMotionFactor = momentConfig.slowMo;
        epic.cinematicEffects = true;
        epic.replayData = [];
        
        // Visual announcement
        const messages = {
            'legendary_escape': '🏆 LEGENDARY ESCAPE!',
            'perfect_flow': '✨ PERFECT FLOW!',
            'clutch_save': '🔥 CLUTCH SAVE!',
            'zone_master': '👑 ZONE MASTER!'
        };
        
        this.showTemporaryMessage(messages[type], '#ffd700', epic.duration);
        
        // Massive screen effects
        this.screenFlash = 1.0;
        this.createAdvancedParticles(
            this.gameWidth / 2, this.gameHeight / 2, 
            '#ffd700', 'explosion', 50
        );
        
        console.log(`Epic Moment Triggered: ${type}`);
    }
    
    applyEpicMomentEffects() {
        // Enhanced bloom during epic moments
        this.postProcessing.bloom = 2.0;
        this.postProcessing.chromaticAberration = 0.2;
        
        // Pulsing vignette
        this.postProcessing.vignette = 0.3 + Math.sin(this.time * 0.1) * 0.2;
        
        // Enhanced particle effects
        if (Math.random() < 0.3) {
            this.createAdvancedParticles(
                Math.random() * this.gameWidth,
                Math.random() * this.gameHeight,
                '#ffd700', 'spark', 2
            );
        }
    }
    
    recordReplayFrame() {
        // Record key frame data for potential replay
        this.epicMoments.replayData.push({
            time: this.time,
            playerX: this.player.x,
            playerY: this.player.y,
            obstacles: this.obstacles.map(o => ({ x: o.x, y: o.y, type: o.type })),
            score: this.score,
            combo: this.combo
        });
        
        // Limit replay data size
        if (this.epicMoments.replayData.length > 120) { // 2 seconds at 60fps
            this.epicMoments.replayData.shift();
        }
    }
    
    endEpicMoment() {
        const epic = this.epicMoments;
        
        // Reset effects
        this.timeScale = 1.0;
        this.postProcessing.bloom = 0;
        this.postProcessing.chromaticAberration = 0;
        this.postProcessing.vignette = 0;
        
        // Bonus score for epic moment
        const bonusScore = Math.floor(epic.intensity * 1000);
        this.score += bonusScore;
        
        console.log(`Epic Moment Ended: ${epic.type} (Bonus: ${bonusScore})`);
        
        epic.active = false;
        epic.type = null;
    }
    
    // COMMUNITY EVENTS SYSTEM - Erweitert Daily Challenges
    updateCommunityEvents() {
        // Placeholder for community features
        // This would integrate with a backend for real multiplayer features
        
        // Update local leaderboard simulation
        this.updateLocalLeaderboard();
        
        // Check for weekly challenge progress
        this.updateWeeklyChallengeProgress();
    }
    
    updateLocalLeaderboard() {
        // Simulate local leaderboard with localStorage
        try {
            let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
            
            // Add current session high score
            if (this.score > this.bestScore) {
                const entry = {
                    score: this.score,
                    distance: this.distance,
                    date: new Date().toISOString(),
                    combo: this.maxCombo
                };
                
                leaderboard.push(entry);
                leaderboard.sort((a, b) => b.score - a.score);
                leaderboard = leaderboard.slice(0, 10); // Keep top 10
                
                localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
                this.communityEvents.leaderboard = leaderboard;
            }
        } catch (error) {
            console.warn('Leaderboard update failed:', error);
        }
    }
    
    updateWeeklyChallengeProgress() {
        // Simulate weekly challenge progression
        const community = this.communityEvents;
        
        if (!community.weeklyChallenge) {
            community.weeklyChallenge = {
                name: 'Global Distance Marathon',
                description: 'Collective distance traveled by all players',
                progress: 0,
                goal: 1000000, // 1 million meters
                playerContribution: 0,
                timeRemaining: 7 * 24 * 60 * 60 * 1000 // 7 days
            };
        }
        
        // Add player's distance to community progress
        const newContribution = this.distance - community.playerContribution;
        if (newContribution > 0) {
            community.weeklyChallenge.progress += newContribution;
            community.playerContribution = this.distance;
        }
    }
    
    handleError(error, context = 'Unknown') {
        console.error(`Game Error in ${context}:`, error);
        
        // Graceful degradation basierend auf Error-Type
        if (error.name === 'SecurityError' || error.message.includes('localStorage')) {
            // localStorage blockiert - use in-memory fallback
            this.useMemoryStorage = true;
            console.warn('localStorage blocked, using memory storage');
        } else if (error.message.includes('Canvas')) {
            // Canvas Probleme - reduziere Qualität
            this.enableLowPerformanceMode();
            console.warn('Canvas issues detected, reducing quality');
        } else if (error.message.includes('Audio')) {
            // Audio Probleme - deaktiviere Sound
            this.soundEnabled = false;
            console.warn('Audio disabled due to errors');
        }
        
        // Zeige User-friendly Fehler-Nachricht
        this.showErrorToUser('Performance optimiert für bessere Stabilität');
    }
    
    safeLocalStorage(operation, key, value = null) {
        try {
            switch(operation) {
                case 'get':
                    return localStorage.getItem(key);
                case 'set':
                    localStorage.setItem(key, value);
                    return true;
                case 'remove':
                    localStorage.removeItem(key);
                    return true;
            }
        } catch (error) {
            this.handleError(error, 'localStorage');
            return operation === 'get' ? null : false;
        }
    }
    
    showErrorToUser(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '10px';
        errorDiv.style.right = '10px';
        errorDiv.style.background = 'rgba(255, 165, 0, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px 15px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.zIndex = '1002';
        errorDiv.textContent = message;
        
        document.getElementById('ui').appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // CHARACTER PROGRESSION SYSTEM FUNCTIONS
    initializeCharacterStats() {
        return {
            speed: 1.0,
            jumpPower: 1.0,
            shieldDuration: 1.0,
            scoreMultiplier: 1.0,
            experienceBonus: 1.0,
            specialAbilities: []
        };
    }
    
    updateProgression() {
        // Update difficulty tier based on current distance
        this.updateDifficultyTier();
        
        // Track progression statistics
        this.trackProgressionStats();
        
        // Check for character/content unlocks
        this.checkUnlocks();
        
        // Save progression data
        this.saveProgressionData();
    }
    
    updateDifficultyTier() {
        const progression = this.difficultyProgression;
        const currentDistance = this.distance;
        
        // Check if we should advance to next tier
        for (let tier = 1; tier <= 10; tier++) {
            if (currentDistance >= progression.tierThresholds[tier - 1]) {
                if (tier > progression.currentTier) {
                    progression.currentTier = tier;
                    this.onTierAdvancement(tier);
                }
            }
        }
        
        // Apply tier bonuses
        const tierData = progression.tierBonuses[progression.currentTier];
        if (tierData) {
            // Apply score multiplier
            this.baseScoreMultiplier = tierData.scoreMultiplier;
            
            // Apply speed increase (gradual)
            if (tierData.speedIncrease > 0) {
                this.maxSpeed = Math.min(8 + tierData.speedIncrease, 15);
            }
            
            // Enable special features
            this.enableTierFeatures(tierData.specialFeatures);
        }
    }
    
    onTierAdvancement(newTier) {
        // TIER ADVANCEMENT CELEBRATION
        this.createAdvancedParticles(
            this.gameWidth / 2,
            this.gameHeight / 2,
            '#ffd700',
            'explosion',
            30
        );
        
        // Award experience and skill points
        const expBonus = newTier * 50;
        const skillBonus = Math.floor(newTier / 2);
        
        this.awardExperience(expBonus, `TIER ${newTier} REACHED!`);
        this.characterProgression.skillPoints += skillBonus;
        
        // Show tier notification
        this.showTierAdvancement(newTier);
        
        console.log(`Advanced to Tier ${newTier}! Bonus: ${expBonus} EXP, ${skillBonus} Skill Points`);
    }
    
    enableTierFeatures(features) {
        for (let feature of features) {
            switch (feature) {
                case 'wallrun_boost':
                    this.wallRunBoostEnabled = true;
                    break;
                case 'combo_chains':
                    this.comboChainEnabled = true;
                    break;
                case 'epic_moments':
                    this.epicMomentsEnabled = true;
                    break;
                case 'boss_encounters':
                    this.bossEncountersEnabled = true;
                    break;
                case 'dynamic_weather':
                    this.dynamicWeatherEnabled = true;
                    break;
                case 'portal_system':
                    this.portalSystemEnabled = true;
                    break;
                case 'master_challenges':
                    this.masterChallengesEnabled = true;
                    break;
                case 'legendary_mode':
                    this.legendaryModeEnabled = true;
                    break;
                case 'infinite_mastery':
                    this.infiniteMasteryEnabled = true;
                    break;
            }
        }
    }
    
    awardExperience(amount, reason = '') {
        const progression = this.characterProgression;
        const oldLevel = progression.level;
        
        progression.experience += amount;
        progression.totalExp += amount;
        
        // Check for level up
        while (progression.experience >= progression.expToNext) {
            progression.experience -= progression.expToNext;
            progression.level++;
            
            // Increase EXP requirement for next level
            progression.expToNext = Math.floor(100 * Math.pow(1.2, progression.level - 1));
            
            // Award skill point every level
            progression.skillPoints++;
            
            this.onLevelUp(progression.level);
        }
        
        // Show experience gain
        if (amount > 0) {
            this.showExperienceGain(amount, reason);
        }
    }
    
    onLevelUp(newLevel) {
        // LEVEL UP CELEBRATION
        this.createAdvancedParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#00ff00',
            'burst',
            25
        );
        
        // Temporary boost
        this.speed = Math.min(this.speed + 1, this.maxSpeed);
        this.score += newLevel * 100;
        
        // Shop System: Award currency for level up
        this.addShopCurrency(50);
        
        // Emit level up event
        window.gameEvents.emit('player:levelup', {
            newLevel: newLevel,
            timestamp: Date.now()
        });
        
        this.showLevelUpNotification(newLevel);
        
        console.log(`LEVEL UP! Now level ${newLevel}`);
    }
    
    trackProgressionStats() {
        // Update session statistics
        this.progressionStats.totalDistance = Math.max(this.progressionStats.totalDistance, this.distance);
        
        // These will be updated by specific actions
        // Jump count updated in jump()
        // Wall runs updated in wall run mechanics
        // Powerups updated in collectPowerup()
        // etc.
    }
    
    checkUnlocks() {
        const totalExp = this.characterProgression.totalExp;
        const characters = this.unlockableContent.characters;
        
        // Check character unlocks based on total experience
        for (let [charId, charData] of Object.entries(characters)) {
            if (!charData.unlocked && totalExp >= charData.cost) {
                charData.unlocked = true;
                this.showUnlockNotification('character', charData.name);
            }
        }
        
        // Check theme unlocks based on progression
        const themes = this.unlockableContent.themes;
        const currentTier = this.difficultyProgression.currentTier;
        
        if (currentTier >= 3 && !themes.neon.unlocked) {
            themes.neon.unlocked = true;
            this.showUnlockNotification('theme', 'Neon City');
        }
        
        if (currentTier >= 5 && !themes.forest.unlocked) {
            themes.forest.unlocked = true;
            this.showUnlockNotification('theme', 'Mystic Forest');
        }
        
        if (currentTier >= 7 && !themes.space.unlocked) {
            themes.space.unlocked = true;
            this.showUnlockNotification('theme', 'Space Station');
        }
    }
    
    saveProgressionData() {
        try {
            const progression = this.characterProgression;
            localStorage.setItem('playerLevel', progression.level.toString());
            localStorage.setItem('playerExp', progression.experience.toString());
            localStorage.setItem('totalExp', progression.totalExp.toString());
            localStorage.setItem('skillPoints', progression.skillPoints.toString());
            localStorage.setItem('unlockedCharacters', JSON.stringify(progression.unlockedCharacters));
            localStorage.setItem('currentCharacter', progression.currentCharacter);
            
            // Save stats
            const stats = this.progressionStats;
            localStorage.setItem('totalDistance', stats.totalDistance.toString());
            localStorage.setItem('totalJumps', stats.totalJumps.toString());
            localStorage.setItem('totalWallRuns', stats.totalWallRuns.toString());
            localStorage.setItem('totalPowerups', stats.totalPowerupsCollected.toString());
            localStorage.setItem('totalBosses', stats.totalBossesDefeated.toString());
            localStorage.setItem('sessionsPlayed', stats.sessionsPlayed.toString());
            localStorage.setItem('achievements', stats.achievementsUnlocked.toString());
        } catch (error) {
            console.warn('Could not save progression data:', error);
        }
    }
    
    showTierAdvancement(tier) {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '40%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = 'linear-gradient(45deg, #ffd700, #ff8c00)';
        notification.style.color = 'white';
        notification.style.padding = '20px';
        notification.style.borderRadius = '15px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '1003';
        notification.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.6)';
        notification.style.animation = 'pulse 2s ease-in-out infinite';
        notification.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">🏆 TIER ${tier} REACHED!</h3>
            <p style="margin: 0; opacity: 0.9;">New features unlocked!</p>
        `;
        
        document.getElementById('ui').appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    showExperienceGain(amount, reason) {
        const expIndicator = document.createElement('div');
        expIndicator.style.position = 'absolute';
        expIndicator.style.top = '60%';
        expIndicator.style.right = '20px';
        expIndicator.style.color = '#00ff00';
        expIndicator.style.fontSize = '14px';
        expIndicator.style.fontWeight = 'bold';
        expIndicator.style.zIndex = '1001';
        expIndicator.style.pointerEvents = 'none';
        expIndicator.style.textShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
        expIndicator.textContent = `+${amount} EXP${reason ? ' - ' + reason : ''}`;
        
        document.getElementById('ui').appendChild(expIndicator);
        
        setTimeout(() => {
            if (expIndicator.parentNode) {
                expIndicator.style.transition = 'all 1s ease-out';
                expIndicator.style.opacity = '0';
                expIndicator.style.transform = 'translateY(-30px)';
                
                setTimeout(() => {
                    if (expIndicator.parentNode) {
                        expIndicator.parentNode.removeChild(expIndicator);
                    }
                }, 1000);
            }
        }, 1500);
    }
    
    showLevelUpNotification(level) {
        const levelUp = document.createElement('div');
        levelUp.style.position = 'absolute';
        levelUp.style.top = '30%';
        levelUp.style.left = '50%';
        levelUp.style.transform = 'translate(-50%, -50%)';
        levelUp.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
        levelUp.style.color = 'white';
        levelUp.style.padding = '15px 25px';
        levelUp.style.borderRadius = '12px';
        levelUp.style.textAlign = 'center';
        levelUp.style.zIndex = '1002';
        levelUp.style.fontSize = '18px';
        levelUp.style.fontWeight = 'bold';
        levelUp.style.boxShadow = '0 6px 24px rgba(0, 255, 0, 0.5)';
        levelUp.style.animation = 'pulse 1s ease-in-out 3';
        levelUp.textContent = `🌟 LEVEL ${level}! 🌟`;
        
        document.getElementById('ui').appendChild(levelUp);
        
        setTimeout(() => {
            if (levelUp.parentNode) {
                levelUp.parentNode.removeChild(levelUp);
            }
        }, 3000);
    }
    
    showUnlockNotification(type, name) {
        const unlock = document.createElement('div');
        unlock.style.position = 'absolute';
        unlock.style.top = '25%';
        unlock.style.left = '50%';
        unlock.style.transform = 'translate(-50%, -50%)';
        unlock.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
        unlock.style.color = 'white';
        unlock.style.padding = '15px 20px';
        unlock.style.borderRadius = '10px';
        unlock.style.textAlign = 'center';
        unlock.style.zIndex = '1002';
        unlock.style.fontSize = '16px';
        unlock.style.fontWeight = 'bold';
        unlock.style.boxShadow = '0 6px 24px rgba(155, 89, 182, 0.5)';
        unlock.innerHTML = `
            <div>🔓 ${type.toUpperCase()} UNLOCKED!</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">${name}</div>
        `;
        
        document.getElementById('ui').appendChild(unlock);
        
        setTimeout(() => {
            if (unlock.parentNode) {
                unlock.parentNode.removeChild(unlock);
            }
        }, 3500);
    }
    
    // SHOP & UPGRADE SYSTEM FUNCTIONS
    loadShopProgress() {
        try {
            const savedUpgrades = JSON.parse(localStorage.getItem('upgradeProgress') || '{}');
            
            for (let [upgradeId, upgrade] of Object.entries(this.shopSystem.availableUpgrades)) {
                if (savedUpgrades[upgradeId]) {
                    upgrade.currentLevel = savedUpgrades[upgradeId].currentLevel || 0;
                }
            }
            
            this.shopSystem.currency = parseInt(localStorage.getItem('shopCurrency')) || 0;
            this.applyUpgradeEffects();
        } catch (error) {
            console.warn('Could not load shop progress:', error);
        }
    }
    
    saveShopProgress() {
        try {
            const upgradeProgress = {};
            for (let [upgradeId, upgrade] of Object.entries(this.shopSystem.availableUpgrades)) {
                upgradeProgress[upgradeId] = {
                    currentLevel: upgrade.currentLevel
                };
            }
            
            localStorage.setItem('upgradeProgress', JSON.stringify(upgradeProgress));
            localStorage.setItem('shopCurrency', this.shopSystem.currency.toString());
        } catch (error) {
            console.warn('Could not save shop progress:', error);
        }
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.shopSystem.availableUpgrades[upgradeId];
        if (!upgrade) return false;
        
        const cost = this.getUpgradeCost(upgrade);
        
        if (this.shopSystem.currency >= cost && upgrade.currentLevel < upgrade.maxLevel) {
            this.shopSystem.currency -= cost;
            upgrade.currentLevel++;
            
            this.applyUpgradeEffects();
            this.saveShopProgress();
            
            this.showUpgradePurchased(upgrade);
            return true;
        }
        
        return false;
    }
    
    getUpgradeCost(upgrade) {
        // Exponential cost scaling
        return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.currentLevel));
    }
    
    applyUpgradeEffects() {
        // Reset to base values then apply upgrades
        this.upgradeEffects = {
            jumpPower: 1.0,
            baseSpeed: 2.0,
            shieldDuration: 1.0,
            magnetRange: 1.0,
            hazardResistance: 0.0,
            biomeBonus: 1.0
        };
        
        for (let [upgradeId, upgrade] of Object.entries(this.shopSystem.availableUpgrades)) {
            if (upgrade.currentLevel > 0) {
                for (let [effectType, effectValue] of Object.entries(upgrade.effect)) {
                    if (this.upgradeEffects.hasOwnProperty(effectType)) {
                        if (effectType === 'hazardResistance') {
                            this.upgradeEffects[effectType] += effectValue * upgrade.currentLevel;
                        } else {
                            this.upgradeEffects[effectType] += effectValue * upgrade.currentLevel;
                        }
                    }
                }
            }
        }
        
        // Apply to game systems
        this.speed = this.upgradeEffects.baseSpeed;
    }
    
    awardCurrency(amount, source = '') {
        const biome = this.biomeSystem.availableBiomes[this.biomeSystem.currentBiome];
        const biomeMultiplier = biome.bonusCoins * this.upgradeEffects.biomeBonus;
        const finalAmount = Math.floor(amount * biomeMultiplier);
        
        this.shopSystem.currency += finalAmount;
        this.shopSystem.earnedThisSession += finalAmount;
        
        this.showCurrencyGain(finalAmount, source);
        this.saveShopProgress();
    }
    
    showUpgradePurchased(upgrade) {
        const notification = document.createElement('div');
        notification.style.position = 'absolute';
        notification.style.top = '35%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.textAlign = 'center';
        notification.style.zIndex = '1003';
        notification.style.fontSize = '16px';
        notification.style.fontWeight = 'bold';
        notification.style.boxShadow = '0 6px 24px rgba(46, 204, 113, 0.4)';
        notification.innerHTML = `
            <div>✅ UPGRADE PURCHASED!</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">${upgrade.icon} ${upgrade.name} Level ${upgrade.currentLevel}</div>
        `;
        
        document.getElementById('ui').appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    showCurrencyGain(amount, source) {
        const currencyIndicator = document.createElement('div');
        currencyIndicator.style.position = 'absolute';
        currencyIndicator.style.top = '65%';
        currencyIndicator.style.right = '20px';
        currencyIndicator.style.color = '#ffd700';
        currencyIndicator.style.fontSize = '14px';
        currencyIndicator.style.fontWeight = 'bold';
        currencyIndicator.style.zIndex = '1001';
        currencyIndicator.style.pointerEvents = 'none';
        currencyIndicator.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        currencyIndicator.textContent = `+${amount} 💰${source ? ' - ' + source : ''}`;
        
        document.getElementById('ui').appendChild(currencyIndicator);
        
        setTimeout(() => {
            if (currencyIndicator.parentNode) {
                currencyIndicator.style.transition = 'all 1s ease-out';
                currencyIndicator.style.opacity = '0';
                currencyIndicator.style.transform = 'translateY(-30px)';
                
                setTimeout(() => {
                    if (currencyIndicator.parentNode) {
                        currencyIndicator.parentNode.removeChild(currencyIndicator);
                    }
                }, 1000);
            }
        }, 1500);
    }
    
    // BIOME SYSTEM FUNCTIONS
    initializeBiome() {
        this.currentBiomeData = this.biomeSystem.availableBiomes[this.biomeSystem.currentBiome];
        this.updateBiomeVisuals();
    }
    
    updateBiomeSystem() {
        this.biomeSystem.biomeDistance += this.speed * 0.1;
        
        // Check for biome transition
        if (this.biomeSystem.biomeDistance >= this.biomeSystem.transitionDistance) {
            this.transitionToNextBiome();
        }
        
        // Update hazards
        this.updateEnvironmentalHazards();
    }
    
    transitionToNextBiome() {
        const unlockedBiomes = this.biomeSystem.unlockedBiomes;
        const currentIndex = unlockedBiomes.indexOf(this.biomeSystem.currentBiome);
        
        // Unlock new biome based on distance
        this.unlockBiomesBasedOnProgress();
        
        // Select next biome
        const nextIndex = (currentIndex + 1) % this.biomeSystem.unlockedBiomes.length;
        const nextBiome = this.biomeSystem.unlockedBiomes[nextIndex];
        
        if (nextBiome !== this.biomeSystem.currentBiome) {
            this.biomeSystem.currentBiome = nextBiome;
            this.biomeSystem.biomeDistance = 0;
            this.currentBiomeData = this.biomeSystem.availableBiomes[nextBiome];
            
            this.showBiomeTransition(this.currentBiomeData);
            this.updateBiomeVisuals();
            this.awardCurrency(100, 'Biome Discovered');
        }
    }
    
    unlockBiomesBasedOnProgress() {
        const distance = this.distance;
        const unlockedBiomes = this.biomeSystem.unlockedBiomes;
        
        if (distance >= 1000 && !unlockedBiomes.includes('desert')) {
            unlockedBiomes.push('desert');
            this.showBiomeUnlocked('desert');
        }
        
        if (distance >= 2500 && !unlockedBiomes.includes('arctic')) {
            unlockedBiomes.push('arctic');
            this.showBiomeUnlocked('arctic');
        }
        
        if (distance >= 5000 && !unlockedBiomes.includes('volcano')) {
            unlockedBiomes.push('volcano');
            this.showBiomeUnlocked('volcano');
        }
        
        if (distance >= 8000 && !unlockedBiomes.includes('cyber')) {
            unlockedBiomes.push('cyber');
            this.showBiomeUnlocked('cyber');
        }
        
        // Save progress
        localStorage.setItem('unlockedBiomes', JSON.stringify(unlockedBiomes));
    }
    
    updateBiomeVisuals() {
        // This would be called during background rendering
        this.biomeColors = this.currentBiomeData.colors;
    }
    
    showBiomeTransition(biomeData) {
        const transition = document.createElement('div');
        transition.style.position = 'absolute';
        transition.style.top = '40%';
        transition.style.left = '50%';
        transition.style.transform = 'translate(-50%, -50%)';
        transition.style.background = `linear-gradient(45deg, ${biomeData.colors.accent}, ${biomeData.colors.ground})`;
        transition.style.color = 'white';
        transition.style.padding = '20px';
        transition.style.borderRadius = '15px';
        transition.style.textAlign = 'center';
        transition.style.zIndex = '1003';
        transition.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        transition.style.animation = 'pulse 2s ease-in-out infinite';
        transition.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">🌍 ENTERING</h3>
            <p style="margin: 0; font-size: 1.2em; font-weight: bold;">${biomeData.name}</p>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9em;">${biomeData.description}</p>
        `;
        
        document.getElementById('ui').appendChild(transition);
        
        setTimeout(() => {
            if (transition.parentNode) {
                transition.parentNode.removeChild(transition);
            }
        }, 4000);
    }
    
    showBiomeUnlocked(biomeId) {
        const biomeData = this.biomeSystem.availableBiomes[biomeId];
        
        const unlock = document.createElement('div');
        unlock.style.position = 'absolute';
        unlock.style.top = '25%';
        unlock.style.left = '50%';
        unlock.style.transform = 'translate(-50%, -50%)';
        unlock.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
        unlock.style.color = 'white';
        unlock.style.padding = '15px 20px';
        unlock.style.borderRadius = '10px';
        unlock.style.textAlign = 'center';
        unlock.style.zIndex = '1002';
        unlock.style.fontSize = '16px';
        unlock.style.fontWeight = 'bold';
        unlock.style.boxShadow = '0 6px 24px rgba(243, 156, 18, 0.5)';
        unlock.innerHTML = `
            <div>🔓 NEW BIOME UNLOCKED!</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">${biomeData.name}</div>
        `;
        
        document.getElementById('ui').appendChild(unlock);
        
        setTimeout(() => {
            if (unlock.parentNode) {
                unlock.parentNode.removeChild(unlock);
            }
        }, 3500);
    }
    
    // ENVIRONMENTAL HAZARDS SYSTEM
    updateEnvironmentalHazards() {
        const currentTime = Date.now();
        
        // Spawn new hazards
        if (currentTime - this.hazardSystem.hazardSpawnTimer >= this.hazardSystem.hazardSpawnInterval) {
            this.spawnEnvironmentalHazard();
            this.hazardSystem.hazardSpawnTimer = currentTime;
        }
        
        // Update existing hazards
        for (let i = this.hazardSystem.activeHazards.length - 1; i >= 0; i--) {
            const hazard = this.hazardSystem.activeHazards[i];
            
            // Move hazard
            hazard.x -= this.speed;
            
            // Update effect
            this.updateHazardEffect(hazard);
            
            // Check collision with player
            if (this.checkHazardCollision(hazard)) {
                this.applyHazardEffect(hazard);
            }
            
            // Remove expired or off-screen hazards
            if (hazard.x < -100 || currentTime - hazard.spawnTime > hazard.duration) {
                this.hazardSystem.activeHazards.splice(i, 1);
            }
        }
    }
    
    spawnEnvironmentalHazard() {
        const biomeHazards = this.currentBiomeData.hazards;
        if (!biomeHazards || biomeHazards.length === 0) return;
        
        // Random hazard from current biome
        const hazardType = biomeHazards[Math.floor(Math.random() * biomeHazards.length)];
        const hazardData = this.hazardSystem.hazardTypes[hazardType];
        
        if (!hazardData) return;
        
        const hazard = {
            type: hazardType,
            x: this.gameWidth + 50,
            y: this.ground.y - 100 + (Math.random() * 100),
            width: hazardData.visual.size === 'large' ? 120 : hazardData.visual.size === 'medium' ? 80 : 40,
            height: hazardData.visual.size === 'large' ? 120 : hazardData.visual.size === 'medium' ? 80 : 40,
            spawnTime: Date.now(),
            duration: hazardData.duration,
            damage: hazardData.damage,
            effect: hazardData.effect,
            visual: hazardData.visual,
            intensity: Math.random() * 0.5 + 0.5
        };
        
        this.hazardSystem.activeHazards.push(hazard);
    }
    
    checkHazardCollision(hazard) {
        return this.player.x < hazard.x + hazard.width &&
               this.player.x + this.player.width > hazard.x &&
               this.player.y < hazard.y + hazard.height &&
               this.player.y + this.player.height > hazard.y;
    }
    
    applyHazardEffect(hazard) {
        // Apply damage with upgrade resistance
        const resistance = this.upgradeEffects.hazardResistance;
        const actualDamage = Math.floor(hazard.damage * (1 - resistance));
        
        if (actualDamage > 0 && !this.hasActivePowerup('shield')) {
            // Apply damage (could reduce score, reset combo, etc.)
            this.combo = Math.max(0, this.combo - 2);
            this.score = Math.max(0, this.score - actualDamage);
            
            // Visual feedback
            this.screenFlash = 0.4;
            this.triggerShake(5, 'impact', 1.2);
        }
        
        // Apply special effects
        this.applyHazardSpecialEffect(hazard);
    }
    
    applyHazardSpecialEffect(hazard) {
        switch (hazard.effect) {
            case 'speed_reduction':
                this.temporarySpeedMultiplier = 0.7;
                setTimeout(() => {
                    this.temporarySpeedMultiplier = 1.0;
                }, 2000);
                break;
                
            case 'slippery_movement':
                this.slipperyMovement = true;
                setTimeout(() => {
                    this.slipperyMovement = false;
                }, 1500);
                break;
                
            case 'knockback':
                if (this.player.isJumping) {
                    this.player.velocityY = -10;
                }
                this.player.x = Math.max(50, this.player.x - 30);
                break;
                
            case 'vision_obstruction':
                this.visionObstructed = true;
                setTimeout(() => {
                    this.visionObstructed = false;
                }, 2000);
                break;
        }
    }
    
    drawEnvironmentalHazards() {
        this.ctx.save();
        
        for (let hazard of this.hazardSystem.activeHazards) {
            this.ctx.globalAlpha = hazard.intensity;
            
            // Draw based on pattern
            switch (hazard.visual.pattern) {
                case 'falling':
                    this.drawFallingHazard(hazard);
                    break;
                case 'swirling':
                    this.drawSwirlingHazard(hazard);
                    break;
                case 'eruption':
                    this.drawEruptionHazard(hazard);
                    break;
                case 'grid':
                    this.drawGridHazard(hazard);
                    break;
                default:
                    this.drawBasicHazard(hazard);
            }
        }
        
        this.ctx.restore();
    }
    
    drawBasicHazard(hazard) {
        this.ctx.fillStyle = hazard.visual.color;
        this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
    }
    
    drawFallingHazard(hazard) {
        this.ctx.fillStyle = hazard.visual.color;
        const leafCount = Math.floor(hazard.width / 8);
        
        for (let i = 0; i < leafCount; i++) {
            const x = hazard.x + (i * 8) + Math.sin(Date.now() * 0.001 + i) * 10;
            const y = hazard.y + (Date.now() * 0.1 + i * 50) % hazard.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawSwirlingHazard(hazard) {
        const centerX = hazard.x + hazard.width / 2;
        const centerY = hazard.y + hazard.height / 2;
        const time = Date.now() * 0.005;
        
        this.ctx.fillStyle = hazard.visual.color;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + time;
            const radius = 20 + Math.sin(time + i) * 15;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawEruptionHazard(hazard) {
        const centerX = hazard.x + hazard.width / 2;
        const bottomY = hazard.y + hazard.height;
        
        // Lava geyser effect
        this.ctx.fillStyle = hazard.visual.color;
        
        for (let i = 0; i < 10; i++) {
            const x = centerX + (Math.random() - 0.5) * 20;
            const y = bottomY - Math.random() * hazard.height;
            const size = Math.random() * 8 + 4;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawGridHazard(hazard) {
        this.ctx.strokeStyle = hazard.visual.color;
        this.ctx.lineWidth = 2;
        
        const gridSize = 20;
        
        // Vertical lines
        for (let x = hazard.x; x < hazard.x + hazard.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, hazard.y);
            this.ctx.lineTo(x, hazard.y + hazard.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = hazard.y; y < hazard.y + hazard.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(hazard.x, y);
            this.ctx.lineTo(hazard.x + hazard.width, y);
            this.ctx.stroke();
        }
    }
}

// Sicherere Initialisierung mit umfassendem Error Handling
function initGame() {
    try {
        console.log('Initializing game...');
        
        // Check Browser Compatibility
        if (!document.createElement('canvas').getContext) {
            throw new Error('Canvas not supported');
        }
        
        const game = new EndlessRunner();
        if (game && game.canvas) {
            console.log('Game initialized successfully');
            
            // Initialize Onboarding System
            game.onboarding = new OnboardingSystem(game);
            
            // Initialize Settings System
            game.settings = new SettingsSystem(game);
            
            // Initialize Global Event Bus
            window.gameEvents = new EventBus();
            
            // Initialize Debug Dashboard
            game.debug = new DebugDashboard(game);
            
            // Initialize Object Pools
            game.initializeObjectPools();
            
            // Initialize Safe System Wrappers
            game.initializeSafeSystems();
            
            // INITIALIZE ANALYTICS & DYNAMIC DIFFICULTY ADJUSTMENT
            game.analytics = new GameAnalytics(game);
            game.difficultyAdjustment = new DynamicDifficultyAdjustment(game, game.analytics);
            
            // Global Error Handler für unerwartete Fehler
            window.addEventListener('error', (event) => {
                game.handleError(event.error, 'Global');
            });
            
            // Unhandled Promise Rejections
            window.addEventListener('unhandledrejection', (event) => {
                game.handleError(event.reason, 'Promise');
            });
            
        } else {
            throw new Error('Game initialization failed');
        }
    } catch (error) {
        console.error('Critical error initializing game:', error);
        
        // Fallback UI für schwerwiegende Fehler
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px;">
                    <h2>🎮 Game Loading Error</h2>
                    <p>Your browser might not support all required features.</p>
                    <p>Please try refreshing the page or using a modern browser.</p>
                    <button onclick="location.reload()" style="
                        background: #4ecdc4; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer;
                        margin-top: 20px;
                    ">Retry</button>
                </div>
            `;
        }
    }
}

// =====================================
// OBJECT POOLING SYSTEM
// =====================================

class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.objects = [];
        this.available = [];
        this.inUse = [];
        
        // Pre-create objects
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj._pooled = true;
            this.objects.push(obj);
            this.available.push(obj);
        }
        
        this.totalCreated = initialSize;
        this.peakUsage = 0;
    }
    
    acquire() {
        let obj;
        
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            // Create new object if pool is empty
            obj = this.createFn();
            obj._pooled = true;
            this.objects.push(obj);
            this.totalCreated++;
        }
        
        this.inUse.push(obj);
        this.peakUsage = Math.max(this.peakUsage, this.inUse.length);
        
        return obj;
    }
    
    release(obj) {
        const index = this.inUse.indexOf(obj);
        if (index > -1) {
            this.inUse.splice(index, 1);
            this.resetFn(obj);
            this.available.push(obj);
        }
    }
    
    releaseAll() {
        while (this.inUse.length > 0) {
            this.release(this.inUse[0]);
        }
    }
    
    getStats() {
        return {
            total: this.objects.length,
            available: this.available.length,
            inUse: this.inUse.length,
            peakUsage: this.peakUsage,
            efficiency: this.peakUsage / this.objects.length
        };
    }
}

// =====================================
// EVENT SYSTEM
// =====================================

class EventBus {
    constructor() {
        this.events = {};
        this.onceEvents = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        return () => this.off(event, callback);
    }
    
    once(event, callback) {
        if (!this.onceEvents[event]) {
            this.onceEvents[event] = [];
        }
        this.onceEvents[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            const index = this.events[event].indexOf(callback);
            if (index > -1) {
                this.events[event].splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        // Regular events
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event handler error for ${event}:`, error);
                }
            });
        }
        
        // Once events
        if (this.onceEvents[event]) {
            this.onceEvents[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Once event handler error for ${event}:`, error);
                }
            });
            delete this.onceEvents[event];
        }
    }
    
    clear() {
        this.events = {};
        this.onceEvents = {};
    }
}

// =====================================
// ERROR RESILIENCE SYSTEM
// =====================================

class SafeSystemWrapper {
    constructor(system, name, fallbackFn = null) {
        this.system = system;
        this.name = name;
        this.fallback = fallbackFn;
        this.errorCount = 0;
        this.maxErrors = 3;
        this.isDisabled = false;
        this.lastError = null;
    }
    
    safeCall(method, ...args) {
        if (this.isDisabled) {
            return this.fallback ? this.fallback(method, ...args) : null;
        }
        
        try {
            if (typeof this.system[method] === 'function') {
                return this.system[method](...args);
            } else {
                throw new Error(`Method ${method} not found in ${this.name}`);
            }
        } catch (error) {
            this.errorCount++;
            this.lastError = error;
            
            console.warn(`System error in ${this.name}.${method}:`, error);
            
            if (this.errorCount >= this.maxErrors) {
                console.error(`System ${this.name} disabled due to repeated errors`);
                this.isDisabled = true;
                
                // Emit system failure event
                if (window.gameEvents) {
                    window.gameEvents.emit('system:failure', {
                        system: this.name,
                        method: method,
                        error: error
                    });
                }
            }
            
            return this.fallback ? this.fallback(method, ...args) : null;
        }
    }
    
    reset() {
        this.errorCount = 0;
        this.isDisabled = false;
        this.lastError = null;
    }
    
    getStatus() {
        return {
            name: this.name,
            isDisabled: this.isDisabled,
            errorCount: this.errorCount,
            lastError: this.lastError
        };
    }
}

// =====================================
// DEBUG DASHBOARD SYSTEM
// =====================================

class DebugDashboard {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            memoryUsage: 0
        };
        this.fpsHistory = [];
        this.maxHistory = 100;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startMetricsCollection();
        
        // Debug commands
        this.commands = {
            'help': () => this.showHelp(),
            'fps': () => this.toggleFPS(),
            'pool': () => this.showPoolStats(),
            'clear': () => this.clearLog(),
            'systems': () => this.showSystemStatus(),
            'spawn': (type, count = 1) => this.spawnObjects(type, count)
        };
    }
    
    initializeElements() {
        this.dashboard = document.getElementById('debugDashboard');
        this.closeBtn = document.getElementById('closeDebug');
        this.tabs = document.querySelectorAll('.debug-tab');
        this.panels = document.querySelectorAll('.debug-panel');
        
        // Metrics elements
        this.fpsDisplay = document.getElementById('debugFPS');
        this.frameTimeDisplay = document.getElementById('debugFrameTime');
        this.drawCallsDisplay = document.getElementById('debugDrawCalls');
        this.memoryDisplay = document.getElementById('debugMemory');
        this.chart = document.getElementById('debugChart');
        this.chartCtx = this.chart.getContext('2d');
        
        // Object counters
        this.particleCount = document.getElementById('debugParticleCount');
        this.obstacleCount = document.getElementById('debugObstacleCount');
        this.powerupCount = document.getElementById('debugPowerupCount');
        this.pooledCount = document.getElementById('debugPooledCount');
        
        // Console elements
        this.logDisplay = document.getElementById('debugLog');
        this.inputField = document.getElementById('debugInput');
    }
    
    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.hide());
        
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Console input
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.inputField.value);
                this.inputField.value = '';
            }
        });
        
        // Keyboard shortcut: Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggle();
                e.preventDefault();
            }
        });
        
        // URL parameter: ?debug=1
        if (window.location.search.includes('debug=1')) {
            this.show();
        }
    }
    
    startMetricsCollection() {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        const updateMetrics = () => {
            const now = performance.now();
            const deltaTime = now - this.lastFrameTime;
            
            this.frameCount++;
            this.metrics.frameTime = deltaTime;
            
            // Update FPS every second
            if (this.frameCount % 60 === 0) {
                this.metrics.fps = Math.round(1000 / deltaTime);
                this.fpsHistory.push(this.metrics.fps);
                
                if (this.fpsHistory.length > this.maxHistory) {
                    this.fpsHistory.shift();
                }
                
                this.updateDisplay();
                this.drawFPSChart();
            }
            
            this.lastFrameTime = now;
            
            if (this.isVisible) {
                requestAnimationFrame(updateMetrics);
            }
        };
        
        updateMetrics();
    }
    
    updateDisplay() {
        if (!this.isVisible) return;
        
        this.fpsDisplay.textContent = this.metrics.fps;
        this.frameTimeDisplay.textContent = `${this.metrics.frameTime.toFixed(1)}ms`;
        this.drawCallsDisplay.textContent = this.metrics.drawCalls;
        
        // Memory usage (rough estimate)
        if (performance.memory) {
            const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
            this.memoryDisplay.textContent = `${memoryMB}MB`;
        }
        
        // Object counts
        if (this.game.particles) {
            this.particleCount.textContent = this.game.particles.length;
        }
        if (this.game.obstacles) {
            this.obstacleCount.textContent = this.game.obstacles.length;
        }
        if (this.game.powerups) {
            this.powerupCount.textContent = this.game.powerups.length;
        }
        
        // Pool stats
        if (this.game.objectPools) {
            let totalPooled = 0;
            Object.values(this.game.objectPools).forEach(pool => {
                totalPooled += pool.inUse.length;
            });
            this.pooledCount.textContent = totalPooled;
        }
        
        // ANALYTICS TAB UPDATE
        this.updateAnalyticsDisplay();
    }
    
    updateAnalyticsDisplay() {
        if (!this.game.analytics) return;
        
        const analytics = this.game.analytics;
        const funMetrics = analytics.funMetrics;
        const predictions = analytics.predictions;
        const playStyles = analytics.behaviorPatterns.playStyles;
        
        // Update Fun Metrics Progress Bars
        const funScore = analytics.getOverallFunScore();
        this.updateProgressBar('funScore', funScore, funScore.toFixed(1));
        this.updateProgressBar('engagement', funMetrics.engagementScore, funMetrics.engagementScore.toFixed(1));
        this.updateProgressBar('flowState', funMetrics.flowStateScore, funMetrics.flowStateScore.toFixed(1));
        this.updateProgressBar('frustration', funMetrics.frustrationLevel, funMetrics.frustrationLevel.toFixed(1));
        
        // Update Play Style Percentages
        const totalStyle = playStyles.aggressive + playStyles.explorer + playStyles.achiever || 1;
        document.getElementById('aggressiveStyle').textContent = `${(playStyles.aggressive / totalStyle * 100).toFixed(0)}%`;
        document.getElementById('explorerStyle').textContent = `${(playStyles.explorer / totalStyle * 100).toFixed(0)}%`;
        document.getElementById('achieverStyle').textContent = `${(playStyles.achiever / totalStyle * 100).toFixed(0)}%`;
        
        // Update Predictions
        document.getElementById('churnRisk').textContent = `${predictions.churnRisk.toFixed(0)}%`;
        document.getElementById('optimalDifficulty').textContent = predictions.optimalChallengeLevel.toFixed(1);
    }
    
    updateProgressBar(id, value, textValue) {
        const fillElement = document.getElementById(id);
        const valueElement = document.getElementById(id + 'Value');
        
        if (fillElement) {
            fillElement.style.width = `${Math.min(100, Math.max(0, value))}%`;
        }
        if (valueElement) {
            valueElement.textContent = textValue;
        }
    }
    
    drawFPSChart() {
        if (!this.chartCtx || this.fpsHistory.length < 2) return;
        
        const width = this.chart.width;
        const height = this.chart.height;
        
        this.chartCtx.clearRect(0, 0, width, height);
        
        // Draw grid
        this.chartCtx.strokeStyle = '#333';
        this.chartCtx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            this.chartCtx.beginPath();
            this.chartCtx.moveTo(0, y);
            this.chartCtx.lineTo(width, y);
            this.chartCtx.stroke();
        }
        
        // Draw FPS line
        this.chartCtx.strokeStyle = '#4ecdc4';
        this.chartCtx.lineWidth = 2;
        this.chartCtx.beginPath();
        
        const maxFPS = 60;
        const stepX = width / (this.maxHistory - 1);
        
        this.fpsHistory.forEach((fps, index) => {
            const x = index * stepX;
            const y = height - (fps / maxFPS) * height;
            
            if (index === 0) {
                this.chartCtx.moveTo(x, y);
            } else {
                this.chartCtx.lineTo(x, y);
            }
        });
        
        this.chartCtx.stroke();
    }
    
    switchTab(tabName) {
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.panels.forEach(panel => panel.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`debug${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
    }
    
    executeCommand(command) {
        this.log(`> ${command}`, 'info');
        
        const [cmd, ...args] = command.split(' ');
        
        if (this.commands[cmd]) {
            try {
                const result = this.commands[cmd](...args);
                if (result) {
                    this.log(result, 'info');
                }
            } catch (error) {
                this.log(`Error: ${error.message}`, 'error');
            }
        } else {
            this.log(`Unknown command: ${cmd}. Type 'help' for available commands.`, 'warn');
        }
    }
    
    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.logDisplay.appendChild(entry);
        this.logDisplay.scrollTop = this.logDisplay.scrollHeight;
        
        // Limit log entries
        while (this.logDisplay.children.length > 100) {
            this.logDisplay.removeChild(this.logDisplay.firstChild);
        }
    }
    
    showHelp() {
        const commands = Object.keys(this.commands).join(', ');
        this.log(`Available commands: ${commands}`);
        return null;
    }
    
    toggleFPS() {
        // Implementation would toggle FPS display
        this.log('FPS display toggled');
        return null;
    }
    
    showPoolStats() {
        if (!this.game.objectPools) {
            return 'No object pools found';
        }
        
        Object.entries(this.game.objectPools).forEach(([name, pool]) => {
            const stats = pool.getStats();
            this.log(`${name}: ${stats.inUse}/${stats.total} (${(stats.efficiency * 100).toFixed(1)}% efficiency)`);
        });
        
        return null;
    }
    
    clearLog() {
        this.logDisplay.innerHTML = '';
        return null;
    }
    
    showSystemStatus() {
        // Implementation would show system status
        this.log('All systems operational');
        return null;
    }
    
    spawnObjects(type, count) {
        // Implementation would spawn test objects
        this.log(`Spawned ${count} ${type} objects for testing`);
        return null;
    }
    
    show() {
        this.isVisible = true;
        this.dashboard.classList.remove('hidden');
        this.startMetricsCollection();
        this.log('Debug dashboard opened');
    }
    
    hide() {
        this.isVisible = false;
        this.dashboard.classList.add('hidden');
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// =====================================
// ADVANCED GAME ANALYTICS & FUN METRICS
// =====================================

class GameAnalytics {
    constructor(game) {
        this.game = game;
        this.sessionStart = Date.now();
        this.currentSession = {
            sessionId: this.generateSessionId(),
            startTime: this.sessionStart,
            totalPlayTime: 0,
            gamesPlayed: 0,
            highestScore: 0,
            totalDistance: 0,
            totalJumps: 0,
            totalCollisions: 0,
            powerupsCollected: 0,
            achievementsUnlocked: 0
        };
        
        // FUN FACTOR METRICS
        this.funMetrics = {
            engagementScore: 0,      // 0-100 how engaged the player is
            flowStateScore: 0,       // 0-100 optimal challenge level
            frustrationLevel: 0,     // 0-100 frustration indicator
            masteryProgression: 0,   // 0-100 skill improvement
            socialConnection: 0,     // 0-100 sharing/competition engagement
            meaningfulness: 0        // 0-100 sense of progression/achievement
        };
        
        // BEHAVIOR PATTERNS
        this.behaviorPatterns = {
            averageSessionLength: 0,
            retryRate: 0,               // How often player restarts after game over
            quitPoints: [],             // Where players typically quit
            difficultyPreference: 'normal',
            playStyles: {
                aggressive: 0,          // Risk-taking behavior
                conservative: 0,        // Safe play style  
                explorer: 0,           // Tries different mechanics
                achiever: 0            // Achievement-focused
            },
            emotionalStates: {
                excitement: 0,         // High-energy gameplay moments
                focus: 0,              // Deep concentration periods
                frustration: 0,        // Repeated failures
                satisfaction: 0        // Goal completion
            }
        };
        
        // REAL-TIME TRACKING
        this.realTimeMetrics = {
            currentStreak: 0,
            actionsPer10Seconds: [],
            flowStateActive: false,
            frustratingMoments: [],
            excitingMoments: [],
            lastActionTime: 0,
            reactionTimes: []
        };
        
        // PREDICTION MODELS
        this.predictions = {
            churnRisk: 0,              // Likelihood to stop playing (0-100)
            nextSessionLength: 0,       // Predicted next session duration
            difficultyToleranceMax: 5,  // Max difficulty before frustration
            optimalChallengeLevel: 3    // Current optimal difficulty
        };
        
        this.initializeTracking();
        this.startAnalytics();
    }
    
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    initializeTracking() {
        // Load previous analytics data
        const savedData = localStorage.getItem('gameAnalytics');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            this.behaviorPatterns = { ...this.behaviorPatterns, ...parsed.behaviorPatterns };
        }
        
        // Set up event listeners for behavior tracking
        this.setupEventTracking();
    }
    
    setupEventTracking() {
        // Track all major game events
        window.gameEvents.on('player:jump', () => this.trackAction('jump'));
        window.gameEvents.on('player:slide', () => this.trackAction('slide'));
        window.gameEvents.on('player:collision', (data) => this.trackCollision(data));
        window.gameEvents.on('powerup:collected', (data) => this.trackPowerupCollection(data));
        window.gameEvents.on('achievement:unlocked', (data) => this.trackAchievement(data));
        window.gameEvents.on('player:levelup', (data) => this.trackLevelUp(data));
        window.gameEvents.on('game:start', () => this.trackGameStart());
        window.gameEvents.on('game:over', (data) => this.trackGameOver(data));
        window.gameEvents.on('game:restart', () => this.trackRestart());
    }
    
    startAnalytics() {
        // Real-time analytics update every second
        setInterval(() => {
            this.updateRealTimeMetrics();
            this.calculateFunMetrics();
            this.updatePredictions();
            this.detectEmotionalStates();
        }, 1000);
        
        // Save analytics data every 30 seconds
        setInterval(() => {
            this.saveAnalyticsData();
        }, 30000);
    }
    
    trackAction(actionType) {
        const now = Date.now();
        const reactionTime = now - this.realTimeMetrics.lastActionTime;
        
        if (this.realTimeMetrics.lastActionTime > 0 && reactionTime < 2000) {
            this.realTimeMetrics.reactionTimes.push(reactionTime);
            if (this.realTimeMetrics.reactionTimes.length > 20) {
                this.realTimeMetrics.reactionTimes.shift();
            }
        }
        
        this.realTimeMetrics.lastActionTime = now;
        
        // Track actions per 10 seconds for engagement measurement
        const currentWindow = Math.floor(now / 10000);
        if (!this.realTimeMetrics.actionsPer10Seconds[currentWindow]) {
            this.realTimeMetrics.actionsPer10Seconds[currentWindow] = 0;
        }
        this.realTimeMetrics.actionsPer10Seconds[currentWindow]++;
        
        // Determine play style
        if (actionType === 'jump') {
            this.currentSession.totalJumps++;
            this.behaviorPatterns.playStyles.aggressive += 0.1;
        }
        
        // Detect flow state based on consistent action timing
        this.detectFlowState();
    }
    
    trackCollision(data) {
        this.currentSession.totalCollisions++;
        this.realTimeMetrics.currentStreak = 0;
        
        // Mark as frustrating moment if multiple collisions in short time
        const recentCollisions = this.realTimeMetrics.frustratingMoments.filter(
            moment => Date.now() - moment.time < 30000
        ).length;
        
        if (recentCollisions >= 2) {
            this.realTimeMetrics.frustratingMoments.push({
                time: Date.now(),
                type: 'repeated_collision',
                context: data
            });
            this.behaviorPatterns.emotionalStates.frustration += 5;
        }
        
        // Track quit points
        const gameProgress = this.game.distance || 0;
        this.behaviorPatterns.quitPoints.push(gameProgress);
    }
    
    trackPowerupCollection(data) {
        this.currentSession.powerupsCollected++;
        this.realTimeMetrics.currentStreak++;
        
        // Mark as exciting moment
        this.realTimeMetrics.excitingMoments.push({
            time: Date.now(),
            type: 'powerup_collection',
            context: data
        });
        
        this.behaviorPatterns.emotionalStates.excitement += 2;
        this.behaviorPatterns.playStyles.explorer += 0.1;
    }
    
    trackAchievement(data) {
        this.currentSession.achievementsUnlocked++;
        this.behaviorPatterns.emotionalStates.satisfaction += 10;
        this.behaviorPatterns.playStyles.achiever += 1;
        
        // Big exciting moment
        this.realTimeMetrics.excitingMoments.push({
            time: Date.now(),
            type: 'achievement_unlock',
            context: data
        });
    }
    
    trackGameStart() {
        this.currentSession.gamesPlayed++;
        this.realTimeMetrics.currentStreak = 0;
        
        // Calculate retry rate
        if (this.currentSession.gamesPlayed > 1) {
            this.behaviorPatterns.retryRate = (this.currentSession.gamesPlayed - 1) / this.currentSession.gamesPlayed;
        }
    }
    
    trackGameOver(data) {
        const score = data.score || 0;
        const distance = data.distance || 0;
        
        this.currentSession.highestScore = Math.max(this.currentSession.highestScore, score);
        this.currentSession.totalDistance += distance;
        
        // Analyze game over context for frustration detection
        if (distance < 500 && this.currentSession.totalCollisions > 3) {
            this.behaviorPatterns.emotionalStates.frustration += 3;
        } else if (score > this.currentSession.highestScore * 0.8) {
            this.behaviorPatterns.emotionalStates.satisfaction += 5;
        }
    }
    
    trackRestart() {
        // Quick restart indicates engagement
        this.behaviorPatterns.emotionalStates.focus += 2;
        this.funMetrics.engagementScore += 2;
    }
    
    updateRealTimeMetrics() {
        const now = Date.now();
        this.currentSession.totalPlayTime = now - this.sessionStart;
        
        // Clean old data
        this.realTimeMetrics.frustratingMoments = this.realTimeMetrics.frustratingMoments.filter(
            moment => now - moment.time < 300000 // Keep last 5 minutes
        );
        this.realTimeMetrics.excitingMoments = this.realTimeMetrics.excitingMoments.filter(
            moment => now - moment.time < 300000
        );
    }
    
    calculateFunMetrics() {
        // ENGAGEMENT SCORE (0-100)
        const sessionMinutes = this.currentSession.totalPlayTime / (1000 * 60);
        const gamesPerMinute = this.currentSession.gamesPlayed / Math.max(sessionMinutes, 0.1);
        this.funMetrics.engagementScore = Math.min(100, gamesPerMinute * 20 + this.behaviorPatterns.retryRate * 30);
        
        // FLOW STATE SCORE (0-100)
        const avgReactionTime = this.realTimeMetrics.reactionTimes.reduce((a, b) => a + b, 0) / 
                               Math.max(this.realTimeMetrics.reactionTimes.length, 1);
        const flowIndicator = avgReactionTime > 100 && avgReactionTime < 500 ? 1 : 0;
        this.funMetrics.flowStateScore = flowIndicator * 60 + (this.realTimeMetrics.flowStateActive ? 40 : 0);
        
        // FRUSTRATION LEVEL (0-100)
        const recentFrustration = this.realTimeMetrics.frustratingMoments.length * 20;
        const overallFrustration = this.behaviorPatterns.emotionalStates.frustration;
        this.funMetrics.frustrationLevel = Math.min(100, recentFrustration + overallFrustration);
        
        // MASTERY PROGRESSION (0-100)
        const improvementRate = this.currentSession.highestScore / Math.max(this.currentSession.gamesPlayed, 1);
        this.funMetrics.masteryProgression = Math.min(100, improvementRate / 10);
        
        // MEANINGFULNESS (0-100)
        const achievementFactor = this.currentSession.achievementsUnlocked * 15;
        const progressionFactor = this.behaviorPatterns.emotionalStates.satisfaction;
        this.funMetrics.meaningfulness = Math.min(100, achievementFactor + progressionFactor);
    }
    
    detectFlowState() {
        const actions = this.realTimeMetrics.actionsPer10Seconds;
        const recentActions = actions.slice(-3); // Last 30 seconds
        
        // Flow state: consistent activity, good reaction times, low frustration
        const consistentActivity = recentActions.every(count => count >= 3 && count <= 12);
        const goodReactions = this.realTimeMetrics.reactionTimes.slice(-5).every(time => time < 800);
        const lowFrustration = this.realTimeMetrics.frustratingMoments.length < 2;
        
        this.realTimeMetrics.flowStateActive = consistentActivity && goodReactions && lowFrustration;
        
        if (this.realTimeMetrics.flowStateActive) {
            this.behaviorPatterns.emotionalStates.focus += 1;
        }
    }
    
    detectEmotionalStates() {
        const now = Date.now();
        
        // Excitement detection
        const recentExciting = this.realTimeMetrics.excitingMoments.filter(
            moment => now - moment.time < 60000
        ).length;
        if (recentExciting >= 2) {
            this.behaviorPatterns.emotionalStates.excitement += 3;
        }
        
        // Focus detection (sustained play without major interruptions)
        if (this.realTimeMetrics.flowStateActive) {
            this.behaviorPatterns.emotionalStates.focus += 1;
        }
        
        // Emotional state decay over time
        Object.keys(this.behaviorPatterns.emotionalStates).forEach(emotion => {
            this.behaviorPatterns.emotionalStates[emotion] *= 0.998; // Slow decay
        });
    }
    
    updatePredictions() {
        // CHURN RISK PREDICTION
        const frustrationWeight = this.funMetrics.frustrationLevel * 0.4;
        const engagementWeight = (100 - this.funMetrics.engagementScore) * 0.3;
        const sessionLengthWeight = (this.currentSession.totalPlayTime < 180000) ? 30 : 0; // < 3 minutes
        
        this.predictions.churnRisk = Math.min(100, frustrationWeight + engagementWeight + sessionLengthWeight);
        
        // OPTIMAL CHALLENGE LEVEL
        if (this.funMetrics.frustrationLevel > 60) {
            this.predictions.optimalChallengeLevel = Math.max(1, this.predictions.optimalChallengeLevel - 0.1);
        } else if (this.funMetrics.flowStateScore > 70 && this.funMetrics.frustrationLevel < 30) {
            this.predictions.optimalChallengeLevel = Math.min(10, this.predictions.optimalChallengeLevel + 0.1);
        }
        
        // NEXT SESSION LENGTH PREDICTION
        const avgSession = this.behaviorPatterns.averageSessionLength || this.currentSession.totalPlayTime;
        const engagementFactor = this.funMetrics.engagementScore / 100;
        this.predictions.nextSessionLength = avgSession * (0.5 + engagementFactor);
    }
    
    getOverallFunScore() {
        // Composite fun score (0-100)
        const weights = {
            engagement: 0.25,
            flowState: 0.20,
            frustration: -0.20, // Negative weight
            mastery: 0.15,
            meaningfulness: 0.20
        };
        
        let score = 0;
        score += this.funMetrics.engagementScore * weights.engagement;
        score += this.funMetrics.flowStateScore * weights.flowState;
        score += this.funMetrics.frustrationLevel * weights.frustration;
        score += this.funMetrics.masteryProgression * weights.mastery;
        score += this.funMetrics.meaningfulness * weights.meaningfulness;
        
        return Math.max(0, Math.min(100, score));
    }
    
    getAnalyticsReport() {
        return {
            session: this.currentSession,
            funMetrics: this.funMetrics,
            behaviorPatterns: this.behaviorPatterns,
            predictions: this.predictions,
            overallFunScore: this.getOverallFunScore(),
            recommendations: this.generateRecommendations()
        };
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (this.funMetrics.frustrationLevel > 60) {
            recommendations.push({
                type: 'difficulty_adjustment',
                message: 'Consider reducing difficulty or providing assistance',
                priority: 'high'
            });
        }
        
        if (this.funMetrics.engagementScore < 40) {
            recommendations.push({
                type: 'engagement_boost',
                message: 'Add more variety or rewards to increase engagement',
                priority: 'medium'
            });
        }
        
        if (this.predictions.churnRisk > 70) {
            recommendations.push({
                type: 'retention_risk',
                message: 'Player at high risk of leaving - consider intervention',
                priority: 'critical'
            });
        }
        
        if (this.funMetrics.flowStateScore > 80) {
            recommendations.push({
                type: 'flow_optimization',
                message: 'Player in optimal flow state - maintain current challenge',
                priority: 'low'
            });
        }
        
        return recommendations;
    }
    
    saveAnalyticsData() {
        const dataToSave = {
            behaviorPatterns: this.behaviorPatterns,
            sessionHistory: [this.currentSession],
            lastUpdate: Date.now()
        };
        
        localStorage.setItem('gameAnalytics', JSON.stringify(dataToSave));
    }
}

// =====================================
// DYNAMIC DIFFICULTY ADJUSTMENT
// =====================================

class DynamicDifficultyAdjustment {
    constructor(game, analytics) {
        this.game = game;
        this.analytics = analytics;
        this.adjustmentHistory = [];
        this.lastAdjustment = 0;
        this.baseSettings = {
            maxSpeed: game.maxSpeed,
            obstacleSpawnRate: 1.0,
            powerupSpawnRate: 1.0
        };
        
        this.startDDASystem();
    }
    
    startDDASystem() {
        // Check and adjust difficulty every 10 seconds
        setInterval(() => {
            this.evaluateAndAdjust();
        }, 10000);
    }
    
    evaluateAndAdjust() {
        const now = Date.now();
        if (now - this.lastAdjustment < 30000) return; // Minimum 30s between adjustments
        
        const funScore = this.analytics.getOverallFunScore();
        const frustration = this.analytics.funMetrics.frustrationLevel;
        const engagement = this.analytics.funMetrics.engagementScore;
        const flowState = this.analytics.funMetrics.flowStateScore;
        
        let adjustment = this.calculateAdjustment(funScore, frustration, engagement, flowState);
        
        if (Math.abs(adjustment) > 0.1) {
            this.applyDifficultyAdjustment(adjustment);
            this.lastAdjustment = now;
        }
    }
    
    calculateAdjustment(funScore, frustration, engagement, flowState) {
        // Too frustrating - make easier
        if (frustration > 70) {
            return -0.3;
        }
        
        // Too easy and player disengaged - make harder
        if (engagement < 40 && frustration < 20) {
            return 0.2;
        }
        
        // Perfect flow state - small increase to maintain challenge
        if (flowState > 80 && frustration < 30) {
            return 0.1;
        }
        
        // Overall fun score based adjustment
        if (funScore < 40) {
            return -0.2;
        } else if (funScore > 80) {
            return 0.1;
        }
        
        return 0; // No adjustment needed
    }
    
    applyDifficultyAdjustment(adjustment) {
        // Adjust max speed
        const newMaxSpeed = this.game.maxSpeed + (adjustment * 2);
        this.game.maxSpeed = Math.max(4, Math.min(15, newMaxSpeed));
        
        // Adjust obstacle spawn rate
        if (this.game.obstacleSpawnMultiplier) {
            const newSpawnRate = this.game.obstacleSpawnMultiplier + (adjustment * 0.5);
            this.game.obstacleSpawnMultiplier = Math.max(0.5, Math.min(3, newSpawnRate));
        }
        
        // Adjust powerup spawn rate (inverse relationship)
        if (adjustment < 0) { // Making easier
            // More powerups when making easier
            this.game.powerupSpawnBonus = (this.game.powerupSpawnBonus || 1) + 0.2;
        } else { // Making harder
            // Fewer powerups when making harder
            this.game.powerupSpawnBonus = Math.max(0.5, (this.game.powerupSpawnBonus || 1) - 0.1);
        }
        
        this.adjustmentHistory.push({
            time: Date.now(),
            adjustment: adjustment,
            reason: this.getAdjustmentReason(adjustment),
            gameState: {
                maxSpeed: this.game.maxSpeed,
                distance: this.game.distance,
                score: this.game.score
            }
        });
        
        // Notify player of adjustment
        this.notifyPlayer(adjustment);
        
        console.log(`DDA: Applied adjustment ${adjustment.toFixed(2)} - ${this.getAdjustmentReason(adjustment)}`);
    }
    
    getAdjustmentReason(adjustment) {
        if (adjustment < -0.2) return 'Reducing difficulty due to frustration';
        if (adjustment > 0.2) return 'Increasing difficulty for better engagement';
        if (adjustment > 0) return 'Small challenge increase to maintain flow';
        if (adjustment < 0) return 'Minor difficulty reduction';
        return 'Maintaining current difficulty';
    }
    
    notifyPlayer(adjustment) {
        let message = '';
        let color = '#4ecdc4';
        
        if (adjustment < -0.2) {
            message = '🎯 Difficulty adjusted to improve your experience!';
            color = '#2ecc71';
        } else if (adjustment > 0.2) {
            message = '⚡ Challenge increased - you\'re doing great!';
            color = '#f39c12';
        } else if (adjustment > 0) {
            message = '🔥 Perfect flow! Challenge slightly increased.';
            color = '#e74c3c';
        }
        
        if (message && this.game.showTemporaryMessage) {
            this.game.showTemporaryMessage(message, color, 3000);
        }
    }
}

// =====================================
// MODERN SETTINGS SYSTEM
// =====================================

class SettingsSystem {
    constructor(game) {
        this.game = game;
        this.settings = this.loadSettings();
        this.initializeElements();
        this.applySettings();
    }
    
    initializeElements() {
        this.panel = document.getElementById('settingsPanel');
        this.openBtn = document.getElementById('openSettings');
        this.closeBtn = document.getElementById('closeSettings');
        this.saveBtn = document.getElementById('saveSettings');
        this.resetBtn = document.getElementById('resetSettings');
        
        // Quality buttons
        this.qualityBtns = document.querySelectorAll('.quality-btn');
        
        // Toggle switches
        this.autoJumpToggle = document.getElementById('autoJumpToggle');
        this.particlesToggle = document.getElementById('particlesToggle');
        this.shakeToggle = document.getElementById('shakeToggle');
        this.fpsToggle = document.getElementById('fpsToggle');
        this.performanceModeToggle = document.getElementById('performanceModeToggle');
        this.reducedMotionToggle = document.getElementById('reducedMotionToggle');
        this.highContrastToggle = document.getElementById('highContrastToggle');
        
        // Select elements
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Event Listeners
        this.openBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.saveBtn.addEventListener('click', () => this.save());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Quality button listeners
        this.qualityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectQuality(e.target.dataset.quality));
        });
        
        // Toggle listeners
        this.autoJumpToggle.addEventListener('change', () => this.updateSetting('autoJump', this.autoJumpToggle.checked));
        this.particlesToggle.addEventListener('change', () => this.updateSetting('particles', this.particlesToggle.checked));
        this.shakeToggle.addEventListener('change', () => this.updateSetting('screenShake', this.shakeToggle.checked));
        this.fpsToggle.addEventListener('change', () => this.updateSetting('showFPS', this.fpsToggle.checked));
        this.performanceModeToggle.addEventListener('change', () => this.updateSetting('performanceMode', this.performanceModeToggle.checked));
        this.reducedMotionToggle.addEventListener('change', () => this.updateSetting('reducedMotion', this.reducedMotionToggle.checked));
        this.highContrastToggle.addEventListener('change', () => this.updateSetting('highContrast', this.highContrastToggle.checked));
        
        // Select listeners
        this.difficultySelect.addEventListener('change', () => this.updateSetting('difficulty', this.difficultySelect.value));
        
        // Close on backdrop click
        this.panel.querySelector('.settings-backdrop').addEventListener('click', () => this.close());
    }
    
    loadSettings() {
        const defaults = {
            difficulty: 'normal',
            autoJump: false,
            quality: 'medium',
            particles: true,
            screenShake: true,
            showFPS: false,
            performanceMode: false,
            reducedMotion: false,
            highContrast: false
        };
        
        const saved = localStorage.getItem('gameSettings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }
    
    applySettings() {
        // Apply difficulty
        if (this.settings.difficulty === 'easy') {
            this.game.maxSpeed = 6;
        } else if (this.settings.difficulty === 'hard') {
            this.game.maxSpeed = 12;
        }
        
        // Apply graphics quality
        if (this.game.adaptiveGraphics) {
            switch (this.settings.quality) {
                case 'low':
                    this.game.adaptiveGraphics.shadows = false;
                    this.game.adaptiveGraphics.advancedEffects = false;
                    this.game.adaptiveGraphics.postProcessing = false;
                    break;
                case 'medium':
                    this.game.adaptiveGraphics.shadows = true;
                    this.game.adaptiveGraphics.advancedEffects = false;
                    this.game.adaptiveGraphics.postProcessing = true;
                    break;
                case 'high':
                    this.game.adaptiveGraphics.shadows = true;
                    this.game.adaptiveGraphics.advancedEffects = true;
                    this.game.adaptiveGraphics.postProcessing = true;
                    break;
                case 'ultra':
                    this.game.adaptiveGraphics.shadows = true;
                    this.game.adaptiveGraphics.advancedEffects = true;
                    this.game.adaptiveGraphics.postProcessing = true;
                    this.game.adaptiveGraphics.particleCount = 1.5;
                    break;
            }
        }
        
        // Apply accessibility settings
        if (this.settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Update UI elements
        this.updateUI();
    }
    
    updateUI() {
        // Update difficulty select
        this.difficultySelect.value = this.settings.difficulty;
        
        // Update quality buttons
        this.qualityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.quality === this.settings.quality);
        });
        
        // Update toggles
        this.autoJumpToggle.checked = this.settings.autoJump;
        this.particlesToggle.checked = this.settings.particles;
        this.shakeToggle.checked = this.settings.screenShake;
        this.fpsToggle.checked = this.settings.showFPS;
        this.performanceModeToggle.checked = this.settings.performanceMode;
        this.reducedMotionToggle.checked = this.settings.reducedMotion;
        this.highContrastToggle.checked = this.settings.highContrast;
    }
    
    selectQuality(quality) {
        this.qualityBtns.forEach(btn => btn.classList.remove('active'));
        this.qualityBtns.forEach(btn => {
            if (btn.dataset.quality === quality) btn.classList.add('active');
        });
        this.updateSetting('quality', quality);
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.applySettings();
    }
    
    open() {
        this.panel.classList.remove('hidden');
        this.updateUI();
    }
    
    close() {
        this.panel.classList.add('hidden');
    }
    
    save() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        this.close();
        // Show confirmation
        if (this.game.showTemporaryMessage) {
            this.game.showTemporaryMessage('Settings Saved!', '#4ecdc4', 2000);
        }
    }
    
    reset() {
        this.settings = {
            difficulty: 'normal',
            autoJump: false,
            quality: 'medium',
            particles: true,
            screenShake: true,
            showFPS: false,
            performanceMode: false,
            reducedMotion: false,
            highContrast: false
        };
        this.applySettings();
        this.updateUI();
    }
}

// =====================================
// INTERACTIVE ONBOARDING SYSTEM
// =====================================

class OnboardingSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.isActive = false;
        this.steps = [
            {
                title: "Welcome to Endless Runner!",
                text: "Let's learn the basics. Tap the screen or press SPACE to jump!",
                spotlight: { element: 'gameCanvas', offset: { x: 0, y: 100 } },
                action: 'jump'
            },
            {
                title: "Perfect! Now try sliding",
                text: "Hold the screen or press DOWN arrow to slide under obstacles!",
                spotlight: { element: 'gameCanvas', offset: { x: 0, y: 200 } },
                action: 'slide'
            },
            {
                title: "Wall Running",
                text: "Some obstacles can be avoided by running on walls. Look for the green walls!",
                spotlight: { element: 'wallArea' },
                action: 'wall_run'
            },
            {
                title: "Collect Powerups",
                text: "Grab colorful powerups for special abilities! Gold coins give you currency to buy upgrades.",
                spotlight: { element: 'gameCanvas', offset: { x: 200, y: 150 } },
                action: 'powerup'
            },
            {
                title: "You're Ready!",
                text: "Great! Now you know the basics. Survive as long as possible and beat your high score!",
                spotlight: { element: 'gameCanvas' },
                action: 'complete'
            }
        ];
        
        this.initializeElements();
        this.checkFirstTime();
    }
    
    initializeElements() {
        this.overlay = document.getElementById('onboardingOverlay');
        this.spotlight = document.querySelector('.onboarding-spotlight');
        this.tooltip = document.querySelector('.onboarding-tooltip');
        this.title = document.getElementById('onboardingTitle');
        this.text = document.getElementById('onboardingText');
        this.nextBtn = document.getElementById('onboardingNext');
        this.skipBtn = document.getElementById('onboardingSkip');
        this.progressText = document.querySelector('.progress-text');
        this.dots = document.querySelectorAll('.dot');
        
        // Event Listeners
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.skipBtn.addEventListener('click', () => this.skip());
        
        // Listen for game actions
        this.setupActionListeners();
    }
    
    checkFirstTime() {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            // Start onboarding after a short delay
            setTimeout(() => this.start(), 1000);
        }
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.game.gameState = 'onboarding';
        this.overlay.classList.remove('hidden');
        this.showStep(0);
    }
    
    showStep(stepIndex) {
        const step = this.steps[stepIndex];
        
        // Update content
        this.title.textContent = step.title;
        this.text.textContent = step.text;
        this.progressText.textContent = `${stepIndex + 1} of ${this.steps.length}`;
        
        // Update progress dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === stepIndex);
        });
        
        // Position spotlight and tooltip
        this.positionSpotlight(step.spotlight);
        this.positionTooltip(step.spotlight);
        
        // Show/hide next button
        if (step.action === 'complete') {
            this.nextBtn.textContent = 'Start Playing!';
        } else {
            this.nextBtn.textContent = 'Next';
        }
    }
    
    positionSpotlight(spotlight) {
        if (!spotlight.element) return;
        
        const element = document.getElementById(spotlight.element) || document.querySelector(spotlight.element);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const containerRect = this.game.canvas.getBoundingClientRect();
        
        const x = rect.left - containerRect.left + (spotlight.offset?.x || 0);
        const y = rect.top - containerRect.top + (spotlight.offset?.y || 0);
        
        this.spotlight.style.left = `${x - 100}px`;
        this.spotlight.style.top = `${y - 100}px`;
    }
    
    positionTooltip(spotlight) {
        if (!spotlight.element) {
            // Default position
            this.tooltip.style.left = '50%';
            this.tooltip.style.top = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }
        
        const element = document.getElementById(spotlight.element) || document.querySelector(spotlight.element);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const containerRect = this.game.canvas.getBoundingClientRect();
        
        // Position tooltip to the side of the spotlight
        const x = rect.left - containerRect.left + (spotlight.offset?.x || 0);
        const y = rect.top - containerRect.top + (spotlight.offset?.y || 0);
        
        if (x > window.innerWidth / 2) {
            // Position to the left
            this.tooltip.style.left = `${x - 320}px`;
            this.tooltip.style.transform = 'translateY(-50%)';
        } else {
            // Position to the right
            this.tooltip.style.left = `${x + 220}px`;
            this.tooltip.style.transform = 'translateY(-50%)';
        }
        
        this.tooltip.style.top = `${y}px`;
    }
    
    setupActionListeners() {
        // Listen for jump
        document.addEventListener('keydown', (e) => {
            if (this.isActive && e.code === 'Space' && this.steps[this.currentStep].action === 'jump') {
                this.actionCompleted('jump');
            }
        });
        
        // Listen for slide
        document.addEventListener('keydown', (e) => {
            if (this.isActive && e.code === 'ArrowDown' && this.steps[this.currentStep].action === 'slide') {
                this.actionCompleted('slide');
            }
        });
        
        // Listen for mouse/touch
        this.game.canvas.addEventListener('click', () => {
            if (this.isActive && this.steps[this.currentStep].action === 'jump') {
                this.actionCompleted('jump');
            }
        });
    }
    
    actionCompleted(action) {
        // Highlight that action was successful
        this.nextBtn.style.background = '#4ecdc4';
        this.nextBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.nextBtn.style.background = '';
            this.nextBtn.style.transform = '';
        }, 500);
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.complete();
        }
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        this.isActive = false;
        this.overlay.classList.add('hidden');
        this.game.gameState = 'start';
        
        // Mark as seen
        localStorage.setItem('hasSeenOnboarding', 'true');
    }
}

// Initialize game and onboarding
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}