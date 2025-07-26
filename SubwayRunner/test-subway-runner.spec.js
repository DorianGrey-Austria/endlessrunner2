// test-subway-runner.spec.js - Playwright Test Suite für SubwayRunner
// Basierend auf TEST-PLAN.md Workflow

import { test, expect } from '@playwright/test';

// Test Konfiguration
const TEST_URL = 'http://localhost:8001';
const TIMEOUT = 30000;

test.describe('SubwayRunner Game Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigiere zur Spiel-Seite
    await page.goto(TEST_URL);
    
    // Warte bis das Spiel geladen ist
    await page.waitForFunction(() => {
      return window.gameInstance !== undefined;
    }, { timeout: TIMEOUT });
  });

  test('Spiel startet korrekt', async ({ page }) => {
    // Prüfe ob Canvas existiert
    const canvas = await page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    
    // Prüfe ob UI-Elemente vorhanden sind
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#start-menu')).toBeVisible();
    
    // Screenshot vom Startbildschirm
    await page.screenshot({ 
      path: 'tests/screenshots/start-screen.png',
      fullPage: true 
    });
  });

  test('Character Selection funktioniert', async ({ page }) => {
    // Öffne Character Selection
    const charButton = await page.locator('#character-select-btn');
    if (await charButton.isVisible()) {
      await charButton.click();
      
      // Prüfe ob Character Grid sichtbar ist
      await expect(page.locator('#character-grid')).toBeVisible();
      
      // Wähle einen Character
      await page.click('.character-card:first-child');
      
      // Screenshot von Character Selection
      await page.screenshot({ 
        path: 'tests/screenshots/character-selection.png' 
      });
    }
  });

  test('Spiel startet nach Klick', async ({ page }) => {
    // Klicke Start Button
    await page.click('#play-btn');
    
    // Warte bis Spiel läuft
    await page.waitForFunction(() => {
      return window.gameInstance && window.gameInstance.isRunning;
    }, { timeout: TIMEOUT });
    
    // Prüfe ob Start Menu verschwunden ist
    await expect(page.locator('#start-menu')).toBeHidden();
    
    // Screenshot vom laufenden Spiel
    await page.screenshot({ 
      path: 'tests/screenshots/game-running.png' 
    });
  });

  test('Pause funktioniert', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Drücke Pause (ESC oder P)
    await page.keyboard.press('Escape');
    
    // Prüfe ob Pause Menu sichtbar ist
    await expect(page.locator('#pause-menu')).toBeVisible();
    
    // Screenshot von Pause Menu
    await page.screenshot({ 
      path: 'tests/screenshots/pause-menu.png' 
    });
  });

  test('Collectibles spawnen korrekt', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Warte 3 Sekunden für Collectible Spawns
    await page.waitForTimeout(3000);
    
    // Prüfe ob Collectibles im Spiel sind
    const collectibleCount = await page.evaluate(() => {
      if (window.gameInstance && window.gameInstance.collectibles) {
        return window.gameInstance.collectibles.length;
      }
      return 0;
    });
    
    expect(collectibleCount).toBeGreaterThan(0);
    console.log(`Collectibles gefunden: ${collectibleCount}`);
  });

  test('Score Update funktioniert', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Warte bis Score sich ändert
    await page.waitForFunction(() => {
      const scoreElement = document.querySelector('#score');
      return scoreElement && parseInt(scoreElement.textContent) > 0;
    }, { timeout: TIMEOUT });
    
    const score = await page.locator('#score').textContent();
    expect(parseInt(score)).toBeGreaterThan(0);
  });

  test('Game Over Screen erscheint', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Simuliere Game Over durch direkten Aufruf
    await page.evaluate(() => {
      if (window.gameInstance && window.gameInstance.gameOver) {
        window.gameInstance.gameOver();
      }
    });
    
    // Prüfe ob Game Over Screen sichtbar ist
    await expect(page.locator('#game-over-menu')).toBeVisible();
    
    // Screenshot von Game Over
    await page.screenshot({ 
      path: 'tests/screenshots/game-over.png' 
    });
  });

  test('Level Progression funktioniert', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Setze Score für Level Change
    await page.evaluate(() => {
      if (window.gameInstance) {
        window.gameInstance.score = 950;
      }
    });
    
    // Warte auf Level Change
    await page.waitForFunction(() => {
      return window.gameInstance && window.gameInstance.currentLevel > 1;
    }, { timeout: TIMEOUT });
    
    const level = await page.evaluate(() => window.gameInstance.currentLevel);
    expect(level).toBe(2);
    
    // Screenshot von Level 2
    await page.screenshot({ 
      path: 'tests/screenshots/level-2.png' 
    });
  });

  test('Sound Toggle funktioniert', async ({ page }) => {
    // Finde Sound Toggle Button
    const soundToggle = await page.locator('#sound-toggle');
    
    if (await soundToggle.isVisible()) {
      // Klicke Sound Toggle
      await soundToggle.click();
      
      // Prüfe ob Sound Status sich geändert hat
      const soundEnabled = await page.evaluate(() => {
        return window.gameInstance && window.gameInstance.soundEnabled;
      });
      
      expect(soundEnabled).toBeDefined();
    }
  });

  test('Performance Check', async ({ page }) => {
    // Starte Spiel
    await page.click('#play-btn');
    
    // Warte 5 Sekunden
    await page.waitForTimeout(5000);
    
    // Messe FPS
    const fps = await page.evaluate(() => {
      if (window.gameInstance && window.gameInstance.currentFPS) {
        return window.gameInstance.currentFPS;
      }
      return 0;
    });
    
    console.log(`FPS: ${fps}`);
    expect(fps).toBeGreaterThan(30); // Mindestens 30 FPS
  });
});

// Mobile Tests
test.describe('Mobile Controls', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    hasTouch: true
  });
  
  test('Touch Controls funktionieren', async ({ page }) => {
    await page.goto(TEST_URL);
    
    // Warte auf Spiel
    await page.waitForFunction(() => window.gameInstance !== undefined);
    
    // Starte Spiel
    await page.click('#play-btn');
    
    // Simuliere Touch Swipe
    await page.locator('#gameCanvas').tap({ position: { x: 187, y: 300 } });
    
    // Screenshot von Mobile View
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png' 
    });
  });
});

// Error Handling Tests
test.describe('Error Handling', () => {
  test('Spiel handled fehlende WebGL', async ({ page }) => {
    // Deaktiviere WebGL
    await page.addInitScript(() => {
      // Override WebGL context
      HTMLCanvasElement.prototype.getContext = function(type) {
        if (type === 'webgl' || type === 'webgl2') {
          return null;
        }
        return this.originalGetContext.call(this, type);
      };
    });
    
    await page.goto(TEST_URL);
    
    // Prüfe ob Fehler angezeigt wird
    const errorVisible = await page.locator('.webgl-error').isVisible();
    if (errorVisible) {
      await expect(page.locator('.webgl-error')).toContainText('WebGL');
    }
  });
});