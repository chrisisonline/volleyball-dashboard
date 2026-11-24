import { defineConfig, devices } from '@playwright/test'

const PORT = 4330

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/volleyball-dashboard/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Safari (WebKit) and Chrome engines across the screen shapes the
  // scoreboard is used on.
  projects: [
    { name: 'iphone', use: devices['iPhone 13'] },
    { name: 'iphone-landscape', use: devices['iPhone 13 landscape'] },
    { name: 'iphone-se', use: devices['iPhone SE'] },
    { name: 'ipad', use: devices['iPad (gen 7)'] },
    { name: 'android', use: devices['Pixel 7'] },
    { name: 'android-landscape', use: devices['Pixel 7 landscape'] },
    { name: 'desktop-safari', use: devices['Desktop Safari'] },
    { name: 'desktop-chrome', use: devices['Desktop Chrome'] },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/volleyball-dashboard/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
