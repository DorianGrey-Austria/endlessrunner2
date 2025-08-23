#!/usr/bin/env node

/**
 * AUTOMATED BROWSER TEST for SubwayRunner
 * This script automatically tests if the game starts properly
 * 
 * Usage: node test-live-game.js
 */

const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');

// Start local server
function startServer() {
    console.log('🚀 Starting local server...');
    const server = spawn('python3', ['-m', 'http.server', '8001'], {
        cwd: __dirname,
        detached: false
    });
    
    server.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
        console.log(`Server: ${data}`);
    });
    
    return server;
}

async function testGame() {
    console.log('🎮 SubwayRunner Automated Test\n');
    console.log('================================\n');
    
    // Start server
    const server = startServer();
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let browser;
    try {
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await chromium.launch({
            headless: false, // Set to true for CI/CD
            devtools: true
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Capture console messages
        const consoleMessages = [];
        const errors = [];
        
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push(text);
            
            if (msg.type() === 'error') {
                errors.push(text);
                console.log('❌ ERROR:', text);
            } else if (text.includes('START BUTTON CLICKED')) {
                console.log('🎮', text);
            }
        });
        
        // Navigate to game
        console.log('📍 Loading game at http://localhost:8001...');
        await page.goto('http://localhost:8001', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('✅ Page loaded\n');
        
        // Wait for initial load
        await page.waitForTimeout(3000);
        
        // Check Three.js
        console.log('🔍 Checking Three.js...');
        const threeLoaded = await page.evaluate(() => {
            return typeof THREE !== 'undefined';
        });
        console.log(`Three.js loaded: ${threeLoaded ? '✅' : '❌'}`);
        
        // Check if scene is created
        const sceneExists = await page.evaluate(() => {
            return typeof scene !== 'undefined' && scene !== null;
        });
        console.log(`Scene exists: ${sceneExists ? '✅' : '❌'}`);
        
        // Check for canvas
        const canvasVisible = await page.locator('#gameCanvas').isVisible();
        console.log(`Canvas visible: ${canvasVisible ? '✅' : '❌'}\n`);
        
        // Find start button
        console.log('🔍 Looking for start button...');
        const startButton = await page.locator('button:has-text("Challenge starten!")').first();
        
        if (await startButton.isVisible()) {
            console.log('✅ Start button found!\n');
            
            // Take screenshot before click
            await page.screenshot({ path: 'before-click.png' });
            console.log('📸 Screenshot saved: before-click.png\n');
            
            // Click start button
            console.log('🖱️ Clicking start button...');
            await startButton.click();
            console.log('✅ Button clicked!\n');
            
            // Wait for game to process
            await page.waitForTimeout(2000);
            
            // Check game state
            const gameState = await page.evaluate(() => {
                return {
                    gameStateExists: typeof gameState !== 'undefined',
                    isPlaying: typeof gameState !== 'undefined' && gameState.isPlaying,
                    menuVisible: document.getElementById('menu')?.style.display !== 'none',
                    score: typeof gameState !== 'undefined' ? gameState.score : null
                };
            });
            
            console.log('📊 Game State After Click:');
            console.log(JSON.stringify(gameState, null, 2));
            
            // Take screenshot after click
            await page.screenshot({ path: 'after-click.png' });
            console.log('\n📸 Screenshot saved: after-click.png\n');
            
        } else {
            console.log('❌ Start button not found!\n');
        }
        
        // Check for face tracking
        console.log('🎯 Checking face tracking...');
        const gestureDebug = await page.locator('#gestureDebug').isVisible();
        console.log(`Gesture debug visible: ${gestureDebug ? '✅' : '❌'}`);
        
        if (gestureDebug) {
            const gestureInfo = await page.evaluate(() => {
                const debug = document.getElementById('gestureDebug');
                return debug ? debug.textContent : null;
            });
            console.log('Gesture info:', gestureInfo);
        }
        
        // Report errors
        if (errors.length > 0) {
            console.log('\n⚠️ ERRORS DETECTED:');
            errors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        } else {
            console.log('\n✅ No errors detected!');
        }
        
        // Summary
        console.log('\n================================');
        console.log('TEST SUMMARY:');
        console.log(`- Three.js: ${threeLoaded ? '✅' : '❌'}`);
        console.log(`- Scene: ${sceneExists ? '✅' : '❌'}`);
        console.log(`- Canvas: ${canvasVisible ? '✅' : '❌'}`);
        console.log(`- Errors: ${errors.length === 0 ? '✅ None' : `❌ ${errors.length} errors`}`);
        console.log('================================\n');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        
        // Kill server
        console.log('🛑 Stopping server...');
        server.kill();
        process.exit(0);
    }
}

// Run test
testGame().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});