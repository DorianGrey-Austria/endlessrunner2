/**
 * ObjectPool - Manages object pooling for performance optimization
 */
class ObjectPool {
    constructor() {
        this.pools = new Map();
        this.activeObjects = new Map();
        this.statistics = {
            totalCreated: 0,
            totalReused: 0,
            totalReturned: 0,
            activeCount: 0
        };
    }

    /**
     * Initialize object pool
     */
    init() {
        // Create pools for different object types
        this.createPool('obstacle', 20, () => this.createObstacle());
        this.createPool('collectible', 30, () => this.createCollectible());
        this.createPool('particle', 50, () => this.createParticle());
        this.createPool('effect', 25, () => this.createEffect());
        
        console.log('🔄 ObjectPool initialized with pools:', Array.from(this.pools.keys()));
    }

    /**
     * Create a new pool for a specific object type
     */
    createPool(type, size, createFunction) {
        const pool = {
            available: [],
            createFunction: createFunction,
            maxSize: size,
            created: 0,
            reused: 0
        };
        
        // Pre-populate pool
        for (let i = 0; i < size; i++) {
            const obj = createFunction();
            obj.poolType = type;
            obj.poolId = `${type}_${i}`;
            obj.inUse = false;
            pool.available.push(obj);
            pool.created++;
        }
        
        this.pools.set(type, pool);
        this.statistics.totalCreated += size;
        
        console.log(`📦 Created pool '${type}' with ${size} objects`);
    }

    /**
     * Get object from pool
     */
    get(type, resetFunction = null) {
        const pool = this.pools.get(type);
        if (!pool) {
            console.warn(`⚠️ Pool '${type}' not found`);
            return null;
        }
        
        let obj;
        
        // Get from available pool or create new
        if (pool.available.length > 0) {
            obj = pool.available.pop();
            pool.reused++;
            this.statistics.totalReused++;
        } else {
            obj = pool.createFunction();
            obj.poolType = type;
            obj.poolId = `${type}_${pool.created}`;
            pool.created++;
            this.statistics.totalCreated++;
        }
        
        obj.inUse = true;
        obj.poolReturnTime = null;
        
        // Reset object state if function provided
        if (resetFunction) {
            resetFunction(obj);
        }
        
        // Track active objects
        this.activeObjects.set(obj.poolId, obj);
        this.statistics.activeCount++;
        
        return obj;
    }

    /**
     * Return object to pool
     */
    return(obj) {
        if (!obj || !obj.poolType || !obj.inUse) {
            return false;
        }
        
        const pool = this.pools.get(obj.poolType);
        if (!pool) {
            return false;
        }
        
        // Reset object state
        this.resetObject(obj);
        
        obj.inUse = false;
        obj.poolReturnTime = performance.now();
        
        // Return to pool
        pool.available.push(obj);
        this.activeObjects.delete(obj.poolId);
        this.statistics.totalReturned++;
        this.statistics.activeCount--;
        
        return true;
    }

    /**
     * Reset object to default state
     */
    resetObject(obj) {
        // Reset Three.js object properties
        if (obj.position) {
            obj.position.set(0, 0, 0);
        }
        if (obj.rotation) {
            obj.rotation.set(0, 0, 0);
        }
        if (obj.scale) {
            obj.scale.set(1, 1, 1);
        }
        if (obj.visible !== undefined) {
            obj.visible = true;
        }
        
        // Reset custom properties
        if (obj.userData) {
            obj.userData = {};
        }
        if (obj.velocity) {
            obj.velocity.set(0, 0, 0);
        }
        
        // Stop any animations
        if (obj.mixer) {
            obj.mixer.stopAllActions();
        }
        
        // Reset material properties
        if (obj.material) {
            if (obj.material.opacity !== undefined) {
                obj.material.opacity = 1;
            }
            if (obj.material.transparent !== undefined) {
                obj.material.transparent = false;
            }
        }
    }

    /**
     * Create obstacle object
     */
    createObstacle() {
        const geometries = [
            new THREE.BoxGeometry(0.8, 1.2, 0.3),
            new THREE.BoxGeometry(0.8, 0.8, 0.8),
            new THREE.ConeGeometry(0.4, 1.2, 8)
        ];
        
        const materials = [
            new THREE.MeshLambertMaterial({ color: 0xFF4444 }),
            new THREE.MeshLambertMaterial({ color: 0x4444FF }),
            new THREE.MeshLambertMaterial({ color: 0xFF8844 })
        ];
        
        const geomIndex = Math.floor(Math.random() * geometries.length);
        const obstacle = new THREE.Mesh(geometries[geomIndex], materials[geomIndex]);
        
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        obstacle.userData.type = 'obstacle';
        
        return obstacle;
    }

