import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  },

  projects: [
    {
      name: 'API Tests',
      testMatch: '**/*.spec.js'
    }
  ],

  // Playwright starts the server
  webServer: {
    command: 'env $(cat .env | xargs) npm run dev',
    url: 'http://localhost:3000/api/health', // that indicates the server is up
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});

