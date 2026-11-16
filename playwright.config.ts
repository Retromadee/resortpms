import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  retries: 0,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "Desktop (1440px)",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Mobile Phone (393px)",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 393, height: 852 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "Small Phone (375px)",
      use: {
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
