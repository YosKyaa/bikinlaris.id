import { expect, test } from "@playwright/test";

import { expectAccessible, expectNoSideScroll, PHONE } from "./helpers";

const PAGES = ["/", "/ikut", "/cara-ikut", "/masuk", "/offline"];

test.describe("public pages on a phone", () => {
  test.use({ viewport: PHONE });

  for (const path of PAGES) {
    test(`${path} loads, is accessible and fits`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      await expectNoSideScroll(page);
      await expectAccessible(page);
    });
  }
});

test("health check answers for the uptime monitor", async ({ request }) => {
  const response = await request.get("/api/sehat");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("the app can be added to the home screen", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.short_name).toBe("bikinlaris");
  expect(manifest.start_url).toBe("/beranda");
  expect(manifest.icons.map((icon: { purpose: string }) => icon.purpose)).toContain("maskable");
  const icon = await request.get(manifest.icons[0].src);
  expect(icon.headers()["content-type"]).toBe("image/png");
});

test("the service worker is never cached by the browser", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["content-type"]).toContain("javascript");
});

test("team pages and the export need a sign-in", async ({ page, request }) => {
  await page.goto("/tim/sistem");
  await expect(page).toHaveURL(/\/masuk/);
  expect((await request.get("/api/tim/ekspor?tabel=ringkasan")).status()).toBe(403);
});
