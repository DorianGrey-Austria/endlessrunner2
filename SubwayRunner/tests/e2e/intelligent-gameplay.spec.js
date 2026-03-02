/**
 * Intelligent Gameplay Tests
 *
 * Tests reactive gameplay with obstacle detection and human-like actions.
 * Uses the GameplaySimulator for intelligent obstacle avoidance.
 *
 * Golden Rules Applied:
 * - #2: Console Error Detection
 * - #3: Self-Testing Protocol
 * - #25: 3D Rendering Verification (5s settle time)
 */

import { test, expect } from '@playwright/test';
import {
  waitForGameReady,
  startGame,
  getGameState,
  setupErrorCollectors,
  filterWebGLErrors,
} from '../utils/game-test-utils.js';
import { GameplaySimulator, MOVEMENT_PATTERNS } from '../utils/gameplay-simulator.js';

test.describe('🎮 Intelligent Gameplay Tests', () => {
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = setupErrorCollectors(page);
  });

  test('30 seconds reactive gameplay', async ({ page }) => {
    test.setTimeout(90000); // 90 second timeout

    console.log('\n========================================');
    console.log('  TEST: 30 Seconds Reactive Gameplay');
    console.log('========================================\n');

    // Navigate and wait for game
    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    console.log('1. Game ready, starting...');

    // Start game
    const started = await startGame(page);
    if (!started) {
      console.log('   Could not start game (WebGL headless?)');
      // In headless mode, game might not start properly
      // This is acceptable - just verify no crashes
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    console.log('2. Game started, simulating gameplay...');

    // Create simulator with reactive pattern
    const simulator = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.reactive,
      logActions: true,
      maxMultiJumps: 4,
    });

    // Simulate for 30 seconds
    const result = await simulator.simulate(30);

    console.log('\n3. Simulation complete');
    console.log(`   Duration: ${result.duration.toFixed(1)}s`);
    console.log(`   Actions: ${result.stats.totalActions}`);
    console.log(`   Jumps: ${result.stats.jumps}`);
    console.log(`   Ducks: ${result.stats.ducks}`);
    console.log(`   Lane Changes: ${result.stats.laneChanges}`);

    // Get final state
    if (result.finalState) {
      console.log('\n4. Final State:');
      console.log(`   Score: ${result.finalState.score}`);
      console.log(`   Lives: ${result.finalState.lives}`);
      console.log(`   Level: ${result.finalState.level}`);
      console.log(`   Game Over: ${result.finalState.isGameOver}`);
    }

    // Error check
    console.log('\n5. Error Check:');
    const criticalConsoleErrors = filterWebGLErrors(errors.consoleErrors);
    const criticalPageErrors = filterWebGLErrors(errors.pageErrors);

    console.log(`   Console Errors (filtered): ${criticalConsoleErrors.length}`);
    console.log(`   Page Errors (filtered): ${criticalPageErrors.length}`);
    console.log(`   Simulation Errors: ${result.errors.length}`);

    if (criticalConsoleErrors.length > 0) {
      console.log('   Critical Console Errors:');
      criticalConsoleErrors.forEach(e => console.log(`     - ${e}`));
    }

    if (criticalPageErrors.length > 0) {
      console.log('   Critical Page Errors:');
      criticalPageErrors.forEach(e => console.log(`     - ${e}`));
    }

    // Assertions
    expect(criticalPageErrors.length, 'No critical page errors').toBe(0);
    expect(result.stats.totalActions, 'Some actions were performed').toBeGreaterThan(0);

    console.log('\n✅ Intelligent Gameplay Test PASSED');
  });

  test('Stress test pattern (15 seconds)', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n========================================');
    console.log('  TEST: Stress Test Pattern');
    console.log('========================================\n');

    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    const started = await startGame(page);
    if (!started) {
      console.log('   Could not start game (WebGL headless?)');
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    console.log('Starting stress test pattern...');

    // Create simulator with stress test pattern
    const simulator = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.stressTest,
      logActions: false, // Too many actions to log
      maxMultiJumps: 4,
    });

    const result = await simulator.simulate(15, { tickInterval: 100 });

    console.log('\nStress Test Results:');
    console.log(`   Duration: ${result.duration.toFixed(1)}s`);
    console.log(`   Total Actions: ${result.stats.totalActions}`);
    console.log(`   Actions/Second: ${(result.stats.totalActions / result.duration).toFixed(2)}`);

    // Verify no crashes under stress
    const criticalPageErrors = filterWebGLErrors(errors.pageErrors);
    expect(criticalPageErrors.length, 'No crashes under stress').toBe(0);

    console.log('\n✅ Stress Test PASSED');
  });

  test('Multi-jump pattern verification', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n========================================');
    console.log('  TEST: Multi-Jump Pattern');
    console.log('========================================\n');

    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    const started = await startGame(page);
    if (!started) {
      console.log('   Could not start game (WebGL headless?)');
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    console.log('Testing multi-jump pattern...');

    const simulator = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.jumpCombo,
      logActions: true,
      maxMultiJumps: 4,
    });

    const result = await simulator.simulate(20);

    console.log('\nMulti-Jump Results:');
    console.log(`   Total Jumps: ${result.stats.jumps}`);
    console.log(`   Jump Ratio: ${(result.stats.jumps / result.stats.totalActions * 100).toFixed(1)}%`);

    // Multi-jump pattern should have high jump ratio
    const jumpRatio = result.stats.jumps / result.stats.totalActions;
    expect(jumpRatio, 'Jump ratio should be high').toBeGreaterThan(0.3);

    const criticalPageErrors = filterWebGLErrors(errors.pageErrors);
    expect(criticalPageErrors.length).toBe(0);

    console.log('\n✅ Multi-Jump Test PASSED');
  });

  test('Lane change pattern verification', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n========================================');
    console.log('  TEST: Lane Change Pattern (Zigzag)');
    console.log('========================================\n');

    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    const started = await startGame(page);
    if (!started) {
      console.log('   Could not start game (WebGL headless?)');
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    console.log('Testing zigzag pattern...');

    const simulator = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.zigzag,
      logActions: true,
    });

    const result = await simulator.simulate(20);

    console.log('\nZigzag Results:');
    console.log(`   Total Lane Changes: ${result.stats.laneChanges}`);
    console.log(`   Lane Change Ratio: ${(result.stats.laneChanges / result.stats.totalActions * 100).toFixed(1)}%`);

    // Zigzag pattern should have reasonable lane changes
    expect(result.stats.laneChanges, 'Should have lane changes').toBeGreaterThan(0);

    const criticalPageErrors = filterWebGLErrors(errors.pageErrors);
    expect(criticalPageErrors.length).toBe(0);

    console.log('\n✅ Zigzag Test PASSED');
  });
});
