# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of endless runner game projects built with different technologies:

- **SubwayRunner**: React + Three.js + TypeScript (modern web-based 3D runner)
- **Endless3D**: Vanilla JavaScript + Three.js (perspective-based 3D runner)
- **EndlessRunner-MVP**: Pure JavaScript (feature-rich browser runner)
- **GestureRunnerPro**: Godot 4.3 (gesture-controlled runner with WebCam)
- **godot-mcp**: Godot MCP server for AI integration

## Common Development Commands

### SubwayRunner (React/TypeScript/Three.js)
```bash
cd SubwayRunner
npm install          # Install dependencies
npm run dev          # Start development server (port 3001)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Endless3D (Vanilla JS/Three.js)
```bash
cd Endless3D
# Serve locally - no build process needed
python -m http.server 8000
# Navigate to localhost:8000
```

### EndlessRunner-MVP (Pure JavaScript)
```bash
cd EndlessRunner-MVP
# Serve locally - no build process needed
python -m http.server 8000
# Navigate to localhost:8000
```

### GestureRunnerPro (Godot)
```bash
# Open project in Godot 4.3+
godot --path GestureRunnerPro

# Export for web
godot --export-release "Web" web_export/index.html

# Serve web export
cd GestureRunnerPro/web_export
python -m http.server 8000
```

### godot-mcp (MCP Server)
```bash
cd godot-mcp
npm install          # Install dependencies
npm run build        # Build TypeScript to JavaScript
npm run watch        # Watch mode for development
npm run inspector    # Run MCP inspector
```

## Architecture Overview

### SubwayRunner Architecture
- **Component-based React**: Each game element is a separate React component
- **Three.js Integration**: Using @react-three/fiber for React-Three.js bridge
- **State Management**: Zustand for lightweight global state
- **Performance**: Object pooling, frame-based updates via useFrame
- **Collision System**: Real-time 3D collision detection
- **Obstacle Types**: 5 distinct obstacle types (barrier, spike, wall, block, tunnel)

### Endless3D Architecture
- **Modular World System**: JSON-configurable environments and themes
- **Object Pooling**: Efficient obstacle and track segment reuse
- **Adaptive Performance**: Quality scaling based on FPS detection
- **Perspective Rendering**: Objects spawn in distance, move toward player
- **Pattern-based Spawning**: Configurable obstacle patterns per world

### EndlessRunner-MVP Architecture
- **Event-driven**: Clean component communication via custom events
- **Device-adaptive**: GPU tier detection with quality scaling
- **Feature-rich**: Shop system, biomes, power-ups, achievements
- **Analytics System**: Real-time player behavior tracking
- **Cross-platform**: ES5 compatibility with modern progressive enhancement

### GestureRunnerPro Architecture
- **Godot Scene System**: Modular scenes for UI, gameplay, effects
- **Autoloaded Singletons**: GameCore, AudioManager, SaveSystem, Analytics
- **WebCam Integration**: MediaPipe gesture recognition for browser
- **State Machine**: Player states (running, jumping, ducking, etc.)
- **Object Pooling**: Godot-optimized obstacle and effect recycling

### godot-mcp Architecture
- **MCP Protocol**: Model Context Protocol server for Godot integration
- **WebSocket Communication**: Real-time communication with Godot editor
- **Command System**: Modular command processors for different operations
- **Resource Management**: Utilities for Godot scenes, scripts, and projects

## Key Design Patterns

### Performance Optimization
- All projects use object pooling to minimize garbage collection
- Adaptive quality systems adjust rendering based on device capabilities
- Frame-based updates ensure consistent 60+ FPS gameplay

### State Management
- **React projects**: Zustand for minimal state management
- **Vanilla JS**: Event-driven architecture with custom events
- **Godot**: Singleton autoloads for global state, signals for communication

### Collision Detection
- **3D projects**: Bounding box collision with configurable tolerances
- **2D Godot**: Physics body collision layers for precise detection
- **Performance**: Spatial partitioning and early exit optimizations

## Development Guidelines

### Code Style
- Follow existing patterns in each project
- Maintain consistent naming conventions per project type
- Prefer composition over inheritance where applicable

### Performance Considerations
- Always consider object pooling for frequently created/destroyed objects
- Use adaptive quality systems for cross-device compatibility
- Implement proper cleanup in component lifecycle methods

### Testing Strategy
- **SubwayRunner**: No specific test framework - rely on browser testing
- **Godot projects**: Test in Godot editor and exported builds
- **MCP server**: Test with MCP inspector tool

## Project-Specific Notes

### SubwayRunner
- Uses port 3001 by default to avoid conflicts
- Optimized for 4:3 aspect ratio desktop viewing
- Obstacle types designed for easy Blender integration

### Endless3D
- Fully modular world system - add new worlds via JSON config
- German documentation - maintain language consistency
- Advanced shader effects and post-processing

### EndlessRunner-MVP
- Extensive feature set - over 10,000 lines of code
- iPad M1/M2 optimization with 120 FPS support
- UI/UX first development philosophy

### GestureRunnerPro
- Requires webcam permissions for gesture control
- WebGL compatibility mode for broader browser support
- MediaPipe integration for gesture recognition

### godot-mcp
- Requires Godot editor to be running for full functionality
- TypeScript source compiled to JavaScript for distribution
- Provides tools for scene management, script editing, and project operations

## Code Review Suggestions

- As a senior developer, five potential improvements for the code without compromising performance or gameplay:
  1. Implement robust error handling and logging mechanisms
  2. Refactor repetitive code segments into reusable utility functions
  3. Add comprehensive input validation for game parameters
  4. Create a configuration management system for easy tuning of game mechanics
  5. Optimize resource management with intelligent object pooling techniques