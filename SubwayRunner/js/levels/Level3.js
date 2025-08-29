// Level3.js - Ancient Temple
const Level3 = {
    name: "Ancient Temple",
    description: "Mystical temple ruins with golden treasures and ancient traps",
    id: 3,
    
    // Store references to level-specific objects
    objects: {
        templeColumns: [],
        torches: [],
        goldenStatues: [],
        mysticalParticles: [],
        fireEffects: [],
        ancientRunes: [],
        shadowPlanes: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('🏛️ Loading Level 3: Ancient Temple');
        
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
        scene.fog = new THREE.FogExp2(0x8B4513, 0.015); // Sandy brown fog
        renderer.setClearColor(0x654321);
        
        // Update ambient lighting to golden temple ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0xFFD700);
            ambientLight.intensity = 0.8;
        }
        
        // Add directional light for dramatic shadows
        const dirLight = new THREE.DirectionalLight(0xFFA500, 1.0);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createTempleColumns();
        this.createTorches();
        this.createGoldenStatues();
        this.createMysticalParticles();
        this.createAncientRunes();
        this.createFloorPattern();
    },
    
    createTempleColumns: function() {
        const columnGeometry = new THREE.CylinderGeometry(0.5, 0.6, 8, 8);
        const columnMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xDEB887,
            transparent: true,
            opacity: 0.9
        });
        
        // Create columns on both sides
        for (let i = 0; i < 10; i++) {
            // Left side columns
            const leftColumn = new THREE.Mesh(columnGeometry, columnMaterial);
            leftColumn.position.set(-4, 4, -i * 8 - 20);
            leftColumn.castShadow = true;
            leftColumn.userData = { type: 'templeColumn', levelObject: true };
            this.scene.add(leftColumn);
            this.objects.templeColumns.push(leftColumn);
            
            // Right side columns
            const rightColumn = new THREE.Mesh(columnGeometry, columnMaterial);
            rightColumn.position.set(4, 4, -i * 8 - 20);
            rightColumn.castShadow = true;
            rightColumn.userData = { type: 'templeColumn', levelObject: true };
            this.scene.add(rightColumn);
            this.objects.templeColumns.push(rightColumn);
        }
    },
    
    createTorches: function() {
        const torchBaseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2, 6);
        const torchBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        // Create torches between columns
        for (let i = 0; i < 8; i++) {
            // Left torches
            const leftTorch = new THREE.Mesh(torchBaseGeometry, torchBaseMaterial);
            leftTorch.position.set(-3.5, 1, -i * 10 - 25);
            leftTorch.userData = { type: 'torch', levelObject: true };
            this.scene.add(leftTorch);
            this.objects.torches.push(leftTorch);
            
            // Add flame effect
            this.createFlameEffect(-3.5, 2.2, -i * 10 - 25);
            
            // Right torches
            const rightTorch = new THREE.Mesh(torchBaseGeometry, torchBaseMaterial);
            rightTorch.position.set(3.5, 1, -i * 10 - 25);
            rightTorch.userData = { type: 'torch', levelObject: true };
            this.scene.add(rightTorch);
            this.objects.torches.push(rightTorch);
            
            // Add flame effect
            this.createFlameEffect(3.5, 2.2, -i * 10 - 25);
        }
    },
    
    createFlameEffect: function(x, y, z) {
        const flameGeometry = new THREE.ConeGeometry(0.2, 0.6, 6);
        const flameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(x, y, z);
        flame.userData = { type: 'flame', levelObject: true, animated: true };
        this.scene.add(flame);
        this.objects.fireEffects.push(flame);
    },
    
    createGoldenStatues: function() {
        const statueGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.8);
        const statueMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD700,
            shininess: 100
        });
        
        // Create golden statues at specific locations
        const positions = [
            { x: 0, z: -30 },
            { x: -1.5, z: -60 },
            { x: 1.5, z: -60 },
            { x: 0, z: -90 }
        ];
        
        positions.forEach(pos => {
            const statue = new THREE.Mesh(statueGeometry, statueMaterial);
            statue.position.set(pos.x, 1.25, pos.z);
            statue.castShadow = true;
            statue.userData = { type: 'goldenStatue', levelObject: true };
            this.scene.add(statue);
            this.objects.goldenStatues.push(statue);
        });
    },
    
    createMysticalParticles: function() {
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;     // x
            positions[i + 1] = Math.random() * 10;         // y
            positions[i + 2] = -Math.random() * 200 - 50;  // z
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = { type: 'mysticalParticles', levelObject: true, animated: true };
        this.scene.add(particles);
        this.objects.mysticalParticles.push(particles);
    },
    
    createAncientRunes: function() {
        const runeGeometry = new THREE.PlaneGeometry(1, 1);
        const runeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 0.7
        });
        
        // Create floating rune symbols
        for (let i = 0; i < 6; i++) {
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                (Math.random() - 0.5) * 6,
                3 + Math.random() * 2,
                -i * 15 - 40
            );
            rune.rotation.y = Math.random() * Math.PI;
            rune.userData = { type: 'ancientRune', levelObject: true, animated: true };
            this.scene.add(rune);
            this.objects.ancientRunes.push(rune);
        }
    },
    
    createFloorPattern: function() {
        const floorGeometry = new THREE.PlaneGeometry(8, 200);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7355,
            transparent: true,
            opacity: 0.8
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.position.z = -100;
        floor.receiveShadow = true;
        floor.userData = { type: 'templeFloor', levelObject: true };
        this.scene.add(floor);
        this.objects.shadowPlanes.push(floor);
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate flames
        this.objects.fireEffects.forEach((flame, index) => {
            flame.scale.y = 1 + 0.3 * Math.sin(time * 3 + index);
            flame.material.opacity = 0.6 + 0.2 * Math.sin(time * 2 + index);
        });
        
        // Animate mystical particles
        this.objects.mysticalParticles.forEach(particles => {
            particles.rotation.y += deltaTime * 0.2;
            const positions = particles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += deltaTime * 2; // Move particles up
                if (positions[i] > 12) positions[i] = 0; // Reset to bottom
            }
            particles.geometry.attributes.position.needsUpdate = true;
        });
        
        // Animate ancient runes
        this.objects.ancientRunes.forEach((rune, index) => {
            rune.rotation.z += deltaTime * 0.5;
            rune.position.y += 0.02 * Math.sin(time + index);
            rune.material.opacity = 0.5 + 0.3 * Math.sin(time * 2 + index);
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
        
        console.log('🏛️ Level 3 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level3;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(3, Level3);
    console.log('✅ Level 3: Ancient Temple registered');
}