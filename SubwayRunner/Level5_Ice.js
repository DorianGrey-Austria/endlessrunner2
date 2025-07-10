/**
 * Level 5: Ice Crystal
 * Frozen landscape with crystal formations and aurora effects
 * 
 * @module Level5_Ice
 */

class Level5_Ice extends LevelBase {
    constructor() {
        super(5, 'Ice Crystal', {
            // Visual settings
            fogColor: '#e0f0ff',
            fogDensity: 0.018,
            skyColor: '#87ceeb',
            ambientIntensity: 0.5,
            sunIntensity: 0.7,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.4,
            obstacleSpawnMultiplier: 1.4,
            collectibleSpawnMultiplier: 1.3,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['slipperyIce', 'aurora', 'snowfall', 'crystalReflections']
        });
        
        // Level-specific objects
        this.iceFormations = [];
        this.crystals = [];
        this.auroraEffects = [];
        this.snowflakes = [];
        this.iceCaves = [];
        this.frozenTrees = [];
        this.glacierWalls = [];
        this.iceEffects = [];
    }
    
    /**
     * Create the ice environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create ice surface
        this.createIceSurface();
        
        // Create crystal formations
        this.createCrystalFormations();
        
        // Create ice caves
        this.createIceCaves();
        
        // Create frozen trees
        this.createFrozenTrees();
        
        // Create glacier walls
        this.createGlacierWalls();
        
        // Create aurora effects
        this.createAuroraEffects();
        
        // Create snowfall
        this.createSnowfall();
        
        // Create ice atmosphere
        this.createIceAtmosphere();
        
        console.log('[Level 5] Ice environment created');
    }
    
    /**
     * Create ice surface
     */
    createIceSurface() {
        // Main ice path
        const iceGeometry = new THREE.PlaneGeometry(14, 1000);
        const iceMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.9
        });
        const ice = new THREE.Mesh(iceGeometry, iceMaterial);
        ice.rotation.x = -Math.PI / 2;
        ice.position.y = 0;
        ice.receiveShadow = true;
        this.environmentGroup.add(ice);
        
        // Ice cracks
        this.createIceCracks();
        
        // Frozen puddles
        this.createFrozenPuddles();
    }
    
    /**
     * Create ice cracks
     */
    createIceCracks() {
        const crackGeometry = new THREE.BoxGeometry(0.1, 0.02, 8);
        const crackMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4682B4,
            emissive: 0x1E90FF,
            emissiveIntensity: 0.2
        });
        
        for (let i = 0; i < 80; i++) {
            const crack = new THREE.Mesh(crackGeometry, crackMaterial);
            crack.position.set(
                (Math.random() - 0.5) * 12,
                0.01,
                -i * 12 - Math.random() * 8
            );
            crack.rotation.y = Math.random() * Math.PI;
            this.environmentGroup.add(crack);
        }
    }
    
    /**
     * Create frozen puddles
     */
    createFrozenPuddles() {
        const puddleGeometry = new THREE.CylinderGeometry(2, 2, 0.05);
        const puddleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 30; i++) {
            const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial);
            puddle.position.set(
                (Math.random() - 0.5) * 20,
                0.03,
                -i * 30 - Math.random() * 15
            );
            puddle.receiveShadow = true;
            this.environmentGroup.add(puddle);
        }
    }
    
    /**
     * Create crystal formations
     */
    createCrystalFormations() {
        for (let i = 0; i < 60; i++) {
            const crystal = this.createCrystal(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    0,
                    -i * 20 - Math.random() * 15
                ),
                1 + Math.random() * 4
            );
            
            this.crystals.push(crystal);
            this.addDynamicObject(crystal, {
                type: 'crystal',
                glowSpeed: 0.8 + Math.random() * 0.6,
                rotationSpeed: 0.01 + Math.random() * 0.02,
                baseIntensity: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    /**
     * Create crystal
     */
    createCrystal(position, scale) {
        const crystalGroup = new THREE.Group();
        
        // Main crystal
        const crystalGeometry = new THREE.ConeGeometry(0.8, 4, 6);
        const crystalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00FFFF,
            emissive: 0x006666,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.7
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = 2;
        crystal.castShadow = true;
        crystalGroup.add(crystal);
        
        // Crystal base
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        crystalGroup.add(base);
        
        // Add crystal reflections
        this.addCrystalReflections(crystalGroup);
        
        // Add smaller crystals around
        this.addSmallerCrystals(crystalGroup);
        
        crystalGroup.position.copy(position);
        crystalGroup.scale.setScalar(scale);
        
        this.environmentGroup.add(crystalGroup);
        return crystalGroup;
    }
    
    /**
     * Create ice caves
     */
    createIceCaves() {
        for (let i = 0; i < 8; i++) {
            const cave = this.createIceCave(
                new THREE.Vector3(
                    i % 2 === 0 ? -60 - Math.random() * 20 : 60 + Math.random() * 20,
                    0,
                    -i * 120 - 60
                )
            );
            
            this.iceCaves.push(cave);
            this.environmentGroup.add(cave);
        }
    }
    
    /**
     * Create ice cave
     */
    createIceCave(position) {
        const caveGroup = new THREE.Group();
        
        // Cave entrance
        const entranceGeometry = new THREE.SphereGeometry(8, 16, 16);
        const entranceMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x4682B4,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
        entrance.position.y = 4;
        entrance.scale.z = 0.5;
        caveGroup.add(entrance);
        
        // Cave interior glow
        const glowGeometry = new THREE.SphereGeometry(6, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 4;
        glow.position.z = -4;
        caveGroup.add(glow);
        
        // Ice stalactites
        this.addStalactites(caveGroup);
        
        caveGroup.position.copy(position);
        caveGroup.userData = {
            type: 'iceCave',
            glowIntensity: 0.2 + Math.random() * 0.3
        };
        
        return caveGroup;
    }
    
    /**
     * Create frozen trees
     */
    createFrozenTrees() {
        for (let i = 0; i < 40; i++) {
            const tree = this.createFrozenTree(
                new THREE.Vector3(
                    i % 2 === 0 ? -30 - Math.random() * 40 : 30 + Math.random() * 40,
                    0,
                    -i * 25 - Math.random() * 15
                )
            );
            
            this.frozenTrees.push(tree);
            this.addDynamicObject(tree, {
                type: 'frozenTree',
                swaySpeed: 0.3 + Math.random() * 0.2,
                swayAmplitude: 0.01 + Math.random() * 0.02,
                iceGlitter: true
            });
        }
    }
    
    /**
     * Create frozen tree
     */
    createFrozenTree(position) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.8, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            emissive: 0x654321,
            emissiveIntensity: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Frozen branches
        const branchGeometry = new THREE.CylinderGeometry(0.1, 0.2, 3);
        const branchMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        
        for (let i = 0; i < 8; i++) {
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            branch.position.set(
                Math.cos(i * Math.PI / 4) * 3,
                6 + Math.random() * 2,
                Math.sin(i * Math.PI / 4) * 3
            );
            branch.rotation.z = Math.PI / 2;
            branch.castShadow = true;
            treeGroup.add(branch);
            
            // Add ice coating
            this.addIceCoating(branch);
        }
        
        // Add icicles
        this.addIcicles(treeGroup);
        
        treeGroup.position.copy(position);
        return treeGroup;
    }
    
    /**
     * Create glacier walls
     */
    createGlacierWalls() {
        for (let i = 0; i < 20; i++) {
            const wall = this.createGlacierWall(
                new THREE.Vector3(
                    i % 2 === 0 ? -80 - Math.random() * 30 : 80 + Math.random() * 30,
                    0,
                    -i * 50 - Math.random() * 25
                )
            );
            
            this.glacierWalls.push(wall);
            this.environmentGroup.add(wall);
        }
    }
    
    /**
     * Create glacier wall
     */
    createGlacierWall(position) {
        const wallGroup = new THREE.Group();
        
        // Main wall
        const wallGeometry = new THREE.BoxGeometry(15, 20, 5);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.8
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.y = 10;
        wall.castShadow = true;
        wall.receiveShadow = true;
        wallGroup.add(wall);
        
        // Ice layers
        for (let i = 0; i < 3; i++) {
            const layerGeometry = new THREE.BoxGeometry(16, 2, 5.5);
            const layerMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x4682B4,
                emissive: 0x1E90FF,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.6
            });
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.y = 4 + i * 6;
            wallGroup.add(layer);
        }
        
        // Add ice texture details
        this.addIceTextureDetails(wallGroup);
        
        wallGroup.position.copy(position);
        return wallGroup;
    }
    
    /**
     * Create aurora effects
     */
    createAuroraEffects() {
        for (let i = 0; i < 5; i++) {
            const aurora = this.createAurora(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    40 + Math.random() * 20,
                    -i * 200 - 100
                )
            );
            
            this.auroraEffects.push(aurora);
            this.environmentGroup.add(aurora);
        }
    }
    
    /**
     * Create aurora
     */
    createAurora(position) {
        const auroraGroup = new THREE.Group();
        
        // Aurora curtains
        const colors = [0x00FF00, 0x0080FF, 0xFF0080, 0x8000FF];
        
        for (let i = 0; i < 4; i++) {
            const curtainGeometry = new THREE.PlaneGeometry(50, 30);
            const curtainMaterial = new THREE.MeshBasicMaterial({ 
                color: colors[i],
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            const curtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
            curtain.position.set(
                (i - 2) * 10,
                0,
                Math.sin(i * Math.PI / 2) * 5
            );
            curtain.rotation.x = Math.PI / 6;
            auroraGroup.add(curtain);
        }
        
        auroraGroup.position.copy(position);
        auroraGroup.userData = {
            type: 'aurora',
            waveSpeed: 0.5 + Math.random() * 0.3,
            intensityVariation: 0.1 + Math.random() * 0.2
        };
        
        return auroraGroup;
    }
    
    /**
     * Create snowfall
     */
    createSnowfall() {
        for (let i = 0; i < 300; i++) {
            const snowflake = this.createSnowflake(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 60 + 20,
                    -Math.random() * 1000
                )
            );
            
            this.snowflakes.push(snowflake);
            this.environmentGroup.add(snowflake);
        }
    }
    
    /**
     * Create snowflake
     */
    createSnowflake(position) {
        const snowflakeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const snowflakeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        const snowflake = new THREE.Mesh(snowflakeGeometry, snowflakeMaterial);
        snowflake.position.copy(position);
        
        snowflake.userData = {
            type: 'snowflake',
            fallSpeed: 0.5 + Math.random() * 1.5,
            driftSpeed: 0.1 + Math.random() * 0.2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            baseY: position.y
        };
        
        return snowflake;
    }
    
    /**
     * Create ice atmosphere
     */
    createIceAtmosphere() {
        // Add ice particles
        for (let i = 0; i < 100; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    Math.random() * 40,
                    -Math.random() * 800
                ),
                {
                    size: 0.02,
                    color: 0xE0FFFF,
                    lifetime: 15.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        -0.1,
                        0
                    ),
                    fadeOut: true
                }
            );
        }
        
        // Add frost breath effect
        this.createFrostBreath();
    }
    
    /**
     * Create frost breath effect
     */
    createFrostBreath() {
        for (let i = 0; i < 20; i++) {
            const breath = this.createBreathPuff(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 30,
                    1 + Math.random() * 3,
                    -i * 50 - Math.random() * 20
                )
            );
            
            this.iceEffects.push(breath);
            this.environmentGroup.add(breath);
        }
    }
    
    /**
     * Create breath puff
     */
    createBreathPuff(position) {
        const breathGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const breathMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.3
        });
        const breath = new THREE.Mesh(breathGeometry, breathMaterial);
        breath.position.copy(position);
        
        breath.userData = {
            type: 'breath',
            expansionSpeed: 0.5,
            fadeSpeed: 0.3,
            lifetime: 2.0,
            maxLifetime: 2.0
        };
        
        return breath;
    }
    
    /**
     * Initialize special mechanics
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Add slippery surface mechanics
        this.initializeSlipperyMechanics();
        
        // Add temperature effects
        this.initializeTemperatureEffects();
        
        // Add crystal resonance
        this.initializeCrystalResonance();
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update crystal glow
        this.updateCrystalGlow(deltaTime, time);
        
        // Update aurora effects
        this.updateAuroraEffects(deltaTime, time);
        
        // Update snowfall
        this.updateSnowfall(deltaTime, gameState);
        
        // Update ice effects
        this.updateIceEffects(deltaTime, time);
        
        // Update frozen tree swaying
        this.updateFrozenTreeSwaying(deltaTime, time);
    }
    
    /**
     * Update crystal glow
     */
    updateCrystalGlow(deltaTime, time) {
        this.crystals.forEach(crystal => {
            if (crystal.userData.glowSpeed) {
                const mainCrystal = crystal.children[0];
                if (mainCrystal && mainCrystal.material) {
                    mainCrystal.material.emissiveIntensity = 
                        crystal.userData.baseIntensity + 
                        Math.sin(time * crystal.userData.glowSpeed) * 0.2;
                }
            }
            
            if (crystal.userData.rotationSpeed) {
                crystal.rotation.y += crystal.userData.rotationSpeed * deltaTime;
            }
        });
    }
    
    /**
     * Update aurora effects
     */
    updateAuroraEffects(deltaTime, time) {
        this.auroraEffects.forEach(aurora => {
            aurora.children.forEach((curtain, index) => {
                if (curtain.material) {
                    curtain.material.opacity = 
                        0.1 + Math.sin(time * aurora.userData.waveSpeed + index) * 
                        aurora.userData.intensityVariation;
                    
                    // Wave motion
                    curtain.position.y = Math.sin(time * aurora.userData.waveSpeed + index * 0.5) * 2;
                }
            });
        });
    }
    
    /**
     * Update snowfall
     */
    updateSnowfall(deltaTime, gameState) {
        this.snowflakes.forEach(snowflake => {
            // Falling motion
            snowflake.position.y -= snowflake.userData.fallSpeed * deltaTime;
            
            // Drift motion
            snowflake.position.x += Math.sin(Date.now() * 0.001) * snowflake.userData.driftSpeed * deltaTime;
            
            // Rotation
            snowflake.rotation.y += snowflake.userData.rotationSpeed * deltaTime;
            
            // Reset if fallen too far
            if (snowflake.position.y < -5) {
                snowflake.position.y = snowflake.userData.baseY + Math.random() * 10;
                snowflake.position.x = (Math.random() - 0.5) * 200;
            }
        });
    }
    
    /**
     * Update ice effects
     */
    updateIceEffects(deltaTime, time) {
        this.iceEffects.forEach(effect => {
            if (effect.userData.type === 'breath') {
                // Expand breath puff
                effect.scale.addScalar(effect.userData.expansionSpeed * deltaTime);
                
                // Fade out
                effect.userData.lifetime -= deltaTime;
                if (effect.material) {
                    effect.material.opacity = Math.max(0, effect.userData.lifetime / effect.userData.maxLifetime * 0.3);
                }
                
                // Reset if expired
                if (effect.userData.lifetime <= 0) {
                    effect.scale.setScalar(1);
                    effect.userData.lifetime = effect.userData.maxLifetime;
                }
            }
        });
    }
    
    /**
     * Update frozen tree swaying
     */
    updateFrozenTreeSwaying(deltaTime, time) {
        this.frozenTrees.forEach(tree => {
            if (tree.userData.swaySpeed) {
                tree.rotation.z = Math.sin(time * tree.userData.swaySpeed) * tree.userData.swayAmplitude;
            }
        });
    }
    
    /**
     * Helper methods
     */
    addCrystalReflections(crystal) {
        // Add internal light reflections
        const reflectionGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const reflectionMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.4
        });
        
        for (let i = 0; i < 3; i++) {
            const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
            reflection.position.set(
                (Math.random() - 0.5) * 1.5,
                1 + Math.random() * 2,
                (Math.random() - 0.5) * 1.5
            );
            crystal.add(reflection);
        }
    }
    
    addSmallerCrystals(mainCrystal) {
        for (let i = 0; i < 4; i++) {
            const smallCrystalGeometry = new THREE.ConeGeometry(0.3, 1.5, 6);
            const smallCrystalMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x00FFFF,
                emissive: 0x006666,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.6
            });
            const smallCrystal = new THREE.Mesh(smallCrystalGeometry, smallCrystalMaterial);
            smallCrystal.position.set(
                Math.cos(i * Math.PI / 2) * 2,
                0.75,
                Math.sin(i * Math.PI / 2) * 2
            );
            mainCrystal.add(smallCrystal);
        }
    }
    
    addStalactites(cave) {
        for (let i = 0; i < 8; i++) {
            const stalactiteGeometry = new THREE.ConeGeometry(0.3, 3, 6);
            const stalactiteMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xE0FFFF,
                emissive: 0x4682B4,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.8
            });
            const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
            stalactite.position.set(
                (Math.random() - 0.5) * 12,
                8 - Math.random() * 2,
                (Math.random() - 0.5) * 8
            );
            stalactite.rotation.x = Math.PI;
            cave.add(stalactite);
        }
    }
    
    addIceCoating(branch) {
        const coatingGeometry = new THREE.CylinderGeometry(0.15, 0.25, 3.2);
        const coatingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xE0FFFF,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const coating = new THREE.Mesh(coatingGeometry, coatingMaterial);
        coating.position.copy(branch.position);
        coating.rotation.copy(branch.rotation);
        branch.parent.add(coating);
    }
    
    addIcicles(tree) {
        for (let i = 0; i < 12; i++) {
            const icicleGeometry = new THREE.ConeGeometry(0.05, 1 + Math.random() * 2, 6);
            const icicleMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xE0FFFF,
                emissive: 0x87CEEB,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.9
            });
            const icicle = new THREE.Mesh(icicleGeometry, icicleMaterial);
            icicle.position.set(
                (Math.random() - 0.5) * 6,
                7 + Math.random() * 2,
                (Math.random() - 0.5) * 6
            );
            icicle.rotation.x = Math.PI;
            tree.add(icicle);
        }
    }
    
    addIceTextureDetails(wall) {
        // Add ice formation details
        for (let i = 0; i < 10; i++) {
            const detailGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const detailMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x4682B4,
                emissive: 0x1E90FF,
                emissiveIntensity: 0.15,
                transparent: true,
                opacity: 0.7
            });
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 20,
                2.8
            );
            detail.scale.set(
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 0.5,
                0.2 + Math.random() * 0.3
            );
            wall.add(detail);
        }
    }
    
    initializeSlipperyMechanics() {
        this.slipperyMechanics = {
            friction: 0.1,
            slideDistance: 2.0,
            recoveryTime: 0.5
        };
    }
    
    initializeTemperatureEffects() {
        this.temperatureEffects = {
            ambientTemp: -20,
            windChill: -5,
            frostFormation: true,
            breathVisible: true
        };
    }
    
    initializeCrystalResonance() {
        this.crystalResonance = {
            frequency: 440,
            amplitude: 0.3,
            harmonics: true,
            echoEffect: true
        };
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.iceFormations = [];
        this.crystals = [];
        this.auroraEffects = [];
        this.snowflakes = [];
        this.iceCaves = [];
        this.frozenTrees = [];
        this.glacierWalls = [];
        this.iceEffects = [];
        
        console.log('[Level 5] Ice level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level5 = new Level5_Ice();
    window.LevelManagerPro.registerLevel(level5);
    console.log('[Level 5] Ice level registered');
}

// Export for use
window.Level5_Ice = Level5_Ice;