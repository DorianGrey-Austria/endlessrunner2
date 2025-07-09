# 🔧 SubwayRunner Module System Troubleshooting

## 🔴 CRITICAL DISCOVERY: GitHub Actions Deployment Issue

### The Real Problem (Found July 9, 2025)

**GitHub Actions only copies index.html, NOT the entire SubwayRunner folder!**

```yaml
# From hostinger-deploy.yml line 26:
cp SubwayRunner/index.html index.html

# What it SHOULD do:
cp -r SubwayRunner/* deploy/
```

This explains why all module files return 404 - they're never uploaded to the server!

### Immediate Solution: Embed Modules in index.html

Since fixing the GitHub Actions workflow requires repository access, the fastest solution is to embed all modules directly in index.html:

```html
<!-- Instead of external files -->
<script src="SubwayRunner/js/core/GameCore.js"></script>

<!-- Embed directly -->
<script>
// GameCore.js content here
const GameCore = { ... };
</script>
```

## 🚨 Critical Issues After Module Integration

### Issue #1: 404 Errors for Module Files

**Error Messages**:
```
GameCore.js:1 Failed to load resource: 404
LevelManager.js:1 Failed to load resource: 404
Level2.js:1 Failed to load resource: 404
LevelSelector.js:1 Failed to load resource: 404
```

**Root Cause**: GitHub Actions deployment structure mismatch

**Fix Applied**:
```html
<!-- Wrong (works locally, fails in production) -->
<script src="js/core/GameCore.js"></script>

<!-- Correct (works in production) -->
<script src="SubwayRunner/js/core/GameCore.js"></script>
```

### Issue #2: Content Security Policy Blocking CDNs

**Error**:
```
Refused to load script 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0'
CSP directive: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com"
```

**Fix**: Expanded CSP to include all required domains:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self' 'unsafe-inline' 'unsafe-eval'; 
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
        https://unpkg.com 
        https://cdn.jsdelivr.net 
        https://storage.googleapis.com; 
    connect-src 'self' 
        https://*.supabase.co 
        https://storage.googleapis.com 
        data: blob:; 
    worker-src 'self' blob:; 
    img-src 'self' data: blob: https:; 
    media-src 'self' blob:; 
    font-src 'self' data: https://fonts.gstatic.com; 
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
">
```

### Issue #3: GameCore Not Defined

**Error**:
```javascript
ReferenceError: GameCore is not defined at init ((index):1418:17)
```

**Causes**:
1. Scripts loading before Three.js
2. Wrong path to GameCore.js
3. Scripts executing before DOM ready

**Prevention**: Correct loading order:
```html
<!-- 1. External libraries first -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>

<!-- 2. Core modules -->
<script src="SubwayRunner/js/core/GameCore.js"></script>
<script src="SubwayRunner/js/levels/LevelManager.js"></script>

<!-- 3. Feature modules -->
<script src="SubwayRunner/js/levels/Level2.js"></script>
<script src="SubwayRunner/js/ui/LevelSelector.js"></script>

<!-- 4. Main game code in script tag or separate file -->
```

## 🏗️ Module System Architecture

### Correct File Structure for Deployment:
```
/public_html/ (Hostinger root)
├── index.html
├── .htaccess
└── SubwayRunner/
    ├── js/
    │   ├── core/
    │   │   └── GameCore.js
    │   ├── levels/
    │   │   ├── LevelManager.js
    │   │   └── Level2.js
    │   └── ui/
    │       └── LevelSelector.js
    ├── sounds/
    ├── css/
    └── assets/
```

### Module Loading Pattern:
```javascript
// Each module should check if GameCore exists
if (window.GameCore) {
    window.GameCore.registerModule('moduleName', ModuleObject);
} else {
    console.error('GameCore not loaded! Check script loading order.');
}
```

## 🔍 Debugging Checklist

1. **Check Network Tab**:
   - All JS files should return 200 OK
   - No 404 errors
   - Correct Content-Type headers

2. **Check Console**:
   - GameCore should initialize first
   - Modules should register in order
   - No undefined errors

3. **Verify Paths**:
   ```javascript
   // Add this debug code temporarily
   console.log('Script paths:', {
       gameCore: document.querySelector('script[src*="GameCore"]')?.src,
       levelManager: document.querySelector('script[src*="LevelManager"]')?.src,
       level2: document.querySelector('script[src*="Level2"]')?.src
   });
   ```

## 🛠️ Quick Fixes

### If modules won't load:
1. **Clear cache**: Ctrl+Shift+R
2. **Check .htaccess**: Ensure it's uploaded to root
3. **Verify deployment**: Check GitHub Actions logs
4. **Test locally**: `python -m http.server 8000`

### If GameCore undefined:
```javascript
// Add safety check in init()
function init() {
    if (typeof GameCore === 'undefined') {
        console.error('GameCore not loaded! Retrying in 100ms...');
        setTimeout(init, 100);
        return;
    }
    // Continue initialization
}
```

## 📝 Best Practices Going Forward

1. **Always test deployment paths locally**:
   ```bash
   # Simulate production structure
   mkdir test-deploy
   cp -r SubwayRunner test-deploy/
   cp SubwayRunner/index.html test-deploy/
   cd test-deploy
   python -m http.server 8000
   ```

2. **Use relative paths with base URL**:
   ```javascript
   const BASE_URL = window.location.hostname === 'localhost' 
       ? '.' 
       : '/SubwayRunner';
   ```

3. **Version your modules**:
   ```javascript
   const MODULE_VERSION = '1.0.0';
   console.log(`Loading Level2 v${MODULE_VERSION}`);
   ```

## 🚀 Deployment Verification

After deployment, check:
- [ ] https://ki-revolution.at/SubwayRunner/js/core/GameCore.js loads
- [ ] No CSP errors in console
- [ ] Game initializes without errors
- [ ] Level 2 can be selected and loaded
- [ ] No 404 errors in Network tab

## 🧲 Magnet Power-Up Visual Effects (KEEP AS IS!)

**STATUS**: The current magnet effects are working perfectly and should be preserved!

### Current Implementation:
- **Visual Effect**: Blue vignette overlay when magnet is active
- **Collection Range**: 2.5 units attraction radius
- **Duration**: 15 seconds for both regular and large magnets
- **Particle Effects**: Attraction particles when collectibles are pulled
- **UI Indicator**: Shows remaining time with golden background

### Code to Preserve:
```javascript
// Magnet attraction logic (lines 3727-3732, 3780-3786)
if (gameState.magnetActive) {
    const magnetRange = 2.5;
    // Attraction calculation and movement
}

// Blue vignette effect (lines 6473-6480)
if (gameState.magnetActive) {
    magnetVignette.classList.add('active');
}
```

**IMPORTANT**: Do not modify the magnet visual effects or attraction behavior - they're working perfectly as implemented!

---

*Created after module integration issues on July 9, 2025*
*Updated with magnet effect preservation notes on July 9, 2025*