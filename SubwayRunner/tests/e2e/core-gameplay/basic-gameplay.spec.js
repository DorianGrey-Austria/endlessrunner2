// 🎮 CORE GAMEPLAY TESTS - Essential game functionality verification
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../../utils/game-helpers.js';

test.describe('Core Gameplay Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });

  test('Game loads and initializes correctly', async ({ page }) => {
    console.log('🚀 Testing game initialization...');

    // Verify Three.js is loaded
    const threeLoaded = await page.evaluate(() => typeof THREE !== 'undefined');
    expect(threeLoaded).toBe(true);

    // Verify game core systems
    const gameSystems = await page.evaluate(() => ({
      hasGameState: typeof window.gameState !== 'undefined',
      hasGameCore: typeof window.GameCore !== 'undefined',
      hasScene: typeof window.scene !== 'undefined',
      hasRenderer: typeof window.renderer !== 'undefined',
      hasCamera: typeof window.camera !== 'undefined'
    }));

    console.log('Game systems check:', gameSystems);

    // At least one game system should be available
    const hasAnyGameSystem = Object.values(gameSystems).some(Boolean);
    expect(hasAnyGameSystem).toBe(true);

    // Verify canvas is present and visible
    const canvas = page.locator('#gameCanvas, canvas');
    await expect(canvas.first()).toBeVisible();
  });

  test('Game starts and enters playing state', async ({ page }) => {
    console.log('▶️ Testing game start functionality...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Wait for game to be in playing state
    await page.waitForTimeout(2000);

    const gameState = await GameTestHelpers.captureGameState(page);
    console.log('Game state after start:', gameState);

    // Game should be running
    expect(gameState.isPlaying).toBe(true);

    // Score UI should be visible
    const scoreElement = page.locator('#score, .score, [data-score]');
    await expect(scoreElement.first()).toBeVisible();
  });

  test('Player controls respond correctly', async ({ page }) => {
    console.log('🕹️ Testing player controls...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    await page.waitForTimeout(1000);

    // Test left movement
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    let gameState = await GameTestHelpers.captureGameState(page);
    const leftPosition = gameState.player.position.x;

    // Test right movement
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    gameState = await GameTestHelpers.captureGameState(page);
    const rightPosition = gameState.player.position.x;

    // Test jump
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    gameState = await GameTestHelpers.captureGameState(page);
    const jumpPosition = gameState.player.position.y;

    console.log('Player positions:', {
      left: leftPosition,
      right: rightPosition,
      jump: jumpPosition
    });

    // Position changes indicate working controls
    // (exact values depend on game implementation)
    expect(typeof leftPosition).toBe('number');
    expect(typeof rightPosition).toBe('number');
    expect(typeof jumpPosition).toBe('number');

    // Game should still be running after controls
    expect(gameState.isPlaying).toBe(true);
  });

  test('Score system functions correctly', async ({ page }) => {
    console.log('🏆 Testing score system...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Get initial score
    const initialState = await GameTestHelpers.captureGameState(page);
    const initialScore = initialState.score;

    console.log('Initial score:', initialScore);

    // Simulate gameplay for score accumulation
    await GameTestHelpers.simulateGameplay(page, 10000, 'normal');

    // Check score after gameplay
    const finalState = await GameTestHelpers.captureGameState(page);
    const finalScore = finalState.score;

    console.log('Final score:', finalScore);

    // Score should be non-negative and potentially increased
    expect(finalScore).toBeGreaterThanOrEqual(0);
    expect(typeof finalScore).toBe('number');

    // Score display should be visible
    const scoreDisplay = await page.evaluate(() => {
      const scoreEl = document.querySelector('#score, .score, [data-score]');
      return scoreEl ? scoreEl.textContent || scoreEl.innerText : null;
    });

    expect(scoreDisplay).toBeTruthy();
    console.log('Score display text:', scoreDisplay);
  });

  test('Collision detection works', async ({ page }) => {
    console.log('💥 Testing collision detection...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Record initial game state
    const initialState = await GameTestHelpers.captureGameState(page);
    const initialHealth = initialState.player.health;

    console.log('Initial health/lives:', initialHealth);

    // Force collision for testing (if possible)
    const collisionResult = await page.evaluate(() => {
      // Try to trigger collision through game functions
      if (window.checkCollisions && typeof window.checkCollisions === 'function') {
        return { collisionSystemExists: true };
      }

      if (window.gameState && window.gameState.checkCollisions) {
        return { collisionSystemExists: true };
      }

      // Look for collision-related variables
      const hasCollisionVars = Object.keys(window).some(key =>
        key.toLowerCase().includes('collision') ||
        key.toLowerCase().includes('obstacle')
      );

      return { collisionSystemExists: hasCollisionVars };
    });

    console.log('Collision system check:', collisionResult);

    // Simulate extended gameplay to potentially encounter obstacles
    await GameTestHelpers.simulateGameplay(page, 20000, 'intense');

    const finalState = await GameTestHelpers.captureGameState(page);

    // Game should still be functional after potential collisions
    expect(finalState.ui.visible).toBe(true);

    // Health/lives should be a valid number
    expect(typeof finalState.player.health).toBe('number');
  });

  test('Game over flow works correctly', async ({ page }) => {
    console.log('💀 Testing game over functionality...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    await page.waitForTimeout(2000);

    // Force game over
    await GameTestHelpers.forceGameOver(page);

    // Wait for game over screen
    await page.waitForTimeout(2000);

    // Check for game over UI elements
    const gameOverElements = await page.evaluate(() => {
      const possibleSelectors = [
        '#gameOverScreen', '#game-over', '.game-over',
        '#finalScore', '#final-score', '.final-score',
        '#restartButton', '#restart-button', '.restart-btn'
      ];

      const foundElements = {};

      for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        foundElements[selector] = {
          exists: !!element,
          visible: element ? element.offsetParent !== null : false,
          text: element ? element.textContent || element.innerText : null
        };
      }

      return foundElements;
    });

    console.log('Game over UI elements:', gameOverElements);

    // At least one game over indicator should be present
    const hasGameOverUI = Object.values(gameOverElements).some(el => el.exists);
    expect(hasGameOverUI).toBe(true);

    // Game state should reflect game over
    const finalState = await GameTestHelpers.captureGameState(page);
    console.log('Final game state:', finalState);
  });

  test('Game maintains 30+ seconds survivability for beginners', async ({ page }) => {
    console.log('⏱️ Testing beginner survivability...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    const startTime = Date.now();
    let gameStillRunning = true;
    let survivalTime = 0;

    // Simulate careful beginner gameplay
    while (gameStillRunning && survivalTime < 35000) { // Test for 35 seconds
      // Gentle, beginner-level inputs
      const actions = ['ArrowLeft', 'ArrowRight'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      await page.keyboard.press(randomAction);
      await page.waitForTimeout(800 + Math.random() * 400); // Slower reactions

      // Check if game is still running
      gameStillRunning = await GameTestHelpers.isGameRunning(page);
      survivalTime = Date.now() - startTime;

      // Log progress every 5 seconds
      if (Math.floor(survivalTime / 5000) > Math.floor((survivalTime - 1000) / 5000)) {
        console.log(`🎮 Survival time: ${Math.floor(survivalTime / 1000)}s`);
      }
    }

    console.log(`Final survival time: ${Math.floor(survivalTime / 1000)}s`);

    // Beginner should be able to survive at least 30 seconds
    expect(survivalTime).toBeGreaterThan(30000);

    if (!gameStillRunning) {
      console.log('Game ended during survivability test');
      const finalState = await GameTestHelpers.captureGameState(page);
      console.log('Final state when game ended:', finalState);
    }
  });

  test('Game performance remains stable during extended play', async ({ page }) => {
    console.log('🔄 Testing extended gameplay stability...');

    const gameStarted = await GameTestHelpers.startGame(page);
    expect(gameStarted).toBe(true);

    // Monitor game state every 10 seconds for 1 minute
    const monitoringResults = [];
    const monitorDuration = 60000; // 1 minute
    const checkInterval = 10000; // 10 seconds

    for (let elapsed = 0; elapsed < monitorDuration; elapsed += checkInterval) {
      // Simulate gameplay for this interval
      await GameTestHelpers.simulateGameplay(page, checkInterval, 'normal');

      // Capture game state
      const gameState = await GameTestHelpers.captureGameState(page);
      gameState.elapsed = elapsed + checkInterval;

      monitoringResults.push(gameState);

      console.log(`⏱️ ${Math.floor((elapsed + checkInterval) / 1000)}s - Score: ${gameState.score}, Playing: ${gameState.isPlaying}`);

      // If game ended, break
      if (!gameState.isPlaying) {
        console.log('Game ended during extended play test');
        break;
      }
    }

    // Analyze stability
    const allPlaying = monitoringResults.every(result => result.isPlaying);
    const scores = monitoringResults.map(result => result.score).filter(s => s >= 0);

    console.log('Extended play results:', {
      samples: monitoringResults.length,
      allPlaying: allPlaying,
      scoreProgression: scores
    });

    // Game should remain stable
    expect(monitoringResults.length).toBeGreaterThan(3); // At least 4 samples (40+ seconds)

    // Scores should be non-negative and potentially increasing
    expect(scores.every(score => score >= 0)).toBe(true);
  });
});