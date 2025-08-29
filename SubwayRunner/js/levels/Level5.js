// Level5.js - Underwater Ruins
const Level5 = {
    name: "Underwater Ruins",
    description: "Sunken city with coral reefs, sea creatures, and mysterious underwater phenomena",
    id: 5,
    
    // Store references to level-specific objects
    objects: {
        coralReefs: [],
        seaweeds: [],
        ruins: [],
        bubbleEffects: [],
        fishSchools: [],
        jellyfish: [],
        sunbeams: [],
        ancientPillars: [],
        causticEffects: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('🌊 Loading Level 5: Underwater Ruins');
        
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
        
        // Update fog and renderer for underwater effect
        scene.fog = new THREE.FogExp2(0x006994, 0.025); // Deep blue water fog
        renderer.setClearColor(0x004d73);
        
        // Update ambient lighting to underwater ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x4da6ff);
            ambientLight.intensity = 0.6;
        }
        
        // Add sunlight filtering down from above
        const dirLight = new THREE.DirectionalLight(0x87CEEB, 0.7);
        dirLight.position.set(0, 15, -5);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createSeaFloor();
        this.createCoralReefs();
        this.createSeaweeds();
        this.createAncientRuins();
        this.createBubbleEffects();
        this.createFishSchools();
        this.createJellyfish();
        this.createSunbeams();
        this.createCausticEffects();
    },
    
    createSeaFloor: function() {
        const floorGeometry = new THREE.PlaneGeometry(12, 300);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7D6B,
            transparent: true,
            opacity: 0.9
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.position.z = -150;
        floor.receiveShadow = true;
        floor.userData = { type: 'seaFloor', levelObject: true };
        this.scene.add(floor);
        this.objects.ruins.push(floor);
    },
    
    createCoralReefs: function() {
        // Create various coral shapes
        const coralShapes = [
            new THREE.SphereGeometry(0.8, 8, 6),
            new THREE.ConeGeometry(0.6, 2, 6),
            new THREE.CylinderGeometry(0.3, 0.8, 1.5, 8)
        ];
        
        const coralColors = [0xFF6B6B, 0xFF8E53, 0xFF6B9D, 0x4ECDC4, 0x45B7D1];
        
        // Create coral reef clusters
        for (let i = 0; i < 20; i++) {
            const coralGeometry = coralShapes[Math.floor(Math.random() * coralShapes.length)];
            const coralMaterial = new THREE.MeshLambertMaterial({ 
                color: coralColors[Math.floor(Math.random() * coralColors.length)]
            });
            
            const coral = new THREE.Mesh(coralGeometry, coralMaterial);
            coral.position.set(
                (Math.random() - 0.5) * 8,
                -0.5 + Math.random() * 2,
                -Math.random() * 200 - 30
            );
            coral.rotation.y = Math.random() * Math.PI * 2;
            coral.scale.setScalar(0.8 + Math.random() * 0.6);
            coral.userData = { type: 'coral', levelObject: true };
            this.scene.add(coral);
            this.objects.coralReefs.push(coral);
        }
    },
    
    createSeaweeds: function() {
        const seaweedGeometry = new THREE.PlaneGeometry(0.3, 3);
        const seaweedMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        // Create swaying seaweeds
        for (let i = 0; i < 30; i++) {
            const seaweed = new THREE.Mesh(seaweedGeometry, seaweedMaterial);
            seaweed.position.set(
                (Math.random() - 0.5) * 10,
                0.5,
                -Math.random() * 250 - 20
            );
            seaweed.rotation.y = Math.random() * Math.PI * 2;
            seaweed.userData = { 
                type: 'seaweed', 
                levelObject: true, 
                animated: true,
                swayOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(seaweed);
            this.objects.seaweeds.push(seaweed);
        }
    },
    
    createAncientRuins: function() {
        // Create broken columns
        const columnGeometry = new THREE.CylinderGeometry(0.8, 0.9, 6, 8);
        const ruinMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x708090,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 8; i++) {
            const column = new THREE.Mesh(columnGeometry, ruinMaterial);
            column.position.set(
                (i % 2 === 0) ? -3 : 3,
                2,
                -i * 15 - 40
            );
            column.rotation.z = (Math.random() - 0.5) * 0.3; // Slight tilt
            column.castShadow = true;
            column.userData = { type: 'ruinColumn', levelObject: true };
            this.scene.add(column);
            this.objects.ruins.push(column);
        }
        
        // Create broken walls
        const wallGeometry = new THREE.BoxGeometry(4, 3, 0.5);
        for (let i = 0; i < 4; i++) {
            const wall = new THREE.Mesh(wallGeometry, ruinMaterial);
            wall.position.set(0, 1.5, -i * 25 - 60);
            wall.rotation.y = (Math.random() - 0.5) * 0.2;
            wall.userData = { type: 'ruinWall', levelObject: true };
            this.scene.add(wall);
            this.objects.ruins.push(wall);
        }
    },
    
    createBubbleEffects: function() {
        // Create bubble streams
        for (let stream = 0; stream < 6; stream++) {
            for (let i = 0; i < 15; i++) {
                const bubbleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 8, 6);
                const bubbleMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xADD8E6,
                    transparent: true,
                    opacity: 0.6
                });
                
                const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
                bubble.position.set(
                    (stream - 3) * 2,
                    -1 + i * 0.8,
                    -stream * 20 - 30 - Math.random() * 50
                );
                bubble.userData = { 
                    type: 'bubble', 
                    levelObject: true, 
                    animated: true,
                    speed: 0.5 + Math.random() * 0.5
                };
                this.scene.add(bubble);
                this.objects.bubbleEffects.push(bubble);
            }
        }
    },
    
    createFishSchools: function() {
        const fishGeometry = new THREE.ConeGeometry(0.1, 0.4, 4);
        const fishColors = [0xFF6B6B, 0xFFE66D, 0x4ECDC4, 0x45B7D1, 0xA8E6CF];
        
        // Create fish schools
        for (let school = 0; school < 3; school++) {
            const schoolColor = fishColors[Math.floor(Math.random() * fishColors.length)];
            
            for (let i = 0; i < 12; i++) {
                const fishMaterial = new THREE.MeshLambertMaterial({ color: schoolColor });
                const fish = new THREE.Mesh(fishGeometry, fishMaterial);
                
                const schoolCenter = {
                    x: (Math.random() - 0.5) * 6,
                    y: 2 + Math.random() * 3,
                    z: -school * 40 - 50 - Math.random() * 30
                };
                
                fish.position.set(
                    schoolCenter.x + (Math.random() - 0.5) * 3,
                    schoolCenter.y + (Math.random() - 0.5) * 2,
                    schoolCenter.z + (Math.random() - 0.5) * 5
                );
                
                fish.rotation.y = Math.random() * Math.PI * 2;
                fish.userData = { 
                    type: 'fish', 
                    levelObject: true, 
                    animated: true,
                    schoolId: school,
                    swimOffset: Math.random() * Math.PI * 2
                };
                this.scene.add(fish);
                this.objects.fishSchools.push(fish);
            }
        }
    },
    
    createJellyfish: function() {
        const jellyfishBodyGeometry = new THREE.SphereGeometry(0.8, 12, 8);
        const jellyfishMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xE6E6FA,
            transparent: true,
            opacity: 0.7
        });
        
        // Create floating jellyfish
        for (let i = 0; i < 5; i++) {
            const jellyfish = new THREE.Mesh(jellyfishBodyGeometry, jellyfishMaterial);
            jellyfish.position.set(
                (Math.random() - 0.5) * 8,
                4 + Math.random() * 2,
                -i * 30 - 70
            );
            jellyfish.userData = { 
                type: 'jellyfish', 
                levelObject: true, 
                animated: true,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(jellyfish);
            this.objects.jellyfish.push(jellyfish);
            
            // Add tentacles
            this.createTentacles(jellyfish);
        }
    },
    
    createTentacles: function(jellyfish) {
        const tentacleGeometry = new THREE.CylinderGeometry(0.05, 0.02, 2, 4);
        const tentacleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xE6E6FA,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < 6; i++) {
            const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
            tentacle.position.set(
                jellyfish.position.x + (Math.random() - 0.5) * 1.2,
                jellyfish.position.y - 1.5,
                jellyfish.position.z + (Math.random() - 0.5) * 1.2
            );
            tentacle.userData = { 
                type: 'tentacle', 
                levelObject: true, 
                animated: true,
                parentJellyfish: jellyfish
            };
            this.scene.add(tentacle);
            this.objects.jellyfish.push(tentacle);
        }
    },
    
    createSunbeams: function() {
        const beamGeometry = new THREE.ConeGeometry(0.1, 15, 8, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        // Create god rays filtering down
        for (let i = 0; i < 4; i++) {
            const sunbeam = new THREE.Mesh(beamGeometry, beamMaterial);
            sunbeam.position.set(
                (i - 2) * 3,
                7,
                -i * 25 - 50
            );
            sunbeam.userData = { type: 'sunbeam', levelObject: true, animated: true };
            this.scene.add(sunbeam);
            this.objects.sunbeams.push(sunbeam);
        }
    },
    
    createCausticEffects: function() {
        // Create water surface caustic patterns
        const causticGeometry = new THREE.PlaneGeometry(10, 10);
        const causticMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        for (let i = 0; i < 6; i++) {
            const caustic = new THREE.Mesh(causticGeometry, causticMaterial);
            caustic.position.set(0, -0.8, -i * 20 - 30);
            caustic.rotation.x = -Math.PI / 2;
            caustic.userData = { type: 'caustic', levelObject: true, animated: true };
            this.scene.add(caustic);
            this.objects.causticEffects.push(caustic);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate seaweeds swaying
        this.objects.seaweeds.forEach((seaweed, index) => {
            seaweed.rotation.z = Math.sin(time * 1.5 + seaweed.userData.swayOffset) * 0.3;
        });
        
        // Animate bubbles rising
        this.objects.bubbleEffects.forEach((bubble, index) => {
            bubble.position.y += deltaTime * bubble.userData.speed;
            if (bubble.position.y > 8) {
                bubble.position.y = -1;
            }
            bubble.rotation.x += deltaTime * 0.5;
        });
        
        // Animate fish swimming
        this.objects.fishSchools.forEach((fish, index) => {
            const offset = fish.userData.swimOffset;
            fish.position.x += Math.sin(time * 2 + offset) * deltaTime * 0.5;
            fish.position.y += Math.cos(time * 1.5 + offset) * deltaTime * 0.3;
            fish.rotation.y += deltaTime * 0.2;
        });
        
        // Animate jellyfish floating
        this.objects.jellyfish.forEach((jellyfish, index) => {
            if (jellyfish.userData.type === 'jellyfish') {
                const offset = jellyfish.userData.floatOffset;
                jellyfish.position.y += Math.sin(time + offset) * deltaTime * 0.2;
                jellyfish.scale.y = 1 + 0.1 * Math.sin(time * 2 + offset);
            }
        });
        
        // Animate sunbeams
        this.objects.sunbeams.forEach((beam, index) => {
            beam.material.opacity = 0.1 + 0.2 * Math.sin(time + index);
            beam.rotation.z += deltaTime * 0.1;
        });
        
        // Animate caustic effects
        this.objects.causticEffects.forEach((caustic, index) => {
            caustic.material.opacity = 0.2 + 0.2 * Math.sin(time * 2 + index);
            caustic.rotation.z += deltaTime * 0.3;
        });
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
        
        console.log('🌊 Level 5 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level5;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(5, Level5);
    console.log('✅ Level 5: Underwater Ruins registered');
}