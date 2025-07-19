#!/usr/bin/env node

/**
 * EMERGENCY SELF-TEST: Real Browser Console Error Detection
 * Actually loads the page in a real browser environment
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

async function emergencySelfTest() {
    console.log('🚨 EMERGENCY SELF-TEST: Starting real browser test...');
    
    // Start local server
    const server = spawn('python3', ['-m', 'http.server', '8007'], {
        stdio: 'pipe'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Collect console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ CONSOLE ERROR:', msg.text());
            }
        });
        
        // Load the page
        console.log('📱 Loading game page...');
        await page.goto('http://localhost:8007', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        // Wait for game initialization
        await page.waitForTimeout(3000);
        
        console.log('\n📊 SELF-TEST RESULTS:');
        console.log('======================');
        
        if (errors.length === 0) {
            console.log('✅ NO CONSOLE ERRORS - Game should work!');
        } else {
            console.log(`❌ ${errors.length} CONSOLE ERRORS FOUND:`);
            errors.forEach((error, i) => {
                console.log(`   ${i+1}. ${error}`);
            });
        }
        
        // Check if game elements exist
        const gameElements = await page.evaluate(() => {
            return {
                canvas: !!document.getElementById('gameCanvas'),
                dashboardToggle: !!document.getElementById('dashboardToggle'),
                startButton: !!document.querySelector('button:contains("Spiel starten")'),
                threeJS: typeof window.THREE !== 'undefined',
                gameState: typeof window.gameState !== 'undefined'
            };
        });
        
        console.log('\n🔍 GAME ELEMENTS CHECK:');
        console.log('========================');
        Object.entries(gameElements).forEach(([key, value]) => {
            console.log(`${value ? '✅' : '❌'} ${key}: ${value}`);
        });
        
        return errors.length === 0;
        
    } catch (error) {
        console.log('❌ SELF-TEST FAILED:', error.message);
        return false;
    } finally {
        if (browser) await browser.close();
        server.kill();
    }
}

// Check if puppeteer is available
try {
    require.resolve('puppeteer');
    emergencySelfTest().then(success => {
        console.log(`\n🎯 FINAL RESULT: ${success ? 'PASS' : 'FAIL'}`);
        process.exit(success ? 0 : 1);
    });
} catch (e) {
    console.log('❌ Puppeteer not installed - using basic check');
    console.log('💡 Install with: npm install puppeteer');
    process.exit(1);
}