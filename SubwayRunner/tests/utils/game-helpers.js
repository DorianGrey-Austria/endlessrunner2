// 🎮 GAME TEST HELPERS - Core utilities for testing browser games
import { expect } from '@playwright/test';

export class GameTestHelpers {
  /**
   * Waits for game to be fully initialized and ready
   * Robust version with better error handling
   */
  static async waitForGameReady(page, timeout = 20000) {
    const startTime = Date.now();

    try {
      console.log('🎮 Waiting for game to be ready...');

      // Step 1: Wait for page to load completely
      await page.waitForLoadState('networkidle', { timeout: 5000 });

      // Step 2: Wait for Three.js - this is critical
      await page.waitForFunction(
        () => typeof THREE !== 'undefined',
        { timeout: 8000 }
      );
      console.log('✅ Three.js loaded');

      // Step 3: Look for any game initialization indicators (flexible)
      const gameReady = await page.waitForFunction(
        () => {
          // Multiple ways the game could be ready
          return document.readyState === 'complete' &&
                 typeof THREE !== 'undefined' &&
                 (document.querySelector('canvas') !== null ||
                  document.querySelector('#gameCanvas') !== null ||
                  window.gameState !== undefined ||
                  window.GameCore !== undefined ||
                  typeof window.startGame === 'function');
        },
        { timeout: 7000 }
      );

      const loadTime = Date.now() - startTime;
      console.log(`✅ Game ready for testing (${loadTime}ms)`);

    } catch (error) {
      console.log(`⚠️ Game initialization timeout after ${Date.now() - startTime}ms`);

      // Try a simple fallback - just ensure page is loaded
      try {
        await page.waitForLoadState('domcontentloaded', { timeout: 3000 });

        const hasBasicGame = await page.evaluate(() => {
          return typeof THREE !== 'undefined' ||
                 document.querySelector('canvas') !== null ||
                 document.title.toLowerCase().includes('subway');
        });

        if (hasBasicGame) {
          console.log('✅ Basic game structure detected');
          return;
        }
      } catch (fallbackError) {
        console.log('❌ Fallback failed, but continuing...');
      }

      // Don't throw - let tests try to continue
      console.log('⚠️ Proceeding with potentially incomplete game state');
    }
  }

