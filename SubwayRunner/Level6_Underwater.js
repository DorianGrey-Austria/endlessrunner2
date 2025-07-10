/**
 * Level 6: Underwater
 * Deep ocean environment with marine life and coral reefs
 * 
 * @module Level6_Underwater
 */

class Level6_Underwater extends LevelBase {
    constructor() {
        super(6, 'Underwater', {
            // Visual settings
            fogColor: '#1e3a5f',
            fogDensity: 0.015,
            skyColor: '#0066aa',
            ambientIntensity: 0.3,
            sunIntensity: 0.5,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.5,
            obstacleSpawnMultiplier: 1.5,
            collectibleSpawnMultiplier: 1.4,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['buoyancy', 'waterCurrent', 'marineLife', 'bubbles']
        });
        
        // Level-specific objects
        this.corals = [];
        this.seaCreatures = [];
        this.bubbles = [];
        this.seaweed = [];
        this.shipwrecks = [];
        this.treasures = [];
        this.waterEffects = [];
        this.schools = [];
    }
    
    /**
     * Create the underwater environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create ocean floor
        this.createOceanFloor();
        
        // Create coral reefs
        this.createCoralReefs();
        
        // Create marine life
        this.createMarineLife();
        
        // Create shipwrecks
        this.createShipwrecks();
        
        // Create seaweed forests
        this.createSeaweedForests();
        
        // Create bubble streams
        this.createBubbleStreams();
        
        // Create underwater atmosphere
        this.createUnderwaterAtmosphere();
        
        // Create treasure chests
        this.createTreasureChests();
        
        console.log('[Level 6] Underwater environment created');
    }
    
    /**
     * Create ocean floor
     */
    createOceanFloor() {
        // Main ocean floor
        const floorGeometry = new THREE.PlaneGeometry(20, 1000);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7355,
            emissive: 0x2F1B05,
            emissiveIntensity: 0.05
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        this.environmentGroup.add(floor);
        
        // Add sand dunes
        this.createSandDunes();
        
        // Add shells and debris
        this.createShellsAndDebris();
    }
    
