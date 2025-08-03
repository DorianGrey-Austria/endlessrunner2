// @ts-check
import { test, expect } from '@playwright/test';

test.describe('SubwayRunner Game Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001');
    await page.waitForLoadState('networkidle');
  });

  test('Game loads successfully', async ({ page }) => {
    // Check if Three.js is loaded
    const threeLoaded = await page.evaluate(() => {
      return typeof THREE !== 'undefined';
    });
    expect(threeLoaded).toBe(true);

    // Check if basic game variables exist (V2.1 structure)
    const gameVariablesExist = await page.evaluate(() => {
      return typeof gameState !== 'undefined' && typeof scene !== 'undefined';
    });
    expect(gameVariablesExist).toBe(true);

    // Check if canvas exists and is ready
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('Game starts correctly', async ({ page }) => {
    // V2.1 starts automatically, no start button needed
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    // Check if game is running (V2.1 structure)
    const gameRunning = await page.evaluate(() => {
      return gameState && gameState.isPlaying === true;
    });
    expect(gameRunning).toBe(true);

    // Check if score UI exists
    const scoreVisible = await page.evaluate(() => {
      return document.querySelector('#score') !== null;
    });
    expect(scoreVisible).toBe(true);
  });

  test('Collectibles system works', async ({ page }) => {
    // Wait for game to start
    await page.waitForTimeout(2000);
    
    // Check if collectibles counters exist
    const applesCounterExists = await page.evaluate(() => {
      return document.querySelector('#applesCount') !== null;
    });
    expect(applesCounterExists).toBe(true);
    
    const broccolisCounterExists = await page.evaluate(() => {
      return document.querySelector('#broccolisCount') !== null;
    });
    expect(broccolisCounterExists).toBe(true);
    
    // Check if collectibles spawn system is working
    const collectiblesSpawning = await page.evaluate(() => {
      return gameState.lastCollectibleSpawn !== undefined && 
             gameState.collectibleSpawnInterval === 4000;
    });
    expect(collectiblesSpawning).toBe(true);
  });

  test('Controls work correctly', async ({ page }) => {
    // Wait for game to start
    await page.waitForTimeout(2000);
    
    // Test keyboard controls (V2.1 uses WASD and arrows)
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space'); // Jump in V2.1
    
    // Check if game is still running after controls
    const gameRunning = await page.evaluate(() => {
      return gameState && gameState.isPlaying === true;
    });
    expect(gameRunning).toBe(true);
  });

  test('Performance meets requirements', async ({ page }) => {
    await page.click('#startButton');
    
    // Measure FPS over 2 seconds
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          const elapsed = performance.now() - startTime;
          
          if (elapsed >= 2000) {
            resolve(frameCount / 2); // FPS over 2 seconds
          } else {
            requestAnimationFrame(countFrames);
          }
        }
        
        countFrames();
      });
    });
    
    console.log(`Game FPS: ${fps.toFixed(2)}`);
    expect(fps).toBeGreaterThan(30); // Minimum 30 FPS
  });

  test('Game over works correctly', async ({ page }) => {
    await page.click('#startButton');
    
    // Force game over
    await page.evaluate(() => {
      gameState.lives = 0;
      gameOver();
    });
    
    // Check if game over screen appears
    await expect(page.locator('#gameOverScreen')).toBeVisible();
    await expect(page.locator('#finalScore')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if game adapts to mobile
    const gameContainer = page.locator('#gameContainer');
    await expect(gameContainer).toBeVisible();
    
    // Check if touch controls are available
    const touchControls = page.locator('.touch-controls');
    await expect(touchControls).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('Handles missing Three.js gracefully', async ({ page }) => {
    // Block Three.js loading
    await page.route('**/three.min.js', route => route.abort());
    
    await page.goto('http://localhost:8001');
    
    // Check if error message is displayed
    const errorMessage = await page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('Handles network errors', async ({ page }) => {
    await page.goto('http://localhost:8001');
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    // Game should still work with cached resources
    await page.click('#startButton');
    
    // Check if game can start offline
    const gameRunning = await page.evaluate(() => {
      return gameState && gameState.isPlaying;
    });
    expect(gameRunning).toBe(true);
  });
});