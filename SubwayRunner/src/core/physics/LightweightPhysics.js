/**
 * ⚡ LIGHTWEIGHT PHYSICS ENGINE
 * Optimized physics system for mobile performance
 * 
 * @version 6.0.0-ENTERPRISE
 * @author Claude Code Senior Developer
 */

class LightweightPhysics {
    constructor(options = {}) {
        this.options = {
            gravity: -9.81,
            enableBroadPhase: true,
            enableSpatialHashing: true,
            maxBodies: 1000,
            maxConstraints: 100,
            timeStep: 1/60,
            maxSubSteps: 3,
            ...options
        };
        
        // Physics world
        this.bodies = [];
        this.constraints = [];
        this.gravity = { x: 0, y: this.options.gravity, z: 0 };
        
        // Spatial hashing for broad phase collision detection
        this.spatialHash = {
            cellSize: 10,
            grid: new Map(),
            
            getHash: function(x, z) {
                const cellX = Math.floor(x / this.cellSize);
                const cellZ = Math.floor(z / this.cellSize);
                return `${cellX},${cellZ}`;
            },
            
            insert: function(body) {
                const hash = this.getHash(body.position.x, body.position.z);
                if (!this.grid.has(hash)) {
                    this.grid.set(hash, []);
                }
                this.grid.get(hash).push(body);
            },
            
            query: function(body) {
                const hash = this.getHash(body.position.x, body.position.z);
                return this.grid.get(hash) || [];
            },
            
            clear: function() {
                this.grid.clear();
            }
        };
        
        // Collision detection
        this.collisionPairs = [];
        this.collisionCallbacks = new Map();
        
        // Performance tracking
        this.stats = {
            bodiesProcessed: 0,
            collisionsDetected: 0,
            physicsTime: 0,
            lastUpdate: 0
        };
        
        console.log('⚡ [LightweightPhysics] Initialized');
    }
    
    /**
     * 🏗️ INITIALIZE PHYSICS
     * Setup physics world
     */
    async initialize() {
        console.log('⚡ [LightweightPhysics] Physics world initialized');
    }
    
