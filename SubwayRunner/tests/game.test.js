// @ts-check
const { test, expect } = require('@playwright/test');

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

    // Check if GameCore is initialized
    const gameCoreLoaded = await page.evaluate(() => {
      return typeof GameCore !== 'undefined' && GameCore.initialized;
    });
    expect(gameCoreLoaded).toBe(true);

    // Check if start button exists
    await expect(page.locator('#startButton')).toBeVisible();
  });

  test('Game starts correctly', async ({ page }) => {
    await page.click('#startButton');
    
    // Wait for game to start
    await page.waitForTimeout(1000);
    
    // Check if game is running
    const gameRunning = await page.evaluate(() => {
      return gameState && gameState.isPlaying;
    });
    expect(gameRunning).toBe(true);

    // Check if score is displayed
    await expect(page.locator('#score')).toBeVisible();
  });

  test('Level progression works', async ({ page }) => {
    await page.click('#startButton');
    
    // Set score to 1000 to trigger level transition
    await page.evaluate(() => {
      gameState.score = 1000;
    });
    
    // Trigger level check
    await page.evaluate(() => {
      const levelManager = GameCore.getModule('levels');
      if (levelManager) {
        levelManager.checkLevelTransition(1000);
      }
    });
    
    // Check if level 2 is loaded
    const currentLevel = await page.evaluate(() => {
      const levelManager = GameCore.getModule('levels');
      return levelManager ? levelManager.currentLevel : 0;
    });
    expect(currentLevel).toBe(2);
    
    // Check for level change notification
    await expect(page.locator('.notification')).toContainText('Level 2');
  });

  test('Controls work correctly', async ({ page }) => {
    await page.click('#startButton');
    await page.waitForTimeout(1000);
    
    // Test keyboard controls
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    
    // Check if game is still running after controls
    const gameRunning = await page.evaluate(() => {
      return gameState && gameState.isPlaying;
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