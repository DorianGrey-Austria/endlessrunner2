import { chromium } from 'playwright';

async function testForErrors() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    // Go to the page
    await page.goto('file://' + process.cwd() + '/index.html');
    
    // Wait for page to load
    await page.waitForTimeout(5000);
    
    // Log errors
    console.log('🔍 TESTING RESULTS:');
    console.log(`Found ${errors.length} errors:`);
    errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
    });
    
    if (errors.length === 0) {
        console.log('✅ NO ERRORS FOUND - READY TO DEPLOY!');
    } else {
        console.log('❌ ERRORS FOUND - MUST FIX BEFORE DEPLOYMENT!');
    }
    
    await browser.close();
    return errors.length === 0;
}

testForErrors().catch(console.error);