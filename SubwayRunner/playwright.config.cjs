// playwright.config.js - Konfiguration für SubwayRunner Tests
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/playwright-report' }]
  ],

  use: {
    baseURL: 'http://localhost:8001',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    headless: true,  // Headless für CI/automatische Tests
    slowMo: 100,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],

  webServer: {
    command: 'npx live-server --port=8001 --no-browser --quiet',
    port: 8001,
    timeout: 30 * 1000,
    reuseExistingServer: true,
  },
};
