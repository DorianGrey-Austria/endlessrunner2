/**
 * Game Test Utilities
 *
 * Shared utilities for SubwayRunner E2E tests.
 * Used by intelligent-gameplay, full-game-cycle, and multi-round-stability tests.
 */

/**
 * WebGL error patterns to filter (expected in headless mode)
 */
export const WEBGL_ERROR_PATTERNS = [
  'WebGL',
  'webgl',
  'context could not be created',
  'Error creating WebGL',
  'setClearColor',
  'THREE.WebGLRenderer',
  '403', // CDN rate limits
];

/**
 * Filter out expected WebGL/CDN errors
 * @param {string[]} errors - Array of error messages
 * @returns {string[]} Filtered critical errors
 */
export function filterWebGLErrors(errors) {
  return errors.filter(err =>
    !WEBGL_ERROR_PATTERNS.some(pattern => err.includes(pattern))
  );
}

/**
 * Human-like delay between actions (150-400ms default)
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {Promise<void>}
 */
export async function humanDelay(min = 150, max = 400) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Wait for game to be ready (canvas + Three.js + gameState)
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Timeout in ms (default: 30000)
 */
export async function waitForGameReady(page, timeout = 30000) {
  // Wait for page to be fully loaded first
  await page.waitForLoadState('domcontentloaded');

  // Wait for canvas
  await page.waitForSelector('canvas', { timeout });

  // 3D settle time (Golden Rule #25)
  await page.waitForTimeout(5000);

  // Verify Three.js and gameState with retry
  let ready = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!ready && attempts < maxAttempts) {
    try {
      ready = await page.evaluate(() => {
        return typeof THREE !== 'undefined' && typeof gameState !== 'undefined';
      });
    } catch (err) {
      // Navigation or context error - wait and retry
      attempts++;
      if (attempts < maxAttempts) {
        await page.waitForTimeout(1000);
      }
    }
  }

  if (!ready) {
    console.log('Warning: Game may not be fully ready (THREE or gameState not found)');
    // Don't throw - let tests handle this gracefully
  }

  return ready;
}

/**
 * Start the game by clicking the start button
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>} True if game started successfully
 */
export async function startGame(page) {
  // Find start button (various possible labels)
  const startButton = page.locator(
    'button:has-text("SPIELEN"), button:has-text("SPIEL STARTEN"), button:has-text("Start"), button:has-text("Play")'
  ).first();

  const isVisible = await startButton.isVisible().catch(() => false);
  if (!isVisible) {
    console.log('  No start button found');
    return false;
  }

  await startButton.click();
  await page.waitForTimeout(1000);

  // Verify game is playing
  const isPlaying = await page.evaluate(() =>
    typeof gameState !== 'undefined' && gameState.isPlaying === true
  ).catch(() => false);

  return isPlaying;
}

/**
 * Get current game state
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<GameState|null>}
 */
export async function getGameState(page) {
  return page.evaluate(() => {
    if (typeof gameState === 'undefined') return null;

    return {
      isPlaying: gameState.isPlaying,
      isGameOver: gameState.isGameOver,
      isPaused: gameState.isPaused,
      score: gameState.score,
      lives: gameState.lives,
      level: gameState.level,
      timer: gameState.timer,
      currentLane: gameState.currentLane !== undefined ? gameState.currentLane : 1,
      jumpCount: gameState.jumpCount || 0,
      isJumping: gameState.isJumping || false,
      isDucking: gameState.isDucking || false,
    };
  }).catch(() => null);
}

/**
 * Perform a game action
 * @param {import('@playwright/test').Page} page
 * @param {'JUMP'|'DUCK'|'MOVE_LEFT'|'MOVE_RIGHT'|'NONE'} action
 */
export async function performAction(page, action) {
  switch (action) {
    case 'JUMP':
      await page.keyboard.press('Space');
      break;
    case 'DUCK':
      await page.keyboard.press('s');
      break;
    case 'MOVE_LEFT':
      await page.keyboard.press('a');
      break;
    case 'MOVE_RIGHT':
      await page.keyboard.press('d');
      break;
    case 'NONE':
    default:
      // Do nothing
      break;
  }
}

/**
 * Click the restart/play again button after game over
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>} True if restart was successful
 */
export async function restartGame(page) {
  // Wait a moment for game over UI to appear
  await page.waitForTimeout(1500);

  // Find restart button (various possible labels)
  const restartButton = page.locator(
    'button:has-text("Nochmal"), button:has-text("NOCHMAL"), button:has-text("Restart"), button:has-text("Neues Spiel"), button:has-text("SPIELEN")'
  ).first();

  const isVisible = await restartButton.isVisible().catch(() => false);
  if (!isVisible) {
    console.log('  No restart button found');
    return false;
  }

  await restartButton.click();
  await page.waitForTimeout(1000);

  // Verify game is playing again
  const isPlaying = await page.evaluate(() =>
    typeof gameState !== 'undefined' && gameState.isPlaying === true
  ).catch(() => false);

  return isPlaying;
}

/**
 * Enter name in highscore input (if visible)
 * @param {import('@playwright/test').Page} page
 * @param {string} name - Player name to enter
 * @returns {Promise<boolean>} True if name was entered
 */
export async function enterHighscoreName(page, name = 'TestPlayer') {
  const nameInput = page.locator('input[type="text"], input[placeholder*="Name"], input#playerName');
  const isVisible = await nameInput.isVisible().catch(() => false);

  if (!isVisible) {
    return false;
  }

  await nameInput.fill(name);

  // Try to submit
  const submitButton = page.locator('button:has-text("Speichern"), button:has-text("OK"), button:has-text("Submit")').first();
  if (await submitButton.isVisible().catch(() => false)) {
    await submitButton.click();
  } else {
    await page.keyboard.press('Enter');
  }

  await page.waitForTimeout(500);
  return true;
}

/**
 * Get memory metrics for leak detection
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<MemoryMetrics|null>}
 */
export async function getMemoryMetrics(page) {
  return page.evaluate(() => {
    if (typeof scene === 'undefined' || typeof gameState === 'undefined') {
      return null;
    }

    return {
      sceneChildren: scene.children ? scene.children.length : 0,
      obstacles: gameState.obstacles ? gameState.obstacles.length : 0,
      collectibles: (gameState.apples ? gameState.apples.length : 0) +
                    (gameState.broccolis ? gameState.broccolis.length : 0),
      hasRenderer: typeof renderer !== 'undefined',
      hasCamera: typeof camera !== 'undefined',
    };
  }).catch(() => null);
}

/**
 * Setup error collectors for a page
 * @param {import('@playwright/test').Page} page
 * @returns {{ consoleErrors: string[], pageErrors: string[], requestFailures: string[] }}
 */
export function setupErrorCollectors(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', request => {
    requestFailures.push(`${request.url()} - ${request.failure()?.errorText || 'unknown'}`);
  });

  return { consoleErrors, pageErrors, requestFailures };
}

/**
 * @typedef {Object} GameState
 * @property {boolean} isPlaying
 * @property {boolean} isGameOver
 * @property {boolean} isPaused
 * @property {number} score
 * @property {number} lives
 * @property {number} level
 * @property {number} timer
 * @property {number} currentLane
 * @property {number} jumpCount
 * @property {boolean} isJumping
 * @property {boolean} isDucking
 */

/**
 * @typedef {Object} MemoryMetrics
 * @property {number} sceneChildren
 * @property {number} obstacles
 * @property {number} collectibles
 * @property {boolean} hasRenderer
 * @property {boolean} hasCamera
 */
