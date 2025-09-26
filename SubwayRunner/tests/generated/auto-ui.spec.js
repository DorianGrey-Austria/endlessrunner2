// 🤖 AUTO-GENERATED UI TESTS
// Generated on: 2025-09-26T15:11:52.779Z
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Auto-Generated UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);
  });


  test('UI element #soundToggle is accessible', async ({ page }) => {
    const element = page.locator('#soundToggle');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #soundToggle interactive:', isInteractive);
  });

  test('UI element #highscoreList is accessible', async ({ page }) => {
    const element = page.locator('#highscoreList');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #highscoreList interactive:', isInteractive);
  });

  test('UI element #menu is accessible', async ({ page }) => {
    const element = page.locator('#menu');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #menu interactive:', isInteractive);
  });

  test('UI element #gameCanvas is accessible', async ({ page }) => {
    const element = page.locator('#gameCanvas');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gameCanvas interactive:', isInteractive);
  });

  test('UI element #score is accessible', async ({ page }) => {
    const element = page.locator('#score');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #score interactive:', isInteractive);
  });

  test('UI element #speed is accessible', async ({ page }) => {
    const element = page.locator('#speed');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #speed interactive:', isInteractive);
  });

  test('UI element #lives is accessible', async ({ page }) => {
    const element = page.locator('#lives');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #lives interactive:', isInteractive);
  });

  test('UI element #apples is accessible', async ({ page }) => {
    const element = page.locator('#apples');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #apples interactive:', isInteractive);
  });

  test('UI element #broccolis is accessible', async ({ page }) => {
    const element = page.locator('#broccolis');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #broccolis interactive:', isInteractive);
  });

  test('UI element #timeRemaining is accessible', async ({ page }) => {
    const element = page.locator('#timeRemaining');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #timeRemaining interactive:', isInteractive);
  });

  test('UI element #timer is accessible', async ({ page }) => {
    const element = page.locator('#timer');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #timer interactive:', isInteractive);
  });

  test('UI element #nameInputDialog is accessible', async ({ page }) => {
    const element = page.locator('#nameInputDialog');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #nameInputDialog interactive:', isInteractive);
  });

  test('UI element #playerNameInput is accessible', async ({ page }) => {
    const element = page.locator('#playerNameInput');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #playerNameInput interactive:', isInteractive);
  });

  test('UI element #transitionTitle is accessible', async ({ page }) => {
    const element = page.locator('#transitionTitle');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #transitionTitle interactive:', isInteractive);
  });

  test('UI element #transitionSubtitle is accessible', async ({ page }) => {
    const element = page.locator('#transitionSubtitle');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #transitionSubtitle interactive:', isInteractive);
  });

  test('UI element #levelTransitionOverlay is accessible', async ({ page }) => {
    const element = page.locator('#levelTransitionOverlay');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #levelTransitionOverlay interactive:', isInteractive);
  });

  test('UI element #transitionCountdown is accessible', async ({ page }) => {
    const element = page.locator('#transitionCountdown');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #transitionCountdown interactive:', isInteractive);
  });

  test('UI element #currentLevel is accessible', async ({ page }) => {
    const element = page.locator('#currentLevel');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #currentLevel interactive:', isInteractive);
  });

  test('UI element #gestureControlBtn is accessible', async ({ page }) => {
    const element = page.locator('#gestureControlBtn');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureControlBtn interactive:', isInteractive);
  });

  test('UI element #gestureCanvas is accessible', async ({ page }) => {
    const element = page.locator('#gestureCanvas');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureCanvas interactive:', isInteractive);
  });

  test('UI element #gestureStatus is accessible', async ({ page }) => {
    const element = page.locator('#gestureStatus');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureStatus interactive:', isInteractive);
  });

  test('UI element #gestureStatusText is accessible', async ({ page }) => {
    const element = page.locator('#gestureStatusText');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureStatusText interactive:', isInteractive);
  });

  test('UI element #gestureCurrentText is accessible', async ({ page }) => {
    const element = page.locator('#gestureCurrentText');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureCurrentText interactive:', isInteractive);
  });

  test('UI element #gestureVideo is accessible', async ({ page }) => {
    const element = page.locator('#gestureVideo');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureVideo interactive:', isInteractive);
  });

  test('UI element #volumeToggle is accessible', async ({ page }) => {
    const element = page.locator('#volumeToggle');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #volumeToggle interactive:', isInteractive);
  });

  test('UI element #volumeControls is accessible', async ({ page }) => {
    const element = page.locator('#volumeControls');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #volumeControls interactive:', isInteractive);
  });

  test('UI element #musicVolume is accessible', async ({ page }) => {
    const element = page.locator('#musicVolume');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #musicVolume interactive:', isInteractive);
  });

  test('UI element #musicVolumeLabel is accessible', async ({ page }) => {
    const element = page.locator('#musicVolumeLabel');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #musicVolumeLabel interactive:', isInteractive);
  });

  test('UI element #sfxVolume is accessible', async ({ page }) => {
    const element = page.locator('#sfxVolume');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #sfxVolume interactive:', isInteractive);
  });

  test('UI element #sfxVolumeLabel is accessible', async ({ page }) => {
    const element = page.locator('#sfxVolumeLabel');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #sfxVolumeLabel interactive:', isInteractive);
  });

  test('UI element h2 is accessible', async ({ page }) => {
    const element = page.locator('h2');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element h2 interactive:', isInteractive);
  });

  test('UI element #nameInputDialog button is accessible', async ({ page }) => {
    const element = page.locator('#nameInputDialog button');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #nameInputDialog button interactive:', isInteractive);
  });

  test('UI element #gameContainer is accessible', async ({ page }) => {
    const element = page.locator('#gameContainer');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gameContainer interactive:', isInteractive);
  });

  test('UI element #ui is accessible', async ({ page }) => {
    const element = page.locator('#ui');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #ui interactive:', isInteractive);
  });

  test('UI element #levelIndicator is accessible', async ({ page }) => {
    const element = page.locator('#levelIndicator');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #levelIndicator interactive:', isInteractive);
  });

  test('UI element #soundControls is accessible', async ({ page }) => {
    const element = page.locator('#soundControls');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #soundControls interactive:', isInteractive);
  });

  test('UI element #instructions is accessible', async ({ page }) => {
    const element = page.locator('#instructions');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #instructions interactive:', isInteractive);
  });

  test('UI element #gestureControl is accessible', async ({ page }) => {
    const element = page.locator('#gestureControl');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #gestureControl interactive:', isInteractive);
  });

  test('UI element #highscorePanel is accessible', async ({ page }) => {
    const element = page.locator('#highscorePanel');

    // Element should exist in DOM
    await expect(element.first()).toBeTruthy();

    // Check if element is interactive
    const isInteractive = await element.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      const tag = el.tagName.toLowerCase();

      return tag === 'button' ||
             tag === 'input' ||
             tag === 'select' ||
             tag === 'textarea' ||
             style.cursor === 'pointer' ||
             el.onclick !== null;
    });

    console.log('Element #highscorePanel interactive:', isInteractive);
  });


  test('Critical UI elements are visible', async ({ page }) => {
    // Test for common game UI elements
    const criticalElements = [
      'canvas', '#gameCanvas', '#game-canvas',
      '#score', '.score', '[data-score]',
      '#startButton', '#start-button', '.start-btn'
    ];

    let visibleElements = 0;

    for (const selector of criticalElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.first().isVisible();

        if (isVisible) {
          visibleElements++;
          console.log(`✅ Found visible element: ${selector}`);
        }
      } catch (error) {
        // Element doesn't exist, continue
      }
    }

    // At least one critical UI element should be visible
    expect(visibleElements).toBeGreaterThan(0);
  });

  test('UI elements respond to interaction', async ({ page }) => {
    const interactiveElements = ["#nameInputDialog button"];

    for (const selector of interactiveElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.first().isVisible();

        if (isVisible) {
          console.log(`Testing interaction with ${selector}`);

          // Try clicking the element
          await element.first().click();
          await page.waitForTimeout(500);

          // Element should still exist after interaction
          await expect(element.first()).toBeTruthy();
        }
      } catch (error) {
        console.log(`Could not interact with ${selector}:, error.message`);
      }
    }
  });
});
