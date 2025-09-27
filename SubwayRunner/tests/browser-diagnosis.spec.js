// 🔍 BROWSER DIAGNOSIS - Game Function Detection Test
import { test, expect } from '@playwright/test';

test.describe('🚨 Browser Diagnosis - Game Function Detection', () => {
  test('comprehensive browser analysis for missing game functions', async ({ page }) => {
    // 🔧 Setup detailed console monitoring
    const consoleMessages = [];
    const jsErrors = [];

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    page.on('pageerror', error => {
      jsErrors.push({
        message: error.message,
        stack: error.stack
      });
    });

    // 🌐 Navigate to game (use port 8002 since 8001 is busy)
    console.log('🚀 Navigating to http://localhost:8002');
    await page.goto('http://localhost:8002', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // ⏱️ Wait for page to fully load
    await page.waitForTimeout(3000);

    console.log('\n📋 === INITIAL PAGE STATE ANALYSIS ===');

    // 1️⃣ Check basic DOM elements
    const titleElement = await page.$('title');
    const title = titleElement ? await titleElement.textContent() : 'NO TITLE';
    console.log(`📄 Page Title: ${title}`);

    // 2️⃣ Check for script tags
    const scriptTags = await page.$$eval('script', scripts =>
      scripts.map(script => ({
        src: script.src || 'inline',
        type: script.type || 'text/javascript',
        hasContent: script.innerHTML.length > 0,
        contentLength: script.innerHTML.length
      }))
    );
    console.log(`📜 Script Tags Found: ${scriptTags.length}`);
    scriptTags.forEach((script, index) => {
      console.log(`  ${index + 1}. ${script.src} (${script.contentLength} chars)`);
    });

    // 3️⃣ Check for Three.js
    const hasThreeJS = await page.evaluate(() => {
      return typeof window.THREE !== 'undefined';
    });
    console.log(`🎮 Three.js Available: ${hasThreeJS}`);

    // 4️⃣ Check window object for game properties
    const windowProperties = await page.evaluate(() => {
      const props = {};
      const gameProperties = [
        'gameState', 'gameCore', 'scene', 'camera', 'renderer', 'player',
        'obstacles', 'collectibles', 'score', 'level', 'isPlaying'
      ];

      gameProperties.forEach(prop => {
        props[prop] = {
          exists: typeof window[prop] !== 'undefined',
          type: typeof window[prop],
          value: window[prop] !== undefined ? String(window[prop]).substring(0, 100) : 'undefined'
        };
      });

      return props;
    });

    console.log('\n🎯 === GAME PROPERTIES ANALYSIS ===');
    Object.entries(windowProperties).forEach(([key, info]) => {
      console.log(`  ${key}: ${info.exists ? '✅' : '❌'} (${info.type}) ${info.value}`);
    });

    // 5️⃣ Check for global functions
    const globalFunctions = await page.evaluate(() => {
      const functions = {};
      const gameFunction = [
        'startGame', 'gameLoop', 'animate', 'updatePlayer', 'updateObstacles',
        'updateCollectibles', 'checkCollisions', 'updateScore', 'updateUI',
        'init', 'initGame', 'initThreeJS', 'initControls'
      ];

      gameFunction.forEach(func => {
        functions[func] = {
          exists: typeof window[func] === 'function',
          type: typeof window[func]
        };
      });

      return functions;
    });

    console.log('\n⚙️ === GLOBAL FUNCTIONS ANALYSIS ===');
    Object.entries(globalFunctions).forEach(([key, info]) => {
      console.log(`  ${key}(): ${info.exists ? '✅' : '❌'} (${info.type})`);
    });

    // 6️⃣ Check for specific game mode buttons
    const gameButtons = await page.evaluate(() => {
      const buttons = {};
      const buttonIds = ['classicModeBtn', 'gestureModeBtn', 'startButton'];

      buttonIds.forEach(id => {
        const element = document.getElementById(id);
        buttons[id] = {
          exists: !!element,
          visible: element ? !element.hidden && element.style.display !== 'none' : false,
          text: element ? element.textContent.trim() : ''
        };
      });

      return buttons;
    });

    console.log('\n🎮 === GAME BUTTONS ANALYSIS ===');
    Object.entries(gameButtons).forEach(([key, info]) => {
      console.log(`  ${key}: ${info.exists ? '✅' : '❌'} visible:${info.visible} text:"${info.text}"`);
    });

    // 7️⃣ Execute init function if available and check result
    console.log('\n🚀 === INITIALIZATION TEST ===');
    const initResult = await page.evaluate(() => {
      try {
        if (typeof window.init === 'function') {
          console.log('🔧 Executing init() function...');
          const result = window.init();
          return {
            executed: true,
            result: result,
            gameStateAfter: window.gameState,
            sceneAfter: !!window.scene,
            rendererAfter: !!window.renderer
          };
        } else {
          return { executed: false, reason: 'init function not found' };
        }
      } catch (error) {
        return { executed: false, error: error.message };
      }
    });

    console.log(`🔧 Init Execution: ${JSON.stringify(initResult, null, 2)}`);

    // 8️⃣ Try to start game if startGame function exists
    console.log('\n🎯 === GAME START TEST ===');
    const startGameResult = await page.evaluate(() => {
      try {
        if (typeof window.startGame === 'function') {
          console.log('🎮 Executing startGame() function...');
          const result = window.startGame();
          return {
            executed: true,
            result: result,
            gameStateAfter: window.gameState
          };
        } else {
          return { executed: false, reason: 'startGame function not found' };
        }
      } catch (error) {
        return { executed: false, error: error.message };
      }
    });

    console.log(`🎮 StartGame Execution: ${JSON.stringify(startGameResult, null, 2)}`);

    // 9️⃣ Analyze Console Messages
    console.log('\n📋 === CONSOLE MESSAGES ===');
    if (consoleMessages.length > 0) {
      consoleMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
      });
    } else {
      console.log('  No console messages captured');
    }

    // 🔟 Analyze JavaScript Errors
    console.log('\n🚨 === JAVASCRIPT ERRORS ===');
    if (jsErrors.length > 0) {
      jsErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ERROR: ${error.message}`);
        if (error.stack) {
          console.log(`     Stack: ${error.stack.split('\n')[0]}`);
        }
      });
    } else {
      console.log('  ✅ No JavaScript errors detected');
    }

    // 📊 Final Assessment
    console.log('\n🎯 === DIAGNOSIS SUMMARY ===');
    const hasBasicGameStructure = hasThreeJS && windowProperties.gameState.exists;
    const hasFunctionStructure = globalFunctions.startGame.exists && globalFunctions.animate.exists;
    const hasUIStructure = gameButtons.classicModeBtn.exists;

    console.log(`🎮 Three.js Integration: ${hasThreeJS ? '✅' : '❌'}`);
    console.log(`🎯 Game State Structure: ${hasBasicGameStructure ? '✅' : '❌'}`);
    console.log(`⚙️ Function Structure: ${hasFunctionStructure ? '✅' : '❌'}`);
    console.log(`🖥️ UI Structure: ${hasUIStructure ? '✅' : '❌'}`);
    console.log(`🚨 JavaScript Errors: ${jsErrors.length === 0 ? '✅' : '❌ (' + jsErrors.length + ')'}`);

    // Allow test to see results
    await page.waitForTimeout(2000);
  });
});