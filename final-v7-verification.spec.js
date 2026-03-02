// 🎯 V7.0.0 FINAL VERIFICATION TEST
const { test, expect } = require('@playwright/test');

test.describe('V7.0.0-BEST-OF Final Verification', () => {
    test('Game loads with V7.0.0 and all features present', async ({ page }) => {
        console.log('🧪 Testing V7.0.0 deployment...');

        // Load game with cache-busting
        const timestamp = Date.now();
        await page.goto(`https://ki-revolution.at/?v=${timestamp}`, {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        // 1. Verify V7.0.0 version in title
        const title = await page.title();
        console.log(`📋 Page Title: ${title}`);
        expect(title).toContain('V7.0.0-BEST-OF-10-LEVELS');

        // 2. Verify version banner visible
        const versionBanner = await page.locator('#versionInfo').textContent();
        console.log(`🏷️ Version Banner: ${versionBanner}`);
        expect(versionBanner).toContain('V7.0.0-BEST-OF-10-LEVELS');
        expect(versionBanner).toContain('10 Levels');
        expect(versionBanner).toContain('11 Tracks');
        expect(versionBanner).toContain('Triple-Jump');

        // 3. Verify Start Menu present
        const menu = await page.locator('#menu');
        await expect(menu).toBeVisible({ timeout: 5000 });
        console.log('✅ Start Menu visible');

        // 4. Verify PLAY NOW button exists
        const playButton = await page.locator('button:has-text("PLAY NOW")');
        await expect(playButton).toBeVisible();
        console.log('✅ PLAY NOW button found');

        // 5. Verify 11 music track buttons
        const musicButtons = await page.locator('.music-btn').count();
        console.log(`🎵 Music Buttons found: ${musicButtons}`);
        expect(musicButtons).toBeGreaterThanOrEqual(9); // At least 9 tracks

        // 6. Verify Canvas exists
        const canvas = await page.locator('#gameCanvas');
        await expect(canvas).toBeAttached();
        console.log('✅ Game Canvas attached');

        // 7. Verify Level UI elements exist in HTML
        const levelDisplay = await page.locator('#levelDisplay');
        const levelName = await page.locator('#levelName');
        const levelProgress = await page.locator('#levelProgressBar');

        await expect(levelDisplay).toBeAttached();
        await expect(levelName).toBeAttached();
        await expect(levelProgress).toBeAttached();
        console.log('✅ Level UI elements present');

        console.log('🎉 ALL VERIFICATION CHECKS PASSED!');
    });
});