// playwright.config.js - Konfiguration für SubwayRunner Tests
import { devices } from '@playwright/test';

export default {
  testDir: './',
  timeout: 30000,
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
    headless: false,  // Sichtbar für Debugging
    slowMo: 100,      // Langsamer für bessere Sichtbarkeit
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true
      },
    },
  ],
  
  webServer: {
    command: 'python3 -m http.server 8001',
    port: 8001,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
};
