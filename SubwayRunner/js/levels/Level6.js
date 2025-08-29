// Level6.js - Volcanic Forge
const Level6 = {
    name: "Volcanic Forge",
    description: "Molten landscape with lava flows, steam vents, and forge machinery",
    id: 6,
    
    // Store references to level-specific objects
    objects: {
        lavaFlows: [],
        steamVents: [],
        forgeEquipment: [],
        emberParticles: [],
        rockFormations: [],
        metalGrates: [],
        heatDistortions: [],
        glowingCrystals: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('🌋 Loading Level 6: Volcanic Forge');
        
        // Store scene reference
        this.scene = scene;
        this.renderer = renderer;
        
        // Clear previous level objects
        this.cleanup();
        
        // Hide base game elements
        scene.children.forEach(child => {
            if (child.userData && (child.userData.type === 'streetLine' || 
                child.userData.type === 'sidewalk')) {
                child.visible = false;
            }
        });
        
        // Create level environment
        this.createEnvironment();
        
        // Update fog and renderer for volcanic atmosphere
        scene.fog = new THREE.FogExp2(0x8B1538, 0.02); // Dark red volcanic fog
        renderer.setClearColor(0x2F1B14);
        
        // Update ambient lighting to fiery ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0xFF6600);
            ambientLight.intensity = 0.7;
        }
        
        // Add flickering fire light
        const dirLight = new THREE.DirectionalLight(0xFF4500, 1.2);
        dirLight.position.set(3, 8, -5);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createVolcanicFloor();
        this.createLavaFlows();
        this.createSteamVents();
        this.createForgeEquipment();
        this.createRockFormations();
        this.createMetalGrates();
        this.createEmberParticles();
        this.createGlowingCrystals();
    },
    
    createVolcanicFloor: function() {
        const floorGeometry = new THREE.PlaneGeometry(12, 300);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            emissive: 0x330000
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.position.z = -150;
        floor.receiveShadow = true;
        floor.userData = { type: 'volcanicFloor', levelObject: true };
        this.scene.add(floor);
        this.objects.rockFormations.push(floor);
    },
    
    createLavaFlows: function() {
        // Create flowing lava streams
        const lavaGeometry = new THREE.PlaneGeometry(2, 15);
        const lavaMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF2200,
            transparent: true,
            opacity: 0.9
        });
        
        for (let i = 0; i < 8; i++) {
            const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
            lava.rotation.x = -Math.PI / 2;
            lava.position.set(
                (i % 3 - 1) * 3, // -3, 0, 3
                0.1,
                -i * 20 - 30
            );
            lava.userData = { type: 'lavaFlow', levelObject: true, animated: true };
            this.scene.add(lava);
            this.objects.lavaFlows.push(lava);
        }
    },
    
    createSteamVents: function() {
        // Create steam vent base
        const ventGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.3, 8);
        const ventMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        
        for (let i = 0; i < 12; i++) {
            const vent = new THREE.Mesh(ventGeometry, ventMaterial);
            vent.position.set(
                (Math.random() - 0.5) * 8,
                0.15,
                -i * 12 - 25
            );
            vent.userData = { type: 'steamVent', levelObject: true };
            this.scene.add(vent);
            this.objects.steamVents.push(vent);
            
            // Create steam effect
            this.createSteamEffect(vent.position.x, vent.position.y + 0.5, vent.position.z);
        }
    },
    
    createSteamEffect: function(x, y, z) {
        const steamGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const steamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.4
        });
        
        // Create multiple steam puffs
        for (let i = 0; i < 5; i++) {
            const steam = new THREE.Mesh(steamGeometry, steamMaterial);
            steam.position.set(x, y + i * 0.8, z);
            steam.scale.setScalar(0.5 + i * 0.2);
            steam.userData = { 
                type: 'steam', 
                levelObject: true, 
                animated: true,
                height: i,
                baseY: y + i * 0.8
            };
            this.scene.add(steam);
            this.objects.steamVents.push(steam);
        }
    },
    
    createForgeEquipment: function() {
        // Create anvils
        const anvilGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.8);
        const anvilMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        
        for (let i = 0; i < 4; i++) {
            const anvil = new THREE.Mesh(anvilGeometry, anvilMaterial);
            anvil.position.set(
                (i % 2 === 0) ? -3 : 3,
                0.4,
                -i * 25 - 50
            );
            anvil.userData = { type: 'anvil', levelObject: true };
            this.scene.add(anvil);
            this.objects.forgeEquipment.push(anvil);
        }
        
        // Create forge bellows
        const bellowsGeometry = new THREE.CylinderGeometry(0.6, 1.2, 2, 8);
        const bellowsMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        for (let i = 0; i < 3; i++) {
            const bellows = new THREE.Mesh(bellowsGeometry, bellowsMaterial);
            bellows.position.set(0, 1, -i * 30 - 70);
            bellows.rotation.z = Math.PI / 2;
            bellows.userData = { type: 'bellows', levelObject: true, animated: true };
            this.scene.add(bellows);
            this.objects.forgeEquipment.push(bellows);
        }
        
        // Create hammers
        const hammerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const hammerMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        for (let i = 0; i < 6; i++) {
            const hammer = new THREE.Mesh(hammerGeometry, hammerMaterial);
            hammer.position.set(
                (Math.random() - 0.5) * 6,
                1.5,
                -i * 15 - 40
            );
            hammer.rotation.z = Math.PI / 4;
            hammer.userData = { type: 'hammer', levelObject: true, animated: true };
            this.scene.add(hammer);
            this.objects.forgeEquipment.push(hammer);
        }
    },
    
    createRockFormations: function() {
        // Create jagged volcanic rocks
        const rockShapes = [
            new THREE.DodecahedronGeometry(1),
            new THREE.IcosahedronGeometry(0.8),
            new THREE.OctahedronGeometry(1.2)
        ];
        
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
        
        for (let i = 0; i < 25; i++) {
            const rockGeometry = rockShapes[Math.floor(Math.random() * rockShapes.length)];
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 10,
                0.5 + Math.random(),
                -Math.random() * 200 - 30
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.scale.setScalar(0.5 + Math.random() * 0.8);
            rock.userData = { type: 'volcanicRock', levelObject: true };
            this.scene.add(rock);
            this.objects.rockFormations.push(rock);
        }
    },
    
    createMetalGrates: function() {
        // Create industrial metal grating
        const grateGeometry = new THREE.PlaneGeometry(4, 1);
        const grateMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4A4A4A,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 10; i++) {
            const grate = new THREE.Mesh(grateGeometry, grateMaterial);
            grate.rotation.x = -Math.PI / 2;
            grate.position.set(0, 0.05, -i * 15 - 35);
            grate.userData = { type: 'metalGrate', levelObject: true };
            this.scene.add(grate);
            this.objects.metalGrates.push(grate);
        }
    },
    
    createEmberParticles: function() {
        // Create floating ember particles
        const emberCount = 200;
        const emberGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(emberCount * 3);
        
        for (let i = 0; i < emberCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;     // x
            positions[i + 1] = Math.random() * 12;         // y
            positions[i + 2] = -Math.random() * 250 - 50;  // z
        }
        
        emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const emberMaterial = new THREE.PointsMaterial({
            color: 0xFF6600,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const embers = new THREE.Points(emberGeometry, emberMaterial);
        embers.userData = { type: 'emberParticles', levelObject: true, animated: true };
        this.scene.add(embers);
        this.objects.emberParticles.push(embers);
    },
    
    createGlowingCrystals: function() {
        const crystalGeometry = new THREE.OctahedronGeometry(0.5);
        const crystalMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF8C00,
            emissive: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        
        // Create glowing crystals embedded in walls
        for (let i = 0; i < 8; i++) {
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                (i % 2 === 0) ? -4 : 4,
                2 + Math.random() * 2,
                -i * 18 - 40
            );
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            crystal.userData = { type: 'glowingCrystal', levelObject: true, animated: true };
            this.scene.add(crystal);
            this.objects.glowingCrystals.push(crystal);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate lava flows
        this.objects.lavaFlows.forEach((lava, index) => {
            lava.material.emissive.setHSL(0.08, 1, 0.3 + 0.2 * Math.sin(time * 3 + index));
        });
        
        // Animate steam effects
        this.objects.steamVents.forEach((vent, index) => {
            if (vent.userData.type === 'steam') {
                vent.position.y = vent.userData.baseY + Math.sin(time * 2 + index) * 0.3;
                vent.material.opacity = 0.2 + 0.3 * Math.sin(time + index);
            }
        });
        
        // Animate forge equipment
        this.objects.forgeEquipment.forEach((equipment, index) => {
            if (equipment.userData.type === 'bellows') {
                equipment.scale.x = 1 + 0.1 * Math.sin(time * 4 + index);
            } else if (equipment.userData.type === 'hammer') {
                equipment.rotation.z = Math.PI / 4 + 0.2 * Math.sin(time * 5 + index);
            }
        });
        
        // Animate ember particles
        this.objects.emberParticles.forEach(embers => {
            const positions = embers.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += deltaTime * (1 + Math.random()); // Rise up
                if (positions[i] > 15) positions[i] = 0; // Reset to bottom
            }
            embers.geometry.attributes.position.needsUpdate = true;
        });
        
        // Animate glowing crystals
        this.objects.glowingCrystals.forEach((crystal, index) => {
            crystal.rotation.y += deltaTime * 0.5;
            const intensity = 0.3 + 0.4 * Math.sin(time * 2 + index);
            crystal.material.emissive.setHSL(0.08, 1, intensity);
        });
        
        // Animate directional light for flickering fire effect
        if (this.objects.dirLight) {
            this.objects.dirLight.intensity = 1.0 + 0.3 * Math.sin(time * 6);
        }
    },
    
    // Cleanup level objects
    cleanup: function() {
        Object.values(this.objects).forEach(objectArray => {
            if (Array.isArray(objectArray)) {
                objectArray.forEach(obj => {
                    if (obj && obj.parent) {
                        obj.parent.remove(obj);
                        if (obj.geometry) obj.geometry.dispose();
                        if (obj.material) {
                            if (Array.isArray(obj.material)) {
                                obj.material.forEach(mat => mat.dispose());
                            } else {
                                obj.material.dispose();
                            }
                        }
                    }
                });
                objectArray.length = 0;
            }
        });
        
        // Remove directional light
        if (this.objects.dirLight) {
            this.scene.remove(this.objects.dirLight);
            this.objects.dirLight = null;
        }
        
        console.log('🌋 Level 6 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level6;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(6, Level6);
    console.log('✅ Level 6: Volcanic Forge registered');
}