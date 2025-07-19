#!/usr/bin/env node

/**
 * DEEP SELF-TEST: Dashboard Values & Game Logic Validation
 * Tests the actual dashboard values and game mechanics
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

async function deepSelfTest() {
    console.log('🧪 DEEP SELF-TEST: Starting comprehensive validation...');
    
    // Start local server
    console.log('🚀 Starting local server on port 8003...');
    const server = spawn('python3', ['-m', 'http.server', '8003'], {
        stdio: 'pipe'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let browser;
    try {
        // Launch browser in headless mode for self-testing
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Monitor console for errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Console Error:', msg.text());
            }
        });
        
        console.log('📱 Loading game...');
        await page.goto('http://localhost:8003', { waitUntil: 'networkidle0' });
        
        // Wait for game to initialize
        await page.waitForTimeout(2000);
        
        // TEST 1: Check for console errors
        if (errors.length > 0) {
            console.log('❌ SELF-TEST FAILED: Console errors detected');
            console.log('   Errors:', errors);
            return false;
        }
        console.log('✅ TEST 1: No console errors during initialization');
        
        // TEST 2: Check if dashboard elements exist
        const dashboardExists = await page.evaluate(() => {
            return {
                toggleButton: !!document.getElementById('dashboardToggle'),
                dashboard: !!document.getElementById('balanceDashboard'),
                forceSpawnBtn: !!document.querySelector('button[onclick="forceSpawnCollectible()"]'),
                balanceRatio: !!document.getElementById('balanceRatio')
            };
        });
        
        if (!dashboardExists.toggleButton || !dashboardExists.dashboard) {
            console.log('❌ SELF-TEST FAILED: Dashboard elements missing');
            console.log('   Missing:', dashboardExists);
            return false;
        }
        console.log('✅ TEST 2: Dashboard elements exist');
        
        // TEST 3: Open dashboard and check initial values
        await page.click('#dashboardToggle');
        await page.waitForTimeout(500);
        
        const dashboardValues = await page.evaluate(() => {
            return {
                balanceRatio: document.getElementById('balanceRatio')?.textContent || 'missing',
                spawnSuccess: document.getElementById('spawnSuccess')?.textContent || 'missing',
                collectibleCounts: document.getElementById('collectibleCounts')?.textContent || 'missing',
                gameStatus: document.getElementById('gameStatus')?.textContent || 'missing'
            };
        });
        
        console.log('📊 DASHBOARD VALUES:');
        console.log('   Balance Ratio:', dashboardValues.balanceRatio);
        console.log('   Spawn Success:', dashboardValues.spawnSuccess);
        console.log('   Collectible Counts:', dashboardValues.collectibleCounts);
        console.log('   Game Status:', dashboardValues.gameStatus);
        
        if (dashboardValues.balanceRatio === 'missing' || dashboardValues.spawnSuccess === 'missing') {
            console.log('❌ SELF-TEST FAILED: Dashboard values not populated');
            return false;
        }
        console.log('✅ TEST 3: Dashboard values populated');
        
        // TEST 4: Start game and monitor for 5 seconds
        await page.click('button:has-text("Spiel starten")');
        await page.waitForTimeout(1000);
        
        console.log('🎮 Game started - monitoring collectibles for 5 seconds...');
        
        let maxCollectibles = 0;
        let maxObstacles = 0;
        
        for (let i = 0; i < 5; i++) {
            await page.waitForTimeout(1000);
            
            const gameState = await page.evaluate(() => {
                return {
                    kiwis: window.gameState?.kiwis?.length || 0,
                    broccolis: window.gameState?.broccolis?.length || 0,
                    obstacles: window.obstacles?.length || 0,
                    isPlaying: window.gameState?.isPlaying || false,
                    collectedKiwis: window.gameState?.collectedKiwis || 0,
                    collectedBroccolis: window.gameState?.collectedBroccolis || 0
                };
            });
            
            maxCollectibles = Math.max(maxCollectibles, gameState.kiwis + gameState.broccolis);
            maxObstacles = Math.max(maxObstacles, gameState.obstacles);
            
            console.log(`⏱️  ${i+1}s: Kiwis=${gameState.kiwis}, Broccolis=${gameState.broccolis}, Obstacles=${gameState.obstacles}, Playing=${gameState.isPlaying}`);
        }
        
        // TEST 5: Validate collectible spawning
        if (maxCollectibles === 0) {
            console.log('❌ SELF-TEST FAILED: No collectibles spawned in 5 seconds');
            return false;
        }
        console.log('✅ TEST 4: Collectibles are spawning');
        
        // TEST 6: Test Force Spawn functionality
        const beforeForceSpawn = await page.evaluate(() => {
            return (window.gameState?.kiwis?.length || 0) + (window.gameState?.broccolis?.length || 0);
        });
        
        await page.click('button:has-text("Force Spawn")');
        await page.waitForTimeout(500);
        
        const afterForceSpawn = await page.evaluate(() => {
            return (window.gameState?.kiwis?.length || 0) + (window.gameState?.broccolis?.length || 0);
        });
        
        if (afterForceSpawn <= beforeForceSpawn) {
            console.log('❌ SELF-TEST FAILED: Force spawn not working');
            console.log(`   Before: ${beforeForceSpawn}, After: ${afterForceSpawn}`);
            return false;
        }
        console.log('✅ TEST 5: Force spawn functionality works');
        
        // TEST 7: Check balance ratio
        const finalDashboardValues = await page.evaluate(() => {
            return {
                balanceRatio: document.getElementById('balanceRatio')?.textContent || 'missing',
                obstacleCount: window.dashboardStats?.obstacleCount || 0,
                collectibleCount: window.dashboardStats?.collectibleCount || 0
            };
        });
        
        console.log('📈 FINAL BALANCE CHECK:');
        console.log('   Dashboard Ratio:', finalDashboardValues.balanceRatio);
        console.log('   Obstacles Spawned:', finalDashboardValues.obstacleCount);
        console.log('   Collectibles Spawned:', finalDashboardValues.collectibleCount);
        
        // Calculate ratio
        const total = finalDashboardValues.obstacleCount + finalDashboardValues.collectibleCount;
        if (total > 0) {
            const collectiblePercentage = (finalDashboardValues.collectibleCount / total * 100).toFixed(1);
            console.log(`   ACTUAL RATIO: ${collectiblePercentage}% Collectibles`);
            
            if (parseFloat(collectiblePercentage) < 20) {
                console.log('⚠️  WARNING: Collectible ratio too low');
            } else {
                console.log('✅ TEST 6: Balance ratio acceptable');
            }
        }
        
        console.log('🎉 DEEP SELF-TEST COMPLETED SUCCESSFULLY!');
        console.log('   ✅ No console errors');
        console.log('   ✅ Dashboard functional'); 
        console.log('   ✅ Collectibles spawning');
        console.log('   ✅ Force spawn working');
        console.log('   ✅ Game mechanics operational');
        
        return true;
        
    } catch (error) {
        console.log('❌ DEEP SELF-TEST FAILED:', error.message);
        return false;
    } finally {
        if (browser) await browser.close();
        server.kill();
        console.log('🔌 Server stopped');
    }
}

// Run the test
deepSelfTest().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
});