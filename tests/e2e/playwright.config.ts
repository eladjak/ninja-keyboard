import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'he-IL',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // In CI, run E2E against a PRODUCTION build (`next build && next start`)
  // instead of `next dev`. The dev server compiles routes on-demand and has
  // slow/unreliable client hydration under load, which drives a class of
  // timing flakes (e.g. persisted-store stats rendering ~1.5s late). A prod
  // server serves pre-compiled, optimized output, removing that latency.
  // Locally we keep `next dev` for fast iteration and reuse a running server.
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
})
