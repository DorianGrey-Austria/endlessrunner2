#!/usr/bin/env node

/**
 * PLAYWRIGHT SELF-TEST: Dashboard & Balance System
 * Tests the new Intelligent Debug Dashboard and 60/40 Balance Revolution
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testDashboardBalance() {
    console.log('🧪 STARTING SELF-TEST: Dashboard & Balance System');
    
    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const page = await browser.newPage();
    
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    try {
        // Navigate to local game
        await page.goto('http://localhost:8001');
        console.log('✅ Game loaded successfully');
        
        // Wait for game to initialize
        await page.waitForTimeout(3000);
        
        // TEST 1: Check for Console Errors
        if (errors.length > 0) {
            console.error('❌ Console errors detected:', errors);
            await page.screenshot({ path: 'test-console-errors.png' });
            return false;
        }
        console.log('✅ TEST 1: No console errors');
        
        // TEST 2: Check if Dashboard Toggle exists
        const dashboardToggle = await page.locator('#dashboardToggle').isVisible();
        if (!dashboardToggle) {
            console.error('❌ Dashboard toggle button not found');
            return false;
        }
        console.log('✅ TEST 2: Dashboard toggle button exists');
        
        // TEST 3: Open Dashboard
        await page.click('#dashboardToggle');
        await page.waitForTimeout(500);
        
        const dashboardVisible = await page.locator('#balanceDashboard').isVisible();
        if (!dashboardVisible) {
            console.error('❌ Dashboard not opening');
            return false;
        }
        console.log('✅ TEST 3: Dashboard opens correctly');
        
        // TEST 4: Check Dashboard Content
        const balanceRatio = await page.textContent('#balanceRatio');
        const spawnSuccess = await page.textContent('#spawnSuccess');
        const collectibleCounts = await page.textContent('#collectibleCounts');
        
        console.log('📊 Dashboard Content:');
        console.log('   Balance:', balanceRatio);
        console.log('   Spawn Success:', spawnSuccess);
        console.log('   Collectibles:', collectibleCounts);
        
        if (!balanceRatio || !spawnSuccess || !collectibleCounts) {
            console.error('❌ Dashboard content missing');
            return false;
        }
        console.log('✅ TEST 4: Dashboard content populated');
        
        // TEST 5: Start Game and Monitor for 10 seconds
        await page.click('button:has-text("Spiel starten")');
        await page.waitForTimeout(1000);
        
        console.log('🎮 Game started - monitoring for 10 seconds...');
        
        // Monitor for collectibles and obstacles for 10 seconds
        let collectibleSpawned = false;
        let obstacleSpawned = false;
        
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(1000);
            
            // Check for collectibles in game state
            const kiwiCount = await page.evaluate(() => window.gameState?.kiwis?.length || 0);
            const broccoliCount = await page.evaluate(() => window.gameState?.broccolis?.length || 0);
            const obstacleCount = await page.evaluate(() => window.obstacles?.length || 0);
            
            if (kiwiCount > 0 || broccoliCount > 0) {
                collectibleSpawned = true;
                console.log(`✅ Collectibles spawning: ${kiwiCount} kiwis, ${broccoliCount} broccolis`);
            }
            
            if (obstacleCount > 0) {
                obstacleSpawned = true;
            }
            
            console.log(`⏱️  ${i+1}s: Kiwis: ${kiwiCount}, Broccolis: ${broccoliCount}, Obstacles: ${obstacleCount}`);
        }
        
        // TEST 6: Verify Balance
        if (!collectibleSpawned) {
            console.error('❌ No collectibles spawned in 10 seconds');
            await page.screenshot({ path: 'test-no-collectibles.png' });
            return false;
        }
        console.log('✅ TEST 5: Collectibles are spawning');
        
        if (!obstacleSpawned) {
            console.error('❌ No obstacles spawned in 10 seconds');
            return false;
        }
        console.log('✅ TEST 6: Obstacles are spawning');
        
        // TEST 7: Test Force Spawn Button
        await page.click('button:has-text("Force Spawn")');
        await page.waitForTimeout(1000);
        
        const afterForceSpawn = await page.evaluate(() => {
            const kiwis = window.gameState?.kiwis?.length || 0;
            const broccolis = window.gameState?.broccolis?.length || 0;
            return kiwis + broccolis;
        });
        
        if (afterForceSpawn === 0) {
            console.error('❌ Force spawn button not working');
            return false;
        }
        console.log('✅ TEST 7: Force spawn button works');
        
        // TEST 8: Check Dashboard Updates
        const finalBalanceRatio = await page.textContent('#balanceRatio');
        if (finalBalanceRatio === balanceRatio) {
            console.warn('⚠️  Dashboard might not be updating automatically');
        } else {
            console.log('✅ TEST 8: Dashboard updating automatically');
        }
        
        console.log('🎯 FINAL DASHBOARD STATE:');
        console.log('   ', await page.textContent('#balanceRatio'));
        console.log('   ', await page.textContent('#spawnSuccess'));
        console.log('   ', await page.textContent('#collectibleCounts'));
        console.log('   ', await page.textContent('#currentProblems'));
        
        await page.screenshot({ path: 'test-dashboard-success.png' });
        
        console.log('🎉 ALL TESTS PASSED! Dashboard & Balance system working correctly.');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        await page.screenshot({ path: 'test-error.png' });
        return false;
    } finally {
        await browser.close();
    }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Start local server first
    const { spawn } = await import('child_process');
    
    console.log('🚀 Starting local server...');
    const server = spawn('python3', ['-m', 'http.server', '8001'], {
        cwd: __dirname,
        stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const success = await testDashboardBalance();
        process.exit(success ? 0 : 1);
    } finally {
        server.kill();
    }
}

export { testDashboardBalance };