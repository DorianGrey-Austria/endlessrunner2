// 🔍 EXPORT ERROR HUNTER - Find the exact source of "Unexpected token export"
import { test, expect } from '@playwright/test';

test.describe('🚨 Export Error Hunter', () => {
  test('find exact source of export syntax error', async ({ page }) => {
    // Detailed error tracking
    const jsErrors = [];
    const networkErrors = [];

    page.on('pageerror', error => {
      jsErrors.push({
        message: error.message,
        stack: error.stack,
        location: error.stack ? error.stack.split('\n')[1] : 'unknown'
      });
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        error: request.failure()
      });
    });

    // Navigate and wait for errors
    await page.goto('http://localhost:8002', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000); // Give time for all scripts to load

    console.log('\n🔍 === DETAILED ERROR ANALYSIS ===');

    // Analyze JavaScript errors
    if (jsErrors.length > 0) {
      console.log(`\n🚨 ${jsErrors.length} JavaScript Errors Found:`);
      jsErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.message}`);
        console.log(`   Location: ${error.location}`);
        if (error.stack) {
          const stackLines = error.stack.split('\n').slice(0, 3);
          stackLines.forEach(line => console.log(`   Stack: ${line.trim()}`));
        }
      });
    }

    // Analyze network errors
    if (networkErrors.length > 0) {
      console.log(`\n🌐 ${networkErrors.length} Network Errors Found:`);
      networkErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.url} - ${error.error?.errorText || 'Unknown error'}`);
      });
    }

    // Try to execute specific code snippets to isolate the error
    console.log('\n🧪 === CODE SNIPPET TESTING ===');

    // Test 1: Check if the error occurs during script loading
    const scriptLoadTest = await page.evaluate(() => {
      try {
        // Check all script tags
        const scripts = Array.from(document.querySelectorAll('script'));
        return {
          success: true,
          scriptCount: scripts.length,
          inlineScripts: scripts.filter(s => !s.src).length,
          externalScripts: scripts.filter(s => s.src).length
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`📜 Script Loading Test: ${JSON.stringify(scriptLoadTest, null, 2)}`);

    // Test 2: Check specific modules or libraries
    const moduleTest = await page.evaluate(() => {
      const results = {};

      // Check for problematic patterns
      try {
        results.three = typeof THREE !== 'undefined';
        results.supabase = typeof window.supabase !== 'undefined';
        results.mediapioe = typeof window.MediaPipe !== 'undefined';
      } catch (error) {
        results.error = error.message;
      }

      return results;
    });

    console.log(`🔧 Module Test: ${JSON.stringify(moduleTest, null, 2)}`);

    // Test 3: Try to manually trigger the error
    const manualTest = await page.evaluate(() => {
      try {
        // Look for the exact export syntax that might be causing issues
        const bodyContent = document.body.innerHTML;

        // Check for problematic patterns in inline scripts
        const problematicPatterns = [
          /export\s+\w+/g,
          /import\s+\w+/g,
          /module\.exports/g,
          /require\s*\(/g
        ];

        const findings = {};
        problematicPatterns.forEach((pattern, index) => {
          const matches = bodyContent.match(pattern);
          if (matches) {
            findings[`pattern_${index}`] = matches;
          }
        });

        return {
          success: true,
          findings,
          hasProblematicContent: Object.keys(findings).length > 0
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`🎯 Manual Test: ${JSON.stringify(manualTest, null, 2)}`);

    // Test 4: Check external script responses
    console.log('\n📥 === EXTERNAL SCRIPT ANALYSIS ===');
    const scriptUrls = [
      'https://unpkg.com/three@0.158.0/build/three.min.js',
      'https://unpkg.com/@supabase/supabase-js@2',
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0'
    ];

    for (const url of scriptUrls) {
      try {
        const response = await page.request.get(url);
        const status = response.status();
        const contentType = response.headers()['content-type'] || 'unknown';

        console.log(`📦 ${url}`);
        console.log(`   Status: ${status}`);
        console.log(`   Content-Type: ${contentType}`);

        if (status !== 200) {
          const text = await response.text();
          console.log(`   Error Content: ${text.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`📦 ${url} - Request failed: ${error.message}`);
      }
    }

    // Final assessment
    console.log('\n🎯 === DIAGNOSIS CONCLUSION ===');
    const hasExportError = jsErrors.some(error => error.message.includes('export'));
    const hasModulePattern = manualTest.success && manualTest.hasProblematicContent;
    const hasNetworkIssues = networkErrors.length > 0;

    console.log(`🚨 Export Error Present: ${hasExportError}`);
    console.log(`🎯 Module Patterns Found: ${hasModulePattern}`);
    console.log(`🌐 Network Issues: ${hasNetworkIssues}`);

    if (hasExportError) {
      const exportError = jsErrors.find(error => error.message.includes('export'));
      console.log(`\n🔍 Export Error Details:`);
      console.log(`   Message: ${exportError.message}`);
      console.log(`   Location: ${exportError.location}`);
    }
  });
});