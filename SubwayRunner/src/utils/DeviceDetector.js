/**
 * DeviceDetector - Detects device capabilities and determines optimal quality settings
 */
class DeviceDetector {
    constructor() {
        this.deviceInfo = null;
        this.qualityLevel = 'medium';
        this.performanceProfile = null;
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = false;
        
        // Performance thresholds
        this.performanceThresholds = {
            high: { ram: 8, gpu: 'high', cpu: 'high' },
            medium: { ram: 4, gpu: 'medium', cpu: 'medium' },
            low: { ram: 2, gpu: 'low', cpu: 'low' }
        };
        
        this.init();
    }

    /**
     * Initialize device detection
     */
    init() {
        this.detectDevice();
        this.detectPerformance();
        this.determineQualityLevel();
        
        console.log('📱 Device Detection:', {
            device: this.deviceInfo,
            quality: this.qualityLevel,
            performance: this.performanceProfile
        });
    }

    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const screen = window.screen;
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Device type detection
        this.isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        this.isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || 
                       (screen.width >= 768 && screen.height >= 1024);
        this.isDesktop = !this.isMobile && !this.isTablet;
        
        // Specific device detection
        const isIOS = /iphone|ipad|ipod/i.test(userAgent);
        const isAndroid = /android/i.test(userAgent);
        const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
        const isChrome = /chrome/i.test(userAgent);
        const isFirefox = /firefox/i.test(userAgent);
        
        // Screen information
        const screenWidth = screen.width;
        const screenHeight = screen.height;
        const availableWidth = screen.availWidth;
        const availableHeight = screen.availHeight;
        
        // Memory detection (if available)
        const memoryInfo = navigator.deviceMemory || this.estimateMemory();
        
        // GPU detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const gpuInfo = gl ? this.getGPUInfo(gl) : null;
        
