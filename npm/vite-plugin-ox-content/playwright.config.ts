import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/vrt",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "line",
  use: {
    headless: true,
    viewport: { width: 1280, height: 1600 },
    colorScheme: "dark",
  },
});
