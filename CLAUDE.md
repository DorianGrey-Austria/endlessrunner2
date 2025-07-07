# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of endless runner game projects built with different technologies, following a UI/UX-first development philosophy where user experience drives all technical decisions.

- **SubwayRunner**: Vanilla JavaScript + Three.js (main production game, deployed via GitHub Actions)
- **Endless3D**: Vanilla JavaScript + Three.js (perspective-based 3D runner with world system)
- **EndlessRunner-MVP**: Pure JavaScript (feature-rich browser runner)
- **GestureRunnerPro**: Godot 4.3 (gesture-controlled runner with MediaPipe WebCam integration)
- **godot-mcp**: Godot MCP server for AI integration

**Primary Project**: SubwayRunner is the main production game with automated deployment to Hostinger.

## Common Development Commands

### SubwayRunner (Vanilla JS/Three.js) - Primary Project
```bash
cd SubwayRunner
# Serve locally for development
python -m http.server 8001
# Navigate to localhost:8001

# Deployment (automatic via GitHub Actions)
git add . && git commit -m "message" && git push
# Deploys to https://ki-revolution.at/ via Hostinger FTP

# Run lint and typecheck before commits
# No specific lint/typecheck commands for vanilla JS project
# Test directly in browser at localhost:8001
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

# Run lint and typecheck before commits
npm run lint         # Linting (if configured)
npm run typecheck    # TypeScript type checking
```

## Architecture Overview

### SubwayRunner Architecture (Primary Project)
- **Single HTML File**: Complete game in SubwayRunner/index.html with embedded CSS/JS
- **Three.js Direct**: Direct Three.js usage without React wrapper
- **Vanilla JS**: Performance-optimized pure JavaScript implementation
- **Game Loop**: RequestAnimationFrame-based game loop with delta time
- **Obstacle System**: 7+ obstacle types including tunnels, barriers, spikes, walls
- **Audio System**: Background music with WAV format support
- **Deployment**: GitHub Actions automatic deployment to Hostinger via FTP
- **Version Display**: UI shows current version and deployment date

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
- **MediaPipe Integration**: Real-time gesture recognition via JavaScript bridge
- **WebCam Support**: Browser webcam access with pose landmark detection
- **Gesture System**: 6 supported gestures (move left/right, jump, duck, shield, magnet)
- **Cross-Platform Bridge**: JavaScriptBridge for web export gesture communication
- **State Machine**: Player states with gesture-driven transitions

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

## Deployment & CI/CD

### GitHub Actions Workflow
- **Trigger**: Push to main branch or manual workflow_dispatch
- **Process**: Copies SubwayRunner/index.html to root, creates deployment package
- **Target**: Hostinger FTP deployment to root directory (server-dir: /)
- **Secrets Required**: FTP_SERVER (use IP address), FTP_USERNAME, FTP_PASSWORD
- **Live URL**: https://ki-revolution.at/
- **Important**: GitHub Secrets are repository-specific - must be reconfigured when switching repos
- **Production**: Includes .htaccess with HTTPS enforcement, compression, caching, and security headers

### Known Issues & Current Focus
- **Critical Bug**: Overhead/tunnel obstacles are passable when ducking - collision detection needs fixing
- **Version Display**: UI version info should appear bottom-left but may need CSS fixes
- **Next Phase**: Gesture control integration from GestureRunnerPro into SubwayRunner
- **Planned**: Sound system overhaul with realistic audio samples

## Project-Specific Notes

### SubwayRunner (Primary Project)
- **Development Port**: 8001 (python -m http.server)
- **Production**: Single HTML file deployment
- **Current Version**: 3.1 with deployment fixes
- **Critical Bug**: Overhead/tunnel obstacles passable when ducking

### Endless3D
- Fully modular world system - add new worlds via JSON config
- German documentation - maintain language consistency
- Advanced shader effects and post-processing

### EndlessRunner-MVP
- Extensive feature set - over 10,000 lines of code
- iPad M1/M2 optimization with 120 FPS support
- UI/UX first development philosophy

### GestureRunnerPro
- **MediaPipe Version**: 0.10.0 from CDN for pose detection
- **Gesture Recognition**: 240x180 video preview with real-time skeleton overlay
- **Browser Requirements**: WebRTC (getUserMedia), WebGL, HTTPS for camera access
- **Key Files**: systems/gesture/GestureInterface.gd, web_export/mediapipe/gesture_bridge.html
- **Gesture Thresholds**: 15% torso height for lean, 30% above shoulders for jump

### godot-mcp
- Requires Godot editor to be running for full functionality
- TypeScript source compiled to JavaScript for distribution
- Provides tools for scene management, script editing, and project operations

## Additional Resources

- **DEPLOYMENT.md**: German-language deployment guide with head tracking setup
- **ROADMAP.md**: Detailed development roadmap for GestureRunnerPro
- **github.hostinger.connection.md**: Troubleshooting guide for GitHub Actions deployment

## Development Philosophy

**UI/UX First**: User experience is paramount. Every technical decision should prioritize the player's experience, ensuring intuitive controls, smooth performance, and engaging visual feedback across all devices.