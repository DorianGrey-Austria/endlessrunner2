// automated-test-simple.js - Simple test without ES6 imports
const puppeteer = require('puppeteer');

async function runSimpleTest() {
  console.log('🧪 Starting simple automated test...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console messages and errors
    const consoleMessages = [];
    const pageErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        pageErrors.push(text);
      }
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Navigate to the game
    console.log('📄 Loading game...');
    await page.goto('http://localhost:8001', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for game initialization
    console.log('⏳ Waiting for game to initialize...');
    await page.waitForTimeout(3000);
    
    // Run tests
    console.log('🔍 Running tests...');
    const testResults = await page.evaluate(() => {
      const results = {
        canvasExists: false,
        gameInstanceExists: false,
        gameStateExists: false,
        isRunning: false,
        rendererExists: false,
        sceneExists: false,
        errors: []
      };
      
      try {
        // Check canvas
        const canvas = document.getElementById('gameCanvas');
        results.canvasExists = canvas !== null;
        
        // Check game objects
        results.gameInstanceExists = typeof window.gameInstance !== 'undefined';
        results.gameStateExists = typeof window.gameState !== 'undefined';
        results.rendererExists = window.gameInstance && window.gameInstance.renderer !== undefined;
        results.sceneExists = window.gameInstance && window.gameInstance.scene !== undefined;
        
        // Try to start the game
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
          playBtn.click();
          // Wait a bit for game to start
          return new Promise(resolve => {
            setTimeout(() => {
              results.isRunning = window.gameInstance && window.gameInstance.isRunning === true;
              resolve(results);
            }, 1000);
          });
        }
      } catch (e) {
        results.errors.push(e.message);
      }
      
      return results;
    });
    
    // Print results
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`✅ Canvas exists: ${testResults.canvasExists}`);
    console.log(`✅ GameInstance exists: ${testResults.gameInstanceExists}`);
    console.log(`✅ GameState exists: ${testResults.gameStateExists}`);
    console.log(`✅ Renderer initialized: ${testResults.rendererExists}`);
    console.log(`✅ Scene initialized: ${testResults.sceneExists}`);
    console.log(`✅ Game running: ${testResults.isRunning}`);
    
    if (pageErrors.length > 0) {
      console.log(`\n❌ Page errors found: ${pageErrors.length}`);
      pageErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('\n✅ No page errors!');
    }
    
    if (testResults.errors.length > 0) {
      console.log(`\n❌ Test errors: ${testResults.errors.length}`);
      testResults.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Check for specific error patterns
    const hasExportError = pageErrors.some(err => err.includes('export'));
    const hasInitError = pageErrors.some(err => err.includes('init'));
    
    // Final verdict
    const allTestsPassed = 
      testResults.canvasExists && 
      testResults.gameInstanceExists && 
      testResults.rendererExists &&
      testResults.sceneExists &&
      pageErrors.length === 0 &&
      !hasExportError &&
      !hasInitError;
    
    console.log('\n' + '='.repeat(40));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! Game is working correctly.');
    } else {
      console.log('❌ Some tests failed. Please check the errors above.');
    }
    console.log('='.repeat(40));
    
    // Return exit code
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runSimpleTest();