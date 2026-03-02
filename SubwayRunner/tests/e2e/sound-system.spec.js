// 🔊 SOUND SYSTEM VERIFICATION
// Tests AudioManager initialization and sound generation

import { test, expect } from '@playwright/test';

test.describe('🔊 Sound System Tests', () => {
    let consoleErrors = [];
    let consoleMessages = [];

    test.beforeEach(async ({ page }) => {
        consoleErrors = [];
        consoleMessages = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({ type: msg.type(), text });
            if (msg.type() === 'error') {
                consoleErrors.push(text);
            }
        });

        page.on('pageerror', error => {
            consoleErrors.push(error.message);
        });
    });

    test('🎵 AudioManager initializes correctly', async ({ page }) => {
        console.log('\n🔍 Testing AudioManager initialization...\n');

        await page.goto('http://localhost:8001/index.html.V4.3-BALANCED.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Check if AudioContext is available
        const audioInfo = await page.evaluate(() => {
            return {
                hasAudioContext: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
                hasAudioManager: typeof audioManager !== 'undefined',
                audioManagerType: typeof audioManager
            };
        });

        console.log('✅ Audio Info:', JSON.stringify(audioInfo, null, 2));
        expect(audioInfo.hasAudioContext).toBe(true);
    });

    test('🎹 Music select options are available', async ({ page }) => {
        console.log('\n🔍 Testing music selection...\n');

        await page.goto('http://localhost:8001/index.html.V4.3-BALANCED.html');
        await page.waitForSelector('#menu', { timeout: 10000 });

        // Get music select options
        const musicOptions = await page.evaluate(() => {
            const select = document.getElementById('musicSelect');
            if (!select) return { error: 'No select element' };

            const options = Array.from(select.options).map(opt => ({
                value: opt.value,
                text: opt.text,
                selected: opt.selected
            }));

            return { options, selectedValue: select.value };
        });

        console.log('✅ Music Options:', JSON.stringify(musicOptions, null, 2));

        expect(musicOptions.options).toBeDefined();
        expect(musicOptions.options.length).toBeGreaterThan(0);

        // Check for expected music types
        const values = musicOptions.options.map(o => o.value);
        expect(values).toContain('none');
        expect(values).toContain('electronic');
    });

    test('🎧 Sound functions exist in game code', async ({ page }) => {
        console.log('\n🔍 Testing sound function availability...\n');

        await page.goto('http://localhost:8001/index.html.V4.3-BALANCED.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(2000);

        // Check for sound-related functions
        const soundFunctions = await page.evaluate(() => {
            return {
                hasCreateTone: typeof audioManager !== 'undefined' &&
                    typeof audioManager.createTone === 'function',
                hasPlaySound: typeof audioManager !== 'undefined' &&
                    typeof audioManager.playSound === 'function',
                audioManagerExists: typeof audioManager !== 'undefined'
            };
        });

        console.log('✅ Sound Functions:', JSON.stringify(soundFunctions, null, 2));

        // AudioManager should exist (initialized in game code)
        expect(soundFunctions.audioManagerExists).toBe(true);
    });

    test('🔇 No sound-related errors during game start', async ({ page }) => {
        console.log('\n🔍 Testing sound system during game start...\n');

        await page.goto('http://localhost:8001/index.html.V4.3-BALANCED.html');
        await page.waitForSelector('canvas', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Start the game
        const startButton = page.locator('button:has-text("SPIELEN")');
        await startButton.click();
        await page.waitForTimeout(2000);

        // Filter for sound-related errors
        const soundErrors = consoleErrors.filter(err =>
            err.toLowerCase().includes('audio') ||
            err.toLowerCase().includes('sound') ||
            err.toLowerCase().includes('oscillator')
        );

        if (soundErrors.length > 0) {
            console.error('❌ Sound Errors:', soundErrors);
        } else {
            console.log('✅ No sound-related errors');
        }

        expect(soundErrors.length).toBe(0);
    });
});
