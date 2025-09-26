// 🤖 AUTOMATED 10-LEVEL VALIDATION SYSTEM
// Professional headless gameplay testing with comprehensive level progression validation

import { test, expect } from '@playwright/test';

test.describe('🎮 Automated 10-Level System Validation', () => {
    test.setTimeout(120000); // 2 minutes for full playthrough

    test('Should validate complete 10-level progression automatically', async ({ page }) => {
        console.log('🚀 Starting automated 10-level validation...');

        // Navigate to game
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for game initialization
        await page.waitForFunction(() =>
            window.THREE &&
            window.scene &&
            window.gameState &&
            window.LEVEL_THEMES &&
            typeof window.startGame === 'function'
        );

        console.log('✅ Game initialized successfully');

        // Start the game
        await page.click('#startButton');
        await page.waitForFunction(() => window.gameState === 'playing');
        console.log('✅ Game started');

        // Automated level progression validation
        const levelValidationResults = {};

        for (let targetLevel = 1; targetLevel <= 10; targetLevel++) {
            console.log(`🎯 Validating Level ${targetLevel}...`);

            // Auto-progress to level (inject score)
            await page.evaluate((level) => {
                // Calculate required score for this level
                const requiredScore = window.gameState.levelThresholds[level - 1];
                window.gameState.score = requiredScore;

                // Force level check
                if (window.checkLevelProgression) {
                    window.checkLevelProgression();
                }
            }, targetLevel);

            // Wait for level transition or verify we're already there
            await page.waitForFunction((level) => {
                return window.gameState.currentLevel >= level;
            }, targetLevel);

            // Validate level configuration
            const levelData = await page.evaluate((level) => {
                const speeds = window.gameState.levelSpeeds[level];
                const spawnRate = window.gameState.levelSpawnRates[level];
                const theme = window.LEVEL_THEMES[level];
                const threshold = window.gameState.levelThresholds[level - 1];

                return {
                    level,
                    hasSpeedConfig: !!speeds,
                    hasSpawnConfig: !!spawnRate,
                    hasTheme: !!theme,
                    speedRange: speeds ? `${speeds.min}-${speeds.max}` : 'MISSING',
                    spawnRate: spawnRate || 'MISSING',
                    themeName: theme ? theme.name : 'MISSING',
                    threshold: threshold,
                    actualLevel: window.gameState.currentLevel
                };
            }, targetLevel);

            // Store validation results
            levelValidationResults[targetLevel] = levelData;

            // Comprehensive validation
            expect(levelData.hasSpeedConfig, `Level ${targetLevel} missing speed config`).toBe(true);
            expect(levelData.hasSpawnConfig, `Level ${targetLevel} missing spawn config`).toBe(true);
            expect(levelData.hasTheme, `Level ${targetLevel} missing theme config`).toBe(true);
            expect(levelData.actualLevel, `Game stuck at level ${levelData.actualLevel}, expected ${targetLevel}`).toBeGreaterThanOrEqual(targetLevel);

            console.log(`✅ Level ${targetLevel} validated:`, levelData);
        }

        // Generate comprehensive report
        console.log('\n📊 COMPLETE 10-LEVEL VALIDATION REPORT:');
        console.log('='.repeat(60));

        let allLevelsValid = true;
        for (const [level, data] of Object.entries(levelValidationResults)) {
            const status = data.hasSpeedConfig && data.hasSpawnConfig && data.hasTheme ? '✅' : '❌';
            console.log(`${status} Level ${level}: ${data.themeName} (Speed: ${data.speedRange}, Spawn: ${data.spawnRate})`);

            if (!data.hasSpeedConfig || !data.hasSpawnConfig || !data.hasTheme) {
                allLevelsValid = false;
            }
        }

        console.log('='.repeat(60));
        console.log(allLevelsValid ? '🎉 ALL 10 LEVELS FULLY FUNCTIONAL!' : '⚠️ SOME LEVELS HAVE CONFIGURATION ISSUES');

        // Final validation
        expect(allLevelsValid).toBe(true);

        // Test difficulty progression logic
        await validateDifficultyProgression(page, levelValidationResults);
    });

    test('Should validate level transition mechanics', async ({ page }) => {
        console.log('🔄 Testing level transition mechanics...');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.waitForFunction(() => window.gameState && typeof window.startGame === 'function');
        await page.click('#startButton');

        // Test level 1 → 2 transition
        await page.evaluate(() => {
            // Set score just below level 2 threshold
            window.gameState.score = 499;
            window.gameState.currentLevel = 1;
        });

        // Trigger score increase that should cause level progression
        await page.evaluate(() => {
            window.gameState.score = 500; // Level 2 threshold
            if (window.checkLevelProgression) {
                window.checkLevelProgression();
            }
        });

        // Wait for transition
        await page.waitForFunction(() => window.gameState.currentLevel === 2, { timeout: 5000 });

        // Validate transition UI
        const transitionVisible = await page.isVisible('#levelTransitionOverlay');
        if (transitionVisible) {
            console.log('✅ Level transition UI displayed correctly');

            // Wait for transition to complete
            await page.waitForFunction(() => !window.gameState.levelTransition, { timeout: 5000 });
        }

        console.log('✅ Level transition mechanics working');
    });

    test('Should validate level balance progression', async ({ page }) => {
        console.log('⚖️ Validating level balance progression...');

        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => window.gameState);

        const balanceAnalysis = await page.evaluate(() => {
            const analysis = {};

            // Analyze difficulty progression
            for (let level = 1; level <= 10; level++) {
                const speeds = window.gameState.levelSpeeds[level];
                const spawnRate = window.gameState.levelSpawnRates[level];

                if (speeds && spawnRate) {
                    const avgSpeed = (speeds.min + speeds.max) / 2;
                    const difficultyScore = (avgSpeed * 100) + (spawnRate * 1000);

                    analysis[level] = {
                        avgSpeed,
                        spawnRate,
                        difficultyScore,
                        speedRange: speeds.max - speeds.min
                    };
                }
            }

            return analysis;
        });

        // Validate difficulty curve
        console.log('\n📈 DIFFICULTY PROGRESSION ANALYSIS:');

        let previousDifficulty = 0;
        let level3Peak = false;
        let level4Relaxation = false;

        for (const [level, data] of Object.entries(balanceAnalysis)) {
            const levelNum = parseInt(level);
            console.log(`Level ${level}: Difficulty ${data.difficultyScore.toFixed(1)} (Speed: ${data.avgSpeed.toFixed(3)}, Spawn: ${data.spawnRate.toFixed(3)})`);

            // Check for level 3 peak
            if (levelNum === 3) {
                level3Peak = data.difficultyScore > balanceAnalysis[2]?.difficultyScore;
            }

            // Check for level 4 relaxation (should be less than level 3)
            if (levelNum === 4) {
                level4Relaxation = data.difficultyScore < balanceAnalysis[3]?.difficultyScore;
            }
        }

        console.log(`\n📊 Balance Analysis:`);
        console.log(`Level 3 Peak: ${level3Peak ? '✅' : '❌'}`);
        console.log(`Level 4 Relaxation: ${level4Relaxation ? '✅' : '❌'}`);

        // Validate balance requirements
        expect(level3Peak).toBe(true);
        expect(level4Relaxation).toBe(true);
    });
});

