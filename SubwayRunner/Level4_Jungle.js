/**
 * Level 4: Jungle Adventure
 * Lush jungle environment with ancient temples and wildlife
 * 
 * @module Level4_Jungle
 */

class Level4_Jungle extends LevelBase {
    constructor() {
        super(4, 'Jungle Adventure', {
            // Visual settings
            fogColor: '#2d5a2d',
            fogDensity: 0.025,
            skyColor: '#4a8a4a',
            ambientIntensity: 0.4,
            sunIntensity: 0.9,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.3,
            obstacleSpawnMultiplier: 1.3,
            collectibleSpawnMultiplier: 1.2,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['swingingVines', 'wildlife', 'ancientTraps', 'vegetation']
        });
        
        // Level-specific objects
        this.trees = [];
        this.vines = [];
        this.temples = [];
        this.wildlife = [];
        this.ancientStatues = [];
        this.vegetation = [];
        this.waterfalls = [];
        this.jungleEffects = [];
    }
    
    /**
     * Create the jungle environment
     */
    async createEnvironment(scene, resourceManager) {
        // Create jungle floor
        this.createJungleFloor();
        
        // Create dense forest
        this.createForest();
        
        // Create ancient temples
        this.createAncientTemples();
        
        // Create swinging vines
        this.createSwingingVines();
        
        // Create wildlife
        this.createWildlife();
        
        // Create waterfalls
        this.createWaterfalls();
        
        // Create jungle atmosphere
        this.createJungleAtmosphere();
        
        // Create ancient ruins
        this.createAncientRuins();
        
        console.log('[Level 4] Jungle environment created');
    }
    
