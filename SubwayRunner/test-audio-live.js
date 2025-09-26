const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Collect network requests
    const audioRequests = [];
    page.on('request', request => {
        if (request.url().includes('.mp3') || request.url().includes('.wav') || request.url().includes('sounds/')) {
            audioRequests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('.mp3') || response.url().includes('.wav')) {
            console.log(`Audio file response: ${response.url()} - Status: ${response.status()}`);
        }
    });
    
    console.log('🌐 Testing live site: https://ki-revolution.at/');
    await page.goto('https://ki-revolution.at/', { waitUntil: 'networkidle' });
    
    // Get page title
    const title = await page.title();
    console.log(`\n📱 Page Title: ${title}`);
    
    // Check for audio elements
    const audioInfo = await page.evaluate(() => {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        const hasAudioContext = !!audioContext;
        const audioManager = window.audioManager;
        const hasAudioManager = !!audioManager;
        
        let audioDetails = {
            hasAudioContext,
            hasAudioManager,
            backgroundMusic: false,
            musicVolume: null,
            sfxVolume: null,
            isMusicPlaying: false,
            isMusicLoaded: false
        };
        
        if (audioManager) {
            audioDetails.backgroundMusic = !!audioManager.backgroundMusic;
            audioDetails.musicVolume = audioManager.musicVolume;
            audioDetails.sfxVolume = audioManager.sfxVolume;
            audioDetails.isMusicPlaying = audioManager.isMusicPlaying;
            audioDetails.isMusicLoaded = audioManager.isMusicLoaded;
        }
        
        return audioDetails;
    });
    
    console.log('\n🎵 Audio System Status:');
    console.log(JSON.stringify(audioInfo, null, 2));
    
    console.log('\n🔊 Network Audio Requests:');
    audioRequests.forEach(req => {
        console.log(`- ${req.url}`);
    });
    
    // Wait a bit and start the game
    await page.waitForTimeout(2000);
    
    // Click start button if exists
    const startButton = await page.$('#startButton, button:has-text("Start"), button:has-text("START")');
    if (startButton) {
        console.log('\n🎮 Starting game...');
        await startButton.click();
        await page.waitForTimeout(3000);
        
        // Check audio status after game start
        const gameAudioInfo = await page.evaluate(() => {
            const audioManager = window.audioManager;
            if (audioManager) {
                return {
                    isMusicPlaying: audioManager.isMusicPlaying,
                    backgroundMusicSource: !!audioManager.backgroundMusicSource,
                    musicVolume: audioManager.musicVolume,
                    sfxVolume: audioManager.sfxVolume
                };
            }
            return null;
        });
        
        console.log('\n🎵 Audio Status After Game Start:');
        console.log(JSON.stringify(gameAudioInfo, null, 2));
    }
    
    console.log('\n📋 Relevant Console Logs:');
    consoleLogs.filter(log => 
        log.includes('audio') || 
        log.includes('Audio') || 
        log.includes('music') || 
        log.includes('Music') ||
        log.includes('sound') ||
        log.includes('Sound')
    ).forEach(log => console.log(log));
    
    await browser.close();
})();
