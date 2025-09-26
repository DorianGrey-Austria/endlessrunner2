// 🎯 AUDIO PERFORMANCE CONFIGURATION
// Device-specific optimizations for 60 FPS gaming

const AudioPerformanceConfig = {
    // 📱 MOBILE OPTIMIZATION PROFILES
    mobile: {
        low: {
            sampleRate: 22050,
            bufferSize: 8192,
            maxSounds: 6,
            enableEQ: false,
            enableCompressor: false,
            poolSize: 16,
            scheduleAheadTime: 50
        },
        medium: {
            sampleRate: 22050,
            bufferSize: 4096,
            maxSounds: 8,
            enableEQ: true,
            enableCompressor: false,
            poolSize: 24,
            scheduleAheadTime: 35
        },
        high: {
            sampleRate: 44100,
            bufferSize: 2048,
            maxSounds: 12,
            enableEQ: true,
            enableCompressor: true,
            poolSize: 32,
            scheduleAheadTime: 25
        }
    },

    // 💻 DESKTOP OPTIMIZATION PROFILES
    desktop: {
        low: {
            sampleRate: 44100,
            bufferSize: 2048,
            maxSounds: 12,
            enableEQ: true,
            enableCompressor: true,
            poolSize: 32,
            scheduleAheadTime: 20
        },
        medium: {
            sampleRate: 44100,
            bufferSize: 1024,
            maxSounds: 16,
            enableEQ: true,
            enableCompressor: true,
            poolSize: 48,
            scheduleAheadTime: 15
        },
        high: {
            sampleRate: 48000,
            bufferSize: 512,
            maxSounds: 24,
            enableEQ: true,
            enableCompressor: true,
            poolSize: 64,
            scheduleAheadTime: 10
        }
    },

    // 🔧 PERFORMANCE THRESHOLDS
    thresholds: {
        latencyWarning: 5,     // ms
        latencyCritical: 10,   // ms
        memoryWarning: 50,     // MB
        memoryCritical: 100,   // MB
        cpuWarning: 15,        // %
        cpuCritical: 25,       // %
        frameDropWarning: 2,   // frames
        frameDropCritical: 5   // frames
    },

    // 🎮 GAME-SPECIFIC AUDIO MAPPING
    sounds: {
        jump: {
            priority: 'high',
            volume: 0.8,
            pitchVariation: 0.2,
            maxConcurrent: 3
        },
        collect: {
            priority: 'medium',
            volume: 0.6,
            pitchVariation: 0.1,
            maxConcurrent: 5
        },
        crash: {
            priority: 'critical',
            volume: 1.0,
            pitchVariation: 0.2,
            maxConcurrent: 1,
            duckingIntensity: 0.9
        },
        ambient: {
            priority: 'low',
            volume: 0.3,
            pitchVariation: 0.0,
            maxConcurrent: 2
        }
    },

    // 🎛️ MIXING PARAMETERS
    mixing: {
        duckingLevels: {
            subtle: 0.8,
            moderate: 0.5,
            aggressive: 0.3
        },
        compressorSettings: {
            light: {
                threshold: -18,
                ratio: 4,
                attack: 0.005,
                release: 0.1
            },
            medium: {
                threshold: -24,
                ratio: 8,
                attack: 0.003,
                release: 0.15
            },
            heavy: {
                threshold: -30,
                ratio: 12,
                attack: 0.002,
                release: 0.2
            }
        },
        eqSettings: {
            music: {
                type: 'lowpass',
                frequency: 8000,
                Q: 0.7
            },
            sfx: {
                type: 'highpass',
                frequency: 200,
                Q: 0.5
            }
        }
    }
};

