// Level9.js - Time Vortex
const Level9 = {
    name: "Time Vortex",
    description: "Temporal distortion with time fragments, clock mechanisms, and reality warps",
    id: 9,
    
    // Store references to level-specific objects
    objects: {
        timeFragments: [],
        clockGears: [],
        temporalRifts: [],
        timeCrystals: [],
        chronoParticles: [],
        realityWarps: [],
        pendulums: [],
        horologicalDevices: []
    },
    
    // Initialize and load the level
    load: function(scene, renderer) {
        console.log('⏰ Loading Level 9: Time Vortex');
        
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
        
        // Update fog and renderer for temporal atmosphere
        scene.fog = new THREE.FogExp2(0x2D1B69, 0.012); // Deep purple temporal fog
        renderer.setClearColor(0x1a0d40);
        
        // Update ambient lighting to temporal ambiance
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x6A5ACD);
            ambientLight.intensity = 0.7;
        }
        
        // Add shifting temporal light
        const dirLight = new THREE.DirectionalLight(0x9370DB, 0.9);
        dirLight.position.set(0, 12, -8);
        dirLight.castShadow = true;
        scene.add(dirLight);
        this.objects.dirLight = dirLight;
    },
    
    createEnvironment: function() {
        this.createTemporalFloor();
        this.createTimeFragments();
        this.createClockGears();
        this.createTemporalRifts();
        this.createTimeCrystals();
        this.createChronoParticles();
        this.createRealityWarps();
        this.createPendulums();
        this.createHorologicalDevices();
    },
    
    createTemporalFloor: function() {
        // Create shifting temporal floor
        const floorGeometry = new THREE.PlaneGeometry(12, 300);
        const floorMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x483D8B,
            transparent: true,
            opacity: 0.8
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.position.z = -150;
        floor.userData = { type: 'temporalFloor', levelObject: true, animated: true };
        this.scene.add(floor);
        this.objects.timeFragments.push(floor);
    },
    
    createTimeFragments: function() {
        // Create floating time fragment shards
        const fragmentShapes = [
            new THREE.TetrahedronGeometry(0.8),
            new THREE.OctahedronGeometry(0.6),
            new THREE.DodecahedronGeometry(0.5),
            new THREE.IcosahedronGeometry(0.7)
        ];
        
        const fragmentMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9370DB,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        
        for (let i = 0; i < 25; i++) {
            const fragmentGeometry = fragmentShapes[Math.floor(Math.random() * fragmentShapes.length)];
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            
            fragment.position.set(
                (Math.random() - 0.5) * 10,
                1 + Math.random() * 6,
                -i * 10 - 30
            );
            
            fragment.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            fragment.userData = { 
                type: 'timeFragment', 
                levelObject: true, 
                animated: true,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 2
                }
            };
            this.scene.add(fragment);
            this.objects.timeFragments.push(fragment);
        }
    },
    
    createClockGears: function() {
        // Create massive clock gears
        const gearGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 16);
        const gearMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xDAA520,
            metalness: 0.8
        });
        
        for (let i = 0; i < 8; i++) {
            const gear = new THREE.Mesh(gearGeometry, gearMaterial);
            gear.position.set(
                (i % 2 === 0) ? -5 : 5,
                4,
                -i * 18 - 40
            );
            gear.rotation.x = Math.PI / 2;
            gear.userData = { 
                type: 'clockGear', 
                levelObject: true, 
                animated: true,
                spinDirection: i % 2 === 0 ? 1 : -1,
                spinSpeed: 0.5 + Math.random() * 1.0
            };
            this.scene.add(gear);
            this.objects.clockGears.push(gear);
            
            // Add gear teeth
            this.createGearTeeth(gear);
        }
    },
    
    createGearTeeth: function(gear) {
        const toothGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.4);
        const toothMaterial = new THREE.MeshLambertMaterial({ color: 0xB8860B });
        
        const teethCount = 12;
        for (let i = 0; i < teethCount; i++) {
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            const angle = (i / teethCount) * Math.PI * 2;
            tooth.position.set(
                Math.cos(angle) * 2.2,
                0,
                Math.sin(angle) * 2.2
            );
            tooth.rotation.y = angle;
            gear.add(tooth);
        }
    },
    
    createTemporalRifts: function() {
        // Create swirling temporal rifts
        const riftGeometry = new THREE.RingGeometry(0.5, 2, 16);
        const riftMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8A2BE2,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 6; i++) {
            const rift = new THREE.Mesh(riftGeometry, riftMaterial);
            rift.position.set(
                (Math.random() - 0.5) * 8,
                2 + Math.random() * 4,
                -i * 25 - 50
            );
            rift.rotation.x = Math.PI / 2;
            rift.userData = { 
                type: 'temporalRift', 
                levelObject: true, 
                animated: true,
                pulseOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(rift);
            this.objects.temporalRifts.push(rift);
        }
    },
    
    createTimeCrystals: function() {
        // Create time crystals that show different time periods
        const crystalGeometry = new THREE.OctahedronGeometry(1);
        const crystalColors = [0xFF69B4, 0x9370DB, 0x4169E1, 0x00CED1, 0x32CD32];
        
        for (let i = 0; i < 10; i++) {
            const crystalColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
            const crystalMaterial = new THREE.MeshBasicMaterial({ 
                color: crystalColor,
                transparent: true,
                opacity: 0.8,
                emissive: crystalColor,
                emissiveIntensity: 0.3
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                (Math.random() - 0.5) * 10,
                1 + Math.random() * 4,
                -i * 15 - 35
            );
            crystal.userData = { 
                type: 'timeCrystal', 
                levelObject: true, 
                animated: true,
                phaseOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(crystal);
            this.objects.timeCrystals.push(crystal);
        }
    },
    
    createChronoParticles: function() {
        // Create chronoton particles
        const particleCount = 150;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = Math.random() * 12;
            positions[i3 + 2] = -Math.random() * 300 - 50;
            
            // Time-shifting colors
            const hue = Math.random();
            colors[i3] = hue;
            colors[i3 + 1] = 0.7 + Math.random() * 0.3;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = { type: 'chronoParticles', levelObject: true, animated: true };
        this.scene.add(particles);
        this.objects.chronoParticles.push(particles);
    },
    
    createRealityWarps: function() {
        // Create reality distortion effects
        const warpGeometry = new THREE.SphereGeometry(1.5, 16, 12);
        const warpMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x663399,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        for (let i = 0; i < 4; i++) {
            const warp = new THREE.Mesh(warpGeometry, warpMaterial);
            warp.position.set(0, 3, -i * 40 - 80);
            warp.userData = { 
                type: 'realityWarp', 
                levelObject: true, 
                animated: true,
                distortionPhase: Math.random() * Math.PI * 2
            };
            this.scene.add(warp);
            this.objects.realityWarps.push(warp);
        }
    },
    
    createPendulums: function() {
        // Create giant pendulums
        const pendulumArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
        const pendulumArmMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const pendulumBobGeometry = new THREE.SphereGeometry(0.5, 12, 8);
        const pendulumBobMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        
        for (let i = 0; i < 4; i++) {
            const pendulumGroup = new THREE.Group();
            
            const arm = new THREE.Mesh(pendulumArmGeometry, pendulumArmMaterial);
            arm.position.y = -3;
            pendulumGroup.add(arm);
            
            const bob = new THREE.Mesh(pendulumBobGeometry, pendulumBobMaterial);
            bob.position.y = -6;
            pendulumGroup.add(bob);
            
            pendulumGroup.position.set(
                (i % 2 === 0) ? -3 : 3,
                8,
                -i * 30 - 60
            );
            
            pendulumGroup.userData = { 
                type: 'pendulum', 
                levelObject: true, 
                animated: true,
                swingOffset: Math.random() * Math.PI * 2,
                swingSpeed: 0.8 + Math.random() * 0.4
            };
            
            this.scene.add(pendulumGroup);
            this.objects.pendulums.push(pendulumGroup);
        }
    },
    
    createHorologicalDevices: function() {
        // Create complex clockwork devices
        const deviceBaseGeometry = new THREE.BoxGeometry(2, 1, 2);
        const deviceBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
        
        for (let i = 0; i < 6; i++) {
            const device = new THREE.Group();
            
            // Base
            const base = new THREE.Mesh(deviceBaseGeometry, deviceBaseMaterial);
            device.add(base);
            
            // Clock face
            const faceGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
            const faceMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const face = new THREE.Mesh(faceGeometry, faceMaterial);
            face.position.y = 0.6;
            face.rotation.x = Math.PI / 2;
            device.add(face);
            
            // Clock hands
            const handGeometry = new THREE.BoxGeometry(0.02, 0.5, 0.02);
            const handMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            const hourHand = new THREE.Mesh(handGeometry, handMaterial);
            hourHand.position.set(0, 0.65, 0);
            device.add(hourHand);
            
            const minuteHand = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.7, 0.02),
                handMaterial
            );
            minuteHand.position.set(0, 0.65, 0);
            device.add(minuteHand);
            
            device.position.set(
                (Math.random() - 0.5) * 8,
                0.5,
                -i * 20 - 45
            );
            
            device.userData = { 
                type: 'horologicalDevice', 
                levelObject: true, 
                animated: true,
                clockSpeed: {
                    hour: 0.1 + Math.random() * 0.2,
                    minute: 1 + Math.random() * 2
                }
            };
            
            this.scene.add(device);
            this.objects.horologicalDevices.push(device);
        }
    },
    
    // Update level-specific animations
    update: function(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Animate temporal floor
        this.objects.timeFragments.forEach((fragment, index) => {
            if (fragment.userData.type === 'temporalFloor') {
                const hue = (time * 0.1 + index * 0.1) % 1;
                fragment.material.color.setHSL(hue, 0.6, 0.4);
            } else if (fragment.userData.type === 'timeFragment') {
                const speeds = fragment.userData.rotationSpeed;
                fragment.rotation.x += deltaTime * speeds.x;
                fragment.rotation.y += deltaTime * speeds.y;
                fragment.rotation.z += deltaTime * speeds.z;
                
                // Phase shifting
                const phase = Math.sin(time * 2 + index);
                fragment.material.opacity = 0.5 + 0.3 * phase;
            }
        });
        
        // Animate clock gears
        this.objects.clockGears.forEach((gear, index) => {
            gear.rotation.z += deltaTime * gear.userData.spinSpeed * gear.userData.spinDirection;
        });
        
        // Animate temporal rifts
        this.objects.temporalRifts.forEach((rift, index) => {
            const offset = rift.userData.pulseOffset;
            rift.rotation.z += deltaTime * 1.5;
            rift.scale.setScalar(1 + 0.2 * Math.sin(time * 2 + offset));
            
            const hue = (time * 0.2 + offset) % 1;
            rift.material.color.setHSL(hue, 1, 0.7);
        });
        
        // Animate time crystals
        this.objects.timeCrystals.forEach((crystal, index) => {
            const offset = crystal.userData.phaseOffset;
            crystal.rotation.y += deltaTime * 0.8;
            crystal.position.y += Math.sin(time * 1.5 + offset) * deltaTime * 0.3;
            
            // Time dilation effect
            const scale = 0.8 + 0.4 * Math.sin(time + offset);
            crystal.scale.setScalar(scale);
        });
        
        // Animate chrono particles
        this.objects.chronoParticles.forEach(particles => {
            const positions = particles.geometry.attributes.position.array;
            const colors = particles.geometry.attributes.color.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Temporal movement
                positions[i + 1] += deltaTime * 1.5; // Float up
                if (positions[i + 1] > 15) positions[i + 1] = 0;
                
                // Color shifting through time
                const hue = (time * 0.5 + i * 0.01) % 1;
                colors[i] = hue;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.color.needsUpdate = true;
        });
        
        // Animate reality warps
        this.objects.realityWarps.forEach((warp, index) => {
            const phase = warp.userData.distortionPhase;
            warp.rotation.x += deltaTime * 0.7;
            warp.rotation.y += deltaTime * 0.5;
            warp.scale.setScalar(1 + 0.3 * Math.sin(time * 3 + phase));
        });
        
        // Animate pendulums
        this.objects.pendulums.forEach((pendulum, index) => {
            const offset = pendulum.userData.swingOffset;
            const speed = pendulum.userData.swingSpeed;
            pendulum.rotation.z = Math.sin(time * speed + offset) * 0.6;
        });
        
        // Animate horological devices
        this.objects.horologicalDevices.forEach((device, index) => {
            const hourHand = device.children[2];
            const minuteHand = device.children[3];
            
            if (hourHand && minuteHand) {
                hourHand.rotation.z += deltaTime * device.userData.clockSpeed.hour;
                minuteHand.rotation.z += deltaTime * device.userData.clockSpeed.minute;
            }
        });
        
        // Animate directional light color shifting
        if (this.objects.dirLight) {
            const hue = (time * 0.05) % 1;
            this.objects.dirLight.color.setHSL(hue, 0.6, 0.8);
        }
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
        
        console.log('⏰ Level 9 cleaned up');
    }
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level9;
}

// Register with LevelManager
if (typeof LevelManager !== 'undefined') {
    LevelManager.registerLevel(9, Level9);
    console.log('✅ Level 9: Time Vortex registered');
}