// Helper function for difficulty progression validation
async function validateDifficultyProgression(page, levelData) {
    console.log('\n🔍 Analyzing difficulty progression curve...');

    const progression = await page.evaluate((data) => {
        const curve = [];

        for (let level = 1; level <= 10; level++) {
            const levelInfo = data[level];
            if (levelInfo) {
                const speeds = window.gameState.levelSpeeds[level];
                const spawnRate = window.gameState.levelSpawnRates[level];

                if (speeds && spawnRate) {
                    const avgSpeed = (speeds.min + speeds.max) / 2;
                    const difficulty = (avgSpeed * 100) + (spawnRate * 1000);

                    curve.push({
                        level,
                        difficulty,
                        avgSpeed,
                        spawnRate
                    });
                }
            }
        }

        return curve;
    }, levelData);

    // Validate progression rules
    let validProgression = true;

    // Rule 1: Level 3 should be peak difficulty in early levels
    const level3Difficulty = progression[2]?.difficulty;
    const level2Difficulty = progression[1]?.difficulty;
    const level4Difficulty = progression[3]?.difficulty;

    if (level3Difficulty <= level2Difficulty || level3Difficulty <= level4Difficulty) {
        console.log('❌ Level 3 peak validation failed');
        validProgression = false;
    } else {
        console.log('✅ Level 3 peak validated');
    }

    // Rule 2: Overall progression should trend upward (with level 4 exception)
    let trendingUp = true;
    for (let i = 4; i < progression.length - 1; i++) {
        if (progression[i + 1].difficulty < progression[i].difficulty) {
            trendingUp = false;
            break;
        }
    }

    if (!trendingUp) {
        console.log('❌ Overall upward trend validation failed');
        validProgression = false;
    } else {
        console.log('✅ Overall upward trend validated');
    }

    expect(validProgression).toBe(true);

    console.log('✅ Difficulty progression validation complete');
}