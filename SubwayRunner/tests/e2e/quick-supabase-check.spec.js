/**
 * QUICK SUPABASE FIX VERIFICATION
 *
 * Simple test to verify the Supabase SDK conflict is resolved
 * Does NOT test WebGL or game functionality - just JavaScript errors
 */

import { test, expect } from '@playwright/test';

test('Verify NO Supabase identifier conflict', async ({ page }) => {
    console.log('\n🔍 Checking for Supabase identifier conflict...\n');

    const errors = [];

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    // Load page - don't wait for full network idle
    await page.goto('http://localhost:8001/index.html', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
    });

    // Short wait for script errors to surface
    await page.waitForTimeout(2000);

    // Check for THE specific error we fixed
    const supabaseConflict = errors.find(e =>
        e.includes('supabase') && e.includes('already been declared')
    );

    if (supabaseConflict) {
        console.error('❌ SUPABASE CONFLICT STILL EXISTS:');
        console.error('   ', supabaseConflict);
    } else {
        console.log('✅ No Supabase identifier conflict!');
    }

    // Check if startGame is defined (key indicator script loaded)
    const startGameDefined = await page.evaluate(() =>
        typeof window.startGame === 'function'
    ).catch(() => false);

    console.log(`✅ window.startGame defined: ${startGameDefined}`);

    // THE CRITICAL ASSERTIONS
    expect(supabaseConflict, 'Supabase identifier conflict should be fixed').toBeUndefined();
    expect(startGameDefined, 'startGame() should be defined').toBe(true);

    console.log('\n✅ SUPABASE FIX VERIFIED!\n');
});