  /**
   * Cache-busting strategy for reliable testing
   */
  static async bustCache(page) {
    // Clear all storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB if present
      if (window.indexedDB) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
          });
        });
      }
    });

    // Clear cookies
    const context = page.context();
    await context.clearCookies();

    // Add cache-busting timestamp
    const timestamp = Date.now();
    await page.addInitScript(() => {
      // Intercept resource loading
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (typeof url === 'string') {
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}v=${Date.now()}&cb=${Math.random()}`;
        }
        return originalFetch(url, options);
      };
    });
  }

  /**
   * Simulates realistic gameplay for stress testing
   */
  static async simulateGameplay(page, duration = 30000, intensity = 'normal') {
    const actions = {
      light: ['ArrowLeft', 'ArrowRight'],
      normal: ['ArrowLeft', 'ArrowRight', 'Space'],
      intense: ['ArrowLeft', 'ArrowRight', 'Space', 'KeyS', 'KeyA', 'KeyD']
    };

    const gameActions = actions[intensity] || actions.normal;
    const endTime = Date.now() + duration;
    let actionCount = 0;

    console.log(`🎮 Starting ${intensity} gameplay simulation for ${duration}ms`);

    while (Date.now() < endTime) {
      const randomAction = gameActions[Math.floor(Math.random() * gameActions.length)];
      await page.keyboard.press(randomAction);

      // Random interval between actions (realistic human behavior)
      const interval = intensity === 'intense' ? 100 + Math.random() * 300 :
                      intensity === 'light' ? 500 + Math.random() * 1000 :
                      200 + Math.random() * 600;

      await page.waitForTimeout(interval);
      actionCount++;

      // Check if game is still running every 50 actions
      if (actionCount % 50 === 0) {
        const gameRunning = await this.isGameRunning(page);
        if (!gameRunning) {
          console.log('⚠️ Game stopped during simulation');
          break;
        }
      }
    }

    console.log(`✅ Gameplay simulation completed: ${actionCount} actions`);
    return actionCount;
  }

  /**
   * Captures comprehensive game state for analysis
   */
  static async captureGameState(page) {
    return await page.evaluate(() => {
      const state = {
        timestamp: Date.now(),
        score: window.gameState?.score || 0,
        level: window.gameState?.currentLevel || window.currentLevel || 1,
        gameTime: window.gameState?.gameTime || 0,
        isPlaying: false,
        player: {
          position: { x: 0, y: 0, z: 0 },
          health: 100,
          lane: 1
        },
        performance: {
          fps: 0,
          memory: null
        },
        ui: {
          visible: false,
          responsive: false
        }
      };

      // Game state detection
      if (window.gameState) {
        state.isPlaying = window.gameState.gameState === 'playing' ||
                         window.gameState.isPlaying === true;

        if (window.gameState.player) {
          state.player.position = window.gameState.player.position || state.player.position;
          state.player.health = window.gameState.lives || window.gameState.health || 100;
        }
      }

      // Performance metrics
      if (window.stats && window.stats.getFPS) {
        state.performance.fps = window.stats.getFPS();
      }

      if (performance.memory) {
        state.performance.memory = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }

      // UI state
      const canvas = document.querySelector('#gameCanvas');
      const startButton = document.querySelector('#startButton, #start-button');

      state.ui.visible = canvas && canvas.style.display !== 'none';
      state.ui.responsive = window.innerWidth > 0 && window.innerHeight > 0;

      return state;
    });
  }

  /**
   * Checks if game is currently running
   */
  static async isGameRunning(page) {
    return await page.evaluate(() => {
      return window.gameState?.gameState === 'playing' ||
             window.gameState?.isPlaying === true ||
             (window.GameCore && window.GameCore.isRunning);
    });
  }

  /**
   * Forces game over for testing game over flow
   */
  static async forceGameOver(page) {
    await page.evaluate(() => {
      if (window.gameState) {
        window.gameState.lives = 0;
        window.gameState.health = 0;
      }

      if (window.gameOver && typeof window.gameOver === 'function') {
        window.gameOver();
      }

      if (window.GameCore && window.GameCore.gameOver) {
        window.GameCore.gameOver();
      }
    });
  }

  /**
   * Starts game safely with error handling
   */
  static async startGame(page) {
    try {
      // Try to find and click start button
      const startButton = await page.locator('#startButton, #start-button, .start-btn').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
        return true;
      }

      // Try programmatic start
      const started = await page.evaluate(() => {
        if (window.startGame && typeof window.startGame === 'function') {
          window.startGame();
          return true;
        }
        if (window.GameCore && window.GameCore.start) {
          window.GameCore.start();
          return true;
        }
        return false;
      });

      if (started) {
        await page.waitForTimeout(1000);
        return true;
      }

      throw new Error('No start method found');
    } catch (error) {
      console.error('Failed to start game:', error);
      return false;
    }
  }

  /**
   * Monitors FPS over a period of time
   */
  static async monitorFPS(page, duration = 10000) {
    await page.evaluate((dur) => {
      window.fpsData = [];
      let frameCount = 0;
      let lastTime = performance.now();

      function countFPS() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          window.fpsData.push({
            fps: fps,
            timestamp: currentTime
          });
          frameCount = 0;
          lastTime = currentTime;
        }

        if (window.fpsData.length < dur / 1000) {
          requestAnimationFrame(countFPS);
        }
      }

      countFPS();
    }, duration);

    // Wait for monitoring to complete
    await page.waitForTimeout(duration + 1000);

    return await page.evaluate(() => window.fpsData || []);
  }

  /**
   * Checks for memory leaks
   */
  static async checkMemoryLeaks(page, initialMeasurement = null) {
    const currentMemory = await page.evaluate(() => {
      if (!performance.memory) return null;

      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    });

    if (!currentMemory) return { hasLeak: false, message: 'Memory API not available' };

    if (!initialMeasurement) {
      return { hasLeak: false, measurement: currentMemory };
    }

    const memoryGrowth = currentMemory.used - initialMeasurement.used;
    const memoryGrowthMB = memoryGrowth / (1024 * 1024);
    const timeDiff = currentMemory.timestamp - initialMeasurement.timestamp;

    return {
      hasLeak: memoryGrowthMB > 50, // More than 50MB growth
      growth: memoryGrowthMB,
      timeElapsed: timeDiff,
      growthRate: memoryGrowthMB / (timeDiff / 1000), // MB per second
      current: currentMemory,
      initial: initialMeasurement
    };
  }

  /**
   * Takes screenshot with game state overlay
   */
  static async screenshotWithGameState(page, filename = 'game-state') {
    const gameState = await this.captureGameState(page);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Add game state overlay
    await page.evaluate((state) => {
      const overlay = document.createElement('div');
      overlay.id = 'test-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        border-radius: 5px;
      `;

      overlay.innerHTML = `
        <div>Score: ${state.score}</div>
        <div>Level: ${state.level}</div>
        <div>FPS: ${state.performance.fps}</div>
        <div>Playing: ${state.isPlaying}</div>
        <div>Time: ${new Date().toLocaleTimeString()}</div>
      `;

      document.body.appendChild(overlay);
    }, gameState);

    const screenshotPath = `tests/reports/${filename}-${timestamp}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Remove overlay
    await page.evaluate(() => {
      const overlay = document.getElementById('test-overlay');
      if (overlay) overlay.remove();
    });

    return screenshotPath;
  }
}

export default GameTestHelpers;