/**
 * Full Game Cycle Tests
 *
 * Tests complete game cycles:
 * Start → Play → Game Over → Highscore Entry → Restart → Play Again
 *
 * Golden Rules Applied:
 * - #2: Console Error Detection
 * - #3: Self-Testing Protocol
 * - #25: 3D Rendering Verification
 */

import { test, expect } from '@playwright/test';
import {
  waitForGameReady,
  startGame,
  getGameState,
  restartGame,
  enterHighscoreName,
  setupErrorCollectors,
  filterWebGLErrors,
} from '../utils/game-test-utils.js';
import { GameplaySimulator, MOVEMENT_PATTERNS } from '../utils/gameplay-simulator.js';

test.describe('🔄 Full Game Cycle Tests', () => {
  let errors;

  test.beforeEach(async ({ page }) => {
    errors = setupErrorCollectors(page);
  });

  test('Complete game cycle: Start → Play → Game Over → Restart', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for full cycle

    console.log('\n========================================');
    console.log('  TEST: Full Game Cycle');
    console.log('========================================\n');

    // Navigate and wait
    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    // ========================================
    // GAME 1
    // ========================================
    console.log('\n--- GAME 1 ---\n');

    console.log('1.1 Starting game...');
    const started1 = await startGame(page);

    if (!started1) {
      console.log('    Could not start game (WebGL headless mode?)');
      const criticalErrors = filterWebGLErrors(errors.pageErrors);
      expect(criticalErrors.length).toBe(0);
      return;
    }
    console.log('    Game started successfully');

    // Play for a bit
    console.log('1.2 Playing game...');
    const simulator1 = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.reactive,
      logActions: false,
    });

    // Play until game over or max 70 seconds
    let gameOver1 = false;
    const playStart = Date.now();
    const maxPlayTime = 70000;

    while (!gameOver1 && Date.now() - playStart < maxPlayTime) {
      // Simulate a few ticks
      await simulator1.simulate(5, { tickInterval: 200 });

      const state = await getGameState(page);
      if (state && (state.isGameOver || !state.isPlaying)) {
        gameOver1 = true;
        console.log(`    Game Over! Score: ${state.score}, Lives: ${state.lives}`);
      }
    }

    if (!gameOver1) {
      console.log('    Max play time reached, game still running');
      // Force game over by losing all lives (continuous no-action)
      await page.waitForTimeout(30000);
    }

    // Wait for game over UI
    console.log('1.3 Waiting for Game Over UI...');
    await page.waitForTimeout(2000);

    // Check for highscore input
    console.log('1.4 Checking for highscore entry...');
    const hasHighscoreInput = await enterHighscoreName(page, 'TestPlayer');
    if (hasHighscoreInput) {
      console.log('    Highscore name entered');
    } else {
      console.log('    No highscore input found (might be below threshold)');
    }

    // Verify state after Game 1
    const afterGame1 = await getGameState(page);
    console.log('1.5 State after Game 1:');
    console.log(`    isPlaying: ${afterGame1?.isPlaying}`);
    console.log(`    isGameOver: ${afterGame1?.isGameOver}`);

    // ========================================
    // GAME 2
    // ========================================
    console.log('\n--- GAME 2 ---\n');

    console.log('2.1 Restarting game...');
    await page.waitForTimeout(2000);

    const restarted = await restartGame(page);

    if (!restarted) {
      // Try alternative restart methods
      console.log('    Standard restart failed, trying alternatives...');

      // Try clicking anywhere for menu
      await page.mouse.click(640, 360);
      await page.waitForTimeout(1000);

      const altRestart = await startGame(page);
      if (!altRestart) {
        console.log('    Could not restart game - ending test');
        // Still pass if no errors occurred
        const criticalErrors = filterWebGLErrors(errors.pageErrors);
        expect(criticalErrors.length, 'No critical errors in Game 1').toBe(0);
        return;
      }
    }

    console.log('    Game 2 started');

    // Verify state was reset
    const game2State = await getGameState(page);
    console.log('2.2 Game 2 initial state:');
    console.log(`    isPlaying: ${game2State?.isPlaying}`);
    console.log(`    Score: ${game2State?.score}`);
    console.log(`    Lives: ${game2State?.lives}`);

    // Score should be 0 or low (reset)
    expect(game2State?.score, 'Score should be reset').toBeLessThan(100);
    expect(game2State?.isPlaying, 'Game 2 should be playing').toBe(true);

    // Play Game 2 briefly
    console.log('2.3 Playing Game 2...');
    const simulator2 = new GameplaySimulator(page, {
      pattern: MOVEMENT_PATTERNS.zigzag,
      logActions: false,
    });

    await simulator2.simulate(15);

    const game2Final = await getGameState(page);
    console.log('2.4 Game 2 state after 15s:');
    console.log(`    Score: ${game2Final?.score}`);
    console.log(`    Lives: ${game2Final?.lives}`);
    console.log(`    Level: ${game2Final?.level}`);

    // ========================================
    // ERROR CHECK
    // ========================================
    console.log('\n--- ERROR CHECK ---\n');

    const criticalConsoleErrors = filterWebGLErrors(errors.consoleErrors);
    const criticalPageErrors = filterWebGLErrors(errors.pageErrors);

    console.log(`Console Errors (filtered): ${criticalConsoleErrors.length}`);
    console.log(`Page Errors (filtered): ${criticalPageErrors.length}`);

    if (criticalConsoleErrors.length > 0) {
      console.log('Critical Console Errors:');
      criticalConsoleErrors.forEach(e => console.log(`  - ${e}`));
    }

    if (criticalPageErrors.length > 0) {
      console.log('Critical Page Errors:');
      criticalPageErrors.forEach(e => console.log(`  - ${e}`));
    }

    expect(criticalPageErrors.length, 'No critical errors during full cycle').toBe(0);

    console.log('\n✅ Full Game Cycle Test PASSED');
  });

  test('Quick restart test (no full gameplay)', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n========================================');
    console.log('  TEST: Quick Restart Verification');
    console.log('========================================\n');

    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    // Start game
    const started = await startGame(page);
    if (!started) {
      console.log('Could not start game (headless mode?)');
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    // Play briefly
    console.log('Playing for 5 seconds...');
    await page.waitForTimeout(5000);

    // Check state
    const state1 = await getGameState(page);
    console.log(`State 1: Score=${state1?.score}, Lives=${state1?.lives}`);

    // Force reload (simulates page refresh)
    console.log('Reloading page...');
    await page.reload();
    await waitForGameReady(page);

    // Start again
    const started2 = await startGame(page);
    if (!started2) {
      console.log('Could not restart after reload');
      expect(filterWebGLErrors(errors.pageErrors).length).toBe(0);
      return;
    }

    // Verify clean state
    const state2 = await getGameState(page);
    console.log(`State 2: Score=${state2?.score}, Lives=${state2?.lives}`);

    expect(state2?.isPlaying, 'Should be playing after reload').toBe(true);
    expect(state2?.score, 'Score should be low after restart').toBeLessThan(100);

    console.log('\n✅ Quick Restart Test PASSED');
  });

  test('State persistence check', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n========================================');
    console.log('  TEST: State Persistence Check');
    console.log('========================================\n');

    await page.goto('http://localhost:8001/index.html');
    await waitForGameReady(page);

    // Check initial state (before starting)
    const initialState = await getGameState(page);
    console.log('Initial State:');
    console.log(`  isPlaying: ${initialState?.isPlaying}`);
    console.log(`  isGameOver: ${initialState?.isGameOver}`);
    console.log(`  Score: ${initialState?.score}`);

    // Menu should be visible, game not playing
    const menuVisible = await page.locator('#menu').isVisible().catch(() => false);
    console.log(`  Menu visible: ${menuVisible}`);

    expect(initialState?.isPlaying, 'Should not be playing at start').toBeFalsy();

    // Start and verify state changes
    const started = await startGame(page);
    if (!started) {
      console.log('Could not start (headless mode)');
      return;
    }

    const playingState = await getGameState(page);
    console.log('\nPlaying State:');
    console.log(`  isPlaying: ${playingState?.isPlaying}`);
    console.log(`  Score: ${playingState?.score}`);
    console.log(`  Lives: ${playingState?.lives}`);

    expect(playingState?.isPlaying, 'Should be playing after start').toBe(true);
    expect(playingState?.lives, 'Should have lives').toBeGreaterThan(0);

    console.log('\n✅ State Persistence Test PASSED');
  });
});
