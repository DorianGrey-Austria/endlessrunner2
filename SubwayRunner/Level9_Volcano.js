/**
 * Level 9: Volcano
 * Dangerous volcanic environment with lava flows and ash clouds
 * 
 * @module Level9_Volcano
 */

class Level9_Volcano extends LevelBase {
    constructor() {
        super(9, 'Volcano', {
            // Visual settings
            fogColor: '#4a1a1a',
            fogDensity: 0.035,
            skyColor: '#661111',
            ambientIntensity: 0.8,
            sunIntensity: 0.9,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.8,
            obstacleSpawnMultiplier: 1.8,
            collectibleSpawnMultiplier: 1.7,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['lavaFlows', 'ashFall', 'heatWaves', 'earthquakes']
        });
        
        // Level-specific objects
        this.lavaFlows = [];
        this.volcanoes = [];
        this.ashClouds = [];
        this.lavaRocks = [];
        this.geysers = [];
        this.crystalFormations = [];
        this.volcanoEffects = [];
    }
    
    /**
     * Create the volcano environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create volcanic ground
        this.createVolcanicGround();
        
        // Create volcanoes
        this.createVolcanoes();
        
        // Create lava flows
        this.createLavaFlows();
        
        // Create ash clouds
        this.createAshClouds();
        
        // Create lava geysers
        this.createLavaGeysers();
        
        // Create volcanic rocks
        this.createVolcanicRocks();
        
        // Create volcano atmosphere
        this.createVolcanoAtmosphere();
        
        console.log('[Level 9] Volcano environment created');
    }
    
    /**
     * Create volcanic ground
     */
    createVolcanicGround() {
        const groundGeometry = new THREE.PlaneGeometry(30, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2F1B14,
            emissive: 0xFF4500,
            emissiveIntensity: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.environmentGroup.add(ground);
        
        // Add lava cracks
        this.createLavaCracks();
    }
    
    /**
     * Create volcanoes
     */
    createVolcanoes() {
        for (let i = 0; i < 6; i++) {
            const volcano = this.createVolcano(
                new THREE.Vector3(
                    i % 2 === 0 ? -80 - Math.random() * 40 : 80 + Math.random() * 40,
                    0,
                    -i * 150 - 100
                ),
                15 + Math.random() * 25
            );
            
            this.volcanoes.push(volcano);
            this.environmentGroup.add(volcano);
        }
    }
    
    /**
     * Create lava flows
     */
    createLavaFlows() {
        for (let i = 0; i < 40; i++) {
            const flow = this.createLavaFlow(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    0.5,
                    -i * 25 - Math.random() * 20
                )
            );
            
            this.lavaFlows.push(flow);
            this.addDynamicObject(flow, {
                type: 'lavaFlow',
                flowSpeed: 0.5 + Math.random() * 1,
                bubbleRate: 2 + Math.random() * 3,
                temperature: 1200 + Math.random() * 300
            });
        }
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update lava flows
        this.updateLavaFlows(deltaTime, time);
        
        // Update ash clouds
        this.updateAshClouds(deltaTime, time);
        
        // Update geysers
        this.updateGeysers(deltaTime, time);
        
        // Update volcanic effects
        this.updateVolcanicEffects(deltaTime, time);
    }
    
    // Helper methods
    createVolcano(position, height) {
        const volcanoGroup = new THREE.Group();
        
        // Main cone
        const coneGeometry = new THREE.ConeGeometry(height * 0.8, height, 12);
        const coneMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2F1B14,
            emissive: 0x8B0000,
            emissiveIntensity: 0.1
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.y = height / 2;
        cone.castShadow = true;
        volcanoGroup.add(cone);
        
        // Crater
        const craterGeometry = new THREE.CylinderGeometry(height * 0.3, height * 0.4, 2);
        const craterMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.y = height - 1;
        volcanoGroup.add(crater);
        
        // Lava glow
        const glowGeometry = new THREE.CylinderGeometry(height * 0.5, height * 0.6, 4);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6600,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = height + 2;
        volcanoGroup.add(glow);
        
        // Add volcanic smoke
        this.addVolcanicSmoke(volcanoGroup, height);
        
        volcanoGroup.position.copy(position);
        return volcanoGroup;
    }
    
