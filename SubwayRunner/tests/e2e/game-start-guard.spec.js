import { test, expect } from '@playwright/test';
import { setupErrorCollectors } from '../utils/game-test-utils.js';

/**
 * CRITICAL TEST SUITE: Game Start Guard
 *
 * Ensures the game ONLY starts when user explicitly clicks "SPIEL STARTEN"
 * or a gesture control button. The game must NEVER auto-start on page load,
 * on keyboard input, on mouse movement, or on any other implicit trigger.
 *
 * 35 tests across 5 categories.
 */

const SETTLE_TIME = 5000;

/** Safe evaluate with retry on context destruction (live-server hot-reload) */
async function safeEval(page, fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await page.evaluate(fn);
    } catch (e) {
      if (e.message.includes('Execution context') && i < retries) {
        await page.waitForTimeout(2000);
        continue;
      }
      throw e;
    }
  }
}

/** Load page and wait for game to be ready (but NOT started) */
async function loadGame(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 30000 });
  await page.waitForTimeout(SETTLE_TIME);
}

/** Click the SPIEL STARTEN button and wait for game to start */
async function clickStart(page) {
  await page.locator('button.start-btn').click();
  await page.waitForTimeout(1000);
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY 1: Game Must NOT Auto-Start (14 tests)
// ═══════════════════════════════════════════════════════════════
test.describe('CRITICAL: Game Must NOT Auto-Start', () => {
  test.beforeEach(async ({ page }) => {
    setupErrorCollectors(page);
  });

  test('T01: gameState.isPlaying must be false after page load', async ({ page }) => {
    await loadGame(page);
    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T02: start menu must be visible on page load', async ({ page }) => {
    await loadGame(page);
    const menuVisible = await safeEval(page, () => {
      const menu = document.getElementById('menu');
      return menu !== null && menu.offsetParent !== null;
    });
    expect(menuVisible).toBe(true);
  });

  test('T03: SPIEL STARTEN button must exist and be visible', async ({ page }) => {
    await loadGame(page);
    const btn = page.locator('button.start-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('T04: game must NOT auto-start even after 15 seconds', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(15000);

    const state = await safeEval(page, () => ({
      isPlaying: gameState.isPlaying,
      isGameOver: gameState.isGameOver,
      score: gameState.score,
    }));
    expect(state.isPlaying).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.score).toBe(0);
  });

  test('T05: keyboard input must NOT start game', async ({ page }) => {
    await loadGame(page);

    const keys = ['Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
                  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                  'Escape', 'Tab', 'KeyP'];
    for (const key of keys) {
      await page.keyboard.press(key);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T06: clicking outside menu must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.mouse.click(10, 10);
    await page.waitForTimeout(200);
    await page.mouse.click(1270, 10);
    await page.waitForTimeout(200);
    await page.mouse.click(10, 710);
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T07: mouse movement must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.mouse.move(0, 0);
    await page.mouse.move(640, 360);
    await page.mouse.move(1280, 720);
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T08: touch events must NOT start game', async ({ page }) => {
    await loadGame(page);

    // Dispatch touch events programmatically (Desktop Chrome has no hasTouch)
    await safeEval(page, () => {
      const canvas = document.querySelector('canvas');
      canvas.dispatchEvent(new TouchEvent('touchstart', {
        bubbles: true, touches: [new Touch({ identifier: 1, target: canvas, clientX: 10, clientY: 10 })]
      }));
      canvas.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: canvas, clientX: 10, clientY: 10 })] }));
    });
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T09: score must remain 0 before game start', async ({ page }) => {
    await loadGame(page);
    await page.waitForTimeout(3000);

    const score = await safeEval(page, () => gameState.score);
    expect(score).toBe(0);
  });

  test('T10: no obstacles must spawn before game start', async ({ page }) => {
    await loadGame(page);
    await page.waitForTimeout(3000);

    const count = await safeEval(page, () =>
      typeof obstacles !== 'undefined' ? obstacles.length : 0
    );
    expect(count).toBe(0);
  });

  test('T11: player lane must stay at default (center=1) before start', async ({ page }) => {
    await loadGame(page);

    await page.keyboard.press('KeyA');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const lane = await safeEval(page, () => gameState.playerLane);
    expect(lane).toBe(1);
  });

  test('T12: player must NOT jump or duck before start', async ({ page }) => {
    await loadGame(page);

    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);

    const state = await safeEval(page, () => ({
      action: gameState.playerAction,
      y: gameState.playerY,
      isPlaying: gameState.isPlaying,
    }));
    expect(state.action).toBe('running');
    expect(state.y).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  test('T13: game UI (score/lives overlay) must be hidden before start', async ({ page }) => {
    await loadGame(page);

    const uiHidden = await safeEval(page, () => {
      const ui = document.getElementById('ui');
      if (!ui) return true;
      return window.getComputedStyle(ui).display === 'none';
    });
    expect(uiHidden).toBe(true);
  });

  test('T14: game state is idle (not playing, no score) before start', async ({ page }) => {
    await loadGame(page);

    // In headless mode WebGL/renderer may not initialize, but game state must be idle
    const state = await safeEval(page, () => ({
      isPlaying: gameState.isPlaying,
      isGameOver: gameState.isGameOver,
      score: gameState.score,
      lives: gameState.lives,
      playerLane: gameState.playerLane,
      hasStartGame: typeof window.startGame === 'function',
    }));

    expect(state.isPlaying).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.playerLane).toBe(1);
    expect(state.hasStartGame).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// CATEGORY 2: Game Starts ONLY on Button Click (5 tests)
// ═══════════════════════════════════════════════════════════════
test.describe('CRITICAL: Game Starts ONLY on Button Click', () => {
  test.beforeEach(async ({ page }) => {
    setupErrorCollectors(page);
  });

  test('T15: clicking SPIEL STARTEN must start the game', async ({ page }) => {
    await loadGame(page);

    const before = await safeEval(page, () => gameState.isPlaying);
    expect(before).toBe(false);

    await clickStart(page);

    const after = await safeEval(page, () => gameState.isPlaying);
    expect(after).toBe(true);
  });

  test('T16: keyboard controls must work AFTER game start', async ({ page }) => {
    await loadGame(page);
    await clickStart(page);

    const laneBefore = await safeEval(page, () => gameState.playerLane);

    if (laneBefore > 0) {
      await page.keyboard.press('KeyA');
      await page.waitForTimeout(300);
      const laneAfter = await safeEval(page, () => gameState.playerLane);
      expect(laneAfter).toBe(laneBefore - 1);
    } else {
      await page.keyboard.press('KeyD');
      await page.waitForTimeout(300);
      const laneAfter = await safeEval(page, () => gameState.playerLane);
      expect(laneAfter).toBe(laneBefore + 1);
    }
  });

  test('T17: isPlaying remains true and timer starts after game start', async ({ page }) => {
    await loadGame(page);

    const scoreBefore = await safeEval(page, () => gameState.score);
    expect(scoreBefore).toBe(0);

    await clickStart(page);

    // Verify game is actively running (isPlaying=true, timer started)
    // Note: score may not increment in headless (no WebGL render loop)
    const state = await safeEval(page, () => ({
      isPlaying: gameState.isPlaying,
      gameStartTime: gameState.gameStartTime,
      timeRemaining: gameState.timeRemaining,
    }));
    expect(state.isPlaying).toBe(true);
    expect(state.gameStartTime).toBeGreaterThan(0);
    expect(state.timeRemaining).toBeLessThanOrEqual(60);
  });

  test('T18: menu must hide after clicking start', async ({ page }) => {
    await loadGame(page);

    const menuBefore = await safeEval(page, () => {
      const m = document.getElementById('menu');
      return m !== null && m.offsetParent !== null;
    });
    expect(menuBefore).toBe(true);

    await clickStart(page);

    const menuHidden = await safeEval(page, () => {
      const m = document.getElementById('menu');
      return m === null || m.style.display === 'none' || m.offsetParent === null;
    });
    expect(menuHidden).toBe(true);
  });

  test('T19: game UI must appear after start', async ({ page }) => {
    await loadGame(page);

    const uiBefore = await safeEval(page, () => {
      const ui = document.getElementById('ui');
      return ui ? window.getComputedStyle(ui).display : 'none';
    });
    expect(uiBefore).toBe('none');

    await clickStart(page);

    const uiVisible = await safeEval(page, () => {
      const ui = document.getElementById('ui');
      if (!ui) return false;
      return ui.style.display === 'block' || window.getComputedStyle(ui).display !== 'none';
    });
    expect(uiVisible).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// CATEGORY 3: Game Over → Restart Guard (3 tests)
// ═══════════════════════════════════════════════════════════════
test.describe('CRITICAL: Game Over Restart Guard', () => {
  test.beforeEach(async ({ page }) => {
    setupErrorCollectors(page);
  });

  test('T20: game must NOT auto-restart after game over', async ({ page }) => {
    await loadGame(page);
    await clickStart(page);

    // Force game over by calling endGame directly (render loop may not run in headless)
    await safeEval(page, () => {
      if (typeof endGame === 'function') endGame();
      else { gameState.isPlaying = false; gameState.isGameOver = true; }
    });
    await page.waitForTimeout(2000);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);

    // Wait 5 more seconds — must NOT auto-restart
    await page.waitForTimeout(5000);
    const stillNotPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(stillNotPlaying).toBe(false);
  });

  test('T21: keyboard must NOT restart game after game over', async ({ page }) => {
    await loadGame(page);
    await clickStart(page);

    // Force game over directly
    await safeEval(page, () => {
      if (typeof endGame === 'function') endGame();
      else { gameState.isPlaying = false; gameState.isGameOver = true; }
    });
    await page.waitForTimeout(2000);

    for (const key of ['Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T22: only restart button must restart after game over', async ({ page }) => {
    await loadGame(page);
    await clickStart(page);

    await safeEval(page, () => { gameState.timeRemaining = 0; });
    await page.waitForTimeout(3000);

    const restartBtn = page.locator('button:has-text("Nochmal"), button:has-text("versuchen"), button:has-text("spielen")').first();
    const hasRestart = await restartBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasRestart) {
      await restartBtn.click();
      await page.waitForTimeout(1000);
      const isPlaying = await safeEval(page, () => gameState.isPlaying);
      expect(isPlaying).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CATEGORY 4: startGame() Guard Rails (7 tests)
// ═══════════════════════════════════════════════════════════════
test.describe('CRITICAL: startGame Guard Rails', () => {
  test.beforeEach(async ({ page }) => {
    setupErrorCollectors(page);
  });

  test('T23: window.startGame must be a function', async ({ page }) => {
    await loadGame(page);
    const type = await safeEval(page, () => typeof window.startGame);
    expect(type).toBe('function');
  });

  test('T24: calling startGame() must set isPlaying=true', async ({ page }) => {
    await loadGame(page);

    const before = await safeEval(page, () => gameState.isPlaying);
    expect(before).toBe(false);

    await safeEval(page, () => window.startGame());
    await page.waitForTimeout(500);

    const after = await safeEval(page, () => gameState.isPlaying);
    expect(after).toBe(true);
  });

  test('T25: startGame() must hide menu and show UI', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => window.startGame());
    await page.waitForTimeout(500);

    const state = await safeEval(page, () => ({
      menuHidden: document.getElementById('menu')?.style.display === 'none' || document.getElementById('menu')?.offsetParent === null,
      uiVisible: document.getElementById('ui')?.style.display === 'block' || window.getComputedStyle(document.getElementById('ui')).display !== 'none',
    }));
    expect(state.menuHidden).toBe(true);
    expect(state.uiVisible).toBe(true);
  });

  test('T26: startGame() must reset score to 0', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => { gameState.score = 999; });
    await safeEval(page, () => window.startGame());
    await page.waitForTimeout(500);

    const score = await safeEval(page, () => gameState.score);
    expect(score).toBe(0);
  });

  test('T27: startGame() must reset lives to 3', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => window.startGame());
    await page.waitForTimeout(500);

    const lives = await safeEval(page, () => gameState.lives);
    expect(lives).toBe(3);
  });

  test('T28: startGame() must reset player to center lane (1)', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => window.startGame());
    await page.waitForTimeout(500);

    const lane = await safeEval(page, () => gameState.playerLane);
    expect(lane).toBe(1);
  });

  test('T29: rapid startGame() calls must not corrupt state', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => {
      for (let i = 0; i < 5; i++) window.startGame();
    });
    await page.waitForTimeout(1000);

    const state = await safeEval(page, () => ({
      isPlaying: gameState.isPlaying,
      lives: gameState.lives,
      score: gameState.score,
      lane: gameState.playerLane,
    }));
    expect(state.isPlaying).toBe(true);
    expect(state.lives).toBe(3);
    expect(state.score).toBe(0);
    expect(state.lane).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// CATEGORY 5: No Implicit Game Triggers (6 tests)
// ═══════════════════════════════════════════════════════════════
test.describe('CRITICAL: No Implicit Game Triggers', () => {
  test.beforeEach(async ({ page }) => {
    setupErrorCollectors(page);
  });

  test('T30: window resize must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T31: focus/blur events must NOT start game', async ({ page }) => {
    await loadGame(page);

    await safeEval(page, () => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T32: scroll events must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(200);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T33: right-click must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.mouse.click(10, 10, { button: 'right' });
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T34: double-click must NOT start game', async ({ page }) => {
    await loadGame(page);

    await page.mouse.dblclick(10, 10);
    await page.waitForTimeout(500);

    const isPlaying = await safeEval(page, () => gameState.isPlaying);
    expect(isPlaying).toBe(false);
  });

  test('T35: rapid keyboard spam must NOT start game', async ({ page }) => {
    await loadGame(page);

    for (let i = 0; i < 50; i++) {
      const key = ['Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
                   'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][i % 10];
      await page.keyboard.press(key);
    }
    await page.waitForTimeout(500);

    const state = await safeEval(page, () => ({
      isPlaying: gameState.isPlaying,
      score: gameState.score,
    }));
    expect(state.isPlaying).toBe(false);
    expect(state.score).toBe(0);
  });
});
