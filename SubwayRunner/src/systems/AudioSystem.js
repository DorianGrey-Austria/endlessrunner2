/**
 * AudioSystem - Handles all audio functionality including background music and sound effects
 */
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.backgroundMusic = null;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.isInitialized = false;
        this.isMusicPlaying = false;
        this.musicTracks = [];
        this.currentTrackIndex = 0;
        this.soundEffects = {};
        
        // Auto-initialize
        this.init();
    }

    /**
     * Initialize audio system
     */
    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Define music paths
            const musicPaths = [
                '/sounds/background/subway-theme.wav',
                '/sounds/background/background.wav',
                '/sounds/background/game-music.wav'
            ];
            
            // Load background music
            await this.loadBackgroundMusic(musicPaths);
            
            this.isInitialized = true;
            console.log('✅ AudioSystem initialized successfully');
        } catch (error) {
            console.error('❌ AudioSystem initialization failed:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Load background music tracks
     */
    async loadBackgroundMusic(paths) {
        for (const path of paths) {
            try {
                const audio = new Audio(path);
                
                // Set up promise for loading
                const loadPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Audio load timeout: ${path}`));
                    }, 5000);
                    
                    audio.addEventListener('canplaythrough', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                    
                    audio.addEventListener('error', (e) => {
                        clearTimeout(timeout);
                        reject(e);
                    });
                });
                
                // Configure audio
                audio.volume = this.musicVolume;
                audio.loop = true;
                audio.preload = 'auto';
                
                // Start loading
                audio.load();
                
                // Wait for load or timeout
                await loadPromise;
                
                this.musicTracks.push(audio);
                console.log(`✅ Music loaded: ${path}`);
                
            } catch (error) {
                console.warn(`⚠️ Could not load music: ${path}`, error);
            }
        }
        
        if (this.musicTracks.length === 0) {
            console.warn('⚠️ No music tracks loaded');
        }
    }

    /**
     * Play background music
     */
    async playBackgroundMusic() {
        if (!this.isInitialized || this.musicTracks.length === 0) {
            console.warn('⚠️ AudioSystem not ready or no music tracks available');
            return false;
        }
        
        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Stop current music if playing
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
            }
            
            // Start new track
            this.backgroundMusic = this.musicTracks[this.currentTrackIndex];
            this.backgroundMusic.volume = 0; // Start silent for fade-in
            
            await this.backgroundMusic.play();
            this.isMusicPlaying = true;
            
            // Fade in music
            this.fadeInMusic();
            
            console.log(`🎵 Playing background music: Track ${this.currentTrackIndex}`);
            return true;
            
        } catch (error) {
            console.error('❌ Could not play background music:', error);
            this.isMusicPlaying = false;
            return false;
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.fadeOutMusic(1000, () => {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
                this.isMusicPlaying = false;
                console.log('🎵 Background music stopped');
            });
        }
    }

    /**
     * Fade in background music
     */
    fadeInMusic(duration = 2000) {
        if (!this.backgroundMusic) return;
        
        const startVolume = 0;
        const endVolume = this.musicVolume;
        const steps = 20;
        const stepDuration = duration / steps;
        const volumeStep = (endVolume - startVolume) / steps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + (volumeStep * currentStep);
            this.backgroundMusic.volume = Math.min(newVolume, endVolume);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.backgroundMusic.volume = endVolume;
            }
        }, stepDuration);
    }

    /**
     * Fade out background music
     */
    fadeOutMusic(duration = 1000, callback = null) {
        if (!this.backgroundMusic) return;
        
        const startVolume = this.backgroundMusic.volume;
        const steps = 20;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume - (volumeStep * currentStep);
            this.backgroundMusic.volume = Math.max(newVolume, 0);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.backgroundMusic.volume = 0;
                if (callback) callback();
            }
        }, stepDuration);
    }

    /**
     * Switch to next music track
     */
    nextTrack() {
        if (this.musicTracks.length > 1) {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
            if (this.isMusicPlaying) {
                this.playBackgroundMusic();
            }
        }
    }

    /**
     * Play sound effect
     */
    playSoundEffect(frequency, duration = 200, type = 'sine') {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
            
        } catch (error) {
            console.warn('⚠️ Could not play sound effect:', error);
        }
    }

    /**
     * Play jump sound
     */
    playJumpSound() {
        this.playSoundEffect(440, 150, 'sine');
    }

    /**
     * Play collision sound
     */
    playCollisionSound() {
        this.playSoundEffect(200, 300, 'sawtooth');
    }

    /**
     * Play collect sound
     */
    playCollectSound() {
        this.playSoundEffect(800, 100, 'sine');
    }

    /**
     * Play power-up sound
     */
    playPowerUpSound() {
        this.playSoundEffect(600, 200, 'triangle');
    }

    /**
     * Play level complete sound
     */
    playLevelCompleteSound() {
        // Play ascending notes
        setTimeout(() => this.playSoundEffect(523, 200), 0);   // C5
        setTimeout(() => this.playSoundEffect(659, 200), 100); // E5
        setTimeout(() => this.playSoundEffect(784, 200), 200); // G5
        setTimeout(() => this.playSoundEffect(1047, 400), 300); // C6
    }

    /**
     * Play game over sound
     */
    playGameOverSound() {
        // Play descending notes
        setTimeout(() => this.playSoundEffect(523, 200), 0);   // C5
        setTimeout(() => this.playSoundEffect(493, 200), 100); // B4
        setTimeout(() => this.playSoundEffect(440, 200), 200); // A4
        setTimeout(() => this.playSoundEffect(392, 400), 300); // G4
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    /**
     * Set sound effects volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Mute all audio
     */
    muteAll() {
        this.setMusicVolume(0);
        this.setSfxVolume(0);
    }

    /**
     * Unmute all audio
     */
    unmuteAll() {
        this.setMusicVolume(0.7);
        this.setSfxVolume(0.8);
    }

    /**
     * Check if audio is ready
     */
    isReady() {
        return this.isInitialized && this.musicTracks.length > 0;
    }

    /**
     * Get audio status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isMusicPlaying: this.isMusicPlaying,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            tracksLoaded: this.musicTracks.length,
            currentTrack: this.currentTrackIndex
        };
    }

    /**
     * Dispose of audio resources
     */
    dispose() {
        this.stopBackgroundMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.musicTracks.forEach(track => {
            track.pause();
            track.src = '';
        });
        
        this.musicTracks = [];
        this.soundEffects = {};
        this.isInitialized = false;
        
        console.log('🗑️ AudioSystem disposed');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}