    /**
     * 🔄 UPDATE PHYSICS
     * Main physics update loop
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // Clear spatial hash
        if (this.options.enableSpatialHashing) {
            this.spatialHash.clear();
        }
        
        // Update all bodies
        this.updateBodies(deltaTime);
        
        // Populate spatial hash
        if (this.options.enableSpatialHashing) {
            this.populateSpatialHash();
        }
        
        // Detect collisions
        this.detectCollisions();
        
        // Resolve collisions
        this.resolveCollisions();
        
        // Update statistics
        const endTime = performance.now();
        this.stats.physicsTime = endTime - startTime;
        this.stats.lastUpdate = endTime;
        this.stats.bodiesProcessed = this.bodies.length;
    }
    
    /**
     * 🏃 UPDATE BODIES
     * Update all physics bodies
     */
    updateBodies(deltaTime) {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            
            if (!body.isStatic && body.isActive) {
                // Apply gravity
                if (body.useGravity) {
                    body.velocity.y += this.gravity.y * deltaTime;
                }
                
                // Apply velocity
                body.position.x += body.velocity.x * deltaTime;
                body.position.y += body.velocity.y * deltaTime;
                body.position.z += body.velocity.z * deltaTime;
                
                // Apply damping
                body.velocity.x *= body.damping;
                body.velocity.y *= body.damping;
                body.velocity.z *= body.damping;
                
                // Ground collision
                if (body.position.y <= body.radius && body.velocity.y < 0) {
                    body.position.y = body.radius;
                    body.velocity.y = 0;
                    
                    if (body.onGroundContact) {
                        body.onGroundContact();
                    }
                }
                
                // Update bounding box
                this.updateBoundingBox(body);
            }
        }
    }
    
    /**
     * 📦 UPDATE BOUNDING BOX
     * Update axis-aligned bounding box for body
     */
    updateBoundingBox(body) {
        const r = body.radius;
        body.aabb = {
            min: {
                x: body.position.x - r,
                y: body.position.y - r,
                z: body.position.z - r
            },
            max: {
                x: body.position.x + r,
                y: body.position.y + r,
                z: body.position.z + r
            }
        };
    }
    
    /**
     * 🗺️ POPULATE SPATIAL HASH
     * Add all bodies to spatial hash grid
     */
    populateSpatialHash() {
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            if (body.isActive) {
                this.spatialHash.insert(body);
            }
        }
    }
    
    /**
     * 💥 DETECT COLLISIONS
     * Broad and narrow phase collision detection
     */
    detectCollisions() {
        this.collisionPairs = [];
        this.stats.collisionsDetected = 0;
        
        if (this.options.enableSpatialHashing) {
            this.detectCollisionsSpatialHash();
        } else {
            this.detectCollisionsBruteForce();
        }
    }
    
    /**
     * 🗺️ DETECT COLLISIONS SPATIAL HASH
     * Optimized collision detection using spatial hashing
     */
    detectCollisionsSpatialHash() {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            if (!bodyA.isActive || bodyA.isStatic) continue;
            
            const candidates = this.spatialHash.query(bodyA);
            
            for (let j = 0; j < candidates.length; j++) {
                const bodyB = candidates[j];
                
                if (bodyA === bodyB || !bodyB.isActive) continue;
                if (bodyA.collisionGroup !== undefined && bodyB.collisionGroup !== undefined) {
                    if (bodyA.collisionGroup === bodyB.collisionGroup) continue;
                }
                
                // AABB test first
                if (this.aabbTest(bodyA, bodyB)) {
                    // Sphere collision test
                    if (this.sphereTest(bodyA, bodyB)) {
                        this.collisionPairs.push({ bodyA, bodyB });
                        this.stats.collisionsDetected++;
                    }
                }
            }
        }
    }
    
    /**
     * 🔍 DETECT COLLISIONS BRUTE FORCE
     * Simple O(n²) collision detection for small numbers of bodies
     */
    detectCollisionsBruteForce() {
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            if (!bodyA.isActive) continue;
            
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];
                if (!bodyB.isActive) continue;
                
                if (bodyA.collisionGroup !== undefined && bodyB.collisionGroup !== undefined) {
                    if (bodyA.collisionGroup === bodyB.collisionGroup) continue;
                }
                
                // AABB test first
                if (this.aabbTest(bodyA, bodyB)) {
                    // Sphere collision test
                    if (this.sphereTest(bodyA, bodyB)) {
                        this.collisionPairs.push({ bodyA, bodyB });
                        this.stats.collisionsDetected++;
                    }
                }
            }
        }
    }
    
    /**
     * 📦 AABB TEST
     * Axis-aligned bounding box collision test
     */
    aabbTest(bodyA, bodyB) {
        return (
            bodyA.aabb.min.x <= bodyB.aabb.max.x &&
            bodyA.aabb.max.x >= bodyB.aabb.min.x &&
            bodyA.aabb.min.y <= bodyB.aabb.max.y &&
            bodyA.aabb.max.y >= bodyB.aabb.min.y &&
            bodyA.aabb.min.z <= bodyB.aabb.max.z &&
            bodyA.aabb.max.z >= bodyB.aabb.min.z
        );
    }
    
    /**
     * 🌐 SPHERE TEST
     * Sphere-sphere collision test
     */
    sphereTest(bodyA, bodyB) {
        const dx = bodyA.position.x - bodyB.position.x;
        const dy = bodyA.position.y - bodyB.position.y;
        const dz = bodyA.position.z - bodyB.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDistance = bodyA.radius + bodyB.radius;
        
        return distance <= minDistance;
    }
    
    /**
     * 🔧 RESOLVE COLLISIONS
     * Resolve all detected collisions
     */
    resolveCollisions() {
        for (let i = 0; i < this.collisionPairs.length; i++) {
            const { bodyA, bodyB } = this.collisionPairs[i];
            
            // Calculate collision response
            this.resolveCollision(bodyA, bodyB);
            
            // Trigger collision callbacks
            this.triggerCollisionCallbacks(bodyA, bodyB);
        }
    }
    
    /**
     * 💥 RESOLVE COLLISION
     * Resolve individual collision between two bodies
     */
    resolveCollision(bodyA, bodyB) {
        // Calculate separation vector
        const dx = bodyA.position.x - bodyB.position.x;
        const dy = bodyA.position.y - bodyB.position.y;
        const dz = bodyA.position.z - bodyB.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance === 0) return; // Avoid division by zero
        
        const overlap = (bodyA.radius + bodyB.radius) - distance;
        
        if (overlap > 0) {
            // Normalize separation vector
            const nx = dx / distance;
            const ny = dy / distance;
            const nz = dz / distance;
            
            // Separate bodies
            const separation = overlap * 0.5;
            
            if (!bodyA.isStatic) {
                bodyA.position.x += nx * separation;
                bodyA.position.y += ny * separation;
                bodyA.position.z += nz * separation;
            }
            
            if (!bodyB.isStatic) {
                bodyB.position.x -= nx * separation;
                bodyB.position.y -= ny * separation;
                bodyB.position.z -= nz * separation;
            }
            
            // Calculate relative velocity
            const rvx = bodyA.velocity.x - bodyB.velocity.x;
            const rvy = bodyA.velocity.y - bodyB.velocity.y;
            const rvz = bodyA.velocity.z - bodyB.velocity.z;
            
            // Calculate relative velocity along normal
            const velAlongNormal = rvx * nx + rvy * ny + rvz * nz;
            
            // Don't resolve if velocities are separating
            if (velAlongNormal > 0) return;
            
            // Calculate restitution
            const restitution = Math.min(bodyA.restitution || 0.5, bodyB.restitution || 0.5);
            
            // Calculate impulse scalar
            let impulse = -(1 + restitution) * velAlongNormal;
            impulse /= (1 / bodyA.mass) + (1 / bodyB.mass);
            
            // Apply impulse
            const impulsex = impulse * nx;
            const impulsey = impulse * ny;
            const impulsez = impulse * nz;
            
            if (!bodyA.isStatic) {
                bodyA.velocity.x += impulsex / bodyA.mass;
                bodyA.velocity.y += impulsey / bodyA.mass;
                bodyA.velocity.z += impulsez / bodyA.mass;
            }
            
            if (!bodyB.isStatic) {
                bodyB.velocity.x -= impulsex / bodyB.mass;
                bodyB.velocity.y -= impulsey / bodyB.mass;
                bodyB.velocity.z -= impulsez / bodyB.mass;
            }
        }
    }
    
    /**
     * 📞 TRIGGER COLLISION CALLBACKS
     * Execute collision event callbacks
     */
    triggerCollisionCallbacks(bodyA, bodyB) {
        if (bodyA.onCollision) {
            bodyA.onCollision(bodyB);
        }
        
        if (bodyB.onCollision) {
            bodyB.onCollision(bodyA);
        }
        
        // Global collision callbacks
        const keyA = bodyA.id || bodyA.uuid;
        const keyB = bodyB.id || bodyB.uuid;
        
        if (this.collisionCallbacks.has(keyA)) {
            this.collisionCallbacks.get(keyA)(bodyB);
        }
        
        if (this.collisionCallbacks.has(keyB)) {
            this.collisionCallbacks.get(keyB)(bodyA);
        }
    }
    
    /**
     * ➕ ADD BODY
     * Add physics body to world
     */
    addBody(body) {
        // Set default properties
        body.id = body.id || this.generateId();
        body.position = body.position || { x: 0, y: 0, z: 0 };
        body.velocity = body.velocity || { x: 0, y: 0, z: 0 };
        body.radius = body.radius || 1;
        body.mass = body.mass || 1;
        body.damping = body.damping || 0.99;
        body.restitution = body.restitution || 0.5;
        body.isStatic = body.isStatic || false;
        body.isActive = body.isActive !== undefined ? body.isActive : true;
        body.useGravity = body.useGravity !== undefined ? body.useGravity : true;
        
        // Initialize bounding box
        this.updateBoundingBox(body);
        
        // Add to world
        this.bodies.push(body);
        
        return body;
    }
    
    /**
     * ➖ REMOVE BODY
     * Remove physics body from world
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }
    
    /**
     * 🔍 FIND BODY
     * Find body by ID
     */
    findBody(id) {
        return this.bodies.find(body => body.id === id);
    }
    
    /**
     * 📞 SET COLLISION CALLBACK
     * Set collision callback for specific body
     */
    setCollisionCallback(bodyId, callback) {
        this.collisionCallbacks.set(bodyId, callback);
    }
    
    /**
     * 🎯 RAYCAST
     * Perform raycast collision detection
     */
    raycast(origin, direction, maxDistance = 100) {
        const hits = [];
        
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            if (!body.isActive) continue;
            
            // Simple sphere raycast
            const toSphere = {
                x: body.position.x - origin.x,
                y: body.position.y - origin.y,
                z: body.position.z - origin.z
            };
            
            const proj = toSphere.x * direction.x + toSphere.y * direction.y + toSphere.z * direction.z;
            
            if (proj < 0 || proj > maxDistance) continue;
            
            const closest = {
                x: origin.x + direction.x * proj,
                y: origin.y + direction.y * proj,
                z: origin.z + direction.z * proj
            };
            
            const distance = Math.sqrt(
                Math.pow(closest.x - body.position.x, 2) +
                Math.pow(closest.y - body.position.y, 2) +
                Math.pow(closest.z - body.position.z, 2)
            );
            
            if (distance <= body.radius) {
                hits.push({
                    body: body,
                    distance: proj,
                    point: closest
                });
            }
        }
        
        // Sort by distance
        hits.sort((a, b) => a.distance - b.distance);
        
        return hits;
    }
    
    /**
     * 🆔 GENERATE ID
     * Generate unique ID for physics body
     */
    generateId() {
        return 'body_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 🎛️ SET QUALITY
     * Adjust physics quality for performance
     */
    setQuality(quality) {
        switch (quality.toLowerCase()) {
            case 'low':
                this.options.enableBroadPhase = false;
                this.options.enableSpatialHashing = false;
                this.options.maxSubSteps = 1;
                break;
            case 'medium':
                this.options.enableBroadPhase = true;
                this.options.enableSpatialHashing = false;
                this.options.maxSubSteps = 2;
                break;
            case 'high':
                this.options.enableBroadPhase = true;
                this.options.enableSpatialHashing = true;
                this.options.maxSubSteps = 3;
                break;
        }
        
        console.log(`⚡ [LightweightPhysics] Quality set to ${quality}`);
    }
    
    /**
     * 📊 GET STATS
     * Get physics performance statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 🎮 LIFECYCLE METHODS
     */
    start() {
        console.log('⚡ [LightweightPhysics] Started');
    }
    
    stop() {
        console.log('⚡ [LightweightPhysics] Stopped');
    }
    
    /**
     * 🗑️ DISPOSE
     * Clean up physics world
     */
    dispose() {
        this.bodies = [];
        this.constraints = [];
        this.collisionPairs = [];
        this.collisionCallbacks.clear();
        this.spatialHash.clear();
        
        console.log('🗑️ [LightweightPhysics] Disposed');
    }
}

// Export for ES6 modules
export { LightweightPhysics };

// Legacy global export
window.LightweightPhysics = LightweightPhysics;

console.log('⚡ LightweightPhysics module loaded successfully');