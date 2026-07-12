/**
 * Mobile Touch Controls + PWA Readiness Tests (V5.4)
 *
 * Verifies store-readiness essentials:
 * 1. Swipe gestures control the player (left/right lane, up jump, down duck)
 * 2. PWA manifest + service worker are present and valid
 * 3. privacy.html exists and is linked from the game
 *
 * Console error collection per CLAUDE.md mandatory pattern.
 */
import { test, expect } from '@playwright/test';

const IGNORE = ['WebGL', 'webgl', 'context could not be created', 'Error creating WebGL', 'setClearColor', 'THREE.WebGLRenderer', 'GPU', 'RENDER WARNING', 'framebuffer', 'BindToCurrentSequence', '403', '404', 'MIME type', 'mediapipe', 'cdn.jsdelivr.net', 'Refused to execute script', 'Failed to load resource', 'gestureController', 'Cannot read properties of undefined', 'position', 'ServiceWorker', 'Service Worker'];
function isCritical(t) { return !IGNORE.some(p => t.includes(p)); }

/**
 * Dispatch a synthetic swipe (touchstart -> touchend) on the document.
 * Mirrors what a real mobile browser produces closely enough for our
 * swipe detector (which only reads clientX/clientY of changedTouches).
 */
async function swipe(page, dx, dy, durationMs = 120) {
  await page.evaluate(async ({ dx, dy, durationMs }) => {
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    const target = document.getElementById('gameContainer') || document.body;
    function makeTouch(x, y) {
      return new Touch({ identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y });
    }
    function fire(type, x, y) {
      target.dispatchEvent(new TouchEvent(type, {
        bubbles: true, cancelable: true,
        touches: type === 'touchend' ? [] : [makeTouch(x, y)],
        changedTouches: [makeTouch(x, y)],
      }));
    }
    fire('touchstart', startX, startY);
    await new Promise(r => setTimeout(r, durationMs));
    fire('touchend', startX + dx, startY + dy);
  }, { dx, dy, durationMs });
}

async function startGame(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 30000 });
  await page.waitForTimeout(6000); // 3D settle time (mandatory protocol)
  const startButton = page.locator(
    'button:has-text("SPIELEN"), button:has-text("SPIEL STARTEN"), button:has-text("Start"), button:has-text("Play")'
  ).first();
  await startButton.click();
  await page.waitForTimeout(1500);
  return page.evaluate(() => typeof gameState !== 'undefined' && gameState.isPlaying === true);
}

test.describe('Mobile Touch Controls', () => {
  let ce = [], pe = [];
  test.beforeEach(async ({ page }) => {
    ce = []; pe = [];
    page.on('console', m => { if (m.type() === 'error') ce.push(m.text()); });
    page.on('pageerror', e => { pe.push(e.message); });
  });

  test('Swipe left/right changes lane', async ({ page }) => {
    const started = await startGame(page);
    expect(started).toBe(true);

    const laneBefore = await page.evaluate(() => gameState.playerLane);
    expect(laneBefore).toBe(1); // starts middle

    await swipe(page, -150, 0);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => gameState.playerLane)).toBe(0);

    await swipe(page, 150, 0);
    await page.waitForTimeout(300);
    await swipe(page, 150, 0);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => gameState.playerLane)).toBe(2);

    expect(ce.filter(isCritical).length + pe.filter(isCritical).length).toBe(0);
  });

  test('Swipe down ducks (auto-release), swipe up jumps', async ({ page }) => {
    const started = await startGame(page);
    expect(started).toBe(true);

    // Duck first: its auto-release is a plain timer, independent of the
    // render loop (which is unreliable in headless WebGL).
    await swipe(page, 0, 150);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => gameState.playerAction)).toBe('ducking');

    // Duck must auto-release (touch has no keyup)
    await page.waitForFunction(() => gameState.playerAction === 'running', null, { timeout: 3000 });

    // Jump last: asserting the state transition only (landing needs the
    // physics loop, which headless cannot guarantee).
    await swipe(page, 0, -150);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => gameState.playerAction)).toBe('jumping');

    expect(ce.filter(isCritical).length + pe.filter(isCritical).length).toBe(0);
  });
});

test.describe('PWA Readiness', () => {
  test('Manifest is linked and valid', async ({ page, request }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();

    const res = await request.get('/' + href.replace(/^\.?\//, ''));
    expect(res.status()).toBe(200);
    const manifest = JSON.parse(await res.text());
    expect(manifest.name).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifest.icons.some(i => i.sizes === '512x512')).toBe(true);
  });

  test('Service worker file exists and registration is attempted', async ({ page, request }) => {
    const res = await request.get('/sw.js');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('addEventListener');

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    const reg = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'unsupported';
      const r = await navigator.serviceWorker.getRegistration();
      return r ? 'registered' : (window.__swRegistrationAttempted ? 'attempted' : 'missing');
    });
    expect(['registered', 'attempted']).toContain(reg);
  });

  test('Icons exist', async ({ request }) => {
    for (const icon of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']) {
      const res = await request.get('/' + icon);
      expect(res.status(), icon).toBe(200);
    }
  });
});

test.describe('Legal', () => {
  test('privacy.html exists and is linked', async ({ page, request }) => {
    const res = await request.get('/privacy.html');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('Datenschutz');

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    expect(await page.locator('a[href*="privacy.html"]').count()).toBeGreaterThan(0);
  });
});
