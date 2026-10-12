import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);

// Runs against the production build (`npm run build` first). Locally it uses the installed
// Edge: Windows App Control blocks the Chromium that Playwright downloads. CI uses Chromium.
export default defineConfig({
  testDir: "./e2e",
  // One browser at a time: parallel Edge instances against a cold `next start` time out
  // on Windows, and the whole suite runs in about 15 s serially.
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: isCI ? "chromium" : "msedge",
      use: { ...devices["Desktop Chrome"], channel: isCI ? undefined : "msedge" },
    },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
