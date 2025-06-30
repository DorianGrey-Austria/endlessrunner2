class WorldSystem {
    constructor(game) {
        this.game = game;
        this.currentWorld = 'cyberpunk';
        this.worlds = this.loadWorldConfigurations();
    }
    
    loadWorldConfigurations() {
        return {
            cyberpunk: {
                name: "Cyber City",
                environment: {
                    skyColor: 0x001122,
                    fogColor: 0x000011,
                    fogDensity: 0.01,
                    ambientLight: { color: 0x404040, intensity: 0.3 },
                    directionalLight: { color: 0xffffff, intensity: 0.8 },
                    pointLight: { color: 0x00ff88, intensity: 0.5 }
                },
                ground: {
                    color: 0x333333,
                    opacity: 0.8,
                    emissive: 0x001122
                },
                obstacles: {
                    types: ['normal', 'tall', 'neon'],
                    colors: {
                        normal: 0xff4444,
                        tall: 0xffaa00,
                        neon: 0x00ffff
                    },
                    materials: {
                        normal: 'basic',
                        tall: 'lambert',
                        neon: 'neon'
                    }
                },
                patterns: ['single', 'double', 'tunnel', 'zigzag', 'gap_left', 'gap_right', 'gap_center'],
                effects: {
                    particleColor: 0x00ff88,
                    trailColor: 0xff6b6b,
                    glowIntensity: 1.5
                },
                progression: {
                    speedIncrease: 0.1,
                    difficultyScale: 1.2,
                    patternComplexity: 1.0
                }
            },
            
            forest: {
                name: "Mystic Forest",
                environment: {
                    skyColor: 0x0d4c2c,
                    fogColor: 0x2d5c3c,
                    fogDensity: 0.015,
                    ambientLight: { color: 0x90c190, intensity: 0.4 },
                    directionalLight: { color: 0xffffaa, intensity: 0.7 },
                    pointLight: { color: 0x90ff90, intensity: 0.4 }
                },
                ground: {
                    color: 0x4d6c2d,
                    opacity: 0.9,
                    emissive: 0x0d2c0d
                },
                obstacles: {
                    types: ['normal', 'tall', 'tree'],
                    colors: {
                        normal: 0x8b4513,
                        tall: 0x654321,
                        tree: 0x228b22
                    },
                    materials: {
                        normal: 'lambert',
                        tall: 'lambert',
                        tree: 'basic'
                    }
                },
                patterns: ['single', 'double', 'gap_left', 'gap_right', 'gap_center'],
                effects: {
                    particleColor: 0x90ff90,
                    trailColor: 0x90c190,
                    glowIntensity: 0.8
                },
                progression: {
                    speedIncrease: 0.08,
                    difficultyScale: 1.0,
                    patternComplexity: 0.8
                }
            },
            
            space: {
                name: "Deep Space",
                environment: {
                    skyColor: 0x000010,
                    fogColor: 0x000020,
                    fogDensity: 0.005,
                    ambientLight: { color: 0x202040, intensity: 0.2 },
                    directionalLight: { color: 0xaaaaff, intensity: 1.0 },
                    pointLight: { color: 0x4040ff, intensity: 0.8 }
                },
                ground: {
                    color: 0x111122,
                    opacity: 0.7,
                    emissive: 0x000011
                },
                obstacles: {
                    types: ['normal', 'tall', 'crystal'],
                    colors: {
                        normal: 0x4444ff,
                        tall: 0xaa44ff,
                        crystal: 0xff44aa
                    },
                    materials: {
                        normal: 'basic',
                        tall: 'basic',
                        crystal: 'neon'
                    }
                },
                patterns: ['single', 'double', 'tunnel', 'zigzag', 'gap_left', 'gap_right', 'gap_center'],
                effects: {
                    particleColor: 0x4040ff,
                    trailColor: 0xaa44ff,
                    glowIntensity: 2.0
                },
                progression: {
                    speedIncrease: 0.12,
                    difficultyScale: 1.5,
                    patternComplexity: 1.3
                }
            }
        };
    }
    
    setWorld(worldId) {
        if (!this.worlds[worldId]) {
            console.warn(`World ${worldId} not found, using default`);
            worldId = 'cyberpunk';
        }
        
        this.currentWorld = worldId;
        this.applyWorldSettings(this.worlds[worldId]);
    }
    
    applyWorldSettings(world) {
        this.updateEnvironment(world.environment);
        this.updateGround(world.ground);
        this.game.obstaclePatterns = world.patterns;
        this.updateEffects(world.effects);
    }
    
    updateEnvironment(env) {
        this.game.renderer.setClearColor(env.skyColor);
        this.game.scene.fog.color.setHex(env.fogColor);
        this.game.scene.fog.density = env.fogDensity;
        
        const lights = this.game.scene.children.filter(child => child.isLight);
        lights.forEach(light => {
            if (light.type === 'AmbientLight') {
                light.color.setHex(env.ambientLight.color);
                light.intensity = env.ambientLight.intensity;
            } else if (light.type === 'DirectionalLight') {
                light.color.setHex(env.directionalLight.color);
                light.intensity = env.directionalLight.intensity;
            } else if (light.type === 'PointLight') {
                light.color.setHex(env.pointLight.color);
                light.intensity = env.pointLight.intensity;
            }
        });
    }
    
    updateGround(groundConfig) {
        const ground = this.game.scene.getObjectByName('ground');
        if (ground) {
            ground.material.color.setHex(groundConfig.color);
            ground.material.opacity = groundConfig.opacity;
            if (groundConfig.emissive) {
                ground.material.emissive.setHex(groundConfig.emissive);
            }
        }
    }
    
    updateEffects(effects) {
        this.game.currentWorldEffects = effects;
    }
    
    getObstacleConfig(type) {
        const world = this.worlds[this.currentWorld];
        return {
            color: world.obstacles.colors[type] || world.obstacles.colors.normal,
            material: world.obstacles.materials[type] || world.obstacles.materials.normal
        };
    }
    
    createObstacleMaterial(type) {
        const config = this.getObstacleConfig(type);
        
        switch(config.material) {
            case 'neon':
                return new THREE.MeshBasicMaterial({ 
                    color: config.color,
                    emissive: config.color,
                    emissiveIntensity: 0.3
                });
            case 'lambert':
                return new THREE.MeshLambertMaterial({ color: config.color });
            default:
                return new THREE.MeshBasicMaterial({ color: config.color });
        }
    }
    
    getAvailableWorlds() {
        return Object.keys(this.worlds).map(id => ({
            id: id,
            name: this.worlds[id].name
        }));
    }
    
    getCurrentWorldConfig() {
        return this.worlds[this.currentWorld];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldSystem;
}