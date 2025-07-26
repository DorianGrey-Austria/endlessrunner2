import { chromium } from '@playwright/test';

async function testLiveVersion() {
    console.log('🌐 Testing LIVE version at https://ki-revolution.at/\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture all errors
    const errors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            const location = msg.location();
            errors.push({
                text,
                url: location.url,
                line: location.lineNumber
            });
            console.log(`❌ Error: ${text}`);
            if (location.url && location.lineNumber) {
                console.log(`   at ${location.url}:${location.lineNumber}`);
            }
        }
    });
    
    page.on('pageerror', error => {
        console.log('🔴 Page Error:', error.toString());
        if (error.stack) {
            console.log('   Stack:', error.stack.split('\n')[0]);
        }
    });
    
    // Navigate to live site
    console.log('📍 Loading https://ki-revolution.at/ ...');
    try {
        await page.goto('https://ki-revolution.at/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
    } catch (error) {
        console.log('⚠️  Navigation error:', error.message);
    }
    
    await page.waitForTimeout(3000);
    
    // Check page state
    const pageState = await page.evaluate(() => {
        return {
            title: document.title,
            hasCanvas: document.querySelector('#gameCanvas') ? true : false,
            hasStartMenu: document.querySelector('#startMenu') ? true : false,
            startMenuDisplay: document.querySelector('#startMenu')?.style.display,
            hasStartButton: document.querySelector('.start-button') ? true : false,
            buttons: [...document.querySelectorAll('button')].map(b => b.textContent),
            gameInstance: typeof window.gameInstance !== 'undefined',
            currentLevel: window.currentLevel,
            threeLoaded: typeof THREE !== 'undefined',
            errorCount: window.errorCount || 0
        };
    });
    
    console.log('\n📊 Page State:');
    console.log(`  Title: ${pageState.title}`);
    console.log(`  Canvas: ${pageState.hasCanvas ? '✅' : '❌'}`);
    console.log(`  Start Menu: ${pageState.hasStartMenu ? '✅' : '❌'} (display: ${pageState.startMenuDisplay})`);
    console.log(`  Start Button: ${pageState.hasStartButton ? '✅' : '❌'}`);
    console.log(`  Game Instance: ${pageState.gameInstance ? '✅' : '❌'}`);
    console.log(`  THREE.js: ${pageState.threeLoaded ? '✅' : '❌'}`);
    console.log(`  Current Level: ${pageState.currentLevel}`);
    console.log(`  Buttons found: ${pageState.buttons.length}`);
    if (pageState.buttons.length > 0) {
        pageState.buttons.forEach((btn, i) => console.log(`    ${i+1}. "${btn}"`));
    }
    
    console.log('\n📋 Error Summary:');
    console.log(`  Total errors: ${errors.length}`);
    
    // Group errors
    const errorGroups = {};
    errors.forEach(error => {
        const key = error.text;
        errorGroups[key] = (errorGroups[key] || 0) + 1;
    });
    
    Object.entries(errorGroups).forEach(([error, count]) => {
        console.log(`  - ${error} (${count}x)`);
    });
    
    // Try to click start button
    console.log('\n🎮 Attempting to start game...');
    try {
        const startButton = await page.$('button:has-text("Challenge starten!")');
        if (startButton) {
            await startButton.click();
            console.log('✅ Button clicked!');
            
            await page.waitForTimeout(2000);
            
            // Check if game started
            const gameStarted = await page.evaluate(() => {
                return {
                    isPlaying: window.gameInstance?.isPlaying,
                    menuHidden: document.querySelector('#startMenu')?.style.display === 'none'
                };
            });
            
            console.log(`\n📊 Game Status:`);
            console.log(`  Playing: ${gameStarted.isPlaying ? '✅' : '❌'}`);
            console.log(`  Menu Hidden: ${gameStarted.menuHidden ? '✅' : '❌'}`);
        }
    } catch (error) {
        console.log('❌ Error clicking button:', error.message);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'live-version-state.png', fullPage: true });
    console.log('\n📸 Screenshot saved to live-version-state.png');
    
    await browser.close();
}

testLiveVersion().catch(console.error);