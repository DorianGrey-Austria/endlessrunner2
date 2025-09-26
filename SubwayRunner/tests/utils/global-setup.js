// 🔧 GLOBAL SETUP - Runs before all tests
import fs from 'fs';
import path from 'path';

async function globalSetup(config) {
  console.log('🚀 Starting Global Test Setup...');

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'tests/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Create test session info
  const sessionInfo = {
    startTime: new Date().toISOString(),
    testConfig: {
      baseURL: config?.use?.baseURL || 'http://localhost:8001',
      browser: process.env.BROWSER || 'chromium',
      workers: config?.workers || 1,
      retries: config?.retries || 0
    },
    environment: {
      CI: !!process.env.CI,
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  fs.writeFileSync(
    path.join(reportsDir, 'session-info.json'),
    JSON.stringify(sessionInfo, null, 2)
  );

  console.log('✅ Global setup completed');
}

export default globalSetup;