    createLavaFlow(position) {
        const flowGroup = new THREE.Group();
        
        // Main lava stream
        const flowGeometry = new THREE.PlaneGeometry(3, 15);
        const flowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8
        });
        const flow = new THREE.Mesh(flowGeometry, flowMaterial);
        flow.rotation.x = -Math.PI / 2;
        flow.position.y = 0.1;
        flowGroup.add(flow);
        
        // Lava bubbles
        for (let i = 0; i < 8; i++) {
            const bubbleGeometry = new THREE.SphereGeometry(0.2, 8, 6);
            const bubbleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF6600,
                emissive: 0xFF6600,
                emissiveIntensity: 0.6
            });
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.set(
                (Math.random() - 0.5) * 2.5,
                0.3,
                (Math.random() - 0.5) * 14
            );
            bubble.userData = {
                popTime: Math.random() * 3,
                baseScale: 0.5 + Math.random() * 0.5
            };
            flowGroup.add(bubble);
        }
        
        flowGroup.position.copy(position);
        this.environmentGroup.add(flowGroup);
        return flowGroup;
    }
    
    createAshClouds() {
        for (let i = 0; i < 15; i++) {
            const cloud = this.createAshCloud(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    15 + Math.random() * 20,
                    -i * 60 - Math.random() * 40
                )
            );
            
            this.ashClouds.push(cloud);
            this.environmentGroup.add(cloud);
        }
    }
    
    createAshCloud(position) {
        const cloudGroup = new THREE.Group();
        
        // Main cloud mass
        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(5 + Math.random() * 8, 12, 8);
            const cloudMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x2F2F2F,
                transparent: true,
                opacity: 0.4
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 15
            );
            cloudGroup.add(cloud);
        }
        
        cloudGroup.position.copy(position);
        cloudGroup.userData = {
            type: 'ashCloud',
            driftSpeed: 0.3 + Math.random() * 0.5,
            expansionRate: 0.01
        };
        
        return cloudGroup;
    }
    
    createLavaGeysers() {
        for (let i = 0; i < 12; i++) {
            const geyser = this.createLavaGeyser(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    0,
                    -i * 80 - Math.random() * 40
                )
            );
            
            this.geysers.push(geyser);
            this.addDynamicObject(geyser, {
                type: 'geyser',
                eruptionInterval: 3 + Math.random() * 5,
                lastEruption: 0,
                eruptionDuration: 1 + Math.random() * 2
            });
        }
    }
    
    createLavaGeyser(position) {
        const geyserGroup = new THREE.Group();
        
        // Ground vent
        const ventGeometry = new THREE.CylinderGeometry(0.5, 0.8, 0.5);
        const ventMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2F1B14,
            emissive: 0xFF4500,
            emissiveIntensity: 0.3
        });
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.y = 0.25;
        geyserGroup.add(vent);
        
        // Lava spout (initially hidden)
        const spoutGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
        const spoutMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
        });
        const spout = new THREE.Mesh(spoutGeometry, spoutMaterial);
        spout.position.y = 4;
        spout.visible = false;
        geyserGroup.add(spout);
        
        geyserGroup.position.copy(position);
        this.environmentGroup.add(geyserGroup);
        return geyserGroup;
    }
    
    createVolcanicRocks() {
        for (let i = 0; i < 80; i++) {
            const rock = this.createVolcanicRock(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    0,
                    -i * 12 - Math.random() * 10
                )
            );
            
            this.lavaRocks.push(rock);
            this.environmentGroup.add(rock);
        }
    }
    
    createVolcanicRock(position) {
        const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 2);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2F1B14,
            emissive: 0x8B0000,
            emissiveIntensity: 0.05
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.copy(position);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        return rock;
    }
    
    createLavaCracks() {
        for (let i = 0; i < 60; i++) {
            const crackGeometry = new THREE.PlaneGeometry(0.3, 8);
            const crackMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF4500,
                emissive: 0xFF4500,
                emissiveIntensity: 0.8
            });
            const crack = new THREE.Mesh(crackGeometry, crackMaterial);
            crack.position.set(
                (Math.random() - 0.5) * 50,
                0.02,
                -Math.random() * 1000
            );
            crack.rotation.x = -Math.PI / 2;
            crack.rotation.z = Math.random() * Math.PI;
            this.environmentGroup.add(crack);
        }
    }
    
    createVolcanoAtmosphere() {
        // Add floating ash particles
        for (let i = 0; i < 150; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 40,
                    -Math.random() * 1000
                ),
                {
                    size: 0.02 + Math.random() * 0.03,
                    color: 0x2F2F2F,
                    lifetime: 25.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        0.2 + Math.random() * 0.3,
                        (Math.random() - 0.5) * 0.2
                    )
                }
            );
        }
        
        // Add lava sparks
        for (let i = 0; i < 100; i++) {
            const spark = this.createSpark(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    Math.random() * 10,
                    -Math.random() * 1000
                )
            );
            
            this.volcanoEffects.push(spark);
            this.environmentGroup.add(spark);
        }
    }
    
    createSpark(position) {
        const sparkGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6600,
            emissive: 0xFF6600,
            emissiveIntensity: 1.0
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(position);
        
        spark.userData = {
            type: 'spark',
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 2
            ),
            lifetime: 2 + Math.random() * 3,
            maxLifetime: 2 + Math.random() * 3
        };
        
        return spark;
    }
    
    addVolcanicSmoke(volcano, height) {
        for (let i = 0; i < 20; i++) {
            const smokeGeometry = new THREE.SphereGeometry(1 + Math.random() * 2, 8, 6);
            const smokeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x2F2F2F,
                transparent: true,
                opacity: 0.2
            });
            const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
            smoke.position.set(
                (Math.random() - 0.5) * 5,
                height + 5 + i * 2,
                (Math.random() - 0.5) * 5
            );
            volcano.add(smoke);
        }
    }
    
    updateLavaFlows(deltaTime, time) {
        this.lavaFlows.forEach(flow => {
            // Update lava bubbles
            flow.children.forEach((child, index) => {
                if (index > 0 && child.userData.popTime !== undefined) {
                    child.userData.popTime -= deltaTime;
                    
                    if (child.userData.popTime <= 0) {
                        // Pop bubble
                        child.scale.setScalar(0.1);
                        child.userData.popTime = 2 + Math.random() * 3;
                    } else if (child.userData.popTime > 2) {
                        // Grow bubble
                        const scale = child.userData.baseScale * (3 - child.userData.popTime);
                        child.scale.setScalar(scale);
                    }
                }
            });
            
            // Flowing effect
            const mainFlow = flow.children[0];
            if (mainFlow && mainFlow.material) {
                mainFlow.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.2;
            }
        });
    }
    
    updateAshClouds(deltaTime, time) {
        this.ashClouds.forEach(cloud => {
            if (cloud.userData.driftSpeed) {
                cloud.position.x += Math.sin(time * cloud.userData.driftSpeed) * 0.02;
                cloud.position.z += cloud.userData.driftSpeed * deltaTime;
            }
            
            // Expansion
            cloud.children.forEach(part => {
                if (part.scale.x < 2) {
                    part.scale.addScalar(cloud.userData.expansionRate * deltaTime);
                }
            });
        });
    }
    
    updateGeysers(deltaTime, time) {
        this.geysers.forEach(geyser => {
            geyser.userData.lastEruption += deltaTime;
            
            const spout = geyser.children[1];
            if (geyser.userData.lastEruption > geyser.userData.eruptionInterval) {
                // Eruption
                if (spout) {
                    spout.visible = true;
                    spout.scale.y = Math.min(1, (geyser.userData.lastEruption - geyser.userData.eruptionInterval) / geyser.userData.eruptionDuration);
                }
                
                if (geyser.userData.lastEruption > geyser.userData.eruptionInterval + geyser.userData.eruptionDuration) {
                    // End eruption
                    if (spout) spout.visible = false;
                    geyser.userData.lastEruption = 0;
                }
            }
        });
    }
    
    updateVolcanicEffects(deltaTime, time) {
        this.volcanoEffects.forEach(effect => {
            if (effect.userData.type === 'spark') {
                // Move spark
                effect.position.add(
                    effect.userData.velocity.clone().multiplyScalar(deltaTime)
                );
                
                // Apply gravity
                effect.userData.velocity.y -= 9.8 * deltaTime;
                
                // Update lifetime
                effect.userData.lifetime -= deltaTime;
                
                // Fade out
                if (effect.material) {
                    effect.material.opacity = Math.max(0, effect.userData.lifetime / effect.userData.maxLifetime);
                }
                
                // Reset if expired
                if (effect.userData.lifetime <= 0) {
                    effect.position.y = Math.random() * 10;
                    effect.userData.velocity.set(
                        (Math.random() - 0.5) * 2,
                        1 + Math.random() * 3,
                        (Math.random() - 0.5) * 2
                    );
                    effect.userData.lifetime = effect.userData.maxLifetime;
                }
            }
        });
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        this.lavaFlows = [];
        this.volcanoes = [];
        this.ashClouds = [];
        this.lavaRocks = [];
        this.geysers = [];
        this.crystalFormations = [];
        this.volcanoEffects = [];
        
        console.log('[Level 9] Volcano level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level9 = new Level9_Volcano();
    window.LevelManagerPro.registerLevel(level9);
    console.log('[Level 9] Volcano level registered');
}

// Export for use
window.Level9_Volcano = Level9_Volcano;