// Level8.js - Sky Fortress
const Level8 = {
    name: "Sky Fortress",
    description: "Floating citadel among the clouds with wind effects and aerial obstacles",
    id: 8,
    
    // Store references to level-specific objects
    objects: {
        cloudFormations: [],
        windStreams: [],
        floatingPlatforms: [],
        skyBridges: [],
        windmills: [],
        balloons: [],
        birds: [],
        lightningEffects: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('☁️ Loading Level 8: Sky Fortress');
        
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
        
        // Update fog and renderer for sky atmosphere
        scene.fog = new THREE.FogExp2(0x87CEEB, 0.008); // Light blue sky fog
        renderer.setClearColor(0x87CEEB);
        
        // Update ambient lighting to sky ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x87CEEB);
            ambientLight.intensity = 1.0;
        }
        
        // Add bright sun light
        const dirLight = new THREE.DirectionalLight(0xFFFFE0, 1.2);
        dirLight.position.set(10, 15, 5);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createSkyPlatform();
        this.createCloudFormations();
        this.createFloatingPlatforms();
        this.createSkyBridges();
        this.createWindStreams();
        this.createWindmills();
        this.createBalloons();
        this.createBirds();
        this.createLightningEffects();
    },
    
    createSkyPlatform: function() {
        // Create main floating platform
        const platformGeometry = new THREE.BoxGeometry(10, 1, 300);
        const platformMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xD2B48C,
            transparent: true,
            opacity: 0.9
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, -0.5, -150);
        platform.castShadow = true;
        platform.receiveShadow = true;
        platform.userData = { type: 'skyPlatform', levelObject: true };
        this.scene.add(platform);
        this.objects.floatingPlatforms.push(platform);
    },
    
    createCloudFormations: function() {
        const cloudGeometry = new THREE.SphereGeometry(2, 12, 8);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        
        // Create volumetric cloud clusters
        for (let i = 0; i < 20; i++) {
            const cloudCluster = new THREE.Group();
            
            // Create multiple spheres for each cloud
            for (let j = 0; j < 4; j++) {
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloud.position.set(
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 3
                );
                cloud.scale.setScalar(0.5 + Math.random() * 0.8);
                cloudCluster.add(cloud);
            }
            
            cloudCluster.position.set(
                (Math.random() - 0.5) * 20,
                3 + Math.random() * 8,
                -i * 15 - 30
            );
            cloudCluster.userData = { 
                type: 'cloudFormation', 
                levelObject: true, 
                animated: true,
                driftSpeed: 0.2 + Math.random() * 0.3
            };
            this.scene.add(cloudCluster);
            this.objects.cloudFormations.push(cloudCluster);
        }
    },
    
    createFloatingPlatforms: function() {
        // Create additional floating platforms
        const smallPlatformGeometry = new THREE.BoxGeometry(3, 0.5, 3);
        const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        
        for (let i = 0; i < 12; i++) {
            const platform = new THREE.Mesh(smallPlatformGeometry, platformMaterial);
            platform.position.set(
                (Math.random() - 0.5) * 12,
                1 + Math.random() * 4,
                -i * 20 - 40
            );
            platform.rotation.y = Math.random() * Math.PI * 2;
            platform.castShadow = true;
            platform.userData = { 
                type: 'floatingPlatform', 
                levelObject: true, 
                animated: true,
                bobOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(platform);
            this.objects.floatingPlatforms.push(platform);
        }
    },
    
    createSkyBridges: function() {
        // Create rope bridges between platforms
        const bridgeGeometry = new THREE.PlaneGeometry(6, 0.5);
        const bridgeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 6; i++) {
            const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
            bridge.position.set(0, 2, -i * 30 - 60);
            bridge.rotation.x = -Math.PI / 2;
            bridge.userData = { 
                type: 'skyBridge', 
                levelObject: true, 
                animated: true,
                swayOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(bridge);
            this.objects.skyBridges.push(bridge);
            
            // Add rope supports
            this.createBridgeRopes(bridge);
        }
    },
    
    createBridgeRopes: function(bridge) {
        const ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 6);
        const ropeMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        // Left rope
        const leftRope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        leftRope.position.set(bridge.position.x - 2.5, bridge.position.y + 2, bridge.position.z);
        leftRope.userData = { type: 'bridgeRope', levelObject: true, animated: true };
        this.scene.add(leftRope);
        this.objects.skyBridges.push(leftRope);
        
        // Right rope
        const rightRope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rightRope.position.set(bridge.position.x + 2.5, bridge.position.y + 2, bridge.position.z);
        rightRope.userData = { type: 'bridgeRope', levelObject: true, animated: true };
        this.scene.add(rightRope);
        this.objects.skyBridges.push(rightRope);
    },
    
    createWindStreams: function() {
        // Create visible wind streams
        const windGeometry = new THREE.ConeGeometry(0.2, 8, 8, 1, true);
        const windMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xE0E0E0,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 8; i++) {
            const wind = new THREE.Mesh(windGeometry, windMaterial);
            wind.position.set(
                (Math.random() - 0.5) * 10,
                3 + Math.random() * 3,
                -i * 18 - 35
            );
            wind.rotation.set(
                Math.random() * 0.5,
                Math.random() * Math.PI * 2,
                Math.random() * 0.5
            );
            wind.userData = { type: 'windStream', levelObject: true, animated: true };
            this.scene.add(wind);
            this.objects.windStreams.push(wind);
        }
    },
    
    createWindmills: function() {
        // Create windmill structures
        const towerGeometry = new THREE.CylinderGeometry(0.3, 0.4, 6, 8);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
        
        for (let i = 0; i < 4; i++) {
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(
                (i % 2 === 0) ? -4 : 4,
                3,
                -i * 40 - 50
            );
            tower.userData = { type: 'windmillTower', levelObject: true };
            this.scene.add(tower);
            this.objects.windmills.push(tower);
            
            // Create windmill blades
            this.createWindmillBlades(tower);
        }
    },
    
    createWindmillBlades: function(tower) {
        const bladeGroup = new THREE.Group();
        const bladeGeometry = new THREE.PlaneGeometry(0.3, 4);
        const bladeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7D6B,
            side: THREE.DoubleSide
        });
        
        // Create 4 blades
        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(0, 2, 0);
            blade.rotation.z = (i * Math.PI) / 2;
            bladeGroup.add(blade);
        }
        
        bladeGroup.position.copy(tower.position);
        bladeGroup.position.y += 3;
        bladeGroup.userData = { 
            type: 'windmillBlades', 
            levelObject: true, 
            animated: true,
            spinSpeed: 1 + Math.random() * 2
        };
        this.scene.add(bladeGroup);
        this.objects.windmills.push(bladeGroup);
    },
    
    createBalloons: function() {
        const balloonGeometry = new THREE.SphereGeometry(1, 12, 8);
        const balloonColors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA726, 0x9C27B0];
        
        // Create hot air balloons
        for (let i = 0; i < 6; i++) {
            const balloonColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
            const balloonMaterial = new THREE.MeshLambertMaterial({ color: balloonColor });
            
            const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
            balloon.position.set(
                (Math.random() - 0.5) * 15,
                6 + Math.random() * 4,
                -i * 25 - 70
            );
            balloon.userData = { 
                type: 'balloon', 
                levelObject: true, 
                animated: true,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(balloon);
            this.objects.balloons.push(balloon);
            
            // Add basket
            const basketGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
            const basketMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const basket = new THREE.Mesh(basketGeometry, basketMaterial);
            basket.position.copy(balloon.position);
            basket.position.y -= 2;
            basket.userData = { type: 'balloonBasket', levelObject: true, animated: true };
            this.scene.add(basket);
            this.objects.balloons.push(basket);
        }
    },
    
    createBirds: function() {
        // Create simple bird shapes
        const birdGeometry = new THREE.ConeGeometry(0.1, 0.3, 3);
        const birdMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        
        // Create flocks of birds
        for (let flock = 0; flock < 3; flock++) {
            for (let i = 0; i < 8; i++) {
                const bird = new THREE.Mesh(birdGeometry, birdMaterial);
                
                const flockCenter = {
                    x: (flock - 1) * 8,
                    y: 8 + Math.random() * 3,
                    z: -flock * 50 - 80 - Math.random() * 20
                };
                
                bird.position.set(
                    flockCenter.x + (Math.random() - 0.5) * 4,
                    flockCenter.y + (Math.random() - 0.5) * 2,
                    flockCenter.z + (Math.random() - 0.5) * 8
                );
                
                bird.rotation.y = Math.random() * Math.PI * 2;
                bird.userData = { 
                    type: 'bird', 
                    levelObject: true, 
                    animated: true,
                    flockId: flock,
                    flyOffset: Math.random() * Math.PI * 2
                };
                this.scene.add(bird);
                this.objects.birds.push(bird);
            }
        }
    },
    
    createLightningEffects: function() {
        // Create distant lightning flashes
        const lightningGeometry = new THREE.PlaneGeometry(0.2, 8);
        const lightningMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.0,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1.0
        });
        
        for (let i = 0; i < 4; i++) {
            const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
            lightning.position.set(
                (Math.random() - 0.5) * 20,
                10 + Math.random() * 5,
                -i * 60 - 100
            );
            lightning.userData = { 
                type: 'lightning', 
                levelObject: true, 
                animated: true,
                flashTimer: Math.random() * 5
            };
            this.scene.add(lightning);
            this.objects.lightningEffects.push(lightning);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate clouds drifting
        this.objects.cloudFormations.forEach((cloud, index) => {
            cloud.position.x += deltaTime * cloud.userData.driftSpeed;
            if (cloud.position.x > 15) cloud.position.x = -15;
            cloud.position.y += Math.sin(time * 0.5 + index) * deltaTime * 0.1;
        });
        
        // Animate floating platforms bobbing
        this.objects.floatingPlatforms.forEach((platform, index) => {
            if (platform.userData.type === 'floatingPlatform') {
                const offset = platform.userData.bobOffset;
                platform.position.y += Math.sin(time * 1.5 + offset) * deltaTime * 0.3;
            }
        });
        
        // Animate sky bridges swaying
        this.objects.skyBridges.forEach((bridge, index) => {
            if (bridge.userData.type === 'skyBridge') {
                const offset = bridge.userData.swayOffset;
                bridge.rotation.z = Math.sin(time + offset) * 0.1;
            } else if (bridge.userData.type === 'bridgeRope') {
                bridge.rotation.z = Math.sin(time * 1.2 + index) * 0.05;
            }
        });
        
        // Animate wind streams
        this.objects.windStreams.forEach((wind, index) => {
            wind.rotation.z += deltaTime * 2;
            wind.material.opacity = 0.2 + 0.2 * Math.sin(time * 2 + index);
        });
        
        // Animate windmill blades
        this.objects.windmills.forEach((windmill, index) => {
            if (windmill.userData.type === 'windmillBlades') {
                windmill.rotation.z += deltaTime * windmill.userData.spinSpeed;
            }
        });
        
        // Animate balloons floating
        this.objects.balloons.forEach((balloon, index) => {
            if (balloon.userData.type === 'balloon') {
                const offset = balloon.userData.floatOffset;
                balloon.position.y += Math.sin(time * 0.8 + offset) * deltaTime * 0.2;
            } else if (balloon.userData.type === 'balloonBasket') {
                // Follow balloon movement (simplified)
                balloon.position.y += Math.sin(time * 0.8 + index) * deltaTime * 0.2;
            }
        });
        
        // Animate birds flying
        this.objects.birds.forEach((bird, index) => {
            const offset = bird.userData.flyOffset;
            bird.position.y += Math.sin(time * 2 + offset) * deltaTime * 0.3;
            bird.position.x += Math.cos(time * 1.5 + offset) * deltaTime * 0.2;
            bird.rotation.z = Math.sin(time * 3 + offset) * 0.2; // Wing flapping
        });
        
        // Animate lightning flashes
        this.objects.lightningEffects.forEach((lightning, index) => {
            lightning.userData.flashTimer += deltaTime;
            if (lightning.userData.flashTimer > 3 + Math.random() * 5) {
                lightning.material.opacity = 1.0;
                setTimeout(() => {
                    lightning.material.opacity = 0.0;
                    lightning.userData.flashTimer = 0;
                }, 100 + Math.random() * 200);
            }
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
        
        console.log('☁️ Level 8 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level8;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(8, Level8);
    console.log('✅ Level 8: Sky Fortress registered');
}