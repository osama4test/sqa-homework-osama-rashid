import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  reporter: [['html', { outputFolder: 'artifacts/report', open: 'never' }]],
  use: {
    baseURL: 'https://ask.permission.ai',
    headless: true,
    ...devices['Desktop Chrome'],
  },
});
