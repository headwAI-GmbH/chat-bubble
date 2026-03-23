import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60 * 1000, // 1 minute per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for expect assertions
  },
  reporter: [
    ['html', { open: 'never', outputFolder: 'headwaione/playwright-report' }],
    ['list'],
  ],
  outputDir: path.resolve(__dirname, 'headwaione/test-results'),

  webServer: {
    command:
      'docker compose -f docker-compose.yml -f headwaione/docker-compose.override.yml down && docker compose -f docker-compose.yml -f headwaione/docker-compose.override.yml up --build',
    cwd: __dirname,
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 300 * 1000, // 5 minutes
  },

  use: {
    baseURL: 'http://localhost:5174/test.html',
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-headwaione',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-headwaione',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
