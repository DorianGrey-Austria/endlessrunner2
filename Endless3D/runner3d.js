class EndlessRunner3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.obstacles = [];
        this.gameState = 'start';
        this.score = 0;
        this.speed = 1;
        this.maxSpeed = 5;
        this.distance = 0;
        
        this.keys = {
            left: false,
            right: false,
            space: false,
            escape: false
        };
        
        this.lanes = [-2, 0, 2];
        this.currentLane = 1;
        this.targetLaneX = 0;
        
        this.obstacleSpawnRate = 0.02;
        this.lastObstacleSpawn = 0;
        this.spawnDistance = 50;
        this.obstaclePatterns = [
            'single',
            'double',
            'tunnel',
            'zigzag',
            'gap_left',
            'gap_right',
            'gap_center'
        ];
        this.currentPattern = null;
        this.patternStep = 0;
        this.patternTimer = 0;
        
        this.performance = {
            fps: 60,
            frameCount: 0,
            lastTime: 0,
            adaptiveQuality: 1.0,
            lowPerformanceMode: false
        };
        
        this.worldSystem = null;
        this.selectedWorld = 'cyberpunk';
        
        this.objectPool = {
            obstacles: [],
            particles: [],
            available: {
                obstacles: [],
                particles: []
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.setupLights();
        this.setupPlayer();
        this.setupEnvironment();
        this.setupWorldSystem();
        this.setupControls();
        this.setupUI();
        this.setupPerformanceMonitoring();
        
        this.render();
    }
    
    setupWorldSystem() {
        this.worldSystem = new WorldSystem(this);
        this.worldSystem.setWorld(this.selectedWorld);
    }
    
    setupThreeJS() {
        const canvas = document.getElementById('gameCanvas');
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000011, 10, 100);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 5);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: !this.performance.lowPerformanceMode,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000011);
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x00ff88, 0.5, 50);
        pointLight.position.set(0, 5, -10);
        this.scene.add(pointLight);
    }
    
    setupPlayer() {
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.3);
        const material = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, 0.5, 3);
        this.player.castShadow = true;
        this.scene.add(this.player);
        
        this.player.userData = {
            velocityY: 0,
            isJumping: false,
            jumpSpeed: 0.3,
            gravity: 0.02,
            groundLevel: 0.5,
            animationTime: 0
        };
    }
    
    setupEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(10, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = -50;
        ground.receiveShadow = true;
        ground.name = 'ground';
        this.scene.add(ground);
        
        this.setupLaneMarkers();
        this.setupSkybox();
    }
    
    setupLaneMarkers() {
        for (let i = 0; i < 50; i++) {
            for (let lane = 0; lane < 3; lane++) {
                const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
                const markerMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x666666,
                    transparent: true,
                    opacity: 0.5
                });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(
                    this.lanes[lane] + (lane === 1 ? 0 : lane === 0 ? 0.5 : -0.5),
                    0.05,
                    -i * 4
                );
                this.scene.add(marker);
            }
        }
    }
    
    setupSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyboxMaterial = new THREE.MeshBasicMaterial({
            color: 0x001122,
            side: THREE.BackSide
        });
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);
    }
    
    setupControls() {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'Space':
                    event.preventDefault();
                    this.keys.space = true;
                    break;
                case 'Escape':
                    this.keys.escape = true;
                    this.togglePause();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.space = false;
                    break;
                case 'Escape':
                    this.keys.escape = false;
                    break;
            }
        });
    }
    
    setupUI() {
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        const worldButtons = document.querySelectorAll('.worldButton');
        worldButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                worldButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedWorld = e.target.dataset.world;
                
                if (this.worldSystem) {
                    this.worldSystem.setWorld(this.selectedWorld);
                }
            });
        });
        
        document.querySelector(`[data-world="${this.selectedWorld}"]`).classList.add('selected');
    }
    
    setupPerformanceMonitoring() {
        this.performance.lastTime = performance.now();
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        this.score = 0;
        this.speed = 1;
        this.distance = 0;
        this.updateUI();
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('gameOver').style.display = 'none';
        this.score = 0;
        this.speed = 1;
        this.distance = 0;
        this.clearObstacles();
        this.player.position.set(0, 0.5, 3);
        this.player.userData.velocityY = 0;
        this.player.userData.isJumping = false;
        this.currentLane = 1;
        this.targetLaneX = 0;
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = `Dein Score: ${this.score}`;
        document.getElementById('gameOver').style.display = 'flex';
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    updatePlayerMovement() {
        if (this.gameState !== 'playing') return;
        
        if (this.keys.left && this.currentLane > 0) {
            this.currentLane--;
            this.targetLaneX = this.lanes[this.currentLane];
            this.keys.left = false;
        }
        
        if (this.keys.right && this.currentLane < 2) {
            this.currentLane++;
            this.targetLaneX = this.lanes[this.currentLane];
            this.keys.right = false;
        }
        
        this.player.position.x = THREE.MathUtils.lerp(
            this.player.position.x,
            this.targetLaneX,
            0.2
        );
        
        if (this.keys.space && !this.player.userData.isJumping) {
            this.player.userData.isJumping = true;
            this.player.userData.velocityY = this.player.userData.jumpSpeed;
        }
        
        if (this.player.userData.isJumping) {
            this.player.userData.velocityY -= this.player.userData.gravity;
            this.player.position.y += this.player.userData.velocityY;
            
            if (this.player.position.y <= this.player.userData.groundLevel) {
                this.player.position.y = this.player.userData.groundLevel;
                this.player.userData.isJumping = false;
                this.player.userData.velocityY = 0;
            }
        }
        
        this.player.userData.animationTime += 0.1;
        this.player.rotation.z = Math.sin(this.player.userData.animationTime) * 0.1;
    }
    
    spawnObstacle() {
        this.patternTimer++;
        
        if (this.patternTimer > 60 / this.speed) {
            this.patternTimer = 0;
            
            if (!this.currentPattern || this.patternStep >= this.getPatternLength(this.currentPattern)) {
                this.selectNewPattern();
                this.patternStep = 0;
            }
            
            this.spawnPatternStep();
            this.patternStep++;
        }
    }
    
    selectNewPattern() {
        const difficultyPatterns = this.obstaclePatterns.filter(pattern => {
            if (this.speed < 2) return ['single', 'gap_left', 'gap_right', 'gap_center'].includes(pattern);
            if (this.speed < 3) return !['tunnel', 'zigzag'].includes(pattern);
            return true;
        });
        
        this.currentPattern = difficultyPatterns[Math.floor(Math.random() * difficultyPatterns.length)];
    }
    
    getPatternLength(pattern) {
        const lengths = {
            'single': 1,
            'double': 2,
            'tunnel': 4,
            'zigzag': 6,
            'gap_left': 3,
            'gap_right': 3,
            'gap_center': 3
        };
        return lengths[pattern] || 1;
    }
    
    spawnPatternStep() {
        const spawnZ = -this.spawnDistance - (this.patternStep * 4);
        
        switch(this.currentPattern) {
            case 'single':
                this.spawnObstacleAt(Math.floor(Math.random() * 3), spawnZ);
                break;
                
            case 'double':
                if (this.patternStep === 0) {
                    this.spawnObstacleAt(0, spawnZ);
                    this.spawnObstacleAt(2, spawnZ);
                } else {
                    this.spawnObstacleAt(1, spawnZ);
                }
                break;
                
            case 'tunnel':
                if (this.patternStep < 3) {
                    this.spawnObstacleAt(0, spawnZ, 'tall');
                    this.spawnObstacleAt(2, spawnZ, 'tall');
                }
                break;
                
            case 'zigzag':
                const zigzagLane = this.patternStep % 2 === 0 ? 0 : 2;
                this.spawnObstacleAt(zigzagLane, spawnZ);
                break;
                
            case 'gap_left':
                if (this.patternStep > 0) {
                    this.spawnObstacleAt(1, spawnZ);
                    this.spawnObstacleAt(2, spawnZ);
                }
                break;
                
            case 'gap_right':
                if (this.patternStep > 0) {
                    this.spawnObstacleAt(0, spawnZ);
                    this.spawnObstacleAt(1, spawnZ);
                }
                break;
                
            case 'gap_center':
                if (this.patternStep > 0) {
                    this.spawnObstacleAt(0, spawnZ);
                    this.spawnObstacleAt(2, spawnZ);
                }
                break;
        }
    }
    
    spawnObstacleAt(laneIndex, z, type = 'normal') {
        const obstacle = this.getObstacleFromPool(type);
        if (obstacle) {
            obstacle.position.set(
                this.lanes[laneIndex],
                type === 'tall' ? 1.0 : 0.5,
                z
            );
            obstacle.userData.active = true;
            obstacle.userData.type = type;
            this.obstacles.push(obstacle);
            this.scene.add(obstacle);
        }
    }
    
    getObstacleFromPool(type = 'normal') {
        const poolKey = `obstacles_${type}`;
        
        if (!this.objectPool.available[poolKey]) {
            this.objectPool.available[poolKey] = [];
        }
        
        if (this.objectPool.available[poolKey].length > 0) {
            return this.objectPool.available[poolKey].pop();
        }
        
        let geometry, material;
        
        switch(type) {
            case 'tall':
                geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
                break;
            case 'wide':
                geometry = new THREE.BoxGeometry(1.5, 1, 0.8);
                break;
            default:
                geometry = new THREE.BoxGeometry(0.8, 1, 0.8);
        }
        
        material = this.worldSystem ? 
            this.worldSystem.createObstacleMaterial(type) : 
            new THREE.MeshLambertMaterial({ color: 0xff4444 });
        
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.castShadow = true;
        obstacle.userData = { active: false, type: type };
        return obstacle;
    }
    
    returnObstacleToPool(obstacle) {
        obstacle.userData.active = false;
        this.scene.remove(obstacle);
        
        const type = obstacle.userData.type || 'normal';
        const poolKey = `obstacles_${type}`;
        
        if (!this.objectPool.available[poolKey]) {
            this.objectPool.available[poolKey] = [];
        }
        
        this.objectPool.available[poolKey].push(obstacle);
    }
    
    updateObstacles() {
        if (this.gameState !== 'playing') return;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.position.z += this.speed * 0.5;
            
            if (obstacle.position.z > 5) {
                this.obstacles.splice(i, 1);
                this.returnObstacleToPool(obstacle);
                continue;
            }
            
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
    }
    
    checkCollision(player, obstacle) {
        const dx = Math.abs(player.position.x - obstacle.position.x);
        const dy = Math.abs(player.position.y - obstacle.position.y);
        const dz = Math.abs(player.position.z - obstacle.position.z);
        
        const playerBounds = { width: 0.5, height: 1, depth: 0.3 };
        const obstacleBounds = this.getObstacleBounds(obstacle);
        
        const collisionX = dx < (playerBounds.width + obstacleBounds.width) / 2;
        const collisionY = dy < (playerBounds.height + obstacleBounds.height) / 2;
        const collisionZ = dz < (playerBounds.depth + obstacleBounds.depth) / 2;
        
        return collisionX && collisionY && collisionZ;
    }
    
    getObstacleBounds(obstacle) {
        const type = obstacle.userData.type || 'normal';
        
        switch(type) {
            case 'tall':
                return { width: 0.8, height: 2, depth: 0.8 };
            case 'wide':
                return { width: 1.5, height: 1, depth: 0.8 };
            default:
                return { width: 0.8, height: 1, depth: 0.8 };
        }
    }
    
    clearObstacles() {
        this.obstacles.forEach(obstacle => {
            this.returnObstacleToPool(obstacle);
        });
        this.obstacles = [];
    }
    
    updateGame() {
        if (this.gameState !== 'playing') return;
        
        this.distance += this.speed;
        this.score = Math.floor(this.distance / 10);
        this.speed = Math.min(this.maxSpeed, 1 + this.distance / 1000);
        
        this.spawnObstacle();
        this.updateObstacles();
        this.updatePlayerMovement();
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('speed').textContent = `Speed: ${this.speed.toFixed(1)}x`;
    }
    
    updatePerformance() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.performance.lastTime;
        
        this.performance.frameCount++;
        
        if (this.performance.frameCount % 60 === 0) {
            this.performance.fps = Math.round(1000 / deltaTime);
            
            if (this.performance.fps < 30 && !this.performance.lowPerformanceMode) {
                this.performance.lowPerformanceMode = true;
                this.performance.adaptiveQuality = 0.5;
                this.renderer.setPixelRatio(1);
                console.log('Switched to low performance mode');
            }
        }
        
        this.performance.lastTime = currentTime;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render() {
        requestAnimationFrame(() => this.render());
        
        this.updateGame();
        this.updatePerformance();
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new EndlessRunner3D();
});