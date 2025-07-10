/**
 * Level 10: Crystal Dimension
 * Ultimate level with crystalline structures and reality distortions
 * 
 * @module Level10_Crystal
 */

class Level10_Crystal extends LevelBase {
    constructor() {
        super(10, 'Crystal Dimension', {
            // Visual settings
            fogColor: '#2d1a4f',
            fogDensity: 0.02,
            skyColor: '#4a2d6b',
            ambientIntensity: 0.6,
            sunIntensity: 0.8,
            
            // Gameplay settings
            baseSpeedMultiplier: 2.0,
            obstacleSpawnMultiplier: 2.0,
            collectibleSpawnMultiplier: 1.8,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['dimensionShift', 'crystalResonance', 'realityWarp', 'energyFields']
        });
        
        // Level-specific objects
        this.megaCrystals = [];
        this.energyFields = [];
        this.dimensionPortals = [];
        this.crystalShards = [];
        this.lightBeams = [];
        this.resonancePads = [];
        this.realityFragments = [];
        this.ultimateEffects = [];
    }
    
    /**
     * Create the crystal dimension environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create crystal platform
        this.createCrystalPlatform();
        
        // Create mega crystals
        this.createMegaCrystals();
        
        // Create energy fields
        this.createEnergyFields();
        
        // Create dimension portals
        this.createDimensionPortals();
        
        // Create light beams
        this.createLightBeams();
        
        // Create reality fragments
        this.createRealityFragments();
        
        // Create crystal atmosphere
        this.createCrystalAtmosphere();
        
        console.log('[Level 10] Crystal dimension environment created');
    }
    
    /**
     * Create crystal platform
     */
    createCrystalPlatform() {
        const platformGeometry = new THREE.PlaneGeometry(35, 1000);
        const platformMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4B0082,
            emissive: 0x9400D3,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.rotation.x = -Math.PI / 2;
        platform.position.y = 0;
        platform.receiveShadow = true;
        this.environmentGroup.add(platform);
        
        // Add crystal pathways
        this.createCrystalPathways();
    }
    
