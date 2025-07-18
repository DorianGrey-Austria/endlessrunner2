/**
 * Level1_Subway - The classic subway environment level
 */
class Level1_Subway {
    constructor() {
        this.id = 1;
        this.name = "Subway Station";
        this.description = "Navigate through the urban subway tunnels";
        this.theme = "urban";
        this.backgroundColor = new THREE.Color(0x87CEEB);
        this.fogColor = new THREE.Color(0x87CEEB);
        this.fogDensity = 0.02;
        
        // Environment objects
        this.environmentGroup = new THREE.Group();
        this.buildings = [];
        this.streetLamps = [];
        this.obstacles = [];
        this.track = null;
        
        // Level-specific settings
        this.gameSpeed = 0.12;
        this.maxSpeed = 0.35;
        this.speedIncrease = 0.001;
        
        // Obstacle spawning
        this.obstacleSpawnRate = 0.02;
        this.obstacleTypes = ['barrier', 'cube', 'cone'];
        
        // Collectible spawning
        this.collectibleSpawnRate = 0.008;
        this.collectibleTypes = ['kiwi', 'broccoli'];
        
        this.isLoaded = false;
    }

    /**
     * Initialize the level
     */
    async init(gameEngine) {
        try {
            this.gameEngine = gameEngine;
            this.scene = gameEngine.getScene();
            
            // Set environment properties
            this.scene.background = this.backgroundColor;
            this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity);
            
            // Create level environment
            this.createTrack();
            this.createEnvironment();
            
            // Add environment to scene
            this.scene.add(this.environmentGroup);
            
            this.isLoaded = true;
            console.log('✅ Level1_Subway initialized');
            
        } catch (error) {
            console.error('❌ Level1_Subway initialization failed:', error);
            this.isLoaded = false;
        }
    }

    /**
     * Create the track/ground
     */
    createTrack() {
        // Main track
        const trackGeometry = new THREE.BoxGeometry(8, 0.2, 200);
        const trackMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.9
        });
        
        this.track = new THREE.Mesh(trackGeometry, trackMaterial);
        this.track.position.set(0, -0.1, 0);
        this.track.receiveShadow = true;
        this.environmentGroup.add(this.track);
        
        // Lane markers
        this.createLaneMarkers();
        
        // Track borders
        this.createTrackBorders();
    }

    /**
     * Create lane markers
     */
    createLaneMarkers() {
        const markerGeometry = new THREE.BoxGeometry(0.1, 0.05, 1);
        const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        
        for (let z = -100; z < 100; z += 4) {
            // Left lane marker
            const leftMarker = new THREE.Mesh(markerGeometry, markerMaterial);
            leftMarker.position.set(-1, 0.1, z);
            this.environmentGroup.add(leftMarker);
            
            // Right lane marker
            const rightMarker = new THREE.Mesh(markerGeometry, markerMaterial);
            rightMarker.position.set(1, 0.1, z);
            this.environmentGroup.add(rightMarker);
        }
    }

    /**
     * Create track borders
     */
    createTrackBorders() {
        const borderGeometry = new THREE.BoxGeometry(0.5, 1, 200);
        const borderMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        
        // Left border
        const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        leftBorder.position.set(-4.25, 0.5, 0);
        leftBorder.castShadow = true;
        this.environmentGroup.add(leftBorder);
        
        // Right border
        const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        rightBorder.position.set(4.25, 0.5, 0);
        rightBorder.castShadow = true;
        this.environmentGroup.add(rightBorder);
    }

    /**
     * Create environment objects
     */
    createEnvironment() {
        // Create buildings on both sides
        this.createBuildings();
        
        // Create street lamps
        this.createStreetLamps();
        
        // Create subway elements
        this.createSubwayElements();
    }

    /**
     * Create buildings along the track
     */
    createBuildings() {
        const buildingCount = 20;
        const buildingSpacing = 15;
        
        for (let i = 0; i < buildingCount; i++) {
            const z = (i - buildingCount / 2) * buildingSpacing;
            
            // Left side building
            const leftBuilding = this.createBuilding(-8, z, 'left');
            this.buildings.push(leftBuilding);
            this.environmentGroup.add(leftBuilding);
            
            // Right side building
            const rightBuilding = this.createBuilding(8, z, 'right');
            this.buildings.push(rightBuilding);
            this.environmentGroup.add(rightBuilding);
        }
    }

    /**
     * Create a single building
     */
    createBuilding(x, z, side) {
        const buildingGroup = new THREE.Group();
        
        // Random building dimensions
        const width = 3 + Math.random() * 2;
        const height = 4 + Math.random() * 6;
        const depth = 3 + Math.random() * 2;
        
        // Building geometry
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.6, 0.3, 0.4 + Math.random() * 0.3)
        });
        
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        
        buildingGroup.add(building);
        
        // Add windows
        this.addWindowsToBuilding(building, width, height, depth);
        
        return buildingGroup;
    }

    /**
     * Add windows to building
     */
    addWindowsToBuilding(building, width, height, depth) {
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
        const windowGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.05);
        
        const windowsPerFloor = Math.floor(width / 0.8);
        const floors = Math.floor(height / 1.2);
        
        for (let floor = 0; floor < floors; floor++) {
            for (let w = 0; w < windowsPerFloor; w++) {
                if (Math.random() > 0.7) continue; // Some windows are dark
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    (w - windowsPerFloor / 2) * 0.8,
                    (floor - floors / 2) * 1.2,
                    depth / 2 + 0.01
                );
                
                building.add(window);
            }
        }
    }

    /**
     * Create street lamps
     */
    createStreetLamps() {
        const lampCount = 30;
        const lampSpacing = 8;
        
        for (let i = 0; i < lampCount; i++) {
            const z = (i - lampCount / 2) * lampSpacing;
            
            // Left side lamp
            const leftLamp = this.createStreetLamp(-5, z);
            this.streetLamps.push(leftLamp);
            this.environmentGroup.add(leftLamp);
            
            // Right side lamp
            const rightLamp = this.createStreetLamp(5, z);
            this.streetLamps.push(rightLamp);
            this.environmentGroup.add(rightLamp);
        }
    }

    /**
     * Create a single street lamp
     */
    createStreetLamp(x, z) {
        const lampGroup = new THREE.Group();
        
        // Lamp post
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 1.5, z);
        post.castShadow = true;
        lampGroup.add(post);
        
        // Lamp head
        const headGeometry = new THREE.SphereGeometry(0.2);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, 2.8, z);
        lampGroup.add(head);
        
        // Point light
        const light = new THREE.PointLight(0xFFFF88, 0.5, 10);
        light.position.set(x, 2.8, z);
        lampGroup.add(light);
        
        return lampGroup;
    }

    /**
     * Create subway-specific elements
     */
    createSubwayElements() {
        // Overhead signs
        this.createOverheadSigns();
        
        // Subway tiles on walls
        this.createSubwayTiles();
        
        // Pillars
        this.createPillars();
    }

    /**
     * Create overhead signs
     */
    createOverheadSigns() {
        const signGeometry = new THREE.BoxGeometry(2, 0.5, 0.1);
        const signMaterial = new THREE.MeshLambertMaterial({ color: 0x2E8B57 });
        
        for (let i = 0; i < 10; i++) {
            const z = (i - 5) * 20;
            
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(0, 4, z);
            this.environmentGroup.add(sign);
            
            // Sign text (simple colored rectangle)
            const textGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.05);
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const text = new THREE.Mesh(textGeometry, textMaterial);
            text.position.set(0, 4, z + 0.1);
            this.environmentGroup.add(text);
        }
    }

    /**
     * Create subway tiles
     */
    createSubwayTiles() {
        const tileGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const tileMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
        
        // Tiles on left wall
        for (let y = 0; y < 6; y++) {
            for (let z = -50; z < 50; z += 2) {
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(-4.5, y * 0.6 + 0.3, z);
                this.environmentGroup.add(tile);
            }
        }
        
        // Tiles on right wall
        for (let y = 0; y < 6; y++) {
            for (let z = -50; z < 50; z += 2) {
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.position.set(4.5, y * 0.6 + 0.3, z);
                this.environmentGroup.add(tile);
            }
        }
    }

    /**
     * Create support pillars
     */
    createPillars() {
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4);
        const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        
        for (let i = 0; i < 8; i++) {
            const z = (i - 4) * 25;
            
            // Left pillar
            const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            leftPillar.position.set(-6, 2, z);
            leftPillar.castShadow = true;
            this.environmentGroup.add(leftPillar);
            
            // Right pillar
            const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            rightPillar.position.set(6, 2, z);
            rightPillar.castShadow = true;
            this.environmentGroup.add(rightPillar);
        }
    }

    /**
     * Spawn obstacle at given position
     */
    spawnObstacle(x, y, z) {
        const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        
        let obstacle;
        
        switch (obstacleType) {
            case 'barrier':
                obstacle = this.createBarrier();
                break;
            case 'cube':
                obstacle = this.createCube();
                break;
            case 'cone':
                obstacle = this.createCone();
                break;
            default:
                obstacle = this.createBarrier();
        }
        
        obstacle.position.set(x, y, z);
        obstacle.userData = { type: 'obstacle', obstacleType };
        
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
        
        return obstacle;
    }

    /**
     * Create barrier obstacle
     */
    createBarrier() {
        const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.3);
        const material = new THREE.MeshLambertMaterial({ color: 0xFF4444 });
        const barrier = new THREE.Mesh(geometry, material);
        barrier.castShadow = true;
        return barrier;
    }

    /**
     * Create cube obstacle
     */
    createCube() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({ color: 0x4444FF });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        return cube;
    }

    /**
     * Create cone obstacle
     */
    createCone() {
        const geometry = new THREE.ConeGeometry(0.4, 1.2, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0xFF8844 });
        const cone = new THREE.Mesh(geometry, material);
        cone.castShadow = true;
        cone.position.y = 0.6;
        return cone;
    }

    /**
     * Spawn collectible at given position
     */
    spawnCollectible(x, y, z, type) {
        let collectible;
        
        switch (type) {
            case 'kiwi':
                collectible = this.createKiwi();
                break;
            case 'broccoli':
                collectible = this.createBroccoli();
                break;
            default:
                collectible = this.createKiwi();
        }
        
        collectible.position.set(x, y, z);
        collectible.userData = { type: 'collectible', collectibleType: type };
        
        this.scene.add(collectible);
        
        return collectible;
    }

    /**
     * Create kiwi collectible
     */
    createKiwi() {
        const geometry = new THREE.SphereGeometry(0.3, 16, 12);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const kiwi = new THREE.Mesh(geometry, material);
        
        // Add floating animation
        kiwi.userData.floatOffset = Math.random() * Math.PI * 2;
        
        return kiwi;
    }

    /**
     * Create broccoli collectible
     */
    createBroccoli() {
        const group = new THREE.Group();
        
        // Broccoli head
        const headGeometry = new THREE.SphereGeometry(0.25, 12, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.2;
        group.add(head);
        
        // Broccoli stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = -0.1;
        group.add(stem);
        
        // Add floating animation
        group.userData.floatOffset = Math.random() * Math.PI * 2;
        
        return group;
    }

    /**
     * Update level (called every frame)
     */
    update(deltaTime) {
        if (!this.isLoaded) return;
        
        // Update collectible animations
        this.updateCollectibleAnimations();
        
        // Update obstacle cleanup
        this.updateObstacleCleanup();
    }

    /**
     * Update collectible floating animations
     */
    updateCollectibleAnimations() {
        const time = Date.now() * 0.001;
        
        this.scene.traverse((child) => {
            if (child.userData && child.userData.type === 'collectible' && child.userData.floatOffset !== undefined) {
                const floatHeight = Math.sin(time * 2 + child.userData.floatOffset) * 0.3;
                child.position.y = 0.5 + floatHeight;
                child.rotation.y = time + child.userData.floatOffset;
            }
        });
    }

    /**
     * Clean up obstacles that are far behind
     */
    updateObstacleCleanup() {
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.position.z < -50) {
                this.scene.remove(obstacle);
                
                // Dispose geometry and material
                if (obstacle.geometry) obstacle.geometry.dispose();
                if (obstacle.material) obstacle.material.dispose();
                
                return false;
            }
            return true;
        });
    }

    /**
     * Get level configuration
     */
    getConfig() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            theme: this.theme,
            gameSpeed: this.gameSpeed,
            maxSpeed: this.maxSpeed,
            speedIncrease: this.speedIncrease,
            obstacleSpawnRate: this.obstacleSpawnRate,
            collectibleSpawnRate: this.collectibleSpawnRate
        };
    }

    /**
     * Dispose of level resources
     */
    dispose() {
        if (this.scene && this.environmentGroup) {
            this.scene.remove(this.environmentGroup);
            
            // Dispose of all geometries and materials
            this.environmentGroup.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        // Clean up obstacles
        this.obstacles.forEach(obstacle => {
            if (this.scene) this.scene.remove(obstacle);
            if (obstacle.geometry) obstacle.geometry.dispose();
            if (obstacle.material) obstacle.material.dispose();
        });
        
        this.obstacles = [];
        this.buildings = [];
        this.streetLamps = [];
        this.isLoaded = false;
        
        console.log('🗑️ Level1_Subway disposed');
    }
}

// Make class available globally
window.Level1_Subway = Level1_Subway;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level1_Subway;
}