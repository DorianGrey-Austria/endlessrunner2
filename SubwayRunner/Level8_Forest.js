/**
 * Level 8: Forest Twilight
 * Mystical forest environment during twilight hours
 * 
 * @module Level8_Forest
 */

class Level8_Forest extends LevelBase {
    constructor() {
        super(8, 'Forest Twilight', {
            // Visual settings
            fogColor: '#2d1b3d',
            fogDensity: 0.025,
            skyColor: '#4a3358',
            ambientIntensity: 0.4,
            sunIntensity: 0.6,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.7,
            obstacleSpawnMultiplier: 1.7,
            collectibleSpawnMultiplier: 1.6,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['mysticalFog', 'glowingPlants', 'spirits', 'moonlight']
        });
        
        // Level-specific objects
        this.ancientTrees = [];
        this.glowingMushrooms = [];
        this.spirits = [];
        this.moonbeams = [];
        this.mysticalFog = [];
        this.forestCreatures = [];
        this.magicalEffects = [];
    }
    
    /**
     * Create the forest environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create forest floor
        this.createForestFloor();
        
        // Create ancient trees
        this.createAncientTrees();
        
        // Create glowing mushrooms
        this.createGlowingMushrooms();
        
        // Create forest spirits
        this.createForestSpirits();
        
        // Create moonbeams
        this.createMoonbeams();
        
        // Create mystical fog
        this.createMysticalFog();
        
        // Create forest atmosphere
        this.createForestAtmosphere();
        
        console.log('[Level 8] Forest environment created');
    }
    
    /**
     * Create forest floor
     */
    createForestFloor() {
        const floorGeometry = new THREE.PlaneGeometry(25, 1000);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2F4F2F,
            emissive: 0x1C3A1C,
            emissiveIntensity: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.environmentGroup.add(floor);
        
        // Add fallen leaves
        this.createFallenLeaves();
    }
    
