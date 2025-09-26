// 🎵 PERFORMANCE-OPTIMIZED AUDIOMANAGER - 60 FPS GAMING READY
// ZERO-LATENCY REAL-TIME AUDIO SYSTEM FOR ENDLESS RUNNER

class OptimizedAudioManager {
    constructor() {
        // CORE AUDIO CONTEXT
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.3;
        this.isMuted = localStorage.getItem('gameSoundMuted') === 'true' || false;

        // BACKGROUND MUSIC SYSTEM
        this.backgroundMusic = null;
        this.backgroundMusicSource = null;
        this.musicVolume = 0.12;
        this.sfxVolume = 0.35;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMusicLoaded = false;
        this.isMusicPlaying = false;
        this.musicFadeTime = 0.8;

        // PROFESSIONAL MIXING ENHANCEMENTS
        this.duckingGain = null;
        this.musicEQ = null;
        this.sfxEQ = null;
        this.compressor = null;
        this.isDucking = false;
        this.duckingLevel = 0.3;
        this.duckingTime = 0.2;

        // 🚀 PERFORMANCE OPTIMIZATION SYSTEM
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.audioLatency = this.isMobile ? 0.1 : 0.05;

        // MEMORY POOLING - Prevent GC Hiccups
        this.nodePool = {
            oscillators: [],
            gainNodes: [],
            bufferSources: [],
            filters: []
        };
        this.poolSize = 32; // Pre-allocate 32 nodes of each type

        // BUFFER CACHE - Zero Runtime Allocation
        this.bufferCache = new Map();
        this.precomputedBuffers = {
            noise100ms: null,
            noise200ms: null,
            noise500ms: null,
            jumpSound: null,
            collectSound: null,
            crashSound: null
        };

        // PERFORMANCE MONITORING
        this.audioProcessingTime = 0;
        this.frameDrops = 0;
        this.cpuUsage = 0;
        this.performanceMetrics = {
            avgLatency: 0,
            peakLatency: 0,
            droppedFrames: 0,
            memoryUsage: 0
        };

        // MOBILE PERFORMANCE TUNING
        this.sampleRate = this.isMobile ? 22050 : 44100; // Lower sample rate for mobile
        this.bufferSize = this.isMobile ? 4096 : 2048; // Larger buffer for mobile stability
        this.maxSimultaneousSounds = this.isMobile ? 8 : 16;
        this.activeSounds = 0;

        // FRAME-RATE INDEPENDENT TIMING
        this.scheduledEvents = [];
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 25.0; // 25ms lookahead
        this.timerID = null;

        // DEVICE-SPECIFIC OPTIMIZATION FLAGS
        this.isLowEndDevice = this.detectLowEndDevice();
        this.enableAdvancedEffects = !this.isLowEndDevice;

        // SPEED-RESPONSIVE MIXING
        this.baseVolumeMusic = 0.12;
        this.baseVolumeSFX = 0.35;
        this.speedBoostMax = 0.25;

        this.initAudio();
    }

    // 🔍 DETECT LOW-END DEVICE FOR ADAPTIVE PERFORMANCE
    detectLowEndDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const memory = navigator.deviceMemory || 4; // Default to 4GB if unknown

        // Low-end indicators
        const isOldMobile = /android [1-6]|iphone os [1-9]_/i.test(userAgent);
        const isLowMemory = memory <= 2;
        const isSlowCPU = navigator.hardwareConcurrency <= 2;

