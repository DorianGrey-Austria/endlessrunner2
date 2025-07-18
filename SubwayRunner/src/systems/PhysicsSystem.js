/**
 * PhysicsSystem - Handles player physics, collision detection, and movement
 */
class PhysicsSystem {
    constructor() {
        this.gravity = -0.025;
        this.jumpForce = 0.45;
        this.groundY = 0;
        this.lanePositions = [-2, 0, 2];
        this.laneTransitionSpeed = 0.3;
        
        // Collision detection
        this.collisionTolerance = 0.8;
        this.collisionCooldown = 0;
        this.invulnerabilityTime = 1000; // ms
        
        // Movement tracking
        this.velocity = new THREE.Vector3();
        this.isGrounded = true;
        this.isJumping = false;
        this.isDucking = false;
        this.currentLane = 1; // 0=left, 1=center, 2=right
        this.targetLane = 1;
        
        // Performance optimization
        this.lastUpdateTime = 0;
        this.updateInterval = 16.67; // 60 FPS
    }

    /**
     * Update physics for the given object (typically player)
     */
    update(object, deltaTime) {
        const currentTime = performance.now();
        
        // Throttle updates for performance
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        this.lastUpdateTime = currentTime;

        // Update vertical physics (gravity and jumping)
        this.updateVerticalPhysics(object, deltaTime);
        
        // Update horizontal physics (lane changing)
        this.updateHorizontalPhysics(object, deltaTime);
        
        // Update collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime * 1000;
        }
        
