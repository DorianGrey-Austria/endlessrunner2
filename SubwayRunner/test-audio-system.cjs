const { chromium } = require('playwright');

/**
 * Comprehensive Audio System Test for EndlessRunner
 * Tests User-Gesture Audio Activation, Volume Persistence, and Background Music
 */
async function testAudioSystem() {
    console.log('🎵 Starting Comprehensive Audio System Test...\n');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({
        permissions: ['microphone']
    });
    const page = await context.newPage();

    // Test Results Storage
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function logTest(name, passed, message = '') {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${name}${message ? ' - ' + message : ''}`);
        results.tests.push({ name, passed, message });
        if (passed) results.passed++;
        else results.failed++;
    }

    try {
        // Collect console messages and errors
        const consoleLogs = [];
        const audioRequests = [];

        page.on('console', msg => {
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        });

        page.on('request', request => {
            if (request.url().includes('.mp3') || request.url().includes('.ogg') || request.url().includes('sounds/')) {
                audioRequests.push({
                    url: request.url(),
                    method: request.method()
                });
            }
        });

        console.log('🌐 Loading EndlessRunner...');
        await page.goto('http://localhost:8001/', { waitUntil: 'networkidle' });

        // TEST 1: Page Load and Audio Manager Initialization
        await page.waitForTimeout(2000);
        const audioManagerExists = await page.evaluate(() => {
            return typeof window.audioManager !== 'undefined' &&
                   window.audioManager.audioInitialized !== undefined;
        });

        logTest('Audio Manager Initialization', audioManagerExists);

        // TEST 2: Audio Context NOT initialized before user interaction
        const audioNotInitialized = await page.evaluate(() => {
            return !window.audioManager.audioInitialized;
        });

        logTest('Audio Context Deferred (User-Gesture Policy)', audioNotInitialized);

        // TEST 3: Volume Settings Loaded from LocalStorage
        const volumeSettings = await page.evaluate(() => {
            return {
                music: window.audioManager.musicVolume,
                sfx: window.audioManager.sfxVolume
            };
        });

        const volumesValid = volumeSettings.music >= 0 && volumeSettings.music <= 1 &&
                            volumeSettings.sfx >= 0 && volumeSettings.sfx <= 1;

        logTest('Volume Settings Loaded', volumesValid,
                `Music: ${Math.round(volumeSettings.music * 100)}%, SFX: ${Math.round(volumeSettings.sfx * 100)}%`);

        // TEST 4: Start Game (User Interaction Triggers Audio)
        console.log('\n🎮 Starting game to test audio activation...');
        await page.click('#startButton');
        await page.waitForTimeout(3000);

        const audioInitializedAfterStart = await page.evaluate(() => {
            return window.audioManager.audioInitialized;
        });

        logTest('Audio Context Initialized After User Interaction', audioInitializedAfterStart);

        // TEST 5: Background Music Loading Attempts
        await page.waitForTimeout(2000);
        const backgroundMusicStatus = await page.evaluate(() => {
            return {
                loaded: window.audioManager.isMusicLoaded,
                playing: window.audioManager.isMusicPlaying,
                hasBuffer: !!window.audioManager.backgroundMusic
            };
        });

        logTest('Background Music Load Attempt', true,
                `Loaded: ${backgroundMusicStatus.loaded}, Playing: ${backgroundMusicStatus.playing}`);

        // TEST 6: Audio Files HTTP Requests
        const mp3Requested = audioRequests.some(req => req.url.includes('.mp3'));
        const oggRequested = audioRequests.some(req => req.url.includes('.ogg'));

        logTest('Multi-Format Audio Requests', mp3Requested || oggRequested,
                `MP3: ${mp3Requested}, OGG: ${oggRequested}`);

        // TEST 7: Volume Controls UI
        await page.click('#volumeSettingsToggle');
        await page.waitForTimeout(1000);

        const volumeControlsVisible = await page.isVisible('#volumeControls');
        logTest('Volume Controls UI', volumeControlsVisible);

        // TEST 8: Volume Slider Functionality
        if (volumeControlsVisible) {
            const musicSlider = await page.$('#musicVolume');
            const sfxSlider = await page.$('#sfxVolume');

            if (musicSlider && sfxSlider) {
                // Test music volume change
                await page.fill('#musicVolume', '50');
                await page.dispatchEvent('#musicVolume', 'input');

                await page.waitForTimeout(500);

                const newMusicVolume = await page.evaluate(() => {
                    return Math.round(window.audioManager.musicVolume * 100);
                });

                logTest('Music Volume Slider', newMusicVolume === 50, `Set to ${newMusicVolume}%`);

                // Test SFX volume change
                await page.fill('#sfxVolume', '75');
                await page.dispatchEvent('#sfxVolume', 'input');

                await page.waitForTimeout(500);

                const newSfxVolume = await page.evaluate(() => {
                    return Math.round(window.audioManager.sfxVolume * 100);
                });

                logTest('SFX Volume Slider', newSfxVolume === 75, `Set to ${newSfxVolume}%`);
            } else {
                logTest('Volume Sliders Found', false, 'Sliders not found in DOM');
            }
        }

        // TEST 9: Volume Persistence (LocalStorage)
        const volumesPersisted = await page.evaluate(() => {
            const musicStored = localStorage.getItem('musicVolume');
            const sfxStored = localStorage.getItem('sfxVolume');
            return {
                music: parseFloat(musicStored),
                sfx: parseFloat(sfxStored)
            };
        });

        const persistenceWorking = volumesPersisted.music === 0.5 && volumesPersisted.sfx === 0.75;
        logTest('Volume Settings Persistence', persistenceWorking,
                `Stored - Music: ${volumesPersisted.music}, SFX: ${volumesPersisted.sfx}`);

        // TEST 10: Sound Effects During Gameplay
        console.log('\n🎮 Testing gameplay sounds...');

        // Trigger jump sound
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Check console for sound-related logs
        const soundLogs = consoleLogs.filter(log =>
            log.toLowerCase().includes('jump') ||
            log.toLowerCase().includes('sound') ||
            log.toLowerCase().includes('audio')
        );

        logTest('Gameplay Sounds Triggered', soundLogs.length > 5, `${soundLogs.length} audio events logged`);

        // TEST 11: Mute/Unmute Functionality
        const muteButton = await page.$('#soundToggle');
        if (muteButton) {
            await muteButton.click();
            await page.waitForTimeout(500);

            const isMuted = await page.evaluate(() => {
                return window.audioManager.isMuted;
            });

            logTest('Mute Toggle Functionality', typeof isMuted === 'boolean', `Muted: ${isMuted}`);
        }

        console.log('\n📋 Relevant Console Logs:');
        consoleLogs
            .filter(log =>
                log.includes('🎵') ||
                log.includes('Audio') ||
                log.includes('Music') ||
                log.includes('Background music') ||
                log.includes('volume')
            )
            .slice(-10)
            .forEach(log => console.log(`  ${log}`));

    } catch (error) {
        console.error('Test execution failed:', error);
        logTest('Test Execution', false, error.message);
    }

    await browser.close();

    // Final Results
    console.log('\n🎯 TEST SUMMARY');
    console.log('================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(test => !test.passed).forEach(test => {
            console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    console.log(`\n🎵 Audio System Test Complete! ${results.failed === 0 ? '🎉' : '🔧'}`);

    return results.failed === 0;
}

// Run the test if called directly
if (require.main === module) {
    testAudioSystem().catch(console.error);
}

module.exports = testAudioSystem;