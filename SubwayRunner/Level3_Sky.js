/**
 * Level 3: Sky High
 * Floating in the clouds environment
 * 
 * @module Level3_Sky
 */

class Level3_Sky extends LevelBase {
    constructor() {
        super(3, 'Sky High', {
            // Visual settings
            fogColor: '#87CEEB',
            fogDensity: 0.01,
            skyColor: '#87CEEB',
            ambientIntensity: 0.8,
            sunIntensity: 1.0,
            
            // Gameplay settings
            baseSpeedMultiplier: 1.3,
            obstacleSpawnMultiplier: 1.15,
            collectibleSpawnMultiplier: 1.1,
            
            // Level-specific features
            hasSpecialMechanics: true,
            specialMechanics: ['floatingClouds', 'windStreams', 'birdFlocks']
        });
        
        // Level-specific objects
        this.clouds = [];
        this.windStreamers = [];
        this.floatingIslands = [];
        this.birds = [];
        this.cloudParticles = [];
        this.sunRays = null;
        this.rainbow = null;
        this.skyDome = null;
    }
    
    async createEnvironment(scene, resourceManager) {
        // Remove ground elements
        scene.children.forEach(child => {
            if (child.userData && (child.userData.type === 'streetLine' || 
                child.userData.type === 'sidewalk' || child.userData.type === 'ground')) {
                child.visible = false;
            }
        });
        
        // Create sky gradient background
        this.createSkyGradient();
        
        // Create floating clouds
        for (let i = 0; i < 40; i++) {
            this.createFloatingCloud(
                -40 + Math.random() * 80,
                3 + Math.random() * 25,
                -60 - Math.random() * 120
            );
        }
        
        // Create cloud particle systems
        for (let i = 0; i < 20; i++) {
            this.createCloudParticleSystem(
                -20 + Math.random() * 40,
                8 + Math.random() * 15,
                -30 - Math.random() * 100
            );
        }
        
        // Create wind streamers
        for (let i = 0; i < 15; i++) {
            this.createWindStreamer(
                -15 + Math.random() * 30,
                5 + Math.random() * 10,
                -20 - Math.random() * 80
            );
        }
        
        // Create floating islands
        for (let i = 0; i < 8; i++) {
            this.createFloatingIsland(
                -25 + Math.random() * 50,
                15 + Math.random() * 10,
                -30 - Math.random() * 60
            );
        }
        
        // Create flying birds
        for (let i = 0; i < 12; i++) {
            this.createFlyingBird();
        }
        
        // Create rainbow
        this.createRainbow();
        
        // Create sun rays
        this.createSunRays();
        
        // Update directional light for bright sky
        const directionalLight = scene.children.find(child => child.type === 'DirectionalLight');
        if (directionalLight) {
            directionalLight.color = new THREE.Color(0xFFFFAA);
            directionalLight.intensity = 1.2;
        }
        
        console.log('[Level 3] Sky High environment created');
    }
    
