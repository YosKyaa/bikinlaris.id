import { defineConfig } from "@playwright/test";

/**
 * Unit tests: pure functions only (no server, no browser). Run with `npm run test:unit`.
 * Modules that import "server-only" cannot be loaded here; the end-to-end tests cover them.
 */
export default defineConfig({
  testDir: "tests/unit",
  testMatch: /.*\.test\.ts$/,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
});
