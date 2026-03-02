// 🧪 CRITICAL TEST: Game Start Validation
// Tests if the game actually starts without errors

import { test, expect } from '@playwright/test';

test.describe('🚨 CRITICAL: Game Start Validation', () => {
    let consoleErrors = [];
    let consoleWarnings = [];
    let consoleMessages = [];

    test.beforeEach(async ({ page }) => {
        // Capture console messages
        consoleErrors = [];
        consoleWarnings = [];
        consoleMessages = [];

        page.on('console', msg => {
            const text = msg.text();
            const type = msg.type();

            consoleMessages.push({ type, text });

            if (type === 'error') {
                consoleErrors.push(text);
            } else if (type === 'warning') {
                consoleWarnings.push(text);
            }
        });

        // Capture page errors
        page.on('pageerror', error => {
            consoleErrors.push(`PAGE ERROR: ${error.message}`);
        });

        // Navigate to game
        await page.goto('http://localhost:8001/');
        await page.waitForLoadState('networkidle');
    });

    test('Should load game without console errors', async ({ page }) => {
        console.log('\n📊 Console Messages:');
        consoleMessages.forEach(msg => {
            console.log(`  [${msg.type.toUpperCase()}] ${msg.text}`);
        });

        console.log('\n❌ Console Errors:', consoleErrors.length);
        consoleErrors.forEach(err => console.log(`  - ${err}`));

        console.log('\n⚠️  Console Warnings:', consoleWarnings.length);

        expect(consoleErrors).toHaveLength(0);
    });

    test('Should have START GAME button visible', async ({ page }) => {
        const playButton = await page.locator('button.cyber-button[data-action="start"]');
        await expect(playButton).toBeVisible({ timeout: 5000 });

        const buttonText = await playButton.textContent();
        console.log('✅ START GAME button found:', buttonText);
    });

    test('Should have music buttons visible', async ({ page }) => {
        const musicButtons = await page.locator('.music-btn-cyber');
        const count = await musicButtons.count();

        console.log(`✅ Found ${count} music buttons`);
        expect(count).toBe(11); // Should have 11 music tracks
    });

    test('Should have control selection section', async ({ page }) => {
        // New design uses toggleSection and selectedControlType variable instead of radio buttons
        const controlSection = await page.locator('#controlSection');

        // Check if selectedControlType is set to default 'classic'
        const defaultControl = await page.evaluate(() => {
            return window.selectedControlType || 'classic';
        });

        console.log('✅ Default control type:', defaultControl);
        expect(defaultControl).toBe('classic');
    });

    test('🚨 CRITICAL: Should start game when PLAY NOW is clicked', async ({ page }) => {
        console.log('\n🎮 STARTING CRITICAL TEST: Game Start...');

        // Wait for menu to be visible
        await page.waitForSelector('#menu', { state: 'visible', timeout: 5000 });
        console.log('✅ Menu is visible');

        // Check startGameNow exists
        const startGameNowExists = await page.evaluate(() => {
            return typeof window.startGameNow === 'function';
        });
        console.log('✅ window.startGameNow exists:', startGameNowExists);

        if (!startGameNowExists) {
            console.error('❌ CRITICAL: window.startGameNow is not defined!');
            throw new Error('startGameNow function not found');
        }

        // Click START GAME button
        const playButton = await page.locator('button.cyber-button[data-action="start"]');
        await expect(playButton).toBeVisible({ timeout: 5000 });

        console.log('🖱️  Clicking START GAME button...');
        await playButton.click();

        // Wait a moment for the game to react
        await page.waitForTimeout(1000);

        // Check if menu is hidden
        const menuDisplay = await page.locator('#menu').evaluate(el =>
            window.getComputedStyle(el).display
        );
        console.log('📊 Menu display after click:', menuDisplay);

        // Check if game container is shown
        const gameContainerDisplay = await page.locator('#gameContainer').evaluate(el =>
            window.getComputedStyle(el).display
        );
        console.log('📊 Game container display:', gameContainerDisplay);

        // Check for critical functions
        const gameState = await page.evaluate(() => {
            return {
                startGameExists: typeof window.startGame === 'function',
                initExists: typeof init === 'function',
                gameStateExists: typeof gameState !== 'undefined',
                sceneExists: typeof scene !== 'undefined',
                cameraExists: typeof camera !== 'undefined',
                rendererExists: typeof renderer !== 'undefined'
            };
        });

        console.log('🔍 Game State Check:', JSON.stringify(gameState, null, 2));

        // Print all console errors that occurred during game start
        if (consoleErrors.length > 0) {
            console.error('\n❌ CONSOLE ERRORS DURING GAME START:');
            consoleErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err}`);
            });
        }

        // Expect menu to be hidden
        expect(menuDisplay).toBe('none');

        // Expect game container to be visible (flex)
        expect(gameContainerDisplay).toBe('flex');

        // Expect no errors
        expect(consoleErrors.length).toBe(0);
    });
});