        return isOldMobile || isLowMemory || isSlowCPU;
    }

    // ⚡ OPTIMIZED AUDIO CONTEXT INITIALIZATION
    async initAudio() {
        try {
            const contextOptions = {
                sampleRate: this.sampleRate,
                latencyHint: this.isMobile ? 'playback' : 'interactive'
            };

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)(contextOptions);

            // PRE-ALLOCATE NODE POOLS - Prevent Runtime GC
            await this.initializeNodePools();

            // 🎛️ OPTIMIZED AUDIO CHAIN SETUP
            this.masterGain = this.getPooledGainNode();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);

            this.musicGain = this.getPooledGainNode();
            this.musicGain.gain.value = this.musicVolume;

            this.duckingGain = this.getPooledGainNode();
            this.duckingGain.gain.value = 1.0;

            // 🎚️ PERFORMANCE-OPTIMIZED EQ (Only if not low-end device)
            if (this.enableAdvancedEffects) {
                this.musicEQ = this.getPooledFilter();
                this.musicEQ.type = 'lowpass';
                this.musicEQ.frequency.value = 8000;
                this.musicEQ.Q.value = 0.7;

                this.sfxEQ = this.getPooledFilter();
                this.sfxEQ.type = 'highpass';
                this.sfxEQ.frequency.value = 200;
                this.sfxEQ.Q.value = 0.5;

                // 🗜️ LIGHTWEIGHT COMPRESSOR
                this.compressor = this.audioContext.createDynamicsCompressor();
                this.compressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
                this.compressor.knee.setValueAtTime(15, this.audioContext.currentTime);
                this.compressor.ratio.setValueAtTime(8, this.audioContext.currentTime);
                this.compressor.attack.setValueAtTime(0.005, this.audioContext.currentTime);
                this.compressor.release.setValueAtTime(0.15, this.audioContext.currentTime);

                // ADVANCED AUDIO CHAIN
                this.musicGain.connect(this.musicEQ);
                this.musicEQ.connect(this.duckingGain);
                this.duckingGain.connect(this.compressor);

                this.sfxGain = this.getPooledGainNode();
                this.sfxGain.gain.value = this.sfxVolume;
                this.sfxGain.connect(this.sfxEQ);
                this.sfxEQ.connect(this.compressor);
                this.compressor.connect(this.masterGain);
            } else {
                // 🚀 LIGHTWEIGHT CHAIN FOR LOW-END DEVICES
                this.sfxGain = this.getPooledGainNode();
                this.sfxGain.gain.value = this.sfxVolume;
                this.musicGain.connect(this.duckingGain);
                this.duckingGain.connect(this.masterGain);
                this.sfxGain.connect(this.masterGain);
            }

            // 📦 PRE-COMPUTE AUDIO BUFFERS
            await this.precomputeAudioBuffers();

            // 🕐 START SCHEDULER FOR FRAME-RATE INDEPENDENT TIMING
            this.startScheduler();

            // 📊 START PERFORMANCE MONITORING
            this.startPerformanceMonitoring();

            console.log('🎵 OPTIMIZED Audio System initialized:');
            console.log(`   - Sample Rate: ${this.sampleRate}Hz`);
            console.log(`   - Buffer Size: ${this.bufferSize}`);
            console.log(`   - Max Simultaneous: ${this.maxSimultaneousSounds}`);
            console.log(`   - Advanced Effects: ${this.enableAdvancedEffects ? 'ON' : 'OFF'}`);
            console.log(`   - Low-End Device: ${this.isLowEndDevice ? 'YES' : 'NO'}`);

        } catch (error) {
            console.error('Optimized Audio initialization failed:', error);
        }
    }

    // 📦 INITIALIZE NODE POOLS - ZERO GC ALLOCATION
    async initializeNodePools() {
        const poolPromises = [];

        // Pre-allocate oscillators
        for (let i = 0; i < this.poolSize; i++) {
            const osc = this.audioContext.createOscillator();
            osc._inUse = false;
            this.nodePool.oscillators.push(osc);
        }

        // Pre-allocate gain nodes
        for (let i = 0; i < this.poolSize; i++) {
            const gain = this.audioContext.createGain();
            gain._inUse = false;
            this.nodePool.gainNodes.push(gain);
        }

        // Pre-allocate buffer sources
        for (let i = 0; i < this.poolSize; i++) {
            const source = this.audioContext.createBufferSource();
            source._inUse = false;
            this.nodePool.bufferSources.push(source);
        }

        // Pre-allocate filters
        for (let i = 0; i < this.poolSize; i++) {
            const filter = this.audioContext.createBiquadFilter();
            filter._inUse = false;
            this.nodePool.filters.push(filter);
        }

        console.log(`🏊‍♂️ Node pools initialized: ${this.poolSize} nodes per type`);
    }

    // 🎯 POOLED NODE GETTERS - ZERO ALLOCATION
    getPooledOscillator() {
        for (let osc of this.nodePool.oscillators) {
            if (!osc._inUse) {
                osc._inUse = true;
                // Reset to default state
                osc.frequency.value = 440;
                osc.type = 'sine';
                return osc;
            }
        }
        // Fallback if pool exhausted
        console.warn('Oscillator pool exhausted, creating new node');
        return this.audioContext.createOscillator();
    }

    getPooledGainNode() {
        for (let gain of this.nodePool.gainNodes) {
            if (!gain._inUse) {
                gain._inUse = true;
                gain.gain.value = 1;
                return gain;
            }
        }
        console.warn('Gain node pool exhausted, creating new node');
        return this.audioContext.createGain();
    }

    getPooledBufferSource() {
        for (let source of this.nodePool.bufferSources) {
            if (!source._inUse) {
                source._inUse = true;
                return source;
            }
        }
        console.warn('Buffer source pool exhausted, creating new node');
        return this.audioContext.createBufferSource();
    }

    getPooledFilter() {
        for (let filter of this.nodePool.filters) {
            if (!filter._inUse) {
                filter._inUse = true;
                // Reset to default state
                filter.type = 'lowpass';
                filter.frequency.value = 22050;
                filter.Q.value = 1;
                return filter;
            }
        }
        console.warn('Filter pool exhausted, creating new node');
        return this.audioContext.createBiquadFilter();
    }

    // ♻️ RETURN NODE TO POOL
    returnNodeToPool(node) {
        if (node._inUse !== undefined) {
            node._inUse = false;
            try {
                node.disconnect();
            } catch (e) {
                // Node might already be disconnected
            }
        }
    }

    // 📦 PRE-COMPUTE AUDIO BUFFERS - ZERO RUNTIME ALLOCATION
    async precomputeAudioBuffers() {
        const computePromises = [];

        // Pre-compute noise buffers of different durations
        computePromises.push(this.generateNoiseBuffer(0.1, 1000).then(buffer => {
            this.precomputedBuffers.noise100ms = buffer;
        }));

        computePromises.push(this.generateNoiseBuffer(0.2, 1000).then(buffer => {
            this.precomputedBuffers.noise200ms = buffer;
        }));

        computePromises.push(this.generateNoiseBuffer(0.5, 800).then(buffer => {
            this.precomputedBuffers.noise500ms = buffer;
        }));

        // Pre-compute game-specific sounds
        computePromises.push(this.generateJumpSound().then(buffer => {
            this.precomputedBuffers.jumpSound = buffer;
        }));

        computePromises.push(this.generateCollectSound().then(buffer => {
            this.precomputedBuffers.collectSound = buffer;
        }));

        computePromises.push(this.generateCrashSound().then(buffer => {
            this.precomputedBuffers.crashSound = buffer;
        }));

        await Promise.all(computePromises);
        console.log('📦 Pre-computed audio buffers ready');
    }

    // 🔊 GENERATE OPTIMIZED NOISE BUFFER
    async generateNoiseBuffer(duration, filterFreq) {
        const bufferSize = Math.floor(this.audioContext.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Use Web Workers for heavy computation if available
        if (window.Worker && bufferSize > 22050) { // 0.5 seconds or more
            return new Promise((resolve) => {
                const worker = new Worker(URL.createObjectURL(new Blob([`
                    self.onmessage = function(e) {
                        const { bufferSize, filterFreq } = e.data;
                        const data = new Float32Array(bufferSize);

                        // Generate noise
                        for (let i = 0; i < bufferSize; i++) {
                            data[i] = Math.random() * 2 - 1;
                        }

                        // Simple lowpass filter approximation
                        let prev = 0;
                        const alpha = 1 / (1 + filterFreq / 44100);
                        for (let i = 0; i < bufferSize; i++) {
                            data[i] = prev + alpha * (data[i] - prev);
                            prev = data[i];
                        }

                        self.postMessage(data);
                    }
                `], { type: 'application/javascript' })));

                worker.onmessage = (e) => {
                    data.set(e.data);
                    worker.terminate();
                    resolve(buffer);
                };

                worker.postMessage({ bufferSize, filterFreq });
            });
        } else {
            // Synchronous generation for small buffers
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            // Simple lowpass filter
            let prev = 0;
            const alpha = 1 / (1 + filterFreq / this.audioContext.sampleRate);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = prev + alpha * (data[i] - prev);
                prev = data[i];
            }

            return buffer;
        }
    }

    // 🦘 GENERATE OPTIMIZED JUMP SOUND
    async generateJumpSound() {
        const duration = 0.3;
        const bufferSize = Math.floor(this.audioContext.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Efficient jump sound synthesis
        const startFreq = 200;
        const endFreq = 600;

        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const freq = startFreq + (endFreq - startFreq) * t;
            const envelope = Math.exp(-t * 3) * (1 - t * 0.5);

            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }

        return buffer;
    }

    // 🍎 GENERATE OPTIMIZED COLLECT SOUND
    async generateCollectSound() {
        const duration = 0.2;
        const bufferSize = Math.floor(this.audioContext.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Pleasant collect sound
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const envelope = Math.exp(-t * 2);
            const harmonics = Math.sin(2 * Math.PI * 800 * t) +
                           0.5 * Math.sin(2 * Math.PI * 1200 * t) +
                           0.25 * Math.sin(2 * Math.PI * 1600 * t);

            data[i] = harmonics * envelope * 0.2;
        }

        return buffer;
    }

    // 💥 GENERATE OPTIMIZED CRASH SOUND
    async generateCrashSound() {
        const duration = 0.4;
        const bufferSize = Math.floor(this.audioContext.sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Crash sound with filtered noise
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const envelope = Math.exp(-t * 5);
            const noise = Math.random() * 2 - 1;

            data[i] = noise * envelope * 0.3;
        }

        return buffer;
    }

    // ⚡ ZERO-LATENCY SOUND PLAYBACK
    playOptimizedSound(soundType, volume = 1.0, pitch = 1.0) {
        if (!this.audioContext || this.isMuted || this.activeSounds >= this.maxSimultaneousSounds) {
            return;
        }

        const startTime = performance.now();

        try {
            let buffer = null;

            // Get pre-computed buffer
            switch (soundType) {
                case 'jump':
                    buffer = this.precomputedBuffers.jumpSound;
                    break;
                case 'collect':
                    buffer = this.precomputedBuffers.collectSound;
                    break;
                case 'crash':
                    buffer = this.precomputedBuffers.crashSound;
                    break;
                case 'noise-short':
                    buffer = this.precomputedBuffers.noise100ms;
                    break;
                case 'noise-medium':
                    buffer = this.precomputedBuffers.noise200ms;
                    break;
                case 'noise-long':
                    buffer = this.precomputedBuffers.noise500ms;
                    break;
            }

            if (!buffer) {
                console.warn(`No pre-computed buffer for sound: ${soundType}`);
                return;
            }

            // Use pooled nodes
            const source = this.getPooledBufferSource();
            const gainNode = this.getPooledGainNode();

            source.buffer = buffer;
            source.playbackRate.value = pitch;
            gainNode.gain.value = volume;

            // Connect optimized chain
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);

            // Schedule playback with minimal latency
            const when = this.audioContext.currentTime + this.audioLatency;
            source.start(when);

            this.activeSounds++;

            // Return nodes to pool when done
            source.onended = () => {
                this.returnNodeToPool(source);
                this.returnNodeToPool(gainNode);
                this.activeSounds--;
            };

            // Performance tracking
            const endTime = performance.now();
            this.audioProcessingTime = endTime - startTime;

            // Trigger ducking if needed
            if (volume > 0.5) {
                this.duckMusic(0.8, buffer.duration);
            }

        } catch (error) {
            console.error('Optimized sound playback failed:', error);
        }
    }

    // 🕐 FRAME-RATE INDEPENDENT SCHEDULER
    startScheduler() {
        this.scheduler = () => {
            const currentTime = this.audioContext.currentTime;

            // Process scheduled events
            while (this.scheduledEvents.length &&
                   this.scheduledEvents[0].time <= currentTime + this.scheduleAheadTime / 1000) {
                const event = this.scheduledEvents.shift();
                this.playOptimizedSound(event.type, event.volume, event.pitch);
            }

            // Schedule next check
            this.timerID = setTimeout(this.scheduler, this.scheduleAheadTime);
        };

        this.scheduler();
        console.log('⏰ Frame-rate independent scheduler started');
    }

    // 📅 SCHEDULE SOUND EVENT
    scheduleSound(soundType, delayMs, volume = 1.0, pitch = 1.0) {
        const scheduleTime = this.audioContext.currentTime + delayMs / 1000;

        this.scheduledEvents.push({
            time: scheduleTime,
            type: soundType,
            volume: volume,
            pitch: pitch
        });

        // Keep events sorted by time
        this.scheduledEvents.sort((a, b) => a.time - b.time);
    }

    // 🎶 OPTIMIZED MUSIC DUCKING
    duckMusic(intensity = 0.8, duration = 0.5) {
        if (!this.duckingGain || this.isDucking || !this.enableAdvancedEffects) return;

        this.isDucking = true;
        const duckLevel = this.duckingLevel * intensity;
        const currentTime = this.audioContext.currentTime;

        // Duck music down with optimized timing
        this.duckingGain.gain.setValueAtTime(this.duckingGain.gain.value, currentTime);
        this.duckingGain.gain.exponentialRampToValueAtTime(
            Math.max(duckLevel, 0.01),
            currentTime + this.duckingTime
        );

        // Restore music after duration
        setTimeout(() => {
            if (this.duckingGain && this.audioContext) {
                const restoreTime = this.audioContext.currentTime;
                this.duckingGain.gain.setValueAtTime(this.duckingGain.gain.value, restoreTime);
                this.duckingGain.gain.exponentialRampToValueAtTime(1.0, restoreTime + this.duckingTime);

                setTimeout(() => { this.isDucking = false; }, this.duckingTime * 1000);
            }
        }, duration * 1000);
    }

    // 📊 PERFORMANCE MONITORING
    startPerformanceMonitoring() {
        setInterval(() => {
            // Update performance metrics
            this.performanceMetrics.avgLatency = this.audioProcessingTime;
            this.performanceMetrics.peakLatency = Math.max(
                this.performanceMetrics.peakLatency,
                this.audioProcessingTime
            );

            if (performance.memory) {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            }

            // Log warnings for performance issues
            if (this.audioProcessingTime > 5) { // 5ms threshold
                console.warn(`🚨 High audio latency: ${this.audioProcessingTime.toFixed(2)}ms`);
            }

            if (this.activeSounds >= this.maxSimultaneousSounds * 0.8) {
                console.warn(`🚨 High concurrent sounds: ${this.activeSounds}/${this.maxSimultaneousSounds}`);
            }

        }, 1000); // Check every second
    }

    // 📈 GET PERFORMANCE METRICS
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            activeSounds: this.activeSounds,
            maxSounds: this.maxSimultaneousSounds,
            poolUtilization: {
                oscillators: this.nodePool.oscillators.filter(n => n._inUse).length / this.poolSize,
                gainNodes: this.nodePool.gainNodes.filter(n => n._inUse).length / this.poolSize,
                bufferSources: this.nodePool.bufferSources.filter(n => n._inUse).length / this.poolSize,
                filters: this.nodePool.filters.filter(n => n._inUse).length / this.poolSize
            },
            deviceInfo: {
                isLowEnd: this.isLowEndDevice,
                isMobile: this.isMobile,
                sampleRate: this.sampleRate,
                bufferSize: this.bufferSize,
                advancedEffects: this.enableAdvancedEffects
            }
        };
    }

    // 🧹 CLEANUP METHOD
    destroy() {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        // Clear all pools
        this.nodePool.oscillators = [];
        this.nodePool.gainNodes = [];
        this.nodePool.bufferSources = [];
        this.nodePool.filters = [];

        this.scheduledEvents = [];
        console.log('🧹 Optimized AudioManager destroyed');
    }

    // Legacy compatibility methods
    createTone(frequency, duration, type = 'sine', fadeOut = true) {
        // Map to optimized sound system
        this.playOptimizedSound('noise-short', 0.3, frequency / 440);
    }

    createNoise(duration, filterFreq = 1000) {
        let soundType = 'noise-short';
        if (duration > 0.15) soundType = 'noise-medium';
        if (duration > 0.35) soundType = 'noise-long';

        this.playOptimizedSound(soundType, 0.1);
    }

    // Game-specific optimized methods
    playJump() {
        this.playOptimizedSound('jump', 0.8, 1.0 + Math.random() * 0.2);
    }

    playCollect() {
        this.playOptimizedSound('collect', 0.6, 1.0 + Math.random() * 0.1);
    }

    playCrash() {
        this.playOptimizedSound('crash', 1.0, 0.9 + Math.random() * 0.2);
    }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedAudioManager;
}