        this.deviceInfo = {
            type: this.isMobile ? 'mobile' : (this.isTablet ? 'tablet' : 'desktop'),
            platform: isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop'),
            browser: isChrome ? 'chrome' : (isSafari ? 'safari' : (isFirefox ? 'firefox' : 'unknown')),
            screen: {
                width: screenWidth,
                height: screenHeight,
                availableWidth,
                availableHeight,
                pixelRatio
            },
            memory: memoryInfo,
            gpu: gpuInfo,
            userAgent
        };
    }

    /**
     * Estimate device memory if not available
     */
    estimateMemory() {
        const screenPixels = window.screen.width * window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Rough estimation based on screen size and pixel ratio
        if (screenPixels > 2000000 && pixelRatio > 2) {
            return 6; // High-end device
        } else if (screenPixels > 1000000 && pixelRatio > 1.5) {
            return 4; // Mid-range device
        } else {
            return 2; // Low-end device
        }
    }

    /**
     * Get GPU information
     */
    getGPUInfo(gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
        
        // GPU tier estimation
        let tier = 'medium';
        const rendererLower = renderer.toLowerCase();
        
        if (rendererLower.includes('adreno 6') || 
            rendererLower.includes('mali-g7') || 
            rendererLower.includes('apple a') ||
            rendererLower.includes('geforce') ||
            rendererLower.includes('radeon')) {
            tier = 'high';
        } else if (rendererLower.includes('adreno 5') || 
                  rendererLower.includes('mali-g') ||
                  rendererLower.includes('intel')) {
            tier = 'medium';
        } else {
            tier = 'low';
        }
        
        return {
            vendor,
            renderer,
            tier,
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
        };
    }

    /**
     * Detect performance capabilities
     */
    detectPerformance() {
        const memory = this.deviceInfo.memory;
        const gpuTier = this.deviceInfo.gpu?.tier || 'medium';
        const screenPixels = this.deviceInfo.screen.width * this.deviceInfo.screen.height;
        const pixelRatio = this.deviceInfo.screen.pixelRatio;
        
        // CPU estimation based on device type and other factors
        let cpuTier = 'medium';
        
        if (this.isDesktop) {
            cpuTier = 'high';
        } else if (this.isTablet) {
            cpuTier = memory > 4 ? 'high' : 'medium';
        } else if (this.isMobile) {
            cpuTier = memory > 6 ? 'high' : (memory > 3 ? 'medium' : 'low');
        }
        
        // Performance score calculation
        let performanceScore = 0;
        
        // Memory score (0-40 points)
        performanceScore += Math.min(40, memory * 5);
        
        // GPU score (0-30 points)
        const gpuScore = gpuTier === 'high' ? 30 : (gpuTier === 'medium' ? 20 : 10);
        performanceScore += gpuScore;
        
        // CPU score (0-30 points)
        const cpuScore = cpuTier === 'high' ? 30 : (cpuTier === 'medium' ? 20 : 10);
        performanceScore += cpuScore;
        
        // Screen resolution penalty for high-res screens
        if (screenPixels > 2000000) {
            performanceScore -= 10;
        }
        if (pixelRatio > 2) {
            performanceScore -= 5;
        }
        
        this.performanceProfile = {
            memory,
            gpu: gpuTier,
            cpu: cpuTier,
            score: performanceScore,
            screenPixels,
            pixelRatio
        };
    }

    /**
     * Determine optimal quality level
     */
    determineQualityLevel() {
        const score = this.performanceProfile.score;
        
        if (score >= 80) {
            this.qualityLevel = 'high';
        } else if (score >= 50) {
            this.qualityLevel = 'medium';
        } else {
            this.qualityLevel = 'low';
        }
        
        // Override for specific cases
        if (this.isMobile && this.performanceProfile.memory < 3) {
            this.qualityLevel = 'low';
        }
        
        if (this.isDesktop && this.performanceProfile.gpu === 'high') {
            this.qualityLevel = 'high';
        }
    }

    /**
     * Get quality settings for current device
     */
    getQualitySettings() {
        const baseSettings = {
            high: {
                pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                shadowMapSize: 2048,
                shadowsEnabled: true,
                antialiasing: true,
                textureQuality: 1.0,
                particleCount: 100,
                lightCount: 8,
                fogEnabled: true,
                postProcessing: true,
                lodDistance: 100,
                cullingDistance: 200
            },
            medium: {
                pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
                shadowMapSize: 1024,
                shadowsEnabled: true,
                antialiasing: true,
                textureQuality: 0.8,
                particleCount: 50,
                lightCount: 4,
                fogEnabled: true,
                postProcessing: false,
                lodDistance: 75,
                cullingDistance: 150
            },
            low: {
                pixelRatio: 1,
                shadowMapSize: 512,
                shadowsEnabled: false,
                antialiasing: false,
                textureQuality: 0.5,
                particleCount: 25,
                lightCount: 2,
                fogEnabled: false,
                postProcessing: false,
                lodDistance: 50,
                cullingDistance: 100
            }
        };
        
        return baseSettings[this.qualityLevel];
    }

    /**
     * Get device-specific optimizations
     */
    getOptimizations() {
        const optimizations = {
            mobile: {
                maxFPS: 30,
                adaptiveQuality: true,
                powerSaving: true,
                simplifiedShaders: true,
                reducedParticles: true,
                compressedTextures: true
            },
            tablet: {
                maxFPS: 45,
                adaptiveQuality: true,
                powerSaving: false,
                simplifiedShaders: false,
                reducedParticles: false,
                compressedTextures: true
            },
            desktop: {
                maxFPS: 60,
                adaptiveQuality: false,
                powerSaving: false,
                simplifiedShaders: false,
                reducedParticles: false,
                compressedTextures: false
            }
        };
        
        return optimizations[this.deviceInfo.type];
    }

    /**
     * Check if device meets minimum requirements
     */
    meetsMinimumRequirements() {
        const requirements = {
            webgl: true,
            memory: 1, // GB
            screenWidth: 320,
            screenHeight: 480
        };
        
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        
        return (
            hasWebGL &&
            this.deviceInfo.memory >= requirements.memory &&
            this.deviceInfo.screen.width >= requirements.screenWidth &&
            this.deviceInfo.screen.height >= requirements.screenHeight
        );
    }

    /**
     * Get performance monitoring configuration
     */
    getPerformanceMonitoring() {
        return {
            enabled: true,
            fpsTarget: this.getOptimizations().maxFPS,
            qualityAdjustment: this.getOptimizations().adaptiveQuality,
            thermalThrottling: this.isMobile,
            batteryAware: this.isMobile,
            memoryTracking: true
        };
    }

    /**
     * Get device info summary
     */
    getDeviceInfo() {
        return {
            ...this.deviceInfo,
            qualityLevel: this.qualityLevel,
            performanceProfile: this.performanceProfile,
            qualitySettings: this.getQualitySettings(),
            optimizations: this.getOptimizations(),
            meetsRequirements: this.meetsMinimumRequirements()
        };
    }
}

// Make class available globally
window.DeviceDetector = DeviceDetector;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
}