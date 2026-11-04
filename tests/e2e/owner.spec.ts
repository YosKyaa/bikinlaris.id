import { readFile } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";

import { DEMO, expectAccessible, expectNoSideScroll, openOwnerLink, PHONE } from "./helpers";

test.use({ viewport: PHONE });

async function openPack(page: Page) {
  await openOwnerLink(page, DEMO.packToken);
  await expect(page).toHaveURL(/\/paket$/);
  await expect(
    page.getByRole("heading", { level: 1, name: `Paket SOP untuk ${DEMO.packBusiness}` }),
  ).toBeVisible();
}

test("the pack page is accessible and fits a phone", async ({ page }) => {
  await openPack(page);
  await expectNoSideScroll(page);
  await expectAccessible(page);
});

test("Unduh PDF downloads the pack as a file, no print dialog", async ({ page }) => {
  await openPack(page);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Unduh PDF" }).first().click(),
  ]);
  expect(download.suggestedFilename()).toBe(`paket-sop-${DEMO.packCode}.pdf`);
  const file = await readFile(await download.path());
  expect(file.subarray(0, 5).toString()).toBe("%PDF-");
  expect(file.length).toBeGreaterThan(10_000);
  // The page stays open (the response is an attachment).
  await expect(page).toHaveURL(/\/paket$/);
});

test("the coach turns away off-topic questions without the AI, and answers real ones", async ({
  page,
}) => {
  await openPack(page);
  await page.getByRole("button", { name: "Tanya coach" }).click();
  const panel = page.getByRole("dialog");
  const ask = async (question: string) => {
    await panel.getByRole("textbox").fill(question);
    await panel.getByRole("button", { name: "Kirim pertanyaan" }).click();
  };

  await ask("1+1=");
  await expect(
    panel.getByText(/Coach hanya bisa membantu soal cara kerja usaha Anda/),
  ).toBeVisible();

  await ask("SOP mana yang sebaiknya saya mulai dulu?");
  // Demo provider (no API key in tests): a fixed sample answer, typed out.
  await expect(panel.getByText(/Ini contoh jawaban di mode contoh/)).toBeVisible({
    timeout: 15_000,
  });
});

test("the pack stays readable offline after one visit", async ({ page, context }) => {
  await openPack(page);
  // The worker registers on owner pages and saves the pack and its build files.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const cache = await caches.open("bikinlaris-pages-v1");
          return Boolean(await cache.match("/paket"));
        }),
      { timeout: 15_000 },
    )
    .toBe(true);
  // Second visit: the worker now controls the page.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: `Paket SOP untuk ${DEMO.packBusiness}` }),
  ).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Anda sedang offline" })).toBeVisible();
  await context.setOffline(false);
});
