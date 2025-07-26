import { chromium } from '@playwright/test';
import fs from 'fs';

async function captureGameErrors() {
    console.log('🚀 Starting automated error capture test...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture all console messages
    const consoleErrors = [];
    const consoleLogs = [];
    
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
            consoleErrors.push({
                text: text,
                location: msg.location(),
                timestamp: new Date().toISOString()
            });
            console.log('❌ Console Error:', text);
        } else {
            consoleLogs.push({
                type: type,
                text: text,
                timestamp: new Date().toISOString()
            });
            if (text.includes('Error') || text.includes('error')) {
                console.log('⚠️  Log with error:', text);
            }
        }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        consoleErrors.push({
            text: error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.log('🔴 Page Error:', error.toString());
    });
    
    // Capture request failures
    page.on('requestfailed', request => {
        const failure = request.failure();
        consoleErrors.push({
            text: `Request failed: ${request.url()}`,
            error: failure ? failure.errorText : 'Unknown error',
            timestamp: new Date().toISOString()
        });
        console.log('🔴 Request Failed:', request.url(), failure?.errorText);
    });
    
    // Navigate to game
    console.log('📍 Navigating to http://localhost:8001...\n');
    try {
        await page.goto('http://localhost:8001', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
    } catch (error) {
        console.log('⚠️  Navigation warning:', error.message);
    }
    
    // Wait for game to initialize
    console.log('⏳ Waiting for game initialization...\n');
    await page.waitForTimeout(3000);
    
    // Check game state
    const gameState = await page.evaluate(() => {
        return {
            hasGameInstance: typeof window.gameInstance !== 'undefined',
            hasGameState: typeof window.gameState !== 'undefined',
            hasRenderer: window.gameInstance?.renderer ? true : false,
            hasScene: window.gameInstance?.scene ? true : false,
            hasCamera: window.gameInstance?.camera ? true : false,
            documentReady: document.readyState,
            startButton: document.querySelector('.start-button') ? true : false
        };
    });
    
    console.log('📊 Game State Check:');
    console.log('  - Game Instance:', gameState.hasGameInstance ? '✅' : '❌');
    console.log('  - Game State:', gameState.hasGameState ? '✅' : '❌');
    console.log('  - Renderer:', gameState.hasRenderer ? '✅' : '❌');
    console.log('  - Scene:', gameState.hasScene ? '✅' : '❌');
    console.log('  - Camera:', gameState.hasCamera ? '✅' : '❌');
    console.log('  - Document Ready:', gameState.documentReady);
    console.log('  - Start Button:', gameState.startButton ? '✅' : '❌');
    console.log('');
    
    // Try to click start button
    if (gameState.startButton) {
        console.log('🎮 Attempting to start game...\n');
        try {
            await page.click('.start-button');
            await page.waitForTimeout(2000);
            
            // Check if game started
            const isPlaying = await page.evaluate(() => {
                return window.gameInstance?.isPlaying || window.gameState?.isPlaying || false;
            });
            
            console.log('Game started:', isPlaying ? '✅' : '❌');
        } catch (error) {
            console.log('❌ Failed to click start button:', error.message);
        }
    }
    
    // Wait a bit more to catch any runtime errors
    await page.waitForTimeout(3000);
    
    // Generate error report
    console.log('\n📋 ERROR REPORT:');
    console.log('================\n');
    
    if (consoleErrors.length === 0) {
        console.log('✅ No errors detected!\n');
    } else {
        console.log(`❌ Found ${consoleErrors.length} errors:\n`);
        
        // Group errors by message
        const errorGroups = {};
        consoleErrors.forEach(error => {
            const key = error.text;
            if (!errorGroups[key]) {
                errorGroups[key] = {
                    message: error.text,
                    count: 0,
                    firstOccurrence: error.timestamp,
                    location: error.location,
                    stack: error.stack
                };
            }
            errorGroups[key].count++;
        });
        
        // Display grouped errors
        Object.values(errorGroups).forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
            console.log(`   Count: ${error.count} times`);
            if (error.location) {
                console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
            }
            if (error.stack) {
                console.log(`   Stack: ${error.stack.split('\n')[0]}`);
            }
            console.log('');
        });
    }
    
    // Initialize errorGroups for empty case
    const errorGroups = consoleErrors.length === 0 ? {} : (() => {
        const groups = {};
        consoleErrors.forEach(error => {
            const key = error.text;
            if (!groups[key]) {
                groups[key] = {
                    message: error.text,
                    count: 0,
                    firstOccurrence: error.timestamp,
                    location: error.location,
                    stack: error.stack
                };
            }
            groups[key].count++;
        });
        return groups;
    })();
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        url: 'http://localhost:8001',
        gameState: gameState,
        errors: consoleErrors,
        errorSummary: consoleErrors.length > 0 ? Object.values(errorGroups) : [],
        totalErrors: consoleErrors.length
    };
    
    fs.writeFileSync('error-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to error-report.json\n');
    
    // Take screenshot
    await page.screenshot({ path: 'game-state.png', fullPage: true });
    console.log('📸 Screenshot saved to game-state.png\n');
    
    await browser.close();
    
    // Return summary
    return {
        success: consoleErrors.length === 0,
        errorCount: consoleErrors.length,
        errors: consoleErrors.length > 0 ? Object.values(errorGroups) : []
    };
}

// Run the test
captureGameErrors()
    .then(result => {
        console.log('\n🏁 Test completed!');
        if (!result.success) {
            console.log(`\n⚠️  Found ${result.errorCount} errors that need fixing.`);
            process.exit(1);
        } else {
            console.log('\n✅ All tests passed!');
            process.exit(0);
        }
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });