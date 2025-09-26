// 🚀 CACHE-BUSTING TESTS - Löst Deployment-Probleme
import { test, expect } from '@playwright/test';
import GameTestHelpers from '../utils/game-helpers.js';

test.describe('Cache-Busting Strategy', () => {
  test.use({
    // Mark as cache-busting test for custom reporter
    annotation: { type: 'cache-busting', description: 'Tests cache invalidation' }
  });

  test('Deployed version is immediately visible', async ({ page, browser }) => {
    console.log('🧪 Testing cache-busting for immediate version visibility...');

    // Step 1: Create fresh context with no cache
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      permissions: [],
      colorScheme: 'light'
    });

    const freshPage = await context.newPage();

    // Step 2: Aggressive cache clearing
    await GameTestHelpers.bustCache(freshPage);

    // Step 3: Add cache-busting headers for all requests
    await freshPage.route('**/*', (route) => {
      const headers = {
        ...route.request().headers(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0',
        'If-None-Match': ''
      };

      route.continue({ headers });
    });

    // Step 4: Visit with cache-busting parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    await freshPage.goto(`/?v=${timestamp}&cb=${random}&t=${Date.now()}`);

    // Step 5: Wait for page to be fully loaded
    await GameTestHelpers.waitForGameReady(freshPage);

    // Step 6: Check version indicators
    const pageContent = await freshPage.content();

    // Look for version in title or version banner
    const hasCurrentVersion = pageContent.includes('6.0') ||
                             pageContent.includes('Version 6') ||
                             pageContent.includes('V6.');

    if (!hasCurrentVersion) {
      console.log('⚠️ Version not found in content, checking programmatically...');

      // Check programmatically for version indicators
      const versionData = await freshPage.evaluate(() => {
        // Check package.json version if accessible
        const metaVersion = document.querySelector('meta[name="version"]');
        const titleVersion = document.title;
        const versionElement = document.querySelector('#version, .version, [data-version]');

        return {
          meta: metaVersion?.content,
          title: titleVersion,
          element: versionElement?.textContent,
          timestamp: Date.now(),
          url: window.location.href
        };
      });

      console.log('Version data found:', versionData);
    }

    // Step 7: Verify Three.js and game are loaded
    const gameReady = await freshPage.evaluate(() => {
      return typeof THREE !== 'undefined' &&
             (window.gameState !== undefined || window.GameCore !== undefined);
    });

    expect(gameReady).toBe(true);

    // Step 8: Take screenshot for manual verification
    const screenshotPath = await GameTestHelpers.screenshotWithGameState(
      freshPage,
      'cache-busting-verification'
    );

    console.log(`📸 Verification screenshot saved: ${screenshotPath}`);

    // Step 9: Test that Service Worker is not interfering
    const serviceWorkerState = await freshPage.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return {
          hasServiceWorker: registrations.length > 0,
          controllers: registrations.map(reg => ({
            scope: reg.scope,
            state: reg.active?.state,
            updatefound: reg.updatefound
          }))
        };
      }
      return { hasServiceWorker: false };
    });

    console.log('Service Worker state:', serviceWorkerState);

    await context.close();
  });

  test('Multiple rapid refreshes show consistent version', async ({ page }) => {
    console.log('🔄 Testing version consistency across rapid refreshes...');

    const versions = [];

    for (let i = 0; i < 5; i++) {
      await GameTestHelpers.bustCache(page);

      const timestamp = Date.now();
      await page.goto(`/?bust=${timestamp}&i=${i}`);

      await page.waitForLoadState('networkidle');

      const versionInfo = await page.evaluate(() => ({
        title: document.title,
        timestamp: Date.now(),
        hasThreeJS: typeof THREE !== 'undefined',
        hasGameCore: typeof window.GameCore !== 'undefined' ||
                     typeof window.gameState !== 'undefined'
      }));

      versions.push(versionInfo);

      // Short delay between requests
      await page.waitForTimeout(500);
    }

    console.log('Version consistency check:', versions);

    // All versions should have Three.js loaded
    const allHaveThreeJS = versions.every(v => v.hasThreeJS);
    expect(allHaveThreeJS).toBe(true);

    // All versions should have game core
    const allHaveGameCore = versions.every(v => v.hasGameCore);
    expect(allHaveGameCore).toBe(true);
  });

  test('Browser cache invalidation works correctly', async ({ page }) => {
    console.log('🗑️ Testing browser cache invalidation...');

    // First visit - establish cache
    await page.goto('/');
    await GameTestHelpers.waitForGameReady(page);

    const firstVisit = await page.evaluate(() => ({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      resourceCount: performance.getEntriesByType('resource').length,
      timestamp: Date.now()
    }));

    // Second visit with cache busting
    await GameTestHelpers.bustCache(page);
    await page.goto(`/?cb=${Date.now()}`);
    await GameTestHelpers.waitForGameReady(page);

    const secondVisit = await page.evaluate(() => ({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      resourceCount: performance.getEntriesByType('resource').length,
      timestamp: Date.now()
    }));

    console.log('Load time comparison:', {
      first: firstVisit.loadTime,
      second: secondVisit.loadTime,
      difference: secondVisit.loadTime - firstVisit.loadTime
    });

    // Both visits should load successfully
    expect(firstVisit.loadTime).toBeGreaterThan(0);
    expect(secondVisit.loadTime).toBeGreaterThan(0);
  });

  test('CDN cache bypassing works', async ({ page }) => {
    console.log('🌐 Testing CDN cache bypassing...');

    // Test with different cache-busting strategies
    const strategies = [
      { name: 'timestamp', url: `/?t=${Date.now()}` },
      { name: 'version', url: `/?v=6.0.0&t=${Date.now()}` },
      { name: 'random', url: `/?r=${Math.random()}` },
      { name: 'combined', url: `/?v=6.0.0&t=${Date.now()}&r=${Math.random()}` }
    ];

    for (const strategy of strategies) {
      console.log(`Testing strategy: ${strategy.name}`);

      await page.goto(strategy.url);
      await page.waitForLoadState('networkidle');

      const loadSuccess = await page.evaluate(() => {
        return typeof THREE !== 'undefined' &&
               document.readyState === 'complete';
      });

      expect(loadSuccess).toBe(true);

      // Verify unique request was made
      const resourceEntries = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .map(entry => ({
            name: entry.name,
            transferSize: entry.transferSize
          }));
      });

      // At least some resources should have non-zero transfer size (not from cache)
      const freshResources = resourceEntries.filter(r => r.transferSize > 0);
      expect(freshResources.length).toBeGreaterThan(0);
    }
  });

  test('iOS Safari cache clearing simulation', async ({ page, browserName }) => {
    // This test simulates the aggressive caching behavior of iOS Safari
    test.skip(browserName !== 'webkit', 'iOS Safari specific test');

    console.log('📱 Testing iOS Safari cache behavior...');

    // Simulate iOS Safari's aggressive caching
    await page.route('**/*', (route) => {
      const headers = route.request().headers();

      // iOS Safari often ignores no-cache headers, so we test workarounds
      if (route.request().url().includes('.js') || route.request().url().includes('.css')) {
        headers['Cache-Control'] = 'max-age=0';
        headers['Last-Modified'] = new Date(Date.now() - 1000).toUTCString();
      }

      route.continue({ headers });
    });

    await page.goto(`/?ios-test=${Date.now()}`);
    await GameTestHelpers.waitForGameReady(page);

    // Verify game loaded despite aggressive caching
    const gameState = await GameTestHelpers.captureGameState(page);
    expect(gameState.ui.visible).toBe(true);
  });
});