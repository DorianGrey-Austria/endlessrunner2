/**
 * ModuleLoader - Handles dynamic loading of game modules
 */
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.baseUrl = './src/';
        this.dependencies = new Map();
        
        // Define module dependencies
        this.setupDependencies();
    }

    /**
     * Setup module dependencies
     */
    setupDependencies() {
        this.dependencies.set('GameEngine', []);
        this.dependencies.set('PhysicsSystem', []);
        this.dependencies.set('AudioSystem', []);
        this.dependencies.set('Level1_Subway', []);
        this.dependencies.set('InputHandler', []);
        this.dependencies.set('GameState', []);
        this.dependencies.set('DeviceDetector', []);
        this.dependencies.set('AdaptiveRenderer', ['DeviceDetector']);
        this.dependencies.set('ObjectPool', []);
    }

    /**
     * Load a module by name
     */
    async loadModule(moduleName) {
        // Check if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Check if currently loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Create loading promise
        const loadingPromise = this.loadModuleInternal(moduleName);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    /**
     * Internal module loading logic
     */
    async loadModuleInternal(moduleName) {
        try {
            // Load dependencies first
            const deps = this.dependencies.get(moduleName) || [];
            await Promise.all(deps.map(dep => this.loadModule(dep)));

            // Determine file path
            const filePath = this.getModulePath(moduleName);
            
            // Load the script
            await this.loadScript(filePath);
            
            // Get the module constructor
            const ModuleClass = window[moduleName];
            if (!ModuleClass) {
                throw new Error(`Module ${moduleName} not found in global scope`);
            }

            console.log(`✅ Module loaded: ${moduleName}`);
            return ModuleClass;

        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Get module file path
     */
    getModulePath(moduleName) {
        const moduleMap = {
            'GameEngine': 'core/GameEngine.js',
            'PhysicsSystem': 'systems/PhysicsSystem.js',
            'AudioSystem': 'systems/AudioSystem.js',
            'Level1_Subway': 'levels/Level1_Subway.js',
            'InputHandler': 'systems/InputHandler.js',
            'GameState': 'core/GameState.js',
            'DeviceDetector': 'utils/DeviceDetector.js',
            'AdaptiveRenderer': 'systems/AdaptiveRenderer.js',
            'ObjectPool': 'systems/ObjectPool.js'
        };

        const path = moduleMap[moduleName];
        if (!path) {
            throw new Error(`Unknown module: ${moduleName}`);
        }

        return this.baseUrl + path;
    }

    /**
     * Load script dynamically
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.type = 'text/javascript';
            
            script.onload = () => {
                console.log(`📦 Script loaded: ${url}`);
                resolve();
            };
            
            script.onerror = () => {
                const error = new Error(`Failed to load script: ${url}`);
                console.error(error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Load multiple modules
     */
    async loadModules(moduleNames) {
        const promises = moduleNames.map(name => this.loadModule(name));
        return Promise.all(promises);
    }

    /**
     * Preload essential modules
     */
    async preloadEssentials() {
        const essentialModules = [
            'GameEngine',
            'PhysicsSystem',
            'AudioSystem'
        ];

        try {
            await this.loadModules(essentialModules);
            console.log('✅ Essential modules preloaded');
            return true;
        } catch (error) {
            console.error('❌ Failed to preload essential modules:', error);
            return false;
        }
    }

    /**
     * Load level module
     */
    async loadLevel(levelNumber) {
        const levelModuleName = `Level${levelNumber}_Subway`;
        
        try {
            const LevelClass = await this.loadModule(levelModuleName);
            return new LevelClass();
        } catch (error) {
            console.error(`❌ Failed to load level ${levelNumber}:`, error);
            throw error;
        }
    }

    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Get loaded module
     */
    getModule(moduleName) {
        return this.loadedModules.get(moduleName);
    }

    /**
     * Get all loaded modules
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.keys());
    }

    /**
     * Unload module
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            this.loadedModules.delete(moduleName);
            console.log(`🗑️ Module unloaded: ${moduleName}`);
        }
    }

    /**
     * Clear all loaded modules
     */
    clearAll() {
        this.loadedModules.clear();
        this.loadingPromises.clear();
        console.log('🗑️ All modules cleared');
    }

    /**
     * Get module loading status
     */
    getStatus() {
        return {
            loaded: this.loadedModules.size,
            loading: this.loadingPromises.size,
            modules: Array.from(this.loadedModules.keys())
        };
    }
}

// Create global module loader instance
window.moduleLoader = new ModuleLoader();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}