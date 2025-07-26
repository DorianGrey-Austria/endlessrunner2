import { chromium } from '@playwright/test';

async function traceExportError() {
    console.log('🔍 Tracing export error with network analysis...\n');
    
    const browser = await chromium.launch({
        headless: false,
        devtools: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Track all script loads
    const scriptLoads = [];
    
    // Intercept script responses
    page.on('response', async response => {
        const url = response.url();
        if (url.endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
            const status = response.status();
            let content = '';
            
            try {
                if (status === 200) {
                    content = await response.text();
                    // Check for export statements
                    if (content.includes('export ')) {
                        console.log(`⚠️  Found 'export' in: ${url}`);
                        const lines = content.split('\n');
                        lines.forEach((line, index) => {
                            if (line.includes('export ')) {
                                console.log(`   Line ${index + 1}: ${line.trim().substring(0, 100)}...`);
                            }
                        });
                    }
                }
            } catch (e) {
                // Ignore errors reading response
            }
            
            scriptLoads.push({
                url,
                status,
                hasExport: content.includes('export ')
            });
        }
    });
    
    // Track console errors with stack traces
    page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('export')) {
            console.log('❌ Export Error:', msg.text());
            const location = msg.location();
            if (location.url) {
                console.log('   URL:', location.url);
                console.log('   Line:', location.lineNumber);
            }
        }
    });
    
    // Track page errors
    page.on('pageerror', error => {
        if (error.toString().includes('export')) {
            console.log('🔴 Page Error:', error.toString());
            if (error.stack) {
                console.log('   Stack trace:');
                error.stack.split('\n').slice(0, 5).forEach(line => {
                    console.log('   ', line);
                });
            }
        }
    });
    
    console.log('📍 Loading page...\n');
    await page.goto('http://localhost:8001', {
        waitUntil: 'domcontentloaded'
    });
    
    await page.waitForTimeout(2000);
    
    console.log('\n📊 Script Load Summary:');
    scriptLoads.forEach(script => {
        console.log(`${script.status === 200 ? '✅' : '❌'} ${script.url}`);
        if (script.hasExport) {
            console.log('   ⚠️  Contains export statements!');
        }
    });
    
    // Check inline scripts
    const inlineScripts = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script:not([src])'));
        return scripts.map((script, index) => {
            const content = script.textContent || '';
            const hasExport = content.includes('export ');
            let exportLine = null;
            
            if (hasExport) {
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('export ')) {
                        exportLine = { 
                            lineNumber: i + 1, 
                            content: lines[i].trim().substring(0, 100) 
                        };
                        break;
                    }
                }
            }
            
            return {
                index,
                type: script.type || 'text/javascript',
                hasExport,
                exportLine,
                length: content.length
            };
        });
    });
    
    console.log('\n📜 Inline Scripts:');
    inlineScripts.forEach(script => {
        console.log(`Script ${script.index + 1}: Type=${script.type}, Length=${script.length}`);
        if (script.hasExport && script.exportLine) {
            console.log(`   ⚠️  Export found at line ${script.exportLine.lineNumber}: ${script.exportLine.content}`);
        }
    });
    
    await browser.close();
}

traceExportError().catch(console.error);