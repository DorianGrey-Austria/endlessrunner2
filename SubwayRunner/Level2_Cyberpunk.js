/**
 * Level 2: Cyberpunk Night
 * Futuristic neon city with holographic elements
 * 
 * @module Level2_Cyberpunk
 */

class Level2_Cyberpunk extends LevelBase {
    constructor() {
        super(2, 'Cyberpunk Night', {
            // Visual settings
            fogColor: '#0a0a0a',
            fogDensity: 0.015,
            skyColor: '#0a0a0a',
            ambientIntensity: 0.3,
            sunIntensity: 0.4,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.1,
            obstacleSpawnMultiplier: 1.1,
            collectibleSpawnMultiplier: 1.0,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['neonGlow', 'holographicElements', 'electricEffect']
        });
        
        // Level-specific objects
        this.neonSigns = [];
        this.holographicElements = [];
        this.electricArcs = [];
        this.cyberpunkBuildings = [];
        this.hologramAnimations = [];
    }
    
    /**
     * Create the cyberpunk environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create neon-lit streets
        this.createNeonStreets();
        
        // Create cyberpunk buildings
        this.createCyberpunkBuildings();
        
        // Create holographic displays
        this.createHolographicDisplays();
        
        // Create electric arcs
        this.createElectricArcs();
        
        // Create floating vehicles
        this.createFloatingVehicles();
        
        // Create data streams
        this.createDataStreams();
        
        // Create neon atmosphere
        this.createNeonAtmosphere();
        
        console.log('[Level 2] Cyberpunk environment created');
    }
    
    /**
     * Create neon-lit streets
     */
    createNeonStreets() {
        // Street base
        const streetGeometry = new THREE.PlaneGeometry(12, 1000);
        const streetMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1a1a1a,
            emissive: 0x333333,
            emissiveIntensity: 0.1
        });
        const street = new THREE.Mesh(streetGeometry, streetMaterial);
        street.rotation.x = -Math.PI / 2;
        street.position.y = 0;
        street.receiveShadow = true;
        this.environmentGroup.add(street);
        
        // Neon street lines
        const neonLineGeometry = new THREE.BoxGeometry(0.3, 0.05, 8);
        const neonLineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.8
        });
        
        for (let i = 0; i < 100; i++) {
            const neonLine = new THREE.Mesh(neonLineGeometry, neonLineMaterial);
            neonLine.position.set(0, 0.05, -i * 10);
            
            // Add glow effect
            this.addNeonGlow(neonLine, 0x00FFFF, 0.5);
            
            this.environmentGroup.add(neonLine);
        }
    }
    
    /**
     * Create cyberpunk buildings
     */
    createCyberpunkBuildings() {
        const buildingColors = [0x2a2a2a, 0x1a1a2a, 0x2a1a2a, 0x1a2a2a];
        const neonColors = [0xFF00FF, 0x00FFFF, 0xFF0066, 0x0066FF, 0x66FF00];
        
        for (let i = 0; i < 40; i++) {
            // Main building structure
            const building = this.createBuilding(
                6 + Math.random() * 8,
                15 + Math.random() * 35,
                6 + Math.random() * 8,
                buildingColors[Math.floor(Math.random() * buildingColors.length)],
                new THREE.Vector3(
                    i % 2 === 0 ? -25 - Math.random() * 15 : 25 + Math.random() * 15,
                    0,
                    -i * 15
                )
            );
            
            // Add neon elements to building
            this.addNeonToBuildingC(building, neonColors);
            
            // Add holographic advertisements
            this.addHolographicAds(building);
            
            this.cyberpunkBuildings.push(building);
            this.environmentGroup.add(building);
        }
    }
    
    /**
     * Add neon elements to cyberpunk building
     */
    addNeonToBuildingC(building, neonColors) {
        const height = building.geometry.parameters.height;
        const floors = Math.floor(height / 3);
        
        // Neon windows
        for (let floor = 0; floor < floors; floor++) {
            const windowsPerFloor = 4;
            for (let w = 0; w < windowsPerFloor; w++) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
                const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: neonColor,
                    emissive: neonColor,
                    emissiveIntensity: 0.6,
                    transparent: true,
                    opacity: 0.8
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    (w - 1.5) * 1.5,
                    floor * 3 + 1.5,
                    building.geometry.parameters.depth / 2 + 0.01
                );
                
                // Add pulsing animation
                this.addPulseAnimation(window, neonColor);
                
                building.add(window);
            }
        }
        
        // Neon building outline
        this.addNeonOutline(building, neonColors[0]);
    }
    
    /**
     * Add neon outline to building
     */
    addNeonOutline(building, color) {
        const outlineGeometry = new THREE.EdgesGeometry(building.geometry);
        const outlineMaterial = new THREE.LineBasicMaterial({ 
            color: color,
            linewidth: 3
        });
        const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
        
        // Add glow effect
        this.addNeonGlow(outline, color, 0.8);
        
        building.add(outline);
    }
    
    /**
     * Create holographic displays
     */
    createHolographicDisplays() {
        for (let i = 0; i < 20; i++) {
            const hologram = this.createHologram(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    5 + Math.random() * 20,
                    -i * 25 - Math.random() * 10
                ),
                2 + Math.random() * 3,
                [0xFF00FF, 0x00FFFF, 0xFF0066][Math.floor(Math.random() * 3)]
            );
            
            this.holographicElements.push(hologram);
            this.environmentGroup.add(hologram);
        }
    }
    
    /**
     * Create a holographic element
     */
    createHologram(position, size, color) {
        const hologramGroup = new THREE.Group();
        
        // Main hologram plane
        const hologramGeometry = new THREE.PlaneGeometry(size, size);
        const hologramMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const hologram = new THREE.Mesh(hologramGeometry, hologramMaterial);
        hologramGroup.add(hologram);
        
        // Add holographic scanlines
        this.addScanlines(hologramGroup, size, color);
        
        // Add glitch effect
        this.addGlitchEffect(hologramGroup);
        
        hologramGroup.position.copy(position);
        hologramGroup.userData = { 
            type: 'hologram',
            baseY: position.y,
            floatSpeed: 0.5,
            floatAmplitude: 0.5
        };
        
        return hologramGroup;
    }
    
    /**
     * Add scanlines to hologram
     */
    addScanlines(hologramGroup, size, color) {
        const scanlineGeometry = new THREE.PlaneGeometry(size, 0.1);
        const scanlineMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 10; i++) {
            const scanline = new THREE.Mesh(scanlineGeometry, scanlineMaterial);
            scanline.position.y = -size/2 + (i * size/10);
            hologramGroup.add(scanline);
        }
    }
    
    /**
     * Create electric arcs
     */
    createElectricArcs() {
        for (let i = 0; i < 15; i++) {
            const arc = this.createElectricArc(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    3 + Math.random() * 10,
                    -i * 30 - Math.random() * 15
                )
            );
            
            this.electricArcs.push(arc);
            this.environmentGroup.add(arc);
        }
    }
    
    /**
     * Create electric arc effect
     */
    createElectricArc(position) {
        const arcGroup = new THREE.Group();
        
        // Create electric arc using line geometry
        const points = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 2;
            const y = Math.random() * 3;
            const z = (Math.random() - 0.5) * 2;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const arcMaterial = new THREE.LineBasicMaterial({ 
            color: 0x66CCFF,
            linewidth: 2
        });
        
        const arc = new THREE.Line(arcGeometry, arcMaterial);
        arcGroup.add(arc);
        
        arcGroup.position.copy(position);
        arcGroup.userData = { 
            type: 'electricArc',
            updateInterval: 0.1,
            lastUpdate: 0
        };
        
        return arcGroup;
    }
    
    /**
     * Create floating vehicles
     */
    createFloatingVehicles() {
        for (let i = 0; i < 8; i++) {
            const vehicle = this.createFloatingVehicle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    8 + Math.random() * 15,
                    -i * 50 - Math.random() * 20
                )
            );
            
            this.addDynamicObject(vehicle, {
                type: 'vehicle',
                speed: 0.5 + Math.random() * 0.5,
                floatSpeed: 1.0,
                floatAmplitude: 0.3,
                baseY: vehicle.position.y
            });
        }
    }
    
    /**
     * Create floating vehicle
     */
    createFloatingVehicle(position) {
        const vehicleGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(3, 0.8, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            emissive: 0x222222,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        vehicleGroup.add(body);
        
        // Neon underglow
        const underglowGeometry = new THREE.PlaneGeometry(3.5, 6.5);
        const underglowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const underglow = new THREE.Mesh(underglowGeometry, underglowMaterial);
        underglow.rotation.x = -Math.PI / 2;
        underglow.position.y = -0.5;
        vehicleGroup.add(underglow);
        
        // Add thrust effects
        this.addThrustEffect(vehicleGroup);
        
        vehicleGroup.position.copy(position);
        return vehicleGroup;
    }
    
    /**
     * Create data streams
     */
    createDataStreams() {
        for (let i = 0; i < 25; i++) {
            const stream = this.createDataStream(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    20 + Math.random() * 30,
                    -i * 20 - Math.random() * 10
                )
            );
            
            this.environmentGroup.add(stream);
        }
    }
    
    /**
     * Create data stream effect
     */
    createDataStream(position) {
        const streamGroup = new THREE.Group();
        
        // Create data particles
        for (let i = 0; i < 10; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.y = i * 0.5;
            streamGroup.add(particle);
        }
        
        streamGroup.position.copy(position);
        streamGroup.userData = { 
            type: 'dataStream',
            speed: 5.0,
            direction: new THREE.Vector3(0, -1, 0)
        };
        
        return streamGroup;
    }
    
    /**
     * Create neon atmosphere
     */
    createNeonAtmosphere() {
        // Add atmospheric particles
        for (let i = 0; i < 200; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 50,
                    -Math.random() * 500
                ),
                {
                    size: 0.05,
                    color: [0xFF00FF, 0x00FFFF, 0xFF0066][Math.floor(Math.random() * 3)],
                    lifetime: 10.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1,
                        0
                    )
                }
            );
        }
    }
    
    /**
     * Initialize special mechanics
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Add volumetric lighting
        this.addVolumetricLighting(scene);
        
        // Initialize glitch effects
        this.initializeGlitchEffects();
        
        // Add neon reflections
        this.addNeonReflections();
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update holographic elements
        this.updateHolographicElements(deltaTime, time);
        
        // Update electric arcs
        this.updateElectricArcs(deltaTime, time);
        
        // Update data streams
        this.updateDataStreams(deltaTime, gameState);
        
        // Update neon pulsing
        this.updateNeonPulsing(time);
    }
    
    /**
     * Update holographic elements
     */
    updateHolographicElements(deltaTime, time) {
        this.holographicElements.forEach(hologram => {
            // Floating animation
            if (hologram.userData.floatSpeed) {
                hologram.position.y = hologram.userData.baseY + 
                    Math.sin(time * hologram.userData.floatSpeed) * hologram.userData.floatAmplitude;
            }
            
            // Glitch effect
            if (Math.random() < 0.01) {
                hologram.children.forEach(child => {
                    if (child.material && child.material.opacity !== undefined) {
                        child.material.opacity = Math.random() * 0.8 + 0.2;
                    }
                });
            }
        });
    }
    
    /**
     * Update electric arcs
     */
    updateElectricArcs(deltaTime, time) {
        this.electricArcs.forEach(arc => {
            arc.userData.lastUpdate += deltaTime;
            if (arc.userData.lastUpdate > arc.userData.updateInterval) {
                arc.userData.lastUpdate = 0;
                
                // Regenerate arc points
                const line = arc.children[0];
                if (line && line.geometry) {
                    const points = [];
                    for (let i = 0; i < 20; i++) {
                        const x = (Math.random() - 0.5) * 2;
                        const y = Math.random() * 3;
                        const z = (Math.random() - 0.5) * 2;
                        points.push(new THREE.Vector3(x, y, z));
                    }
                    line.geometry.setFromPoints(points);
                }
            }
        });
    }
    
    /**
     * Update data streams
     */
    updateDataStreams(deltaTime, gameState) {
        this.environmentGroup.children.forEach(child => {
            if (child.userData.type === 'dataStream') {
                child.children.forEach((particle, index) => {
                    particle.position.y -= child.userData.speed * deltaTime;
                    if (particle.position.y < -5) {
                        particle.position.y = 5;
                    }
                });
            }
        });
    }
    
    /**
     * Helper methods
     */
    addNeonGlow(object, color, intensity) {
        // Add glow effect (simplified)
        if (object.material) {
            object.material.emissive = new THREE.Color(color);
            object.material.emissiveIntensity = intensity;
        }
    }
    
    addPulseAnimation(object, color) {
        this.registerUpdateCallback((deltaTime) => {
            if (object.material && object.material.emissiveIntensity !== undefined) {
                object.material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.003) * 0.2;
            }
        });
    }
    
    addGlitchEffect(object) {
        this.registerUpdateCallback((deltaTime) => {
            if (Math.random() < 0.005) {
                object.visible = !object.visible;
                setTimeout(() => { object.visible = true; }, 50);
            }
        });
    }
    
    addHolographicAds(building) {
        if (Math.random() < 0.3) {
            const adGeometry = new THREE.PlaneGeometry(3, 2);
            const adMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF00FF,
                transparent: true,
                opacity: 0.6
            });
            const ad = new THREE.Mesh(adGeometry, adMaterial);
            ad.position.set(0, building.geometry.parameters.height * 0.7, building.geometry.parameters.depth / 2 + 0.1);
            building.add(ad);
        }
    }
    
    addVolumetricLighting(scene) {
        // Add atmospheric lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);
    }
    
    initializeGlitchEffects() {
        // Initialize glitch system
        this.glitchSystem = {
            enabled: true,
            intensity: 0.1,
            frequency: 0.01
        };
    }
    
    addNeonReflections() {
        // Add reflective surfaces
        console.log('[Level 2] Neon reflections added');
    }
    
    updateNeonPulsing(time) {
        // Update all neon elements
        this.neonSigns.forEach(sign => {
            if (sign.material && sign.material.emissiveIntensity !== undefined) {
                sign.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3;
            }
        });
    }
    
    addThrustEffect(vehicle) {
        // Add particle thrust effect
        const thrustGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const thrustMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0099FF,
            transparent: true,
            opacity: 0.7
        });
        const thrust = new THREE.Mesh(thrustGeometry, thrustMaterial);
        thrust.position.set(0, -0.5, -3);
        vehicle.add(thrust);
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.neonSigns = [];
        this.holographicElements = [];
        this.electricArcs = [];
        this.cyberpunkBuildings = [];
        this.hologramAnimations = [];
        
        console.log('[Level 2] Cyberpunk level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level2 = new Level2_Cyberpunk();
    window.LevelManagerPro.registerLevel(level2);
    console.log('[Level 2] Cyberpunk level registered');
}

// Export for use
window.Level2_Cyberpunk = Level2_Cyberpunk;