    /**
     * Create mega crystals
     */
    createMegaCrystals() {
        for (let i = 0; i < 20; i++) {
            const crystal = this.createMegaCrystal(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    0,
                    -i * 50 - Math.random() * 30
                ),
                8 + Math.random() * 15
            );
            
            this.megaCrystals.push(crystal);
            this.addDynamicObject(crystal, {
                type: 'megaCrystal',
                rotationSpeed: 0.005 + Math.random() * 0.01,
                pulseSpeed: 0.8 + Math.random() * 0.6,
                energyLevel: 0.5 + Math.random() * 0.5,
                resonanceFreq: 100 + Math.random() * 300
            });
        }
    }
    
    /**
     * Create energy fields
     */
    createEnergyFields() {
        for (let i = 0; i < 15; i++) {
            const field = this.createEnergyField(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    5 + Math.random() * 15,
                    -i * 70 - Math.random() * 40
                )
            );
            
            this.energyFields.push(field);
            this.addDynamicObject(field, {
                type: 'energyField',
                oscillationSpeed: 1 + Math.random() * 2,
                expansionRate: 0.01 + Math.random() * 0.02,
                maxRadius: 8 + Math.random() * 12
            });
        }
    }
    
    /**
     * Create dimension portals
     */
    createDimensionPortals() {
        for (let i = 0; i < 8; i++) {
            const portal = this.createDimensionPortal(
                new THREE.Vector3(
                    i % 2 === 0 ? -100 - Math.random() * 50 : 100 + Math.random() * 50,
                    8 + Math.random() * 12,
                    -i * 120 - 80
                )
            );
            
            this.dimensionPortals.push(portal);
            this.addDynamicObject(portal, {
                type: 'portal',
                spinSpeed: 2 + Math.random() * 3,
                warpIntensity: 0.3 + Math.random() * 0.4,
                dimensionShift: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update mega crystals
        this.updateMegaCrystals(deltaTime, time);
        
        // Update energy fields
        this.updateEnergyFields(deltaTime, time);
        
        // Update dimension portals
        this.updateDimensionPortals(deltaTime, time);
        
        // Update reality fragments
        this.updateRealityFragments(deltaTime, time);
        
        // Update crystal resonance
        this.updateCrystalResonance(deltaTime, time);
    }
    
    // Helper methods
    createMegaCrystal(position, height) {
        const crystalGroup = new THREE.Group();
        
        // Main crystal structure
        const crystalGeometry = new THREE.ConeGeometry(height * 0.3, height, 8);
        const crystalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x9400D3,
            emissive: 0x4B0082,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = height / 2;
        crystal.castShadow = true;
        crystalGroup.add(crystal);
        
        // Crystal base
        const baseGeometry = new THREE.CylinderGeometry(height * 0.4, height * 0.4, 1);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4B0082,
            emissive: 0x9400D3,
            emissiveIntensity: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        crystalGroup.add(base);
        
        // Energy core
        const coreGeometry = new THREE.SphereGeometry(height * 0.1, 12, 12);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1.0
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = height * 0.7;
        crystalGroup.add(core);
        
        // Floating crystal shards
        this.addFloatingShards(crystalGroup, height);
        
        crystalGroup.position.copy(position);
        this.environmentGroup.add(crystalGroup);
        return crystalGroup;
    }
    
    createEnergyField(position) {
        const fieldGroup = new THREE.Group();
        
        // Energy sphere
        const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        fieldGroup.add(sphere);
        
        // Energy rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(3 + i * 2, 4 + i * 2, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = (i - 1) * 2;
            fieldGroup.add(ring);
        }
        
        fieldGroup.position.copy(position);
        this.environmentGroup.add(fieldGroup);
        return fieldGroup;
    }
    
    createDimensionPortal(position) {
        const portalGroup = new THREE.Group();
        
        // Portal frame
        const frameGeometry = new THREE.RingGeometry(4, 5, 16);
        const frameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9400D3,
            emissive: 0x9400D3,
            emissiveIntensity: 0.8
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        portalGroup.add(frame);
        
        // Portal vortex
        const vortexGeometry = new THREE.PlaneGeometry(8, 8);
        const vortexMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4B0082,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
        portalGroup.add(vortex);
        
        // Portal particles
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 2
            );
            particle.userData = {
                orbitSpeed: 1 + Math.random() * 2,
                orbitRadius: 2 + Math.random() * 3,
                angle: Math.random() * Math.PI * 2
            };
            portalGroup.add(particle);
        }
        
        portalGroup.position.copy(position);
        this.environmentGroup.add(portalGroup);
        return portalGroup;
    }
    
    createLightBeams() {
        for (let i = 0; i < 25; i++) {
            const beam = this.createLightBeam(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 180,
                    20 + Math.random() * 30,
                    -i * 40 - Math.random() * 30
                )
            );
            
            this.lightBeams.push(beam);
            this.environmentGroup.add(beam);
        }
    }
    
    createLightBeam(position) {
        const beamGeometry = new THREE.CylinderGeometry(0.2, 0.2, 40);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.4
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.copy(position);
        beam.position.y = 0;
        
        beam.userData = {
            type: 'lightBeam',
            intensity: 0.4 + Math.random() * 0.4,
            flickerSpeed: 4 + Math.random() * 6
        };
        
        return beam;
    }
    
    createRealityFragments() {
        for (let i = 0; i < 30; i++) {
            const fragment = this.createRealityFragment(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 25,
                    -i * 35 - Math.random() * 25
                )
            );
            
            this.realityFragments.push(fragment);
            this.addDynamicObject(fragment, {
                type: 'realityFragment',
                phaseSpeed: 2 + Math.random() * 4,
                shiftRate: 0.05 + Math.random() * 0.1
            });
        }
    }
    
    createRealityFragment(position) {
        const fragmentGeometry = new THREE.PlaneGeometry(3, 3);
        const fragmentMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9400D3,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
        fragment.position.copy(position);
        
        fragment.userData = {
            originalPosition: position.clone(),
            phaseOffset: Math.random() * Math.PI * 2
        };
        
        return fragment;
    }
    
    createCrystalPathways() {
        for (let i = 0; i < 100; i++) {
            const pathGeometry = new THREE.PlaneGeometry(2, 4);
            const pathMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x9400D3,
                emissive: 0x4B0082,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.6
            });
            const path = new THREE.Mesh(pathGeometry, pathMaterial);
            path.position.set(
                (Math.random() - 0.5) * 60,
                0.01,
                -i * 10 - Math.random() * 8
            );
            path.rotation.x = -Math.PI / 2;
            path.rotation.z = Math.random() * Math.PI;
            this.environmentGroup.add(path);
        }
    }
    
    createCrystalAtmosphere() {
        // Add floating crystal particles
        for (let i = 0; i < 200; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 250,
                    Math.random() * 50,
                    -Math.random() * 1000
                ),
                {
                    size: 0.02 + Math.random() * 0.04,
                    color: [0x9400D3, 0x4B0082, 0x00FFFF, 0xFFFFFF][Math.floor(Math.random() * 4)],
                    lifetime: 30.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.1,
                        0
                    ),
                    fadeOut: false
                }
            );
        }
        
        // Add dimensional rifts
        this.createDimensionalRifts();
    }
    
    createDimensionalRifts() {
        for (let i = 0; i < 10; i++) {
            const rift = this.createDimensionalRift(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 300,
                    10 + Math.random() * 20,
                    -i * 100 - Math.random() * 50
                )
            );
            
            this.ultimateEffects.push(rift);
            this.environmentGroup.add(rift);
        }
    }
    
    createDimensionalRift(position) {
        const riftGroup = new THREE.Group();
        
        // Rift opening
        const riftGeometry = new THREE.PlaneGeometry(12, 3);
        const riftMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const rift = new THREE.Mesh(riftGeometry, riftMaterial);
        riftGroup.add(rift);
        
        // Rift energy
        const energyGeometry = new THREE.PlaneGeometry(13, 3.5);
        const energyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9400D3,
            emissive: 0x9400D3,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.position.z = -0.1;
        riftGroup.add(energy);
        
        riftGroup.position.copy(position);
        riftGroup.userData = {
            type: 'dimensionalRift',
            waveSpeed: 3 + Math.random() * 4,
            distortionLevel: 0.5 + Math.random() * 0.5
        };
        
        return riftGroup;
    }
    
    addFloatingShards(crystal, height) {
        for (let i = 0; i < 6; i++) {
            const shardGeometry = new THREE.TetrahedronGeometry(0.3);
            const shardMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FFFF,
                emissive: 0x00FFFF,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.8
            });
            const shard = new THREE.Mesh(shardGeometry, shardMaterial);
            shard.position.set(
                Math.cos(i * Math.PI / 3) * (height * 0.5),
                height * 0.8,
                Math.sin(i * Math.PI / 3) * (height * 0.5)
            );
            shard.userData = {
                orbitRadius: height * 0.5,
                orbitSpeed: 0.5 + Math.random() * 1,
                angle: i * Math.PI / 3,
                floatOffset: Math.random() * Math.PI * 2
            };
            crystal.add(shard);
        }
    }
    
    updateMegaCrystals(deltaTime, time) {
        this.megaCrystals.forEach(crystal => {
            // Rotation
            if (crystal.userData.rotationSpeed) {
                crystal.rotation.y += crystal.userData.rotationSpeed * deltaTime;
            }
            
            // Pulsing glow
            if (crystal.userData.pulseSpeed) {
                const mainCrystal = crystal.children[0];
                const core = crystal.children[2];
                
                if (mainCrystal && mainCrystal.material) {
                    mainCrystal.material.emissiveIntensity = 
                        0.4 + Math.sin(time * crystal.userData.pulseSpeed) * 0.2;
                }
                
                if (core && core.material) {
                    core.material.emissiveIntensity = 
                        0.8 + Math.sin(time * crystal.userData.pulseSpeed * 2) * 0.2;
                }
            }
            
            // Update floating shards
            crystal.children.forEach((child, index) => {
                if (index > 2 && child.userData.orbitSpeed) {
                    child.userData.angle += child.userData.orbitSpeed * deltaTime;
                    child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
                    child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
                    child.position.y += Math.sin(time * 2 + child.userData.floatOffset) * 0.02;
                    child.rotation.x += deltaTime;
                    child.rotation.y += deltaTime * 0.7;
                }
            });
        });
    }
    
    updateEnergyFields(deltaTime, time) {
        this.energyFields.forEach(field => {
            if (field.userData.oscillationSpeed) {
                // Oscillating size
                const scale = 1 + Math.sin(time * field.userData.oscillationSpeed) * 0.3;
                field.children[0].scale.setScalar(scale);
                
                // Rotating rings
                field.children.forEach((child, index) => {
                    if (index > 0) {
                        child.rotation.z += (index % 2 === 0 ? 1 : -1) * deltaTime;
                    }
                });
            }
        });
    }
    
    updateDimensionPortals(deltaTime, time) {
        this.dimensionPortals.forEach(portal => {
            if (portal.userData.spinSpeed) {
                // Spinning portal
                portal.rotation.z += portal.userData.spinSpeed * deltaTime;
                
                // Update portal particles
                portal.children.forEach((child, index) => {
                    if (index > 1 && child.userData.orbitSpeed) {
                        child.userData.angle += child.userData.orbitSpeed * deltaTime;
                        child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
                        child.position.y = Math.sin(child.userData.angle) * child.userData.orbitRadius;
                        
                        // Varying Z position for depth effect
                        child.position.z = Math.sin(child.userData.angle * 2) * 1;
                    }
                });
                
                // Warp effect
                const vortex = portal.children[1];
                if (vortex && vortex.material) {
                    vortex.material.opacity = 
                        0.4 + Math.sin(time * portal.userData.warpIntensity * 3) * 0.2;
                }
            }
        });
    }
    
    updateRealityFragments(deltaTime, time) {
        this.realityFragments.forEach(fragment => {
            if (fragment.userData.phaseSpeed) {
                // Phase shifting
                fragment.material.opacity = 
                    0.1 + Math.sin(time * fragment.userData.phaseSpeed + fragment.userData.phaseOffset) * 0.2;
                
                // Position shifting
                fragment.position.x = fragment.userData.originalPosition.x + 
                    Math.sin(time * fragment.userData.shiftRate) * 3;
                fragment.position.y = fragment.userData.originalPosition.y + 
                    Math.cos(time * fragment.userData.shiftRate * 0.7) * 2;
                
                // Rotation
                fragment.rotation.x += deltaTime * 0.5;
                fragment.rotation.y += deltaTime * 0.3;
            }
        });
    }
    
    updateCrystalResonance(deltaTime, time) {
        // Global resonance effect
        this.environmentGroup.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                // Subtle resonance pulse across all crystals
                child.material.emissiveIntensity += Math.sin(time * 0.5) * 0.01;
            }
        });
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        this.megaCrystals = [];
        this.energyFields = [];
        this.dimensionPortals = [];
        this.crystalShards = [];
        this.lightBeams = [];
        this.resonancePads = [];
        this.realityFragments = [];
        this.ultimateEffects = [];
        
        console.log('[Level 10] Crystal dimension level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level10 = new Level10_Crystal();
    window.LevelManagerPro.registerLevel(level10);
    console.log('[Level 10] Crystal dimension level registered');
}

// Export for use
window.Level10_Crystal = Level10_Crystal;