// Level2_compact.js - Neon Night Run (Simplified for embedding)
const Level2 = {
    name: "Neon Night Run",
    description: "Cyberpunk city with neon lights",
    id: 2,
    
    load: function(scene, renderer) {
        console.log('🌃 Loading Level 2: Neon Night Run');
        
        // Hide base game elements
        scene.children.forEach(child => {
            if (child.userData && (child.userData.type === 'streetLine' || 
                child.userData.type === 'sidewalk')) {
                child.visible = false;
            }
        });
        
        // Neon grid floor
        const gridHelper = new THREE.GridHelper(100, 50, 0x00FFFF, 0x004444);
        gridHelper.position.y = -0.95;
        scene.add(gridHelper);
        
        // Cyberpunk fog
        scene.fog = new THREE.FogExp2(0x001133, 0.025);
        renderer.setClearColor(0x001133);
        
        // Update ambient lighting
        const ambientLight = scene.children.find(child => child.type === 'AmbientLight');
        if (ambientLight) {
            ambientLight.color = new THREE.Color(0x221155);
            ambientLight.intensity = 0.5;
        }
        
        // Add some neon lights
        for (let i = 0; i < 20; i++) {
            const lightColor = Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF;
            const light = new THREE.PointLight(lightColor, 1, 10);
            light.position.set(
                (Math.random() - 0.5) * 40,
                5 + Math.random() * 10,
                -i * 10
            );
            scene.add(light);
        }
        
        console.log('✅ Level 2 loaded successfully!');
    },
    
    update: function(deltaTime) {
        // Simple update logic
    },
    
    cleanup: function() {
        // Cleanup logic
    }
};

// Register with LevelManager
if (window.GameCore && window.GameCore.getModule('levels')) {
    window.GameCore.getModule('levels').registerLevel(2, Level2);
}