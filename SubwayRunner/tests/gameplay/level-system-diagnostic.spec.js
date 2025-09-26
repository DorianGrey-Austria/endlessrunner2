// 🔍 QUICK DIAGNOSTIC: 10-Level System Validation
// Fast check to identify specific issues with level progression

import { test, expect } from '@playwright/test';

test.describe('🏥 Level System Health Check', () => {
    test.setTimeout(30000); // 30 seconds - quick diagnostic

    test('DIAGNOSTIC: 10-Level Configuration Check', async ({ page }) => {
        console.log('🩺 Running level system diagnostic...');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for game initialization
        await page.waitForFunction(() =>
            window.gameState &&
            window.LEVEL_THEMES &&
            window.gameState.levelSpeeds &&
            window.gameState.levelSpawnRates
        );

        // Comprehensive configuration analysis
        const configAnalysis = await page.evaluate(() => {
            const report = {
                levelConfigs: {},
                issues: [],
                summary: {
                    totalLevels: 0,
                    validLevels: 0,
                    missingConfigs: []
                }
            };

            // Check each level configuration
            for (let level = 1; level <= 10; level++) {
                const speeds = window.gameState.levelSpeeds[level];
                const spawnRate = window.gameState.levelSpawnRates[level];
                const theme = window.LEVEL_THEMES[level];
                const threshold = window.gameState.levelThresholds[level - 1];

                const config = {
                    level,
                    hasSpeed: !!speeds,
                    hasSpawn: !!spawnRate,
                    hasTheme: !!theme,
                    hasThreshold: threshold !== undefined,
                    speedConfig: speeds ? `${speeds.min}-${speeds.max}` : 'MISSING',
                    spawnConfig: spawnRate || 'MISSING',
                    themeConfig: theme ? theme.name : 'MISSING',
                    thresholdConfig: threshold !== undefined ? threshold : 'MISSING'
                };

                const isValid = config.hasSpeed && config.hasSpawn && config.hasTheme && config.hasThreshold;

                report.levelConfigs[level] = config;
                report.summary.totalLevels++;

                if (isValid) {
                    report.summary.validLevels++;
                } else {
                    report.summary.missingConfigs.push(level);

                    if (!config.hasSpeed) report.issues.push(`Level ${level}: Missing speed config`);
                    if (!config.hasSpawn) report.issues.push(`Level ${level}: Missing spawn config`);
                    if (!config.hasTheme) report.issues.push(`Level ${level}: Missing theme config`);
                    if (!config.hasThreshold) report.issues.push(`Level ${level}: Missing threshold config`);
                }
            }

            return report;
        });

        // Print diagnostic report
        console.log('\n📋 LEVEL CONFIGURATION DIAGNOSTIC REPORT');
        console.log('='.repeat(60));
        console.log(`Total Levels: ${configAnalysis.summary.totalLevels}`);
        console.log(`Valid Levels: ${configAnalysis.summary.validLevels}`);
        console.log(`Missing Configs: ${configAnalysis.summary.missingConfigs.join(', ') || 'None'}`);

        if (configAnalysis.issues.length > 0) {
            console.log('\n🚨 CONFIGURATION ISSUES:');
            configAnalysis.issues.forEach(issue => console.log(`  ❌ ${issue}`));
        }

        console.log('\n📊 LEVEL-BY-LEVEL BREAKDOWN:');
        for (const [level, config] of Object.entries(configAnalysis.levelConfigs)) {
            const status = config.hasSpeed && config.hasSpawn && config.hasTheme && config.hasThreshold ? '✅' : '❌';
            console.log(`${status} Level ${level}: ${config.themeConfig} | Speed: ${config.speedConfig} | Spawn: ${config.spawnConfig} | Threshold: ${config.thresholdConfig}`);
        }

        // Validate that all 10 levels are properly configured
        expect(configAnalysis.summary.validLevels).toBe(10);
        expect(configAnalysis.issues.length).toBe(0);
    });

    test('DIAGNOSTIC: Level Progression Function Check', async ({ page }) => {
        console.log('🔧 Checking level progression functions...');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.waitForFunction(() => window.gameState);

        const functionCheck = await page.evaluate(() => {
            const functions = {
                checkLevelProgression: typeof window.checkLevelProgression === 'function',
                triggerLevelTransition: typeof window.triggerLevelTransition === 'function',
                updateLevelSpeed: typeof window.updateLevelSpeed === 'function',
                updateLevelUI: typeof window.updateLevelUI === 'function',
                initializeLevelSystem: typeof window.initializeLevelSystem === 'function'
            };

            const missing = Object.entries(functions)
                .filter(([name, exists]) => !exists)
                .map(([name]) => name);

            return {
                functions,
                allPresent: missing.length === 0,
                missing
            };
        });

        console.log('\n🔧 LEVEL FUNCTION AVAILABILITY:');
        for (const [name, exists] of Object.entries(functionCheck.functions)) {
            console.log(`${exists ? '✅' : '❌'} ${name}`);
        }

        if (functionCheck.missing.length > 0) {
            console.log(`\n🚨 Missing functions: ${functionCheck.missing.join(', ')}`);
        }

        expect(functionCheck.allPresent).toBe(true);
    });

    test('DIAGNOSTIC: Manual Level Progression Test', async ({ page }) => {
        console.log('🎮 Testing manual level progression...');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.waitForFunction(() =>
            window.gameState &&
            typeof window.startGame === 'function' &&
            typeof window.checkLevelProgression === 'function'
        );

        // Start game
        await page.click('#startButton');
        await page.waitForFunction(() => window.gameState === 'playing');

        // Test progression to level 2
        const level2Result = await page.evaluate(() => {
            // Force progression to level 2
            window.gameState.score = 500; // Level 2 threshold
            window.gameState.currentLevel = 1;

            // Call progression check
            window.checkLevelProgression();

            return {
                currentLevel: window.gameState.currentLevel,
                score: window.gameState.score,
                levelTransition: window.gameState.levelTransition
            };
        });

        console.log(`🎯 Level 2 progression test:`, level2Result);

        // Test progression to level 5
        const level5Result = await page.evaluate(() => {
            // Force progression to level 5
            window.gameState.score = 2000; // Level 5 threshold
            window.gameState.currentLevel = 4;

            window.checkLevelProgression();

            return {
                currentLevel: window.gameState.currentLevel,
                score: window.gameState.score,
                levelTransition: window.gameState.levelTransition
            };
        });

        console.log(`🎯 Level 5 progression test:`, level5Result);

        // Test progression to level 10
        const level10Result = await page.evaluate(() => {
            // Force progression to level 10
            window.gameState.score = 4500; // Level 10 threshold
            window.gameState.currentLevel = 9;

            window.checkLevelProgression();

            return {
                currentLevel: window.gameState.currentLevel,
                score: window.gameState.score,
                levelTransition: window.gameState.levelTransition,
                maxLevel: window.gameState.currentLevel
            };
        });

        console.log(`🎯 Level 10 progression test:`, level10Result);

        // Validate progression works
        expect(level2Result.currentLevel).toBeGreaterThan(1);
        expect(level5Result.currentLevel).toBeGreaterThan(4);
        expect(level10Result.currentLevel).toBe(10);

        console.log('✅ Manual level progression working correctly');
    });
});