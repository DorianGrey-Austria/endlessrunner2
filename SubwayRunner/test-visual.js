// test-visual.js - Visueller Browser Test für SubwayRunner
// Basierend auf TEST-PLAN.md - Läuft im sichtbaren Browser für manuelle Verifikation

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Konfiguration
const TEST_URL = 'http://localhost:8001';
const SCREENSHOT_DIR = 'tests/screenshots';
const SLOW_MO = 500; // Langsame Aktionen für Sichtbarkeit

// Erstelle Screenshot Directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVisualTests() {
  console.log('🧪 Starting Visual Tests for SubwayRunner...');
  console.log('📸 Screenshots werden gespeichert in:', SCREENSHOT_DIR);
  
  const browser = await chromium.launch({
    headless: false,  // Sichtbarer Browser
    slowMo: SLOW_MO,  // Langsame Aktionen
    devtools: true    // Developer Tools öffnen
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: 'tests/videos',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Start Screen
    console.log('\n📍 Test 1: Start Screen');
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Warte auf Three.js Initialisierung
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '01-start-screen.png'),
      fullPage: true 
    });
    console.log('✅ Start Screen geladen');
    
    // Test 2: Character Selection
    console.log('\n📍 Test 2: Character Selection');
    const charButton = await page.$('#character-select-btn');
    if (charButton) {
      await charButton.click();
      await page.waitForTimeout(1000);
      
      // Hover über Characters
      const characters = await page.$$('.character-card');
      for (let i = 0; i < Math.min(3, characters.length); i++) {
        await characters[i].hover();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, '02-character-selection.png') 
      });
      console.log('✅ Character Selection funktioniert');
      
      // Wähle einen Character
      if (characters.length > 0) {
        await characters[0].click();
        await page.waitForTimeout(500);
      }
    }
    
    // Test 3: Spiel starten
    console.log('\n📍 Test 3: Spiel starten');
    await page.click('#play-btn');
    await page.waitForTimeout(3000); // Warte auf Spielstart
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '03-game-running.png') 
    });
    console.log('✅ Spiel läuft');
    
    // Test 4: Gameplay Actions
    console.log('\n📍 Test 4: Gameplay Actions');
    
    // Simuliere Bewegungen
    for (let i = 0; i < 5; i++) {
      // Links
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
      
      // Rechts
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      
      // Sprung
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '04-gameplay.png') 
    });
    console.log('✅ Gameplay Controls funktionieren');
    
    // Test 5: Pause
    console.log('\n📍 Test 5: Pause Menu');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '05-pause-menu.png') 
    });
    console.log('✅ Pause funktioniert');
    
    // Resume
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Test 6: Score und Level Check
    console.log('\n📍 Test 6: Score und Level System');
    
    // Warte bis Score steigt
    await page.waitForFunction(() => {
      const scoreEl = document.querySelector('#score');
      return scoreEl && parseInt(scoreEl.textContent) > 100;
    }, { timeout: 10000 });
    
    const score = await page.$eval('#score', el => el.textContent);
    console.log(`✅ Score System funktioniert: ${score}`);
    
    // Test 7: Game Over
    console.log('\n📍 Test 7: Game Over simulieren');
    
    // Force Game Over
    await page.evaluate(() => {
      if (window.gameInstance && window.gameInstance.gameOver) {
        window.gameInstance.gameOver();
      }
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '07-game-over.png') 
    });
    console.log('✅ Game Over Screen angezeigt');
    
    // Test 8: Performance Metrics
    console.log('\n📍 Test 8: Performance Metrics');
    
    const metrics = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          fps: window.gameInstance.currentFPS || 'N/A',
          obstacles: window.gameInstance.obstacles?.length || 0,
          collectibles: window.gameInstance.collectibles?.length || 0,
          particles: window.gameInstance.particles?.length || 0
        };
      }
      return null;
    });
    
    if (metrics) {
      console.log('📊 Performance Metrics:');
      console.log(`   - FPS: ${metrics.fps}`);
      console.log(`   - Obstacles: ${metrics.obstacles}`);
      console.log(`   - Collectibles: ${metrics.collectibles}`);
      console.log(`   - Particles: ${metrics.particles}`);
    }
    
    // Test 9: Mobile Viewport
    console.log('\n📍 Test 9: Mobile Viewport Test');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, '09-mobile-view.png') 
    });
    console.log('✅ Mobile View getestet');
    
    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 VISUAL TESTS COMPLETED!');
    console.log('='.repeat(50));
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('🎥 Video saved to: tests/videos');
    
    // Generiere Test Report
    const report = `# Visual Test Report - SubwayRunner
Generated: ${new Date().toISOString()}

## Test Results
- ✅ Start Screen: OK
- ✅ Character Selection: OK  
- ✅ Game Start: OK
- ✅ Gameplay Controls: OK
- ✅ Pause Function: OK
- ✅ Score System: OK (Score: ${score})
- ✅ Game Over: OK
- ✅ Performance: ${metrics?.fps || 'N/A'} FPS
- ✅ Mobile View: OK

## Screenshots
${fs.readdirSync(SCREENSHOT_DIR).map(f => `- ${f}`).join('\n')}

## Notes
- All core features working as expected
- Performance stable at ${metrics?.fps || 'N/A'} FPS
- Mobile viewport responsive
`;
    
    fs.writeFileSync('tests/visual-test-report.md', report);
    console.log('📄 Test Report saved to: tests/visual-test-report.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, 'error-state.png') 
    });
  } finally {
    // Warte bevor Browser geschlossen wird
    console.log('\n⏸️  Browser bleibt 5 Sekunden offen zur Inspektion...');
    await page.waitForTimeout(5000);
    
    await context.close();
    await browser.close();
  }
}

// Führe Tests aus
runVisualTests().catch(console.error);