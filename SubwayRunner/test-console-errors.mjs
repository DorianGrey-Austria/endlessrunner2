import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testForConsoleErrors() {
    console.log('🧪 Starting Console Error Test...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-web-security']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect all console messages
    const consoleErrors = [];
    const consoleWarnings = [];
    const consoleLogs = [];
    
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
            consoleErrors.push(text);
            console.log(`❌ ERROR: ${text}`);
        } else if (type === 'warning') {
            consoleWarnings.push(text);
            console.log(`⚠️  WARNING: ${text}`);
        } else if (type === 'log' && (text.includes('Spawning') || text.includes('COLLECTED'))) {
            consoleLogs.push(text);
            console.log(`📝 LOG: ${text}`);
        }
    });
    
    // Navigate to local server
    console.log('📂 Loading game from local server...');
    await page.goto('http://localhost:8001/index.html');
    
    // Wait for game to initialize
    console.log('⏳ Waiting for game to initialize...');
    await page.waitForTimeout(5000);
    
    // Start the game
    console.log('🎮 Starting game...');
    const startButton = await page.$('#startButton');
    if (startButton) {
        await startButton.click();
    }
    
    // Play for 30 seconds
    console.log('🕹️ Playing game for 30 seconds...');
    await page.waitForTimeout(30000);
    
    // Take screenshot
    const screenshotPath = join(__dirname, `test-screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Analyze results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(60));
    
    console.log(`\n❌ Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
        consoleErrors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err}`);
        });
    }
    
    console.log(`\n⚠️  Console Warnings: ${consoleWarnings.length}`);
    
    // Check for collectibles
    const kiwiLogs = consoleLogs.filter(log => log.includes('Kiwi') || log.includes('kiwi'));
    const broccoliLogs = consoleLogs.filter(log => log.includes('Broccoli') || log.includes('broccoli'));
    
    console.log(`\n🥝 Kiwis spawned/collected: ${kiwiLogs.length}`);
    console.log(`🥦 Broccolis spawned/collected: ${broccoliLogs.length}`);
    
    // Test verdict
    console.log('\n' + '='.repeat(60));
    const passed = consoleErrors.length === 0 && kiwiLogs.length > 0 && broccoliLogs.length > 0;
    
    if (passed) {
        console.log('✅ TEST PASSED - Ready to deploy!');
        console.log('   - No console errors');
        console.log('   - Kiwis spawning');
        console.log('   - Broccolis spawning');
    } else {
        console.log('❌ TEST FAILED - DO NOT DEPLOY!');
        if (consoleErrors.length > 0) {
            console.log('   - Console errors found');
        }
        if (kiwiLogs.length === 0) {
            console.log('   - No kiwis spawned');
        }
        if (broccoliLogs.length === 0) {
            console.log('   - No broccolis spawned');
        }
    }
    console.log('='.repeat(60));
    
    await browser.close();
    
    // Exit with proper code
    process.exit(passed ? 0 : 1);
}

// Check if local server is running
console.log('🔍 Checking if local server is running...');
fetch('http://localhost:8001')
    .then(() => {
        console.log('✅ Local server is running\n');
        testForConsoleErrors();
    })
    .catch(() => {
        console.error('❌ Local server is NOT running!');
        console.error('Please start server with: python3 -m http.server 8001');
        process.exit(1);
    });