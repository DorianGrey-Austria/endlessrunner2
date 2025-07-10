/**
 * Level 7: Desert Storm
 * Harsh desert environment with sandstorms and ancient pyramids
 * 
 * @module Level7_Desert
 */

class Level7_Desert extends LevelBase {
    constructor() {
        super(7, 'Desert Storm', {
            // Visual settings
            fogColor: '#daa520',
            fogDensity: 0.03,
            skyColor: '#f4a460',
            ambientIntensity: 0.7,
            sunIntensity: 1.2,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.6,
            obstacleSpawnMultiplier: 1.6,
            collectibleSpawnMultiplier: 1.5,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['sandstorm', 'heatMirage', 'quicksand', 'ancientMysteries']
        });
        
        // Level-specific objects
        this.dunes = [];
        this.pyramids = [];
        this.sandstorms = [];
        this.cacti = [];
        this.mirages = [];
        this.oases = [];
        this.sandParticles = [];
        this.desertEffects = [];
    }
    
    /**
     * Create the desert environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create desert floor
        this.createDesertFloor();
        
        // Create sand dunes
        this.createSandDunes();
        
        // Create pyramids
        this.createPyramids();
        
        // Create desert vegetation
        this.createDesertVegetation();
        
        // Create sandstorms
        this.createSandstorms();
        
        // Create oases
        this.createOases();
        
        // Create heat mirages
        this.createHeatMirages();
        
        // Create desert atmosphere
        this.createDesertAtmosphere();
        
        console.log('[Level 7] Desert environment created');
    }
    
    /**
     * Create desert floor
     */
    createDesertFloor() {
        const sandGeometry = new THREE.PlaneGeometry(30, 1000);
        const sandMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xDAA520,
            emissive: 0xB8860B,
            emissiveIntensity: 0.1
        });
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.position.y = 0;
        sand.receiveShadow = true;
        this.environmentGroup.add(sand);
        
        // Add sand ripples
        this.createSandRipples();
    }
    
    /**
     * Create sand dunes
     */
    createSandDunes() {
        for (let i = 0; i < 60; i++) {
            const dune = this.createSandDune(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    0,
                    -i * 20 - Math.random() * 15
                ),
                2 + Math.random() * 8
            );
            
            this.dunes.push(dune);
            this.addDynamicObject(dune, {
                type: 'dune',
                shiftSpeed: 0.01 + Math.random() * 0.02,
                windEffect: true
            });
        }
    }
    
    /**
     * Create pyramids
     */
    createPyramids() {
        for (let i = 0; i < 5; i++) {
            const pyramid = this.createPyramid(
                new THREE.Vector3(
                    i % 2 === 0 ? -80 - Math.random() * 40 : 80 + Math.random() * 40,
                    0,
                    -i * 200 - 100
                ),
                10 + Math.random() * 20
            );
            
            this.pyramids.push(pyramid);
            this.environmentGroup.add(pyramid);
        }
    }
    
    /**
     * Create sandstorms
     */
    createSandstorms() {
        for (let i = 0; i < 8; i++) {
            const storm = this.createSandstorm(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    10 + Math.random() * 20,
                    -i * 100 - Math.random() * 50
                )
            );
            
            this.sandstorms.push(storm);
            this.environmentGroup.add(storm);
        }
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update sandstorms
        this.updateSandstorms(deltaTime, time);
        
        // Update sand particles
        this.updateSandParticles(deltaTime);
        
        // Update heat mirages
        this.updateHeatMirages(deltaTime, time);
        
        // Update dune shifting
        this.updateDuneShifting(deltaTime, time);
    }
    
    // Helper methods
    createSandDune(position, height) {
        const duneGeometry = new THREE.SphereGeometry(height, 12, 8);
        const duneMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xDEB887,
            emissive: 0xD2691E,
            emissiveIntensity: 0.05
        });
        const dune = new THREE.Mesh(duneGeometry, duneMaterial);
        dune.position.copy(position);
        dune.scale.y = 0.3;
        dune.receiveShadow = true;
        dune.castShadow = true;
        
        this.environmentGroup.add(dune);
        return dune;
    }
    
    createPyramid(position, size) {
        const pyramidGeometry = new THREE.ConeGeometry(size, size * 1.2, 4);
        const pyramidMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xCD853F,
            emissive: 0x8B4513,
            emissiveIntensity: 0.1
        });
        const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramid.position.copy(position);
        pyramid.position.y = size * 0.6;
        pyramid.rotation.y = Math.PI / 4;
        pyramid.castShadow = true;
        pyramid.receiveShadow = true;
        
        return pyramid;
    }
    
    createSandstorm(position) {
        const stormGroup = new THREE.Group();
        
        // Storm cloud
        const cloudGeometry = new THREE.SphereGeometry(15, 12, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xD2691E,
            transparent: true,
            opacity: 0.4
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        stormGroup.add(cloud);
        
        // Add sand particles
        for (let i = 0; i < 50; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 30
                ),
                {
                    size: 0.02 + Math.random() * 0.03,
                    color: 0xDAA520,
                    lifetime: 10.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 1,
                        (Math.random() - 0.5) * 2
                    )
                }
            );
        }
        
        stormGroup.position.copy(position);
        stormGroup.userData = {
            type: 'sandstorm',
            intensity: 0.5 + Math.random() * 0.5,
            moveSpeed: 0.5 + Math.random() * 1
        };
        
        return stormGroup;
    }
    
    createSandRipples() {
        for (let i = 0; i < 200; i++) {
            const rippleGeometry = new THREE.PlaneGeometry(2, 0.1);
            const rippleMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xF4A460,
                emissive: 0xDAA520,
                emissiveIntensity: 0.05
            });
            const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
            ripple.position.set(
                (Math.random() - 0.5) * 50,
                0.01,
                -Math.random() * 1000
            );
            ripple.rotation.x = -Math.PI / 2;
            ripple.rotation.z = Math.random() * Math.PI;
            this.environmentGroup.add(ripple);
        }
    }
    
    createDesertVegetation() {
        for (let i = 0; i < 30; i++) {
            const cactus = this.createCactus(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    0,
                    -i * 30 - Math.random() * 20
                )
            );
            this.cacti.push(cactus);
            this.environmentGroup.add(cactus);
        }
    }
    
    createCactus(position) {
        const cactusGroup = new THREE.Group();
        
        // Main trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4);
        const cactusMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22
        });
        const trunk = new THREE.Mesh(trunkGeometry, cactusMaterial);
        trunk.position.y = 2;
        cactusGroup.add(trunk);
        
        // Arms
        for (let i = 0; i < 2; i++) {
            const armGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
            const arm = new THREE.Mesh(armGeometry, cactusMaterial);
            arm.position.set(
                i === 0 ? -1 : 1,
                3,
                0
            );
            arm.rotation.z = (i === 0 ? 1 : -1) * Math.PI / 2;
            cactusGroup.add(arm);
        }
        
        cactusGroup.position.copy(position);
        return cactusGroup;
    }
    
    createOases() {
        for (let i = 0; i < 3; i++) {
            const oasis = this.createOasis(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    0,
                    -i * 300 - 150
                )
            );
            this.oases.push(oasis);
            this.environmentGroup.add(oasis);
        }
    }
    
    createOasis(position) {
        const oasisGroup = new THREE.Group();
        
        // Water
        const waterGeometry = new THREE.CylinderGeometry(8, 8, 0.2);
        const waterMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4682B4,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y = 0.1;
        oasisGroup.add(water);
        
        // Palm trees around oasis
        for (let i = 0; i < 5; i++) {
            const palmGroup = new THREE.Group();
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 4;
            palmGroup.add(trunk);
            
            // Fronds
            const frondGeometry = new THREE.PlaneGeometry(6, 1);
            const frondMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x228B22,
                side: THREE.DoubleSide
            });
            
            for (let j = 0; j < 6; j++) {
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                frond.position.y = 8;
                frond.rotation.y = j * Math.PI / 3;
                frond.rotation.z = -0.3;
                palmGroup.add(frond);
            }
            
            palmGroup.position.set(
                Math.cos(i * Math.PI * 2/5) * 10,
                0,
                Math.sin(i * Math.PI * 2/5) * 10
            );
            oasisGroup.add(palmGroup);
        }
        
        oasisGroup.position.copy(position);
        return oasisGroup;
    }
    
    createHeatMirages() {
        for (let i = 0; i < 15; i++) {
            const mirage = this.createHeatMirage(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    0.5,
                    -i * 60 - Math.random() * 30
                )
            );
            this.mirages.push(mirage);
            this.environmentGroup.add(mirage);
        }
    }
    
    createHeatMirage(position) {
        const mirageGeometry = new THREE.PlaneGeometry(10, 5);
        const mirageMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const mirage = new THREE.Mesh(mirageGeometry, mirageMaterial);
        mirage.position.copy(position);
        mirage.rotation.x = -Math.PI / 2;
        
        mirage.userData = {
            type: 'mirage',
            waveSpeed: 2 + Math.random() * 3,
            intensity: 0.1 + Math.random() * 0.2
        };
        
        return mirage;
    }
    
    createDesertAtmosphere() {
        // Add sand particles in air
        for (let i = 0; i < 100; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 20,
                    -Math.random() * 1000
                ),
                {
                    size: 0.01,
                    color: 0xDAA520,
                    lifetime: 20.0,
                    velocity: new THREE.Vector3(
                        1 + Math.random() * 2,
                        (Math.random() - 0.5) * 0.1,
                        0
                    )
                }
            );
        }
    }
    
    updateSandstorms(deltaTime, time) {
        this.sandstorms.forEach(storm => {
            // Move storm
            storm.position.x += storm.userData.moveSpeed * deltaTime;
            
            // Opacity variation
            const cloud = storm.children[0];
            if (cloud && cloud.material) {
                cloud.material.opacity = 
                    storm.userData.intensity * (0.5 + Math.sin(time * 2) * 0.2);
            }
        });
    }
    
    updateSandParticles(deltaTime) {
        // Sand particles are handled by base particle system
    }
    
    updateHeatMirages(deltaTime, time) {
        this.mirages.forEach(mirage => {
            if (mirage.userData.type === 'mirage') {
                mirage.material.opacity = 
                    mirage.userData.intensity + 
                    Math.sin(time * mirage.userData.waveSpeed) * 0.1;
            }
        });
    }
    
    updateDuneShifting(deltaTime, time) {
        this.dunes.forEach(dune => {
            if (dune.userData.windEffect) {
                dune.position.x += Math.sin(time * dune.userData.shiftSpeed) * 0.01;
            }
        });
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        this.dunes = [];
        this.pyramids = [];
        this.sandstorms = [];
        this.cacti = [];
        this.mirages = [];
        this.oases = [];
        this.sandParticles = [];
        this.desertEffects = [];
        
        console.log('[Level 7] Desert level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level7 = new Level7_Desert();
    window.LevelManagerPro.registerLevel(level7);
    console.log('[Level 7] Desert level registered');
}

// Export for use
window.Level7_Desert = Level7_Desert;