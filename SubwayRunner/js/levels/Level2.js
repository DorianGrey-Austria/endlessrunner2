// Level2.js - Neon Night Run
const Level2 = {
    name: "Neon Night Run",
    description: "Cyberpunk city with neon lights and flying vehicles",
    id: 2,
    
    // Store references to level-specific objects
    objects: {
        cyberpunkBuildings: [],
        billboards: [],
        flyingVehicles: [],
        particles: [],
        digitalRain: null,
        gridHelper: null
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('🌃 Loading Level 2: Neon Night Run');
        
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
        
        // Update fog and renderer
        scene.fog = new THREE.FogExp2(0x001133, 0.025);
        renderer.setClearColor(0x001133);
        
        // Update ambient lighting
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x221155);
            ambientLight.intensity = 0.5;
        }
    },
    
    // Create the cyberpunk environment
    createEnvironment: function() {
        // Create neon grid floor
        this.createNeonGrid();
        
        // Create neon street lights
        this.createStreetLights();
        
        // Create cyberpunk buildings
        for (let i = 0; i < 25; i++) {
            this.createCyberpunkBuilding(-20 - Math.random() * 15, -i * 8, 'left');
            this.createCyberpunkBuilding(20 + Math.random() * 15, -i * 8, 'right');
        }
        
        // Create holographic billboards
        for (let i = 0; i < 15; i++) {
            this.createHolographicBillboard(-15, -i * 15 - 10);
            this.createHolographicBillboard(15, -i * 15 - 10);
        }
        
        // Create flying vehicles
        for (let i = 0; i < 8; i++) {
            this.createFlyingVehicle();
        }
        
        // Create digital rain effect
        this.createDigitalRain();
        
        // Create holographic ground projections
        for (let i = 0; i < 20; i++) {
            this.createHolographicGroundProjection(-i * 5);
        }
    },
    
    // Create neon grid floor
    createNeonGrid: function() {
        const gridHelper = new THREE.GridHelper(100, 50, 0x00FFFF, 0x004444);
        gridHelper.position.y = -0.95;
        gridHelper.userData = { 
            type: 'level2Grid',
            pulseSpeed: 2.0,
            baseIntensity: 0.5
        };
        this.scene.add(gridHelper);
        this.objects.gridHelper = gridHelper;
    },
    
    // Create neon street lights
    createStreetLights: function() {
        for (let i = 0; i < 30; i++) {
            const lightPost = new THREE.Group();
            
            // Light post
            const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
            const postMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x333355,
                emissive: 0x111133
            });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 4;
            lightPost.add(post);
            
            // Neon light
            const lightGeometry = new THREE.SphereGeometry(0.3, 12, 8);
            const lightColor = Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF;
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: lightColor,
                emissive: lightColor,
                emissiveIntensity: 1.0
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.y = 8;
            lightPost.add(light);
            
            // Add particle stream
            this.createNeonParticleStream(lightPost, 0, 8, lightColor);
            
            lightPost.position.set(
                Math.random() > 0.5 ? -8 : 8,
                0,
                -i * 6 - 5
            );
            lightPost.userData = { type: 'neonStreetLight' };
            this.scene.add(lightPost);
        }
    },
    
    // Create neon particle stream
    createNeonParticleStream: function(parent, x, y, color) {
        const particleCount = 15;
        const sharedGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        
        for (let i = 0; i < particleCount; i++) {
            const material = new THREE.MeshBasicMaterial({ 
                color: color,
                emissive: color,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.6
            });
            
            const particle = new THREE.Mesh(sharedGeometry, material);
            particle.position.set(
                x + (Math.random() - 0.5) * 0.3,
                y - i * 0.5,
                (Math.random() - 0.5) * 0.3
            );
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    -0.02 - Math.random() * 0.01,
                    (Math.random() - 0.5) * 0.01
                ),
                life: 1.0,
                decay: 0.003 + Math.random() * 0.002,
                pulse: Math.random() * Math.PI * 2
            };
            
            parent.add(particle);
            this.objects.particles.push(particle);
        }
    },
    
    // Create cyberpunk building
    createCyberpunkBuilding: function(x, z, side) {
        const buildingGroup = new THREE.Group();
        
        const width = 6 + Math.random() * 4;
        const depth = 6 + Math.random() * 4;
        const height = 20 + Math.random() * 30;
        
        // Building body
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x111122,
            emissive: 0x000011,
            emissiveIntensity: 0.2
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        buildingGroup.add(building);
        
        // Neon edges
        const edgeGeometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1);
        const edgeMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF,
            wireframe: true
        });
        const edges = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edges.position.y = height / 2;
        buildingGroup.add(edges);
        
        // Add glowing windows
        this.addBuildingWindows(buildingGroup, width, height, depth, side);
        
        buildingGroup.position.set(x, 0, z);
        buildingGroup.userData = { 
            type: 'cyberpunkBuilding', 
            initialZ: z,
            parallaxSpeed: 0.6 + Math.random() * 0.2
        };
        
        this.scene.add(buildingGroup);
        this.objects.cyberpunkBuildings.push(buildingGroup);
    },
    
    // Add windows to building
    addBuildingWindows: function(buildingGroup, width, height, depth, side) {
        const windowsPerFloor = Math.floor(width / 1.2);
        const floors = Math.floor(height / 2.5);
        
        for (let floor = 0; floor < floors; floor++) {
            for (let w = 0; w < windowsPerFloor; w++) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1.5);
                const windowColor = Math.random() > 0.7 ? 0x00FFFF : 
                                  (Math.random() > 0.5 ? 0xFF00FF : 0x0088FF);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: windowColor,
                    emissive: windowColor,
                    emissiveIntensity: 0.5
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                const windowX = -width/2 + 1 + w * 1.2;
                const windowY = floor * 2.5 + 2;
                const windowZ = side === 'left' ? depth/2 + 0.01 : -depth/2 - 0.01;
                
                window.position.set(windowX, windowY, windowZ);
                if (side === 'right') window.rotation.y = Math.PI;
                
                window.userData = {
                    pulseSpeed: 1 + Math.random() * 2,
                    baseIntensity: 0.5 + Math.random() * 0.3
                };
                
                buildingGroup.add(window);
            }
        }
    },
    
    // Create holographic billboard
    createHolographicBillboard: function(x, z) {
        const billboardGroup = new THREE.Group();
        
        // Frame
        const frameGeometry = new THREE.BoxGeometry(4, 3, 0.1);
        const frameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x222222,
            emissive: 0x111111
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 5;
        billboardGroup.add(frame);
        
        // Display
        const displayGeometry = new THREE.PlaneGeometry(3.8, 2.8);
        const displayMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.y = 5;
        display.position.z = 0.1;
        display.userData = {
            scanlineOffset: 0,
            flickerTime: 0
        };
        billboardGroup.add(display);
        
        billboardGroup.position.set(x, 0, z);
        billboardGroup.userData = { 
            type: 'holographicBillboard', 
            initialZ: z,
            parallaxSpeed: 0.7
        };
        
        this.scene.add(billboardGroup);
        this.objects.billboards.push(billboardGroup);
    },
    
    // Create flying vehicle
    createFlyingVehicle: function() {
        const vehicleGroup = new THREE.Group();
        
        // Vehicle body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444466,
            emissive: 0x222244
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        vehicleGroup.add(body);
        
        // Engine glow
        const glowGeometry = new THREE.SphereGeometry(0.3);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.8
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.x = -1;
        vehicleGroup.add(glow);
        
        // Position
        const side = Math.random() > 0.5 ? 1 : -1;
        vehicleGroup.position.set(
            side * (20 + Math.random() * 10),
            10 + Math.random() * 10,
            -50 - Math.random() * 50
        );
        
        vehicleGroup.userData = {
            type: 'flyingVehicle',
            speed: 20 + Math.random() * 10,
            direction: side,
            wobbleSpeed: 1 + Math.random() * 2,
            baseY: vehicleGroup.position.y
        };
        
        this.scene.add(vehicleGroup);
        this.objects.flyingVehicles.push(vehicleGroup);
    },
    
    // Create digital rain
    createDigitalRain: function() {
        const rainCount = 100;
        const digitalRain = new THREE.Group();
        
        for (let i = 0; i < rainCount; i++) {
            const dropGeometry = new THREE.PlaneGeometry(0.1, 0.5);
            const dropMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.7
            });
            const drop = new THREE.Mesh(dropGeometry, dropMaterial);
            
            drop.position.set(
                (Math.random() - 0.5) * 100,
                10 + Math.random() * 20,
                -Math.random() * 200
            );
            
            drop.userData = {
                speed: 5 + Math.random() * 10,
                resetHeight: 30,
                opacity: 0.3 + Math.random() * 0.4
            };
            
            digitalRain.add(drop);
        }
        
        digitalRain.userData = { type: 'digitalRain' };
        this.scene.add(digitalRain);
        this.objects.digitalRain = digitalRain;
    },
    
    // Create holographic ground projection
    createHolographicGroundProjection: function(z) {
        const projectionGeometry = new THREE.CircleGeometry(2, 16);
        const projectionMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const projection = new THREE.Mesh(projectionGeometry, projectionMaterial);
        
        projection.position.set(
            (Math.random() - 0.5) * 10,
            0.01,
            z
        );
        projection.rotation.x = -Math.PI / 2;
        
        projection.userData = {
            type: 'holographicProjection',
            pulseSpeed: 1 + Math.random() * 2,
            baseOpacity: 0.2 + Math.random() * 0.3
        };
        
        this.scene.add(projection);
    },
    
    // Update level animations
    update: function(deltaTime) {
        // Animate buildings
        this.objects.cyberpunkBuildings.forEach(building => {
            building.children.forEach(child => {
                if (child.userData && child.userData.pulseSpeed) {
                    const pulse = Math.sin(Date.now() * 0.001 * child.userData.pulseSpeed);
                    if (child.material.emissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = child.userData.baseIntensity + pulse * 0.2;
                    }
                }
            });
        });
        
        // Animate billboards
        this.objects.billboards.forEach(billboard => {
            billboard.children.forEach(child => {
                if (child.userData && child.userData.scanlineOffset !== undefined) {
                    // Flicker
                    if (Math.random() > 0.98) {
                        child.material.opacity = Math.random() > 0.5 ? 0.7 : 0.3;
                    }
                    // Color shift
                    const hue = (Date.now() * 0.0001) % 1;
                    child.material.color.setHSL(hue, 1, 0.5);
                }
            });
        });
        
        // Animate flying vehicles
        this.objects.flyingVehicles.forEach(vehicle => {
            vehicle.position.z += vehicle.userData.speed * deltaTime * 0.001;
            vehicle.position.y = vehicle.userData.baseY + 
                Math.sin(Date.now() * 0.001 * vehicle.userData.wobbleSpeed) * 2;
            
            if (vehicle.position.z > 100) {
                vehicle.position.z = -100 - Math.random() * 50;
                vehicle.userData.baseY = 10 + Math.random() * 10;
            }
        });
        
        // Animate digital rain
        if (this.objects.digitalRain) {
            this.objects.digitalRain.children.forEach(drop => {
                drop.position.y -= drop.userData.speed * deltaTime * 0.001;
                if (drop.position.y < -5) {
                    drop.position.y = drop.userData.resetHeight;
                }
            });
        }
    },
    
    // Cleanup level
    cleanup: function() {
        // Remove all level-specific objects
        Object.values(this.objects).forEach(objArray => {
            if (Array.isArray(objArray)) {
                objArray.forEach(obj => {
                    if (obj.parent) {
                        obj.parent.remove(obj);
                    }
                    // Dispose geometries and materials
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(m => m.dispose());
                        } else {
                            obj.material.dispose();
                        }
                    }
                });
            } else if (objArray && objArray.parent) {
                objArray.parent.remove(objArray);
            }
        });
        
        // Reset object arrays
        this.objects = {
            cyberpunkBuildings: [],
            billboards: [],
            flyingVehicles: [],
            particles: [],
            digitalRain: null,
            gridHelper: null
        };
    }
};

// Register with LevelManager
if (window.GameCore && window.GameCore.getModule('levels')) {
    window.GameCore.getModule('levels').registerLevel(2, Level2);
}