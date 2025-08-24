# Tech Stack - EndlessRunner

## Core Technologies

### Frontend/Game Engine
- **Three.js v0.150.0** - 3D graphics engine (DO NOT CHANGE VERSION)
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **HTML5** - Single page application structure
- **MediaPipe FaceMesh** - Gesture control integration

### Development Environment
- **Node.js** - Development tooling
- **Python HTTP Server** - Local development server
- **NPM** - Package management for testing tools

### Testing Framework
- **Custom test-runner.js** - Main test suite
- **Playwright** - Browser automation testing
- **ESLint** - Code quality checking

### Deployment
- **GitHub Actions** - CI/CD pipeline
- **Hostinger FTP** - Production hosting
- **Auto-deployment** - Every push to main branch

## Architecture Constraints

### Performance Requirements
- **60 FPS** - Mandatory frame rate
- **PRODUCTION_MODE = true** - For performance optimization
- **No console.log in game loop** - Performance killer
- **Object pooling** - For obstacles and collectibles

### Browser Compatibility
- **Chrome/Edge Required** - For MediaPipe gesture control
- **HTTPS Required** - For camera access
- **Safari Incompatible** - MediaPipe limitations

### Code Organization
- **Monolithic Structure** - Single index.html file (~5000+ lines)
- **Embedded JavaScript** - No external JS files
- **Inline CSS** - No external stylesheets
- **CDN Dependencies** - Three.js from unpkg.com