    /**
     * Create collectible object
     */
    createCollectible() {
        const group = new THREE.Group();
        
        // Create different collectible types
        const collectibleTypes = ['kiwi', 'broccoli', 'star'];
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        
        let mesh;
        
        switch (type) {
            case 'kiwi':
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 16, 12),
                    new THREE.MeshLambertMaterial({ color: 0x8B4513 })
                );
                break;
            case 'broccoli':
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 12, 8),
                    new THREE.MeshLambertMaterial({ color: 0x228B22 })
                );
                break;
            case 'star':
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2, 8, 6),
                    new THREE.MeshBasicMaterial({ color: 0xFFD700 })
                );
                break;
        }
        
        mesh.castShadow = true;
        group.add(mesh);
        
        group.userData.type = 'collectible';
        group.userData.collectibleType = type;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
        
        return group;
    }

    /**
     * Create particle object
     */
    createParticle() {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 6),
            new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            })
        );
        
        particle.userData.type = 'particle';
        particle.userData.life = 1.0;
        particle.userData.maxLife = 1.0;
        particle.velocity = new THREE.Vector3();
        
        return particle;
    }

    /**
     * Create effect object
     */
    createEffect() {
        const effect = new THREE.Group();
        
        // Create a simple effect with multiple particles
        for (let i = 0; i < 5; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 6, 4),
                new THREE.MeshBasicMaterial({ 
                    color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                    transparent: true,
                    opacity: 0.7
                })
            );
            
            particle.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            effect.add(particle);
        }
        
        effect.userData.type = 'effect';
        effect.userData.life = 1.0;
        effect.userData.maxLife = 1.0;
        
        return effect;
    }

    /**
     * Update all active objects
     */
    update(deltaTime) {
        const currentTime = performance.now();
        
        // Update particles
        this.activeObjects.forEach((obj, id) => {
            if (obj.poolType === 'particle') {
                this.updateParticle(obj, deltaTime);
            } else if (obj.poolType === 'effect') {
                this.updateEffect(obj, deltaTime);
            } else if (obj.poolType === 'collectible') {
                this.updateCollectible(obj, deltaTime, currentTime);
            }
        });
    }

    /**
     * Update particle
     */
    updateParticle(particle, deltaTime) {
        if (!particle.userData || !particle.velocity) return;
        
        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
        
        // Update life
        particle.userData.life -= deltaTime;
        
        // Update opacity based on life
        if (particle.material) {
            particle.material.opacity = particle.userData.life / particle.userData.maxLife;
        }
        
        // Return to pool if dead
        if (particle.userData.life <= 0) {
            this.return(particle);
        }
    }

    /**
     * Update effect
     */
    updateEffect(effect, deltaTime) {
        if (!effect.userData) return;
        
        // Update life
        effect.userData.life -= deltaTime;
        
        // Update scale and opacity
        const lifeRatio = effect.userData.life / effect.userData.maxLife;
        effect.scale.setScalar(2 - lifeRatio);
        
        effect.children.forEach(child => {
            if (child.material) {
                child.material.opacity = lifeRatio * 0.7;
            }
        });
        
        // Return to pool if dead
        if (effect.userData.life <= 0) {
            this.return(effect);
        }
    }

    /**
     * Update collectible
     */
    updateCollectible(collectible, deltaTime, currentTime) {
        if (!collectible.userData || collectible.userData.floatOffset === undefined) return;
        
        // Floating animation
        const time = currentTime * 0.001;
        const floatHeight = Math.sin(time * 2 + collectible.userData.floatOffset) * 0.3;
        collectible.position.y = 0.5 + floatHeight;
        collectible.rotation.y = time + collectible.userData.floatOffset;
    }

    /**
     * Clear all pools
     */
    clearPools() {
        this.pools.forEach((pool, type) => {
            pool.available.forEach(obj => {
                this.disposeObject(obj);
            });
            pool.available = [];
        });
        
        this.activeObjects.forEach(obj => {
            this.disposeObject(obj);
        });
        
        this.activeObjects.clear();
        this.pools.clear();
        
        console.log('🗑️ All pools cleared');
    }

    /**
     * Dispose Three.js object
     */
    disposeObject(obj) {
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(material => material.dispose());
            } else {
                obj.material.dispose();
            }
        }
        if (obj.children) {
            obj.children.forEach(child => this.disposeObject(child));
        }
    }

    /**
     * Get pool statistics
     */
    getStatistics() {
        const poolStats = {};
        
        this.pools.forEach((pool, type) => {
            poolStats[type] = {
                available: pool.available.length,
                created: pool.created,
                reused: pool.reused,
                maxSize: pool.maxSize
            };
        });
        
        return {
            ...this.statistics,
            pools: poolStats
        };
    }

    /**
     * Optimize pools (remove excess objects)
     */
    optimize() {
        let totalFreed = 0;
        
        this.pools.forEach((pool, type) => {
            const excess = pool.available.length - Math.floor(pool.maxSize * 0.5);
            if (excess > 0) {
                for (let i = 0; i < excess; i++) {
                    const obj = pool.available.pop();
                    this.disposeObject(obj);
                    totalFreed++;
                }
            }
        });
        
        if (totalFreed > 0) {
            console.log(`🧹 Optimized pools, freed ${totalFreed} objects`);
        }
    }

    /**
     * Dispose object pool
     */
    dispose() {
        this.clearPools();
        this.statistics = null;
        
        console.log('🗑️ ObjectPool disposed');
    }
}

// Make class available globally
window.ObjectPool = ObjectPool;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectPool;
}