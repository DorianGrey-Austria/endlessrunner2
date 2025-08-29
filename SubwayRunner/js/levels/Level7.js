// Level7.js - Crystal Caves
const Level7 = {
    name: "Crystal Caves",
    description: "Mystical crystal caverns with refracting light beams and prismatic effects",
    id: 7,
    
    // Store references to level-specific objects
    objects: {
        crystalFormations: [],
        lightBeams: [],
        prismaticEffects: [],
        caveWalls: [],
        glowingOrbs: [],
        reflectionSurfaces: [],
        crystallineStructures: [],
        rainbowEffects: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('💎 Loading Level 7: Crystal Caves');
        
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
        
        // Update fog and renderer for crystal cave atmosphere
        scene.fog = new THREE.FogExp2(0x1A1A2E, 0.015); // Dark purple crystal fog
        renderer.setClearColor(0x16213E);
        
        // Update ambient lighting to crystal ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x9A7AA0);
            ambientLight.intensity = 0.8;
        }
        
        // Add prismatic directional light
        const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
        dirLight.position.set(2, 12, -5);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createCaveFloor();
        this.createCaveWalls();
        this.createCrystalFormations();
        this.createLightBeams();
        this.createGlowingOrbs();
        this.createReflectionSurfaces();
        this.createCrystallineStructures();
        this.createRainbowEffects();
    },
    
    createCaveFloor: function() {
        const floorGeometry = new THREE.PlaneGeometry(10, 300);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E2E3F,
            transparent: true,
            opacity: 0.9
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.position.z = -150;
        floor.receiveShadow = true;
        floor.userData = { type: 'caveFloor', levelObject: true };
        this.scene.add(floor);
        this.objects.caveWalls.push(floor);
    },
    
    createCaveWalls: function() {
        // Create curved cave walls
        const wallGeometry = new THREE.CylinderGeometry(6, 6, 8, 12, 1, true, 0, Math.PI);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4A4A5C,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 20; i++) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(0, 4, -i * 10 - 20);
            wall.rotation.y = Math.PI; // Face inward
            wall.userData = { type: 'caveWall', levelObject: true };
            this.scene.add(wall);
            this.objects.caveWalls.push(wall);
        }
        
        // Create ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(10, 300);
        const ceilingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3A3A4C,
            side: THREE.DoubleSide
        });
        
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 8;
        ceiling.position.z = -150;
        ceiling.userData = { type: 'caveCeiling', levelObject: true };
        this.scene.add(ceiling);
        this.objects.caveWalls.push(ceiling);
    },
    
    createCrystalFormations: function() {
        // Different crystal shapes
        const crystalShapes = [
            new THREE.ConeGeometry(0.5, 3, 6),
            new THREE.OctahedronGeometry(1),
            new THREE.TetrahedronGeometry(1.2),
            new THREE.DodecahedronGeometry(0.8)
        ];
        
        const crystalColors = [
            0xFF69B4, // Pink
            0x9370DB, // Purple
            0x00CED1, // Cyan
            0x98FB98, // Light Green
            0xFFB6C1, // Light Pink
            0x87CEEB  // Sky Blue
        ];
        
        // Create crystal clusters
        for (let i = 0; i < 30; i++) {
            const crystalGeometry = crystalShapes[Math.floor(Math.random() * crystalShapes.length)];
            const crystalColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
            
            const crystalMaterial = new THREE.MeshBasicMaterial({ 
                color: crystalColor,
                transparent: true,
                opacity: 0.7,
                emissive: crystalColor,
                emissiveIntensity: 0.2
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            // Position crystals around the cave
            const angle = (i / 30) * Math.PI * 2;
            const radius = 3.5 + Math.random() * 1.5;
            
            crystal.position.set(
                Math.cos(angle) * radius,
                0.5 + Math.random() * 3,
                -i * 8 - 25
            );
            
            crystal.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            crystal.scale.setScalar(0.3 + Math.random() * 0.7);
            crystal.userData = { 
                type: 'crystal', 
                levelObject: true, 
                animated: true,
                originalColor: crystalColor
            };
            this.scene.add(crystal);
            this.objects.crystalFormations.push(crystal);
        }
    },
    
    createLightBeams: function() {
        // Create light beams refracting through crystals
        const beamGeometry = new THREE.ConeGeometry(0.1, 6, 8, 1, true);
        const beamColors = [0xFF69B4, 0x9370DB, 0x00CED1, 0x98FB98, 0xFFB6C1];
        
        for (let i = 0; i < 10; i++) {
            const beamColor = beamColors[Math.floor(Math.random() * beamColors.length)];
            const beamMaterial = new THREE.MeshBasicMaterial({ 
                color: beamColor,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(
                (Math.random() - 0.5) * 8,
                6,
                -i * 15 - 40
            );
            beam.rotation.set(
                Math.random() * 0.5,
                Math.random() * Math.PI * 2,
                Math.random() * 0.5
            );
            beam.userData = { type: 'lightBeam', levelObject: true, animated: true };
            this.scene.add(beam);
            this.objects.lightBeams.push(beam);
        }
    },
    
    createGlowingOrbs: function() {
        const orbGeometry = new THREE.SphereGeometry(0.3, 12, 8);
        const orbColors = [0xFF1493, 0x8A2BE2, 0x00FFFF, 0x32CD32];
        
        // Create floating glowing orbs
        for (let i = 0; i < 15; i++) {
            const orbColor = orbColors[Math.floor(Math.random() * orbColors.length)];
            const orbMaterial = new THREE.MeshBasicMaterial({ 
                color: orbColor,
                emissive: orbColor,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(
                (Math.random() - 0.5) * 7,
                1 + Math.random() * 5,
                -i * 12 - 30
            );
            orb.userData = { 
                type: 'glowingOrb', 
                levelObject: true, 
                animated: true,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(orb);
            this.objects.glowingOrbs.push(orb);
        }
    },
    
    createReflectionSurfaces: function() {
        // Create reflective crystal surfaces
        const surfaceGeometry = new THREE.PlaneGeometry(2, 4);
        const surfaceMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xE6E6FA,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 8; i++) {
            const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
            surface.position.set(
                (i % 2 === 0) ? -3.5 : 3.5,
                2.5,
                -i * 18 - 50
            );
            surface.rotation.y = (i % 2 === 0) ? 0.3 : -0.3;
            surface.userData = { type: 'reflectionSurface', levelObject: true, animated: true };
            this.scene.add(surface);
            this.objects.reflectionSurfaces.push(surface);
        }
    },
    
    createCrystallineStructures: function() {
        // Create large crystalline formations
        const structureGeometry = new THREE.CylinderGeometry(0.2, 1.5, 5, 6);
        const structureColors = [0xFF00FF, 0x00FFFF, 0xFFFF00];
        
        for (let i = 0; i < 6; i++) {
            const structureColor = structureColors[Math.floor(Math.random() * structureColors.length)];
            const structureMaterial = new THREE.MeshBasicMaterial({ 
                color: structureColor,
                transparent: true,
                opacity: 0.6,
                emissive: structureColor,
                emissiveIntensity: 0.1
            });
            
            const structure = new THREE.Mesh(structureGeometry, structureMaterial);
            structure.position.set(
                (Math.random() - 0.5) * 6,
                2.5,
                -i * 25 - 60
            );
            structure.rotation.z = Math.random() * 0.4 - 0.2;
            structure.userData = { type: 'crystallineStructure', levelObject: true, animated: true };
            this.scene.add(structure);
            this.objects.crystallineStructures.push(structure);
        }
    },
    
    createRainbowEffects: function() {
        // Create rainbow light dispersion effects
        const rainbowGeometry = new THREE.RingGeometry(0.5, 1.5, 16);
        const rainbowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 4; i++) {
            const rainbow = new THREE.Mesh(rainbowGeometry, rainbowMaterial);
            rainbow.position.set(0, 4, -i * 40 - 80);
            rainbow.rotation.x = Math.PI / 2;
            rainbow.userData = { type: 'rainbowEffect', levelObject: true, animated: true };
            this.scene.add(rainbow);
            this.objects.rainbowEffects.push(rainbow);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate crystals with pulsing glow
        this.objects.crystalFormations.forEach((crystal, index) => {
            crystal.rotation.y += deltaTime * 0.3;
            const intensity = 0.1 + 0.3 * Math.sin(time * 2 + index);
            crystal.material.emissiveIntensity = intensity;
            
            // Color shifting effect
            const hue = (time * 0.1 + index * 0.1) % 1;
            crystal.material.emissive.setHSL(hue, 0.8, 0.3);
        });
        
        // Animate light beams
        this.objects.lightBeams.forEach((beam, index) => {
            beam.rotation.z += deltaTime * 0.5;
            beam.material.opacity = 0.2 + 0.3 * Math.sin(time * 3 + index);
        });
        
        // Animate glowing orbs floating
        this.objects.glowingOrbs.forEach((orb, index) => {
            const offset = orb.userData.floatOffset;
            orb.position.y += Math.sin(time + offset) * deltaTime * 0.5;
            orb.material.emissiveIntensity = 0.3 + 0.4 * Math.sin(time * 2 + offset);
        });
        
        // Animate reflection surfaces
        this.objects.reflectionSurfaces.forEach((surface, index) => {
            surface.material.opacity = 0.2 + 0.2 * Math.sin(time * 1.5 + index);
            surface.rotation.y += deltaTime * 0.2 * (index % 2 === 0 ? 1 : -1);
        });
        
        // Animate crystalline structures
        this.objects.crystallineStructures.forEach((structure, index) => {
            structure.rotation.y += deltaTime * 0.4;
            const hue = (time * 0.2 + index * 0.2) % 1;
            structure.material.emissive.setHSL(hue, 1, 0.2);
        });
        
        // Animate rainbow effects
        this.objects.rainbowEffects.forEach((rainbow, index) => {
            rainbow.rotation.z += deltaTime * 1.5;
            const hue = (time * 0.5 + index * 0.25) % 1;
            rainbow.material.color.setHSL(hue, 1, 0.8);
        });
        
        // Animate directional light for dynamic crystal reflections
        if (this.objects.dirLight) {
            const hue = (time * 0.1) % 1;
            this.objects.dirLight.color.setHSL(hue, 0.3, 0.9);
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
        
        console.log('💎 Level 7 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level7;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(7, Level7);
    console.log('✅ Level 7: Crystal Caves registered');
}