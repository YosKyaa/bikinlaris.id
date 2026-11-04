import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a production build with demo data (DATA_SOURCE=mock), so no
 * Supabase project or AI key is needed. `npm run test:e2e` builds, starts on E2E_PORT and
 * stops the server afterwards. The demo store lives in memory: tests run one at a time.
 */
const PORT = Number(process.env.E2E_PORT ?? 3950);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /.*\.spec\.ts$/,
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: BASE_URL,
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `${BASE_URL}/api/sehat`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATA_SOURCE: "mock",
      UMKM_SIGNUP: "true",
      USE_LLM: "false",
      AI_COACH: "true",
      // Test-only secret for the demo staff session; never used outside these tests.
      MOCK_SESSION_SECRET: "e2e-only-mock-session-secret-0123456789abcdef",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
