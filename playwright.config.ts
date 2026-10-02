import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:3006',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
  webServer: {
    command: 'bun run dev:miniapp',
    env: { VITE_API_BASE_URL: '/api' },
    url: 'http://127.0.0.1:3006',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
