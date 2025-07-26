import { chromium } from '@playwright/test';

async function testStartButton() {
    console.log('🎮 Testing start button functionality...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Error:', msg.text());
        }
    });
    
    // Navigate to game
    console.log('📍 Loading game...');
    await page.goto('http://localhost:8001', {
        waitUntil: 'networkidle'
    });
    
    await page.waitForTimeout(2000);
    
    // Find all buttons
    const buttons = await page.$$('button');
    console.log(`\n📊 Found ${buttons.length} buttons:`);
    
    for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`  ${i + 1}. "${text}"`);
    }
    
    // Check for start button
    const startButton = await page.$('button:has-text("Challenge starten!")');
    if (startButton) {
        console.log('\n✅ Start button found!');
        
        // Get button state
        const buttonInfo = await page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Challenge starten!'));
            if (!btn) return null;
            
            const rect = btn.getBoundingClientRect();
            const computed = window.getComputedStyle(btn);
            
            return {
                text: btn.textContent,
                visible: rect.width > 0 && rect.height > 0,
                display: computed.display,
                position: computed.position,
                zIndex: computed.zIndex,
                clickable: !btn.disabled,
                bounds: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                }
            };
        });
        
        console.log('\n📊 Button Info:', JSON.stringify(buttonInfo, null, 2));
        
        // Try to click
        console.log('\n🖱️  Attempting to click start button...');
        try {
            await startButton.click();
            console.log('✅ Button clicked!');
            
            await page.waitForTimeout(2000);
            
            // Check game state after click
            const gameState = await page.evaluate(() => {
                return {
                    isPlaying: window.gameInstance?.isPlaying,
                    isRunning: window.gameInstance?.isRunning,
                    menuVisible: document.getElementById('startMenu')?.style.display !== 'none'
                };
            });
            
            console.log('\n📊 Game State After Click:', JSON.stringify(gameState, null, 2));
            
        } catch (error) {
            console.log('❌ Failed to click button:', error.message);
        }
    } else {
        console.log('❌ Start button not found!');
        
        // Debug: check menu state
        const menuInfo = await page.evaluate(() => {
            const menu = document.getElementById('startMenu');
            if (!menu) return { exists: false };
            
            return {
                exists: true,
                display: menu.style.display,
                className: menu.className,
                innerHTML: menu.innerHTML.substring(0, 200)
            };
        });
        
        console.log('\n📊 Menu Debug Info:', JSON.stringify(menuInfo, null, 2));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'start-button-test.png' });
    console.log('\n📸 Screenshot saved to start-button-test.png');
    
    await browser.close();
}

testStartButton().catch(console.error);