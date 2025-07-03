# Endless Runner 3D - Perspective Runner

Ein **3D Perspektiv Endless Runner** für Desktop, bei dem Objekte von der Ferne auf den Spieler zukommen. Der Spieler bleibt in der Mitte-unten des Bildschirms und bewegt sich nur seitlich zwischen den Bahnen.

## 🎯 Konzept

- **Spieler**: Fest positioniert in der Mitte-unten, bewegt sich nur links/rechts zwischen 3 Bahnen
- **Objekte**: Spawnen in der Ferne und bewegen sich auf den Spieler zu (Z-Achse)
- **Kamera**: Perspektivische Sicht, schaut einen "Highway/Tunnel" entlang
- **Steuerung**: A/D oder Pfeiltasten = Bahnen wechseln, SPACE = Springen

## 🏗️ Architektur

### Core-Systeme
- **3D Framework**: Three.js für WebGL-Rendering
- **Player System**: Feste Position mit X-Achsen Bahnen-Wechsel
- **Spawning System**: Muster-basierte Objekt-Erzeugung in der Ferne
- **Movement System**: Z-Achsen Bewegung der Objekte zum Spieler
- **Collision System**: 3D Bounding-Box Kollisionserkennung
- **Performance System**: Adaptive Qualität basierend auf FPS

### Modular World System
- **Konfigurierbare Welten**: Einfach erweiterbar durch JSON-Konfiguration
- **Theme-Swapping**: Laufzeit-Wechsel zwischen verschiedenen Umgebungen
- **Material-System**: Unterschiedliche Shader und Effekte pro Welt

## 🌍 Neue Welten/Levels erstellen

### 1. Welt-Konfiguration hinzufügen

Öffne `worlds.js` und füge eine neue Welt zur `loadWorldConfigurations()` Methode hinzu:

```javascript
desert: {
    name: "Desert Storm",
    environment: {
        skyColor: 0xFFB366,        // Himmel-Farbe
        fogColor: 0xFFD4A3,        // Nebel-Farbe
        fogDensity: 0.012,         // Nebel-Dichte
        ambientLight: { color: 0xFFE4B5, intensity: 0.5 },
        directionalLight: { color: 0xFFE4E1, intensity: 0.9 },
        pointLight: { color: 0xFFD700, intensity: 0.6 }
    },
    ground: {
        color: 0xC2B280,           // Boden-Farbe
        opacity: 1.0,
        emissive: 0x8B7D6B         // Emissive Beleuchtung
    },
    obstacles: {
        types: ['normal', 'tall', 'cactus'],    // Verfügbare Hindernisse
        colors: {
            normal: 0x8B4513,       // Braune Blöcke
            tall: 0x654321,         // Dunkle Blöcke
            cactus: 0x228B22        // Grüne Kakteen
        },
        materials: {
            normal: 'lambert',       // Material-Typ
            tall: 'lambert',
            cactus: 'basic'
        }
    },
    patterns: ['single', 'double', 'gap_left', 'gap_right'],  // Spawn-Muster
    effects: {
        particleColor: 0xFFD700,    // Partikel-Farbe
        trailColor: 0xFF6347,       // Trail-Farbe
        glowIntensity: 1.2          // Glow-Intensität
    },
    progression: {
        speedIncrease: 0.09,        // Geschwindigkeits-Steigerung
        difficultyScale: 1.1,       // Schwierigkeit-Skalierung
        patternComplexity: 0.9      // Muster-Komplexität
    }
}
```

### 2. UI Button hinzufügen

In `index.html`, füge einen neuen Button zur Welt-Auswahl hinzu:

```html
<button class="worldButton" data-world="desert">🏜️ Desert Storm</button>
```

### 3. Neue Hindernistypen erstellen

Erweitere das `getObstacleFromPool()` System in `runner3d.js`:

```javascript
case 'cactus':
    geometry = new THREE.ConeGeometry(0.3, 1.5, 8);  // Kegel-Form für Kaktus
    break;
```

Und füge entsprechende Kollisions-Bounds hinzu:

```javascript
case 'cactus':
    return { width: 0.6, height: 1.5, depth: 0.6 };
```