        // Validate position (ensure player stays on ground)
        this.validatePosition(object);
    }

    /**
     * Update vertical physics (jumping and gravity)
     */
    updateVerticalPhysics(object, deltaTime) {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y += this.gravity;
            object.position.y += this.velocity.y;
            
            // Check if landed
            if (object.position.y <= this.groundY) {
                object.position.y = this.groundY;
                this.velocity.y = 0;
                this.isGrounded = true;
                this.isJumping = false;
                
                // Landing effect callback
                if (this.onLanding) {
                    this.onLanding();
                }
            }
        }
        
        // Handle ducking
        if (this.isDucking && this.isGrounded) {
            object.scale.y = 0.5;
            object.position.y = this.groundY - 0.25;
        } else if (!this.isDucking && this.isGrounded) {
            object.scale.y = 1;
            object.position.y = this.groundY;
        }
    }

    /**
     * Update horizontal physics (lane changing)
     */
    updateHorizontalPhysics(object, deltaTime) {
        // Smooth lane transition
        if (this.currentLane !== this.targetLane) {
            const targetX = this.lanePositions[this.targetLane];
            const currentX = object.position.x;
            const difference = targetX - currentX;
            
            if (Math.abs(difference) > 0.1) {
                object.position.x += difference * this.laneTransitionSpeed;
            } else {
                object.position.x = targetX;
                this.currentLane = this.targetLane;
                
                // Lane change complete callback
                if (this.onLaneChangeComplete) {
                    this.onLaneChangeComplete();
                }
            }
        }
    }

    /**
     * Validate and correct player position
     */
    validatePosition(object) {
        // Ensure player stays on ground when not jumping
        if (this.isGrounded && object.position.y > this.groundY + 0.1) {
            object.position.y = this.groundY;
        }
        
        // Ensure player stays within lane bounds
        const minX = this.lanePositions[0] - 0.5;
        const maxX = this.lanePositions[2] + 0.5;
        object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
    }

    /**
     * Make player jump
     */
    jump() {
        if (this.isGrounded && !this.isDucking) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            
            // Jump effect callback
            if (this.onJump) {
                this.onJump();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Make player duck
     */
    duck() {
        if (this.isGrounded) {
            this.isDucking = true;
            
            // Duck effect callback
            if (this.onDuck) {
                this.onDuck();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Stop ducking
     */
    stopDucking() {
        this.isDucking = false;
        
        // Stop duck effect callback
        if (this.onStopDuck) {
            this.onStopDuck();
        }
    }

    /**
     * Move player to specific lane
     */
    moveToLane(laneIndex) {
        if (laneIndex >= 0 && laneIndex < this.lanePositions.length) {
            this.targetLane = laneIndex;
            
            // Lane change start callback
            if (this.onLaneChangeStart) {
                this.onLaneChangeStart(laneIndex);
            }
            
            return true;
        }
        return false;
    }

    /**
     * Move player left
     */
    moveLeft() {
        if (this.targetLane > 0) {
            return this.moveToLane(this.targetLane - 1);
        }
        return false;
    }

    /**
     * Move player right
     */
    moveRight() {
        if (this.targetLane < this.lanePositions.length - 1) {
            return this.moveToLane(this.targetLane + 1);
        }
        return false;
    }

    /**
     * Check collision between two objects
     */
    checkCollision(object1, object2, customTolerance = null) {
        const tolerance = customTolerance || this.collisionTolerance;
        
        // Skip if in collision cooldown
        if (this.collisionCooldown > 0) {
            return false;
        }
        
        // Simple bounding box collision
        const distance = object1.position.distanceTo(object2.position);
        return distance < tolerance;
    }

    /**
     * Check collision with obstacle
     */
    checkObstacleCollision(player, obstacle) {
        // Skip if ducking and obstacle is high
        if (this.isDucking && obstacle.position.y > 0.5) {
            return false;
        }
        
        // Skip if jumping and obstacle is low
        if (this.isJumping && player.position.y > 1.5 && obstacle.position.y < 0.5) {
            return false;
        }
        
        return this.checkCollision(player, obstacle);
    }

    /**
     * Handle collision with obstacle
     */
    handleObstacleCollision(gameEngine) {
        // Set collision cooldown
        this.collisionCooldown = this.invulnerabilityTime;
        
        // Camera shake
        if (gameEngine && gameEngine.shakeCamera) {
            gameEngine.shakeCamera(0.5);
        }
        
        // Collision callback
        if (this.onObstacleCollision) {
            this.onObstacleCollision();
        }
        
        return true;
    }

    /**
     * Check if player can collect item
     */
    canCollectItem(player, item) {
        return this.checkCollision(player, item, 1.2); // Larger tolerance for collectibles
    }

    /**
     * Handle item collection
     */
    handleItemCollection(item, type) {
        // Collection callback
        if (this.onItemCollection) {
            this.onItemCollection(item, type);
        }
        
        return true;
    }

    /**
     * Set physics properties
     */
    setGravity(gravity) {
        this.gravity = gravity;
    }

    setJumpForce(jumpForce) {
        this.jumpForce = jumpForce;
    }

    setCollisionTolerance(tolerance) {
        this.collisionTolerance = tolerance;
    }

    /**
     * Get current physics state
     */
    getState() {
        return {
            isGrounded: this.isGrounded,
            isJumping: this.isJumping,
            isDucking: this.isDucking,
            currentLane: this.currentLane,
            targetLane: this.targetLane,
            velocity: this.velocity.clone(),
            collisionCooldown: this.collisionCooldown
        };
    }

    /**
     * Reset physics state
     */
    reset() {
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
        this.isJumping = false;
        this.isDucking = false;
        this.currentLane = 1;
        this.targetLane = 1;
        this.collisionCooldown = 0;
    }

    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.onJump = callbacks.onJump;
        this.onLanding = callbacks.onLanding;
        this.onDuck = callbacks.onDuck;
        this.onStopDuck = callbacks.onStopDuck;
        this.onLaneChangeStart = callbacks.onLaneChangeStart;
        this.onLaneChangeComplete = callbacks.onLaneChangeComplete;
        this.onObstacleCollision = callbacks.onObstacleCollision;
        this.onItemCollection = callbacks.onItemCollection;
    }
}

// Make class available globally
window.PhysicsSystem = PhysicsSystem;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsSystem;
}