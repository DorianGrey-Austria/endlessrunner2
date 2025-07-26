import { chromium } from '@playwright/test';

async function findExportError() {
    console.log('🔍 Searching for export error...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track all script errors
    const scriptErrors = [];
    
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            const location = msg.location();
            console.log('❌ Error:', text);
            if (location.url && location.lineNumber) {
                console.log('   Location:', location.url + ':' + location.lineNumber);
            }
        }
    });
    
    // Listen for page errors (uncaught exceptions)
    page.on('pageerror', error => {
        console.log('🔴 Page Error:', error.toString());
        if (error.stack) {
            const stackLines = error.stack.split('\n');
            stackLines.forEach(line => {
                if (line.includes('http://localhost:8001')) {
                    console.log('   Stack:', line.trim());
                }
            });
        }
    });
    
    // Listen for response errors
    page.on('response', response => {
        if (!response.ok() && response.url().includes('localhost:8001')) {
            console.log('❌ Failed to load:', response.url(), response.status());
        }
    });
    
    console.log('📍 Loading page...\n');
    await page.goto('http://localhost:8001', {
        waitUntil: 'domcontentloaded'
    });
    
    // Wait a bit for errors to appear
    await page.waitForTimeout(2000);
    
    // Try to get more info about the export error
    const errorInfo = await page.evaluate(() => {
        // Check if any scripts failed to load
        const scripts = Array.from(document.querySelectorAll('script'));
        const moduleScripts = scripts.filter(s => s.type === 'module');
        
        return {
            totalScripts: scripts.length,
            moduleScripts: moduleScripts.length,
            scriptSrcs: scripts.map(s => s.src).filter(Boolean),
            inlineModules: moduleScripts.filter(s => !s.src).length
        };
    });
    
    console.log('\n📊 Script Analysis:');
    console.log('  Total scripts:', errorInfo.totalScripts);
    console.log('  Module scripts:', errorInfo.moduleScripts);
    console.log('  Inline modules:', errorInfo.inlineModules);
    console.log('  External scripts:', errorInfo.scriptSrcs);
    
    // Check the HTML content around common export locations
    const htmlContent = await page.content();
    const lines = htmlContent.split('\n');
    
    console.log('\n🔍 Searching for export statements...');
    lines.forEach((line, index) => {
        if (line.includes('export')) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
    });
    
    await browser.close();
}

findExportError().catch(console.error);