    /**
     * Create jungle floor
     */
    createJungleFloor() {
        // Main jungle path
        const pathGeometry = new THREE.PlaneGeometry(12, 1000);
        const pathMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            emissive: 0x2D1B05,
            emissiveIntensity: 0.1
        });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2;
        path.position.y = 0;
        path.receiveShadow = true;
        this.environmentGroup.add(path);
        
        // Add jungle undergrowth
        this.createUndergrowth();
        
        // Add fallen logs
        this.createFallenLogs();
    }
    
    /**
     * Create undergrowth
     */
    createUndergrowth() {
        const grassGeometry = new THREE.PlaneGeometry(0.5, 1);
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 300; i++) {
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
                (Math.random() - 0.5) * 20,
                0.5,
                -i * 3 - Math.random() * 5
            );
            grass.rotation.y = Math.random() * Math.PI;
            grass.rotation.z = (Math.random() - 0.5) * 0.3;
            
            this.vegetation.push(grass);
            this.environmentGroup.add(grass);
        }
    }
    
    /**
     * Create fallen logs
     */
    createFallenLogs() {
        const logGeometry = new THREE.CylinderGeometry(0.5, 0.7, 6);
        const logMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            emissive: 0x2D1B05,
            emissiveIntensity: 0.05
        });
        
        for (let i = 0; i < 20; i++) {
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.position.set(
                (Math.random() - 0.5) * 30,
                0.5,
                -i * 50 - Math.random() * 20
            );
            log.rotation.z = Math.PI / 2;
            log.rotation.y = (Math.random() - 0.5) * Math.PI;
            log.castShadow = true;
            log.receiveShadow = true;
            
            this.environmentGroup.add(log);
        }
    }
    
    /**
     * Create dense forest
     */
    createForest() {
        const treeTypes = ['palm', 'broad', 'tall', 'ancient'];
        
        for (let i = 0; i < 80; i++) {
            const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
            const tree = this.createTree(
                new THREE.Vector3(
                    i % 2 === 0 ? -20 - Math.random() * 25 : 20 + Math.random() * 25,
                    0,
                    -i * 15 - Math.random() * 10
                ),
                treeType
            );
            
            this.trees.push(tree);
            this.environmentGroup.add(tree);
        }
    }
    
    /**
     * Create tree
     */
    createTree(position, type) {
        const treeGroup = new THREE.Group();
        
        switch(type) {
            case 'palm':
                this.createPalmTree(treeGroup);
                break;
            case 'broad':
                this.createBroadTree(treeGroup);
                break;
            case 'tall':
                this.createTallTree(treeGroup);
                break;
            case 'ancient':
                this.createAncientTree(treeGroup);
                break;
        }
        
        treeGroup.position.copy(position);
        treeGroup.userData = {
            type: 'tree',
            treeType: type,
            swaySpeed: 0.5 + Math.random() * 0.5,
            swayAmplitude: 0.02 + Math.random() * 0.03
        };
        
        return treeGroup;
    }
    
    /**
     * Create palm tree
     */
    createPalmTree(treeGroup) {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 12);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Palm fronds
        const frondGeometry = new THREE.PlaneGeometry(8, 2);
        const frondMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 6; i++) {
            const frond = new THREE.Mesh(frondGeometry, frondMaterial);
            frond.position.set(0, 12, 0);
            frond.rotation.y = i * Math.PI / 3;
            frond.rotation.z = -0.3;
            treeGroup.add(frond);
        }
        
        // Coconuts
        this.addCoconuts(treeGroup);
    }
    
    /**
     * Create broad tree
     */
    createBroadTree(treeGroup) {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.8, 1.2, 10);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321 
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Canopy
        const canopyGeometry = new THREE.SphereGeometry(8, 12, 12);
        const canopyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x006400 
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 12;
        canopy.scale.y = 0.6;
        canopy.castShadow = true;
        treeGroup.add(canopy);
        
        // Add branches
        this.addBranches(treeGroup);
    }
    
    /**
     * Create tall tree
     */
    createTallTree(treeGroup) {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.8, 20);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 10;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Upper canopy
        const canopyGeometry = new THREE.ConeGeometry(6, 8, 8);
        const canopyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22 
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 24;
        canopy.castShadow = true;
        treeGroup.add(canopy);
    }
    
    /**
     * Create ancient tree
     */
    createAncientTree(treeGroup) {
        // Large ancient trunk
        const trunkGeometry = new THREE.CylinderGeometry(1.5, 2, 15);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            emissive: 0x2D1B05,
            emissiveIntensity: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 7.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Massive canopy
        const canopyGeometry = new THREE.SphereGeometry(12, 16, 16);
        const canopyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x013220 
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 18;
        canopy.scale.y = 0.7;
        canopy.castShadow = true;
        treeGroup.add(canopy);
        
        // Add moss and vines
        this.addMossAndVines(treeGroup);
    }
    
    /**
     * Create ancient temples
     */
    createAncientTemples() {
        for (let i = 0; i < 6; i++) {
            const temple = this.createTemple(
                new THREE.Vector3(
                    i % 2 === 0 ? -40 - Math.random() * 20 : 40 + Math.random() * 20,
                    0,
                    -i * 100 - 50
                )
            );
            
            this.temples.push(temple);
            this.environmentGroup.add(temple);
        }
    }
    
    /**
     * Create temple
     */
    createTemple(position) {
        const templeGroup = new THREE.Group();
        
        // Base platform
        const baseGeometry = new THREE.BoxGeometry(20, 2, 20);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969,
            emissive: 0x2F2F2F,
            emissiveIntensity: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        base.receiveShadow = true;
        templeGroup.add(base);
        
        // Temple structure
        const templeGeometry = new THREE.BoxGeometry(16, 12, 16);
        const templeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7355,
            emissive: 0x2D1B05,
            emissiveIntensity: 0.05
        });
        const temple = new THREE.Mesh(templeGeometry, templeMaterial);
        temple.position.y = 8;
        temple.castShadow = true;
        temple.receiveShadow = true;
        templeGroup.add(temple);
        
        // Temple roof
        const roofGeometry = new THREE.ConeGeometry(12, 6, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321 
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 17;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        templeGroup.add(roof);
        
        // Add temple details
        this.addTempleDetails(templeGroup);
        
        templeGroup.position.copy(position);
        templeGroup.userData = {
            type: 'temple',
            age: 'ancient',
            hasSecrets: true
        };
        
        return templeGroup;
    }
    
    /**
     * Create swinging vines
     */
    createSwingingVines() {
        for (let i = 0; i < 30; i++) {
            const vine = this.createVine(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 40,
                    15 + Math.random() * 10,
                    -i * 25 - Math.random() * 15
                )
            );
            
            this.vines.push(vine);
            this.addDynamicObject(vine, {
                type: 'vine',
                swingSpeed: 0.8 + Math.random() * 0.4,
                swingAmplitude: 0.3 + Math.random() * 0.4,
                baseRotation: vine.rotation.z
            });
        }
    }
    
    /**
     * Create vine
     */
    createVine(position) {
        const vineGroup = new THREE.Group();
        
        // Vine segments
        const segmentGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
        const vineMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22 
        });
        
        for (let i = 0; i < 8; i++) {
            const segment = new THREE.Mesh(segmentGeometry, vineMaterial);
            segment.position.y = -i * 0.8;
            vineGroup.add(segment);
        }
        
        // Vine leaves
        this.addVineLeaves(vineGroup);
        
        vineGroup.position.copy(position);
        this.environmentGroup.add(vineGroup);
        return vineGroup;
    }
    
    /**
     * Create wildlife
     */
    createWildlife() {
        // Create parrots
        for (let i = 0; i < 12; i++) {
            const parrot = this.createParrot(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    8 + Math.random() * 15,
                    -i * 80 - Math.random() * 40
                )
            );
            
            this.wildlife.push(parrot);
            this.addDynamicObject(parrot, {
                type: 'parrot',
                flightSpeed: 2 + Math.random() * 3,
                flightPattern: 'circle',
                baseY: parrot.position.y
            });
        }
        
        // Create monkeys
        for (let i = 0; i < 8; i++) {
            const monkey = this.createMonkey(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    5 + Math.random() * 10,
                    -i * 100 - Math.random() * 50
                )
            );
            
            this.wildlife.push(monkey);
            this.addDynamicObject(monkey, {
                type: 'monkey',
                swingSpeed: 1 + Math.random() * 2,
                restTime: 2 + Math.random() * 3
            });
        }
    }
    
    /**
     * Create parrot
     */
    createParrot(position) {
        const parrotGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        parrotGroup.add(body);
        
        // Wings
        const wingGeometry = new THREE.PlaneGeometry(0.4, 0.6);
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00FF00,
            side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.3, 0, 0);
        leftWing.rotation.y = Math.PI / 6;
        parrotGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.3, 0, 0);
        rightWing.rotation.y = -Math.PI / 6;
        parrotGroup.add(rightWing);
        
        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.8, 6);
        const tailMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x0000FF 
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0, -0.5);
        tail.rotation.x = Math.PI / 2;
        parrotGroup.add(tail);
        
        parrotGroup.position.copy(position);
        this.environmentGroup.add(parrotGroup);
        return parrotGroup;
    }
    
    /**
     * Create monkey
     */
    createMonkey(position) {
        const monkeyGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        monkeyGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 0.6;
        monkeyGroup.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-0.5, 0.2, 0);
        leftArm.rotation.z = Math.PI / 3;
        monkeyGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0.5, 0.2, 0);
        rightArm.rotation.z = -Math.PI / 3;
        monkeyGroup.add(rightArm);
        
        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0, -0.8);
        tail.rotation.x = Math.PI / 4;
        monkeyGroup.add(tail);
        
        monkeyGroup.position.copy(position);
        this.environmentGroup.add(monkeyGroup);
        return monkeyGroup;
    }
    
    /**
     * Create waterfalls
     */
    createWaterfalls() {
        for (let i = 0; i < 4; i++) {
            const waterfall = this.createWaterfall(
                new THREE.Vector3(
                    i % 2 === 0 ? -50 - Math.random() * 20 : 50 + Math.random() * 20,
                    20,
                    -i * 200 - 100
                )
            );
            
            this.waterfalls.push(waterfall);
            this.environmentGroup.add(waterfall);
        }
    }
    
    /**
     * Create waterfall
     */
    createWaterfall(position) {
        const waterfallGroup = new THREE.Group();
        
        // Water stream
        const streamGeometry = new THREE.PlaneGeometry(4, 20);
        const streamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const stream = new THREE.Mesh(streamGeometry, streamMaterial);
        stream.position.y = -10;
        waterfallGroup.add(stream);
        
        // Water mist
        this.addWaterMist(waterfallGroup);
        
        // Pool at bottom
        const poolGeometry = new THREE.CylinderGeometry(6, 6, 1);
        const poolMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4682B4,
            transparent: true,
            opacity: 0.8
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.y = -19;
        waterfallGroup.add(pool);
        
        waterfallGroup.position.copy(position);
        waterfallGroup.userData = {
            type: 'waterfall',
            flowSpeed: 2.0,
            mistIntensity: 0.5
        };
        
        return waterfallGroup;
    }
    
    /**
     * Create jungle atmosphere
     */
    createJungleAtmosphere() {
        // Add atmospheric particles (pollen, dust)
        for (let i = 0; i < 150; i++) {
            const particle = this.createParticle(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    Math.random() * 30,
                    -Math.random() * 500
                ),
                {
                    size: 0.02,
                    color: 0xFFFF99,
                    lifetime: 20.0,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.05,
                        0.02,
                        0
                    )
                }
            );
        }
        
        // Add fireflies
        this.createFireflies();
    }
    
    /**
     * Create fireflies
     */
    createFireflies() {
        for (let i = 0; i < 25; i++) {
            const firefly = this.createFirefly(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 80,
                    2 + Math.random() * 8,
                    -i * 40 - Math.random() * 20
                )
            );
            
            this.jungleEffects.push(firefly);
            this.environmentGroup.add(firefly);
        }
    }
    
    /**
     * Create firefly
     */
    createFirefly(position) {
        const fireflyGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const fireflyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.8
        });
        const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
        firefly.position.copy(position);
        
        firefly.userData = {
            type: 'firefly',
            glowSpeed: 1 + Math.random() * 2,
            flightSpeed: 0.5 + Math.random() * 1,
            baseY: position.y
        };
        
        return firefly;
    }
    
    /**
     * Create ancient ruins
     */
    createAncientRuins() {
        for (let i = 0; i < 10; i++) {
            const ruin = this.createRuin(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    0,
                    -i * 80 - Math.random() * 40
                )
            );
            
            this.ancientStatues.push(ruin);
            this.environmentGroup.add(ruin);
        }
    }
    
    /**
     * Create ruin
     */
    createRuin(position) {
        const ruinGroup = new THREE.Group();
        
        // Broken column
        const columnGeometry = new THREE.CylinderGeometry(0.8, 1, 6);
        const columnMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969,
            emissive: 0x2F2F2F,
            emissiveIntensity: 0.05
        });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.y = 3;
        column.rotation.z = (Math.random() - 0.5) * 0.3;
        ruinGroup.add(column);
        
        // Broken pieces
        for (let i = 0; i < 3; i++) {
            const pieceGeometry = new THREE.BoxGeometry(
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 0.5
            );
            const piece = new THREE.Mesh(pieceGeometry, columnMaterial);
            piece.position.set(
                (Math.random() - 0.5) * 4,
                0.5,
                (Math.random() - 0.5) * 4
            );
            piece.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            ruinGroup.add(piece);
        }
        
        // Add moss
        this.addMoss(ruinGroup);
        
        ruinGroup.position.copy(position);
        return ruinGroup;
    }
    
    /**
     * Initialize special mechanics
     */
    initializeSpecialMechanics(scene, resourceManager) {
        // Add jungle sound effects
        this.initializeJungleSounds();
        
        // Add weather effects
        this.initializeWeatherEffects();
        
        // Add animal behaviors
        this.initializeAnimalBehaviors();
    }
    
    /**
     * Update special mechanics
     */
    updateSpecialMechanics(deltaTime, gameState) {
        const time = Date.now() * 0.001;
        
        // Update swinging vines
        this.updateSwingingVines(deltaTime, time);
        
        // Update wildlife
        this.updateWildlife(deltaTime, time);
        
        // Update tree swaying
        this.updateTreeSwaying(deltaTime, time);
        
        // Update fireflies
        this.updateFireflies(deltaTime, time);
        
        // Update waterfall effects
        this.updateWaterfallEffects(deltaTime);
    }
    
    /**
     * Update swinging vines
     */
    updateSwingingVines(deltaTime, time) {
        this.vines.forEach(vine => {
            if (vine.userData.swingSpeed) {
                vine.rotation.z = vine.userData.baseRotation + 
                    Math.sin(time * vine.userData.swingSpeed) * vine.userData.swingAmplitude;
            }
        });
    }
    
    /**
     * Update wildlife
     */
    updateWildlife(deltaTime, time) {
        this.wildlife.forEach(animal => {
            if (animal.userData.type === 'parrot') {
                // Circular flight pattern
                animal.position.x = animal.userData.baseX + 
                    Math.cos(time * animal.userData.flightSpeed) * 5;
                animal.position.y = animal.userData.baseY + 
                    Math.sin(time * animal.userData.flightSpeed * 0.5) * 2;
            } else if (animal.userData.type === 'monkey') {
                // Swinging motion
                animal.rotation.z = Math.sin(time * animal.userData.swingSpeed) * 0.3;
            }
        });
    }
    
    /**
     * Update tree swaying
     */
    updateTreeSwaying(deltaTime, time) {
        this.trees.forEach(tree => {
            if (tree.userData.swaySpeed) {
                tree.rotation.z = Math.sin(time * tree.userData.swaySpeed) * tree.userData.swayAmplitude;
            }
        });
    }
    
    /**
     * Update fireflies
     */
    updateFireflies(deltaTime, time) {
        this.jungleEffects.forEach(firefly => {
            if (firefly.userData.type === 'firefly') {
                // Glowing effect
                firefly.material.emissiveIntensity = 
                    0.5 + Math.sin(time * firefly.userData.glowSpeed) * 0.3;
                
                // Floating movement
                firefly.position.y = firefly.userData.baseY + 
                    Math.sin(time * firefly.userData.flightSpeed) * 1;
                firefly.position.x += Math.cos(time * firefly.userData.flightSpeed * 0.7) * 0.01;
            }
        });
    }
    
    /**
     * Update waterfall effects
     */
    updateWaterfallEffects(deltaTime) {
        this.waterfalls.forEach(waterfall => {
            // Add water particles
            if (Math.random() < 0.1) {
                const particle = this.createParticle(
                    waterfall.position.clone().add(new THREE.Vector3(0, -10, 0)),
                    {
                        size: 0.1,
                        color: 0x87CEEB,
                        lifetime: 2.0,
                        velocity: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.2,
                            -1,
                            (Math.random() - 0.5) * 0.2
                        )
                    }
                );
            }
        });
    }
    
    /**
     * Helper methods
     */
    addCoconuts(palmTree) {
        const coconutGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const coconutMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        
        for (let i = 0; i < 3; i++) {
            const coconut = new THREE.Mesh(coconutGeometry, coconutMaterial);
            coconut.position.set(
                Math.cos(i * Math.PI * 2/3) * 2,
                11,
                Math.sin(i * Math.PI * 2/3) * 2
            );
            palmTree.add(coconut);
        }
    }
    
    addBranches(tree) {
        const branchGeometry = new THREE.CylinderGeometry(0.1, 0.2, 4);
        const branchMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 
        });
        
        for (let i = 0; i < 5; i++) {
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            branch.position.set(
                Math.cos(i * Math.PI * 2/5) * 6,
                8 + Math.random() * 4,
                Math.sin(i * Math.PI * 2/5) * 6
            );
            branch.rotation.z = Math.PI / 2;
            tree.add(branch);
        }
    }
    
    addMossAndVines(tree) {
        // Add moss patches
        const mossGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const mossMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x9ACD32 
        });
        
        for (let i = 0; i < 8; i++) {
            const moss = new THREE.Mesh(mossGeometry, mossMaterial);
            moss.position.set(
                (Math.random() - 0.5) * 3,
                Math.random() * 15,
                (Math.random() - 0.5) * 3
            );
            tree.add(moss);
        }
    }
    
    addTempleDetails(temple) {
        // Add carved symbols
        const symbolGeometry = new THREE.PlaneGeometry(2, 2);
        const symbolMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444 
        });
        
        for (let i = 0; i < 4; i++) {
            const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
            symbol.position.set(
                Math.cos(i * Math.PI / 2) * 8.1,
                8,
                Math.sin(i * Math.PI / 2) * 8.1
            );
            symbol.rotation.y = -i * Math.PI / 2;
            temple.add(symbol);
        }
    }
    
    addVineLeaves(vine) {
        const leafGeometry = new THREE.PlaneGeometry(0.3, 0.5);
        const leafMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 6; i++) {
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 0.3,
                -i * 1.2,
                (Math.random() - 0.5) * 0.3
            );
            leaf.rotation.y = Math.random() * Math.PI;
            vine.add(leaf);
        }
    }
    
    addWaterMist(waterfall) {
        for (let i = 0; i < 20; i++) {
            const mistGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const mistMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3
            });
            const mist = new THREE.Mesh(mistGeometry, mistMaterial);
            mist.position.set(
                (Math.random() - 0.5) * 8,
                -15 + Math.random() * 10,
                (Math.random() - 0.5) * 4
            );
            waterfall.add(mist);
        }
    }
    
    addMoss(ruin) {
        const mossGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const mossMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x9ACD32 
        });
        
        for (let i = 0; i < 5; i++) {
            const moss = new THREE.Mesh(mossGeometry, mossMaterial);
            moss.position.set(
                (Math.random() - 0.5) * 2,
                Math.random() * 6,
                (Math.random() - 0.5) * 2
            );
            ruin.add(moss);
        }
    }
    
    initializeJungleSounds() {
        this.jungleSounds = {
            birds: true,
            insects: true,
            waterfall: true,
            leaves: true
        };
    }
    
    initializeWeatherEffects() {
        this.weatherEffects = {
            humidity: 0.8,
            temperature: 28,
            windSpeed: 0.3,
            lightFiltering: 0.7
        };
    }
    
    initializeAnimalBehaviors() {
        this.animalBehaviors = {
            flocking: true,
            territorial: true,
            feeding: true,
            communication: true
        };
    }
    
    /**
     * Level-specific cleanup
     */
    onDispose() {
        // Clear arrays
        this.trees = [];
        this.vines = [];
        this.temples = [];
        this.wildlife = [];
        this.ancientStatues = [];
        this.vegetation = [];
        this.waterfalls = [];
        this.jungleEffects = [];
        
        console.log('[Level 4] Jungle level disposed');
    }
}

// Register the level
if (window.LevelManagerPro) {
    const level4 = new Level4_Jungle();
    window.LevelManagerPro.registerLevel(level4);
    console.log('[Level 4] Jungle level registered');
}

// Export for use
window.Level4_Jungle = Level4_Jungle;