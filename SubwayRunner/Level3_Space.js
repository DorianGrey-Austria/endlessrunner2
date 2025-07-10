/**
 * Level 3: Space Station
 * Futuristic space environment with zero gravity effects
 * 
 * @module Level3_Space
 */

class Level3_Space extends LevelBase {
    constructor() {
        super(3, 'Space Station', {
            // Visual settings
            fogColor: '#000011',
            fogDensity: 0.008,
            skyColor: '#000022',
            ambientIntensity: 0.2,
            sunIntensity: 0.6,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.2,
            obstacleSpawnMultiplier: 1.2,
            collectibleSpawnMultiplier: 1.1,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['zeroGravity', 'asteroidField', 'spaceDebris', 'solarFlares']
        });
        
        // Level-specific objects
        this.asteroids = [];
        this.spaceDebris = [];
        this.solarPanels = [];
        this.spaceStations = [];
        this.starField = [];
        this.planets = [];
        this.spaceEffects = [];
    }
    
    /**
     * Create the space environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create space station corridor
        this.createSpaceStationCorridor();
        
        // Create asteroid field
        this.createAsteroidField();
        
        // Create space debris
        this.createSpaceDebris();
        
        // Create distant planets
        this.createPlanets();
        
        // Create star field
        this.createStarField();
        
        // Create space stations
        this.createSpaceStations();
        
        // Create solar flares
        this.createSolarFlares();
        
        // Create nebula effects
        this.createNebulaEffects();
        
        console.log('[Level 3] Space environment created');
    }
    
    /**
     * Create space station corridor
     */
    createSpaceStationCorridor() {
        // Main corridor walls
        const corridorGeometry = new THREE.BoxGeometry(16, 8, 1000);
        const corridorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333366,
            emissive: 0x111122,
            emissiveIntensity: 0.1
        });
        
        // Left wall
        const leftWall = new THREE.Mesh(corridorGeometry, corridorMaterial);
        leftWall.position.set(-8, 4, -500);
        leftWall.rotation.z = Math.PI / 2;
        this.environmentGroup.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(corridorGeometry, corridorMaterial);
        rightWall.position.set(8, 4, -500);
        rightWall.rotation.z = -Math.PI / 2;
        this.environmentGroup.add(rightWall);
        
        // Ceiling
        const ceiling = new THREE.Mesh(corridorGeometry, corridorMaterial);
        ceiling.position.set(0, 8, -500);
        ceiling.rotation.z = Math.PI;
        this.environmentGroup.add(ceiling);
        
        // Floor panels
        this.createFloorPanels();
        
        // Add corridor lights
        this.addCorridorLights();
    }
    
    /**
     * Create floor panels
     */
    createFloorPanels() {
        const panelGeometry = new THREE.BoxGeometry(16, 0.2, 4);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444488,
            emissive: 0x222244,
            emissiveIntensity: 0.05
        });
        
        for (let i = 0; i < 250; i++) {
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(0, 0, -i * 4);
            panel.receiveShadow = true;
            
            // Add panel lights
            if (i % 3 === 0) {
                this.addPanelLights(panel);
            }
            
            this.environmentGroup.add(panel);
        }
    }
    
    /**
     * Add corridor lights
     */
    addCorridorLights() {
        const lightGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x88CCFF,
            emissive: 0x88CCFF,
            emissiveIntensity: 0.8
        });
        
        for (let i = 0; i < 100; i++) {
            // Left side lights
            const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
            leftLight.position.set(-7, 6, -i * 10);
            leftLight.rotation.z = Math.PI / 2;
            
            // Add point light
            const pointLight = new THREE.PointLight(0x88CCFF, 0.3, 8);
            pointLight.position.copy(leftLight.position);
            this.environmentGroup.add(pointLight);
            
            this.environmentGroup.add(leftLight);
            
            // Right side lights
            const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
            rightLight.position.set(7, 6, -i * 10);
            rightLight.rotation.z = -Math.PI / 2;
            this.environmentGroup.add(rightLight);
        }
    }
    
    /**
     * Add panel lights
     */
    addPanelLights(panel) {
        const lightGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.6
        });
        
        for (let i = 0; i < 6; i++) {
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(-6 + i * 2.4, 0.15, 0);
            light.rotation.x = -Math.PI / 2;
            panel.add(light);
        }
    }
    
    /**
     * Create asteroid field
     */
    createAsteroidField() {
        for (let i = 0; i < 50; i++) {
            const asteroid = this.createAsteroid(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    -20 + Math.random() * 40,
                    -i * 50 - Math.random() * 100
                ),
                0.5 + Math.random() * 2
            );
            
            this.asteroids.push(asteroid);
            this.addDynamicObject(asteroid, {
                type: 'asteroid',
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                floatSpeed: 0.3 + Math.random() * 0.2,
                floatAmplitude: 1 + Math.random() * 2,
                baseY: asteroid.position.y
            });
        }
    }
    
    /**
     * Create asteroid
     */
    createAsteroid(position, scale) {
        const asteroidGroup = new THREE.Group();
        
        // Create irregular asteroid shape
        const asteroidGeometry = new THREE.DodecahedronGeometry(2, 0);
        const asteroidMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666,
            emissive: 0x222222,
            emissiveIntensity: 0.1
        });
        
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.scale.set(scale, scale, scale);
        
        // Add surface details
        this.addAsteroidDetails(asteroid);
        
        asteroidGroup.add(asteroid);
        asteroidGroup.position.copy(position);
        
        this.environmentGroup.add(asteroidGroup);
        return asteroidGroup;
    }
    
    /**
     * Add asteroid surface details
     */
    addAsteroidDetails(asteroid) {
        // Add craters
        for (let i = 0; i < 5; i++) {
            const craterGeometry = new THREE.SphereGeometry(0.2, 8, 6);
            const craterMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x333333 
            });
            const crater = new THREE.Mesh(craterGeometry, craterMaterial);
            crater.position.set(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );
            crater.scale.set(0.5, 0.2, 0.5);
            asteroid.add(crater);
        }
    }
    
    /**
     * Create space debris
     */
    createSpaceDebris() {
        for (let i = 0; i < 30; i++) {
            const debris = this.createDebris(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    -10 + Math.random() * 20,
                    -i * 30 - Math.random() * 50
                )
            );
            
            this.spaceDebris.push(debris);
            this.addDynamicObject(debris, {
                type: 'debris',
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                driftSpeed: 0.1 + Math.random() * 0.2
            });
        }
    }
    
    /**
     * Create debris object
     */
    createDebris(position) {
        const debrisGroup = new THREE.Group();
        
        // Random debris shape
        const shapes = ['box', 'cylinder', 'sphere'];
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        let geometry;
        switch(shapeType) {
            case 'box':
                geometry = new THREE.BoxGeometry(
                    0.5 + Math.random(),
                    0.5 + Math.random(),
                    0.5 + Math.random()
                );
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    0.3 + Math.random() * 0.5,
                    0.3 + Math.random() * 0.5,
                    1 + Math.random() * 2
                );
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.7, 8, 6);
                break;
        }
        
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            emissive: 0x111111,
            emissiveIntensity: 0.1
        });
        
        const debris = new THREE.Mesh(geometry, material);
        debrisGroup.add(debris);
        
        // Add sparks occasionally
        if (Math.random() < 0.3) {
            this.addSparks(debrisGroup);
        }
        
        debrisGroup.position.copy(position);
        this.environmentGroup.add(debrisGroup);
        return debrisGroup;
    }
    
    /**
     * Create distant planets
     */
    createPlanets() {
        // Large planet
        const planet1 = this.createPlanet(
            new THREE.Vector3(150, 80, -300),
            20,
            0x4488FF,
            0x2244AA
        );
        this.planets.push(planet1);
        
        // Medium planet
        const planet2 = this.createPlanet(
            new THREE.Vector3(-120, 60, -250),
            12,
            0xFF8844,
            0xAA4422
        );
        this.planets.push(planet2);
        
        // Small planet
        const planet3 = this.createPlanet(
            new THREE.Vector3(80, -40, -180),
            8,
            0x88FF44,
            0x44AA22
        );
        this.planets.push(planet3);
    }
    
    /**
     * Create planet
     */
    createPlanet(position, size, color, emissiveColor) {
        const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
        const planetMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            emissive: emissiveColor,
            emissiveIntensity: 0.2
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.copy(position);
        
        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(size * 1.1, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.2
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        atmosphere.position.copy(position);
        
        this.environmentGroup.add(planet);
        this.environmentGroup.add(atmosphere);
        
        return planet;
    }
    
    /**
     * Create star field
     */
    createStarField() {
        const starGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const starMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.8
        });
        
        for (let i = 0; i < 500; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 500,
                -Math.random() * 1000
            );
            
            // Add twinkling effect
            star.userData = {
                type: 'star',
                twinkleSpeed: 0.5 + Math.random() * 1.5,
                baseBrightness: 0.6 + Math.random() * 0.4
            };
            
            this.starField.push(star);
            this.environmentGroup.add(star);
        }
    }
    
    /**
     * Create space stations
     */
    createSpaceStations() {
        for (let i = 0; i < 5; i++) {
            const station = this.createSpaceStation(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 300,
                    20 + Math.random() * 60,
                    -i * 200 - 100
                )
            );
            
            this.spaceStations.push(station);
            this.addDynamicObject(station, {
                type: 'spaceStation',
                rotationSpeed: 0.005,
                blinkInterval: 2.0
            });
        }
    }
    
    /**
     * Create space station
     */
    createSpaceStation(position) {
        const stationGroup = new THREE.Group();
        
        // Central hub
        const hubGeometry = new THREE.SphereGeometry(5, 16, 16);
        const hubMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666688,
            emissive: 0x333344,
            emissiveIntensity: 0.1
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        stationGroup.add(hub);
        
        // Docking bays
        for (let i = 0; i < 4; i++) {
            const bayGeometry = new THREE.BoxGeometry(2, 2, 8);
            const bayMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x444466 
            });
            const bay = new THREE.Mesh(bayGeometry, bayMaterial);
            bay.position.set(
                Math.cos(i * Math.PI / 2) * 8,
                0,
                Math.sin(i * Math.PI / 2) * 8
            );
            stationGroup.add(bay);
        }
        
        // Communication arrays
        this.addCommunicationArrays(stationGroup);
        
        // Navigation lights
        this.addNavigationLights(stationGroup);
        
        stationGroup.position.copy(position);
        this.environmentGroup.add(stationGroup);
        return stationGroup;
    }
    
    /**
     * Create solar flares
     */
    createSolarFlares() {
        for (let i = 0; i < 10; i++) {
            const flare = this.createSolarFlare(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 400,
                    -50 + Math.random() * 100,
                    -i * 100 - Math.random() * 200
                )
            );
            
            this.spaceEffects.push(flare);
            this.environmentGroup.add(flare);
        }
    }
    
    /**
     * Create solar flare
     */
    createSolarFlare(position) {
        const flareGroup = new THREE.Group();
        
        // Main flare
        const flareGeometry = new THREE.PlaneGeometry(20, 40);
        const flareMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const flare = new THREE.Mesh(flareGeometry, flareMaterial);
        flareGroup.add(flare);
        
        // Add particle effects
        this.addFlareParticles(flareGroup);
        
        flareGroup.position.copy(position);
        flareGroup.userData = {
            type: 'solarFlare',
            intensity: 0.3 + Math.random() * 0.4,
            pulseSpeed: 0.5 + Math.random() * 0.5
        };
        
        return flareGroup;
    }
    
    /**
     * Create nebula effects
     */
    createNebulaEffects() {
        for (let i = 0; i < 8; i++) {
            const nebula = this.createNebula(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 500,
                    -100 + Math.random() * 200,
                    -i * 150 - Math.random() * 300
                )
            );
            
            this.spaceEffects.push(nebula);
            this.environmentGroup.add(nebula);
        }
    }
    
    /**
     * Create nebula
     */
    createNebula(position) {
        const nebulaGroup = new THREE.Group();
        
        // Create multiple nebula layers
        const colors = [0x8844FF, 0x4488FF, 0xFF4488, 0x44FF88];
        
        for (let i = 0; i < 3; i++) {
            const nebulaGeometry = new THREE.PlaneGeometry(50 + i * 20, 30 + i * 15);
            const nebulaMaterial = new THREE.MeshBasicMaterial({ 
                color: colors[i % colors.length],
                transparent: true,
                opacity: 0.1 - i * 0.02,
                side: THREE.DoubleSide
            });
            
            const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
            nebula.position.z = i * 5;
            nebula.rotation.z = i * Math.PI / 4;
            nebulaGroup.add(nebula);
        }
        
        nebulaGroup.position.copy(position);
        nebulaGroup.userData = {
            type: 'nebula',
            driftSpeed: 0.02 + Math.random() * 0.03
        };
        
        return nebulaGroup;
    }
    
    /**
     * Initialize special mechanics
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Add zero gravity effects
        this.initializeZeroGravity();
        
        // Add solar wind effects
        this.initializeSolarWind();
        
        // Add electromagnetic interference
        this.initializeEMI();
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update star twinkling
        this.updateStarTwinkling(time);
        
        // Update solar flares
        this.updateSolarFlares(deltaTime, time);
        
        // Update space debris drift
        this.updateSpaceDebrisDrift(deltaTime);
        
        // Update nebula movement
        this.updateNebulaMovement(deltaTime);
        
        // Update station lights
        this.updateStationLights(time);
    }
    
    /**
     * Update star twinkling
     */
    updateStarTwinkling(time) {
        this.starField.forEach(star => {
            if (star.userData.type === 'star') {
                star.material.emissiveIntensity = 
                    star.userData.baseBrightness + 
                    Math.sin(time * star.userData.twinkleSpeed) * 0.3;
            }
        });
    }
    
    /**
     * Update solar flares
     */
    updateSolarFlares(deltaTime, time) {
        this.spaceEffects.forEach(effect => {
            if (effect.userData.type === 'solarFlare') {
                const flare = effect.children[0];
                if (flare && flare.material) {
                    flare.material.opacity = 
                        effect.userData.intensity + 
                        Math.sin(time * effect.userData.pulseSpeed) * 0.2;
                }
            }
        });
    }
    
    /**
     * Update space debris drift
     */
    updateSpaceDebrisDrift(deltaTime) {
        this.spaceDebris.forEach(debris => {
            if (debris.userData.driftSpeed) {
                debris.position.x += Math.sin(Date.now() * 0.001) * debris.userData.driftSpeed * deltaTime;
                debris.position.y += Math.cos(Date.now() * 0.0008) * debris.userData.driftSpeed * deltaTime;
            }
        });
    }
    
    /**
     * Update nebula movement
     */
    updateNebulaMovement(deltaTime) {
        this.spaceEffects.forEach(effect => {
            if (effect.userData.type === 'nebula') {
                effect.rotation.z += effect.userData.driftSpeed * deltaTime;
            }
        });
    }
    
    /**
     * Update station lights
     */
    updateStationLights(time) {
        this.spaceStations.forEach(station => {
            if (station.userData.blinkInterval) {
                const shouldBlink = Math.sin(time / station.userData.blinkInterval) > 0;
                station.children.forEach(child => {
                    if (child.userData && child.userData.type === 'navLight') {
                        child.visible = shouldBlink;
                    }
                });
            }
        });
    }
    
    /**
     * Helper methods
     */
    addSparks(object) {
        for (let i = 0; i < 3; i++) {
            const spark = this.createParticle(
                object.position.clone(),
                {
                    size: 0.05,
                    color: 0xFFFF00,
                    lifetime: 0.5,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                    )
                }
            );
        }
    }
    
    addCommunicationArrays(station) {
        for (let i = 0; i < 3; i++) {
            const arrayGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10);
            const arrayMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x888888 
            });
            const array = new THREE.Mesh(arrayGeometry, arrayMaterial);
            array.position.set(
                Math.cos(i * Math.PI * 2/3) * 6,
                8,
                Math.sin(i * Math.PI * 2/3) * 6
            );
            station.add(array);
        }
    }
    
    addNavigationLights(station) {
        const lightColors = [0xFF0000, 0x00FF00, 0x0000FF];
        
        for (let i = 0; i < 3; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 6);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: lightColors[i],
                emissive: lightColors[i],
                emissiveIntensity: 0.8
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                Math.cos(i * Math.PI * 2/3) * 7,
                2,
                Math.sin(i * Math.PI * 2/3) * 7
            );
            light.userData = { type: 'navLight' };
            station.add(light);
        }
    }
    
    addFlareParticles(flareGroup) {
        for (let i = 0; i < 10; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFAA00,
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 30,
                0
            );
            flareGroup.add(particle);
        }
    }
    
    initializeZeroGravity() {
        this.zeroGravityEffect = {
            enabled: true,
            floatIntensity: 0.3,
            driftSpeed: 0.1
        };
    }
    
    initializeSolarWind() {
        this.solarWind = {
            strength: 0.5,
            direction: new THREE.Vector3(1, 0, 0),
            particles: []
        };
    }
    
    initializeEMI() {
        this.electromagneticInterference = {
            intensity: 0.2,
            frequency: 0.1,
            affectedSystems: ['lights', 'displays']
        };
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.asteroids = [];
        this.spaceDebris = [];
        this.solarPanels = [];
        this.spaceStations = [];
        this.starField = [];
        this.planets = [];
        this.spaceEffects = [];
        
        console.log('[Level 3] Space level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level3 = new Level3_Space();
    window.LevelManagerPro.registerLevel(level3);
    console.log('[Level 3] Space level registered');
}

// Export for use
window.Level3_Space = Level3_Space;