## 🔧 Erweiterungsmöglichkeiten

### Neue Spawn-Muster

Füge neue Muster zum `obstaclePatterns` Array hinzu und implementiere sie in `spawnPatternStep()`:

```javascript
case 'wave':
    const waveLane = Math.floor(Math.sin(this.patternStep * 0.5) * 1.5 + 1);
    this.spawnObstacleAt(waveLane, spawnZ);
    break;
```

### Neue Material-Typen

Erweitere `createObstacleMaterial()` in `worlds.js`:

```javascript
case 'glass':
    return new THREE.MeshPhongMaterial({ 
        color: config.color,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });
```

### Animierte Objekte

Füge Animation Logic zu `updateObstacles()` hinzu:

```javascript
if (obstacle.userData.type === 'rotating') {
    obstacle.rotation.y += 0.05;
}
```

## 🎨 Grafik-Erweiterungen

### Partikel-Systeme

```javascript
// Trail-Partikel für den Spieler
this.playerTrail = new THREE.BufferGeometry();
this.playerTrailMaterial = new THREE.PointsMaterial({
    color: 0xff6b6b,
    size: 0.1,
    blending: THREE.AdditiveBlending
});
```

### Shader-Effekte

```javascript
// Neon-Glow Shader
const neonMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ffff) }
    },
    vertexShader: `...`,
    fragmentShader: `...`
});
```

### Umgebungs-Effekte

```javascript
// Dynamische Skybox
const skyboxTexture = new THREE.CubeTextureLoader().load([
    'textures/sky_px.jpg', 'textures/sky_nx.jpg',
    'textures/sky_py.jpg', 'textures/sky_ny.jpg',
    'textures/sky_pz.jpg', 'textures/sky_nz.jpg'
]);
this.scene.background = skyboxTexture;
```

## 🚀 Performance-Optimierung

### Adaptive Qualität

Das System passt automatisch die Qualität basierend auf der FPS an:

- **High Performance**: Alle Effekte, höchste Qualität
- **Medium Performance**: Reduzierte Partikel, vereinfachte Shader
- **Low Performance**: Minimale Effekte, optimierte Geometrie

### Object Pooling

Alle Objekte werden wiederverwendet für optimale Performance:

```javascript
// Hindernis zum Pool zurückgeben
this.returnObstacleToPool(obstacle);

// Neues Hindernis aus Pool holen
const obstacle = this.getObstacleFromPool('normal');
```

## 🎮 Gameplay-Features

### Schwierigkeit-Progression

```javascript
// Geschwindigkeit steigt mit Distanz
this.speed = Math.min(this.maxSpeed, 1 + this.distance / 1000);

// Komplexere Muster bei höherer Geschwindigkeit
if (this.speed > 3) {
    availablePatterns.push('tunnel', 'zigzag');
}
```

### Scoring-System

```javascript
// Score basiert auf Distanz
this.score = Math.floor(this.distance / 10);

// Bonus für Near-Miss (zukünftig)
if (this.isNearMiss(player, obstacle)) {
    this.score += 10;
}
```

## 📁 Datei-Struktur

```
Endless3D/
├── index.html          # Haupt-HTML mit UI
├── runner3d.js         # Core Game Logic
├── worlds.js           # World/Theme System
├── README.md           # Diese Anleitung
└── assets/             # Zukünftige Assets
    ├── textures/
    ├── models/
    └── audio/
```

## 🔮 Zukünftige Erweiterungen

1. **Asset Loading Pipeline**: Dynamisches Laden von 3D-Modellen und Texturen
2. **Audio System**: 3D-positioniertes Audio mit Musik-Layering
3. **Powerups**: Spezielle Objekte mit temporären Effekten
4. **Achievements**: Erfolgs-System mit visuellen Belohnungen
5. **Multiplayer**: Netzwerk-Multiplayer mit Leaderboards
6. **VR Support**: Virtual Reality Unterstützung
7. **Procedural Generation**: Laufzeit-Generierung von Welten

Das System ist vollständig modular aufgebaut und ermöglicht einfache Erweiterungen ohne Änderungen am Core-Code.