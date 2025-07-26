#!/usr/bin/env node

/**
 * Pre-Deployment Test Script
 * MUST be run before every deployment!
 * 
 * Usage: node pre-deployment-test.js
 * 
 * Exit codes:
 * 0 - All tests passed, safe to deploy
 * 1 - Critical errors found, DO NOT DEPLOY
 */

import { chromium } from '@playwright/test';
import fs from 'fs';

const CRITICAL_ERROR_PATTERNS = [
    'ReferenceError',
    'TypeError',
    'SyntaxError',
    'is not defined',
    'Cannot read properties of undefined',
    'Cannot access .* before initialization'
];

const ACCEPTABLE_ERRORS = [
    '404.*background\\.mp3',  // Missing audio file (non-critical)
    '404.*favicon\\.ico',      // Missing favicon (non-critical)
    'subway_runner_scores',    // Supabase table (non-critical for game functionality)
];

async function runPreDeploymentTests() {
    console.log('🚀 PRE-DEPLOYMENT TEST SUITE\n');
    console.log('⏰ Starting at:', new Date().toLocaleString());
    console.log('═'.repeat(50) + '\n');
    
    // Start local server
    const { spawn } = await import('child_process');
    const server = spawn('python3', ['-m', 'http.server', '8001'], {
        detached: true,
        stdio: 'ignore'
    });
    server.unref();
    
    console.log('🌐 Local server started on port 8001');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server
    
    const browser = await chromium.launch({ 
        headless: true,
        timeout: 30000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    const criticalErrors = [];
    const warnings = [];
    
    // Error handlers
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            const location = msg.location();
            
            const errorData = {
                text,
                url: location.url,
                line: location.lineNumber,
                timestamp: new Date().toISOString()
            };
            
            // Check if it's acceptable
            const isAcceptable = ACCEPTABLE_ERRORS.some(pattern => 
                new RegExp(pattern).test(text)
            );
            
            if (!isAcceptable) {
                // Check if critical
                const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => 
                    new RegExp(pattern).test(text)
                );
                
                if (isCritical) {
                    criticalErrors.push(errorData);
                    console.log(`❌ CRITICAL: ${text}`);
                } else {
                    warnings.push(errorData);
                    console.log(`⚠️  WARNING: ${text}`);
                }
            }
            
            errors.push(errorData);
        }
    });
    
    page.on('pageerror', error => {
        const errorData = {
            text: error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        criticalErrors.push(errorData);
        console.log(`🔴 PAGE ERROR: ${error.toString()}`);
    });
    
    // Test 1: Page loads
    console.log('\n📋 TEST 1: Page Load');
    try {
        await page.goto('http://localhost:8001', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });
        console.log('✅ Page loaded successfully');
    } catch (error) {
        console.log('❌ Page load failed:', error.message);
        criticalErrors.push({ text: 'Page load failed: ' + error.message });
    }
    
    // Test 2: Game initialization
    console.log('\n📋 TEST 2: Game Initialization');
    await page.waitForTimeout(3000);
    
    const gameState = await page.evaluate(() => {
        return {
            hasGameInstance: typeof window.gameInstance !== 'undefined',
            hasGameState: typeof window.gameState !== 'undefined',
            hasRenderer: window.gameInstance?.renderer ? true : false,
            hasScene: window.gameInstance?.scene ? true : false,
            hasThreeJS: typeof THREE !== 'undefined',
            startMenuVisible: document.querySelector('#startMenu')?.style.display !== 'none'
        };
    });
    
    Object.entries(gameState).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`${status} ${key}: ${value}`);
        if (!value && ['hasGameInstance', 'hasThreeJS'].includes(key)) {
            criticalErrors.push({ text: `Critical component missing: ${key}` });
        }
    });
    
    // Test 3: Button interaction
    console.log('\n📋 TEST 3: Start Button Test');
    try {
        const startButton = await page.$('button:has-text("Challenge starten!")');
        if (startButton) {
            await startButton.click();
            console.log('✅ Start button clicked');
            await page.waitForTimeout(2000);
            
            const gameStarted = await page.evaluate(() => {
                return window.gameInstance?.isPlaying === true;
            });
            
            if (gameStarted) {
                console.log('✅ Game started successfully');
            } else {
                console.log('⚠️  Game did not start (may be normal in test env)');
            }
        } else {
            console.log('❌ Start button not found');
            criticalErrors.push({ text: 'Start button not found' });
        }
    } catch (error) {
        console.log('❌ Button test failed:', error.message);
    }
    
    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        totalErrors: errors.length,
        criticalErrors: criticalErrors.length,
        warnings: warnings.length,
        passed: criticalErrors.length === 0,
        details: {
            critical: criticalErrors,
            warnings: warnings,
            gameState
        }
    };
    
    // Save report
    fs.writeFileSync('pre-deployment-report.json', JSON.stringify(report, null, 2));
    
    // Final results
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST RESULTS:');
    console.log(`   Total Errors: ${errors.length}`);
    console.log(`   Critical Errors: ${criticalErrors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log('═'.repeat(50) + '\n');
    
    if (criticalErrors.length === 0) {
        console.log('✅ ALL TESTS PASSED - Safe to deploy! 🚀');
    } else {
        console.log('❌ CRITICAL ERRORS FOUND - DO NOT DEPLOY! 🛑');
        console.log('\nCritical errors must be fixed before deployment:');
        criticalErrors.forEach((error, i) => {
            console.log(`\n${i + 1}. ${error.text}`);
            if (error.stack) {
                console.log('   Stack:', error.stack.split('\n')[0]);
            }
        });
    }
    
    await browser.close();
    
    // Kill server
    try {
        spawn('kill', [`${server.pid}`]);
    } catch (e) {
        // Server might already be dead
    }
    
    process.exit(criticalErrors.length > 0 ? 1 : 0);
}

// Run tests
runPreDeploymentTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});