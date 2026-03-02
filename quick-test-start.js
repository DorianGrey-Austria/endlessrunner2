// Quick test script to verify game starts
const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Starting quick game start test...\n');

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100
    });

    const page = await browser.newPage();

    // Capture console
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(`PAGE ERROR: ${error.message}`);
    });

    console.log('📄 Loading page...');
    await page.goto('http://localhost:8001/', { waitUntil: 'networkidle2' });

    await page.waitForTimeout(2000);

    console.log('\n❌ Console Errors:', errors.length);
    if (errors.length > 0) {
        errors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
    }

    // Check if startGameNow exists
    const startGameNowExists = await page.evaluate(() => {
        return typeof window.startGameNow === 'function';
    });

    console.log('\n✅ window.startGameNow exists:', startGameNowExists);

    if (!startGameNowExists) {
        console.error('❌ CRITICAL: startGameNow function not found!');
        await browser.close();
        process.exit(1);
    }

    // Check if START GAME button exists
    const playButton = await page.$('button.cyber-button[data-action="start"]');
    if (!playButton) {
        console.error('❌ CRITICAL: START GAME button not found!');
        await browser.close();
        process.exit(1);
    }

    console.log('✅ START GAME button found');

    // Click START GAME
    console.log('\n🖱️  Clicking START GAME...');
    await playButton.click();

    await page.waitForTimeout(2000);

    // Check if menu is hidden
    const menuHidden = await page.evaluate(() => {
        const menu = document.getElementById('menu');
        return window.getComputedStyle(menu).display === 'none';
    });

    // Check if game container is visible
    const gameVisible = await page.evaluate(() => {
        const game = document.getElementById('gameContainer');
        return window.getComputedStyle(game).display === 'flex';
    });

    console.log('\n📊 After clicking PLAY NOW:');
    console.log('  Menu hidden:', menuHidden);
    console.log('  Game visible:', gameVisible);
    console.log('  New errors:', errors.length);

    if (menuHidden && gameVisible && errors.length === 0) {
        console.log('\n✅ ✅ ✅ GAME STARTS SUCCESSFULLY! ✅ ✅ ✅\n');
        await browser.close();
        process.exit(0);
    } else {
        console.log('\n❌ ❌ ❌ GAME DOES NOT START! ❌ ❌ ❌\n');
        if (errors.length > 0) {
            console.log('Errors after click:');
            errors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
        }
        // Keep browser open for inspection
        console.log('Browser kept open for inspection...');
        await page.waitForTimeout(10000);
        await browser.close();
        process.exit(1);
    }
})();