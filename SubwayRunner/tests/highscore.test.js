// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Highscore System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8001');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.waitForTimeout(2000);
  });

  test('Highscore system initializes without crashing', async ({ page }) => {
    // Check if highscore manager exists
    const highscoreManagerExists = await page.evaluate(() => {
      return typeof highscoreManager !== 'undefined';
    });
    expect(highscoreManagerExists).toBe(true);

    // Check if highscore panel is visible
    await expect(page.locator('#highscorePanel')).toBeVisible();
    
    // Check connection status badge appears
    const statusBadgeExists = await page.evaluate(() => {
      return document.querySelector('#connectionStatus') !== null;
    });
    expect(statusBadgeExists).toBe(true);
  });

  test('Game can handle game over without crashing', async ({ page }) => {
    // Force game over
    await page.evaluate(() => {
      gameState.isPlaying = false;
      gameState.isGameOver = true;
      currentScore = 1000;
      currentSurvivalTime = 30;
      
      // Trigger game over
      if (typeof gameOver === 'function') {
        gameOver();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check if game over menu appears
    const menuVisible = await page.evaluate(() => {
      const menu = document.getElementById('menu');
      return menu && menu.style.display !== 'none';
    });
    expect(menuVisible).toBe(true);
  });

  test('Highscore name input dialog works without crashing', async ({ page }) => {
    // Simulate achieving a highscore
    await page.evaluate(() => {
      currentScore = 5000;
      currentSurvivalTime = 45;
      gameState.isVictory = false;
      
      // Show name input dialog
      if (typeof showNameInputDialog === 'function') {
        showNameInputDialog(false);
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check if dialog appears
    const dialogVisible = await page.evaluate(() => {
      const dialog = document.getElementById('nameInputDialog');
      return dialog && dialog.style.display !== 'none';
    });
    expect(dialogVisible).toBe(true);
    
    // Check if score value is displayed
    const scoreDisplayed = await page.evaluate(() => {
      const scoreElement = document.getElementById('highscoreValue');
      return scoreElement && scoreElement.textContent === '5000';
    });
    expect(scoreDisplayed).toBe(true);
    
    // Type a name
    await page.fill('#playerNameInput', 'TestPlayer');
    
    // Submit the highscore
    await page.evaluate(() => {
      if (typeof submitHighscore === 'function') {
        submitHighscore();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that it didn't crash and dialog is hidden
    const dialogHidden = await page.evaluate(() => {
      const dialog = document.getElementById('nameInputDialog');
      return dialog && dialog.style.display === 'none';
    });
    expect(dialogHidden).toBe(true);
  });

  test('Skip highscore button works without crashing', async ({ page }) => {
    // Show name input dialog
    await page.evaluate(() => {
      currentScore = 3000;
      if (typeof showNameInputDialog === 'function') {
        showNameInputDialog(false);
      }
    });
    
    await page.waitForTimeout(500);
    
    // Click skip button
    await page.evaluate(() => {
      if (typeof skipHighscore === 'function') {
        skipHighscore();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check dialog is hidden
    const dialogHidden = await page.evaluate(() => {
      const dialog = document.getElementById('nameInputDialog');
      return dialog && dialog.style.display === 'none';
    });
    expect(dialogHidden).toBe(true);
  });

  test('Victory screen with highscore works', async ({ page }) => {
    // Simulate victory
    await page.evaluate(() => {
      gameState.currentRound = 3;
      gameState.isVictory = true;
      currentScore = 10000;
      currentSurvivalTime = 180;
      
      // Show final victory dialog
      if (typeof showFinalVictoryDialog === 'function') {
        showFinalVictoryDialog();
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check victory dialog appears
    const victoryDialogExists = await page.evaluate(() => {
      return document.getElementById('finalVictoryDialog') !== null;
    });
    expect(victoryDialogExists).toBe(true);
    
    // Click proceed to highscore
    await page.evaluate(() => {
      if (typeof window.proceedToHighscore === 'function') {
        window.proceedToHighscore();
      }
    });
    
    await page.waitForTimeout(500);
    
    // Should either show name input or game over menu
    const transitionSuccessful = await page.evaluate(() => {
      const nameDialog = document.getElementById('nameInputDialog');
      const menu = document.getElementById('menu');
      return (nameDialog && nameDialog.style.display !== 'none') || 
             (menu && menu.style.display !== 'none');
    });
    expect(transitionSuccessful).toBe(true);
  });

  test('Local storage fallback works', async ({ page }) => {
    // Force offline mode
    await page.evaluate(() => {
      supabase = null;
      isOnlineMode = false;
    });
    
    // Submit a score
    await page.evaluate(async () => {
      await highscoreManager.submitScore('LocalPlayer', 2000, 25, false);
    });
    
    await page.waitForTimeout(500);
    
    // Check localStorage has the score
    const localScoresSaved = await page.evaluate(() => {
      const scores = localStorage.getItem('subwayRunner_highscores');
      if (scores) {
        const parsed = JSON.parse(scores);
        return parsed.length > 0 && parsed[0].player_name === 'LocalPlayer';
      }
      return false;
    });
    expect(localScoresSaved).toBe(true);
  });

  test('Highscore table displays in game over menu', async ({ page }) => {
    // Add some test scores
    await page.evaluate(() => {
      const testScores = [
        { player_name: 'Player1', score: 5000, survival_time: 60, is_victory: true },
        { player_name: 'Player2', score: 3000, survival_time: 45, is_victory: false },
        { player_name: 'Player3', score: 1000, survival_time: 20, is_victory: false }
      ];
      localStorage.setItem('subwayRunner_highscores', JSON.stringify(testScores));
      highscoreManager.loadHighscores();
    });
    
    await page.waitForTimeout(500);
    
    // Show game over menu
    await page.evaluate(() => {
      currentScore = 2000;
      currentSurvivalTime = 30;
      if (typeof showGameOverMenu === 'function') {
        showGameOverMenu(false);
      }
    });
    
    await page.waitForTimeout(500);
    
    // Check if highscore table is in the menu
    const highscoreTableExists = await page.evaluate(() => {
      const menu = document.getElementById('menu');
      return menu && menu.innerHTML.includes('HIGHSCORES');
    });
    expect(highscoreTableExists).toBe(true);
  });
});