    /**
     * Create ancient trees
     */
    createAncientTrees() {
        for (let i = 0; i < 50; i++) {
            const tree = this.createAncientTree(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    0,
                    -i * 25 - Math.random() * 20
                ),
                8 + Math.random() * 15
            );
            
            this.ancientTrees.push(tree);
            this.addDynamicObject(tree, {
                type: 'ancientTree',
                swaySpeed: 0.2 + Math.random() * 0.3,
                glowIntensity: 0.1 + Math.random() * 0.2
            });
        }
    }
    
    /**
     * Create glowing mushrooms
     */
    createGlowingMushrooms() {
        for (let i = 0; i < 80; i++) {
            const mushroom = this.createGlowingMushroom(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    0,
                    -i * 15 - Math.random() * 10
                )
            );
            
            this.glowingMushrooms.push(mushroom);
            this.addDynamicObject(mushroom, {
                type: 'mushroom',
                pulseSpeed: 1 + Math.random() * 2,
                baseIntensity: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    /**
     * Create forest spirits
     */
    createForestSpirits() {
        for (let i = 0; i < 15; i++) {
            const spirit = this.createForestSpirit(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    3 + Math.random() * 8,
                    -i * 80 - Math.random() * 40
                )
            );
            
            this.spirits.push(spirit);
            this.addDynamicObject(spirit, {
                type: 'spirit',
                floatSpeed: 0.5 + Math.random() * 0.8,
                phaseSpeed: 2 + Math.random() * 3,
                baseY: spirit.position.y
            });
        }
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update glowing mushrooms
        this.updateGlowingMushrooms(deltaTime, time);
        
        // Update forest spirits
        this.updateForestSpirits(deltaTime, time);
        
        // Update mystical fog
        this.updateMysticalFog(deltaTime, time);
        
        // Update ancient trees
        this.updateAncientTrees(deltaTime, time);
    }
    
    // Helper methods
    createAncientTree(position, height) {
        const treeGroup = new THREE.Group();
        
        // Massive trunk
        const trunkGeometry = new THREE.CylinderGeometry(2, 3, height);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            emissive: 0x2F1B05,
            emissiveIntensity: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = height / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Mystical canopy
        const canopyGeometry = new THREE.SphereGeometry(height * 0.8, 16, 16);
        const canopyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x013220,
            emissive: 0x9370DB,
            emissiveIntensity: 0.05
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = height + 3;
        canopy.scale.y = 0.6;
        canopy.castShadow = true;
        treeGroup.add(canopy);
        
        // Add glowing runes
        this.addGlowingRunes(treeGroup);
        
        treeGroup.position.copy(position);
        this.environmentGroup.add(treeGroup);
        return treeGroup;
    }
    
    createGlowingMushroom(position) {
        const mushroomGroup = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
        const stemMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xF5DEB3
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        mushroomGroup.add(stem);
        
        // Cap
        const capGeometry = new THREE.SphereGeometry(0.5, 12, 8);
        const capMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9370DB,
            emissive: 0x9370DB,
            emissiveIntensity: 0.5
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 0.9;
        cap.scale.y = 0.6;
        mushroomGroup.add(cap);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.8, 8, 6);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9370DB,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.9;
        mushroomGroup.add(glow);
        
        mushroomGroup.position.copy(position);
        this.environmentGroup.add(mushroomGroup);
        return mushroomGroup;
    }
    
    createForestSpirit(position) {
        const spiritGroup = new THREE.Group();
        
        // Spirit orb
        const orbGeometry = new THREE.SphereGeometry(0.3, 12, 8);
        const orbMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x98FB98,
            emissive: 0x98FB98,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        spiritGroup.add(orb);
        
        // Spirit trail
        for (let i = 0; i < 5; i++) {
            const trailGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const trailMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x98FB98,
                transparent: true,
                opacity: 0.3 - i * 0.05
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.z = -i * 0.3;
            spiritGroup.add(trail);
        }
        
        spiritGroup.position.copy(position);
        this.environmentGroup.add(spiritGroup);
        return spiritGroup;
    }
    
    createMoonbeams() {
        for (let i = 0; i < 20; i++) {
            const moonbeam = this.createMoonbeam(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    20,
                    -i * 50 - Math.random() * 30
                )
            );
            
            this.moonbeams.push(moonbeam);
            this.environmentGroup.add(moonbeam);
        }
    }
    
    createMoonbeam(position) {
        const beamGeometry = new THREE.ConeGeometry(0.1, 20, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xF8F8FF,
            transparent: true,
            opacity: 0.3
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.copy(position);
        beam.position.y = 10;
        
        beam.userData = {
            type: 'moonbeam',
            intensity: 0.2 + Math.random() * 0.3,
            flickerSpeed: 3 + Math.random() * 2
        };
        
        return beam;
    }
    
    createMysticalFog() {
        for (let i = 0; i < 30; i++) {
            const fog = this.createFogPatch(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    1 + Math.random() * 3,
                    -i * 30 - Math.random() * 20
                )
            );
            
            this.mysticalFog.push(fog);
            this.environmentGroup.add(fog);
        }
    }
    
    createFogPatch(position) {
        const fogGeometry = new THREE.SphereGeometry(5, 8, 6);
        const fogMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9370DB,
            transparent: true,
            opacity: 0.1
        });
        const fog = new THREE.Mesh(fogGeometry, fogMaterial);
        fog.position.copy(position);
        fog.scale.y = 0.3;
        
        fog.userData = {
            type: 'mysticalFog',
            driftSpeed: 0.2 + Math.random() * 0.3,
            pulseSpeed: 1 + Math.random() * 2
        };
        
        return fog;
    }
    
    createFallenLeaves() {
        for (let i = 0; i < 200; i++) {
            const leafGeometry = new THREE.PlaneGeometry(0.3, 0.2);
            const leafColors = [0xFF4500, 0xFFD700, 0x8B4513, 0x9370DB];
            const leafMaterial = new THREE.MeshLambertMaterial({ 
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
                side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 50,
                0.01,
                -Math.random() * 1000
            );
            leaf.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            this.environmentGroup.add(leaf);
        }
    }
    
    createForestAtmosphere() {
        // Add fireflies
        for (let i = 0; i < 50; i++) {
            const firefly = this.createFirefly(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    2 + Math.random() * 6,
                    -i * 20 - Math.random() * 15
                )
            );
            
            this.forestCreatures.push(firefly);
            this.environmentGroup.add(firefly);
        }
    }
    
    createFirefly(position) {
        const fireflyGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const fireflyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.8
        });
        const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
        firefly.position.copy(position);
        
        firefly.userData = {
            type: 'firefly',
            glowSpeed: 1 + Math.random() * 2,
            flightSpeed: 0.5 + Math.random() * 1,
            baseY: position.y
        };
        
        return firefly;
    }
    
    addGlowingRunes(tree) {
        for (let i = 0; i < 3; i++) {
            const runeGeometry = new THREE.PlaneGeometry(0.8, 0.8);
            const runeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x9370DB,
                emissive: 0x9370DB,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.8
            });
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                Math.cos(i * Math.PI * 2/3) * 2.5,
                3 + i * 2,
                Math.sin(i * Math.PI * 2/3) * 2.5
            );
            rune.rotation.y = -i * Math.PI * 2/3;
            tree.add(rune);
        }
    }
    
    updateGlowingMushrooms(deltaTime, time) {
        this.glowingMushrooms.forEach(mushroom => {
            const cap = mushroom.children[1];
            const glow = mushroom.children[2];
            
            if (cap && cap.material && mushroom.userData.pulseSpeed) {
                const intensity = mushroom.userData.baseIntensity + 
                    Math.sin(time * mushroom.userData.pulseSpeed) * 0.2;
                cap.material.emissiveIntensity = intensity;
                
                if (glow && glow.material) {
                    glow.material.opacity = intensity * 0.5;
                }
            }
        });
    }
    
    updateForestSpirits(deltaTime, time) {
        this.spirits.forEach(spirit => {
            if (spirit.userData.floatSpeed) {
                // Floating motion
                spirit.position.y = spirit.userData.baseY + 
                    Math.sin(time * spirit.userData.floatSpeed) * 2;
                
                // Phase in/out
                const orb = spirit.children[0];
                if (orb && orb.material && spirit.userData.phaseSpeed) {
                    orb.material.opacity = 0.5 + Math.sin(time * spirit.userData.phaseSpeed) * 0.2;
                }
                
                // Update trail
                spirit.children.forEach((child, index) => {
                    if (index > 0 && child.material) {
                        child.material.opacity = (0.3 - index * 0.05) * orb.material.opacity;
                    }
                });
            }
        });
    }
    
    updateMysticalFog(deltaTime, time) {
        this.mysticalFog.forEach(fog => {
            if (fog.userData.driftSpeed) {
                fog.position.x += Math.sin(time * fog.userData.driftSpeed) * 0.01;
                fog.position.z += fog.userData.driftSpeed * deltaTime * 0.1;
            }
            
            if (fog.userData.pulseSpeed && fog.material) {
                fog.material.opacity = 0.05 + Math.sin(time * fog.userData.pulseSpeed) * 0.05;
            }
        });
    }
    
    updateAncientTrees(deltaTime, time) {
        this.ancientTrees.forEach(tree => {
            if (tree.userData.swaySpeed) {
                tree.rotation.z = Math.sin(time * tree.userData.swaySpeed) * 0.02;
            }
        });
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        this.ancientTrees = [];
        this.glowingMushrooms = [];
        this.spirits = [];
        this.moonbeams = [];
        this.mysticalFog = [];
        this.forestCreatures = [];
        this.magicalEffects = [];
        
        console.log('[Level 8] Forest level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level8 = new Level8_Forest();
    window.LevelManagerPro.registerLevel(level8);
    console.log('[Level 8] Forest level registered');
}

// Export for use
window.Level8_Forest = Level8_Forest;