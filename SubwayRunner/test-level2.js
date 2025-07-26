import { chromium } from '@playwright/test';

async function testLevel2() {
    console.log('🎮 Testing Level 2 functionality...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture errors
    page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('404')) {
            console.log('❌ Error:', msg.text());
        } else if (msg.text().includes('Level') || msg.text().includes('level')) {
            console.log('📍 Level message:', msg.text());
        }
    });
    
    // Navigate to game
    console.log('📍 Loading game...');
    await page.goto('http://localhost:8001', {
        waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // Start game
    console.log('\n🎮 Starting game...');
    const startButton = await page.$('button:has-text("Challenge starten!")');
    if (startButton) {
        await startButton.click();
        console.log('✅ Game started!\n');
        
        // Give 1000 points to trigger level 2
        console.log('🎯 Adding 1000 points to trigger Level 2...');
        await page.evaluate(() => {
            window.gameInstance.score = 1000;
            window.gameInstance.scoreQueue = 0;
            // Manually trigger level check
            window.checkLevelProgression();
        });
        
        // Wait for score processing
        await page.waitForTimeout(500);
        
        // Check game state
        const gameState = await page.evaluate(() => {
            return {
                score: window.gameInstance?.score,
                currentLevel: window.currentLevel,
                level2Loaded: window.levels && window.levels[2] ? true : false,
                fogColor: window.scene?.fog?.color?.getHex()
            };
        });
        
        console.log('\n📊 Game State:');
        console.log(`  Score: ${gameState.score}`);
        console.log(`  Current Level: ${gameState.currentLevel}`);
        console.log(`  Level 2 Available: ${gameState.level2Loaded ? '✅' : '❌'}`);
        console.log(`  Fog Color: 0x${gameState.fogColor?.toString(16) || 'none'}`);
        
        // Take screenshot
        await page.screenshot({ path: 'level2-test.png' });
        console.log('\n📸 Screenshot saved to level2-test.png');
        
        // Wait to see level transition
        await page.waitForTimeout(3000);
        
        // Check for level 2 objects
        const level2Objects = await page.evaluate(() => {
            const objects = [];
            window.scene?.children.forEach(child => {
                if (child.userData?.type === 'cyberpunkBuilding' || 
                    child.userData?.type === 'level2Grid') {
                    objects.push(child.userData.type);
                }
            });
            return objects;
        });
        
        console.log('\n🏗️  Level 2 Objects:', level2Objects.length > 0 ? level2Objects.join(', ') : 'None found');
        
    } else {
        console.log('❌ Start button not found!');
    }
    
    await browser.close();
}

testLevel2().catch(console.error);