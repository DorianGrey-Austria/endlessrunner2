// test-errors.js - Test für Error Logging und Supabase Integration
const puppeteer = require('puppeteer');

async function testErrorLogging() {
  console.log('🧪 Testing Error Logging System...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Sichtbar für Debugging
    devtools: true   // DevTools öffnen
  });
  
  const page = await browser.newPage();
  
  // Sammle alle Konsolenmeldungen
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`);
  });
  
  console.log('📄 Loading game...');
  await page.goto('http://localhost:8001', { 
    waitUntil: 'networkidle2' 
  });
  
  // Warte auf Initialisierung
  await page.waitForTimeout(3000);
  
  // Test 1: Prüfe ob Spiel lädt
  console.log('\n🔍 Test 1: Game Loading');
  const gameLoaded = await page.evaluate(() => {
    return {
      hasCanvas: document.getElementById('gameCanvas') !== null,
      hasGameInstance: typeof window.gameInstance !== 'undefined',
      hasGameState: typeof window.gameState !== 'undefined',
      hasRenderer: window.gameInstance && window.gameInstance.renderer !== undefined,
      hasScene: window.gameInstance && window.gameInstance.scene !== undefined,
      isInitialized: window.gameInstance && window.gameInstance.initialized === true
    };
  });
  
  console.log('Canvas exists:', gameLoaded.hasCanvas ? '✅' : '❌');
  console.log('GameInstance exists:', gameLoaded.hasGameInstance ? '✅' : '❌');
  console.log('GameState exists:', gameLoaded.hasGameState ? '✅' : '❌');
  console.log('Renderer initialized:', gameLoaded.hasRenderer ? '✅' : '❌');
  console.log('Scene initialized:', gameLoaded.hasScene ? '✅' : '❌');
  console.log('Game initialized:', gameLoaded.isInitialized ? '✅' : '❌');
  
  // Test 2: Supabase Connection
  console.log('\n🔍 Test 2: Supabase Connection');
  const supabaseStatus = await page.evaluate(() => {
    return {
      hasSupabase: typeof window.supabase !== 'undefined',
      hasClient: window.supabase && typeof window.supabase.createClient === 'function'
    };
  });
  
  console.log('Supabase loaded:', supabaseStatus.hasSupabase ? '✅' : '❌');
  console.log('Supabase client available:', supabaseStatus.hasClient ? '✅' : '❌');
  
  // Test 3: Error Logging Function
  console.log('\n🔍 Test 3: Error Logging Function');
  const errorLoggingTest = await page.evaluate(async () => {
    try {
      // Simuliere einen Error
      const testError = {
        type: 'test_error',
        message: 'Automated test error',
        stack: 'Test stack trace',
        source: 'test-errors.js',
        lineno: 42,
        colno: 13,
        context: { test: true, timestamp: Date.now() }
      };
      
      // Finde die logError Funktion
      if (typeof window.logError === 'function') {
        await window.logError(testError);
        return { success: true, message: 'Error logged successfully' };
      } else {
        return { success: false, message: 'logError function not found' };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  });
  
  console.log('Error logging:', errorLoggingTest.success ? '✅' : '❌');
  console.log('Message:', errorLoggingTest.message);
  
  // Test 4: Check Console Errors
  console.log('\n🔍 Test 4: Console Errors');
  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  } else {
    console.log('✅ No console errors detected');
  }
  
  // Test 5: Intentional Error
  console.log('\n🔍 Test 5: Triggering Intentional Error');
  await page.evaluate(() => {
    // Trigger verschiedene Error-Typen
    console.error('TEST: Console error for logging');
    
    // Syntax Error simulieren
    try {
      eval('const { = broken');
    } catch (e) {
      console.error('TEST: Syntax error caught:', e.message);
    }
    
    // Reference Error
    try {
      nonExistentFunction();
    } catch (e) {
      if (window.logError) {
        window.logError({
          type: 'reference_error',
          message: e.message,
          stack: e.stack,
          source: 'test-intentional',
          context: { intentional: true }
        });
      }
    }
  });
  
  await page.waitForTimeout(2000); // Warte auf Error Logging
  
  // Test 6: Fetch Errors from Supabase
  console.log('\n🔍 Test 6: Fetching Errors from Database');
  const dbErrors = await page.evaluate(async () => {
    try {
      const response = await fetch('https://cquahsbgcycdmslcmmdz.supabase.co/functions/v1/get-errors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, count: data.errors ? data.errors.length : 0 };
      } else {
        return { success: false, status: response.status };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  
  if (dbErrors.success) {
    console.log(`✅ Database query successful - ${dbErrors.count} errors in database`);
  } else {
    console.log('❌ Database query failed:', dbErrors.error || `Status ${dbErrors.status}`);
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const allGood = 
    gameLoaded.hasCanvas && 
    gameLoaded.hasGameInstance && 
    gameLoaded.hasRenderer &&
    errors.length === 0 &&
    errorLoggingTest.success;
  
  if (allGood) {
    console.log('✅ All critical tests passed!');
    console.log('✅ Game loads without errors');
    console.log('✅ Error logging system is functional');
  } else {
    console.log('❌ Some tests failed - check details above');
  }
  
  console.log('\n🌐 Game is running at http://localhost:8001');
  console.log('📝 Check the browser console for more details');
  console.log('🔍 Browser will stay open for manual inspection...\n');
  
  // Browser offen lassen für manuelle Inspektion
  await page.waitForTimeout(300000); // 5 Minuten
  
  await browser.close();
}

// Führe Tests aus
testErrorLogging().catch(console.error);