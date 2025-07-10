/**
 * Level 2: Neon Night Run
 * Cyberpunk city environment
 * 
 * @module Level2_Neon
 */

class Level2_Neon extends LevelBase {
    constructor() {
        super(2, 'Neon Night Run', {
            // Visual settings
            fogColor: '#001133',
            fogDensity: 0.025,
            skyColor: '#000033',
            ambientIntensity: 0.3,
            sunIntensity: 0.2,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.2,
            obstacleSpawnMultiplier: 1.1,
            collectibleSpawnMultiplier: 1.0,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['neonGlow', 'digitalRain', 'flyingVehicles']
        });
        
        // Level-specific objects
        this.cyberpunkBuildings = [];
        this.billboards = [];
        this.flyingVehicles = [];
        this.digitalRainDrops = [];
        this.groundProjections = [];
        this.neonLights = [];
    }
    
    async createEnvironment(scene, resourceManager) {
        // Remove regular street elements
        scene.children.forEach(child => {
            if (child.userData && (child.userData.type === 'streetLine' || 
                child.userData.type === 'sidewalk')) {
                child.visible = false;
            }
        });
        
        // Enhanced neon grid floor
        this.createNeonGrid();
        
        // Create cyberpunk buildings
        this.createCyberpunkCity();
        
        // Create neon street lights
        this.createNeonStreetLights();
        
        // Create holographic billboards
        this.createHolographicBillboards();
        
        // Create flying vehicles
        this.createFlyingVehicles();
        
        // Create digital rain effect
        this.createDigitalRain();
        
        // Create holographic ground projections
        this.createGroundProjections();
        
        // Update ambient light to cyberpunk colors
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x221155);
        }
        
        console.log('[Level 2] Neon Night Run environment created');
    }
    
    createNeonGrid() {
        const gridHelper = new THREE.GridHelper(100, 50, 0x00FFFF, 0x004444);
        gridHelper.position.y = -0.95;
        gridHelper.userData = { 
            type: 'level2Grid',
            pulseSpeed: 2.0,
            baseIntensity: 0.5
        };
        this.environmentGroup.add(gridHelper);
        
        // Add pulsing animation
        this.registerUpdateCallback((dt) => {
            const time = Date.now() * 0.001;
            gridHelper.material.opacity = 0.5 + Math.sin(time * 2) * 0.2;
        });
    }
    
    createNeonStreetLights() {
        for (let i = 0; i < 30; i++) {
            const lightPost = new THREE.Group();
            
            // Light post structure
            const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
            const postMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x333355,
                emissive: 0x111133
            });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 4;
            lightPost.add(post);
            
            // Neon light head
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
            
            // Add point light
            const pointLight = new THREE.PointLight(lightColor, 0.8, 15);
            pointLight.position.y = 8;
            lightPost.add(pointLight);
            this.lights.push(pointLight);
            
            // Create continuous particle stream
            this.createNeonParticleStream(0, 8, lightColor, lightPost);
            
            lightPost.position.set(
                Math.random() > 0.5 ? -8 : 8,
                0,
                -i * 6 - 5
            );
            lightPost.userData = { type: 'neonStreetLight' };
            this.environmentGroup.add(lightPost);
            this.neonLights.push(lightPost);
        }
    }
    
    createNeonParticleStream(x, y, color, parent) {
        // Create continuous neon particles
        this.registerUpdateCallback((dt) => {
            if (Math.random() < 0.5) {
                const particle = this.createParticle(
                    new THREE.Vector3(
                        parent.position.x + x + (Math.random() - 0.5) * 0.3,
                        y,
                        parent.position.z + (Math.random() - 0.5) * 0.3
                    ),
                    {
                        size: 0.03,
                        color: color,
                        lifetime: 3.0,
                        velocity: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.01,
                            -0.02 - Math.random() * 0.01,
                            (Math.random() - 0.5) * 0.01
                        ),
                        gravity: 0,
                        fadeOut: true
                    }
                );
                particle.material.opacity = 0.6;
                particle.material.emissive = new THREE.Color(color);
                particle.material.emissiveIntensity = 0.8;
            }
        });
    }
    
    createCyberpunkCity() {
        for (let i = 0; i < 25; i++) {
            this.createCyberpunkBuilding(-20 - Math.random() * 15, -i * 8, 'left');
            this.createCyberpunkBuilding(20 + Math.random() * 15, -i * 8, 'right');
        }
    }
    
    createCyberpunkBuilding(x, z, side) {
        const buildingGroup = new THREE.Group();
        
        const width = 6 + Math.random() * 4;
        const depth = 6 + Math.random() * 4;
        const height = 20 + Math.random() * 30;
        
        // Dark metallic building
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x111122,
            emissive: 0x000011,
            emissiveIntensity: 0.2
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        buildingGroup.add(building);
        
        // Neon edge lighting
        const edgeGeometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1);
        const edgeMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF,
            wireframe: true
        });
        const edges = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edges.position.y = height / 2;
        buildingGroup.add(edges);
        
        // Glowing windows
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
                
                // Animate window
                window.userData = {
                    pulseSpeed: 1 + Math.random() * 2,
                    baseIntensity: 0.5 + Math.random() * 0.3
                };
                
                buildingGroup.add(window);
            }
        }
        
        buildingGroup.position.set(x, 0, z);
        buildingGroup.userData = { 
            type: 'cyberpunkBuilding', 
            initialZ: z,
            parallaxSpeed: 0.6 + Math.random() * 0.2
        };
        this.environmentGroup.add(buildingGroup);
        this.cyberpunkBuildings.push(buildingGroup);
    }
    
    createHolographicBillboards() {
        for (let i = 0; i < 15; i++) {
            this.createHolographicBillboard(-15, -i * 15 - 10);
            this.createHolographicBillboard(15, -i * 15 - 10);
        }
    }
    
    createHolographicBillboard(x, z) {
        const billboardGroup = new THREE.Group();
        
        // Billboard frame
        const frameGeometry = new THREE.BoxGeometry(4, 3, 0.1);
        const frameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x222222,
            emissive: 0x111111
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 5;
        billboardGroup.add(frame);
        
        // Holographic display
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
        
        // Animated scanlines
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
        this.environmentGroup.add(billboardGroup);
        this.billboards.push(billboardGroup);
    }
    
    createFlyingVehicles() {
        for (let i = 0; i < 8; i++) {
            this.createFlyingVehicle();
        }
    }
    
    createFlyingVehicle() {
        const vehicleGroup = new THREE.Group();
        
        // Futuristic vehicle body
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
        
        // Random flight path
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
        
        this.environmentGroup.add(vehicleGroup);
        this.flyingVehicles.push(vehicleGroup);
    }
    
    createDigitalRain() {
        const rainCount = 100;
        
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
            
            this.environmentGroup.add(drop);
            this.digitalRainDrops.push(drop);
        }
    }
    
    createGroundProjections() {
        for (let i = 0; i < 20; i++) {
            this.createHolographicGroundProjection(-i * 5);
        }
    }
    
    createHolographicGroundProjection(z) {
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
        
        this.environmentGroup.add(projection);
        this.groundProjections.push(projection);
    }
    
    updateDynamicObjects(deltaTime, gameState) {
        super.updateDynamicObjects(deltaTime, gameState);
        
        const time = Date.now() * 0.001;
        
        // Animate cyberpunk buildings
        this.cyberpunkBuildings.forEach(building => {
            building.children.forEach(child => {
                if (child.userData && child.userData.pulseSpeed) {
                    const pulse = Math.sin(time * child.userData.pulseSpeed);
                    child.material.emissiveIntensity = child.userData.baseIntensity + pulse * 0.2;
                }
            });
        });
        
        // Animate holographic billboards
        this.billboards.forEach(billboard => {
            billboard.children.forEach(child => {
                if (child.userData && child.userData.scanlineOffset !== undefined) {
                    // Flicker effect
                    if (Math.random() > 0.98) {
                        child.material.opacity = Math.random() > 0.5 ? 0.7 : 0.3;
                    }
                    
                    // Color shift
                    const hue = (time * 0.1) % 1;
                    child.material.color.setHSL(hue, 1, 0.5);
                }
            });
        });
        
        // Animate flying vehicles
        this.flyingVehicles.forEach(vehicle => {
            // Move forward
            vehicle.position.z += vehicle.userData.speed * deltaTime * 0.001;
            
            // Wobble effect
            vehicle.position.y = vehicle.userData.baseY + 
                Math.sin(time * vehicle.userData.wobbleSpeed) * 0.5;
            
            // Reset when out of view
            if (vehicle.position.z > 20) {
                vehicle.position.z = -100 - Math.random() * 50;
                vehicle.userData.side = Math.random() > 0.5 ? 1 : -1;
                vehicle.position.x = vehicle.userData.side * (20 + Math.random() * 10);
            }
        });
        
        // Animate digital rain
        this.digitalRainDrops.forEach(drop => {
            drop.position.y -= drop.userData.speed * deltaTime * 0.001;
            
            if (drop.position.y < -10) {
                drop.position.y = drop.userData.resetHeight;
                drop.position.x = (Math.random() - 0.5) * 100;
                drop.material.opacity = drop.userData.opacity;
            }
        });
        
        // Animate ground projections
        this.groundProjections.forEach(projection => {
            const pulse = Math.sin(time * projection.userData.pulseSpeed);
            projection.material.opacity = projection.userData.baseOpacity + pulse * 0.1;
            projection.scale.setScalar(1 + pulse * 0.1);
        });
    }
    
    onDispose() {
        // Clear arrays
        this.cyberpunkBuildings = [];
        this.billboards = [];
        this.flyingVehicles = [];
        this.digitalRainDrops = [];
        this.groundProjections = [];
        this.neonLights = [];
        
        console.log('[Level 2] Neon Night Run disposed');
    }
}

// Export for use
window.Level2_Neon = Level2_Neon;