// 🔍 AUTO-DETECT OPTIMAL CONFIGURATION
function detectOptimalAudioConfig() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    // Device capability detection
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    // Performance indicators
    const isHighEnd = deviceMemory >= 8 && hardwareConcurrency >= 8;
    const isMediumEnd = deviceMemory >= 4 && hardwareConcurrency >= 4;

    let profile;

    if (isMobile) {
        if (isHighEnd) profile = AudioPerformanceConfig.mobile.high;
        else if (isMediumEnd) profile = AudioPerformanceConfig.mobile.medium;
        else profile = AudioPerformanceConfig.mobile.low;
    } else {
        if (isHighEnd) profile = AudioPerformanceConfig.desktop.high;
        else if (isMediumEnd) profile = AudioPerformanceConfig.desktop.medium;
        else profile = AudioPerformanceConfig.desktop.low;
    }

    console.log('🎯 Optimal audio configuration detected:', {
        device: isMobile ? 'mobile' : 'desktop',
        performance: isHighEnd ? 'high' : isMediumEnd ? 'medium' : 'low',
        profile: profile
    });

    return profile;
}

// 📊 PERFORMANCE MONITORING CONFIGURATION
const PerformanceMonitorConfig = {
    monitoringInterval: 1000, // ms

    metrics: {
        audioLatency: true,
        memoryUsage: true,
        cpuUsage: false, // Requires additional APIs
        frameRate: true,
        concurrentSounds: true,
        poolUtilization: true
    },

    alerts: {
        enabled: true,
        console: true,
        ui: false // Can be enabled for debug UI
    },

    // 📈 Adaptive adjustments
    adaptiveSettings: {
        enabled: true,
        adjustmentThreshold: 3, // Consecutive warnings before adjustment
        adjustments: {
            reduceQuality: {
                disableEQ: true,
                disableCompressor: true,
                reduceSampleRate: true,
                increaseBufferSize: true,
                reduceMaxSounds: true
            },
            restoreQuality: {
                enableEQ: true,
                enableCompressor: true,
                restoreSampleRate: true,
                reduceBufferSize: true,
                increaseMaxSounds: true
            }
        }
    }
};

// 🧪 BENCHMARKING TOOLS
const AudioBenchmark = {
    // Run audio system benchmark
    async runBenchmark(audioManager) {
        console.log('🧪 Starting audio performance benchmark...');

        const results = {
            latency: [],
            memoryUsage: [],
            concurrentSounds: 0,
            bufferUnderruns: 0,
            testDuration: 10000 // 10 seconds
        };

        const startTime = performance.now();
        const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

        // Test 1: Latency measurement
        for (let i = 0; i < 100; i++) {
            const testStart = performance.now();
            audioManager.playOptimizedSound('jump', 0.1);
            const latency = performance.now() - testStart;
            results.latency.push(latency);

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Test 2: Concurrent sounds stress test
        const concurrentTest = async () => {
            const sounds = [];
            for (let i = 0; i < 20; i++) {
                sounds.push(new Promise(resolve => {
                    audioManager.playOptimizedSound('collect', 0.5);
                    setTimeout(resolve, 100);
                }));
                results.concurrentSounds++;
            }
            await Promise.all(sounds);
        };

        await concurrentTest();

        const endTime = performance.now();
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

        // Calculate results
        results.avgLatency = results.latency.reduce((a, b) => a + b, 0) / results.latency.length;
        results.maxLatency = Math.max(...results.latency);
        results.minLatency = Math.min(...results.latency);
        results.memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // MB
        results.totalTime = endTime - startTime;

        console.log('🏆 Benchmark Results:', results);
        return results;
    },

    // Performance recommendations based on benchmark
    getRecommendations(results) {
        const recommendations = [];

        if (results.avgLatency > 5) {
            recommendations.push('Consider increasing buffer size');
            recommendations.push('Reduce sample rate for mobile devices');
        }

        if (results.memoryIncrease > 10) {
            recommendations.push('Reduce node pool size');
            recommendations.push('Implement more aggressive buffer recycling');
        }

        if (results.concurrentSounds < 10) {
            recommendations.push('Audio system may have concurrency limitations');
            recommendations.push('Consider reducing max simultaneous sounds');
        }

        return recommendations;
    }
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioPerformanceConfig,
        detectOptimalAudioConfig,
        PerformanceMonitorConfig,
        AudioBenchmark
    };
}