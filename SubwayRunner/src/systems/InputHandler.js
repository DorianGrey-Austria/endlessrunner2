/**
 * InputHandler - Handles keyboard, touch, and gesture input
 */
class InputHandler {
    constructor() {
        this.keyStates = {};
        this.touchStates = {};
        this.gestureStates = {};
        this.callbacks = {};
        
        // Input settings
        this.swipeThreshold = 50;
        this.tapThreshold = 200; // ms
        this.lastTouchTime = 0;
        this.touchStartPos = null;
        
        // Event listeners
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        
        this.isEnabled = false;
    }

    /**
     * Initialize input handling
     */
    init() {
        if (this.isEnabled) return;
        
        // Keyboard events
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
        
        // Touch events
        document.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        document.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        
        // Mouse events (for desktop testing)
        document.addEventListener('mousedown', this.boundTouchStart);
        document.addEventListener('mouseup', this.boundTouchEnd);
        document.addEventListener('mousemove', this.boundTouchMove);
        
        this.isEnabled = true;
        console.log('✅ InputHandler initialized');
    }

    /**
     * Handle keyboard key down
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Prevent default for game keys
        if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(key)) {
            event.preventDefault();
        }
        
        // Update key state
        this.keyStates[key] = true;
        
        // Handle specific keys
        switch (key) {
            case 'arrowleft':
            case 'a':
                this.triggerCallback('moveLeft');
                break;
            case 'arrowright':
            case 'd':
                this.triggerCallback('moveRight');
                break;
            case 'arrowup':
            case 'w':
            case ' ':
                this.triggerCallback('jump');
                break;
            case 'arrowdown':
            case 's':
                this.triggerCallback('duckStart');
                break;
            case 'escape':
                this.triggerCallback('pause');
                break;
            case 'r':
                this.triggerCallback('restart');
                break;
        }
    }

    /**
     * Handle keyboard key up
     */
    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keyStates[key] = false;
        
        // Handle key release
        switch (key) {
            case 'arrowdown':
            case 's':
                this.triggerCallback('duckEnd');
                break;
        }
    }

    /**
     * Handle touch/mouse start
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const touch = event.touches ? event.touches[0] : event;
        this.touchStartPos = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        
        this.lastTouchTime = Date.now();
    }

    /**
     * Handle touch/mouse end
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (!this.touchStartPos) return;
        
        const touch = event.changedTouches ? event.changedTouches[0] : event;
        const endPos = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        
        const deltaX = endPos.x - this.touchStartPos.x;
        const deltaY = endPos.y - this.touchStartPos.y;
        const deltaTime = endPos.time - this.touchStartPos.time;
        
        // Check for tap
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < this.tapThreshold) {
            this.handleTap(endPos);
        }
        // Check for swipe
        else if (Math.abs(deltaX) > this.swipeThreshold || Math.abs(deltaY) > this.swipeThreshold) {
            this.handleSwipe(deltaX, deltaY, deltaTime);
        }
        
        this.touchStartPos = null;
    }

    /**
     * Handle touch/mouse move
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (!this.touchStartPos) return;
        
        const touch = event.touches ? event.touches[0] : event;
        const currentPos = {
            x: touch.clientX,
            y: touch.clientY
        };
        
        const deltaX = currentPos.x - this.touchStartPos.x;
        const deltaY = currentPos.y - this.touchStartPos.y;
        
        // Handle continuous gestures
        if (Math.abs(deltaY) > 30) {
            if (deltaY < 0) {
                // Swipe up - duck
                this.triggerCallback('duckStart');
            } else {
                // Swipe down - stop duck
                this.triggerCallback('duckEnd');
            }
        }
    }

    /**
     * Handle tap gesture
     */
    handleTap(position) {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        
        // Determine tap action based on position
        if (position.y < screenHeight * 0.5) {
            // Top half - jump
            this.triggerCallback('jump');
        } else {
            // Bottom half - duck
            this.triggerCallback('duckStart');
            setTimeout(() => this.triggerCallback('duckEnd'), 300);
        }
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe(deltaX, deltaY, deltaTime) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Determine primary direction
        if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.triggerCallback('moveRight');
            } else {
                this.triggerCallback('moveLeft');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                // Swipe down - duck
                this.triggerCallback('duckStart');
                setTimeout(() => this.triggerCallback('duckEnd'), 200);
            } else {
                // Swipe up - jump
                this.triggerCallback('jump');
            }
        }
    }

    /**
     * Register callback for input action
     */
    onInput(action, callback) {
        if (!this.callbacks[action]) {
            this.callbacks[action] = [];
        }
        this.callbacks[action].push(callback);
    }

    /**
     * Remove callback for input action
     */
    offInput(action, callback) {
        if (this.callbacks[action]) {
            const index = this.callbacks[action].indexOf(callback);
            if (index > -1) {
                this.callbacks[action].splice(index, 1);
            }
        }
    }

    /**
     * Trigger callback for action
     */
    triggerCallback(action) {
        if (this.callbacks[action]) {
            this.callbacks[action].forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error(`Input callback error for ${action}:`, error);
                }
            });
        }
    }

    /**
     * Check if key is currently pressed
     */
    isKeyPressed(key) {
        return this.keyStates[key.toLowerCase()] || false;
    }

    /**
     * Get current input state
     */
    getState() {
        return {
            keys: { ...this.keyStates },
            touches: { ...this.touchStates },
            gestures: { ...this.gestureStates }
        };
    }

    /**
     * Enable input handling
     */
    enable() {
        if (!this.isEnabled) {
            this.init();
        }
    }

    /**
     * Disable input handling
     */
    disable() {
        if (!this.isEnabled) return;
        
        // Remove event listeners
        document.removeEventListener('keydown', this.boundKeyDown);
        document.removeEventListener('keyup', this.boundKeyUp);
        document.removeEventListener('touchstart', this.boundTouchStart);
        document.removeEventListener('touchend', this.boundTouchEnd);
        document.removeEventListener('touchmove', this.boundTouchMove);
        document.removeEventListener('mousedown', this.boundTouchStart);
        document.removeEventListener('mouseup', this.boundTouchEnd);
        document.removeEventListener('mousemove', this.boundTouchMove);
        
        this.isEnabled = false;
        console.log('🔇 InputHandler disabled');
    }

    /**
     * Clear all input states
     */
    clearStates() {
        this.keyStates = {};
        this.touchStates = {};
        this.gestureStates = {};
    }

    /**
     * Clear all callbacks
     */
    clearCallbacks() {
        this.callbacks = {};
    }

    /**
     * Dispose of input handler
     */
    dispose() {
        this.disable();
        this.clearCallbacks();
        this.clearStates();
        console.log('🗑️ InputHandler disposed');
    }
}

// Make class available globally
window.InputHandler = InputHandler;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}