    createSkyGradient() {
        // Sky dome with gradient shader
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077be) },
                bottomColor: { value: new THREE.Color(0x87CEEB) },
                offset: { value: 0.3 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        this.skyDome.userData = { type: 'skyDome' };
        this.environmentGroup.add(this.skyDome);
    }
    
    createFloatingCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        
        // Create fluffy cloud from multiple spheres
        for (let i = 0; i < 5; i++) {
            const puffGeometry = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6);
            const puffMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.1
            });
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            puff.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 3
            );
            cloudGroup.add(puff);
        }
        
        cloudGroup.position.set(x, y, z);
        cloudGroup.userData = {
            type: 'cloud',
            floatSpeed: 0.5 + Math.random() * 0.5,
            floatRange: 2,
            baseY: y,
            driftSpeed: (Math.random() - 0.5) * 0.01
        };
        
        this.environmentGroup.add(cloudGroup);
        this.clouds.push(cloudGroup);
    }
    
    createCloudParticleSystem(x, y, z) {
        const particleCount = 30;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.4
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            particle.position.set(
                x + (Math.random() - 0.5) * 6,
                y + (Math.random() - 0.5) * 4,
                z + (Math.random() - 0.5) * 6
            );
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.02
                ),
                life: 1.0,
                decay: 0.001 + Math.random() * 0.002,
                float: Math.random() * Math.PI * 2
            };
            
            particles.add(particle);
        }
        
        particles.userData = { type: 'cloudParticles' };
        this.environmentGroup.add(particles);
        this.cloudParticles.push(particles);
    }
    
    createWindStreamer(x, y, z) {
        const streamerGeometry = new THREE.PlaneGeometry(8, 0.3);
        const streamerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xCCEEFF,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const streamer = new THREE.Mesh(streamerGeometry, streamerMaterial);
        
        streamer.position.set(x, y, z);
        streamer.userData = {
            type: 'windStreamer',
            waveSpeed: 2 + Math.random() * 3,
            waveAmplitude: 0.5 + Math.random() * 0.5,
            baseRotation: Math.random() * Math.PI * 2,
            flowSpeed: 10 + Math.random() * 5
        };
        
        this.environmentGroup.add(streamer);
        this.windStreamers.push(streamer);
    }
    
    createFloatingIsland(x, y, z) {
        const islandGroup = new THREE.Group();
        
        // Island base (floating rock)
        const islandGeometry = new THREE.CylinderGeometry(3, 4, 2, 12);
        const islandMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B7355,
            emissive: 0x332211,
            emissiveIntensity: 0.1
        });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        islandGroup.add(island);
        
        // Grass top
        const grassGeometry = new THREE.CylinderGeometry(3.2, 3.2, 0.3, 12);
        const grassMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x32CD32,
            emissive: 0x0A4A0A,
            emissiveIntensity: 0.2
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.position.y = 1.1;
        islandGroup.add(grass);
        
        // Small trees
        for (let i = 0; i < 3; i++) {
            const treeGeometry = new THREE.ConeGeometry(0.5, 2, 8);
            const treeMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x228B22,
                emissive: 0x112211,
                emissiveIntensity: 0.1
            });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            tree.position.set(
                (Math.random() - 0.5) * 4,
                1.3,
                (Math.random() - 0.5) * 4
            );
            islandGroup.add(tree);
        }
        
        // Floating particles below island
        for (let i = 0; i < 10; i++) {
            this.createParticle(
                new THREE.Vector3(
                    x + (Math.random() - 0.5) * 4,
                    y - 2 - Math.random() * 3,
                    z + (Math.random() - 0.5) * 4
                ),
                {
                    size: 0.05,
                    color: 0x8B7355,
                    lifetime: 2.0 + Math.random() * 2,
                    velocity: new THREE.Vector3(0, -0.01, 0),
                    gravity: 0,
                    fadeOut: true
                }
            );
        }
        
        islandGroup.position.set(x, y, z);
        islandGroup.userData = {
            type: 'floatingIsland',
            floatSpeed: 0.3 + Math.random() * 0.3,
            floatRange: 1,
            baseY: y,
            rotationSpeed: 0.0001 + Math.random() * 0.0002
        };
        
        this.environmentGroup.add(islandGroup);
        this.floatingIslands.push(islandGroup);
    }
    
    createFlyingBird() {
        const birdGroup = new THREE.Group();
        
        // Bird body
        const bodyGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1,
            emissive: 0x213451,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        birdGroup.add(body);
        
        // Wings
        const wingGeometry = new THREE.PlaneGeometry(0.8, 0.3);
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1,
            side: THREE.DoubleSide
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.4, 0, 0);
        leftWing.rotation.y = Math.PI / 6;
        leftWing.userData = { isLeft: true };
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.4, 0, 0);
        rightWing.rotation.y = -Math.PI / 6;
        rightWing.userData = { isLeft: false };
        birdGroup.add(rightWing);
        
        // Random flight path
        birdGroup.position.set(
            -30 + Math.random() * 60,
            8 + Math.random() * 15,
            -50 - Math.random() * 100
        );
        
        birdGroup.userData = {
            type: 'bird',
            flightSpeed: 8 + Math.random() * 4,
            flightPath: Math.random() * Math.PI * 2,
            wingFlap: 0,
            flapSpeed: 5 + Math.random() * 3,
            circleRadius: 20 + Math.random() * 10,
            circleCenter: new THREE.Vector3(
                birdGroup.position.x,
                birdGroup.position.y,
                birdGroup.position.z
            )
        };
        
        this.environmentGroup.add(birdGroup);
        this.birds.push(birdGroup);
    }
    
    createRainbow() {
        const colors = [0xFF0000, 0xFFA500, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
        const rainbowGroup = new THREE.Group();
        
        for (let i = 0; i < colors.length; i++) {
            const arcGeometry = new THREE.TorusGeometry(30 + i * 2, 1, 4, 32, Math.PI);
            const arcMaterial = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const arc = new THREE.Mesh(arcGeometry, arcMaterial);
            arc.rotation.x = Math.PI;
            rainbowGroup.add(arc);
        }
        
        rainbowGroup.position.set(0, 20, -80);
        rainbowGroup.userData = {
            type: 'rainbow',
            fadeSpeed: 0.5
        };
        
        this.rainbow = rainbowGroup;
        this.environmentGroup.add(rainbowGroup);
    }
    
    createSunRays() {
        const rayCount = 12;
        const rayGroup = new THREE.Group();
        
        for (let i = 0; i < rayCount; i++) {
            const rayGeometry = new THREE.PlaneGeometry(100, 2);
            const rayMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFAA,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            
            ray.rotation.z = (i / rayCount) * Math.PI * 2;
            rayGroup.add(ray);
        }
        
        rayGroup.position.set(0, 20, -50);
        rayGroup.userData = {
            type: 'sunRays',
            rotationSpeed: 0.2
        };
        
        this.sunRays = rayGroup;
        this.environmentGroup.add(rayGroup);
    }
    
    updateDynamicObjects(deltaTime, gameState) {
        super.updateDynamicObjects(deltaTime, gameState);
        
        const time = Date.now() * 0.001;
        
        // Animate floating clouds
        this.clouds.forEach(cloud => {
            cloud.position.y = cloud.userData.baseY + 
                Math.sin(time * cloud.userData.floatSpeed) * cloud.userData.floatRange;
            cloud.position.x += cloud.userData.driftSpeed * deltaTime;
            
            // Reset clouds that drift too far
            if (Math.abs(cloud.position.x) > 60) {
                cloud.position.x = -Math.sign(cloud.position.x) * 60;
            }
        });
        
        // Animate cloud particles
        this.cloudParticles.forEach(particleSystem => {
            particleSystem.children.forEach(particle => {
                if (particle.userData) {
                    // Update position
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(deltaTime));
                    
                    // Float effect
                    particle.position.y += Math.sin(time + particle.userData.float) * 0.001 * deltaTime;
                    
                    // Update life
                    particle.userData.life -= particle.userData.decay * deltaTime * 0.001;
                    particle.material.opacity = particle.userData.life * 0.4;
                    
                    // Reset if dead
                    if (particle.userData.life <= 0) {
                        particle.userData.life = 1.0;
                        particle.position.set(
                            particleSystem.position.x + (Math.random() - 0.5) * 6,
                            particleSystem.position.y + (Math.random() - 0.5) * 4,
                            particleSystem.position.z + (Math.random() - 0.5) * 6
                        );
                    }
                }
            });
        });
        
        // Animate wind streamers
        this.windStreamers.forEach(streamer => {
            const wave = Math.sin(time * streamer.userData.waveSpeed + streamer.userData.baseRotation);
            streamer.rotation.z = wave * streamer.userData.waveAmplitude;
            streamer.position.z += streamer.userData.flowSpeed * deltaTime * 0.001;
            
            // Reset position
            if (streamer.position.z > 20) {
                streamer.position.z = -100;
            }
        });
        
        // Animate floating islands
        this.floatingIslands.forEach(island => {
            island.position.y = island.userData.baseY + 
                Math.sin(time * island.userData.floatSpeed) * island.userData.floatRange;
            island.rotation.y += island.userData.rotationSpeed * deltaTime;
        });
        
        // Animate flying birds
        this.birds.forEach(bird => {
            // Update wing flap
            bird.userData.wingFlap += bird.userData.flapSpeed * deltaTime * 0.001;
            const flapAngle = Math.sin(bird.userData.wingFlap) * 0.5;
            
            bird.children.forEach(child => {
                if (child.userData && child.userData.isLeft !== undefined) {
                    child.rotation.z = child.userData.isLeft ? flapAngle : -flapAngle;
                }
            });
            
            // Circular flight path
            bird.userData.flightPath += bird.userData.flightSpeed * deltaTime * 0.0001;
            bird.position.x = bird.userData.circleCenter.x + 
                Math.cos(bird.userData.flightPath) * bird.userData.circleRadius;
            bird.position.z = bird.userData.circleCenter.z + 
                Math.sin(bird.userData.flightPath) * bird.userData.circleRadius;
            
            // Face flight direction
            bird.rotation.y = -bird.userData.flightPath + Math.PI / 2;
        });
        
        // Animate sun rays
        if (this.sunRays) {
            this.sunRays.rotation.z += this.sunRays.userData.rotationSpeed * deltaTime * 0.001;
        }
        
        // Animate rainbow fade
        if (this.rainbow) {
            this.rainbow.children.forEach((arc, i) => {
                arc.material.opacity = 0.4 + Math.sin(time * this.rainbow.userData.fadeSpeed + i * 0.5) * 0.2;
            });
        }
    }
    
    onDispose() {
        // Clear arrays
        this.clouds = [];
        this.windStreamers = [];
        this.floatingIslands = [];
        this.birds = [];
        this.cloudParticles = [];
        this.sunRays = null;
        this.rainbow = null;
        this.skyDome = null;
        
        console.log('[Level 3] Sky High disposed');
    }
}

// Export for use
window.Level3_Sky = Level3_Sky;