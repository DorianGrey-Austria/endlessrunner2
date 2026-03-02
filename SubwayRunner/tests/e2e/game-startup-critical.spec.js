// CRITICAL GAME STARTUP TEST
// Purpose: Detect JavaScript errors that prevent game from starting
// Golden Rule #2: Console Error Detection (MANDATORY)
// Golden Rule #25: 3D Rendering Verification (5s settle time)
// Golden Rule #26: Projekt-Typ-Spezifische Tests (3D Game)

import { test, expect } from '@playwright/test';

test.describe('CRITICAL: Game Startup Verification', () => {
    // Error collectors - reset for each test
    let consoleErrors = [];
    let pageErrors = [];
    let requestFailures = [];

    test.beforeEach(async ({ page }) => {
        // Reset error collectors
        consoleErrors = [];
        pageErrors = [];
        requestFailures = [];

        // MANDATORY Console Error Detection (Golden Rule #2)
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push({
                    text: msg.text(),
                    location: msg.location()
                });
            }
        });

        page.on('pageerror', error => {
            pageErrors.push({
                message: error.message,
                stack: error.stack
            });
        });

        page.on('requestfailed', request => {
            requestFailures.push({
                url: request.url(),
                error: request.failure()?.errorText || 'unknown'
            });
        });
    });

    test('index.html: Game loads and starts without JavaScript errors', async ({ page }) => {
        console.log('\n========================================');
        console.log('  CRITICAL GAME STARTUP TEST');
        console.log('  Target: index.html (Production)');
        console.log('========================================\n');

        // PHASE 1: Load the page
        console.log('PHASE 1: Loading page...');
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        console.log('  Page loaded');

        // PHASE 2: Wait for canvas (30s timeout per Golden Rule #25)
        console.log('\nPHASE 2: Waiting for canvas element...');
        const canvasResult = await page.waitForSelector('canvas', { timeout: 30000 }).catch(e => null);

        if (!canvasResult) {
            console.error('  FATAL: Canvas not found within 30s');
            // Check if there are JS errors preventing canvas creation
            if (pageErrors.length > 0) {
                console.error('\n  JavaScript errors detected:');
                pageErrors.forEach((err, i) => {
                    console.error(`    ${i + 1}. ${err.message}`);
                });
            }
            expect(canvasResult).not.toBeNull();
            return;
        }
        console.log('  Canvas found');

        // PHASE 3: 5 second settle time for 3D scene (Golden Rule #25)
        console.log('\nPHASE 3: 3D settle time (5 seconds)...');
        await page.waitForTimeout(5000);
        console.log('  3D scene settled');

        // PHASE 4: Verify Three.js loaded
        console.log('\nPHASE 4: Verifying Three.js...');
        const threeLoaded = await page.evaluate(() => typeof THREE !== 'undefined');
        console.log(`  THREE global: ${threeLoaded ? 'OK' : 'MISSING'}`);
        expect(threeLoaded).toBe(true);

        // PHASE 5: Verify gameState exists
        console.log('\nPHASE 5: Verifying gameState...');
        const gameStateCheck = await page.evaluate(() => {
            if (typeof gameState === 'undefined') return { exists: false };
            return {
                exists: true,
                isPlaying: gameState.isPlaying,
                score: gameState.score,
                level: gameState.level
            };
        });
        console.log(`  gameState: ${gameStateCheck.exists ? 'OK' : 'MISSING'}`);
        if (gameStateCheck.exists) {
            console.log(`  Initial state: isPlaying=${gameStateCheck.isPlaying}, score=${gameStateCheck.score}, level=${gameStateCheck.level}`);
        }
        expect(gameStateCheck.exists).toBe(true);

        // PHASE 6: Verify startGame function exists
        console.log('\nPHASE 6: Verifying startGame function...');
        const startGameExists = await page.evaluate(() => typeof startGame === 'function');
        console.log(`  startGame(): ${startGameExists ? 'OK' : 'MISSING'}`);

        if (!startGameExists) {
            console.error('\n  CRITICAL: startGame is not defined!');
            console.error('  This usually means a JavaScript syntax error prevented the script from loading.');

            // Report all collected errors
            if (pageErrors.length > 0) {
                console.error('\n  Page Errors:');
                pageErrors.forEach((err, i) => {
                    console.error(`    ${i + 1}. ${err.message}`);
                });
            }
            if (consoleErrors.length > 0) {
                console.error('\n  Console Errors:');
                consoleErrors.forEach((err, i) => {
                    console.error(`    ${i + 1}. ${err.text}`);
                });
            }
        }
        expect(startGameExists).toBe(true);

        // PHASE 7: Check menu visibility
        console.log('\nPHASE 7: Checking menu state...');
        const menuVisible = await page.locator('#menu').isVisible().catch(() => false);
        console.log(`  Menu visible: ${menuVisible}`);

        // PHASE 8: Find and click start button
        console.log('\nPHASE 8: Starting game...');

        // Try multiple selectors for the start button
        const buttonSelectors = [
            'button:has-text("SPIELEN")',
            'button:has-text("PLAY")',
            'button:has-text("START")',
            '#start-button',
            '.start-button',
            '#menu button'
        ];

        let startButton = null;
        for (const selector of buttonSelectors) {
            const btn = page.locator(selector).first();
            if (await btn.isVisible().catch(() => false)) {
                startButton = btn;
                console.log(`  Found button with selector: ${selector}`);
                break;
            }
        }

        if (!startButton) {
            console.error('  WARNING: No start button found, trying direct startGame() call');
            const directStartResult = await page.evaluate(() => {
                if (typeof startGame === 'function') {
                    try {
                        startGame();
                        return { success: true };
                    } catch (e) {
                        return { success: false, error: e.message };
                    }
                }
                return { success: false, error: 'startGame not defined' };
            });

            if (!directStartResult.success) {
                console.error(`  Direct start failed: ${directStartResult.error}`);
            }
        } else {
            await startButton.click();
            console.log('  Button clicked');
        }

        // PHASE 9: Wait for game to start
        console.log('\nPHASE 9: Waiting for game state change...');
        await page.waitForTimeout(2000);

        // PHASE 10: Verify game is running
        console.log('\nPHASE 10: Verifying game is running...');
        const gameRunningCheck = await page.evaluate(() => {
            if (typeof gameState === 'undefined') return { error: 'gameState undefined' };
            return {
                isPlaying: gameState.isPlaying,
                score: gameState.score,
                level: gameState.level,
                speed: gameState.speed
            };
        });

        console.log(`  isPlaying: ${gameRunningCheck.isPlaying}`);
        console.log(`  Current score: ${gameRunningCheck.score}`);
        console.log(`  Current level: ${gameRunningCheck.level}`);

        // PHASE 11: Menu should be hidden
        const menuHidden = await page.locator('#menu').isHidden().catch(() => true);
        console.log(`  Menu hidden: ${menuHidden}`);

        // PHASE 12: Error analysis
        console.log('\n========================================');
        console.log('  ERROR ANALYSIS');
        console.log('========================================\n');

        // WebGL errors are expected in headless mode - filter them out
        const webglPatterns = [
            'WebGL',
            'webgl',
            'context could not be created',
            'Error creating WebGL',
            'setClearColor',
            'THREE.WebGLRenderer',
            'GPU'
        ];

        const criticalPageErrors = pageErrors.filter(err =>
            !webglPatterns.some(pattern => err.message.includes(pattern))
        );

        const criticalConsoleErrors = consoleErrors.filter(err =>
            !webglPatterns.some(pattern => err.text.includes(pattern)) &&
            !err.text.includes('403')  // CDN rate limits
        );

        // Special detection for duplicate declaration errors
        const duplicateDeclarationErrors = pageErrors.filter(err =>
            err.message.includes('has already been declared') ||
            err.message.includes('Identifier') && err.message.includes('already')
        );

        if (duplicateDeclarationErrors.length > 0) {
            console.error('CRITICAL: Duplicate declaration errors found!');
            duplicateDeclarationErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err.message}`);
            });
            console.error('\n  This is likely caused by:');
            console.error('  - Multiple <script> tags defining the same variable');
            console.error('  - A library being loaded twice');
            console.error('  - Copy/paste error duplicating code');
        }

        if (criticalPageErrors.length > 0) {
            console.error('Page Errors (non-WebGL):');
            criticalPageErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err.message}`);
            });
        } else {
            console.log('Page Errors: NONE');
        }

        if (criticalConsoleErrors.length > 0) {
            console.error('\nConsole Errors (non-WebGL):');
            criticalConsoleErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err.text}`);
            });
        } else {
            console.log('Console Errors: NONE');
        }

        if (requestFailures.length > 0) {
            const critical404s = requestFailures.filter(r => !r.url.includes('403'));
            if (critical404s.length > 0) {
                console.error('\nRequest Failures:');
                critical404s.forEach((r, i) => {
                    console.error(`  ${i + 1}. ${r.url} - ${r.error}`);
                });
            }
        } else {
            console.log('Request Failures: NONE');
        }

        // FINAL ASSERTIONS
        console.log('\n========================================');
        console.log('  FINAL ASSERTIONS');
        console.log('========================================\n');

        // Assert no duplicate declaration errors (CRITICAL)
        expect(duplicateDeclarationErrors.length,
            'Duplicate declaration errors found - fix the JavaScript!'
        ).toBe(0);

        // Assert game is playing
        expect(gameRunningCheck.isPlaying,
            'Game should be playing after clicking start button'
        ).toBe(true);

        // Assert no critical errors
        const totalCriticalErrors = criticalPageErrors.length + criticalConsoleErrors.length;
        expect(totalCriticalErrors,
            'Critical JavaScript errors detected'
        ).toBe(0);

        console.log('ALL ASSERTIONS PASSED');
        console.log('\n========================================\n');
    });

    test('index.html: Detect specific duplicate identifier errors', async ({ page }) => {
        console.log('\n========================================');
        console.log('  DUPLICATE IDENTIFIER DETECTION TEST');
        console.log('========================================\n');

        // Track all syntax/declaration errors
        const syntaxErrors = [];

        page.on('pageerror', error => {
            if (error.message.includes('already been declared') ||
                error.message.includes('Unexpected identifier') ||
                error.message.includes('SyntaxError')) {
                syntaxErrors.push(error.message);
            }
        });

        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        if (syntaxErrors.length > 0) {
            console.error('SYNTAX/DECLARATION ERRORS DETECTED:');
            syntaxErrors.forEach((err, i) => {
                console.error(`\n  ${i + 1}. ${err}`);

                // Parse the error to identify the problematic identifier
                const match = err.match(/Identifier '(\w+)' has already been declared/);
                if (match) {
                    console.error(`     --> Duplicate identifier: "${match[1]}"`);
                    console.error(`     --> Search the codebase for multiple declarations of "${match[1]}"`);
                }
            });
        } else {
            console.log('No duplicate identifier errors detected');
        }

        expect(syntaxErrors.length,
            'JavaScript syntax/declaration errors prevent game from loading'
        ).toBe(0);

        console.log('\n========================================\n');
    });

    test('index.html: Validate all required global functions exist', async ({ page }) => {
        console.log('\n========================================');
        console.log('  GLOBAL FUNCTION VALIDATION');
        console.log('========================================\n');

        // Collect all errors during page load
        const allErrors = [];
        page.on('pageerror', error => {
            allErrors.push(error.message);
        });

        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('canvas', { timeout: 30000 }).catch(() => null);
        await page.waitForTimeout(3000);

        // First, check if there were any JavaScript errors during load
        if (allErrors.length > 0) {
            console.error('JavaScript errors during page load:');
            allErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err}`);
            });
            console.error('');
        }

        const requiredFunctions = [
            'startGame',
            'initGame',
            'animate',
            'checkCollision',
            'createObstacle',
            'createCollectible',
            'updateScore',
            'endGame',
            'resetGame'
        ];

        const functionStatus = await page.evaluate((funcs) => {
            return funcs.map(name => ({
                name,
                exists: typeof window[name] === 'function',
                type: typeof window[name]
            }));
        }, requiredFunctions);

        let missingCount = 0;
        functionStatus.forEach(f => {
            const status = f.exists ? 'OK' : 'MISSING';
            const icon = f.exists ? '' : '';
            console.log(`  ${icon} ${f.name}(): ${status}`);
            if (!f.exists) missingCount++;
        });

        if (missingCount > 0) {
            console.error(`\nWARNING: ${missingCount} required function(s) missing`);
            console.error('This may indicate JavaScript errors preventing full script execution');
        }

        // At minimum, startGame must exist
        const startGameStatus = functionStatus.find(f => f.name === 'startGame');
        expect(startGameStatus?.exists,
            'startGame() function is required but not defined'
        ).toBe(true);

        console.log('\n========================================\n');
    });

    test('index.html: Check for Supabase CDN conflict with local declaration', async ({ page }) => {
        console.log('\n========================================');
        console.log('  SUPABASE CONFLICT DETECTION');
        console.log('========================================\n');

        // This test specifically checks for the known issue:
        // Supabase CDN (unpkg) creates a global 'supabase' object,
        // but the code also declares 'let supabase = null;' which causes
        // "Identifier 'supabase' has already been declared"

        const scriptErrors = [];
        const supabaseRelatedErrors = [];

        page.on('pageerror', error => {
            scriptErrors.push(error.message);
            if (error.message.toLowerCase().includes('supabase') ||
                error.message.includes("'supabase'")) {
                supabaseRelatedErrors.push(error.message);
            }
        });

        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Check if Supabase CDN loaded a global
        const supabaseGlobalCheck = await page.evaluate(() => {
            return {
                // Check if supabase global exists from CDN
                hasSupabaseGlobal: typeof window.supabase !== 'undefined',
                supabaseType: typeof window.supabase,
                // Check createClient function (from CDN)
                hasCreateClient: typeof window.supabase?.createClient === 'function'
            };
        });

        console.log('Supabase CDN Status:');
        console.log(`  Global 'supabase' exists: ${supabaseGlobalCheck.hasSupabaseGlobal}`);
        console.log(`  Type: ${supabaseGlobalCheck.supabaseType}`);
        console.log(`  Has createClient: ${supabaseGlobalCheck.hasCreateClient}`);

        if (supabaseRelatedErrors.length > 0) {
            console.error('\nSUPABASE-RELATED ERRORS DETECTED:');
            supabaseRelatedErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err}`);
            });
            console.error('\nLIKELY CAUSE:');
            console.error('  Line 8: <script src="https://unpkg.com/@supabase/supabase-js@2">');
            console.error('    --> This creates a global "supabase" object');
            console.error('  Line 633: let supabase = null;');
            console.error('    --> This tries to redeclare "supabase" with let, causing conflict');
            console.error('\nSOLUTION:');
            console.error('  Change "let supabase = null;" to "let supabaseClient = null;"');
            console.error('  OR remove the CDN script if not needed');
        }

        // Check for any duplicate identifier errors
        const duplicateErrors = scriptErrors.filter(e =>
            e.includes('already been declared') ||
            e.includes('has already been declared')
        );

        if (duplicateErrors.length > 0) {
            console.error('\nDuplicate declaration errors found:');
            duplicateErrors.forEach((err, i) => {
                console.error(`  ${i + 1}. ${err}`);
            });
        }

        // This test passes if there are no supabase-related errors
        // If supabase errors exist, it fails with diagnostic info
        expect(supabaseRelatedErrors.length,
            'Supabase CDN conflicts with local variable declaration'
        ).toBe(0);

        console.log('\n========================================\n');
    });

    test('index.html: Diagnostic - capture all script errors', async ({ page }) => {
        console.log('\n========================================');
        console.log('  COMPREHENSIVE ERROR DIAGNOSTIC');
        console.log('========================================\n');

        const errors = {
            page: [],
            console: [],
            network: [],
            responses404: []
        };

        page.on('pageerror', error => {
            errors.page.push({
                message: error.message,
                name: error.name
            });
        });

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.console.push(msg.text());
            }
        });

        page.on('requestfailed', request => {
            errors.network.push({
                url: request.url(),
                error: request.failure()?.errorText
            });
        });

        page.on('response', response => {
            if (response.status() === 404) {
                errors.responses404.push(response.url());
            }
        });

        // Load page and wait
        await page.goto('/index.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Summary
        console.log('ERROR SUMMARY:');
        console.log(`  Page errors: ${errors.page.length}`);
        console.log(`  Console errors: ${errors.console.length}`);
        console.log(`  Network failures: ${errors.network.length}`);
        console.log(`  404 responses: ${errors.responses404.length}`);

        if (errors.page.length > 0) {
            console.log('\nPAGE ERRORS (JavaScript exceptions):');
            errors.page.forEach((err, i) => {
                console.log(`  ${i + 1}. [${err.name}] ${err.message}`);
            });
        }

        if (errors.console.length > 0) {
            console.log('\nCONSOLE ERRORS:');
            errors.console.forEach((err, i) => {
                console.log(`  ${i + 1}. ${err}`);
            });
        }

        if (errors.network.length > 0) {
            console.log('\nNETWORK FAILURES:');
            errors.network.forEach((err, i) => {
                console.log(`  ${i + 1}. ${err.url} - ${err.error}`);
            });
        }

        if (errors.responses404.length > 0) {
            console.log('\n404 NOT FOUND:');
            errors.responses404.forEach((url, i) => {
                console.log(`  ${i + 1}. ${url}`);
            });
        }

        // Check which globals are available
        const globals = await page.evaluate(() => {
            const check = (name) => ({
                name,
                exists: typeof window[name] !== 'undefined',
                type: typeof window[name]
            });

            return [
                check('THREE'),
                check('gameState'),
                check('startGame'),
                check('supabase'),
                check('GameCore'),
                check('LevelManager')
            ];
        });

        console.log('\nGLOBAL VARIABLES STATUS:');
        globals.forEach(g => {
            const status = g.exists ? 'OK' : 'MISSING';
            console.log(`  ${g.name}: ${status} (${g.type})`);
        });

        // Check page URL
        const currentUrl = page.url();
        console.log(`\nCurrent URL: ${currentUrl}`);

        // This is a diagnostic test - always passes but provides info
        console.log('\n========================================\n');

        // Filter critical errors (exclude WebGL which is expected in headless)
        const criticalErrors = errors.page.filter(e =>
            !e.message.includes('WebGL') &&
            !e.message.includes('GPU')
        );

        // Report but don't fail on diagnostics - this helps identify issues
        if (criticalErrors.length > 0) {
            console.log('CRITICAL ERRORS FOUND - Game may not function correctly');
        } else {
            console.log('No critical JavaScript errors detected');
        }
    });
});
