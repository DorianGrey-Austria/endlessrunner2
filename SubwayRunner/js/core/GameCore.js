// GameCore.js - Central game management system
const GameCore = {
    version: "4.0.0-modular",
    modules: {},
    initialized: false,
    
    // Register a game module
    registerModule: function(name, module) {
        if (this.modules[name]) {
            console.warn(`Module ${name} already registered, overwriting...`);
        }
        this.modules[name] = module;
        console.log(`✅ Module registered: ${name}`);
        
        // Auto-initialize if GameCore is already initialized
        if (this.initialized && module.init) {
            module.init();
        }
    },
    
    // Get a registered module
    getModule: function(name) {
        if (!this.modules[name]) {
            console.error(`Module ${name} not found!`);
            return null;
        }
        return this.modules[name];
    },
    
    // Initialize all registered modules
    init: function() {
        console.log('🚀 Initializing GameCore v' + this.version);
        
        // Initialize modules in specific order
        const initOrder = ['utils', 'levels', 'characters', 'ui', 'effects'];
        
        initOrder.forEach(moduleName => {
            const module = this.modules[moduleName];
            if (module && module.init) {
                console.log(`Initializing ${moduleName}...`);
                module.init();
            }
        });
        
        // Initialize any remaining modules
        Object.entries(this.modules).forEach(([name, module]) => {
            if (!initOrder.includes(name) && module.init) {
                console.log(`Initializing ${name}...`);
                module.init();
            }
        });
        
        this.initialized = true;
        console.log('✅ GameCore initialization complete');
    },
    
    // Update all modules
    update: function(deltaTime) {
        Object.values(this.modules).forEach(module => {
            if (module.update) {
                module.update(deltaTime);
            }
        });
    },
    
    // Clean up all modules
    cleanup: function() {
        Object.values(this.modules).forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            }
        });
        this.modules = {};
        this.initialized = false;
    }
};

// Make GameCore globally available
window.GameCore = GameCore;