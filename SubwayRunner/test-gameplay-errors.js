import { chromium } from '@playwright/test';

async function testGameplayErrors() {
    console.log('🎮 Testing gameplay and capturing errors...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    
    // Capture all errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            const location = msg.location();
            errors.push({
                text,
                url: location.url,
                line: location.lineNumber,
                timestamp: new Date().toISOString()
            });
            
            // Only log non-404 errors
            if (!text.includes('404')) {
                console.log(`❌ Error: ${text}`);
                if (location.url && location.lineNumber) {
                    console.log(`   at ${location.url}:${location.lineNumber}`);
                }
            }
        }
    });
    
    page.on('pageerror', error => {
        console.log('🔴 Page Error:', error.toString());
        if (error.stack) {
            const relevantLines = error.stack.split('\n')
                .filter(line => line.includes('localhost:8001'))
                .slice(0, 3);
            relevantLines.forEach(line => console.log('   ', line.trim()));
        }
    });
    
    // Navigate to game
    console.log('📍 Loading game...');
    await page.goto('http://localhost:8001', {
        waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // Start the game
    console.log('\n🎮 Starting game...');
    const startButton = await page.$('button:has-text("Challenge starten!")');
    if (startButton) {
        await startButton.click();
        console.log('✅ Game started!\n');
        
        // Wait for game to run and capture errors
        console.log('⏳ Monitoring game for 5 seconds...\n');
        await page.waitForTimeout(5000);
        
        // Analyze errors
        const non404Errors = errors.filter(e => !e.text.includes('404'));
        const currentTimeErrors = errors.filter(e => e.text.includes('currentTime'));
        
        console.log('\n📊 Error Summary:');
        console.log(`  Total errors: ${errors.length}`);
        console.log(`  Non-404 errors: ${non404Errors.length}`);
        console.log(`  CurrentTime errors: ${currentTimeErrors.length}`);
        
        if (currentTimeErrors.length > 0) {
            console.log('\n🔍 CurrentTime Error Details:');
            const firstError = currentTimeErrors[0];
            console.log(`  Message: ${firstError.text}`);
            console.log(`  Location: ${firstError.url}:${firstError.line}`);
            console.log(`  Count: ${currentTimeErrors.length} occurrences`);
        }
        
        // Check game state
        const gameState = await page.evaluate(() => {
            return {
                isPlaying: window.gameInstance?.isPlaying,
                score: window.gameInstance?.score,
                speed: window.gameInstance?.speed,
                animationFrame: typeof window.gameInstance?.animationFrame !== 'undefined'
            };
        });
        
        console.log('\n📊 Game State:', JSON.stringify(gameState, null, 2));
        
    } else {
        console.log('❌ Start button not found!');
    }
    
    await browser.close();
}

testGameplayErrors().catch(console.error);