# Subway Runner 3D

A Subway Surfers-inspired endless runner game built with React, Three.js, and TypeScript. Optimized for desktop with 4:3 aspect ratio and featuring 5 different obstacle types designed for Blender MCP integration.

## Features

### Gameplay
- **Pseudo-3D Perspective**: Camera follows behind the player with slight lag for smooth movement
- **Three-Lane System**: Switch between left, center, and right lanes
- **Jump and Duck Mechanics**: Avoid obstacles with precise timing
- **Progressive Difficulty**: Speed increases over time
- **Scoring System**: Points for avoiding obstacles and skillful maneuvers

### Obstacle Types (Blender MCP Ready)
1. **Barrier** (Red) - Duck to avoid
2. **Spike** (Orange) - Jump or duck to avoid  
3. **Wall** (Gray) - Must change lanes to avoid
4. **Block** (Brown) - Jump to avoid
5. **Tunnel** (Blue) - Duck to avoid

### Controls
- **Movement**: WASD or Arrow Keys
- **Jump**: W, Up Arrow, or Spacebar
- **Duck**: S or Down Arrow
- **Lane Switch**: A/D or Left/Right Arrows

### Visual Features
- **Infinite Scrolling Track**: Railway-style track with realistic ties and barriers
- **Dynamic Environment**: City buildings, street lamps, and clouds for depth
- **Particle Effects**: Fog and lighting for atmosphere
- **4:3 Aspect Ratio**: Optimized for desktop viewing

## Project Structure

```
SubwayRunner/
├── src/
│   ├── components/
│   │   ├── GameScene.tsx      # Main 3D scene setup
│   │   ├── Player.tsx         # Player character with animations
│   │   ├── Track.tsx          # Infinite scrolling railway track
│   │   ├── Obstacles.tsx      # 5 obstacle types with collision
│   │   ├── Environment.tsx    # Background buildings and scenery
│   │   └── GameUI.tsx         # Score and instructions overlay
│   ├── store/
│   │   └── gameStore.ts       # Zustand game state management
│   ├── App.tsx                # Main app with keyboard controls
│   ├── main.tsx               # React entry point
│   └── index.css              # Game styling
├── package.json               # Dependencies and scripts
└── vite.config.ts             # Vite configuration
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000`

## Technical Details

### Dependencies
- **React 18**: UI framework
- **Three.js**: 3D graphics engine
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful Three.js components
- **Zustand**: Lightweight state management
- **Vite**: Fast build tool
- **TypeScript**: Type safety

### Game Architecture
- **Component-based**: Each game element is a separate React component
- **State Management**: Centralized game state with Zustand
- **Frame-based Updates**: Uses `useFrame` for smooth 60fps gameplay
- **Collision Detection**: Real-time obstacle collision checking
- **Object Pooling**: Efficient obstacle and track segment reuse

### Blender MCP Integration Points
The 5 obstacle types are designed with specific properties for easy Blender integration:

```typescript
const OBSTACLE_TYPES = {
  barrier: { height: 1.5, color: '#8B0000', canJump: false, canDuck: true },
  spike: { height: 0.8, color: '#FF4500', canJump: true, canDuck: true },
  wall: { height: 2.5, color: '#708090', canJump: false, canDuck: false },
  block: { height: 1.0, color: '#8B4513', canJump: true, canDuck: false },
  tunnel: { height: 1.2, color: '#4682B4', canJump: false, canDuck: true }
}
```

Each obstacle type has defined:
- **Height**: For collision detection
- **Color**: Visual identification
- **Avoidance Methods**: Which player actions can avoid the obstacle

## Performance Optimizations

- **4:3 Aspect Ratio**: Maintains consistent performance across displays
- **Fog Culling**: Objects fade into distance to reduce rendering load
- **Object Recycling**: Track segments and obstacles are reused
- **Efficient State Updates**: Minimal re-renders with targeted state changes
- **Shadow Optimization**: Strategic shadow casting for visual quality

## Future Enhancements

- Power-up system (coins, magnets, shields)
- Multiple character models
- Sound effects and background music
- Particle effects for jumps and collisions
- Leaderboard system
- Mobile responsive design

## Development Notes

The game uses a pseudo-3D perspective similar to classic endless runners, creating a realistic 3D feeling while maintaining simple gameplay mechanics. The camera follows the player with slight lag for smooth movement, and the environment creates depth through parallax scrolling and fog effects.

All obstacle types are designed to be easily replaceable with Blender-created 3D models while maintaining the same collision detection and gameplay mechanics.