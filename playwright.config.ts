import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const basePath = '/rspress-plugin-typst';
const host = '127.0.0.1';
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Expect plugin + playground to be built already (`pnpm test:e2e` / CI).
    command: `pnpm --filter playground preview --host ${host} --port ${port}`,
    url: `${baseURL}${basePath}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
