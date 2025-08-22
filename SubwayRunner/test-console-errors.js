#!/usr/bin/env node
/**
 * Automatisches Console Error Testing für SubwayRunner
 * Nutzt Playwright um Browser-Fehler automatisch zu erfassen
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class BrowserErrorTester {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.logs = [];
        this.startTime = Date.now();
    }

    async testLocalVersion(port = 8001) {
        console.log('🔍 Starting Browser Error Testing...\n');
        
        let browser;
        try {
            // Launch browser
            browser = await chromium.launch({
                headless: false, // Set to true for CI/CD
                devtools: true
            });

            const context = await browser.newContext({
                // Grant camera permissions for gesture testing
                permissions: ['camera'],
                // Ignore HTTPS errors for local testing
                ignoreHTTPSErrors: true
            });

            const page = await context.newPage();

            // Setup console listeners
            page.on('console', msg => {
                const type = msg.type();
                const text = msg.text();
                const location = msg.location();
                
                const logEntry = {
                    type,
                    text,
                    url: location.url,
                    line: location.lineNumber,
                    column: location.columnNumber,
                    timestamp: Date.now() - this.startTime
                };

                if (type === 'error') {
                    this.errors.push(logEntry);
                    console.log(`❌ ERROR: ${text}`);
                    if (location.url) {
                        console.log(`   at ${location.url}:${location.lineNumber}:${location.columnNumber}`);
                    }
                } else if (type === 'warning') {
                    this.warnings.push(logEntry);
                    console.log(`⚠️  WARNING: ${text}`);
                } else {
                    this.logs.push(logEntry);
                    if (text.includes('✅') || text.includes('🎮')) {
                        console.log(`📝 ${text}`);
                    }
                }
            });

            // Setup page error listener (for uncaught exceptions)
            page.on('pageerror', error => {
                const errorEntry = {
                    type: 'pageerror',
                    text: error.message,
                    stack: error.stack,
                    timestamp: Date.now() - this.startTime
                };
                this.errors.push(errorEntry);
                console.log(`💥 UNCAUGHT ERROR: ${error.message}`);
                if (error.stack) {
                    console.log(`   Stack: ${error.stack.split('\n')[1]}`);
                }
            });

            // Setup request failure listener
            page.on('requestfailed', request => {
                const failureEntry = {
                    type: 'requestfailed',
                    url: request.url(),
                    method: request.method(),
                    failure: request.failure(),
                    timestamp: Date.now() - this.startTime
                };
                this.errors.push(failureEntry);
                console.log(`🔴 REQUEST FAILED: ${request.url()}`);
                if (request.failure()) {
                    console.log(`   Reason: ${request.failure().errorText}`);
                }
            });

            // Navigate to page
            console.log(`\n📍 Navigating to http://localhost:${port}/`);
            await page.goto(`http://localhost:${port}/`, {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            console.log('✅ Page loaded successfully\n');

            // Wait for game to initialize
            await page.waitForTimeout(3000);

            // Test 1: Check if startGame function exists
            console.log('\n🧪 Test 1: Checking startGame function...');
            const hasStartGame = await page.evaluate(() => {
                return typeof window.startGame === 'function';
            });
            console.log(hasStartGame ? '✅ startGame function exists' : '❌ startGame function missing');

            // Test 2: Check for duplicate variable declarations
            console.log('\n🧪 Test 2: Checking for syntax errors...');
            const syntaxErrors = this.errors.filter(e => 
                e.text && (e.text.includes('SyntaxError') || e.text.includes('already been declared'))
            );
            if (syntaxErrors.length > 0) {
                console.log(`❌ Found ${syntaxErrors.length} syntax error(s)`);
                syntaxErrors.forEach(e => {
                    console.log(`   - ${e.text}`);
                });
            } else {
                console.log('✅ No syntax errors detected');
            }

            // Test 3: Try clicking start button
            console.log('\n🧪 Test 3: Testing start button...');
            try {
                const startButton = await page.locator('button:has-text("Challenge starten")').first();
                if (await startButton.isVisible()) {
                    await startButton.click();
                    await page.waitForTimeout(1000);
                    console.log('✅ Start button clicked successfully');
                    
                    // Check if game started
                    const gameStarted = await page.evaluate(() => {
                        return window.gameState && window.gameState.isPlaying;
                    });
                    console.log(gameStarted ? '✅ Game started' : '⚠️  Game did not start');
                } else {
                    console.log('⚠️  Start button not visible');
                }
            } catch (e) {
                console.log(`❌ Start button test failed: ${e.message}`);
            }

            // Test 4: Check gesture control button
            console.log('\n🧪 Test 4: Testing gesture control...');
            const gestureBtn = await page.locator('#gestureControlBtn').first();
            if (await gestureBtn.isVisible()) {
                console.log('✅ Gesture control button visible');
                
                // Check if GestureController exists
                const hasGestureController = await page.evaluate(() => {
                    return typeof window.GestureController === 'function';
                });
                console.log(hasGestureController ? 
                    '✅ GestureController class exists' : 
                    '❌ GestureController class missing');
            } else {
                console.log('⚠️  Gesture control button not visible');
            }

            // Test 5: Check for TensorFlow.js
            console.log('\n🧪 Test 5: Checking TensorFlow.js...');
            const hasTensorFlow = await page.evaluate(() => {
                return typeof window.tf !== 'undefined' && 
                       typeof window.faceLandmarksDetection !== 'undefined';
            });
            console.log(hasTensorFlow ? 
                '✅ TensorFlow.js and FaceMesh loaded' : 
                '❌ TensorFlow.js or FaceMesh not loaded');

            // Generate report
            this.generateReport();

            // Keep browser open for 5 seconds to observe
            await page.waitForTimeout(5000);

        } catch (error) {
            console.error('\n💥 Test execution failed:', error.message);
            this.errors.push({
                type: 'test-failure',
                text: error.message,
                stack: error.stack
            });
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        return this.errors.length === 0;
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📈 Summary:`);
        console.log(`   Errors: ${this.errors.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        console.log(`   Info logs: ${this.logs.length}`);
        console.log(`   Test duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);

        if (this.errors.length === 0) {
            console.log('\n✅ ALL TESTS PASSED - No errors detected!');
        } else {
            console.log('\n❌ TESTS FAILED - Errors found:');
            this.errors.forEach((error, i) => {
                console.log(`\n${i + 1}. ${error.type.toUpperCase()}: ${error.text}`);
                if (error.url) {
                    console.log(`   Location: ${error.url}:${error.line}:${error.column}`);
                }
            });
        }

        // Save detailed report
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            duration: Date.now() - this.startTime,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                errorCount: this.errors.length,
                warningCount: this.warnings.length,
                passed: this.errors.length === 0
            }
        }, null, 2));

        console.log(`\n📁 Detailed report saved to: ${reportPath}`);
    }
}

// Run test if called directly
if (require.main === module) {
    const tester = new BrowserErrorTester();
    const port = process.argv[2] || 8001;
    
    console.log('🚀 SubwayRunner Browser Error Tester v1.0');
    console.log('=========================================\n');
    
    tester.testLocalVersion(port).then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = BrowserErrorTester;