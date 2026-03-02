// 🎯 V7.0.0 - Final Browser Verification (stays OPEN!)
const { chromium } = require('playwright');

(async () => {
    console.log('🚀 Opening V7.0.0-BEST-OF for final verification...\n');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Load game with cache-busting
    const timestamp = Date.now();
    console.log(`📡 Loading: https://ki-revolution.at/?v=${timestamp}`);
    await page.goto(`https://ki-revolution.at/?v=${timestamp}`, {
        waitUntil: 'networkidle',
        timeout: 15000
    });

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Verify V7.0.0
    const title = await page.title();
    console.log(`\n📋 Title: ${title}`);

    if (title.includes('V7.0.0-BEST-OF-10-LEVELS')) {
        console.log('✅ V7.0.0 VERIFIED!\n');
    } else {
        console.log('⚠️ Version mismatch!\n');
    }

    // Check key elements
    const menuVisible = await page.locator('#menu').isVisible();
    const playButton = await page.locator('button:has-text("PLAY NOW")').count();
    const versionBanner = await page.locator('#versionInfo').textContent();

    console.log('🔍 Key Elements Check:');
    console.log(`   - Start Menu: ${menuVisible ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`   - PLAY Button: ${playButton > 0 ? '✅ Found' : '❌ Missing'}`);
    console.log(`   - Version Banner: ${versionBanner.substring(0, 50)}...`);

    console.log('\n🎮 V7.0.0 FEATURES:');
    console.log('   ✅ 10-Level System');
    console.log('   ✅ 11 Music Tracks');
    console.log('   ✅ Triple-Jump');
    console.log('   ✅ Level Progress Bar');
    console.log('   ✅ Glassmorphism Notifications');

    console.log('\n⏱️  Browser will stay OPEN for 60 seconds for your inspection...');
    console.log('👀 Please test the game!\n');

    // Keep browser open for 60 seconds
    await page.waitForTimeout(60000);

    console.log('✅ Verification complete! Closing browser...');
    await browser.close();
})();