// 🧪 ENHANCED PLAYWRIGHT CONFIG - Production-Ready Game Testing
import { devices } from '@playwright/test';

export default {
  testDir: './tests',
  timeout: 30000, // Reduced from 60s for faster feedback
  expect: { timeout: 8000 }, // Reduced from 10s
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Reduced retries
  workers: process.env.CI ? 1 : 2, // Reduced workers for stability

  // 📊 ADVANCED REPORTING SYSTEM
  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'tests/reports/html-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['junit', { outputFile: 'tests/reports/junit.xml' }],
    ['json', { outputFile: 'tests/reports/test-results.json' }],
    ['github'], // GitHub Actions integration
    ['./tests/utils/custom-game-reporter.js'] // Custom game metrics
  ],

  use: {
    // 🌐 DYNAMIC BASE URL (Local vs Live)
    baseURL: process.env.CI ? 'https://ki-revolution.at' : 'http://localhost:8001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // 🎮 GAME-SPECIFIC SETTINGS
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // 🚀 CACHE-BUSTING HEADERS
    extraHTTPHeaders: {
      'User-Agent': 'Playwright-GameTester/1.0',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    },

    // 📱 TOUCH & GESTURE SUPPORT
    hasTouch: false, // Will be overridden per project
  },

  // 🖥️ MULTI-DEVICE TESTING MATRIX
  projects: [
    // DESKTOP TESTING
    {
      name: 'Desktop-Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI ? true : false
      }
    },
    {
      name: 'Desktop-Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI ? true : false
      }
    },
    {
      name: 'Desktop-Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI ? true : false
      }
    },

    // MOBILE TESTING
    {
      name: 'Mobile-iPhone12',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true
      }
    },
    {
      name: 'Mobile-iPhone12ProMax',
      use: {
        ...devices['iPhone 12 Pro Max'],
        hasTouch: true
      }
    },
    {
      name: 'Mobile-GalaxyS21',
      use: {
        ...devices['Galaxy S21'],
        hasTouch: true
      }
    },

    // TABLET TESTING
    {
      name: 'Tablet-iPadPro',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true
      }
    },
    {
      name: 'Tablet-iPadAir',
      use: {
        ...devices['iPad Air'],
        hasTouch: true
      }
    },

    // LOW-END DEVICE SIMULATION
    {
      name: 'LowEnd-Mobile',
      use: {
        ...devices['Galaxy S5'],
        hasTouch: true,
        launchOptions: {
          slowMo: 50 // Simulate slower device
        }
      }
    }
  ],

  // 🚀 DEVELOPMENT SERVER CONFIGURATION
  webServer: [
    {
      command: 'python3 -m http.server 8001',
      port: 8001,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: {
        'PLAYWRIGHT_TEST': 'true'
      }
    }
  ],

  // 🔧 GLOBAL SETUP/TEARDOWN
  globalSetup: './tests/utils/global-setup.js',
  globalTeardown: './tests/utils/global-teardown.js'
};
