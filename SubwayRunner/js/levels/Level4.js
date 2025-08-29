// Level4.js - Space Station
const Level4 = {
    name: "Space Station",
    description: "Futuristic space station with zero-gravity sections and cosmic phenomena",
    id: 4,
    
    // Store references to level-specific objects
    objects: {
        metalPanels: [],
        hologramProjectors: [],
        spaceDoors: [],
        energyFields: [],
        starField: null,
        nebulaClouds: [],
        spaceDebris: [],
        forceFields: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('🚀 Loading Level 4: Space Station');
        
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
        
        // Update fog and renderer for space
        scene.fog = new THREE.FogExp2(0x000033, 0.005); // Deep space fog
        renderer.setClearColor(0x000011);
        
        // Update ambient lighting to cool space ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x6699FF);
            ambientLight.intensity = 0.4;
        }
        
        // Add blue directional light for tech feel
        const dirLight = new THREE.DirectionalLight(0x00CCFF, 0.8);
        dirLight.position.set(-5, 8, 5);
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createStarField();
        this.createMetalPanels();
        this.createHologramProjectors();
        this.createSpaceDoors();
        this.createEnergyFields();
        this.createNebulaClouds();
        this.createSpaceDebris();
        this.createForceFields();
    },
    
    createStarField: function() {
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;     // x
            positions[i + 1] = (Math.random() - 0.5) * 100; // y
            positions[i + 2] = -Math.random() * 500 - 100;  // z
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.userData = { type: 'starField', levelObject: true };
        this.scene.add(stars);
        this.objects.starField = stars;
    },
    
    createMetalPanels: function() {
        const panelGeometry = new THREE.BoxGeometry(2, 6, 0.2);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x708090,
            metalness: 0.8,
            roughness: 0.2
        });
        
        // Create metal corridor panels
        for (let i = 0; i < 15; i++) {
            // Left panels
            const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            leftPanel.position.set(-4, 3, -i * 8 - 20);
            leftPanel.userData = { type: 'metalPanel', levelObject: true };
            this.scene.add(leftPanel);
            this.objects.metalPanels.push(leftPanel);
            
            // Right panels
            const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            rightPanel.position.set(4, 3, -i * 8 - 20);
            rightPanel.userData = { type: 'metalPanel', levelObject: true };
            this.scene.add(rightPanel);
            this.objects.metalPanels.push(rightPanel);
            
            // Ceiling panels
            const ceilingPanel = new THREE.Mesh(
                new THREE.BoxGeometry(8, 0.2, 2),
                panelMaterial
            );
            ceilingPanel.position.set(0, 6, -i * 8 - 20);
            ceilingPanel.userData = { type: 'ceilingPanel', levelObject: true };
            this.scene.add(ceilingPanel);
            this.objects.metalPanels.push(ceilingPanel);
        }
    },
    
    createHologramProjectors: function() {
        const projectorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
        const projectorMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
        
        // Create hologram projectors
        for (let i = 0; i < 8; i++) {
            const projector = new THREE.Mesh(projectorGeometry, projectorMaterial);
            projector.position.set(
                (i % 2 === 0) ? -3 : 3,
                5.5,
                -i * 12 - 30
            );
            projector.userData = { type: 'hologramProjector', levelObject: true };
            this.scene.add(projector);
            this.objects.hologramProjectors.push(projector);
            
            // Create hologram effect
            this.createHologramBeam(projector.position.x, projector.position.y - 0.5, projector.position.z);
        }
    },
    
    createHologramBeam: function(x, y, z) {
        const beamGeometry = new THREE.ConeGeometry(0.1, 2, 8, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(x, y - 1, z);
        beam.userData = { type: 'hologramBeam', levelObject: true, animated: true };
        this.scene.add(beam);
        this.objects.energyFields.push(beam);
    },
    
    createSpaceDoors: function() {
        const doorGeometry = new THREE.BoxGeometry(3, 4, 0.3);
        const doorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1,
            emissive: 0x002244
        });
        
        // Create automatic doors at intervals
        for (let i = 0; i < 5; i++) {
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, 2, -i * 20 - 50);
            door.userData = { type: 'spaceDoor', levelObject: true, animated: true };
            this.scene.add(door);
            this.objects.spaceDoors.push(door);
        }
    },
    
    createEnergyFields: function() {
        const fieldGeometry = new THREE.PlaneGeometry(1, 4);
        const fieldMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        // Create energy barriers
        for (let i = 0; i < 6; i++) {
            const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
            field.position.set(
                (i % 3 - 1) * 2, // -2, 0, 2
                2,
                -i * 15 - 40
            );
            field.userData = { type: 'energyField', levelObject: true, animated: true };
            this.scene.add(field);
            this.objects.energyFields.push(field);
        }
    },
    
    createNebulaClouds: function() {
        const cloudGeometry = new THREE.SphereGeometry(3, 8, 6);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9932CC,
            transparent: true,
            opacity: 0.2
        });
        
        // Create nebula clouds in the distance
        for (let i = 0; i < 4; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 30,
                5 + Math.random() * 10,
                -i * 30 - 80
            );
            cloud.userData = { type: 'nebulaCloud', levelObject: true, animated: true };
            this.scene.add(cloud);
            this.objects.nebulaClouds.push(cloud);
        }
    },
    
    createSpaceDebris: function() {
        const debrisGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const debrisMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        
        // Create floating debris
        for (let i = 0; i < 20; i++) {
            const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
            debris.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 8,
                -Math.random() * 200 - 50
            );
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            debris.userData = { type: 'spaceDebris', levelObject: true, animated: true };
            this.scene.add(debris);
            this.objects.spaceDebris.push(debris);
        }
    },
    
    createForceFields: function() {
        // Create circular force field effects
        const ringGeometry = new THREE.RingGeometry(1, 2, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 4; i++) {
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(0, 3, -i * 25 - 60);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { type: 'forceField', levelObject: true, animated: true };
            this.scene.add(ring);
            this.objects.forceFields.push(ring);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate hologram beams
        this.objects.energyFields.forEach((beam, index) => {
            if (beam.userData.type === 'hologramBeam') {
                beam.rotation.y += deltaTime * 2;
                beam.material.opacity = 0.3 + 0.2 * Math.sin(time * 3 + index);
            } else if (beam.userData.type === 'energyField') {
                beam.material.opacity = 0.4 + 0.3 * Math.sin(time * 4 + index);
                beam.position.x += 0.02 * Math.sin(time + index);
            }
        });
        
        // Animate space doors
        this.objects.spaceDoors.forEach((door, index) => {
            door.material.emissive.setHSL(0.6, 1, 0.1 + 0.1 * Math.sin(time * 2 + index));
        });
        
        // Animate nebula clouds
        this.objects.nebulaClouds.forEach((cloud, index) => {
            cloud.rotation.y += deltaTime * 0.2;
            cloud.position.y += 0.05 * Math.sin(time * 0.5 + index);
            cloud.material.opacity = 0.1 + 0.2 * Math.sin(time + index);
        });
        
        // Animate space debris
        this.objects.spaceDebris.forEach((debris, index) => {
            debris.rotation.x += deltaTime * 0.5;
            debris.rotation.y += deltaTime * 0.3;
            debris.rotation.z += deltaTime * 0.7;
        });
        
        // Animate force fields
        this.objects.forceFields.forEach((ring, index) => {
            ring.rotation.z += deltaTime * 1.5;
            ring.scale.setScalar(1 + 0.1 * Math.sin(time * 2 + index));
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
            } else if (objectArray && objectArray.parent) {
                objectArray.parent.remove(objectArray);
                if (objectArray.geometry) objectArray.geometry.dispose();
                if (objectArray.material) objectArray.material.dispose();
            }
        });
        
        // Remove directional light
        if (this.objects.dirLight) {
            this.scene.remove(this.objects.dirLight);
            this.objects.dirLight = null;
        }
        
        console.log('🚀 Level 4 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level4;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(4, Level4);
    console.log('✅ Level 4: Space Station registered');
}