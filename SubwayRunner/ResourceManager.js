/**
 * Resource Manager for Three.js
 * Tracks and properly disposes all Three.js resources to prevent memory leaks
 * 
 * @module ResourceManager
 */

class ResourceManager {
    constructor() {
        this.resources = {
            geometries: new Set(),
            materials: new Set(),
            textures: new Set(),
            meshes: new Set(),
            groups: new Set(),
            lights: new Set(),
            helpers: new Set(),
            animations: new Set(),
            customObjects: new Set()
        };
        
        this.levelResources = new Map(); // Track resources per level
        this.memoryUsage = 0;
        this.disposalLog = [];
        this.debugMode = false;
    }
    
    /**
     * Enable debug logging
     */
    enableDebug() {
        this.debugMode = true;
        console.log('[ResourceManager] Debug mode enabled');
    }
    
    /**
     * Track a geometry
     */
    trackGeometry(geometry, levelId = null) {
        if (!geometry) return;
        
        this.resources.geometries.add(geometry);
        if (levelId) {
            this._addToLevel(levelId, 'geometry', geometry);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked geometry: ${geometry.type || 'Unknown'}`);
        }
    }
    
    /**
     * Track a material
     */
    trackMaterial(material, levelId = null) {
        if (!material) return;
        
        this.resources.materials.add(material);
        if (levelId) {
            this._addToLevel(levelId, 'material', material);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked material: ${material.type || 'Unknown'}`);
        }
    }
    
    /**
     * Track a texture
     */
    trackTexture(texture, levelId = null) {
        if (!texture) return;
        
        this.resources.textures.add(texture);
        if (levelId) {
            this._addToLevel(levelId, 'texture', texture);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked texture: ${texture.name || 'Unknown'}`);
        }
    }
    
    /**
     * Track a mesh (automatically tracks its geometry and material)
     */
    trackMesh(mesh, levelId = null) {
        if (!mesh) return;
        
        this.resources.meshes.add(mesh);
        
        // Auto-track geometry and material
        if (mesh.geometry) {
            this.trackGeometry(mesh.geometry, levelId);
        }
        
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => this.trackMaterial(mat, levelId));
            } else {
                this.trackMaterial(mesh.material, levelId);
            }
        }
        
        if (levelId) {
            this._addToLevel(levelId, 'mesh', mesh);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked mesh: ${mesh.name || 'Unknown'}`);
        }
    }
    
    /**
     * Track a group (recursively tracks all children)
     */
    trackGroup(group, levelId = null) {
        if (!group) return;
        
        this.resources.groups.add(group);
        
        // Recursively track all children
        group.traverse((child) => {
            if (child !== group) {
                if (child.isMesh) {
                    this.trackMesh(child, levelId);
                } else if (child.isLight) {
                    this.trackLight(child, levelId);
                } else if (child.isGroup || child.isObject3D) {
                    this.resources.customObjects.add(child);
                    if (levelId) {
                        this._addToLevel(levelId, 'object', child);
                    }
                }
            }
        });
        
        if (levelId) {
            this._addToLevel(levelId, 'group', group);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked group: ${group.name || 'Unknown'} with ${group.children.length} children`);
        }
    }
    
    /**
     * Track a light
     */
    trackLight(light, levelId = null) {
        if (!light) return;
        
        this.resources.lights.add(light);
        if (levelId) {
            this._addToLevel(levelId, 'light', light);
        }
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Tracked light: ${light.type || 'Unknown'}`);
        }
    }
    
    /**
     * Add resource to level tracking
     */
    _addToLevel(levelId, type, resource) {
        if (!this.levelResources.has(levelId)) {
            this.levelResources.set(levelId, {
                geometries: new Set(),
                materials: new Set(),
                textures: new Set(),
                meshes: new Set(),
                groups: new Set(),
                lights: new Set(),
                objects: new Set()
            });
        }
        
        const levelRes = this.levelResources.get(levelId);
        switch (type) {
            case 'geometry':
                levelRes.geometries.add(resource);
                break;
            case 'material':
                levelRes.materials.add(resource);
                break;
            case 'texture':
                levelRes.textures.add(resource);
                break;
            case 'mesh':
                levelRes.meshes.add(resource);
                break;
            case 'group':
                levelRes.groups.add(resource);
                break;
            case 'light':
                levelRes.lights.add(resource);
                break;
            case 'object':
                levelRes.objects.add(resource);
                break;
        }
    }
    
    /**
     * Dispose a specific geometry
     */
    disposeGeometry(geometry) {
        if (!geometry || !this.resources.geometries.has(geometry)) return;
        
        geometry.dispose();
        this.resources.geometries.delete(geometry);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed geometry: ${geometry.type || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose a specific material
     */
    disposeMaterial(material) {
        if (!material || !this.resources.materials.has(material)) return;
        
        // Dispose maps/textures in material
        const maps = ['map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 
                     'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 
                     'normalMap', 'roughnessMap'];
        
        maps.forEach(mapName => {
            if (material[mapName]) {
                this.disposeTexture(material[mapName]);
            }
        });
        
        material.dispose();
        this.resources.materials.delete(material);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed material: ${material.type || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose a specific texture
     */
    disposeTexture(texture) {
        if (!texture || !this.resources.textures.has(texture)) return;
        
        texture.dispose();
        this.resources.textures.delete(texture);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed texture: ${texture.name || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose a specific mesh
     */
    disposeMesh(mesh) {
        if (!mesh || !this.resources.meshes.has(mesh)) return;
        
        // Remove from parent if exists
        if (mesh.parent) {
            mesh.parent.remove(mesh);
        }
        
        // Dispose geometry
        if (mesh.geometry) {
            this.disposeGeometry(mesh.geometry);
        }
        
        // Dispose material(s)
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => this.disposeMaterial(mat));
            } else {
                this.disposeMaterial(mesh.material);
            }
        }
        
        this.resources.meshes.delete(mesh);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed mesh: ${mesh.name || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose a group and all its children
     */
    disposeGroup(group) {
        if (!group || !this.resources.groups.has(group)) return;
        
        // Remove from parent if exists
        if (group.parent) {
            group.parent.remove(group);
        }
        
        // Dispose all children
        while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
            
            if (child.isMesh) {
                this.disposeMesh(child);
            } else if (child.isLight) {
                this.disposeLight(child);
            } else if (child.isGroup) {
                this.disposeGroup(child);
            }
        }
        
        this.resources.groups.delete(group);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed group: ${group.name || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose a light
     */
    disposeLight(light) {
        if (!light || !this.resources.lights.has(light)) return;
        
        // Remove from parent if exists
        if (light.parent) {
            light.parent.remove(light);
        }
        
        // Dispose shadow map if exists
        if (light.shadow && light.shadow.map) {
            light.shadow.map.dispose();
        }
        
        this.resources.lights.delete(light);
        
        if (this.debugMode) {
            console.log(`[ResourceManager] Disposed light: ${light.type || 'Unknown'}`);
        }
    }
    
    /**
     * Dispose all resources for a specific level
     */
    disposeLevelResources(levelId) {
        if (!this.levelResources.has(levelId)) return;
        
        console.log(`[ResourceManager] Disposing resources for level ${levelId}`);
        const startCount = this.getResourceCount();
        
        const levelRes = this.levelResources.get(levelId);
        
        // Dispose in correct order: meshes/groups first, then materials, then geometries
        levelRes.groups.forEach(group => this.disposeGroup(group));
        levelRes.meshes.forEach(mesh => this.disposeMesh(mesh));
        levelRes.lights.forEach(light => this.disposeLight(light));
        levelRes.objects.forEach(obj => {
            if (obj.parent) obj.parent.remove(obj);
            this.resources.customObjects.delete(obj);
        });
        levelRes.materials.forEach(mat => this.disposeMaterial(mat));
        levelRes.geometries.forEach(geo => this.disposeGeometry(geo));
        levelRes.textures.forEach(tex => this.disposeTexture(tex));
        
        this.levelResources.delete(levelId);
        
        const endCount = this.getResourceCount();
        console.log(`[ResourceManager] Disposed ${startCount - endCount} resources for level ${levelId}`);
        
        // Force garbage collection hint
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Dispose all tracked resources
     */
    disposeAll() {
        console.log('[ResourceManager] Disposing all resources...');
        const startCount = this.getResourceCount();
        
        // Dispose in correct order
        this.resources.groups.forEach(group => this.disposeGroup(group));
        this.resources.meshes.forEach(mesh => this.disposeMesh(mesh));
        this.resources.lights.forEach(light => this.disposeLight(light));
        this.resources.customObjects.forEach(obj => {
            if (obj.parent) obj.parent.remove(obj);
        });
        this.resources.materials.forEach(mat => this.disposeMaterial(mat));
        this.resources.geometries.forEach(geo => this.disposeGeometry(geo));
        this.resources.textures.forEach(tex => this.disposeTexture(tex));
        
        // Clear all sets
        Object.values(this.resources).forEach(set => set.clear());
        this.levelResources.clear();
        
        console.log(`[ResourceManager] Disposed ${startCount} total resources`);
    }
    
    /**
     * Get current resource count
     */
    getResourceCount() {
        let count = 0;
        Object.values(this.resources).forEach(set => {
            count += set.size;
        });
        return count;
    }
    
    /**
     * Get detailed resource report
     */
    getResourceReport() {
        const report = {
            total: this.getResourceCount(),
            geometries: this.resources.geometries.size,
            materials: this.resources.materials.size,
            textures: this.resources.textures.size,
            meshes: this.resources.meshes.size,
            groups: this.resources.groups.size,
            lights: this.resources.lights.size,
            customObjects: this.resources.customObjects.size,
            levels: {}
        };
        
        // Add level-specific counts
        this.levelResources.forEach((resources, levelId) => {
            report.levels[levelId] = {
                geometries: resources.geometries.size,
                materials: resources.materials.size,
                textures: resources.textures.size,
                meshes: resources.meshes.size,
                groups: resources.groups.size,
                lights: resources.lights.size,
                objects: resources.objects.size
            };
        });
        
        return report;
    }
    
    /**
     * Estimate memory usage (rough estimate)
     */
    estimateMemoryUsage() {
        let bytes = 0;
        
        // Rough estimates per resource type
        this.resources.geometries.forEach(geo => {
            if (geo.attributes && geo.attributes.position) {
                bytes += geo.attributes.position.count * 12; // 3 floats * 4 bytes
            }
        });
        
        this.resources.textures.forEach(tex => {
            if (tex.image) {
                bytes += (tex.image.width || 0) * (tex.image.height || 0) * 4; // RGBA
            }
        });
        
        // Add overhead estimates
        bytes += this.resources.materials.size * 1024; // ~1KB per material
        bytes += this.resources.meshes.size * 512; // ~0.5KB per mesh
        
        return {
            bytes: bytes,
            megabytes: (bytes / 1024 / 1024).toFixed(2),
            formatted: this._formatBytes(bytes)
        };
    }
    
    /**
     * Format bytes to human readable
     */
    _formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export as singleton
const resourceManager = new ResourceManager();

// Make it globally available for the game
window.ResourceManager = resourceManager;

console.log('[ResourceManager] Initialized and ready');