/**
 * Level 1: Subway Daylight
 * Classic subway tunnel environment
 * 
 * @module Level1_Subway
 */

class Level1_Subway extends LevelBase {
    constructor() {
        super(1, 'Subway Daylight', {
            // Visual settings
            fogColor: '#87CEEB',
            fogDensity: 0.02,
            skyColor: '#87CEEB',
            ambientIntensity: 0.6,
            sunIntensity: 0.8,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.0,
            obstacleSpawnMultiplier: 1.0,
            collectibleSpawnMultiplier: 1.0,
            
            // Level-specific features
            hasSpecialMechanics: false
        });
        
        // Level-specific objects
        this.streetElements = [];
        this.trafficCones = [];
        this.buildings = [];
    }
    
    /**
     * Create the subway environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create street lines
        this.createStreetLines();
        
        // Create sidewalks
        this.createSidewalks();
        
        // Create street lights
        this.createStreetLights();
        
        // Create buildings
        this.createBuildings();
        
        // Create traffic elements
        this.createTrafficElements();
        
        // Create sun/moon
        this.createCelestialBodies();
        
        // Create background elements
        this.createBackgroundElements();
        
        console.log('[Level 1] Subway environment created');
    }
    
    /**
     * Create street lines
     */
    createStreetLines() {
        const lineGeometry = new THREE.BoxGeometry(0.2, 0.02, 5);
        const lineMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.1
        });
        
        for (let i = 0; i < 50; i++) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, 0.01, -i * 10);
            line.userData = { type: 'streetLine' };
            this.streetElements.push(line);
            this.environmentGroup.add(line);
        }
    }
    
    /**
     * Create sidewalks
     */
    createSidewalks() {
        const sidewalkGeometry = new THREE.BoxGeometry(4, 0.2, 200);
        const sidewalkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x808080 
        });
        
        // Left sidewalk
        const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
        leftSidewalk.position.set(-7, 0.1, -100);
        leftSidewalk.receiveShadow = true;
        leftSidewalk.userData = { type: 'sidewalk' };
        this.environmentGroup.add(leftSidewalk);
        
        // Right sidewalk
        const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
        rightSidewalk.position.set(7, 0.1, -100);
        rightSidewalk.receiveShadow = true;
        rightSidewalk.userData = { type: 'sidewalk' };
        this.environmentGroup.add(rightSidewalk);
    }
    
    /**
     * Create street lights
     */
    createStreetLights() {
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        const lampGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const lampMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF99,
            emissive: 0xFFFF99,
            emissiveIntensity: 0.5
        });
        
        for (let i = 0; i < 20; i++) {
            const lightPost = new THREE.Group();
            
            // Pole
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.y = 3;
            pole.castShadow = true;
            lightPost.add(pole);
            
            // Lamp
            const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
            lamp.position.y = 6;
            lightPost.add(lamp);
            
            // Add point light
            const pointLight = new THREE.PointLight(0xFFFF99, 0.5, 10);
            pointLight.position.y = 6;
            pointLight.castShadow = true;
            lightPost.add(pointLight);
            
            // Position alternating sides
            lightPost.position.set(
                i % 2 === 0 ? -8 : 8,
                0,
                -i * 15 - 10
            );
            
            lightPost.userData = { type: 'streetLight' };
            this.environmentGroup.add(lightPost);
        }
    }
    
    /**
     * Create buildings
     */
    createBuildings() {
        const buildingColors = [0x8B7355, 0xA0522D, 0xCD853F, 0xDEB887, 0xF4A460];
        
        for (let i = 0; i < 30; i++) {
            // Left side buildings
            const leftBuilding = this.createBuilding(
                4 + Math.random() * 6,
                10 + Math.random() * 20,
                4 + Math.random() * 6,
                buildingColors[Math.floor(Math.random() * buildingColors.length)],
                new THREE.Vector3(-20 - Math.random() * 10, 0, -i * 12)
            );
            this.buildings.push(leftBuilding);
            this.environmentGroup.add(leftBuilding);
            
            // Right side buildings
            const rightBuilding = this.createBuilding(
                4 + Math.random() * 6,
                10 + Math.random() * 20,
                4 + Math.random() * 6,
                buildingColors[Math.floor(Math.random() * buildingColors.length)],
                new THREE.Vector3(20 + Math.random() * 10, 0, -i * 12)
            );
            this.buildings.push(rightBuilding);
            this.environmentGroup.add(rightBuilding);
            
            // Add windows to buildings
            this.addWindowsToBuilding(leftBuilding);
            this.addWindowsToBuilding(rightBuilding);
        }
    }
    
    /**
     * Add windows to a building
     */
    addWindowsToBuilding(building) {
        const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.3
        });
        
        const floors = Math.floor(building.geometry.parameters.height / 3);
        const windowsPerFloor = 3;
        
        for (let floor = 0; floor < floors; floor++) {
            for (let w = 0; w < windowsPerFloor; w++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                // Front windows
                window.position.set(
                    (w - 1) * 1.5,
                    floor * 3 + 1.5,
                    building.geometry.parameters.depth / 2 + 0.01
                );
                building.add(window);
                
                // Side windows if building is wide enough
                if (building.geometry.parameters.width > 6) {
                    const sideWindow = window.clone();
                    sideWindow.rotation.y = Math.PI / 2;
                    sideWindow.position.set(
                        building.geometry.parameters.width / 2 + 0.01,
                        floor * 3 + 1.5,
                        (w - 1) * 1.5
                    );
                    building.add(sideWindow);
                }
            }
        }
    }
    
    /**
     * Create traffic elements
     */
    createTrafficElements() {
        const coneGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const coneMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF6600,
            emissive: 0xFF6600,
            emissiveIntensity: 0.1
        });
        
        // Traffic cones
        for (let i = 0; i < 15; i++) {
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.set(
                (Math.random() - 0.5) * 6,
                0.5,
                -i * 20 - Math.random() * 10
            );
            cone.castShadow = true;
            cone.userData = { type: 'trafficCone' };
            this.trafficCones.push(cone);
            this.environmentGroup.add(cone);
        }
        
        // Road signs
        this.createRoadSigns();
    }
    
    /**
     * Create road signs
     */
    createRoadSigns() {
        for (let i = 0; i < 8; i++) {
            const signPost = new THREE.Group();
            
            // Post
            const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
            const postMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 1.5;
            signPost.add(post);
            
            // Sign
            const signGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
            const signMaterial = new THREE.MeshLambertMaterial({ 
                color: i % 3 === 0 ? 0xFFFF00 : (i % 3 === 1 ? 0xFF0000 : 0x00FF00)
            });
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.y = 3;
            signPost.add(sign);
            
            signPost.position.set(
                i % 2 === 0 ? -5 : 5,
                0,
                -i * 25 - 15
            );
            
            signPost.userData = { type: 'roadSign' };
            this.environmentGroup.add(signPost);
        }
    }
    
    /**
     * Create celestial bodies (sun/moon)
     */
    createCelestialBodies() {
        // Sun
        const sunGeometry = new THREE.SphereGeometry(5, 16, 16);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(50, 50, -100);
        sun.userData = { type: 'sun' };
        this.environmentGroup.add(sun);
        
        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(8, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF88,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sun.position);
        this.environmentGroup.add(glow);
    }
    
    /**
     * Create background elements
     */
    createBackgroundElements() {
        // Distant mountains
        const mountainGeometry = new THREE.ConeGeometry(30, 40, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4A5F7A,
            fog: false
        });
        
        for (let i = 0; i < 5; i++) {
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(
                -100 + i * 50,
                20,
                -200
            );
            mountain.scale.x = 1.5 + Math.random();
            mountain.scale.z = 1.5 + Math.random();
            mountain.userData = { type: 'mountain' };
            this.environmentGroup.add(mountain);
        }
        
        // Clouds
        this.createClouds();
    }
    
    /**
     * Create clouds
     */
    createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(10, 8, 6);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 10; i++) {
            const cloud = new THREE.Group();
            
            // Create cloud from multiple spheres
            for (let j = 0; j < 4; j++) {
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.set(
                    Math.random() * 10 - 5,
                    Math.random() * 3,
                    Math.random() * 10 - 5
                );
                cloudPart.scale.set(
                    0.5 + Math.random() * 0.5,
                    0.5 + Math.random() * 0.5,
                    0.5 + Math.random() * 0.5
                );
                cloud.add(cloudPart);
            }
            
            cloud.position.set(
                -50 + Math.random() * 100,
                40 + Math.random() * 20,
                -100 - Math.random() * 100
            );
            
            cloud.userData = { 
                type: 'cloud',
                speed: 0.1 + Math.random() * 0.2
            };
            
            this.environmentGroup.add(cloud);
        }
    }
    
    /**
     * Update dynamic objects
     */
    updateDynamicObjects(deltaTime, gameState) {
        // Update clouds
        this.environmentGroup.children.forEach(child => {
            if (child.userData.type === 'cloud') {
                child.position.x += child.userData.speed * deltaTime;
                if (child.position.x > 100) {
                    child.position.x = -100;
                }
            }
        });
        
        // Animate street lights
        const time = Date.now() * 0.001;
        this.environmentGroup.children.forEach(child => {
            if (child.userData.type === 'streetLight') {
                const lamp = child.children.find(c => c.type === 'Mesh' && c.geometry.type === 'SphereGeometry');
                if (lamp && lamp.material.emissiveIntensity !== undefined) {
                    lamp.material.emissiveIntensity = 0.4 + Math.sin(time * 2) * 0.1;
                }
            }
        });
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.streetElements = [];
        this.trafficCones = [];
        this.buildings = [];
        
        console.log('[Level 1] Subway level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level1 = new Level1_Subway();
    window.LevelManagerPro.registerLevel(level1);
    console.log('[Level 1] Subway level registered');
}

// Export for use
window.Level1_Subway = Level1_Subway;