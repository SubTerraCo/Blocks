// ============================================================================
// BLOCKS - Playwright Configuration
// Comprehensive testing setup for E2E, visual, accessibility, and performance
// ============================================================================

import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: "./",

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "../playwright-report" }],
    ["json", { outputFile: "../test-results/results.json" }],
    ["list"],
  ],

  // Global timeout for each test
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 5000,
    // Visual comparison settings
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: "http://localhost:3000",

    // Collect trace on first retry
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "on-first-retry",

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Test projects for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile browsers
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },

    // Tablet
    {
      name: "tablet",
      use: { ...devices["iPad (gen 7)"] },
    },
  ],

  // Web server configuration
  webServer: {
    command: "pnpm dev --filter web",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: "..",
  },

  // Output directory for test artifacts
  outputDir: "../test-results",
});