    /**
     * Create sand dunes
     */
    createSandDunes() {
        for (let i = 0; i < 50; i++) {
            const duneGeometry = new THREE.SphereGeometry(
                1 + Math.random() * 3,
                8, 6
            );
            const duneMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xDEB887,
                emissive: 0x2F1B05,
                emissiveIntensity: 0.03
            });
            const dune = new THREE.Mesh(duneGeometry, duneMaterial);
            dune.position.set(
                (Math.random() - 0.5) * 40,
                -1.5,
                -i * 20 - Math.random() * 15
            );
            dune.scale.y = 0.3;
            dune.receiveShadow = true;
            this.environmentGroup.add(dune);
        }
    }
    
    /**
     * Create shells and debris
     */
    createShellsAndDebris() {
        for (let i = 0; i < 100; i++) {
            const shellGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 6, 6);
            const shellMaterial = new THREE.MeshLambertMaterial({ 
                color: [0xFFB6C1, 0xFFA07A, 0xF0E68C, 0xDDA0DD][Math.floor(Math.random() * 4)]
            });
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            shell.position.set(
                (Math.random() - 0.5) * 30,
                -1.8,
                -Math.random() * 1000
            );
            shell.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            this.environmentGroup.add(shell);
        }
    }
    
    /**
     * Create coral reefs
     */
    createCoralReefs() {
        for (let i = 0; i < 40; i++) {
            const reef = this.createCoralReef(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    -2,
                    -i * 25 - Math.random() * 20
                ),
                1 + Math.random() * 2
            );
            
            this.corals.push(reef);
            this.addDynamicObject(reef, {
                type: 'coral',
                swaySpeed: 0.2 + Math.random() * 0.3,
                swayAmplitude: 0.05 + Math.random() * 0.1,
                colorShift: true
            });
        }
    }
    
    /**
     * Create coral reef
     */
    createCoralReef(position, scale) {
        const reefGroup = new THREE.Group();
        
        // Main coral structures
        const coralTypes = ['brain', 'staghorn', 'table', 'tube'];
        
        for (let i = 0; i < 5; i++) {
            const coralType = coralTypes[Math.floor(Math.random() * coralTypes.length)];
            const coral = this.createCoral(coralType, {
                x: (Math.random() - 0.5) * 6,
                y: Math.random() * 3,
                z: (Math.random() - 0.5) * 6
            });
            reefGroup.add(coral);
        }
        
        // Add small fish around coral
        this.addReefFish(reefGroup);
        
        reefGroup.position.copy(position);
        reefGroup.scale.setScalar(scale);
        
        this.environmentGroup.add(reefGroup);
        return reefGroup;
    }
    
    /**
     * Create individual coral
     */
    createCoral(type, offset) {
        let geometry, material;
        
        const coralColors = [0xFF6347, 0xFF69B4, 0x9370DB, 0x00CED1, 0xFF7F50];
        const color = coralColors[Math.floor(Math.random() * coralColors.length)];
        
        switch(type) {
            case 'brain':
                geometry = new THREE.SphereGeometry(1, 12, 8);
                break;
            case 'staghorn':
                geometry = new THREE.CylinderGeometry(0.1, 0.3, 3);
                break;
            case 'table':
                geometry = new THREE.CylinderGeometry(2, 0.5, 1);
                break;
            case 'tube':
                geometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
                break;
        }
        
        material = new THREE.MeshLambertMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.1
        });
        
        const coral = new THREE.Mesh(geometry, material);
        coral.position.set(offset.x, offset.y, offset.z);
        coral.castShadow = true;
        
        return coral;
    }
    
    /**
     * Create marine life
     */
    createMarineLife() {
        // Create fish schools
        for (let i = 0; i < 15; i++) {
            const school = this.createFishSchool(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    2 + Math.random() * 10,
                    -i * 60 - Math.random() * 40
                ),
                5 + Math.floor(Math.random() * 10)
            );
            
            this.schools.push(school);
            this.addDynamicObject(school, {
                type: 'fishSchool',
                swimSpeed: 1 + Math.random() * 2,
                direction: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 0.5
                ).normalize(),
                turnRate: 0.02
            });
        }
        
        // Create individual sea creatures
        this.createSeaCreatures();
    }
    
    /**
     * Create fish school
     */
    createFishSchool(position, count) {
        const schoolGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const fish = this.createFish({
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 4
            });
            schoolGroup.add(fish);
        }
        
        schoolGroup.position.copy(position);
        this.environmentGroup.add(schoolGroup);
        return schoolGroup;
    }
    
    /**
     * Create individual fish
     */
    createFish(offset) {
        const fishGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const fishColors = [0xFF4500, 0x1E90FF, 0xFFD700, 0xFF69B4, 0x00FF7F];
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: fishColors[Math.floor(Math.random() * fishColors.length)]
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.z = 1.5;
        fishGroup.add(body);
        
        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.2, 0.4, 6);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0, -0.6);
        tail.rotation.x = Math.PI / 2;
        fishGroup.add(tail);
        
        // Fins
        const finGeometry = new THREE.PlaneGeometry(0.3, 0.2);
        const finMaterial = new THREE.MeshLambertMaterial({ 
            color: bodyMaterial.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const leftFin = new THREE.Mesh(finGeometry, finMaterial);
        leftFin.position.set(-0.3, 0, 0);
        leftFin.rotation.y = Math.PI / 4;
        fishGroup.add(leftFin);
        
        const rightFin = new THREE.Mesh(finGeometry, finMaterial);
        rightFin.position.set(0.3, 0, 0);
        rightFin.rotation.y = -Math.PI / 4;
        fishGroup.add(rightFin);
        
        fishGroup.position.set(offset.x, offset.y, offset.z);
        return fishGroup;
    }
    
    /**
     * Create sea creatures
     */
    createSeaCreatures() {
        // Create jellyfish
        for (let i = 0; i < 12; i++) {
            const jellyfish = this.createJellyfish(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    5 + Math.random() * 15,
                    -i * 80 - Math.random() * 40
                )
            );
            
            this.seaCreatures.push(jellyfish);
            this.addDynamicObject(jellyfish, {
                type: 'jellyfish',
                floatSpeed: 0.8 + Math.random() * 0.4,
                pulseSpeed: 1 + Math.random() * 1,
                baseY: jellyfish.position.y
            });
        }
        
        // Create sea turtles
        for (let i = 0; i < 6; i++) {
            const turtle = this.createSeaTurtle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    3 + Math.random() * 8,
                    -i * 150 - Math.random() * 50
                )
            );
            
            this.seaCreatures.push(turtle);
            this.addDynamicObject(turtle, {
                type: 'turtle',
                swimSpeed: 0.5 + Math.random() * 0.3,
                glidePattern: true
            });
        }
    }
    
    /**
     * Create jellyfish
     */
    createJellyfish(position) {
        const jellyfishGroup = new THREE.Group();
        
        // Bell
        const bellGeometry = new THREE.SphereGeometry(1, 12, 8);
        const bellMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF69B4,
            transparent: true,
            opacity: 0.6,
            emissive: 0xFF69B4,
            emissiveIntensity: 0.2
        });
        const bell = new THREE.Mesh(bellGeometry, bellMaterial);
        bell.scale.y = 0.6;
        jellyfishGroup.add(bell);
        
        // Tentacles
        const tentacleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 3);
        const tentacleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF1493,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 8; i++) {
            const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
            tentacle.position.set(
                Math.cos(i * Math.PI / 4) * 0.8,
                -2,
                Math.sin(i * Math.PI / 4) * 0.8
            );
            jellyfishGroup.add(tentacle);
        }
        
        jellyfishGroup.position.copy(position);
        this.environmentGroup.add(jellyfishGroup);
        return jellyfishGroup;
    }
    
    /**
     * Create sea turtle
     */
    createSeaTurtle(position) {
        const turtleGroup = new THREE.Group();
        
        // Shell
        const shellGeometry = new THREE.SphereGeometry(1.5, 12, 8);
        const shellMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            emissive: 0x654321,
            emissiveIntensity: 0.1
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.scale.y = 0.4;
        turtleGroup.add(shell);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x556B2F
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0, 1.8);
        head.scale.z = 1.5;
        turtleGroup.add(head);
        
        // Flippers
        const flipperGeometry = new THREE.PlaneGeometry(1, 0.6);
        const flipperMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x556B2F,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 4; i++) {
            const flipper = new THREE.Mesh(flipperGeometry, flipperMaterial);
            const angle = i * Math.PI / 2;
            flipper.position.set(
                Math.cos(angle) * 1.2,
                0,
                Math.sin(angle) * 0.8
            );
            flipper.rotation.y = angle;
            turtleGroup.add(flipper);
        }
        
        turtleGroup.position.copy(position);
        this.environmentGroup.add(turtleGroup);
        return turtleGroup;
    }
    
    /**
     * Create shipwrecks
     */
    createShipwrecks() {
        for (let i = 0; i < 4; i++) {
            const wreck = this.createShipwreck(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 150,
                    -1,
                    -i * 200 - 100
                )
            );
            
            this.shipwrecks.push(wreck);
            this.environmentGroup.add(wreck);
        }
    }
    
    /**
     * Create shipwreck
     */
    createShipwreck(position) {
        const wreckGroup = new THREE.Group();
        
        // Hull
        const hullGeometry = new THREE.BoxGeometry(20, 4, 60);
        const hullMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            emissive: 0x2F1B05,
            emissiveIntensity: 0.1
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 2;
        hull.rotation.z = (Math.random() - 0.5) * 0.5;
        wreckGroup.add(hull);
        
        // Broken mast
        const mastGeometry = new THREE.CylinderGeometry(0.5, 0.5, 15);
        const mastMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 8, -10);
        mast.rotation.x = (Math.random() - 0.5) * 0.8;
        wreckGroup.add(mast);
        
        // Add marine growth
        this.addMarineGrowth(wreckGroup);
        
        wreckGroup.position.copy(position);
        return wreckGroup;
    }
    
    /**
     * Create seaweed forests
     */
    createSeaweedForests() {
        for (let i = 0; i < 80; i++) {
            const seaweed = this.createSeaweed(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    -2,
                    -i * 15 - Math.random() * 10
                ),
                2 + Math.random() * 6
            );
            
            this.seaweed.push(seaweed);
            this.addDynamicObject(seaweed, {
                type: 'seaweed',
                swaySpeed: 0.3 + Math.random() * 0.4,
                swayAmplitude: 0.2 + Math.random() * 0.3,
                height: seaweed.userData.height
            });
        }
    }
    
    /**
     * Create seaweed
     */
    createSeaweed(position, height) {
        const seaweedGroup = new THREE.Group();
        
        // Create seaweed segments
        const segmentGeometry = new THREE.PlaneGeometry(0.5, 1);
        const seaweedMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const segments = Math.floor(height);
        for (let i = 0; i < segments; i++) {
            const segment = new THREE.Mesh(segmentGeometry, seaweedMaterial);
            segment.position.y = i + 0.5;
            segment.rotation.y = Math.random() * Math.PI / 4;
            seaweedGroup.add(segment);
        }
        
        seaweedGroup.position.copy(position);
        seaweedGroup.userData = { height: height };
        
        this.environmentGroup.add(seaweedGroup);
        return seaweedGroup;
    }
    
    /**
     * Create bubble streams
     */
    createBubbleStreams() {
        for (let i = 0; i < 25; i++) {
            const stream = this.createBubbleStream(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    -2,
                    -i * 40 - Math.random() * 20
                )
            );
            
            this.bubbles.push(stream);
            this.environmentGroup.add(stream);
        }
    }
    
    /**
     * Create bubble stream
     */
    createBubbleStream(position) {
        const streamGroup = new THREE.Group();
        
        // Create bubbles
        for (let i = 0; i < 15; i++) {
            const bubbleGeometry = new THREE.SphereGeometry(
                0.1 + Math.random() * 0.3, 8, 6
            );
            const bubbleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.3
            });
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.y = i * 2;
            bubble.userData = {
                riseSpeed: 1 + Math.random() * 2,
                wobbleSpeed: 2 + Math.random() * 3,
                baseX: 0
            };
            streamGroup.add(bubble);
        }
        
        streamGroup.position.copy(position);
        streamGroup.userData = {
            type: 'bubbleStream',
            intensity: 0.5 + Math.random() * 0.5
        };
        
        return streamGroup;
    }
    
    /**
     * Create underwater atmosphere
     */
    createUnderwaterAtmosphere() {
        // Add floating particles
        for (let i = 0; i < 200; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 200,
                    Math.random() * 30,
                    -Math.random() * 1000
                ),
                {
                    size: 0.01 + Math.random() * 0.03,
                    color: 0x87CEEB,
                    lifetime: 30.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        0.05 + Math.random() * 0.1,
                        0
                    ),
                    fadeOut: false
                }
            );
        }
        
        // Add water caustics effect
        this.createWaterCaustics();
    }
    
    /**
     * Create water caustics
     */
    createWaterCaustics() {
        for (let i = 0; i < 20; i++) {
            const caustic = this.createCaustic(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    15 + Math.random() * 10,
                    -i * 50 - Math.random() * 30
                )
            );
            
            this.waterEffects.push(caustic);
            this.environmentGroup.add(caustic);
        }
    }
    
    /**
     * Create caustic effect
     */
    createCaustic(position) {
        const causticGeometry = new THREE.PlaneGeometry(10, 10);
        const causticMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const caustic = new THREE.Mesh(causticGeometry, causticMaterial);
        caustic.position.copy(position);
        caustic.rotation.x = -Math.PI / 2;
        
        caustic.userData = {
            type: 'caustic',
            waveSpeed: 1 + Math.random() * 2,
            intensity: 0.05 + Math.random() * 0.1
        };
        
        return caustic;
    }
    
    /**
     * Create treasure chests
     */
    createTreasureChests() {
        for (let i = 0; i < 6; i++) {
            const treasure = this.createTreasureChest(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    -1.5,
                    -i * 150 - Math.random() * 75
                )
            );
            
            this.treasures.push(treasure);
            this.environmentGroup.add(treasure);
        }
    }
    
    /**
     * Create treasure chest
     */
    createTreasureChest(position) {
        const chestGroup = new THREE.Group();
        
        // Chest body
        const chestGeometry = new THREE.BoxGeometry(2, 1, 1.5);
        const chestMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            emissive: 0x654321,
            emissiveIntensity: 0.1
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.y = 0.5;
        chestGroup.add(chest);
        
        // Treasure glow
        const glowGeometry = new THREE.SphereGeometry(1.5, 12, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1;
        chestGroup.add(glow);
        
        chestGroup.position.copy(position);
        chestGroup.userData = {
            type: 'treasure',
            glowIntensity: 0.2 + Math.random() * 0.3
        };
        
        return chestGroup;
    }
    
    /**
     * Initialize special mechanics
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Add water physics
        this.initializeWaterPhysics();
        
        // Add current effects
        this.initializeCurrentEffects();
        
        // Add pressure effects
        this.initializePressureEffects();
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update marine life
        this.updateMarineLife(deltaTime, time);
        
        // Update bubble streams
        this.updateBubbleStreams(deltaTime, time);
        
        // Update seaweed swaying
        this.updateSeaweedSwaying(deltaTime, time);
        
        // Update water effects
        this.updateWaterEffects(deltaTime, time);
        
        // Update coral movement
        this.updateCoralMovement(deltaTime, time);
    }
    
    /**
     * Update marine life
     */
    updateMarineLife(deltaTime, time) {
        // Update fish schools
        this.schools.forEach(school => {
            if (school.userData.swimSpeed) {
                // Move school
                school.position.add(
                    school.userData.direction.clone().multiplyScalar(
                        school.userData.swimSpeed * deltaTime
                    )
                );
                
                // Individual fish movement
                school.children.forEach((fish, index) => {
                    fish.rotation.y += Math.sin(time * 3 + index) * 0.02;
                    fish.position.x += Math.sin(time * 2 + index) * 0.005;
                    fish.position.y += Math.cos(time * 1.5 + index) * 0.003;
                });
            }
        });
        
        // Update jellyfish
        this.seaCreatures.forEach(creature => {
            if (creature.userData.type === 'jellyfish') {
                // Floating motion
                creature.position.y = creature.userData.baseY + 
                    Math.sin(time * creature.userData.floatSpeed) * 2;
                
                // Pulsing motion
                const bell = creature.children[0];
                if (bell) {
                    bell.scale.y = 0.6 + Math.sin(time * creature.userData.pulseSpeed) * 0.1;
                }
            } else if (creature.userData.type === 'turtle') {
                // Swimming motion
                creature.rotation.z = Math.sin(time * creature.userData.swimSpeed) * 0.1;
                creature.position.y += Math.sin(time * creature.userData.swimSpeed * 0.7) * 0.01;
            }
        });
    }
    
    /**
     * Update bubble streams
     */
    updateBubbleStreams(deltaTime, time) {
        this.bubbles.forEach(stream => {
            stream.children.forEach((bubble, index) => {
                // Rising motion
                bubble.position.y += bubble.userData.riseSpeed * deltaTime;
                
                // Wobbling motion
                bubble.position.x = bubble.userData.baseX + 
                    Math.sin(time * bubble.userData.wobbleSpeed + index) * 0.5;
                
                // Reset if too high
                if (bubble.position.y > 30) {
                    bubble.position.y = 0;
                }
            });
        });
    }
    
    /**
     * Update seaweed swaying
     */
    updateSeaweedSwaying(deltaTime, time) {
        this.seaweed.forEach(weed => {
            if (weed.userData.swaySpeed) {
                const sway = Math.sin(time * weed.userData.swaySpeed) * weed.userData.swayAmplitude;
                weed.rotation.z = sway;
                
                // Individual segment movement
                weed.children.forEach((segment, index) => {
                    segment.rotation.z = sway * (index + 1) / weed.children.length;
                });
            }
        });
    }
    
    /**
     * Update water effects
     */
    updateWaterEffects(deltaTime, time) {
        this.waterEffects.forEach(effect => {
            if (effect.userData.type === 'caustic') {
                effect.material.opacity = 
                    effect.userData.intensity + 
                    Math.sin(time * effect.userData.waveSpeed) * 0.05;
            }
        });
    }
    
    /**
     * Update coral movement
     */
    updateCoralMovement(deltaTime, time) {
        this.corals.forEach(coral => {
            if (coral.userData.swaySpeed) {
                coral.rotation.z = Math.sin(time * coral.userData.swaySpeed) * coral.userData.swayAmplitude;
                
                // Color shifting effect
                if (coral.userData.colorShift) {
                    coral.children.forEach(coralPiece => {
                        if (coralPiece.material && coralPiece.material.emissiveIntensity !== undefined) {
                            coralPiece.material.emissiveIntensity = 
                                0.1 + Math.sin(time * 0.5) * 0.05;
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Helper methods
     */
    addReefFish(reef) {
        for (let i = 0; i < 3; i++) {
            const fish = this.createFish({
                x: (Math.random() - 0.5) * 8,
                y: 2 + Math.random() * 3,
                z: (Math.random() - 0.5) * 8
            });
            fish.scale.setScalar(0.5);
            reef.add(fish);
        }
    }
    
    addMarineGrowth(wreck) {
        // Add corals and barnacles to wreck
        for (let i = 0; i < 10; i++) {
            const growth = this.createCoral('brain', {
                x: (Math.random() - 0.5) * 20,
                y: Math.random() * 4,
                z: (Math.random() - 0.5) * 60
            });
            growth.scale.setScalar(0.3 + Math.random() * 0.5);
            wreck.add(growth);
        }
    }
    
    initializeWaterPhysics() {
        this.waterPhysics = {
            buoyancy: 0.8,
            resistance: 0.3,
            turbulence: 0.1
        };
    }
    
    initializeCurrentEffects() {
        this.currentEffects = {
            strength: 0.5,
            direction: new THREE.Vector3(0.2, 0, 0.8),
            variability: 0.3
        };
    }
    
    initializePressureEffects() {
        this.pressureEffects = {
            depth: 30,
            visibility: 0.6,
            colorFiltering: 0.4
        };
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.corals = [];
        this.seaCreatures = [];
        this.bubbles = [];
        this.seaweed = [];
        this.shipwrecks = [];
        this.treasures = [];
        this.waterEffects = [];
        this.schools = [];
        
        console.log('[Level 6] Underwater level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level6 = new Level6_Underwater();
    window.LevelManagerPro.registerLevel(level6);
    console.log('[Level 6] Underwater level registered');
}

// Export for use
window.Level6_Underwater = Level6_Underwater;