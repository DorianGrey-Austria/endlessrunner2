// LevelSelector.js - UI for selecting levels
const LevelSelector = {
    initialized: false,
    selectedLevel: 1,
    
    // Initialize the level selector
    init: function() {
        if (this.initialized) return;
        
        console.log('🎮 Initializing Level Selector');
        this.createUI();
        this.initialized = true;
    },
    
    // Create the level selector UI
    createUI: function() {
        // Check if UI already exists
        if (document.getElementById('levelSelector')) return;
        
        // Create level selector container
        const selectorDiv = document.createElement('div');
        selectorDiv.id = 'levelSelector';
        selectorDiv.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            display: none;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        `;
        
        // Title
        const title = document.createElement('h3');
        title.textContent = 'Select Level';
        title.style.cssText = `
            margin: 0 0 10px 0;
            color: #00ffff;
            text-align: center;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        `;
        selectorDiv.appendChild(title);
        
        // Level buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
        
        // Get available levels
        const levels = GameCore.getModule('levels').getAvailableLevels();
        
        levels.forEach(level => {
            const button = document.createElement('button');
            button.textContent = `Level ${level.id}: ${level.name}`;
            button.style.cssText = `
                padding: 10px 20px;
                background: rgba(0, 100, 200, 0.3);
                border: 1px solid #0088ff;
                border-radius: 5px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                text-align: left;
            `;
            
            // Hover effect
            button.onmouseover = () => {
                button.style.background = 'rgba(0, 255, 255, 0.3)';
                button.style.borderColor = '#00ffff';
                button.style.transform = 'translateX(5px)';
            };
            
            button.onmouseout = () => {
                button.style.background = 'rgba(0, 100, 200, 0.3)';
                button.style.borderColor = '#0088ff';
                button.style.transform = 'translateX(0)';
            };
            
            // Click handler
            button.onclick = () => {
                this.selectLevel(level.id);
            };
            
            // Mark current level
            if (level.id === this.selectedLevel) {
                button.style.background = 'rgba(0, 255, 0, 0.3)';
                button.style.borderColor = '#00ff00';
            }
            
            buttonsContainer.appendChild(button);
        });
        
        selectorDiv.appendChild(buttonsContainer);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #ff0000;
            font-size: 20px;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        closeButton.onclick = () => this.hide();
        closeButton.onmouseover = () => closeButton.style.transform = 'scale(1.2)';
        closeButton.onmouseout = () => closeButton.style.transform = 'scale(1)';
        
        selectorDiv.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(selectorDiv);
        
        // Create toggle button in main menu
        this.createToggleButton();
    },
    
    // Create toggle button for the level selector
    createToggleButton: function() {
        const menuBg = document.getElementById('menuBg');
        if (!menuBg) return;
        
        const toggleButton = document.createElement('button');
        toggleButton.id = 'levelSelectToggle';
        toggleButton.textContent = '🌟 Select Level';
        toggleButton.style.cssText = `
            position: absolute;
            bottom: 100px;
            right: 50%;
            transform: translateX(50%);
            padding: 15px 30px;
            background: linear-gradient(45deg, #0088ff, #00ffff);
            border: none;
            border-radius: 30px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
            transition: all 0.3s;
        `;
        
        toggleButton.onmouseover = () => {
            toggleButton.style.transform = 'translateX(50%) scale(1.1)';
            toggleButton.style.boxShadow = '0 6px 30px rgba(0, 255, 255, 0.6)';
        };
        
        toggleButton.onmouseout = () => {
            toggleButton.style.transform = 'translateX(50%) scale(1)';
            toggleButton.style.boxShadow = '0 4px 20px rgba(0, 255, 255, 0.4)';
        };
        
        toggleButton.onclick = () => {
            this.toggle();
        };
        
        menuBg.appendChild(toggleButton);
    },
    
    // Select a level
    selectLevel: function(levelId) {
        console.log(`🎯 Selected Level ${levelId}`);
        
        const levelManager = GameCore.getModule('levels');
        if (!levelManager) {
            console.error('LevelManager not found!');
            return;
        }
        
        // Update selected level
        this.selectedLevel = levelId;
        
        // Load the level
        if (window.scene && window.renderer) {
            levelManager.loadLevel(levelId, window.scene, window.renderer);
        }
        
        // Update UI
        this.updateUI();
        
        // Hide selector
        this.hide();
        
        // Show notification
        this.showNotification(`Level ${levelId} loaded!`);
    },
    
    // Show notification
    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: black;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    },
    
    // Update UI to reflect current selection
    updateUI: function() {
        const buttons = document.querySelectorAll('#levelSelector button');
        const levels = GameCore.getModule('levels').getAvailableLevels();
        
        buttons.forEach((button, index) => {
            if (index < levels.length) {
                if (levels[index].id === this.selectedLevel) {
                    button.style.background = 'rgba(0, 255, 0, 0.3)';
                    button.style.borderColor = '#00ff00';
                } else {
                    button.style.background = 'rgba(0, 100, 200, 0.3)';
                    button.style.borderColor = '#0088ff';
                }
            }
        });
    },
    
    // Show the level selector
    show: function() {
        const selector = document.getElementById('levelSelector');
        if (selector) {
            selector.style.display = 'block';
            this.updateUI();
        }
    },
    
    // Hide the level selector
    hide: function() {
        const selector = document.getElementById('levelSelector');
        if (selector) {
            selector.style.display = 'none';
        }
    },
    
    // Toggle visibility
    toggle: function() {
        const selector = document.getElementById('levelSelector');
        if (selector) {
            if (selector.style.display === 'none') {
                this.show();
            } else {
                this.hide();
            }
        }
    }
};

// Register with GameCore
if (window.GameCore) {
    window.GameCore.registerModule('levelSelector', LevelSelector);
}