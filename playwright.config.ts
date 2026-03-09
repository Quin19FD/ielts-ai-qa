import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://ielts-ai-startup.vercel.app/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'tablet-chromium',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
