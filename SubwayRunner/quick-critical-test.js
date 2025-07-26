import { chromium } from '@playwright/test';

async function quickTest() {
    console.log('🚀 Quick critical error test...\n');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    let criticalErrors = 0;
    
    page.on('pageerror', error => {
        const errorText = error.toString();
        if (errorText.includes('isBoxesIntersecting') || 
            errorText.includes('ReferenceError') ||
            errorText.includes('TypeError')) {
            console.log('🔴 CRITICAL ERROR:', errorText);
            criticalErrors++;
        }
    });
    
    await page.goto('http://localhost:8001');
    await page.waitForTimeout(3000);
    
    console.log(`\n✅ Test complete: ${criticalErrors} critical errors found`);
    
    await browser.close();
    process.exit(criticalErrors > 0 ? 1 : 0);
}

quickTest().catch(console.error);